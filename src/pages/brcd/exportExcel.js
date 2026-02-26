import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// Hàm làm phẳng object: xóa bỏ {}, chỉ giữ string/number
function cleanData(data) {
  return data.map(item => {
    const cleanItem = {};
    Object.keys(item).forEach(key => {
      const value = item[key];
      if (typeof value === 'object' && value !== null) {
        cleanItem[key] = ""; // object thì cho thành chuỗi rỗng
      } else {
        cleanItem[key] = value;
      }
    });
    return cleanItem;
  });
}

// Hàm chuẩn tạo Blob file Excel
function exportToExcelFile(cleanedData, filename) {
  const ws = XLSX.utils.json_to_sheet(cleanedData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const dataBlob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(dataBlob, filename);
}

// Export toàn bộ đơn vị
export function exportTTVTExcel(data) {
  if (!data || data.length === 0) {
    alert("Không có dữ liệu để export Excel!");
    return;
  }

  const cleanedData = cleanData(data);
  exportToExcelFile(cleanedData, `Export_DonVi_${new Date().toISOString().slice(0,10)}.xlsx`);
}
// Export toàn bộ đơn vị
export function exportToExcel(data) {
    if (!data || data.length === 0) {
      alert("Không có dữ liệu để export Excel!");
      return;
    }
  
    const cleanedData = cleanData(data);
    exportToExcelFile(cleanedData, `Export_DonVi_${new Date().toISOString().slice(0,10)}.xlsx`);
  }
  
// Export riêng 1 nhân viên
export function exportStaffExcel(data, staffName) {
  if (!data || data.length === 0) {
    alert("Nhân viên không có phiếu để export!");
    return;
  }

  const cleanedData = cleanData(data);
  exportToExcelFile(cleanedData, `Export_${staffName}_${new Date().toISOString().slice(0,10)}.xlsx`);
}
