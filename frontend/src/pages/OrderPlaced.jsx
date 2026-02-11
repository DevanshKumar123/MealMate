import React from 'react'
import { FaCircleCheck } from "react-icons/fa6";
import { useNavigate } from 'react-router-dom';


function OrderPlaced() {
  const navigate = useNavigate()
  return (
    <div className='min-h-screen bg-transparent flex flex-col justify-center items-center px-4 text-center relative overflow-hidden'>
        <FaCircleCheck className='text-green-500 text-6xl mb-4' />
        <h1 className='text-3xl font-bold text-white drop-shadow-lg bg-black/40 px-4 py-2 rounded-lg mb-2'>Order Placed</h1>
        <p className='text-gray-600 max-w-md mb-6'>Thank you for your purchase. Your order is being prepared. You can track your order status in the "My Order" section.</p>
        <button className='bg-[#00fb7d] hover:bg-[#00d965] text-black px-6 py-3 rounded-lg text-lg font-medium transition' onClick={() => navigate("/my-orders")}>Back To My Orders</button>
    </div>
  )
}

export default OrderPlaced