import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getRecommendationsBasedOnHistory, getSimilarProperties, detectPriceDrops, getNewListings } from "../lib/recommendations";
import notificationService from "../lib/notificationService";

const RecommendationsContext = createContext();

export const useRecommendations = () => {
  const context = useContext(RecommendationsContext);
  if (!context) {
    throw new Error('useRecommendations must be used within a RecommendationsProvider');
  }
  return context;
};

export const RecommendationsProvider = ({ children }) => {
  const [viewingHistory, setViewingHistory] = useState(() => {
    const saved = localStorage.getItem('viewingHistory');
    return saved ? JSON.parse(saved) : [];
  });

  const [priceAlerts, setPriceAlerts] = useState(() => {
    const saved = localStorage.getItem('priceAlerts');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('notifications');
    return saved ? JSON.parse(saved) : [];
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('viewingHistory', JSON.stringify(viewingHistory));
  }, [viewingHistory]);

  useEffect(() => {
    localStorage.setItem('priceAlerts', JSON.stringify(priceAlerts));
  }, [priceAlerts]);

  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Periodic price checking
  useEffect(() => {
    const checkForPriceUpdates = async () => {
      if (priceAlerts.filter(alert => alert.isActive).length === 0) return;

      try {
        const response = await fetch('/api/posts');
        const currentProperties = await response.json();
        
        if (currentProperties && currentProperties.length > 0) {
          checkPriceDrops(currentProperties);
        }
      } catch (error) {
        console.error('Error checking for price updates:', error);
      }
    };

    // Check every 30 seconds for demo purposes (in production, this would be much less frequent)
    const interval = setInterval(checkForPriceUpdates, 30000);
    
    // Initial check
    checkForPriceUpdates();

    return () => clearInterval(interval);
  }, [priceAlerts]);

  const addToViewingHistory = useCallback((property) => {
    setViewingHistory(prev => {
      // Remove if already exists, then add to beginning
      const filtered = prev.filter(item => item.id !== property.id);
      const newHistory = [{ ...property, viewedAt: new Date().toISOString() }, ...filtered];
      
      // Keep only last 50 items
      return newHistory.slice(0, 50);
    });
  }, []);

  const getPersonalizedRecommendations = (allProperties, favoriteProperties = [], limit = 6) => {
    return getRecommendationsBasedOnHistory(viewingHistory, favoriteProperties, allProperties, limit);
  };

  const getSimilarPropertiesFor = (property, allProperties, limit = 4) => {
    return getSimilarProperties(property, allProperties, limit);
  };

  const addPriceAlert = (property, targetPrice) => {
    const alert = {
      id: Date.now(),
      propertyId: property.id,
      property: property,
      targetPrice: targetPrice,
      currentPrice: property.price,
      createdAt: new Date().toISOString(),
      isActive: true
    };

    setPriceAlerts(prev => [...prev, alert]);
    addNotification({
      type: 'success',
      title: 'Price Alert Created',
      message: `You'll be notified when ${property.title} drops to $${targetPrice.toLocaleString()} or below.`,
      property: property
    });

    // Show browser notification
    if (notificationService.isNotificationEnabled('priceDrops')) {
      notificationService.showNotification(
        'Price Alert Created',
        {
          body: `You'll be notified when ${property.title} drops to $${targetPrice.toLocaleString()} or below.`,
          icon: property.images?.[0] || '/logo.png',
          requireInteraction: false
        }
      );
    }
  };

  const removePriceAlert = (alertId) => {
    setPriceAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const checkPriceDrops = (currentProperties) => {
    const activeAlerts = priceAlerts.filter(alert => alert.isActive);
    const triggeredAlerts = [];

    activeAlerts.forEach(alert => {
      const currentProperty = currentProperties.find(prop => prop.id === alert.propertyId);
      if (currentProperty && currentProperty.price <= alert.targetPrice) {
        triggeredAlerts.push(alert);
        
        // Mark alert as triggered
        setPriceAlerts(prev => prev.map(a => 
          a.id === alert.id ? { ...a, isActive: false, triggeredAt: new Date().toISOString() } : a
        ));

        // Add notification
        addNotification({
          type: 'price-drop',
          title: '🚨 Price Drop Alert!',
          message: `${currentProperty.title} is now $${currentProperty.price.toLocaleString()} (down from $${alert.currentPrice.toLocaleString()})`,
          property: currentProperty,
          important: true
        });

        // Show browser notification
        if (notificationService.isNotificationEnabled('priceDrops')) {
          notificationService.showPriceDropAlert(
            currentProperty,
            alert.currentPrice,
            currentProperty.price
          );

          // Send email notification
          if (notificationService.isNotificationEnabled('email')) {
            notificationService.sendPriceDropEmail(
              currentProperty,
              alert.currentPrice,
              currentProperty.price,
              'user@example.com' // In real app, get from user context
            );
          }
        }
      }
    });

    return triggeredAlerts;
  };

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]); // Keep last 50
  };

  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === notificationId ? { ...notif, read: true } : notif
    ));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const getUnreadNotifications = () => {
    return notifications.filter(notif => !notif.read);
  };

  const simulateNewListings = (allProperties) => {
    // Simulate finding new listings (in real app, this would come from API)
    const newListings = getNewListings(allProperties, 7);
    
    if (newListings.length > 0) {
      addNotification({
        type: 'new-listings',
        title: '🏠 New Properties Available',
        message: `${newListings.length} new properties match your preferences`,
        properties: newListings.slice(0, 3), // Show first 3
        count: newListings.length
      });

      // Show browser notification
      if (notificationService.isNotificationEnabled('newListings')) {
        notificationService.showNewListingAlert(newListings.length, newListings);

        // Send email notification
        if (notificationService.isNotificationEnabled('email')) {
          notificationService.sendNewListingsEmail(
            newListings,
            'user@example.com', // In real app, get from user context
            { city: 'Any', type: 'Any' } // In real app, get from user preferences
          );
        }
      }
    }

    return newListings;
  };

  const getRecommendationStats = () => {
    return {
      viewingHistoryCount: viewingHistory.length,
      activeAlertsCount: priceAlerts.filter(alert => alert.isActive).length,
      unreadNotificationsCount: getUnreadNotifications().length,
      totalNotificationsCount: notifications.length
    };
  };

  const clearViewingHistory = () => {
    setViewingHistory([]);
  };

  const value = {
    // Viewing History
    viewingHistory,
    addToViewingHistory,
    clearViewingHistory,

    // Recommendations
    getPersonalizedRecommendations,
    getSimilarPropertiesFor,

    // Price Alerts
    priceAlerts,
    addPriceAlert,
    removePriceAlert,
    checkPriceDrops,

    // Notifications
    notifications,
    addNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,
    getUnreadNotifications,

    // New Listings
    simulateNewListings,

    // Stats
    getRecommendationStats
  };

  return (
    <RecommendationsContext.Provider value={value}>
      {children}
    </RecommendationsContext.Provider>
  );
};