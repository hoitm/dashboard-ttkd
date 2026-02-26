import React, { useEffect, useState,useContext  } from 'react';
import { useNavigate } from 'react-router-dom';
import { Network, BarChart3, BadgeDollarSign, UtilityPole } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../../auth/AuthProvider'
import ReactECharts from 'echarts-for-react';

import { Card, CardContent, Typography, Grid, Box,Chip  } from '@mui/material';

export default function DashboardDNK() {
    const navigate = useNavigate();
    const { userInfo } = useContext(AuthContext);
    const [soluong_dth, setsoluong_dth] = useState(0);      // ID 4
    const [soluong_dth_dv, setsoluong_dth_dv] = useState(0);// ID 4


    const [ngayPscTram, setNgayPscTram] = useState(0);      // ID 4
    const [ngayPscOBCCOS, setNgayPscOBCCOS] = useState(0);  // ID 5
    const nhanvien_id = userInfo?.nhanvien_id || "0";
    const [dataChart, setDataChart] = useState(null);
    const [stackData, setStackData] = useState(null);
    const [lineData, setLineData] = useState(null);
    const [userCompareData, setUserCompareData] = useState(null);
    const [SuccessByUserData, setSuccessByUserData] = useState(null);



  useEffect(() => {
    const fetchSoluongTon= async () => {
      try {
        const res = await axios.post(
          'https://ttkd.vnptphuyen.vn:4488/api/DynamicQuery/execute',
          {
            databaseType: 'sql',
            functionName: 'SELECT COUNT(*) AS SOLUONG FROM PHANTAP_PYN.dbo.TAP_KHACHHANG_VN_SUDUNG_MANG_KHAC_2025 WHERE  NHANVIEN_ID =@NHANVIEN_ID AND IScall =0 and ISsend =1',
            parameters: { nhanvien_id },
            isRawSql: true,
          },
          { headers: { 'Content-Type': 'application/json' } }
        );
        const fetchedDate = res.data[0]?.SOLUONG;
        if (fetchedDate) setNgayPscTram(fetchedDate);
      } catch (err) {
        console.error('Lỗi lấy ngày PSC theo trạm:', err);
      }
    };

  
    const fetchSoluongDathucHien= async () => {
      try {
        const res = await axios.post(
          'https://ttkd.vnptphuyen.vn:4488/api/DynamicQuery/execute',
          {
            databaseType: 'sql',
            functionName: 'SELECT COUNT(*) AS SOLUONG FROM   PHANTAP_PYN.dbo.TAP_KHACHHANG_VN_SUDUNG_MANG_KHAC_2025 WHERE  NHANVIEN_ID =@NHANVIEN_ID AND IScall =1 and ISsend =1',
            parameters: { nhanvien_id },
            isRawSql: true,
          },
          { headers: { 'Content-Type': 'application/json' } }
        );
        const fetchedDate = res.data[0]?.SOLUONG;
        if (fetchedDate) setsoluong_dth(fetchedDate);
      } catch (err) {
        console.error('Lỗi lấy ngày PSC theo trạm:', err);
      }
    };
const fetchSoluongDathucHiendv= async () => {
      try {
        const res = await axios.post(
          'https://ttkd.vnptphuyen.vn:4488/api/DynamicQuery/execute',
          {
            databaseType: 'sql',
            functionName: 'SELECT COUNT(*) AS SOLUONG FROM   PHANTAP_PYN.dbo.TAP_KHACHHANG_VN_SUDUNG_MANG_KHAC_2025 WHERE    IScall =1 and ISsend =1',
            parameters: {},
            isRawSql: true,
          },
          { headers: { 'Content-Type': 'application/json' } }
        );
        const fetchedDate = res.data[0]?.SOLUONG;
        if (fetchedDate) setsoluong_dth_dv(fetchedDate);
      } catch (err) {
        console.error('Lỗi lấy ngày PSC theo trạm:', err);
      }
    };

    const fetchPSCObccos = async () => {
      try {
        const res = await axios.post(
          'https://ttkd.vnptphuyen.vn:4488/api/DynamicQuery/execute',
          {
            databaseType: 'sql',
            functionName: 'select max(NGAYMODICHVU) ngay_psc from  bsc_pyn.dbo.AUTOCALL_OBCCOS_PROGRAM_CKN',
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
      fetchSoluongTon();
      fetchPSCObccos();
      fetchSoluongDathucHien();
      fetchSoluongDathucHiendv();
    }, 200);
  }, []);

  const colorSchemes = [
    { light: 'bg-gradient-to-br from-blue-50 to-blue-100', dark: 'dark:from-blue-900/50 dark:to-blue-800/50', icon: 'text-blue-600 dark:text-blue-400' },
    { light: 'bg-gradient-to-br from-purple-50 to-purple-100', dark: 'dark:from-purple-900/50 dark:to-purple-800/50', icon: 'text-purple-600 dark:text-purple-400' },
    { light: 'bg-gradient-to-br from-emerald-50 to-emerald-100', dark: 'dark:from-emerald-900/50 dark:to-emerald-800/50', icon: 'text-emerald-600 dark:text-emerald-400' },
    //{ light: 'bg-gradient-to-br from-rose-50 to-rose-100', dark: 'dark:from-rose-900/50 dark:to-rose-800/50', icon: 'text-rose-600 dark:text-rose-400' },
    //{ light: 'bg-gradient-to-br from-purple-50 to-purple-100', dark: 'dark:from-purple-900/50 dark:to-purple-800/50', icon: 'text-purple-600 dark:text-purple-400' },
  ];

  const modules = [
    {
      id: 1,
      title: 'Danh sách theo đơn vị',
      description: 'Danh sách tái chiếm đối thủ theo đơn vị',
      icon: <Network size={36} className={colorSchemes[0].icon} />,
      path: '/brcd/danhsach-tcdt-donvi',
        badge: soluong_dth_dv ? soluong_dth_dv : 0,
      colorScheme: colorSchemes[0],
    },
    {
      id: 2,
      title: 'Danh sách đã thực hiện',
      description: 'Danh sách tái chiếm đối thủ đã thực hiện',
      icon: <BarChart3 size={36} className={colorSchemes[1].icon} />,
      path: '/brcd/danhsach-tcdt-canhan',
       badge: soluong_dth ? soluong_dth: 0,
      colorScheme: colorSchemes[1],
    },
    {
      id: 3,
      title: 'Danh sách tồn cần thực hiên',
      description: 'Danh sách tồn cần thực hiên',
      icon: <BadgeDollarSign size={36} className={colorSchemes[2].icon} />,
      path: '/taichiem-mangkhac',
       badge: ngayPscTram ? ngayPscTram: 0,
      colorScheme: colorSchemes[2],
    } ,  
    {
      id: 4,
      title: 'Ds tồn chuyển phiếu',
      description: 'Ds tồn chuyển phiếu',
      icon: <BadgeDollarSign size={36} className={colorSchemes[2].icon} />,
      path: '/taichiem-chuyenphieu',
      badge: ngayPscTram ? ngayPscTram: 0,
      colorScheme: colorSchemes[2],
    } 
  ];
  
 
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.post('https://ttkd.vnptphuyen.vn:4488/api/DynamicQuery/execute', {
          databaseType: 'sql',
          functionName: 'PHANTAP_PYN.DBO.TAP_KHACHHANG_VN_SUDUNG_MANG_KHAC_2025_NHANVIEN_DALAM',
          parameters: { nhanvien_id, chi_thi: "41" },
          isRawSql: false,
        }, { headers: { 'Content-Type': 'application/json' } });

        const rawData = res.data || [];

        // Bar/Pie Chart Data (filtered)
        const filtered = rawData.filter(item => item.NHA_MANG);
        const groupedByMang = filtered.reduce((acc, cur) => {
          const key = cur.NHA_MANG;
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {});
        const chartData = Object.entries(groupedByMang).map(([name, value]) => ({ name, value }));
        setDataChart(chartData);

        // Stack Chart theo đơn vị
        const group = {};
        rawData.forEach(item => {
          if (!item.NHA_MANG) return;
          const donvi = item.MA_PHONG || 'Khác';
          const mang = item.NHA_MANG;
          group[donvi] = group[donvi] || {};
          group[donvi][mang] = (group[donvi][mang] || 0) + 1;
        });
        const donviIds = Object.keys(group);
        const nhaMangSet = new Set();
        donviIds.forEach(dv => Object.keys(group[dv]).forEach(m => nhaMangSet.add(m)));
        const nhaMangArr = Array.from(nhaMangSet);
        const series = nhaMangArr.map(mang => ({
          name: mang,
          type: 'bar',
          stack: 'total',
          emphasis: { focus: 'series' },
          data: donviIds.map(dv => group[dv][mang] || 0)
        }));
        setStackData({
          tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
          legend: { bottom: 0 },
          grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
          xAxis: { type: 'category', data: donviIds },
          yAxis: { type: 'value' },
          series
        });

        const byDate = {};
        rawData.forEach(item => {
          const date = (item.NGAY_CALL || '').split('T')[0];
          if (date) byDate[date] = (byDate[date] || 0) + 1;
        });
        const lineDataArr = Object.entries(byDate).sort().map(([date, value]) => ({ date, value }));
        setLineData({
          xAxis: { type: 'category', data: lineDataArr.map(d => d.date) },
          yAxis: { type: 'value' },
          tooltip: { trigger: 'axis' },
          series: [{ data: lineDataArr.map(d => d.value), type: 'line', smooth: true, name: 'Lượt gọi' }]
        });

        /// DỮ LIỆU THEO NHÂN VIEN 
        /// DỮ LIỆU THEO NHÂN VIEN 
const groupByUser = {};
rawData.forEach(item => {
  const nv = item.TEN_NV_KD;
  const mang = item.NHA_MANG;
  if (!nv || nv.trim() === '' || !mang) return;
  groupByUser[nv] = groupByUser[nv] || {};
  groupByUser[nv][mang] = (groupByUser[nv][mang] || 0) + 1;
});

const userNames = Object.keys(groupByUser);
const nhaMangSet1 = new Set();
userNames.forEach(nv => Object.keys(groupByUser[nv]).forEach(m => nhaMangSet1.add(m)));
const nhaMangArr1 = Array.from(nhaMangSet1);

const userSeries = nhaMangArr1.map(mang => ({
  name: mang,
  type: 'bar',
  stack: 'total',
  emphasis: { focus: 'series' },
  data: userNames.map(nv => groupByUser[nv][mang] || 0)
}));

setUserCompareData({
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
  legend: { bottom: 0 },
  grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
  xAxis: {
    type: 'category',
    data: userNames,
    axisLabel: {
      rotate: 45,         // Góc nghiêng tên nhân viên
      overflow: 'truncate',
      interval: 0
    }
  },
  yAxis: { type: 'value' },
  dataZoom: [
    { type: 'slider', start: 0, end: 100 }, // Cho phép kéo ngang
    { type: 'inside' }                      // Hỗ trợ scroll chuột
  ],
  series: userSeries
});



       /* const byUser = {};
        rawData.forEach(item => {
          if (!item.TEN_NV_KD || item.TEN_NV_KD.trim() === '') return;
          const nv = item.TEN_NV_KD;
          byUser[nv] = (byUser[nv] || 0) + 1;
        });

        const userCompare = Object.entries(byUser).map(([name, value]) => ({ name, value }));

        setUserCompareData({
          xAxis: { type: 'category', data: userCompare.map(u => u.name) },
          yAxis: { type: 'value' },
          tooltip: {},
          series: [{ data: userCompare.map(u => u.value), type: 'bar', name: 'Hiệu suất' }]
        });
        */




        /// CVHART THÀNH CÔNG THEO NHÂN VIÊN 
 const successGroup = {};

rawData.forEach(item => {
  const nv = item.TEN_NV_KD?.trim();
  if (!nv) return;
  const isSuccess = item.THANH_CONG === 1 ? 'Đã thực hiện' : 'Chưa thực hiện';
  successGroup[nv] = successGroup[nv] || { 'Đã thực hiện': 0, 'Chưa thực hiện': 0 };
  successGroup[nv][isSuccess]++;
});

const tenNhanViens = Object.keys(successGroup);

const stackSeries = ['Đã thực hiện', 'Chưa thực hiện'].map(status => ({
  name: status,
  type: 'bar',
  stack: 'total',
  emphasis: { focus: 'series' },
  itemStyle: {
    color: status === 'Đã thực hiện' ? '#4CAF50' : '#F44336'
  },
 label: {
    show: true,
    position: 'top',
    formatter: (params) => {
      const total = successGroup[params.name]['Đã thực hiện'] + successGroup[params.name]['Chưa thực hiện'];
      const percent = total > 0 ? ((params.value / total) * 100).toFixed(0) : 0;
      return status === 'Đã thực hiện'
        ? `${params.value} (${percent}%)`
        : ''; // Không cần label cho "Chưa thực hiện"
    }
  },

  data: tenNhanViens.map(nv => successGroup[nv][status] || 0)
}));

setSuccessByUserData({
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
  legend: { bottom: 0 },
  grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
  xAxis: {
    type: 'category',
    data: tenNhanViens,
    axisLabel: {
      rotate: 45,
      overflow: 'truncate',
      interval: 0
    }
  },
  yAxis: { type: 'value' },
  dataZoom: [
    { type: 'slider', start: 0, end: 100 },
    { type: 'inside' }
  ],
  series: stackSeries
});


      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu biểu đồ:', error);
      }
    };
    fetchData();
  }, [nhanvien_id]);

  const getBarOption = () => ({
    title: { text: 'Số lượng thuê bao theo nhà mạng', left: 'center' },
    tooltip: {},
    xAxis: { type: 'category', data: dataChart?.map(item => item.name) || [] },
    yAxis: { type: 'value' },
    series: [{ name: 'Số lượng', type: 'bar', data: dataChart?.map(item => item.value) || [], itemStyle: { color: '#3b82f6' } }]
  });

  const getPieOption = () => ({
    title: { text: 'Tỷ lệ nhà mạng', left: 'center' },
    tooltip: { trigger: 'item' },
    legend: { bottom: '0%', left: 'center' },
    series: [{ name: 'Tỷ lệ', type: 'pie', radius: '60%', data: dataChart || [] }]
  });


