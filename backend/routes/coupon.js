import express from "express";
import { 
  createCoupon, 
  validateCoupon, 
  useCoupon,
  createOrder,
  verifyPayment
} from "../controllers/coupon.controller.js";

const couponRouter = express.Router();

couponRouter.post("/create", createCoupon);
couponRouter.post("/validate", validateCoupon);
couponRouter.post("/use", useCoupon);
couponRouter.post("/create-order", createOrder);       // NEW
couponRouter.post("/verify-payment", verifyPayment);   // NEW

export default couponRouter;
