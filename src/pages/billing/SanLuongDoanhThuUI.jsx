// File: src/pages/SanLuongDoanhThuUI.jsx
import React, { useState } from 'react';
import axios from 'axios';
import {
  Box, Tabs, Tab, Typography, CircularProgress, Button, Grid, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow,Card ,CardContent 
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import DownloadIcon from '@mui/icons-material/Download';

const SanLuongDoanhThuUI = () => {
  const [month, setMonth] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [dataTables, setDataTables] = useState([]);

  const tabColors = [
    '#FFCDD2', '#F8BBD0', '#E1BEE7', '#D1C4E9',
    '#C5CAE9', '#BBDEFB', '#B2EBF2', '#C8E6C9', '#DCEDC8'
  ];

  const getFormattedMonth = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${year}${month}`;
  };

  const fetchData = async () => {
    const kyhoadon = getFormattedMonth(month);
    setLoading(true);
    try {
      const res = await axios.get(`https://ttkd.vnptphuyen.vn:4488/api/SanLuongDoanhThu/json?kyhoadon=${kyhoadon}`);
      setDataTables(res.data);
    } catch (err) {
      console.error('Fetch error:', err);
    }
    setLoading(false);
  };

  const handleDownloadExcel = () => {
    const kyhoadon = getFormattedMonth(month);
    window.open(`https://ttkd.vnptphuyen.vn:4488/api/SanLuongDoanhThu?kyhoadon=${kyhoadon}`, '_blank');
  };

  const renderCellValue = (value) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') return JSON.stringify(value);
    return value;
  };

  return (
    <Box sx={{ background: '#f7f9fc', minHeight: '100vh', p: 3 , pb:24}}>

       <Box>
              <Card className="rounded-2xl shadow-xl border border-gray-200">
              <CardContent>
                
             <Box>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Báo cáo sản lượng doanh thu
      </Typography>

      <Grid container spacing={2} alignItems="center">
        <Grid item>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              views={["year", "month"]}
              label="Chọn tháng"
              value={month}
              onChange={(newValue) => setMonth(newValue)}
              slotProps={{ textField: { size: 'small' } }}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item>
          <Button onClick={fetchData} variant="contained" disabled={loading}>
            Tải dữ liệu
          </Button>
        </Grid>
        <Grid item>
          <Button onClick={handleDownloadExcel} variant="outlined" startIcon={<DownloadIcon />}>
            Tải Excel
          </Button>
        </Grid>
      </Grid>

      {loading ? (
        <Box mt={4} display="flex" justifyContent="center">
          <CircularProgress size={48} thickness={4} />
        </Box>
      ) : (
        <Box mt={4}>
          <Tabs
            value={tabIndex}
            onChange={(e, newValue) => setTabIndex(newValue)}
            TabIndicatorProps={{ style: { backgroundColor: tabColors[tabIndex % tabColors.length] } }}
            sx={{
              '& .MuiTab-root': {
                transition: '0.3s',
                fontWeight: 'bold'
              },
              '& .Mui-selected': {
                backgroundColor: (theme) => tabColors[tabIndex % tabColors.length],
                borderRadius: '10px 10px 0 0',
                color: '#000'
              }
            }}
          >
            {dataTables.map((table, idx) => (
              <Tab label={table.sheetName || `Sheet ${idx + 1}`} key={idx} />
            ))}
          </Tabs>

          {dataTables.map((table, idx) => (
            <Box hidden={tabIndex !== idx} key={idx} mt={2}>
              <Paper elevation={3}>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        {table.columns.map((col) => (
                          <TableCell key={col}><strong>{col}</strong></TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {table.rows.map((row, rIdx) => (
                        <TableRow key={rIdx}>
                          {table.columns.map((col) => (
                            <TableCell key={col}>{renderCellValue(row[col])}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Box>
          ))}
        </Box>
      )}
       </Box>
          

              </CardContent>  
            
         </Card>
      </Box>
    </Box>
  );
};

export default SanLuongDoanhThuUI;
 