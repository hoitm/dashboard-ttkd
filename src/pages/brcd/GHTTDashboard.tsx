import React, { useEffect, useState } from "react";
import { getData } from "../brcd/api";
import Filters from "../brcd/Filters";
import CustomTable from "../brcd/CustomTable";
import TTVTCharts from "../brcd/TTVTCharts";
import StaffCharts from "../brcd/StaffCharts";
import { exportToExcel } from "../brcd/exportExcel";
import { exportChartAsImage } from "../brcd/exportChart";

const GHTTDashboard = () => {
  const [data, setData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [selectedTTVT, setSelectedTTVT] = useState<string>("");
  const [selectedStaff, setSelectedStaff] = useState<string>("");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});

  useEffect(() => {
    async function fetchData() {
      const apiData = await getData();
      console.log("apiData", apiData);
      setData(apiData);
      setFilteredData(apiData);
    }
    fetchData();
  }, []);

  const handleFilter = (filters: { from?: Date; to?: Date; ttvt?: string; staff?: string }) => {
    let result = [...data];
    if (filters.from && filters.to) {
      result = result.filter((item) => {
        const ngayGiao = new Date(item.NGAYGIAO);
        return ngayGiao >= filters.from && ngayGiao <= filters.to;
      });
    }
    if (filters.ttvt) {
      result = result.filter((item) => item.TTVT_65_1 === filters.ttvt);
      setSelectedTTVT(filters.ttvt);
    }
    if (filters.staff) {
      result = result.filter((item) => item.TEN_NV_NHANPHIEU === filters.staff);
      setSelectedStaff(filters.staff);
    }
    setFilteredData(result);
  };

  return (
    <div className="App min-h-screen flex flex-col"> {/* Ensure the App div takes full height */}
      <div className="flex-1"> {/* Allow this div to grow and take available space */}
      <Filters data={data} onFilter={handleFilter} />
      <div className="flex gap-4">
        <button onClick={() => exportToExcel(filteredData, "ThongKeGHTT")} className="bg-blue-500 text-white p-2 rounded-lg">
          Export Excel
        </button>
        <button onClick={() => exportChartAsImage('chart-container', 'ChartGHTT')} className="bg-green-500 text-white p-2 rounded-lg">
          Export Chart
        </button>
      </div>

      <div id="chart-container" className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TTVTCharts data={filteredData} />
        <StaffCharts data={filteredData} selectedTTVT={selectedTTVT} />
      </div>

      <CustomTable data={filteredData} />
    </div> </div>
  );
};

export default GHTTDashboard;
