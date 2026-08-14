import React from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import '../../styles/components/popup.css';

const Popup = ({ toast, confirm, onCloseToast, onCloseConfirm }) => {
  return (
    <>
      {/* Toast Notification (Slide in from top right) */}
      {toast && (
        <div className={`custom-toast custom-toast-${toast.type} slide-in`}>
          <div className="custom-toast-icon">
            {toast.type === 'success' && <CheckCircle size={20} />}
            {toast.type === 'error' && <AlertCircle size={20} />}
            {toast.type === 'warning' && <AlertTriangle size={20} />}
            {(!toast.type || toast.type === 'info') && <Info size={20} />}
          </div>
          <div className="custom-toast-content">
            <p>{toast.message}</p>
          </div>
          <button className="custom-toast-close" onClick={onCloseToast}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Confirmation Modal (Centered) */}
      {confirm && (
        <div className="custom-modal-overlay fade-in">
          <div className="custom-modal scale-in">
            <div className="custom-modal-header">
              <AlertTriangle size={24} className="custom-modal-icon warning" />
              <h3>Please Confirm</h3>
            </div>
            <div className="custom-modal-body">
              <p>{confirm.message}</p>
            </div>
            <div className="custom-modal-footer">
              <button className="custom-btn-cancel" onClick={confirm.onCancel}>
                Cancel
              </button>
              <button className="custom-btn-confirm" onClick={confirm.onConfirm}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Popup;
