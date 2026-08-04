import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, CheckSquare, Calendar, FileText,
  ListTodo, Ticket, PackageOpen, CalendarDays, Settings,
  LogOut, Search, Bell, MessageSquare, ChevronDown, User,
  Menu, X, Mail
} from 'lucide-react';
import '../../styles/employee/dashboard.css';

const DashboardLayout = ({ children }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <div className="dashboard-layout">
      {/* Mobile Top Header (Only visible on small screens) */}
      <div className="mobile-top-header">
        <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(true)}>
          <Menu size={24} color="#374151" />
        </button>
        <div className="mobile-brand">
          <img src="/Fevicon.png" alt="Dropyhub Icon" className="sidebar-fevicon-img" />
          <img src="/Logo.png" alt="Dropyhub Logo" className="sidebar-logo-img" />
        </div>
        <div className="mobile-header-actions">
          <button className="icon-btn notification">
            <Bell size={20} />
            <span className="dot">3</span>
          </button>
          <div className="user-avatar-small" onClick={() => setIsProfileOpen(!isProfileOpen)}>
             <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Profile" />
          </div>
        </div>
      </div>

      {/* Desktop Sidebar (and Mobile Slide-in) */}
      <aside className={`dashboard-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand">
          <img src="/Fevicon.png" alt="Dropyhub Icon" className="sidebar-fevicon-img" />
          <img src="/Logo.png" alt="Dropyhub Logo" className="sidebar-logo-img" />
          <button className="mobile-close-btn" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li className={isActive('/dashboard')}>
              <Link to="/dashboard" className="nav-item-content"><LayoutDashboard size={18} /> Dashboard</Link>
            </li>
            <li className={isActive('/attendance')}>
              <Link to="/attendance" className="nav-item-content"><CheckSquare size={18} /> Attendance</Link>
            </li>
            <li className={isActive('/leave-management')}>
              <Link to="/leave-management" className="nav-item-content"><Calendar size={18} /> Leave Management</Link>
            </li>
            <li className={isActive('/worksheet')}>
              <Link to="/worksheet" className="nav-item-content"><FileText size={18} /> Worksheet</Link>
            </li>
            <li className={isActive('/tasks')}>
              <Link to="/tasks" className="nav-item-content"><ListTodo size={18} /> Task Management</Link>
            </li>
            <li className={isActive('/tickets')}>
              <Link to="/tickets" className="nav-item-content"><Ticket size={18} /> Tickets</Link>
            </li>
            <li className={isActive('/assets')}>
              <Link to="/assets" className="nav-item-content"><PackageOpen size={18} /> Assets</Link>
            </li>
            <li className={isActive('/holidays')}>
              <Link to="/holidays" className="nav-item-content"><CalendarDays size={18} /> Holidays</Link>
            </li>
            <li className={isActive('/settings')}>
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

      {/* Overlay for mobile sidebar */}
      {isMobileMenuOpen && (
        <div className="mobile-sidebar-overlay" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Main Content Area */}
      <main className="dashboard-main">
        {/* Desktop Top Header (Hidden on mobile) */}
        <header className="dashboard-header desktop-only">
          <div className="search-bar">
            <Search size={20} color="#9ca3af" style={{ marginLeft: 8 }} />
            <input type="text" placeholder="Search..." />
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
              <div className="avatar">
                <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              </div>
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
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-bottom-nav">
        <Link to="/dashboard" className={`bottom-nav-item ${isActive('/dashboard')}`}>
          <LayoutDashboard size={22} />
          <span>Dashboard</span>
        </Link>
        <Link to="/attendance" className={`bottom-nav-item ${isActive('/attendance')}`}>
          <CheckSquare size={22} />
          <span>Attendance</span>
        </Link>
        <Link to="/leave-management" className={`bottom-nav-item ${isActive('/leave-management')}`}>
          <Calendar size={22} />
          <span>Leave</span>
        </Link>
        <Link to="/worksheet" className={`bottom-nav-item ${isActive('/worksheet')}`}>
          <FileText size={22} />
          <span>Worksheet</span>
        </Link>
        <Link to="/tickets" className={`bottom-nav-item ${isActive('/tickets')}`}>
          <Mail size={22} />
          <span>Mail</span>
        </Link>
      </nav>
    </div>
  );
};

export default DashboardLayout;
