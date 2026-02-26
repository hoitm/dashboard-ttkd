import React, { useEffect, useState, useRef } from 'react';
import { PowerBIEmbed } from 'powerbi-client-react';
import { models } from 'powerbi-client';
import axios from 'axios';
import './powerbiNew.css';

import { BarChart, Menu } from '@mui/icons-material';

const PowerBIReport = ({ groupId }) => {
  const [reportConfig, setReportConfig] = useState(null);
  const [reportId, setReportId] = useState(null);
  const [pages, setPages] = useState([]);
  const [activePage, setActivePage] = useState('');
  const [error, setError] = useState(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isFABVisible, setIsFABVisible] = useState(window.innerWidth < 768);
  const reportRef = useRef(null);
  const accessTokenRef = useRef('');

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsFABVisible(mobile);
      setIsSidebarVisible(!mobile);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const selectedReportId = isMobile
      ? 'fff24f7e-3bb6-40b1-84dd-df8d43a00123'
      : 'fff24f7e-3bb6-40b1-84dd-df8d43a00123';
      //// new e1b7b8bb-0493-4883-a803-fa2ae260591d
    setReportId(selectedReportId);
  }, [isMobile]);

  useEffect(() => {
    if (!reportId) return;
    const fetchReportDetails = async () => {
      try {
        const tokenResponse = await axios.get('https://ttkd.vnptphuyen.vn:4488/api/AzureAdToken/getToken');
        const accessToken = tokenResponse.data.accessToken;
        accessTokenRef.current = accessToken;

        const embedUrlResponse = await axios.get(
          `https://api.powerbi.com/v1.0/myorg/groups/${groupId}/reports/${reportId}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        const embedTokenResponse = await axios.post(
          `https://api.powerbi.com/v1.0/myorg/groups/${groupId}/reports/${reportId}/GenerateToken`,
          { accessLevel: 'View' },
          { headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' } }
        );

        const isMobileReport = reportId === 'fff24f7e-3bb6-40b1-84dd-df8d43a00123';

        setReportConfig({
          type: 'report',
          id: reportId,
          embedUrl: embedUrlResponse.data.embedUrl,
          accessToken: embedTokenResponse.data.token,
          tokenType: models.TokenType.Embed,
          settings: {
            panes: { pageNavigation: { visible: false } },
            background: models.BackgroundType.Transparent,
            layoutType: isMobileReport ? models.LayoutType.MobilePortrait : models.LayoutType.Custom,
          },
        });

        pollForPages(accessToken);
      } catch (err) {
        console.error(err);
        setError('Failed to load report.');
      }
    };
    fetchReportDetails();
  }, [reportId, groupId]);

  const pollForPages = async (accessToken, attempts = 0) => {
    if (attempts > 10) return;
    try {
      const res = await axios.get(
        `https://api.powerbi.com/v1.0/myorg/groups/${groupId}/reports/${reportId}/pages`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const fetchedPages = res.data.value;
      if (fetchedPages?.length) {
        setPages(fetchedPages);
        setActivePage(fetchedPages[0].name);
      } else {
        setTimeout(() => pollForPages(accessToken, attempts + 1), 2000);
      }
    } catch (err) {
      setTimeout(() => pollForPages(accessToken, attempts + 1), 2000);
    }
  };

  const handlePageChange = async (pageName) => {
    try {
      if (reportRef.current) {
        await reportRef.current.setPage(pageName);
        setActivePage(pageName);
        if (isMobile) {
          setIsSidebarVisible(false);
          setIsFABVisible(true);
        }
      }
    } catch (err) {
      setError('Không thể chuyển trang.');
    }
  };

  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (!reportConfig || !reportId) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const isMobileReport = reportId === 'fff24f7e-3bb6-40b1-84dd-df8d43a00123';

  return (
    <div className="flex h-screen bg-gray-100">
      {isSidebarVisible && (
     
        <div className="transition-all duration-300 bg-white shadow-md h-full overflow-auto w-64 max-w-[400px] relative z-50">
          <div className="p-0">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">Trang báo cáo</h2>
            {pages.length === 0 ? (
              <p>Không có trang nào. Hãy thử tải lại.</p>
            ) : (
              pages.map(p => (
                <button
                  key={p.name}
                  onClick={() => handlePageChange(p.name)}
                  className={`w-full text-left py-2 px-4 mb-2 rounded-lg flex items-center gap-2 ${activePage === p.name ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-blue-100 text-gray-800'}`}>
                  <BarChart style={{ fontSize: 16 }} />
                  <span className="truncate">{p.displayName}</span>
                </button>
              ))
            )}
          </div>
        </div>
        
      )}

      {isFABVisible && (
        <button
          onClick={() => {
            setIsSidebarVisible(true);
            setIsFABVisible(false);
          }}
          className="fixed z-40 bottom-16 left-6 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all">
          <Menu style={{ fontSize: 28 }} />
        </button>
      )}

      <div className="flex-1 flex flex-col p-4 h-[calc(100vh-2rem)] max-h-screen overflow-hidden">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden h-full">
          <PowerBIEmbed
            embedConfig={reportConfig}
            cssClassName="h-full w-full"
            eventHandlers={new Map([
              ['loaded', () => console.log('✅ Report loaded')],
              ['error', async (event) => {
                console.error('PowerBI Error:', event.detail);
                try {
                  const tokenRes = await axios.get('https://ttkd.vnptphuyen.vn:4488/api/AzureAdToken/getToken');
                  const token = await axios.post(
                    `https://api.powerbi.com/v1.0/myorg/groups/${groupId}/reports/${reportId}/GenerateToken`,
                    { accessLevel: 'View' },
                    { headers: { Authorization: `Bearer ${tokenRes.data.accessToken}` } }
                  );
                  setReportConfig(prev => ({ ...prev, accessToken: token.data.token }));
                } catch (e) {
                  setError('Không thể làm mới token PowerBI.');
                }
              }],
              ['pageChanged', (event) => {
                if (event.detail?.newPage) setActivePage(event.detail.newPage.name);
              }]
            ])}
            getEmbeddedComponent={(report) => { reportRef.current = report; }}
          />
        </div>
      </div>
    </div>
  );
};

export default PowerBIReport;
