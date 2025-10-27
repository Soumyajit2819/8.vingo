import express from "express";
import { createCoupon, validateCoupon, useCoupon } from "../controllers/coupon.controller.js";

const router = express.Router();

router.post("/create", createCoupon);
router.post("/validate", validateCoupon);
router.post("/use", useCoupon);

export default router;
