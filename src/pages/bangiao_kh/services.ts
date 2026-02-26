// =======================
// src/api/services.ts
// =======================
import { api } from "./client";


export type UnitDto = { ten_dv_tt: string; customers: number; payers: number; subs: number };
export type CustomerDto = { ma_kh: string; ten_kh: string; so_ma_tt: number; so_tb: number };
export type PayerDto = { ma_tt: string; ten_tt: string; so_tb: number };
export type SubDto = { MA_TB: string; SO_DT: string; DIACHI_TB?: string | null; TRANGTHAI_TB?: string | null; ngay_sd?: string | null };
export type PagedResult<T> = { items: T[]; total: number };


export async function getUnits(params: { search?: string; page?: number; pageSize?: number }) {
const { data } = await api.get<PagedResult<UnitDto>>("/units", { params });
return data;
}


export async function getCustomers(params: { unit?: string; q?: string; page?: number; pageSize?: number }) {
const { data } = await api.get<PagedResult<CustomerDto>>("/customers", { params });
return data;
}


export async function getPayers(params: { unit?: string; ma_kh: string; page?: number; pageSize?: number }) {
const { data } = await api.get<PagedResult<PayerDto>>("/payers", { params });
return data;
}


export async function getSubs(params: { unit?: string; ma_tt: string; trangthai?: string; from?: string; to?: string; page?: number; pageSize?: number }) {
const { data } = await api.get<PagedResult<SubDto>>("/subs", { params });
return data;
}
// NEW: lấy full cột thuê bao
export async function getSubsFull(params) {
const { data } = await api.get("/subs/full", { params });
return data;
}

export async function exportExcel11(unit?: string) {
const { data } = await api.get<Blob>("/export", { params: { unit }, responseType: "blob" });
return data;
}
export async function exportExcelByUnitStatus(unit, status) {
  const url = `/export-details-by-unit-status?unit=${encodeURIComponent(unit)}&status=${encodeURIComponent(status)}`;
  const res = await api.get(url, { responseType: "blob" });
  return res.data; // Blob
}

export async function exportExcel(unit?: string) {
  const { data } = await api.get<Blob>("/export", {
    params: { unit },
    responseType: "blob",
    timeout: 500000, // ⬅️ tăng timeout lên 120s (đổi số nếu muốn)
  });
  return data;
}
// Xuất Excel (đơn vị hoặc toàn bộ)
export async function exportExcelChitiet(unit?: string) {
//  const url = unit
//    ? `/export-details?unit=${encodeURIComponent(unit)}`
//    : `/export-details`;
//
//  const res = await api.get(url, { responseType: "blob" });
//  return res.data; // Blob

const { data } = await api.get<Blob>("/export-details", { params: { unit }, responseType: "blob" });
return data;
}