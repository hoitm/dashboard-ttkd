import { useEffect } from 'react';
import axios from 'axios';
import {
  saveLocationOffline,
  getAllOfflineLocations,
  clearAllOfflineLocations,
} from './locationStorage';

const GEO_INTERVAL_MINUTES = 15;

export default function LocationTracker({ nhanvien_id }) {
  useEffect(() => {
    const sendLocation = () => {
      if (!navigator.geolocation) {
        console.warn("⚠️ Trình duyệt không hỗ trợ Geolocation");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;

          const payload = {
            databaseType: 'sql',
            functionName: 'miniapp.dbo.la_test',
            parameters: {
              NhanVienId: nhanvien_id.toString(),
              Latitude: latitude.toString(),
              Longitude: longitude.toString(),
              timestamp: new Date().toLocaleString(), // Hoặc dùng toLocaleString nếu muốn giờ VN
            },
            isRawSql: false,
          };

          const config = {
            method: 'post',
            url: 'https://ttkd.vnptphuyen.vn:4488/api/DynamicQuery/nonquery',
            headers: { 'Content-Type': 'application/json' },
            data: JSON.stringify(payload),
          };

          if (navigator.onLine) {
            try {
              const res = await axios.request(config);
              console.log('✅ Gửi thành công:', res.data);
            } catch (err) {
              console.warn('❌ Gửi thất bại, lưu offline:', err.message);
              await saveLocationOffline(payload);
            }
          } else {
            console.log('📴 Không có mạng, lưu offline');
            await saveLocationOffline(payload);
          }
        },
        (err) => {
          console.error('❌ Lỗi lấy vị trí:', err.message);
        },
        { enableHighAccuracy: true }
      );
    };

    // Gửi ngay khi load
    sendLocation();

    // Gửi định kỳ mỗi X phút
    const interval = setInterval(sendLocation, GEO_INTERVAL_MINUTES * 60 * 1000);

    // Khi có mạng trở lại → sync offline
    const handleOnline = async () => {
      const cached = await getAllOfflineLocations();
      for (let item of cached) {
        try {
          await axios.request({
            method: 'post',
            url: 'https://ttkd.vnptphuyen.vn:4488/api/DynamicQuery/nonquery',
            headers: { 'Content-Type': 'application/json' },
            data: JSON.stringify(item),
          });
          console.log('📤 Đồng bộ lại thành công 1 vị trí offline');
        } catch (err) {
          console.warn('❌ Lỗi khi sync lại:', err.message);
        }
      }
      await clearAllOfflineLocations();
    };

    window.addEventListener('online', handleOnline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
    };
  }, [nhanvien_id]);

  return null;
}
