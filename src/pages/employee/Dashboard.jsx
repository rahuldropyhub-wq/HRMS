import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import AttendanceControlCenter from '../../components/employee/AttendanceControlCenter';
import DashboardLayout from '../../components/employee/DashboardLayout';
import '../../styles/employee/dashboard.css';
import { useAuth } from '../../contexts/AuthContext';
import { getMyAttendance, getMyTasks, getMyLeaves } from '../../services/employeeService';

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
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [todayAttendance, setTodayAttendance] = useState(null);
  const [pendingTasks, setPendingTasks] = useState(0);
  const [pendingLeaves, setPendingLeaves] = useState(0);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const today = new Date();
  const todayStr = today.toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const now = new Date();
      const { data: att } = await getMyAttendance(user.id, now.getMonth() + 1, now.getFullYear());
      if (att) {
        const todayDate = now.toISOString().split('T')[0];
        const todayRecord = att.find(a => a.date === todayDate);
        setTodayAttendance(todayRecord || null);
      }

      const { data: tasks } = await getMyTasks(user.id);
      if (tasks) setPendingTasks(tasks.filter(t => t.status !== 'completed').length);

      const { data: leaves } = await getMyLeaves(user.id);
      if (leaves) setPendingLeaves(leaves.filter(l => l.status === 'pending').length);
    };
    load();
  }, [user]);

  const firstName = profile?.first_name || user?.email?.split('@')[0] || 'there';

  return (
    <DashboardLayout>

        {/* Dashboard Content */}
        <div className="dashboard-content">
          <div className="welcome-banner">
            <div>
              <h1>{getGreeting()}, {firstName}! 👋</h1>
              <p>Here's what's happening with your work today.</p>
            </div>
            <div className="date-picker">
              {todayStr}
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
                <h3 className="stat-value">{todayAttendance ? 'Present' : 'Not Marked'}</h3>
                <p className="stat-meta success">
                  <CheckCircle2 size={12} /> {todayAttendance?.check_in ? `Checked in at ${todayAttendance.check_in}` : 'Not checked in yet'}
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="stat-card">
              <div className="stat-icon-wrapper blue">
                <Clock size={20} />
              </div>
              <div className="stat-info">
                <p className="stat-label">Working Hours</p>
                <h3 className="stat-value">{todayAttendance?.total_hours ? `${todayAttendance.total_hours}h` : '—'}</h3>
                <p className="stat-meta">Today</p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="stat-card">
              <div className="stat-icon-wrapper purple">
                <CheckSquare size={20} />
              </div>
              <div className="stat-info">
                <p className="stat-label">Pending Tasks</p>
                <h3 className="stat-value">{pendingTasks}</h3>
                <p className="stat-meta">Open tasks</p>
              </div>
            </div>

            {/* Card 4 */}
            <div className="stat-card">
              <div className="stat-icon-wrapper orange">
                <Briefcase size={20} />
              </div>
              <div className="stat-info">
                <p className="stat-label">Leave Requests</p>
                <h3 className="stat-value">{pendingLeaves}</h3>
                <p className="stat-meta">Pending approval</p>
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
              <button className="full-report-btn" onClick={() => navigate('/attendance')}>View Full Attendance <ArrowRight size={14} /></button>
            </div>

            {/* Tasks Overview */}
            <div className="widget-card">
              <div className="widget-header">
                <h3>Today's Tasks Overview</h3>
                <button className="view-all-btn" onClick={() => navigate('/tasks')}>View All</button>
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
                <button className="view-all-btn" onClick={() => navigate('/dashboard')}>View All</button>
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
                <button className="view-all-btn" onClick={() => navigate('/attendance')}>View Full Report</button>
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
                <button className="view-all-btn" onClick={() => navigate('/leave-management')}>View All</button>
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
                <button className="view-all-btn" onClick={() => navigate('/holidays')}>View Calendar</button>
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
      </DashboardLayout>
  );
}


export default Dashboard;
