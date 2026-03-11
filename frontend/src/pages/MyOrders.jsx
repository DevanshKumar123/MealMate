import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { IoChevronBackCircle } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import UserOrderCard from "../components/UserOrderCard.jsx";
import OwnerOrderCard from "../components/OwnerOrderCard";
import { setMyOrders, updateRealTimeOrderStatus } from "../redux/userSlice.js";
import { useEffect } from "react";
import useSocket from "../hooks/useSocket";

function MyOrders() {
  const { userData, myOrders } = useSelector((state) => state.user);
  const socket = useSocket();
  const navigate = useNavigate();
  const dispatch = useDispatch()

  useEffect(() => {
    socket?.on('newOrder',(data) => {
      if(data.shopOrders?.owner._id == userData._id) {
        dispatch(setMyOrders([data,...myOrders]))
      }
    })

    socket?.on('update-status',({orderId,shopId,status,userId}) => {
      if(userId == userData._id) {
        dispatch(updateRealTimeOrderStatus({orderId,shopId,status}))
      }
    })
    return () => {
      socket?.off('newOrder')
      socket?.off('update-status')
    }
  },[socket])

  return (
    <div className="w-full min-h-screen bg-transparent flex justify-center px-4">
      <div className="w-full max-w-[800px] p-4">
        <div className="flex items-center gap-[20px] mb-6">
          <div className="z-[10]" onClick={() => navigate("/")}>
            <IoChevronBackCircle size={35} className="text-[#00fb7d]" />
          </div>
          <h1 className="text-2xl font-bold text-start text-white drop-shadow-lg bg-black/40 px-4 py-2 rounded-lg">My Orders</h1>
        </div>
        <div className="space-y-6">
          {Array.isArray(myOrders) && myOrders.length > 0 ? (
            myOrders.filter(order => order && order._id).map((order, index) =>
              userData.role === "user" ? (
                <UserOrderCard data={order} key={order._id || index} />
              ) : userData.role === "owner" ? (
                <OwnerOrderCard data={order} key={order._id || index} />
              ) : null
            )
          ) : (
            <div className="text-gray-400 text-center py-8">No orders found.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyOrders;
