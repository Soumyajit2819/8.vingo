import Coupon from "../models/Coupon.model.js";
import User from "../models/user.model.js";
import crypto from 'crypto';
import Razorpay from 'razorpay';

// 🧾 Create Coupon (for non-payment events)
export const createCoupon = async (req, res) => {
  try {
    const { userId, eventName } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check for existing unused coupon
    const existing = await Coupon.findOne({ user: userId, isUsed: false });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "You already have an unused coupon",
        couponCode: existing.code,
      });
    }

    // Generate unique code
    const random = Math.floor(1000 + Math.random() * 9000);
    const code = `VINGO-${random}`;

    const newCoupon = new Coupon({
      code,
      user: userId,
      eventName: eventName || 'General',
      discountPercent: 10,
      validTill: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });

    await newCoupon.save();

    res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      couponCode: newCoupon.code,
    });
  } catch (error) {
    console.error("Coupon creation error:", error);
    res.status(500).json({ success: false, message: "Server error while creating coupon" });
  }
};

// 💳 Create Razorpay Order
export const createOrder = async (req, res) => {
  try {
    const { amount, eventName, charityName, userId } = req.body;
    
    if (!amount || !userId) {
      return res.status(400).json({ message: "Amount and userId required" });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    const options = {
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        eventName,
        charityName,
        userId
      }
    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      key: process.env.RAZORPAY_KEY_ID
    });

  } catch (error) {
    console.error('Create order error:', error);
    return res.status(500).json({ message: `Error: ${error.message}` });
  }
};

// ✅ Verify Payment and Create Coupon
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      eventName,
      userId
    } = req.body;

    // Verify signature
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ 
        success: false,
        message: 'Payment verification failed' 
      });
    }

    // Payment verified - create coupon
    const random = Math.floor(1000 + Math.random() * 9000);
    const code = `VINGO-${random}`;

    const newCoupon = new Coupon({
      code,
      user: userId,
      eventName,
      discountPercent: 10,
      validTill: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id
    });

    await newCoupon.save();

    return res.status(201).json({
      success: true,
      message: "Payment successful! Coupon created.",
      couponCode: newCoupon.code
    });

  } catch (error) {
    console.error('Verify payment error:', error);
    return res.status(500).json({ message: `Error: ${error.message}` });
  }
};

// 🧾 Validate Coupon
export const validateCoupon = async (req, res) => {
  try {
    const { code, userId } = req.body;
    if (!code || !userId) {
      return res.status(400).json({ success: false, message: "Code and User ID are required" });
    }

    const coupon = await Coupon.findOne({ code, user: userId });
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Invalid coupon code" });
    }

    if (new Date() > coupon.validTill) {
      return res.status(400).json({ success: false, message: "Coupon expired" });
    }

    if (coupon.isUsed) {
      return res.status(400).json({ success: false, message: "Coupon already used" });
    }

    res.status(200).json({
      success: true,
      message: "Coupon is valid",
      discountPercent: coupon.discountPercent,
    });
  } catch (error) {
    console.error("Coupon validate error:", error);
    res.status(500).json({ success: false, message: "Server error while validating coupon" });
  }
};

// 🧾 Mark Coupon as Used
export const useCoupon = async (req, res) => {
  try {
    const { code, userId } = req.body;
    if (!code || !userId) {
      return res.status(400).json({ success: false, message: "Code and User ID are required" });
    }

    const coupon = await Coupon.findOne({ code, user: userId });
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Invalid coupon" });
    }

    if (coupon.isUsed) {
      return res.status(400).json({ success: false, message: "Coupon already used" });
    }

    coupon.isUsed = true;
    await coupon.save();

    res.status(200).json({ success: true, message: "Coupon marked as used" });
  } catch (error) {
    console.error("Coupon use error:", error);
    res.status(500).json({ success: false, message: "Server error while marking coupon used" });
  }
};
