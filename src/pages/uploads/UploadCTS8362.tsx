// UploadCTS8362.tsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as signalR from '@microsoft/signalr';
import {
  Box, Button, Paper, Typography, LinearProgress, Alert, Card, CardContent,
  List, ListItem, ListItemIcon, ListItemText, Divider, Dialog,
  DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudDone from '@mui/icons-material/CloudDone';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Chip } from '@mui/material';

interface UploadLog {
  id: number;
  status: 'success' | 'error';
  message: string;
  timestamp: string;
  recordCount?: number;
}

function UploadCTS8362() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadLogs, setUploadLogs] = useState<UploadLog[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7299/hubs/progress')
      .withAutomaticReconnect()
      .build();

    connection.on('UploadProgress', (data) => {
      if (data && data.sessionId === sessionId) {
        const percent = Math.round(data.progress);
        setProgress(percent);
        setUploadStatus(`Đang xử lý dòng ${data.current} / ${data.total}`);
      }
    });

    connection.start().catch(err => console.error('SignalR Connection Error:', err));
  }, [sessionId]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setUploadStatus('Đang tải file lên...');
    const id = crypto.randomUUID();
    setSessionId(id);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('sessionId', id);

    try {
      await axios.post('https://localhost:7299/api/upload/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadStatus('Upload thất bại');
      setProgress(0);
      setUploading(false);
    }
  };

  const handlePauseResume = async () => {
    if (!sessionId) return;
    setIsPaused(!isPaused);

    if (!isPaused) {
      await axios.post('https://localhost:7299/api/upload/pause', sessionId, {
        headers: { 'Content-Type': 'application/json' },
      });
      setUploadStatus('Đã tạm dừng');
    } else {
      await axios.post('https://localhost:7299/api/upload/resume', sessionId, {
        headers: { 'Content-Type': 'application/json' },
      });
      setUploadStatus('Đang tiếp tục xử lý...');
    }
  };

  const handleCancelUpload = async () => {
    if (!sessionId) return;
    setOpenConfirmDialog(false);

    await axios.post('https://localhost:7299/api/upload/cancel', sessionId, {
      headers: { 'Content-Type': 'application/json' },
    });

    setFile(null);
    setUploading(false);
    setUploadStatus('Upload đã bị hủy');
    setProgress(0);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, margin: 'auto' }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Upload CTS 8362
        </Typography>

        <Box display="flex" gap={2} mb={2}>
          <Button
            variant="contained"
            component="label"
            startIcon={<CloudUploadIcon />}
          >
            Chọn File
            <input
              type="file"
              hidden
              onChange={handleFileUpload}
              accept=".xlsx, .xls"
            />
          </Button>

          <Button
            variant="contained"
            color={isPaused ? 'primary' : 'warning'}
            startIcon={isPaused ? <PlayArrowIcon /> : <PauseIcon />}
            onClick={handlePauseResume}
            disabled={!uploading || !sessionId}
          >
            {isPaused ? 'Tiếp tục' : 'Tạm dừng'}
          </Button>

          <Button
            variant="contained"
            color="error"
            startIcon={<StopCircleIcon />}
            onClick={() => setOpenConfirmDialog(true)}
            disabled={!uploading || !sessionId}
          >
            Hủy Upload
          </Button>
        </Box>

        <Button
          variant="contained"
          color="success"
          onClick={handleUpload}
          disabled={!file || uploading}
          startIcon={<CloudDone />}
          fullWidth
        >
          {uploading ? 'Uploading...' : 'Upload và xử lý'}
        </Button>

        {uploading && (
          <Box mt={3}>
            <LinearProgress variant="determinate" value={progress} />
            <Typography variant="body2" mt={1}>{progress}% - {uploadStatus}</Typography>
          </Box>
        )}

        <Dialog open={openConfirmDialog} onClose={() => setOpenConfirmDialog(false)}>
          <DialogTitle>Xác nhận hủy upload</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Bạn có chắc chắn muốn hủy upload không? Dữ liệu đã xử lý sẽ bị rollback.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenConfirmDialog(false)}>Không</Button>
            <Button onClick={handleCancelUpload} color="error">Có, hủy</Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
}

export default UploadCTS8362;
