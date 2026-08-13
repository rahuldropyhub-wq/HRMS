import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  FileText,
  User,
  Bell,
  Settings,
  Search,
  MessageSquare,
  ChevronDown,
  LogOut,
  ListTodo,
  Ticket,
  PackageOpen,
  CalendarDays,
  Palmtree,
  Info,
  Plus
} from 'lucide-react';
import {
  EnterpriseModal,
  FormHeader,
  FormBody,
  FormSection,
  FormField,
  SelectInput,
  TextInput,
  DateInput,
  FormFooter
} from '../../components/employee/EnterpriseForm';
import DashboardLayout from '../../components/employee/DashboardLayout';
import '../../styles/employee/dashboard.css';
import '../../styles/employee/holidays.css';
import { getHolidays } from '../../services/employeeService';

function Holidays() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHolidays = async () => {
      setLoading(true);
      const { data } = await getHolidays();
      if (data) {
        const today = new Date();
        today.setHours(0,0,0,0);
        
        const enhanced = data.map(h => ({
          ...h,
          passed: new Date(h.date) < today
        }));
        setHolidays(enhanced);
      }
      setLoading(false);
    };
    fetchHolidays();
  }, []);

  const getMonthName = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString('default', { month: 'short' });
  };

  const getDayNum = (dateStr) => {
    const d = new Date(dateStr);
    return d.getDate().toString().padStart(2, '0');
  };

  const getWeekday = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString('default', { weekday: 'long' });
  };

  // Group holidays by month
  const groupedHolidays = holidays.reduce((acc, holiday) => {
    const month = new Date(holiday.date).toLocaleString('default', { month: 'long' });
    if (!acc[month]) acc[month] = [];
    acc[month].push(holiday);
    return acc;
  }, {});

  const totalHolidays = holidays.length;
  const upcomingHoliday = holidays.find(h => !h.passed);

  return (
    <DashboardLayout>

        {/* Holidays Content */}
        <div className="dashboard-content">
          <div className="holidays-wrapper">
            <div className="holidays-header">
              <div className="holidays-title">
                <h1>Holiday Calendar 2026</h1>
                <p>View all upcoming public and company holidays.</p>
              </div>

              <div className="holidays-stats">
                <div className="holiday-stat-card">
                  <div className="stat-icon primary">
                    <CalendarDays size={24} />
                  </div>
                  <div className="stat-info">
                    <p>Total Holidays</p>
                    <h3>{totalHolidays} Days</h3>
                  </div>
                </div>

                {upcomingHoliday && (
                  <div className="holiday-stat-card">
                    <div className="stat-icon warning">
                      <Palmtree size={24} />
                    </div>
                    <div className="stat-info">
                      <p>Upcoming Holiday</p>
                      <h3>{upcomingHoliday.name}</h3>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>Loading holidays...</div>
            ) : (
            <div className="holidays-list-container">
              {Object.keys(groupedHolidays).length === 0 && (
                <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>No holidays configured.</div>
              )}
              {Object.keys(groupedHolidays).map((month) => (
                <div key={month} className="month-section">
                  <h3 className="month-title">{month}</h3>
                  <div className="holiday-grid">
                    {groupedHolidays[month].map((holiday) => (
                      <div key={holiday.id} className={`holiday-card ${holiday.passed ? 'passed' : ''}`}>
                        <div className="holiday-date-box">
                          <span className="h-month">{getMonthName(holiday.date)}</span>
                          <span className="h-day">{getDayNum(holiday.date)}</span>
                        </div>
                        <div className="holiday-details">
                          <h4>{holiday.name}</h4>
                          <p>
                            {getWeekday(holiday.date)} &bull; 
                            <span className={`holiday-type ${holiday.type?.toLowerCase()}`}>
                              {holiday.type || 'Mandatory'}
                            </span>
                          </p>
                        </div>
                        {holiday.passed && <div className="passed-badge"><CheckSquare size={14} /> Passed</div>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>
        </div>

    </DashboardLayout>
  );
}

export default Holidays;
