import React from 'react';
//import PowerBIReport from './PowerB.jsx';
import PowerBIReport from './PowerBNew.jsx';
 
function DieuHanhKinhDoanh() {
    //832e4653-ea41-4eb0-967c-e87539de2c7f

    //    '832e4653-ea41-4eb0-967c-e87539de2c7f';    ==>nêu là desktop 
    // 'b8e41ae1-e64c-4089-9272-9ef9755a68f8'; => mobie 
    const reportId = 'b8e41ae1-e64c-4089-9272-9ef9755a68f8';
    const groupId  = 'b096a1f4-d90c-4e49-a362-9dff36f31d26';
    //fff24f7e-3bb6-40b1-84dd-df8d43a00123
    return (
      <div className="p-4 pb-28 App min-h-screen flex flex-col"> {/* Ensure the App div takes full height */}
      <div className="flex-1"> {/* Allow this div to grow and take available space */}
        <PowerBIReport   groupId={groupId} />
      </div>
    </div>
    
    );
}

export default DieuHanhKinhDoanh;
/*
    <div className="App">
        <PowerBIReport reportId={reportId} groupId={groupId} />
      </div>
*/