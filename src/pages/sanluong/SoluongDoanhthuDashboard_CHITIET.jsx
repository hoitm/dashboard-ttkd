import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Button, TextField, MenuItem
} from '@mui/material';
import * as XLSX from 'xlsx';
import { getChiTietSoLuong } from '../../services/sanluongApi';
//import jsPDF from 'jspdf';
//import autoTable from 'jspdf-autotable';

export default function ChiTietNhanVien() {
  const location = useLocation();
  const navigate = useNavigate();
  const { hrm_code, ten_nv, fromDate, toDate } = location.state || {};
  console.log(hrm_code);
  console.log(ten_nv);
  console.log(fromDate);
  console.log(toDate);
  const [data, setData] = useState([]);
  const [filterGoiCuoc, setFilterGoiCuoc] = useState('');

  const fetchData = async () => {
    try {
      const result = await getChiTietSoLuong(hrm_code, fromDate, toDate);
      setData(result || []);
    } catch (err) {
      console.error('Lỗi lấy chi tiết:', err);
    }
  };

  useEffect(() => {
    if (hrm_code) fetchData();
  }, [hrm_code]);

  // Lọc theo gói cước
  const filteredData = data.filter(item => {
    if (!filterGoiCuoc) return true;
    return item.GOI_CUOC === filterGoiCuoc;
  });

  // Gom nhóm theo nguồn
  const groupedData = filteredData.reduce((groups, item) => {
    const nguon = item.NGUON || 'Khác';
    if (!groups[nguon]) groups[nguon] = { items: [], tongDT: 0 };
    groups[nguon].items.push(item);
    groups[nguon].tongDT += Number(item.DOANHTHU || 0);
    return groups;
  }, {});

  // Export Excel
  const exportExcel = () => {
    const exportData = filteredData.map(row => ({
      'Mã TB': row.MA_TB,
      'Ngày ĐK': row.TG_DK,
      'Gói Cước': row.GOI_CUOC,
      'Nguồn': row.NGUON,
      'PTM': row.PTM,
      'Số tháng': row.SOTHANG,
      'Doanh thu': row.DOANHTHU
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'ChiTiet');

    XLSX.writeFile(workbook, `ChiTiet_${hrm_code}.xlsx`);
  };

  // Export PDF

  /* 
    const exportPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(14);
        doc.text(`Chi tiết: ${ten_nv} (${hrm_code})`, 14, 16);
        autoTable(doc, {
        startY: 22,
        head: [['Mã TB', 'Ngày ĐK', 'Gói Cước', 'Nguồn', 'PTM', 'Số tháng', 'Doanh thu']],
        body: filteredData.map(row => [
            row.MA_TB, row.TG_DK, row.GOI_CUOC, row.NGUON, row.PTM, row.SOTHANG, Number(row.DOANHTHU).toLocaleString()
        ])
        });
        doc.save(`ChiTiet_${hrm_code}.pdf`);
    };
*/
  const distinctGoiCuoc = [...new Set(data.map(d => d.GOI_CUOC).filter(Boolean))];

  return (
    <Box  sx={{ background: '#f7f9fc', minHeight: '100vh', p: 1 , pb:8}}>
      <Button variant="outlined" onClick={() => navigate(-1)}>← Quay lại</Button>
      <Typography variant="h6" className="text-blue-700 mt-4 font-bold">
        📌 Chi tiết: {ten_nv} ({hrm_code})
      </Typography>

      {/* Bộ lọc và export */}
      <Box className="flex flex-col sm:flex-row gap-3 my-4">
        <TextField
            label="Lọc theo gói cước"
            size="small" height="45"
            select
            value={filterGoiCuoc}
            onChange={(e) => setFilterGoiCuoc(e.target.value)}
            sx={{ minWidth: 200, height:"45px", minHeight:"45px"  }}
        >
          <MenuItem value="">-- Tất cả --</MenuItem>
          {distinctGoiCuoc.map((g, idx) => (
            <MenuItem key={idx} value={g}>{g}</MenuItem>
          ))}
        </TextField>

        <Button variant="contained" color="success" onClick={exportExcel}>
          📥 Xuất Excel
        </Button>
        {/*
           <Button variant="contained" color="error" onClick={exportPDF}>
            📄 Xuất PDF
            </Button>
        */}
      </Box>

      {/* Danh sách theo nguồn */}
      {Object.entries(groupedData).map(([nguon, group]) => (
        <Box key={nguon} className="mb-6"   sx={{   p: 1 , pb:0}} >
          <Typography variant="subtitle1" className="font-semibold text-green-700 mb-2">
            👉 Nguồn: {nguon} | Tổng DT: <strong>{group.tongDT.toLocaleString()} ₫</strong>
          </Typography>
          {group.items.map((row, idx) => (
            <Card key={idx} className="mb-2 border border-gray-300 rounded-lg shadow-sm">
              <CardContent className="p-3">
                <Typography className="text-sm">
                  <strong>TB:</strong> {row.MA_TB}
                </Typography>
                <Typography className="text-sm">
                  <strong>Gói:</strong> {row.GOI_CUOC}
                </Typography>
                <Typography className="text-sm text-orange-700">
                  <strong>Doanh thu:</strong> {Number(row.DOANHTHU).toLocaleString()} ₫
                </Typography>
                <Typography className="text-xs text-gray-600">
                  <strong>Ngày ĐK:</strong> {row.TG_DK}
                </Typography>
                <Typography className="text-xs text-blue-700">
                  <strong>PTM:</strong> {row.PTM} – {row.SOTHANG} tháng
                </Typography>
                
              </CardContent>
            </Card>
          ))}
        </Box>
      ))}
    </Box>
  );
}
