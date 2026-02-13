
import React, { useEffect } from "react";
import { serverUrl } from "../App.jsx";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setShopsInMyCity } from "../redux/userSlice.js";

function useGetAllShops() {
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchShops = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/shop/get-all`, {
          withCredentials: true,
        });
        dispatch(setShopsInMyCity(result.data));
      } catch (error) {
        dispatch(setShopsInMyCity([]));
      }
    };
    fetchShops();
  }, []);
}

export default useGetAllShops;
