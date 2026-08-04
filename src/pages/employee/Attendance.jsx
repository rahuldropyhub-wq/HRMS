import React, { useState } from 'react';
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

// ─── Mock Attendance Data ──────────────────────────────────────────────────
const MOCK_DATA = [
  { date: '2025-05-01', day: 'Thu', checkIn: '09:30 AM', checkOut: '06:30 PM', workHrs: '09h 00m', breakHrs: '00h 45m', netHrs: '08h 15m', status: 'present', overtime: null,       late: null },
  { date: '2025-05-02', day: 'Fri', checkIn: '09:45 AM', checkOut: '06:30 PM', workHrs: '08h 45m', breakHrs: '00h 45m', netHrs: '08h 00m', status: 'late',    overtime: null,       late: '15 min' },
  { date: '2025-05-03', day: 'Sat', checkIn: null,       checkOut: null,       workHrs: '—',       breakHrs: '—',       netHrs: '—',       status: 'weekend', overtime: null,       late: null },
  { date: '2025-05-04', day: 'Sun', checkIn: null,       checkOut: null,       workHrs: '—',       breakHrs: '—',       netHrs: '—',       status: 'weekend', overtime: null,       late: null },
  { date: '2025-05-05', day: 'Mon', checkIn: '09:30 AM', checkOut: '07:30 PM', workHrs: '10h 00m', breakHrs: '00h 45m', netHrs: '09h 15m', status: 'present', overtime: '01h 00m', late: null },
  { date: '2025-05-06', day: 'Tue', checkIn: '09:30 AM', checkOut: '05:30 PM', workHrs: '08h 00m', breakHrs: '00h 45m', netHrs: '07h 15m', status: 'early',   overtime: null,       late: null },
  { date: '2025-05-07', day: 'Wed', checkIn: '09:40 AM', checkOut: '06:30 PM', workHrs: '08h 50m', breakHrs: '00h 45m', netHrs: '08h 05m', status: 'present', overtime: null,       late: '10 min' },
  { date: '2025-05-08', day: 'Thu', checkIn: '09:30 AM', checkOut: '06:30 PM', workHrs: '09h 00m', breakHrs: '00h 45m', netHrs: '08h 15m', status: 'present', overtime: null,       late: null },
  { date: '2025-05-09', day: 'Fri', checkIn: null,       checkOut: null,       workHrs: '—',       breakHrs: '—',       netHrs: '—',       status: 'absent',  overtime: null,       late: null },
  { date: '2025-05-10', day: 'Sat', checkIn: null,       checkOut: null,       workHrs: '—',       breakHrs: '—',       netHrs: '—',       status: 'weekend', overtime: null,       late: null },
  { date: '2025-05-11', day: 'Sun', checkIn: null,       checkOut: null,       workHrs: '—',       breakHrs: '—',       netHrs: '—',       status: 'weekend', overtime: null,       late: null },
  { date: '2025-05-12', day: 'Mon', checkIn: '09:30 AM', checkOut: '06:30 PM', workHrs: '09h 00m', breakHrs: '00h 45m', netHrs: '08h 15m', status: 'present', overtime: null,       late: null },
  { date: '2025-05-13', day: 'Tue', checkIn: '09:35 AM', checkOut: '06:30 PM', workHrs: '08h 55m', breakHrs: '00h 45m', netHrs: '08h 10m', status: 'present', overtime: null,       late: '5 min' },
  { date: '2025-05-14', day: 'Wed', checkIn: '09:30 AM', checkOut: '06:30 PM', workHrs: '09h 00m', breakHrs: '00h 45m', netHrs: '08h 15m', status: 'present', overtime: null,       late: null },
  { date: '2025-05-15', day: 'Thu', checkIn: null,       checkOut: null,       workHrs: '—',       breakHrs: '—',       netHrs: '—',       status: 'holiday', overtime: null,       late: null },
  { date: '2025-05-16', day: 'Fri', checkIn: '10:00 AM', checkOut: '06:30 PM', workHrs: '08h 30m', breakHrs: '00h 45m', netHrs: '07h 45m', status: 'late',    overtime: null,       late: '30 min' },
  { date: '2025-05-17', day: 'Sat', checkIn: null,       checkOut: null,       workHrs: '—',       breakHrs: '—',       netHrs: '—',       status: 'weekend', overtime: null,       late: null },
  { date: '2025-05-18', day: 'Sun', checkIn: null,       checkOut: null,       workHrs: '—',       breakHrs: '—',       netHrs: '—',       status: 'weekend', overtime: null,       late: null },
  { date: '2025-05-19', day: 'Mon', checkIn: '09:30 AM', checkOut: '06:45 PM', workHrs: '09h 15m', breakHrs: '00h 45m', netHrs: '08h 30m', status: 'present', overtime: '00h 15m', late: null },
  { date: '2025-05-20', day: 'Tue', checkIn: '09:30 AM', checkOut: '06:30 PM', workHrs: '09h 00m', breakHrs: '00h 45m', netHrs: '08h 15m', status: 'present', overtime: null,       late: null },
  { date: '2025-05-21', day: 'Wed', checkIn: '10:15 AM', checkOut: '06:30 PM', workHrs: '08h 15m', breakHrs: '00h 45m', netHrs: '07h 30m', status: 'late',    overtime: null,       late: '45 min' },
  { date: '2025-05-22', day: 'Thu', checkIn: '09:30 AM', checkOut: '06:30 PM', workHrs: '09h 00m', breakHrs: '00h 45m', netHrs: '08h 15m', status: 'present', overtime: null,       late: null },
  { date: '2025-05-23', day: 'Fri', checkIn: '09:30 AM', checkOut: '06:50 PM', workHrs: '09h 20m', breakHrs: '00h 45m', netHrs: '08h 35m', status: 'present', overtime: '00h 20m', late: null },
  { date: '2025-05-24', day: 'Sat', checkIn: null,       checkOut: null,       workHrs: '—',       breakHrs: '—',       netHrs: '—',       status: 'weekend', overtime: null,       late: null },
  { date: '2025-05-25', day: 'Sun', checkIn: null,       checkOut: null,       workHrs: '—',       breakHrs: '—',       netHrs: '—',       status: 'weekend', overtime: null,       late: null },
  { date: '2025-05-26', day: 'Mon', checkIn: '09:30 AM', checkOut: '06:30 PM', workHrs: '09h 00m', breakHrs: '00h 45m', netHrs: '08h 15m', status: 'present', overtime: null,       late: null },
  { date: '2025-05-27', day: 'Tue', checkIn: '09:30 AM', checkOut: '08:40 PM', workHrs: '11h 10m', breakHrs: '00h 45m', netHrs: '10h 25m', status: 'present', overtime: '02h 10m', late: null },
  { date: '2025-05-28', day: 'Wed', checkIn: null,       checkOut: null,       workHrs: '—',       breakHrs: '—',       netHrs: '—',       status: 'absent',  overtime: null,       late: null },
  { date: '2025-05-29', day: 'Thu', checkIn: '09:32 AM', checkOut: '06:30 PM', workHrs: '08h 58m', breakHrs: '00h 45m', netHrs: '08h 13m', status: 'present', overtime: null,       late: null },
  { date: '2025-05-30', day: 'Fri', checkIn: '09:30 AM', checkOut: '06:35 PM', workHrs: '09h 05m', breakHrs: '00h 45m', netHrs: '08h 20m', status: 'present', overtime: null,       late: null },
  { date: '2025-05-31', day: 'Sat', checkIn: null,       checkOut: null,       workHrs: '—',       breakHrs: '—',       netHrs: '—',       status: 'weekend', overtime: null,       late: null },
];

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
  const [selectedMonth, setSelectedMonth] = useState(4); // May (0-indexed)
  const [selectedYear]  = useState(2025);

  const workingDays = MOCK_DATA.filter(d => d.status !== 'weekend');
  const present   = workingDays.filter(d => d.status === 'present').length;
  const late      = workingDays.filter(d => d.status === 'late').length;
  const absent    = workingDays.filter(d => d.status === 'absent').length;
  const holidays  = workingDays.filter(d => d.status === 'holiday').length;
  const earlyOut  = workingDays.filter(d => d.status === 'early').length;

  const filtered = MOCK_DATA.filter(d => {
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
                <div className="ar-sum-val">{MOCK_DATA.filter(d => d.overtime).length}</div>
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
              <span>Showing {filtered.length} of {MOCK_DATA.length} records for {MONTHS[selectedMonth]} {selectedYear}</span>
              <span style={{ color: '#9ca3af' }}>Working hours = 09:00 AM – 06:00 PM (9 hrs)</span>
            </div>
          </div>
        </div>
      </DashboardLayout>
  );
}
