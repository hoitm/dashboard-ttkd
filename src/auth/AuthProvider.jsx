// AuthProvider.jsx
import React, { createContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchOneBSSUserInfo } from '../utils/getUserInfoFromOneBSS';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null); // 👈 Thêm state mới

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const tokenExp = localStorage.getItem('token_exp');
    const expTime = tokenExp ? new Date(tokenExp).getTime() : 0;
    const now = Date.now();

    if (storedToken && expTime > now) {
      setToken(storedToken);
      const timeout = setTimeout(() => {
        logout(); // Tự logout khi hết hạn
      }, expTime - now);

      const storedUserInfo = localStorage.getItem('user_info_onebss');
      if (storedUserInfo) {
        try {
          setUserInfo(JSON.parse(storedUserInfo));
        } catch {}
      }


      setLoading(false);
      return () => clearTimeout(timeout);
    }

    // Token không hợp lệ hoặc hết hạn
    localStorage.clear();
    setToken(null);
    setLoading(false);
  }, []);

  const login = ({ token, accessTokenOne, expires }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('accessTokenOne', accessTokenOne);
    localStorage.setItem('token_exp', expires);
    setToken(token);
    // Gọi OneBSS API và lưu thông tin
    // Gọi lấy user info từ OneBSS
    fetchOneBSSUserInfo(accessTokenOne).then((info) => {
      if (info) setUserInfo(info);
    });

    navigate('/');
  };

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setUserInfo(null);
    // ✅ Chỉ navigate nếu đang ở trang không phải login
    if (location.pathname !== '/login') {
      navigate('/login', { replace: true });
    }
  };

  if (loading) return null; // hoặc splash loading

  return (
    <AuthContext.Provider value={{ token, login, logout , userInfo , loading // ✅ thêm dòng này
     }}>
      {children}
    </AuthContext.Provider>
  );
};
