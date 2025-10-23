import DeliveryAssignment from "../models/deliveryAssignment.model.js"
import Order from "../models/order.model.js"
import Shop from "../models/shop.model.js"
import User from "../models/user.model.js"
import { sendDeliveryOtpMail } from "../utils/mail.js"
import RazorPay from "razorpay"
import dotenv from "dotenv"

dotenv.config()

const razorInstance = new RazorPay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

/* ================== PLACE ORDER ================== */
export const placeOrder = async (req, res) => {
  try {
    const { cartItems, paymentMethod, deliveryAddress, totalAmount } = req.body
    if (!cartItems?.length) return res.status(400).json({ message: "cart is empty" })
    if (!deliveryAddress?.text || !deliveryAddress.latitude || !deliveryAddress.longitude)
      return res.status(400).json({ message: "send complete deliveryAddress" })

    const groupItemsByShop = {}
    cartItems.forEach(item => {
      if (!groupItemsByShop[item.shop]) groupItemsByShop[item.shop] = []
      groupItemsByShop[item.shop].push(item)
    })

    const shopOrders = await Promise.all(
      Object.keys(groupItemsByShop).map(async shopId => {
        const shop = await Shop.findById(shopId).populate("owner")
        if (!shop) throw new Error("Shop not found")
        const items = groupItemsByShop[shopId]
        const subtotal = items.reduce((sum, i) => sum + Number(i.price) * Number(i.quantity), 0)
        return {
          shop: shop._id,
          owner: shop.owner._id,
          subtotal,
          shopOrderItems: items.map(i => ({
            item: i.id,
            price: i.price,
            quantity: i.quantity,
            name: i.name
          }))
        }
      })
    )

    const newOrder = await Order.create({
      user: req.userId,
      paymentMethod,
      deliveryAddress,
      totalAmount,
      shopOrders
    })

    await newOrder.populate("shopOrders.shopOrderItems.item", "name image price")
    await newOrder.populate("shopOrders.shop", "name")
    await newOrder.populate("shopOrders.owner", "name socketId")
    await newOrder.populate("user", "name email mobile")

    const io = req.app.get('io')
    if (io) {
      newOrder.shopOrders.forEach(shopOrder => {
        if (shopOrder.owner.socketId) {
          io.to(shopOrder.owner.socketId).emit('newOrder', {
            _id: newOrder._id,
            paymentMethod: newOrder.paymentMethod,
            user: newOrder.user,
            shopOrders: shopOrder,
            createdAt: newOrder.createdAt,
            deliveryAddress: newOrder.deliveryAddress,
            payment: newOrder.payment
          })
        }
      })
    }

    return res.status(201).json(newOrder)
  } catch (error) {
    return res.status(500).json({ message: `place order error: ${error.message}` })
  }
}

/* ================== VERIFY PAYMENT ================== */
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, orderId } = req.body
    const payment = await razorInstance.payments.fetch(razorpay_payment_id)
    if (!payment || payment.status !== "captured") return res.status(400).json({ message: "payment not captured" })

    const order = await Order.findById(orderId)
    if (!order) return res.status(400).json({ message: "order not found" })

    order.payment = true
    order.razorpayPaymentId = razorpay_payment_id
    await order.save()

    await order.populate("shopOrders.shopOrderItems.item", "name image price")
    await order.populate("shopOrders.shop", "name")
    await order.populate("shopOrders.owner", "name socketId")
    await order.populate("user", "name email mobile")

    const io = req.app.get('io')
    if (io) {
      order.shopOrders.forEach(shopOrder => {
        if (shopOrder.owner.socketId) {
          io.to(shopOrder.owner.socketId).emit('newOrder', {
            _id: order._id,
            paymentMethod: order.paymentMethod,
            user: order.user,
            shopOrders: shopOrder,
            createdAt: order.createdAt,
            deliveryAddress: order.deliveryAddress,
            payment: order.payment
          })
        }
      })
    }

    return res.status(200).json(order)
  } catch (error) {
    return res.status(500).json({ message: `verify payment error: ${error.message}` })
  }
}

