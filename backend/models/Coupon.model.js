// ✅ models/coupon.model.js
// ----------------------------
// This model stores all coupons generated after successful donations (collaborations).

import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
  // 🎟️ Unique coupon code (like COLLAB-2830)
  code: {
    type: String,
    required: true,
    unique: true
  },

  // 👤 Coupon belongs to a specific user
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  // 💰 Percentage of discount this coupon offers
  discountPercent: {
    type: Number,
    default: 10 // You can modify this value
  },

  // ✅ Whether the coupon has already been used or not
  isUsed: {
    type: Boolean,
    default: false
  },

  // 📅 Coupon creation and expiration
  createdAt: {
    type: Date,
    default: Date.now
  },
  validTill: {
    type: Date,
    default: () => Date.now() + 24 * 60 * 60 * 1000 // valid for 24 hours
  }
}, { timestamps: true });

// Exporting model
const Coupon = mongoose.model("Coupon", couponSchema);
export default Coupon;
