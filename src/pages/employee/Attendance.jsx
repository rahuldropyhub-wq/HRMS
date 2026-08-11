import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, CheckSquare, Calendar, FileText,
  User, Bell, Settings, Search, MessageSquare,
  ChevronDown, LogOut, ListTodo, Filter, Download,
  ChevronLeft, ChevronRight, Clock, TrendingUp,
  AlertCircle, CheckCircle2, XCircle, Minus, Ticket, PackageOpen
} from 'lucide-react';
import AttendanceControlCenter from '../../components/employee/AttendanceControlCenter';
import DashboardLayout from '../../components/employee/DashboardLayout';
import '../../styles/employee/dashboard.css';
import '../../styles/employee/attendance-report.css';
import { useAuth } from '../../contexts/AuthContext';
import { getMyAttendance } from '../../services/employeeService';

// ─── Mock Attendance Data ──────────────────────────────────────────────────


const STATUS_META = {
  present: { label: 'Present',  cls: 'badge-present',  icon: <CheckCircle2 size={12} /> },
  late:    { label: 'Late',     cls: 'badge-late',     icon: <AlertCircle size={12} /> },
  absent:  { label: 'Absent',   cls: 'badge-absent',   icon: <XCircle size={12} /> },
  early:   { label: 'Early Out',cls: 'badge-early',    icon: <AlertCircle size={12} /> },
  holiday: { label: 'Holiday',  cls: 'badge-holiday',  icon: <CheckCircle2 size={12} /> },
  weekend: { label: 'Weekend',  cls: 'badge-weekend',  icon: <Minus size={12} /> },
};

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

