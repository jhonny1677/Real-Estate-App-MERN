// Browser notification service

class NotificationService {
  constructor() {
    this.permission = Notification.permission;
    this.isSupported = 'Notification' in window;
  }

  async requestPermission() {
    if (!this.isSupported) {
      console.warn('Browser notifications are not supported');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    if (this.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    }

    return false;
  }

  async showNotification(title, options = {}) {
    const hasPermission = await this.requestPermission();
    
    if (!hasPermission) {
      console.warn('Notification permission denied');
      return null;
    }

    const defaultOptions = {
      icon: '/logo.png',
      badge: '/logo.png',
      tag: 'property-alert',
      requireInteraction: false,
      silent: false,
      ...options
    };

    try {
      const notification = new Notification(title, defaultOptions);
      
      // Auto close after 5 seconds if not requiring interaction
      if (!defaultOptions.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 5000);
      }

      return notification;
    } catch (error) {
      console.error('Failed to show notification:', error);
      return null;
    }
  }

  showPriceDropAlert(property, oldPrice, newPrice) {
    const savings = oldPrice - newPrice;
    const percentage = ((savings / oldPrice) * 100).toFixed(1);
    
    return this.showNotification(
      '🚨 Price Drop Alert!',
      {
        body: `${property.title} dropped from $${oldPrice.toLocaleString()} to $${newPrice.toLocaleString()} (${percentage}% off)`,
        icon: property.images?.[0] || '/logo.png',
        tag: `price-drop-${property.id}`,
        requireInteraction: true,
        actions: [
          { action: 'view', title: 'View Property' },
          { action: 'dismiss', title: 'Dismiss' }
        ],
        data: {
          type: 'price-drop',
          propertyId: property.id,
          property: property
        }
      }
    );
  }

  showNewListingAlert(count, properties) {
    const title = count === 1 ? 'New Property Available!' : `${count} New Properties Available!`;
    const body = count === 1 
      ? `${properties[0].title} - $${properties[0].price.toLocaleString()}`
      : `${count} new properties match your preferences`;

    return this.showNotification(title, {
      body,
      icon: properties[0]?.images?.[0] || '/logo.png',
      tag: 'new-listings',
      requireInteraction: true,
      actions: [
        { action: 'view', title: 'View Listings' },
        { action: 'dismiss', title: 'Dismiss' }
      ],
      data: {
        type: 'new-listings',
        properties: properties,
        count: count
      }
    });
  }

  showChatMessageAlert(message, sender) {
    return this.showNotification(
      `New message from ${sender.username}`,
      {
        body: message.text,
        icon: sender.avatar || '/noavatar.jpg',
        tag: `chat-${sender.id}`,
        requireInteraction: false,
        actions: [
          { action: 'reply', title: 'Reply' },
          { action: 'view', title: 'View Chat' }
        ],
        data: {
          type: 'chat',
          senderId: sender.id,
          chatId: message.chatId
        }
      }
    );
  }

  showSavedSearchAlert(searchName, count) {
    return this.showNotification(
      'Saved Search Update',
      {
        body: `${count} new properties found for "${searchName}"`,
        tag: 'saved-search-update',
        requireInteraction: false,
        actions: [
          { action: 'view', title: 'View Results' },
          { action: 'dismiss', title: 'Dismiss' }
        ],
        data: {
          type: 'saved-search',
          searchName: searchName,
          count: count
        }
      }
    );
  }

  // Email notification simulation (in real app, this would call backend API)
  async sendEmailAlert(type, data) {
    console.log('📧 Email alert would be sent:', { type, data });
    
    // Simulate email sending
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Email alert sent successfully'
        });
      }, 1000);
    });
  }

  async sendPriceDropEmail(property, oldPrice, newPrice, userEmail) {
    const emailData = {
      to: userEmail,
      subject: `Price Drop Alert: ${property.title}`,
      property: property,
      oldPrice: oldPrice,
      newPrice: newPrice,
      savings: oldPrice - newPrice,
      percentage: (((oldPrice - newPrice) / oldPrice) * 100).toFixed(1)
    };

    return this.sendEmailAlert('price-drop', emailData);
  }

  async sendNewListingsEmail(properties, userEmail, searchCriteria) {
    const emailData = {
      to: userEmail,
      subject: `${properties.length} New Properties Match Your Search`,
      properties: properties,
      searchCriteria: searchCriteria,
      count: properties.length
    };

    return this.sendEmailAlert('new-listings', emailData);
  }

  async sendWeeklyDigest(properties, userEmail, stats) {
    const emailData = {
      to: userEmail,
      subject: 'Your Weekly Property Digest',
      newProperties: properties.new,
      priceDrops: properties.priceDrops,
      recommendations: properties.recommendations,
      stats: stats
    };

    return this.sendEmailAlert('weekly-digest', emailData);
  }

  // Settings
  getNotificationSettings() {
    const settings = localStorage.getItem('notificationSettings');
    return settings ? JSON.parse(settings) : {
      browser: true,
      email: true,
      priceDrops: true,
      newListings: true,
      chatMessages: true,
      savedSearches: true,
      weeklyDigest: true,
      sound: true
    };
  }

  updateNotificationSettings(settings) {
    localStorage.setItem('notificationSettings', JSON.stringify(settings));
  }

  isNotificationEnabled(type) {
    const settings = this.getNotificationSettings();
    return settings[type] ?? true;
  }

  // Notification click handlers
  setupNotificationHandlers(navigate) {
    if (!this.isSupported) return;

    // Handle notification clicks
    navigator.serviceWorker?.addEventListener('notificationclick', (event) => {
      event.notification.close();
      
      const data = event.notification.data;
      
      switch (data?.type) {
        case 'price-drop':
          if (event.action === 'view') {
            navigate(`/property/${data.propertyId}`);
          }
          break;
        case 'new-listings':
          if (event.action === 'view') {
            navigate('/list');
          }
          break;
        case 'chat':
          if (event.action === 'view' || event.action === 'reply') {
            navigate('/chats');
          }
          break;
        default:
          // Default action - focus window
          window.focus();
      }
    });
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;