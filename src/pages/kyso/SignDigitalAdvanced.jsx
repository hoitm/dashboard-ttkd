import React, { useEffect, useRef, useState } from "react";
import {
  Card,
  Button,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  TextField
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import UploadIcon from "@mui/icons-material/Upload";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";

import {
  getUserCertificates,
  startSign,
  confirmSign,
  uploadSignatureImage,
  uploadPdfFile,
  aiDetectRegion
} from "../../services/signApi";

import * as pdfjsLib from "pdfjs-dist/build/pdf";
import pdfWorker from "pdfjs-dist/build/pdf.worker?url";
import "pdfjs-dist/web/pdf_viewer.css";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
//pdfjsLib.GlobalWorkerOptions.workerSrc =
 // "//cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.worker.min.js";

/**
 * Trang ký số nâng cao:
 * - Upload PDF
 * - Upload ảnh chữ ký
 * - Chọn chứng thư SmartCA
 * - AI gợi ý vùng ký
 * - Nhiều vùng ký, nhiều trang
 * - Drag & drop vùng ký
 * - Preview chữ ký trên PDF trước khi ký
 */
export default function SignDigitalAdvanced() {
  const [pdfInfo, setPdfInfo] = useState(null); // { fileId, fileName, localUrl }
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pageNum, setPageNum] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [signatureInfo, setSignatureInfo] = useState(null); // { id, fileName }
  const [signaturePreview, setSignaturePreview] = useState(null);

  const [certList, setCertList] = useState([]);
  const [selectedCert, setSelectedCert] = useState("");

  const [regions, setRegions] = useState([]); // { page, startX, startY, w, h }
  const [draggingIndex, setDraggingIndex] = useState(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  const [signing, setSigning] = useState(false);
  const [loadingCert, setLoadingCert] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);

  const [signedFileUrl, setSignedFileUrl] = useState(null);
  const [msg, setMsg] = useState("");

  const canvasRef = useRef(null);

  // ========= Upload PDF =========
  const handleUploadPdf = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setPdfUrl(localUrl);
    setPdfDoc(null);
    setPageNum(1);
    setTotalPages(1);
    setRegions([]);
    setSignedFileUrl(null);

    try {
      const uploaded = await uploadPdfFile(file);
      // expected: { fileId, fileName }
      setPdfInfo({
        fileId: uploaded.fileId,
        fileName: uploaded.fileName || file.name,
        localUrl
      });
      setMsg(`Đã upload PDF: ${uploaded.fileName || file.name}`);
    } catch (err) {
      console.error(err);
      setMsg("Lỗi upload PDF");
    }
  };

  // ========= Upload Signature Image =========
  const handleUploadSignature = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setSignaturePreview(previewUrl);

    try {
      const uploaded = await uploadSignatureImage(file);
      // expected: { id, fileName }
      setSignatureInfo(uploaded);
      setMsg(`Đã upload ảnh chữ ký: ${uploaded.fileName || file.name}`);
    } catch (err) {
      console.error(err);
      setMsg("Lỗi upload ảnh chữ ký");
    }
  };

  // ========= Load PDF from URL =========
  useEffect(() => {
    if (!pdfUrl) return;

    const loadPdf = async () => {
      try {
        const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
        setPdfDoc(pdf);
        setTotalPages(pdf.numPages);
        setPageNum(1);
      } catch (err) {
        console.error(err);
        setMsg("Không đọc được file PDF");
      }
    };

    loadPdf();
  }, [pdfUrl]);

  // ========= Render page when pdfDoc | pageNum | regions change =========
  useEffect(() => {
    if (!pdfDoc) return;
    renderPage(pageNum);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfDoc, pageNum, regions, signaturePreview]);

  const renderPage = async (num) => {
    const page = await pdfDoc.getPage(num);
    const viewport = page.getViewport({ scale: 1.3 });

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    // vẽ PDF
    await page.render({ canvasContext: ctx, viewport }).promise;

    // vẽ vùng ký + chữ ký
    const pageRegions = regions.filter((r) => r.page === num);
    if (pageRegions.length === 0) return;

    pageRegions.forEach((r) => {
      // khung vùng ký
      ctx.save();
      ctx.strokeStyle = "#0ea5e9"; // sky-500
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(r.startX, r.startY, r.w, r.h);
      ctx.restore();
    });

    if (signaturePreview) {
      const img = new Image();
      img.src = signaturePreview;
      img.onload = () => {
        pageRegions.forEach((r) => {
          ctx.drawImage(img, r.startX, r.startY, r.w, r.h);
        });
      };
    }
  };

  // ========= Mouse events (drag & create region) =========
  const hitTestRegion = (x, y) => {
    // tìm vùng ở trang hiện tại
    return regions.findIndex(
      (r) =>
        r.page === pageNum &&
        x >= r.startX &&
        x <= r.startX + r.w &&
        y >= r.startY &&
        y <= r.startY + r.h
    );
  };

  const handleMouseDown = (e) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const idx = hitTestRegion(x, y);
    if (idx !== -1) {
      setDraggingIndex(idx);
      const r = regions[idx];
      dragOffset.current = {
        x: x - r.startX,
        y: y - r.startY
      };
      return;
    }

    // click chỗ trống => tạo vùng default
    const newRegion = {
      page: pageNum,
      startX: x - 75,
      startY: y - 30,
      w: 150,
      h: 60
    };
    setRegions((prev) => [...prev, newRegion]);
  };

  const handleMouseMove = (e) => {
    if (draggingIndex === null || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const dx = x - dragOffset.current.x;
    const dy = y - dragOffset.current.y;

    setRegions((prev) =>
      prev.map((r, idx) =>
        idx === draggingIndex
          ? {
              ...r,
              startX: dx,
              startY: dy
            }
          : r
      )
    );
  };

  const handleMouseUp = () => {
    setDraggingIndex(null);
  };

  // ========= Lấy danh sách chứng thư =========
  const handleLoadCerts = async () => {
    try {
      setLoadingCert(true);
      const list = await getUserCertificates();
      setCertList(list);
      setMsg(`Đã tải ${list.length} chứng thư`);
    } catch (err) {
      console.error(err);
      setMsg("Lỗi tải chứng thư");
    } finally {
      setLoadingCert(false);
    }
  };

  // ========= AI detect region =========
  const handleAIDetect = async () => {
    if (!pdfInfo) {
      alert("Vui lòng upload PDF trước");
      return;
    }
    try {
      setAiBusy(true);
      const aiRegions = await aiDetectRegion(pdfInfo.fileId);
      // expected: [{ page, x, y, width, height }]
      const mapped = (aiRegions || []).map((r) => ({
        page: r.page || 1,
        startX: r.x,
        startY: r.y,
        w: r.width,
        h: r.height
      }));
      setRegions((prev) => [...prev, ...mapped]);
      setMsg(`AI đề xuất ${mapped.length} vùng ký`);
    } catch (err) {
      console.error(err);
      setMsg("AI không nhận diện được vùng ký");
    } finally {
      setAiBusy(false);
    }
  };

  // ========= Ký =========
  const handleSign = async () => {
    if (!pdfInfo || !signatureInfo || !selectedCert || regions.length === 0) {
      alert("Vui lòng chọn PDF, ảnh chữ ký, chứng thư và vùng ký");
      return;
    }
    try {
      setSigning(true);
      setMsg("Đang tạo giao dịch ký...");

      const payload = {
        fileId: pdfInfo.fileId,
        profileImageId: signatureInfo.id,
        certSerial: selectedCert,
        regions: regions.map((r) => ({
          page: r.page,
          x: r.startX,
          y: r.startY,
          width: r.w,
          height: r.h
        }))
      };

      const start = await startSign(payload);
      // backend có thể trả:
      // { needConfirm: bool, transactionId, signedFilePath? }

      if (start.needConfirm) {
        const otp = window.prompt("Nhập OTP SmartCA:");
        if (!otp) {
          setMsg("Hủy ký vì không có OTP");
          return;
        }
        const confirmRes = await confirmSign({
          transactionId: start.transactionId,
          otp
        });
        setSignedFileUrl(confirmRes.signedFilePath);
        setMsg("Ký thành công (confirm)!");
      } else {
        setSignedFileUrl(start.signedFilePath);
        setMsg("Ký thành công!");
      }
    } catch (err) {
      console.error(err);
      setMsg("Ký thất bại");
    } finally {
      setSigning(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <Card className="p-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-2xl font-semibold text-sky-700 flex items-center gap-2">
            <AssignmentTurnedInIcon />
            Ký số văn bản PDF – SmartCA
          </div>
          <div className="text-sm text-gray-500">
            Upload PDF → chọn vùng ký → AI gợi ý vị trí & ký bằng SmartCA
          </div>
        </div>
        {msg && (
          <Chip
            color="primary"
            variant="outlined"
            label={msg}
            className="max-w-[360px]"
          />
        )}
      </Card>

      {/* Upload zone */}
      <Card className="p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* PDF */}
          <div className="space-y-2">
            <div className="font-semibold text-sm">1. File PDF</div>
            <Button
              fullWidth
              variant="contained"
              component="label"
              startIcon={<PictureAsPdfIcon />}
            >
              Chọn file PDF
              <input type="file" hidden accept="application/pdf" onChange={handleUploadPdf} />
            </Button>
            {pdfInfo && (
              <div className="text-xs text-emerald-700">
                ✓ {pdfInfo.fileName}
              </div>
            )}
          </div>

          {/* Signature image */}
          <div className="space-y-2">
            <div className="font-semibold text-sm">2. Ảnh chữ ký</div>
            <Button
              fullWidth
              variant="contained"
              component="label"
              startIcon={<UploadIcon />}
            >
              Chọn ảnh chữ ký
              <input type="file" hidden accept="image/*" onChange={handleUploadSignature} />
            </Button>
            {signaturePreview && (
              <img
                src={signaturePreview}
                alt="Signature preview"
                className="h-16 mt-2 border rounded object-contain"
              />
            )}
          </div>

          {/* Certificate */}
          <div className="space-y-2">
            <div className="font-semibold text-sm">3. Chứng thư SmartCA</div>
            <div className="flex gap-2">
              <Button
                variant="outlined"
                size="small"
                onClick={handleLoadCerts}
                disabled={loadingCert}
              >
                {loadingCert ? "Đang tải..." : "Lấy chứng thư"}
              </Button>
              <Button
                variant="outlined"
                size="small"
                color="secondary"
                startIcon={<AutoFixHighIcon />}
                onClick={handleAIDetect}
                disabled={aiBusy || !pdfInfo}
              >
                {aiBusy ? "AI..." : "AI vị trí ký"}
              </Button>
            </div>
            <Select
              fullWidth
              size="small"
              value={selectedCert}
              onChange={(e) => setSelectedCert(e.target.value)}
              displayEmpty
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
          </div>
        </div>
      </Card>

      {/* PDF canvas + pagination */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="font-semibold text-sm">Xem & đặt vị trí ký trên PDF</div>
          <div className="flex items-center gap-2">
            <Button
              size="small"
              variant="outlined"
              onClick={() => setPageNum((p) => Math.max(1, p - 1))}
              disabled={!pdfDoc || pageNum <= 1}
            >
              Trang trước
            </Button>
            <Chip
              size="small"
              label={pdfDoc ? `Trang ${pageNum}/${totalPages}` : "Chưa có PDF"}
            />
            <Button
              size="small"
              variant="outlined"
              onClick={() => setPageNum((p) => Math.min(totalPages, p + 1))}
              disabled={!pdfDoc || pageNum >= totalPages}
            >
              Trang sau
            </Button>
          </div>
        </div>

        <div className="border inline-block max-w-full overflow-auto">
          <canvas
            ref={canvasRef}
            style={{ cursor: "crosshair", maxWidth: "100%" }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          />
        </div>
        <div className="text-xs text-gray-500">
          Gợi ý: click vào vùng bất kỳ để tạo khung ký; click & kéo để di chuyển khung.
        </div>
      </Card>

      {/* Action sign + result */}
      <Card className="p-4 space-y-3">
        <Button
          fullWidth
          variant="contained"
          size="large"
          color="primary"
          onClick={handleSign}
          disabled={signing}
        >
          {signing ? <CircularProgress size={24} /> : "TIẾN HÀNH KÝ"}
        </Button>

        {signedFileUrl && (
          <div className="text-sm">
            <a
              href={signedFileUrl}
              download
              className="text-sky-600 underline font-semibold"
            >
              Tải file PDF đã ký
            </a>
          </div>
        )}
      </Card>
    </div>
  );
}