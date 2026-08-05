import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, CheckCircle, XCircle, Eye, Clock, X, SearchX, Calendar, Undo2 } from 'lucide-react';
import '../../../styles/admin/worksheet/worksheet-review.css';
import EmptyState from '../../../components/admin/EmptyState';
import CustomDropdown from '../../../components/admin/CustomDropdown';

const MOCK_WORKSHEETS = [
  { 
    id: 'WS-001', empId: 'EMP-023', empName: 'Rahul Sharma', avatar: 'RS', date: '05 Aug 2026', submittedAt: '18:30',
    project: 'Website Redesign', totalHrs: 5.5, status: 'Pending',
    tasks: [
      { title: 'Login Page UI', project: 'Website Redesign', hrs: 3.5, status: 'Completed', notes: 'Built responsive login with OTP flow' },
      { title: 'Dashboard Charts', project: 'Website Redesign', hrs: 2.0, status: 'In Progress', notes: 'Started integration of Recharts library' }
    ]
  },
  { 
    id: 'WS-002', empId: 'EMP-042', empName: 'Priya Patel', avatar: 'PP', date: '05 Aug 2026', submittedAt: '17:45',
    project: 'CRM System', totalHrs: 8.0, status: 'Approved',
    tasks: [
      { title: 'Database Optimization', project: 'CRM System', hrs: 4.5, status: 'Completed', notes: 'Added missing indexes, query time down 40%' },
      { title: 'Client Meeting', project: 'CRM System', hrs: 1.5, status: 'Completed', notes: 'Discussed phase 2 requirements' },
      { title: 'API Documentation', project: 'CRM System', hrs: 2.0, status: 'Completed', notes: 'Updated swagger docs for new endpoints' }
    ]
  },
  { 
    id: 'WS-003', empId: 'EMP-015', empName: 'Amit Kumar', avatar: 'AK', date: '05 Aug 2026', submittedAt: '19:10',
    project: 'Mobile App', totalHrs: 7.5, status: 'Pending',
    tasks: [
      { title: 'Push Notifications', project: 'Mobile App', hrs: 5.0, status: 'In Progress', notes: 'Configured Firebase, testing iOS delivery' },
      { title: 'Bug Fixing', project: 'Mobile App', hrs: 2.5, status: 'Completed', notes: 'Fixed crash on startup for Android 12' }
    ]
  },
  { 
    id: 'WS-004', empId: 'EMP-088', empName: 'Neha Gupta', avatar: 'NG', date: '04 Aug 2026', submittedAt: '18:00',
    project: 'Marketing Campaign', totalHrs: 6.0, status: 'Rejected',
    tasks: [
      { title: 'Ad Copywriting', project: 'Marketing Campaign', hrs: 6.0, status: 'Completed', notes: 'Drafted 15 ad variations for review' }
    ]
  },
  { 
    id: 'WS-005', empId: 'EMP-102', empName: 'Vikram Singh', avatar: 'VS', date: '04 Aug 2026', submittedAt: '18:15',
    project: 'Finance Portal', totalHrs: 8.5, status: 'Approved',
    tasks: [
      { title: 'Payroll Processing', project: 'Finance Portal', hrs: 8.5, status: 'Completed', notes: 'Processed August salaries and verified tax deductions' }
    ]
  }
];

const WorksheetReview = () => {
  const [activeTab, setActiveTab] = useState('Pending');
  const [dateFilter, setDateFilter] = useState('');
  const [empFilter, setEmpFilter] = useState('');
  const [projFilter, setProjFilter] = useState('');
  
  const [worksheets, setWorksheets] = useState(MOCK_WORKSHEETS);
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [adminComment, setAdminComment] = useState('');

  const filteredSheets = worksheets.filter(ws => {
    const matchesTab = activeTab === 'All' ? true : ws.status === activeTab;
    const matchesDate = dateFilter ? ws.date.includes(dateFilter) : true;
    const matchesEmp = empFilter ? ws.empName.toLowerCase().includes(empFilter.toLowerCase()) : true;
    const matchesProj = projFilter ? ws.project === projFilter : true;
    return matchesTab && matchesDate && matchesEmp && matchesProj;
  });

  const openDrawer = (sheet) => {
    setSelectedSheet(sheet);
    setAdminComment('');
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => setSelectedSheet(null), 300);
  };

  const handleAction = (ws, action) => {
    const newStatus = action === 'approve' ? 'Approved' : 'Rejected';
    setWorksheets(prev => prev.map(w => w.id === ws.id ? { ...w, status: newStatus } : w));
    closeDrawer();
  };

  return (
    <motion.div 
      className="worksheet-review-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="page-header">
        <div className="page-title">
          <h1>Worksheet Review</h1>
          <p>Review and approve daily work reports submitted by employees</p>
        </div>
      </div>

      <div className="tabs-bar">
        {['Pending', 'Approved', 'Rejected', 'All'].map(tab => {
          const count = tab === 'All' 
            ? worksheets.length 
            : worksheets.filter(w => w.status === tab).length;
          return (
            <button 
              key={tab} 
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab} ({count})
            </button>
          )
        })}
      </div>

      <div className="filter-bar">
        <input 
          type="date" 
          className="filter-date" 
          onChange={e => {
            // Very simple mock date filter mapping (requires correct format in real app)
            const d = new Date(e.target.value);
            if(!isNaN(d)) {
              setDateFilter(d.getDate() + ' Aug 2026'); // hardcoded for mock simplicity
            } else {
              setDateFilter('');
            }
          }}
        />
        <div style={{ width: '180px' }}>
          <CustomDropdown
            value={empFilter}
            onChange={() => {}}
            options={[
              { value: '', label: 'All Employees' },
              { value: 'Rahul', label: 'Rahul Sharma' },
              { value: 'Priya', label: 'Priya Patel' },
              { value: 'Amit', label: 'Amit Kumar' },
              { value: 'Neha', label: 'Neha Gupta' }
            ]}
            fullWidth
          />
        </div>
        <div style={{ width: '180px' }}>
          <CustomDropdown
            value={projFilter}
            onChange={() => {}}
            options={[
              { value: '', label: 'All Projects' },
              { value: 'Website Redesign', label: 'Website Redesign' },
              { value: 'Mobile App', label: 'Mobile App' },
              { value: 'CRM System', label: 'CRM System' },
              { value: 'Marketing Campaign', label: 'Marketing Campaign' }
            ]}
            fullWidth
          />
        </div>
      </div>

      <div className="table-container">
        {filteredSheets.length === 0 ? (
          <EmptyState 
            icon={<SearchX size={32} />}
            title="No worksheets found"
            message="No worksheets match your current filters"
          />
        ) : (
          <table>
            <thead>
            <tr>
              <th>Employee</th>
              <th>Date</th>
              <th>Primary Project</th>
              <th>Tasks Done</th>
              <th>Total Hrs</th>
              <th>Submitted At</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSheets.map(ws => (
              <tr key={ws.id} onClick={() => openDrawer(ws)}>
                <td>
                  <div className="employee-cell">
                    <div className="emp-avatar">{ws.avatar}</div>
                    <div className="emp-name">{ws.empName}</div>
                  </div>
                </td>
                <td><div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} color="#6b7280" /> {ws.date}</div></td>
                <td>{ws.project}</td>
                <td>{ws.tasks.length} Tasks</td>
                <td style={{ fontWeight: '500' }}>{ws.totalHrs} hrs</td>
                <td style={{ color: 'var(--text-tertiary)' }}>{ws.submittedAt}</td>
                <td>
                  <span className={`badge ${ws.status.toLowerCase()}`}>{ws.status}</span>
                </td>
                <td>
                  <div className="lr-action-group">
                    {ws.status === 'Pending' && (
                      <>
                        <button className="lr-btn-approve" title="Approve" onClick={(e) => { e.stopPropagation(); handleAction(ws, 'approve'); }}>
                          <CheckCircle size={13} /> Approve
                        </button>
                        <button className="lr-btn-sendback" title="Send Back" onClick={(e) => { e.stopPropagation(); handleAction(ws, 'reject'); }}>
                          <Undo2 size={13} /> Send Back
                        </button>
                      </>
                    )}
                    <button className="lr-btn-view" title="View Details" onClick={(e) => { e.stopPropagation(); openDrawer(ws); }}>
                      <Eye size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredSheets.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>
                  No worksheets found for the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        )}
      </div>

      <AnimatePresence>
        {isDrawerOpen && selectedSheet && (
          <div className="drawer-overlay" onClick={closeDrawer}>
            <motion.div 
              className="drawer-content"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="drawer-header">
                <div>
                  <h2>{selectedSheet.empName}</h2>
                  <p>Worksheet for {selectedSheet.date}</p>
                </div>
                <button className="close-btn" onClick={closeDrawer}><X size={24} /></button>
              </div>

              <div className="drawer-body">
                {selectedSheet.tasks.map((task, idx) => (
                  <div key={idx} className="worksheet-task-card">
                    <div className="wt-header">
                      <div>
                        <div className="wt-title">Task {idx + 1}: {task.title}</div>
                        <div className="wt-project">{task.project}</div>
                      </div>
                      <span className={`wt-status ${task.status === 'Completed' ? 'completed' : ''}`}>
                        {task.status}
                      </span>
                    </div>
                    
                    <div className="wt-details">
                      <span className="wt-label">Hours Logged:</span>
                      <span className="wt-val">{task.hrs} hrs</span>
                    </div>

                    <div className="wt-notes">
                      "{task.notes}"
                    </div>
                  </div>
                ))}

                <div className="worksheet-summary">
                  <div className="summary-row">
                    <span style={{ color: 'var(--text-tertiary)' }}>Total Tasks Logged</span>
                    <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{selectedSheet.tasks.length}</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total Hours For Day</span>
                    <span>{selectedSheet.totalHrs} hrs</span>
                  </div>
                </div>

                {selectedSheet.status === 'Pending' && (
                  <div className="admin-comment">
                    <label>Admin Feedback / Comments</label>
                    <textarea 
                      placeholder="Add feedback before approving or rejecting..."
                      value={adminComment}
                      onChange={e => setAdminComment(e.target.value)}
                    ></textarea>
                  </div>
                )}
              </div>

              {selectedSheet.status === 'Pending' && (
                <div className="drawer-footer">
                  <button className="btn-reject" onClick={() => handleAction(selectedSheet, 'reject')}>Reject Worksheet</button>
                  <button className="btn-approve" onClick={() => handleAction(selectedSheet, 'approve')}>Approve Worksheet</button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default WorksheetReview;
