 import React, { useMemo, useRef } from "react";
import { Card, Chip, LinearProgress } from "@mui/material";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import WifiTetheringIcon from "@mui/icons-material/WifiTethering";
import { useVirtualizer } from "@tanstack/react-virtual";


export default function UnitsPane({ data = [], selected, onSelect }) {
const parentRef = useRef(null);
const safe = Array.isArray(data) ? data : [];


const { maxKH, maxTT, maxTB } = useMemo(() => ({
    maxKH: Math.max(1, ...safe.map((x) => x.customers || 0)),
    maxTT: Math.max(1, ...safe.map((x) => x.payers || 0)),
    maxTB: Math.max(1, ...safe.map((x) => x.subs || 0)),
}), [safe]);


const rowVirtualizer = useVirtualizer({
count: safe.length,
getScrollElement: () => parentRef.current,
estimateSize: () => 92,
overscan: 10,
getItemKey: (i) => safe[i]?.ten_dv_tt ?? i,
});


return (
    <Card className="h-full rounded-2xl shadow p-2">
        <div className="px-3 py-2 font-semibold">Đơn vị</div>
        <div ref={parentRef} className="overflow-auto" style={{ height: 680 }}>
        <div style={{ height: rowVirtualizer.getTotalSize(), position: "relative" }}>
        {rowVirtualizer.getVirtualItems().map((v) => {
        const u = safe[v.index];
        if (!u) return null;
        const active = selected === u.ten_dv_tt;
        return (
            <div
            key={v.key}
            className={`rounded-xl p-3 m-2 cursor-pointer border transition shadow-sm ${
            active ? "bg-gradient-to-r from-blue-50 to-indigo-50 ring-2 ring-blue-300" : "bg-white hover:bg-gray-50"
            }`}
            style={{ position: "absolute", top: 0, left: 0, right: 0, transform: `translateY(${v.start}px)` }}
            onClick={() => onSelect(u.ten_dv_tt)}
            >
            <div className="flex items-center gap-2">
            <div className="font-semibold truncate" title={u.ten_dv_tt}>{u.ten_dv_tt}</div>
            </div>


            <div className="grid grid-cols-3 gap-2 mt-2">
            <div className="flex items-center gap-1">
            <PeopleAltIcon fontSize="small" className="text-blue-600" />
            <Chip size="small" color="primary" variant="outlined" label={`KH: ${u.customers}`} />
            </div>
            <div className="flex items-center gap-1">
            <ReceiptLongIcon fontSize="small" className="text-purple-600" />
            <Chip size="small" color="secondary" variant="outlined" label={`MA_TT: ${u.payers}`} />
            </div>
            <div className="flex items-center gap-1">
            <WifiTetheringIcon fontSize="small" className="text-emerald-600" />
            <Chip size="small" color="success" variant="outlined" label={`TB: ${u.subs}`} />
            </div>
            </div>


                <div className="grid grid-cols-3 gap-2 mt-2">
                    <LinearProgress variant="determinate" value={Math.min(100, (u.customers / maxKH) * 100)} />
                    <LinearProgress color="secondary" variant="determinate" value={Math.min(100, (u.payers / maxTT) * 100)} />
                    <LinearProgress color="success" variant="determinate" value={Math.min(100, (u.subs / maxTB) * 100)} />
                </div>
            </div>
            );
            })}
            </div>
        </div>
    </Card>
);
}