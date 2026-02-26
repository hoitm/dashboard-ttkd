import React, { useEffect, useState,useContext  } from 'react';
import axios from 'axios';
import {
  Box, Typography, TextField, Card, CardContent, CircularProgress, Button,
  Drawer, IconButton ,FormControl ,InputLabel ,Select ,MenuItem,Snackbar  ,Alert
} from '@mui/material';
import { PhoneAndroid, EditNote, Close, NoteAlt ,SaveAltOutlined, CancelOutlined } from "@mui/icons-material";
import { AuthContext } from '../../auth/AuthProvider';

export default function ResetBilling() {
  const [query, setQuery] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [updateResult, setUpdateResult] = useState(null);
  //ma_nd

  const { userInfo, loading_n } = useContext(AuthContext);
  const ma_nd = userInfo?.ma_nd; // hoặc lấy từ auth context

  const fetchData = async () => {
    if (!query || query.length < 3) return;
    setLoading(true);
    try {
      const res = await axios.post(
        'https://ttkd.vnptphuyen.vn:4488/api/DynamicQuery/execute',
        {
          databaseType: 'sql',
          functionName: `
            SELECT TOP 10 UserName, FullName, Email, FullName Department,  UserID ID
            FROM [10.56.20.21].HDDT_KH.dbo.Users
            WHERE UserName LIKE '%' + @query + '%' OR FullName LIKE '%' + @query + '%'
            ORDER BY FullName
          `,
          parameters: { query },
          isRawSql: true
        },
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );
      setData(res.data);
    } catch (error) {
      console.error('Lỗi khi gọi API:', error);
    } finally {
      setLoading(false);
    }
  };

  // Gọi fetch sau 500ms khi nhập
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.length >= 3) fetchData();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleResetPassword = (userName) => {
    alert(`👉 Reset mật khẩu cho: ${userName}`);
    // TODO: Gọi API reset mật khẩu tại đây
  };
 const handleUpdate = async () => {
    if (!editItem) return;
    try {
      await axios.post("https://ttkd.vnptphuyen.vn:4488/api/DynamicQuery/nonquery", {
        databaseType: "sql",
       // functionName: `
       //   UPDATE  [10.56.20.21].HDDT_KH.dbo.Users 
      //    SET [Password]=CONVERT(NVARCHAR, HashBytes('MD5', @NewPassword), 2) 
       //   WHERE UserName=@UserName
      //  `,
        functionName: `one_bss.dbo.ResetPasswordFromCSSPYN`,
        parameters: {
          UserName:   editItem.UserName,
          PassWord: editItem.UserName,
          ma_nsd_reset: ma_nd,
        },
        isRawSql: false
      });
      setUpdateResult({ success: true, message: `Đã cập nhật cho ${editItem.UserName}` });
    //  setData(prev => prev.filter(d => d.ID !== editItem.ID));
     // Hiển thị alert ngay lập tức
    
    setOpenSnackbar(true); // Đặt trước

    // Đóng drawer trước
    setEditItem(null);
    } catch (e) {
      setUpdateResult({ success: false, message: `Cập nhật thất bại! ${e.message}` });
    }
    setOpenSnackbar(true);
    setEditItem(null);
  };
  return (
    <Box sx={{ background: '#f7f9fc', minHeight: '100vh', p: 2, pb: 8 }}>
      <Box className="p-4 min-h-screen bg-gradient-to-br from-white to-blue-50">
        <Typography variant="h5" className="mb-4 text-blue-800 font-bold">
          🔐 Reset mật khẩu người dùng
        </Typography>

        <Box className="flex flex-col sm:flex-row gap-3 mb-6">
          <TextField
            label="Nhập tên hoặc mã người dùng"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            size="small"
            
            fullWidth

                          sx={{
            minWidth: 200,
            '& .MuiOutlinedInput-root': {
              height: 56 // khớp chiều cao nút
            }
            }}

          />
        </Box>

        {loading ? (
          <Box className="flex justify-center items-center mt-10">
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            {data.map((user, index) => (
              <Card
                key={index}
                className="rounded-xl shadow-md transition-all duration-300 hover:shadow-lg border border-gray-200 mb-3"
              >
                <CardContent className="py-3 px-4 flex justify-between items-center">
                  <div>
                    <Typography className="text-base font-semibold text-blue-800">
                      {user.FullName}
                    </Typography>
                    <Typography className="text-sm text-gray-600">
                      User: <strong>{user.UserName}</strong>
                    </Typography>
                    <Typography className="text-sm text-gray-600">
                      Email: {user.Email || 'Không có'}
                    </Typography>
                    <Typography className="text-sm text-gray-600">
                      Phòng: {user.Department || 'N/A'}
                    </Typography>
                  </div>

                  <div>
                    <Button size="small" variant="outlined" className="rounded-t-md rounded-b-none" onClick={() => setEditItem(user)}><EditNote className="mr-1" fontSize="small" />Reset mật khẩu</Button>
                    {/*
                       <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleResetPassword(user.UserName)}
                    >
                      Reset mật khẩu
                    </Button>
                    */}
                  </div>
             


   
          </CardContent>
              </Card>
            ))}




          </Box>

          
        )}   <Drawer anchor="bottom" open={!!editItem} onClose={() => setEditItem(null)} PaperProps={{
              sx: { borderTopLeftRadius: 35, borderTopRightRadius: 35 }
            }}>
              <Box className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
                <div className="flex justify-between items-center">
                  <Typography variant="h6" className="flex items-center"><NoteAlt className="mr-2 text-orange-500" />Đổi mật khẩu</Typography>
                  <IconButton onClick={() => setEditItem(null)}><Close /></IconButton>
                </div>
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  label="Mật khẩu"
                  value={editItem?.UserName || ""}
                  onChange={(e) => setEditItem({ ...editItem, UserName: e.target.value })}
                />
               {/*
                 <FormControl fullWidth>
                  <InputLabel id="trangthai-label">Trạng thái</InputLabel>
                  <Select
                    labelId="trangthai-label"
                    value={editItem?.TRANGTHAI || ""}
                    label="Trạng thái"
                    onChange={(e) => setEditItem({ ...editItem, TRANGTHAI: e.target.value })}
                  >
                    <MenuItem value="Hoàn thành">✅ KH yêu cầu</MenuItem>
                    <MenuItem value="Không liên lạc được">📵 Chủ động</MenuItem>
                    <MenuItem value="Không thành công">❌ Chủ động</MenuItem>
                  </Select>
                </FormControl>
               */}
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
    </Box>
  );
}
