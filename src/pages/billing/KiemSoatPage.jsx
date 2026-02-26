// ✅ Phiên bản đầy đủ với Drawer, Card, Tabs, tiến trình, runLoop tách riêng
// Hỗ trợ: Tạm dừng / Tiếp tục / Dừng toàn bộ đúng chuẩn
// Giao diện chuẩn Material UI
// -----------------------------

// 🎨 Giao diện mới với Card Grid + Drawer chi tiết + Tiến trình thực thi + hiển thị tiến trình từng kiểm soát
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import {
  Typography, Button, Grid, Checkbox, Chip, Tabs, Tab, Box,
  Drawer, IconButton, Card, CardContent, CardActions, CardHeader, LinearProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import CloseIcon from '@mui/icons-material/Close';
import * as XLSX from 'xlsx';

// ⬆️ cùng vùng import hiện có
import SearchIcon from '@mui/icons-material/Search';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import {   Select, MenuItem, InputLabel, FormControl, TextField } from '@mui/material';
 

export default function KiemSoatPage() {
  const [data, setData] = useState([]);
  const [selected, setSelected] = useState([]);
  const [executing, setExecuting] = useState(false);
  const [executingIndex, setExecutingIndex] = useState(0);
  const [month, setMonth] = useState(new Date());
  const [logs, setLogs] = useState(() => JSON.parse(localStorage.getItem('kiemsoat_logs') || '{}'));
  const [loadingData, setLoadingData] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerLog, setDrawerLog] = useState(null);
  const [drawerKey, setDrawerKey] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  const [isPaused, setIsPaused] = useState(false);
  const [isStopped, setIsStopped] = useState(false);
  const controllerRef = useRef(null);
  const itemsRef = useRef([]);
  const isPausedRef = useRef(false);
  const isStoppedRef = useRef(false);


  const [drawerLoading, setDrawerLoading] = useState(false);

  // ⬇️ thêm state
  const [groupFilter, setGroupFilter] = useState('');   // tên nhóm cần lọc
  const [keyword, setKeyword] = useState('');           // tìm theo tiêu đề

  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
  useEffect(() => { isStoppedRef.current = isStopped; }, [isStopped]);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        const res = await axios.post('https://ttkd.vnptphuyen.vn:4488/api/DynamicQuery/execute', {
          databaseType: 'sql',
          functionName: "SELECT ks.*, nh.ten_nhom FROM bsc_pyn.dbo.CRM_KIEMSOAT ks JOIN bsc_pyn.dbo.CRM_NHOMKS nh ON ks.nhomks_id = nh.nhomks_id WHERE ks.hieu_luc = 1 ORDER BY nh.stt, ks.stt",
          parameters: {},
          isRawSql: true
        });
        setData(res.data);
      } catch {
        setErrorMsg("Không thể tải dữ liệu.");
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

 
  const runSelected = () => {
    itemsRef.current = data.filter(d => selected.includes(d.kiemsoat_id));
    setExecuting(true);
    setExecutingIndex(0);
    setIsPaused(false);
    setIsStopped(false);
  };

 
  // danh sách nhóm duy nhất
const allGroups = React.useMemo(
  () => [...new Set(data.map(d => d.ten_nhom))],
  [data]
);

// dữ liệu đã lọc theo group + keyword
const filteredData = React.useMemo(() => {
  const byGroup = groupFilter ? data.filter(d => d.ten_nhom === groupFilter) : data;
  const kw = keyword.trim().toLowerCase();
  if (!kw) return byGroup;
  return byGroup.filter(d =>
    (d.tieu_de || '').toLowerCase().includes(kw) ||
    (d.noi_dung || '').toLowerCase().includes(kw)
  );
}, [data, groupFilter, keyword]);

// group lại sau lọc
const grouped = React.useMemo(() => filteredData.reduce((acc, obj) => {
  (acc[obj.ten_nhom] ||= []).push(obj);
  return acc;
}, {}), [filteredData]);

// Lấy sheet đang mở trong Drawer
const getActiveSheet = () => {
  if (!drawerLog || drawerLog.status !== 'success') return null;
  if (activeTab == null || activeTab >= drawerLog.sheets.length) return null;
  return drawerLog.sheets[activeTab]; // { columns, data }
};

const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

// Xuất Excel cho sheet hiện tại
const exportCurrentSheetExcel = () => {
  const sheet = getActiveSheet();
  if (!sheet) return;
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([sheet.columns, ...sheet.data]);
  XLSX.utils.book_append_sheet(wb, ws, `Sheet${(activeTab ?? 0) + 1}`);
  const fileName = `${(drawerLog?.title || 'kiemsoat')}_${yyyymm}_sheet${(activeTab ?? 0)+1}.xlsx`.replace(/\s+/g,'_');
  XLSX.writeFile(wb, fileName);
};

// Xuất CSV cho sheet hiện tại
const exportCurrentSheetCSV = () => {
  const sheet = getActiveSheet();
  if (!sheet) return;
  const ws = XLSX.utils.aoa_to_sheet([sheet.columns, ...sheet.data]);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const fileName = `${(drawerLog?.title || 'kiemsoat')}_${yyyymm}_sheet${(activeTab ?? 0)+1}.csv`.replace(/\s+/g,'_');
  downloadBlob(blob, fileName);
};

// Xuất JSON cho sheet hiện tại (mảng object: {col:value})
const exportCurrentSheetJSON = () => {
  const sheet = getActiveSheet();
  if (!sheet) return;
  const [cols, rows] = [sheet.columns, sheet.data];
  const jsonArr = rows.map(r => Object.fromEntries(cols.map((c, i) => [c, r[i]])));
  const blob = new Blob([JSON.stringify(jsonArr, null, 2)], { type: 'application/json' });
  const fileName = `${(drawerLog?.title || 'kiemsoat')}_${yyyymm}_sheet${(activeTab ?? 0)+1}.json`.replace(/\s+/g,'_');
  downloadBlob(blob, fileName);
};

  const runLoop1 = async () => {
    for (let i = executingIndex; i < itemsRef.current.length; i++) {
      if (isStoppedRef.current) break;
      while (isPausedRef.current) await new Promise(r => setTimeout(r, 500));
      setExecutingIndex(i);
      const item = itemsRef.current[i];
      const rawSQL = replaceTokens(item.noi_dung, yyyymm);
      const key = `${item.kiemsoat_id}_${yyyymm}`;
      try {
        if (!item.DATASOURCE) throw new Error("Thiếu DATASOURCE");
        const payload = {
          Script: rawSQL,
          DATASOURCE: item.DATASOURCE,
          isOracle: item.isOracle || 0,
          isSendTelegram: item.isSendTelegram || 0,
          Title: item.tieu_de
        };
        controllerRef.current = new AbortController();
        const res = await axios.post('https://ttkd.vnptphuyen.vn:4488/api/DynamicQuery/run-advanced', payload, {
          signal: controllerRef.current.signal
        });

        const resultSheets = Array.isArray(res.data) ? res.data : [res.data];
        const formatted = resultSheets.map(sheet => ({ columns: sheet.columns, data: sheet.data }));
        const newLog = { status: 'success', sheets: formatted, rawSQL, timestamp: new Date().toISOString(), title: item.tieu_de };
        setLogs(prev => {
          const updated = { ...prev, [key]: newLog };
          localStorage.setItem('kiemsoat_logs', JSON.stringify(updated));
          return updated;
        });
      } catch (err) {
        if (!axios.isCancel(err)) {
          console.error(err);
        }
        setLogs(prev => {
          const updated = { ...prev, [key]: { status: 'error', error: err.message, rawSQL, title: item.tieu_de } };
          localStorage.setItem('kiemsoat_logs', JSON.stringify(updated));
          return updated;
        });
      }
    }
    setExecuting(false);
    setIsPaused(false);
    setIsStopped(false);
    setExecutingIndex(0);
  };

  const replaceTokens = (script, yyyymm) => {
    const year = yyyymm.slice(0, 4);
    const month = yyyymm.slice(4, 6);
    return script.replace(/%YYYYMM/g, yyyymm).replace(/%YYYY/g, year).replace(/%MM/g, month);
  };

 
 
  const getMonthString = (dateObj) => `${dateObj.getFullYear()}${(`0${dateObj.getMonth() + 1}`).slice(-2)}`;
  const yyyymm = getMonthString(month);

  const groupBy = (arr, key) => arr.reduce((acc, obj) => {
    acc[obj[key]] = acc[obj[key]] || [];
    acc[obj[key]].push(obj);
    return acc;
  }, {});
  //const grouped = groupBy(data, 'ten_nhom');

  const toggleSelect = (id) => setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const toggleDrawer = (key) => {
    const log = logs[key];
    if (!log) return;
      setDrawerLoading(true);
      setDrawerLog(log);
      setDrawerKey(key);
      setActiveTab(0);
      setDrawerOpen(true);

     // Giả lập delay ngắn để cảm nhận hiệu ứng load (hoặc để thực thi tính toán nếu cần)
    setTimeout(() => {
      const log = logs[key];
      if (!log) {
        setDrawerOpen(false);
        setDrawerLoading(false);
        return;
      }
      setDrawerLog(log);
      setDrawerLoading(false);
    }, 300); // delay nhẹ để hiệu ứng loading thể hiện
  };

 
  useEffect(() => {
    if (executing) runLoop();
  }, [executing]);

  const runLoop = async () => {
    for (let i = executingIndex; i < itemsRef.current.length; i++) {
      if (isStoppedRef.current) break;
      while (isPausedRef.current) await new Promise(r => setTimeout(r, 500));
      setExecutingIndex(i);
   
      const item = itemsRef.current[i];
      const rawSQL = replaceTokens(item.noi_dung, yyyymm);
      const key = `${item.kiemsoat_id}_${yyyymm}`;
      try {
        if (!item.DATASOURCE) throw new Error("Thiếu DATASOURCE");
        const payload = {
          Script: rawSQL,
          DATASOURCE: item.DATASOURCE,
          isOracle: item.isOracle || 0,
          isSendTelegram: item.isSendTelegram || 0,
          Title: item.tieu_de
        };
        controllerRef.current = new AbortController();
        const res = await axios.post('https://ttkd.vnptphuyen.vn:4488/api/DynamicQuery/run-advanced', payload, {
          signal: controllerRef.current.signal
        });

        const resultSheets = Array.isArray(res.data) ? res.data : [res.data];
        const formatted = resultSheets.map(sheet => ({ columns: sheet.columns, data: sheet.data }));
        const newLog = { status: 'success', sheets: formatted, rawSQL, timestamp: new Date().toISOString(), title: item.tieu_de };
        setLogs(prev => {
          const updated = { ...prev, [key]: newLog };
          localStorage.setItem('kiemsoat_logs', JSON.stringify(updated));
          return updated;
        });

        if (item.isSendTelegram) {
          const wb = XLSX.utils.book_new();
          formatted.forEach((sheet, index) => {
            const ws = XLSX.utils.aoa_to_sheet([sheet.columns, ...sheet.data]);
            XLSX.utils.book_append_sheet(wb, ws, `Sheet${index + 1}`);
          });
          const wbArrayBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
          const wbBlob = new Blob([wbArrayBuffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });
          const fileName = `${item.tieu_de.replace(/\s+/g, '_')}_${yyyymm}.xlsx`;
          await new Promise(r => setTimeout(r, 1000));
          await sendTelegramFile(wbBlob, fileName);
          await new Promise(r => setTimeout(r, 1000));
        }
      } catch (err) {
        if (!axios.isCancel(err)) {
          console.error(err);
        }
        setLogs(prev => {
          const updated = { ...prev, [key]: { status: 'error', error: err.message, rawSQL, title: item.tieu_de } };
          localStorage.setItem('kiemsoat_logs', JSON.stringify(updated));
          return updated;
        });
      }
    }
    setExecuting(false);
    setIsPaused(false);
    setIsStopped(false);
    setExecutingIndex(0);
  };

   

  const sendTelegramFile = async (fileBlob, fileName) => {
    const token = '1813501984:AAEn_X4AhHyieR9OV7TLVyVYFvSQSg7amxM';
    const chatId = '-1002012308745';
    const formData = new FormData();
    formData.append('chat_id', chatId);
    formData.append('document', fileBlob, fileName);
    await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
      method: 'POST',
      body: formData
    });
  };

  const total = selected.length;
  const percent = total > 0 ? Math.round((executingIndex / total) * 100) : 0;

  const exportToExcel = (item) => {
    const key = `${item.kiemsoat_id}_${yyyymm}`;
    const log = logs[key];
    if (!log || log.status !== 'success') return;
    const wb = XLSX.utils.book_new();
    log.sheets.forEach((sheet, index) => {
      const ws = XLSX.utils.aoa_to_sheet([sheet.columns, ...sheet.data]);
      XLSX.utils.book_append_sheet(wb, ws, `Sheet${index + 1}`);
    });
    XLSX.writeFile(wb, `${item.tieu_de.replace(/\s+/g, '_')}_${yyyymm}.xlsx`);
  };



