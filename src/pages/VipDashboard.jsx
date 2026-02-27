import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, Button, CircularProgress, Grid } from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Autoplay } from 'swiper/modules';
 
import { Bolt, WaterDrop, PhoneIphone, Wifi } from '@mui/icons-material';
import menuData from '../mock/menu.json';
import serviceData from '../mock/services.json';
import telecomData from '../mock/telecom.json';
import congcuData from  '../mock/congcu.json';
 import bangiaoData from  '../mock/bangiao_hoso.json';

import { useNavigate } from 'react-router-dom';
import { Network, BarChart3, BadgeDollarSign, UtilityPole } from 'lucide-react';
import { getNgayPscMax, getMaxThangPhanTichDdts2025, getMaxNgayObccos } from '../services/didongApi';

export default function VipDashboard() {

  const [menuItems, setMenuItems] = useState([]);
  const [services, setServices] = useState([]);
  const [telecomItems, setTelecomItems] = useState([]);
  const [congcuItems, setCongcuItems] = useState([]);
  const [bangiao_hoso, setbangiao_hoso] = useState([]);

  
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [ngayPscTram, setNgayPscTram] = useState(null);      // ID 4
  const [ngayPscOBCCOS, setNgayPscOBCCOS] = useState(null);  // ID 5
  const [thang_cuoc, setthang_cuoc] = useState(null);        // ID 5
  useEffect(() => {
    const fetchPSCTram = async () => {
      try {
        const data = await getNgayPscMax();
        const fetchedDate = data[0]?.ngay_psc;
        if (fetchedDate) setNgayPscTram(new Date(fetchedDate));
      } catch (err) {
        console.error('Lỗi lấy ngày PSC theo trạm:', err);
      }
    };

    const fetthang_cuoc = async () => {
      try {
        const data = await getMaxThangPhanTichDdts2025();
        const fetchedDate = data[0]?.ngay_psc;
        if (fetchedDate) setthang_cuoc(fetchedDate);
      } catch (err) {
        console.error('Lỗi lấy ngày OBCCOS:', err);
      }
    };

   const fetchPSCObccos = async () => {
      try {
        const data = await getMaxNgayObccos();
        const fetchedDate = data[0]?.ngay_psc;
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
  useEffect(() => {
    setTimeout(() => {
      setMenuItems(menuData);
      setServices(serviceData);
      setTelecomItems(telecomData);
      setCongcuItems(congcuData);
      setbangiao_hoso(bangiaoData);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <Box className="flex justify-center items-center min-h-screen">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="p-4 pb-16 bg-gradient-to-br from-white to-blue-50 min-h-screen">

{/* --- SWIPER: CARD ATM --- */}
<Typography variant="h6" className="mb-2 text-blue-800 font-extrabold tracking-wide uppercase">
  🎁 SẢN LƯỢNG DOANH THU
</Typography>

<Swiper
  // card ATM nhìn sang hơn khi canh giữa và auto width
  slidesPerView={'auto'}
  centeredSlides
  spaceBetween={18}
  loop
  grabCursor
  autoplay={{ delay: 1500, disableOnInteraction: false }}
  modules={[Autoplay]}
  className="mb-6"
>
  {modules.map((item) => (
    <SwiperSlide
      key={item.id}
      // 👉 KÍCH THƯỚC CỐ ĐỊNH NHƯ THẺ ATM (responsive)
      
       className="!w-[300px] sm:!w-[360px] md:!w-[420px] !h-[180px]"
    >
      <div
        onClick={() => navigate(item.path)}
     className={[
    "relative h-full w-full rounded-3xl shadow-xl transition-all duration-300",
    "hover:-translate-y-1 hover:shadow-2xl cursor-pointer",
    // Gradient nền đậm hơn
    "bg-gradient-to-br from-[rgba(0,120,255,0.95)] to-[rgba(0,80,180,0.95)]", // bạn thay theo màu scheme
    "overflow-hidden"
  ].join(" ")}
      >
        {/* Hoa văn nền */}
        <div
          className="absolute inset-0 opacity-15"
    style={{
      background:
        "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.35) 0 6%, transparent 7%) 0 0 / 20px 20px, radial-gradient(circle at 80% 80%, rgba(255,255,255,0.25) 0 5%, transparent 6%) 0 0 / 22px 22px"
    }}
        />

        {/* Header: logo + ribbon ngày dữ liệu */}
        <div className="relative z-10 flex items-start justify-between px-5 pt-4">
          <div className="flex items-center gap-3">
            {/* icon lớn kiểu “logo thẻ” */}
            <div className="p-2 rounded-xl bg-white/80 backdrop-blur">
              {item.icon}
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] text-black/60 dark:text-white/70 font-medium">
                VNPT Phú Yên
              </span>
              <span className="text-[11px] text-black/45 dark:text-white/60">
                {item.description}
              </span>
            </div>
          </div>

          {item.badge ? (
            <div className="bg-yellow-400 text-black text-[11px] font-semibold px-3 py-1 rounded-full shadow">
              Ngày dữ liệu {item.badge}
            </div>
          ) : null}
        </div>

        {/* Body: tiêu đề lớn + icon “chip thẻ” */}
        <div className="relative z-10 px-5 mt-2">
          {/* chip   <div className="w-10 h-7 rounded-md bg-white/80 backdrop-blur shadow-inner border border-white/60" /> */}
        
          {/* tiêu đề */}
        <h2 className="mt-2 text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-snug line-clamp-2 drop-shadow-sm">
  {item.title}
</h2>
        </div>

        {/* Footer: “xem chi tiết” */}
        <div className="relative z-10 px-5 mt-4">
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-black/60 dark:text-white/70">
              Chạm để xem chi tiết
            </span>
            <span className="text-[12px] font-semibold text-blue-700 dark:text-blue-300">
              Mở ➜
            </span>
          </div>
        </div>

        {/* viền sáng nhẹ quanh card */}
        <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/40" />
      </div>
    </SwiperSlide>
  ))}
</Swiper>



     

  <Typography variant="h6" className="mb-3 text-blue-900 font-bold">
  🛠 THỰC THI KỊCH BẢN
</Typography>
<Box className="flex overflow-x-auto gap-4 pb-2 mb-6 scrollbar-hide">
  {services.map((service, index) => (
    <Card
      key={index}
      onClick={() => navigate(service.url)  }
      className="min-w-[160px] flex flex-col items-center justify-center rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-blue-100 bg-gradient-to-br from-white via-blue-50 to-blue-100 hover:scale-105"
    >
      <Box className="w-17 h-17 bg-white rounded-full shadow-md flex items-center justify-center mb-2">
        <img
          src={`${service.icon}`} // icon PNG nền trong suốt
          alt={service.label}
          className="w-16 h-16 object-contain"
        />
      </Box>
      <Typography className="text-sm font-semibold text-blue-700 text-center">
        {service.label}
      </Typography>
    </Card>
  ))}
</Box>

 <Typography variant="h6" className="mb-2 text-red-800 font-bold">
        📑 Bàn giao hồ sơ khách hàng 📝
      </Typography>
    
        <Card    className="p-4 bg-white rounded-1xl shadow hover:shadow-md transition-all cursor-pointer border border-gray-100 flex   "
        > 
            <Grid container spacing={1}   className="mb-4 flex ">
                    {bangiao_hoso.map((item, index) => (
                    <Box   key={index}
                         onClick={() => navigate(item.url)}
                         className="flex   w-60 h-40   " >
                            <img
                                src={item.icon}
                                alt={item.label}
                                className="w-60 h-40 object-contain"
                                onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/icons/fallback.png';
                                }}
                            />
                    </Box>
            ))}
            </Grid>
     </Card>    

      <Typography variant="h6" className="mb-2 text-blue-800 font-bold">
        🧰 Công cụ
      </Typography>
    
        <Card    className="p-4 bg-white rounded-2xl shadow hover:shadow-md transition-all cursor-pointer border border-gray-100 flex   "
        > 
            <Grid container spacing={1}   className="mb-4 flex ">
                    {congcuItems.map((item, index) => (
                    <Box   key={index}
                         onClick={() => navigate(item.url)}
                         className="flex    w-16 h-16 bg-white rounded-full shadow-md border border-gray-200 hover:shadow-lg transition-all cursor-pointer " >
                            <img
                                src={item.icon}
                                alt={item.label}
                                className="w-20 h-20 object-contain"
                                onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/icons/fallback.png';
                                }}
                            />
                    </Box>
            ))}
            </Grid>
     </Card>       
 
      <Typography variant="h6" className="mb-2 text-blue-800 font-bold">
        🏢 Dịch vụ 🏢
      </Typography>
    
        <Card    onClick={() => navigate(item.url)}   
        className="p-4 bg-white rounded-2xl shadow hover:shadow-md transition-all cursor-pointer border border-gray-100 flex  "
        > 
            <Grid container spacing={1} 
                    className="mb-4 flex  ">
                    {telecomItems.map((item, index) => (
                    <Box   key={index}
                       onClick={() => navigate(item.url)}   
                        className="flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-md border border-gray-200 hover:shadow-lg transition-all cursor-pointer" >
                            <img
                                src={item.icon}
                                alt={item.label}
                                className="w-20 h-20 object-contain"
                                onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/icons/fallback.png';
                                }}
                            />
                    </Box>
            ))}
            </Grid>
     </Card>      
      <Typography variant="h6" className="mb-2 text-blue-800 font-bold">
        ⚙️ Cài đặt chứng thư số smart CA
      </Typography>
      <Card className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 text-white rounded-3xl shadow-2xl p-6">
        <Typography variant="h6" className="font-bold text-lg mb-1">
          SmartOTP chỉ 3 GIÂY
        </Typography>
        <Typography variant="body2" className="text-white/90">
          Giao dịch nhanh chóng, an toàn, không lo rủi ro.
        </Typography>
        <Button
          className="mt-4 bg-white text-blue-700 font-bold hover:bg-gray-100"
          variant="contained"
          onClick={() => navigate('/profile')}
        >
          CÀI ĐẶT NGAY
        </Button>
      </Card>
    </Box>
  );
}
