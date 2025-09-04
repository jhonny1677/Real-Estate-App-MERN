import { useState, useRef, useEffect } from "react";
import { useRecommendations } from "../../context/RecommendationsContext";
import { useNavigate } from "react-router-dom";
import notificationService from "../../lib/notificationService";
import "./notifications.scss";

function Notifications() {
  const { 
    notifications, 
    getUnreadNotifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead,
    clearNotifications 
  } = useRecommendations();
  
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const unreadNotifications = getUnreadNotifications();
  const unreadCount = unreadNotifications.length;

  // Setup notification service and browser notifications
  useEffect(() => {
    // Request notification permission
    notificationService.requestPermission();
    
    // Setup notification click handlers
    notificationService.setupNotificationHandlers(navigate);
  }, [navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notification) => {
    markNotificationAsRead(notification.id);
    
    if (notification.property) {
      navigate(`/property/${notification.property.id}`);
    } else if (notification.properties && notification.properties.length > 0) {
      navigate('/list');
    }
    
    setIsOpen(false);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'price-drop': return '🚨';
      case 'new-listings': return '🏠';
      case 'saved-search': return '🔍';
      case 'chat': return '💬';
      case 'success': return '✅';
      case 'info': return 'ℹ️';
      default: return '🔔';
    }
  };

  const testBrowserNotification = () => {
    // Test browser notification
    notificationService.showNotification(
      'Test Notification',
      {
        body: 'This is a test notification from your property app!',
        requireInteraction: false
      }
    );
  };

  const checkNotificationSettings = () => {
    const settings = notificationService.getNotificationSettings();
    const permissionStatus = notificationService.permission;
    
    alert(`Notification Settings:
Browser Permission: ${permissionStatus}
Browser Notifications: ${settings.browser ? 'Enabled' : 'Disabled'}
Email Notifications: ${settings.email ? 'Enabled' : 'Disabled'}
Price Drop Alerts: ${settings.priceDrops ? 'Enabled' : 'Disabled'}
New Listing Alerts: ${settings.newListings ? 'Enabled' : 'Disabled'}
    `);
  };

  return (
    <div className="notifications-container" ref={dropdownRef}>
      <button 
        className="notifications-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notifications-dropdown">
          <div className="notifications-header">
            <h3>Notifications</h3>
            <div className="header-actions">
              <button 
                className="test-notification-btn"
                onClick={testBrowserNotification}
                title="Test browser notification"
              >
                🧪
              </button>
              <button 
                className="settings-btn"
                onClick={checkNotificationSettings}
                title="Check notification settings"
              >
                ⚙️
              </button>
              {unreadCount > 0 && (
                <button 
                  className="mark-all-read-btn"
                  onClick={markAllNotificationsAsRead}
                  title="Mark all as read"
                >
                  ✓ All
                </button>
              )}
              {notifications.length > 0 && (
                <button 
                  className="clear-all-btn"
                  onClick={clearNotifications}
                  title="Clear all"
                >
                  🗑️
                </button>
              )}
            </div>
          </div>

          <div className="notifications-list">
            {notifications.length === 0 ? (
              <div className="empty-notifications">
                <div className="empty-icon">🔔</div>
                <p>No notifications yet</p>
                <small>You'll receive alerts about price drops and new listings here</small>
              </div>
            ) : (
              notifications.slice(0, 10).map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.read ? 'unread' : ''} ${notification.important ? 'important' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-content">
                    <div className="notification-title">
                      {notification.title}
                      {!notification.read && <span className="unread-dot"></span>}
                    </div>
                    <div className="notification-message">
                      {notification.message}
                    </div>
                    <div className="notification-time">
                      {formatTimestamp(notification.timestamp)}
                    </div>
                  </div>
                  {notification.property && (
                    <div className="notification-property">
                      <img 
                        src={notification.property.images?.[0] || "/noimage.jpg"} 
                        alt=""
                        className="property-thumb"
                      />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {notifications.length > 10 && (
            <div className="notifications-footer">
              <button className="view-all-btn">
                View all {notifications.length} notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Notifications;