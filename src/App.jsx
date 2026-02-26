// File: src/App.jsx
import React, { useState, useEffect,useContext } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import VipDashboard from './pages/VipDashboard';
//VipDashboard
import ComingSoon from './pages/ComingSoon';
import Sidebar from './components/Sidebar';
import UploadCts from './pages/UploadCts';
import DieuHanhKyThuat from './pages/powerbi/DieuHanhKyThuat.tsx';
import UploadCTS8362 from './pages/uploads/UploadCTS8362.tsx';
import DieuHanhKinhDoanh from './pages/powerbi/DieuHanhKinhDoanh.tsx';
import RevenueEditor from './pages/kehoach/KHRevenueEditor.jsx';

import SemiTapHuyView from './pages/bangiao_kh/SemiTapHuyView.jsx';
 import SemiHuyDashboard from './pages/bangiao_kh/SemiHuyDashboard.jsx';

import DynamicUpload from './pages/bangiao_kh/DynamicUpload.jsx';

//DieuHanhKinhDoanh.tsx
//UploadCTS8362.tsx
//DieuHanhKyThuat
import ResponsiveSidebar from './components/ResponsiveSidebar';
import LoginWithOTP from './pages/LoginWithOTP.jsx';
import { AnimatePresence, motion } from 'framer-motion';
import AppBar from './components/AppBar';
import SplashScreen from './components/SplashScreen';
import { AuthProvider } from './auth/AuthProvider';
import PrivateRoute from './auth/PrivateRoute';
import { requestPermission } from './utils/fcm';
import { AuthContext } from './auth/AuthProvider';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import DataViewer from './pages/sanluong/DataViewer.jsx';
import SoluongDoanhthuDashboard from './pages/sanluong/SoluongDoanhthuDashboard.jsx';
import SoluongDoanhthuDashboard_CHITIET from './pages/sanluong/SoluongDoanhthuDashboard_CHITIET.jsx';
import SoluongDoanhthuDashboard_ChuaGoi from './pages/sanluong/SoluongDoanhthuDashboard_ChuaGoi.jsx';

import SoluongDoanhthuDashboard_CHITIET_ChuaGoi from './pages/sanluong/SoluongDoanhthuDashboard_CHITIET_ChuaGoi.jsx';

import PaymentSearchByMaTT from './pages/thucuoc/PaymentSearchByMaTT.jsx';
import SearchQrVinaphone   from './pages/thucuoc/SearchQrVinaphone.jsx';
import ResetBilling        from './pages/thucuoc/ResetBilling.jsx';
import ThongBaoCuocTheoMaZalo        from './pages/thucuoc/ThongBaoCuocTheoMaZalo.jsx';
import XNTTTheoMaZalo        from './pages/thucuoc/XNTTTheoMaZalo.jsx';

 
//SoluongDoanhthuDashboard.jsx
import GHTTDashboard from './pages/brcd/GHTTDashboard.tsx';
import GHTTSummaryTable from './pages/brcd/GHTTSummaryTable.jsx';
import GHTTTabs from './pages/brcd/GHTTTabs.jsx';
import CallListDashboard from './pages/brcd/CallListDashboard.jsx';
import DashboardDNK from './pages/brcd/DashboardDNK.jsx';
import CallResultTable from './pages/brcd/CallResultTable.jsx';

import CallResultTableDonVi from './pages/brcd/CallResultTableDonVi.jsx';
import DashboardHDDT from './pages/hddt/DashboardHDDT.jsx';

//DashboardHDDT
//CallResultTableDonVi
/// CallResultTable.jsx
//DashboardDNK.jsx
//CallListDashboard.jsx

import NotificationList from './pages/brcd/NotificationList.jsx';

import BottomTabBar     from './components/BottomTabBar'; // ⬅️ thêm đầu file
import { useSwipeLeft } from './hooks/useSwipeLeft';      // 👈 dòng mới
import { useSwipe }     from './hooks/useSwipe';          // 👈 thay vì useSwipeLeft

import DoanhThuPSC from './pages/DiDong/PhanTichDiDong2025.jsx';
import Didong_psc from './pages/DiDong/Didong_psc.jsx';
import KiemSoatPage from './pages/billing/KiemSoatPage.jsx';
import SanLuongDoanhThuUI from './pages/billing/SanLuongDoanhThuUI.jsx';
import ThermalPrinterPT210 from './pages/billing/ThermalPrinterPT210.jsx';
 import SignDigitalAdvanced from "./pages/kyso/SignDigitalAdvanced";
  import SignatureProfilePage from "./pages/kyso/SignatureProfilePage";
  import SignCenter from "./pages/kyso/SignCenter";

 
