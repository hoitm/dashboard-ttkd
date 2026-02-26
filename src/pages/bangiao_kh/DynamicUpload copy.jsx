import React, { useEffect, useState, useContext  } from "react";
import { suggestColumns, downloadTemplate, uploadThueBao, getUploadLogs, getEffective,downloadErrorFile 
  ,sourceUrl ,errorUrl,
  downloadSourceFile,
  downloadErrorFile1,
  downloadSuccessFile,
} from "../bangiao_kh/upload";
import { Button, Card, Chip, TextField, Snackbar, Alert, CircularProgress,Box,IconButton,Tooltip  } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DescriptionIcon from "@mui/icons-material/Description";
import { AuthContext } from '../../auth/AuthProvider';
 import TaskAltIcon from "@mui/icons-material/TaskAlt";
import BugReportIcon from "@mui/icons-material/BugReport";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";

const ALLOWED = [
  "LOAI_HD","MA_HD","NGAYLAP_HD","SO_DT","sdt_kh","SO_GT","LOAI_GT","TEN_TT" ,"CO_HS", "GHI_CHU",

  "Ma_TB" , "Dich_vu" , "Ten_KH","Diachi_KH",	
  "Bo_hop_dong","Giay_to","GPKD",	"BBNT","PL_hopdong",
  "Cac_giayto_khac","PHIEU_DKSD_VTCI",	"GTTT_CH_VTCI"		,"GCN_HN"	
];
export const openLink = (url) => window.open(url, "_blank", "noopener,noreferrer");
export const openExternal = (url) => window.open(url, "_blank", "noopener,noreferrer");

