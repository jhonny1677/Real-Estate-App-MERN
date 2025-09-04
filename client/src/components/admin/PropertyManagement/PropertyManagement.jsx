import { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement } from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import './PropertyManagement.scss';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function PropertyManagement() {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [analytics, setAnalytics] = useState({});
  
  const itemsPerPage = 10;

  useEffect(() => {
    fetchProperties();
    fetchAnalytics();
  }, []);

  useEffect(() => {
    filterAndSortProperties();
  }, [properties, searchTerm, filterStatus, sortBy]);

  const fetchProperties = async () => {
    try {
      // Mock data - replace with actual API call
      const mockProperties = [
        {
          id: 1,
          title: "Luxury Apartment Downtown",
          address: "123 Main St, City",
          price: 450000,
          bedrooms: 2,
          bathrooms: 2,
          sqft: 1200,
          status: "active",
          views: 156,
          inquiries: 12,
          created: "2024-01-15",
          images: ["/property1.jpg"],
          type: "apartment"
        },
        {
          id: 2,
          title: "Modern Villa with Pool",
          address: "456 Oak Ave, Suburb",
          price: 850000,
          bedrooms: 4,
          bathrooms: 3,
          sqft: 2800,
          status: "sold",
          views: 289,
          inquiries: 28,
          created: "2024-01-10",
          images: ["/property2.jpg"],
          type: "house"
        },
        {
          id: 3,
          title: "Cozy Studio Loft",
          address: "789 Pine St, Downtown",
          price: 280000,
          bedrooms: 1,
          bathrooms: 1,
          sqft: 600,
          status: "pending",
          views: 98,
          inquiries: 8,
          created: "2024-01-20",
          images: ["/property3.jpg"],
          type: "apartment"
        },
        {
          id: 4,
          title: "Family Home with Garden",
          address: "321 Elm St, Residential",
          price: 620000,
          bedrooms: 3,
          bathrooms: 2.5,
          sqft: 1900,
          status: "active",
          views: 201,
          inquiries: 15,
          created: "2024-01-18",
          images: ["/property4.jpg"],
          type: "house"
        },
        {
          id: 5,
          title: "Penthouse Suite",
          address: "555 Tower Blvd, City Center",
          price: 1200000,
          bedrooms: 3,
          bathrooms: 3.5,
          sqft: 2200,
          status: "active",
          views: 345,
          inquiries: 22,
          created: "2024-01-12",
          images: ["/property5.jpg"],
          type: "apartment"
        }
      ];
      setProperties(mockProperties);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      // Mock analytics data
      setAnalytics({
        totalProperties: 156,
        activeListings: 89,
        soldThisMonth: 12,
        pendingDeals: 8,
        avgViewsPerProperty: 187,
        conversionRate: 8.3,
        priceByTypeData: {
          labels: ['Apartments', 'Houses', 'Condos', 'Villas'],
          datasets: [{
            label: 'Average Price',
            data: [420000, 680000, 350000, 920000],
            backgroundColor: ['#3498db', '#2ecc71', '#f39c12', '#e74c3c'],
            borderWidth: 0
          }]
        },
        performanceData: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Views',
            data: [2400, 2800, 3200, 2900, 3400, 3800],
            borderColor: '#3498db',
            backgroundColor: 'rgba(52, 152, 219, 0.1)',
            tension: 0.4
          }, {
            label: 'Inquiries',
            data: [180, 220, 250, 210, 280, 320],
            borderColor: '#2ecc71',
            backgroundColor: 'rgba(46, 204, 113, 0.1)',
            tension: 0.4
          }]
        }
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const filterAndSortProperties = () => {
    let filtered = [...properties];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(property => 
        property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(property => property.status === filterStatus);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created) - new Date(a.created);
        case 'oldest':
          return new Date(a.created) - new Date(b.created);
        case 'price-high':
          return b.price - a.price;
        case 'price-low':
          return a.price - b.price;
        case 'views':
          return b.views - a.views;
        default:
          return 0;
      }
    });

    setFilteredProperties(filtered);
    setCurrentPage(1);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      active: 'status-active',
      pending: 'status-pending',
      sold: 'status-sold',
      inactive: 'status-inactive'
    };
    return <span className={`status-badge ${statusClasses[status]}`}>{status.toUpperCase()}</span>;
  };

  const handleDeleteProperty = (propertyId) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      setProperties(properties.filter(p => p.id !== propertyId));
    }
  };

  const handleEditProperty = (property) => {
    setEditingProperty(property);
    setShowAddModal(true);
  };

  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProperties = filteredProperties.slice(startIndex, startIndex + itemsPerPage);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0,0,0,0.1)'
        }
      },
      x: {
        grid: {
          color: 'rgba(0,0,0,0.1)'
        }
      }
    }
  };

  return (
    <div className="property-management">
      {/* Analytics Dashboard */}
      <div className="analytics-section">
        <h2>Property Analytics</h2>
        
        <div className="metrics-row">
          <div className="metric-card">
            <div className="metric-icon">🏠</div>
            <div className="metric-info">
              <h3>{analytics.totalProperties}</h3>
              <p>Total Properties</p>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">✅</div>
            <div className="metric-info">
              <h3>{analytics.activeListings}</h3>
              <p>Active Listings</p>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">💰</div>
            <div className="metric-info">
              <h3>{analytics.soldThisMonth}</h3>
              <p>Sold This Month</p>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">⏳</div>
            <div className="metric-info">
              <h3>{analytics.pendingDeals}</h3>
              <p>Pending Deals</p>
            </div>
          </div>
        </div>

        <div className="charts-row">
          <div className="chart-container">
            <h3>Average Price by Property Type</h3>
            <div className="chart-wrapper">
              {analytics.priceByTypeData && (
                <Doughnut data={analytics.priceByTypeData} options={chartOptions} />
              )}
            </div>
          </div>
          <div className="chart-container">
            <h3>Performance Trends</h3>
            <div className="chart-wrapper">
              {analytics.performanceData && (
                <Line data={analytics.performanceData} options={chartOptions} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Property Management */}
      <div className="management-section">
        <div className="section-header">
          <h2>Property Management</h2>
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            <span className="icon">➕</span>
            Add Property
          </button>
        </div>

        {/* Filters and Search */}
        <div className="filters-bar">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>
          
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="sold">Sold</option>
            <option value="inactive">Inactive</option>
          </select>
          
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price-high">Price: High to Low</option>
            <option value="price-low">Price: Low to High</option>
            <option value="views">Most Viewed</option>
          </select>
        </div>

        {/* Properties Table */}
        <div className="properties-table">
          <table>
            <thead>
              <tr>
                <th>Property</th>
                <th>Price</th>
                <th>Details</th>
                <th>Status</th>
                <th>Performance</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentProperties.map(property => (
                <tr key={property.id}>
                  <td className="property-cell">
                    <div className="property-info">
                      <div className="property-image">
                        <img src={property.images[0] || '/noimage.jpg'} alt={property.title} />
                      </div>
                      <div className="property-details">
                        <h4>{property.title}</h4>
                        <p>{property.address}</p>
                      </div>
                    </div>
                  </td>
                  <td className="price-cell">
                    <strong>{formatCurrency(property.price)}</strong>
                  </td>
                  <td className="details-cell">
                    <div className="property-specs">
                      <span>🛏️ {property.bedrooms}br</span>
                      <span>🚿 {property.bathrooms}ba</span>
                      <span>📐 {property.sqft}sq</span>
                    </div>
                  </td>
                  <td>
                    {getStatusBadge(property.status)}
                  </td>
                  <td className="performance-cell">
                    <div className="performance-stats">
                      <span className="views">👁️ {property.views}</span>
                      <span className="inquiries">💬 {property.inquiries}</span>
                    </div>
                  </td>
                  <td>{formatDate(property.created)}</td>
                  <td className="actions-cell">
                    <div className="action-buttons">
                      <button 
                        className="btn-edit" 
                        onClick={() => handleEditProperty(property)}
                        title="Edit Property"
                      >
                        ✏️
                      </button>
                      <button 
                        className="btn-delete" 
                        onClick={() => handleDeleteProperty(property.id)}
                        title="Delete Property"
                      >
                        🗑️
                      </button>
                      <button 
                        className="btn-view" 
                        onClick={() => window.open(`/property/${property.id}`, '_blank')}
                        title="View Property"
                      >
                        👁️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              ←
            </button>
            <span className="pagination-info">
              Page {currentPage} of {totalPages}
            </span>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="pagination-btn"
            >
              →
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Property Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingProperty ? 'Edit Property' : 'Add New Property'}</h3>
              <button 
                className="modal-close" 
                onClick={() => {
                  setShowAddModal(false);
                  setEditingProperty(null);
                }}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <form className="property-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Property Title</label>
                    <input 
                      type="text" 
                      placeholder="Enter property title"
                      defaultValue={editingProperty?.title || ''}
                    />
                  </div>
                  <div className="form-group">
                    <label>Price</label>
                    <input 
                      type="number" 
                      placeholder="Property price"
                      defaultValue={editingProperty?.price || ''}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input 
                    type="text" 
                    placeholder="Property address"
                    defaultValue={editingProperty?.address || ''}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Bedrooms</label>
                    <input 
                      type="number" 
                      min="0"
                      defaultValue={editingProperty?.bedrooms || ''}
                    />
                  </div>
                  <div className="form-group">
                    <label>Bathrooms</label>
                    <input 
                      type="number" 
                      min="0" 
                      step="0.5"
                      defaultValue={editingProperty?.bathrooms || ''}
                    />
                  </div>
                  <div className="form-group">
                    <label>Square Feet</label>
                    <input 
                      type="number" 
                      min="0"
                      defaultValue={editingProperty?.sqft || ''}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Property Type</label>
                    <select defaultValue={editingProperty?.type || 'apartment'}>
                      <option value="apartment">Apartment</option>
                      <option value="house">House</option>
                      <option value="condo">Condo</option>
                      <option value="villa">Villa</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select defaultValue={editingProperty?.status || 'active'}>
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="sold">Sold</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary" 
                onClick={() => {
                  setShowAddModal(false);
                  setEditingProperty(null);
                }}
              >
                Cancel
              </button>
              <button className="btn-primary">
                {editingProperty ? 'Update Property' : 'Add Property'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PropertyManagement;