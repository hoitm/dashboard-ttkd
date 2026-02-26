import html2canvas from "html2canvas";

export function exportChartAsImage(elementId, filename) {
  const chartElement = document.getElementById(elementId);
  if (!chartElement) {
    alert("Không tìm thấy biểu đồ để xuất!");
    return;
  }

  html2canvas(chartElement).then((canvas) => {
    const link = document.createElement("a");
    link.download = `${filename}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
}
