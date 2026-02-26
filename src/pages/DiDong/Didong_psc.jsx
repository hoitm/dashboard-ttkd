// File: Didong_psc.jsx
import React, { useState } from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import PhanTichDiDongPSCTheoTram_bts        from './PhanTichDiDongPSCTheoTram_bts';
import PhanTichDiDongPSCTheoTram_thang      from './PhanTichDiDongPSCTheoTram_thang';
import PhanTichDiDongPSCTheoTram            from './PhanTichDiDongPSCTheoTram';
import PhanTichDiDongPSCTheoTram_bts_new     from './PhanTichDiDongPSCTheoTram_bts_new';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`ghtt-tabpanel-${index}`}
      aria-labelledby={`ghtt-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

export default function Didong_psc() {
  const [value, setValue] = useState(0);
  const [triggerKeys, setTriggerKeys] = useState({});

  const handleChange = (event, newValue) => {
    setValue(newValue);
    setTriggerKeys((prev) => ({ ...prev, [newValue]: Date.now() }));
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          background: 'linear-gradient(to right,rgb(42, 63, 113), #1e3a8a)',
          boxShadow: '0 4px 8px rgba(247, 11, 11, 0.15)',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <Tabs
          value={value}
          onChange={handleChange}
          variant="scrollable"
          scrollButtons="auto"
          TabIndicatorProps={{ style: { backgroundColor: '#ffffff', height: 3 } }}
          sx={{
            '& .MuiTab-root': {
              color: 'rgba(255,255,255,0.75)',
              fontWeight: 400,
              fontSize: '1rem',
              px: 2.5,
              py: 1.5,
              borderRadius: '10px 10px 0 0',
              mx: 1,
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: '#fff',
              },
              '&.Mui-selected': {
                color: '#ffffff',
                background: 'linear-gradient(to top, #2563eb, #3b82f6)',
              },
            },
            '& .MuiTabs-scrollButtons': {
              color: '#fff',
            },
          }}
        >
         
           <Tab icon={<span>📊</span>} label="Theo ngày" />
           <Tab icon={<span>📅</span>} label="Theo tháng" />
           <Tab icon={<span>📡</span>} label="Theo BTS ngày" />
           <Tab icon={<span>🛰️</span>} label="Chi tiết BTS ngày" />
          
        </Tabs>
      </Box>

      
      <TabPanel value={value} index={0}>
        <PhanTichDiDongPSCTheoTram key={triggerKeys[0]} />
      </TabPanel>
      <TabPanel value={value} index={1}> 
        <PhanTichDiDongPSCTheoTram_thang key={triggerKeys[1]} />
      </TabPanel>
     <TabPanel value={value} index={2}>
        <PhanTichDiDongPSCTheoTram_bts_new key={triggerKeys[2]} />
      </TabPanel> 
       <TabPanel value={value} index={3}>
        <PhanTichDiDongPSCTheoTram_bts key={triggerKeys[3]} />
      </TabPanel> 
      
    </Box>
  );
}