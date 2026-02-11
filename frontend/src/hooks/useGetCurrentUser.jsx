import React, { useEffect } from "react";
import { serverUrl } from "../App.jsx";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUserData, setIsLoading } from "../redux/userSlice.js";

function useGetCurrentUser() {

  const dispatch = useDispatch()
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/user/current`, {
          withCredentials: true,
        });
        dispatch(setUserData(result.data))
      } catch (error) {
        // User not authenticated, set loading to false
        dispatch(setIsLoading(false))
      }
    };
    fetchUser()
  }, [dispatch]);
}

export default useGetCurrentUser;
