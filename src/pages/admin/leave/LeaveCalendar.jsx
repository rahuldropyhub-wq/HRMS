import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon } from 'lucide-react';
import CustomDropdown from '../../../components/admin/CustomDropdown';
import '../../../styles/admin/leave/leave-calendar.css';

const LeaveCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 1)); // August 2026
  const [selectedDate, setSelectedDate] = useState(null);
  const [department, setDepartment] = useState('all');
  const [leaveType, setLeaveType] = useState('all');

  // MOCK DATA - Leaves for the month
  const leavesData = [
    { id: 1, employee: 'Priya Patel', initials: 'PP', type: 'sick', typeName: 'Sick Leave', from: 6, to: 8, department: 'marketing' },
    { id: 2, employee: 'Amit Kumar', initials: 'AK', type: 'casual', typeName: 'Casual Leave', from: 6, to: 6, department: 'design' },
    { id: 3, employee: 'Neha Gupta', initials: 'NG', type: 'earned', typeName: 'Earned Leave', from: 7, to: 7, department: 'hr' },
    { id: 4, employee: 'Vikram Singh', initials: 'VS', type: 'comp', typeName: 'Comp Off', from: 12, to: 12, department: 'engineering' },
    { id: 5, employee: 'Anjali Rao', initials: 'AR', type: 'other', typeName: 'Other', from: 20, to: 22, department: 'sales' },
    { id: 6, employee: 'Rahul Sharma', initials: 'RS', type: 'casual', typeName: 'Casual Leave', from: 14, to: 15, department: 'engineering' },
    { id: 7, employee: 'Sneha Verma', initials: 'SV', type: 'sick', typeName: 'Sick Leave', from: 25, to: 26, department: 'finance' },
    { id: 8, employee: 'Karan Mehta', initials: 'KM', type: 'earned', typeName: 'Earned Leave', from: 18, to: 20, department: 'operations' },
  ];

  const departmentOptions = [
    { value: 'all', label: 'All Departments' },
    { value: 'engineering', label: 'Engineering' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'design', label: 'Design' },
    { value: 'hr', label: 'HR' },
    { value: 'finance', label: 'Finance' },
    { value: 'sales', label: 'Sales' },
    { value: 'operations', label: 'Operations' },
  ];

  const leaveTypeOptions = [
    { value: 'all', label: 'All Leave Types' },
    { value: 'casual', label: 'Casual Leave' },
    { value: 'sick', label: 'Sick Leave' },
    { value: 'earned', label: 'Earned Leave' },
    { value: 'comp', label: 'Comp Off' },
    { value: 'other', label: 'Other' },
  ];

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // First day of month & total days
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  
  // Get day of week for first day (0=Sun, 1=Mon, ...)
  // Convert to Monday-first: (0=Mon, 6=Sun)
  let startDayOfWeek = firstDayOfMonth.getDay() - 1;
  if (startDayOfWeek === -1) startDayOfWeek = 6; // Sunday becomes 6

  // Today's date
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const todayDate = isCurrentMonth ? today.getDate() : null;

  // Filter leaves
  const filteredLeaves = useMemo(() => {
    return leavesData.filter(leave => {
      if (department !== 'all' && leave.department !== department) return false;
      if (leaveType !== 'all' && leave.type !== leaveType) return false;
      return true;
    });
  }, [department, leaveType]);

  // Get leaves for a specific date
  const getLeavesForDate = (dateNum) => {
    return filteredLeaves.filter(leave => 
      dateNum >= leave.from && dateNum <= leave.to
    );
  };

  // Navigation
  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
  };
  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
  };
  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(null);
  };

  // Build calendar cells
  const cells = [];
  
  // Empty cells for days before month start
  for (let i = 0; i < startDayOfWeek; i++) {
    cells.push({ empty: true, key: `empty-start-${i}` });
  }
  
  // Actual days of month
  for (let day = 1; day <= daysInMonth; day++) {
    const dayOfWeek = new Date(year, month, day).getDay(); // 0=Sun, 6=Sat
    cells.push({
      empty: false,
      date: day,
      key: `day-${day}`,
      isToday: day === todayDate,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      leaves: getLeavesForDate(day),
    });
  }
  
  // Empty cells to complete the last week
  while (cells.length % 7 !== 0) {
    cells.push({ empty: true, key: `empty-end-${cells.length}` });
  }

  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="leave-calendar-page"
    >
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Leave Calendar</h1>
          <p className="page-subtitle">Visual overview of upcoming team absences</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="calendar-toolbar">
        <div className="calendar-nav">
          <button className="calendar-nav-btn" onClick={goToPrevMonth} aria-label="Previous month">
            <ChevronLeft size={18} />
          </button>
          <div className="calendar-month-label">{monthName}</div>
          <button className="calendar-nav-btn" onClick={goToNextMonth} aria-label="Next month">
            <ChevronRight size={18} />
          </button>
          <button className="calendar-today-btn" onClick={goToToday}>
            Today
          </button>
        </div>
        <div className="calendar-filters">
          <CustomDropdown
            value={department}
            onChange={setDepartment}
            options={departmentOptions}
            placeholder="Department"
          />
          <CustomDropdown
            value={leaveType}
            onChange={setLeaveType}
            options={leaveTypeOptions}
            placeholder="Leave Type"
          />
        </div>
      </div>

      {/* Calendar */}
      <div className="calendar-container">
        {/* Weekday Header — CRITICAL: Same grid as dates */}
        <div className="calendar-weekdays">
          {weekdays.map((day, idx) => (
            <div 
              key={day} 
              className={`calendar-weekday ${idx >= 5 ? 'weekend' : ''}`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Dates Grid — CRITICAL: Same 7 columns as headers */}
        <div className="calendar-grid">
          {cells.map((cell) => {
            if (cell.empty) {
              return <div key={cell.key} className="calendar-cell empty"></div>;
            }
            
            const visibleLeaves = cell.leaves.slice(0, 2);
            const moreCount = cell.leaves.length - 2;
            
            return (
              <div
                key={cell.key}
                className={`calendar-cell ${cell.isToday ? 'today' : ''} ${cell.isWeekend ? 'weekend' : ''}`}
                onClick={() => cell.leaves.length > 0 && setSelectedDate(cell)}
              >
                <div className="calendar-date">{cell.date}</div>
                <div className="calendar-leaves">
                  {visibleLeaves.map(leave => (
                    <div
                      key={leave.id}
                      className={`leave-pill ${leave.type}`}
                      title={`${leave.employee} — ${leave.typeName}`}
                    >
                      <span className="leave-pill-dot"></span>
                      <span>{leave.employee.split(' ')[0]}</span>
                    </div>
                  ))}
                  {moreCount > 0 && (
                    <div className="leave-more-indicator">
                      +{moreCount} more
                    </div>
                  )}
                </div>

                {/* Popover for selected date */}
                <AnimatePresence>
                  {selectedDate?.date === cell.date && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="calendar-popover"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="calendar-popover-header">
                        <span>{monthName.split(' ')[0]} {cell.date}</span>
                        <button 
                          className="calendar-popover-close"
                          onClick={() => setSelectedDate(null)}
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <div className="calendar-popover-body">
                        {cell.leaves.map(leave => (
                          <div key={leave.id} className="popover-leave-item">
                            <div className="popover-leave-avatar">{leave.initials}</div>
                            <div className="popover-leave-info">
                              <div className="popover-leave-name">{leave.employee}</div>
                              <div className="popover-leave-meta">
                                <span className={`leave-pill-dot`} style={{
                                  background: leave.type === 'sick' ? 'var(--danger)' :
                                              leave.type === 'casual' ? 'var(--info)' :
                                              leave.type === 'earned' ? 'var(--success)' :
                                              leave.type === 'comp' ? 'var(--warning)' :
                                              'var(--text-tertiary)'
                                }}></span>
                                {leave.typeName}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-dot casual"></span> Casual Leave
        </div>
        <div className="legend-item">
          <span className="legend-dot sick"></span> Sick Leave
        </div>
        <div className="legend-item">
          <span className="legend-dot earned"></span> Earned Leave
        </div>
        <div className="legend-item">
          <span className="legend-dot comp"></span> Comp Off
        </div>
        <div className="legend-item">
          <span className="legend-dot other"></span> Other
        </div>
      </div>
    </motion.div>
  );
};

export default LeaveCalendar;
