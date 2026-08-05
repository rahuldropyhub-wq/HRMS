import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../../../styles/admin/tasks/create-task.css';
import { useForm } from 'react-hook-form';

const CreateTask = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  const onSubmit = (data) => {
    // In a real app, send data to backend here.
    // For now, mock success and redirect
    alert('Task Created & Assigned Successfully!');
    navigate('/admin/tasks');
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <motion.div 
      className="create-task-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="page-header">
        <div className="page-title">
          <h1>Create New Task</h1>
          <p>Assign work to employees and track progress</p>
        </div>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label>Task Title <span>*</span></label>
            <input 
              type="text" 
              className={`form-control ${errors.title ? 'error' : ''}`}
              placeholder="e.g., Update Homepage Hero Section"
              {...register('title', { required: 'Task title is required' })}
            />
            {errors.title && <span className="error-message">{errors.title.message}</span>}
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea 
              className="form-control"
              rows="4"
              placeholder="Provide detailed instructions for the task..."
              {...register('description')}
            ></textarea>
          </div>

          <div className="form-row">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Project <span>*</span></label>
              <select 
                className={`form-control ${errors.project ? 'error' : ''}`}
                {...register('project', { required: 'Please select a project' })}
              >
                <option value="">Select Project</option>
                <option value="Website Redesign">Website Redesign</option>
                <option value="Mobile App">Mobile App</option>
                <option value="CRM System">CRM System</option>
                <option value="Marketing Campaign">Marketing Campaign</option>
              </select>
              {errors.project && <span className="error-message">{errors.project.message}</span>}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Assign To <span>*</span></label>
              <select 
                className={`form-control ${errors.assignee ? 'error' : ''}`}
                {...register('assignee', { required: 'Please assign an employee' })}
              >
                <option value="">Select Employee</option>
                <option value="EMP-042">Priya Patel (Engineering)</option>
                <option value="EMP-015">Amit Kumar (Design)</option>
                <option value="EMP-023">Rahul Sharma (Marketing)</option>
                <option value="EMP-088">Neha Gupta (HR)</option>
                <option value="EMP-102">Vikram Singh (Finance)</option>
              </select>
              {errors.assignee && <span className="error-message">{errors.assignee.message}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Priority <span>*</span></label>
            <div className="radio-group">
              <label className="radio-option">
                <input type="radio" value="High" {...register('priority', { required: 'Select priority' })} />
                <span>High</span>
              </label>
              <label className="radio-option">
                <input type="radio" value="Medium" {...register('priority', { required: 'Select priority' })} />
                <span>Medium</span>
              </label>
              <label className="radio-option">
                <input type="radio" value="Low" {...register('priority', { required: 'Select priority' })} />
                <span>Low</span>
              </label>
            </div>
            {errors.priority && <span className="error-message">{errors.priority.message}</span>}
          </div>

          <div className="form-row">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Start Date <span>*</span></label>
              <input 
                type="date" 
                className={`form-control ${errors.startDate ? 'error' : ''}`}
                {...register('startDate', { required: 'Start date is required' })}
              />
              {errors.startDate && <span className="error-message">{errors.startDate.message}</span>}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Due Date <span>*</span></label>
              <input 
                type="date" 
                className={`form-control ${errors.dueDate ? 'error' : ''}`}
                {...register('dueDate', { required: 'Due date is required' })}
              />
              {errors.dueDate && <span className="error-message">{errors.dueDate.message}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Estimated Hours</label>
              <input 
                type="number" 
                className="form-control"
                placeholder="e.g., 5.5"
                step="0.5"
                {...register('estimatedHours')}
              />
            </div>
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Tags</label>
              <div className="tags-container">
                {tags.map(tag => (
                  <span key={tag} className="tag">
                    {tag} <button type="button" onClick={() => removeTag(tag)}><X size={12} /></button>
                  </span>
                ))}
                <input 
                  type="text" 
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Type and press Enter"
                  style={{ border: 'none', outline: 'none', background: 'transparent', flex: 1, minWidth: '120px', fontSize: '13px' }}
                />
              </div>
            </div>
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
            <button type="button" className="btn btn-cancel" onClick={() => navigate('/admin/tasks')}>Cancel</button>
            <button type="button" className="btn btn-draft">Save as Draft</button>
            <button type="submit" className="btn btn-submit">Create & Assign</button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default CreateTask;
