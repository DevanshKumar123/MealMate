import axios from "axios";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { FaPhoneAlt } from "react-icons/fa";
import { updateOrderStatus } from "../redux/userSlice";
import { serverUrl } from "../App";

function OwnerOrderCard({ data }) {
  const [availableBoys, setAvailableBoys] = useState([]);
  const dispatch = useDispatch();
  const shopOrder = data?.shopOrders?.[0];

  const handleUpdateStatus = async (orderId, shopId, status) => {
    try {
      const result = await axios.post(
        `${serverUrl}/api/order/update-status/${orderId}/${shopId}`,
        { status },
        { withCredentials: true }
      );
      dispatch(updateOrderStatus({ orderId, shopId, status }));
      setAvailableBoys(result.data.availableBoys);
      console.log(result.data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">
          {data?.user?.fullName || "Unknown User"}
        </h2>
        <p className="text-sm text-gray-500">{data?.user?.email}</p>
        <p className="flex items-center gap-2 text-sm text-gray-600 mt-1">
          <FaPhoneAlt />
          <span>{data?.user?.mobile || "NA"}</span>
        </p>
        {data.paymentMethod == "online" ? <p className="gap-2 text-sm text-gray-600">Payment : {data.payment ? "true" : "false"}</p> : <p className="gap-2 text-sm text-gray-600">Payment Method : {data.paymentMethod}</p>}
      </div>

      <div className="flex items-start flex-col gap-2 text-gray-600 text-sm">
        <p>
          {data?.deliveryAddress?.text || "NO DELIVERY ADDRESS IS PROVIDED!!"}
        </p>
        <p className="text-xs text-gray-500">
          Lat: {data?.deliveryAddress?.latitude ?? "NA"}, Lon:{" "}
          {data?.deliveryAddress?.longitude ?? "NA"}
        </p>
      </div>

      <div className="flex space-x-4 overflow-x-auto pb-2">
        {(shopOrder?.shopOrderItems || []).map((item, index) => (
          <div
            key={index}
            className="flex-shrink-0 w-40 border rounded-lg p-2 bg-white"
          >
            <img
              src={item?.item?.image}
              alt=""
              className="w-full h-24 object-cover rounded"
            />
            <p className="text-sm font-semibold mt-1">{item?.name}</p>
            <p className="text-xs text-gray-500">
              Qty: {item?.quantity} x ₹{item?.price}
            </p>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-100">
        <span className="text-sm">
          Status:{" "}
          <span className="font-semibold capitalize text-[#ff4d2d]">
            {shopOrder?.status || "pending"}
          </span>
        </span>

        <select
          className="rounded-md border px-3 py-1 text-sm focus:outline-none focus:ring-2 border-[#ff4d2d] text-[#ff4d2d]"
          onChange={(e) =>
            handleUpdateStatus(data?._id, shopOrder?.shop?._id, e.target.value)
          }
        >
          <option value="">Change</option>
          <option value="pending">Pending</option>
          <option value="preparing">Preparing</option>
          <option value="out of delivery">Out for Delivery</option>
        </select>
      </div>

      {shopOrder?.status === "out of delivery" && (
        <div className="mt-3 p-2 border rounded-lg text-sm bg-orange-50">
          {/* {data.shopOrders?.assignedDeliveryBoy ? <p>Assigned Delivery Boys :</p> : <p>Available Delivery Boys :</p>}
          {availableBoys?.length > 0 ? (
            availableBoys.map((b, index) => (
              <div key={index}>
                {b.fullName} - {b.mobile}
              </div>
            ))
          ) : 
          (
            data.shopOrders?.assignedDeliveryBoy?<div>{data.shopOrders.assignedDeliveryBoy.fullName} - {data.shopOrders.assignedDeliveryBoy.mobile}</div>
            :
            <div>Waiting For Delivery Boys To Accept</div>
          )} */}
          {shopOrder?.assignedDeliveryBoy ? (
            <p>Assigned Delivery Boy :</p>
          ) : (
            <p>Available Delivery Boys :</p>
          )}

          {shopOrder?.assignedDeliveryBoy ? (
            <div>
              {shopOrder.assignedDeliveryBoy.fullName} -{" "}
              {shopOrder.assignedDeliveryBoy.mobile}
            </div>
          ) : availableBoys?.length > 0 ? (
            availableBoys.map((b, index) => (
              <div key={index}>
                {b.fullName} - {b.mobile}
              </div>
            ))
          ) : (
            <div>Waiting For Delivery Boys To Accept</div>
          )}
        </div>
      )}

      <div className="text-right font-bold text-gray-800 text-sm">
        Total: ₹{shopOrder?.subTotal || 0.0}
      </div>
    </div>
  );
}

export default OwnerOrderCard;