/* ================== GET ORDERS ================== */
export const getMyOrders = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
    if (!user) return res.status(400).json({ message: "user not found" })

    if (user.role === "user") {
      const orders = await Order.find({ user: req.userId })
        .sort({ createdAt: -1 })
        .populate("shopOrders.shop", "name")
        .populate("shopOrders.owner", "name email mobile")
        .populate("shopOrders.shopOrderItems.item", "name image price")
      return res.status(200).json(orders)
    } else if (user.role === "owner") {
      const orders = await Order.find({ "shopOrders.owner": req.userId })
        .sort({ createdAt: -1 })
        .populate("shopOrders.shop", "name")
        .populate("user")
        .populate("shopOrders.shopOrderItems.item", "name image price")
        .populate("shopOrders.assignedDeliveryBoy", "fullName mobile")

      const filteredOrders = orders.map(order => ({
        _id: order._id,
        paymentMethod: order.paymentMethod,
        user: order.user,
        shopOrders: order.shopOrders.find(o => String(o.owner._id) === req.userId),
        createdAt: order.createdAt,
        deliveryAddress: order.deliveryAddress,
        payment: order.payment
      }))

      return res.status(200).json(filteredOrders)
    }
  } catch (error) {
    return res.status(500).json({ message: `get orders error: ${error.message}` })
  }
}

/* ================== UPDATE ORDER STATUS ================== */
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, shopId } = req.params
    const { status } = req.body
    const order = await Order.findById(orderId)
    if (!order) return res.status(400).json({ message: "order not found" })

    const shopOrder = order.shopOrders.find(o => String(o.shop) === shopId)
    if (!shopOrder) return res.status(400).json({ message: "shop order not found" })

    shopOrder.status = status

    let deliveryBoysPayload = []

    // Assign delivery boy if status is "out of delivery" and no delivery boy assigned
    if (status === "out of delivery" && !shopOrder.assignedDeliveryBoy) {
      const { longitude, latitude } = order.deliveryAddress
      const nearByDeliveryBoys = await User.find({
        role: "deliveryBoy",
        location: {
          $near: {
            $geometry: { type: "Point", coordinates: [Number(longitude), Number(latitude)] },
            $maxDistance: 5000
          }
        }
      })

      const busyIds = await DeliveryAssignment.find({
        assignedTo: { $ne: null },
        status: { $nin: ["brodcasted", "completed"] }
      }).distinct("assignedTo")

      const availableBoys = nearByDeliveryBoys.filter(b => !busyIds.includes(String(b._id)))
      if (!availableBoys.length) {
        await order.save()
        return res.json({ message: "order status updated but no available delivery boys" })
      }

      const candidates = availableBoys.map(b => b._id)
      const deliveryAssignment = await DeliveryAssignment.create({
        order: order._id,
        shop: shopOrder.shop,
        shopOrderId: shopOrder._id,
        brodcastedTo: candidates,
        status: "brodcasted"
      })

      shopOrder.assignment = deliveryAssignment._id
      shopOrder.assignedDeliveryBoy = null

      deliveryBoysPayload = availableBoys.map(b => ({
        id: b._id,
        fullName: b.fullName,
        longitude: b.location.coordinates?.[0],
        latitude: b.location.coordinates?.[1],
        mobile: b.mobile
      }))

      await deliveryAssignment.populate('order shop')
      const io = req.app.get('io')
      if (io) {
        availableBoys.forEach(boy => {
          if (boy.socketId) {
            io.to(boy.socketId).emit('newAssignment', {
              sentTo: boy._id,
              assignmentId: deliveryAssignment._id,
              orderId: deliveryAssignment.order._id,
              shopName: deliveryAssignment.shop.name,
              deliveryAddress: deliveryAssignment.order.deliveryAddress,
              items: deliveryAssignment.order.shopOrders.find(so => so._id.equals(deliveryAssignment.shopOrderId)).shopOrderItems
            })
          }
        })
      }
    }

    await order.save()

    const updatedShopOrder = order.shopOrders.find(o => String(o.shop) === shopId)
    await order.populate("shopOrders.shop", "name")
    await order.populate("shopOrders.assignedDeliveryBoy", "fullName email mobile")
    await order.populate("user", "socketId")

    const io = req.app.get('io')
    if (io && order.user?.socketId) {
      io.to(order.user.socketId).emit('update-status', {
        orderId: order._id,
        shopId: updatedShopOrder.shop._id,
        status: updatedShopOrder.status,
        userId: order.user._id
      })
    }

    return res.status(200).json({
      shopOrder: updatedShopOrder,
      assignedDeliveryBoy: updatedShopOrder?.assignedDeliveryBoy,
      availableBoys: deliveryBoysPayload,
      assignment: updatedShopOrder?.assignment
    })
  } catch (error) {
    return res.status(500).json({ message: `update order status error: ${error.message}` })
  }
}