import Profile from './pages/Profile';
//ThermalPrinterPT210.jsx
//profile
//KichBanManager.jsx
import KichBanManager from './pages/billing/KichBanManager.jsx';

 import PhanTichDiDongPSCTheoTram from './pages/DiDong/PhanTichDiDongPSCTheoTram.jsx';

 import DoanhThuGiaHanOB from './pages/DiDong/DoanhThuGiaHanOB.jsx';
 import GHTT_TAB from './pages/brcd/GHTT_TAB.jsx';

 import PlanManager from './pages/kehoach/PlanManager.jsx';

import LocationTracker from './components/LocationTracker';


// AuthProvider
const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
    className="w-full h-full"
  >
    {children}
  </motion.div>
);

export default function App() {
  const location = useLocation();
  const [dark, setDark] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  console.log('Current path:', location.pathname);
  //const { userInfo } = useContext(AuthContext);
  const { userInfo, loading } = useContext(AuthContext);

 // useSwipeLeft(() => {
 //   if (!sidebarOpen) setSidebarOpen(true); // 👈 MỞ sidebar nếu chưa mở
 // });
 useSwipe(
  () => {
    if (!sidebarOpen) setSidebarOpen(true); // Vuốt từ trái sang phải → mở menu
  },
  () => {
    if (sidebarOpen) setSidebarOpen(false); // Vuốt từ phải sang trái → đóng menu
  }
);



  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);
  
  console.log(userInfo);
  useEffect(() => {
    if (userInfo?.nhanvien_id) {
      console.log("ok");
      requestPermission(userInfo); // 💥 gọi hàm sau khi login
    }
  }, [userInfo]);

    const nhanvien_id = userInfo?.nhanvien_id; // hoặc lấy từ auth context

  // Tắt splash sau 2–3 giây hoặc khi load xong report
useEffect(() => {
  const timeout = setTimeout(() => setShowSplash(false),2000); // hoặc đợi PowerBI load xong rồi setShowSplash(false)
  return () => clearTimeout(timeout);
}, []);
 
