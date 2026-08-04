import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  FileText,
  User,
  Bell,
  Settings,
  HelpCircle,
  Search,
  MessageSquare,
  ChevronDown,
  LogOut,
  Plus,
  Plane,
  Heart,
  Home,
  Eye,
  ChevronLeft,
  ChevronRight,
  ListTodo,
  Ticket,
  PackageOpen
} from 'lucide-react';
import '../styles/dashboard.css';
import '../styles/leave-management.css';

const leaveData = [
  { id: 'LV-2025-032', type: 'Casual Leave', from: '12 May 2025', to: '13 May 2025', days: 2, reason: 'Family function', status: 'Approved', appliedOn: '08 May 2025' },
  { id: 'LV-2025-031', type: 'Sick Leave', from: '05 May 2025', to: '05 May 2025', days: 1, reason: 'Fever and cold', status: 'Approved', appliedOn: '04 May 2025' },
  { id: 'LV-2025-030', type: 'Work From Home', from: '01 May 2025', to: '01 May 2025', days: 1, reason: 'Internet issue', status: 'Approved', appliedOn: '30 Apr 2025' },
  { id: 'LV-2025-029', type: 'Casual Leave', from: '20 Apr 2025', to: '22 Apr 2025', days: 3, reason: 'Personal work', status: 'Rejected', appliedOn: '18 Apr 2025' },
  { id: 'LV-2025-028', type: 'Sick Leave', from: '10 Apr 2025', to: '11 Apr 2025', days: 2, reason: 'Medical checkup', status: 'Approved', appliedOn: '09 Apr 2025' },
  { id: 'LV-2025-027', type: 'Casual Leave', from: '02 Apr 2025', to: '02 Apr 2025', days: 1, reason: 'Travel', status: 'Approved', appliedOn: '31 Mar 2025' },
];

