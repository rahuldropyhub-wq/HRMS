import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, Plus, MoreVertical, Eye, Edit,
  UserX, UserCheck, ChevronLeft, ChevronRight, Download, SearchX
} from 'lucide-react';
import '../../../styles/admin/employee/employee-directory.css';
import EmptyState from '../../../components/admin/EmptyState';
import CustomDropdown from '../../../components/admin/CustomDropdown';
import { getAllEmployees, updateEmployee, getDepartments } from '../../../services/adminService';

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'Active': return 'badge active';
    case 'Inactive': return 'badge inactive';
    case 'On Leave': return 'badge leave';
    default: return 'badge';
  }
};
const getInitials = (first, last) => {
  const f = first ? String(first).trim() : '';
  const l = last ? String(last).trim() : '';
  return `${f ? f[0] : ''}${l ? l[0] : ''}`.toUpperCase() || '?';
};
const EmployeeDirectory = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const load = async () => {
    setLoading(true);
    const [{ data: empData }, { data: deptData }] = await Promise.all([
      getAllEmployees(),
      getDepartments()
    ]);
    setEmployees(empData || []);
    setDepartments(deptData || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.action-menu')) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Filtering Logic
  const filteredEmployees = employees.filter(emp => {
    const name = `${emp.firstName || ''} ${emp.lastName || ''} ${emp.email || ''}`;
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter ? emp.department === deptFilter : true;
    const matchesStatus = statusFilter ? emp.status === statusFilter : true;
    const matchesType = typeFilter ? emp.employmentType === typeFilter : true;
    return matchesSearch && matchesDept && matchesStatus && matchesType;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredEmployees.length / rowsPerPage) || 1;
  const currentEmployees = filteredEmployees.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const toggleDropdown = (id) => {
    if (activeDropdown === id) setActiveDropdown(null);
    else setActiveDropdown(id);
  };

  const handleAction = async (action, id) => {
    setActiveDropdown(null);
    if (action === 'view') {
      navigate(`/admin/employees/${id}`);
    } else if (action === 'edit') {
      navigate(`/admin/employees/edit/${id}`);
    } else if (action === 'deactivate') {
      if (window.confirm("Are you sure you want to deactivate this employee?")) {
        await updateEmployee(id, { status: 'Inactive' });
        setEmployees(prev => prev.map(emp => emp.id === id ? { ...emp, status: 'Inactive' } : emp));
      }
    } else if (action === 'activate') {
      if (window.confirm("Are you sure you want to activate this employee?")) {
        await updateEmployee(id, { status: 'Active' });
        setEmployees(prev => prev.map(emp => emp.id === id ? { ...emp, status: 'Active' } : emp));
      }
    }
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Employee ID', 'Department', 'Designation', 'Employment Type', 'Status', 'Joined'];
    const rows = filteredEmployees.map(emp => [
      `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
      emp.email || '',
      emp.id || '',
      emp.department || '',
      emp.designation || '',
      emp.employmentType || '',
      emp.status || '',
      emp.created_at ? new Date(emp.created_at).toLocaleDateString('en-IN') : ''
    ]);
    const csvContent = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `employees_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(emp => emp.status === 'Active').length;
  const onLeaveEmployees = employees.filter(emp => emp.status === 'On Leave').length;
  const newThisMonth = employees.filter(emp => {
    if (!emp.created_at) return false;
    const createdDate = new Date(emp.created_at);
    const now = new Date();
    return createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear();
  }).length;

  return (
    <motion.div
      className="employee-directory-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title">
          <h1>Employee Directory</h1>
          <p>Manage all employees in your organization</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/admin/employees/add')}>
          <Plus size={18} />
          Add Employee
        </button>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, ID, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ width: '180px' }}>
          <CustomDropdown
            value={deptFilter}
            onChange={(val) => { setDeptFilter(val); setCurrentPage(1); }}
            options={[
              { value: '', label: 'All Departments' },
              ...departments.map(d => ({ value: d.name, label: d.name }))
            ]}
          />
        </div>
        <div style={{ width: '160px' }}>
          <CustomDropdown
            value={statusFilter}
            onChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'Active', label: 'Active' },
              { value: 'Inactive', label: 'Inactive' },
              { value: 'On Leave', label: 'On Leave' }
            ]}
          />
        </div>
        <div className="hide-tablet" style={{ width: '160px' }}>
          <CustomDropdown
            value={typeFilter}
            onChange={(val) => { setTypeFilter(val); setCurrentPage(1); }}
            options={[
              { value: '', label: 'All Types' },
              { value: 'Full-time', label: 'Full-time' },
              { value: 'Part-time', label: 'Part-time' },
              { value: 'Contract', label: 'Contract' },
              { value: 'Intern', label: 'Intern' }
            ]}
          />
        </div>
        <button className="btn-secondary" title="Export CSV" onClick={handleExportCSV} style={{ padding: '8px', border: '1px solid #e5e7eb', background: 'var(--card-bg)', borderRadius: '8px', cursor: 'pointer' }}>
          <Download size={18} color="#4b5563" />
        </button>
      </div>

      {/* Stats Row */}
      <div className="stats-row">
        <div className="stat-item">
          Total: <span>{totalEmployees}</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          Active: <span>{activeEmployees}</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          On Leave: <span>{onLeaveEmployees}</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          New This Month: <span>{newThisMonth}</span>
        </div>
      </div>

      {/* Data Table */}
      <div className="table-container desktop-table">
        {filteredEmployees.length === 0 ? (
          <EmptyState
            icon={<SearchX size={32} />}
            title="No employees found"
            message="Try adjusting your search or filter criteria"
          />
        ) : (
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Emp ID</th>
                <th>Department</th>
                <th className="hide-tablet">Designation</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentEmployees.map((emp) => (
                <tr key={emp.id}>
                  <td>
                    <div className="employee-cell">
                      <div className="avatar" style={{ overflow: 'hidden' }}>
                        {emp.avatar_url || emp.avatarUrl ? (
                          <img src={emp.avatar_url || emp.avatarUrl} alt={emp.firstName} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          getInitials(emp.firstName, emp.lastName)
                        )}
                      </div>
                      <div>
                        <div className="emp-name truncate" style={{ maxWidth: '150px' }}>{emp.firstName} {emp.lastName}</div>
                        <div className="emp-email hide-tablet truncate" style={{ maxWidth: '180px' }}>{emp.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{emp.id}</td>
                  <td>{emp.department}</td>
                  <td className="hide-tablet">{emp.designation}</td>
                  <td>
                    <span className={getStatusBadgeClass(emp.status)}>{emp.status}</span>
                  </td>
                  <td className="action-cell">
                    <div className="action-menu">
                      <button className="action-btn ghost icon-only" onClick={() => toggleDropdown(emp.id)}>
                        <MoreVertical size={18} />
                      </button>
                      {activeDropdown === emp.id && (
                        <div className="action-dropdown">
                          <button className="action-dropdown-item" onClick={() => handleAction('view', emp.id)}>
                            <Eye size={16} /> View Profile
                          </button>
                          <button className="action-dropdown-item" onClick={() => handleAction('edit', emp.id)}>
                            <Edit size={16} /> Edit Details
                          </button>
                          {emp.status === 'Active' ? (
                            <button className="action-dropdown-item danger" onClick={() => handleAction('deactivate', emp.id)}>
                              <UserX size={16} /> Deactivate
                            </button>
                          ) : (
                            <button className="action-dropdown-item" onClick={() => handleAction('activate', emp.id)} style={{ color: '#10b981' }}>
                              <UserCheck size={16} /> Activate
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        <div className="pagination">
          <div className="page-info">
            Showing {(currentPage - 1) * rowsPerPage + (currentEmployees.length > 0 ? 1 : 0)} to {Math.min(currentPage * rowsPerPage, filteredEmployees.length)} of {filteredEmployees.length}
            <div style={{ marginLeft: '12px', display: 'inline-block', width: '100px', verticalAlign: 'middle' }}>
              <CustomDropdown
                value={rowsPerPage}
                onChange={(val) => { setRowsPerPage(Number(val)); setCurrentPage(1); }}
                options={[
                  { value: 5, label: '5 / page' },
                  { value: 10, label: '10 / page' },
                  { value: 20, label: '20 / page' }
                ]}
                size="sm"
              />
            </div>
          </div>
          <div className="page-controls">
            <button className="page-btn" disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={`page-btn ${currentPage === page ? 'active' : ''}`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}

            <button className="page-btn" disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Cards View */}
      <div className="mobile-cards">
        {currentEmployees.map((emp) => (
          <div className="mobile-card" key={emp.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div className="employee-cell">
                <div className="avatar">{getInitials(emp.firstName, emp.lastName)}</div>
                <div>
                  <div className="emp-name">{emp.firstName} {emp.lastName}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{emp.id}</div>
                </div>
              </div>
              <span className={getStatusBadgeClass(emp.status)}>{emp.status}</span>
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              <strong>Dept:</strong> {emp.department}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              <strong>Role:</strong> {emp.designation}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                style={{ flex: 1, padding: '8px', background: 'var(--bg-tertiary)', border: 'none', borderRadius: '6px', fontWeight: '500' }}
                onClick={() => navigate(`/admin/employees/${emp.id}`)}
              >
                View Profile
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default EmployeeDirectory;
