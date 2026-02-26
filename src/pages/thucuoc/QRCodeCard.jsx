// File: QRCodeCard.jsx
import React from "react";
import QRCodeWithLogo from "./QRCodeWithLogo";

const QRCodeCard = ({ ma_tt, ten_kh, qr_code_value }) => {
  return (
    <div
      style={{
        width: 400,
        backgroundColor: "#0072CE",
        color: "white",
        padding: "24px",
        fontFamily: "Arial",
        borderRadius: "8px",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <h3 style={{ margin: 0 }}>Kính mời Quý khách Quét mã QR Code để</h3>
        <h2 style={{ margin: 0, color: "#ffffff" }}>
          <b>THANH TOÁN CƯỚC VIỄN THÔNG HÀNG THÁNG</b>
        </h2>
      </div>

      <div
        style={{
          backgroundColor: "white",
          padding: 16,
          borderRadius: 8,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <QRCodeWithLogo qrValue={qr_code_value} />
      </div>

      <div
        style={{
          backgroundColor: "#ffffff",
          color: "#000",
          borderRadius: 8,
          padding: "8px 16px",
          marginTop: 16,
        }}
      >
        <p>
          <b>Mã t/toán:</b> {ma_tt}
        </p>
        <p>
          <b>Tên KH:</b> {ten_kh}
        </p>
      </div>

      <div
        style={{
          backgroundColor: "#ffffff",
          color: "#0072CE",
          textAlign: "center",
          borderRadius: 24,
          marginTop: 16,
          padding: "8px 0",
          fontWeight: "bold",
        }}
      >
        📞 1800 1166 – Tổng đài tư vấn miễn phí
      </div>

      <p style={{ fontSize: 12, marginTop: 8, color: "#fff", textAlign: "center" }}>
        *Quý khách nhận được tin nhắn SMS/ZALO xác nhận thanh toán ngay khi quét mã QR thành công
      </p>
    </div>
  );
};

export default QRCodeCard;
