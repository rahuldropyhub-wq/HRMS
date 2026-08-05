import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Box, User, CheckCircle, Wrench } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import '../../../styles/admin/assets/asset-assign.css';
import CustomDropdown from '../../../components/admin/CustomDropdown';

const AssetAssign = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [assigned, setAssigned] = useState(false);

  const onSubmit = (data) => {
    setAssigned(true);
    setTimeout(() => {
      alert('Asset Assigned Successfully!');
      navigate('/admin/assets');
    }, 500);
  };

  return (
    <motion.div 
      className="asset-assign-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link to="/admin/assets" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500, marginBottom: '24px' }}>
        <ArrowLeft size={20} /> Back to Inventory
      </Link>

      <div className="page-header">
        <div className="page-title">
          <h1>Assign Asset</h1>
          <p>Allocate available hardware or resources to an employee</p>
        </div>
      </div>

      <div className="assign-layout">
        <div className="form-card">
          <h2>Assignment Details</h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label>Select Asset <span>*</span></label>
              <div style={{ width: '180px' }}>
          <CustomDropdown
            value=""
            onChange={() => {}}
            options={[
              { value: '', label: 'Choose an available asset...' },
              { value: 'AST-002', label: 'AST-002 - Dell UltraSharp 27" (Monitor)' },
              { value: 'AST-006', label: 'AST-006 - Lenovo ThinkPad X1 (Laptop)' }
            ]}
            fullWidth
          />
        </div>
              {errors.asset && <span className="error-message">{errors.asset.message}</span>}
            </div>

            <div className="form-group">
              <label>Select Employee <span>*</span></label>
              <div style={{ width: '180px' }}>
          <CustomDropdown
            value=""
            onChange={() => {}}
            options={[
              { value: '', label: 'Search or choose employee...' },
              { value: 'EMP-001', label: 'Rahul Sharma (Engineering)' },
              { value: 'EMP-015', label: 'Amit Kumar (Design)' },
              { value: 'EMP-042', label: 'Priya Patel (Management)' },
              { value: 'EMP-088', label: 'Neha Gupta (HR)' }
            ]}
            fullWidth
          />
        </div>
              {errors.employee && <span className="error-message">{errors.employee.message}</span>}
            </div>

            <div className="form-group">
              <label>Assign Date <span>*</span></label>
              <input 
                type="date" 
                className={`form-control ${errors.date ? 'error' : ''}`}
                {...register('date', { required: 'Date is required' })}
              />
              {errors.date && <span className="error-message">{errors.date.message}</span>}
            </div>

            <div className="form-group">
              <label>Condition at Assignment <span>*</span></label>
              <div style={{ width: '180px' }}>
          <CustomDropdown
            value=""
            onChange={() => {}}
            options={[
              { value: 'New', label: 'New' },
              { value: 'Good', label: 'Good' },
              { value: 'Fair', label: 'Fair' }
            ]}
            fullWidth
          />
        </div>
              {errors.condition && <span className="error-message">{errors.condition.message}</span>}
            </div>

            <div className="form-group">
              <label>Additional Notes</label>
              <textarea 
                className="form-control" 
                rows="3" 
                placeholder="Any scratches, missing cables, etc."
                {...register('notes')}
              ></textarea>
            </div>

            <div className="form-actions">
              <Link to="/admin/assets" className="btn btn-cancel">Cancel</Link>
              <button type="submit" className="btn btn-submit" disabled={assigned}>
                {assigned ? 'Assigning...' : 'Assign Asset'}
              </button>
            </div>
          </form>
        </div>

        <div className="history-card">
          <h2>Asset History Preview</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-tertiary)', marginBottom: '24px' }}>
            Select an asset on the left to view its lifecycle history.
            (Showing mock history for AST-006)
          </p>

          <div className="timeline">
            <div className="timeline-item current">
              <div className="timeline-content">
                <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', color: 'var(--text-primary)' }}>
                  <CheckCircle size={16} className="timeline-icon" color="#2563eb" /> 
                  Currently Available
                </div>
                <div className="timeline-date">Since Jul 01, 2025</div>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-content">
                <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center' }}>
                  <User size={16} className="timeline-icon" /> 
                  Reassigned to Priya
                </div>
                <div className="timeline-date">Jul 01, 2025</div>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-content">
                <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center' }}>
                  <Tool size={16} className="timeline-icon" /> 
                  Sent for repair (Keyboard issue)
                </div>
                <div className="timeline-date">Jun 15, 2025</div>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-content">
                <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center' }}>
                  <User size={16} className="timeline-icon" /> 
                  Assigned to Rahul
                </div>
                <div className="timeline-date">Feb 01, 2024</div>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-content">
                <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center' }}>
                  <Box size={16} className="timeline-icon" /> 
                  Purchased
                </div>
                <div className="timeline-date">Jan 15, 2024</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AssetAssign;
