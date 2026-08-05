import React from 'react';
import { motion } from 'framer-motion';
import '../../styles/admin/empty-state.css';

const EmptyState = ({ icon, title, message, action }) => {
  return (
    <motion.div 
      className="empty-state-container"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {icon && (
        <div className="empty-state-icon-wrapper">
          {icon}
        </div>
      )}
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-message">{message}</p>
      {action && (
        <div className="empty-state-action">
          {action}
        </div>
      )}
    </motion.div>
  );
};

export default EmptyState;