function LeaveManagement() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo-icon">D</div>
          <div className="sidebar-logo-text">
            <h2>Dropyhub</h2>
            <p>HRMS Portal</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li>
              <Link to="/dashboard" className="nav-item-content"><LayoutDashboard size={18} /> Dashboard</Link>
            </li>
            <li>
              <Link to="/attendance" className="nav-item-content"><CheckSquare size={18} /> Attendance</Link>
            </li>
            <li className="active">
              <Link to="/leave-management" className="nav-item-content"><Calendar size={18} /> Leave Management</Link>
            </li>
            <li>
              <Link to="/worksheet" className="nav-item-content"><FileText size={18} /> Worksheet</Link>
            </li>
            <li>
              <Link to="/tasks" className="nav-item-content"><ListTodo size={18} /> Task Management</Link>
            </li>
            <li>
              <Link to="/tickets" className="nav-item-content"><Ticket size={18} /> Tickets</Link>
            </li>
            <li>
              <Link to="/assets" className="nav-item-content"><PackageOpen size={18} /> Assets</Link>
            </li>
            <li>
              <Link to="/settings" className="nav-item-content"><Settings size={18} /> Settings</Link>
            </li>

            <li className="logout-nav-item">
              <div className="nav-item-content logout-item"><LogOut size={18} /> Logout</div>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="copyright">
            <p>© 2025 Dropyhub HRMS</p>
            <p>All rights reserved.</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Top Header */}
        <header className="dashboard-header">
          <div className="search-bar">
            <Search size={20} color="#9ca3af" style={{ marginLeft: 8 }} />
            <input type="text" placeholder="Search anything..." />
            <button className="search-btn">Search</button>
          </div>

          <div className="header-actions">
            <button className="icon-btn notification">
              <Bell size={20} />
              <span className="dot">3</span>
            </button>
            <button className="icon-btn message">
              <MessageSquare size={20} />
            </button>
            <div className="user-profile" onClick={() => setIsProfileOpen(!isProfileOpen)}>
              <div className="avatar"></div>
              <div className="user-info">
                <h4>Balaji Kumar</h4>
                <p>Frontend Developer</p>
              </div>
              <ChevronDown size={16} color="#6b7280" />

              {isProfileOpen && (
                <>
                  <div className="dropdown-backdrop" onClick={() => setIsProfileOpen(false)} />
                  <div className="profile-dropdown">
                    <Link to="/profile" className="profile-dropdown-item">
                      <User size={16} /> My Profile
                    </Link>
                    <Link to="/settings" className="profile-dropdown-item">
                      <Settings size={16} /> Settings
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="leave-content">
          <div className="page-header-row">
            <div className="page-title-box">
              <h1>Leave Management</h1>
              <p>Apply for leave and track your leave history</p>
            </div>
            <button className="btn-primary">
              <Plus size={18} /> Apply Leave
            </button>
          </div>

          {/* Stats Grid */}
          <div className="leave-stats-grid">
            <div className="leave-stat-card">
              <div className="leave-icon-wrapper total">
                <Calendar size={20} />
              </div>
              <div className="leave-stat-info">
                <p className="leave-stat-label">Total Leave Balance</p>
                <h3 className="leave-stat-value">22 Days</h3>
                <p className="leave-stat-meta">Available</p>
              </div>
            </div>

            <div className="leave-stat-card">
              <div className="leave-icon-wrapper casual">
                <Plane size={20} />
              </div>
              <div className="leave-stat-info">
                <p className="leave-stat-label">Casual Leave</p>
                <h3 className="leave-stat-value">12 Days</h3>
                <p className="leave-stat-meta">Available</p>
              </div>
            </div>

            <div className="leave-stat-card">
              <div className="leave-icon-wrapper sick">
                <Heart size={20} />
              </div>
              <div className="leave-stat-info">
                <p className="leave-stat-label">Sick Leave</p>
                <h3 className="leave-stat-value">6 Days</h3>
                <p className="leave-stat-meta">Available</p>
              </div>
            </div>

            <div className="leave-stat-card">
              <div className="leave-icon-wrapper wfh">
                <Home size={20} />
              </div>
              <div className="leave-stat-info">
                <p className="leave-stat-label">Work From Home</p>
                <h3 className="leave-stat-value">4 Days</h3>
                <p className="leave-stat-meta">Available</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="leave-tabs">
            <button className="leave-tab active">Leave History</button>
            <button className="leave-tab">Upcoming Leaves</button>
            <button className="leave-tab">Leave Balance</button>
          </div>

          {/* Filters */}
          <div className="leave-filters">
            <div className="filter-dropdown">
              <span>All Status</span>
              <ChevronDown size={16} />
            </div>
            <div className="filter-date">
              <span>01 May 2025 - 31 May 2025</span>
              <Calendar size={16} />
            </div>
            <div className="filter-search">
              <input type="text" placeholder="Search leave..." />
              <Search size={16} color="#9ca3af" />
            </div>
            <button className="filter-icon-btn">
              <Calendar size={18} />
            </button>
          </div>

          {/* Data Table */}
          <div className="leave-table-container">
            <table className="leave-table">
              <thead>
                <tr>
                  <th>Leave ID</th>
                  <th>Leave Type</th>
                  <th>From Date</th>
                  <th>To Date</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Applied On</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {leaveData.map((row) => (
                  <tr key={row.id}>
                    <td className="fw-medium">{row.id}</td>
                    <td>
                      <span className={`type-badge ${row.type.toLowerCase().replace(/ /g, '-')}`}>
                        {row.type}
                      </span>
                    </td>
                    <td>{row.from}</td>
                    <td>{row.to}</td>
                    <td>{row.days}</td>
                    <td className="text-gray">{row.reason}</td>
                    <td>
                      <span className={`status-badge ${row.status.toLowerCase()}`}>
                        {row.status}
                      </span>
                    </td>
                    <td>{row.appliedOn}</td>
                    <td>
                      <button className="action-btn">
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="leave-pagination">
            <p>Showing 1 to 6 of 18 leaves</p>
            <div className="pagination-controls">
              <button className="page-btn nav-btn"><ChevronLeft size={16} /></button>
              <button className="page-btn active">1</button>
              <button className="page-btn">2</button>
              <button className="page-btn">3</button>
              <button className="page-btn nav-btn"><ChevronRight size={16} /></button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default LeaveManagement;
