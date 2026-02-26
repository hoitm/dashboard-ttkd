import React, { useEffect, useState } from "react";
import {
  Button, Card, Chip, Divider, TextField
} from "@mui/material";
import UploadIcon from "@mui/icons-material/Upload";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";

import {
  getSignatureProfile,
  uploadSignatureImage,
  deleteSignatureProfile,
  saveSigningToken,
  getSigningToken
} from "../../services/signApi";

export default function SignatureProfilePage() {
  const [profile, setProfile] = useState(null);     // { id, imageUrl }
  const [token, setToken] = useState(null);         // token ký TH
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [msg, setMsg] = useState("");

  // Load profile + token
  useEffect(() => {
    (async () => {
      const p = await getSignatureProfile();
      const t = await getSigningToken();
      setProfile(p || null);
      setToken(t || null);
    })();
  }, []);

  const handleUploadSignature = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploaded = await uploadSignatureImage(file);
    setProfile(uploaded);
    setMsg("Đã cập nhật chữ ký ✓");
  };

  const handleDelete = async () => {
    await deleteSignatureProfile();
    setProfile(null);
    setMsg("Đã xóa chữ ký ✓");
  };

  const handleSaveToken = async () => {
    const t = await saveSigningToken({ password, otp });
    setToken(t);
    setMsg("Đã lưu token ký ✓");
  };

  return (
    <div className="p-8 grid grid-cols-12 gap-6">

      {/* LEFT */}
      <div className="col-span-12 md:col-span-4 space-y-4">
        <Card className="p-5 space-y-4">
          <div className="text-xl font-semibold flex items-center gap-2 text-sky-700">
            <VerifiedUserIcon /> Cấu hình chữ ký
          </div>
          <Divider />

          {profile ? (
            <>
              <div className="font-semibold text-gray-700">Chữ ký hiện tại</div>
              <img src={profile.imageUrl} alt="" className="border rounded-lg shadow-sm max-h-56 object-contain" />
              
              <Button
                component="label"
                variant="outlined"
                startIcon={<UploadIcon />}
                fullWidth
              >
                Cập nhật chữ ký
                <input type="file" hidden accept="image/*" onChange={handleUploadSignature} />
              </Button>

              <Button
                color="error"
                fullWidth
                startIcon={<DeleteIcon />}
                onClick={handleDelete}
              >
                Xóa chữ ký
              </Button>
            </>
          ) : (
            <>
              <div className="text-gray-600 text-sm">
                Bạn chưa có chữ ký. Hãy upload ảnh PNG/JPG để dùng khi ký tài liệu.
              </div>

              <Card className="border border-dashed p-6 text-center">
                <Button
                  variant="contained"
                  component="label"
                  startIcon={<UploadIcon />}
                >
                  Upload chữ ký
                  <input type="file" hidden accept="image/*" onChange={handleUploadSignature} />
                </Button>
              </Card>
            </>
          )}
        </Card>
      </div>

      {/* RIGHT */}
      <div className="col-span-12 md:col-span-8 space-y-4">
        <Card className="p-5 space-y-4">
          <div className="text-lg font-semibold">Token ký (SmartCA TH mode)</div>

          <div className="text-sm text-gray-600">
            Token cho phép ký nhiều lần mà không phải nhập OTP mỗi lần.
          </div>

          {/* PASSWORD */}
          <TextField
            fullWidth
            type="password"
            label="Mật khẩu SmartCA"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* OTP */}
          <TextField
            fullWidth
            label="OTP (SmartCA gửi về SMS/App)"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />

          <Button
            variant="contained"
            fullWidth
            startIcon={<SaveIcon />}
            onClick={handleSaveToken}
          >
            Lưu Token ký
          </Button>

          {token && (
            <Chip
              label="Token đã lưu ✓"
              color="success"
              className="font-semibold mt-2"
            />
          )}
        </Card>

        {msg && <Chip label={msg} color="primary" className="font-semibold" />}
      </div>
    </div>
  );
}
