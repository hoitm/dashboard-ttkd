import React, { useMemo, useState } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Chip } from "@mui/material";

// ===== helpers =====
const safeGet = (row, key) => {
  if (!row) return undefined;
  return row[key] ?? row[key?.toLowerCase?.()] ?? row[key?.toUpperCase?.()];
};
const safeDate = (v) => {
  if (!v) return "";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
};
const prettyHeader = (name) => name.replace(/_/g, " ");

// ===== full column list =====
const ALL_FIELDS = [
  "THUEBAO_ID","MA_TB","MA_TT","MA_HD","SO_GT","NGAY_SD","NGAYLAP_HD","SO_DT","sdt_kh","DIACHI_TB",
  "KHACHHANG_ID","MA_KH","DIACHI_KH","DICHVUVT_ID","LOAIKH_ID","LOAIGT_ID","TRANGTHAITB_ID","TRANGTHAI_TB",
  "KHDN","NHOMLKH_ID","PHANLOAIKH_ID","KHOI_ID","TEN_TT","TEN_KH","DOITUONG_ID","TEN_DT","LOAI_GT","NO_TON",
  "tuyenthu_id","ma_tuyen","ten_tuyen","KHUVUC_ID","TEN_KV","NHANVIEN_KDDB","NHANVIEN_KTDB","DONVI_CSKH",
  "TEN_DV_TT","TTVT","ten_nvpt","ten_dvpt"
];

function StatusChip({ value }) {
  if (!value) return null;
  const v = String(value).toLowerCase();
  const color = v.includes("cưỡng") ? "error" : v.includes("theo yêu cầu") ? "warning" : "success";
  return <Chip size="small" color={color} label={value} variant="outlined" />;
}

function buildColumnsFull() {
  return ALL_FIELDS.map((f) => {
    const base = { field: f, headerName: prettyHeader(f), minWidth: 140, flex: 1 };
    if (f === "NGAY_SD" || f === "NGAYLAP_HD") {
      return { ...base, minWidth: 160, valueGetter: (p) => safeDate(safeGet(p?.row, f)) };
    }
    if (f === "TRANGTHAI_TB") {
      return { ...base, minWidth: 200, renderCell: (p) => <StatusChip value={p?.value} /> };
    }
    if (["THUEBAO_ID","KHACHHANG_ID","DICHVUVT_ID","LOAIKH_ID","LOAIGT_ID","TRANGTHAITB_ID","KHDN","NHOMLKH_ID","PHANLOAIKH_ID","KHOI_ID","KHUVUC_ID"].includes(f)) {
      return { ...base, width: 120, flex: 0 };
    }
    if (["SO_DT","sdt_kh"].includes(f)) {
      return { ...base, width: 160, flex: 0 };
    }
    if (["MA_TB","MA_TT","MA_HD","MA_KH"].includes(f)) {
      return { ...base, width: 180, flex: 0 };
    }
    return base;
  });
}

export default function SubsTable({
  rows,
  rowCount,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  loading,
  heightPx = 720,
  mode = "basic", // "basic" | "full"
}) {
  const [columnVisibilityModel, setColumnVisibilityModel] = useState({});

  const columns = useMemo(() => {
    if (mode === "full") return buildColumnsFull();
    // ===== 5 cột cơ bản, mỗi cột đều null-safe & đọc HOA/thường
    return [
      { field: "MA_TB", headerName: "Mã TB", width: 150, valueGetter: (p) => safeGet(p?.row, "MA_TB") },
      { field: "SO_DT", headerName: "SĐT", width: 160, valueGetter: (p) => safeGet(p?.row, "SO_DT") },
      { field: "DIACHI_TB", headerName: "Địa chỉ TB", flex: 1, minWidth: 280, valueGetter: (p) => safeGet(p?.row, "DIACHI_TB") },
      { field: "TRANGTHAI_TB", headerName: "Trạng thái", width: 220, valueGetter: (p) => safeGet(p?.row, "TRANGTHAI_TB"), renderCell: (p) => <StatusChip value={p?.value} /> },
      { field: "NGAY_SD", headerName: "Ngày SD", width: 160, valueGetter: (p) => safeDate(safeGet(p?.row, "NGAY_SD")) },
    ];
  }, [mode]);

  const paginationModel = useMemo(
    () => ({ page: Math.max(0, (page ?? 1) - 1), pageSize: pageSize ?? 100 }),
    [page, pageSize]
  );

  return (
    <div style={{ height: heightPx }}>
      <DataGrid
        rows={Array.isArray(rows) ? rows : []}
        columns={columns}
        getRowId={(r) =>
          r?.THUEBAO_ID ?? r?.thuebao_id ??
          `${safeGet(r, "MA_TB") ?? "x"}-${safeGet(r, "MA_TT") ?? ""}-${safeGet(r, "NGAY_SD") ?? Math.random()}`
        }
        paginationMode="server"
        rowCount={Number.isFinite(rowCount) ? rowCount : 0}
        paginationModel={paginationModel}
        onPaginationModelChange={(m) => {
          onPageChange?.(m.page + 1);
          onPageSizeChange?.(m.pageSize);
        }}
        loading={!!loading}
        disableRowSelectionOnClick
        density="compact"
        slots={{ toolbar: GridToolbar }}
        slotProps={{ toolbar: { showQuickFilter: true } }}
        columnVisibilityModel={columnVisibilityModel}
        onColumnVisibilityModelChange={setColumnVisibilityModel}
        getRowClassName={(p) => (p.indexRelativeToCurrentPage % 2 === 0 ? "" : "bg-gray-50")}
      />
    </div>
  );
}
