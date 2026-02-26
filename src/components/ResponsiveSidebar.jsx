// File: src/components/ResponsiveSidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, LayoutDashboard, Clock, UploadCloud, X , Network, BarChart3,BadgeDollarSign , Computer } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../auth/AuthProvider';
import { LogOut } from 'lucide-react';
import QrCodeIcon from '@mui/icons-material/QrCode';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import WifiIcon from "@mui/icons-material/Wifi";
  
import SimCardIcon from "@mui/icons-material/SimCard";

import PasswordIcon from '@mui/icons-material/Password';

export default function ResponsiveSidebar({ dark, setDark, open, setOpen }) {
  const { userInfo } = useContext(AuthContext);
  const nhanvien_id = userInfo?.nhanvien_id;

const links = [
  { to: '/', label: 'Dashboard', icon: <LayoutDashboard size={22} /> },
  { to: '/didong/doanhthu-psc', label: 'DDTS-PSC', icon: <BadgeDollarSign size={22} /> },
  { to: '/powerbi/powerbi-kt', label: 'DHSXKT', icon: <Network size={22} /> },
  { to: '/powerbi/powerbi-kd', label: 'DHSXKD', icon: <BarChart3 size={22} /> },
  { to: '/uploads/upload-cts', label: 'Upload CTS', icon: <UploadCloud size={22} /> },
  { to: '/brcd/ds-mangkhac', label: 'BRCD DNK', icon: <WifiIcon size={22} /> },
//  { to: '/brcd/invoice-index', label: 'HDĐT', icon: <Computer size={22} /> },
  { to: '/thucuoc/index', label: 'Qr Thanh toán', icon: <ReceiptLongIcon size={22} /> },
  { to: '/thucuoc/inqr', label: 'In QR Động', icon: <QrCode2Icon size={22} /> },
  { to: '/thucuoc/reset-mk-billing', label: 'Reset MK billing', icon: <PasswordIcon size={22} /> },
 
   ...(nhanvien_id === 220492 || nhanvien_id === 220338
      ? [{ to: '/sl/sldt', label: 'Sim lên gói theo NV', icon: <SimCardIcon size={22} /> }]
      : []),
   
   ...(nhanvien_id === 220338 || nhanvien_id === 220338
      ? [{ to: '/billing/in-qr', label: 'in test', icon: <SimCardIcon size={22} /> }]
      : [])
   
];
///billing/in-qr
  const location = useLocation();
  const { logout } = useContext(AuthContext);

  const handleLinkClick = () => {
    if (window.innerWidth < 768) setOpen(false);
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setOpen(false)}
        ></div>
      )}

      <div
        className={`fixed z-50 top-0 left-0 h-full bg-white dark:bg-gray-900 shadow transition-all duration-300 ease-in-out
        ${open ? 'translate-x-0 w-64' : 'md:w-16 w-14 -translate-x-full'}
        md:translate-x-0 md:relative md:flex md:flex-col p-4 space-y-4 overflow-hidden`}
      >
       {/*
         <div className={`hidden md:flex items-center ${open ? 'justify-between' : 'justify-center'} mb-4`}>
          {open && <h2 className="text-lg font-bold text-gray-800 dark:text-white">Menu</h2>}
          <button onClick={() => setOpen(!open)}>
            <X className="text-gray-600 dark:text-white" />
          </button>
        </div>
       */}

        <div className="md:hidden block">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Menu</h2>
            <button onClick={() => setOpen(false)}>
              <X className="text-gray-600 dark:text-white" />
            </button>
          </div>
        </div>
        {/* Vùng list cuộn độc lập */}
        <div
          className="flex-1 min-h-0 overflow-y-auto pr-1 scroll-thin"
          style={{ WebkitOverflowScrolling: 'touch' }}
        > 
        <ul className="space-y-2 flex-1">
          {links.map((link, i) => (
            <li key={i}>
              <Link
                to={link.to}
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-blue-100 dark:hover:bg-blue-900 transition
                ${open ? 'justify-start' : 'justify-center'}
                ${location.pathname === link.to ? 'bg-blue-100 dark:bg-blue-900 font-semibold' : ''}`}
              >
                <span className="text-blue-700 dark:text-blue-300 flex-shrink-0">{link.icon}</span>
                {open && <span className="truncate">{link.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
        
              <button
                onClick={logout}
                className={`flex items-center gap-2 px-3 py-2 rounded bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 w-full mb-2 ${!open ? 'justify-center' : ''}`}
              >
                <LogOut size={18} />
                {open && 'Đăng xuất'}
            </button>
              <button
                onClick={() => setDark(!dark)}
                className={`flex items-center gap-2 px-3 py-2 rounded bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-200 w-full ${!open ? 'justify-center' : ''}`}
              >
                {dark ? <Sun size={18} /> : <Moon size={18} />}
                {open && (dark ? 'Light mode' : 'Dark mode')}
              </button>   {/* chừa không gian an toàn đáy cho mobile notch */}
          <div className="h-4 md:h-2" />
        </div>
      </div>
    </>
  );
}
