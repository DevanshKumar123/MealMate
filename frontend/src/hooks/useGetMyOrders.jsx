// hooks/useGetMyShop.jsx
import { useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setMyShopData } from "../redux/ownerSlice";
import { serverUrl } from "../App";
import { setMyOrders } from "../redux/userSlice";

function useGetMyOrders() {
  const dispatch = useDispatch();
  const {userData} =useSelector(state => state.user)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${serverUrl}/api/order/my-orders`, {withCredentials: true});
        dispatch(setMyOrders(res.data));
        console.log(res.data)
      } catch (error) {
        console.error("Error fetching shop:", error.response?.data || error.message);
      }
    };

    fetchOrders();
  }, [userData]);
};

export default useGetMyOrders;
