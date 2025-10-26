import axios from 'axios';
import { useEffect, useRef } from 'react';
import { serverUrl } from '../App';
import { useDispatch, useSelector } from 'react-redux';
import { setMyOrders } from '../redux/userSlice';

function useGetMyOrders() {
  const dispatch = useDispatch();
  const { userData } = useSelector(state => state.user);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!userData || !userData._id) {
      hasFetched.current = false;
      return;
    }

    if (hasFetched.current) return;

    const fetchOrders = async () => {
      try {
        console.log('🔄 Fetching orders for user:', userData._id);
        const result = await axios.get(`${serverUrl}/api/order/my-orders`, {
          withCredentials: true
        });
        console.log('✅ Orders fetched:', result.data);
        dispatch(setMyOrders(result.data));
        hasFetched.current = true;
      } catch (error) {
        console.error('❌ Error fetching orders:', error);
        dispatch(setMyOrders([]));
      }
    };

    fetchOrders();
  }, [userData, dispatch]);
}

export default useGetMyOrders;
