import React, { useEffect, useState ,useContext  } from 'react';
import axios from 'axios';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import * as XLSX from 'xlsx';
import { AuthContext } from '../../auth/AuthProvider'
 
const getNetworkColor = (network) => {
  switch (network?.toUpperCase()) {
    case 'VNPT':
      return 'bg-blue-100 text-blue-800';
    case 'FPT':
      return 'bg-red-100 text-red-800';
    case 'VTL':
      return 'bg-yellow-100 text-yellow-800';
    case 'SCTV':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusStyle = (status) => {
  switch (status) {
    case 'Hoàn thành':
      return 'bg-green-100 text-green-800';
    case 'Không liên lạc được':
      return 'bg-yellow-100 text-yellow-800';
    case 'Không thành công':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

const CallResultTable = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [networkFilter, setNetworkFilter] = useState('');
  const { userInfo } = useContext(AuthContext);
 const nhanvien_id = userInfo?.nhanvien_id || "0";
  useEffect(() => {
    axios
      .post('https://ttkd.vnptphuyen.vn:4488/api/DynamicQuery/execute', {
        databaseType: 'sql',
        functionName:
          'PHANTAP_PYN.DBO.TAP_KHACHHANG_VN_SUDUNG_MANG_KHAC_2025_NHANVIEN_DALAM',
        parameters: {
          nhanvien_id: nhanvien_id,
          chi_thi: '3',
        },
        isRawSql: false,
      })
      .then((res) => {
        setData(res.data);
        setFilteredData(res.data);
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    const filtered = data.filter(
      (item) =>
        (statusFilter ? item.TRANGTHAI === statusFilter : true) &&
        (networkFilter ? item.NHA_MANG === networkFilter : true)
    );
    setFilteredData(filtered);
  }, [statusFilter, networkFilter, data]);

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'DanhSach');
    XLSX.writeFile(wb, 'DanhSachKetQua.xlsx');
  };

  const columns = [
    { field: 'ACCS_MTHD_KEY', headerName: 'Số TB',   width: 130},
    { width: 130,
      field: 'NHA_MANG',
      headerName: 'Nhà mạng',
      
      renderCell: (params) => (
        <Box
          className={`px-2 py-1 rounded-full text-sm ${getNetworkColor(
            params.value
          )}`}
        >
          <Box display="flex" alignItems="center" gap={1}>
            {!params.value?.includes('VNPT') && <WarningAmberIcon fontSize="small" />}
            {params.value || '—'}
          </Box>
        </Box>
      ),
    },
    { width: 160,
      field: 'TRANGTHAI',
      headerName: 'Trạng thái',
       
      renderCell: (params) => (
        <Box
          className={`px-2 py-1 rounded-full text-sm ${getStatusStyle(
            params.value
          )}`}
        >
          {params.value || '—'}
        </Box>
      ),
    },
    { field: 'LOAI_TB', headerName: 'Loại TB', width: 130 },
    { field: 'SO_TONGDAI', headerName: 'Số tổng đài',  width: 130  },
    { field: 'GHICHU', headerName: 'Ghi chú',width: 130 },
    { field: 'TONG_TG', headerName: 'TG (giây)', flex: 0.7, type: 'number' },
   
    { field: 'BTS_NAME', headerName: 'BTS',  width: 80  },
    
    {
      field: 'NGAY_CALL',
      headerName: 'Ngày gọi',
      flex: 1,
      
    },
    {
      field: 'NGAY_SEND',
      headerName: 'Ngày gửi',
      flex: 1,
      
    },
     { field: 'RESELLER_NAME', headerName: 'Đơn vị xử lý', flex: 1.5 },
  ];

  return (
    <Box className="p-4 pb-24 md:p-8 bg-gray-50 min-h-screen">
      <Card className="rounded-2xl shadow-xl border border-gray-200">
        <CardContent>
          <Typography variant="h6" className="text-blue-800 font-bold mb-4">
            📞  KẾT QUẢ OB CHĂM SÓC KHÁCH HÀNG VINAPHONE GỌI BÁO HỎNG MẠNG KHÁC
          </Typography>

          <Box className="flex gap-4 mb-4">
            <FormControl size="small" sx={{ minWidth: 200 }}  >
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Trạng thái"
              >
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value="Hoàn thành">Hoàn thành</MenuItem>
                <MenuItem value="Không liên lạc được">Không liên lạc được</MenuItem>
                <MenuItem value="Không thành công">Không thành công</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Nhà mạng</InputLabel>
              <Select
                value={networkFilter}
                onChange={(e) => setNetworkFilter(e.target.value)}
                label="Nhà mạng"
              >
                <MenuItem value="">Tất cả</MenuItem>
               
                <MenuItem value="FPT">FPT</MenuItem>
                <MenuItem value="VTL">VTL</MenuItem>
                <MenuItem value="SCTV">SCTV</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" color="primary" onClick={exportToExcel}>
              📤 Xuất Excel
            </Button>
          </Box>

          <div className="h-[700px]">
            <DataGrid
              rows={filteredData.map((row) => ({ id: row.id, ...row }))}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10]}
              disableSelectionOnClick
              className="bg-white rounded-xl"
            />
          </div>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CallResultTable;
