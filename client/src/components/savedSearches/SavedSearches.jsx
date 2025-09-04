import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import notificationService from "../../lib/notificationService";
import "./savedSearches.scss";

function SavedSearches() {
  const [savedSearches, setSavedSearches] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newSearch, setNewSearch] = useState({
    name: '',
    city: '',
    type: '',
    property: '',
    minPrice: '',
    maxPrice: '',
    notifications: true
  });
  const navigate = useNavigate();

  // Load saved searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedSearches');
    if (saved) {
      setSavedSearches(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage whenever savedSearches changes
  useEffect(() => {
    localStorage.setItem('savedSearches', JSON.stringify(savedSearches));
  }, [savedSearches]);

  // Simulate checking for new results (in real app, this would be a backend job)
  useEffect(() => {
    const interval = setInterval(() => {
      checkForNewResults();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [savedSearches]);

  const checkForNewResults = async () => {
    for (const search of savedSearches) {
      if (search.notifications && search.enabled) {
        // Simulate finding new results (random chance)
        const hasNewResults = Math.random() > 0.7;
        if (hasNewResults) {
          const newCount = Math.floor(Math.random() * 5) + 1;
          
          // Update last results count
          setSavedSearches(prev => 
            prev.map(s => 
              s.id === search.id 
                ? { ...s, lastResultsCount: (s.lastResultsCount || 0) + newCount, lastChecked: new Date().toISOString() }
                : s
            )
          );

          // Show notification
          if (notificationService.isNotificationEnabled('savedSearches')) {
            await notificationService.showSavedSearchAlert(search.name, newCount);
            
            // Also send simulated email
            if (notificationService.isNotificationEnabled('email')) {
              await notificationService.sendEmailAlert('saved-search', {
                searchName: search.name,
                count: newCount,
                properties: [] // In real app, would include actual properties
              });
            }
          }
        }
      }
    }
  };

  const handleCreateSearch = () => {
    if (!newSearch.name.trim()) {
      alert('Please enter a name for your saved search');
      return;
    }

    const searchObj = {
      id: Date.now(),
      ...newSearch,
      createdAt: new Date().toISOString(),
      enabled: true,
      lastResultsCount: 0,
      lastChecked: new Date().toISOString()
    };

    setSavedSearches(prev => [...prev, searchObj]);
    setNewSearch({
      name: '',
      city: '',
      type: '',
      property: '',
      minPrice: '',
      maxPrice: '',
      notifications: true
    });
    setIsCreating(false);

    // Show confirmation
    notificationService.showNotification(
      'Saved Search Created',
      {
        body: `We'll notify you when new properties match "${searchObj.name}"`,
        requireInteraction: false
      }
    );
  };

  const toggleSearchEnabled = (id) => {
    setSavedSearches(prev =>
      prev.map(search =>
        search.id === id ? { ...search, enabled: !search.enabled } : search
      )
    );
  };

  const deleteSearch = (id) => {
    if (confirm('Are you sure you want to delete this saved search?')) {
      setSavedSearches(prev => prev.filter(search => search.id !== id));
    }
  };

  const runSearch = (search) => {
    // Navigate to list page with search parameters
    const params = new URLSearchParams();
    if (search.city) params.set('city', search.city);
    if (search.type) params.set('type', search.type);
    if (search.property) params.set('property', search.property);
    if (search.minPrice) params.set('minPrice', search.minPrice);
    if (search.maxPrice) params.set('maxPrice', search.maxPrice);

    navigate(`/list?${params.toString()}`);
  };

  const formatSearchCriteria = (search) => {
    const criteria = [];
    if (search.city) criteria.push(`City: ${search.city}`);
    if (search.type) criteria.push(`Type: ${search.type}`);
    if (search.property) criteria.push(`Property: ${search.property}`);
    if (search.minPrice) criteria.push(`Min: $${parseInt(search.minPrice).toLocaleString()}`);
    if (search.maxPrice) criteria.push(`Max: $${parseInt(search.maxPrice).toLocaleString()}`);
    return criteria.join(' • ');
  };

  return (
    <div className="saved-searches">
      <div className="saved-searches-header">
        <h2>Saved Searches</h2>
        <button 
          className="create-search-btn"
          onClick={() => setIsCreating(true)}
        >
          ➕ Create Saved Search
        </button>
      </div>

      {isCreating && (
        <div className="create-search-form">
          <div className="form-header">
            <h3>Create New Saved Search</h3>
            <button 
              className="close-btn"
              onClick={() => setIsCreating(false)}
            >
              ✕
            </button>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Search Name *</label>
              <input
                type="text"
                value={newSearch.name}
                onChange={(e) => setNewSearch({...newSearch, name: e.target.value})}
                placeholder="e.g., Downtown Apartments"
                required
              />
            </div>

            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                value={newSearch.city}
                onChange={(e) => setNewSearch({...newSearch, city: e.target.value})}
                placeholder="Enter city"
              />
            </div>

            <div className="form-group">
              <label>Type</label>
              <select
                value={newSearch.type}
                onChange={(e) => setNewSearch({...newSearch, type: e.target.value})}
              >
                <option value="">Any Type</option>
                <option value="buy">Buy</option>
                <option value="rent">Rent</option>
              </select>
            </div>

            <div className="form-group">
              <label>Property Type</label>
              <select
                value={newSearch.property}
                onChange={(e) => setNewSearch({...newSearch, property: e.target.value})}
              >
                <option value="">Any Property</option>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="condo">Condo</option>
                <option value="land">Land</option>
              </select>
            </div>

            <div className="form-group">
              <label>Min Price</label>
              <input
                type="number"
                value={newSearch.minPrice}
                onChange={(e) => setNewSearch({...newSearch, minPrice: e.target.value})}
                placeholder="0"
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Max Price</label>
              <input
                type="number"
                value={newSearch.maxPrice}
                onChange={(e) => setNewSearch({...newSearch, maxPrice: e.target.value})}
                placeholder="No limit"
                min="0"
              />
            </div>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={newSearch.notifications}
                onChange={(e) => setNewSearch({...newSearch, notifications: e.target.checked})}
              />
              <span className="checkbox-custom"></span>
              Send me notifications when new properties match this search
            </label>
          </div>

          <div className="form-actions">
            <button 
              className="cancel-btn"
              onClick={() => setIsCreating(false)}
            >
              Cancel
            </button>
            <button 
              className="create-btn"
              onClick={handleCreateSearch}
            >
              Create Saved Search
            </button>
          </div>
        </div>
      )}

      <div className="searches-list">
        {savedSearches.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No Saved Searches</h3>
            <p>Create a saved search to get notified when new properties match your criteria</p>
          </div>
        ) : (
          savedSearches.map(search => (
            <div key={search.id} className={`search-item ${!search.enabled ? 'disabled' : ''}`}>
              <div className="search-header">
                <div className="search-name">
                  <h4>{search.name}</h4>
                  <div className="search-status">
                    {search.enabled ? (
                      <span className="status-enabled">🟢 Active</span>
                    ) : (
                      <span className="status-disabled">⚫ Paused</span>
                    )}
                  </div>
                </div>
                <div className="search-actions">
                  <button 
                    className="run-search-btn"
                    onClick={() => runSearch(search)}
                    title="Run this search"
                  >
                    🔍
                  </button>
                  <button 
                    className="toggle-btn"
                    onClick={() => toggleSearchEnabled(search.id)}
                    title={search.enabled ? 'Pause notifications' : 'Resume notifications'}
                  >
                    {search.enabled ? '⏸️' : '▶️'}
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => deleteSearch(search.id)}
                    title="Delete saved search"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="search-criteria">
                {formatSearchCriteria(search) || 'All properties'}
              </div>

              <div className="search-stats">
                <div className="stat">
                  <span className="stat-label">Created:</span>
                  <span className="stat-value">
                    {new Date(search.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="stat">
                  <span className="stat-label">Last checked:</span>
                  <span className="stat-value">
                    {new Date(search.lastChecked).toLocaleString()}
                  </span>
                </div>
                <div className="stat">
                  <span className="stat-label">Total matches:</span>
                  <span className="stat-value">{search.lastResultsCount || 0}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Notifications:</span>
                  <span className={`stat-value ${search.notifications ? 'enabled' : 'disabled'}`}>
                    {search.notifications ? '🔔 On' : '🔕 Off'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default SavedSearches;