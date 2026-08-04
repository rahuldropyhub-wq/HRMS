import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserPlus, FileBadge, History,
  Clock, CalendarRange, MapPin, Activity, CalendarDays,
  CalendarOff, PieChart, ListTodo, CheckCircle2, FileText,
  ClipboardCheck, Ticket, HelpCircle, Package, Wrench,
  RefreshCw, UserCircle, ShieldCheck, Building2, Briefcase,
  CalendarClock, BarChart3, LineChart, Megaphone, Bell,
  Settings, Sliders, Mail, Lock, Database, LogOut, Search,
  Menu, X, ChevronLeft, ChevronRight, Plus, Moon
} from 'lucide-react';
import '../../styles/admin/admin-layout.css';

const AdminLayout = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  const renderNavItem = (icon, label, path, badge = null) => {
    const Icon = icon;
    return (
      <li>
        <Link to={path} className={`admin-nav-item ${isActive(path)}`} data-tooltip={label}>
          <Icon size={18} className="admin-nav-icon" />
          <span className="admin-nav-label">{label}</span>
          {badge && <span className="admin-nav-badge">{badge}</span>}
        </Link>
      </li>
    );
  };

  return (
    <div className="admin-layout">
      {/* Mobile Overlay */}
      <div 
        className={`admin-mobile-overlay ${isMobileMenuOpen ? 'active' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`admin-sidebar ${isSidebarCollapsed ? 'collapsed' : ''} ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="admin-sidebar-header">
          <div className="admin-brand">
            <img src="/Fevicon.png" alt="Icon" className="admin-logo-img" />
            <span className="admin-brand-text">Dropyhub Admin</span>
          </div>
          <button 
            className="admin-collapse-btn"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          >
            {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <div className="admin-nav-container">
          <div className="admin-nav-section">
            <h4 className="admin-nav-heading">Main Menu</h4>
            <ul className="admin-nav-list">
              {renderNavItem(LayoutDashboard, 'Dashboard', '/admin/dashboard')}
            </ul>
          </div>

          <div className="admin-nav-section">
            <h4 className="admin-nav-heading">Employee Management</h4>
            <ul className="admin-nav-list">
              {renderNavItem(Users, 'Employee Directory', '/admin/employees')}
              {renderNavItem(UserPlus, 'Add Employee', '/admin/employees/add')}
              {renderNavItem(FileBadge, 'Employee Documents', '/admin/employees/documents')}
            </ul>
          </div>

          <div className="admin-nav-section">
            <h4 className="admin-nav-heading">Attendance Management</h4>
            <ul className="admin-nav-list">
              {renderNavItem(Activity, 'Live Attendance', '/admin/attendance/live')}
              {renderNavItem(Clock, 'Attendance History', '/admin/attendance/history')}
              {renderNavItem(MapPin, 'WFH / GPS Tracking', '/admin/attendance/tracking')}
            </ul>
          </div>

          <div className="admin-nav-section">
            <h4 className="admin-nav-heading">Leave Management</h4>
            <ul className="admin-nav-list">
              {renderNavItem(CalendarDays, 'Leave Requests', '/admin/leaves', '12')}
              {renderNavItem(CalendarRange, 'Leave Calendar', '/admin/leaves/calendar')}
            </ul>
          </div>

          <div className="admin-nav-section">
            <h4 className="admin-nav-heading">Task & Worksheet</h4>
            <ul className="admin-nav-list">
              {renderNavItem(ListTodo, 'Task Dashboard', '/admin/tasks')}
              {renderNavItem(ClipboardCheck, 'Worksheets (Pending)', '/admin/worksheets', '5')}
            </ul>
          </div>

          <div className="admin-nav-section">
            <h4 className="admin-nav-heading">Tickets & Assets</h4>
            <ul className="admin-nav-list">
              {renderNavItem(Ticket, 'Open Tickets', '/admin/tickets', '3')}
              {renderNavItem(Package, 'Asset Inventory', '/admin/assets')}
            </ul>
          </div>

          <div className="admin-nav-section">
            <h4 className="admin-nav-heading">Organization</h4>
            <ul className="admin-nav-list">
              {renderNavItem(Building2, 'Departments', '/admin/organization/departments')}
              {renderNavItem(Briefcase, 'Designations', '/admin/organization/designations')}
            </ul>
          </div>

          <div className="admin-nav-section">
            <h4 className="admin-nav-heading">System</h4>
            <ul className="admin-nav-list">
              {renderNavItem(BarChart3, 'Reports & Analytics', '/admin/reports')}
              {renderNavItem(Settings, 'System Settings', '/admin/settings')}
              {renderNavItem(Database, 'Audit Logs', '/admin/logs')}
            </ul>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-main-wrapper">
        {/* Header */}
        <header className="admin-header">
          <div className="admin-header-left">
            <button className="mobile-drawer-btn" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={20} />
            </button>
            <div className="admin-breadcrumb">
              <span>Admin</span>
              <ChevronRight size={14} />
              <span className="admin-breadcrumb-current">Dashboard</span>
            </div>
          </div>

          <div className="admin-header-center">
            <div className="admin-search-box">
              <Search size={18} color="#94a3b8" />
              <input type="text" placeholder="Search employees, tickets, tasks..." />
            </div>
          </div>

          <div className="admin-header-right">
            <button className="admin-create-btn">
              <Plus size={18} />
              <span>Create</span>
            </button>
            <button className="admin-header-icon-btn">
              <Moon size={18} />
            </button>
            <button className="admin-header-icon-btn">
              <Bell size={18} />
              <span className="admin-header-badge">3</span>
            </button>
            <button className="admin-profile-trigger">
              <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Admin Profile" className="admin-profile-avatar" />
            </button>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="admin-content-area">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
