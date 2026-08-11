import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Globe, Monitor, Shield, Clock } from 'lucide-react';
import '../../../styles/admin/attendance/wfh-tracking.css';

// Mock Data
const MOCK_WFH = [];

const WFHTracking = () => {
  const [selectedEmp, setSelectedEmp] = useState(MOCK_WFH[0]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Working': return '#22c55e'; // green
      case 'On Break': return '#eab308'; // yellow
      case 'In Meeting': return '#3b82f6'; // blue
      default: return '#94a3b8'; // gray
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Working': return '🟢';
      case 'On Break': return '🟡';
      case 'In Meeting': return '🔵';
      default: return '⚪';
    }
  };

  return (
    <motion.div 
      className="wfh-tracking-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="page-header">
        <div className="page-title">
          <h1>WFH / GPS Tracking</h1>
          <p>Monitor remote employees' location and device security</p>
        </div>
      </div>

      <div className="split-layout">
        {/* Left: Map Section */}
        <div className="map-section">
          <div className="map-placeholder">
            <div className="map-text">
              Map Integration Coming Soon
            </div>
            
            {/* Visual placeholder pins */}
            {MOCK_WFH.map((emp, index) => {
              // Just random visual positions for the mockup
              const top = `${20 + (index * 15)}%`;
              const left = `${30 + (index * 10)}%`;
              
              return (
                <div 
                  key={emp.id}
                  className={`map-pin ${selectedEmp.id === emp.id ? 'active' : ''}`}
                  style={{ 
                    top, left, 
                    backgroundColor: getStatusColor(emp.status),
                    transform: selectedEmp.id === emp.id ? 'scale(1.5)' : 'scale(1)'
                  }}
                  onClick={() => setSelectedEmp(emp)}
                  title={emp.name}
                ></div>
              );
            })}
          </div>
        </div>

        {/* Right: List Section */}
        <div className="list-section">
          {MOCK_WFH.map(emp => (
            <div 
              key={emp.id} 
              className={`emp-list-card ${selectedEmp.id === emp.id ? 'selected' : ''}`}
              onClick={() => setSelectedEmp(emp)}
            >
              <div className="emp-list-info">
                <div className="emp-list-avatar">{emp.avatar}</div>
                <div className="emp-list-details">
                  <h4>{emp.name}</h4>
                  <div className="emp-list-location">
                    <MapPin size={12} /> {emp.location}
                  </div>
                  <div className="emp-list-status">
                    {getStatusIcon(emp.status)} {emp.status}
                  </div>
                </div>
              </div>
              <div className="emp-list-time">
                <Clock size={14} /> {emp.hours}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom: Detail Panel */}
      {selectedEmp && (
        <motion.div 
          className="detail-panel"
          key={selectedEmp.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="detail-header">
            {selectedEmp.name} — WFH Details
          </div>
        
        <div className="detail-grid">
          <div className="detail-item">
            <MapPin size={18} className="detail-icon" />
            <div className="detail-text">
              <span className="detail-label">Location Coordinates</span>
              <span className="detail-value">{selectedEmp.coordinates}</span>
            </div>
          </div>
          
          <div className="detail-item">
            <Globe size={18} className="detail-icon" />
            <div className="detail-text">
              <span className="detail-label">IP Address</span>
              <span className="detail-value">{selectedEmp.ip}</span>
            </div>
          </div>
          
          <div className="detail-item">
            <Monitor size={18} className="detail-icon" />
            <div className="detail-text">
              <span className="detail-label">Device Info</span>
              <span className="detail-value">{selectedEmp.device}</span>
            </div>
          </div>
          
          <div className="detail-item">
            <Shield size={18} className="detail-icon" />
            <div className="detail-text">
              <span className="detail-label">Browser & OS</span>
              <span className="detail-value">{selectedEmp.browser} on {selectedEmp.os}</span>
            </div>
          </div>
          
          <div className="detail-item">
            <Clock size={18} className="detail-icon" />
            <div className="detail-text">
              <span className="detail-label">Logged In</span>
              <span className="detail-value">{selectedEmp.timeIn}</span>
            </div>
          </div>
          
          <div className="detail-item">
            <MapPin size={18} className="detail-icon" style={{ opacity: 0 }} />
            <div className="detail-text">
              <span className="detail-label">Approximate Address</span>
              <span className="detail-value">{selectedEmp.address}</span>
            </div>
          </div>
        </div>
      </motion.div>
      )}
      
    </motion.div>
  );
};

export default WFHTracking;
