import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { UploadCloud, FileImage, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../../../styles/admin/tickets/create-ticket.css';
import { raiseTicket } from '../../../services/employeeService';

const CreateTicket = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [attachments, setAttachments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach(file => {
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Max 10MB allowed.`);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const isImg = file.type.startsWith('image/');
        const newAttachment = {
          name: file.name,
          size: (file.size / 1024).toFixed(1) + ' KB',
          type: isImg ? 'img' : (file.type.includes('pdf') ? 'pdf' : 'doc'),
          url: reader.result
        };
        setAttachments(prev => [...prev, newAttachment]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    await raiseTicket({
      subject: data.subject,
      category: data.department,
      department: data.department,
      priority: data.priority,
      description: data.description,
      assignedTo: data.assignTo || 'Unassigned',
      authorName: 'Admin',
      status: 'open',
      attachments: attachments
    });
    setIsSubmitting(false);
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
            <label>Attachments & Screenshots</label>
            <div className="file-upload-zone" style={{ textAlign: 'center', padding: '20px', border: '2px dashed #cbd5e1', borderRadius: '8px', background: '#f8fafc' }}>
              <UploadCloud size={32} color="#9ca3af" style={{ margin: '0 auto 8px' }} />
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Click to select or upload images</p>
              <span style={{ fontSize: '12px', color: '#64748b' }}>SVG, PNG, JPG, WEBP, PDF or ZIP (max. 10MB)</span>
              <div style={{ marginTop: '12px' }}>
                <input
                  type="file"
                  accept="image/*,.pdf,.zip,.doc,.docx"
                  multiple
                  onChange={handleImageUpload}
                  style={{ cursor: 'pointer' }}
                />
              </div>
            </div>

            {attachments.length > 0 && (
              <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {attachments.map((att, idx) => (
                  <div key={idx} style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 12px', background: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {att.type === 'img' && att.url ? (
                      <img src={att.url} alt={att.name} style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '4px' }} />
                    ) : (
                      <FileImage size={24} color="#3b82f6" />
                    )}
                    <div style={{ fontSize: '12px' }}>
                      <div style={{ fontWeight: '600', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{att.name}</div>
                      <div style={{ color: '#64748b' }}>{att.size}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(idx)}
                      style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', marginLeft: '4px' }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-cancel" onClick={() => navigate('/admin/tickets')}>Cancel</button>
            <button type="submit" className="btn btn-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating Ticket...' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default CreateTicket;

