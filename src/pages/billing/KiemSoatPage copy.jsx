// 🎨 Giao diện mới với Card Grid + Drawer chi tiết + Tiến trình thực thi + hiển thị tiến trình từng kiểm soát
import React, { useEffect, useState,useRef } from 'react';
import axios from 'axios';
import {
  Typography, Button, Grid, CircularProgress, Checkbox,
  Chip, Tabs, Tab, Box, Drawer, IconButton, Card, CardContent, CardActions, CardHeader, LinearProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import CloseIcon from '@mui/icons-material/Close';
import * as XLSX from 'xlsx';

export default function KiemSoatPage() {
  const [data, setData] = useState([]);
  const [selected, setSelected] = useState([]);
  const [executing, setExecuting] = useState(false);
  const [executingIndex, setExecutingIndex] = useState(-1);
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
const controllerRef = useRef(null); // AbortController


  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      setErrorMsg(null);
      try {
        const res = await axios.post('https://localhost:7299/api/DynamicQuery/execute', {
          databaseType: 'sql',
          functionName: `SELECT ks.*, nh.ten_nhom FROM bsc_pyn.dbo.CRM_KIEMSOAT ks JOIN bsc_pyn.dbo.CRM_NHOMKS nh ON ks.nhomks_id = nh.nhomks_id WHERE ks.hieu_luc = 1 ORDER BY nh.stt, ks.stt`,
          parameters: {},
          isRawSql: true
        }, { headers: { 'Content-Type': 'application/json' } });
        setData(res.data);
      } catch (err) {
        setErrorMsg('Không thể tải dữ liệu.');
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const getMonthString = (dateObj) => `${dateObj.getFullYear()}${(`0${dateObj.getMonth() + 1}`).slice(-2)}`;
  const yyyymm = getMonthString(month);

  const groupBy = (arr, key) => arr.reduce((acc, obj) => {
    acc[obj[key]] = acc[obj[key]] || [];
    acc[obj[key]].push(obj);
    return acc;
  }, {});

  const grouped = groupBy(data, 'ten_nhom');
  const toggleSelect = (id) => setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const toggleDrawer = (key) => {
    const log = logs[key];
    if (!log) return;
    setDrawerLog(log);
    setDrawerKey(key);
    setActiveTab(0);
    setDrawerOpen(true);
  };

  const runSelected = async () => {
    const items = data.filter(d => selected.includes(d.kiemsoat_id));
    setExecuting(true);
    setExecutingIndex(0);
    for (let index = executingIndex; index < items.length; index++) {

    //for (let index = 0; index < items.length; index++) {
       if (isStopped) break;
          while (isPaused) await new Promise(res => setTimeout(res, 500));

      setExecutingIndex(index);
      const item = items[index];
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

        const res = await axios.post('https://localhost:7299/api/DynamicQuery/run-advanced', payload, {
          signal: controllerRef.current.signal
        });
        //const res = await axios.post('https://localhost:7299/api/DynamicQuery/run-advanced', payload);
        const resultSheets = Array.isArray(res.data) ? res.data : [res.data];
        const formatted = resultSheets.map(sheet => ({ columns: sheet.columns, data: sheet.data }));
        const newLog = { status: 'success', sheets: formatted, rawSQL, timestamp: new Date().toISOString(), title: item.tieu_de };
        setLogs(prev => {
          const updated = { ...prev, [key]: newLog };
          localStorage.setItem('kiemsoat_logs', JSON.stringify(updated));
          return updated;
        });
          ///////
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
              const fileName = `${item.tieu_de.replace(/\\s+/g, '_')}_${yyyymm}.xlsx`;
              await sendTelegramFile(wbBlob, fileName);

        }

      } catch (err) {

         if (axios.isCancel(err) || err.name === 'CanceledError') {
            console.warn("⛔ Yêu cầu đã bị huỷ bởi người dùng.");
          } else {
            console.error("Lỗi khác:", err);
          }
        setLogs(prev => {
          const updated = { ...prev, [key]: { status: 'error', error: err.message, rawSQL, title: item.tieu_de } };
          localStorage.setItem('kiemsoat_logs', JSON.stringify(updated));
          return updated;
        });
      }
    }

    //setExecuting(false);
    //setExecutingIndex(-1);
    setExecuting(false);
    setExecutingIndex(-1);
    setIsPaused(false);
    setIsStopped(false);
  };

  const replaceTokens = (script, yyyymm) => {
    const year = yyyymm.slice(0, 4);
    const month = yyyymm.slice(4, 6);
    const d = new Date(`${year}-${month}-01`);
    const prev = new Date(d); prev.setMonth(d.getMonth() - 1);
    const next = new Date(d); next.setMonth(d.getMonth() + 1);
    const fmt = (dt, f) => f.replace('YYYY', dt.getFullYear()).replace('MM', (`0${dt.getMonth() + 1}`).slice(-2));
    return script.replace(/%YYYYMM/g, yyyymm).replace(/%-YYYYMM/g, fmt(prev, 'YYYYMM')).replace(/%\+YYYYMM/g, fmt(next, 'YYYYMM'))
      .replace(/%MMYYYY/g, `${month}${year}`).replace(/%-MMYYYY/g, fmt(prev, 'MMYYYY')).replace(/%\+MMYYYY/g, fmt(next, 'MMYYYY'))
      .replace(/%YYYY/g, year).replace(/%-YYYY/g, prev.getFullYear()).replace(/%\+YYYY/g, next.getFullYear())
      .replace(/%MM/g, month).replace(/%-MM/g, (`0${prev.getMonth() + 1}`).slice(-2)).replace(/%\+MM/g, (`0${next.getMonth() + 1}`).slice(-2))
      .replace(/%MM\/YYYY/g, `${month}/${year}`).replace(/%-MM\/YYYY/g, fmt(prev, 'MM/YYYY')).replace(/%\+MM\/YYYY/g, fmt(next, 'MM/YYYY'))
      .replace(/%YYYY\/MM/g, `${year}/${month}`).replace(/%-YYYY\/MM/g, fmt(prev, 'YYYY/MM')).replace(/%\+YYYY\/MM/g, fmt(next, 'YYYY/MM'));
  };

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

  return (
    <div style={{ padding: 24 }}>
      <Typography variant="h5" gutterBottom>📊 Danh sách kiểm soát</Typography>
      <Grid container spacing={2} alignItems="center">
        <Grid item>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker views={['year', 'month']} label="Chọn tháng" value={month} onChange={setMonth} />
          </LocalizationProvider>
        </Grid>
        <Grid item>
          <Button variant="contained"  sx={{ height: '56px' }} 
           startIcon="▶"
          disabled={executing || selected.length === 0} onClick={runSelected}>
            {executing ? `Đang chạy (${percent}%)...` : 'Chạy các kiểm soát đã chọn'}
          </Button>
        
        </Grid>

        {executing && (
          <Grid item xs={12} sx={{ mt: 1 }}>
            <LinearProgress variant="determinate" value={percent} />
          </Grid>
        )}

     <Grid item sx={{ display: 'flex', gap: 2 }}>
  <Button
    variant={isPaused ? 'outlined' : 'contained'}
    color={isPaused ? 'success' : 'warning'}
    startIcon={isPaused ? '▶' : '⏸'}
    sx={{ height: 56, minWidth: 160, fontWeight: 'bold' }}
    onClick={() => setIsPaused(p => !p)}
  >
    {isPaused ? 'Tiếp tục' : 'Tạm dừng'}
  </Button>

  <Button
    variant="contained"
    color="error"
    startIcon="⛔"
    sx={{ height: 56, minWidth: 160, fontWeight: 'bold' }}
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

      </Grid>

      {loadingData && <Typography color="textSecondary">🔄 Đang tải dữ liệu...</Typography>}
      {errorMsg && <Typography color="error">⚠️ {errorMsg}</Typography>}

      <Grid container spacing={2} sx={{ mt: 2 }}>
        {Object.entries(grouped).map(([group, items]) => (
          <Grid item xs={12} md={6} lg={4} key={group}>
            <Card>
              <CardHeader title={group} subheader={`${items.length} kiểm soát`} />
              <CardContent>
                {items.map((item, index) => {
                  const key = `${item.kiemsoat_id}_${yyyymm}`;
                  const log = logs[key];
                  const isRunning = executing && selected.includes(item.kiemsoat_id) && executingIndex === selected.indexOf(item.kiemsoat_id);
                  return (
                    <Box key={item.kiemsoat_id} display="flex" alignItems="center" mb={1}>
                      <Checkbox checked={selected.includes(item.kiemsoat_id)} onChange={() => toggleSelect(item.kiemsoat_id)} />
                      <Typography variant="body2" flexGrow={1}>{item.tieu_de}</Typography>
                      {log?.status === 'success' && <Chip label="✅" color="success" size="small" onClick={() => toggleDrawer(key)} />}
                      {log?.status === 'error' && <Chip label="❌" color="error" size="small" onClick={() => toggleDrawer(key)} />}
                      {log?.status === 'success' && <Button size="small" onClick={() => exportToExcel(item)}>📥</Button>}
                      {isRunning && <Chip label="⏳ Đang chạy..." color="warning" size="small" />}
                    </Box>
                  );
                })}
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => items.forEach(i => !selected.includes(i.kiemsoat_id) && toggleSelect(i.kiemsoat_id))}>Chọn tất cả</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 800, p: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Chi tiết kiểm soát</Typography>
            <IconButton onClick={() => setDrawerOpen(false)}><CloseIcon /></IconButton>
          </Box>
          {drawerLog && (
            <>
              <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
                {drawerLog.status === 'success' && drawerLog.sheets.map((_, idx) => <Tab key={idx} label={`Sheet ${idx + 1}`} />)}
                {drawerLog.status === 'error' && <Tab label="Lý do lỗi" />}
                <Tab label="Câu lệnh SQL" />
              </Tabs>
              <Box sx={{ mt: 2 }}>
                {drawerLog.status === 'success' && drawerLog.sheets.map((sheet, idx) => activeTab === idx && (
                  <Box key={idx} sx={{ overflow: 'auto', maxHeight: 400 }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    border: '1px solid #ccc'
                  }}>
                    <thead>
                      <tr>
                        {sheet.columns.map(col => (
                          <th key={col} style={{
                            border: '1px solid #ccc',
                            padding: 8,
                            backgroundColor: '#f0f0f0',
                            position: 'sticky',
                            top: 0
                          }}>{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sheet.data.map((row, i) => (
                        <tr key={i} style={{ cursor: 'pointer' }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}>
                          {row.map((cell, j) => (
                            <td key={j} style={{ border: '1px solid #ccc', padding: 6 }}>
                              {typeof cell === 'object' && cell !== null ? JSON.stringify(cell) : cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  </Box>
                ))}
                {drawerLog.status === 'error' && activeTab === 0 && <Typography color="error">{drawerLog.error}</Typography>}
                {((drawerLog.status === 'error' && activeTab === 1) || (drawerLog.status === 'success' && activeTab === drawerLog.sheets.length)) && (
                  <pre style={{ background: '#f5f5f5', padding: 10 }}>{drawerLog.rawSQL}</pre>
                )}
              </Box>
            </>
          )}
        </Box>
      </Drawer>
    </div>
  );
}