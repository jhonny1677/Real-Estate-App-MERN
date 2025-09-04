import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import PropertyManagement from '../../components/admin/PropertyManagement/PropertyManagement';
import UserManagement from '../../components/admin/UserManagement/UserManagement';
import ContentManagement from '../../components/admin/ContentManagement/ContentManagement';
import Analytics from '../../components/admin/Analytics/Analytics';
import './adminDashboard.scss';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState({
    totalProperties: 0,
    totalUsers: 0,
    totalViews: 0,
    totalRevenue: 0,
    recentActivities: []
  });
  
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // Check if user is admin
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/');
    }
  }, [currentUser, navigate]);

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Mock data - replace with actual API calls
      setDashboardData({
        totalProperties: 2847,
        totalUsers: 15432,
        totalViews: 847392,
        totalRevenue: 2847392,
        recentActivities: [
          { id: 1, type: 'property', action: 'New property listed', time: '2 mins ago', user: 'John Doe' },
          { id: 2, type: 'user', action: 'New user registered', time: '5 mins ago', user: 'Jane Smith' },
          { id: 3, type: 'sale', action: 'Property sold', time: '1 hour ago', user: 'Mike Johnson' },
          { id: 4, type: 'inquiry', action: 'New inquiry received', time: '2 hours ago', user: 'Sarah Wilson' },
        ]
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(num);
  };

  const getActivityIcon = (type) => {
    const icons = {
      property: '🏠',
      user: '👤',
      sale: '💰',
      inquiry: '💬'
    };
    return icons[type] || '📊';
  };

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="admin-access-denied">
        <h2>Access Denied</h2>
        <p>You don't have permission to access the admin dashboard.</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <div className="user-info">
          <span>Welcome back, {currentUser.username}</span>
          <div className="user-avatar">
            <img src={currentUser.avatar || '/noavatar.jpg'} alt="Admin" />
          </div>
        </div>
      </div>

      <div className="dashboard-nav">
        <button 
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={activeTab === 'properties' ? 'active' : ''}
          onClick={() => setActiveTab('properties')}
        >
          🏠 Properties
        </button>
        <button 
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
        >
          👥 Users
        </button>
        <button 
          className={activeTab === 'content' ? 'active' : ''}
          onClick={() => setActiveTab('content')}
        >
          📝 Content
        </button>
        <button 
          className={activeTab === 'analytics' ? 'active' : ''}
          onClick={() => setActiveTab('analytics')}
        >
          📈 Analytics
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            {/* Key Metrics */}
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-icon">🏠</div>
                <div className="metric-info">
                  <h3>{formatNumber(dashboardData.totalProperties)}</h3>
                  <p>Total Properties</p>
                  <span className="growth positive">+12% this month</span>
                </div>
              </div>
              
              <div className="metric-card">
                <div className="metric-icon">👥</div>
                <div className="metric-info">
                  <h3>{formatNumber(dashboardData.totalUsers)}</h3>
                  <p>Total Users</p>
                  <span className="growth positive">+8% this month</span>
                </div>
              </div>
              
              <div className="metric-card">
                <div className="metric-icon">👁️</div>
                <div className="metric-info">
                  <h3>{formatNumber(dashboardData.totalViews)}</h3>
                  <p>Total Views</p>
                  <span className="growth positive">+15% this month</span>
                </div>
              </div>
              
              <div className="metric-card">
                <div className="metric-icon">💰</div>
                <div className="metric-info">
                  <h3>{formatCurrency(dashboardData.totalRevenue)}</h3>
                  <p>Total Revenue</p>
                  <span className="growth positive">+22% this month</span>
                </div>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="recent-activities">
              <h2>Recent Activities</h2>
              <div className="activities-list">
                {dashboardData.recentActivities.map(activity => (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-icon">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="activity-details">
                      <p className="activity-action">{activity.action}</p>
                      <p className="activity-user">by {activity.user}</p>
                    </div>
                    <div className="activity-time">
                      {activity.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
              <h2>Quick Actions</h2>
              <div className="actions-grid">
                <button className="action-btn" onClick={() => setActiveTab('properties')}>
                  <span className="action-icon">➕</span>
                  <span>Add Property</span>
                </button>
                <button className="action-btn" onClick={() => setActiveTab('users')}>
                  <span className="action-icon">👤</span>
                  <span>Manage Users</span>
                </button>
                <button className="action-btn" onClick={() => setActiveTab('content')}>
                  <span className="action-icon">📝</span>
                  <span>Edit Content</span>
                </button>
                <button className="action-btn" onClick={() => setActiveTab('analytics')}>
                  <span className="action-icon">📊</span>
                  <span>View Reports</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'properties' && <PropertyManagement />}
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'content' && <ContentManagement />}
        {activeTab === 'analytics' && <Analytics />}
      </div>
    </div>
  );
}

export default AdminDashboard;