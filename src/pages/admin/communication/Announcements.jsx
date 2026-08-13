import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Paperclip, User, Calendar, Target, Edit, Pin, Trash2, X, SearchX } from 'lucide-react';
import { useForm } from 'react-hook-form';
import '../../../styles/admin/communication/announcements.css';
import EmptyState from '../../../components/admin/EmptyState';
import ActionBtn from '../../../components/admin/ActionBtn';

const MOCK_ANNOUNCEMENTS = [];

const Announcements = () => {
  const [announcements, setAnnouncements] = useState(MOCK_ANNOUNCEMENTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const onSubmit = (data) => {
    const newAnn = {
      id: `A-${announcements.length + 1}`,
      title: data.title,
      body: data.body,
      attachment: null, // mock file
      author: 'Admin',
      date: 'Aug 5, 2026',
      target: data.target,
      priority: data.priority
    };
    setAnnouncements([newAnn, ...announcements]);
    setIsModalOpen(false);
    reset();
  };

  return (
    <motion.div
      className="announcements-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="page-header">
        <div className="page-title">
          <h1>Announcements</h1>
          <p>Broadcast messages and updates to the entire company or specific teams</p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> New Announcement
        </button>
      </div>

      {announcements.length === 0 ? (
        <EmptyState
          icon={<SearchX size={32} />}
          title="No announcements found"
          message="There are no announcements to display."
        />
      ) : (
        <div className="timeline-view">
          {announcements.map((ann, idx) => (
            <motion.div
              key={ann.id}
              className="announcement-card"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="card-header">
                <h3 className="truncate" style={{ maxWidth: '80%' }}>
                  {ann.title}
                  <span className={`priority-badge priority-${ann.priority.toLowerCase()}`}>
                    {ann.priority}
                  </span>
                </h3>
              </div>

              <div className="card-body">
                <p className="truncate-3">{ann.body}</p>

                {ann.attachment && (
                  <a href="#" className="attachment-link" onClick={(e) => e.preventDefault()}>
                    <Paperclip size={16} /> {ann.attachment}
                  </a>
                )}
              </div>

              <div className="card-meta">
                <div className="meta-item"><User size={14} /> Posted by: {ann.author}</div>
                <div className="meta-item"><Calendar size={14} /> {ann.date}</div>
                <div className="meta-item"><Target size={14} /> {ann.target}</div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
                <ActionBtn variant="secondary"><Edit size={14} /> Edit</ActionBtn>
                <ActionBtn variant="ghost"><Pin size={14} /> Pin</ActionBtn>
                <ActionBtn variant="danger"><Trash2 size={14} /> Delete</ActionBtn>
              </div>
            </motion.div>
          ))}
        </div>
      )}

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
                <h3>Create Announcement</h3>
                <button className="close-btn" onClick={() => setIsModalOpen(false)}><X size={24} /></button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="form-group">
                  <label>Title <span>*</span></label>
                  <input
                    type="text"
                    className={`form-control ${errors.title ? 'error' : ''}`}
                    placeholder="e.g., Upcoming Townhall"
                    {...register('title', { required: 'Title is required' })}
                  />
                  {errors.title && <span className="error-message">{errors.title.message}</span>}
                </div>

                <div className="form-group">
                  <label>Message Body <span>*</span></label>
                  <textarea
                    className={`form-control ${errors.body ? 'error' : ''}`}
                    rows="5"
                    placeholder="Type your announcement here..."
                    {...register('body', { required: 'Message is required' })}
                  ></textarea>
                  {errors.body && <span className="error-message">{errors.body.message}</span>}
                </div>

                <div className="form-group">
                  <label>Target Audience <span>*</span></label>
                  <select
                    className={`form-control ${errors.target ? 'error' : ''}`}
                    {...register('target', { required: 'Target audience is required' })}
                  >
                    <option value="">Select Audience</option>
                    <option value="All Employees">All Employees</option>
                    <option value="Engineering Dept">Engineering Department</option>
                    <option value="Sales Dept">Sales Department</option>
                    <option value="Managers Only">Managers Only</option>
                  </select>
                  {errors.target && <span className="error-message">{errors.target.message}</span>}
                </div>

                <div className="form-group">
                  <label>Priority</label>
                  <select className="form-control" {...register('priority')}>
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Schedule</label>
                  <select className="form-control" {...register('schedule')}>
                    <option value="Now">Publish Immediately</option>
                    <option value="Later">Schedule for Later</option>
                  </select>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn-submit">Post Announcement</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Announcements;
