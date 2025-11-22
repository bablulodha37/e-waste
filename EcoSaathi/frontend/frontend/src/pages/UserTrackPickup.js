import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from '../api';
import LiveTrackingMap from "../components/LiveTrackingMap";
export default function UserTrackPickup() {
  const { requestId } = useParams();
  const [pickup, setPickup] = useState(null);
  const fetchPickupLocation = async () => {
    try {
      const data = await api(`/api/pickup/request/${requestId}/pickup-location`);
      setPickup(data);
    } catch (err) {
      console.error("Error fetching pickup location:", err);
    }
  };
  useEffect(() => {
    fetchPickupLocation();
    const interval = setInterval(fetchPickupLocation, 4000);
    return () => clearInterval(interval);
  }, [requestId]);
  if (!pickup) return <p style={{ textAlign: "center" }}>Loading pickup location…</p>;
  return (
    <div style={{ padding: "20px" }}>
      <h2>🚛 Pickup Person Live Location</h2>
      <p><strong>Name:</strong> {pickup.name}</p>
      <LiveTrackingMap latitude={pickup.latitude} longitude={pickup.longitude} label={pickup.name} />
    </div>
  );
}
