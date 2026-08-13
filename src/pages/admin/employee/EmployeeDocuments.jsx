import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, UploadCloud, Grid, List, 
  FileText, Download, Eye, MoreVertical, SearchX
} from 'lucide-react';
import '../../../styles/admin/employee/employee-documents.css';
import EmptyState from '../../../components/admin/EmptyState';

// Real System Documents Data
const MOCK_DOCS = [
  { id: '1', name: 'Offer Letter - Jayanth Choda', owner: 'Jayanth Choda', empId: 'EMP-001', type: 'PDF', status: 'Verified', date: '2026-08-01', size: '1.2 MB' },
  { id: '2', name: 'Identity Proof (Aadhaar & PAN) - Jayanth Choda', owner: 'Jayanth Choda', empId: 'EMP-001', type: 'PDF', status: 'Verified', date: '2026-08-01', size: '2.4 MB' },
  { id: '3', name: 'Degree Certificate - Balaji S', owner: 'Balaji S', empId: 'EMP-002', type: 'PDF', status: 'Verified', date: '2026-08-02', size: '3.1 MB' },
  { id: '4', name: 'Relieving & Experience Certificate - Balaji S', owner: 'Balaji S', empId: 'EMP-002', type: 'PDF', status: 'Pending', date: '2026-08-05', size: '850 KB' },
];

const EmployeeDocuments = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [empFilter, setEmpFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const handleDownload = (doc) => {
    const blob = new Blob([`HRMS Official Document Record\n----------------------------\nDocument Name: ${doc.name}\nEmployee: ${doc.owner} (${doc.empId})\nVerification Status: ${doc.status}\nUpload Date: ${doc.date}\nFile Size: ${doc.size}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.name.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredDocs = MOCK_DOCS.filter(doc => {
    const matchesSearch = `${doc.name} ${doc.owner}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEmp = empFilter ? doc.empId === empFilter : true;
    const matchesType = typeFilter ? doc.type === typeFilter : true;
    const matchesStatus = statusFilter ? doc.status === statusFilter : true;
    return matchesSearch && matchesEmp && matchesType && matchesStatus;
  });

  return (
    <motion.div 
      className="employee-documents-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="docs-header">
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 4px 0' }}>Employee Documents</h1>
          <p style={{ color: 'var(--text-tertiary)', margin: 0, fontSize: '14px' }}>Manage and verify all employee documents</p>
        </div>
        <button className="btn-primary" style={{ padding: '8px 16px', borderRadius: '8px', background: '#2563eb', color: 'var(--card-bg)', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <UploadCloud size={18} />
          Upload Document
        </button>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar" style={{ display: 'flex', gap: '16px', marginBottom: '24px', background: 'var(--card-bg)', padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
        <div className="search-box" style={{ flex: 1, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search documents by name or employee..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '8px 12px 8px 40px', border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none' }}
          />
        </div>
        <select style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none', background: 'var(--card-bg)' }} value={empFilter} onChange={(e) => setEmpFilter(e.target.value)}>
          <option value="">All Employees</option>
          <option value="EMP-001">Jayanth Choda</option>
          <option value="EMP-002">Balaji S</option>
        </select>
        <select style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none', background: 'var(--card-bg)' }} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          <option value="PDF">PDF</option>
          <option value="JPG">JPG</option>
        </select>
        <select style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none', background: 'var(--card-bg)' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="Verified">Verified</option>
          <option value="Pending">Pending</option>
        </select>
        
        {/* Toggle View */}
        <div className="view-toggle">
          <button 
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            <Grid size={18} />
          </button>
          <button 
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="docs-grid-view">
          {filteredDocs.length === 0 ? (
            <EmptyState 
              icon={<SearchX size={32} />}
              title="No documents found"
              message="No documents match your current filters"
            />
          ) : (
            filteredDocs.map(doc => (
              <div key={doc.id} className="doc-item-card">
                <div className="doc-item-icon">
                  <FileText size={24} />
                </div>
                <div className="doc-item-info">
                  <div className="doc-item-title">{doc.name}</div>
                  <div className="doc-item-owner">{doc.owner} ({doc.empId})</div>
                  <span className={`doc-status-badge ${doc.status.toLowerCase()}`}>{doc.status}</span>
                </div>
                <div className="doc-item-actions">
                  <button className="doc-action-btn" title="Download Document" onClick={() => handleDownload(doc)}><Download size={16} /></button>
                  <button className="doc-action-btn" title="View Details" onClick={() => handleDownload(doc)}><Eye size={16} /></button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="table-container">
          {filteredDocs.length === 0 ? (
            <EmptyState 
              icon={<SearchX size={32} />}
              title="No documents found"
              message="No documents match your current filters"
            />
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Document Name</th>
                  <th>Employee</th>
                  <th>Upload Date</th>
                  <th>Size</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocs.map(doc => (
                  <tr key={doc.id}>
                    <td>
                      <div className="list-doc-name">
                        <FileText size={18} color="#2563eb" />
                        {doc.name} <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>.{doc.type.toLowerCase()}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{doc.owner}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{doc.empId}</div>
                    </td>
                    <td>{doc.date}</td>
                    <td>{doc.size}</td>
                    <td>
                      <span className={`doc-status-badge ${doc.status.toLowerCase()}`}>{doc.status}</span>
                    </td>
                    <td>
                      <div className="list-actions">
                        <button onClick={() => handleDownload(doc)} style={{ padding: '6px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }} title="View Document"><Eye size={18} /></button>
                        <button onClick={() => handleDownload(doc)} style={{ padding: '6px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }} title="Download Document"><Download size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

    </motion.div>
  );
};

export default EmployeeDocuments;
