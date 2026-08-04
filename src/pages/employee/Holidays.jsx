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

const HOLIDAYS_DATA = [
  { id: 1, date: '2025-01-01', name: 'New Year', type: 'Mandatory', passed: true },
  { id: 2, date: '2025-01-26', name: 'Republic Day', type: 'Mandatory', passed: true },
  { id: 3, date: '2025-03-14', name: 'Holi', type: 'Mandatory', passed: true },
  { id: 4, date: '2025-04-10', name: 'Good Friday', type: 'Optional', passed: false },
  { id: 5, date: '2025-05-01', name: 'Labour Day', type: 'Mandatory', passed: false },
  { id: 6, date: '2025-08-15', name: 'Independence Day', type: 'Mandatory', passed: false },
  { id: 7, date: '2025-10-02', name: 'Gandhi Jayanti', type: 'Mandatory', passed: false },
  { id: 8, date: '2025-10-21', name: 'Diwali', type: 'Mandatory', passed: false },
  { id: 9, date: '2025-12-25', name: 'Christmas', type: 'Mandatory', passed: false }
];

function Holidays() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newHoliday, setNewHoliday] = useState({ name: '', date: '', type: 'Mandatory' });

  const handleAddHoliday = (e) => {
    e.preventDefault();
    alert(`Added holiday: ${newHoliday.name}`);
    setShowModal(false);
  };

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
  const groupedHolidays = HOLIDAYS_DATA.reduce((acc, holiday) => {
    const month = new Date(holiday.date).toLocaleString('default', { month: 'long' });
    if (!acc[month]) acc[month] = [];
    acc[month].push(holiday);
    return acc;
  }, {});

  const totalHolidays = HOLIDAYS_DATA.length;
  const upcomingHoliday = HOLIDAYS_DATA.find(h => !h.passed);

  return (
    <DashboardLayout>

        {/* Holidays Content */}
        <div className="dashboard-content">
          <div className="holidays-wrapper">
            <div className="holidays-header">
              <div className="holidays-title">
                <h1>Holiday Calendar 2025</h1>
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

            <div className="holidays-list-container">
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
                            <span className={`holiday-type ${holiday.type.toLowerCase()}`}>
                              {holiday.type}
                            </span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      {/* CREATE HOLIDAY ENTERPRISE MODAL */}
      <EnterpriseModal isOpen={showModal} onClose={() => setShowModal(false)}>
        <FormHeader 
          icon={Palmtree} 
          title="Add New Holiday" 
          description="Schedule a public or company holiday for the organization." 
        />
        
        <form onSubmit={handleAddHoliday}>
          <FormBody>
            <FormSection title="Holiday Details" description="Enter the basic information about the holiday.">
              <FormField label="Holiday Name" required fullWidth>
                <TextInput 
                  placeholder="e.g. Christmas Day"
                  value={newHoliday.name}
                  onChange={(e) => setNewHoliday({...newHoliday, name: e.target.value})}
                  required
                />
              </FormField>

              <FormField label="Date" required>
                <DateInput 
                  required
                  value={newHoliday.date}
                  onChange={(e) => setNewHoliday({...newHoliday, date: e.target.value})}
                />
              </FormField>

              <FormField label="Holiday Type" required>
                <SelectInput 
                  options={['Mandatory', 'Optional', 'Restricted']}
                  value={newHoliday.type}
                  onChange={(e) => setNewHoliday({...newHoliday, type: e.target.value})}
                  required
                />
              </FormField>
            </FormSection>
          </FormBody>
          
          <FormFooter 
            onCancel={() => setShowModal(false)} 
            submitText="Save Holiday" 
          />
        </form>
      </EnterpriseModal>
    </DashboardLayout>
  );
}

export default Holidays;
