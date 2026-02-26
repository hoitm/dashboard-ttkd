// src/components/PdfViewer.jsx
import React, { useEffect, useRef, useState } from "react";

import * as pdfjsLib from "pdfjs-dist/build/pdf";
import pdfWorker from "pdfjs-dist/build/pdf.worker?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export default function PdfViewer({
  pdfUrl,
  regions,
  setRegions,
  signaturePreview,
  totalPages
}) {
  const [pdfDoc, setPdfDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const canvasRef = useRef(null);
  const dragIndex = useRef(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Load PDF
  useEffect(() => {
    if (!pdfUrl) return;

    (async () => {
      const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
      setPdfDoc(pdf);
      setCurrentPage(1);
    })();
  }, [pdfUrl]);

  // Render page
  useEffect(() => {
    if (!pdfDoc) return;
    renderPage(currentPage);
  }, [pdfDoc, currentPage, regions, signaturePreview]);

  const renderPage = async (num) => {
    const page = await pdfDoc.getPage(num);
    const viewport = page.getViewport({ scale: 1.25 });

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: ctx, viewport }).promise;

    const list = regions.filter((r) => r.page === num);

    // Draw signature rectangles
    list.forEach((r) => {
      ctx.save();
      ctx.strokeStyle = "#0ea5e9";
      ctx.setLineDash([6, 4]);
      ctx.lineWidth = 2;
      ctx.strokeRect(r.x, r.y, r.w, r.h);
      ctx.restore();

      if (signaturePreview) {
        const img = new Image();
        img.src = signaturePreview;
        img.onload = () => ctx.drawImage(img, r.x, r.y, r.w, r.h);
      }
    });
  };

  // Hit test region
  const hitRegion = (x, y) =>
    regions.findIndex(
      (r) =>
        r.page === currentPage &&
        x >= r.x &&
        x <= r.x + r.w &&
        y >= r.y &&
        y <= r.y + r.h
    );

  // Mouse events
  const mouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const index = hitRegion(x, y);

    if (index !== -1) {
      dragIndex.current = index;
      const reg = regions[index];
      dragOffset.current = { x: x - reg.x, y: y - reg.y };
      return;
    }

    // Create new region
    const newReg = {
      page: currentPage,
      x: x - 75,
      y: y - 30,
      w: 150,
      h: 60,
    };
    setRegions((prev) => [...prev, newReg]);
  };

  const mouseMove = (e) => {
    if (dragIndex.current === null) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setRegions((prev) =>
      prev.map((r, idx) =>
        idx !== dragIndex.current
          ? r
          : {
              ...r,
              x: x - dragOffset.current.x,
              y: y - dragOffset.current.y,
            }
      )
    );
  };

  const mouseUp = () => {
    dragIndex.current = null;
  };

  return (
    <div className="w-full">
      {/* Pagination */}
      <div className="flex items-center gap-2 mb-2">
        <button
          className="px-2 py-1 border rounded disabled:opacity-40"
          disabled={currentPage <= 1}
          onClick={() => setCurrentPage((p) => p - 1)}
        >
          Prev
        </button>

        <span className="text-sm">
          Trang {currentPage}/{pdfDoc?.numPages || totalPages}
        </span>

        <button
          className="px-2 py-1 border rounded disabled:opacity-40"
          disabled={currentPage >= (pdfDoc?.numPages || totalPages)}
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          Next
        </button>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={mouseDown}
        onMouseMove={mouseMove}
        onMouseUp={mouseUp}
        className="border shadow bg-white"
      />
    </div>
  );
}
