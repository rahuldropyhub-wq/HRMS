import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, UserCheck, Building, Home, Ticket, ClipboardList,
  Check, X, FileText, CheckCircle, Package, UserPlus, FileBadge,
  Megaphone, Calendar as CalendarIcon, Download, Clock
} from 'lucide-react';
import '../../styles/admin/admin-dashboard.css';
import { useAuth } from '../../contexts/AuthContext';
import { getDashboardStats, getAllAttendanceToday } from '../../services/adminService';
import CelebrationsWidget from '../../components/shared/CelebrationsWidget';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats, setStats] = useState({ totalEmployees: 0, presentToday: 0, pendingLeaves: 0, openTickets: 0 });
  const [liveEmployees, setLiveEmployees] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const { profile } = useAuth();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadStats = async () => {
      setLoadingStats(true);
      const [data, attendanceRes] = await Promise.all([
        getDashboardStats(),
        getAllAttendanceToday()
      ]);
      setStats(data);
      if (attendanceRes.data) {
        setLiveEmployees(attendanceRes.data.slice(0, 5)); // Show top 5
      }
      setLoadingStats(false);
    };
    loadStats();
  }, []);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{ duration: 0.3 }} className="admin-dashboard-wrapper">
      
        {/* SECTION 1: Welcome Banner */}
        <section className="welcome-banner">
          <div className="welcome-text">
            <h1>Welcome back, {profile?.first_name || 'Admin'} 👋</h1>
            <p>Here's what's happening at Dropyhub today.</p>
          </div>
          <div className="welcome-meta">
            <div className="welcome-meta-item">
              <h3>Date</h3>
              <p>{formatDate(currentTime)}</p>
            </div>
            <div className="welcome-meta-item">
              <h3>Time</h3>
              <p>{formatTime(currentTime)}</p>
            </div>
            <div className="welcome-meta-item">
              <h3>Office Status</h3>
              <p style={{ color: '#4ade80' }}>● Open</p>
            </div>
          </div>
        </section>

        {/* SECTION 2: Company Overview KPIs */}
        <section className="admin-kpi-grid">
          <div className="kpi-card">
            <div className="kpi-icon-wrapper blue"><Users size={20} /></div>
            <div>
              <div className="kpi-title">Total Employees</div>
              <div className="kpi-value">{loadingStats ? '...' : stats.totalEmployees}</div>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon-wrapper green"><UserCheck size={20} /></div>
            <div>
              <div className="kpi-title">Present Today</div>
              <div className="kpi-value">{loadingStats ? '...' : stats.presentToday}</div>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon-wrapper orange"><ClipboardList size={20} /></div>
            <div>
              <div className="kpi-title">Pending Leaves</div>
              <div className="kpi-value">{loadingStats ? '...' : stats.pendingLeaves}</div>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon-wrapper red"><Ticket size={20} /></div>
            <div>
              <div className="kpi-title">Open Tickets</div>
              <div className="kpi-value">{loadingStats ? '...' : stats.openTickets}</div>
            </div>
          </div>
        </section>

        <div className="admin-split-layout">
          
          {/* LEFT COLUMN */}
          <div className="admin-layout-left" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* SECTION 3: Live Employee Status */}
            <section className="admin-card">
              <div className="admin-card-header">
                <h3 className="admin-card-title">Live Employee Status</h3>
                <Link to="/admin/attendance/live" className="admin-card-action">View All</Link>
              </div>
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Department</th>
                      <th>Current Status</th>
                      <th>Work Mode</th>
                      <th>Working Hours</th>
                      <th>Current Activity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingStats ? (
                      <tr>
                        <td colSpan="6" style={{textAlign: 'center', padding: '24px', color: '#6b7280'}}>Loading live data...</td>
                      </tr>
                    ) : liveEmployees.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{textAlign: 'center', padding: '24px', color: '#6b7280'}}>No live tracking data available</td>
                      </tr>
                    ) : (
                      liveEmployees.map(emp => (
                        <tr key={emp.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                                {emp.profiles?.first_name?.[0]}{emp.profiles?.last_name?.[0]}
                              </div>
                              <div>
                                <div style={{ fontWeight: '500', color: '#111827' }}>{emp.profiles?.first_name} {emp.profiles?.last_name}</div>
                              </div>
                            </div>
                          </td>
                          <td>{emp.profiles?.departments?.name || '-'}</td>
                          <td>
                            <span style={{ padding: '4px 8px', borderRadius: '9999px', fontSize: '12px', fontWeight: '500', background: emp.status === 'working' ? '#dcfce7' : '#fee2e2', color: emp.status === 'working' ? '#166534' : '#991b1b' }}>
                              {emp.status === 'working' ? 'Working' : 'Away'}
                            </span>
                          </td>
                          <td>{emp.work_mode === 'remote' ? 'Remote' : 'Office'}</td>
                          <td>{emp.total_hours ? emp.total_hours.toFixed(1) + ' hrs' : '-'}</td>
                          <td style={{ color: '#6b7280', fontSize: '14px' }}>Active in IDE</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* SECTION 5: Today's Attendance Overview */}
            <section className="admin-card">
              <div className="admin-card-header">
                <h3 className="admin-card-title">Today's Attendance Overview</h3>
                <Link to="/admin/reports" className="admin-card-action">Generate Report</Link>
              </div>
              <div className="attendance-overview-grid">
                <div className="attendance-stat">
                  <h3>{loadingStats ? '...' : stats.presentToday}</h3>
                  <p>Present</p>
                </div>
                <div className="attendance-stat">
                  <h3 style={{ color: '#ef4444' }}>{loadingStats ? '...' : stats.absentToday}</h3>
                  <p>Absent</p>
                </div>
                <div className="attendance-stat">
                  <h3 style={{ color: '#f97316' }}>{loadingStats ? '...' : stats.lateToday}</h3>
                  <p>Late</p>
                </div>
                <div className="attendance-stat">
                  <h3>{loadingStats ? '...' : stats.onLeaveToday}</h3>
                  <p>On Leave</p>
                </div>
                <div className="attendance-stat">
                  <h3 style={{ color: '#22c55e' }}>{loadingStats ? '...' : stats.workingNow}</h3>
                  <p>Working</p>
                </div>
                <div className="attendance-stat">
                  <h3 style={{ color: '#3b82f6' }}>{loadingStats ? '...' : stats.onBreakNow}</h3>
                  <p>On Break</p>
                </div>
              </div>
            </section>

            {/* SECTION 7: Quick Actions */}
            <section className="admin-card">
              <div className="admin-card-header">
                <h3 className="admin-card-title">Quick Actions</h3>
              </div>
              <div className="quick-actions-grid">
                <button className="quick-action-btn" onClick={() => navigate('/admin/employees/add')}>
                  <UserPlus size={24} color="#3b82f6" />
                  Add Employee
                </button>
                <button className="quick-action-btn" onClick={() => navigate('/admin/tasks/create')}>
                  <CheckCircle size={24} color="#22c55e" />
                  Create Task
                </button>
                <button className="quick-action-btn" onClick={() => navigate('/admin/leave/requests')}>
                  <CalendarIcon size={24} color="#f97316" />
                  Approve Leave
                </button>
                <button className="quick-action-btn" onClick={() => navigate('/admin/assets/assign')}>
                  <Package size={24} color="#a855f7" />
                  Issue Asset
                </button>
                <button className="quick-action-btn" onClick={() => navigate('/admin/announcements')}>
                  <Megaphone size={24} color="#ef4444" />
                  Publish Announcement
                </button>
                <button className="quick-action-btn" onClick={() => navigate('/admin/reports')}>
                  <Download size={24} color="#64748b" />
                  Generate Report
                </button>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN */}
          <div className="admin-layout-right" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* SECTION 4: Pending Approvals */}
            <section className="admin-card">
              <div className="admin-card-header">
                <h3 className="admin-card-title">Pending Approvals</h3>
                <Link to="/admin/approvals" className="admin-card-action">View All</Link>
              </div>
              <div className="approval-list">
                <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
                  No pending approvals
                </div>
              </div>
            </section>

            {/* SECTION 6: Recent Activities */}
            <section className="admin-card">
              <div className="admin-card-header">
                <h3 className="admin-card-title">Recent Activities</h3>
              </div>
              <div className="timeline">
                <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
                  No recent activities
                </div>
              </div>
            </section>

            {/* SECTION 8 & 9: Announcements & Calendar combined */}
            <section className="admin-card">
              <div className="admin-card-header">
                <h3 className="admin-card-title">Today's Calendar</h3>
              </div>
              <div className="calendar-list">
                <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
                  No calendar events today
                </div>
              </div>
            </section>

            {/* SECTION: Celebrations & Appreciations */}
            <section className="admin-card" style={{ padding: 0 }}>
              <CelebrationsWidget isAdmin={true} />
            </section>

          </div>
        </div>

        {/* SECTION 10: Footer */}
        <footer className="admin-footer">
          <div>Dropyhub HRMS Enterprise v2.4.0</div>
          <div className="footer-links">
            <a href="#">Support</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
          <div>&copy; 2026 Dropyhub. All rights reserved.</div>
        </footer>

    </motion.div>
  );
};

export default AdminDashboard;
