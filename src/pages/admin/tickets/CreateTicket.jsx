import React from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { UploadCloud } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../../../styles/admin/tickets/create-ticket.css';

const CreateTicket = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    alert('Ticket Created Successfully!');
    navigate('/admin/tickets');
  };

  return (
    <motion.div 
      className="create-ticket-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="page-header">
        <div className="page-title">
          <h1>Create New Ticket</h1>
          <p>Raise a support request on behalf of an employee</p>
        </div>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label>Subject <span>*</span></label>
            <input 
              type="text" 
              className={`form-control ${errors.subject ? 'error' : ''}`}
              placeholder="Brief description of the issue"
              {...register('subject', { required: 'Subject is required' })}
            />
            {errors.subject && <span className="error-message">{errors.subject.message}</span>}
          </div>

          <div className="form-group">
            <label>Description <span>*</span></label>
            <textarea 
              className={`form-control ${errors.description ? 'error' : ''}`}
              rows="5"
              placeholder="Detailed explanation..."
              {...register('description', { required: 'Description is required' })}
            ></textarea>
            {errors.description && <span className="error-message">{errors.description.message}</span>}
          </div>

          <div className="form-row">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Department <span>*</span></label>
              <select 
                className={`form-control ${errors.department ? 'error' : ''}`}
                {...register('department', { required: 'Please select a department' })}
              >
                <option value="">Select Department</option>
                <option value="IT">IT</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
                <option value="Admin">Admin</option>
                <option value="Payroll">Payroll</option>
              </select>
              {errors.department && <span className="error-message">{errors.department.message}</span>}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Priority <span>*</span></label>
              <select 
                className={`form-control ${errors.priority ? 'error' : ''}`}
                {...register('priority', { required: 'Please select a priority' })}
              >
                <option value="">Select Priority</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
              {errors.priority && <span className="error-message">{errors.priority.message}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Assign To (Optional)</label>
            <select className="form-control" {...register('assignTo')}>
              <option value="">Unassigned</option>
              <option value="IT Support">IT Support</option>
              <option value="Network Admin">Network Admin</option>
              <option value="HR Manager">HR Manager</option>
              <option value="Finance Admin">Finance Admin</option>
            </select>
          </div>

          <div className="form-group">
            <label>Attachments</label>
            <div className="file-upload-zone">
              <UploadCloud size={32} color="#9ca3af" style={{ margin: '0 auto' }} />
              <p>Click to upload or drag and drop</p>
              <span>SVG, PNG, JPG, PDF or ZIP (max. 10MB)</span>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-cancel" onClick={() => navigate('/admin/tickets')}>Cancel</button>
            <button type="submit" className="btn btn-submit">Create Ticket</button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default CreateTicket;
