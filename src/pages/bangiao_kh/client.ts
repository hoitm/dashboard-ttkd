// api/client.ts
import axios from "axios";
export const api = axios.create({
  baseURL: "https://ttkd.vnptphuyen.vn:4488/api/semihuy/",
  timeout: 500000,
});
// (tuỳ chọn) đảm bảo nếu nơi khác set thiếu thì tự bổ sung 2 phút
api.interceptors.request.use((cfg) => {
  if (cfg.timeout == null) cfg.timeout = 10 * 60 * 1000;
  return cfg;
});

/*
    export const api = axios.create({
      baseURL: import.meta.env.VITE_API_URL ?? "https://ttkd.vnptphuyen.vn:4488/api/semihuy/",
      timeout: 2 * 60 * 1000, // ✅ 120000 ms = 2 phút (mặc định toàn cục cho instance)
    });

    // (tuỳ chọn) đảm bảo nếu nơi khác set thiếu thì tự bổ sung 2 phút
    api.interceptors.request.use((cfg) => {
      if (cfg.timeout == null) cfg.timeout = 2 * 60 * 1000;
      return cfg;
    });

*/