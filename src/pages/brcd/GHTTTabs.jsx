import React, { useState } from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import GHTTTableFull from './GHTTTable';
import GHTTTableNew from './GHTTTableNew';

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
      {value === index && (
        <Box>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function GHTTTabs() {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box 
        sx={{ 
          borderBottom: 1, 
          borderColor: 'divider',
          background: 'linear-gradient(to right, #1e40af, #3b82f6)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <Tabs 
          value={value} 
          onChange={handleChange} 
          aria-label="GHTT tables tabs"
          variant="fullWidth"
          TabIndicatorProps={{
            style: {
              backgroundColor: '#ffffff',
              height: 3,
              borderRadius: '3px',
              boxShadow: '0 0 8px rgba(255, 255, 255, 0.5)'
            }
          }}
          sx={{
            '& .MuiTab-root': {
              color: 'rgba(255, 255, 255, 0.7)',
              fontWeight: 600,
              fontSize: '1rem',
              textTransform: 'none',
              minHeight: '56px',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                color: '#ffffff',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
              '&.Mui-selected': {
                color: '#ffffff',
                fontWeight: 700,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: '3px',
                backgroundColor: '#ffffff',
                transition: 'width 0.3s ease',
                borderRadius: '3px',
              },
              '&.Mui-selected::after': {
                width: '100%',
              }
            },
            '& .MuiTabs-indicator': {
              display: 'none',
            },
          }}
        >
          <Tab 
            label={
              <div className="flex items-center gap-2">
                <span className="text-lg">📊</span>
                <span>Báo Cáo Gia Hạn Thu Tiền 1</span>
              </div>
            } 
          />
          <Tab 
            label={
              <div className="flex items-center gap-2 ">
                <span className="text-lg">📈</span>
                <span>Báo Cáo Gia Hạn Thu Tiền 2</span>
              </div>
            }
          />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <GHTTTableFull />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <GHTTTableNew />
      </TabPanel>
    </Box>
  );
} 