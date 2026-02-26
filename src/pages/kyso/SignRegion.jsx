// src/components/SignRegion.jsx
import React from "react";
import { TextField, Button } from "@mui/material";

export default function SignRegion({ region, onChange, onDelete }) {
  return (
    <div className="p-3 border rounded bg-gray-50 space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <TextField
          label="X"
          size="small"
          value={region.x}
          onChange={(e) => onChange({ ...region, x: Number(e.target.value) })}
        />
        <TextField
          label="Y"
          size="small"
          value={region.y}
          onChange={(e) => onChange({ ...region, y: Number(e.target.value) })}
        />
        <TextField
          label="Width"
          size="small"
          value={region.w}
          onChange={(e) => onChange({ ...region, w: Number(e.target.value) })}
        />
        <TextField
          label="Height"
          size="small"
          value={region.h}
          onChange={(e) => onChange({ ...region, h: Number(e.target.value) })}
        />
      </div>

      <Button
        variant="outlined"
        color="error"
        fullWidth
        onClick={onDelete}
      >
        Xóa vùng ký
      </Button>
    </div>
  );
}
