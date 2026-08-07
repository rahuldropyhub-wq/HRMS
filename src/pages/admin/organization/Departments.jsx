import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, Briefcase, MapPin, Mail, Edit, Eye, X, Building } from 'lucide-react';
import { useForm } from 'react-hook-form';
import '../../../styles/admin/organization/departments.css';
import ActionBtn from '../../../components/admin/ActionBtn';
import { getDepartments, createDepartment, deleteDepartment } from '../../../services/adminService';

const MOCK_DEPTS = [];

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await getDepartments();
      setDepartments(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const onSubmit = async (data) => {
    const { data: newDept, error } = await createDepartment({
      name: data.name,
      head: data.head,
      location: data.location || 'HQ',
      email: data.email || 'dept@dropyhub.com'
    });
    if (newDept) {
      setDepartments([newDept, ...departments]);
      setIsModalOpen(false);
      reset();
    } else {
      alert('Error: ' + error?.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this department?')) return;
    const { error } = await deleteDepartment(id);
    if (!error) setDepartments(prev => prev.filter(d => d.id !== id));
  };

  return (
    <motion.div
      className="departments-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="page-header">
        <div className="page-title">
          <h1>Departments</h1>
          <p>Manage company departments and their structural details</p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Add Department
        </button>
      </div>

      <div className="dept-grid">
        {departments.map((dept, idx) => (
          <motion.div
            key={dept.id}
            className="dept-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
          >
            <div className="dept-header">
              <div className="dept-icon">
                <Building size={20} />
              </div>
              <h3>{dept.name}</h3>
            </div>

            <div className="dept-info-list">
              <div className="dept-info-item">
                <Users size={16} className="dept-info-icon" />
                <span><strong style={{ color: 'var(--text-primary)' }}>Head:</strong> {dept.head}</span>
              </div>
              <div className="dept-info-item">
                <Users size={16} className="dept-info-icon" />
                <span><strong style={{ color: 'var(--text-primary)' }}>Employees:</strong> {dept.empCount}</span>
              </div>
              <div className="dept-info-item">
                <Briefcase size={16} className="dept-info-icon" />
                <span><strong style={{ color: 'var(--text-primary)' }}>Open Positions:</strong> {dept.openPos}</span>
              </div>
              <div className="dept-info-item">
                <MapPin size={16} className="dept-info-icon" />
                <span><strong style={{ color: 'var(--text-primary)' }}>Location:</strong> {dept.location}</span>
              </div>
              <div className="dept-info-item">
                <Mail size={16} className="dept-info-icon" />
                <span><strong style={{ color: 'var(--text-primary)' }}>Email:</strong> {dept.email}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
              <ActionBtn variant="secondary"><Edit size={14} /> Edit</ActionBtn>
              <ActionBtn variant="ghost"><Eye size={14} /> View</ActionBtn>
            </div>
          </motion.div>
        ))}
      </div>

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
                <h3>Add New Department</h3>
                <button className="close-btn" onClick={() => setIsModalOpen(false)}><X size={24} /></button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="form-group">
                  <label>Department Name <span>*</span></label>
                  <input
                    type="text"
                    className={`form-control ${errors.name ? 'error' : ''}`}
                    placeholder="e.g., Data Science"
                    {...register('name', { required: 'Name is required' })}
                  />
                  {errors.name && <span className="error-message">{errors.name.message}</span>}
                </div>

                <div className="form-group">
                  <label>Department Head <span>*</span></label>
                  <select
                    className={`form-control ${errors.head ? 'error' : ''}`}
                    {...register('head', { required: 'Department head is required' })}
                  >
                    <option value="">Select Employee</option>
                    <option value="Rajesh Kumar">Rajesh Kumar</option>
                    <option value="Neha Gupta">Neha Gupta</option>
                    <option value="Amit Kumar">Amit Kumar</option>
                  </select>
                  {errors.head && <span className="error-message">{errors.head.message}</span>}
                </div>

                <div className="form-group">
                  <label>Parent Department</label>
                  <select className="form-control" {...register('parent')}>
                    <option value="">None (Top Level)</option>
                    <option value="Engineering">Engineering</option>
                    <option value="HR">HR</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Location</label>
                  <input type="text" className="form-control" placeholder="e.g., Floor 3, Bay B" {...register('location')} />
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" className="form-control" placeholder="dept@dropyhub.com" {...register('email')} />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea className="form-control" rows="3" {...register('description')}></textarea>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn-submit">Save Department</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Departments;
