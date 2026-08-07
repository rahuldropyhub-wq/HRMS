import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, UserPlus, FileBadge, History,
  Clock, CalendarRange, MapPin, Activity, CalendarDays,
  CalendarOff, PieChart, ListTodo, CheckCircle2, FileText,
  ClipboardCheck, Ticket, HelpCircle, Package, Wrench,
  RefreshCw, UserCircle, ShieldCheck, Building2, Briefcase,
  CalendarClock, BarChart3, LineChart, Megaphone, Bell,
  Settings, Sliders, Mail, Lock, Database, LogOut, Search,
  Menu, X, ChevronLeft, ChevronRight, ChevronDown, Plus, Moon, Sun
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/admin/admin-layout.css';

const NavSection = ({ title, defaultExpanded = false, isSidebarCollapsed, children }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  
  // Force expand when sidebar is collapsed so icons are always visible
  const showContent = !title || isExpanded || isSidebarCollapsed;

  return (
    <div className="admin-nav-section">
      {title && (
        <div 
          className="admin-nav-heading" 
          onClick={() => !isSidebarCollapsed && setIsExpanded(!isExpanded)}
          style={{ cursor: isSidebarCollapsed ? 'default' : 'pointer' }}
        >
          <motion.span
            initial={false}
            animate={{ 
              opacity: isSidebarCollapsed ? 0 : 1, 
              height: isSidebarCollapsed ? 0 : 'auto',
              display: isSidebarCollapsed ? 'none' : 'block' 
            }}
          >
            {title}
          </motion.span>
          {!isSidebarCollapsed && (
            isExpanded ? <ChevronDown size={14} className="admin-nav-chevron" /> : <ChevronRight size={14} className="admin-nav-chevron" />
          )}
        </div>
      )}
      
      <AnimatePresence initial={false}>
        {showContent && (
          <motion.ul 
            className="admin-nav-list"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { opacity: 1, height: 'auto' },
              collapsed: { opacity: 0, height: 0 }
            }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {children}
          </motion.ul>
        )}
      </AnimatePresence>
      {!isSidebarCollapsed && <div className="nav-section-divider" />}
    </div>
  );
};

