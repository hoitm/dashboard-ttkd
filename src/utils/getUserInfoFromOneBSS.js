import axios from 'axios';

export async function fetchOneBSSUserInfo(token) {
  try {
    const response = await axios.post(
      'https://api-onebss.vnpt.vn/quantri/user/thongtin_nguoidung2',
      {}, // body rỗng
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    const userInfo = response.data?.data;

    if (userInfo) {
      localStorage.setItem('user_info_onebss', JSON.stringify(userInfo));
      console.log('✅ Lưu thông tin người dùng OneBSS thành công!');
    } else {
      console.warn('⚠️ Không lấy được thông tin người dùng từ OneBSS.');
    }

    return userInfo;
  } catch (error) {
    console.error('❌ Lỗi lấy thông tin người dùng OneBSS:', error);
    return null;
  }
}
