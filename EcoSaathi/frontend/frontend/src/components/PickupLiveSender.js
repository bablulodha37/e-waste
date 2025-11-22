import { useEffect } from "react";
import axios from "axios";

export default function PickupLiveSender({ pickupPersonId }) {
  useEffect(() => {
    console.log("📡 PickupLiveSender mounted for ID =", pickupPersonId);

    const sendLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;

          console.log("➡️ Sending location to backend:", lat, lon);

          axios.put(
  `http://localhost:8080/api/pickup/location/update/${pickupPersonId}?latitude=${lat}&longitude=${lon}`
)


            .then(() => console.log("✔ Location Updated"))
            .catch((err) => console.error("❌ Backend Error:", err));
        },
        (err) => {
          console.log("❌ GPS ERROR:", err);
        }
      );
    };

    sendLocation();
    const interval = setInterval(sendLocation, 5000);

    return () => clearInterval(interval);
  }, [pickupPersonId]);

  return null;
}
