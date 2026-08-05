import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, UserCheck, Building, Home, Ticket, ClipboardList,
  Check, X, FileText, CheckCircle, Package, UserPlus, FileBadge,
  Megaphone, Calendar as CalendarIcon, Download, Clock
} from 'lucide-react';
import '../../styles/admin/admin-dashboard.css';

const AdminDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
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
            <h1>Welcome back, Super Admin</h1>
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
              <div className="kpi-value">124</div>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon-wrapper green"><UserCheck size={20} /></div>
            <div>
              <div className="kpi-title">Present Today</div>
              <div className="kpi-value">118</div>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon-wrapper purple"><Building size={20} /></div>
            <div>
              <div className="kpi-title">Work From Office</div>
              <div className="kpi-value">82</div>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon-wrapper orange"><Home size={20} /></div>
            <div>
              <div className="kpi-title">Work From Home</div>
              <div className="kpi-value">36</div>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon-wrapper red"><Ticket size={20} /></div>
            <div>
              <div className="kpi-title">Open Tickets</div>
              <div className="kpi-value">14</div>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon-wrapper blue"><ClipboardList size={20} /></div>
            <div>
              <div className="kpi-title">Pending Approvals</div>
              <div className="kpi-value">27</div>
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
                    <tr>
                      <td>
                        <div className="employee-cell">
                          <img src="https://i.pravatar.cc/150?img=11" alt="Profile" />
                          <div className="employee-info">
                            <h4>Rahul Sharma</h4>
                            <p>EMP-001</p>
                          </div>
                        </div>
                      </td>
                      <td>Engineering</td>
                      <td><span className="status-badge working">Working</span></td>
                      <td>Office</td>
                      <td>4h 15m</td>
                      <td>Frontend Development</td>
                    </tr>
                    <tr>
                      <td>
                        <div className="employee-cell">
                          <img src="https://i.pravatar.cc/150?img=5" alt="Profile" />
                          <div className="employee-info">
                            <h4>Priya Patel</h4>
                            <p>EMP-042</p>
                          </div>
                        </div>
                      </td>
                      <td>Marketing</td>
                      <td><span className="status-badge meeting">In Meeting</span></td>
                      <td>WFH</td>
                      <td>3h 45m</td>
                      <td>Q3 Planning Sync</td>
                    </tr>
                    <tr>
                      <td>
                        <div className="employee-cell">
                          <img src="https://i.pravatar.cc/150?img=12" alt="Profile" />
                          <div className="employee-info">
                            <h4>Amit Kumar</h4>
                            <p>EMP-028</p>
                          </div>
                        </div>
                      </td>
                      <td>Sales</td>
                      <td><span className="status-badge break">On Break</span></td>
                      <td>Office</td>
                      <td>5h 20m</td>
                      <td>Lunch Break</td>
                    </tr>
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
                  <h3>118</h3>
                  <p>Present</p>
                </div>
                <div className="attendance-stat">
                  <h3 style={{ color: '#ef4444' }}>6</h3>
                  <p>Absent</p>
                </div>
                <div className="attendance-stat">
                  <h3 style={{ color: '#f97316' }}>12</h3>
                  <p>Late</p>
                </div>
                <div className="attendance-stat">
                  <h3>4</h3>
                  <p>On Leave</p>
                </div>
                <div className="attendance-stat">
                  <h3 style={{ color: '#22c55e' }}>98</h3>
                  <p>Working</p>
                </div>
                <div className="attendance-stat">
                  <h3 style={{ color: '#3b82f6' }}>20</h3>
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
                <button className="quick-action-btn">
                  <UserPlus size={24} color="#3b82f6" />
                  Add Employee
                </button>
                <button className="quick-action-btn">
                  <CheckCircle size={24} color="#22c55e" />
                  Create Task
                </button>
                <button className="quick-action-btn">
                  <CalendarIcon size={24} color="#f97316" />
                  Approve Leave
                </button>
                <button className="quick-action-btn">
                  <Package size={24} color="#a855f7" />
                  Issue Asset
                </button>
                <button className="quick-action-btn">
                  <Megaphone size={24} color="#ef4444" />
                  Publish Announcement
                </button>
                <button className="quick-action-btn">
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
                <div className="approval-item">
                  <div className="approval-info">
                    <div className="approval-icon"><CalendarIcon size={16} /></div>
                    <div className="approval-details">
                      <h4>Leave Request</h4>
                      <p>Sick Leave • Priya Patel</p>
                    </div>
                  </div>
                  <div className="approval-actions">
                    <button className="btn-icon approve" title="Approve"><Check size={14} /></button>
                    <button className="btn-icon reject" title="Reject"><X size={14} /></button>
                  </div>
                </div>
                <div className="approval-item">
                  <div className="approval-info">
                    <div className="approval-icon"><FileText size={16} /></div>
                    <div className="approval-details">
                      <h4>Worksheet Review</h4>
                      <p>Jul 15, 2026 • Amit Kumar</p>
                    </div>
                  </div>
                  <div className="approval-actions">
                    <button className="btn-icon approve" title="Approve"><Check size={14} /></button>
                    <button className="btn-icon reject" title="Reject"><X size={14} /></button>
                  </div>
                </div>
                <div className="approval-item">
                  <div className="approval-info">
                    <div className="approval-icon"><CheckCircle size={16} /></div>
                    <div className="approval-details">
                      <h4>Task Review</h4>
                      <p>Homepage Redesign • Rahul S.</p>
                    </div>
                  </div>
                  <div className="approval-actions">
                    <button className="btn-icon approve" title="Approve"><Check size={14} /></button>
                    <button className="btn-icon reject" title="Reject"><X size={14} /></button>
                  </div>
                </div>
                <div className="approval-item">
                  <div className="approval-info">
                    <div className="approval-icon"><Package size={16} /></div>
                    <div className="approval-details">
                      <h4>Asset Request</h4>
                      <p>MacBook Pro • Neha G.</p>
                    </div>
                  </div>
                  <div className="approval-actions">
                    <button className="btn-icon approve" title="Approve"><Check size={14} /></button>
                    <button className="btn-icon reject" title="Reject"><X size={14} /></button>
                  </div>
                </div>
                <div className="approval-item">
                  <div className="approval-info">
                    <div className="approval-icon"><FileBadge size={16} /></div>
                    <div className="approval-details">
                      <h4>Document Verification</h4>
                      <p>Aadhar Card • Vikram S.</p>
                    </div>
                  </div>
                  <div className="approval-actions">
                    <button className="btn-icon approve" title="Approve"><Check size={14} /></button>
                    <button className="btn-icon reject" title="Reject"><X size={14} /></button>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 6: Recent Activities */}
            <section className="admin-card">
              <div className="admin-card-header">
                <h3 className="admin-card-title">Recent Activities</h3>
              </div>
              <div className="timeline">
                <div className="timeline-item">
                  <div className="timeline-icon"><CheckCircle size={16} /></div>
                  <div className="timeline-content">
                    <h4>Task Completed</h4>
                    <p>Rahul Sharma completed "API Integration"</p>
                    <span className="timeline-time">10 mins ago</span>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-icon" style={{ borderColor: '#22c55e', color: '#22c55e' }}><UserCheck size={16} /></div>
                  <div className="timeline-content">
                    <h4>Employee Started Work</h4>
                    <p>Priya Patel punched in</p>
                    <span className="timeline-time">45 mins ago</span>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-icon" style={{ borderColor: '#f97316', color: '#f97316' }}><Ticket size={16} /></div>
                  <div className="timeline-content">
                    <h4>Ticket Raised</h4>
                    <p>IT Support: "Monitor not working" by Amit</p>
                    <span className="timeline-time">2 hours ago</span>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-icon" style={{ borderColor: '#a855f7', color: '#a855f7' }}><Megaphone size={16} /></div>
                  <div className="timeline-content">
                    <h4>Announcement Published</h4>
                    <p>Townhall Meeting Scheduled</p>
                    <span className="timeline-time">3 hours ago</span>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 8 & 9: Announcements & Calendar combined */}
            <section className="admin-card">
              <div className="admin-card-header">
                <h3 className="admin-card-title">Today's Calendar</h3>
              </div>
              <div className="calendar-list">
                <div className="calendar-item">
                  <div className="date-block">
                    <span className="month">Aug</span>
                    <span className="day">04</span>
                  </div>
                  <div className="item-content">
                    <h4>All Hands Meeting</h4>
                    <p>10:00 AM - 11:30 AM</p>
                  </div>
                </div>
                <div className="calendar-item">
                  <div className="date-block" style={{ background: '#fef2f2', color: '#ef4444' }}>
                    <span className="month">Aug</span>
                    <span className="day">04</span>
                  </div>
                  <div className="item-content">
                    <h4>Rahul's Birthday</h4>
                    <p>Engineering Team</p>
                  </div>
                </div>
                <div className="calendar-item">
                  <div className="date-block" style={{ background: '#fff7ed', color: '#f97316' }}>
                    <span className="month">Aug</span>
                    <span className="day">15</span>
                  </div>
                  <div className="item-content">
                    <h4>Independence Day</h4>
                    <p>Company Holiday</p>
                  </div>
                </div>
              </div>
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
