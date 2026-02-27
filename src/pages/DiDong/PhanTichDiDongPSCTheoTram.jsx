// File: src/pages/PscReport.jsx
import React, { useEffect, useState } from 'react';
import { getNgayPscMax, getPhanTichPscDtTheoMau } from '../../services/didongApi';
import {
  Container, Typography, Button, Grid, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Fade, Tooltip,
  Switch, FormControlLabel 
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import vi from 'date-fns/locale/vi';
import { format } from 'date-fns';
import { FileDownload, CloudDownload } from '@mui/icons-material';
import * as XLSX from 'xlsx';
import { blue } from '@mui/material/colors';
//import { Tooltip } from '@mui/material';

const getGradientColor = (value) => {
  if (value >= 110) return '#d0f0c0'; // xanh lá nhạt (tốt)
  if (value >= 100) return '#f0f8ff'; // xanh nhẹ (ổn)
  if (value >= 90) return '#fff9c4';  // vàng (cảnh báo)
  if (value > 0) return '#ffe0b2';    // cam nhạt (thấp)
  return '#ffcccb'; // đỏ nhạt (rất thấp hoặc âm)
};

const getTooltipText = (value) => {
  if (value >= 110) return 'Hiệu quả vượt mức (>= 110%)';
  if (value >= 100) return 'Đạt chỉ tiêu (>= 100%)';
  if (value >= 90) return 'Cần chú ý (>= 90%)';
  if (value > 0) return 'Dưới mức yêu cầu (< 90%)';
  return 'Rất thấp hoặc âm';
};



export default function PhanTichDiDongPSCTheoTram() {
  const [ngayPsc, setNgayPsc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [distinctDates, setDistinctDates] = useState({});
  const [isKyTruoc, setIsKyTruoc] = useState(false);
  //isKyTruoc 
const baseLabelMap = {
  'TEN_DV': 'Phòng bán hàng',
  'TOTAL_TKC': 'Doanh thu TKC tháng này',
  'TOTAL_TKC_T': 'Doanh thu TKC tháng trước',
  'TOTAL_TKC_CHENH_LECK': 'Chênh lệch doanh thu TKC',
  'TL_TKC': 'Tỷ lệ % TKC',
  'SL_PSC_HT': 'TB hoạt động tháng này',
  'SL_PSC_TT': 'TB hoạt động tháng trước',
  'SL_PSC_LECH': 'Chênh lệch thuê bao hoạt động',
  'SL_NEW_HT': 'TB phát sinh mới tháng này',
  'SL_NEW_TT': 'TB phát sinh mới tháng trước',
  'TKC_CALL': 'Doanh thu CALL tháng này',
  'TKC_CALL_T': 'Doanh thu CALL tháng trước',
  'TKC_CALL_CHENH_LECK': 'Chênh lệch doanh thu CALL',
  'TL_TKC_CALL': 'Tỷ lệ % CALL',
  'TKC_SMS': 'Doanh thu SMS tháng này',
  'TKC_SMS_T': 'Doanh thu SMS tháng trước',
  'TKC_SMS_CHENH_LECK': 'Chênh lệch doanh thu SMS',
  'TL_TKC_SMS': 'Tỷ lệ % SMS',
  'TKC_DATA': 'Doanh thu DATA tháng này',
  'TKC_DATA_T': 'Doanh thu DATA tháng trước',
  'TKC_DATA_CHENH_LECK': 'Chênh lệch DATA',
  'TL_TKC_DATA': 'Tỷ lệ % DATA',
  'TKC_VAS': 'Doanh thu VAS tháng này',
  'TKC_VAS_T': 'Doanh thu VAS tháng trước',
  'TKC_VAS_CHENH_LECK': 'Chênh lệch VAS',
  'TL_TKC_VAS': 'Tỷ lệ % VAS',
  'TKC_OTHER': 'Doanh thu khác tháng này',
  'TKC_OTHER_T': 'Doanh thu khác tháng trước',
  'TKC_OTHER_CHENH_LECK': 'Chênh lệch khác',
  'TL_TKC_OTHER': 'Tỷ lệ % khác'
};
const columnLabelMap = Object.fromEntries(
    Object.entries(baseLabelMap).map(([key, label]) => [
      key,
      isKyTruoc ? label.replace('tháng trước', 'kỳ trước') : label
    ])
  );

  const fetchNgayPsc = async () => {
    try {
      const data = await getNgayPscMax();
      // API call in service returns response.data directly
      const fetchedDate = data[0]?.ngay_psc;
      if (fetchedDate) setNgayPsc(new Date(fetchedDate));
    } catch (error) {
      console.error('Lỗi khi lấy ngày phát sinh:', error);
    }
  };

  const fetchData = async () => {
    if (!ngayPsc) return;
    setLoading(true);
    try {
      const formattedDate = format(ngayPsc, 'dd/MM/yyyy');
      const data = await getPhanTichPscDtTheoMau(formattedDate, isKyTruoc ? 1 : 0);

      const rawData = data || [];
      const distinct = rawData.length > 0 ? {
        NGAY_PSC_HT: rawData[0].NGAY_PSC_HT,
        NGAY_PSC_TT: rawData[0].NGAY_PSC_TT
      } : {};

      const cleanedData = rawData.map(({ NGAY_PSC_HT, NGAY_PSC_TT, TO_DATE_HT, TO_DATE_TT, SAPXEP, ...rest }) => rest);
      setDistinctDates(distinct);
      setData(cleanedData);
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu:', error);
    } finally {
      setLoading(false);
    }
  };

 const exportToExcel = () => {
  const columnOrder = Object.keys(columnLabelMap);

  const formattedData = data.map((row) => {
    const formattedRow = {};
    columnOrder.forEach((key) => {
      const label = columnLabelMap[key];
      const value = row[key];
      if (typeof value === 'number') {
        if (key.startsWith('TL_')) {
          formattedRow[label] = parseFloat(value.toFixed(2));
        } else {
          formattedRow[label] = value;
        }
      } else {
        formattedRow[label] = value || '';
      }
    });
    return formattedRow;
  });

  const ws = XLSX.utils.aoa_to_sheet([]);

  // Merge header cells
  const groupHeaders = [
    ['Đơn vị'],
    ['Tổng doanh thu TKC', '', '', ''],
    ['Thuê bao hoạt động', '', '', '', ''],
    ['Doanh thu CALL', '', '', ''],
    ['Doanh thu SMS', '', '', ''],
    ['Doanh thu DATA', '', '', ''],
    ['Doanh thu VAS', '', '', ''],
    ['Doanh thu khác', '', '', '']
  ];
  const columnKeys = columnOrder;
  const headerLabels = columnKeys.map((key) => columnLabelMap[key] || key);

  const mergedHeaders = ['STT', ...headerLabels];

  XLSX.utils.sheet_add_aoa(ws, [['', ...groupHeaders.flat()]], { origin: 'A1' });
  XLSX.utils.sheet_add_aoa(ws, [mergedHeaders], { origin: 'A2' });
  XLSX.utils.sheet_add_json(ws, formattedData.map((r, i) => ({ STT: i + 1, ...r })), { origin: 'A3', skipHeader: true });

  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } }, // STT
    { s: { r: 0, c: 1 }, e: { r: 1, c: 1 } }, // TEN_DV
    { s: { r: 0, c: 2 }, e: { r: 0, c: 5 } },
    { s: { r: 0, c: 6 }, e: { r: 0, c: 10 } },
    { s: { r: 0, c: 11 }, e: { r: 0, c: 14 } },
    { s: { r: 0, c: 15 }, e: { r: 0, c: 18 } },
    { s: { r: 0, c: 19 }, e: { r: 0, c: 22 } },
    { s: { r: 0, c: 23 }, e: { r: 0, c: 26 } },
    { s: { r: 0, c: 27 }, e: { r: 0, c: 30 } }
  ];

  ws['!cols'] = mergedHeaders.map(label => ({ wch: label.length + 8 }));

  // Custom formatting styles not supported directly by XLSX unless using a style-aware writer
  // Apply styles to all cells: center align, bold header, border
Object.keys(ws).forEach((cellKey) => {
  if (!cellKey.startsWith('!')) {
    const cell = ws[cellKey];
    const cellRef = XLSX.utils.decode_cell(cellKey);

    // First two header rows (row 0 and 1) bold and centered
    if (cellRef.r <= 1) {
      cell.s = {
        font: { bold: true, name: 'Arial' },
        alignment: { vertical: 'center', horizontal: 'center' },
        border: {
          top: { style: 'thin', color: { rgb: '000000' } },
          bottom: { style: 'thin', color: { rgb: '000000' } },
          left: { style: 'thin', color: { rgb: '000000' } },
          right: { style: 'thin', color: { rgb: '000000' } }
        }
      };
    } else {
      cell.s = {
        alignment: { vertical: 'center', horizontal: 'center' },
        border: {
          top: { style: 'thin', color: { rgb: 'cccccc' } },
          bottom: { style: 'thin', color: { rgb: 'cccccc' } },
          left: { style: 'thin', color: { rgb: 'cccccc' } },
          right: { style: 'thin', color: { rgb: 'cccccc' } }
        }
      };
    }
  }
}
);

const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'PSC_Report');
  XLSX.writeFile(wb, 'PSC_Report.xlsx');
};



  useEffect(() => {
    fetchNgayPsc().then(() => setTimeout(fetchData, 300));
  }, []);

  const percentCols = [
    'TL_TKC', 'TL_TKC_CALL', 'TL_TKC_SMS', 'TL_TKC_DATA', 'TL_TKC_VAS', 'TL_TKC_OTHER'
  ];

  const columnGroups = [
    { label: 'Đơn vị', keys: ['TEN_DV'], color: '#e3f2fd' },
    { label: 'Tổng doanh thu TKC', keys: ['TOTAL_TKC', 'TOTAL_TKC_T', 'TOTAL_TKC_CHENH_LECK', 'TL_TKC'], color: '#bbdefb' },
    { label: 'Thuê bao hoạt động', keys: ['SL_PSC_HT', 'SL_PSC_TT', 'SL_PSC_LECH', 'SL_NEW_HT', 'SL_NEW_TT'], color: '#c8e6c9' },
    { label: 'Doanh thu CALL', keys: ['TKC_CALL', 'TKC_CALL_T', 'TKC_CALL_CHENH_LECK', 'TL_TKC_CALL'], color: '#ffe0b2' },
    { label: 'Doanh thu SMS', keys: ['TKC_SMS', 'TKC_SMS_T', 'TKC_SMS_CHENH_LECK', 'TL_TKC_SMS'], color: '#fff9c4' },
    { label: 'Doanh thu DATA', keys: ['TKC_DATA', 'TKC_DATA_T', 'TKC_DATA_CHENH_LECK', 'TL_TKC_DATA'], color: '#dcedc8' },
    { label: 'Doanh thu VAS', keys: ['TKC_VAS', 'TKC_VAS_T', 'TKC_VAS_CHENH_LECK', 'TL_TKC_VAS'], color: '#f8bbd0' },
    { label: 'Doanh thu OTHER', keys: ['TKC_OTHER', 'TKC_OTHER_T', 'TKC_OTHER_CHENH_LECK', 'TL_TKC_OTHER'], color: '#d1c4e9' }
  ];

  const columns = columnGroups.flatMap(group => group.keys);