// ─── Sheet đang mở ─────────────────────────────────────────────────────────────
//const getActiveSheet = () => {
//  if (!drawerLog || drawerLog.status !== 'success') return null;
//  if (activeTab == null || activeTab >= drawerLog.sheets.length) return null;
//  return drawerLog.sheets[activeTab]; // { columns, data }
//};

// ─── Tạo blob theo định dạng ───────────────────────────────────────────────────
const sheetToExcelBlob = (sheet) => {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([sheet.columns, ...sheet.data]);
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  const ab = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([ab], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
};

const sheetToCsvBlob = (sheet) => {
  const ws = XLSX.utils.aoa_to_sheet([sheet.columns, ...sheet.data]);
  const csv = XLSX.utils.sheet_to_csv(ws);
  return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
};

const sheetToJsonBlob = (sheet) => {
  const [cols, rows] = [sheet.columns, sheet.data];
  const jsonArr = rows.map(r => Object.fromEntries(cols.map((c, i) => [c, r[i]])));
  return new Blob([JSON.stringify(jsonArr, null, 2)], { type: 'application/json' });
};

// ─── Share blob qua Web Share API (Zalo/OTT sẽ hiện trong sheet chia sẻ) ───────
const shareBlob = async (blob, filename, text) => {
  try {
    const file = new File([blob], filename, { type: blob.type });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: filename, text });
    } else {
      // Fallback: tải file + báo thông tin
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename; a.click();
      URL.revokeObjectURL(url);
      alert('Thiết bị không hỗ trợ chia sẻ trực tiếp. File đã được tải xuống.');
    }
  } catch (e) {
    console.error(e);
    alert('Không thể chia sẻ file. Vui lòng thử lại.');
  }
};

