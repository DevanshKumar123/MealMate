import React, { useEffect } from "react";
import { serverUrl } from "../App.jsx";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setUserData, setItemsInMyCity } from "../redux/userSlice.js";

function useGetItemsByCity() {
  const { currentCity } = useSelector(state => state.user);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/item/get-by-city/${currentCity}`, {
          withCredentials: true,
        });
        dispatch(setItemsInMyCity(result.data));
      } catch (error) {
        console.log(error);
      }
    };

    if (currentCity) {
      fetchItems();
    }
  }, [currentCity]);
}

export default useGetItemsByCity;
