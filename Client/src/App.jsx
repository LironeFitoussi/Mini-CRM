import React, { useState } from "react";
import ImageUploader from "./components/ImageUploader";
import axios from "axios";
import DisplayNumbers from "./components/DisplayNumbers";
const App = () => {
  const [qrCodeSrc, setQrCodeSrc] = useState(null); // State to store QR code image source
  const [error, setError] = useState(null); // State to handle errors

  // Handle login to WhatsApp
  const handleLoginToWhatsApp = () => {
    setError(null); // Reset error state
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/login-to-whatsapp`)
      .then((response) => {
        const { url: qrCodeUrl } = response.data;
        setQrCodeSrc(qrCodeUrl); // Set the QR code image source
      })
      .catch((error) => {
        console.error(error);
        setError("Failed to load QR code. Please try again."); // Handle errors gracefully
      });
  };

  return (
    <div>
      <DisplayNumbers />
      {/* <h1>Upload Images to S3</h1> */}
      {/* <ImageUploader /> */}
      {/* <button onClick={handleLoginToWhatsApp}>Login to WhatsApp</button> */}

      {/* Display the QR code or an error message */}

      {qrCodeSrc ? (
        <div>
          <h2>Scan the QR Code</h2>
          <img src={qrCodeSrc} alt="WhatsApp QR Code" />
        </div>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : null}
    </div>
  );
};

export default App;
