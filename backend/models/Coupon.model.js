import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  eventName: {
    type: String,
    default: 'General'
  },
  discountPercent: {
    type: Number,
    required: true,
    default: 10
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  validTill: {
    type: Date,
    required: true
  },
  // NEW: Payment tracking fields
  paymentId: String,
  orderId: String
}, {
  timestamps: true
});

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
