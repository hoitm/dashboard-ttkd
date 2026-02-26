import React, { useEffect, useMemo, useState } from "react";
import { getFilters, getOverview } from "../bangiao_kh/dashboard";
import { Card, Chip, TextField, MenuItem, Select, Button, CircularProgress } from "@mui/material";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, CartesianGrid, PieChart, Pie, Cell
} from "recharts";
import FilterListIcon from '@mui/icons-material/FilterList';
import { exportExcelByUnitStatus } from "../bangiao_kh/services";

const COLORS = ["#2563eb","#22c55e","#eab308","#ef4444","#8b5cf6","#06b6d4","#f97316"];
const GRAY = "#e5e7eb";

/* Mini donut cho từng phòng */
function UnitDonut({ value, total, color = "#2563eb" }) {
  const v = Number(value || 0);
  const t = Number(total || 0);
  const pct = t > 0 ? Math.round((v * 100) / t) : 0;
  const data = [
    { name: "Updated", value: v },
    { name: "Rest", value: Math.max(0, t - v) },
  ];
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={140}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            innerRadius={38}
            outerRadius={60}
            startAngle={90}
            endAngle={-270}
            paddingAngle={0}
            isAnimationActive={false}
          >
            <Cell fill={COLORS} />
            <Cell fill={GRAY} />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold">
        {pct}%
      </div>
    </div>
  );
}

