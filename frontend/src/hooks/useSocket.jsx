import { useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import { serverUrl } from "../App";

// Socket instance is stored in a ref, not Redux (socket is not serializable)
const socketRef = { current: null };

export const useSocket = () => {
  const { userData } = useSelector((state) => state.user);

  useEffect(() => {
    // Create socket instance once
    if (!socketRef.current) {
      socketRef.current = io(serverUrl, { withCredentials: true });
    }

    const socket = socketRef.current;

    // Emit identity when user data is available
    socket.on("connect", () => {
      if (userData) {
        socket.emit("identity", { userId: userData._id });
      }
    });

    return () => {
      // Don't disconnect - maintain connection throughout app lifetime
      // socket.disconnect();
    };
  }, [userData?._id]);

  // Return the socket instance - not serialized in Redux
  return socketRef.current;
};

export default useSocket;
