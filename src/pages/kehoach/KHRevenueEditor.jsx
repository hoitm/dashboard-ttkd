// File: src/pages/RevenueEditor.jsx
import React, { useState } from 'react';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import { Button } from '@mui/material';
import { Delete, Edit, Save, AddBox, UploadFile } from '@mui/icons-material';
import * as XLSX from 'xlsx';

const initialRows = [];

export default function RevenueEditor() {
  const [rows, setRows] = useState(initialRows);
  const [editRowId, setEditRowId] = useState(null);
  const [newRow, setNewRow] = useState({ MA_TINH: '', Year: 2025, Thuchien: '', Month: '', DONVI: '' });

  const handleAddRow = () => {
    setRows(prev => [...prev, { ...newRow, id: Date.now() }]);
    setNewRow({ MA_TINH: '', Year: 2025, Thuchien: '', Month: '', DONVI: '' });
  };

  const handleDeleteRow = (id) => () => {
    setRows(prev => prev.filter(row => row.id !== id));
  };

  const handleEditRow = (id) => () => {
    setEditRowId(id);
  };

  const handleSaveRow = (id) => () => {
    setEditRowId(null);
  };

  const handleInputChange = (field, value) => {
    setNewRow(prev => ({ ...prev, [field]: value }));
  };

  const handleExcelImport = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);
      const formatted = json.map((row, idx) => ({ id: Date.now() + idx, ...row }));
      setRows(prev => [...prev, ...formatted]);
    };

    reader.readAsArrayBuffer(file);
  };

  const columns = [
    { field: 'MA_TINH', headerName: 'MÃ TẬaNH', width: 100, editable: true },
    { field: 'Year', headerName: 'NĂM', width: 100, editable: true },
    { field: 'Thuchien', headerName: 'Thực hiện', width: 120, editable: true },
    { field: 'Month', headerName: 'Tháng', width: 100, editable: true },
    { field: 'DONVI', headerName: 'ĐƠn vị', width: 120, editable: true },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Thao tác',
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem icon={<Edit />} label="Sửa" onClick={handleEditRow(params.id)} />,
        <GridActionsCellItem icon={<Delete />} label="Xóa" onClick={handleDeleteRow(params.id)} />,
        <GridActionsCellItem icon={<Save />} label="Lưu" onClick={handleSaveRow(params.id)} />,
      ],
    },
  ];

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-blue-700">Quản lý doanh thu theo tháng</h1>

      <div className="flex gap-2 mb-4">
        <input
          className="border p-2 rounded"
          placeholder="Tỉnh"
          value={newRow.MA_TINH}
          onChange={e => handleInputChange('MA_TINH', e.target.value)}
        />
        <input
          className="border p-2 rounded"
          placeholder="Tháng"
          type="number"
          value={newRow.Month}
          onChange={e => handleInputChange('Month', e.target.value)}
        />
        <input
          className="border p-2 rounded"
          placeholder="Thực hiện"
          type="number"
          value={newRow.Thuchien}
          onChange={e => handleInputChange('Thuchien', e.target.value)}
        />
        <input
          className="border p-2 rounded"
          placeholder="Đơn vị"
          value={newRow.DONVI}
          onChange={e => handleInputChange('DONVI', e.target.value)}
        />
        <Button variant="contained" color="primary" startIcon={<AddBox />} onClick={handleAddRow}>
          Thêm
        </Button>

        <Button
          variant="outlined"
          component="label"
          startIcon={<UploadFile />}
        >
          Nhập Excel
          <input type="file" hidden accept=".xlsx, .xls" onChange={handleExcelImport} />
        </Button>
      </div>

      <div style={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 20, 50]}
        />
      </div>
    </div>
  );
}
