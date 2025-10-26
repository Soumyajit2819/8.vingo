import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import UserOrderCard from '../components/UserOrderCard';
import OwnerOrderCard from '../components/OwnerOrderCard';
import { setMyOrders, updateRealtimeOrderStatus } from '../redux/userSlice';

function MyOrders() {
  const { userData, myOrders, socket } = useSelector(state => state.user)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  useEffect(() => {
    if (!socket) return; // ✅ Safety check

    const handleNewOrder = (data) => {
      if (data.shopOrders?.owner._id == userData?._id) {
        dispatch(setMyOrders([data, ...myOrders]))
      }
    }

    const handleUpdateStatus = ({ orderId, shopId, status, userId }) => {
      if (userId == userData?._id) {
        dispatch(updateRealtimeOrderStatus({ orderId, shopId, status }))
      }
    }

    socket.on('newOrder', handleNewOrder)
    socket.on('update-status', handleUpdateStatus)

    return () => {
      socket.off('newOrder', handleNewOrder)
      socket.off('update-status', handleUpdateStatus)
    }
  }, [socket, userData?._id, myOrders, dispatch]) // ✅ FIX: Add all dependencies

  return (
    <div className='w-full min-h-screen bg-[#fff9f6] flex justify-center px-4'>
      <div className='w-full max-w-[800px] p-4'>
        <div className='flex items-center gap-[20px] mb-6'>
          <div className='z-[10] cursor-pointer' onClick={() => navigate("/")}>
            <IoIosArrowRoundBack size={35} className='text-[#ff4d2d]' />
          </div>
          <h1 className='text-2xl font-bold text-start'>My Orders</h1>
        </div>

        <div className='space-y-6'>
          {myOrders && myOrders.length > 0 ? (
            myOrders.map((order, index) => (
              userData.role == "user" ? (
                <UserOrderCard data={order} key={index} />
              ) : userData.role == "owner" ? (
                <OwnerOrderCard data={order} key={index} />
              ) : null
            ))
          ) : (
            <div className='text-center py-10'>
              <p className='text-gray-500 text-lg'>No orders yet</p>
              <button
                onClick={() => navigate("/")}
                className='mt-4 bg-[#ff4d2d] hover:bg-[#e64526] text-white px-6 py-2 rounded-lg'
              >
                Start Ordering
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MyOrders
