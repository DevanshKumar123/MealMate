import React, { useEffect } from "react";
import { serverUrl } from "../App.jsx";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setShopsInMyCity, setUserData } from "../redux/userSlice.js";

function useGetShopByCity() {
  const {currentCity} = useSelector(state => state.user)
  const dispatch = useDispatch()
  useEffect(() => {
    const fetchShops = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/shop/get-by-city/${currentCity}`, {
          withCredentials: true,
        });
        dispatch(setShopsInMyCity(result.data))
      } catch (error) {
        console.log(error)
      }
    };
        fetchShops()
  }, [currentCity]);
}

export default useGetShopByCity;