const isLoginPage = location.pathname === '/login';
return (
  <>   {/*{!loading && userInfo?.nhanvien_id && (
             <LocationTracker nhanvien_id={parseInt(userInfo.nhanvien_id)} /> 
          )}*/}
    {showSplash ? (
      <SplashScreen />
    ) : (
      <div className="flex h-screen w-screen overflow-hidden flex-col">
        {!isLoginPage && <AppBar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />}
       
        <div className="flex flex-1 overflow-hidden">
          {!isLoginPage && (
            <ResponsiveSidebar
              dark={dark}
              setDark={setDark}
              open={sidebarOpen}
              setOpen={setSidebarOpen}
            />
          )}

          {isLoginPage ? (
            <Routes>
              <Route path="/login" element={<LoginWithOTP />} />
            
              
            </Routes>
          ) : (
            <main className="flex-1 overflow-y-auto pb-[72px] p-0">
           {/* {!loading && userInfo?.nhanvien_id && (
           <LocationTracker nhanvien_id={parseInt(userInfo.nhanvien_id)} />
          )} */}
              <AnimatePresence mode="wait">
              <PrivateRoute>
                <Routes location={location} key={location.pathname}>
                  <Route path="/" element={<PageWrapper>  <VipDashboard /> </PageWrapper>} />
                  <Route path="/VipDashboard" element={<PageWrapper>  <Dashboard /> </PageWrapper>} />
                  <Route path="/didong/doanhthu-psc" element={<PageWrapper><DoanhThuPSC /></PageWrapper>} />
                  <Route path="/didong/doanhthu-bts" element={<PageWrapper><Didong_psc /></PageWrapper>} />
                  <Route path="/didong/doanhthu-obccos" element={<PageWrapper><DoanhThuGiaHanOB /></PageWrapper>} />

                  <Route path="/upload-cts" element={<PageWrapper><UploadCts /></PageWrapper>} />
                  <Route path="/powerbi/powerbi-kt" element={<PageWrapper><DieuHanhKyThuat /></PageWrapper>} />
                  <Route path="/powerbi/powerbi-kd" element={<PageWrapper><DieuHanhKinhDoanh /></PageWrapper>} />
                  <Route path="/uploads/upload-cts" element={<PageWrapper><UploadCTS8362 /></PageWrapper>} />
                  <Route path="/kehoach/kh" element={<PageWrapper><RevenueEditor /></PageWrapper>} />
                  <Route path="/sl/view" element={<PageWrapper><DataViewer /></PageWrapper>} />
                
                
                
                  <Route path="/sl/sldt" element={<PageWrapper><SoluongDoanhthuDashboard /></PageWrapper>} />
                  <Route path="/sl/sldt-canhan-chitiet" element={<PageWrapper><SoluongDoanhthuDashboard_CHITIET /></PageWrapper>} />
                 <Route path="/sl/sldt-chuagoi" element={<PageWrapper><SoluongDoanhthuDashboard_ChuaGoi /></PageWrapper>} />
                  <Route path="/sl/sldt-canhan-chitiet-chuagoi" element={<PageWrapper><SoluongDoanhthuDashboard_CHITIET_ChuaGoi /></PageWrapper>} />



                  <Route path="/sl/sldt-ct" element={<PageWrapper><SoluongDoanhthuDashboard /></PageWrapper>} />
                  <Route path="/brcd/ghtd" element={<PageWrapper>  <GHTTDashboard /> </PageWrapper>} />
                  <Route path="/brcd/ghtt-push" element={<PageWrapper>  <NotificationList /> </PageWrapper>} />
                  
                  <Route path="/brcd/ghtd2" element={<PageWrapper>  <GHTTTabs /> </PageWrapper>} />
                  <Route path="/brcd/gia-han-tt" element={<PageWrapper>  <GHTT_TAB /> </PageWrapper>} />

                  <Route path="/billing/sldt" element={<PageWrapper>  <SanLuongDoanhThuUI /> </PageWrapper>} />

                  <Route path="/billing/thuc-thi-kb" element={<PageWrapper>  <KiemSoatPage /> </PageWrapper>} />
                  <Route path="/billing/quanly-kichban" element={<PageWrapper>  <KichBanManager /> </PageWrapper>} />
                  <Route path="/profile" element={<PageWrapper>  <Profile /> </PageWrapper>} />
                  <Route path="/ke-hoach" element={<PageWrapper>  <PlanManager /> </PageWrapper>} />
                  <Route path="/taichiem-mangkhac" element={<PageWrapper>  <CallListDashboard /> </PageWrapper>} />

                  <Route path="/brcd/ds-mangkhac" element={<PageWrapper>  <DashboardDNK /> </PageWrapper>} />
                  <Route path="/brcd/danhsach-tcdt-canhan" element={<PageWrapper>  <CallResultTable /> </PageWrapper>} />
                  <Route path="/brcd/danhsach-tcdt-donvi" element={<PageWrapper>  <CallResultTableDonVi /> </PageWrapper>} />

                  <Route path="/brcd/bangiao-search" element={<PageWrapper>  <SemiTapHuyView /> </PageWrapper>} />
                  <Route path="/brcd/bangiao-upload" element={<PageWrapper>  <DynamicUpload /> </PageWrapper>} />
                  <Route path="/brcd/bangiao-dashboard" element={<PageWrapper>  <SemiHuyDashboard /> </PageWrapper>} />

  

       <Route path="/sign-digital" element={<SignCenter />} />
        <Route path="/sign-profile" element={<SignatureProfilePage />} />

                  <Route path="/thucuoc/index" element={<PageWrapper>  <PaymentSearchByMaTT /> </PageWrapper>} />
                  <Route path="/thucuoc/inqr" element={<PageWrapper>  <SearchQrVinaphone /> </PageWrapper>} />
                  <Route path="/thucuoc/reset-mk-billing" element={<PageWrapper>  <ResetBilling /> </PageWrapper>} />

                  <Route path="/billing/in-qr" element={<PageWrapper>  <VipDashboard /> </PageWrapper>} />
                  <Route path="/thucuoc/thongbaocuoc-zalo" element={<PageWrapper>  <ThongBaoCuocTheoMaZalo /> </PageWrapper>} />
                  <Route path="thucuoc/xntt-cuoc-zalo" element={<PageWrapper>  <XNTTTheoMaZalo /> </PageWrapper>} />


                </Routes> 
                </PrivateRoute>
              </AnimatePresence>   <ToastContainer /> {/* ✅ Không có cái này sẽ không hiện */}
              <BottomTabBar />  {/* ⬅️ thêm dòng này để hiện bottom nav */}

            </main>    
          )}
        </div>
      </div>
    )}
  </>
);
}
  