// controllers/coupon.controller.js
import Coupon from "../models/Coupon.model.js";
import User from "../models/user.model.js";

// 🧾 Create Coupon
export const createCoupon = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Prevent multiple active coupons
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
    const code = `COLLAB-${random}`;

    const newCoupon = new Coupon({
      code,
      user: userId,
      discountPercent: 10,
      validTill: new Date(Date.now() + 24 * 60 * 60 * 1000), // valid for 24h
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
