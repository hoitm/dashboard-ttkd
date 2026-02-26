// File: src/pages/UploadCts.jsx
import React, { useState } from 'react';
import { UploadCloud, Image, File, Loader2 } from 'lucide-react';


export default function UploadCts() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const uploaded = e.target.files[0];
    if (uploaded) {
      setFile(uploaded);
      setPreview(URL.createObjectURL(uploaded));
    }
  };

  const handleUpload = () => {
    if (!file) return;
    setLoading(true);
    setTimeout(() => {
      alert('Upload thành công!');
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 shadow-xl rounded-3xl p-8 space-y-6">
        <div className="flex items-center gap-3">
          <UploadCloud size={32} className="text-blue-600 dark:text-blue-400" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Tải lên file CTV cực chất ✨</h1>
        </div>

        <div className="flex flex-col items-center gap-4 border-2 border-dashed border-blue-300 dark:border-blue-500 rounded-xl p-6 bg-blue-50 dark:bg-gray-800">
          <input type="file" accept="image/*,.pdf,.xlsx" onChange={handleFileChange} className="hidden" id="upload-input" />
          <label htmlFor="upload-input" className="cursor-pointer flex flex-col items-center gap-2 text-blue-600 dark:text-blue-300">
            <File size={36} />
            <span>Chọn file từ thiết bị</span>
          </label>
          {preview && (
            <div className="w-full max-h-80 overflow-hidden rounded-xl">
              <img src={preview} alt="Preview" className="object-contain w-full" />
            </div>
          )}
        </div>

        <button
          onClick={handleUpload}
          disabled={loading || !file}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <UploadCloud size={20} />}
          {loading ? 'Đang tải lên...' : 'Tải lên ngay'}
        </button>
      </div>
    </div>
  );
}
