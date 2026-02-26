import React, { useState, useEffect } from "react";

const Filters = ({ data, onFilter }) => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedTTVT, setSelectedTTVT] = useState("");
  const [selectedStaff, setSelectedStaff] = useState("");

  // Lấy danh sách đơn vị duy nhất
  const ttvtList = Array.from(new Set(data.map((item) => item.TTVT_65_1 || "Không xác định")));

  // Lấy danh sách nhân viên theo đơn vị đã chọn
  const staffList = Array.from(
    new Set(
      data
        .filter((item) => item.TTVT_65_1 === selectedTTVT)
        .map((item) => typeof item.TEN_NV_NHANPHIEU === 'string' ? item.TEN_NV_NHANPHIEU : "Không xác định")
    )
  );

  useEffect(() => {
    handleFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromDate, toDate, selectedTTVT, selectedStaff]);

  const handleFilter = () => {
    const from = fromDate ? new Date(fromDate) : undefined;
    const to = toDate ? new Date(toDate) : undefined;
    onFilter({ from, to, ttvt: selectedTTVT, staff: selectedStaff });
  };

  return (
    <div className="flex flex-wrap gap-4 mb-6 items-end animate-fadeIn">
      <div>
        <label className="block text-sm font-semibold mb-1">Từ ngày</label>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="p-2 border rounded shadow-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1">Đến ngày</label>
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="p-2 border rounded shadow-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1">Đơn vị (TTVT)</label>
        <select
          value={selectedTTVT}
          onChange={(e) => {
            setSelectedTTVT(e.target.value);
            setSelectedStaff(""); // Reset nhân viên khi đổi đơn vị
          }}
          className="p-2 border rounded shadow-sm"
        >
          <option value="">-- Tất cả --</option>
          {ttvtList.map((ttvt, idx) => (
            <option key={idx} value={ttvt}>
              {ttvt}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1">Nhân viên</label>
        <select
          value={selectedStaff}
          onChange={(e) => setSelectedStaff(e.target.value)}
          className="p-2 border rounded shadow-sm"
        >
          <option value="">-- Tất cả --</option>
          {staffList.map((staff, idx) => (
            <option key={idx} value={staff}>
              {staff}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default Filters;
