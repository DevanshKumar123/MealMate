import React, { useEffect } from "react";
import { serverUrl } from "../App.jsx";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import {
  setCurrentCity,
  setCurrentState,
  setCurrentAddress,
} from "../redux/userSlice.js";
import { setAddress, setLocation } from "../redux/mapSlice.js";

function useGetCity() {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);
  
  // Device location is Haldia, West Bengal - use for all 3 roles
  const DEVICE_LOCATION = {
    latitude: 22.1697,
    longitude: 88.3697,
    city: "Haldia",
    state: "West Bengal",
    address: "Haldia, West Bengal, India"
  };
  
  useEffect(() => {
    if (!userData) return; // Don't run if user not logged in

    // Use device location (Haldia) for all users
    const latitude = DEVICE_LOCATION.latitude;
    const longitude = DEVICE_LOCATION.longitude;
    
    dispatch(setLocation({lat:latitude,lon:longitude}))
    dispatch(setCurrentCity(DEVICE_LOCATION.city));
    dispatch(setCurrentState(DEVICE_LOCATION.state));
    dispatch(setCurrentAddress(DEVICE_LOCATION.address));
    dispatch(setAddress(DEVICE_LOCATION.address));

    // Also update user location on backend with city/state info
    if (userData) {
      try {
        axios.post(
          `${serverUrl}/api/user/update-location`,
          { 
            lat: latitude, 
            lon: longitude, 
            city: DEVICE_LOCATION.city, 
            state: DEVICE_LOCATION.state, 
            address: DEVICE_LOCATION.address 
          },
          { withCredentials: true }
        );
      } catch (error) {
        console.error("Failed to sync location with backend:", error);
      }
    }
  }, [userData, dispatch]);
}

export default useGetCity;
