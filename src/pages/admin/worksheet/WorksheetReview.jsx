import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, CheckCircle, XCircle, Eye, Clock, X, SearchX, Calendar, Undo2, Loader2, Download } from 'lucide-react';
import '../../../styles/admin/worksheet/worksheet-review.css';
import { usePopup } from '../../../contexts/PopupContext';
import EmptyState from '../../../components/admin/EmptyState';
import CustomDropdown from '../../../components/admin/CustomDropdown';
import { getAllWorksheets, updateWorksheetStatus } from '../../../services/adminService';

const decodeWorksheetData = (w) => {
  const rawDesc = w.description || '';
  if (rawDesc.startsWith('__META__')) {
    try {
      const parts = rawDesc.split('__META__');
      const meta = JSON.parse(parts[1]);
      return {
        title: meta.t || w.project || 'Daily Work',
        category: meta.c || 'Development',
        startTime: meta.st || '10:00',
        endTime: meta.et || '18:00',
        workStatus: meta.ws || 'Completed',
        challenges: meta.ch || '',
        achievements: meta.ac || '',
        fileName: meta.fn || '',
        fileData: meta.fd || '',
        notes: meta.d || parts[2] || 'No detailed description provided.'
      };
    } catch (e) {
      // fallback
    }
  }
  return {
    title: w.project || 'Daily Work',
    category: 'Development',
    startTime: '10:00',
    endTime: '18:00',
    workStatus: 'Completed',
    challenges: '',
    achievements: '',
    fileName: '',
    fileData: '',
    notes: rawDesc || 'No detailed description provided.'
  };
};

