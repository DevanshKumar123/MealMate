// hooks/useGetMyShop.jsx
import { useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setMyShopData } from "../redux/ownerSlice";
import { serverUrl } from "../App";

function useGetMyShop() {
  const dispatch = useDispatch();
  const {userData} =useSelector(state => state.user)

  useEffect(() => {
    const fetchMyShop = async () => {
      try {
        const res = await axios.get(`${serverUrl}/api/shop/get-my`, {withCredentials: true});
        dispatch(setMyShopData(res.data));
      } catch (error) {
        console.error("Error fetching shop:", error.response?.data || error.message);
      }
    };

    fetchMyShop();
  }, [userData]);
};

export default useGetMyShop;
