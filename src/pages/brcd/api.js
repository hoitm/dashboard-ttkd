import axios from "axios";

// Hàm tiện ích lấy ngày đầu tháng đến hôm nay
function getDefaultDateRange() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-GB'); // Format dd/MM/yyyy
  };

  return {
    tu_ngay: formatDate(startOfMonth),
    den_ngay: formatDate(now),
  };
}

// Hàm gọi API
export async function getData(tu_ngay = null, den_ngay = null) {
  try {
    const defaultRange = getDefaultDateRange();
    const payload = {
      tu_ngay: tu_ngay || defaultRange.tu_ngay,
      den_ngay: den_ngay || defaultRange.den_ngay,
    };

    const response = await axios.post(
      "https://localhost:7299/api/AppOnline/web-dhsxkd-ghtt",
      payload,
      {
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
}
