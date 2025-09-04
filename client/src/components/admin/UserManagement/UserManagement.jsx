import { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement } from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import * as d3 from 'd3';
import './UserManagement.scss';

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

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [analytics, setAnalytics] = useState({});
  const [d3Chart, setD3Chart] = useState(null);
  
  const itemsPerPage = 10;

  useEffect(() => {
    fetchUsers();
    fetchUserAnalytics();
  }, []);

  useEffect(() => {
    filterAndSortUsers();
  }, [users, searchTerm, filterRole, filterStatus, sortBy]);

  useEffect(() => {
    if (analytics.userGrowthData) {
      createD3Chart();
    }
  }, [analytics.userGrowthData]);

  const fetchUsers = async () => {
    try {
      // Mock data - replace with actual API call
      const mockUsers = [
        {
          id: 1,
          username: "john_doe",
          email: "john.doe@email.com",
          fullName: "John Doe",
          role: "buyer",
          status: "active",
          joinDate: "2024-01-15",
          lastLogin: "2024-02-05",
          propertiesViewed: 45,
          inquiriesSent: 12,
          favoriteProperties: 8,
          avatar: "/avatar1.jpg",
          phone: "+1-555-0123",
          verified: true
        },
        {
          id: 2,
          username: "jane_smith",
          email: "jane.smith@email.com",
          fullName: "Jane Smith",
          role: "seller",
          status: "active",
          joinDate: "2024-01-10",
          lastLogin: "2024-02-06",
          propertiesListed: 8,
          inquiriesReceived: 34,
          totalViews: 1250,
          avatar: "/avatar2.jpg",
          phone: "+1-555-0124",
          verified: true
        },
        {
          id: 3,
          username: "mike_johnson",
          email: "mike.johnson@email.com",
          fullName: "Mike Johnson",
          role: "agent",
          status: "active",
          joinDate: "2024-01-08",
          lastLogin: "2024-02-06",
          propertiesManaged: 23,
          clientsServed: 15,
          commissionsEarned: 45000,
          avatar: "/avatar3.jpg",
          phone: "+1-555-0125",
          verified: true
        },
        {
          id: 4,
          username: "sarah_wilson",
          email: "sarah.wilson@email.com",
          fullName: "Sarah Wilson",
          role: "buyer",
          status: "inactive",
          joinDate: "2024-01-20",
          lastLogin: "2024-01-25",
          propertiesViewed: 12,
          inquiriesSent: 3,
          favoriteProperties: 2,
          avatar: "/avatar4.jpg",
          phone: "+1-555-0126",
          verified: false
        },
        {
          id: 5,
          username: "admin_user",
          email: "admin@estateapp.com",
          fullName: "Admin User",
          role: "admin",
          status: "active",
          joinDate: "2024-01-01",
          lastLogin: "2024-02-06",
          totalActions: 156,
          systemAccess: "full",
          avatar: "/admin-avatar.jpg",
          phone: "+1-555-0100",
          verified: true
        }
      ];
      setUsers(mockUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchUserAnalytics = async () => {
    try {
      // Mock analytics data
      setAnalytics({
        totalUsers: 1247,
        activeUsers: 892,
        newUsersThisMonth: 89,
        verifiedUsers: 1156,
        usersByRole: {
          labels: ['Buyers', 'Sellers', 'Agents', 'Admins'],
          datasets: [{
            data: [698, 245, 89, 15],
            backgroundColor: ['#3498db', '#2ecc71', '#f39c12', '#e74c3c'],
            borderWidth: 0
          }]
        },
        userActivity: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Active Users',
            data: [720, 785, 810, 845, 892, 920],
            borderColor: '#3498db',
            backgroundColor: 'rgba(52, 152, 219, 0.1)',
            tension: 0.4,
            fill: true
          }]
        },
        registrationTrends: {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          datasets: [{
            label: 'New Registrations',
            data: [18, 25, 22, 24],
            backgroundColor: 'rgba(46, 204, 113, 0.8)',
            borderColor: '#2ecc71',
            borderWidth: 2
          }]
        },
        userGrowthData: [
          { month: 'Jan', users: 720, growth: 5.2 },
          { month: 'Feb', users: 785, growth: 9.0 },
          { month: 'Mar', users: 810, growth: 3.2 },
          { month: 'Apr', users: 845, growth: 4.3 },
          { month: 'May', users: 892, growth: 5.6 },
          { month: 'Jun', users: 920, growth: 3.1 }
        ]
      });
    } catch (error) {
      console.error('Error fetching user analytics:', error);
    }
  };

  const createD3Chart = () => {
    // Clear previous chart
    d3.select('#user-growth-d3').selectAll('*').remove();
    
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = 400 - margin.left - margin.right;
    const height = 250 - margin.top - margin.bottom;
    
    const svg = d3.select('#user-growth-d3')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);
    
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Scales
    const xScale = d3.scaleBand()
      .domain(analytics.userGrowthData.map(d => d.month))
      .range([0, width])
      .padding(0.1);
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(analytics.userGrowthData, d => d.users)])
      .range([height, 0]);
    
    // Color scale for gradient
    const colorScale = d3.scaleLinear()
      .domain([0, d3.max(analytics.userGrowthData, d => d.growth)])
      .range(['#74b9ff', '#0984e3']);
    
    // Create gradient
    const gradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'barGradient')
      .attr('x1', '0%')
      .attr('x2', '0%')
      .attr('y1', '100%')
      .attr('y2', '0%');
    
    gradient.append('stop')
      .attr('offset', '0%')
      .attr('style', 'stop-color:#74b9ff;stop-opacity:0.8');
    
    gradient.append('stop')
      .attr('offset', '100%')
      .attr('style', 'stop-color:#0984e3;stop-opacity:1');
    
    // Bars
    g.selectAll('.bar')
      .data(analytics.userGrowthData)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.month))
      .attr('width', xScale.bandwidth())
      .attr('y', height)
      .attr('height', 0)
      .attr('fill', 'url(#barGradient)')
      .attr('rx', 4)
      .transition()
      .duration(1000)
      .delay((d, i) => i * 100)
      .attr('y', d => yScale(d.users))
      .attr('height', d => height - yScale(d.users));
    
    // X Axis
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('fill', '#666')
      .style('font-size', '12px');
    
    // Y Axis
    g.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .style('fill', '#666')
      .style('font-size', '12px');
    
    // Add value labels on bars
    g.selectAll('.value-label')
      .data(analytics.userGrowthData)
      .enter().append('text')
      .attr('class', 'value-label')
      .attr('x', d => xScale(d.month) + xScale.bandwidth() / 2)
      .attr('y', d => yScale(d.users) - 5)
      .attr('text-anchor', 'middle')
      .style('fill', '#333')
      .style('font-size', '11px')
      .style('font-weight', 'bold')
      .style('opacity', 0)
      .text(d => d.users)
      .transition()
      .duration(1000)
      .delay((d, i) => i * 100 + 500)
      .style('opacity', 1);
  };

  const filterAndSortUsers = () => {
    let filtered = [...users];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply role filter
    if (filterRole !== 'all') {
      filtered = filtered.filter(user => user.role === filterRole);
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(user => user.status === filterStatus);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.joinDate) - new Date(a.joinDate);
        case 'oldest':
          return new Date(a.joinDate) - new Date(b.joinDate);
        case 'name':
          return a.fullName.localeCompare(b.fullName);
        case 'lastLogin':
          return new Date(b.lastLogin) - new Date(a.lastLogin);
        default:
          return 0;
      }
    });

    setFilteredUsers(filtered);
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      active: 'status-active',
      inactive: 'status-inactive',
      suspended: 'status-suspended'
    };
    return <span className={`status-badge ${statusClasses[status]}`}>{status.toUpperCase()}</span>;
  };

  const getRoleBadge = (role) => {
    const roleClasses = {
      admin: 'role-admin',
      agent: 'role-agent',
      seller: 'role-seller',
      buyer: 'role-buyer'
    };
    const roleIcons = {
      admin: '👑',
      agent: '🏢',
      seller: '🏠',
      buyer: '🛒'
    };
    return (
      <span className={`role-badge ${roleClasses[role]}`}>
        <span className="role-icon">{roleIcons[role]}</span>
        {role.toUpperCase()}
      </span>
    );
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(u => u.id !== userId));
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowAddModal(true);
  };

  const handleToggleStatus = (userId) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    ));
  };

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

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
    <div className="user-management">
      {/* Analytics Dashboard */}
      <div className="analytics-section">
        <h2>User Analytics</h2>
        
        <div className="metrics-row">
          <div className="metric-card">
            <div className="metric-icon">👥</div>
            <div className="metric-info">
              <h3>{analytics.totalUsers?.toLocaleString()}</h3>
              <p>Total Users</p>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">✅</div>
            <div className="metric-info">
              <h3>{analytics.activeUsers?.toLocaleString()}</h3>
              <p>Active Users</p>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">📈</div>
            <div className="metric-info">
              <h3>{analytics.newUsersThisMonth}</h3>
              <p>New This Month</p>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">✔️</div>
            <div className="metric-info">
              <h3>{analytics.verifiedUsers?.toLocaleString()}</h3>
              <p>Verified Users</p>
            </div>
          </div>
        </div>

        <div className="charts-row">
          <div className="chart-container">
            <h3>Users by Role</h3>
            <div className="chart-wrapper">
              {analytics.usersByRole && (
                <Doughnut data={analytics.usersByRole} options={chartOptions} />
              )}
            </div>
          </div>
          
          <div className="chart-container">
            <h3>User Activity Trend</h3>
            <div className="chart-wrapper">
              {analytics.userActivity && (
                <Line data={analytics.userActivity} options={chartOptions} />
              )}
            </div>
          </div>
          
          <div className="chart-container">
            <h3>User Growth (D3.js)</h3>
            <div className="chart-wrapper">
              <div id="user-growth-d3"></div>
            </div>
          </div>
        </div>

        <div className="chart-full-width">
          <div className="chart-container">
            <h3>Weekly Registration Trends</h3>
            <div className="chart-wrapper">
              {analytics.registrationTrends && (
                <Bar data={analytics.registrationTrends} options={chartOptions} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* User Management */}
      <div className="management-section">
        <div className="section-header">
          <h2>User Management</h2>
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            <span className="icon">👤</span>
            Add User
          </button>
        </div>

        {/* Filters and Search */}
        <div className="filters-bar">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>
          
          <select 
            value={filterRole} 
            onChange={(e) => setFilterRole(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Roles</option>
            <option value="buyer">Buyers</option>
            <option value="seller">Sellers</option>
            <option value="agent">Agents</option>
            <option value="admin">Admins</option>
          </select>
          
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
          
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Name A-Z</option>
            <option value="lastLogin">Last Login</option>
          </select>
        </div>

        {/* Users Table */}
        <div className="users-table">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Activity Stats</th>
                <th>Join Date</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map(user => (
                <tr key={user.id}>
                  <td className="user-cell">
                    <div className="user-info">
                      <div className="user-avatar">
                        <img src={user.avatar || '/noavatar.jpg'} alt={user.fullName} />
                        {user.verified && <span className="verified-badge">✓</span>}
                      </div>
                      <div className="user-details">
                        <h4>{user.fullName}</h4>
                        <p>@{user.username}</p>
                        <span className="user-email">{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    {getRoleBadge(user.role)}
                  </td>
                  <td>
                    {getStatusBadge(user.status)}
                  </td>
                  <td className="activity-cell">
                    <div className="activity-stats">
                      {user.role === 'buyer' && (
                        <>
                          <span>👁️ {user.propertiesViewed} views</span>
                          <span>💬 {user.inquiriesSent} inquiries</span>
                          <span>❤️ {user.favoriteProperties} favorites</span>
                        </>
                      )}
                      {user.role === 'seller' && (
                        <>
                          <span>🏠 {user.propertiesListed} listed</span>
                          <span>💬 {user.inquiriesReceived} inquiries</span>
                          <span>👁️ {user.totalViews} views</span>
                        </>
                      )}
                      {user.role === 'agent' && (
                        <>
                          <span>🏠 {user.propertiesManaged} managed</span>
                          <span>👤 {user.clientsServed} clients</span>
                          <span>💰 ${user.commissionsEarned?.toLocaleString()}</span>
                        </>
                      )}
                      {user.role === 'admin' && (
                        <>
                          <span>⚡ {user.totalActions} actions</span>
                          <span>🔐 {user.systemAccess} access</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td>{formatDate(user.joinDate)}</td>
                  <td>{formatDate(user.lastLogin)}</td>
                  <td className="actions-cell">
                    <div className="action-buttons">
                      <button 
                        className="btn-edit" 
                        onClick={() => handleEditUser(user)}
                        title="Edit User"
                      >
                        ✏️
                      </button>
                      <button 
                        className={`btn-toggle ${user.status === 'active' ? 'btn-deactivate' : 'btn-activate'}`}
                        onClick={() => handleToggleStatus(user.id)}
                        title={user.status === 'active' ? 'Deactivate' : 'Activate'}
                      >
                        {user.status === 'active' ? '⏸️' : '▶️'}
                      </button>
                      <button 
                        className="btn-delete" 
                        onClick={() => handleDeleteUser(user.id)}
                        title="Delete User"
                      >
                        🗑️
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

      {/* Add/Edit User Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingUser ? 'Edit User' : 'Add New User'}</h3>
              <button 
                className="modal-close" 
                onClick={() => {
                  setShowAddModal(false);
                  setEditingUser(null);
                }}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <form className="user-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input 
                      type="text" 
                      placeholder="Enter full name"
                      defaultValue={editingUser?.fullName || ''}
                    />
                  </div>
                  <div className="form-group">
                    <label>Username</label>
                    <input 
                      type="text" 
                      placeholder="Enter username"
                      defaultValue={editingUser?.username || ''}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input 
                    type="email" 
                    placeholder="Enter email address"
                    defaultValue={editingUser?.email || ''}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Phone</label>
                    <input 
                      type="tel" 
                      placeholder="Enter phone number"
                      defaultValue={editingUser?.phone || ''}
                    />
                  </div>
                  <div className="form-group">
                    <label>Role</label>
                    <select defaultValue={editingUser?.role || 'buyer'}>
                      <option value="buyer">Buyer</option>
                      <option value="seller">Seller</option>
                      <option value="agent">Agent</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Status</label>
                    <select defaultValue={editingUser?.status || 'active'}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Verified</label>
                    <select defaultValue={editingUser?.verified ? 'true' : 'false'}>
                      <option value="true">Verified</option>
                      <option value="false">Not Verified</option>
                    </select>
                  </div>
                </div>
                {!editingUser && (
                  <div className="form-group">
                    <label>Password</label>
                    <input 
                      type="password" 
                      placeholder="Enter password"
                    />
                  </div>
                )}
              </form>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary" 
                onClick={() => {
                  setShowAddModal(false);
                  setEditingUser(null);
                }}
              >
                Cancel
              </button>
              <button className="btn-primary">
                {editingUser ? 'Update User' : 'Add User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;