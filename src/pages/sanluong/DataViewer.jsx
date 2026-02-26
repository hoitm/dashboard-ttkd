import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Tabs, Tab, Button, TextField, Card, CardContent, Container, Grid, Typography, Box, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';

const views = [
  { key: 'table', label: 'Bảng' },
  { key: 'cards', label: 'Thẻ' },
  { key: 'compact', label: 'Tối giản' },
];

export default function DataViewer() {
  const [data, setData] = useState([]);
  const [view, setView] = useState('table');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [groupBy, setGroupBy] = useState('');
  const pageSize = 5;

  const fetchData = async () => {
    try {
      const res = await axios.post('https://ttkd.vnptphuyen.vn:4488/api/DynamicQuery/execute', {
        databaseType: 'sql',
        functionName: `SELECT dv.TEN_DV, a.MA_TB, ma_tt, tt.TEN_TT ,a.TEN_TB  FROM css.V_DB_THUEBAO a  JOIN css.V_DB_THANHTOAN  tt ON a.THANHTOAN_ID = tt.THANHTOAN_ID JOIN ADMIN.V_DONVI dv ON tt.DONVI_ID = dv.DONVI_ID WHERE a.LOAITB_ID = @loaitb_id     AND  a.NGAY_SD >= TRY_CONVERT(DATE, @tu_ngay, 103) AND  a.NGAY_SD <= TRY_CONVERT(DATE, @den_ngay, 103)`,
        parameters: {
          loaitb_id: 58,
          tu_ngay: '01/04/2025',
          den_ngay: '20/04/2025'
        },
        isRawSql: true
      });
      setData(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = data.filter(row =>
    Object.values(row).some(val => val?.toString().toLowerCase().includes(search.toLowerCase()))
  );

  const groupKeys = Object.keys(data[0] || {});

  const groupedData = groupBy
    ? filteredData.reduce((acc, item) => {
        const key = item[groupBy] || 'Không xác định';
        acc[key] = acc[key] || [];
        acc[key].push(item);
        return acc;
      }, {})
    : { Tất_cả: filteredData };

  const renderTable = (rows) => (
    <Box sx={{ overflowX: 'auto', boxShadow: 3, borderRadius: 2, backgroundColor: 'white', mb: 2 }}>
      <table className="min-w-full text-sm">
        <thead style={{ background: '#f0f4fa' }}>
          <tr>
            {Object.keys(data[0] || {}).map((key) => (
              <th key={key} style={{ textAlign: 'left', padding: 8, whiteSpace: 'nowrap' }}>{key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? 'white' : '#f9f9f9' }}>
              {Object.values(row).map((val, i) => (
                <td key={i} style={{ padding: 8, whiteSpace: 'nowrap' }}>{val}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  );

  const renderCards = (rows) => (
    <Grid container spacing={2}>
      {rows.map((item, idx) => (
        <Grid item xs={12} sm={6} key={idx}>
          <Card sx={{ boxShadow: 4, borderRadius: 3, backgroundColor: '#fefefe' }}>
            <CardContent>
              {Object.entries(item).map(([key, val]) => (
                <Typography key={key} variant="body2" sx={{ mb: 1 }}><strong>{key}:</strong> {val}</Typography>
              ))}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderCompact = (rows) => (
    <Box>
      {rows.map((item, idx) => (
        <Typography key={idx} variant="body2" sx={{ py: 1, px: 2, borderBottom: '1px solid #ddd', boxShadow: 1 }}>
          {Object.values(item).join(' | ')}
        </Typography>
      ))}
    </Box>
  );

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Tabs
        value={view}
        onChange={(e, newValue) => setView(newValue)}
        variant="fullWidth"
        textColor="primary"
        indicatorColor="primary"
        sx={{ mb: 2, boxShadow: 1, borderRadius: 2, backgroundColor: '#f7f9fc' }}
      >
        {views.map((v) => (
          <Tab key={v.key} label={v.label} value={v.key} />
        ))}
      </Tabs>

      <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Grid item xs={6}>
          <TextField
            fullWidth
            placeholder="Tìm kiếm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
          />
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth size="small">
            <InputLabel>Nhóm theo</InputLabel>
            <Select value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
              <MenuItem value="">Không nhóm</MenuItem>
              {groupKeys.map((key, idx) => (
                <MenuItem key={idx} value={key}>{key}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {Object.entries(groupedData).map(([group, rows], idx) => (
        <Box key={idx} sx={{ mb: 4 }}>
          {groupBy && <Typography variant="h6" sx={{ mb: 2 }}>{group}</Typography>}
          {view === 'table' && renderTable(rows)}
          {view === 'cards' && renderCards(rows)}
          {view === 'compact' && renderCompact(rows)}
        </Box>
      ))}
    </Container>
  );
}
