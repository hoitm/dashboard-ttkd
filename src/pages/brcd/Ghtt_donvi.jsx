// File: src/pages/PscReport_GHTT.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Container, Typography, Button, Grid, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Tooltip
  ,Box 
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import vi from 'date-fns/locale/vi';
import { format } from 'date-fns';
import { FileDownload, CloudDownload } from '@mui/icons-material';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const getGradientColor = (value) => {
  if (value >= 80) return '#d0f0c0';
  if (value >= 60) return '#fff9c4';
  if (value > 0) return '#ffe0b2';
  return '#ffcccb';
};

const getTooltipText = (value) => {
  if (value >= 80) return 'Tốt';
  if (value >= 60) return 'Khá';
  if (value > 0) return 'Trung bình';
  return 'Kém';
};

export default function Ghtt_donvi() {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
const hexToARGB = (hex) => `FF${hex.replace('#', '').toUpperCase()}`;

const columnLabelMap = {
    TTVT_65_1: 'Đơn vị',
    CHUA_CHUYEN_PHIEU: 'Phiếu chưa chuyển',
    TONG_DUAXONG_OB: 'Tổng đưa OB',
    CAN_THUC_HIEN_FIBER: 'Cần làm Fiber',
    CAN_THUC_HIEN_MYTV: 'Cần làm MyTV',
    CAN_THUC_HIEN_MESH: 'Cần làm Mesh',
    TONG_CHUYEN_TS: 'Tổng chuyển trả sau',
    CHUYEN_TS_FIBER: 'Chuyển TS Fiber',
    CHUYEN_TS_MYTV: 'Chuyển TS MyTV',
    CHUYEN_TS_MESH: 'Chuyển TS Mesh',
    TYLE_CHUYEN_TS: 'Tỷ lệ chuyển TS',
    TONG_DATH_GH: 'Tổng đã GH',
    DATH_GH_FIBER: 'GH Fiber',
    DATH_GH_MYTV: 'GH MyTV',
    DATH_GH_MESH: 'GH Mesh',
    TYLE_GIA_HAN: 'Tỷ lệ gia hạn',
    TONG_NGUNG_HUY: 'Tổng ngưng/hủy',
    TONG_DATH_NGUNG: 'Tổng đặt ngưng',
    DATH_NGUNG_FIBER: 'Ngưng Fiber',
    DATH_NGUNG_MYTV: 'Ngưng MyTV',
    DATH_NGUNG_MESH: 'Ngưng Mesh',
    TONG_DATH_THANHLY: 'Tổng thanh lý',
    DATH_THANHLY_FIBER: 'Thanh lý Fiber',
    DATH_THANHLY_MYTV: 'Thanh lý MyTV',
    DATH_THANHLY_MESH: 'Thanh lý Mesh',
    TYLE_HUY: 'Tỷ lệ huỷ',
    CHUA_THUC_HIEN_TONG: 'Chưa thực hiện',
    TYLE_CHUA_THUCHIEN: 'Tỷ lệ chưa TH',
    CHUA_TH_TONG: 'Chưa TH tổng',
    CHUA_TH_TONG_FB: 'Chưa TH Fiber',
    CHUA_TH_TONG_MY_MESH: 'Chưa TH My/Mesh',
    P72_TH_TONG: 'P72 tổng',
    P72_TH_TONG_FB: 'P72 Fiber',
    P72_TH_TONG_MY_MESH: 'P72 My/Mesh',
    con_1_ngay: 'Còn <1 ngày',
    qua_72_h: 'Quá 72 giờ'
  };

  //const getRandomColor = () => `hsl(${Math.floor(Math.random() * 360)}, 70%, 85%)`;
  const getRandomColor = () => `hsl(${Math.floor(Math.random() * 360)}, 70%, 85%)`;

  const fetchData = async () => {
    if (!fromDate || !toDate) return;
    setLoading(true);
    try {
      const res = await axios.post('https://ttkd.vnptphuyen.vn:4488/api/DynamicQuery/execute', {
        databaseType: 'sql',
        functionName: 'POWERBI.DBO.W_GHTT_DONVI_NEW_2025',
        parameters: {
          tu_ngay: format(fromDate, 'dd/MM/yyyy'),
          den_ngay: format(toDate, 'dd/MM/yyyy')
        },
        isRawSql: false
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
      setData(res.data || []);
    } catch (err) {
      console.error('Lỗi khi lấy dữ liệu:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel_old = () => {
    const ws = XLSX.utils.json_to_sheet(data.map((row, idx) => ({ STT: idx + 1, ...row })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'GHTT');
    XLSX.writeFile(wb, 'GHTT_DONVI.xlsx');
  };
 
 const exportToExcel = async () => {
  if (!data || data.length === 0) {
    alert("Không có dữ liệu để xuất.");
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('GHTT');

  const columnGroups = [
    { label: '', keys: ['STT', 'TTVT_65_1'], color: 'BBDEFB' },
    { label: 'Nhóm cần thực hiện', keys: ['CHUA_CHUYEN_PHIEU', 'TONG_DUAXONG_OB', 'CAN_THUC_HIEN_FIBER', 'CAN_THUC_HIEN_MYTV', 'CAN_THUC_HIEN_MESH'], color: 'B3E5FC' },
    { label: 'Chuyển trả sau', keys: ['TONG_CHUYEN_TS', 'CHUYEN_TS_FIBER', 'CHUYEN_TS_MYTV', 'CHUYEN_TS_MESH', 'TYLE_CHUYEN_TS'], color: 'FFE0B2' },
    { label: 'Đã gia hạn', keys: ['TONG_DATH_GH', 'DATH_GH_FIBER', 'DATH_GH_MYTV', 'DATH_GH_MESH', 'TYLE_GIA_HAN'], color: 'C8E6C9' },
    { label: 'Tổng ngưng huỷ', keys: ['TONG_NGUNG_HUY', 'TONG_DATH_NGUNG', 'DATH_NGUNG_FIBER', 'DATH_NGUNG_MYTV', 'DATH_NGUNG_MESH', 'TONG_DATH_THANHLY', 'DATH_THANHLY_FIBER', 'DATH_THANHLY_MYTV', 'DATH_THANHLY_MESH', 'TYLE_HUY'], color: 'F8BBD0' },
    { label: 'Chưa thực hiện', keys: ['CHUA_THUC_HIEN_TONG', 'TYLE_CHUA_THUCHIEN', 'CHUA_TH_TONG', 'CHUA_TH_TONG_FB', 'CHUA_TH_TONG_MY_MESH', 'P72_TH_TONG', 'P72_TH_TONG_FB', 'P72_TH_TONG_MY_MESH', 'con_1_ngay', 'qua_72_h'], color: 'D1C4E9' }
  ];

  const percentCols = ['TYLE_CHUYEN_TS', 'TYLE_GIA_HAN', 'TYLE_HUY', 'TYLE_CHUA_THUCHIEN'];

  const flatHeaders = columnGroups.flatMap(g => g.keys);
  const allKeys = ['STT', 'TTVT_65_1', ...flatHeaders.filter(k => k !== 'TTVT_65_1')];

  // Header 2 dòng
  let col = 1;
  const row1 = worksheet.getRow(1);
  const row2 = worksheet.getRow(2);

  for (const group of columnGroups) {
    const startCol = col;
    for (const key of group.keys) {
      const cell = row2.getCell(col);
      cell.value = columnLabelMap[key] || key;
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: hexToARGB(group.color) } };
      cell.font = { bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' }, bottom: { style: 'thin' } };
      col++;
    }

    const endCol = col - 1;
    if (group.label) {
      worksheet.mergeCells(1, startCol, 1, endCol);
      const mergeCell = worksheet.getCell(1, startCol);
      mergeCell.value = group.label;
      mergeCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      mergeCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: hexToARGB(group.color) } };
      mergeCell.font = { bold: true };
      mergeCell.border = { top: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' }, bottom: { style: 'thin' } };
    } else {
      for (let c = startCol; c <= endCol; c++) {
        worksheet.mergeCells(1, c, 2, c);
      }
    }
  }

  // Dòng dữ liệu
  data.forEach((row, rowIndex) => {
    const r = worksheet.getRow(rowIndex + 3);
    const values = allKeys.map(k => (k === 'STT' ? rowIndex + 1 : row[k] ?? ''));

    values.forEach((value, colIndex) => {
      const cell = r.getCell(colIndex + 1);
      const key = allKeys[colIndex];
      cell.value = value;
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' }, bottom: { style: 'thin' } };

      if (percentCols.includes(key) && typeof value === 'number') {
        cell.numFmt = '0.00"%"';
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: {
            argb: hexToARGB(
              value >= 80 ? '#D0F0C0' : value >= 60 ? '#FFF9C4' : value > 0 ? '#FFE0B2' : '#FFCCCB'
            )
          }
        };
      } else if (typeof value === 'number') {
        cell.numFmt = '#,##0';
      }
    });

    // ➕ Thêm dòng TỔNG
    const totalRow = worksheet.getRow(data.length + 3);
    totalRow.getCell(1).value = 'TỔNG';
    totalRow.getCell(1).font = { bold: true };
    totalRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    totalRow.getCell(1).border = { top: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' }, bottom: { style: 'thin' } };

    totalRow.getCell(2).value = '';
    totalRow.getCell(2).border = { top: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' }, bottom: { style: 'thin' } };

    allKeys.slice(2).forEach((key, colIdx) => {
      const colNumber = colIdx + 3;
      const isPercent = percentCols.includes(key);
      const values = data.map(row => row[key]).filter(val => typeof val === 'number');
      const sum = values.reduce((a, b) => a + b, 0);
      const cell = totalRow.getCell(colNumber);

      if (!isPercent && values.length > 0) {
        cell.value = sum;
        cell.numFmt = '#,##0';
      } else {
        cell.value = '';
      }

      cell.font = { bold: true };
      cell.alignment = { horizontal: 'right', vertical: 'middle' };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' }, bottom: { style: 'thin' } };
    });

  });

  // Auto column width
  worksheet.columns.forEach(col => {
    let maxLength = 10;
    col.eachCell?.(cell => {
      const val = cell.value ? cell.value.toString() : '';
      maxLength = Math.max(maxLength, val.length + 2);
    });
    col.width = maxLength;
  });

  worksheet.views = [{ state: 'frozen', ySplit: 2 }];
  worksheet.protect('ghtt2025', {
    selectLockedCells: true,
    selectUnlockedCells: true,
    formatCells: false,
    formatRows: false,
    formatColumns: false
  });

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `GHTT_DONVI_${new Date().toISOString().slice(0, 10)}.xlsx`);

};


  // Chiều rộng cột tự độ


  const columnGroups = [
   // { label: 'Đơn vị', keys: ['TTVT_65_1'], color: '#e3f2fd' },
    { label: 'Nhóm cần thực hiện', keys: [
      'CHUA_CHUYEN_PHIEU', 'TONG_DUAXONG_OB', 'CAN_THUC_HIEN_FIBER', 'CAN_THUC_HIEN_MYTV', 'CAN_THUC_HIEN_MESH'
    ], color: '#fff9c4' },
    { label: 'Chuyển trả sau', keys: [
      'TONG_CHUYEN_TS', 'CHUYEN_TS_FIBER', 'CHUYEN_TS_MYTV', 'CHUYEN_TS_MESH', 'TYLE_CHUYEN_TS'
    ], color: '#ffe0b2' },
    { label: 'Đã gia hạn', keys: [
      'TONG_DATH_GH', 'DATH_GH_FIBER', 'DATH_GH_MYTV', 'DATH_GH_MESH', 'TYLE_GIA_HAN'
    ], color: '#bbdefb' },
    { label: 'Tổng ngưng hủy', keys: [
      'TONG_NGUNG_HUY', 'TONG_DATH_NGUNG', 'DATH_NGUNG_FIBER', 'DATH_NGUNG_MYTV', 'DATH_NGUNG_MESH',
      'TONG_DATH_THANHLY', 'DATH_THANHLY_FIBER', 'DATH_THANHLY_MYTV', 'DATH_THANHLY_MESH', 'TYLE_HUY'
    ], color: '#f8bbd0' },
    { label: 'Chưa thực hiện', keys: [
      'CHUA_THUC_HIEN_TONG', 'TYLE_CHUA_THUCHIEN', 'CHUA_TH_TONG', 'CHUA_TH_TONG_FB',
      'CHUA_TH_TONG_MY_MESH', 'P72_TH_TONG', 'P72_TH_TONG_FB', 'P72_TH_TONG_MY_MESH', 'con_1_ngay', 'qua_72_h'
    ], color: '#dcedc8' }
  ];

  const percentCols = ['TYLE_CHUYEN_TS', 'TYLE_GIA_HAN', 'TYLE_HUY', 'TYLE_CHUA_THUCHIEN'];
  const columns = columnGroups.flatMap(g => g.keys);

  return (
      <div className="p-2 sm:p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-[98%] mx-auto">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        
      </div>
    <Container maxWidth="xl" sx={{ py: 4  , pb:8 }}   >
      <Typography variant="h5" gutterBottom align="center" fontWeight="bold" color="primary">
        PHÂN TÍCH GIA HẠN THEO ĐƠN VỊ
      </Typography>
 <div className="bg-gradient-to-r p-3 sm:p-4">
        {/* Title and Export Section */}
        <div className="flex flex-wrap sm:flex-nowrap justify-between items-center gap-3 mb-4"></div>
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>   
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
        <Grid container spacing={2} justifyContent="center" alignItems="center" sx={{ mb: 2 }}>
          <Grid item>
            <DatePicker label="Từ ngày" value={fromDate} onChange={setFromDate} slotProps={{ textField: { variant: 'outlined' } }} />
          </Grid>
          <Grid item>
            <DatePicker label="Đến ngày" value={toDate} onChange={setToDate} slotProps={{ textField: { variant: 'outlined' } }} />
          </Grid>
          <Grid item>
            <Button variant="contained" sx={{ height: '56px' }}  startIcon={<CloudDownload />} onClick={fetchData}>Tải dữ liệu</Button>
          </Grid>
          <Grid item>
            <Button variant="outlined" sx={{ height: '56px' }}   startIcon={<FileDownload />} onClick={exportToExcel}>Xuất Excel</Button>
          </Grid>
          <Grid item>
            <Button
  variant="outlined"
  sx={{ height: '56px' }}
  size="large"
  onClick={async () => {
    try {
      const res = await axios.post(
        'https://ttkd.vnptphuyen.vn:4488/api/DynamicQuery/execute',
        {
          databaseType: 'sql',
          functionName: 'POWERBI.DBO.W_GHTT_DONVI_NEW_2025_CHITIET',
          parameters: {
            tu_ngay: format(fromDate, 'dd/MM/yyyy'),
            den_ngay: format(toDate, 'dd/MM/yyyy')
          },
          isRawSql: false
        },
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );

      const json = res.data || [];
      if (json.length === 0) return;

      const worksheet = XLSX.utils.json_to_sheet(json);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'ChiTiet');
      XLSX.writeFile(workbook, 'ChiTiet_GH_TT_Call.xlsx');
    } catch (err) {
      console.error('Lỗi tải chi tiết:', err);
    }
  }}
  startIcon={<FileDownload />}
>
  Tải Excel chi tiết
</Button>

          </Grid>
        </Grid>
      </LocalizationProvider>
 </Box> 
 </div>  
      {loading ? <CircularProgress /> : (
        <TableContainer component={Paper} sx={{ borderRadius: 2, overflowX: 'auto' }}>
          <Table size="small">
 
  
<TableHead>
  <TableRow>
    <TableCell
      rowSpan={2}
      sx={{
        fontWeight: 'bold',
        backgroundColor: '#f5f5f5',
        minWidth: 50,
        border: '1px solid #ccc',
        fontSize: '15px',
        textAlign: 'center',
        padding: '10px 12px'
      }}
    >
      STT
    </TableCell>
    <TableCell
      rowSpan={2}
      sx={{
        fontWeight: 'bold',
        backgroundColor: '#d0f0f0',
        minWidth: 120,
        border: '1px solid #ccc',
        fontSize: '15px',
        textAlign: 'center',
        padding: '10px 12px',
        whiteSpace: 'normal',
        wordWrap: 'break-word'
      }}
    >
      Đơn vị
    </TableCell>
    {columnGroups.map((group, i) => (
      <TableCell
        key={i}
        align="center"
        colSpan={group.keys.length}
        sx={{
          backgroundColor: getRandomColor(),
          fontWeight: 'bold',
          whiteSpace: 'normal',
          wordWrap: 'break-word',
          border: '1px solid #ccc',
          fontSize: '14px',
          padding: '10px'
        }}
      >
        {group.label}
      </TableCell>
    ))}
  </TableRow>
  <TableRow>
    {columnGroups.map(group =>
      group.keys.map((col, j) => (
        <TableCell
          key={col + j}
          align="center"
          sx={{
            fontWeight: 'bold',
            whiteSpace: 'normal',
            wordWrap: 'break-word',
            backgroundColor: '#fdfdfd',
            border: '1px solid #e0e0e0',
            fontSize: '13px',
            padding: '6px 10px',
            lineHeight: 1.4
          }}
        >
          {columnLabelMap[col] || col}
        </TableCell>
      ))
    )}
  </TableRow>
</TableHead>

<TableBody>
  {data.map((row, idx) => (
    <TableRow key={idx} hover>
      <TableCell
        sx={{
          fontWeight: 'bold',
          border: '1px solid #ccc',
          backgroundColor: '#fff',
          padding: '6px 12px',
          fontSize: '13px'
        }}
      >
        {idx + 1}
      </TableCell>
      <TableCell
        sx={{
          border: '1px solid #ccc',
          backgroundColor: '#fff',
          padding: '6px 12px',
          fontSize: '13px',
          fontWeight: 'bold',
          whiteSpace: 'normal'
        }}
      >
        {row.TTVT_65_1}
      </TableCell>
      {columns.filter(col => col !== 'TTVT_65_1').map((col, i) => {
        const val = row[col];
        const isNumber = typeof val === 'number';
        const bg = percentCols.includes(col) && isNumber ? getGradientColor(val) : 'transparent';
        const content = isNumber
          ? percentCols.includes(col)
            ? val.toFixed(2) + '%'
            : val.toLocaleString()
          : val;
        const cell = (
          <TableCell
            key={i}
            align={isNumber ? 'right' : 'left'}
            sx={{
              backgroundColor: bg,
              border: '1px solid #e0e0e0',
              fontSize: '13px',
              padding: '6px 10px',
              whiteSpace: 'normal',
              wordWrap: 'break-word',
              lineHeight: 1.4
            }}
          >
            {content}
          </TableCell>
        );
        return percentCols.includes(col) ? (
          <Tooltip key={i} title={getTooltipText(val)}>{cell}</Tooltip>
        ) : (
          cell
        );
      })}
    </TableRow>
  ))}
  {data.length > 0 && (
    <TableRow sx={{ backgroundColor: '#f0f0f0' }}>
      <TableCell
        sx={{
          fontWeight: 'bold',
          border: '1px solid #ccc',
          fontSize: '13px',
          padding: '6px 12px'
        }}
      >
        TỔNG
      </TableCell>
      <TableCell sx={{ border: '1px solid #ccc' }}></TableCell>
      {columns.filter(col => col !== 'TTVT_65_1').map((col, i) => {
        const isNumber = typeof data[0][col] === 'number';
        const total = isNumber ? data.reduce((sum, item) => sum + (item[col] || 0), 0) : '';
        return (
          <TableCell
            key={i}
            align="right"
            sx={{
              fontWeight: 'bold',
              border: '1px solid #e0e0e0',
              fontSize: '13px',
              padding: '6px 10px',
              whiteSpace: 'normal',
              wordWrap: 'break-word'
            }}
          >
            {percentCols.includes(col) ? '' : isNumber ? total.toLocaleString() : ''}
          </TableCell>
        );
      })}
    </TableRow>
  )}
</TableBody>


          </Table>
        </TableContainer>
      )}
    </Container> 
    </div> 
    </div>
  );
}
