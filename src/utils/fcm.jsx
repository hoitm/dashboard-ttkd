// src/utils/fcm.jsx
import { messaging } from '../firebase/firebase-config';
import { getToken, onMessage } from 'firebase/messaging';
import axios from 'axios';
import { toast } from 'react-toastify'; // ✅ import toast UI

export async function requestPermission(userInfo) {

    if (!userInfo?.nhanvien_id) {
        console.warn("❌ Không có thông tin nhân viên để đăng ký FCM");
        return;
      }
  console.log("🔔 Yêu cầu quyền gửi thông báo...");

  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    try {
    
      const token = await getToken(messaging, {
        vapidKey: 'BMBAnzML9hnO7SyLdW8szSsRIMWNvEcZmKVvVzI_-j9h8JLDCQkF1_9zZhLFmFvAdqQqdx2_ENl7f1cK_1vr4eQ'
      });

      console.log('✅ FCM Token:', token);
      if (token) {
        //web-dhsxkd-online-update-fcm
        //Gửi token lên server
        try {
          let data = JSON.stringify({
            "nhanvien_id":  String(userInfo.nhanvien_id), // ✅ ép kiểu sang string,
            "fcm_token": token
          });
         
         let config = {
           method: 'post',
           maxBodyLength: Infinity,
           url: 'https://ttkd.vnptphuyen.vn:4488/api/AppOnline/web-dhsxkd-online-update-fcm',
           headers: { 
             'Content-Type': 'application/json' 
           },
           data : data
         };     
         axios.request(config)
         .then((response) => {
           console.log(JSON.stringify(response.data));
           //setSims( response.data); // Thêm sim mới vào danh sách);
         })
         .catch((error) => {
           console.log(error);
         });
         } catch (error) {
           console.error('Error fetching sims:', error);
         }
      }


      // 🔁 TODO: Gửi token về server lưu
      /*

            await fetch('https://your-api.com/api/save-fcm-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
        });

      */
        // 👇 Bắt foreground message

        // Chỉ xử lý toast nếu đang mở tab
        onMessage(messaging, (payload) => {
          const { title, body } = payload.notification || {};
          const url = payload.data?.url || '/';
          const ma_tb = payload.data?.ma_tb;
          const image = payload.data?.urlimage;
          const forNhanVienId = payload.data?.nhanvien_id;
          const fullUrl = ma_tb ? `${url}?ma_tb=${ma_tb}` : url;

          if (String(userInfo.nhanvien_id) !== String(forNhanVienId)) {
            console.warn("👤 Nhân viên không khớp, bỏ qua");
            return;
          }

          if (document.visibilityState === 'visible') {
            toast.info(
              <div onClick={() => window.open(fullUrl, '_blank')} style={{ cursor: 'pointer' }}>
                <b>{title}</b>
                <div>{body}</div>
                {image && <img src={image} alt="preview" style={{ marginTop: 8, borderRadius: 8, width: '100%' }} />}
              </div>,
              {
                autoClose: 8000,
                position: 'top-right'
              }
            );
          }
        });

        } catch (err) {
        console.error("❌ Lỗi lấy token FCM:", err);
        }
      }
    }
  
/*

        onMessage(messaging, (payload) => {
            console.log("📨 Nhận thông báo foreground:", payload);
    
            const { title, body } = payload.notification || {};
            const url = payload.data?.url || '/';
            const ma_tb = payload.data?.ma_tb;
            const forNhanVienId = payload.data?.nhanvien_id;
            const fullUrl = ma_tb ? `${url}?ma_tb=${ma_tb}` : url;
              // ✅ Chỉ hiển thị nếu đúng nhân viên
              console.warn("👤 "+ userInfo.nhanvien_id);
        if (String(userInfo.nhanvien_id) !== String(forNhanVienId)) {
            console.warn("👤 Nhân viên không trùng khớp, bỏ qua notify");
            return;
          }

            // 🔁 Nếu user đang active tab, show toast
        if (document.visibilityState === 'visible') {
            toast.info(`🔔 ${title}: ${body}\n(Nhấn để mở)`, {
                autoClose: 7000,
                position: 'top-right',
                onClick: () => window.open(fullUrl, '_blank'),
              });
          }
          else {
            const notification = new Notification(title || 'Thông báo', {
                body: body || 'Bạn có một thông báo mới!',
                icon: '/pwa-192.png', // icon custom nếu có

                data: { url: fullUrl }
              });
      
              notification.onclick = function (event) {
                event.preventDefault();
                window.open(fullUrl, '_blank'); // mở tab mới (hoặc dùng `location.href = ...`)
              };
          }
           
          });

    } catch (err) {
      console.error("❌ Không lấy được token FCM:", err);
    }
  } else {
    console.warn('❌ Người dùng từ chối nhận push notification');
  }
}
*/