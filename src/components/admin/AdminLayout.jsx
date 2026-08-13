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
  Menu, X, ChevronLeft, ChevronRight, ChevronDown, Plus, Moon, Sun,
  FolderKanban
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import '../../styles/admin/admin-layout.css';

const NavSection = ({ title, defaultExpanded = false, isSidebarCollapsed, children }) => {
  const location = useLocation();

  const hasActiveChild = React.useMemo(() => {
    let active = false;
    React.Children.forEach(children, child => {
      if (!child) return;
      if (child.key && location.pathname.startsWith(String(child.key))) {
        active = true;
      }
    });
    return active;
  }, [location.pathname, children]);

  const [isExpanded, setIsExpanded] = useState(defaultExpanded || hasActiveChild);

  useEffect(() => {
    if (hasActiveChild) {
      setIsExpanded(true);
    }
  }, [hasActiveChild]);

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
  const { logout, user, profile } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [pendingLeaveCount, setPendingLeaveCount] = useState(0);
  const [pendingWorksheetCount, setPendingWorksheetCount] = useState(0);
  const [openTicketCount, setOpenTicketCount] = useState(0);
  const location = useLocation();

  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('dropyhub-theme');
    if (saved === 'dark') {
      document.body.classList.add('dark-mode');
      setIsDarkMode(true);
    }

    // Fetch initial original badge counts from DB
    const fetchBadgeCounts = async () => {
      try {
        // 1. Pending Leaves count (check leave_requests table)
        const { data: leaveReqs } = await supabase
          .from('leave_requests')
          .select('id, status');
        
        const pLeaves = leaveReqs 
          ? leaveReqs.filter(l => (l.status || '').toLowerCase() === 'pending').length 
          : 0;
        setPendingLeaveCount(pLeaves);

        // 2. Pending Worksheets count
        const { data: wsData } = await supabase
          .from('worksheets')
          .select('id, status');

        const pWorksheets = wsData 
          ? wsData.filter(w => (w.status || '').toLowerCase() === 'pending' || (w.status || '').toLowerCase() === 'submitted').length 
          : 0;
        setPendingWorksheetCount(pWorksheets);

        // 3. Open Tickets count
        const { data: tickData } = await supabase
          .from('tickets')
          .select('id, status');

        const oTickets = tickData 
          ? tickData.filter(t => (t.status || '').toLowerCase() === 'open' || (t.status || '').toLowerCase() === 'pending').length 
          : 0;
        setOpenTicketCount(oTickets);

        setNotificationCount(pLeaves + oTickets);
      } catch (err) {
        console.error("Error fetching badge counts:", err);
      }
    };
    
    fetchBadgeCounts();

    // Real-time subscription for leaves, worksheets, and tickets
    const leaveSub = supabase.channel('leave_reqs-changes-admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leave_requests' }, () => {
        fetchBadgeCounts();
      }).subscribe();

    const ticketSub = supabase.channel('tickets-changes-admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, () => {
        fetchBadgeCounts();
      }).subscribe();

    return () => {
      supabase.removeChannel(leaveSub);
      supabase.removeChannel(ticketSub);
    };
  }, []);

  const toggleDarkMode = () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    setIsDarkMode(isDark);
    localStorage.setItem('dropyhub-theme', isDark ? 'dark' : 'light');
  };

  const getBreadcrumbName = () => {
    const path = location.pathname;
    if (path === '/admin/dashboard' || path === '/admin') return 'Dashboard';
    const segments = path.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1];
    return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/-/g, ' ');
  };

  const renderNavItem = (Icon, label, path, badge = null) => {
    const active = location.pathname === path;
    return (
      <li key={path}>
        <Link 
          to={path} 
          className={`admin-nav-item ${active ? 'active' : ''} ${isSidebarCollapsed ? 'collapsed' : ''}`}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <Icon size={18} className="admin-nav-icon" />
          <motion.span 
            className="admin-nav-text"
            initial={false}
            animate={{ opacity: isSidebarCollapsed ? 0 : 1, display: isSidebarCollapsed ? 'none' : 'block' }}
          >
            {label}
          </motion.span>
          {badge && !isSidebarCollapsed && (
            <span className="admin-nav-badge">{badge}</span>
          )}
        </Link>
      </li>
    );
  };

  return (
    <div className="admin-layout">
      {/* Mobile Topbar */}
      <div className="admin-mobile-header">
        <div className="admin-brand">
          <img src="/Fevicon.png" alt="Icon" className="admin-logo-img" />
          <span>Dropyhub Admin</span>
        </div>
        <button 
          className="admin-mobile-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Backdrop Overlay */}
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

          <NavSection isSidebarCollapsed={isSidebarCollapsed}>
            {renderNavItem(Users, 'Employee Management', '/admin/employees')}
          </NavSection>

          <NavSection title="Attendance Management" defaultExpanded={false} isSidebarCollapsed={isSidebarCollapsed}>
            {renderNavItem(Activity, 'Live Attendance', '/admin/attendance/live')}
            {renderNavItem(Clock, 'Attendance History', '/admin/attendance/history')}
          </NavSection>

          <NavSection title="Leave Management" defaultExpanded={false} isSidebarCollapsed={isSidebarCollapsed}>
            {renderNavItem(CalendarDays, 'Leave Requests', '/admin/leave/requests', pendingLeaveCount > 0 ? String(pendingLeaveCount) : null)}
            {renderNavItem(CalendarRange, 'Leave Calendar', '/admin/leave/calendar')}
          </NavSection>

          <NavSection title="Task & Worksheet" defaultExpanded={false} isSidebarCollapsed={isSidebarCollapsed}>
            {renderNavItem(FolderKanban, 'Projects', '/admin/projects')}
            {renderNavItem(ListTodo, 'Task Dashboard', '/admin/tasks')}
            {renderNavItem(ClipboardCheck, 'Worksheets (Pending)', '/admin/worksheets', pendingWorksheetCount > 0 ? String(pendingWorksheetCount) : null)}
          </NavSection>

          <NavSection title="Tickets & Assets" defaultExpanded={false} isSidebarCollapsed={isSidebarCollapsed}>
            {renderNavItem(Ticket, 'Ticket Queue', '/admin/tickets', openTicketCount > 0 ? String(openTicketCount) : null)}
            {renderNavItem(Package, 'Asset Inventory', '/admin/assets')}
          </NavSection>

          <NavSection title="Organization" defaultExpanded={false} isSidebarCollapsed={isSidebarCollapsed}>
            {renderNavItem(Building2, 'Departments', '/admin/organization/departments')}
            {renderNavItem(Briefcase, 'Designations', '/admin/organization/designations')}
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

          <div className="admin-header-right" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button className="admin-header-icon-btn" style={{ position: 'relative' }}>
              <Bell size={18} />
              {notificationCount > 0 && <span className="admin-header-badge">{notificationCount}</span>}
            </button>
            <div className="admin-profile-trigger" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-color, #1e293b)' }}>
                  {profile ? `${profile.first_name} ${profile.last_name}` : (user?.email?.split('@')[0] || 'Admin')}
                </span>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Administrator</span>
              </div>
              <img 
                src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile ? `${profile.first_name} ${profile.last_name}` : (user?.email || 'Admin'))}&background=6366f1&color=fff`} 
                alt="Admin Profile" 
                className="admin-profile-avatar" 
              />
            </div>
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
