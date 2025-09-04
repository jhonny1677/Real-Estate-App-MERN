import { useState } from "react";
import notificationService from "../../lib/notificationService";
import { useRecommendations } from "../../context/RecommendationsContext";
import "./testNotifications.scss";

function TestNotifications() {
  const [testResults, setTestResults] = useState({});
  const { addPriceAlert, addNotification } = useRecommendations();

  const sampleProperty = {
    id: 'test-property-1',
    title: 'Beautiful Test Apartment',
    price: 450000,
    images: ['/noimage.jpg'],
    address: '123 Test Street, Test City',
    bedroom: 2,
    bathroom: 2
  };

  const runTest = async (testType) => {
    setTestResults(prev => ({ ...prev, [testType]: 'running' }));

    try {
      switch (testType) {
        case 'browser-permission':
          const permission = await notificationService.requestPermission();
          setTestResults(prev => ({ ...prev, [testType]: permission ? 'success' : 'failed' }));
          break;

        case 'basic-notification':
          await notificationService.showNotification(
            'Test Notification',
            {
              body: 'This is a basic test notification',
              requireInteraction: false
            }
          );
          setTestResults(prev => ({ ...prev, [testType]: 'success' }));
          break;

        case 'price-drop-alert':
          await notificationService.showPriceDropAlert(sampleProperty, 500000, 450000);
          setTestResults(prev => ({ ...prev, [testType]: 'success' }));
          break;

        case 'new-listing-alert':
          await notificationService.showNewListingAlert(3, [sampleProperty]);
          setTestResults(prev => ({ ...prev, [testType]: 'success' }));
          break;

        case 'saved-search-alert':
          await notificationService.showSavedSearchAlert('Downtown Apartments', 5);
          setTestResults(prev => ({ ...prev, [testType]: 'success' }));
          break;

        case 'chat-message-alert':
          await notificationService.showChatMessageAlert(
            { text: 'Hello! I\'m interested in your property.', chatId: 'test-chat-1' },
            { id: 'test-user', username: 'John Doe', avatar: '/noavatar.jpg' }
          );
          setTestResults(prev => ({ ...prev, [testType]: 'success' }));
          break;

        case 'email-simulation':
          const result = await notificationService.sendPriceDropEmail(
            sampleProperty,
            500000,
            450000,
            'test@example.com'
          );
          console.log('Email simulation result:', result);
          setTestResults(prev => ({ ...prev, [testType]: 'success' }));
          break;

        case 'add-price-alert':
          addPriceAlert(sampleProperty, 400000);
          setTestResults(prev => ({ ...prev, [testType]: 'success' }));
          break;

        case 'add-in-app-notification':
          addNotification({
            type: 'success',
            title: 'Test In-App Notification',
            message: 'This notification will appear in the notifications dropdown',
            property: sampleProperty
          });
          setTestResults(prev => ({ ...prev, [testType]: 'success' }));
          break;

        case 'notification-settings':
          const settings = notificationService.getNotificationSettings();
          console.log('Current notification settings:', settings);
          alert(`Current Settings:\n${JSON.stringify(settings, null, 2)}`);
          setTestResults(prev => ({ ...prev, [testType]: 'success' }));
          break;

        default:
          throw new Error('Unknown test type');
      }
    } catch (error) {
      console.error(`Test ${testType} failed:`, error);
      setTestResults(prev => ({ ...prev, [testType]: 'failed' }));
    }

    // Clear result after 3 seconds
    setTimeout(() => {
      setTestResults(prev => ({ ...prev, [testType]: null }));
    }, 3000);
  };

  const getButtonText = (testType) => {
    switch (testResults[testType]) {
      case 'running':
        return '⏳ Running...';
      case 'success':
        return '✅ Success!';
      case 'failed':
        return '❌ Failed';
      default:
        return '🧪 Run Test';
    }
  };

  const getButtonClass = (testType) => {
    const result = testResults[testType];
    if (result === 'running') return 'test-btn running';
    if (result === 'success') return 'test-btn success';
    if (result === 'failed') return 'test-btn failed';
    return 'test-btn';
  };

  const testCategories = [
    {
      title: '🔔 Browser Notifications',
      tests: [
        { id: 'browser-permission', name: 'Request Browser Permission', description: 'Ask for notification permission' },
        { id: 'basic-notification', name: 'Basic Notification', description: 'Show a simple browser notification' },
        { id: 'price-drop-alert', name: 'Price Drop Alert', description: 'Show a price drop notification with actions' },
        { id: 'new-listing-alert', name: 'New Listing Alert', description: 'Show new listings notification' },
        { id: 'saved-search-alert', name: 'Saved Search Alert', description: 'Show saved search results notification' },
        { id: 'chat-message-alert', name: 'Chat Message Alert', description: 'Show new chat message notification' }
      ]
    },
    {
      title: '📧 Email Notifications',
      tests: [
        { id: 'email-simulation', name: 'Email Simulation', description: 'Simulate sending email notification (check console)' }
      ]
    },
    {
      title: '📱 In-App Features',
      tests: [
        { id: 'add-price-alert', name: 'Create Price Alert', description: 'Add a price alert for the test property' },
        { id: 'add-in-app-notification', name: 'Add In-App Notification', description: 'Add notification to the dropdown' },
        { id: 'notification-settings', name: 'Check Settings', description: 'View current notification settings' }
      ]
    }
  ];

  return (
    <div className="test-notifications">
      <div className="container">
        <div className="header">
          <h1>🧪 Notification System Test Page</h1>
          <p>Test all notification features to ensure they work correctly</p>
        </div>

        <div className="test-property-card">
          <h3>Test Property Used in Tests:</h3>
          <div className="property-info">
            <img src={sampleProperty.images[0]} alt="Property" className="property-image" />
            <div className="property-details">
              <h4>{sampleProperty.title}</h4>
              <p className="property-address">{sampleProperty.address}</p>
              <p className="property-price">${sampleProperty.price.toLocaleString()}</p>
              <p className="property-specs">{sampleProperty.bedroom} bed • {sampleProperty.bathroom} bath</p>
            </div>
          </div>
        </div>

        {testCategories.map((category, categoryIndex) => (
          <div key={categoryIndex} className="test-category">
            <h2>{category.title}</h2>
            <div className="tests-grid">
              {category.tests.map((test) => (
                <div key={test.id} className="test-card">
                  <div className="test-info">
                    <h4>{test.name}</h4>
                    <p>{test.description}</p>
                  </div>
                  <button
                    className={getButtonClass(test.id)}
                    onClick={() => runTest(test.id)}
                    disabled={testResults[test.id] === 'running'}
                  >
                    {getButtonText(test.id)}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="test-info">
          <div className="info-card">
            <h3>📋 Test Instructions</h3>
            <ol>
              <li><strong>Browser Permission:</strong> Click to request notification permission. This is required for browser notifications.</li>
              <li><strong>Basic Notification:</strong> Shows a simple browser notification to test basic functionality.</li>
              <li><strong>Price Drop Alert:</strong> Shows a formatted price drop notification with action buttons.</li>
              <li><strong>New Listing Alert:</strong> Shows notification about new property listings.</li>
              <li><strong>Saved Search Alert:</strong> Shows notification about saved search results.</li>
              <li><strong>Chat Message Alert:</strong> Shows notification for new chat messages.</li>
              <li><strong>Email Simulation:</strong> Simulates sending an email (check browser console for output).</li>
              <li><strong>Create Price Alert:</strong> Creates a price alert in the system.</li>
              <li><strong>Add In-App Notification:</strong> Adds a notification to the notifications dropdown.</li>
              <li><strong>Check Settings:</strong> Views current notification settings.</li>
            </ol>
          </div>

          <div className="info-card">
            <h3>⚙️ Current System Status</h3>
            <div className="status-grid">
              <div className="status-item">
                <span className="status-label">Browser Support:</span>
                <span className={`status-value ${notificationService.isSupported ? 'supported' : 'not-supported'}`}>
                  {notificationService.isSupported ? '✅ Supported' : '❌ Not Supported'}
                </span>
              </div>
              <div className="status-item">
                <span className="status-label">Current Permission:</span>
                <span className={`status-value permission-${notificationService.permission}`}>
                  {notificationService.permission === 'granted' && '✅ Granted'}
                  {notificationService.permission === 'denied' && '❌ Denied'}
                  {notificationService.permission === 'default' && '⏳ Not Requested'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TestNotifications;