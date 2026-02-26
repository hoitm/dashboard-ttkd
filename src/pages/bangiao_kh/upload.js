import { api } from "./clientupload";

export const suggestColumns = (params) =>
  api.get("/suggest", { params }).then(r => r.data);

export const downloadTemplate = (columns) =>
  api.get("/template", {
    params: { columns: (columns||[]).join(",") },
    responseType: "blob",
  }).then(r => r.data);

export const uploadThueBao = ({ file, columns, createdBy,ten_nv }) => {
  const form = new FormData();
  form.append("file", file);
  if (columns?.length) form.append("columns", columns.join(","));
  if (createdBy) form.append("createdBy", createdBy);
  if (ten_nv) form.append("ten_nv", ten_nv);
  return api.post("/thuebao", form, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then(r => r.data);
};

export const getUploadLogs = () =>
  api.get("/logs").then(r => r.data);

export const getEffective = (params) =>
  api.get("/effective", { params }).then(r => r.data);


export const sourceUrl  = (id, inline=false) => `${api}/source-file/${encodeURIComponent(id)}?inline=${inline}`;
export const errorUrl   = (id, inline=false) => `${api}/error-file1/${encodeURIComponent(id)}?inline=${inline}`;
export const successUrl = (id, inline=false) => `${api}/api/bangiao-upload/success-file/${id}?inline=${inline}`;
 // Lấy base URL dạng string (vd: https://localhost:7299)
 const API_BASE =
  (  "https://ttkd.vnptphuyen.vn:4488/api/upload_bangiao/")
    .replace(/\/+$/, "");

const build = (p) => `${API_BASE}${p}`;

/** Tải file qua Blob. Chỉ chạy khi bạn gọi hàm này (bấm nút). */
async function downloadViaBlob(path, fallbackName) {
  const url = build(path);
  try {
    const res = await api.get(url, { responseType: "blob" });

    // Lấy tên file từ Content-Disposition (nếu có)
    let filename = fallbackName || "download.bin";
    const cd = res.headers["content-disposition"] || "";
    const m = /filename\*?=(?:UTF-8'')?("?)(.+)\1/i.exec(cd);
    if (m) filename = decodeURIComponent(m[2]);

    // Tạo link download tạm
    const blob = res.data;
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(blobUrl);
  } catch (err) {
    // Nếu server trả 4xx/5xx, axios vẫn có err.response.data = Blob (json)
    try {
      const resp = err?.response;
      const blob = resp?.data;
      if (blob && typeof blob.text === "function") {
        const text = await blob.text();
        // cố parse JSON để hiện message đẹp
        try {
          const j = JSON.parse(text);
          alert(j?.message || j?.error || text);
        } catch {
          alert(text || "Tải file thất bại.");
        }
      } else {
        alert("Tải file thất bại.");
      }
    } catch {
      alert("Tải file thất bại.");
    }
    throw err;
  }
}


// Public APIs cho từng loại file
export const downloadSourceFile  = (batchId) =>
  downloadViaBlob(`/source-file1/${encodeURIComponent(batchId)}?inline=false`,
                  `source_${batchId}.xlsx`);

export const downloadErrorFile1   = (batchId) =>
  downloadViaBlob(`/error-file1/${encodeURIComponent(batchId)}?inline=false`,
                  `errors_${batchId}.xlsx`);

export const downloadSuccessFile = (batchId) =>
  downloadViaBlob(`/success-file/${encodeURIComponent(batchId)}?inline=false`,
                  `success_${batchId}.xlsx`);
// tải file lỗi theo batchId -> tự lưu
export async function downloadErrorFile(batchId) {
  const res = await api.get(`/error-file/${batchId}`, {
    responseType: "blob",
  });
  const blob = new Blob([res.data], {
    type: res.headers["content-type"] || "application/octet-stream",
  });
  const disposition = res.headers["content-disposition"] || "";
  const m = /filename\*?=(?:UTF-8'')?("?)(.+)\1/i.exec(disposition);
  const filename = m ? decodeURIComponent(m[2]) : `errors_${batchId}.xlsx`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}