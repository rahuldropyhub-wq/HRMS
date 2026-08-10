import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, CheckSquare, Calendar, FileText,
  ListTodo, Ticket, PackageOpen, CalendarDays, Settings,
  LogOut, Search, Bell, ChevronDown, User,
  Menu, X, Mail, Check, CheckCheck
} from 'lucide-react';
import { getUnreadNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../../services/employeeService';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/employee/dashboard.css';

const DashboardLayout = ({ children }) => {
  const { logout, profile, user } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (user?.id) {
      getUnreadNotifications(user.id).then(({ data }) => {
        if (data) setNotifications(data);
      });
    }
  }, [user]);

  const handleMarkAsRead = async (id) => {
    await markNotificationAsRead(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;
    await markAllNotificationsAsRead(user.id);
    setNotifications([]);
  };

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
          <div style={{ position: 'relative' }}>
            <button className="icon-btn notification" onClick={() => setIsNotifOpen(!isNotifOpen)}>
              <Bell size={20} />
              {notifications.length > 0 && <span className="dot">{notifications.length}</span>}
            </button>
            
            {isNotifOpen && (
              <>
                <div className="dropdown-backdrop" onClick={() => setIsNotifOpen(false)} />
                <div className="profile-dropdown" style={{ width: 280, padding: 0, overflow: 'hidden', right: -45 }}>
                  <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ margin: 0, fontSize: '14px', color: '#111827' }}>Notifications</h4>
                    {notifications.length > 0 && (
                      <button onClick={handleMarkAllAsRead} style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCheck size={14} /> Mark all read
                      </button>
                    )}
                  </div>
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
                        No new notifications
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div key={notif.id} style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }} className="notif-item">
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>{notif.title}</div>
                            <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.4 }}>{notif.message}</div>
                          </div>
                          <button onClick={() => handleMarkAsRead(notif.id)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '4px' }} title="Mark as read">
                            <Check size={16} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <div style={{ position: 'relative' }}>
            <div className="user-avatar-small" onClick={() => setIsProfileOpen(!isProfileOpen)}>
               <img src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.first_name || 'User')}&background=random`} alt="Profile" />
            </div>

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
              <div className="nav-item-content logout-item" onClick={logout} style={{ cursor: 'pointer' }}>
                <LogOut size={18} /> Logout
              </div>
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
            <div style={{ position: 'relative' }}>
              <button className="icon-btn notification" onClick={() => setIsNotifOpen(!isNotifOpen)}>
                <Bell size={20} />
                {notifications.length > 0 && <span className="dot">{notifications.length}</span>}
              </button>
              
              {isNotifOpen && (
                <>
                  <div className="dropdown-backdrop" onClick={() => setIsNotifOpen(false)} />
                  <div className="profile-dropdown" style={{ width: 320, padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ margin: 0, fontSize: '14px', color: '#111827' }}>Notifications</h4>
                      {notifications.length > 0 && (
                        <button onClick={handleMarkAllAsRead} style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCheck size={14} /> Mark all read
                        </button>
                      )}
                    </div>
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {notifications.length === 0 ? (
                        <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
                          No new notifications
                        </div>
                      ) : (
                        notifications.map(notif => (
                          <div key={notif.id} style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }} className="notif-item">
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>{notif.title}</div>
                              <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.4 }}>{notif.message}</div>
                            </div>
                            <button onClick={() => handleMarkAsRead(notif.id)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '4px' }} title="Mark as read">
                              <Check size={16} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="user-profile" onClick={() => setIsProfileOpen(!isProfileOpen)}>
              <div className="avatar">
                <img src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.first_name || 'User')}&background=random`} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              </div>
              <div className="user-info">
                <h4>{profile ? `${profile.first_name} ${profile.last_name}` : (user?.email?.split('@')[0] || 'Employee')}</h4>
                <p>{profile?.designations?.title || 'Employee'}</p>
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
        <Link to="/attendance" className={`bottom-nav-item ${isActive('/attendance')}`}>
          <CheckSquare size={22} />
          <span>Attendance</span>
        </Link>
        <Link to="/leave-management" className={`bottom-nav-item ${isActive('/leave-management')}`}>
          <Calendar size={22} />
          <span>Leave</span>
        </Link>
        <Link to="/dashboard" className={`bottom-nav-item bottom-nav-fab ${isActive('/dashboard')}`}>
          <LayoutDashboard size={24} />
          <span>Home</span>
        </Link>
        <Link to="/worksheet" className={`bottom-nav-item ${isActive('/worksheet')}`}>
          <FileText size={22} />
          <span>Worksheet</span>
        </Link>
        <Link to="/tickets" className={`bottom-nav-item ${isActive('/tickets')}`}>
          <Ticket size={22} />
          <span>Tickets</span>
        </Link>
      </nav>
    </div>
  );
};

export default DashboardLayout;
