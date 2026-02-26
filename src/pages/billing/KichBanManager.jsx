// ✅ Giao diện quản lý kịch bản cực kỳ VIP - React + MUI + Vite
// Hỗ trợ: Thêm / Sửa / Xoá / Khoá kịch bản + soạn SQL đẹp + gửi Telegram + nhóm động + full-width SQL editor

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, MenuItem, FormControlLabel, Switch, Typography, IconButton,
  Select, InputLabel, FormControl, Grid, Tooltip, Chip
} from '@mui/material';
import { Add, Edit, Delete, Lock } from '@mui/icons-material';
import Editor from '@monaco-editor/react';
import RefreshIcon from '@mui/icons-material/Refresh';

export default function KichBanManager() {
  const [data, setData] = useState([]);
  const [nhomList, setNhomList] = useState([]);
  const [selectedNhom, setSelectedNhom] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({
    tieu_de: '', nhomks_id: '', DATASOURCE: '', isOracle: false,
    isSendTelegram: false, noi_dung: ''
  });

  useEffect(() => {
    fetchNhom();
  }, []);

  useEffect(() => {
    if (selectedNhom) fetchData();
  }, [selectedNhom]);

  const fetchData = async () => {
    const res = await axios.post('https://ttkd.vnptphuyen.vn:4488/api/DynamicQuery/execute', {
      databaseType: 'sql',
      functionName: `SELECT ks.*, nh.ten_nhom FROM BSC_PYN.DBO.CRM_KIEMSOAT ks JOIN BSC_PYN.DBO.CRM_NHOMKS nh ON ks.nhomks_id = nh.nhomks_id WHERE ks.hieu_luc = 1 AND ks.nhomks_id = '${selectedNhom}' ORDER BY nh.stt, ks.stt`,
      parameters: {}, isRawSql: true
    });
    setData(res.data);
  };

  const fetchNhom = async () => {
    const res = await axios.post('https://ttkd.vnptphuyen.vn:4488/api/DynamicQuery/execute', {
      databaseType: 'sql',
      functionName: `SELECT nhomks_id, ten_nhom FROM BSC_PYN.DBO.CRM_NHOMKS ORDER BY stt`,
      parameters: {}, isRawSql: true
    });
    setNhomList(res.data);
    if (res.data.length > 0) setSelectedNhom(res.data[0].nhomks_id);
  };

  const openAddDialog = () => {
    setEditingItem(null);
    setForm({ tieu_de: '', nhomks_id: selectedNhom, DATASOURCE: '', isOracle: false, isSendTelegram: false, noi_dung: '' });
    setOpenDialog(true);
  };

  const openEditDialog = (item) => {
    setEditingItem(item);
    setForm(item);
    setOpenDialog(true);
  };

  const handleSave = async () => {
    const url = editingItem ? '/api/Script/update' : '/api/Script/create';
    await axios.post(`https://ttkd.vnptphuyen.vn:4488${url}`, form);
    setOpenDialog(false);
    fetchData();
  };

  const handleDelete = async (item) => {
    if (confirm('Xác nhận xoá?')) {
      await axios.post('https://ttkd.vnptphuyen.vn:4488/api/Script/delete', { id: item.kiemsoat_id });
      fetchData();
    }
  };

  const handleLock = async (item) => {
    await axios.post('https://ttkd.vnptphuyen.vn:4488/api/Script/lock', { id: item.kiemsoat_id });
    fetchData();
  };

  return (
    <Box sx={{ background: '#f7f9fc', minHeight: '100vh', p: 1 , pb:8}} p={3} pb={8}>
      <Typography variant="h5" gutterBottom>📚 Quản lý kịch bản kiểm soát</Typography>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={4}>
         <FormControl fullWidth sx={{ minWidth: 200 }}>
            <InputLabel id="nhom-select-label">Chọn nhóm</InputLabel>
            <Select
                labelId="nhom-select-label"
                id="nhom-select"
                value={selectedNhom}
                label="Chọn nhóm"
                onChange={e => setSelectedNhom(e.target.value)}
            >
            {nhomList.map(n => (
            <MenuItem key={n.nhomks_id} value={n.nhomks_id}>
                {n.ten_nhom}
            </MenuItem>
            ))}
            </Select>
        </FormControl>

        </Grid>
        <Grid item>
          <Button variant="contained" sx={{ height: '56px' }}  startIcon={<Add />} onClick={openAddDialog}>Thêm mới</Button>
        </Grid>
      </Grid>

      <Box mt={3}>
        {data.map(item => (
          <Box key={item.kiemsoat_id} mb={2} p={2} border="1px solid #ccc" borderRadius={2}>
            <Grid container spacing={1} alignItems="center">
              <Grid item xs={12} md={6}><Typography  color='blue'><b>{item.tieu_de}</b> ({item.ten_nhom})</Typography></Grid>
              <Grid item><Chip label={item.isOracle ? 'Oracle' : 'SQL'} color={item.isOracle ? 'warning' : 'info'} /></Grid>
              <Grid item><Chip label={item.isSendTelegram ? 'Gửi Telegram' : 'Không gửi'} color={item.isSendTelegram ? 'success' : 'default'} /></Grid>
              <Grid item>
                <Tooltip title="Sửa"><IconButton onClick={() => openEditDialog(item)}><Edit /></IconButton></Tooltip>
                <Tooltip title="Khoá"><IconButton onClick={() => handleLock(item)}><Lock /></IconButton></Tooltip>
                <Tooltip title="Xoá"><IconButton onClick={() => handleDelete(item)}><Delete color="error" /></IconButton></Tooltip>
              </Grid>
            </Grid>
          </Box>
        ))}
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="xl" fullWidth>
        <DialogTitle>{editingItem ? 'Cập nhật' : 'Thêm mới'} kịch bản</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Tiêu đề" value={form.tieu_de} onChange={e => setForm(f => ({ ...f, tieu_de: e.target.value }))} />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Nhóm</InputLabel>
                <Select value={form.nhomks_id} onChange={e => setForm(f => ({ ...f, nhomks_id: e.target.value }))}>
                  {nhomList.map(n => <MenuItem key={n.nhomks_id} value={n.nhomks_id}>{n.ten_nhom}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Datasource" value={form.DATASOURCE} onChange={e => setForm(f => ({ ...f, DATASOURCE: e.target.value }))} />
            </Grid>
            <Grid item xs={6} md={3}>
              <FormControlLabel control={<Switch checked={form.isOracle} onChange={e => setForm(f => ({ ...f, isOracle: e.target.checked }))} />} label="Oracle" />
            </Grid>
            <Grid item xs={6} md={3}>
              <FormControlLabel control={<Switch checked={form.isSendTelegram} onChange={e => setForm(f => ({ ...f, isSendTelegram: e.target.checked }))} />} label="Gửi Telegram" />
            </Grid>
           
          </Grid>
          <Grid>
 <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>Nội dung SQL</Typography>
              <Box border="1px solid #ccc" borderRadius={2} sx={{ width: '100%', minHeight: '600px' }}>
                <Editor
                  height="600px"
                  width="100%"
                  language="sql"
                  theme="vs-dark"
                  value={form.noi_dung}
                  onChange={val => setForm(f => ({ ...f, noi_dung: val }))}
                  options={{
                    fontSize: 16,
                    wordWrap: "on",
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    minimap: { enabled: true },
                    tabSize: 2,
                    formatOnType: true,
                    formatOnPaste: true,
                    lineNumbers: "on",
                    smoothScrolling: true,
                    padding: { top: 12, bottom: 12 }
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Huỷ</Button>
          <Button variant="contained" onClick={handleSave}>Lưu</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
