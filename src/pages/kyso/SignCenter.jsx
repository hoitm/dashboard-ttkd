import React, { useState, useEffect } from "react";
import {
  Button, Card, Chip, Divider, MenuItem, Select, TextField
} from "@mui/material";
import UploadIcon from "@mui/icons-material/Upload";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";

import PdfViewer from "../../pages/kyso/PdfViewer";
import {
  uploadFileAny,
  uploadSignatureImage,
  getUserCertificates,
  aiDetectRegion,
  startSign,
  confirmSign
} from "../../services/signApi";


export default function SignCenter() {
  const [fileInfo, setFileInfo] = useState(null);     // PDF sau convert
  const [signatureInfo, setSignatureInfo] = useState(null);
  const [signaturePreview, setSignaturePreview] = useState(null);

  const [certList, setCertList] = useState([]);
  const [selectedCert, setSelectedCert] = useState("");

  const [regions, setRegions] = useState([]); // {page,x,y,w,h}

  const [msg, setMsg] = useState("");
  const [signedUrl, setSignedUrl] = useState(null);
  const [loadingCert, setLoadingCert] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [signing, setSigning] = useState(false);


  // ============================================================
  // UPLOAD FILE (PDF / DOCX / XLSX)
  // Backend sẽ convert DOCX/XLSX → PDF
  // ============================================================
  const handleUploadFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    setMsg("Đang upload & chuyển đổi...");
    const uploaded = await uploadFileAny(f);
    // expected: { pdfUrl, fileId, fileName, pages }
    setFileInfo(uploaded);
    setMsg(`Đã upload: ${uploaded.fileName}`);
  };

  // ============================================================
  // UPLOAD ẢNH CHỮ KÝ
  // ============================================================
  const handleUploadSignature = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    const preview = URL.createObjectURL(f);
    setSignaturePreview(preview);

    const uploaded = await uploadSignatureImage(f);
    setSignatureInfo(uploaded);
    setMsg("Đã upload ảnh chữ ký");
  };


  // ============================================================
  // LOAD CERTIFICATES
  // ============================================================
  const loadCerts = async () => {
    setLoadingCert(true);
    const list = await getUserCertificates();
    setCertList(list);
    setLoadingCert(false);
  };


  // ============================================================
  // AI autodetect region
  // ============================================================
  const detectAI = async () => {
    if (!fileInfo) return alert("Chưa có file để AI scan!");

    setAiBusy(true);
    const aiRegions = await aiDetectRegion(fileInfo.fileId);
    const mapped = aiRegions.map(r => ({
      page: r.page,
      x: r.x,
      y: r.y,
      w: r.width,
      h: r.height
    }));

    setRegions(prev => [...prev, ...mapped]);
    setAiBusy(false);
    setMsg(`AI tìm được ${mapped.length} vùng ký`);
  };


  // ============================================================
  // KÝ
  // ============================================================
  const handleSign = async () => {
    if (!fileInfo) return alert("Chưa upload file!");
    if (!signatureInfo) return alert("Chưa tải ảnh chữ ký!");
    if (!selectedCert) return alert("Chưa chọn chứng thư!");
    if (regions.length === 0) return alert("Chưa chọn vùng ký!");

    setSigning(true);

    const start = await startSign({
      fileId: fileInfo.fileId,
      profileImageId: signatureInfo.id,
      certSerial: selectedCert,
      regions
    });

    if (start.needConfirm) {
      const otp = prompt("Nhập OTP SmartCA:");
      const res = await confirmSign({
        transactionId: start.transactionId,
        otp
      });
      setSignedUrl(res.signedFilePath);
      setMsg("Ký thành công!");
    } else {
      setSignedUrl(start.signedFilePath);
      setMsg("Ký thành công!");
    }

    setSigning(false);
  };


  return (
    <div className="grid grid-cols-12 gap-4 p-4">

      {/* =======================================================
          LEFT SIDEBAR
      ======================================================= */}
      <div className="col-span-12 md:col-span-3 space-y-4">
        <Card className="p-4 space-y-3">
          <div className="text-xl font-semibold flex items-center gap-2 text-sky-700">
            <AssignmentTurnedInIcon /> Trung tâm ký số SmartCA
          </div>

          <Divider />

          {/* === Upload file === */}
          <Button
            variant="contained"
            component="label"
            startIcon={<UploadIcon />}
            fullWidth
          >
            Tải tài liệu (PDF/DOCX/XLSX)
            <input type="file" hidden onChange={handleUploadFile} />
          </Button>

          {fileInfo && (
            <Chip color="success" label={fileInfo.fileName} className="mt-1" />
          )}

          <Divider />

          {/* === Upload signature === */}
          <Button
            variant="outlined"
            component="label"
            startIcon={<UploadIcon />}
            fullWidth
          >
            Tải ảnh chữ ký
            <input type="file" hidden accept="image/*" onChange={handleUploadSignature} />
          </Button>
          {signaturePreview && (
            <img src={signaturePreview} className="h-20 mt-2 border rounded" />
          )}

          <Divider />

          {/* === Certificates === */}
          <Button
            variant="outlined"
            fullWidth
            disabled={loadingCert}
            onClick={loadCerts}
          >
            {loadingCert ? "Đang tải..." : "Lấy chứng thư SmartCA"}
          </Button>

          <Select
            size="small"
            fullWidth
            value={selectedCert}
            onChange={(e) => setSelectedCert(e.target.value)}
            displayEmpty
            className="mt-2"
          >
            <MenuItem value="">
              <em>— Chọn chứng thư —</em>
            </MenuItem>
            {certList.map((c) => (
              <MenuItem key={c.serial} value={c.serial}>
                {c.subject || c.serial}
              </MenuItem>
            ))}
          </Select>

          <Divider />

          {/* === AI detect region === */}
          <Button
            variant="contained"
            color="secondary"
            fullWidth
            startIcon={<AutoFixHighIcon />}
            disabled={!fileInfo || aiBusy}
            onClick={detectAI}
          >
            {aiBusy ? "Đang AI..." : "AI tìm vị trí ký"}
          </Button>

          {/* List vùng ký */}
          <div className="text-sm text-gray-700 mt-3">
            <b>Vùng ký:</b> {regions.length} vùng
          </div>
        </Card>

        {/* Sign button */}
        <Card className="p-4 space-y-3">
          <Button
            variant="contained"
            color="primary"
            fullWidth
            disabled={signing}
            onClick={handleSign}
          >
            {signing ? "Đang ký..." : "Ký tài liệu ngay"}
          </Button>

          {signedUrl && (
            <a href={signedUrl} download className="text-blue-600 underline text-sm">
              Tải file đã ký
            </a>
          )}

          {msg && (
            <Chip label={msg} color="info" className="text-xs font-semibold" />
          )}
        </Card>
      </div>


      {/* =======================================================
          CENTER VIEWER (PDF VIEW)
      ======================================================= */}
      <div className="col-span-12 md:col-span-9">
        <Card className="p-4">
          {fileInfo ? (
            <PdfViewer
              pdfUrl={fileInfo.pdfUrl}
              regions={regions}
              setRegions={setRegions}
              signaturePreview={signaturePreview}
              totalPages={fileInfo.pages}
            />
          ) : (
            <div className="text-gray-500 text-center py-32">
              <PictureAsPdfIcon fontSize="large" />
              <div>Tải tài liệu để xem trước & ký</div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
