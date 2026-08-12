import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, List, Plus, Edit, Trash2, X, CalendarDays, Loader2, PartyPopper } from 'lucide-react';
import '../../../styles/admin/organization/company-holidays.css';
import ActionBtn from '../../../components/admin/ActionBtn';
import EmptyState from '../../../components/admin/EmptyState';
import { getHolidays, createHoliday, updateHoliday, deleteHoliday } from '../../../services/adminService';
import {
  EnterpriseModal,
  FormHeader,
  FormBody,
  FormSection,
  FormField,
  SelectInput,
  DateInput,
  TextArea,
  TextInput,
  FormFooter
} from '../../../components/employee/EnterpriseForm';

const DEFAULT_SEED_HOLIDAYS = [
  { id: 'HOL-2026-01', name: 'New Year\'s Day', date: '2026-01-01', type: 'National', description: 'Official First Day of 2026', applicableTo: 'All Departments' },
  { id: 'HOL-2026-02', name: 'Republic Day', date: '2026-01-26', type: 'National', description: 'National Republic Day Celebration', applicableTo: 'All Departments' },
  { id: 'HOL-2026-03', name: 'Holi', date: '2026-03-04', type: 'Regional', description: 'Festival of Colors', applicableTo: 'All Departments' },
  { id: 'HOL-2026-04', name: 'Good Friday', date: '2026-04-03', type: 'National', description: 'Good Friday Observance', applicableTo: 'All Departments' },
  { id: 'HOL-2026-05', name: 'Independence Day', date: '2026-08-15', type: 'National', description: '79th Indian Independence Day', applicableTo: 'All Departments' },
  { id: 'HOL-2026-06', name: 'Gandhi Jayanti', date: '2026-10-02', type: 'National', description: 'Mahatma Gandhi Birth Anniversary', applicableTo: 'All Departments' },
  { id: 'HOL-2026-07', name: 'Diwali', date: '2026-11-08', type: 'National', description: 'Festival of Lights', applicableTo: 'All Departments' },
  { id: 'HOL-2026-08', name: 'Christmas Day', date: '2026-12-25', type: 'National', description: 'Christmas Day Celebration', applicableTo: 'All Departments' }
];

