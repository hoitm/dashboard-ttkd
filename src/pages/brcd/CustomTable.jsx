import React, { useEffect, useState } from "react";
import { exportStaffExcel, exportTTVTExcel,exportToExcel } from "../brcd/exportExcel"; // dùng thêm export riêng

const getRateColor = (rate) => {
  if (rate >= 90) return "text-green-600 font-bold";
  if (rate >= 70) return "text-yellow-500 font-semibold";
  return "text-red-500 font-bold";
};

const CustomTable = ({ data }) => {
  const [mounted, setMounted] = useState(false);
  const [selectedStaffDetail, setSelectedStaffDetail] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const groupedData = data.reduce((acc, item) => {
    const ttvt = item.TTVT_65_1 || "Không xác định";
    const staff = item.TEN_NV_NHANPHIEU || "Không xác định";

    if (!acc[ttvt]) acc[ttvt] = {};
    if (!acc[ttvt][staff]) {
      acc[ttvt][staff] = {
        tong: 0,
        ton: 0,
        tonCham: 0,
        hoanThanh: 0,
      };
    }

    acc[ttvt][staff].tong += 1;
    if (item.TRANGTHAIPHIEU_38 === "Tồn đã chạm") acc[ttvt][staff].tonCham += 1;
    if (item.TRANGTHAIPHIEU_38 === "Đã hoàn thành") acc[ttvt][staff].hoanThanh += 1;
    if (item.TON_39 && item.TON_39 !== "{}") acc[ttvt][staff].ton += 1;

    return acc;
  }, {});

  const rows = [];
  let totalPhiếu = 0, totalTồn = 0, totalTồnChạm = 0, totalHoànThành = 0;

  Object.keys(groupedData).forEach((ttvt) => {
    Object.keys(groupedData[ttvt]).forEach((staff) => {
      const record = groupedData[ttvt][staff];
      const tyLeHoanThanh = record.tong > 0 ? ((record.hoanThanh / record.tong) * 100).toFixed(1) : 0;
      rows.push({
        ttvt,
        staff,
        tong: record.tong,
        ton: record.ton,
        tonCham: record.tonCham,
        hoanThanh: record.hoanThanh,
        tyLeHoanThanh,
      });

      totalPhiếu += record.tong;
      totalTồn += record.ton;
      totalTồnChạm += record.tonCham;
      totalHoànThành += record.hoanThanh;
    });
  });

  const avgTyLeHoanThanh = totalPhiếu > 0 ? ((totalHoànThành / totalPhiếu) * 100).toFixed(1) : 0;

  const handleSelectStaff = (staff) => {
    if (selectedStaffDetail === staff) {
      setSelectedStaffDetail(null);
    } else {
      setSelectedStaffDetail(staff);
    }
  };

  const DetailTable = ({ staff }) => {
    const detailData = data.filter((item) => item.TEN_NV_NHANPHIEU === staff);
    if (detailData.length === 0) return null;

    return (
      <div className="overflow-x-auto p-2 bg-gray-50 rounded-b-md transition-all duration-300 ease-in-out">
        <div className="flex justify-end mb-2">
          <button
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs"
            onClick={() => exportStaffExcel(detailData, staff)}
          >
            📥 Export nhân viên
          </button>
        </div>
        <table className="min-w-full text-xs text-left">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2">Số Phiếu</th>
              <th className="p-2">Ngày giao</th>
              <th className="p-2">Loại phiếu</th>
              <th className="p-2">Trạng thái phiếu</th>
              <th className="p-2">Tồn/Hoàn thành</th>
            </tr>
          </thead>
          <tbody>
            {detailData.map((item, idx) => (
              <tr key={idx} className="border-b">
                <td className="p-2">{item.MA_TB}</td>
                <td className="p-2">{item.NGAYGIAO ? new Date(item.NGAYGIAO).toLocaleDateString('vi-VN') : ""}</td>
                <td className="p-2">{item.LOAIPHIEU_34}</td>
                <td className="p-2">{item.TRANGTHAIPHIEU_38}</td>
                <td className="p-2">
                  {item.TON_39 && item.TON_39 !== "{}" ? "Tồn" : "Hoàn thành"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className={`overflow-x-auto mt-8 border border-gray-200 rounded-lg shadow-md ${mounted ? "animate-fadeIn" : ""}`}>
      <div className="flex justify-end mb-3">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          onClick={() => exportTTVTExcel(data)}
        >
          📥 Export đơn vị
        </button>
      </div>
      <div className="max-h-[500px] overflow-y-auto">
        <table className="min-w-full text-sm text-left bg-white">
          <thead className="sticky top-0 bg-gradient-to-r from-blue-500 to-cyan-500 text-white uppercase text-xs font-bold z-10">
            <tr>
              <th className="p-3">Đơn vị (TTVT)</th>
              <th className="p-3">Nhân viên</th>
              <th className="p-3 text-center">Tổng phiếu</th>
              <th className="p-3 text-center">Tồn</th>
              <th className="p-3 text-center">Tồn đã chạm</th>
              <th className="p-3 text-center">Hoàn thành</th>
              <th className="p-3 text-center">Tỷ lệ hoàn thành (%)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item, idx) => (
              <React.Fragment key={idx}>
                <tr
                  className={`border-b hover:bg-gray-50 cursor-pointer transition-all duration-300 ease-in-out ${
                    selectedStaffDetail === item.staff ? "bg-blue-50" : ""
                  }`}
                  onClick={() => handleSelectStaff(item.staff)}
                >
                  <td className="p-3 font-semibold">{item.ttvt}</td>
                  <td className="p-3 flex items-center gap-1">
                    {item.staff}
                    <span className="text-xs">
                      {selectedStaffDetail === item.staff ? "🔼" : "🔽"}
                    </span>
                  </td>
                  <td className="p-3 text-center">{item.tong}</td>
                  <td className="p-3 text-center">{item.ton}</td>
                  <td className="p-3 text-center">{item.tonCham}</td>
                  <td className="p-3 text-center">{item.hoanThanh}</td>
                  <td className={`p-3 text-center ${getRateColor(item.tyLeHoanThanh)}`}>
                    {item.tyLeHoanThanh}%
                  </td>
                </tr>

                {selectedStaffDetail === item.staff && (
                  <tr>
                    <td colSpan={7}>
                      <DetailTable staff={item.staff} />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            <tr className="font-bold bg-gray-100 text-gray-800">
              <td className="p-3" colSpan={2}>Tổng</td>
              <td className="p-3 text-center">{totalPhiếu}</td>
              <td className="p-3 text-center">{totalTồn}</td>
              <td className="p-3 text-center">{totalTồnChạm}</td>
              <td className="p-3 text-center">{totalHoànThành}</td>
              <td className={`p-3 text-center ${getRateColor(avgTyLeHoanThanh)}`}>
                {avgTyLeHoanThanh}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomTable;
