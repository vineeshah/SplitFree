import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Inbox = () => {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch notifications on component mount
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/notifications', { withCredentials: true });
        setNotifications(response.data || []);
      } catch (error) {
        setError('Failed to fetch notifications. Please try again.');
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, []);

  // Mark a notification as read
  const markAsRead = async (notificationId) => {
    try {
      await axios.post(`http://127.0.0.1:5000/notifications/${notificationId}/read`, {}, { withCredentials: true });
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.id === notificationId ? { ...notification, is_read: true } : notification
        )
      );
    } catch (error) {
      setError('Failed to mark notification as read. Please try again.');
      console.error('Error marking notification as read:', error);
    }
  };

  // Accept a friend request
  const acceptFriendRequest = async (notificationId, friendId) => {
    try {
      const response = await axios.post(
        'http://127.0.0.1:5000/add_friend',
        { friend_id: friendId },
        { withCredentials: true }
      );
      if (response.data.success) {
        setSuccessMessage(response.data.success); // Use the success message from the backend
        await axios.post(`http://127.0.0.1:5000/notifications/${notificationId}/read`, {}, { withCredentials: true });
        markAsRead(notificationId); // Mark the notification as read after accepting
      }
    } catch (error) {
      setError('Failed to accept friend request. Please try again.');
      console.error('Error accepting friend request:', error);
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="text-center text-primary">Inbox</h1>
      <p className="text-center text-muted">View and manage your notifications.</p>

      {/* Error or Success Messages */}
      {error && <p className="text-danger text-center mt-3">{error}</p>}
      {successMessage && <p className="text-success text-center mt-3">{successMessage}</p>}

      {/* Notifications List */}
      <div className="mt-4">
        {notifications.length > 0 ? (
          <ul className="list-group">
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className={`list-group-item d-flex justify-content-between align-items-center ${
                  notification.is_read ? 'bg-light' : ''
                }`}
              >
                <div>
                  <p className="mb-1">{notification.message}</p>
                  <small className="text-muted">{notification.timestamp}</small>
                </div>
                <div>
                  {/* Check if the notification is a friend request based on the message */}
                  {notification.message.includes('friend request') && (
                    <button
                      className="btn btn-success btn-sm me-2"
                      onClick={() => acceptFriendRequest(notification.id, notification.sender_id)}
                    >
                      Accept
                    </button>
                  )}
                  {!notification.is_read && (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => markAsRead(notification.id)}
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-muted">No notifications found.</p>
        )}
      </div>
    </div>
  );
};

export default Inbox;