//sx={{ p: 2, pb: 8 }}
  return (

      <div className="p-2 sm:p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-[98%] mx-auto">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100"></div>
      <Container maxWidth="xl" sx={{ py: 4, pb: 8 }}>
      <Typography variant="h5" gutterBottom align="center" color='blue' fontWeight="bold">
      DOANH THU SỐ LƯỢNG TB PSC TRẢ TRƯƠC THEO ĐƠN VỊ LŨY KẾ
      </Typography>
      <div className="bg-gradient-to-r p-3 sm:p-4">
        {/* Title and Export Section */}
        <div className="flex flex-wrap sm:flex-nowrap justify-between items-center gap-3 mb-4">
          
               
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
        <Grid container spacing={2} alignItems="center" justifyContent="center" sx={{ mb: 2 }}>
          <Grid item>
            <DatePicker
              label="Ngày phát sinh cước"
              value={ngayPsc}
              onChange={(newValue) => setNgayPsc(newValue)}
              slotProps={{ textField: { variant: 'outlined', sx: { minWidth: 200 } } }}
            />
          </Grid>
         <FormControlLabel
           control={
            <Switch
              checked={isKyTruoc}
              onChange={(e) => setIsKyTruoc(e.target.checked)}
              sx={{
                '& .MuiSwitch-thumb': {
                  backgroundColor: isKyTruoc ? 'green' : 'red',
                },
                '& .MuiSwitch-track': {
                  backgroundColor: isKyTruoc ? '#a5d6a7' : '#ef9a9a',
                },
              }}
            />
            }
            label={isKyTruoc ? 'So sánh cùng kỳ' : 'So sánh tháng trước'}
            sx={{
            '& .MuiFormControlLabel-label': {
              color: isKyTruoc ? 'green' : 'red',
              fontWeight: 'bold',
            }
            }}
            />

          <Grid item>
            <Tooltip title="Tải dữ liệu từ server">
              <Button variant="contained" sx={{ height: '56px' }} size="large" onClick={fetchData} startIcon={<CloudDownload />}>
                Tải dữ liệu
              </Button>
            </Tooltip>
          </Grid>
          <Grid item>
            <Tooltip title="Xuất Excel">
              <Button variant="outlined" sx={{ height: '56px' }} size="large" onClick={exportToExcel} startIcon={<FileDownload />}>
                Excel
              </Button>
            </Tooltip>
          </Grid>
        </Grid>
      </LocalizationProvider>
</div></div>
      {distinctDates.NGAY_PSC_HT && (
        <Grid container justifyContent="center" sx={{ mb: 3 }}>
          <Typography variant="subtitle1" color="warning">
            Dữ liệu đến ngày: {format(new Date(distinctDates.NGAY_PSC_HT), 'dd/MM/yyyy')} | So sánh với: {format(new Date(distinctDates.NGAY_PSC_TT), 'dd/MM/yyyy')}
          </Typography>
        </Grid>
      )}

      {loading ? (
        <Grid container justifyContent="center"><CircularProgress /></Grid>
      ) : (
        <Fade in timeout={500}>
          <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 6 }}>
            <Table size="small" sx={{ borderCollapse: 'collapse' }}>
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
                  {/*
                        {columnGroups.map(group =>
                        group.keys.map((col, i) => (
                        <TableCell
                            key={col + i}
                            align="center"
                            sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', minWidth: col.includes('TEN') ? 220 : 120, border: '1px solid #ccc' }}
                        >
                            {col.replaceAll('_', ' ')}
                        </TableCell>
                        ))
                       )}
                  */}
                  {columnGroups.map(group =>
                    group.keys.map((col, i) => (
                    <TableCell
                        key={col + i}
                        align="center"
                        sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', minWidth: col.includes('TEN') ? 220 : 120, border: '1px solid #ccc' }}
                    >
                        {columnLabelMap[col] || col.replaceAll('_', ' ')}
                    </TableCell>
                    ))
                 )}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row, idx) => (
                  <TableRow key={idx} hover>
                    <TableCell sx={{ border: '1px solid #ccc' }}>{idx + 1}</TableCell>
                     {columns.map((col, i) => {
                        const isPercent = percentCols.includes(col);
                        const isNumber = typeof row[col] === 'number';
                        const cellValue = row[col];
                        const bgColor = isPercent && isNumber ? getGradientColor(cellValue) : 'transparent';

                        const content = isPercent && isNumber
                        ? cellValue.toFixed(2) + '%'
                        : isNumber
                        ? cellValue.toLocaleString()
                        : cellValue || '';

                        const cell = (
                        <TableCell
                            key={i}
                            align={isNumber ? 'right' : 'left'}
                            sx={{ border: '1px solid #ddd', backgroundColor: bgColor }}
                        >
                            {content}
                        </TableCell>
                        );

                        return isPercent && isNumber ? (
                        <Tooltip key={i} title={getTooltipText(cellValue)} arrow>
                            {cell}
                        </Tooltip>
                        ) : cell;
                    })}
                  </TableRow>
                ))}
                {data.length > 0 && (
                  <TableRow sx={{ backgroundColor: '#f0f0f0', fontWeight: 'bold' }}>
                    <TableCell sx={{ border: '1px solid #ccc' }}>TỔNG</TableCell>
                    {columns.map((col, i) => {
                      const isNumber = typeof data[0][col] === 'number';
                      const total = isNumber ? data.reduce((sum, item) => sum + (item[col] || 0), 0) : '';
                      return (
                        <TableCell key={i} align="right" sx={{ border: '1px solid #ccc', fontWeight: 'bold' }}>
                          {percentCols.includes(col)
                            ? ''
                            : isNumber
                            ? total.toLocaleString()
                            : ''}
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
    </Container> </div></div>
  );
}
