import express from "express";
import { createCoupon, getMyCoupons, verifyCoupon, useCoupon } from "../controllers/coupon.controllers.js";

const couponRouter = express.Router();

couponRouter.post("/create", createCoupon);
couponRouter.get("/my-coupons", getMyCoupons); // Add auth middleware if you have
couponRouter.post("/verify", verifyCoupon);
couponRouter.post("/use", useCoupon);

export default couponRouter;
