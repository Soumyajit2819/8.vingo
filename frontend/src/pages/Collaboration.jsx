import React, { useState } from "react";
import axios from "axios";
import { serverUrl } from "../App";

const Collaboration = () => {
  const [selectedEvent, setSelectedEvent] = useState("Clothes Distribution Event");
  const [message, setMessage] = useState("");
  const [coupon, setCoupon] = useState("");
  const [loading, setLoading] = useState(false);

  const events = [
    "University Blood Drive",
    "Food Donation Camp",
    "Tree Plantation Drive",
    "Clothes Distribution Event",
  ];

  const handleParticipate = async () => {
    if (!selectedEvent) {
      setMessage("Please select an event");
      return;
    }

    setLoading(true);
    setMessage("");
    setCoupon("");

    try {
      const response = await axios.post(
        `${serverUrl}/api/coupon/create`,
        { event: selectedEvent },
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data?.coupon) {
        setCoupon(response.data.coupon.code);
        setMessage("🎉 Participation successful! You received a coupon:");
      } else {
        setMessage(response.data?.message || "You already participated in this event.");
      }
    } catch (error) {
      console.error("Error creating coupon:", error);
      
      if (error.response?.status === 401) {
        setMessage("⚠️ Please login to participate");
        setTimeout(() => {
          window.location.href = "/signin";
        }, 2000);
      } else if (error.response?.status === 400) {
        setMessage(error.response?.data?.message || "You may have already participated in this event.");
      } else if (error.response?.status === 404) {
        setMessage("Service unavailable. Please try again later.");
      } else {
        setMessage("Something went wrong. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#fff9f6] flex justify-center px-4 py-8">
      <div className="w-full max-w-[600px] bg-white shadow-md rounded-2xl p-6 mt-10">
        <h1 className="text-2xl font-bold text-center mb-4">Collaborate & Donate</h1>
        <p className="text-gray-600 text-center mb-6">
          Participate in a charity and get a free food coupon!
        </p>

        {/* Event Selection Form */}
        <form onSubmit={(e) => { e.preventDefault(); handleParticipate(); }}>
          <div className="mb-6">
            <label htmlFor="event-select" className="block text-gray-700 font-medium mb-2">
              Choose an event:
            </label>
            <select
              id="event-select"
              name="event"
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]"
              required
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
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold transition ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-[#ff4d2d] hover:bg-[#e64526] text-white'
            }`}
          >
            {loading ? "Processing..." : "Participate & Get Coupon"}
          </button>
        </form>

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
