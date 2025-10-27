import React, { useState } from "react";
import axios from "axios";
import { serverUrl } from "../App";

const Collaboration = () => {
  const [selectedEvent, setSelectedEvent] = useState("University Blood Drive");
  const [message, setMessage] = useState("");
  const [coupon, setCoupon] = useState("");

  const events = [
    "University Blood Drive",
    "Food Donation Camp",
    "Tree Plantation Drive",
    "Clothes Distribution Event",
  ];

  const handleParticipate = async () => {
    try {
      // ✅ Send request with cookies (not Authorization header)
      const response = await axios.post(
        `${serverUrl}/api/coupon/create`,
        { event: selectedEvent },
        { withCredentials: true } // 🔥 crucial for cookie-based login
      );

      if (response.data?.coupon) {
        setCoupon(response.data.coupon.code);
        setMessage("🎉 Participation successful! You received a coupon:");
      } else {
        setMessage(response.data?.message || "You already participated.");
      }
    } catch (error) {
      console.error("Error creating coupon:", error);

      // Handle auth error
      if (error.response?.status === 401) {
        alert("Login required!");
        window.location.href = "/signin";
      } else {
        setMessage("Something went wrong. Please try again later.");
      }
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#fff9f6] flex justify-center px-4">
      <div className="w-full max-w-[600px] bg-white shadow-md rounded-2xl p-6 mt-10">
        <h1 className="text-2xl font-bold text-center mb-4">Collaborate & Donate</h1>
        <p className="text-gray-600 text-center mb-6">
          Participate in a charity and get a free food coupon!
        </p>

        {/* Event Selection */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">Choose an event:</label>
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]"
          >
            {events.map((event, index) => (
              <option key={index} value={event}>
                {event}
              </option>
            ))}
          </select>
        </div>

        {/* Participate Button */}
        <button
          onClick={handleParticipate}
          className="w-full bg-[#ff4d2d] hover:bg-[#e64526] text-white py-3 rounded-lg font-semibold transition"
        >
          Participate & Get Coupon
        </button>

        {/* Display message */}
        {message && (
          <div className="mt-6 text-center">
            <p className="text-gray-700 mb-2">{message}</p>
            {coupon && (
              <div className="text-lg font-bold text-[#ff4d2d] bg-[#fff1ef] py-2 px-4 rounded-lg inline-block">
                {coupon}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Collaboration;
