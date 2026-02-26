import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Network, BarChart3, BadgeDollarSign, UtilityPole } from 'lucide-react';
import axios from 'axios';

export default function Dashboard() {
  const navigate = useNavigate();

  const [ngayPscTram, setNgayPscTram] = useState(null);      // ID 4
  const [ngayPscOBCCOS, setNgayPscOBCCOS] = useState(null);  // ID 5
  const [thang_cuoc, setthang_cuoc] = useState(null);  // ID 5
  useEffect(() => {
    const fetchPSCTram = async () => {
      try {
        const res = await axios.post(
          'https://ttkd.vnptphuyen.vn:4488/api/DynamicQuery/execute',
          {
            databaseType: 'sql',
            functionName: 'select max(to_Date) ngay_psc from  bsc_pyn.dbo.BC_TieuDung_TongHop',
            parameters: {},
            isRawSql: true,
          },
          { headers: { 'Content-Type': 'application/json' } }
        );
        const fetchedDate = res.data[0]?.ngay_psc;
        if (fetchedDate) setNgayPscTram(new Date(fetchedDate));
      } catch (err) {
        console.error('Lỗi lấy ngày PSC theo trạm:', err);
      }
    };

    const fetthang_cuoc = async () => {
      try {
        const res = await axios.post(
          'https://ttkd.vnptphuyen.vn:4488/api/DynamicQuery/execute',
          {
            databaseType: 'sql',
            functionName: ' 	SELECT MAX(thang) ngay_psc FROM BSC_PYN..PHANTICH_DDTS_2025',
            parameters: {},
            isRawSql: true,
          },
          { headers: { 'Content-Type': 'application/json' } }
        );
        const fetchedDate = res.data[0]?.ngay_psc;
        if (fetchedDate) setthang_cuoc(fetchedDate);
      } catch (err) {
        console.error('Lỗi lấy ngày OBCCOS:', err);
      }
    };

   const fetchPSCObccos = async () => {
      try {
        const res = await axios.post(
          'https://ttkd.vnptphuyen.vn:4488/api/DynamicQuery/execute',
          {
            databaseType: 'sql',
            functionName: ' SELECT MAX(ngay_psc) ngay_psc FROM (select max(NGAYMODICHVU) ngay_psc from  bsc_pyn.dbo.AUTOCALL_OBCCOS_PROGRAM_CKN UNION  select max(NGAYMODICHVU) ngay_psc from  bsc_pyn.dbo.AUTOCALL_OBCCOS_PROGRAM_CKd) a',
            parameters: {},
            isRawSql: true,
          },
          { headers: { 'Content-Type': 'application/json' } }
        );
        const fetchedDate = res.data[0]?.ngay_psc;
        if (fetchedDate) setNgayPscOBCCOS(new Date(fetchedDate));
      } catch (err) {
        console.error('Lỗi lấy ngày OBCCOS:', err);
      }
    };

    setTimeout(() => {
      fetchPSCTram();
      fetchPSCObccos();
      fetthang_cuoc();
    }, 200);
  }, []);

  const colorSchemes = [
    { light: 'bg-gradient-to-br from-blue-50 to-blue-100', dark: 'dark:from-blue-900/50 dark:to-blue-800/50', icon: 'text-blue-600 dark:text-blue-400' },
    { light: 'bg-gradient-to-br from-purple-50 to-purple-100', dark: 'dark:from-purple-900/50 dark:to-purple-800/50', icon: 'text-purple-600 dark:text-purple-400' },
    { light: 'bg-gradient-to-br from-emerald-50 to-emerald-100', dark: 'dark:from-emerald-900/50 dark:to-emerald-800/50', icon: 'text-emerald-600 dark:text-emerald-400' },
    { light: 'bg-gradient-to-br from-rose-50 to-rose-100', dark: 'dark:from-rose-900/50 dark:to-rose-800/50', icon: 'text-rose-600 dark:text-rose-400' },
    { light: 'bg-gradient-to-br from-purple-50 to-purple-100', dark: 'dark:from-purple-900/50 dark:to-purple-800/50', icon: 'text-purple-600 dark:text-purple-400' },
  ];

  const modules = [
    {
      id: 1,
      title: 'Điều hành kỹ thuật',
      description: 'Điều hành kỹ thuật',
      icon: <Network size={36} className={colorSchemes[0].icon} />,
      path: '/powerbi/powerbi-kt',
      badge: null,
      colorScheme: colorSchemes[0],
    },
    {
      id: 2,
      title: 'Điều hành dịch vụ di động',
      description: 'Điều hành dịch vụ di động',
      icon: <BarChart3 size={36} className={colorSchemes[1].icon} />,
      path: '/powerbi/powerbi-kd',
      badge: null,
      colorScheme: colorSchemes[1],
    },
    {
      id: 3,
      title: 'Doanh thu và PSC dịch vụ di động trả sau',
      description: 'Điều hành dịch vụ di động',
      icon: <BadgeDollarSign size={36} className={colorSchemes[2].icon} />,
      path: '/didong/doanhthu-psc',
      badge:  thang_cuoc ? thang_cuoc: null,  
      colorScheme: colorSchemes[2],
    },
    {
      id: 4,
      title: 'Doanh thu và PSC dịch vụ di động theo trạm',
      description: 'Điều hành dịch vụ di động',
      icon: <UtilityPole size={36} className={colorSchemes[3].icon} />,
      path: '/didong/doanhthu-bts',
      badge: ngayPscTram ? ngayPscTram.toLocaleDateString('vi-VN') : null,
      colorScheme: colorSchemes[3],
    },
    {
      id: 5,
      title: 'Doanh thu và số lượng OBCCOS',
      description: 'Điều hành dịch vụ di động',
      icon: <UtilityPole size={36} className={colorSchemes[3].icon} />,
      path: '/didong/doanhthu-obccos',
      badge: ngayPscOBCCOS ? ngayPscOBCCOS.toLocaleDateString('vi-VN') : null,
      colorScheme: colorSchemes[3],
    },
     {
      id: 6,
      title: 'Sản Lượng Doanh Thu',
      description: 'billing',
      icon: <BadgeDollarSign size={36} className={colorSchemes[3].icon} />,
      path: '/billing/sldt',
      badge:   thang_cuoc ? thang_cuoc: null,  
      colorScheme: colorSchemes[3],
    }
  ];

  return (
    <div className="p-4 pb-28 dark:bg-gray-950 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">📊 TTKD Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((mod) => (
          <div
            key={mod.id}
            onClick={() => navigate(mod.path)}
            className={`cursor-pointer p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${mod.colorScheme.light} ${mod.colorScheme.dark}`}
          >
            <div className="flex items-center justify-between">
              <div className="text-4xl">{mod.icon}</div>
              {mod.badge !== null && mod.badge !== '' && (
                <div className="bg-yellow-400 text-black text-xs px-2 py-1 rounded-full">
                 Ngày dữ liệu   {mod.badge}
                </div>
              )}
            </div>
            <h2 className="mt-4 text-lg font-semibold text-gray-800 dark:text-white">{mod.title}</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">{mod.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
