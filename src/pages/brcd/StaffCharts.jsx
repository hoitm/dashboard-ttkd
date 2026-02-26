import React from "react";
import ReactECharts from "echarts-for-react";

const StaffCharts = ({ data, selectedTTVT }) => {
  const groupedStaff = data.reduce((acc, item) => {
    if (!selectedTTVT || item.TTVT_65_1 === selectedTTVT) {
      const staff = item.TEN_NV_NHANPHIEU || "Không xác định";

      if (!acc[staff]) {
        acc[staff] = {
          tong: 0,
          ton: 0,
          hoanThanh: 0,
        };
      }
      acc[staff].tong += 1;
      if (item.TON_39 && item.TON_39 !== "{}") acc[staff].ton += 1;
      if (item.TRANGTHAIPHIEU_38 === "Đã hoàn thành") acc[staff].hoanThanh += 1;
    }
    return acc;
  }, {});

  const chartData = Object.keys(groupedStaff).map((staff) => ({
    name: staff,
    tong: groupedStaff[staff].tong,
    ton: groupedStaff[staff].ton,
    hoanThanh: groupedStaff[staff].hoanThanh,
  }));

  const option = {
    title: {
      text: selectedTTVT ? `Thống kê nhân viên (${selectedTTVT})` : "Thống kê nhân viên",
      left: "center",
    },
    tooltip: {
      trigger: "axis",
    },
    legend: {
      bottom: 0,
    },
    xAxis: {
      type: "category",
      data: chartData.map((item) => item.name),
      axisLabel: { rotate: 30, interval: 0 }, // Xoay tên cho dễ đọc
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        name: "Tổng phiếu",
        type: "bar",
        data: chartData.map((item) => item.tong),
      },
      {
        name: "Tồn",
        type: "bar",
        data: chartData.map((item) => item.ton),
      },
      {
        name: "Hoàn thành",
        type: "bar",
        data: chartData.map((item) => item.hoanThanh),
      },
    ],
  };

  return (
    <div className="p-4">
      <ReactECharts option={option} style={{ height: 400 }} />
    </div>
  );
};

export default StaffCharts;
