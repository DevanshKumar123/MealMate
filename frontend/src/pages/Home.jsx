import React from "react";
import UserDashboard from "../components/UserDashboard.jsx";
import { useSelector } from "react-redux";
import OwnerDashboard from "../components/OwnerDashboard.jsx";
import DeliveryBoy from "../components/DeliveryBoy.jsx";
import { useNavigate } from "react-router-dom";


function Home () {
    const {userData} = useSelector(state => state.user)
    const navigate = useNavigate();
    
    // For unauthenticated users, show welcome page
    if (!userData) {
        return (
            <div className="w-[100vw] min-h-[100vh] pt-[100px] flex flex-col items-center justify-center bg-transparent">
                <div className="text-center space-y-6 px-4">
                    <h1 className="text-4xl font-bold text-white drop-shadow-lg bg-black/40 px-4 py-2 rounded-lg">Welcome to MealMate</h1>
                    <p className="text-xl text-gray-600">Your favorite food delivery app</p>
                    <div className="space-x-4">
                        <button 
                            onClick={() => navigate("/signin")}
                            className="bg-[#00fb7d] text-black px-8 py-3 rounded-lg font-semibold hover:bg-[#00d965] transition"
                        >
                            Sign In
                        </button>
                        <button 
                            onClick={() => navigate("/signup")}
                            className="bg-white text-[#00fb7d] px-8 py-3 rounded-lg font-semibold border-2 border-[#00fb7d] hover:bg-green-50 transition"
                        >
                            Sign Up
                        </button>
                    </div>
                </div>
            </div>
        )
    }
    
    return (
        <div className="w-[100vw] min-h-[100vh] pt-[100px] flex flex-col items-center bg-transparent">
            {userData.role === "user" && <UserDashboard/>}
            {userData.role === "owner" && <OwnerDashboard/>}
            {userData.role === "deliveryBoy" && <DeliveryBoy/>}
        </div>
    )
}

export default Home