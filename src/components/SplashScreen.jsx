// src/components/SplashScreen.jsx
import React from 'react';

const SplashScreen = () => {
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
      <img
        src="/pwa-192.png"
        alt="VNPT Phú Yên"
        className="w-20 h-20 animate-bounce"
      />
      <p className="mt-4 text-blue-500 font-semibold animate-pulse text-lg">
        Đang khởi động hệ thống...
      </p>
    </div>
  );
};

export default SplashScreen;
