// src/api/dashboard.js
import axios from "axios";
export const api = axios.create({
  baseURL: "https://ttkd.vnptphuyen.vn:4488/api/dashboard/",
  timeout: 500000,
});


export const getFilters = () => api.get("/filters").then(r=>r.data);
export const getOverview = (params) => api.get("/overview", { params }).then(r=>r.data);


//exportExcelByUnitStatus