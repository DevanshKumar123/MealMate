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
  
  useEffect(() => {
    if (!userData) return;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          dispatch(setLocation({ lat: latitude, lon: longitude }));
          // Use a geocoding API to get city/state/address
          try {
            // Example using OpenStreetMap Nominatim
            const geoRes = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
            const city = geoRes.data.address.city || geoRes.data.address.town || geoRes.data.address.village || "";
            const state = geoRes.data.address.state || "";
            const address = geoRes.data.display_name || "";
            dispatch(setCurrentCity(city));
            dispatch(setCurrentState(state));
            dispatch(setCurrentAddress(address));
            dispatch(setAddress(address));
            await axios.post(
              `${serverUrl}/api/user/update-location`,
              { lat: latitude, lon: longitude, city, state, address },
              { withCredentials: true }
            );
          } catch (error) {
            console.error("Failed to sync location with backend or geocode:", error);
          }
        },
        () => {
          // Fallback if location not available
        }
      );
    }
  }, [userData, dispatch]);
}

export default useGetCity;
