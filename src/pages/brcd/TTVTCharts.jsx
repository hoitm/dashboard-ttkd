import React from "react";
import ReactECharts from "echarts-for-react";

const TTVTCharts = ({ data }) => {
  const groupedData = data.reduce((acc, item) => {
    const ttvt = item.TTVT_65_1 || "Không xác định";
    if (!acc[ttvt]) {
      acc[ttvt] = {
        tong: 0,
        ton: 0,
        hoanThanh: 0,
      };
    }
    acc[ttvt].tong += 1;
    if (item.TON_39 && item.TON_39 !== "{}") acc[ttvt].ton += 1;
    if (item.TRANGTHAIPHIEU_38 === "Đã hoàn thành") acc[ttvt].hoanThanh += 1;
    return acc;
  }, {});

  const chartData = Object.keys(groupedData).map((ttvt) => ({
    name: ttvt,
    tong: groupedData[ttvt].tong,
    ton: groupedData[ttvt].ton,
    hoanThanh: groupedData[ttvt].hoanThanh,
  }));

  const option = {
    title: {
      text: "Thống kê theo đơn vị (TTVT)",
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

export default TTVTCharts;
