// =======================
// src/pages/SemiTapHuyView.jsx
// =======================
import React, { useEffect, useMemo, useState } from "react";
import FiltersBar from "../bangiao_kh/FiltersBar";
import UnitsPane from "../bangiao_kh/UnitsPane";
import CustomersPane from "../bangiao_kh/CustomersPane";
import SubsTable from "../bangiao_kh/SubsTable";
import { exportExcel, getCustomers, getPayers, getSubs, getUnits, getSubsFull,exportExcelChitiet } from "../bangiao_kh/services";
import { useDebounce } from "../bangiao_kh/useDebounce";
  import { Switch, FormControlLabel  } from "@mui/material";



 export default function SemiTapHuyView() {
    const [layout, setLayout] = useState(window.innerWidth < 1280 ? "right" : "split");
    const [unit, setUnit] = useState();
    const [q, setQ] = useState("");
    const dq = useDebounce(q, 400);
    

    const [units, setUnits] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [custPage, setCustPage] = useState(1);
    const [custTotal, setCustTotal] = useState(0);


    const [selectedPayer, setSelectedPayer] = useState(null);
    const [subs, setSubs] = useState([]);
    const [subsPage, setSubsPage] = useState(1);
    const [subsPageSize, setSubsPageSize] = useState(100);
    const [subsTotal, setSubsTotal] = useState(0);
    const [loadingSubs, setLoadingSubs] = useState(false);
    const [showAllCols, setShowAllCols] = useState(true);

const [exportingUnit, setExportingUnit] = useState(false);
  const [exportingAll, setExportingAll] = useState(false);

    useEffect(() => {
      const onKey = (e) => { if (e.key?.toLowerCase() === "f") setLayout((l) => (l === "split" ? "right" : "split")); };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, []);


    useEffect(() => {
      const mq = window.matchMedia("(max-width: 1279px)");
      const apply = () => setLayout(mq.matches ? "right" : "split");
      apply();
      mq.addEventListener("change", apply);
      return () => mq.removeEventListener("change", apply);
    }, []);


  useEffect(() => { (async () => { const res = await getUnits({ page: 1, pageSize: 500 }); setUnits(Array.isArray(res?.items) ? res.items : []); })(); }, []);
  useEffect(() => { (async () => { const res = await getCustomers({ unit, q: dq, page: custPage, pageSize: 50 }); setCustomers(Array.isArray(res?.items) ? res.items : []); setCustTotal(Number.isFinite(res?.total) ? res.total : 0); })(); }, [unit, dq, custPage]);


async function loadPayers(ma_kh) { const res = await getPayers({ unit, ma_kh, page: 1, pageSize: 200 }); return Array.isArray(res?.items) ? res.items : []; }

// helper: chuẩn hoá key -> có cả UPPER và lower để DataGrid đọc được
// Thêm helper chuẩn hoá (đặt trên cùng file)
function normalizeRows(items) {
  if (!Array.isArray(items)) return [];
  return items.map((r) => {
    if (!r || typeof r !== "object") return {};
    const out = {};
    for (const [k, v] of Object.entries(r)) {
      out[k] = v;
      if (typeof k === "string") {
        out[k.toUpperCase()] = v;
        out[k.toLowerCase()] = v;
      }
    }
    return out;
  });
}
// Load Subs (basic hoặc full)
useEffect(() => {
  if (!selectedPayer) return;
  setLoadingSubs(true);
  (async () => {
    const baseParams = { unit, ma_tt: selectedPayer.ma_tt, page: subsPage, pageSize: subsPageSize };
    const res = showAllCols ? await getSubsFull(baseParams) : await getSubs(baseParams);
  setSubs(normalizeRows(res?.items)); // <— QUAN TRỌNG
    setSubsTotal(Number.isFinite(res?.total) ? res.total : 0);
    setLoadingSubs(false);
  })();
}, [selectedPayer, unit, subsPage, subsPageSize, showAllCols]);

const unitNames = useMemo(() => (Array.isArray(units) ? units : []).map((u) => u?.ten_dv_tt).filter(Boolean), [units]);


const extraRight = (
<div className="flex items-center gap-2">
<FormControlLabel control={<Switch checked={showAllCols} onChange={(e)=> setShowAllCols(e.target.checked)} />} label="Hiển thị tất cả cột TB" />
<button className="px-3 py-1.5 rounded-xl border hover:bg-gray-50" onClick={() => setLayout((l) => (l === "split" ? "right" : "split"))} title="Phím tắt: F">{layout === "split" ? "Focus Thuê bao" : "Thoát Focus"}</button>
</div>
);


const handleUnitChange = (v) => { setUnit(v); setCustPage(1); setSelectedPayer(null); };


const downloadBlob = (blob, filename) => { const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url); };
const handleExportUnit1 = async () => { if (!unit) return; const blob = await exportExcel(unit); downloadBlob(blob, `export_${unit}.xlsx`); };
const handleExportAll1 = async () => { const blob = await exportExcel(); downloadBlob(blob, `export_all.xlsx`); };
const handleExportUnit = async () => {
    if (!unit || exportingUnit) return;
    try {
      setExportingUnit(true);
      const blob = await exportExcel(unit); // service trả Blob
      downloadBlob(blob, `export_${unit}.xlsx`);
    } catch (e) {
      console.error(e);
      alert("Xuất Excel (đơn vị) thất bại.");
    } finally {
      setExportingUnit(false);
    }
  };

  const handleExportAll = async () => {
    if (exportingAll) return;
    try {
      setExportingAll(true);
      const blob = await exportExcel();     // service trả Blob
      downloadBlob(blob, `export_all.xlsx`);
    } catch (e) {
      console.error(e);
      alert("Xuất Excel (toàn bộ) thất bại.");
    } finally {
      setExportingAll(false);
    }
  };

const handleExportUnitCT = async () => { if (!unit) return; const blob = await exportExcelChitiet(unit); downloadBlob(blob, `ct_export_${unit}.xlsx`); };
const handleExportAllCT  = async () => { const blob = await exportExcelChitiet(); downloadBlob(blob, `ct_export_all.xlsx`); };

 return (
      <div className="p-4 space-y-3">

      {/*  <FiltersBar units={unitNames} unit={unit} onUnitChange={handleUnitChange} q={q} onQChange={setQ} onExportUnit={handleExportUnit} onExportAll={handleExportAll} extraRight={extraRight} />*/}
<FiltersBar
        units={unitNames}
        unit={unit}
        onUnitChange={handleUnitChange}
        q={q}
        onQChange={setQ}
        onExportUnit={handleExportUnit}
        onExportAll={handleExportAll}
        extraRight={extraRight}
        // NEW:
        exportingUnit={exportingUnit}
        exportingAll={exportingAll}
      />

      {layout === "split" ? (
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-12 xl:col-span-3"><UnitsPane data={Array.isArray(units) ? units : []} selected={unit} onSelect={handleUnitChange} /></div>
                <div className="col-span-12 xl:col-span-4">
                    <CustomersPane customers={Array.isArray(customers) ? customers : []} loadPayers={loadPayers} selectedPayerMaTT={selectedPayer?.ma_tt} onPickPayer={(p) => { setSelectedPayer(p); setSubsPage(1); }} />
                </div>
                <div className="col-span-12 xl:col-span-5">
                <div className="bg-white rounded-2xl shadow p-3 mb-2 font-semibold">Thuê bao {selectedPayer ? `– ${selectedPayer.ten_tt} (MA_TT: ${selectedPayer.ma_tt})` : ""}</div>
                <SubsTable rows={Array.isArray(subs) ? subs : []} rowCount={Number.isFinite(subsTotal) ? subsTotal : 0} page={subsPage} pageSize={subsPageSize} onPageChange={setSubsPage} onPageSizeChange={setSubsPageSize} loading={!!loadingSubs} heightPx={720} mode={showAllCols ? "full" : "basic"} />
              </div>
            </div>
      ) : (
      <div className="rounded-2xl bg-white shadow">
          <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="font-semibold">Thuê bao {selectedPayer ? `– ${selectedPayer.ten_tt} (MA_TT: ${selectedPayer.ma_tt})` : "(chọn Mã thanh toán)"}</div>
              <div className="flex gap-2">
              <FormControlLabel control={<Switch checked={showAllCols} onChange={(e)=> setShowAllCols(e.target.checked)} />} label="Tất cả cột" />
              <button className="px-3 py-1.5 rounded-xl border hover:bg-gray-50" onClick={() => setLayout("split")}>Thoát Focus</button>
              </div>
          </div>
            <div className="p-3">
             <SubsTable rows={Array.isArray(subs) ? subs : []} rowCount={Number.isFinite(subsTotal) ? subsTotal : 0} page={subsPage} pageSize={subsPageSize} onPageChange={setSubsPage} onPageSizeChange={setSubsPageSize} loading={!!loadingSubs} heightPx={calcTableHeight()} mode={showAllCols ? "full" : "basic"} />
            </div>
      </div>
      )}
      </div>
);
}


function calcTableHeight(){
const vh = Math.max(window.innerHeight, 700);
return Math.floor(vh - 76 - 56 - 40);
}