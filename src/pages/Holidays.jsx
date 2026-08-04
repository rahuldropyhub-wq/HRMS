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
  Search,
  MessageSquare,
  ChevronDown,
  LogOut,
  ListTodo,
  Ticket,
  PackageOpen,
  CalendarDays,
  Palmtree,
  Info
} from 'lucide-react';
import '../styles/dashboard.css';
import '../styles/holidays.css';

const HOLIDAYS_DATA = [
  { id: 1, date: '2025-01-01', name: 'New Year', type: 'Mandatory', passed: true },
  { id: 2, date: '2025-01-26', name: 'Republic Day', type: 'Mandatory', passed: true },
  { id: 3, date: '2025-03-14', name: 'Holi', type: 'Mandatory', passed: true },
  { id: 4, date: '2025-04-10', name: 'Good Friday', type: 'Optional', passed: false },
  { id: 5, date: '2025-05-01', name: 'Labour Day', type: 'Mandatory', passed: false },
  { id: 6, date: '2025-08-15', name: 'Independence Day', type: 'Mandatory', passed: false },
  { id: 7, date: '2025-10-02', name: 'Gandhi Jayanti', type: 'Mandatory', passed: false },
  { id: 8, date: '2025-10-21', name: 'Diwali', type: 'Mandatory', passed: false },
  { id: 9, date: '2025-12-25', name: 'Christmas', type: 'Mandatory', passed: false }
];

function Holidays() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const getMonthName = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString('default', { month: 'short' });
  };

  const getDayNum = (dateStr) => {
    const d = new Date(dateStr);
    return d.getDate().toString().padStart(2, '0');
  };

  const getWeekday = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString('default', { weekday: 'long' });
  };

  // Group holidays by month
  const groupedHolidays = HOLIDAYS_DATA.reduce((acc, holiday) => {
    const month = new Date(holiday.date).toLocaleString('default', { month: 'long' });
    if (!acc[month]) acc[month] = [];
    acc[month].push(holiday);
    return acc;
  }, {});

  const totalHolidays = HOLIDAYS_DATA.length;
  const upcomingHoliday = HOLIDAYS_DATA.find(h => !h.passed);

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
            <li>
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
            <li className="active">
              <Link to="/holidays" className="nav-item-content"><CalendarDays size={18} /> Holidays</Link>
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
            <input type="text" placeholder="Search holidays..." />
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

        {/* Holidays Content */}
        <div className="dashboard-content">
          <div className="holidays-wrapper">
            <div className="holidays-header">
              <div className="holidays-title">
                <h1>Holiday Calendar 2025</h1>
                <p>View all upcoming public and company holidays.</p>
              </div>

              <div className="holidays-stats">
                <div className="holiday-stat-card">
                  <div className="stat-icon primary">
                    <CalendarDays size={24} />
                  </div>
                  <div className="stat-info">
                    <p>Total Holidays</p>
                    <h3>{totalHolidays} Days</h3>
                  </div>
                </div>

                {upcomingHoliday && (
                  <div className="holiday-stat-card">
                    <div className="stat-icon warning">
                      <Palmtree size={24} />
                    </div>
                    <div className="stat-info">
                      <p>Upcoming Holiday</p>
                      <h3>{upcomingHoliday.name}</h3>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="holidays-list-container">
              {Object.keys(groupedHolidays).map((month) => (
                <div key={month} className="month-section">
                  <h3 className="month-title">{month}</h3>
                  <div className="holiday-grid">
                    {groupedHolidays[month].map((holiday) => (
                      <div key={holiday.id} className={`holiday-card ${holiday.passed ? 'passed' : ''}`}>
                        <div className="holiday-date-box">
                          <span className="h-month">{getMonthName(holiday.date)}</span>
                          <span className="h-day">{getDayNum(holiday.date)}</span>
                        </div>
                        <div className="holiday-details">
                          <h4>{holiday.name}</h4>
                          <p>
                            {getWeekday(holiday.date)} &bull; 
                            <span className={`holiday-type ${holiday.type.toLowerCase()}`}>
                              {holiday.type}
                            </span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Holidays;
