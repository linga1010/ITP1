// PaymentPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import './Location.css'

const PaymentPage = () => {
  const [location, setLocation] = useState(null);
  const navigate = useNavigate();

  // This function handles the map click to get the location.
  const LocationMarker = () => {
    const map = useMapEvents({
      click(event) {
        const { lat, lng } = event.latlng;
        setLocation({ lat, lng });
        map.flyTo(event.latlng, map.getZoom());
      },
    });

    return location === null ? null : (
      <Marker position={location}>
        <Popup>You are here</Popup>
      </Marker>
    );
  };

  // Navigate to the Payment Details page on click
  const handleNext = () => {
    if (location) {
      // You can save location data via API here if needed
      navigate("/payment-details", { state: { location } });
    } else {
      alert("Please select your location on the map.");
    }
  };

  return (
    <div className="payment-container">
      <h2>Payment Page</h2>
      <div style={{ height: "500px", width: "100%" }}> {/* Adjusted the height and width */}
        <MapContainer
          center={[9.6615, 80.0220]} // Center of Jaffna, Sri Lanka
          zoom={12} // Adjust zoom to suit Jaffna's view
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%" }} // Ensures the map takes up the full space
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <LocationMarker />
        </MapContainer>
      </div>
      <button onClick={handleNext}>Next</button>
    </div>
  );
};

export default PaymentPage;
