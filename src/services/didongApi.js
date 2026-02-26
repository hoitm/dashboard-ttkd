import axios from 'axios';

// ============ BASE API INSTANCE ============
const BASE_URL = 'https://ttkd.vnptphuyen.vn:4488/api';
const LOCAL_API = 'https://localhost:7299/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

const localApiClient = axios.create({
  baseURL: LOCAL_API,
  timeout: 30000,
});

// ============ ERROR HANDLER ============
const handleError = (error, apiName) => {
  console.error(`Error in ${apiName}:`, error);
  throw error;
};

// ============ DIDONG API METHODS ============

/**
 * Phân tích doanh thu Di Động theo PSC - Theo tháng (2025)
 * @param {string} thang - Format: 'YYYYMM' (e.g., '202501')
 */
export const getDoanhthuPSC2025 = async (thang) => {
  try {
    const response = await localApiClient.post('DynamicQuery/execute', {
      databaseType: 'sql',
      functionName: 'bsc_pyn.dbo.WEB_DISPLAY_PHANTICH_DDTS_THEOMAU_2025_DM_WEB',
      parameters: { thang },
      isRawSql: false,
    });
    return response.data;
  } catch (error) {
    handleError(error, 'getDoanhthuPSC2025');
  }
};

/**
 * Doanh thu gia hạn OB - Phú Yên
 * @param {string} tu_ngay - Format: 'dd/MM/yyyy'
 * @param {string} den_ngay - Format: 'dd/MM/yyyy'
 */
export const getDoanhThuGiaHanOB_PhuYen = async (tu_ngay, den_ngay) => {
  try {
    const response = await apiClient.post('DynamicQuery/execute', {
      databaseType: 'sql',
      functionName: 'BSC_PYN.DBO.WEB_DOANHTHU_GIAHAN_OBCCOS',
      parameters: { tu_ngay, den_ngay },
      isRawSql: false,
    });
    return response.data;
  } catch (error) {
    handleError(error, 'getDoanhThuGiaHanOB_PhuYen');
  }
};

/**
 * Doanh thu gia hạn OB - Đắk Lắk
 * @param {string} tu_ngay - Format: 'dd/MM/yyyy'
 * @param {string} den_ngay - Format: 'dd/MM/yyyy'
 */
export const getDoanhThuGiaHanOB_DakLak = async (tu_ngay, den_ngay) => {
  try {
    const response = await apiClient.post('DynamicQuery/execute', {
      databaseType: 'sql',
      functionName: 'BSC_PYN.DBO.WEB_DOANHTHU_GIAHAN_OBCCOS_dlk',
      parameters: { tu_ngay, den_ngay },
      isRawSql: false,
    });
    return response.data;
  } catch (error) {
    handleError(error, 'getDoanhThuGiaHanOB_DakLak');
  }
};

/**
 * Lấy cả hai dữ liệu OB (PhuYen + DakLak)
 */
export const getDoanhThuGiaHanOB_Both = async (tu_ngay, den_ngay) => {
  try {
    const [dataPY, dataDLK] = await Promise.all([
      getDoanhThuGiaHanOB_PhuYen(tu_ngay, den_ngay),
      getDoanhThuGiaHanOB_DakLak(tu_ngay, den_ngay),
    ]);
    return { dataPY, dataDLK };
  } catch (error) {
    handleError(error, 'getDoanhThuGiaHanOB_Both');
  }
};

/**
 * Phân tích doanh thu di động theo tháng
 * @param {object} params - { thang: 'YYYYMM', ... }
 */
export const getPhanTichDiDongTheoThang = async (params) => {
  try {
    const response = await apiClient.post('DynamicQuery/execute', {
      databaseType: 'sql',
      functionName: 'bsc_pyn.dbo.WEB_PHANTICH_DDONG_THEO_THANG',
      parameters: params,
      isRawSql: false,
    });
    return response.data;
  } catch (error) {
    handleError(error, 'getPhanTichDiDongTheoThang');
  }
};

/**
 * Phân tích doanh thu di động theo BTS
 * @param {object} params - Các tham số cần thiết
 */
export const getPhanTichDiDongTheoBTS = async (params) => {
  try {
    const response = await apiClient.post('DynamicQuery/execute', {
      databaseType: 'sql',
      functionName: 'bsc_pyn.dbo.WEB_PHANTICH_DDONG_THEO_BTS',
      parameters: params,
      isRawSql: false,
    });
    return response.data;
  } catch (error) {
    handleError(error, 'getPhanTichDiDongTheoBTS');
  }
};

/**
 * Phân tích chi tiết BTS theo ngày
 * @param {object} params - { ngay: 'dd/MM/yyyy', ... }
 */
export const getChiTietBTS_Ngay = async (params) => {
  try {
    const response = await apiClient.post('DynamicQuery/execute', {
      databaseType: 'sql',
      functionName: 'bsc_pyn.dbo.WEB_CHITIET_BTS_NGAY',
      parameters: params,
      isRawSql: false,
    });
    return response.data;
  } catch (error) {
    handleError(error, 'getChiTietBTS_Ngay');
  }
};

/**
 * Gọi API động với functionName tùy ý
 * @param {string} functionName - Tên function
 * @param {object} parameters - Các tham số
 * @param {string} baseURL - Optional: 'local' hoặc 'production'
 */
export const executeDynamicQuery = async (functionName, parameters, baseURL = 'production') => {
  try {
    const client = baseURL === 'local' ? localApiClient : apiClient;
    const response = await client.post('DynamicQuery/execute', {
      databaseType: 'sql',
      functionName,
      parameters,
      isRawSql: false,
    });
    return response.data;
  } catch (error) {
    handleError(error, `executeDynamicQuery - ${functionName}`);
  }
};

export default {
  getDoanhthuPSC2025,
  getDoanhThuGiaHanOB_PhuYen,
  getDoanhThuGiaHanOB_DakLak,
  getDoanhThuGiaHanOB_Both,
  getPhanTichDiDongTheoThang,
  getPhanTichDiDongTheoBTS,
  getChiTietBTS_Ngay,
  executeDynamicQuery,
};
