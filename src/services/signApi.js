// src/services/signApi.js
// Các hàm gọi API backend .NET 8 cho chức năng ký số
import axios from "axios";

export async function uploadPdfFile(file) {
  const form = new FormData();
  form.append("file", file);

  const res = await axios.post("/api/sign/files", form);
  return res.data; // expected: { fileId, fileName }
}

export async function uploadSignatureImage_old(file) {
  const form = new FormData();
  form.append("file", file);

  const res = await axios.post("/api/sign/signature-image", form);
  return res.data; // expected: { id, fileName }
}

export async function getUserCertificates_olds() {
  const res = await axios.get("/api/sign/certificates");
  // expected: [{ serial, subject, ... }]
  return res.data;
}

export async function aiDetectRegion_old(fileId) {
  const res = await axios.get(`/api/sign/ai-detect/${fileId}`);
  // expected: [{ page, x, y, width, height }]
  return res.data;
}

export async function startSign_old(payload) {
  const res = await axios.post("/api/sign/start", payload);
  // expected: { needConfirm, transactionId, signedFilePath? }
  return res.data;
}

export async function confirmSign_old(payload) {
  const res = await axios.post("/api/sign/confirm", payload);
  // expected: { signedFilePath }
  return res.data;
}

// src/services/signApi.js
//import axios from "axios";

/* =============================
   UPLOAD ANY FILE (PDF, DOCX, XLSX)
   Backend convert to PDF
============================= */
export async function uploadFileAny(file) {
  const form = new FormData();
  form.append("file", file);

  const res = await axios.post("/api/sign/upload-any", form);
  return res.data; 
  // expected: { fileId, fileName, pdfUrl, pages }
}

/* =============================
   UPLOAD SIGNATURE IMAGE
============================= */
export async function uploadSignatureImage(file) {
  const form = new FormData();
  form.append("file", file);

  const res = await axios.post("/api/sign/profile/upload", form);
  return res.data; // { id, imageUrl }
}

/* =============================
   GET SIGNATURE PROFILE
============================= */
export async function getSignatureProfile() {
  const res = await axios.get("/api/sign/profile");
  return res.data; // null or { id, imageUrl }
}

/* =============================
   DELETE SIGNATURE PROFILE
============================= */
export async function deleteSignatureProfile() {
  await axios.delete("/api/sign/profile");
}

/* =============================
   GET CERTIFICATES
============================= */
export async function getUserCertificates() {
  const res = await axios.get("/api/sign/certificates");
  return res.data; // list
}

/* =============================
   AI DETECT SIGNING REGIONS
============================= */
export async function aiDetectRegion(fileId) {
  const res = await axios.get(`/api/sign/ai-detect/${fileId}`);
  return res.data; // [{ page, x, y, width, height }]
}

/* =============================
   START SIGN
============================= */
export async function startSign(payload) {
  const res = await axios.post("/api/sign/start", payload);
  return res.data;
}

/* =============================
   CONFIRM SIGN (SmartCA TH)
============================= */
export async function confirmSign(payload) {
  const res = await axios.post("/api/sign/confirm", payload);
  return res.data; // { signedFilePath }
}

/* =============================
   SIGNING TOKEN (TH MODE)
============================= */
export async function saveSigningToken(payload) {
  const res = await axios.post("/api/sign/profile/token", payload);
  return res.data;
}

export async function getSigningToken() {
  const res = await axios.get("/api/sign/profile/token");
  return res.data;
}
