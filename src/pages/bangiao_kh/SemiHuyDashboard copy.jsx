

import React, { useEffect, useMemo, useState } from "react";
import { getFilters, getOverview } from "../bangiao_kh/dashboard";
import { Card, Chip, TextField, MenuItem, Select, Button, CircularProgress } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line, CartesianGrid, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#2563eb","#22c55e","#eab308","#ef4444","#8b5cf6","#06b6d4","#f97316"];

export default function SemiHuyDashboard(){
  const [filters, setFilters] = useState({ units:[], loaikh:[], doituong:[] });
  const [unit, setUnit] = useState("");
  const [loaikhId, setLoaikhId] = useState("");
  const [doituongId, setDoituongId] = useState("");
  const [days, setDays] = useState(90);
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(()=>{
    (async ()=>{
      const f = await getFilters();
      setFilters(f);
    })();
  },[]);

  const load = async ()=>{
    setBusy(true);
    try {
      const d = await getOverview({
        unit: unit || undefined,
        loaikhId: loaikhId || undefined,
        doituongId: doituongId || undefined,
        sinceDays: days
      });
      setData(d);
    } finally {
      setBusy(false);
    }
  };
  useEffect(()=>{ load(); },[]);

  const kpi = useMemo(()=>{
    if (!data) return {};
    const s = data.summary;
    const r = data.ratios;
    return [
      { title: "Thuê bao (gốc → cập nhật)", value: `${s.subsUpdated}/${s.subsTotal}`, extra: `${r.subs}%` },
      { title: "Mã thanh toán (gốc → cập nhật)", value: `${s.payersUpdated}/${s.payersTotal}`, extra: `${r.payers}%` },
      { title: "Khách hàng (gốc → cập nhật)", value: `${s.customersUpdated}/${s.customersTotal}`, extra: `${r.customers}%` },
    ];
  },[data]);

  const pieSubs = useMemo(()=>{
    if (!data) return [];
    const s = data.summary;
    return [
      { name: "Updated", value: s.subsUpdated },
      { name: "Not updated", value: Math.max(0, s.subsTotal - s.subsUpdated) }
    ];
  },[data]);

  return (
    <div className="p-4 space-y-4">
      <Card className="p-3 space-y-3">
        <div className="text-xl font-semibold">Dashboard điều hành – Bàn giao Hồ Sơ Khách hàng</div>
        <div className="grid grid-cols-12 gap-3 items-end">
          <TextField className="col-span-12 md:col-span-4" label="Đơn vị (TEN_DV_TT)" select value={unit} onChange={e=>setUnit(e.target.value)} size="small">
            <MenuItem value="">(Tất cả)</MenuItem>
            {filters.units.map(u=><MenuItem key={u} value={u}>{u}</MenuItem>)}
          </TextField>
          <TextField className="col-span-6 md:col-span-3" label="LOAIKH_ID" select value={loaikhId} onChange={e=>setLoaikhId(e.target.value)} size="small">
            <MenuItem value="">(Tất cả)</MenuItem>
            {filters.loaikh.map(v=><MenuItem key={String(v)} value={v ?? ""}>{String(v)}</MenuItem>)}
          </TextField>
          <TextField className="col-span-6 md:col-span-3" label="DOITUONG_ID" select value={doituongId} onChange={e=>setDoituongId(e.target.value)} size="small">
            <MenuItem value="">(Tất cả)</MenuItem>
            {filters.doituong.map(v=><MenuItem key={String(v)} value={v ?? ""}>{String(v)}</MenuItem>)}
          </TextField>
          <TextField className="col-span-6 md:col-span-1" label="Ngày gần đây" type="number" value={days} onChange={e=>setDays(parseInt(e.target.value||"0",10))} size="small"/>
          <div className="col-span-6 md:col-span-1">
            <Button variant="contained" onClick={load} disabled={busy} fullWidth>
              {busy ? <CircularProgress size={18}/> : "Lọc"}
            </Button>
          </div>
        </div>
      </Card>

      {data && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {kpi.map((k,idx)=>(
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
              <div style={{width:'100%', height:280}}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={pieSubs} dataKey="value" nameKey="name" outerRadius={110} label>
                      {pieSubs.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                    </Pie>
                    <Tooltip/>
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

          {/* By Unit */}
          <Card className="p-3">
            <div className="font-semibold mb-2">Theo Đơn vị (TB & KH – gốc vs cập nhật)</div>
            <div style={{width:'100%', height:360}}>
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
            <div style={{width:'100%', height:320}}>
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
              <div style={{width:'100%', height:280}}>
                <ResponsiveContainer>
                  <LineChart data={data.trend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="subsPatched" name="TB patched" />
                    <Line type="monotone" dataKey="patchRows"   name="Patch rows" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card className="p-3">
              <div className="font-semibold mb-2">Xu hướng theo ngày & Đơn vị</div>
              <div style={{width:'100%', height:280}}>
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
        </>
      )}
    </div>
  );
}
 