

// File: src/pages/PowerBIReport.jsx
import React, { useEffect, useState, useRef } from 'react';
import { PowerBIEmbed } from 'powerbi-client-react';
import { models } from 'powerbi-client';
import axios from 'axios';
import './powerbi.css';

import {
  BarChart,
  ChevronLeft,
  ChevronRight
} from '@mui/icons-material';

const PowerBIReport = ({ reportId, groupId }) => {
  const [reportConfig, setReportConfig] = useState(null);
  const [pages, setPages] = useState([]);
  const [activePage, setActivePage] = useState('');
  const [error, setError] = useState(null);
  const [isLoadingPages, setIsLoadingPages] = useState(true);
  const reportRef = useRef(null);
  const accessTokenRef = useRef('');
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  const fetchToken = async () => {
    const tokenResponse = await axios.get('https://ttkd.vnptphuyen.vn:4488/api/AzureAdToken/getToken');
    const accessToken = tokenResponse.data.accessToken;
    accessTokenRef.current = accessToken;
    return accessToken;
  };

  const generateEmbedToken = async (accessToken) => {
    const embedTokenResponse = await axios.post(
      `https://api.powerbi.com/v1.0/myorg/groups/${groupId}/reports/${reportId}/GenerateToken`,
      { accessLevel: 'View' },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return embedTokenResponse.data.token;
  };

  const refreshReportConfig = async () => {
    try {
      const accessToken = await fetchToken();
      const embedToken = await generateEmbedToken(accessToken);

      setReportConfig(prevConfig => ({
        ...prevConfig,
        accessToken: embedToken,
      }));

      return embedToken;
    } catch (error) {
      console.error('Error refreshing report config:', error);
      setError('Failed to refresh report. Please try again later.');
      throw error;
    }
  };

  useEffect(() => {
    const fetchReportDetails = async () => {
      try {
        const accessToken = await fetchToken();

        const embedUrlResponse = await axios.get(
          `https://api.powerbi.com/v1.0/myorg/groups/${groupId}/reports/${reportId}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          }
        );
        const embedUrl = embedUrlResponse.data.embedUrl;
        const embedToken = await generateEmbedToken(accessToken);

        setReportConfig({
          type: 'report',
          id: reportId,
          embedUrl: embedUrl,
          accessToken: embedToken,
          tokenType: models.TokenType.Embed,
          settings: {
            panes: {
              pageNavigation: {
                visible: false
              }
            },
            background: models.BackgroundType.Transparent,
          }
        });

        pollForPages();
      } catch (error) {
        console.error('Error fetching report details:', error);
        setError('Failed to load report. Please try again later.');
        setIsLoadingPages(false);
      }
    };

    fetchReportDetails();
  }, [reportId, groupId]);

  const pollForPages = async (attempts = 0) => {
    if (attempts > 10) {
      setIsLoadingPages(false);
      return;
    }

    try {
      const pagesResponse = await axios.get(
        `https://api.powerbi.com/v1.0/myorg/groups/${groupId}/reports/${reportId}/pages`,
        {
          headers: {
            'Authorization': `Bearer ${accessTokenRef.current}`
          }
        }
      );
      const fetchedPages = pagesResponse.data.value;

      if (fetchedPages && fetchedPages.length > 0) {
        setPages(fetchedPages);
        setActivePage(fetchedPages[0].name);
        setIsLoadingPages(false);
      } else {
        setTimeout(() => pollForPages(attempts + 1), 2000);
      }
    } catch (error) {
      console.error('Error fetching pages:', error);
      setTimeout(() => pollForPages(attempts + 1), 2000);
    }
  };

  const handleReportLoad = (report) => {
    reportRef.current = report;
  };

  const handlePageChange = async (pageName) => {
    try {
     // await refreshReportConfig();
      if (reportRef.current) {
        await reportRef.current.setPage(pageName);
        setActivePage(pageName);
      }
    } catch (error) {
      console.error('Error changing page:', error);
      setError('Failed to change page. Please try again.');
    }
  };

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  if (!reportConfig) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <div className={`transition-all duration-300 bg-white shadow-md h-full overflow-auto ${isSidebarVisible ? 'w-64' : 'w-12'} min-w-[3rem] max-w-[400px] relative`}>
        <button
          onClick={() => setIsSidebarVisible(!isSidebarVisible)}
          className="absolute -right-0 top-4 z-10 bg-blue-500 text-white p-1 rounded-full shadow-md hover:bg-blue-600 transition"
          title={isSidebarVisible ? 'Ẩn menu' : 'Hiện menu'}
        >
          {isSidebarVisible ? <ChevronLeft style={{ fontSize: 30 }} /> : <ChevronRight style={{ fontSize: 30 }} />}
        </button>

        <div className="p-4">
          {isSidebarVisible && (
            <>
              <h2 className="text-lg font-semibold mb-4 text-gray-700">Trang báo cáo</h2>
              {isLoadingPages ? (
                <p>Đang tải trang...</p>
              ) : pages.length === 0 ? (
                <p>Không có trang nào. Hãy thử tải lại.</p>
              ) : (
                pages.map((page) => (
                  <button
                    key={page.name}
                    onClick={() => handlePageChange(page.name)}
                    title={page.displayName}
                    className={`w-full text-left py-2 px-4 mb-2 rounded-lg flex items-center gap-2 transition-all duration-150 ease-in-out ${activePage === page.name ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 hover:bg-blue-100 text-gray-800'}`}
                  >
                    <BarChart style={{ fontSize: 16, color: '#' + Math.floor(Math.random()*16777215).toString(16) }} />
                    <span className="truncate">{page.displayName}</span>
                  </button>
                ))
              )}
            </>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col p-4 h-screen">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden h-full">
          <PowerBIEmbed
            embedConfig={reportConfig}
            eventHandlers={
              new Map([
                ['loaded', () => console.log('Report loaded event fired')],
                ['rendered', () => console.log('Report rendered event fired')],
                ['error', async (event) => {
                  console.error('Embedding error:', event.detail);
                  try {
                    await refreshReportConfig();
                    console.log('Token refreshed successfully');
                  } catch (refreshError) {
                    setError('Error embedding report. Please try again later.');
                  }
                }],
                ['pageChanged', (event) => {
                  if (event.detail.newPage) {
                    setActivePage(event.detail.newPage.name);
                  }
                }],
              ])
            }
            cssClassName="h-full w-full"
            getEmbeddedComponent={(embeddedReport) => {
              handleReportLoad(embeddedReport);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default PowerBIReport;


/*
  import React, { useEffect, useState, useRef } from 'react';
import { PowerBIEmbed }                       from 'powerbi-client-react';
import { models, Report, Page }               from 'powerbi-client';
import axios from 'axios';
import './powerbi.css'

//import { ChevronLeft, ChevronRight, FileBarChart } from 'lucide-react';
import {    CheckCircle as CheckCircleIcon,
  Warning     as WarningIcon,
  Error       as ErrorIcon,
  Info        as InfoIcon ,
  BarChart , ChevronLeft , ChevronRight
} from '@mui/icons-material';

interface PowerBIReportProps {
  reportId: string;
  groupId: string;
}

const PowerBIReport: React.FC<PowerBIReportProps> = ({ reportId, groupId }) => {
  const [reportConfig, setReportConfig] = useState<models.IReportEmbedConfiguration | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [activePage, setActivePage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoadingPages, setIsLoadingPages] = useState(true);
  const reportRef = useRef<Report | null>(null);
  const accessTokenRef = useRef<string>('');
  // ... existing state ...
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  const fetchToken = async () => {
    console.log('Fetching token...');
    const tokenResponse = await axios.get('http://online.vnptphuyen.vn:5000/getToken');
    const accessToken = tokenResponse.data.accessToken;
    accessTokenRef.current = accessToken;
    console.log('Token fetched successfully');
    return accessToken;
  };

  const generateEmbedToken = async (accessToken: string) => {
    console.log('Generating embed token...');
    const embedTokenResponse = await axios.post(
      `https://api.powerbi.com/v1.0/myorg/groups/${groupId}/reports/${reportId}/GenerateToken`,
      { accessLevel: 'View' },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    const embedToken = embedTokenResponse.data.token;
    console.log('Embed token generated successfully');
    return embedToken;
  };

  const refreshReportConfig = async () => {
    try {
      const accessToken = await fetchToken();
      const embedToken = await generateEmbedToken(accessToken);

      setReportConfig(prevConfig => ({
        ...prevConfig!,
        accessToken: embedToken,
      }));

      return embedToken;
    } catch (error) {
      console.error('Error refreshing report config:', error);
      setError('Failed to refresh report. Please try again later.');
      throw error;
    }
  };

  useEffect(() => {
    const fetchReportDetails = async () => {
      try {
        const accessToken = await fetchToken();

        console.log('Fetching embed URL...');
        const embedUrlResponse = await axios.get(
          `https://api.powerbi.com/v1.0/myorg/groups/${groupId}/reports/${reportId}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          }
        );
        const embedUrl = embedUrlResponse.data.embedUrl;
        console.log('Embed URL fetched successfully:', embedUrl);

        const embedToken = await generateEmbedToken(accessToken);

        setReportConfig({
          type: 'report',
          id: reportId,
          embedUrl: embedUrl,
          accessToken: embedToken,
          tokenType: models.TokenType.Embed,
          settings: {
            panes: {
              pageNavigation: {
                visible: false
              }
            },
            background: models.BackgroundType.Transparent,
          }
        });

        // Start polling for pages
        pollForPages();
      } catch (error) {
        console.error('Error fetching report details:', error);
        setError('Failed to load report. Please try again later.');
        setIsLoadingPages(false);
      }
    };

    fetchReportDetails();
  }, [reportId, groupId]);

  const pollForPages = async (attempts = 0) => {
    if (attempts > 10) {
      console.log('Max polling attempts reached. Stopping poll.');
      setIsLoadingPages(false);
      return;
    }

    try {
      console.log(`Polling for pages (attempt ${attempts + 1})...`);
      const pagesResponse = await axios.get(
        `https://api.powerbi.com/v1.0/myorg/groups/${groupId}/reports/${reportId}/pages`,
        {
          headers: {
            'Authorization': `Bearer ${accessTokenRef.current}`
          }
        }
      );
      const fetchedPages = pagesResponse.data.value;
      console.log('Pages fetched:', fetchedPages);

      if (fetchedPages && fetchedPages.length > 0) {
        setPages(fetchedPages);
        setActivePage(fetchedPages[0].name);
        setIsLoadingPages(false);
      } else {
        console.log('No pages found, retrying in 2 seconds...');
        setTimeout(() => pollForPages(attempts + 1), 2000);
      }
    } catch (error) {
      console.error('Error fetching pages:', error);
      setTimeout(() => pollForPages(attempts + 1), 2000);
    }
  };

  const handleReportLoad = (report: Report) => {
    console.log('Report loaded');
    reportRef.current = report;
  };

  const handlePageChange = async (pageName: string) => {
    console.log('Changing to page:', pageName);
    try {
      // Refresh the embed token before changing the page
      await refreshReportConfig();
      
      if (reportRef.current) {
        await reportRef.current.setPage(pageName);
        setActivePage(pageName);
      }
    } catch (error) {
      console.error('Error changing page:', error);
      setError('Failed to change page. Please try again.');
    }
  };

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  if (!reportConfig) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
 
return (
   
  <div className="flex h-screen bg-gray-100 ">
 
 
<div className={`transition-all duration-300 bg-white shadow-md h-full overflow-auto
${isSidebarVisible ? 'w-64' : 'w-12'} min-w-[3rem] max-w-[400px] relative`}>

 
<button
  onClick={() => setIsSidebarVisible(!isSidebarVisible)}
  className="absolute -right-0  top-4 z-10 bg-blue-500 text-white p-1 rounded-full shadow-md hover:bg-blue-600 transition"
  title={isSidebarVisible ? 'Ẩn menu' : 'Hiện menu'}
>
  {isSidebarVisible ? <ChevronLeft  style={{ fontSize: 30 }} /> : <ChevronRight style={{ fontSize: 30 }} />}
</button>

 
<div className="p-4">
  {isSidebarVisible && (
    <>
      <h2 className="text-lg font-semibold mb-4 text-gray-700">Trang báo cáo</h2>
      {isLoadingPages ? (
        <p>Đang tải trang...</p>
      ) : pages.length === 0 ? (
        <p>Không có trang nào. Hãy thử tải lại.</p>
      ) : (
        pages.map((page) => (
          <button
            key={page.name}
            onClick={() => handlePageChange(page.name)}
            title={page.displayName}
            className={`w-full text-left py-2 px-4 mb-2 rounded-lg flex items-center gap-2
              transition-all duration-150 ease-in-out
              ${activePage === page.name
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 hover:bg-blue-100 text-gray-800'}`}
          >
            <BarChart style={{ fontSize: 16, color: '#' + Math.floor(Math.random()*16777215).toString(16) }} />         
            <span className="truncate">{page.displayName}</span>

          </button>
        ))
      )}
    </>
  )}
</div>
</div>
  
    <div className="flex-1 flex flex-col p-4 h-screen">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden h-full">
        <PowerBIEmbed
          embedConfig={reportConfig}
          eventHandlers={
            new Map([
              ['loaded', () => console.log('Report loaded event fired')],
              ['rendered', () => console.log('Report rendered event fired')],
              ['error', async (event: any) => {
                console.error('Embedding error:', event.detail);
               
                try {
                  await refreshReportConfig();
                  console.log('Token refreshed successfully');
                } catch (refreshError) {
                  setError('Error embedding report. Please try again later.');
                }
              }],
              ['pageChanged', (event : any) => {
                console.log('Page changed event fired', event.detail);
                if (event.detail.newPage) {
                  setActivePage(event.detail.newPage.name);
                }
              }],
            ])
          }
          cssClassName="h-full w-full"
          getEmbeddedComponent={(embeddedReport) => {
            console.log('Embedded component received');
            handleReportLoad(embeddedReport as Report);
          }}
        />
      </div>
    </div>
  </div>
);
};

export default PowerBIReport;

*/