const AdminLayout = () => {
  const { logout } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('dropyhub-theme');
    if (saved === 'dark') {
      document.body.classList.add('dark-mode');
      setIsDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    setIsDarkMode(isDark);
    localStorage.setItem('dropyhub-theme', isDark ? 'dark' : 'light');
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  const getBreadcrumbName = () => {
    const path = location.pathname;
    if (path === '/admin/dashboard' || path === '/admin') return 'Dashboard';
    const segments = path.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1];
    return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/-/g, ' ');
  };

  const renderNavItem = (icon, label, path, badge = null) => {
    const Icon = icon;
    return (
      <li key={path} className="nav-item-wrapper" style={{ position: 'relative' }}>
        <Link to={path} className={`admin-nav-item ${isActive(path)}`}>
          <Icon size={18} className="admin-nav-icon" />
          <motion.span 
            className="admin-nav-label"
            initial={false}
            animate={{ 
              opacity: isSidebarCollapsed ? 0 : 1,
              width: isSidebarCollapsed ? 0 : 'auto',
              display: isSidebarCollapsed ? 'none' : 'block'
            }}
          >
            {label}
          </motion.span>
          {badge && (
            <motion.span 
              className="admin-nav-badge"
              animate={{
                opacity: isSidebarCollapsed ? 0 : 1,
                display: isSidebarCollapsed ? 'none' : 'block'
              }}
            >
              {badge}
            </motion.span>
          )}
        </Link>
        {isSidebarCollapsed && (
          <div className="nav-tooltip">{label}</div>
        )}
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
      <motion.aside 
        className={`admin-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''} ${isSidebarCollapsed ? 'collapsed' : ''}`}
        initial={false}
        animate={{ width: isSidebarCollapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <div className="admin-sidebar-header">
          <div className="admin-brand">
            <img src="/Fevicon.png" alt="Icon" className="admin-logo-img" />
            <motion.span 
              className="admin-brand-text"
              initial={false}
              animate={{ opacity: isSidebarCollapsed ? 0 : 1, display: isSidebarCollapsed ? 'none' : 'block' }}
            >
              Dropyhub Admin
            </motion.span>
          </div>
          <button 
            className="admin-collapse-btn"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          >
            {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <div className="admin-nav-container">
          <NavSection isSidebarCollapsed={isSidebarCollapsed}>
            {renderNavItem(LayoutDashboard, 'Dashboard', '/admin/dashboard')}
          </NavSection>

          <NavSection title="Employee Management" defaultExpanded={false} isSidebarCollapsed={isSidebarCollapsed}>
            {renderNavItem(Users, 'Employee Directory', '/admin/employees')}
          </NavSection>

          <NavSection title="Attendance Management" defaultExpanded={false} isSidebarCollapsed={isSidebarCollapsed}>
            {renderNavItem(Activity, 'Live Attendance', '/admin/attendance/live')}
            {renderNavItem(Clock, 'Attendance History', '/admin/attendance/history')}
            {renderNavItem(MapPin, 'WFH / GPS Tracking', '/admin/attendance/wfh-tracking')}
          </NavSection>

          <NavSection title="Leave Management" defaultExpanded={false} isSidebarCollapsed={isSidebarCollapsed}>
            {renderNavItem(CalendarDays, 'Leave Requests', '/admin/leave/requests', '12')}
            {renderNavItem(CalendarRange, 'Leave Calendar', '/admin/leave/calendar')}
          </NavSection>

          <NavSection title="Task & Worksheet" defaultExpanded={false} isSidebarCollapsed={isSidebarCollapsed}>
            {renderNavItem(ListTodo, 'Task Dashboard', '/admin/tasks')}
            {renderNavItem(ClipboardCheck, 'Worksheets (Pending)', '/admin/worksheets', '5')}
          </NavSection>

          <NavSection title="Tickets & Assets" defaultExpanded={false} isSidebarCollapsed={isSidebarCollapsed}>
            {renderNavItem(Ticket, 'Ticket Queue', '/admin/tickets', '3')}
            {renderNavItem(Package, 'Asset Inventory', '/admin/assets')}
          </NavSection>

          <NavSection title="Organization" defaultExpanded={false} isSidebarCollapsed={isSidebarCollapsed}>
            {renderNavItem(Building2, 'Departments', '/admin/organization/departments')}
            {renderNavItem(Briefcase, 'Designations', '/admin/organization/designations')}
            {renderNavItem(Users, 'Org Chart', '/admin/organization/chart')}
            {renderNavItem(CalendarOff, 'Company Holidays', '/admin/organization/holidays')}
            {renderNavItem(Megaphone, 'Announcements', '/admin/announcements')}
          </NavSection>

          <NavSection title="Reports & Analytics" defaultExpanded={false} isSidebarCollapsed={isSidebarCollapsed}>
            {renderNavItem(BarChart3, 'Reports Dashboard', '/admin/reports')}
            {renderNavItem(Activity, 'Attendance Report', '/admin/reports/attendance')}
            {renderNavItem(CalendarRange, 'Leave Report', '/admin/reports/leave')}
          </NavSection>

          <NavSection title="Settings" defaultExpanded={false} isSidebarCollapsed={isSidebarCollapsed}>
            {renderNavItem(Settings, 'Admin Settings', '/admin/settings')}
            {renderNavItem(ShieldCheck, 'Roles & Permissions', '/admin/settings/roles')}
            {renderNavItem(Database, 'Audit Logs', '/admin/audit-logs')}
          </NavSection>

          {/* Logout Button */}
          <div className="admin-nav-section" style={{ marginTop: 'auto' }}>
            <button 
              className={`admin-nav-item ${isSidebarCollapsed ? 'collapsed' : ''}`} 
              onClick={logout}
              style={{ width: '100%', background: 'transparent', border: 'none', color: '#ef4444', justifyContent: 'flex-start' }}
            >
              <LogOut size={18} />
              <motion.span 
                className="admin-nav-text"
                initial={false}
                animate={{ opacity: isSidebarCollapsed ? 0 : 1, display: isSidebarCollapsed ? 'none' : 'block' }}
              >
                Logout
              </motion.span>
            </button>
          </div>
        </div>
      </motion.aside>

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
              <span className="admin-breadcrumb-current">{getBreadcrumbName()}</span>
            </div>
          </div>

          <div className="admin-header-center">
            <div className="admin-search-box">
              <Search size={18} color="#94a3b8" />
              <input type="text" placeholder="Search employees, tickets, tasks..." />
            </div>
          </div>

          <div className="admin-header-right">
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
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
