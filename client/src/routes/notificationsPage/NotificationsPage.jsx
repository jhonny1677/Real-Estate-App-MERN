import { useState, useEffect } from "react";
import { useRecommendations } from "../../context/RecommendationsContext";
import { useNavigate } from "react-router-dom";
import notificationService from "../../lib/notificationService";
import "./notificationsPage.scss";

function NotificationsPage() {
  const { 
    notifications, 
    getUnreadNotifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead,
    clearNotifications,
    priceAlerts,
    removePriceAlert
  } = useRecommendations();
  
  const [filter, setFilter] = useState('all'); // all, unread, price-drop, new-listings
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true);
  const navigate = useNavigate();

  const unreadNotifications = getUnreadNotifications();
  const unreadCount = unreadNotifications.length;

  // Filter notifications based on selected filter
  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.read;
      case 'price-drop':
        return notification.type === 'price-drop';
      case 'new-listings':
        return notification.type === 'new-listings';
      case 'chat':
        return notification.type === 'chat';
      case 'alerts':
        return notification.type === 'price-drop' || notification.type === 'new-listings';
      default:
        return true;
    }
  });

  // Real-time simulation - check for price changes periodically
  useEffect(() => {
    if (!isRealTimeEnabled) return;

    const interval = setInterval(async () => {
      try {
        // Simulate checking for property updates
        const response = await fetch('/api/posts');
        const properties = await response.json();
        
        // This would normally be handled by the RecommendationsContext
        // but for demonstration, we'll trigger it manually
        console.log('Checking for price drops...');
      } catch (error) {
        console.error('Error checking for updates:', error);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [isRealTimeEnabled]);

  const handleNotificationClick = (notification) => {
    markNotificationAsRead(notification.id);
    
    if (notification.property) {
      navigate(`/property/${notification.property.id}`);
    } else if (notification.properties && notification.properties.length > 0) {
      navigate('/list');
    } else if (notification.type === 'chat') {
      navigate('/chats');
    }
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

  const testNotification = () => {
    notificationService.showNotification(
      'Test Real-time Notification',
      {
        body: 'This is a test of the real-time notification system!',
        requireInteraction: false
      }
    );
  };

  return (
    <div className="notifications-page">
      <div className="page-header">
        <h1>Notifications Center</h1>
        <div className="header-actions">
          <div className="realtime-toggle">
            <label>
              <input
                type="checkbox"
                checked={isRealTimeEnabled}
                onChange={(e) => setIsRealTimeEnabled(e.target.checked)}
              />
              Real-time Updates
            </label>
          </div>
          <button className="test-btn" onClick={testNotification}>
            🧪 Test Notification
          </button>
          <button 
            className="settings-btn"
            onClick={() => navigate('/notification-settings')}
          >
            ⚙️ Settings
          </button>
        </div>
      </div>

      <div className="notifications-stats">
        <div className="stat-card">
          <div className="stat-number">{unreadCount}</div>
          <div className="stat-label">Unread</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{priceAlerts.filter(a => a.isActive).length}</div>
          <div className="stat-label">Active Alerts</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{notifications.filter(n => n.type === 'price-drop').length}</div>
          <div className="stat-label">Price Drops</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{notifications.length}</div>
          <div className="stat-label">Total</div>
        </div>
      </div>

      <div className="notifications-controls">
        <div className="filter-tabs">
          <button 
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All ({notifications.length})
          </button>
          <button 
            className={filter === 'unread' ? 'active' : ''}
            onClick={() => setFilter('unread')}
          >
            Unread ({unreadCount})
          </button>
          <button 
            className={filter === 'alerts' ? 'active' : ''}
            onClick={() => setFilter('alerts')}
          >
            Alerts ({notifications.filter(n => n.type === 'price-drop' || n.type === 'new-listings').length})
          </button>
          <button 
            className={filter === 'chat' ? 'active' : ''}
            onClick={() => setFilter('chat')}
          >
            Messages ({notifications.filter(n => n.type === 'chat').length})
          </button>
        </div>

        <div className="bulk-actions">
          {unreadCount > 0 && (
            <button 
              className="mark-all-read-btn"
              onClick={markAllNotificationsAsRead}
            >
              ✓ Mark All Read
            </button>
          )}
          {notifications.length > 0 && (
            <button 
              className="clear-all-btn"
              onClick={() => {
                if (confirm('Are you sure you want to clear all notifications?')) {
                  clearNotifications();
                }
              }}
            >
              🗑️ Clear All
            </button>
          )}
        </div>
      </div>

      <div className="notifications-content">
        {filteredNotifications.length === 0 ? (
          <div className="empty-notifications">
            <div className="empty-icon">🔔</div>
            <h3>No notifications</h3>
            <p>
              {filter === 'all' 
                ? "You'll receive alerts about price drops and new listings here"
                : `No ${filter} notifications found`
              }
            </p>
            {filter === 'alerts' && (
              <button 
                className="setup-alerts-btn"
                onClick={() => navigate('/list')}
              >
                Set up Price Alerts
              </button>
            )}
          </div>
        ) : (
          <div className="notifications-list">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item ${!notification.read ? 'unread' : ''} ${notification.important ? 'important' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="notification-icon">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="notification-content">
                  <div className="notification-header">
                    <div className="notification-title">
                      {notification.title}
                      {!notification.read && <span className="unread-dot"></span>}
                    </div>
                    <div className="notification-time">
                      {formatTimestamp(notification.timestamp)}
                    </div>
                  </div>
                  <div className="notification-message">
                    {notification.message}
                  </div>
                  {notification.property && (
                    <div className="notification-property">
                      <img 
                        src={notification.property.images?.[0] || "/noimage.jpg"} 
                        alt=""
                        className="property-thumb"
                      />
                      <div className="property-info">
                        <div className="property-title">{notification.property.title}</div>
                        <div className="property-price">${notification.property.price?.toLocaleString()}</div>
                      </div>
                    </div>
                  )}
                  {notification.properties && notification.properties.length > 0 && (
                    <div className="notification-properties">
                      <div className="properties-preview">
                        {notification.properties.slice(0, 3).map((property, index) => (
                          <img 
                            key={index}
                            src={property.images?.[0] || "/noimage.jpg"} 
                            alt=""
                            className="property-thumb-small"
                          />
                        ))}
                        {notification.count > 3 && (
                          <div className="more-properties">+{notification.count - 3}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="notification-actions">
                  <button 
                    className="action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      markNotificationAsRead(notification.id);
                    }}
                    title="Mark as read"
                  >
                    ✓
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Price Alerts Section */}
      {priceAlerts.filter(alert => alert.isActive).length > 0 && (
        <div className="active-alerts-section">
          <h2>Active Price Alerts</h2>
          <div className="alerts-list">
            {priceAlerts.filter(alert => alert.isActive).map((alert) => (
              <div key={alert.id} className="alert-item">
                <div className="alert-property">
                  <img 
                    src={alert.property.images?.[0] || "/noimage.jpg"} 
                    alt=""
                    className="property-thumb"
                  />
                  <div className="alert-info">
                    <div className="property-title">{alert.property.title}</div>
                    <div className="alert-details">
                      Current: ${alert.currentPrice?.toLocaleString()} → Target: ${alert.targetPrice?.toLocaleString()}
                    </div>
                    <div className="alert-created">
                      Created {formatTimestamp(alert.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="alert-actions">
                  <button 
                    className="view-property-btn"
                    onClick={() => navigate(`/property/${alert.propertyId}`)}
                  >
                    View Property
                  </button>
                  <button 
                    className="remove-alert-btn"
                    onClick={() => removePriceAlert(alert.id)}
                    title="Remove alert"
                  >
                    ❌
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationsPage;