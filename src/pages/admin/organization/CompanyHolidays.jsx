import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, List, Plus, Edit, Trash2, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import '../../../styles/admin/organization/company-holidays.css';
import ActionBtn from '../../../components/admin/ActionBtn';
import { getHolidays, createHoliday, deleteHoliday } from '../../../services/adminService';

const MOCK_HOLIDAYS = [
  { id: 'H-01', name: 'Republic Day', date: '26 Jan 2026', type: 'National' },
  { id: 'H-02', name: 'Holi', date: '04 Mar 2026', type: 'National' },
  { id: 'H-03', name: 'Company Foundation Day', date: '15 Apr 2026', type: 'Company' },
  { id: 'H-04', name: 'Labor Day', date: '01 May 2026', type: 'National' },
  { id: 'H-05', name: 'Independence Day', date: '15 Aug 2026', type: 'National' },
  { id: 'H-06', name: 'Ganesh Chaturthi', date: '14 Sep 2026', type: 'Regional' },
  { id: 'H-07', name: 'Gandhi Jayanti', date: '02 Oct 2026', type: 'National' },
  { id: 'H-08', name: 'Diwali', date: '08 Nov 2026', type: 'National' },
  { id: 'H-09', name: 'Bhai Dooj', date: '10 Nov 2026', type: 'Optional' },
  { id: 'H-10', name: 'Christmas', date: '25 Dec 2026', type: 'National' },
];

const CompanyHolidays = () => {
  const [view, setView] = useState('calendar');
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await getHolidays();
      setHolidays(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const onSubmit = async (data) => {
    const { data: newHoliday, error } = await createHoliday({
      name: data.name,
      date: data.date,
      type: data.type
    });
    if (newHoliday) {
      setHolidays(prev => [...prev, newHoliday].sort((a, b) => new Date(a.date) - new Date(b.date)));
      setIsModalOpen(false);
      reset();
    } else {
      alert('Error: ' + error?.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this holiday?')) return;
    const { error } = await deleteHoliday(id);
    if (!error) setHolidays(prev => prev.filter(h => h.id !== id));
  };

  const getDayName = (dateStr) => {
    const d = new Date(dateStr);
    if(isNaN(d)) return 'Unknown';
    return d.toLocaleString('en-US', { weekday: 'long' });
  };

  // Mock Calendar Generation Logic
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return (
    <motion.div 
      className="company-holidays-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="page-header">
        <div className="page-title">
          <h1>Company Holidays 2026</h1>
          <p>Manage the official holiday calendar for the organization</p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Add Holiday
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

      <AnimatePresence mode="wait">
        {view === 'calendar' ? (
          <motion.div 
            key="calendar"
            className="holidays-calendar-grid"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            {months.map((month, mIdx) => (
              <div key={month} className="month-card">
                <h3 className="month-title">{month} 2026</h3>
                <div className="days-grid">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i} className="day-header">{d}</div>)}
                  {/* Mock empty days for offset (randomized slightly for visual effect) */}
                  {Array.from({ length: (mIdx * 3) % 7 }).map((_, i) => <div key={`empty-${i}`} className="day-cell"></div>)}
                  
                  {/* Generate 28-31 days */}
                  {Array.from({ length: mIdx === 1 ? 28 : 31 }).map((_, i) => {
                    const dayNum = i + 1;
                    // Check if this day is a holiday
                    const dateStrMatch = `${dayNum.toString().padStart(2, '0')} ${month} 2026`;
                    const holiday = holidays.find(h => h.date === dateStrMatch);
                    
                    return (
                      <div 
                        key={dayNum} 
                        className={`day-cell ${holiday ? 'holiday' : ''}`}
                        title={holiday ? `${holiday.name} (${holiday.type})` : ''}
                      >
                        {dayNum}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            key="list"
            className="table-container"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Day</th>
                  <th>Holiday Name</th>
                  <th>Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {holidays.map(holiday => (
                  <tr key={holiday.id}>
                    <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{holiday.date}</td>
                    <td>{getDayName(holiday.date)}</td>
                    <td className="holiday-name">{holiday.name}</td>
                    <td>
                      <span className={`badge type-${holiday.type.toLowerCase()}`}>
                        {holiday.type}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ActionBtn variant="secondary" title="Edit"><Edit size={14} /> Edit</ActionBtn>
                        <ActionBtn variant="danger" title="Delete"><Trash2 size={14} /> Delete</ActionBtn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isModalOpen && (
          <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            <motion.div 
              className="modal-content"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>Add New Holiday</h3>
                <button className="close-btn" onClick={() => setIsModalOpen(false)}><X size={24} /></button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="form-group">
                  <label>Holiday Name <span>*</span></label>
                  <input 
                    type="text" 
                    className={`form-control ${errors.name ? 'error' : ''}`}
                    placeholder="e.g., Diwali"
                    {...register('name', { required: 'Holiday name is required' })}
                  />
                  {errors.name && <span className="error-message">{errors.name.message}</span>}
                </div>
                
                <div className="form-group">
                  <label>Date <span>*</span></label>
                  <input 
                    type="date" 
                    className={`form-control ${errors.date ? 'error' : ''}`}
                    {...register('date', { required: 'Date is required' })}
                  />
                  {errors.date && <span className="error-message">{errors.date.message}</span>}
                </div>

                <div className="form-group">
                  <label>Holiday Type <span>*</span></label>
                  <select 
                    className={`form-control ${errors.type ? 'error' : ''}`}
                    {...register('type', { required: 'Type is required' })}
                  >
                    <option value="">Select Type</option>
                    <option value="National">National</option>
                    <option value="Regional">Regional</option>
                    <option value="Company">Company</option>
                    <option value="Optional">Optional</option>
                  </select>
                  {errors.type && <span className="error-message">{errors.type.message}</span>}
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea className="form-control" rows="3" {...register('description')}></textarea>
                </div>

                <div className="form-group">
                  <label>Applicable To</label>
                  <select className="form-control" {...register('applicableTo')}>
                    <option value="All">All Departments</option>
                    <option value="Specific">Specific Departments</option>
                  </select>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn-submit">Save Holiday</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CompanyHolidays;
