import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import LiveTrackingMap from "../components/LiveTrackingMap";

export default function PickupTrackUser() {
  const { requestId } = useParams();
  const [coords, setCoords] = useState(null);

  const fetchUserLocation = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/auth/request/${requestId}`
      );

      const address = res.data.pickupLocation;

      const geo = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        {
          params: { q: address, format: "json", limit: 1 },
        }
      );

      if (geo.data.length > 0) {
        setCoords({
          latitude: parseFloat(geo.data[0].lat),
          longitude: parseFloat(geo.data[0].lon),
        });
      }
    } catch (err) {
      console.error("Error fetching user address:", err);
    }
  };

  useEffect(() => {
    fetchUserLocation();
  }, []);

  if (!coords)
    return <p style={{ textAlign: "center" }}>Loading user address…</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>User Pickup Address</h2>

      <LiveTrackingMap
        latitude={coords.latitude}
        longitude={coords.longitude}
        label="User Pickup Location"
      />
    </div>
  );
}
