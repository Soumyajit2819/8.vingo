import axios from 'axios'
import { useEffect } from 'react'
import { serverUrl } from '../App'
import { useDispatch, useSelector } from 'react-redux'
import { setMyOrders } from '../redux/userSlice'

function useGetMyOrders() {
  const dispatch = useDispatch()
  const { userData } = useSelector(state => state.user)
  
  useEffect(() => {
    // Only fetch if user is logged in
    if (!userData?._id) return;

    const fetchOrders = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/order/my-orders`, { 
          withCredentials: true 
        })
        console.log('✅ Orders fetched:', result.data);
        dispatch(setMyOrders(result.data))
      } catch (error) {
        console.error('❌ Error fetching orders:', error)
        // Set empty array on error to prevent undefined issues
        dispatch(setMyOrders([]))
      }
    }
    
    fetchOrders()
  }, [userData?._id]) // ✅ FIX: Use userData._id instead of entire userData object
}

export default useGetMyOrders
