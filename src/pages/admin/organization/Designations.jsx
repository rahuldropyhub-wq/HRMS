import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import '../../../styles/admin/organization/designations.css';
import ActionBtn from '../../../components/admin/ActionBtn';
import { getDesignations, createDesignation, deleteDesignation } from '../../../services/adminService';

const Designations = () => {
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await getDesignations();
      setDesignations(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const onSubmit = async (data) => {
    const { data: newDesig } = await createDesignation({
      title: data.title,
      level: data.level,
      department: data.department,
      dept: data.department,
      count: 0
    });
    if (newDesig) {
      setDesignations(prev => [newDesig, ...prev.filter(d => d.id !== newDesig.id)]);
      setIsModalOpen(false);
      reset();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this designation?')) return;
    await deleteDesignation(id);
    setDesignations(prev => prev.filter(d => d.id !== id));
  };

  return (
    <motion.div 
      className="designations-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="page-header">
        <div className="page-title">
          <h1>Designations</h1>
          <p>Manage job titles and hierarchy levels across the organization</p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Add Designation
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Designation Title</th>
              <th>Level</th>
              <th>Department</th>
              <th>Employee Count</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {designations.map(desig => (
              <tr key={desig.id}>
                <td>
                  <div className="designation-name">{desig.title}</div>
                </td>
                <td>
                  <span className="level-badge">{desig.level}</span>
                </td>
                <td>{desig.dept}</td>
                <td>{desig.count} Employees</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ActionBtn variant="secondary" title="Edit">
                      <Edit size={14} /> Edit
                    </ActionBtn>
                    <ActionBtn variant="danger" title="Delete" onClick={() => handleDelete(desig.id)}>
                      <Trash2 size={14} /> Delete
                    </ActionBtn>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
                <h3>Add New Designation</h3>
                <button className="close-btn" onClick={() => setIsModalOpen(false)}><X size={24} /></button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="form-group">
                  <label>Designation Title <span>*</span></label>
                  <input 
                    type="text" 
                    className={`form-control ${errors.title ? 'error' : ''}`}
                    placeholder="e.g., Senior Data Analyst"
                    {...register('title', { required: 'Title is required' })}
                  />
                  {errors.title && <span className="error-message">{errors.title.message}</span>}
                </div>
                
                <div className="form-group">
                  <label>Level <span>*</span></label>
                  <select 
                    className={`form-control ${errors.level ? 'error' : ''}`}
                    {...register('level', { required: 'Level is required' })}
                  >
                    <option value="">Select Level</option>
                    <option value="L1">L1 (Intern)</option>
                    <option value="L2">L2 (Junior)</option>
                    <option value="L3">L3 (Mid)</option>
                    <option value="L4">L4 (Senior)</option>
                    <option value="L5">L5 (Lead)</option>
                    <option value="L6">L6 (Manager)</option>
                    <option value="L7">L7 (Director)</option>
                    <option value="L8">L8 (VP)</option>
                    <option value="L9">L9 (CXO)</option>
                  </select>
                  {errors.level && <span className="error-message">{errors.level.message}</span>}
                </div>

                <div className="form-group">
                  <label>Department <span>*</span></label>
                  <select 
                    className={`form-control ${errors.department ? 'error' : ''}`}
                    {...register('department', { required: 'Department is required' })}
                  >
                    <option value="">Select Department</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Design">Design</option>
                    <option value="HR">HR</option>
                    <option value="Finance">Finance</option>
                    <option value="Sales">Sales</option>
                    <option value="Operations">Operations</option>
                    <option value="QA">QA</option>
                    <option value="Customer Support">Customer Support</option>
                    <option value="Legal">Legal</option>
                  </select>
                  {errors.department && <span className="error-message">{errors.department.message}</span>}
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn-submit">Save Designation</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Designations;
