// File: SearchQrVinaphone.jsx
import React, { useState } from "react";
import axios from "axios";
import {
  Autocomplete,
  TextField,
  CircularProgress,
  Box,
  Typography, Button 
} from "@mui/material";
import QRCodeCard from "./QRCodeCard";
import * as htmlToImage from "html-to-image";
import download from "downloadjs";

import DownloadIcon from "@mui/icons-material/Download";

const SearchQrVinaphone = () => {
  const [options, setOptions] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedData, setSelectedData] = useState(null);

  const fetchSuggestions = async (query) => {
    if (!query || query.length < 3) return;
    setLoading(true);
    try {
      const res = await axios.post(
        "https://ttkd.vnptphuyen.vn:4488/api/DynamicQuery/execute",
        {
          databaseType: "sql",
          functionName: `
            SELECT TOP 10 MA_TT, TEN_TT, MA_QRCODE
            FROM ONE_BSS.dbo.QRCODE_NEW_202503
            WHERE (MA_TT LIKE @query + '%' )
            --ORDER BY MA_TT
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
        ten_tt: row.TEN_TT,
        ma_qrcode: row.MA_QRCODE,
      }));

      setOptions(rows || []);
    } catch (err) {
      console.error("Lỗi khi lấy dữ liệu MA_TT:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ background: '#f7f9fc', minHeight: '100vh', p: 1 , pb:8}} className="p-1 pb-28 max-w-md mx-auto text-center">
      <Typography variant="h6" sx={{ color: '#0066cc' }} gutterBottom>
        Sinh QrCode (Qr động)
      </Typography>
        <Box mt={4}>
                <Autocomplete
                    freeSolo
                    loading={loading}
                    options={options}
                    onInputChange={(e, value) => {
                    setInputValue(value);
                    fetchSuggestions(value);
                    }}
                    onChange={(e, value) => setSelectedData(value)}
                    renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Nhập mã thanh toán (MA_TT)"
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
        </Box>
            

    <Box mt={4} display="flex" flexDirection="column" alignItems="center">
          {selectedData && selectedData.ma_qrcode && (
                 <Box mt={4} display="flex" flexDirection="column" alignItems="center">
          <Box
            id="qr-card"
            sx={{
              width: "100%",
              maxWidth: 420,
              overflow: "hidden",
              borderRadius: 2,
              boxShadow: 3,
              transform: "scale(1)",
              transformOrigin: "top center",
              ["@media (max-width:600px)"]: {
                transform: "scale(0.85)",
              },
            }}
          >
            <QRCodeCard
              ma_tt={selectedData.ma_tt}
              ten_kh={selectedData.ten_tt}
              qr_code_value={selectedData.ma_qrcode}
            />
           
          </Box>    <Button
                variant="contained"
                color="primary"
                startIcon={<DownloadIcon />}
                sx={{ mt: 2 }}
                onClick={() => {
                const node = document.getElementById("qr-card");
                if (!node) return;
                htmlToImage.toPng(node).then((dataUrl) => {
                    download(dataUrl, `${selectedData.ma_tt}.png`);
                });
                }}
                >
                Tải ảnh QR
            </Button>
          </Box>
      )}
    </Box>
    </Box> 
  );
};

export default SearchQrVinaphone;
