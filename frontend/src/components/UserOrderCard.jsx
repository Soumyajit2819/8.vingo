import axios from 'axios'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { serverUrl } from '../App'

function UserOrderCard({ data }) {
  const navigate = useNavigate()
  const [selectedRating, setSelectedRating] = useState({}) // { itemId: rating }

  // Format date nicely
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-GB', {
      day: "2-digit",
      month: "short",
      year: "numeric"
    })
  }

  // Handle item rating
  const handleRating = async (itemId, rating) => {
    try {
      await axios.post(`${serverUrl}/api/item/rating`, { itemId, rating }, { withCredentials: true })
      setSelectedRating(prev => ({
        ...prev,
        [itemId]: rating
      }))
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className='bg-white rounded-lg shadow p-4 space-y-4'>
      {/* Order header */}
      <div className='flex justify-between border-b pb-2'>
        <div>
          <p className='font-semibold'>Order #{data._id?.slice(-6) || "N/A"}</p>
          <p className='text-sm text-gray-500'>Date: {data.createdAt ? formatDate(data.createdAt) : "Unknown"}</p>
        </div>
        <div className='text-right'>
          {data.paymentMethod === "cod" ? (
            <p className='text-sm text-gray-500'>{data.paymentMethod?.toUpperCase()}</p>
          ) : (
            <p className='text-sm text-gray-500 font-semibold'>Payment: {data.payment ? "true" : "false"}</p>
          )}
          <p className='font-medium text-blue-600'>{data.shopOrders?.[0]?.status || "Unknown"}</p>
        </div>
      </div>

      {/* Shop Orders */}
      {data.shopOrders?.map((shopOrder, index) => (
        <div key={index} className='border rounded-lg p-3 bg-[#fffaf7] space-y-3'>
          <p className='font-semibold'>{shopOrder.shop?.name || "Unknown Shop"}</p>

          <div className='flex space-x-4 overflow-x-auto pb-2'>
            {shopOrder.shopOrderItems?.map((item, idx) => (
              <div key={idx} className='flex-shrink-0 w-40 border rounded-lg p-2 bg-white'>
                <img src={item.item?.image || "/placeholder.png"} alt={item.item?.name || "Item"} className='w-full h-24 object-cover rounded' />
                <p className='text-sm font-semibold mt-1'>{item.item?.name || "Unknown Item"}</p>
                <p className='text-xs text-gray-500'>Qty: {item.quantity || 0} x ₹{item.price || 0}</p>

                {/* Rating stars */}
                {shopOrder.status === "delivered" && item.item?._id && (
                  <div className='flex space-x-1 mt-2'>
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        className={`text-lg ${selectedRating[item.item._id] >= star ? 'text-yellow-400' : 'text-gray-400'}`}
                        onClick={() => handleRating(item.item._id, star)}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className='flex justify-between items-center border-t pt-2'>
            <p className='font-semibold'>Subtotal: ₹{shopOrder.subtotal || 0}</p>
            <span className='text-sm font-medium text-blue-600'>{shopOrder.status || "Unknown"}</span>
          </div>
        </div>
      ))}

      {/* Total and Track Order */}
      <div className='flex justify-between items-center border-t pt-2'>
        <p className='font-semibold'>Total: ₹{data.totalAmount || 0}</p>
        <button
          className='bg-[#ff4d2d] hover:bg-[#e64526] text-white px-4 py-2 rounded-lg text-sm'
          onClick={() => navigate(`/track-order/${data._id}`)}
        >
          Track Order
        </button>
      </div>
    </div>
  )
}

export default UserOrderCard
