import React, { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { io } from 'socket.io-client';

// 🔹 Pages
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import ForgotPassword from './pages/ForgotPassword';
import Home from './pages/Home';
import CreateEditShop from './pages/CreateEditShop';
import AddItem from './pages/AddItem';
import EditItem from './pages/EditItem';
import CartPage from './pages/CartPage';
import CheckOut from './pages/CheckOut';
import OrderPlaced from './pages/OrderPlaced';
import MyOrders from './pages/MyOrders';
import TrackOrderPage from './pages/TrackOrderPage';
import Shop from './pages/Shop';
import Collaboration from './pages/Collaboration'; // 🆕

// 🔹 Components
import AIChatbot from './components/AIChatbot';

// 🔹 Hooks
import useGetCurrentUser from './hooks/useGetCurrentUser';
import useGetCity from './hooks/useGetCity';
import useGetMyShop from './hooks/useGetMyShop';
import useGetShopByCity from './hooks/useGetShopByCity';
import useGetItemsByCity from './hooks/useGetItemsByCity';
import useGetMyOrders from './hooks/useGetMyOrders';
import useUpdateLocation from './hooks/useUpdateLocation';

// 🔹 Redux
import { setSocket } from './redux/userSlice';

// ✅ Backend URL
export const serverUrl = import.meta.env.VITE_API_URL || "https://vingo-9xou.onrender.com";

function App() {
  const { userData, socket } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  // ✅ Initialize hooks
  useGetCurrentUser();
  useUpdateLocation();
  useGetCity();
  useGetMyShop();
  useGetShopByCity();
  useGetItemsByCity();
  useGetMyOrders();

  // ✅ Setup socket connection
  useEffect(() => {
    const socketInstance = io(serverUrl, {
      withCredentials: true,
      transports: ['websocket'],
    });

    socketInstance.on('connect', () => {
      console.log('✅ Socket connected:', socketInstance.id);
    });

    socketInstance.on('connect_error', (err) => {
      console.error('❌ Socket connection error:', err.message);
    });

    dispatch(setSocket(socketInstance));

    return () => {
      socketInstance.disconnect();
    };
  }, [dispatch]);

  // ✅ Send user identity when logged in
  useEffect(() => {
    if (socket && userData && userData._id) {
      socket.emit('identity', { userId: userData._id });
    }
  }, [socket, userData]);

  return (
    <>
      <Routes>
        <Route path="/signup" element={!userData ? <SignUp /> : <Navigate to="/" />} />
        <Route path="/signin" element={!userData ? <SignIn /> : <Navigate to="/" />} />
        <Route path="/forgot-password" element={!userData ? <ForgotPassword /> : <Navigate to="/" />} />
        <Route path="/" element={userData ? <Home /> : <Navigate to="/signin" />} />
        <Route path="/create-edit-shop" element={userData ? <CreateEditShop /> : <Navigate to="/signin" />} />
        <Route path="/add-item" element={userData ? <AddItem /> : <Navigate to="/signin" />} />
        <Route path="/edit-item/:itemId" element={userData ? <EditItem /> : <Navigate to="/signin" />} />
        <Route path="/cart" element={userData ? <CartPage /> : <Navigate to="/signin" />} />
        <Route path="/checkout" element={userData ? <CheckOut /> : <Navigate to="/signin" />} />
        <Route path="/order-placed" element={userData ? <OrderPlaced /> : <Navigate to="/signin" />} />
        <Route path="/my-orders" element={userData ? <MyOrders /> : <Navigate to="/signin" />} />
        <Route path="/track-order/:orderId" element={userData ? <TrackOrderPage /> : <Navigate to="/signin" />} />
        <Route path="/shop/:shopId" element={userData ? <Shop /> : <Navigate to="/signin" />} />

        {/* 🩵 FIXED Collaboration route */}
        <Route
          path="/collaboration"
          element={
            userData === null ? (
              <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading user...</div>
            ) : userData ? (
              <Collaboration />
            ) : (
              <Navigate to="/signin" />
            )
          }
        />
      </Routes>

      {userData && <AIChatbot />}
    </>
  );
}

export default App;
