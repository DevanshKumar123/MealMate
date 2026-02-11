import React, { useEffect, useRef } from "react";
import { serverUrl } from "../App.jsx";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";

function useUpdateLocation() {
  const { userData, currentCity, currentState, currentAddress } = useSelector((state) => state.user);
  const watchIdRef = useRef(null);
  const lastUpdateRef = useRef({ lat: null, lon: null, time: 0 });

  // Device location is Haldia, West Bengal
  const DEVICE_LOCATION = {
    latitude: 22.1697,
    longitude: 88.3697
  };

  useEffect(() => {
    if (!userData) return; // Only run if user is logged in

    const updateLocation = async (lat, lon) => {
      try {
        // Debounce: only update if location changed significantly or 30 seconds passed
        const now = Date.now();
        const distance = Math.sqrt(
          Math.pow(lat - (lastUpdateRef.current.lat || 0), 2) +
          Math.pow(lon - (lastUpdateRef.current.lon || 0), 2)
        );
        
        if (distance > 0.001 || now - lastUpdateRef.current.time > 30000) {
          lastUpdateRef.current = { lat, lon, time: now };
          
          const result = await axios.post(
            `${serverUrl}/api/user/update-location`,
            { lat, lon, city: currentCity, state: currentState, address: currentAddress },
            { withCredentials: true }
          );
          console.log("Location updated:", result.data);
        }
      } catch (error) {
        console.error(
          "Location update failed:",
          error.response?.data?.message || error.message
        );
      }
    };

    // Use Haldia device location for all users
    updateLocation(DEVICE_LOCATION.latitude, DEVICE_LOCATION.longitude);
    
  }, [userData, currentCity, currentState, currentAddress]);
}

export default useUpdateLocation;
