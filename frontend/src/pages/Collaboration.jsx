import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../App';

function Collaboration() {
  const navigate = useNavigate();
  const [selectedCharity, setSelectedCharity] = useState('');
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem("user")); // logged-in user

  const charities = [
    { id: 1, name: "University Blood Drive" },
    { id: 2, name: "Local Charity Fund" },
  ];

  const handleParticipate = async () => {
    if (!selectedCharity) return alert("Please select a charity!");
    if (!user?._id) return alert("Login required!");

    setLoading(true);

    try {
      // ✅ Call backend to create a coupon for this user
      const res = await axios.post(`${serverUrl}/api/coupon/create`, {
        userId: user._id,
      });

      if (res.data.success) {
        localStorage.setItem("collabCode", res.data.couponCode);
        alert(`Thank you! Your coupon code is: ${res.data.couponCode}`);
        navigate("/checkout");
      } else {
        alert(res.data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Error generating coupon. Try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow mt-8">
      <h2 className="text-xl font-bold mb-4">Collaborate & Donate</h2>
      <p className="mb-4 text-gray-600">
        Participate in a charity and get a free food coupon!
      </p>

      <select
        value={selectedCharity}
        onChange={(e) => setSelectedCharity(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      >
        <option value="">Select a charity</option>
        {charities.map((c) => (
          <option key={c.id} value={c.name}>{c.name}</option>
        ))}
      </select>

      <button
        onClick={handleParticipate}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        {loading ? "Processing..." : "Participate & Get Coupon"}
      </button>
    </div>
  );
}

export default Collaboration;
