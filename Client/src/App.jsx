import React, { useState } from "react";
import axios from "axios";
import Header from "./components//Molecules/Header.jsx";

import { Outlet } from "react-router-dom";
import ImageUploader from "./components/ImageUploader";
import DisplayNumbers from "./components/DisplayNumbers";
const App = () => {
  const [qrCodeSrc, setQrCodeSrc] = useState(null); // State to store QR code image source
  const [error, setError] = useState(null); // State to handle errors
  return (
    <div>
      <Header />
      <Outlet />
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
