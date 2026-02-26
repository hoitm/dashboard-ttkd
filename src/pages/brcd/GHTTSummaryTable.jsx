import React, { useEffect, useState } from "react";
import { getData } from "../brcd/api";

const GHTTSummaryTable = () => {
  const [summaryRows, setSummaryRows] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (tu_ngay, den_ngay) => {
    try {
      const result = await getData(tu_ngay, den_ngay);
      processSummary(result);
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  const processSummary = (data) => {
    if (!data || data.length === 0) {
      setSummaryRows([]);
      return;
    }

    const grouped = {};

    data.forEach(item => {
      const unit = item.TTVT_65_1 || "Không xác định";

      if (!grouped[unit]) {
        grouped[unit] = {
          totalPhieu: 0,
          fiber: 0,
          mytv: 0,
          mesh: 0,
          chuyenTS: 0,
          giaHan: 0,
          ngungHuy: 0,
          chuaThucHien: 0,
        };
      }

      grouped[unit].totalPhieu += 1;
      if (item.LOAIHINH_TB === "Fiber") grouped[unit].fiber += 1;
      if (item.LOAIHINH_TB === "MyTV") grouped[unit].mytv += 1;
      if (item.LOAIHINH_TB === "Mesh") grouped[unit].mesh += 1;

      if (item.TRANGTHAIPHIEU_38 === "Chuyển trả sau") grouped[unit].chuyenTS += 1;
      if (item.TRANGTHAIPHIEU_38 === "Gia hạn") grouped[unit].giaHan += 1;
      if (item.TRANGTHAIPHIEU_38 === "Ngưng") grouped[unit].ngungHuy += 1;

      if (item.TON_39 && item.TON_39 !== "{}") grouped[unit].chuaThucHien += 1;
    });

    const rows = Object.keys(grouped).map(unit => {
      const g = grouped[unit];
      return {
        unit,
        ...g,
        tyLeChuyenTS: g.totalPhieu ? ((g.chuyenTS / g.totalPhieu) * 100).toFixed(1) : 0,
        tyLeGiaHan: g.totalPhieu ? ((g.giaHan / g.totalPhieu) * 100).toFixed(1) : 0,
        tyLeHuy: g.totalPhieu ? ((g.ngungHuy / g.totalPhieu) * 100).toFixed(1) : 0,
      };
    });

    setSummaryRows(rows);
  };

  const handleSearch = () => {
    if (!fromDate || !toDate) {
      alert("Vui lòng chọn từ ngày và đến ngày");
      return;
    }
    fetchData(fromDate, toDate);
  };

  return (
    <div className="mt-8">
      <div className="flex gap-4 mb-4">
        <div>
          <label className="block text-sm mb-1 font-semibold">Từ ngày</label>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="p-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm mb-1 font-semibold">Đến ngày</label>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="p-2 border rounded" />
        </div>
        <button
          onClick={handleSearch}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded h-fit mt-5"
        >
          Lọc dữ liệu
        </button>
      </div>

      <div className="overflow-x-auto shadow-md rounded-lg border border-gray-200">
        <table className="min-w-full text-xs bg-white">
          <thead className="bg-gradient-to-r from-yellow-400 to-yellow-300 text-black uppercase text-[10px] font-bold sticky top-0 z-10">
            <tr>
              <th className="p-2">STT</th>
              <th className="p-2">Tên đơn vị</th>
              <th className="p-2">Tổng phiếu</th>
              <th className="p-2">Fiber</th>
              <th className="p-2">MyTV</th>
              <th className="p-2">Mesh</th>
              <th className="p-2">Chuyển TS</th>
              <th className="p-2">% Chuyển TS</th>
              <th className="p-2">Gia hạn</th>
              <th className="p-2">% Gia hạn</th>
              <th className="p-2">Ngưng/Hủy</th>
              <th className="p-2">% Hủy</th>
              <th className="p-2">Chưa thực hiện</th>
            </tr>
          </thead>
          <tbody>
            {summaryRows.map((item, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-50">
                <td className="p-2 text-center">{idx + 1}</td>
                <td className="p-2">{item.unit}</td>
                <td className="p-2 text-center">{item.totalPhieu}</td>
                <td className="p-2 text-center">{item.fiber}</td>
                <td className="p-2 text-center">{item.mytv}</td>
                <td className="p-2 text-center">{item.mesh}</td>
                <td className="p-2 text-center">{item.chuyenTS}</td>
                <td className="p-2 text-center">{item.tyLeChuyenTS}%</td>
                <td className="p-2 text-center">{item.giaHan}</td>
                <td className="p-2 text-center">{item.tyLeGiaHan}%</td>
                <td className="p-2 text-center">{item.ngungHuy}</td>
                <td className="p-2 text-center">{item.tyLeHuy}%</td>
                <td className="p-2 text-center">{item.chuaThucHien}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GHTTSummaryTable;
