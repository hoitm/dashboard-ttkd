// =======================
// src/components/FiltersBar.jsx
// =======================
/*
import React from "react";
import { Autocomplete, Button, Chip, TextField,CircularProgress  } from "@mui/material";


export default function FiltersBar({ units, unit, onUnitChange, q, onQChange, onExportUnit, onExportAll, extraRight }) {
return (
<div className="flex flex-wrap items-center gap-3 p-3 bg-white rounded-2xl shadow">
<Autocomplete
options={units}
value={unit ?? null}
onChange={(_, v) => onUnitChange(v ?? undefined)}
renderInput={(p) => <TextField {...p} label="Đơn vị (TEN_DV_TT)" size="small" />}
className="min-w-[260px]"
/>
<TextField
label="Tìm nhanh (Tên KH / MA_KH / MA_TT / SĐT)"
size="small"
value={q}
onChange={(e) => onQChange(e.target.value)}
className="min-w-[320px] flex-1"
/>
{unit && <Chip label={`Đang lọc: ${unit}`} />}


<div className="ml-auto flex gap-2">
<Button variant="outlined" onClick={onExportUnit} disabled={!unit}>
Xuất Excel (đơn vị)
</Button>
<Button variant="contained" onClick={onExportAll}>
Xuất Excel (toàn bộ)
</Button>
{extraRight}
</div>
</div>
);
}
*/

// =======================
// src/components/FiltersBar.jsx
// =======================
import React from "react";
import { Autocomplete, Button, Chip, TextField, CircularProgress } from "@mui/material";
 
export default function FiltersBar({
  units,
  unit,
  onUnitChange,
  q,
  onQChange,
  onExportUnit,
  onExportAll,
  extraRight,
  // NEW:
  exportingUnit = false,
  exportingAll = false,
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 p-3 bg-white rounded-2xl shadow">
      <Autocomplete
        options={units}
        value={unit ?? null}
        onChange={(_, v) => onUnitChange(v ?? undefined)}
        renderInput={(p) => <TextField {...p} label="Đơn vị (TEN_DV_TT)" size="small" />}
        className="min-w-[260px]"
      />

      <TextField
        label="Tìm nhanh (Tên KH / MA_KH / MA_TT / SĐT)"
        size="small"
        value={q}
        onChange={(e) => onQChange(e.target.value)}
        className="min-w-[320px] flex-1"
      />

      {unit && <Chip label={`Đang lọc: ${unit}`} />}

      <div className="ml-auto flex gap-2">
        <Button
          variant="outlined" 
          onClick={onExportUnit}
          disabled={!unit || exportingUnit}
          startIcon={
            exportingUnit ? <CircularProgress size={16} thickness={6} /> : null
          }
        >
          {exportingUnit ? "Đang xuất…" : "Xuất Excel (đơn vị)"}
        </Button>

        <Button
          variant="contained"
          onClick={onExportAll}
          disabled={exportingAll}
          startIcon={
            exportingAll ? <CircularProgress size={16} thickness={6} color="inherit" /> : null
          }
        >
          {exportingAll ? "Đang xuất…" : "Xuất Excel (toàn bộ)"}
        </Button>

        {extraRight}
      </div>
    </div>
  );
}
