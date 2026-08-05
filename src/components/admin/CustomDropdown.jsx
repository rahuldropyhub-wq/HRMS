import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import '../../styles/admin/custom-dropdown.css';

const CustomDropdown = ({ 
  label,           // optional label above dropdown
  value,           // current selected value
  onChange,        // callback (value) => void
  options,         // array of { value, label, icon?, color? }
  placeholder,     // "Select..."
  disabled,        // boolean
  error,           // error message string
  size,            // 'sm' | 'md' | 'lg'
  fullWidth,       // boolean
  searchable,      // boolean - shows search input inside dropdown
  clearable        // boolean - shows X to clear selection
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);
  
  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);
  
  // Close on ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);
  
  const selectedOption = options.find(opt => opt.value === value);
  const filteredOptions = searchable 
    ? options.filter(opt => opt.label.toLowerCase().includes(search.toLowerCase()))
    : options;
  
  return (
    <div className={`custom-dropdown ${fullWidth ? 'full-width' : ''}`} ref={dropdownRef}>
      {label && <label className="dropdown-label">{label}</label>}
      
      <button
        type="button"
        className={`dropdown-trigger ${size || 'md'} ${isOpen ? 'open' : ''} ${error ? 'error' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="dropdown-value">
          {selectedOption ? (
            <>
              {selectedOption.icon && <span className="dropdown-icon">{selectedOption.icon}</span>}
              {selectedOption.label}
            </>
          ) : (
            <span className="dropdown-placeholder">{placeholder || 'Select...'}</span>
          )}
        </span>
        <ChevronDown 
          size={16} 
          className={`dropdown-chevron ${isOpen ? 'rotated' : ''}`} 
        />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="dropdown-menu"
            role="listbox"
          >
            {searchable && (
              <div className="dropdown-search">
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                />
              </div>
            )}
            
            <div className="dropdown-options">
              {filteredOptions.length === 0 ? (
                <div className="dropdown-empty">No options found</div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`dropdown-option ${value === option.value ? 'selected' : ''}`}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    role="option"
                    aria-selected={value === option.value}
                  >
                    <span className="option-content">
                      {option.icon && <span className="option-icon">{option.icon}</span>}
                      {option.label}
                    </span>
                    {value === option.value && <Check size={16} className="option-check" />}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {error && <span className="dropdown-error">{error}</span>}
    </div>
  );
};

export default CustomDropdown;
