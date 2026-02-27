import axios from 'axios';

// ============ BASE API INSTANCE ============
const LOCAL_API = 'https://localhost:7299/api';

const authClient = axios.create({
  baseURL: LOCAL_API,
  timeout: 30000,
});

// ============ ERROR HANDLER ============
const handleError = (error, apiName) => {
  console.error(`Error in ${apiName}:`, error);
  throw error;
};

// ============ AUTHENTICATION API METHODS ============

/**
 * Đăng nhập hệ thống
 * @param {string} username - Tên đăng nhập
 * @param {string} password - Mật khẩu
 * @param {boolean} tapDoan - true: Tài khoản Tập đoàn, false: Tài khoản OneBSS (đảo ngược logic isOnebss)
 */
export const login = async (username, password, tapDoan) => {
  try {
    const response = await authClient.post('/Authentication/login', {
      username,
      password,
      tapDoan
    });
    return response.data;
  } catch (error) {
    handleError(error, 'login');
  }
};

/**
 * Xác thực OTP
 * @param {string} username - Tên đăng nhập
 * @param {string} otp - Mã OTP
 * @param {string} secretCode - Mã bí mật
 */
export const verifyOtp = async (username, otp, secretCode) => {
  try {
    const response = await authClient.post('/Authentication/verify-otp', {
      username,
      otp,
      secretCode
    });
    return response.data;
  } catch (error) {
    handleError(error, 'verifyOtp');
  }
};

export default {
  login,
  verifyOtp
};
