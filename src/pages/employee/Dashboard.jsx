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
import { getMyAttendance, getMyTasks, getMyLeaves, getAnnouncements } from '../../services/employeeService';

function Dashboard() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [todayAttendance, setTodayAttendance] = useState(null);
  const [pendingTasks, setPendingTasks] = useState(0);
  const [pendingLeaves, setPendingLeaves] = useState(0);
  const [tasksList, setTasksList] = useState([]);
  const [announcementsList, setAnnouncementsList] = useState([]);
  const [weeklyChartData, setWeeklyChartData] = useState([]);
  const [timeline, setTimeline] = useState([]);

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

        // Generate Weekly Chart Data
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const chartData = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(d.getDate() - i);
          const dStr = d.toISOString().split('T')[0];
          const record = att.find(a => a.date === dStr);
          chartData.push({
            name: days[d.getDay()],
            hours: record?.total_hours ? parseFloat(record.total_hours) : 0
          });
        }
        setWeeklyChartData(chartData);

        // Build Timeline
        if (todayRecord) {
          const tl = [];
          if (todayRecord.check_in) {
             tl.push({ type: 'work-start', label: 'Checked In', sub: 'Login time', time: todayRecord.check_in });
          }
          if (todayRecord.breaks && Array.isArray(todayRecord.breaks)) {
             todayRecord.breaks.forEach(b => {
                tl.push({ type: 'break-start', label: 'Break Started', sub: b.reason || 'Break', time: b.start });
                if (b.end) {
                   tl.push({ type: 'break-end', label: 'Break Ended', sub: `Duration: ${Math.floor((b.duration||0)/60)}m`, time: b.end });
                }
             });
          }
          if (todayRecord.check_out) {
             tl.push({ type: 'work-end', label: 'Work Completed', sub: 'Logout time', time: todayRecord.check_out });
          }
          setTimeline(tl);
        }
      }

      const { data: tasks } = await getMyTasks(user.id);
      if (tasks) {
        setPendingTasks(tasks.filter(t => t.status !== 'completed').length);
        setTasksList(tasks.slice(0, 4));
      }

      const { data: leaves } = await getMyLeaves(user.id);
      if (leaves) setPendingLeaves(leaves.filter(l => l.status === 'pending').length);

      const { data: ann } = await getAnnouncements();
      if (ann) setAnnouncementsList(ann.slice(0, 3));
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
                {timeline.length > 0 ? timeline.map((item, i) => (
                  <div className="timeline-item" key={i}>
                    <div className={`timeline-icon ${item.type.includes('start') ? 'success' : 'primary'}`}><CheckCircle2 size={14} /></div>
                    <div className="timeline-content">
                      <span className="time">{item.time}</span>
                      <span className="timeline-title">{item.label}</span>
                      <span className="timeline-desc">{item.sub}</span>
                    </div>
                  </div>
                )) : (
                  <div style={{color: '#6b7280', fontSize: 13, padding: 12}}>No activity yet today.</div>
                )}
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
                {tasksList.length > 0 ? tasksList.map((t, i) => (
                  <div className="task-item" key={i}>
                    <div className="task-icon blue"><LayoutDashboard size={18} /></div>
                    <div className="task-content">
                      <div className="task-title">{t.title}</div>
                      <div className="task-project">Priority: {t.priority}</div>
                    </div>
                    <span className={`status-badge ${t.status === 'completed' ? 'completed' : t.status === 'in_progress' ? 'in-progress' : 'pending'}`}>{t.status.replace('_', ' ')}</span>
                  </div>
                )) : (
                  <div style={{color: '#6b7280', fontSize: 13, padding: 12}}>No pending tasks.</div>
                )}
              </div>
            </div>

            {/* Announcements */}
            <div className="widget-card">
              <div className="widget-header">
                <h3>Announcements</h3>
                <button className="view-all-btn" onClick={() => navigate('/dashboard')}>View All</button>
              </div>
              <div className="announcement-list">
                {announcementsList.length > 0 ? announcementsList.map((a, i) => (
                  <div className="announcement-item" key={i}>
                    <div className="announce-icon purple"><Megaphone size={20} /></div>
                    <div className="announce-content">
                      <div className="announce-header">
                        <span className="announce-title">{a.title}</span>
                        <span className="announce-time">{new Date(a.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="announce-desc">{a.content}</p>
                    </div>
                  </div>
                )) : (
                  <div style={{color: '#6b7280', fontSize: 13, padding: 12}}>No new announcements.</div>
                )}
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
                  <BarChart data={weeklyChartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(val) => val + 'h'} />
                    <Tooltip cursor={{ fill: '#f3f4f6' }} />
                    <Bar dataKey="hours" radius={[4, 4, 0, 0]} barSize={16}>
                      {
                        weeklyChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={
                            entry.hours > 8 ? '#34d399' : entry.hours > 4 ? '#93c5fd' : '#fcd34d'
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
