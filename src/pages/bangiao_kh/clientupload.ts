// api/client.ts
import axios from "axios";
export const api = axios.create({
  baseURL: "https://ttkd.vnptphuyen.vn:4488/api/upload_bangiao/",
  timeout: 500000,
});
