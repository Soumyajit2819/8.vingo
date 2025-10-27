// routes/Coupone.js
import express from "express";
import {
  createCoupon,
  validateCoupon,
  useCoupon
} from "../controllers/coupon.controller.js";

const router = express.Router();

// Route mapping
router.post("/create", createCoupon);
router.post("/validate", validateCoupon);
router.post("/use", useCoupon);

export default router;
