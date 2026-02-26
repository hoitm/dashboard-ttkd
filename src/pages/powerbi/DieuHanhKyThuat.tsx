import React from 'react';
import PowerBIReport from './PowerBNew_kt.jsx';
 
function DieuHanhKyThuat() {
    const reportId = 'fff24f7e-3bb6-40b1-84dd-df8d43a00123';
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

export default DieuHanhKyThuat;
/*
    <div className="App">
        <PowerBIReport reportId={reportId} groupId={groupId} />
      </div>
*/