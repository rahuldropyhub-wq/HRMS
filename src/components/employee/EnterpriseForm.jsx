import React from 'react';
import { X, UploadCloud, ChevronDown } from 'lucide-react';
import '../../styles/employee/enterprise-form.css';

export const EnterpriseModal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="ent-modal-overlay" onClick={onClose}>
      <div className="ent-form-card" onClick={e => e.stopPropagation()}>
        <button type="button" className="ent-form-close" onClick={onClose}>
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  );
};

export const FormHeader = ({ icon: Icon, title, description }) => (
  <div className="ent-form-header">
    <div className="ent-form-icon">
      <Icon size={24} strokeWidth={2} />
    </div>
    <div className="ent-form-header-content">
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  </div>
);

export const FormBody = ({ children }) => (
  <div className="ent-form-body">
    {children}
  </div>
);

export const FormSection = ({ title, description, children, singleColumn }) => (
  <div className="ent-form-section">
    {(title || description) && (
      <div className="ent-section-header">
        {title && <h3>{title}</h3>}
        {description && <p>{description}</p>}
      </div>
    )}
    <div className={`ent-form-grid ${singleColumn ? 'single-col' : ''}`}>
      {children}
    </div>
  </div>
);

export const FormField = ({ label, required, optional, children, fullWidth }) => (
  <div className={`ent-form-field ${fullWidth ? 'full-width' : ''}`}>
    {label && (
      <label className="ent-label">
        {label} 
        {required && <span className="ent-required">*</span>}
        {optional && <span className="ent-optional">(Optional)</span>}
      </label>
    )}
    {children}
  </div>
);

export const TextInput = ({ ...props }) => (
  <input type="text" className="ent-input" {...props} />
);

export const NumberInput = ({ ...props }) => (
  <input type="number" className="ent-input" {...props} />
);

export const TextArea = ({ ...props }) => (
  <textarea className="ent-input" {...props} />
);

export const DateInput = ({ ...props }) => (
  <input type="date" className="ent-input" {...props} />
);

export const SelectInput = ({ options, ...props }) => (
  <div className="ent-input-wrapper">
    <select className="ent-input" {...props}>
      <option value="" disabled hidden>Select an option...</option>
      {options.map((opt, idx) => (
        <option key={idx} value={opt.value || opt}>{opt.label || opt}</option>
      ))}
    </select>
    <ChevronDown size={16} className="ent-select-icon" />
  </div>
);

export const FileUpload = ({ hint }) => (
  <div className="ent-file-upload">
    <UploadCloud size={28} className="ent-file-icon" />
    <p className="ent-file-text"><span>Click to upload</span> or drag and drop</p>
    <p className="ent-file-hint">{hint || 'SVG, PNG, JPG or PDF (max. 5MB)'}</p>
  </div>
);

export const Checkbox = ({ label, ...props }) => (
  <label className="ent-check-wrapper">
    <input type="checkbox" className="ent-checkbox" {...props} />
    <span className="ent-check-label">{label}</span>
  </label>
);

export const FormFooter = ({ onCancel, onSubmit, submitText = 'Submit', saveDraft = false }) => (
  <div className="ent-form-footer">
    {onCancel && (
      <button type="button" className="ent-btn ent-btn-cancel" onClick={onCancel}>
        Cancel
      </button>
    )}
    {saveDraft && (
      <button type="button" className="ent-btn ent-btn-draft" style={{ marginRight: 'auto' }}>
        Save Draft
      </button>
    )}
    <button type="submit" className="ent-btn ent-btn-primary" onClick={onSubmit}>
      {submitText}
    </button>
  </div>
);
