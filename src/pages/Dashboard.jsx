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
  CalendarDays,
  Headphones,
  CheckCircle2,
  Clock,
  Coffee,
  Briefcase,
  ChevronDown,
  Megaphone,
  ArrowRight,
  LogOut,
  ListTodo,
  Ticket,
  PackageOpen
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import AttendanceControlCenter from '../components/AttendanceControlCenter';
import '../styles/dashboard.css';

const attendanceData = [
  { name: 'Mon', hours: 8.3 },
  { name: 'Tue', hours: 8.75 },
  { name: 'Wed', hours: 8.16 },
  { name: 'Thu', hours: 7.83 },
  { name: 'Fri', hours: 2.75 },
  { name: 'Sat', hours: 0 },
  { name: 'Sun', hours: 0 },
];

function Dashboard() {
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
            <li className="active">
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
            <li>
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

        {/* Dashboard Content */}
        <div className="dashboard-content">
          <div className="welcome-banner">
            <div>
              <h1>Good Morning, Balaji! 👋</h1>
              <p>Here's what's happening with your work today.</p>
            </div>
            <div className="date-picker">
              Friday, 08 May 2025
              <CalendarDays size={18} color="#6b7280" />
            </div>
          </div>

          {/* Attendance Control Center */}
          <div style={{ marginBottom: 32 }}>
            <AttendanceControlCenter compact={true} />
          </div>

          {/* Stat Cards */}
          <div className="stats-grid">
            {/* Card 1 */}
            <div className="stat-card">
              <div className="stat-icon-wrapper green">
                <CalendarDays size={20} />
              </div>
              <div className="stat-info">
                <p className="stat-label">Attendance Status</p>
                <h3 className="stat-value">Present</h3>
                <p className="stat-meta success"><CheckCircle2 size={12} /> Checked in at 09:05 AM</p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="stat-card">
              <div className="stat-icon-wrapper blue">
                <Clock size={20} />
              </div>
              <div className="stat-info">
                <p className="stat-label">Working Hours</p>
                <h3 className="stat-value">02h 45m</h3>
                <p className="stat-meta">Today</p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="stat-card">
              <div className="stat-icon-wrapper purple">
                <Coffee size={20} />
              </div>
              <div className="stat-info">
                <p className="stat-label">Break Time</p>
                <h3 className="stat-value">00h 30m</h3>
                <p className="stat-meta">Today</p>
              </div>
            </div>

            {/* Card 4 */}
            <div className="stat-card">
              <div className="stat-icon-wrapper orange">
                <Briefcase size={20} />
              </div>
              <div className="stat-info">
                <p className="stat-label">Leave Balance</p>
                <h3 className="stat-value">12</h3>
                <p className="stat-meta">Days Available</p>
              </div>
            </div>
          </div>

          {/* Middle Row */}
          <div className="middle-row">
            {/* Timeline */}
            <div className="widget-card">
              <div className="widget-header">
                <h3>Today's Timeline</h3>
              </div>
              <div className="timeline-list">
                <div className="timeline-item">
                  <div className="timeline-icon success"><CheckCircle2 size={14} /></div>
                  <div className="timeline-content">
                    <span className="time">09:05 AM</span>
                    <span className="timeline-title">Checked In</span>
                    <span className="timeline-desc">Login time</span>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-icon primary"><Briefcase size={14} /></div>
                  <div className="timeline-content">
                    <span className="time">11:30 AM</span>
                    <span className="timeline-title">Working on Project</span>
                    <span className="timeline-desc">HRMS Attendance Module</span>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-icon warning"><Coffee size={14} /></div>
                  <div className="timeline-content">
                    <span className="time">01:15 PM</span>
                    <span className="timeline-title">Break Time</span>
                    <span className="timeline-desc">Lunch Break</span>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-icon primary"><LayoutDashboard size={14} /></div>
                  <div className="timeline-content">
                    <span className="time">01:45 PM</span>
                    <span className="timeline-title">Back to Work</span>
                    <span className="timeline-desc">Working on Dashboard</span>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-icon empty"></div>
                  <div className="timeline-content">
                    <span className="time">06:30 PM</span>
                    <span className="timeline-title">Expected Logout</span>
                    <span className="timeline-desc">Have a great day!</span>
                  </div>
                </div>
              </div>
              <button className="full-report-btn">View Full Attendance <ArrowRight size={14} /></button>
            </div>

            {/* Tasks Overview */}
            <div className="widget-card">
              <div className="widget-header">
                <h3>Today's Tasks Overview</h3>
                <button className="view-all-btn">View All</button>
              </div>
              <div className="task-list">
                <div className="task-item">
                  <div className="task-icon blue"><LayoutDashboard size={18} /></div>
                  <div className="task-content">
                    <div className="task-title">Design Attendance UI</div>
                    <div className="task-project">HRMS Project</div>
                  </div>
                  <span className="status-badge completed">Completed</span>
                </div>
                <div className="task-item">
                  <div className="task-icon blue"><LayoutDashboard size={18} /></div>
                  <div className="task-content">
                    <div className="task-title">API Integration</div>
                    <div className="task-project">HRMS Project</div>
                  </div>
                  <span className="status-badge in-progress">In Progress</span>
                </div>
                <div className="task-item">
                  <div className="task-icon orange"><LayoutDashboard size={18} /></div>
                  <div className="task-content">
                    <div className="task-title">Fix Dashboard Charts</div>
                    <div className="task-project">HRMS Project</div>
                  </div>
                  <span className="status-badge pending">Pending</span>
                </div>
                <div className="task-item">
                  <div className="task-icon purple"><LayoutDashboard size={18} /></div>
                  <div className="task-content">
                    <div className="task-title">Code Review</div>
                    <div className="task-project">HRMS Project</div>
                  </div>
                  <span className="status-badge pending">Pending</span>
                </div>
              </div>
            </div>

            {/* Announcements */}
            <div className="widget-card">
              <div className="widget-header">
                <h3>Announcements</h3>
                <button className="view-all-btn">View All</button>
              </div>
              <div className="announcement-list">
                <div className="announcement-item">
                  <div className="announce-icon purple"><Megaphone size={20} /></div>
                  <div className="announce-content">
                    <div className="announce-header">
                      <span className="announce-title">Office Meeting</span>
                      <span className="announce-time">2h ago</span>
                    </div>
                    <p className="announce-desc">Monthly team meeting on 10th May at 11:00 AM in Meeting Room.</p>
                  </div>
                </div>
                <div className="announcement-item">
                  <div className="announce-icon green"><CalendarDays size={20} /></div>
                  <div className="announce-content">
                    <div className="announce-header">
                      <span className="announce-title">Public Holiday</span>
                      <span className="announce-time">1d ago</span>
                    </div>
                    <p className="announce-desc">Office will be closed on 13th May (Tuesday) for Buddha Purnima.</p>
                  </div>
                </div>
                <div className="announcement-item">
                  <div className="announce-icon yellow"><FileText size={20} /></div>
                  <div className="announce-content">
                    <div className="announce-header">
                      <span className="announce-title">Policy Update</span>
                      <span className="announce-time">2d ago</span>
                    </div>
                    <p className="announce-desc">New leave policy has been updated. Please check the policy section.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="bottom-row">
            {/* Chart */}
            <div className="widget-card">
              <div className="widget-header">
                <h3>Weekly Attendance</h3>
                <button className="view-all-btn">View Full Report</button>
              </div>
              <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attendanceData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(val) => val + 'h'} />
                    <Tooltip cursor={{ fill: '#f3f4f6' }} />
                    <Bar dataKey="hours" radius={[4, 4, 0, 0]} barSize={16}>
                      {
                        attendanceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={
                            index === 3 ? '#fcd34d' : index === 4 ? '#93c5fd' : '#34d399'
                          } />
                        ))
                      }
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Leave Balance */}
            <div className="widget-card">
              <div className="widget-header">
                <h3>Leave Balance</h3>
                <button className="view-all-btn">View All</button>
              </div>
              <div className="leave-bars">
                <div className="leave-bar-item">
                  <div className="leave-bar-header">
                    <span>Casual Leave</span>
                    <span>06 Days</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill green"></div>
                  </div>
                </div>
                <div className="leave-bar-item">
                  <div className="leave-bar-header">
                    <span>Sick Leave</span>
                    <span>04 Days</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill blue"></div>
                  </div>
                </div>
                <div className="leave-bar-item">
                  <div className="leave-bar-header">
                    <span>Privilege Leave</span>
                    <span>02 Days</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill orange"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Holidays */}
            <div className="widget-card">
              <div className="widget-header">
                <h3>Upcoming Holidays</h3>
                <button className="view-all-btn">View Calendar</button>
              </div>
              <div className="holiday-list">
                <div className="holiday-item">
                  <div className="holiday-date">
                    <div className="month green">May</div>
                    <div className="day">13</div>
                  </div>
                  <div className="holiday-content">
                    <h4>Buddha Purnima</h4>
                    <p>Tuesday</p>
                  </div>
                </div>
                <div className="holiday-item">
                  <div className="holiday-date">
                    <div className="month red">Aug</div>
                    <div className="day">15</div>
                  </div>
                  <div className="holiday-content">
                    <h4>Independence Day</h4>
                    <p>Friday</p>
                  </div>
                </div>
                <div className="holiday-item">
                  <div className="holiday-date">
                    <div className="month orange">Oct</div>
                    <div className="day">02</div>
                  </div>
                  <div className="holiday-content">
                    <h4>Gandhi Jayanthi</h4>
                    <p>Thursday</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


export default Dashboard;
