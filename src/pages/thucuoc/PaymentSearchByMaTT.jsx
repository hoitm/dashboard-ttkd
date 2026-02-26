import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Autocomplete,
  TextField,
  CircularProgress,
  Box,
  Typography,
} from "@mui/material";

const PaymentSearchByMaTT = () => {
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");

  // Tìm MA_TT theo inputValue (gọi API gợi ý)
  const fetchSuggestions = async (query) => {
    if (!query || query.length < 3) return; // hạn chế gọi quá sớm
    setLoading(true);
    try {
      const res = await axios.post(
        "https://ttkd.vnptphuyen.vn:4488/api/DynamicQuery/execute",
        {
          databaseType: "sql",
          functionName: `
            SELECT TOP 10 SO_DT, MA_TT, MA_TINH, SO_TIEN, URL, KY_CUOC
            FROM ZALO.dbo.MEDIA_QRCODE
            WHERE (MA_TT LIKE @query + '%' OR TEN_TT LIKE '%' + @query + '%' )
            ORDER BY MA_TT
          `,
          parameters: { query },
          isRawSql: true,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const rows = res.data?.map((row) => ({
        label: row.MA_TT,
        ma_tt: row.MA_TT,
        so_dt: row.SO_DT,
        so_tien: row.SO_TIEN,
        url: row.URL,
        ky_cuoc: row.KY_CUOC,
      }));

      setOptions(rows);
    } catch (err) {
      console.error("Lỗi khi gợi ý MA_TT:", err);
    } finally {
      setLoading(false);
    }
  };
const [iframeLoading, setIframeLoading] = useState(true);

  // Gọi API khi inputValue thay đổi
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchSuggestions(inputValue);
    }, 400); // debounce 400ms

    return () => clearTimeout(delayDebounce);
  }, [inputValue]);
 useEffect(() => {
  if (selected) setIframeLoading(true);
}, [selected]);
  return (
    <Box sx={{ background: '#f7f9fc', minHeight: '100vh', p: 1 , pb:8}} className="p-1 pb-28 max-w-md mx-auto text-center">
      <Typography variant="h6" className="mb-2" sx={{ color: '#0066cc' }}>
        Tra cứu Mã Thanh Toán (VietQR)
      </Typography>

      <Autocomplete
        options={options}
        loading={loading}
        onInputChange={(e, value) => setInputValue(value)}
        onChange={(e, newVal) => setSelected(newVal)}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Nhập mã thanh toán"
            variant="outlined"
            fullWidth
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />

      {selected && (
        <Box className="mt-4 bg-white p-4 rounded shadow">
          <Typography className="mb-1">
            <strong>Số điện thoại:</strong> {selected.so_dt}
          </Typography>
          <Typography className="mb-1">
            <strong>Số tiền:</strong> {Number(selected.so_tien).toLocaleString()}đ
          </Typography>
        {/*
              <Typography className="mb-3">
            <strong>Kỳ cước:</strong>{" "}
            {selected.ky_cuoc === 1 ? "✔ Gói CKD" : "❌ Gói lẻ"}
          </Typography>
        */}
     {/* Spinner chờ iframe */}
  {iframeLoading && (
    <Box className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
      <CircularProgress size={40} />
      <Typography variant="caption" className="mt-2 block">
        Đang tải mã QR...
      </Typography>
    </Box>
  )}
          <iframe
            title="QR"
            src={selected.url}
            className="w-full h-[700px] border rounded"
            onLoad={() => setIframeLoading(false)}
            onError={() => setIframeLoading(false)}
            style={{ opacity: iframeLoading ? 0 : 1, transition: "opacity 0.4s ease" }}
  />
        </Box>
      )}
    </Box>
  );
};

export default PaymentSearchByMaTT;
