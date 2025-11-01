// controllers/coupon.controller.js
import Coupon from "../models/Coupon.model.js";
import User from "../models/user.model.js";

// 🧾 Create Coupon
export const createCoupon = async (req, res) => {
  try {
    console.log("📩 Incoming request body:", req.body);
    console.log("👤 Authenticated userId:", req.userId); // ✅ FIXED: Now checking req.userId
    
    const userId = req.userId; // ✅ FIXED: Changed from req.user._id to req.userId
    const { event } = req.body;

    if (!userId) {
      console.log("❌ No user ID found in request");
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!event) {
      console.log("❌ No event provided");
      return res.status(400).json({ message: "Event name required" });
    }

    // Check if user already has a coupon for this event
    const existing = await Coupon.findOne({ user: userId, event });
    if (existing) {
      console.log("⚠️ User already participated in this event");
      return res.status(200).json({ message: "You already participated in this event." });
    }

    // Generate random code
    const code = "COLLAB-" + Math.floor(1000 + Math.random() * 9000);
    
    const coupon = await Coupon.create({
      user: userId,
      event,
      code,
      used: false,
    });

    console.log("✅ Coupon created:", coupon);
    res.status(200).json({ message: "Coupon created successfully", coupon });
  } catch (error) {
    console.error("🔥 Error creating coupon:", error);
    res.status(500).json({ message: "Server error while creating coupon" });
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
