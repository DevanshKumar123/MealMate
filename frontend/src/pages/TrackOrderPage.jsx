import axios from "axios";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { serverUrl } from "../App";
import { useEffect } from "react";
import { useState } from "react";
import { IoChevronBackCircle } from "react-icons/io5";
import DeliveryBoyTracking from "../components/DeliveryBoyTracking";
import { useSelector } from "react-redux";

function toNumber(v, fallback = null) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function TrackOrderPage() {
  const { orderId } = useParams();
  const [currentOrder, setCurrentOrder] = useState();
  const navigate = useNavigate();
  const { socket } = useSelector((state) => state.user);
  const [liveLocation, setLiveLocation] = useState({});

  const handleGetOrder = async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/order/get-order-by-id/${orderId}`,
        {
          withCredentials: true,
        }
      );
      setCurrentOrder(result.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!socket) return;
    const handler = ({ deliveryBoyId, latitude, longitude }) => {
      setLiveLocation((prev) => ({
        ...prev,
        [deliveryBoyId]: { lat: toNumber(latitude), lon: toNumber(longitude) },
      }));
    };
    socket.on("updateDeliveryLocation", handler);
    return () => {
      socket.off("updateDeliveryLocation", handler);
    };
  }, [socket]);

  useEffect(() => {
    handleGetOrder();
  }, [orderId]);

  return (
    <div className="max-w-4xl mx-auto p-4 flex flex-col gap-6">
      <div
        className="relative flex items-center gap-4 top-[20px] left-[20px] z-[10] mb-[10px]"
        onClick={() => navigate("/")}
      >
        <IoChevronBackCircle size={35} className="text-[#ff4d2d]" />
        <h1 className="text-2xl font-bold md:text-center">Track Order</h1>
      </div>

      {currentOrder?.shopOrders?.map((shopOrder, index) => {
        // ensure numeric fallback for customer's coordinates
        const customerLat = toNumber(
          currentOrder?.deliveryAddress?.latitude,
          null
        );
        const customerLon = toNumber(
          currentOrder?.deliveryAddress?.longitude,
          null
        );

        // assigned delivery boy coords (from DB stored as [lon, lat])
        const assignedUserCoords = shopOrder.assignedDeliveryBoy?.location
          ?.coordinates || [];
        const deliveryBoyDefaultLat = toNumber(assignedUserCoords[1], null);
        const deliveryBoyDefaultLon = toNumber(assignedUserCoords[0], null);

        const live = liveLocation[shopOrder.assignedDeliveryBoy?._id] || null;

        return (
          <div
            className="bg-white p-4 rounded-2xl shadow-md border border-orange-300 space-y-4"
            key={index}
          >
            <div>
              <p className="text-lg font-bold mb-2 text-[#ff4d2d]">
                {shopOrder.shop.name}
              </p>
              <p className="font-semibold">
                <span>Items: </span>{" "}
                {shopOrder.shopOrderItems?.map((i) => i.name).join(", ")}
              </p>
              <p>
                <span className="font-semibold">SubTotal:</span>{" "}
                {shopOrder.subTotal}
              </p>
              <p className="mt-6">
                <span className="font-semibold">Delivery Address:</span>{" "}
                {currentOrder.deliveryAddress?.text}
              </p>
            </div>

            {shopOrder.status !== "delivered" ? (
              <>
                {shopOrder.assignedDeliveryBoy ? (
                  <div className="text-sm text-gray-700">
                    <p className="font-semibold">
                      <span>Delivery Boy Name: </span>
                      {shopOrder.assignedDeliveryBoy.fullName}
                    </p>
                    <p className="font-semibold">
                      <span>Delivery Boy Contact No. : </span>
                      {shopOrder.assignedDeliveryBoy.mobile}
                    </p>
                  </div>
                ) : (
                  <p className="font-semibold">Delivery Boy is not Assigned yet</p>
                )}
              </>
            ) : (
              <p className="text-green-600 font-semibold text-lg">Delivered</p>
            )}

            {shopOrder.assignedDeliveryBoy && shopOrder.status !== "delivered" && (
              <div className="h-[400px] w-full rounded-2xl overflow-hidden shadow-md">
                <DeliveryBoyTracking
                  data={{
                    deliveryBoyLocation:
                      live || { lat: deliveryBoyDefaultLat, lon: deliveryBoyDefaultLon },
                    customerLocation: { lat: customerLat, lon: customerLon },
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default TrackOrderPage;
