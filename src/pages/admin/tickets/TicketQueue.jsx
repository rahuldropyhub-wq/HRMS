import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Eye, SearchX, Loader2, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../../../styles/admin/tickets/ticket-queue.css';
import EmptyState from '../../../components/admin/EmptyState';
import CustomDropdown from '../../../components/admin/CustomDropdown';
import { getAllTickets, updateTicketStatus, deleteTicket } from '../../../services/adminService';

const TicketQueue = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Open');
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const fetchTickets = async () => {
    setLoading(true);
    const { data } = await getAllTickets();
    if (data) {
      const parsed = data.map(t => ({
        id: t.id,
        subject: t.subject || t.title || 'Support Request',
        raisedBy: t.profiles ? `${t.profiles.first_name || ''} ${t.profiles.last_name || ''}`.trim() : 'Employee',
        dept: t.profiles?.departments?.name || t.profiles?.department || 'General',
        priority: t.priority || 'Medium',
        status: t.status ? (t.status.charAt(0).toUpperCase() + t.status.slice(1)) : 'Open',
        date: t.created_at ? new Date(t.created_at).toLocaleDateString() : 'Today'
      }));
      setTickets(parsed);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleStatusChange = async (ticketId, newStatus) => {
    await updateTicketStatus(ticketId, newStatus.toLowerCase());
    fetchTickets();
  };

  const handleDeleteTicket = async (id) => {
    if (!window.confirm('Are you sure you want to delete this ticket?')) return;
    await deleteTicket(id);
    setTickets(prev => prev.filter(t => t.id !== id));
  };

  const filteredTickets = tickets.filter(t => {
    const matchesTab = activeTab === 'All' ? true : t.status.toLowerCase() === activeTab.toLowerCase();
    const matchesSearch = t.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.raisedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter ? t.dept.toLowerCase() === deptFilter.toLowerCase() : true;
    const matchesPri = priorityFilter ? t.priority.toLowerCase() === priorityFilter.toLowerCase() : true;
    return matchesTab && matchesSearch && matchesDept && matchesPri;
  });

  return (
    <motion.div 
      className="ticket-queue-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="page-header">
        <div className="page-title">
          <h1>Ticket Queue</h1>
          <p>Manage internal support requests across the company</p>
        </div>
        <Link to="/admin/tickets/create" className="btn-primary">
          <Plus size={18} /> Create Ticket
        </Link>
      </div>

      <div className="tabs-bar">
        {['Open', 'In Progress', 'Resolved', 'Closed', 'All'].map(tab => {
          const count = tab === 'All' 
            ? tickets.length 
            : tickets.filter(t => t.status.toLowerCase() === tab.toLowerCase()).length;
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
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search tickets..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ width: '180px' }}>
          <CustomDropdown
            value={deptFilter}
            onChange={setDeptFilter}
            options={[
              { value: '', label: 'All Departments' },
              { value: 'IT', label: 'IT' },
              { value: 'HR', label: 'HR' },
              { value: 'Finance', label: 'Finance' },
              { value: 'Payroll', label: 'Payroll' },
              { value: 'Admin', label: 'Admin' }
            ]}
          />
        </div>
        <div style={{ width: '180px' }}>
          <CustomDropdown
            value={priorityFilter}
            onChange={setPriorityFilter}
            options={[
              { value: '', label: 'All Priorities' },
              { value: 'Critical', label: 'Critical' },
              { value: 'High', label: 'High' },
              { value: 'Medium', label: 'Medium' },
              { value: 'Low', label: 'Low' }
            ]}
          />
        </div>
      </div>

      <div className="table-container">
        {filteredTickets.length === 0 ? (
          <EmptyState 
            icon={<SearchX size={32} />}
            title="No tickets found"
            message="No tickets match your current filters"
          />
        ) : (
          <table>
            <thead>
            <tr>
              <th>Ticket ID & Subject</th>
              <th>Raised By</th>
              <th>Department</th>
              <th>Priority</th>
              <th>Assigned To</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.map(ticket => (
              <tr key={ticket.id}>
                <td>
                  <div className="ticket-subject truncate" style={{ maxWidth: '200px' }}>{ticket.subject}</div>
                  <div className="ticket-id">{ticket.id}</div>
                </td>
                <td>{ticket.raisedBy}</td>
                <td>{ticket.dept}</td>
                <td>
                  <span className={`badge priority-${ticket.priority.toLowerCase()}`}>
                    {ticket.priority}
                  </span>
                </td>
                <td>{ticket.assignedTo}</td>
                <td>
                  <span className={`badge status-${ticket.status.toLowerCase().replace(' ', '')}`}>
                    {ticket.status}
                  </span>
                </td>
                <td>{ticket.created}</td>
                <td>
                  <div className="action-btn-group">
                    <Link to={`/admin/tickets/${ticket.id}`} className="action-btn ghost icon-only" title="View Details">
                      <Eye size={16} />
                    </Link>
                    <button 
                      className="action-btn danger icon-only" 
                      title="Delete Ticket" 
                      style={{ color: '#ef4444', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} 
                      onClick={() => handleDeleteTicket(ticket.id)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredTickets.length === 0 && (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>
                  No tickets found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        )}
      </div>
    </motion.div>
  );
};

export default TicketQueue;
