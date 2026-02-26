// VIP Phân tích doanh thu PSC trả sau - ReactJS + Vite + MUI + Collapse
import React, { useState, useEffect } from 'react';
import {
  Button,
  Card,
  CardContent,
  TextField,
  Tabs,
  Tab,
  Box,
  Collapse,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import DownloadIcon from '@mui/icons-material/Download';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import * as XLSX from 'xlsx';
import axios from 'axios';
 
const areas = ['TTKD','THA', 'DTH', 'TAN', 'SCU', 'SHH', 'SHA', 'DXN', 'KHDN'];

const formatMoney = (val) => {
  if (typeof val !== 'number') return val;
  return val.toLocaleString('vi-VN');
};

export default function DoanhThuPSC() {
  const [data, setData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [month, setMonth] = useState('202412');
  const [selectedArea, setSelectedArea] = useState(0);
  const [openRows, setOpenRows] = useState({});

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    const year = newDate.getFullYear();
    const month = String(newDate.getMonth() + 1).padStart(2, '0');
    setMonth(`${year}${month}`);
  };

  const fetchData = async () => {
    try {
      const response = await axios.post('https://localhost:7299/api/DynamicQuery/execute', {
        databaseType: 'sql',
        functionName: 'bsc_pyn.dbo.WEB_DISPLAY_PHANTICH_DDTS_THEOMAU_2025_DM_WEB',
        parameters: { thang: month },
        isRawSql: false,
      });
      setData(response.data);
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu:', error);
    }
  };

  const exportExcel = () => {
    const header = ['STT', 'MA_SO', 'TEN_MS', 'DVT', ...areas];
    const rows = data.map((item, idx) => [
      idx + 1,
      item.MA_SO,
      item.TEN_MS,
      item.DVT,
      ...areas.map((area) => item[area])
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([header, ...rows]);

    worksheet['!cols'] = header.map((h, colIdx) => {
      const maxLength = Math.max(
        h.length,
        ...rows.map(r => (r[colIdx] ? r[colIdx].toString().length : 0))
      );
      return { wch: maxLength + 2 };
    });

    // Định nghĩa style
    const borderStyle = {
      top: { style: 'thin', color: { rgb: 'BFBFBF' } },
      bottom: { style: 'thin', color: { rgb: 'BFBFBF' } },
      left: { style: 'thin', color: { rgb: 'BFBFBF' } },
      right: { style: 'thin', color: { rgb: 'BFBFBF' } },
    };
    const headerStyle = {
      font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 13 },
      fill: { fgColor: { rgb: '305496' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: borderStyle,
    };
    const parentStyle = {
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '4472C4' } },
      border: borderStyle,
    };
    const childStyle = {
      font: { color: { rgb: '002060' } },
      fill: { fgColor: { rgb: 'D9E1F2' } },
      border: borderStyle,
    };
    const normalStyle = {
      font: { color: { rgb: '000000' } },
      fill: { fgColor: { rgb: 'FFFFFF' } },
      border: borderStyle,
    };

    // Header style
    if (!worksheet['!rows']) worksheet['!rows'] = [];
    header.forEach((_, colIdx) => {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: colIdx });
      if (!worksheet[cellRef]) worksheet[cellRef] = { t: 's', v: header[colIdx] };
      worksheet[cellRef].s = headerStyle;
    });

    // Áp dụng style cho từng dòng
    rows.forEach((row, idx) => {
      const maSo = row[1];
      let style = normalStyle;
      if (maSo && /^[A-Z]+\d+$/.test(maSo)) style = parentStyle; // Parent
      else if (maSo && /^[A-Z]+\d+\.[\d.]+$/.test(maSo)) style = childStyle; // Child
      // Áp dụng style cho từng ô
      header.forEach((_, colIdx) => {
        const cellRef = XLSX.utils.encode_cell({ r: idx + 1, c: colIdx });
        if (!worksheet[cellRef]) return;
        worksheet[cellRef].s = style;
        // Định dạng số cho các cột số
        if (colIdx >= 4 && typeof row[colIdx] === 'number') {
          worksheet[cellRef].z = '#,##0';
          worksheet[cellRef].s.alignment = { horizontal: 'right' };
        }
      });
    });

    // Đảm bảo border cho tất cả các ô
    for (let r = 0; r <= rows.length; r++) {
      for (let c = 0; c < header.length; c++) {
        const cellRef = XLSX.utils.encode_cell({ r, c });
        if (worksheet[cellRef]) {
          worksheet[cellRef].s = {
            ...worksheet[cellRef].s,
            border: borderStyle,
          };
        }
      }
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    XLSX.writeFile(workbook, `DoanhThuPSC_${month}.xlsx`, { bookType: 'xlsx', cellStyles: true });
  };


  useEffect(() => {
    fetchData();
  }, [month]);

  const toggleRow = (maSo) => {
    setOpenRows((prev) => ({ ...prev, [maSo]: !prev[maSo] }));
  };

  const isParentRow = (maSo) => maSo && /^[A-Z]+\d+$/.test(maSo);
  const isChildRow = (maSo) => maSo && /^[A-Z]+\d+\.\d+/.test(maSo);

  const getChildRows = (parentMaSo) => {
    return data.filter((row) => row.MA_SO?.startsWith(parentMaSo + '.'));
  };

  return (
    <Box sx={{ background: '#f7f9fc', minHeight: '100vh', p: 3 , pb:24}}>
      <Box>
        <Card className="rounded-2xl shadow-xl border border-gray-200">
           <CardContent> 
             <Box>
                <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Kỳ hóa đơn"
                      value={selectedDate}
                      onChange={handleDateChange}
                      views={['month', 'year']}
                      sx={{
                        backgroundColor: '#fff',
                        borderRadius: 2,
                        '& .MuiOutlinedInput-root': {
                          fontWeight: 600,
                          fontSize: 18,
                          padding: '6px 12px',
                          borderRadius: 2,
                          color: '#222',
                        },
                        '& .MuiInputLabel-root': {
                          fontWeight: 600,
                          color: '#1976d2',
                          fontSize: 15,
                          background: 'transparent',
                        },
                        boxShadow: 1,
                        minWidth: 180,
                      }}
                      slotProps={{
                        textField: {
                          InputLabelProps: { style: { background: '#fff', padding: '0 4px' } }
                        }
                      }}
                    />
                  </LocalizationProvider>
                  <Button variant="contained" onClick={fetchData} startIcon={<DownloadIcon />}>Tải dữ liệu</Button>
                  <Button variant="outlined" onClick={exportExcel} startIcon={<FileDownloadIcon />}>Tải Excel</Button>
                </Box>
                <Box sx={{ overflowX: 'auto' }}>
                  <Tabs
                    value={selectedArea}
                    onChange={(e, newValue) => setSelectedArea(newValue)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                      borderBottom: 1,
                      borderColor: 'divider',
                      minWidth: '600px',
                      '& .MuiTab-root': {
                        fontWeight: 700,
                        fontSize: 16,
                        borderRadius: 2,
                        minHeight: 40,
                        minWidth: 80,
                        px: 2,
                        mx: 0.5,
                        color: '#1976d2',
                        background: '#f5f7fa',
                        transition: 'all 0.2s',
                      },
                      '& .Mui-selected': {
                        color: '#fff !important',
                        background: '#1976d2',
                        boxShadow: 2,
                      },
                    }}
                  >
                    {areas.map((area) => (
                      <Tab key={area} label={area} />
                    ))}
                  </Tabs>
                </Box>

      {areas.map((area, index) => (
        <div key={area} hidden={selectedArea !== index}>
          {selectedArea === index && (
            <Card sx={{ mt: 2 }}>
              <CardContent sx={{ overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f0f0f0' }}>
                      <TableCell sx={{ width: 70, minWidth: 60, p: 1, fontWeight: 700 }}>MÃ SỐ</TableCell>
                      <TableCell sx={{ width: 'auto', minWidth: 120, p: 1, fontWeight: 700 }}>TÊN MỤC</TableCell>
                      <TableCell align="right" sx={{ minWidth: 90, p: 1, fontWeight: 700 }}>{area}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.map((row) => {
                      const isMainRow = !isParentRow(row.MA_SO) && !isChildRow(row.MA_SO);

                      if (isMainRow) {
                        return (
                          <TableRow
                            key={row.MA_SO}
                            sx={{
                              backgroundColor: '#002c97',
                              color: 'white',
                              fontWeight: 'bold',
                              '& td': { color: 'white', fontWeight: 600 },
                              '&:hover': { backgroundColor: '#003bbd' },
                            }}
                          >
                            <TableCell sx={{ width: 70, minWidth: 60, p: 1 }}>{row.MA_SO}</TableCell>
                            <TableCell sx={{ width: 'auto', minWidth: 120, p: 1 }}>{row.TEN_MS}</TableCell>
                            <TableCell align="right" sx={{ minWidth: 90, p: 1 }}>{formatMoney(row[area])}</TableCell>
                          </TableRow>
                        );
                      }

                      if (!isParentRow(row.MA_SO)) return null;
                      const children = getChildRows(row.MA_SO);
                      return (
                        <React.Fragment key={row.MA_SO}>
                          <TableRow
                            sx={{
                              backgroundColor: '#eaf4ff',
                              '&:hover': { backgroundColor: '#d7eaff' },
                            }}
                          >
                            <TableCell sx={{ width: 70, minWidth: 60, p: 1 }}>
                              {children.length > 0 && (
                                <IconButton size="small" onClick={() => toggleRow(row.MA_SO)}>
                                  {openRows[row.MA_SO] ? <ExpandLess /> : <ExpandMore />}
                                </IconButton>
                              )}
                              {row.MA_SO}
                            </TableCell>
                            <TableCell sx={{ width: 'auto', minWidth: 120, p: 1, fontWeight: 600 }}>{row.TEN_MS}</TableCell>
                            <TableCell align="right" sx={{ minWidth: 90, p: 1 }}>{formatMoney(row[area])}</TableCell>
                          </TableRow>
                          <Collapse in={openRows[row.MA_SO]} timeout="auto" unmountOnExit>
                            {children.map((child) => (
                              <TableRow
                                key={child.MA_SO}
                                sx={{ '&:hover': { backgroundColor: '#f3faff' } }}
                              >
                                <TableCell sx={{ width: 70, minWidth: 40, p: 1, pl: 4 }}>{child.MA_SO}</TableCell>
                                <TableCell sx={{ width: 'auto', minWidth: 40, p: 1 }}>{child.TEN_MS}</TableCell>
                                <TableCell align="right" sx={{ minWidth: 90, p: 1 }}>{formatMoney(child[area])}</TableCell>
                              </TableRow>
                            ))}
                          </Collapse>
                        </React.Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      ))}
    
      </Box>
 </CardContent>    
 </Card>
 </Box> </Box>
  );
}
