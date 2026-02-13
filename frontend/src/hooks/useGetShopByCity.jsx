import React, { useEffect } from "react";
import { serverUrl } from "../App.jsx";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setShopsInMyCity } from "../redux/userSlice.js";

function useGetShopByCity() {
  const { userData } = useSelector(state => state.user);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!userData) return;
    const fetchShops = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/shop/get-all`, {
          withCredentials: true,
        });
        dispatch(setShopsInMyCity(result.data));
      } catch (error) {
        console.error("Failed to fetch shops:", error);
        dispatch(setShopsInMyCity([]));
      }
    };
    fetchShops();
  }, [userData]);
}

export default useGetShopByCity;
