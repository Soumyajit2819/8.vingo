import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { serverUrl } from '../App';

function Collaboration() {
  const { userData } = useSelector(state => state.user);
  const navigate = useNavigate();
  
  const [selectedEvent, setSelectedEvent] = useState('Tree Plantation Drive');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showCharityModal, setShowCharityModal] = useState(false);
  const [couponCode, setCouponCode] = useState('');

  // Event to Charity mapping with payment requirement
  const eventCharities = {
    'University Blood Drive': {
      name: 'Red Cross Blood Bank',
      description: 'Help save lives by participating in blood donation',
      requiresPayment: false, // No payment needed
      donationAmount: 0
    },
    'Food Donation Camp': {
      name: 'Akshaya Patra Foundation',
      description: 'Help feed underprivileged children',
      requiresPayment: false,
      donationAmount: 0
    },
    'Tree Plantation Drive': {
      name: 'Vasundhara',
      description: 'Plant trees and contribute to a greener planet',
      requiresPayment: true, // Payment required
      donationAmount: 200
    },
    'Clothes Distribution Event': {
      name: 'Goonj Foundation',
      description: 'Donate for clothing distribution to the needy',
      requiresPayment: false,
      donationAmount: 0
    }
  };

  const events = [
    'University Blood Drive',
    'Food Donation Camp', 
    'Tree Plantation Drive',
    'Clothes Distribution Event'
  ];

  const handleParticipate = () => {
    const charity = eventCharities[selectedEvent];
    
    if (charity.requiresPayment) {
      // Show payment modal for Tree Plantation
      setShowCharityModal(true);
    } else {
      // Direct coupon generation for other events
      createCouponDirectly();
    }
  };

  // For non-payment events
  const createCouponDirectly = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${serverUrl}/api/coupon/create`, {
        userId: userData._id,
        eventName: selectedEvent
      }, { withCredentials: true });

      if (res.data.success) {
        setCouponCode(res.data.couponCode);
        setMessage('Coupon created successfully!');
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error creating coupon');
    } finally {
      setLoading(false);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);
    setMessage('');

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setMessage('Failed to load payment gateway. Please try again.');
        setLoading(false);
        return;
      }

      const charity = eventCharities[selectedEvent];
      
      // Create Razorpay order
      const orderResponse = await axios.post(
        `${serverUrl}/api/coupon/create-order`,
        {
          amount: charity.donationAmount,
          eventName: selectedEvent,
          charityName: charity.name,
          userId: userData._id
        },
        { withCredentials: true }
      );

      const { orderId, amount, key } = orderResponse.data;

      // Razorpay payment options
      const options = {
        key: key,
        amount: amount,
        currency: 'INR',
        name: 'Vingo',
        description: `Donation for ${charity.name}`,
        order_id: orderId,
        handler: async function (response) {
          try {
            // Verify payment and create coupon
            const verifyResponse = await axios.post(
              `${serverUrl}/api/coupon/verify-payment`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                eventName: selectedEvent,
                userId: userData._id
              },
              { withCredentials: true }
            );

            if (verifyResponse.data.success) {
              setCouponCode(verifyResponse.data.couponCode);
              setMessage('Payment successful! Your 10% discount coupon:');
              setShowCharityModal(false);
            }
          } catch (error) {
            setMessage('Payment verification failed. Please contact support.');
            console.error('Verification error:', error);
          }
          setLoading(false);
        },
        prefill: {
          name: userData?.fullName || '',
          email: userData?.email || '',
          contact: userData?.mobile || ''
        },
        theme: {
          color: '#ff4d2d'
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
            setMessage('Payment cancelled');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error('Payment error:', error);
      setMessage(error.response?.data?.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen w-full bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4'>
      <div className='bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 md:p-12'>
        <h1 className='text-4xl font-bold text-center mb-3 text-gray-800'>
          Collaborate & Donate
        </h1>
        <p className='text-center text-gray-600 mb-8'>
          Participate in a charity and get a free 10% discount coupon!
        </p>

        <div className='mb-6'>
          <label className='block text-gray-700 font-semibold mb-3'>
            Choose an event:
          </label>
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className='w-full border-2 border-orange-300 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500 text-gray-700 cursor-pointer'
          >
            {events.map((event) => (
              <option key={event} value={event}>
                {event}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleParticipate}
          disabled={loading}
          className='w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 rounded-lg text-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg'
        >
          {loading ? 'Processing...' : 'Participate & Get Coupon'}
        </button>

        {message && (
          <div className={`mt-6 p-4 rounded-lg ${couponCode ? 'bg-green-100 border-2 border-green-500' : 'bg-red-100 border-2 border-red-500'}`}>
            <p className={`text-center ${couponCode ? 'text-green-700' : 'text-red-700'} font-semibold`}>
              {message}
            </p>
            {couponCode && (
              <div className='mt-4 bg-white p-4 rounded-lg border-2 border-green-500'>
                <p className='text-center text-sm text-gray-600 mb-2'>Your Coupon Code:</p>
                <p className='text-center text-2xl font-bold text-orange-600 tracking-wider'>
                  {couponCode}
                </p>
                <p className='text-center text-sm text-gray-500 mt-2'>
                  10% discount on your next order
                </p>
              </div>
            )}
          </div>
        )}

        <button
          onClick={() => navigate('/')}
          className='w-full mt-6 border-2 border-gray-300 hover:border-orange-500 text-gray-700 font-semibold py-3 rounded-lg transition-colors'
        >
          Back to Home
        </button>
      </div>

      {/* Charity Payment Modal - Only for Tree Plantation */}
      {showCharityModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl'>
            <h2 className='text-2xl font-bold text-gray-800 mb-4'>
              {eventCharities[selectedEvent].name}
            </h2>
            <p className='text-gray-600 mb-6'>
              {eventCharities[selectedEvent].description}
            </p>
            
            <div className='bg-orange-50 p-4 rounded-lg mb-6'>
              <p className='text-center text-gray-700'>
                Donation Amount
              </p>
              <p className='text-center text-3xl font-bold text-orange-600'>
                ₹{eventCharities[selectedEvent].donationAmount}
              </p>
            </div>

            <div className='bg-green-50 p-4 rounded-lg mb-6 border-2 border-green-200'>
              <p className='text-center text-sm text-gray-600'>
                You will receive:
              </p>
              <p className='text-center text-lg font-bold text-green-600'>
                10% Discount Coupon
              </p>
            </div>

            <button
              onClick={handlePayment}
              disabled={loading}
              className='w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50'
            >
              {loading ? 'Processing...' : 'Proceed to Payment'}
            </button>

            <button
              onClick={() => setShowCharityModal(false)}
              className='w-full mt-3 border-2 border-gray-300 hover:border-red-500 text-gray-700 font-semibold py-3 rounded-lg transition-colors'
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Collaboration;