// ─── Chia sẻ sheet hiện tại theo format ────────────────────────────────────────
const shareCurrentSheet = async (format = 'xlsx') => {
  const sheet = getActiveSheet();
  if (!sheet) return;
  const base = `${(drawerLog?.title || 'kiemsoat')}_${yyyymm}_sheet${(activeTab ?? 0)+1}`.replace(/\s+/g,'_');

  let blob, name;
  if (format === 'xlsx') { blob = sheetToExcelBlob(sheet); name = `${base}.xlsx`; }
  else if (format === 'csv') { blob = sheetToCsvBlob(sheet); name = `${base}.csv`; }
  else { blob = sheetToJsonBlob(sheet); name = `${base}.json`; }

  await shareBlob(blob, name, 'Chia sẻ dữ liệu kiểm soát');
};



  return (
    
    <Box  sx={{ background: '#f7f9fc', minHeight: '100vh', p: 1 , pb:8}}>
    <Box className="p-4 min-h-screen bg-gradient-to-br from-white to-blue-50">
    <Typography variant="h5" gutterBottom>📊 Danh sách kiểm soát</Typography>
    <Box className="flex flex-col sm:flex-row gap-3 mb-6">
      
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 220 }}>
      <FormControl fullWidth size="medium">
        <InputLabel>Nhóm</InputLabel>
        <Select
          value={groupFilter}
          label="Nhóm"
          onChange={e => setGroupFilter(e.target.value)}
          sx={{ minWidth: 220, height: 56 }}
        >
          <MenuItem value="">Tất cả nhóm</MenuItem>
          {allGroups.map(g => (
            <MenuItem key={g} value={g}>{g}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <FilterAltIcon color="primary" sx={{ fontSize: 28 }} />
   </Box>

<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 220 }}>
  <TextField
    fullWidth
    size="medium"
    variant="outlined"
    value={keyword}
    onChange={e => setKeyword(e.target.value)}
    placeholder="Tìm theo tiêu đề / SQL…"
    sx={{ minWidth: 220, height: 56 }}
  />
  <SearchIcon color="action" sx={{ fontSize: 28 }} />
</Box>

   <Grid container spacing={2} alignItems="center">
        <Grid item>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
         <Box sx={{ width: '100%' }}>
          <DatePicker
            views={['year', 'month']}
            label="Chọn tháng"
            value={month}
            onChange={setMonth}
            slotProps={{
              textField: {
                fullWidth: true, // ✅ quan trọng
                size: 'medium'
              }
            }}
          />
        </Box>
          </LocalizationProvider>
        </Grid>
        <Grid item>
          <Button variant="contained" color="primary" sx={{ height: 56,  width: '100%'  }} disabled={executing || selected.length === 0} onClick={runSelected}>
            ▶ Bắt đầu
          </Button>
        </Grid>
        <Grid item sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant={isPaused ? 'outlined' : 'contained'}
            color={isPaused ? 'success' : 'warning'}
            startIcon={isPaused ? '▶' : '⏸'}
            sx={{ height: 56, minWidth: 160 }}
            disabled={!executing}
            onClick={() => setIsPaused(p => !p)}
          >
            {isPaused ? 'Tiếp tục' : 'Tạm dừng'}
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon="⛔"
            sx={{ height: 56, minWidth: 160 }}
            disabled={!executing}
            onClick={() => {
              setIsStopped(true);
              controllerRef.current?.abort();
            }}
          >
            Dừng toàn bộ
          </Button>
        </Grid>
        {isPaused && (
          <Grid item xs={12}>
            <Typography color="warning.main" sx={{ mt: 1, fontStyle: 'italic' }}>
              ⏸ Đang tạm dừng, nhấn "Tiếp tục" để chạy tiếp...
            </Typography>
          </Grid>
        )}
        {executing && (
          <Grid item xs={12}>
            <LinearProgress variant="determinate" value={percent} />
          </Grid>
        )}
      </Grid>
</Box> 

   
    {/*spacing={2} sx={{ mt: 2 }}*/}
      <Grid container  spacing={2} sx={{ mt: 2 }}>
        {Object.entries(grouped).map(([group, items]) => (
          <Grid item xs={12} sx={{ px: 0 }}  key={group}>
            <Card 
            sx={{
          width: '100%',
          borderRadius: 2,
          boxShadow: 4,
          border: '1px solid #e5e7eb',
          // bỏ mọi margin ngang để thật sự full
          mx: 0
        }}
             className="rounded-xl shadow-lg transition-all duration-300 hover:shadow-2xl border border-gray-200 mb-3" >
              <CardHeader title={group} subheader={`${items.length} kiểm soát`} />
              <CardContent  sx={{ justifyContent: 'space-between' }}>
                <div className="">
                {items.map((item) => {
                  const key = `${item.kiemsoat_id}_${yyyymm}`;
                  const log = logs[key];
                  const isRunning = executing && selected.includes(item.kiemsoat_id) && executingIndex === selected.indexOf(item.kiemsoat_id);
                  return (
   <Box key={item.kiemsoat_id} display="flex" alignItems="center" mb={1} sx={{ width: '100%' }}>
                      <Checkbox checked={selected.includes(item.kiemsoat_id)} onChange={() => toggleSelect(item.kiemsoat_id)} />
                      <Typography variant="body2" flexGrow={1}>{item.tieu_de}</Typography>
                      {log?.status === 'success' && <Chip label="✅" color="success" size="small" onClick={() => toggleDrawer(key)} />}
                      {log?.status === 'error' && <Chip label="❌" color="error" size="small" onClick={() => toggleDrawer(key)} />}
                      {log?.status === 'success' && <Button size="small" onClick={() => exportToExcel(item)}>📥</Button>}
                      {isRunning && <Chip label="⏳ Đang chạy..." color="warning" size="small" />}
                    </Box>
                  );
                })}
                </div>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => items.forEach(i => !selected.includes(i.kiemsoat_id) && toggleSelect(i.kiemsoat_id))}>Chọn tất cả</Button>
               <Button size="small" color="error" onClick={() => items.forEach(i => selected.includes(i.kiemsoat_id) && toggleSelect(i.kiemsoat_id))}>Bỏ chọn tất cả</Button>

              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

     <Drawer
  anchor="right"
  open={drawerOpen}
  onClose={() => setDrawerOpen(false)}
  PaperProps={{
    sx: {
      width: { xs: '100vw', sm: 800 },      // full màn hình trên mobile
      maxWidth: '100vw'
    }
  }}
>
  <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <Typography variant="h6" fontSize={{ xs: 16, sm: 20 }}>
        Chi tiết kiểm soát
      </Typography>
      <IconButton onClick={() => setDrawerOpen(false)}><CloseIcon /></IconButton>
    </Box>

    {drawerLoading ? (
      <Box display="flex" justifyContent="center" alignItems="center" height={240}>
        <Typography>Đang tải dữ liệu...</Typography>
      </Box>
    ) : drawerLog && (
      <>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          allowScrollButtonsMobile
          sx={{ '& .MuiTab-root': { minHeight: 40 } }}
        >
          {drawerLog.status === 'success' && drawerLog.sheets.map((_, idx) => (
            <Tab key={idx} label={`Sheet ${idx + 1}`} />
          ))}
          {drawerLog.status === 'error' && <Tab label="Lý do lỗi" />}
          <Tab label="Câu lệnh SQL" />
        </Tabs>
       

        {drawerLog?.status === 'success' && drawerLog.sheets?.length > 0 && activeTab < drawerLog.sheets.length && (
  <Box sx={{
    mt: 1, mb: 1, display: 'flex', gap: 1, flexWrap: 'wrap',
    justifyContent: { xs: 'center', sm: 'flex-end' }
  }}>
    {/* Export */}
    <Button size="small" variant="outlined" onClick={exportCurrentSheetExcel}>⬇️ Excel</Button>
    <Button size="small" variant="outlined" onClick={exportCurrentSheetCSV}>  ⬇️ CSV</Button>
    <Button size="small" variant="outlined" onClick={exportCurrentSheetJSON}>⬇️ JSON</Button>

    {/* Share (Zalo/OTT) */}
    <Button size="small" variant="contained" color="primary" onClick={() => shareCurrentSheet('xlsx')}>
      🔗 Chia sẻ (Excel)
    </Button>
    <Button size="small" variant="contained" color="secondary" onClick={() => shareCurrentSheet('csv')}>
      🔗 Chia sẻ (CSV)
    </Button>
    <Button size="small" variant="contained" onClick={() => shareCurrentSheet('json')}>
      🔗 Chia sẻ (JSON)
    </Button>
  </Box>
)}


        <Box sx={{ mt: 1.5 }}>
          {/* Bảng dữ liệu: cuộn ngang + dính header + cỡ chữ nhỏ trên mobile */}
          {drawerLog.status === 'success' && drawerLog.sheets.map((sheet, idx) => (
            activeTab === idx && (
              <Box key={idx} sx={{
                overflowX: 'auto',
                maxHeight: { xs: 380, sm: 460 },
                border: '1px solid #e0e0e0',
                borderRadius: 1
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr>
                      {sheet.columns.map(col => (
                        <th key={col}
                            style={{
                              position: 'sticky', top: 0, zIndex: 1,
                              background: '#f7f7f7', borderBottom: '1px solid #ddd',
                              padding: '8px 6px', textAlign: 'left', whiteSpace: 'nowrap'
                            }}>
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sheet.data.map((row, i) => (
                      <tr key={i}
                          style={{ borderBottom: '1px solid #f0f0f0' }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fafafa'}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}>
                        {row.map((cell, j) => (
                          <td key={j} style={{ padding: '7px 6px', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                            {typeof cell === 'object' && cell !== null ? JSON.stringify(cell) : String(cell ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            )
          ))}

          {/* Tab lỗi */}
          {drawerLog.status === 'error' && activeTab === 0 && (
            <Typography color="error" sx={{ whiteSpace: 'pre-wrap' }}>{drawerLog.error}</Typography>
          )}

          {/* Tab SQL (cuộn ngang + copy nhanh) */}
          {(drawerLog.status === 'error' || activeTab === drawerLog.sheets?.length) && (
            <Box sx={{ mt: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                <Button size="small" onClick={() => navigator.clipboard.writeText(drawerLog.rawSQL)}>
                  📋 Copy SQL
                </Button>
              </Box>
              <pre style={{
                background: '#f5f5f7',
                padding: 10,
                borderRadius: 8,
                overflowX: 'auto',
                fontSize: 12
              }}>
                {drawerLog.rawSQL}
              </pre>
            </Box>
          )}
        </Box>
      </>
    )}
  </Box>
</Drawer>
</Box>
    </Box>
  );
}