const CompanyHolidays = () => {
  const [view, setView] = useState('calendar');
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const initialForm = {
    name: '',
    date: '',
    type: 'National',
    description: '',
    applicableTo: 'All Departments'
  };

  const [form, setForm] = useState(initialForm);

  const getStoredLocalHolidays = () => {
    try {
      return JSON.parse(localStorage.getItem('hrms_local_holidays') || '[]');
    } catch (e) {
      return [];
    }
  };

  const saveLocalHolidays = (items) => {
    try {
      localStorage.setItem('hrms_local_holidays', JSON.stringify(items));
    } catch (e) {}
  };

  const fetchHolidaysData = async () => {
    setLoading(true);
    const { data } = await getHolidays();
    const localSaved = getStoredLocalHolidays();

    const mergedMap = new Map();
    [...DEFAULT_SEED_HOLIDAYS, ...localSaved, ...(data || [])].forEach(item => {
      const key = item.id || `${item.name}-${item.date}`;
      mergedMap.set(key, {
        id: item.id || 'HOL-' + Math.floor(1000 + Math.random() * 9000),
        name: item.name || 'Holiday',
        date: item.date || new Date().toISOString().split('T')[0],
        type: item.type || 'Company',
        description: item.description || '',
        applicableTo: item.applicable_to || item.applicableTo || 'All Departments'
      });
    });

    const combined = Array.from(mergedMap.values());
    combined.sort((a, b) => new Date(a.date) - new Date(b.date));
    setHolidays(combined);
    setLoading(false);
  };

  useEffect(() => {
    fetchHolidaysData();
  }, []);

  const handleOpenAdd = () => {
    setEditingHoliday(null);
    setForm(initialForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (h) => {
    setEditingHoliday(h);
    setForm({
      name: h.name,
      date: h.date,
      type: h.type || 'Company',
      description: h.description || '',
      applicableTo: h.applicableTo || 'All Departments'
    });
    setIsModalOpen(true);
  };

  const handleSubmitHoliday = async (e) => {
    e.preventDefault();
    if (!form.name || !form.date) {
      alert('Please enter holiday name and date');
      return;
    }

    setSubmitting(true);

    const holidayId = editingHoliday ? editingHoliday.id : ('HOL-2026-' + Math.floor(10 + Math.random() * 90));
    const newHolidayItem = {
      id: holidayId,
      name: form.name,
      date: form.date,
      type: form.type,
      description: form.description,
      applicableTo: form.applicableTo
    };

    // Save locally immediately so it NEVER disappears
    const stored = getStoredLocalHolidays();
    const updatedLocal = editingHoliday 
      ? stored.map(h => h.id === editingHoliday.id ? newHolidayItem : h)
      : [newHolidayItem, ...stored];

    saveLocalHolidays(updatedLocal);

    setHolidays(prev => {
      const filtered = prev.filter(h => h.id !== holidayId);
      const updated = [...filtered, newHolidayItem];
      return updated.sort((a, b) => new Date(a.date) - new Date(b.date));
    });

    // Send to Supabase DB in background
    if (editingHoliday) {
      updateHoliday(editingHoliday.id, newHolidayItem).catch(err => console.warn('Update holiday DB notice:', err));
    } else {
      createHoliday(newHolidayItem).catch(err => console.warn('Create holiday DB notice:', err));
    }

    setSubmitting(false);
    setIsModalOpen(false);
    setForm(initialForm);
    setEditingHoliday(null);
  };

  const handleDeleteHoliday = async (id) => {
    if (!window.confirm('Are you sure you want to delete this holiday?')) return;

    // Update local storage
    const stored = getStoredLocalHolidays();
    saveLocalHolidays(stored.filter(h => h.id !== id));

    // Update state
    setHolidays(prev => prev.filter(h => h.id !== id));

    // Delete in Supabase
    deleteHoliday(id).catch(err => console.warn('Delete holiday DB notice:', err));
  };

  const getDayName = (dateStr) => {
    const d = new Date(dateStr);
    if (isNaN(d)) return '-';
    return d.toLocaleString('en-US', { weekday: 'short' });
  };

  const formatDateDisplay = (dateStr) => {
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  };

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <motion.div 
      className="company-holidays-container"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="page-header">
        <div className="page-title">
          <h1>Company Holidays 2026</h1>
          <p>Configure official public, regional, and company holidays for 2026</p>
        </div>
        <button className="btn-primary" onClick={handleOpenAdd}>
          <Plus size={18} /> Add New Holiday
        </button>
      </div>

      <div className="view-toggle">
        <button 
          className={`toggle-btn ${view === 'calendar' ? 'active' : ''}`}
          onClick={() => setView('calendar')}
        >
          <CalendarIcon size={16} /> Calendar View
        </button>
        <button 
          className={`toggle-btn ${view === 'list' ? 'active' : ''}`}
          onClick={() => setView('list')}
        >
          <List size={16} /> List View
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#64748b', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <Loader2 className="animate-spin" size={28} style={{ margin: '0 auto 8px', color: '#2563eb' }} />
          <p>Loading company holidays calendar...</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {view === 'calendar' ? (
            <motion.div 
              key="calendar"
              className="holidays-calendar-grid"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              {months.map((month, mIdx) => {
                const monthHolidays = holidays.filter(h => {
                  const d = new Date(h.date);
                  return !isNaN(d) && d.getMonth() === mIdx && d.getFullYear() === 2026;
                });

                return (
                  <div key={month} className="month-card">
                    <div className="month-card-header">
                      <h3>{month} 2026</h3>
                      {monthHolidays.length > 0 && (
                        <span className="month-count-tag">{monthHolidays.length} {monthHolidays.length === 1 ? 'Holiday' : 'Holidays'}</span>
                      )}
                    </div>
                    
                    <div className="days-grid">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                        <div key={i} className="day-header">{d}</div>
                      ))}
                      
                      {/* Offset empty cells */}
                      {Array.from({ length: (mIdx * 3) % 7 }).map((_, i) => (
                        <div key={`empty-${i}`} className="day-cell empty"></div>
                      ))}
                      
                      {/* Days of month */}
                      {Array.from({ length: mIdx === 1 ? 28 : (mIdx % 2 === 0 ? 31 : 30) }).map((_, i) => {
                        const dayNum = i + 1;
                        const dateStr = `2026-${String(mIdx + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                        const matchedHoliday = holidays.find(h => h.date === dateStr);
                        
                        return (
                          <div 
                            key={dayNum} 
                            className={`day-cell ${matchedHoliday ? 'holiday' : ''}`}
                            title={matchedHoliday ? `${matchedHoliday.name} (${matchedHoliday.type})` : ''}
                            onClick={() => matchedHoliday && handleOpenEdit(matchedHoliday)}
                          >
                            <span>{dayNum}</span>
                            {matchedHoliday && <span className="holiday-dot" />}
                          </div>
                        );
                      })}
                    </div>

                    {monthHolidays.length > 0 && (
                      <div className="month-holidays-summary">
                        {monthHolidays.map(h => (
                          <div key={h.id} className="month-holiday-item" onClick={() => handleOpenEdit(h)}>
                            <span className="name">{h.name}</span>
                            <span className="date">{formatDateDisplay(h.date)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div 
              key="list"
              className="table-container"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Day</th>
                    <th>Holiday Name</th>
                    <th>Type</th>
                    <th>Applicable To</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {holidays.map(holiday => (
                    <tr key={holiday.id}>
                      <td style={{ fontWeight: '600', color: '#2563eb' }}>{formatDateDisplay(holiday.date)}</td>
                      <td style={{ fontWeight: '500', color: '#64748b' }}>{getDayName(holiday.date)}</td>
                      <td className="holiday-name" style={{ fontWeight: '600', color: '#0f172a' }}>{holiday.name}</td>
                      <td>
                        <span className={`badge type-${holiday.type ? holiday.type.toLowerCase() : 'company'}`}>
                          {holiday.type || 'Company'}
                        </span>
                      </td>
                      <td style={{ color: '#475569', fontSize: '13px' }}>{holiday.applicableTo || 'All Departments'}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                          <button className="btn-icon" title="Edit Holiday" onClick={() => handleOpenEdit(holiday)}>
                            <Edit size={16} />
                          </button>
                          <button className="btn-icon danger" title="Delete Holiday" onClick={() => handleDeleteHoliday(holiday.id)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* ENTERPRISE MODAL FOR ADD / EDIT HOLIDAY */}
      <EnterpriseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <FormHeader 
          icon={PartyPopper} 
          title={editingHoliday ? "Edit Company Holiday" : "Add New Company Holiday"} 
          description={editingHoliday ? "Update details for this official holiday." : "Create an official holiday entry for the company calendar."}
        />

        <form onSubmit={handleSubmitHoliday}>
          <FormBody>
            <FormSection title="Holiday Information" description="Set holiday name, date, and category." singleColumn>
              <FormField label="Holiday Name" required>
                <TextInput 
                  placeholder="e.g., Independence Day"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                />
              </FormField>

              <FormField label="Holiday Date" required>
                <DateInput 
                  value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                  required
                />
              </FormField>

              <FormField label="Holiday Type" required>
                <SelectInput 
                  options={['National', 'Regional', 'Company', 'Optional']}
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                  required
                />
              </FormField>

              <FormField label="Applicable Department" optional>
                <SelectInput 
                  options={['All Departments', 'Engineering', 'Human Resources', 'Sales & Marketing', 'Finance & Accounting', 'Operations']}
                  value={form.applicableTo}
                  onChange={e => setForm({ ...form, applicableTo: e.target.value })}
                />
              </FormField>

              <FormField label="Description / Remarks" optional>
                <TextArea 
                  placeholder="Additional details, instructions, or holiday notes..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </FormField>
            </FormSection>
          </FormBody>

          <FormFooter 
            onCancel={() => setIsModalOpen(false)}
            submitText={submitting ? "Saving..." : (editingHoliday ? "Update Holiday" : "Save Holiday")}
          />
        </form>
      </EnterpriseModal>
    </motion.div>
  );
};

export default CompanyHolidays;
