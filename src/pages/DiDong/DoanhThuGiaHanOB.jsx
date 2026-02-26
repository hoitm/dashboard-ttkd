// File: src/pages/DoanhThuGiaHanOB.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box, Typography, Button, Grid, CircularProgress, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Fade
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import vi from 'date-fns/locale/vi';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import { CloudDownload, FileDownload, Assessment } from '@mui/icons-material';

export default function DoanhThuGiaHanOB() {
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  const [dataPY, setDataPY] = useState([]);
  const [dataDLK, setDataDLK] = useState([]);

  const columnGroups = [
    { label: 'Nhân viên', keys: ['TEN_NV', 'HRM'], color: '#e3f2fd' },
    { label: 'Tổng DT OB', keys: ['TONG_DT', 'TONG_DT_TRUOC_OB'], color: '#bbdefb' },
    { label: 'DT CKD', keys: ['TONG_DT_CKD', 'TONG_DT_TRUOC_CKD'], color: '#c8e6c9' },
    { label: 'DT BANGOI', keys: ['TONG_DT_BANGOI', 'TONG_DT_TRUOC_BANGOI'], color: '#ffe0b2' },
    { label: 'DT CKN', keys: ['TONG_DT_CKN', 'TONG_DT_TRUOC_CKN'], color: '#fff9c4' },
    { label: 'DT HVC', keys: ['TONG_DT_HVC', 'TONG_DT_TRUOC_HVC'], color: '#f8bbd0' },
    { label: 'Số lượng', keys: ['SL_CKD', 'SL_BANGOI', 'SL_CKN', 'SL_HVC'], color: '#d1c4e9' }
  ];

  const columns = columnGroups.flatMap(g => g.keys);

  const columnLabelMap = {
    'TEN_NV': 'Tên NV', 'HRM': 'Mã HRM',
    'TONG_DT': 'Tổng DT', 'TONG_DT_TRUOC_OB': 'DT Trước OB',
    'TONG_DT_CKD': 'DT CKD', 'TONG_DT_TRUOC_CKD': 'DT Trước CKD',
    'TONG_DT_BANGOI': 'DT Bán gói', 'TONG_DT_TRUOC_BANGOI': 'DT Trước Bán gói',
    'TONG_DT_CKN': 'DT CKN', 'TONG_DT_TRUOC_CKN': 'DT Trước CKN',
    'TONG_DT_HVC': 'DT HVC', 'TONG_DT_TRUOC_HVC': 'DT Trước HVC',
    'SL_CKD': 'SL CKD', 'SL_BANGOI': 'SL Bán gói',
    'SL_CKN': 'SL CKN', 'SL_HVC': 'SL HVC'
  };

  // ---------------- FETCH PHÚ YÊN ----------------
  const fetchPY = async () => {
    try {
      const res = await axios.post(
        'https://ttkd.vnptphuyen.vn:4488/api/DynamicQuery/execute',
        {
          databaseType: 'sql',
          functionName: 'BSC_PYN.DBO.WEB_DOANHTHU_GIAHAN_OBCCOS',
          parameters: {
            tu_ngay: format(fromDate, 'dd/MM/yyyy'),
            den_ngay: format(toDate, 'dd/MM/yyyy')
          },
          isRawSql: false
        }
      );
      setDataPY(res.data);
    } catch (err) {
      console.error('PY:', err);
    }
  };

  // ---------------- FETCH ĐẮK LẮK ----------------
  const fetchDLK = async () => {
    try {
      const res = await axios.post(
        'https://ttkd.vnptphuyen.vn:4488/api/DynamicQuery/execute',
        {
          databaseType: 'sql',
          functionName: 'BSC_PYN.DBO.WEB_DOANHTHU_GIAHAN_OBCCOS_dlk',
          parameters: {
            tu_ngay: format(fromDate, 'dd/MM/yyyy'),
            den_ngay: format(toDate, 'dd/MM/yyyy')
          },
          isRawSql: false
        }
      );
      setDataDLK(res.data);
    } catch (err) {
      console.error('DLK:', err);
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchPY(), fetchDLK()]);
    setLoading(false);
  };

  // ---------------- EXPORT 2 SHEET ----------------
  const exportExcel2Site = () => {
    const wb = XLSX.utils.book_new();

    // Helper create sheet
    const createSheet = (data, title) => {
      const ws = XLSX.utils.aoa_to_sheet([]);

      const groupHeader = [''];
      columnGroups.forEach(g => groupHeader.push(...Array(g.keys.length).fill(g.label)));

      const subHeader = ['STT', ...columns.map(c => columnLabelMap[c])];

      XLSX.utils.sheet_add_aoa(ws, [groupHeader], { origin: 'A1' });
      XLSX.utils.sheet_add_aoa(ws, [subHeader], { origin: 'A2' });

      const body = data.map((r, i) => [
        i + 1,
        ...columns.map(col => (typeof r[col] === 'number' ? r[col] : r[col] || ''))
      ]);

      XLSX.utils.sheet_add_aoa(ws, body, { origin: 'A3' });

      const totals = ['TỔNG'];
      columns.forEach(col => {
        const t = typeof data[0]?.[col] === 'number'
          ? data.reduce((s, v) => s + (v[col] || 0), 0)
          : '';
        totals.push(t);
      });

      XLSX.utils.sheet_add_aoa(ws, [totals], { origin: `A${data.length + 3}` });

      XLSX.utils.book_append_sheet(wb, ws, title);
    };

    createSheet(dataPY, "SITE_DAK_LAK_DONG");
    createSheet(dataDLK, "SITE_DAK_LAK_TAY");

    XLSX.writeFile(wb, `GiaHanOB_2Site_${format(new Date(), 'ddMMyyyy')}.xlsx`);
  };

  // ---------------- RENDER TABLE ----------------
  const renderTable = (data, title) => (
    <Fade in timeout={500}>
      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 6, mb: 6 }}>
        <Typography variant="h6" align="center" sx={{ pt: 2, color: '#1565c0', fontWeight: 'bold' }}>
          {title}
        </Typography>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell rowSpan={2} sx={{ fontWeight: 'bold', background: '#eee' }}>STT</TableCell>
              {columnGroups.map((g, idx) => (
                <TableCell key={idx} align="center" colSpan={g.keys.length} sx={{ background: g.color }}>
                  <b>{g.label}</b>
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              {columns.map((c, i) => (
                <TableCell key={i} align="center" sx={{ background: '#f5f5f5', fontWeight: 'bold' }}>
                  {columnLabelMap[c]}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {data.map((r, idx) => (
              <TableRow key={idx}>
                <TableCell>{idx + 1}</TableCell>
                {columns.map((col, i) => (
                  <TableCell key={i} align={typeof r[col] === 'number' ? 'right' : 'left'}>
                    {typeof r[col] === 'number'
                      ? r[col].toLocaleString('vi-VN')
                      : r[col] || ''}
                  </TableCell>
                ))}
              </TableRow>
            ))}

            {data.length > 0 && (
              <TableRow sx={{ background: '#eee' }}>
                <TableCell><b>TỔNG</b></TableCell>
                {columns.map((col, i) => {
                  const total = typeof data[0][col] === 'number'
                    ? data.reduce((s, v) => s + (v[col] || 0), 0)
                    : '';
                  return (
                    <TableCell key={i} align="right"><b>{total?.toLocaleString('vi-VN')}</b></TableCell>
                  );
                })}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Fade>
  );

  useEffect(() => { fetchAll(); }, []);
// sx={{ py: 4, pb: 8 }}
  return (
    <div className="p-4  pb: 8 bg-gray-100 min-h-screen">
      <div className="max-w-[98%] mx-auto">

        {/* Bộ lọc + Export */}
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
  <Box
    sx={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: 2,
      mb: 3,
      justifyContent: 'center'
    }}
  >

    {/* TỪ NGÀY */}
    <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 auto' } }}>
      <DatePicker
        label="Từ ngày"
        value={fromDate}
        onChange={setFromDate}
        slotProps={{
          textField: {
            fullWidth: true,
            size: 'medium',
          }
        }}
      />
    </Box>

    {/* ĐẾN NGÀY */}
    <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 auto' } }}>
      <DatePicker
        label="Đến ngày"
        value={toDate}
        onChange={setToDate}
        slotProps={{
          textField: {
            fullWidth: true,
            size: 'medium',
          }
        }}
      />
    </Box>

    {/* BUTTON TẢI DỮ LIỆU */}
    <Button
      variant="contained"
      startIcon={<CloudDownload />}
      onClick={fetchAll}
      sx={{
        height: 56,
        flex: { xs: '1 1 100%', sm: '0 0 auto' },
        fontWeight: 'bold'
      }}
    >
      TẢI DỮ LIỆU
    </Button>

    {/* BUTTON XUẤT EXCEL */}
    <Button
      variant="outlined"
      startIcon={<FileDownload />}
      onClick={exportExcel2Site}
      sx={{
        height: 56,
        flex: { xs: '1 1 100%', sm: '0 0 auto' },
        fontWeight: 'bold'
      }}
    >
      XUẤT EXCEL 2 SITE
    </Button>

  </Box>
</LocalizationProvider>

        {loading && <Grid container justifyContent="center"><CircularProgress /></Grid>}

        {!loading && renderTable(dataPY, "SITE ĐẮK LẮK ĐÔNG")}
        {!loading && renderTable(dataDLK, "SITE ĐẮK LẮK TÂY")}
      </div>
    </div>
  );
}
