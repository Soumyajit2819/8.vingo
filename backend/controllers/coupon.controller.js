import Coupon from "../models/coupon.model.js";

// Generate random coupon code
const generateCouponCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'VINGO-';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Create coupon after charity participation
export const createCoupon = async (req, res) => {
  try {
    const { eventName, userId } = req.body;
    
    if (!eventName || !userId) {
      return res.status(400).json({ message: "Event name and user ID required" });
    }

    // Generate unique coupon code
    let code = generateCouponCode();
    let exists = await Coupon.findOne({ code });
    
    while (exists) {
      code = generateCouponCode();
      exists = await Coupon.findOne({ code });
    }

    // Create coupon valid for 30 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const coupon = await Coupon.create({
      code,
      userId,
      eventName,
      discount: 50, // 50% discount
      discountType: 'percentage',
      expiresAt
    });

    return res.status(201).json({
      success: true,
      message: "Coupon created successfully!",
      coupon
    });

  } catch (error) {
    console.error('Create coupon error:', error);
    return res.status(500).json({ message: `Error: ${error.message}` });
  }
}

// Get user's coupons
export const getMyCoupons = async (req, res) => {
  try {
    const userId = req.user._id; // From auth middleware
    
    const coupons = await Coupon.find({ 
      userId,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    return res.status(200).json(coupons);

  } catch (error) {
    console.error('Get coupons error:', error);
    return res.status(500).json({ message: `Error: ${error.message}` });
  }
}

// Verify and apply coupon
export const verifyCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user._id;

    const coupon = await Coupon.findOne({ code });

    if (!coupon) {
      return res.status(404).json({ message: "Invalid coupon code" });
    }

    if (coupon.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "This coupon doesn't belong to you" });
    }

    if (coupon.isUsed) {
      return res.status(400).json({ message: "Coupon already used" });
    }

    if (new Date() > coupon.expiresAt) {
      return res.status(400).json({ message: "Coupon has expired" });
    }

    return res.status(200).json({
      success: true,
      coupon,
      message: "Coupon is valid!"
    });

  } catch (error) {
    console.error('Verify coupon error:', error);
    return res.status(500).json({ message: `Error: ${error.message}` });
  }
}

// Mark coupon as used
export const useCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    
    const coupon = await Coupon.findOne({ code });
    
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    coupon.isUsed = true;
    coupon.usedAt = new Date();
    await coupon.save();

    return res.status(200).json({
      success: true,
      message: "Coupon applied successfully!"
    });

  } catch (error) {
    console.error('Use coupon error:', error);
    return res.status(500).json({ message: `Error: ${error.message}` });
  }
}
