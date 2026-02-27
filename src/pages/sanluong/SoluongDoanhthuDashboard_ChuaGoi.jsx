import React, { useEffect, useState } from 'react';
import { getSoLuongChuaLenGoiTongHop } from '../../services/sanluongApi';
import {
  Box, Typography, Grid, TextField, Card, CardContent, CircularProgress, Button, MenuItem ,FormControl
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import vi from 'date-fns/locale/vi';
import { format, startOfMonth } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import RefreshIcon from '@mui/icons-material/Refresh';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import { Autorenew } from '@mui/icons-material';

export default function SoluongDoanhthuDashboard_ChuaGoi() {
  const [fromDate, setFromDate] = useState((new Date()));
  const [toDate, setToDate] = useState(new Date());
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
const [filterDonVi, setFilterDonVi] = useState(''); // '' nghĩa là Tất cả

 /*
      
    NHÂN VIÊN CHI TIẾT THEO TỪNG NGƯỜI
    
 */
  const handleChiTiet = (nv) => {
    navigate('/sl/sldt-canhan-chitiet-chuagoi', {
      state: {
        hrm_code: nv.HRM_CODE,
        ten_nv: nv.TEN_NV,
        fromDate: format(fromDate, 'yyyy-MM-dd'),
        toDate: format(toDate, 'yyyy-MM-dd')
      }
    });
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getSoLuongChuaLenGoiTongHop(
        format(fromDate, 'dd/MM/yyyy'),
        format(toDate, 'dd/MM/yyyy')
      );
      setData(data);
    } catch (error) {
      console.error('Lỗi khi gọi API:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
const distinctDonVi = [...new Set(data.map(d => d.MA_PHONG).filter(Boolean))];

  return (
    <Box sx={{ background: '#f7f9fc', minHeight: '100vh', p: 1 , pb:8}}>
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
      <Box className="p-4 min-h-screen bg-gradient-to-br from-white to-blue-50">
        <Typography variant="h5" className="mb-4 text-blue-800 font-bold">
            📊  DKTT DDTT chưa mua gói 
        </Typography>

        <Box className="flex flex-col sm:flex-row gap-3 mb-6">
          <DatePicker
            label="Từ ngày"
            value={fromDate}
            onChange={(date) => date && setFromDate(date)}
            renderInput={(params) => <TextField {...params} size="small" />}
          />
          <DatePicker
            label="Đến ngày"
            value={toDate}
            onChange={(date) => date && setToDate(date)}
            renderInput={(params) => <TextField {...params} size="small" />}
          />
           
          <TextField
            label="Lọc theo đơn vị"
            select
            size="small"
            value={filterDonVi}
            onChange={(e) => setFilterDonVi(e.target.value)}
                  sx={{
            minWidth: 200,
            '& .MuiOutlinedInput-root': {
              height: 56 // khớp chiều cao nút
            }
            }}
          >
          <MenuItem value="">-- Tất cả --</MenuItem>
          {distinctDonVi.map((dv, idx) => (
            <MenuItem key={idx} value={dv}>{dv}</MenuItem>
          ))}
        </TextField>
 
          <Button variant="contained" color="primary"  startIcon={<RefreshIcon />} onClick={fetchData}>
            Tải lại
          </Button>
        </Box>

        {loading ? (
          <Box className="flex justify-center items-center mt-10">
            <CircularProgress />
          </Box>
        ) : (
   
            <Box sx={{ background: '#f7f9fc', minHeight: '100vh', p: 0 }}>
              <Box>
               {/* //{data.map((nv, index) => (*/}
                  {data
                  .filter(nv => !filterDonVi || nv.MA_PHONG === filterDonVi)
                  .map((nv, index) => (
                  <Card
                    key={index}
                    className="rounded-xl shadow-lg transition-all duration-300 hover:shadow-2xl border border-gray-200 mb-3"
                  >
                    <CardContent className="py-2 px-4">
                      <div className="flex justify-between items-center">
                        {/* LEFT - thông tin */}
                        <div className="space-y-1">
                          <Typography className="text-base font-semibold text-blue-800">
                            {nv.TEN_NV} ({nv.MA_PHONG})
                          </Typography>
                          <Typography className="text-xs text-gray-600">
                            HRM: <strong>{nv.HRM_CODE}</strong> 
                          </Typography>
                          <div className="flex gap-4 text mt-3">
                            <span className="text-green-600">SL: {nv.SOLUONG}</span>
                            <span className="text-orange-600">
                              Số lượng: {nv.SO_TB_DK}  thuê bao
                            </span>
                            <span className="text-blue-600">
                              Có gói : {nv.SO_TB_CO_GOI} tb/  <span className="text-red-600"> Chưa gói {nv.SO_TB_CHUA_GOI} tb</span>
                            </span>
                          </div>
                        </div>

                        {/* RIGHT - button */}
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Autorenew />} 
                          className="rounded-md whitespace-nowrap"
                          onClick={() => handleChiTiet(nv)}
                        >
                          Chi tiết
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>
        )}
      </Box>
    </LocalizationProvider> </Box>
  );
}
