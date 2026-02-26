// File: src/pages/DoanhThuGiaHanOB.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box, Typography, Button, Grid, CircularProgress, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Fade, Tooltip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import vi from 'date-fns/locale/vi';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import { CloudDownload, FileDownload ,Assessment } from '@mui/icons-material';

export default function DoanhThuGiaHanOB() {
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  const columnGroups = [
    { label: 'Nhân viên', keys: ['TEN_NV', 'HRM'], color: '#e3f2fd' },
    { label: 'Tổng DT OB', keys: ['TONG_DT', 'TONG_DT_TRUOC_OB'], color: '#bbdefb' },
    { label: 'DT CKD', keys: ['TONG_DT_CKD', 'TONG_DT_TRUOC_CKD'], color: '#c8e6c9' },
    { label: 'DT BANGOI', keys: ['TONG_DT_BANGOI', 'TONG_DT_TRUOC_BANGOI'], color: '#ffe0b2' },
    { label: 'DT CKN', keys: ['TONG_DT_CKN', 'TONG_DT_TRUOC_CKN'], color: '#fff9c4' },
    { label: 'DT HVC', keys: ['TONG_DT_HVC', 'TONG_DT_TRUOC_HVC'], color: '#f8bbd0' },
    { label: 'Số lượng', keys: ['SL_CKD', 'SL_BANGOI', 'SL_CKN', 'SL_HVC'], color: '#d1c4e9' }
  ];

  const columns = columnGroups.flatMap(group => group.keys);

  const columnLabelMap = {
    'TEN_NV': 'Tên NV',
    'HRM': 'Mã HRM',
    'TONG_DT': 'Tổng DT',
    'TONG_DT_TRUOC_OB': 'DT Trước OB',
    'TONG_DT_CKD': 'DT CKD',
    'TONG_DT_TRUOC_CKD': 'DT Trước CKD',
    'TONG_DT_BANGOI': 'DT Bán gói',
    'TONG_DT_TRUOC_BANGOI': 'DT Trước Bán gói',
    'TONG_DT_CKN': 'DT CKN',
    'TONG_DT_TRUOC_CKN': 'DT Trước CKN',
    'TONG_DT_HVC': 'DT HVC',
    'TONG_DT_TRUOC_HVC': 'DT Trước HVC',
    'SL_CKD': 'SL CKD',
    'SL_BANGOI': 'SL Bán gói',
    'SL_CKN': 'SL CKN',
    'SL_HVC': 'SL HVC'
  };

  const fetchData = async () => {
    setLoading(true);
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
        },
        { headers: { 'Content-Type': 'application/json' } }
      );
      setData(res.data);
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.aoa_to_sheet([]);
    const groupHeader = [''];
    columnGroups.forEach(g => groupHeader.push(...Array(g.keys.length).fill(g.label)));
    const subHeader = ['STT', ...columns.map(c => columnLabelMap[c] || c)];
    XLSX.utils.sheet_add_aoa(ws, [groupHeader], { origin: 'A1' });
    XLSX.utils.sheet_add_aoa(ws, [subHeader], { origin: 'A2' });
    const bodyData = data.map((row, i) => ([i + 1, ...columns.map(col => row[col])]))
    XLSX.utils.sheet_add_aoa(ws, bodyData, { origin: 'A3' });
    const totals = ['TỔNG'];
    columns.forEach(col => {
      const isNum = typeof data[0]?.[col] === 'number';
      const total = isNum ? data.reduce((sum, item) => sum + (item[col] || 0), 0) : '';
      totals.push(isNum ? total : '');
    });
    XLSX.utils.sheet_add_aoa(ws, [totals], { origin: `A${data.length + 3}` });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'GiaHanOB');
    XLSX.writeFile(wb, 'GiaHanOB_Report.xlsx');
  };

  useEffect(() => {
    const autoFillDate = async () => {
      try {
        const res = await axios.post(
         'https://ttkd.vnptphuyen.vn:4488/api/DynamicQuery/execute',
          {
            databaseType: 'sql',
            functionName: ' SELECT MAX(ngay_psc) ngay_psc FROM (select max(NGAYMODICHVU) ngay_psc from  bsc_pyn.dbo.AUTOCALL_OBCCOS_PROGRAM_CKN UNION  select max(NGAYMODICHVU) ngay_psc from  bsc_pyn.dbo.AUTOCALL_OBCCOS_PROGRAM_CKd) a',
            parameters: {},
            isRawSql: true
          },
          { headers: { 'Content-Type': 'application/json' } }
        );
        const fetchedDate = res.data[0]?.ngay_psc;
        if (fetchedDate) {
          const date = new Date(fetchedDate);
          setFromDate(date);
          setToDate(date);
          fetchData();
        }
      } catch (error) {
        console.error('Lỗi khi tự động lấy ngày PSC:', error);
        fetchData(); // fallback nếu lỗi vẫn fetch dữ liệu
      }
    };
    autoFillDate();
  }, []);

  return (
      <div className="p-2 sm:p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-[98%] mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100"></div>
            <Box sx={{ width: '100%', overflowX: 'auto', px: 2, pb:8 }}>
              <Typography variant="h5" align="center" color='blue' fontWeight="bold" gutterBottom>
                DOANH THU GIA HẠN OB OBCCOS
              </Typography>
          <div className="bg-gradient-to-r p-3 sm:p-4">
            {/* Title and Export Section */}
            <div className="flex flex-wrap sm:flex-nowrap justify-between items-center gap-3 mb-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Assessment className="text-blue text-2xl sm:text-3xl" />   
              </div>
              
        
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
        <Grid container spacing={2} justifyContent="center" sx={{ mb: 2, flexWrap: 'wrap' }}>
          <Grid item>
            <DatePicker
              label="Từ ngày"
              value={fromDate}
              onChange={(newValue) => setFromDate(newValue)}
              slotProps={{ textField: { variant: 'outlined', size: 'medium', sx: { minWidth: 180 } } }}
            />
          </Grid>
          <Grid item>
            <DatePicker
              label="Đến ngày"
              value={toDate}
              onChange={(newValue) => setToDate(newValue)}
              slotProps={{ textField: { variant: 'outlined', size: 'medium', sx: { minWidth: 180 } } }}
            />
          </Grid>
          <Grid item>
            <Button variant="contained"  sx={{ height: '56px' }}  size="large" startIcon={<CloudDownload />} onClick={fetchData}>
              Tải dữ liệu
            </Button>
          </Grid>
          <Grid item>
            <Button variant="outlined" sx={{ height: '56px' }}  size="large" startIcon={<FileDownload />} onClick={exportToExcel}>
              Xuất Excel
            </Button>
          </Grid>
        </Grid>
      </LocalizationProvider>
    </div>    
    
     </div>
      {loading ? (
        <Grid container justifyContent="center"><CircularProgress /></Grid>
      ) : (
        <Fade in timeout={500}>
          <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 6 }}>
            <Table size="small" sx={{ borderCollapse: 'collapse', width: '100%' }}>
              <TableHead>
                <TableRow>
                  <TableCell rowSpan={2} sx={{ fontWeight: 'bold', backgroundColor: '#eeeeee', border: '1px solid #ccc' }}>STT</TableCell>
                  {columnGroups.map((group, idx) => (
                    <TableCell
                      key={idx}
                      align="center"
                      colSpan={group.keys.length}
                      sx={{ backgroundColor: group.color, fontWeight: 'bold', border: '1px solid #ccc' }}
                    >
                      {group.label}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  {columns.map((col, i) => (
                    <TableCell
                      key={i}
                      align="center"
                      sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', minWidth: 120, border: '1px solid #ccc' }}
                    >
                      {columnLabelMap[col] || col.replaceAll('_', ' ')}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row, idx) => (
                  <TableRow key={idx} hover>
                    <TableCell sx={{ border: '1px solid #ccc' }}>{idx + 1}</TableCell>
                    {columns.map((col, i) => (
                      <TableCell key={i} align={typeof row[col] === 'number' ? 'right' : 'left'} sx={{ border: '1px solid #ccc' }}>
                        {typeof row[col] === 'number'
                          ? row[col].toLocaleString('vi-VN')
                          : row[col] || ''}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                {data.length > 0 && (
                  <TableRow sx={{ backgroundColor: '#f0f0f0' }}>
                    <TableCell sx={{ border: '1px solid #ccc' }}><strong>TỔNG</strong></TableCell>
                    {columns.map((col, i) => {
                      const total = typeof data[0][col] === 'number'
                        ? data.reduce((sum, item) => sum + (item[col] || 0), 0)
                        : '';
                      return (
                        <TableCell key={i} align="right" sx={{ fontWeight: 'bold', border: '1px solid #ccc' }}>
                          {typeof total === 'number' ? total.toLocaleString('vi-VN') : ''}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Fade>
      )}
    </Box>
    </div>
     </div>
      
  );
}
