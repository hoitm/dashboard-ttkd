
//import { AuthContext } from '../../auth/AuthProvider'

// const nhanvien_id = userInfo?.nhanvien_id || "0";
// src/pages/CallListDashboard.jsx
// src/pages/CallListDashboard.jsx
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import {
  Drawer, 
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Snackbar,
  Alert,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  IconButton,
  Box
} from "@mui/material";
import { PhoneAndroid, EditNote, Close, NoteAlt ,SaveAltOutlined, CancelOutlined } from "@mui/icons-material";
import { AuthContext } from '../../auth/AuthProvider'
import { SaveAll } from "lucide-react";

const formatTime = (iso) => new Date(iso).toLocaleString("vi-VN");

const getCardStyles = (nhaMang) => {
  switch (nhaMang) {
    case "VTL": return "bg-blue-50 border-l-4 border-blue-400";
    case "SCTV": return "bg-purple-50 border-l-4 border-purple-400";
    case "FPT": return "bg-orange-50 border-l-4 border-orange-400";
    default: return "bg-gray-50 border-l-4 border-gray-300";
  }
};

export default function CallListDashboard() {
  const { userInfo } = useContext(AuthContext);
  const [data, setData] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [location, setLocation] = useState(null);
  const [updateResult, setUpdateResult] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const fetchData = async () => {
    const nhanvien_id = userInfo?.nhanvien_id || "0";
    try {
      const response = await axios.post("https://ttkd.vnptphuyen.vn:4488/api/DynamicQuery/execute", {
        databaseType: "sql",
        functionName: `SELECT ID, '0'+SUBSTRING(ACCS_MTHD_KEY,3,10) SO_TB , LOAI_TB, THOIGIAN_BD AS THOI_GIAN_GOI, TONG_TG, SO_TONGDAI,NHA_MANG,HO_TEN, BTS_NAME, TEN_NV_KD, GHICHU GHI_CHU, TRANGTHAI FROM PHANTAP_PYN.dbo.TAP_KHACHHANG_VN_SUDUNG_MANG_KHAC_2025 WHERE NHANVIEN_ID =@nhanvien_id AND IScall =0 and ISsend =1 order by THOIGIAN_BD`,
        parameters: { nhanvien_id },
        isRawSql: true
      });
      setData(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => console.error("Location error", err)
    );
  };

  const handleUpdate = async () => {
    if (!editItem) return;
    try {
      await axios.post("https://ttkd.vnptphuyen.vn:4488/api/DynamicQuery/nonquery", {
        databaseType: "sql",
        functionName: `UPDATE PHANTAP_PYN.dbo.TAP_KHACHHANG_VN_SUDUNG_MANG_KHAC_2025 SET TRANGTHAI = @trangthai ,GHICHU = @ghi_chu ,IScall = 1 WHERE id  = @id`,
        parameters: {
          trangthai: editItem.TRANGTHAI,
          ghi_chu: editItem.GHI_CHU,
          id: editItem.ID
        },
        isRawSql: true
      });
      setUpdateResult({ success: true, message: `Đã cập nhật cho ${editItem.SO_TB}` });
      setData(prev => prev.filter(d => d.ID !== editItem.ID));
    } catch (e) {
      setUpdateResult({ success: false, message: `Cập nhật thất bại!` });
    }
    setOpenSnackbar(true);
    setEditItem(null);
  };

  useEffect(() => {
    fetchData();
    getLocation();
  }, []);

  return (
    <Box sx={{ background: '#f7f9fc', minHeight: '100vh', p: 3 , pb:24}}>
     <Box>
          <Card className="rounded-2xl shadow-xl border border-gray-200">
            <CardContent>
              <Box  >
                {data.map((item) => (
                  <Card key={item.ID} className={`rounded-xl shadow-lg transition-all duration-300 hover:shadow-2xl ${getCardStyles(item.NHA_MANG)}`}>
                    <CardContent className="py-1 px-2">
                      <div className="flex justify-between items-center">
                        <div className="space-y-0.5">
                          <Typography className="text-sm font-medium flex items-center"><PhoneAndroid className="mr-1 text-blue-600 animate-pulse" fontSize="small" />{item.SO_TB}</Typography>
                          <Typography className="text-xs">🏷 {item.NHA_MANG}</Typography>
                          <Typography className="text-xs">🕒 {formatTime(item.THOI_GIAN_GOI)}</Typography>
                        </div>
                        <div className="flex gap-1">
                          <Button size="small" variant="contained" color="primary" className="rounded-t-md rounded-b-none" onClick={() => window.location.href = `tel:${item.SO_TB}`}><PhoneAndroid className="mr-1 animate-pulse" fontSize="small" />Gọi</Button>
                          <Button size="small" variant="outlined" className="rounded-t-md rounded-b-none" onClick={() => setEditItem(item)}><EditNote className="mr-1" fontSize="small" />Cập nhật</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

            <Drawer anchor="bottom" open={!!editItem} onClose={() => setEditItem(null)} PaperProps={{
              sx: { borderTopLeftRadius: 35, borderTopRightRadius: 35 }
            }}>
              <Box className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
                <div className="flex justify-between items-center">
                  <Typography variant="h6" className="flex items-center"><NoteAlt className="mr-2 text-orange-500" />Cập nhật thông tin</Typography>
                  <IconButton onClick={() => setEditItem(null)}><Close /></IconButton>
                </div>
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  label="Ghi chú"
                  value={editItem?.GHI_CHU || ""}
                  onChange={(e) => setEditItem({ ...editItem, GHI_CHU: e.target.value })}
                />
                <FormControl fullWidth>
                  <InputLabel id="trangthai-label">Trạng thái</InputLabel>
                  <Select
                    labelId="trangthai-label"
                    value={editItem?.TRANGTHAI || ""}
                    label="Trạng thái"
                    onChange={(e) => setEditItem({ ...editItem, TRANGTHAI: e.target.value })}
                  >
                    <MenuItem value="Hoàn thành">✅ Hoàn thành</MenuItem>
                    <MenuItem value="Không liên lạc được">📵 Không liên lạc được</MenuItem>
                    <MenuItem value="Không thành công">❌ Không thành công</MenuItem>
                  </Select>
                </FormControl>
                <Typography className="text-sm text-gray-500"></Typography>
                <div className="flex justify-end gap-2">
                  <Button   variant="contained"  onClick={() => setEditItem(null)}> <CancelOutlined/>  Huỷ</Button>
                  <Button   onClick={handleUpdate} variant="contained" color="success"><SaveAltOutlined />   Lưu</Button>
                </div>
              </Box>
            </Drawer>

            <Snackbar
              open={openSnackbar}
              autoHideDuration={3000}
              onClose={() => setOpenSnackbar(false)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
              {updateResult && (
                <Alert onClose={() => setOpenSnackbar(false)} severity={updateResult.success ? "success" : "error"}>
                  {updateResult.message}
                </Alert>
              )}
            </Snackbar>   
      
             </Box>
              </CardContent>
            </Card> </Box></Box>
    
  );
}
//          <Typography className="text-sm text-gray-500">📍 Vị trí: {location ? `${location.lat}, ${location.lng}` : "Đang lấy..."}</Typography>