export default function DynamicUpload(){
  const [unit, setUnit] = useState("");
  const [maTT, setMaTT]   = useState("");
  const [columns, setColumns] = useState([   "Ma_TB" , "Dich_vu" , "Ten_KH","Diachi_KH",	
  "Bo_hop_dong","Giay_to","GPKD",	"BBNT","PL_hopdong",
  "Cac_giayto_khac","PHIEU_DKSD_VTCI",	"GTTT_CH_VTCI"		,"GCN_HN"	 ]);
  const [file, setFile]   = useState(null);
  const [busy, setBusy]   = useState(false);
  const [logs, setLogs]   = useState([]);
  const [eff, setEff]     = useState([]);
  const [msg, setMsg]     = useState(null);
 const { userInfo, logout } = useContext(AuthContext);
  const toggle = (c)=> setColumns(s => s.includes(c) ? s.filter(x=>x!==c) : [...s, c]);

  useEffect(()=>{ loadLogs(); },[]);
  async function loadLogs(){ setLogs(await getUploadLogs()); }

  const handleSuggest = async ()=>{
    const r = await suggestColumns({ unit: unit || undefined, ma_tt: maTT || undefined });
    const cols = (r?.columns || []).filter(c => ALLOWED.includes(c));
    if (cols.length) setColumns(cols);
    setMsg({type:"success", text:"Đã gợi ý: "+ (cols.join(", ")||"(trống)")});
  };

  const handleTemplate = async ()=>{
    const blob = await downloadTemplate(["THUEBAO_ID", ...columns]);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "template_upload_thuebao.xlsx";
    a.click(); URL.revokeObjectURL(a.href);
  };

  const handleUpload = async ()=>{
    const ten_nv = userInfo.ten_nv;
    console.log(ten_nv);
    if (!file){ setMsg({type:"error", text:"Chọn file trước đã!"}); return; }
    setBusy(true);
    try{
      const res = await uploadThueBao({ file, columns, createdBy: "web-ui", ten_nv: ten_nv});
      setMsg({type:"success", text:`OK: ${res.success}/${res.totalRows}, lỗi: ${res.errors}`});


      if (res.batchId && res.errors > 0) {
  await downloadErrorFile(res.batchId);  // tải luôn, không chuyển route
}
   /*
       if (res.errorFile) {
  // Cách 1: mở absolute URL do API trả (đúng cổng 7299)
      const a = document.createElement("a");
      a.href = res.errorFile;
      a.download = ""; // để browser tải xuống
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    // Hoặc Cách 2: dùng endpoint force download qua /api (đỡ lệ thuộc host/port)
    if (res.batchId) {
      window.location.href = `/api/bangiao-upload/error-file/${res.batchId}`;
    }
   */
      await loadLogs();
      const e = await getEffective({ unit: unit || undefined, ma_tt: maTT || undefined, top: 20 });
      setEff(e);
    }catch(e){ setMsg({type:"error", text: e?.response?.data || String(e)}); }
    finally{ setBusy(false); }
  };


  return (
        <Box sx={{   pb:8}}>
         
     <div className="p-4 space-y-3 pb-8">
      <Card className="p-3 space-y-3">
        <div className="font-semibold text-lg">UPLOAD THEO TẬP – Thuê bao</div>
        <div className="grid grid-cols-12 gap-3">
          <TextField label="Đơn vị (TEN_DV_TT)" value={unit} onChange={e=>setUnit(e.target.value)} size="small" className="col-span-12 md:col-span-4" />
          <TextField label="MA_TT (tùy chọn)" value={maTT} onChange={e=>setMaTT(e.target.value)} size="small" className="col-span-12 md:col-span-4" />
          <Button variant="outlined" onClick={handleSuggest} className="col-span-6 md:col-span-2">Gợi ý cột</Button>
          <Button variant="outlined" startIcon={<DescriptionIcon/>} onClick={handleTemplate} className="col-span-6 md:col-span-2">Tải template</Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {ALLOWED.map(c=>(
            <Chip key={c}
              label={c}
              color={columns.includes(c) ? "primary" : "default"}
              variant={columns.includes(c) ? "filled" : "outlined"}
              onClick={()=>toggle(c)}
            />
          ))}
        </div>

        <div className="flex items-center gap-3">
          <input type="file" accept=".xlsx,.xls" onChange={e=>setFile(e.target.files?.[0]||null)} />
          <Button variant="contained" startIcon={<CloudUploadIcon/>} onClick={handleUpload} disabled={busy}>
            {busy ? <CircularProgress size={18}/> : "Upload & Insert patch"}
          </Button>
        </div>
      </Card>
 
<Card className="p-3">
  <div className="font-semibold mb-2">Nhật ký gần đây</div>
  <div className="overflow-auto rounded-lg border border-slate-200">
    <table className="min-w-full text-sm">
      <thead className="sticky top-0 z-10">
        <tr className="bg-gradient-to-r from-slate-50 via-indigo-50 to-slate-50 border-b-2 border-slate-200 shadow-[inset_0_-1px_0_rgba(0,0,0,0.04)]">
          {[
            "Thời gian",
            "Người upload",
            "Batch",
            "File gốc",
           
            "Tổng",
            "OK",
            "Lỗi",
            "Tải nhanh", "Cột",
          ].map((h) => (
            <th
              key={h}
              className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-600 whitespace-nowrap"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {(logs || []).map((l, i) => {
          const allOk =
            (l?.SuccessCount ?? 0) > 0 &&
            (l?.ErrorCount ?? 0) === 0 &&
            l?.SuccessCount === l?.RowCount;

          const someErr = (l?.ErrorCount ?? 0) > 0;

          const rowCls = allOk
            ? "bg-emerald-50/70 hover:bg-emerald-100 border-l-4 border-emerald-400"
            : someErr
            ? "hover:bg-rose-50"
            : "hover:bg-gray-50";

          const createdAt = (l?.CreatedAt || "")
            .toString()
            .replace("T", " ")
            .slice(0, 19);

          return (
            <tr key={i} className={`border-b ${rowCls}`}>
              <td className="py-2 px-4 whitespace-nowrap">{createdAt}</td>
              <td className="py-2 px-4 whitespace-nowrap">{l?.ten_nv}</td>

              {/* BatchId -> tải file gốc khi bấm */}
              <td className="py-2 px-4">
                <button
                  type="button"
                  className="text-blue-600 hover:underline"
                  onClick={() => downloadSourceFile(l?.BatchId)}
                >
                  {l?.BatchId}
                </button>
              </td>

              {/* File gốc -> cũng cho tải file gốc */}
              <td className="py-2 px-4">
                <button
                  type="button"
                  className="text-blue-600 hover:underline"
                  onClick={() => downloadSourceFile(l?.BatchId)}
                  title="Tải file gốc đã upload"
                >
                  {l?.FileName}
                </button>
              </td>

            

              <td className="py-2 px-4 text-right whitespace-nowrap">
                {l?.RowCount?.toLocaleString?.() ?? l?.RowCount}
              </td>

              {/* OK: nếu allOk => chip xanh nổi bật & bấm để tải success.xlsx */}
              <td className="py-2 px-4 text-center">
                <Chip
                  size="small"
                  label={l?.SuccessCount}
                  icon={<TaskAltIcon fontSize="small" />}
                  color={allOk ? "success" : "default"}
                  variant={allOk ? "filled" : "outlined"}
                  onClick={() =>
                    l?.SuccessCount > 0 && downloadSuccessFile(l?.BatchId)
                  }
                  clickable={l?.SuccessCount > 0}
                />
              </td>

              {/* Lỗi: có thì chip đỏ & bấm tải errors.xlsx */}
              <td className="py-2 px-4 text-center">
                <Chip
                  size="small"
                  label={l?.ErrorCount}
                  icon={<BugReportIcon fontSize="small" />}
                  color={someErr ? "error" : "default"}
                  variant={someErr ? "filled" : "outlined"}
                  onClick={() =>
                    l?.ErrorCount > 0 && downloadErrorFile(l?.BatchId)
                  }
                  clickable={l?.ErrorCount > 0}
                />
              </td>

              {/* Tải nhanh: 3 nút nhỏ */}
              <td className="py-2 px-4">
                <div className="flex items-center gap-1">
                  <Tooltip title="Tải file gốc">
                    <span>
                      <IconButton
                        size="small"
                        onClick={() => downloadSourceFile(l?.BatchId)}
                      >
                        <InsertDriveFileIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>

                  <Tooltip title="Tải success.xlsx">
                    <span>
                      <IconButton
                        size="small"
                        onClick={() => downloadSuccessFile(l?.BatchId)}
                        disabled={!l?.SuccessCount}
                      >
                        <TaskAltIcon
                          fontSize="small"
                          color={l?.SuccessCount ? "success" : "disabled"}
                        />
                      </IconButton>
                    </span>
                  </Tooltip>

                  <Tooltip title="Tải errors.xlsx">
                    <span>
                      <IconButton
                        size="small"
                        onClick={() => downloadErrorFile(l?.BatchId)}
                        disabled={!l?.ErrorCount}
                      >
                        <FileDownloadOutlinedIcon
                          fontSize="small"
                          color={l?.ErrorCount ? "error" : "disabled"}
                        />
                      </IconButton>
                    </span>
                  </Tooltip>
                </div>
              </td>
                <td
                className="py-2 px-4 max-w-[420px] truncate"
                title={l?.Columns}
              >
                {l?.Columns}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>

  
</Card>
  {/*
     <Card className="p-3">
        <div className="font-semibold mb-2">Nhật ký gần đây</div>
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead><tr className="bg-gradient-to-r from-slate-50 via-indigo-50 to-slate-50 border-b-2 border-slate-200 shadow-[inset_0_-1px_0_rgba(0,0,0,0.04)]">
              <th className="uppercase py-2 pr-4">Thời gian</th>
              <th className=" uppercase py-2 pr-4">người upload</th>
              <th className="uppercase py-2 pr-4">Batch</th>
              <th className=" uppercase py-2 pr-4">File Gốc</th>
              <th className="uppercase py-2 pr-4">Cột</th>
              <th className="uppercase py-2 pr-4">Tổng</th>
              <th className="uppercase py-2 pr-4">OK</th>
              <th className="uppercase py-2 pr-4">Lỗi</th>
            </tr></thead>
            <tbody>
              {(logs||[]).map((l,i)=>(

                
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="py-2 pr-4">{(l.CreatedAt||"").toString().replace("T"," ").slice(0,19)}</td>
                  <td className="py-2 pr-4">{l.ten_nv}</td>

                  <td className="py-2 pr-4">
                   <button
                  type="button"
                  className="text-blue-600 hover:underline"
                  onClick={() => downloadErrorFile1(l.BatchId)}
                >
                  {l.BatchId}
                </button>
                
                  </td>
                  <td className="py-2 pr-4">
                   <button
                  type="button"
                  className="text-blue-600 hover:underline"
                  onClick={() => downloadSourceFile(l.BatchId)}
                >
                  {l.FileName}
                </button>
                  
                  </td>
                  <td className="py-2 pr-4 max-w-[420px] truncate">{l.Columns}</td>
                  <td className="py-2 pr-4">{l.RowCount}</td>
                  <td className="py-2 pr-4 text-emerald-700 font-semibold">{l.SuccessCount}</td>
                  <td className="py-2 pr-4 text-red-600 font-semibold">{l.ErrorCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
  */}
     

      {eff?.length>0 && (
        <Card className="p-3">
          <div className="font-semibold mb-2">Bản ghi hiệu lực (top 20)</div>
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead><tr className="border-b">
                <th className="py-2 pr-4">THUEBAO_ID</th>
                <th className="py-2 pr-4">MA_HD</th>
                <th className="py-2 pr-4">SO_GT</th>
                <th className="py-2 pr-4">NGAYLAP_HD</th>
                <th className="py-2 pr-4">SO_DT</th>
                <th className="py-2 pr-4">TEN_TT</th>
                <th className="py-2 pr-4">PatchAt</th>
              </tr></thead>
              <tbody>
                {eff.map((r,i)=>(
                  <tr key={i} className="border-b">
                    <td className="py-2 pr-4">{r.THUEBAO_ID}</td>
                    <td className="py-2 pr-4">{r.MA_HD}</td>
                    <td className="py-2 pr-4">{r.SO_GT}</td>
                    <td className="py-2 pr-4">{(r.NGAYLAP_HD||"").slice?.(0,10)}</td>
                    <td className="py-2 pr-4">{r.SO_DT}</td>
                    <td className="py-2 pr-4">{r.TEN_TT}</td>
                    <td className="py-2 pr-4">{(r.PatchInsertedAt||"").toString().replace("T"," ").slice(0,19)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Snackbar open={!!msg} autoHideDuration={4000} onClose={()=>setMsg(null)}>
        <Alert onClose={()=>setMsg(null)} severity={msg?.type || "info"}>{msg?.text}</Alert>
      </Snackbar>
    </div>  </Box>   
  );
  
}
