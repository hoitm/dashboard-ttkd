// File: ThermalPrinterPT210.jsx
import React from 'react';
import EscPosEncoder from 'esc-pos-encoder';

export default function ThermalPrinterPT210() {
  const handlePrint = async () => {
    try {
      // 1. Tìm thiết bị Bluetooth
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: 'PT' }],
        optionalServices: [0xFFE0], // Dịch vụ serial/Bluetooth
      });

      const server = await device.gatt.connect();
      const service = await server.getPrimaryService(0xFFE0);
      const characteristic = await service.getCharacteristic(0xFFE1);

      // 2. Tạo nội dung in (ESC/POS)
      const encoder = new EscPosEncoder();
      const result = encoder
        .initialize()
        .text("VNPT - Vinaphone Phú Yên")
        .newline()
        .text("Mã thanh toán: 12345678")
        .newline()
        .newline()
        .cut()
        .encode();

      // 3. Gửi lệnh đến máy in
      await characteristic.writeValue(new Uint8Array(result));
      alert("In thành công!");

    } catch (error) {
      console.error("Lỗi khi in:", error);
      alert("Không thể kết nối máy in. Hãy đảm bảo đã bật Bluetooth và máy in đang hoạt động.");
    }
  };

  return (
    <div className="p-4 text-center">
      <h2>In hóa đơn với máy PT210</h2>
      <button onClick={handlePrint} className="bg-blue-600 text-white px-4 py-2 rounded">
        In ngay
      </button>
    </div>
  );
}
