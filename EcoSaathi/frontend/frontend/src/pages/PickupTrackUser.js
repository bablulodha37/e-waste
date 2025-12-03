import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api";
import PickupLiveSender from "../components/PickupLiveSender";

export default function PickupTrackUser() {
  const { requestId } = useParams();
  const user = JSON.parse(localStorage.getItem("user"));
  const [url, setUrl] = useState(null);

  const fetchUrl = async () => {
    try {
      const data = await api(`/api/pickup/request/${requestId}/pickup-location`);
      setUrl(data.googleMapsUrl);

      // 🔥 Open in a new tab
      window.open(data.googleMapsUrl, "_blank");
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUrl();
  }, [requestId]);

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <PickupLiveSender pickupPersonId={user.id} />
      <h2>Opening Google Maps...</h2>
      <p>If Google Maps didn’t open, <a href={url} target="_blank">click here</a>.</p>
    </div>
  );
}
