// 🔥 PlanManager.jsx (React + Vite + MUI + Excel Import + .NET API Ready + Dynamic Đơn vị + ma_dv support)

import React, { useEffect, useState } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, IconButton, Typography, Paper, Select, InputLabel, FormControl,
  Autocomplete, CircularProgress
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DataGrid } from '@mui/x-data-grid';
import { Add, Edit, Delete, UploadFile } from '@mui/icons-material';
import * as XLSX from 'xlsx';
import axios from 'axios';

const timeTypes = ['Ngày', 'Tuần', 'Tháng', 'Quý', 'Năm'];

export default function PlanManager() {
  const [plans, setPlans] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ id: null, donVi: '', ma_dv: '', kpi: '', soLuong: '', thoiGian: '', loai: 'Tháng' });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [donViList, setDonViList] = useState([]);
  const [loadingDV, setLoadingDV] = useState(false);

  useEffect(() => {
    fetchPlans();
    fetchDonVi();
  }, []);

  useEffect(() => {
    handleDateChange(selectedDate);
  }, [selectedDate, form.loai]);

  const fetchPlans = async () => {
    const res = await axios.get('/api/kehoach');
    setPlans(res.data);
  };

  const fetchDonVi = async () => {
    setLoadingDV(true);
    try {
      const res = await axios.post('https://ttkd.vnptphuyen.vn:4488/api/DynamicQuery/execute', {
        databaseType: 'sql',
        functionName: `select ten_dv , donvi_id, MA_DV from ONE_BSS.admin.v_donvi WHERE TEN_DV LIKE N'Tổ kỹ%' UNION ALL select ten_dv , donvi_id, MA_DV from ONE_BSS.admin.v_donvi WHERE TEN_DV LIKE N'Phòng bán%' AND MA_DV LIKE N'VNP%' UNION ALL select ten_dv , donvi_id, MA_DV from ONE_BSS.admin.v_donvi WHERE TEN_DV LIKE N'TTVT%' AND MA_DV LIKE N'PYN%'`,
        parameters: {},
        isRawSql: true
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
      const mapped = res.data.map(item => ({ label: item.ten_dv, value: item.donvi_id, ma_dv: item.MA_DV }));
      setDonViList(mapped);
    } catch (err) {
      console.error('Lỗi tải đơn vị:', err);
    } finally {
      setLoadingDV(false);
    }
  };

  const handleSubmit = async () => {
    const finalForm = { ...form, thoiGian: form.thoiGian.toString() };
    if (form.id) {
      await axios.put(`/api/kehoach/${form.id}`, finalForm);
    } else {
      await axios.post('/api/kehoach', finalForm);
    }
    setOpen(false);
    fetchPlans();
  };

  const handleDelete = async (id) => {
    await axios.delete(`/api/kehoach/${id}`);
    fetchPlans();
  };

  const handleEdit = (row) => {
    setForm(row);
    setSelectedDate(new Date());
    setOpen(true);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    let thoiGianStr = '';
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    switch (form.loai) {
      case 'Ngày':
        thoiGianStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        break;
      case 'Tháng':
        thoiGianStr = `${year}${month.toString().padStart(2, '0')}`;
        break;
      case 'Quý':
        thoiGianStr = `${year}Q${Math.ceil(month / 3)}`;
        break;
      case 'Tuần': {
        const week = getWeekOfYear(date);
        thoiGianStr = `${year}W${week.toString().padStart(2, '0')}`;
        break;
      }
      case 'Năm':
        thoiGianStr = `${year}`;
        break;
    }

    setForm(f => ({ ...f, thoiGian: thoiGianStr }));
  };

  const getWeekOfYear = (date) => {
    const firstJan = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstJan) / 86400000;
    return Math.ceil((pastDaysOfYear + firstJan.getDay() + 1) / 7);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const wb = XLSX.read(evt.target.result, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws);
      const formatted = data.map((row, index) => ({
        id: Date.now() + index,
        donVi: row['Đơn vị'],
        kpi: row['KPI'],
        soLuong: row['Số lượng'],
        thoiGian: row['Thời gian'],
        loai: row['Loại thời gian'] || 'Tháng'
      }));
      await axios.post('/api/kehoach/import', formatted);
      fetchPlans();
    };
    reader.readAsBinaryString(file);
  };

  const columns = [
    { field: 'donVi', headerName: 'Đơn vị', flex: 1 },
    { field: 'kpi', headerName: 'KPI', flex: 1 },
    { field: 'soLuong', headerName: 'Số lượng', flex: 1 },
    { field: 'thoiGian', headerName: 'Thời gian', flex: 1 },
    { field: 'loai', headerName: 'Loại', flex: 1 },
    {
      field: 'actions', headerName: '', flex: 1, sortable: false, renderCell: (params) => (
        <>
          <IconButton onClick={() => handleEdit(params.row)}><Edit /></IconButton>
          <IconButton onClick={() => handleDelete(params.row.id)}><Delete /></IconButton>
        </>
      )
    }
  ];

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom fontWeight="bold">📈 Kế hoạch Giao KPI</Typography>

      <Paper sx={{ p: 2, mb: 2, display: 'flex', gap: 2 }}>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>Thêm kế hoạch</Button>
        <Button variant="outlined" component="label" startIcon={<UploadFile />}>
          Tải Excel
          <input type="file" hidden accept=".xlsx,.xls" onChange={handleFileUpload} />
        </Button>
      </Paper>

      <DataGrid
        autoHeight
        rows={plans}
        columns={columns}
        getRowId={(row) => row.id || row.Id || `${row.donVi}-${row.kpi}-${row.thoiGian}-${Math.random()}`}
        pageSize={10}
        rowsPerPageOptions={[10]}
      />

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{form.id ? 'Cập nhật kế hoạch' : 'Thêm kế hoạch'}</DialogTitle>
        <DialogContent>
          <Autocomplete
            options={donViList}
            getOptionLabel={(option) => option.label || ''}
            loading={loadingDV}
            fullWidth
            value={donViList.find(dv => dv.label === form.donVi) || null}
            onChange={(e, value) => setForm(f => ({ ...f, donVi: value?.label || '', ma_dv: value?.ma_dv || '' }))}
            renderInput={(params) => (
              <TextField {...params} label="Đơn vị" fullWidth sx={{ mt: 2 }} />
            )}
          />

          <TextField fullWidth label="KPI" value={form.kpi} onChange={e => setForm(f => ({ ...f, kpi: e.target.value }))} sx={{ mt: 2 }} />
          <TextField fullWidth label="Số lượng" type="number" value={form.soLuong} onChange={e => setForm(f => ({ ...f, soLuong: e.target.value }))} sx={{ mt: 2 }} />

          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Loại thời gian</InputLabel>
            <Select
              value={form.loai}
              label="Loại thời gian"
              onChange={e => setForm(f => ({ ...f, loai: e.target.value }))}
            >
              {timeTypes.map(type => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Thời gian"
              value={selectedDate}
              onChange={(newVal) => setSelectedDate(newVal)}
              sx={{ mt: 2, width: '100%' }}
            />
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained">Lưu</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
