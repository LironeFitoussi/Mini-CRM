import React, { useState } from "react";
import axios from "axios";
import Header from "./components//Molecules/Header.jsx";

import { Outlet } from "react-router-dom";
import ImageUploader from "./components/ImageUploader";
import DisplayNumbers from "./components/DisplayNumbers";
const App = () => {
  const [qrCodeSrc, setQrCodeSrc] = useState(null); // State to store QR code image source
  const [error, setError] = useState(null); // State to handle errors

  // Handle login to WhatsApp
  const handleLoginToWhatsApp = () => {
    console.log("Logging in to WhatsApp...");
    
    // setError(null); // Reset error state
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/login-to-whatsapp`)
      .then((response) => {
        console.log(response);
        const { url: qrCodeUrl } = response.data;
        setQrCodeSrc(qrCodeUrl); // Set the QR code image source
      })
      .catch((error) => {
        console.error(error);
        // In Case of 400 status code, the user is already logged in
        if (error.response?.status === 400) {
          setError("User is already logged in.");
          return;
        }
        setError("Failed to load QR code. Please try again."); // Handle errors gracefully
      });
  };

  const handleLogout = () => {
    // API CALL TO LOGOUT
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/logout`)
      .then((response) => {
        console.log(response.data);
        alert("Logged out successfully");
      })
      .catch((error) => {
        console.error(error);
        alert("Failed to logout. Please try again.");
      });
    setQrCodeSrc(null); // Reset the QR code image source
    setError(null); // Reset error state
  }
  return (
    <div>
      <Header />
      { <Outlet /> }
      {/* <h1>WhatsApp Bot</h1> */}
      {/* <DisplayNumbers /> */}
      {/* <h1>Upload Images to S3</h1> */}
      {/* <ImageUploader /> */}
      {/* <button onClick={handleLoginToWhatsApp}>Login to WhatsApp</button>
      <button onClick={handleLogout}>Logout</button> */}
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
