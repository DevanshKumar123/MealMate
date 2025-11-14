import React from "react";
import scooter from "../assets/scooter.png";
import home from "../assets/home.png";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";

const deliveryBoyIcon = new L.Icon({
  iconUrl: scooter,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});
const customerIcon = new L.Icon({
  iconUrl: home,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

function toNumber(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function DeliveryBoyTracking({ data }) {
  // defensively read coords and ensure correct lat/lon mapping
  const deliveryBoyLat = toNumber(data?.deliveryBoyLocation?.lat, 0);
  const deliveryBoyLon = toNumber(data?.deliveryBoyLocation?.lon, 0);

  const customerLat = toNumber(data?.customerLocation?.lat, 0);
  const customerLon = toNumber(data?.customerLocation?.lon, 0); // fixed: was using lat twice

  // center map between points if possible, otherwise use delivery boy
  const centerLat =
    deliveryBoyLat !== 0 ? deliveryBoyLat : customerLat !== 0 ? customerLat : 20;
  const centerLon =
    deliveryBoyLon !== 0 ? deliveryBoyLon : customerLon !== 0 ? customerLon : 78;

  const path = [
    [deliveryBoyLat, deliveryBoyLon],
    [customerLat, customerLon],
  ];

  const center = [centerLat, centerLon];

  return (
    <div className="w-full h-[400px] mt-3 rounded-xl overflow-hidden shadow-md">
      <MapContainer className={"w-full h-full"} center={center} zoom={13}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[deliveryBoyLat, deliveryBoyLon]} icon={deliveryBoyIcon}>
          <Popup>Delivery Boy</Popup>
        </Marker>
        <Marker position={[customerLat, customerLon]} icon={customerIcon}>
          <Popup>Customer</Popup>
        </Marker>

        <Polyline positions={path} color="blue" weight={4} />
      </MapContainer>
    </div>
  );
}

export default DeliveryBoyTracking;
