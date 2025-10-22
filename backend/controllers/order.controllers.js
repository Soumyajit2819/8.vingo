import DeliveryAssignment from "../models/deliveryAssignment.model.js";
import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import { sendDeliveryOtpMail } from "../utils/mail.js";

// SEND DELIVERY OTP
export const sendDeliveryOtp = async (req, res) => {
  try {
    const { orderId, shopOrderId } = req.body;
    if (!orderId || !shopOrderId) {
      return res.status(400).json({ message: "orderId and shopOrderId are required" });
    }

    const order = await Order.findById(orderId).populate("user");
    if (!order) return res.status(404).json({ message: "Order not found" });

    const shopOrder = order.shopOrders.id(shopOrderId);
    if (!shopOrder) return res.status(404).json({ message: "Shop order not found" });

    // Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    shopOrder.deliveryOtp = otp;
    shopOrder.otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes

    await order.save();

    try {
      await sendDeliveryOtpMail(order.user, otp);
    } catch (mailError) {
      console.error("Failed to send OTP email:", mailError);
    }

    return res.status(200).json({ message: `OTP sent successfully to ${order.user.fullName}` });
  } catch (error) {
    console.error("sendDeliveryOtp error:", error);
    return res.status(500).json({ message: `Delivery OTP error: ${error.message}` });
  }
};

// VERIFY DELIVERY OTP
export const verifyDeliveryOtp = async (req, res) => {
  try {
    const { orderId, shopOrderId, otp } = req.body;
    if (!orderId || !shopOrderId || !otp) {
      return res.status(400).json({ message: "orderId, shopOrderId and otp are required" });
    }

    const order = await Order.findById(orderId).populate("user");
    if (!order) return res.status(404).json({ message: "Order not found" });

    const shopOrder = order.shopOrders.id(shopOrderId);
    if (!shopOrder) return res.status(404).json({ message: "Shop order not found" });

    // Check OTP validity
    if (shopOrder.deliveryOtp !== otp || !shopOrder.otpExpires || shopOrder.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Mark as delivered
    shopOrder.status = "delivered";
    shopOrder.deliveredAt = new Date();

    await order.save();

    // Remove delivery assignment if exists
    await DeliveryAssignment.deleteOne({
      shopOrderId: shopOrder._id,
      order: order._id,
      assignedTo: shopOrder.assignedDeliveryBoy
    });

    return res.status(200).json({ message: "Order marked as delivered successfully" });
  } catch (error) {
    console.error("verifyDeliveryOtp error:", error);
    return res.status(500).json({ message: `Verify delivery OTP error: ${error.message}` });
  }
};
