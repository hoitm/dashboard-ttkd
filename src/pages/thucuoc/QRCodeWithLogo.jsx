// File: QRCodeWithLogo.jsx
import React from "react";
import { QRCode } from "react-qrcode-logo"; // npm install react-qrcode-logo

const QRCodeWithLogo = ({ qrValue }) => {
  return (
    <QRCode
      value={qrValue}
      size={280}
      logoImage="/logo-vnpt.png" // Đặt logo vào public/vnpt-logo.png
      logoWidth={60}
      logoHeight={60}
      quietZone={10}
      eyeRadius={5}
    />
  );
};

export default QRCodeWithLogo;
