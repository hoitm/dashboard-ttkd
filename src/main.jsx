// File: src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { AuthProvider } from './auth/AuthProvider'; // Bọc TẠI ĐÂY
import { registerSW } from 'virtual:pwa-register';
registerSW();
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider> {/* ✅ Bọc sau BrowserRouter */}
        <App />
      </AuthProvider>
    </BrowserRouter>   
  </React.StrictMode>
);
