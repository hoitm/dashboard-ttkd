import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthProvider';

const PrivateRoute = ({ children }) => {
  const { token } = useContext(AuthContext);

  // Nếu chưa có token thì điều hướng về /login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Nếu có token thì render nội dung protected
  return children;
};

export default PrivateRoute;
