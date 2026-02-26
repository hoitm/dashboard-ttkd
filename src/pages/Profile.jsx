import React, { useContext, useState,useEffect  } from 'react';
import {
  Card, CardHeader, CardContent, Typography, Avatar,Box ,
  Button, TextField, CircularProgress
} from '@mui/material';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import LogoutIcon from '@mui/icons-material/Logout';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { AuthContext } from '../auth/AuthProvider';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import SaveAltOutlined from '@mui/icons-material/SaveAltOutlined';


export default function Profile() {
  const { userInfo, logout } = useContext(AuthContext);
  const [userIdInput, setUserIdInput] = useState('');
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(false);

  const formatDate = (isoDate) => {
    if (!isoDate) return '—';
    return new Date(isoDate).toLocaleDateString('vi-VN');
  };

  // Tách CCCD từ cert_subject hoặc các field khác
  const extractCCCD = (cert) => {
    if (!cert) return '';
    const s = cert.cert_subject || '';
    // Ví dụ: "... UID=CCCD:054192002251" hoặc "... UID=054192002251"
    const m1 = s.match(/UID\s*=\s*CCCD:?\s*([0-9]{9,12})/i);
    if (m1) return m1[1];
    const m2 = s.match(/UID\s*=\s*([0-9]{9,12})/i);
    if (m2) return m2[1];
    // fallback nếu API có field khác
    return cert.uid || cert.user_id || '';
  };

  // Lần vào trang sau: auto load từ localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('smartca_certificate');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      // Cho phép 2 dạng: object cũ (chỉ certificate) hoặc mới ({certificate, cccd})
      const cert = parsed.certificate || parsed;
      setCertificate(cert);
      const cccd = parsed.cccd || extractCCCD(cert);
      if (cccd) setUserIdInput(cccd);
    } catch {
      // ignore
    }
  }, []);

  const fetchSmartCA = async () => {
    setLoading(true);
    try {
      const payload = {
        sp_id: '423c-638835224184261512.apps.smartcaapi.com',
        sp_password: 'NGVmODRiZjA-ZDYzMy00MjNj',
        user_id: userIdInput,
        serial_number: '',
        transaction_id: uuidv4()
      };

      const res = await axios.post(
        'https://ttkd.vnptphuyen.vn:4488/api/SmartCAProxy/get-certificate',
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );

      const cert = res.data?.data?.user_certificates?.[0];
      if (cert) {
        setCertificate(cert);
          // Điền lại ô tìm kiếm bằng CCCD lấy được
        const cccd = extractCCCD(cert);
        if (cccd) setUserIdInput(cccd);
        toast.success('🎉 Lấy thông tin thành công!');
      } else {
        toast.warning('❗ Không tìm thấy chứng chỉ.');
        setCertificate(null);
      }
    } catch (err) {
      toast.error('🚫 Lỗi khi gọi API SmartCA');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const saveToLocal = () => {
    if (certificate) {
      localStorage.setItem('smartca_certificate', JSON.stringify(certificate));
      toast.success('💾 Đã lưu chứng chỉ vào LocalStorage!');
    }
  };

  if (!userInfo) return <div style={{ padding: 16 }}>Đang tải thông tin người dùng...</div>;

  const profileInfo = [
    { label: 'Họ và tên', value: userInfo.ten_nd },
    { label: 'Mã nhân viên', value: userInfo.ma_nv },
    { label: 'Email', value: userInfo.email },
    { label: 'SĐT', value: userInfo.sdt },
    { label: 'Đơn vị', value: userInfo.ten_dv },
    { label: 'Chức vụ', value: userInfo.chuc_vu },
    { label: 'Ngày tạo', value: formatDate(userInfo.ngay_tao) },
  ];

  return (
    <Box sx={{ background: '#f7f9fc', minHeight: '100vh', p: 3 , pb:24}}>
         <Box>
              <Card className="rounded-2xl shadow-xl border border-gray-200">
                <CardContent>
                 
                  

                
      <ToastContainer position="top-right" autoClose={3000} />
      <Card elevation={3}>
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              {userInfo.ten_nd?.split(' ').slice(-1)[0][0]?.toUpperCase()}
            </Avatar>
          }
          title={<Typography variant="h6">{userInfo.ten_nd}</Typography>}
          subheader={userInfo.email || 'Chưa có email'}
        />

        <CardContent>
          {profileInfo.map((item, index) => (
            <Typography
              key={index}
              variant="body2"
              sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}
            >
              <strong>{item.label}:</strong> <span>{item.value || '—'}</span>
            </Typography>
          ))}

          <TextField
            label="Nhập CCCD / User ID"
            variant="outlined"
            fullWidth
            size="small"
            value={userIdInput}
            onChange={(e) => setUserIdInput(e.target.value)}
            sx={{ my: 2 }}
          />

          <Button
            variant="contained"
            startIcon={<VerifiedUserIcon />}
            onClick={fetchSmartCA}
            disabled={loading || !userIdInput}
            sx={{ mr: 1 }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Lấy thông tin SmartCA'}
          </Button>

          <Button
            variant="outlined"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={logout}
          >
            Đăng xuất
          </Button>

          {certificate && (
            <Card sx={{ mt: 4, bgcolor: '#f9f9f9', p: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1, color: 'primary.main' }}>
                Chứng chỉ SmartCA
              </Typography>
              <Typography variant="body2"><strong>Trạng thái:</strong> {certificate.cert_status}</Typography>
              <Typography variant="body2"><strong>Số serial:</strong> {certificate.serial_number}</Typography>
              <Typography variant="body2"><strong>Chủ thể:</strong> {certificate.cert_subject}</Typography>
              <Typography variant="body2"><strong>Hiệu lực từ:</strong> {formatDate(certificate.cert_valid_from)}</Typography>
              <Typography variant="body2"><strong>Hiệu lực đến:</strong> {formatDate(certificate.cert_valid_to)}</Typography>
              <Typography variant="body2"><strong>Dịch vụ:</strong> {certificate.service_name}</Typography>
              <Typography variant="body2"><strong>Thiết bị:</strong> {certificate.device?.name}</Typography>

              <Button
                variant="contained"
                color="success"
                sx={{ mt: 2 }}
                onClick={saveToLocal}
                startIcon={<SaveAltOutlined />}
              >
                Lưu vào LocalStorage
              </Button>
            </Card>
          )}
        </CardContent>
      </Card>
      </CardContent>  
                  </Card>
                  </Box>
                   </Box>
  );
}
