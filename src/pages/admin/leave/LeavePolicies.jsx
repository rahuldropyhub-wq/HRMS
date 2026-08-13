import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, X } from 'lucide-react';
import '../../../styles/admin/leave/leave-policies.css';

// Mock Data
const MOCK_POLICIES = [];

const LeavePolicies = () => {
  const [policies, setPolicies] = useState(MOCK_POLICIES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);

  const openModal = (policy = null) => {
    if (policy) {
      setEditingPolicy({ ...policy });
    } else {
      setEditingPolicy({
        id: Date.now(),
        name: '',
        icon: '📄',
        days: 0,
        carryFwd: false,
        maxCarry: 0,
        encashment: false,
        minDays: 1,
        maxDays: 1,
        notes: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPolicy(null);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (policies.find(p => p.id === editingPolicy.id)) {
      setPolicies(prev => prev.map(p => p.id === editingPolicy.id ? editingPolicy : p));
    } else {
      setPolicies(prev => [...prev, editingPolicy]);
    }
    closeModal();
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditingPolicy(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
    }));
  };

  return (
    <motion.div 
      className="leave-policies-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="page-header">
        <div className="page-title">
          <h1>Leave Policies</h1>
          <p>Configure leave rules and allocations</p>
        </div>
        <button className="btn-primary" onClick={() => openModal()}>
          <Plus size={18} /> Add Policy
        </button>
      </div>

      <div className="policies-grid">
        {policies.map(policy => (
          <div key={policy.id} className="policy-card">
            <div className="policy-header">
              <span className="policy-icon">{policy.icon}</span>
              <h3 className="policy-title">{policy.name}</h3>
            </div>
            
            <div className="policy-details">
              <div className="policy-row">
                <span className="policy-label">Days / Year</span>
                <span className="policy-value">{policy.days || 'Variable'}</span>
              </div>
              <div className="policy-row">
                <span className="policy-label">Carry Forward</span>
                <span className={`policy-value ${policy.carryFwd ? 'yes' : 'no'}`}>
                  {policy.carryFwd ? `Yes (Max ${policy.maxCarry})` : 'No'}
                </span>
              </div>
              <div className="policy-row">
                <span className="policy-label">Encashment</span>
                <span className={`policy-value ${policy.encashment ? 'yes' : 'no'}`}>
                  {policy.encashment ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="policy-row">
                <span className="policy-label">Min / Max Days</span>
                <span className="policy-value">{policy.minDays} - {policy.maxDays}</span>
              </div>
              <div className="policy-row" style={{ marginTop: 'auto', paddingTop: '12px' }}>
                <span className="policy-label" style={{ fontSize: '12px' }}>{policy.notes}</span>
              </div>
            </div>

            <div className="policy-actions">
              <button className="btn-edit" onClick={() => openModal(policy)}>
                <Edit2 size={16} /> Edit Policy
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit/Add Modal */}
      <AnimatePresence>
        {isModalOpen && editingPolicy && (
          <div className="modal-overlay" onClick={closeModal}>
            <motion.div 
              className="modal-content"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>{editingPolicy.name ? 'Edit Policy' : 'Add New Policy'}</h3>
                <button className="close-btn" onClick={closeModal}><X size={24} /></button>
              </div>
              
              <form onSubmit={handleSave}>
                <div className="form-group">
                  <label>Policy Name</label>
                  <input type="text" name="name" value={editingPolicy.name} onChange={handleChange} required />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Icon (Emoji)</label>
                    <input type="text" name="icon" value={editingPolicy.icon} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Days per Year</label>
                    <input type="number" name="days" value={editingPolicy.days} onChange={handleChange} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Min Days per Request</label>
                    <input type="number" step="0.5" name="minDays" value={editingPolicy.minDays} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Max Days per Request</label>
                    <input type="number" step="0.5" name="maxDays" value={editingPolicy.maxDays} onChange={handleChange} />
                  </div>
                </div>

                <div className="form-row" style={{ marginTop: '8px' }}>
                  <div className="checkbox-group">
                    <input type="checkbox" id="carryFwd" name="carryFwd" checked={editingPolicy.carryFwd} onChange={handleChange} />
                    <label htmlFor="carryFwd">Allow Carry Forward</label>
                  </div>
                  <div className="checkbox-group">
                    <input type="checkbox" id="encashment" name="encashment" checked={editingPolicy.encashment} onChange={handleChange} />
                    <label htmlFor="encashment">Allow Encashment</label>
                  </div>
                </div>

                <AnimatePresence>
                  {editingPolicy.carryFwd && (
                    <motion.div 
                      className="form-group"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      <label>Max Carry Forward Days</label>
                      <input type="number" name="maxCarry" value={editingPolicy.maxCarry} onChange={handleChange} />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="form-group">
                  <label>Notes / Requirements</label>
                  <input type="text" name="notes" value={editingPolicy.notes} onChange={handleChange} />
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn-cancel" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="btn-primary">Save Policy</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default LeavePolicies;
