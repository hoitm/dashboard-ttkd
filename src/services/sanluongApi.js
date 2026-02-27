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

/**
 * Lấy danh sách tổng hợp số lượng chưa lên gói
 * @param {string} fromDate - Từ ngày (dd/MM/yyyy)
 * @param {string} toDate - Đến ngày (dd/MM/yyyy)
 */
export const getSoLuongChuaLenGoiTongHop = async (fromDate, toDate) => {
  try {
    const response = await apiClient.post('/DynamicQuery/execute', {
      databaseType: 'sql',
      functionName: 'POWERBI.DBO.TEST_SOLUONG_CHUALEN_GOI_TONGHOP',
      parameters: {
        tu_ngay: fromDate,
        den_ngay: toDate,
      },
      isRawSql: false,
    });
    return response.data;
  } catch (error) {
    handleError(error, 'getSoLuongChuaLenGoiTongHop');
  }
};

/**
 * Lấy thống kê số lượng và doanh thu (Dashboard CHITIET)
 * @param {string} fromDate - Từ ngày (dd/MM/yyyy)
 * @param {string} toDate - Đến ngày (dd/MM/yyyy)
 */
export const getThongKeSoLuongDoanhThu = async (fromDate, toDate) => {
  try {
    const response = await apiClient.post('/DynamicQuery/execute', {
      databaseType: 'sql',
      functionName: 'POWERBI.DBO.TEST_TM_SOLUONG_DT',
      parameters: {
        tu_ngay: fromDate,
        den_ngay: toDate,
      },
      isRawSql: false,
    });
    return response.data;
  } catch (error) {
    handleError(error, 'getThongKeSoLuongDoanhThu');
  }
};

/**
 * Lấy danh sách thuê bao phát triển theo loại hình và ngày sử dụng (Query trực tiếp)
 * @param {number} loaiTbId - ID loại thuê bao
 * @param {string} fromDate - Từ ngày (dd/MM/yyyy)
 * @param {string} toDate - Đến ngày (dd/MM/yyyy)
 */
export const getThueBaoPhatTrien = async (loaiTbId, fromDate, toDate) => {
  try {
    const response = await apiClient.post('/DynamicQuery/execute', {
      databaseType: 'sql',
      functionName: `SELECT dv.TEN_DV, a.MA_TB, ma_tt, tt.TEN_TT ,a.TEN_TB  FROM css.V_DB_THUEBAO a  JOIN css.V_DB_THANHTOAN  tt ON a.THANHTOAN_ID = tt.THANHTOAN_ID JOIN ADMIN.V_DONVI dv ON tt.DONVI_ID = dv.DONVI_ID WHERE a.LOAITB_ID = @loaitb_id     AND  a.NGAY_SD >= TRY_CONVERT(DATE, @tu_ngay, 103) AND  a.NGAY_SD <= TRY_CONVERT(DATE, @den_ngay, 103)`,
      parameters: {
        loaitb_id: loaiTbId,
        tu_ngay: fromDate,
        den_ngay: toDate,
      },
      isRawSql: true,
    });
    return response.data;
  } catch (error) {
    handleError(error, 'getThueBaoPhatTrien');
  }
};