const WorksheetReview = () => {
  const [activeTab, setActiveTab] = useState('Pending');
  const { showAlert } = usePopup();
  const [dateFilter, setDateFilter] = useState('');
  const [empFilter, setEmpFilter] = useState('');
  const [projFilter, setProjFilter] = useState('');
  
  const [worksheets, setWorksheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [adminComment, setAdminComment] = useState('');
  const [previewFile, setPreviewFile] = useState(null);

  const fetchWorksheets = async () => {
    setLoading(true);
    const { data } = await getAllWorksheets();
    if (data) {
      const parsed = data.map(w => {
        const decoded = decodeWorksheetData(w);
        const empName = w.profiles 
          ? `${w.profiles.first_name || ''} ${w.profiles.last_name || ''}`.trim() 
          : 'Employee';
        const initials = `${(w.profiles?.first_name || 'E')[0]}${(w.profiles?.last_name || 'E')[0]}`.toUpperCase();
        const rawStatus = (w.status || 'submitted').toLowerCase();
        let status = 'Pending';
        if (rawStatus === 'approved') status = 'Approved';
        if (rawStatus === 'rejected') status = 'Rejected';

        return {
          id: w.id,
          empName,
          avatar: initials,
          date: w.date || new Date().toISOString().split('T')[0],
          project: w.project || 'General Task',
          tasks: [
            {
              title: decoded.title,
              category: decoded.category,
              project: w.project || 'Internal',
              status: decoded.workStatus,
              startTime: decoded.startTime,
              endTime: decoded.endTime,
              hrs: w.hours || '1.0',
              notes: decoded.notes,
              challenges: decoded.challenges,
              achievements: decoded.achievements,
              fileName: decoded.fileName,
              fileData: decoded.fileData
            }
          ],
          totalHrs: w.hours || '1.0',
          submittedAt: w.created_at ? new Date(w.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today',
          status,
          rawStatus: w.status
        };
      });
      setWorksheets(parsed);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWorksheets();
  }, []);

  const filteredSheets = worksheets.filter(ws => {
    const matchesTab = activeTab === 'All' ? true : ws.status === activeTab;
    const matchesDate = dateFilter ? ws.date.includes(dateFilter) : true;
    const matchesEmp = empFilter ? ws.empName.toLowerCase().includes(empFilter.toLowerCase()) : true;
    const matchesProj = projFilter ? ws.project.toLowerCase().includes(projFilter.toLowerCase()) : true;
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

  const handleAction = async (ws, action) => {
    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    await updateWorksheetStatus(ws.id, newStatus);
    fetchWorksheets();
    closeDrawer();
  };

  const handleExportCSV = () => {
    if (filteredSheets.length === 0) {
      showAlert('No worksheets available to export.', 'warning');
      return;
    }

    const headers = ['ID', 'Employee Name', 'Date', 'Project', 'Total Hours', 'Submitted At', 'Status', 'Tasks Summary'];
    const rows = filteredSheets.map(w => [
      w.id || '',
      `"${w.empName}"`,
      w.date,
      `"${w.project}"`,
      w.totalHrs,
      w.submittedAt,
      w.status,
      `"${(w.tasks[0]?.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `worksheets_review_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div 
      className="worksheet-review-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="page-title">
          <h1>Worksheet Review</h1>
          <p>Review and approve daily work reports submitted by employees</p>
        </div>
        <button className="btn-secondary" onClick={handleExportCSV} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 16px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: '#334155' }}>
          <Download size={16} /> Export CSV
        </button>
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
              ...Array.from(new Set(worksheets.map(w => w.empName))).filter(Boolean).map(name => ({
                value: name,
                label: name
              }))
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
              <div className="drawer-header" style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', padding: '22px 24px', color: '#ffffff' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  fontWeight: '700',
                  color: '#ffffff',
                  boxShadow: '0 4px 10px rgba(99, 102, 241, 0.4)',
                  flexShrink: 0
                }}>
                  {selectedSheet.avatar}
                </div>
                <div style={{ flexGrow: 1 }}>
                  <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#ffffff' }}>{selectedSheet.empName}</h2>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#c7d2fe', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={13} /> Worksheet for <strong>{selectedSheet.date}</strong>
                  </p>
                </div>
                <button className="close-btn" onClick={closeDrawer} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>

              <div className="drawer-body" style={{ padding: '24px', background: '#f8fafc' }}>
                {selectedSheet.tasks.map((task, idx) => (
                  <div key={idx} className="worksheet-task-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '18px', marginBottom: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <div className="wt-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                          <span style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
                            {task.project}
                          </span>
                          {task.category && (
                            <span style={{ background: '#f3e8ff', color: '#7e22ce', border: '1px solid #e9d5ff', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600' }}>
                              {task.category}
                            </span>
                          )}
                        </div>
                        <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                          Task {idx + 1}: {task.title}
                        </h4>
                      </div>
                      <span className={`wt-status ${task.status === 'Completed' ? 'completed' : ''}`} style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>
                        {task.status}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', fontSize: '12px' }}>
                      <span style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '4px 10px', borderRadius: '6px', color: '#334155' }}>
                        ⏱️ <strong>Hours Logged:</strong> {task.hrs} hrs
                      </span>
                      {task.startTime && task.endTime && (
                        <span style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '4px 10px', borderRadius: '6px', color: '#475569' }}>
                          🕒 <strong>Time:</strong> {task.startTime} - {task.endTime}
                        </span>
                      )}
                    </div>

                    <div className="wt-notes" style={{ background: '#f8fafc', borderLeft: '3px solid #6366f1', padding: '12px', borderRadius: '0 8px 8px 0', fontSize: '13.5px', color: '#334155', lineHeight: '1.5', margin: '10px 0' }}>
                      "{task.notes}"
                    </div>

                    {task.challenges && (
                      <div style={{ marginTop: '8px', fontSize: '13px', color: '#be123c', background: '#fff1f2', border: '1px solid #fecdd3', padding: '8px 12px', borderRadius: '8px' }}>
                        ⚠️ <strong>Challenges Faced:</strong> {task.challenges}
                      </div>
                    )}

                    {task.achievements && (
                      <div style={{ marginTop: '8px', fontSize: '13px', color: '#047857', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '8px 12px', borderRadius: '8px' }}>
                        🏆 <strong>Achievements:</strong> {task.achievements}
                      </div>
                    )}

                    {task.fileName && (
                      <div style={{ marginTop: '10px', display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '7px 12px', borderRadius: '8px', fontSize: '13px', color: '#1d4ed8' }}>
                        <span>📎 <strong>Attached File:</strong> {task.fileName}</span>
                        <div style={{ display: 'flex', gap: '6px', marginLeft: '6px' }}>
                          {task.fileData && (
                            <button 
                              type="button" 
                              onClick={() => setPreviewFile({ name: task.fileName, url: task.fileData })}
                              style={{
                                background: '#ffffff',
                                border: '1px solid #bfdbfe',
                                borderRadius: '6px',
                                padding: '3px 9px',
                                fontSize: '12px',
                                fontWeight: '600',
                                color: '#2563eb',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <Eye size={13} /> View
                            </button>
                          )}
                          {task.fileData && (
                            <a 
                              href={task.fileData} 
                              download={task.fileName}
                              style={{
                                background: '#2563eb',
                                color: '#ffffff',
                                borderRadius: '6px',
                                padding: '3px 9px',
                                fontSize: '12px',
                                fontWeight: '600',
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <Download size={13} /> Download
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                <div className="worksheet-summary" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px', marginTop: '16px' }}>
                  <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748b', marginBottom: '6px' }}>
                    <span>Total Tasks Logged</span>
                    <strong style={{ color: '#0f172a' }}>{selectedSheet.tasks.length}</strong>
                  </div>
                  <div className="summary-row total" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: '700', color: '#0f172a', paddingTop: '10px', borderTop: '1px dashed #e2e8f0' }}>
                    <span>Total Hours For Day</span>
                    <span style={{ color: '#2563eb' }}>{selectedSheet.totalHrs} hrs</span>
                  </div>
                </div>

                {selectedSheet.status === 'Pending' && (
                  <div className="admin-comment" style={{ marginTop: '20px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Admin Feedback / Comments</label>
                    <textarea 
                      placeholder="Add feedback before approving or rejecting..."
                      value={adminComment}
                      onChange={e => setAdminComment(e.target.value)}
                      style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '10px', minHeight: '80px', outline: 'none', fontSize: '14px' }}
                    />
                  </div>
                )}
              </div>

              {selectedSheet.status === 'Pending' && (
                <div className="drawer-footer" style={{ padding: '16px 24px', background: '#ffffff', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '12px' }}>
                  <button 
                    className="btn-reject" 
                    onClick={() => handleAction(selectedSheet, 'reject')}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '10px',
                      border: '1.5px solid #fecaca',
                      background: '#fef2f2',
                      color: '#dc2626',
                      fontWeight: '700',
                      fontSize: '14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <Undo2 size={16} /> Send Back
                  </button>
                  <button 
                    className="btn-approve" 
                    onClick={() => handleAction(selectedSheet, 'approve')}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '10px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: '#ffffff',
                      fontWeight: '700',
                      fontSize: '14px',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <CheckCircle size={16} /> Approve Worksheet
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* In-Window File Preview Modal Popup */}
      <AnimatePresence>
        {previewFile && (
          <div className="drawer-overlay" style={{ zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }} onClick={() => setPreviewFile(null)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '800px', width: '100%', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e5e7eb', paddingBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px' }}>📎</span>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#111827' }}>{previewFile.name}</h3>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {previewFile.url && (
                    <a 
                      href={previewFile.url} 
                      download={previewFile.name} 
                      style={{
                        padding: '6px 14px',
                        borderRadius: '8px',
                        background: '#2563eb',
                        color: '#ffffff',
                        fontSize: '13px',
                        fontWeight: '600',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Download size={14} /> Download
                    </a>
                  )}
                  <button 
                    onClick={() => setPreviewFile(null)}
                    style={{ background: '#f3f4f6', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', textAlign: 'center', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {previewFile.url?.startsWith('data:image') || previewFile.name?.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ? (
                  <img 
                    src={previewFile.url} 
                    alt={previewFile.name} 
                    style={{ maxWidth: '100%', maxHeight: '65vh', borderRadius: '8px', objectFit: 'contain', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
                  />
                ) : (
                  <div style={{ padding: '40px', color: '#64748b' }}>
                    <p style={{ fontSize: '15px', margin: '0 0 12px', fontWeight: '500' }}>Document Preview</p>
                    <a href={previewFile.url} download={previewFile.name} style={{ color: '#2563eb', fontWeight: '600', textDecoration: 'underline' }}>
                      Download {previewFile.name}
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default WorksheetReview;
