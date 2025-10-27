import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { serverUrl } from '../App';

function Collaboration() {
  const navigate = useNavigate();
  const [selectedCharity, setSelectedCharity] = useState('');
  const [loading, setLoading] = useState(false);

  const charities = [
    { id: 1, name: "University Blood Drive" },
    { id: 2, name: "Local Charity Fund" }
  ];

  const handleParticipate = async () => {
    if (!selectedCharity) return alert("Please select a charity!");
    setLoading(true);

    try {
      // Use your existing Razorpay integration here (test API)
      const couponCode = `COLLAB-${Math.floor(Math.random()*10000)}`; // generate unique code
      localStorage.setItem('collabCode', couponCode);
      alert(`Thank you for participating! Your coupon code: ${couponCode}`);
      navigate("/checkout"); // redirect to checkout to use coupon
    } catch (error) {
      console.log(error);
      alert("Payment failed or canceled");
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
        {charities.map(c => (
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
