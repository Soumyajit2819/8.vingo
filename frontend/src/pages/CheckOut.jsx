import React, { useState, useEffect } from "react";
import axios from "axios";
import { serverUrl } from "../App";

function Checkout() {
  const [couponCode, setCouponCode] = useState(localStorage.getItem("collabCode") || "");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [totalAmount, setTotalAmount] = useState(1000); // example
  const user = JSON.parse(localStorage.getItem("user"));

  const applyCoupon = async () => {
    try {
      const res = await axios.post(`${serverUrl}/api/coupon/validate`, {
        code: couponCode,
        userId: user._id,
      });

      if (res.data.success) {
        setDiscountPercent(res.data.discountPercent);
        alert(`Coupon applied! ${res.data.discountPercent}% off`);
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      alert("Invalid or expired coupon");
    }
  };

  const discountedTotal = totalAmount - (totalAmount * discountPercent) / 100;

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded shadow mt-8">
      <h2 className="text-xl font-bold mb-4">Checkout</h2>

      <input
        type="text"
        placeholder="Enter Coupon Code"
        value={couponCode}
        onChange={(e) => setCouponCode(e.target.value)}
        className="border p-2 rounded w-full mb-3"
      />

      <button
        onClick={applyCoupon}
        className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 mb-4"
      >
        Apply Coupon
      </button>

      <h3 className="text-lg">
        Subtotal: ₹{totalAmount} <br />
        Discount: {discountPercent}% <br />
        <strong>Final Total: ₹{discountedTotal.toFixed(2)}</strong>
      </h3>
    </div>
  );
}

export default Checkout;
