import React, { useState, useEffect } from 'react';
import { 
  List, ListItem, ListItemText, ListItemAvatar, Avatar, 
  Typography, Paper, Divider, Badge, IconButton, 
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  CircularProgress, Card, CardContent
} from '@mui/material';
import { Assessment, FiberManualRecord, Close, Person, AttachMoney } from '@mui/icons-material';
import { format } from 'date-fns';
import viLocale from 'date-fns/locale/vi';
import { mockNotifications } from '../../data/mockNotifications';

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMockData();
  }, []);

  const fetchMockData = async () => {
    try {
      setLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      setSelectedNotification(notification);
      setOpenDialog(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update notification status in the list
      setNotifications(prev => 
        prev.map(n => 
          n.id === notification.id ? { ...n, status: 'read' } : n
        )
      );
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedNotification(null);
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Mock statistics based on notification status
  const getStats = (notification) => {
    return {
      total: 10,
      completed: notification.status === 'read' ? 7 : 3,
      pending: notification.status === 'read' ? 3 : 7
    };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 pb-24">
        <Typography variant="h5" className="pt-4 mb-4 flex items-center gap-2">
          <Assessment className="text-blue-600" />
          Thông báo mới nhất
        </Typography>

        {loading ? (
          <div className="flex justify-center p-4">
            <CircularProgress />
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification, index) => (
              <Card 
                key={notification.id}
                className="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                onClick={() => handleNotificationClick(notification)}
              >
                <CardContent className="!pb-4">
                  <div className="flex items-start gap-4">
                    <Badge 
                      color={notification.status === 'new' ? 'error' : 'success'} 
                      variant="dot"
                      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    >
                      <Avatar className="bg-blue-100">
                        <Person className="text-blue-600" />
                      </Avatar>
                    </Badge>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Typography variant="subtitle1" className="font-semibold">
                          {notification.userName}
                        </Typography>
                        <FiberManualRecord 
                          className={`text-xs ${
                            notification.status === 'new' ? 'text-red-500' : 'text-green-500'
                          }`}
                        />
                      </div>
                      <Typography variant="body2" color="textSecondary" className="mb-1">
                        Mã khách: {notification.customerId}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" className="mb-2">
                        {format(new Date(notification.createdAt), 'dd/MM/yyyy HH:mm', { locale: viLocale })}
                      </Typography>
                      <div className="flex items-center gap-1 text-green-600">
                        <AttachMoney />
                        <Typography variant="subtitle2">
                          {formatMoney(notification.amount)}
                        </Typography>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Notification Detail Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle className="flex justify-between items-center bg-blue-600 text-white">
          <div className="flex items-center gap-2">
            <Person />
            <Typography variant="h6">Chi tiết thông báo</Typography>
          </div>
          <IconButton onClick={handleCloseDialog} className="text-white">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent className="!p-0">
          {selectedNotification && (
            <div>
              {/* User Info Section */}
              <div className="p-4 bg-blue-50">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16 bg-blue-200">
                    <Person className="text-blue-600 text-3xl" />
                  </Avatar>
                  <div>
                    <Typography variant="h6" className="mb-1">
                      {selectedNotification.userName}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Mã khách: {selectedNotification.customerId}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {format(new Date(selectedNotification.createdAt), 'dd/MM/yyyy HH:mm', { locale: viLocale })}
                    </Typography>
                  </div>
                </div>
              </div>

              {/* Amount Section */}
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <Typography variant="subtitle1">Số tiền cần gia hạn:</Typography>
                  <Typography variant="h6" className="text-green-600">
                    {formatMoney(selectedNotification.amount)}
                  </Typography>
                </div>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-3 gap-px bg-gray-200">
                <div className="p-4 bg-white text-center">
                  <Typography variant="h4" color="primary" className="mb-1">
                    {getStats(selectedNotification).total}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Tổng phiếu
                  </Typography>
                </div>
                <div className="p-4 bg-white text-center">
                  <Typography variant="h4" className="text-green-600 mb-1">
                    {getStats(selectedNotification).completed}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Đã xử lý
                  </Typography>
                </div>
                <div className="p-4 bg-white text-center">
                  <Typography variant="h4" className="text-red-600 mb-1">
                    {getStats(selectedNotification).pending}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Chưa xử lý
                  </Typography>
                </div>
              </div>

              {/* Transaction History */}
              <div className="p-4">
                <Typography variant="h6" className="mb-3">
                  Lịch sử giao dịch
                </Typography>
                <div className="space-y-3">
                  {selectedNotification.history?.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-2 h-2 rounded-full ${
                        item.status === 'completed' ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <div className="flex-1">
                        <Typography variant="body2" className="font-medium">
                          {item.action}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {format(new Date(item.timestamp), 'dd/MM/yyyy HH:mm', { locale: viLocale })}
                        </Typography>
                      </div>
                      <Typography variant="body2" className={
                        item.status === 'completed' ? 'text-green-600' : 'text-red-600'
                      }>
                        {item.status === 'completed' ? 'Hoàn thành' : 'Chờ xử lý'}
                      </Typography>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotificationList; 