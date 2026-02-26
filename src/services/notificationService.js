import axios from 'axios';

const API_URL = 'https://localhost:7299/api/AppOnline';

export const notificationService = {
  // Get notifications for a specific user
  getNotifications: async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/notifications`, {
        params: { userId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    try {
      await axios.put(`${API_URL}/notifications/${notificationId}/read`);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  // Get grid statistics for a notification
  getGridStatistics: async (notificationId) => {
    try {
      const response = await axios.get(`${API_URL}/notifications/${notificationId}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching grid statistics:', error);
      throw error;
    }
  },

  // Subscribe to FCM notifications
  subscribeToNotifications: (userId, onNotification) => {
    // Initialize Firebase Cloud Messaging
    const messaging = firebase.messaging();
    
    // Request permission
    messaging.requestPermission()
      .then(() => {
        // Get token
        return messaging.getToken();
      })
      .then((token) => {
        // Save token to server
        return axios.post(`${API_URL}/fcm/token`, { userId, token });
      })
      .then(() => {
        // Listen for messages
        messaging.onMessage((payload) => {
          onNotification(payload);
        });
      })
      .catch((error) => {
        console.error('Error subscribing to notifications:', error);
      });
  }
}; 