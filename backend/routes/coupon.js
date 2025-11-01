import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { createCoupon, validateCoupon, useCoupon } from "../controllers/coupon.controller.js";

const router = express.Router();

router.post("/create", isAuth, createCoupon);
router.post("/validate", validateCoupon);
router.post("/use", isAuth, useCoupon);

export default router;
