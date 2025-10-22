import DeliveryAssignment from "../models/deliveryAssignment.model.js";
import Order from "../models/order.model.js";
import Shop from "../models/shop.model.js";
import User from "../models/user.model.js";
import { sendDeliveryOtpMail } from "../utils/mail.js";
import RazorPay from "razorpay";
import dotenv from "dotenv";

dotenv.config();

const razorInstance = new RazorPay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Place a new order
export const placeOrder = async (req, res) => {
  try {
    const { cartItems, paymentMethod, deliveryAddress, totalAmount } = req.body;

    if (!cartItems || cartItems.length === 0) return res.status(400).json({ message: "Cart is empty" });
    if (!deliveryAddress?.text || !deliveryAddress?.latitude || !deliveryAddress?.longitude)
      return res.status(400).json({ message: "Send complete deliveryAddress" });

    const groupItemsByShop = {};
    cartItems.forEach(item => {
      const shopId = item.shop;
      if (!groupItemsByShop[shopId]) groupItemsByShop[shopId] = [];
      groupItemsByShop[shopId].push(item);
    });

    const shopOrders = await Promise.all(Object.keys(groupItemsByShop).map(async shopId => {
      const shop = await Shop.findById(shopId).populate("owner");
      if (!shop) throw new Error("Shop not found");

      const items = groupItemsByShop[shopId];
      const subtotal = items.reduce((sum, i) => sum + Number(i.price) * Number(i.quantity), 0);

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
      };
    }));

    let newOrder;

    if (paymentMethod === "online") {
      const razorOrder = await razorInstance.orders.create({
        amount: Math.round(totalAmount * 100),
        currency: "INR",
        receipt: `receipt_${Date.now()}`
      });

      newOrder = await Order.create({
        user: req.userId,
        paymentMethod,
        deliveryAddress,
        totalAmount,
        shopOrders,
        razorpayOrderId: razorOrder.id,
        payment: false
      });

      return res.status(200).json({ razorOrder, orderId: newOrder._id });
    }

    newOrder = await Order.create({
      user: req.userId,
      paymentMethod,
      deliveryAddress,
      totalAmount,
      shopOrders
    });

    await newOrder.populate([
      { path: "shopOrders.shopOrderItems.item", select: "name image price" },
      { path: "shopOrders.shop", select: "name" },
      { path: "shopOrders.owner", select: "name socketId" },
      { path: "user", select: "name email mobile" }
    ]);

    const io = req.app.get("io");
    if (io) {
      newOrder.shopOrders.forEach(shopOrder => {
        const ownerSocketId = shopOrder.owner.socketId;
        if (ownerSocketId) {
          io.to(ownerSocketId).emit("newOrder", {
            _id: newOrder._id,
            paymentMethod: newOrder.paymentMethod,
            user: newOrder.user,
            shopOrders: shopOrder,
            createdAt: newOrder.createdAt,
            deliveryAddress: newOrder.deliveryAddress,
            payment: newOrder.payment
          });
        }
      });
    }

    return res.status(201).json(newOrder);
  } catch (error) {
    return res.status(500).json({ message: `place order error: ${error.message}` });
  }
};

// Verify payment
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, orderId } = req.body;
    const payment = await razorInstance.payments.fetch(razorpay_payment_id);
    if (!payment || payment.status !== "captured") return res.status(400).json({ message: "Payment not captured" });

    const order = await Order.findById(orderId);
    if (!order) return res.status(400).json({ message: "Order not found" });

    order.payment = true;
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    await order.populate([
      { path: "shopOrders.shopOrderItems.item", select: "name image price" },
      { path: "shopOrders.shop", select: "name" },
      { path: "shopOrders.owner", select: "name socketId" },
      { path: "user", select: "name email mobile" }
    ]);

    const io = req.app.get("io");
    if (io) {
      order.shopOrders.forEach(shopOrder => {
        const ownerSocketId = shopOrder.owner.socketId;
        if (ownerSocketId) {
          io.to(ownerSocketId).emit("newOrder", {
            _id: order._id,
            paymentMethod: order.paymentMethod,
            user: order.user,
            shopOrders: shopOrder,
            createdAt: order.createdAt,
            deliveryAddress: order.deliveryAddress,
            payment: order.payment
          });
        }
      });
    }

    return res.status(200).json(order);
  } catch (error) {
    return res.status(500).json({ message: `verify payment error: ${error.message}` });
  }
};

// Update shop order status (including mark as delivered)
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, shopId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(400).json({ message: "Order not found" });

    const shopOrder = order.shopOrders.id(shopId);
    if (!shopOrder) return res.status(400).json({ message: "Shop order not found" });

    shopOrder.status = status;

    // If status is delivered, remove delivery assignment
    if (status === "delivered") {
      shopOrder.deliveredAt = Date.now();
      await DeliveryAssignment.deleteOne({
        shopOrderId: shopOrder._id,
        order: order._id,
        assignedTo: shopOrder.assignedDeliveryBoy
      });
    }

    await order.save();
    await order.populate([
      { path: "shopOrders.shop", select: "name" },
      { path: "shopOrders.assignedDeliveryBoy", select: "fullName email mobile" },
      { path: "user", select: "socketId" }
    ]);

    const io = req.app.get("io");
    if (io) {
      const userSocketId = order.user.socketId;
      if (userSocketId) {
        io.to(userSocketId).emit("update-status", {
          orderId: order._id,
          shopId: shopOrder._id,
          status: shopOrder.status,
          userId: order.user._id
        });
      }
    }

    return res.status(200).json({ shopOrder });
  } catch (error) {
    return res.status(500).json({ message: `update order status error: ${error.message}` });
  }
};

// Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate("user")
      .populate("shopOrders.shop")
      .populate("shopOrders.assignedDeliveryBoy")
      .populate("shopOrders.shopOrderItems.item")
      .lean();
    if (!order) return res.status(400).json({ message: "Order not found" });
    return res.status(200).json(order);
  } catch (error) {
    return res.status(500).json({ message: `get order by ID error: ${error.message}` });
  }
};

// Export other delivery-related functions (like acceptOrder, getMyOrders, sendDeliveryOtp, etc.)
export { placeOrder as default };
