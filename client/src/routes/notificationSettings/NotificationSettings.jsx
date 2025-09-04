import { useState, useEffect } from "react";
import notificationService from "../../lib/notificationService";
import "./notificationSettings.scss";

function NotificationSettings() {
  const [settings, setSettings] = useState({
    browser: true,
    email: true,
    priceDrops: true,
    newListings: true,
    chatMessages: true,
    savedSearches: true,
    weeklyDigest: true,
    sound: true
  });
  const [permissions, setPermissions] = useState({
    browser: 'default',
    supported: false
  });
  const [emailAddress, setEmailAddress] = useState('user@example.com');
  const [testResults, setTestResults] = useState({});

  useEffect(() => {
    // Load current settings
    const currentSettings = notificationService.getNotificationSettings();
    setSettings(currentSettings);

    // Check browser notification support and permissions
    setPermissions({
      browser: notificationService.permission,
      supported: notificationService.isSupported
    });
  }, []);

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    notificationService.updateNotificationSettings(newSettings);
  };

  const requestBrowserPermission = async () => {
    const granted = await notificationService.requestPermission();
    setPermissions(prev => ({ ...prev, browser: granted ? 'granted' : 'denied' }));
    
    if (granted) {
      // Test notification
      notificationService.showNotification(
        'Notifications Enabled!',
        {
          body: 'You will now receive browser notifications from Property App',
          requireInteraction: false
        }
      );
    }
  };

  const testNotification = async (type) => {
    setTestResults(prev => ({ ...prev, [type]: 'sending' }));

    try {
      switch (type) {
        case 'browser':
          await notificationService.showNotification(
            'Test Browser Notification',
            {
              body: 'This is a test browser notification',
              requireInteraction: false
            }
          );
          break;

        case 'price-drop':
          const testProperty = {
            id: 'test-1',
            title: 'Test Property',
            images: ['/noimage.jpg']
          };
          await notificationService.showPriceDropAlert(testProperty, 500000, 450000);
          break;

        case 'new-listings':
          const testProperties = [{
            title: 'New Test Property',
            price: 300000,
            images: ['/noimage.jpg']
          }];
          await notificationService.showNewListingAlert(1, testProperties);
          break;

        case 'saved-search':
          await notificationService.showSavedSearchAlert('Downtown Apartments', 3);
          break;

        case 'email':
          const result = await notificationService.sendEmailAlert('test', {
            to: emailAddress,
            subject: 'Test Email Notification',
            message: 'This is a test email notification'
          });
          console.log('Email test result:', result);
          break;
      }

      setTestResults(prev => ({ ...prev, [type]: 'success' }));
      setTimeout(() => {
        setTestResults(prev => ({ ...prev, [type]: null }));
      }, 3000);
    } catch (error) {
      console.error(`Test ${type} notification failed:`, error);
      setTestResults(prev => ({ ...prev, [type]: 'error' }));
      setTimeout(() => {
        setTestResults(prev => ({ ...prev, [type]: null }));
      }, 3000);
    }
  };

  const resetToDefaults = () => {
    const defaultSettings = {
      browser: true,
      email: true,
      priceDrops: true,
      newListings: true,
      chatMessages: true,
      savedSearches: true,
      weeklyDigest: true,
      sound: true
    };
    setSettings(defaultSettings);
    notificationService.updateNotificationSettings(defaultSettings);
  };

  const getPermissionStatus = () => {
    switch (permissions.browser) {
      case 'granted':
        return { text: 'Granted ✅', color: '#28a745', action: null };
      case 'denied':
        return { text: 'Blocked ❌', color: '#dc3545', action: 'Check browser settings to enable' };
      case 'default':
        return { text: 'Not requested ⏳', color: '#ffc107', action: 'Click to request permission' };
      default:
        return { text: 'Unknown', color: '#6c757d', action: null };
    }
  };

  const getTestButtonText = (type) => {
    switch (testResults[type]) {
      case 'sending':
        return '⏳ Testing...';
      case 'success':
        return '✅ Sent!';
      case 'error':
        return '❌ Failed';
      default:
        return '🧪 Test';
    }
  };

  const permissionStatus = getPermissionStatus();

  return (
    <div className="notification-settings">
      <div className="container">
        <div className="header">
          <h1>Notification Settings</h1>
          <p>Manage how and when you receive notifications about properties</p>
        </div>

        {/* Browser Notifications Section */}
        <div className="settings-section">
          <div className="section-header">
            <h2>🌐 Browser Notifications</h2>
            <p>Real-time notifications in your browser</p>
          </div>

          <div className="setting-card">
            <div className="permission-status">
              <div className="status-info">
                <span className="status-label">Permission Status:</span>
                <span 
                  className="status-value" 
                  style={{ color: permissionStatus.color }}
                >
                  {permissionStatus.text}
                </span>
              </div>
              
              {permissions.supported ? (
                <>
                  {permissions.browser !== 'granted' && (
                    <button 
                      className="permission-btn"
                      onClick={requestBrowserPermission}
                    >
                      {permissionStatus.action || 'Request Permission'}
                    </button>
                  )}
                  <button 
                    className="test-btn"
                    onClick={() => testNotification('browser')}
                    disabled={permissions.browser !== 'granted' || testResults.browser === 'sending'}
                  >
                    {getTestButtonText('browser')}
                  </button>
                </>
              ) : (
                <span className="not-supported">❌ Not supported in this browser</span>
              )}
            </div>

            <div className="setting-toggle">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={settings.browser}
                  onChange={(e) => handleSettingChange('browser', e.target.checked)}
                  disabled={permissions.browser !== 'granted'}
                />
                <span className="toggle-slider"></span>
                Enable browser notifications
              </label>
            </div>
          </div>
        </div>

        {/* Email Notifications Section */}
        <div className="settings-section">
          <div className="section-header">
            <h2>📧 Email Notifications</h2>
            <p>Receive notifications via email</p>
          </div>

          <div className="setting-card">
            <div className="email-settings">
              <div className="email-input-group">
                <label>Email Address:</label>
                <div className="email-input-container">
                  <input
                    type="email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    placeholder="Enter your email"
                  />
                  <button 
                    className="test-btn"
                    onClick={() => testNotification('email')}
                    disabled={testResults.email === 'sending'}
                  >
                    {getTestButtonText('email')}
                  </button>
                </div>
              </div>
            </div>

            <div className="setting-toggle">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={settings.email}
                  onChange={(e) => handleSettingChange('email', e.target.checked)}
                />
                <span className="toggle-slider"></span>
                Enable email notifications
              </label>
            </div>
          </div>
        </div>

        {/* Notification Types Section */}
        <div className="settings-section">
          <div className="section-header">
            <h2>🔔 Notification Types</h2>
            <p>Choose which types of notifications to receive</p>
          </div>

          <div className="notification-types">
            <div className="setting-card">
              <div className="setting-info">
                <div className="setting-icon">🚨</div>
                <div className="setting-details">
                  <h4>Price Drop Alerts</h4>
                  <p>Get notified when properties you're watching drop in price</p>
                </div>
                <button 
                  className="test-btn small"
                  onClick={() => testNotification('price-drop')}
                  disabled={testResults['price-drop'] === 'sending'}
                >
                  {getTestButtonText('price-drop')}
                </button>
              </div>
              <div className="setting-toggle">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={settings.priceDrops}
                    onChange={(e) => handleSettingChange('priceDrops', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="setting-card">
              <div className="setting-info">
                <div className="setting-icon">🏠</div>
                <div className="setting-details">
                  <h4>New Listings</h4>
                  <p>Get notified about new properties that match your preferences</p>
                </div>
                <button 
                  className="test-btn small"
                  onClick={() => testNotification('new-listings')}
                  disabled={testResults['new-listings'] === 'sending'}
                >
                  {getTestButtonText('new-listings')}
                </button>
              </div>
              <div className="setting-toggle">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={settings.newListings}
                    onChange={(e) => handleSettingChange('newListings', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="setting-card">
              <div className="setting-info">
                <div className="setting-icon">🔍</div>
                <div className="setting-details">
                  <h4>Saved Search Alerts</h4>
                  <p>Get notified when new properties match your saved searches</p>
                </div>
                <button 
                  className="test-btn small"
                  onClick={() => testNotification('saved-search')}
                  disabled={testResults['saved-search'] === 'sending'}
                >
                  {getTestButtonText('saved-search')}
                </button>
              </div>
              <div className="setting-toggle">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={settings.savedSearches}
                    onChange={(e) => handleSettingChange('savedSearches', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="setting-card">
              <div className="setting-info">
                <div className="setting-icon">💬</div>
                <div className="setting-details">
                  <h4>Chat Messages</h4>
                  <p>Get notified about new messages from agents and other users</p>
                </div>
              </div>
              <div className="setting-toggle">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={settings.chatMessages}
                    onChange={(e) => handleSettingChange('chatMessages', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="setting-card">
              <div className="setting-info">
                <div className="setting-icon">📊</div>
                <div className="setting-details">
                  <h4>Weekly Digest</h4>
                  <p>Receive a weekly summary of market activity and recommendations</p>
                </div>
              </div>
              <div className="setting-toggle">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={settings.weeklyDigest}
                    onChange={(e) => handleSettingChange('weeklyDigest', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Settings */}
        <div className="settings-section">
          <div className="section-header">
            <h2>⚙️ Additional Settings</h2>
          </div>

          <div className="setting-card">
            <div className="setting-info">
              <div className="setting-icon">🔊</div>
              <div className="setting-details">
                <h4>Sound Effects</h4>
                <p>Play sound when receiving notifications</p>
              </div>
            </div>
            <div className="setting-toggle">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={settings.sound}
                  onChange={(e) => handleSettingChange('sound', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="settings-actions">
          <button 
            className="reset-btn"
            onClick={resetToDefaults}
          >
            🔄 Reset to Defaults
          </button>
          <div className="save-status">
            ✅ Settings saved automatically
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotificationSettings;