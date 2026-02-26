import axios from 'axios';

// ============ BASE API INSTANCE ============
const BASE_URL = 'https://ttkd.vnptphuyen.vn:4488/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

// ============ ERROR HANDLER ============
const handleError = (error, apiName) => {
  console.error(`Error in ${apiName}:`, error);
  throw error;
};

// ============ SANLUONG API METHODS ============

/**
 * Lấy danh sách chi tiết số lượng chưa lên gói
 * @param {string} hrm_code - Mã nhân viên
 * @param {string} fromDate - Từ ngày (dd/MM/yyyy)
 * @param {string} toDate - Đến ngày (dd/MM/yyyy)
 */
export const getChiTietChuaGoi = async (hrm_code, fromDate, toDate) => {
  try {
    const response = await apiClient.post('/DynamicQuery/execute', {
      databaseType: 'sql',
      functionName: 'POWERBI.DBO.TEST_SOLUONG_CHUALEN_GOI_CHITIET',
      parameters: {
        hrm_code: hrm_code,
        tu_ngay: fromDate,
        den_ngay: toDate,
      },
      isRawSql: false,
    });
    return response.data;
  } catch (error) {
    handleError(error, 'getChiTietChuaGoi');
  }
};

/**
 * Lấy danh sách chi tiết số lượng (đã có doanh thu)
 * @param {string} hrm_code - Mã nhân viên
 * @param {string} fromDate - Từ ngày (dd/MM/yyyy)
 * @param {string} toDate - Đến ngày (dd/MM/yyyy)
 */
export const getChiTietSoLuong = async (hrm_code, fromDate, toDate) => {
  try {
    const response = await apiClient.post('/DynamicQuery/execute', {
      databaseType: 'sql',
      functionName: 'POWERBI.DBO.TEST_CHITIET_SOLUONG',
      parameters: {
        hrm_code: hrm_code,
        tu_ngay: fromDate,
        den_ngay: toDate,
      },
      isRawSql: false,
    });
    return response.data;
  } catch (error) {
    handleError(error, 'getChiTietSoLuong');
  }
};