export default function Attendance() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // 0-indexed
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      const { data } = await getMyAttendance(user.id, selectedMonth + 1, selectedYear);
      if (data) {
        const mapped = data.map(record => {
          const d = new Date(record.date);
          const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
          
          let workHrs = '—';
          let breakHrs = '—';
          let netHrs = '—';
          let overtime = null;
          let late = null;

          if (record.check_in) {
             if (record.check_in > '09:15') late = record.check_in;
          }

          if (record.total_hours) {
             const net = parseFloat(record.total_hours);
             const brk = parseFloat(record.total_break_hours || 0);
             const gross = net + brk;
             
             workHrs = gross.toFixed(2) + 'h';
             breakHrs = brk > 0 ? brk.toFixed(2) + 'h' : '—';
             netHrs = net.toFixed(2) + 'h';
             
             if (net > 9) {
               overtime = (net - 9).toFixed(2) + 'h';
             }
          }

          return {
            ...record,
            date: record.date,
            day: dayName,
            checkIn: record.check_in,
            checkOut: record.check_out,
            workHrs,
            breakHrs,
            netHrs,
            overtime,
            late,
            status: record.status || 'present'
          };
        });
        setAttendanceData(mapped);
      } else {
        setAttendanceData([]);
      }
      setLoading(false);
    };
    load();
  }, [user, selectedMonth, selectedYear]);

  const workingDays = attendanceData.filter(d => d.status !== 'weekend');
  const present   = workingDays.filter(d => d.status === 'present').length;
  const late      = workingDays.filter(d => d.status === 'late').length;
  const absent    = workingDays.filter(d => d.status === 'absent').length;
  const holidays  = workingDays.filter(d => d.status === 'holiday').length;
  const earlyOut  = workingDays.filter(d => d.status === 'early').length;

  const filtered = attendanceData.filter(d => {
    if (statusFilter === 'all') return true;
    return d.status === statusFilter;
  });

  return (
    <DashboardLayout>

        {/* Page Content */}
        <div className="ar-page-body">

          {/* Page Title */}
          <div className="ar-page-title-row">
            <div>
              <h1 className="ar-page-title">Attendance</h1>
              <p className="ar-page-subtitle">Manage your daily work session and view your complete attendance history.</p>
            </div>
          </div>

          {/* ── Attendance Control Center ── */}
          <AttendanceControlCenter />

          {/* ── Monthly Report Section ── */}
          <div className="ar-section">
            {/* Section header */}
            <div className="ar-section-header">
              <div className="ar-section-title-block">
                <h2 className="ar-section-title">Monthly Attendance Report</h2>
                <p className="ar-section-sub">Daily records for {MONTHS[selectedMonth]} {selectedYear}</p>
              </div>
              <div className="ar-section-actions">
                {/* Month navigator */}
                <div className="ar-month-nav">
                  <button className="ar-nav-btn" onClick={() => setSelectedMonth(m => Math.max(0, m - 1))}>
                    <ChevronLeft size={16} />
                  </button>
                  <span className="ar-month-label">{MONTHS[selectedMonth]} {selectedYear}</span>
                  <button className="ar-nav-btn" onClick={() => setSelectedMonth(m => Math.min(11, m + 1))}>
                    <ChevronRight size={16} />
                  </button>
                </div>
                {/* Filter */}
                <select
                  className="ar-filter-select"
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="present">Present</option>
                  <option value="late">Late</option>
                  <option value="absent">Absent</option>
                  <option value="early">Early Out</option>
                  <option value="holiday">Holiday</option>
                </select>
                <button className="ar-export-btn">
                  <Download size={14} /> Export
                </button>
              </div>
            </div>

            {/* Summary strip */}
            <div className="ar-summary-strip">
              <div className="ar-sum-card ar-sum-present">
                <div className="ar-sum-val">{present + late + earlyOut}</div>
                <div className="ar-sum-lbl">Days Present</div>
              </div>
              <div className="ar-sum-card ar-sum-absent">
                <div className="ar-sum-val">{absent}</div>
                <div className="ar-sum-lbl">Days Absent</div>
              </div>
              <div className="ar-sum-card ar-sum-late">
                <div className="ar-sum-val">{late}</div>
                <div className="ar-sum-lbl">Late Logins</div>
              </div>
              <div className="ar-sum-card ar-sum-early">
                <div className="ar-sum-val">{earlyOut}</div>
                <div className="ar-sum-lbl">Early Logouts</div>
              </div>
              <div className="ar-sum-card ar-sum-holiday">
                <div className="ar-sum-val">{holidays}</div>
                <div className="ar-sum-lbl">Holidays</div>
              </div>
              <div className="ar-sum-card ar-sum-overtime">
                <div className="ar-sum-val">{attendanceData.filter(d => d.overtime).length}</div>
                <div className="ar-sum-lbl">Overtime Days</div>
              </div>
            </div>

            {/* Table */}
            <div className="ar-table-wrap">
              <table className="ar-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Day</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Working Hours</th>
                    <th>Break Hours</th>
                    <th>Net Working</th>
                    <th>Overtime</th>
                    <th>Late</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row, i) => (
                    <tr
                      key={i}
                      className={`
                        ${row.status === 'weekend' ? 'ar-row-weekend' : ''}
                        ${row.status === 'holiday' ? 'ar-row-holiday' : ''}
                        ${row.status === 'absent'  ? 'ar-row-absent'  : ''}
                      `}
                    >
                      <td className="ar-td-date">{row.date}</td>
                      <td className="ar-td-day">{row.day}</td>
                      <td>
                        {row.checkIn
                          ? <span className="ar-time-val">{row.checkIn}</span>
                          : <span className="ar-dash">—</span>}
                      </td>
                      <td>
                        {row.checkOut
                          ? <span className="ar-time-val">{row.checkOut}</span>
                          : <span className="ar-dash">—</span>}
                      </td>
                      <td>
                        {row.workHrs !== '—'
                          ? <span className="ar-hours-work"><Clock size={12} /> {row.workHrs}</span>
                          : <span className="ar-dash">—</span>}
                      </td>
                      <td>
                        {row.breakHrs !== '—'
                          ? <span className="ar-hours-break">{row.breakHrs}</span>
                          : <span className="ar-dash">—</span>}
                      </td>
                      <td>
                        {row.netHrs !== '—'
                          ? <span className="ar-hours-net"><TrendingUp size={12} /> {row.netHrs}</span>
                          : <span className="ar-dash">—</span>}
                      </td>
                      <td>
                        {row.overtime
                          ? <span className="ar-overtime-badge">{row.overtime}</span>
                          : <span className="ar-dash">—</span>}
                      </td>
                      <td>
                        {row.late
                          ? <span className="ar-late-badge">+{row.late}</span>
                          : <span className="ar-dash">—</span>}
                      </td>
                      <td>
                        {STATUS_META[row.status] && (
                          <span className={`ar-status-badge ${STATUS_META[row.status].cls}`}>
                            {STATUS_META[row.status].icon}
                            {STATUS_META[row.status].label}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer note */}
            <div className="ar-table-footer">
              <span>Showing {filtered.length} of {attendanceData.length} records for {MONTHS[selectedMonth]} {selectedYear}</span>
              <span style={{ color: '#9ca3af' }}>Working hours = 09:00 AM – 06:00 PM (9 hrs)</span>
            </div>
          </div>
        </div>
      </DashboardLayout>
  );
}