return (
    <Box sx={{ background: '#f7f9fc', minHeight: '100vh', p: 3 , pb:24}}>

       <Box>
              <Card className="rounded-2xl shadow-xl border border-gray-200">
                <CardContent>
                 
        
                  <Box>
          <Typography variant="h4" color='primary' fontWeight={700} mb={3}>📊 DASHBOARD TÁI CHIẾM TB ĐỐI THỦ</Typography>
      <Grid container spacing={2} justifyContent="flex-start">
        {modules.map(mod => (
          <Grid item xs={12} sm={6} md={4} key={mod.id}>
            <Card
              sx={{
                minHeight: 120,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                p: 2,
                borderRadius: 3,
                boxShadow: 4,
                cursor: 'pointer',
                transition: '0.3s',
                '&:hover': { boxShadow: 8 }
              }}
              onClick={() => navigate(mod.path)}
            >
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>{mod.icon}</Box>
                <Chip label={`Số lượng: ${mod.badge}`} color="warning" size="small" />
              </Box>
             <Typography fontWeight={600} fontSize={14} sx={{ overflowWrap: 'break-word', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                  {mod.title}
             </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>
       
 </Box></CardContent>  </Card></Box>

      <Box mt={6}>
        <Card className="rounded-2xl shadow-xl border border-gray-200">
              <Typography variant="h5"  color='primary' fontWeight={600} mb={2}>📈 PHÂN TÍCH DỮ LIỆU</Typography>
              
        </Card>
        

          <Grid item xs={12} md={6}><Card sx={{ p: 2 }}>
           {dataChart?.length ? (
                <ReactECharts option={getBarOption()} style={{ height: 400, width: '100%' }} />
              ) : <Typography>Không có dữ liệu biểu đồ cột.</Typography>}
          </Card>
          </Grid>
          <Grid item xs={12} md={6}>
          <Card sx={{ p: 2 }}>
            {dataChart?.length ? (
                <ReactECharts option={getPieOption()} style={{ height: 400, width: '100%' }} />
              ) : <Typography>Không có dữ liệu biểu đồ tròn.</Typography>}
          </Card></Grid>
          <Grid item xs={12}>
            <Card sx={{ p: 2 }}>

                {stackData?.series ? (
                  <ReactECharts option={stackData} style={{ height: 400, width: '100%' }} />
                ) : <Typography>Không có dữ liệu stack chart.</Typography>}
            </Card>
          </Grid>
          <Grid item xs={12}><Card sx={{ p: 2 }}>
                {lineData?.series ? (
                <ReactECharts option={lineData} style={{ height: 400, width: '100%' }} />
              ) : <Typography>Không có dữ liệu thời gian.</Typography>}
                 
                 </Card></Grid>

          <Grid item xs={12}><Card sx={{ p: 2 }}>
                  {userCompareData?.series ? (
                <ReactECharts option={userCompareData} style={{ height: 400 , width: '100%'}} />
              ) : <Typography>Không có dữ liệu hiệu suất nhân viên.</Typography>}
          </Card></Grid>
                 
          <Grid item xs={12}><Card sx={{ p: 2 }}>
                  {SuccessByUserData?.series ? (
                <ReactECharts option={SuccessByUserData} style={{ height: 400 , width: '100%'}} />
              ) : <Typography>Không có dữ liệu hiệu suất nhân viên.</Typography>}
          </Card></Grid>
      </Box>
    </Box>
  );
}

/* SuccessByUserData

  return (
    <div className="p-4 pb-28 dark:bg-gray-950 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">📊 DASHBOARD TÁI CHIẾM TB ĐỐI THỦ </h1>
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
                 Số lượng   {mod.badge}
                </div>
              )}
            </div>
            <h2 className="mt-4 text-lg font-semibold text-gray-800 dark:text-white">{mod.title}</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">{mod.description}</p>
          </div>
        ))}
      </div>

        <Box className="mt-10 px-2 sm:px-6">
      <Typography variant="h5" className="text-gray-800 dark:text-white mb-6 font-bold">
        📊 PHÂN TÍCH DỮ LIỆU TÁI CHIẾM ĐÃ THỰC HIỆN
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={12}>
          <Card className="rounded-2xl shadow-md">
            <CardContent>
              {dataChart?.length ? (
                <ReactECharts option={getBarOption()} style={{ height: 400, width: '100%' }} />
              ) : <Typography>Không có dữ liệu biểu đồ cột.</Typography>}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={12}>
          <Card className="rounded-2xl shadow-md">
            <CardContent>
              {dataChart?.length ? (
                <ReactECharts option={getPieOption()} style={{ height: 400, width: '100%' }} />
              ) : <Typography>Không có dữ liệu biểu đồ tròn.</Typography>}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card className="rounded-2xl shadow-md">
            <CardContent>
              <Typography variant="h6" className="mb-2 font-semibold text-indigo-700">Biểu đồ stack theo đơn vị và nhà mạng</Typography>
              {stackData?.series ? (
                <ReactECharts option={stackData} style={{ height: 400 }} />
              ) : <Typography>Không có dữ liệu stack chart.</Typography>}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card className="rounded-2xl shadow-md">
            <CardContent>
              <Typography variant="h6" className="mb-2 font-semibold text-green-700">Phân tích lượt gọi theo ngày</Typography>
              {lineData?.series ? (
                <ReactECharts option={lineData} style={{ height: 400 }} />
              ) : <Typography>Không có dữ liệu thời gian.</Typography>}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card className="rounded-2xl shadow-md">
            <CardContent>
              <Typography variant="h6" className="mb-2 font-semibold text-blue-700">So sánh hiệu suất giữa các nhân viên</Typography>
              {userCompareData?.series ? (
                <ReactECharts option={userCompareData} style={{ height: 400 }} />
              ) : <Typography>Không có dữ liệu hiệu suất nhân viên.</Typography>}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
    </div>
  );
}
*/