export default function SemiHuyDashboard() {
  const [filters, setFilters] = useState({ units: [], loaikh: [], doituong: [] });
  const [unit, setUnit] = useState("");
  const [loaikhId, setLoaikhId] = useState("");
  const [doituongId, setDoituongId] = useState("");
  const [days, setDays] = useState(90);
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(false);

  // NEW: tuỳ chọn hiển thị “tỉ lệ theo phòng”
  const [metric, setMetric] = useState("subs"); // subs | payers | customers
  const [showAllUnits, setShowAllUnits] = useState(false);

const [downloadingKey, setDownloadingKey] = useState(null);

const saveBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

const handleDownloadUnit = async (u, status) => {
  const key = `${u}-${status}`;
  if (downloadingKey === key) return;
  try {
    setDownloadingKey(key);
    const blob = await exportExcelByUnitStatus(u, status);
    saveBlob(blob, `export_${u}_${status}.xlsx`);
  } catch (e) {
    console.error(e);
    alert("Tải file thất bại.");
  } finally {
    setDownloadingKey(null);
  }
};



  useEffect(() => {
    (async () => {
      const f = await getFilters();
      setFilters(f);
    })();
  }, []);

  const load = async () => {
    setBusy(true);
    try {
      const d = await getOverview({
        unit: unit || undefined,
        loaikhId: loaikhId || undefined,
        doituongId: doituongId || undefined,
        sinceDays: days,
      });
      setData(d);
    } finally {
      setBusy(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const kpi = useMemo(() => {
    if (!data) return {};
    const s = data.summary;
    const r = data.ratios;
    return [
      { title: "Thuê bao (gốc → cập nhật)", value: `${s.subsUpdated}/${s.subsTotal}`, extra: `${r.subs}%` },
      { title: "Mã thanh toán (gốc → cập nhật)", value: `${s.payersUpdated}/${s.payersTotal}`, extra: `${r.payers}%` },
      { title: "Khách hàng (gốc → cập nhật)", value: `${s.customersUpdated}/${s.customersTotal}`, extra: `${r.customers}%` },
    ];
  }, [data]);

  const pieSubs = useMemo(() => {
    if (!data) return [];
    const s = data.summary;
    return [
      { name: "Updated", value: s.subsUpdated },
      { name: "Not updated", value: Math.max(0, s.subsTotal - s.subsUpdated) },
    ];
  }, [data]);

  // NEW: build dữ liệu theo phòng (đơn vị) và tỉ lệ
  const byUnitMetric = useMemo(() => {
    if (!data) return [];
    return (data.byUnit || []).map((u) => {
      let total = 0, updated = 0;
      if (metric === "subs") {
        total = u.subsTotal; updated = u.subsUpdated;
      } else if (metric === "payers") {
        total = u.payersTotal; updated = u.payersUpdated;
      } else {
        total = u.customersTotal; updated = u.customersUpdated;
      }
      const ratio = total ? +(updated * 100 / total).toFixed(1) : 0;
      return { ...u, total, updated, ratio };
    })
    // sắp xếp phòng tốt -> kém (giảm dần), có thể đổi asc nếu muốn “điểm yếu”
    .sort((a, b) => b.ratio - a.ratio);
  }, [data, metric]);

  const unitsToShow = showAllUnits ? byUnitMetric : byUnitMetric.slice(0, 12);

  return (
    <div className="p-4 space-y-4">
      <Card className="p-3 space-y-3">
        <div className="text-xl font-semibold">Dashboard điều hành – Bàn giao Hồ Sơ Khách hàng</div>
        <div className="grid grid-cols-12 gap-3 items-end">
          <TextField className="col-span-12 md:col-span-4" label="Đơn vị (TEN_DV_TT)" select value={unit} onChange={e => setUnit(e.target.value)} size="small">
            <MenuItem value="">(Tất cả)</MenuItem>
            {filters.units.map(u => <MenuItem key={u} value={u}>{u}</MenuItem>)}
          </TextField>
          <TextField className="col-span-6 md:col-span-3" label="LOAIKH_ID" select value={loaikhId} onChange={e => setLoaikhId(e.target.value)} size="small">
            <MenuItem value="">(Tất cả)</MenuItem>
            {filters.loaikh.map(v => <MenuItem key={String(v)} value={v ?? ""}>{String(v)}</MenuItem>)}
          </TextField>
          <TextField className="col-span-6 md:col-span-3" label="DOITUONG_ID" select value={doituongId} onChange={e => setDoituongId(e.target.value)} size="small">
            <MenuItem value="">(Tất cả)</MenuItem>
            {filters.doituong.map(v => <MenuItem key={String(v)} value={v ?? ""}>{String(v)}</MenuItem>)}
          </TextField>
          <TextField className="col-span-6 md:col-span-1" label="Ngày gần đây" type="number" value={days} onChange={e => setDays(parseInt(e.target.value || "0", 10))} size="small" />
         <div className="col-span-6 md:col-span-1">
  <Button
    variant="contained"
    onClick={load}
    disabled={busy}
    fullWidth
  >
    {busy ? (
      <div className="flex items-center justify-center gap-2">
        <CircularProgress size={30} />
        <span>Đang...</span>
      </div>
    ) : (
       <div className="flex items-center justify-center gap-2">
        <FilterListIcon size={32} />
        <span>Lọc</span>
      </div>
     
    )}
  </Button>
</div>
        </div>
      </Card>

      {data && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {kpi.map((k, idx) => (
              <Card key={idx} className="p-4">
                <div className="text-sm text-gray-500">{k.title}</div>
                <div className="text-2xl font-bold">{k.value}</div>
                <div className="text-emerald-600 font-semibold">{k.extra}</div>
              </Card>
            ))}
          </div>

          {/* Ratio pie + Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <Card className="p-3">
              <div className="font-semibold mb-2">Tỉ lệ Thuê bao đã cập nhật</div>
              <div style={{ width: "100%", height: 280 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={pieSubs} dataKey="value" nameKey="name" outerRadius={110} label>
                      {pieSubs.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card className="p-3">
              <div className="font-semibold mb-2">Ma trận: Mã thanh toán theo trạng thái KH</div>
              <div className="text-sm">
                <div>Thuộc KH đã cập nhật: <b>{data.matrix.payers.updatedCustomers}</b></div>
                <div>Thuộc KH chưa cập nhật: <b>{data.matrix.payers.notUpdatedCustomers}</b></div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="font-semibold mb-2">Ma trận: Thuê bao theo trạng thái KH</div>
              <div className="text-sm">
                <div>Thuộc KH đã cập nhật: <b>{data.matrix.subs.updatedCustomers}</b></div>
                <div>Thuộc KH chưa cập nhật: <b>{data.matrix.subs.notUpdatedCustomers}</b></div>
              </div>
            </Card>
          </div>

          {/* By Unit (bars) */}
          <Card className="p-3">
            <div className="font-semibold mb-2">Theo Đơn vị (TB & KH – gốc vs cập nhật)</div>
            <div style={{ width: "100%", height: 360 }}>
              <ResponsiveContainer>
                <BarChart data={data.byUnit}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="unit" hide />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="subsTotal" name="Tổng TB" stackId="s" />
                  <Bar dataKey="subsUpdated" name="TB cập nhật" stackId="s" />
                  <Bar dataKey="payersTotal" name="Tổng Mã TT" stackId="p" />
                  <Bar dataKey="payersUpdated" name="TT cập nhật" stackId="p" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* By LOAIKH_ID */}
          <Card className="p-3">
            <div className="font-semibold mb-2">Theo LOAIKH_ID</div>
            <div style={{ width: "100%", height: 320 }}>
              <ResponsiveContainer>
                <BarChart data={data.byLoaiKh}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="loaikhId" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="subsUpdated" name="TB cập nhật" />
                  <Bar dataKey="payersUpdated" name="TT cập nhật" />
                  <Bar dataKey="customersUpdated" name="KH cập nhật" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Trend */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <Card className="p-3">
              <div className="font-semibold mb-2">Xu hướng patch theo ngày</div>
              <div style={{ width: "100%", height: 280 }}>
                <ResponsiveContainer>
                  <LineChart data={data.trend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="subsPatched" name="TB patched" />
                    <Line type="monotone" dataKey="patchRows" name="Patch rows" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card className="p-3">
              <div className="font-semibold mb-2">Xu hướng theo ngày & Đơn vị</div>
              <div style={{ width: "100%", height: 280 }}>
                <ResponsiveContainer>
                  <BarChart data={data.trendByUnit}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="subsPatched" name="Subs patched" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* ================= NEW: TỈ LỆ THEO TỪNG PHÒNG ================= */}
          <Card className="p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">Tỉ lệ theo phòng (Đơn vị)</div>
              <div className="flex items-center gap-2">
                <Select size="small" value={metric} onChange={(e)=>setMetric(e.target.value)} >
                  <MenuItem value="subs">Thuê bao</MenuItem>
                  <MenuItem value="payers">Mã thanh toán</MenuItem>
                  <MenuItem value="customers">Khách hàng</MenuItem>
                </Select>
                <Button size="small" variant="outlined" onClick={()=>setShowAllUnits(v=>!v)}>
                  {showAllUnits ? "Thu gọn" : "Xem tất cả"}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {unitsToShow.map((u, idx) => (
                <div key={u.unit + idx} className="border rounded-xl p-3 hover:shadow transition">
                  <div className="text-sm font-semibold truncate mb-1">{u.unit}</div>
                  <UnitDonut value={u.updated} total={u.total} color={COLORS[idx % COLORS.length]} />
                  <div className="text-xs text-gray-600 text-center">
                    Cập nhật: <b>{u.updated}</b> / {u.total}
                  </div>


                  <div className="grid grid-cols-2 gap-2 mt-2">
  <Button
    size="small"
    variant="outlined"
    color="success"
    onClick={() => handleDownloadUnit(u.unit, "updated")}
    disabled={downloadingKey === `${u.unit}-updated`}
  >
    {downloadingKey === `${u.unit}-updated` ? "Đang tải…" : "ĐÃ UPLOAD"}
  </Button>

  <Button
    size="small"
    variant="outlined"
    color="error"
    onClick={() => handleDownloadUnit(u.unit, "not-updated")}
    disabled={downloadingKey === `${u.unit}-not-updated`}
  >
    {downloadingKey === `${u.unit}-not-updated` ? "Đang tải…" : "CHƯA UPLOAD"}
  </Button>
</div>

                </div>
                
              ))}

            

            </div>
          </Card>
          {/* ================= END NEW SECTION ================= */}
        </>
      )}
    </div>
  );
}
