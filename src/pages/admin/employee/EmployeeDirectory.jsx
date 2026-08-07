import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, Plus, MoreVertical, Eye, Edit, 
  UserX, ChevronLeft, ChevronRight, Download, SearchX
} from 'lucide-react';
import '../../../styles/admin/employee/employee-directory.css';
import EmptyState from '../../../components/admin/EmptyState';
import CustomDropdown from '../../../components/admin/CustomDropdown';
import { getAllEmployees } from '../../../services/adminService';

// Mock Data
const MOCK_EMPLOYEES = [
  { id: 'EMP-001', firstName: 'Rahul', lastName: 'Sharma', email: 'rahul.sharma@dropyhub.com', department: 'Engineering', designation: 'Sr. Frontend Developer', status: 'Active', type: 'Full-time' },
  { id: 'EMP-002', firstName: 'Priya', lastName: 'Patel', email: 'priya.p@dropyhub.com', department: 'Marketing', designation: 'Marketing Manager', status: 'Active', type: 'Full-time' },
  { id: 'EMP-003', firstName: 'Amit', lastName: 'Kumar', email: 'amit.k@dropyhub.com', department: 'Design', designation: 'UI/UX Designer', status: 'On Leave', type: 'Contract' },
  { id: 'EMP-004', firstName: 'Neha', lastName: 'Gupta', email: 'neha.g@dropyhub.com', department: 'HR', designation: 'HR Executive', status: 'Active', type: 'Full-time' },
  { id: 'EMP-005', firstName: 'Vikram', lastName: 'Singh', email: 'vikram.s@dropyhub.com', department: 'Finance', designation: 'Financial Analyst', status: 'Inactive', type: 'Full-time' },
  { id: 'EMP-006', firstName: 'Anjali', lastName: 'Desai', email: 'anjali.d@dropyhub.com', department: 'Sales', designation: 'Sales Executive', status: 'Active', type: 'Full-time' },
  { id: 'EMP-007', firstName: 'Rohan', lastName: 'Verma', email: 'rohan.v@dropyhub.com', department: 'Operations', designation: 'Operations Manager', status: 'Active', type: 'Full-time' },
  { id: 'EMP-008', firstName: 'Pooja', lastName: 'Iyer', email: 'pooja.i@dropyhub.com', department: 'QA', designation: 'QA Tester', status: 'Active', type: 'Intern' },
  { id: 'EMP-009', firstName: 'Sanjay', lastName: 'Nair', email: 'sanjay.n@dropyhub.com', department: 'Engineering', designation: 'Backend Developer', status: 'Active', type: 'Full-time' },
  { id: 'EMP-010', firstName: 'Divya', lastName: 'Reddy', email: 'divya.r@dropyhub.com', department: 'Design', designation: 'Product Designer', status: 'On Leave', type: 'Full-time' },
  { id: 'EMP-011', firstName: 'Arjun', lastName: 'Menon', email: 'arjun.m@dropyhub.com', department: 'Engineering', designation: 'DevOps Engineer', status: 'Active', type: 'Full-time' },
  { id: 'EMP-012', firstName: 'Kavita', lastName: 'Joshi', email: 'kavita.j@dropyhub.com', department: 'HR', designation: 'Recruiter', status: 'Active', type: 'Contract' },
  { id: 'EMP-013', firstName: 'Mohit', lastName: 'Chauhan', email: 'mohit.c@dropyhub.com', department: 'Sales', designation: 'Sales Lead', status: 'Active', type: 'Full-time' },
  { id: 'EMP-014', firstName: 'Shruti', lastName: 'Hasan', email: 'shruti.h@dropyhub.com', department: 'Marketing', designation: 'Content Writer', status: 'Inactive', type: 'Part-time' },
  { id: 'EMP-015', firstName: 'Raj', lastName: 'Malhotra', email: 'raj.m@dropyhub.com', department: 'Operations', designation: 'Logistics Coordinator', status: 'Active', type: 'Full-time' },
  { id: 'EMP-016', firstName: 'Sneha', lastName: 'Paul', email: 'sneha.p@dropyhub.com', department: 'Engineering', designation: 'Frontend Developer', status: 'Active', type: 'Full-time' },
  { id: 'EMP-017', firstName: 'Aditya', lastName: 'Roy', email: 'aditya.r@dropyhub.com', department: 'Finance', designation: 'Accountant', status: 'Active', type: 'Full-time' },
  { id: 'EMP-018', firstName: 'Manoj', lastName: 'Tiwari', email: 'manoj.t@dropyhub.com', department: 'QA', designation: 'QA Lead', status: 'Active', type: 'Full-time' },
  { id: 'EMP-019', firstName: 'Ritu', lastName: 'Bhatia', email: 'ritu.b@dropyhub.com', department: 'Design', designation: 'Graphic Designer', status: 'On Leave', type: 'Intern' },
  { id: 'EMP-020', firstName: 'Deepak', lastName: 'Kumar', email: 'deepak.k@dropyhub.com', department: 'Engineering', designation: 'Engineering Manager', status: 'Active', type: 'Full-time' },
];

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'Active': return 'badge active';
    case 'Inactive': return 'badge inactive';
    case 'On Leave': return 'badge leave';
    default: return 'badge';
  }
};

const getInitials = (first, last) => `${first[0]}${last[0]}`;

const EmployeeDirectory = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await getAllEmployees();
      setEmployees(data || []);
      setLoading(false);
    };
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
    const name = `${emp.first_name || ''} ${emp.last_name || ''} ${emp.email || ''}`;
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter ? emp.departments?.name === deptFilter : true;
    const matchesStatus = statusFilter ? emp.status === statusFilter : true;
    return matchesSearch && matchesDept && matchesStatus;
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

  const handleAction = (action, id) => {
    setActiveDropdown(null);
    if (action === 'view') navigate(`/admin/employees/${id}`);
    // Handle other actions as needed
  };

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
              { value: 'Engineering', label: 'Engineering' },
              { value: 'Marketing', label: 'Marketing' },
              { value: 'Design', label: 'Design' },
              { value: 'HR', label: 'HR' },
              { value: 'Finance', label: 'Finance' },
              { value: 'Sales', label: 'Sales' },
              { value: 'Operations', label: 'Operations' },
              { value: 'QA', label: 'QA' }
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
        <button className="btn-secondary" style={{ padding: '8px', border: '1px solid #e5e7eb', background: 'var(--card-bg)', borderRadius: '8px', cursor: 'pointer' }}>
          <Download size={18} color="#4b5563" />
        </button>
      </div>

      {/* Stats Row */}
      <div className="stats-row">
        <div className="stat-item">
          Total: <span>124</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          Active: <span>118</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          On Leave: <span>4</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          New This Month: <span>3</span>
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
                      <div className="avatar">{getInitials(emp.firstName, emp.lastName)}</div>
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
                          <button className="action-dropdown-item danger" onClick={() => handleAction('deactivate', emp.id)}>
                            <UserX size={16} /> Deactivate
                          </button>
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
