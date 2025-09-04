import { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import './ContentManagement.scss';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function ContentManagement() {
  const [activeSection, setActiveSection] = useState('pages');
  const [pages, setPages] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [modalType, setModalType] = useState('page');
  const [analytics, setAnalytics] = useState({});
  
  useEffect(() => {
    fetchContent();
    fetchContentAnalytics();
  }, []);

  const fetchContent = async () => {
    try {
      // Mock data - replace with actual API calls
      setPages([
        {
          id: 1,
          title: "About Us",
          slug: "about-us",
          content: "<p>We are a leading real estate platform...</p>",
          status: "published",
          author: "Admin User",
          lastModified: "2024-02-05",
          views: 2847
        },
        {
          id: 2,
          title: "Terms of Service",
          slug: "terms-of-service",
          content: "<p>By using our platform, you agree to...</p>",
          status: "published",
          author: "Admin User",
          lastModified: "2024-01-15",
          views: 1523
        },
        {
          id: 3,
          title: "Privacy Policy",
          slug: "privacy-policy",
          content: "<p>Your privacy is important to us...</p>",
          status: "draft",
          author: "Admin User",
          lastModified: "2024-02-03",
          views: 0
        }
      ]);

      setBlogs([
        {
          id: 1,
          title: "10 Tips for First-Time Home Buyers",
          slug: "first-time-home-buyers-tips",
          excerpt: "Buying your first home can be overwhelming. Here are 10 essential tips...",
          content: "<p>Buying your first home...</p>",
          status: "published",
          author: "Jane Smith",
          publishDate: "2024-02-01",
          category: "Buying",
          tags: ["tips", "first-time", "buyers"],
          views: 3421,
          likes: 89,
          comments: 23
        },
        {
          id: 2,
          title: "Market Trends in 2024",
          slug: "market-trends-2024",
          excerpt: "The real estate market is showing interesting trends this year...",
          content: "<p>The market has been...</p>",
          status: "published",
          author: "Mike Johnson",
          publishDate: "2024-01-28",
          category: "Market Analysis",
          tags: ["trends", "2024", "market"],
          views: 2156,
          likes: 67,
          comments: 15
        }
      ]);

      setFaqs([
        {
          id: 1,
          question: "How do I list my property?",
          answer: "To list your property, create an account and click on 'List Property' in your dashboard.",
          category: "Listing",
          status: "published",
          order: 1
        },
        {
          id: 2,
          question: "What are the fees for listing?",
          answer: "Basic listings are free. Premium features are available for a small fee.",
          category: "Pricing",
          status: "published",
          order: 2
        },
        {
          id: 3,
          question: "How do I contact property owners?",
          answer: "Use the inquiry form on each property page to contact the owner directly.",
          category: "Communication",
          status: "draft",
          order: 3
        }
      ]);

      setAnnouncements([
        {
          id: 1,
          title: "Platform Maintenance Scheduled",
          content: "We will be performing system maintenance on February 10th from 2-4 AM EST.",
          type: "maintenance",
          status: "active",
          startDate: "2024-02-08",
          endDate: "2024-02-12",
          targetAudience: "all"
        },
        {
          id: 2,
          title: "New Search Features Available",
          content: "We've added advanced search filters to help you find properties faster.",
          type: "feature",
          status: "active",
          startDate: "2024-02-01",
          endDate: "2024-02-15",
          targetAudience: "buyers"
        }
      ]);
    } catch (error) {
      console.error('Error fetching content:', error);
    }
  };

  const fetchContentAnalytics = async () => {
    try {
      setAnalytics({
        totalPages: 12,
        publishedPages: 9,
        totalBlogs: 45,
        publishedBlogs: 38,
        totalFaqs: 24,
        totalAnnouncements: 3,
        contentViews: {
          labels: ['Pages', 'Blog Posts', 'FAQs', 'Announcements'],
          datasets: [{
            data: [8450, 15680, 3240, 890],
            backgroundColor: ['#3498db', '#2ecc71', '#f39c12', '#e74c3c'],
            borderWidth: 0
          }]
        },
        contentPerformance: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Page Views',
            data: [1200, 1400, 1600, 1350, 1750, 1900],
            backgroundColor: 'rgba(52, 152, 219, 0.8)',
            borderColor: '#3498db',
            borderWidth: 2
          }, {
            label: 'Blog Views',
            data: [2800, 3200, 3600, 3100, 3900, 4200],
            backgroundColor: 'rgba(46, 204, 113, 0.8)',
            borderColor: '#2ecc71',
            borderWidth: 2
          }]
        }
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const getCurrentData = () => {
    switch (activeSection) {
      case 'pages': return pages;
      case 'blogs': return blogs;
      case 'faqs': return faqs;
      case 'announcements': return announcements;
      default: return [];
    }
  };

  const getFilteredData = () => {
    let data = getCurrentData();
    
    if (searchTerm) {
      data = data.filter(item => 
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.question?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterStatus !== 'all') {
      data = data.filter(item => item.status === filterStatus);
    }
    
    return data;
  };

  const handleAdd = (type) => {
    setModalType(type);
    setEditingItem(null);
    setShowModal(true);
  };

  const handleEdit = (item, type) => {
    setModalType(type);
    setEditingItem(item);
    setShowModal(true);
  };

  const handleDelete = (id, type) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      switch (type) {
        case 'page':
          setPages(pages.filter(p => p.id !== id));
          break;
        case 'blog':
          setBlogs(blogs.filter(b => b.id !== id));
          break;
        case 'faq':
          setFaqs(faqs.filter(f => f.id !== id));
          break;
        case 'announcement':
          setAnnouncements(announcements.filter(a => a.id !== id));
          break;
      }
    }
  };

  const toggleStatus = (id, type) => {
    const updateStatus = (item) => {
      const newStatus = item.status === 'published' ? 'draft' : 'published';
      return { ...item, status: newStatus };
    };

    switch (type) {
      case 'page':
        setPages(pages.map(p => p.id === id ? updateStatus(p) : p));
        break;
      case 'blog':
        setBlogs(blogs.map(b => b.id === id ? updateStatus(b) : b));
        break;
      case 'faq':
        setFaqs(faqs.map(f => f.id === id ? updateStatus(f) : f));
        break;
      case 'announcement':
        setAnnouncements(announcements.map(a => a.id === id ? { ...a, status: a.status === 'active' ? 'inactive' : 'active' } : a));
        break;
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      published: 'status-published',
      draft: 'status-draft',
      active: 'status-published',
      inactive: 'status-draft'
    };
    return <span className={`status-badge ${statusClasses[status]}`}>{status.toUpperCase()}</span>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

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

  const renderContentTable = () => {
    const data = getFilteredData();
    
    if (activeSection === 'pages') {
      return (
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Slug</th>
              <th>Status</th>
              <th>Author</th>
              <th>Views</th>
              <th>Last Modified</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map(page => (
              <tr key={page.id}>
                <td className="title-cell">
                  <strong>{page.title}</strong>
                </td>
                <td className="slug-cell">/{page.slug}</td>
                <td>{getStatusBadge(page.status)}</td>
                <td>{page.author}</td>
                <td className="views-cell">{page.views?.toLocaleString()}</td>
                <td>{formatDate(page.lastModified)}</td>
                <td className="actions-cell">
                  <div className="action-buttons">
                    <button onClick={() => handleEdit(page, 'page')} className="btn-edit" title="Edit">✏️</button>
                    <button onClick={() => toggleStatus(page.id, 'page')} className="btn-toggle" title="Toggle Status">
                      {page.status === 'published' ? '👁️' : '👁️‍🗨️'}
                    </button>
                    <button onClick={() => handleDelete(page.id, 'page')} className="btn-delete" title="Delete">🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    
    if (activeSection === 'blogs') {
      return (
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Status</th>
              <th>Author</th>
              <th>Engagement</th>
              <th>Publish Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map(blog => (
              <tr key={blog.id}>
                <td className="title-cell">
                  <strong>{blog.title}</strong>
                  <p className="excerpt">{blog.excerpt?.substring(0, 60)}...</p>
                </td>
                <td className="category-cell">{blog.category}</td>
                <td>{getStatusBadge(blog.status)}</td>
                <td>{blog.author}</td>
                <td className="engagement-cell">
                  <div className="engagement-stats">
                    <span>👁️ {blog.views}</span>
                    <span>❤️ {blog.likes}</span>
                    <span>💬 {blog.comments}</span>
                  </div>
                </td>
                <td>{formatDate(blog.publishDate)}</td>
                <td className="actions-cell">
                  <div className="action-buttons">
                    <button onClick={() => handleEdit(blog, 'blog')} className="btn-edit" title="Edit">✏️</button>
                    <button onClick={() => toggleStatus(blog.id, 'blog')} className="btn-toggle" title="Toggle Status">
                      {blog.status === 'published' ? '👁️' : '👁️‍🗨️'}
                    </button>
                    <button onClick={() => handleDelete(blog.id, 'blog')} className="btn-delete" title="Delete">🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    
    if (activeSection === 'faqs') {
      return (
        <table>
          <thead>
            <tr>
              <th>Question</th>
              <th>Category</th>
              <th>Status</th>
              <th>Order</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map(faq => (
              <tr key={faq.id}>
                <td className="question-cell">
                  <strong>{faq.question}</strong>
                  <p className="answer-preview">{faq.answer?.substring(0, 80)}...</p>
                </td>
                <td className="category-cell">{faq.category}</td>
                <td>{getStatusBadge(faq.status)}</td>
                <td className="order-cell">#{faq.order}</td>
                <td className="actions-cell">
                  <div className="action-buttons">
                    <button onClick={() => handleEdit(faq, 'faq')} className="btn-edit" title="Edit">✏️</button>
                    <button onClick={() => toggleStatus(faq.id, 'faq')} className="btn-toggle" title="Toggle Status">
                      {faq.status === 'published' ? '👁️' : '👁️‍🗨️'}
                    </button>
                    <button onClick={() => handleDelete(faq.id, 'faq')} className="btn-delete" title="Delete">🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    
    if (activeSection === 'announcements') {
      return (
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Status</th>
              <th>Target Audience</th>
              <th>Duration</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map(announcement => (
              <tr key={announcement.id}>
                <td className="title-cell">
                  <strong>{announcement.title}</strong>
                  <p className="content-preview">{announcement.content?.substring(0, 60)}...</p>
                </td>
                <td className="type-cell">
                  <span className={`type-badge type-${announcement.type}`}>
                    {announcement.type.toUpperCase()}
                  </span>
                </td>
                <td>{getStatusBadge(announcement.status)}</td>
                <td className="audience-cell">{announcement.targetAudience}</td>
                <td className="duration-cell">
                  <span>{formatDate(announcement.startDate)} - {formatDate(announcement.endDate)}</span>
                </td>
                <td className="actions-cell">
                  <div className="action-buttons">
                    <button onClick={() => handleEdit(announcement, 'announcement')} className="btn-edit" title="Edit">✏️</button>
                    <button onClick={() => toggleStatus(announcement.id, 'announcement')} className="btn-toggle" title="Toggle Status">
                      {announcement.status === 'active' ? '👁️' : '👁️‍🗨️'}
                    </button>
                    <button onClick={() => handleDelete(announcement.id, 'announcement')} className="btn-delete" title="Delete">🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
  };

  return (
    <div className="content-management">
      {/* Analytics Section */}
      <div className="analytics-section">
        <h2>Content Analytics</h2>
        
        <div className="metrics-row">
          <div className="metric-card">
            <div className="metric-icon">📄</div>
            <div className="metric-info">
              <h3>{analytics.totalPages}</h3>
              <p>Total Pages</p>
              <small>{analytics.publishedPages} published</small>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">📝</div>
            <div className="metric-info">
              <h3>{analytics.totalBlogs}</h3>
              <p>Blog Posts</p>
              <small>{analytics.publishedBlogs} published</small>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">❓</div>
            <div className="metric-info">
              <h3>{analytics.totalFaqs}</h3>
              <p>FAQ Items</p>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">📢</div>
            <div className="metric-info">
              <h3>{analytics.totalAnnouncements}</h3>
              <p>Announcements</p>
            </div>
          </div>
        </div>

        <div className="charts-row">
          <div className="chart-container">
            <h3>Content Views Distribution</h3>
            <div className="chart-wrapper">
              {analytics.contentViews && (
                <Doughnut data={analytics.contentViews} options={chartOptions} />
              )}
            </div>
          </div>
          <div className="chart-container">
            <h3>Content Performance Trends</h3>
            <div className="chart-wrapper">
              {analytics.contentPerformance && (
                <Bar data={analytics.contentPerformance} options={chartOptions} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Management */}
      <div className="management-section">
        <div className="section-header">
          <h2>Content Management</h2>
          <button 
            className="btn-primary" 
            onClick={() => handleAdd(activeSection.slice(0, -1))}
          >
            <span className="icon">➕</span>
            Add {activeSection.slice(0, -1).charAt(0).toUpperCase() + activeSection.slice(1, -1)}
          </button>
        </div>

        {/* Content Type Tabs */}
        <div className="content-tabs">
          <button 
            className={activeSection === 'pages' ? 'active' : ''}
            onClick={() => setActiveSection('pages')}
          >
            📄 Pages ({pages.length})
          </button>
          <button 
            className={activeSection === 'blogs' ? 'active' : ''}
            onClick={() => setActiveSection('blogs')}
          >
            📝 Blog Posts ({blogs.length})
          </button>
          <button 
            className={activeSection === 'faqs' ? 'active' : ''}
            onClick={() => setActiveSection('faqs')}
          >
            ❓ FAQs ({faqs.length})
          </button>
          <button 
            className={activeSection === 'announcements' ? 'active' : ''}
            onClick={() => setActiveSection('announcements')}
          >
            📢 Announcements ({announcements.length})
          </button>
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search content..."
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
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            {activeSection === 'announcements' && (
              <>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </>
            )}
          </select>
        </div>

        {/* Content Table */}
        <div className="content-table">
          {renderContentTable()}
        </div>
      </div>

      {/* Modal for Add/Edit */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content large-modal">
            <div className="modal-header">
              <h3>{editingItem ? 'Edit' : 'Add'} {modalType.charAt(0).toUpperCase() + modalType.slice(1)}</h3>
              <button 
                className="modal-close" 
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <form className="content-form">
                {modalType === 'page' && (
                  <>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Page Title</label>
                        <input 
                          type="text" 
                          placeholder="Enter page title"
                          defaultValue={editingItem?.title || ''}
                        />
                      </div>
                      <div className="form-group">
                        <label>Slug</label>
                        <input 
                          type="text" 
                          placeholder="page-url-slug"
                          defaultValue={editingItem?.slug || ''}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Content</label>
                      <textarea 
                        rows="8" 
                        placeholder="Enter page content..."
                        defaultValue={editingItem?.content || ''}
                      ></textarea>
                    </div>
                    <div className="form-group">
                      <label>Status</label>
                      <select defaultValue={editingItem?.status || 'draft'}>
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                      </select>
                    </div>
                  </>
                )}

                {modalType === 'blog' && (
                  <>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Post Title</label>
                        <input 
                          type="text" 
                          placeholder="Enter post title"
                          defaultValue={editingItem?.title || ''}
                        />
                      </div>
                      <div className="form-group">
                        <label>Category</label>
                        <select defaultValue={editingItem?.category || 'General'}>
                          <option value="General">General</option>
                          <option value="Buying">Buying</option>
                          <option value="Selling">Selling</option>
                          <option value="Market Analysis">Market Analysis</option>
                          <option value="Tips">Tips</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Excerpt</label>
                      <textarea 
                        rows="3" 
                        placeholder="Brief description of the post..."
                        defaultValue={editingItem?.excerpt || ''}
                      ></textarea>
                    </div>
                    <div className="form-group">
                      <label>Content</label>
                      <textarea 
                        rows="8" 
                        placeholder="Enter post content..."
                        defaultValue={editingItem?.content || ''}
                      ></textarea>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Tags</label>
                        <input 
                          type="text" 
                          placeholder="tag1, tag2, tag3"
                          defaultValue={editingItem?.tags?.join(', ') || ''}
                        />
                      </div>
                      <div className="form-group">
                        <label>Status</label>
                        <select defaultValue={editingItem?.status || 'draft'}>
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {modalType === 'faq' && (
                  <>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Question</label>
                        <input 
                          type="text" 
                          placeholder="Enter the question"
                          defaultValue={editingItem?.question || ''}
                        />
                      </div>
                      <div className="form-group">
                        <label>Category</label>
                        <select defaultValue={editingItem?.category || 'General'}>
                          <option value="General">General</option>
                          <option value="Listing">Listing</option>
                          <option value="Pricing">Pricing</option>
                          <option value="Communication">Communication</option>
                          <option value="Technical">Technical</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Answer</label>
                      <textarea 
                        rows="5" 
                        placeholder="Enter the answer..."
                        defaultValue={editingItem?.answer || ''}
                      ></textarea>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Display Order</label>
                        <input 
                          type="number" 
                          placeholder="1"
                          defaultValue={editingItem?.order || ''}
                        />
                      </div>
                      <div className="form-group">
                        <label>Status</label>
                        <select defaultValue={editingItem?.status || 'draft'}>
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {modalType === 'announcement' && (
                  <>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Announcement Title</label>
                        <input 
                          type="text" 
                          placeholder="Enter announcement title"
                          defaultValue={editingItem?.title || ''}
                        />
                      </div>
                      <div className="form-group">
                        <label>Type</label>
                        <select defaultValue={editingItem?.type || 'general'}>
                          <option value="general">General</option>
                          <option value="maintenance">Maintenance</option>
                          <option value="feature">New Feature</option>
                          <option value="promotion">Promotion</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Content</label>
                      <textarea 
                        rows="4" 
                        placeholder="Enter announcement content..."
                        defaultValue={editingItem?.content || ''}
                      ></textarea>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Start Date</label>
                        <input 
                          type="date" 
                          defaultValue={editingItem?.startDate || ''}
                        />
                      </div>
                      <div className="form-group">
                        <label>End Date</label>
                        <input 
                          type="date" 
                          defaultValue={editingItem?.endDate || ''}
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Target Audience</label>
                        <select defaultValue={editingItem?.targetAudience || 'all'}>
                          <option value="all">All Users</option>
                          <option value="buyers">Buyers</option>
                          <option value="sellers">Sellers</option>
                          <option value="agents">Agents</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Status</label>
                        <select defaultValue={editingItem?.status || 'inactive'}>
                          <option value="inactive">Inactive</option>
                          <option value="active">Active</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}
              </form>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary" 
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button className="btn-primary">
                {editingItem ? 'Update' : 'Create'} {modalType.charAt(0).toUpperCase() + modalType.slice(1)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ContentManagement;