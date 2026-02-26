import React, { useRef, useState } from "react";
import { Card, Chip, IconButton } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useVirtualizer } from "@tanstack/react-virtual";


export default function CustomersPane({ customers = [], loadPayers, onPickPayer, selectedPayerMaTT }) {
const [open, setOpen] = useState({});
const [cache, setCache] = useState({});


const parentRef = useRef(null);
const count = Array.isArray(customers) ? customers.length : 0;


const rowVirtualizer = useVirtualizer({
count,
getScrollElement: () => parentRef.current,
estimateSize: () => 96,
overscan: 8,
getItemKey: (i) => (customers && customers[i] ? customers[i].ma_kh : i),
measureElement: (el) => el?.getBoundingClientRect().height || 96,
});


const handleToggle = async (c) => {
const isOpen = !!open[c.ma_kh];
if (!isOpen && !cache[c.ma_kh]) {
const list = await loadPayers(c.ma_kh);
list.sort((a, b) => (b.so_tb || 0) - (a.so_tb || 0));
setCache((s) => ({ ...s, [c.ma_kh]: list || [] }));
}
setOpen((s) => ({ ...s, [c.ma_kh]: !isOpen }));
};

return (
<Card className="h-full rounded-2xl shadow p-2">
<div className="px-3 py-2 font-semibold">Khách hàng → Mã thanh toán</div>
<div ref={parentRef} className="overflow-auto" style={{ height: 680 }}>
<div style={{ height: rowVirtualizer.getTotalSize(), position: "relative" }}>
{rowVirtualizer.getVirtualItems().map((v) => {
const c = customers[v.index];
if (!c) return null;
const isOpen = !!open[c.ma_kh];
const payers = cache[c.ma_kh] || [];


return (
<div
key={v.key}
ref={rowVirtualizer.measureElement}
className="border-b px-3 py-2"
style={{ position: "absolute", top: 0, left: 0, width: "100%", transform: `translateY(${v.start}px)` }}
>
<div className="flex items-center justify-between">
<div className="min-w-0">
<div className="font-medium truncate" title={c.ten_kh}>{c.ten_kh}</div>
<div className="text-sm text-gray-500">MA_KH: {c.ma_kh} • MA_TT: {c.so_ma_tt} • TB: {c.so_tb}</div>
</div>
<IconButton size="small" onClick={() => handleToggle(c)}>
<ExpandMoreIcon className={`${isOpen ? "rotate-180" : ""} transition`} />
</IconButton>
</div>


{isOpen && (
<div className="mt-2 flex flex-wrap gap-2 max-h-40 overflow-auto pr-1">
{payers.length === 0 ? (
<div className="text-sm text-gray-500 italic">Đang tải mã thanh toán…</div>
) : (
payers.map((p) => {
const highlight = selectedPayerMaTT && selectedPayerMaTT === p.ma_tt;
const color = p.so_tb >= 10 ? "success" : p.so_tb >= 3 ? "primary" : "default";
return (
<Chip
key={p.ma_tt}
label={`${p.ten_tt} • ${p.so_tb}`}
color={color}
variant={highlight ? "filled" : "outlined"}
clickable
onClick={() => onPickPayer(p)}
/>
);
})
)}
</div>
)}
</div>
);
})}
</div>
</div>
</Card>
);
}