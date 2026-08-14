import React, { createContext, useContext, useState, useCallback } from 'react';
import Popup from '../components/common/Popup';

const PopupContext = createContext();

export const usePopup = () => useContext(PopupContext);

export const PopupProvider = ({ children }) => {
  const [toast, setToast] = useState(null);
  const [confirmState, setConfirmState] = useState(null);

  // type = 'success', 'error', 'info', 'warning'
  const showAlert = useCallback((message, type = 'info') => {
    setToast({ message, type });
    // Auto-dismiss toast after 4 seconds
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  const hideAlert = useCallback(() => {
    setToast(null);
  }, []);

  const showConfirm = useCallback((message, onConfirm, onCancel = () => {}) => {
    setConfirmState({
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmState(null);
      },
      onCancel: () => {
        onCancel();
        setConfirmState(null);
      }
    });
  }, []);

  const hideConfirm = useCallback(() => {
    setConfirmState(null);
  }, []);

  return (
    <PopupContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      
      <Popup 
        toast={toast} 
        confirm={confirmState} 
        onCloseToast={hideAlert} 
        onCloseConfirm={hideConfirm} 
      />
    </PopupContext.Provider>
  );
};
