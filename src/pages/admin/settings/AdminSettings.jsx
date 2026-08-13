import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building, Clock, Calendar, Bell, Link as LinkIcon, Hash, MessageSquare } from 'lucide-react';
import '../../../styles/admin/settings/admin-settings.css';
import CustomDropdown from '../../../components/admin/CustomDropdown';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    wfhAllowed: true,
    sandwichRule: true,
    lossOfPayAuto: false,
    emailNotif: true,
    inAppNotif: true
  });

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    // Simulate save
    alert('Settings saved successfully (Mock)');
  };

  return (
    <motion.div 
      className="settings-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="page-header">
        <div className="page-title">
          <h1>Admin Settings</h1>
          <p>Configure company policies, rules, and system preferences</p>
        </div>
      </div>

      <div className="settings-layout">
        <div className="settings-tabs">
          <button 
            className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <Building size={18} /> General
          </button>
          <button 
            className={`tab-btn ${activeTab === 'attendance' ? 'active' : ''}`}
            onClick={() => setActiveTab('attendance')}
          >
            <Clock size={18} /> Attendance Rules
          </button>
          <button 
            className={`tab-btn ${activeTab === 'leave' ? 'active' : ''}`}
            onClick={() => setActiveTab('leave')}
          >
            <Calendar size={18} /> Leave Rules
          </button>
          <button 
            className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <Bell size={18} /> Notifications
          </button>
          <button 
            className={`tab-btn ${activeTab === 'integrations' ? 'active' : ''}`}
            onClick={() => setActiveTab('integrations')}
          >
            <LinkIcon size={18} /> Integrations
          </button>
        </div>

        <div className="settings-content">
          <form onSubmit={handleSave}>
            {activeTab === 'general' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="settings-section-title">General Settings</h2>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Company Name</label>
                    <input type="text" className="form-control" defaultValue="Dropyhub" />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input type="text" className="form-control" defaultValue="+91 98765 43210" />
                  </div>
                  <div className="form-group">
                    <label>Support Email</label>
                    <input type="email" className="form-control" defaultValue="support@dropyhub.com" />
                  </div>
                  <div className="form-group full-width">
                    <label>Company Address</label>
                    <textarea className="form-control" rows="3" defaultValue="123 Tech Park, Bangalore, India"></textarea>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'attendance' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="settings-section-title">Attendance & Timing Rules</h2>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Office Start Time</label>
                    <input type="time" className="form-control" defaultValue="09:00" />
                  </div>
                  <div className="form-group">
                    <label>Grace Period (minutes)</label>
                    <input type="number" className="form-control" defaultValue="15" />
                  </div>
                  <div className="form-group">
                    <label>Half Day Hours Threshold</label>
                    <input type="number" className="form-control" defaultValue="4" />
                  </div>
                  <div className="form-group">
                    <label>Full Day Hours Threshold</label>
                    <input type="number" className="form-control" defaultValue="8" />
                  </div>
                </div>

                <div className="toggle-wrapper" style={{ marginTop: '16px' }}>
                  <div className="toggle-info">
                    <strong>Allow Work From Home (WFH)</strong>
                    <span>Enable employees to request WFH through the portal</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={settings.wfhAllowed} 
                    onChange={() => handleToggle('wfhAllowed')}
                    style={{ width: '20px', height: '20px' }}
                  />
                </div>
              </motion.div>
            )}

            {activeTab === 'leave' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="settings-section-title">Leave Policies</h2>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Default Leave Year</label>
                    <CustomDropdown
                      value="January - December"
                      onChange={() => {}}
                      options={[
                        { value: 'January - December', label: 'January - December' },
                        { value: 'April - March', label: 'April - March' }
                      ]}
                      fullWidth
                    />
                  </div>
                  <div className="form-group">
                    <label>Max Consecutive Leaves</label>
                    <input type="number" className="form-control" defaultValue="15" />
                  </div>
                  <div className="form-group">
                    <label>Probation Period (months)</label>
                    <input type="number" className="form-control" defaultValue="3" />
                  </div>
                </div>

                <div className="toggle-wrapper" style={{ marginTop: '16px' }}>
                  <div className="toggle-info">
                    <strong>Enable Sandwich Rule</strong>
                    <span>Weekends falling between two leaves will be counted as leave</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={settings.sandwichRule} 
                    onChange={() => handleToggle('sandwichRule')}
                    style={{ width: '20px', height: '20px' }}
                  />
                </div>

                <div className="toggle-wrapper">
                  <div className="toggle-info">
                    <strong>Auto-apply Loss of Pay (LOP)</strong>
                    <span>Automatically mark LOP when leave balance is exhausted</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={settings.lossOfPayAuto} 
                    onChange={() => handleToggle('lossOfPayAuto')}
                    style={{ width: '20px', height: '20px' }}
                  />
                </div>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="settings-section-title">Notification Preferences</h2>
                
                <div className="toggle-wrapper">
                  <div className="toggle-info">
                    <strong>Email Notifications</strong>
                    <span>Send critical updates to registered email addresses</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={settings.emailNotif} 
                    onChange={() => handleToggle('emailNotif')}
                    style={{ width: '20px', height: '20px' }}
                  />
                </div>

                <div className="toggle-wrapper">
                  <div className="toggle-info">
                    <strong>In-App Notifications</strong>
                    <span>Show alerts inside the portal (bell icon)</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={settings.inAppNotif} 
                    onChange={() => handleToggle('inAppNotif')}
                    style={{ width: '20px', height: '20px' }}
                  />
                </div>
              </motion.div>
            )}

            {activeTab === 'integrations' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="settings-section-title">Connected Apps</h2>
                
                <div className="integration-card">
                  <div className="integration-info">
                    <div className="icon"><Hash size={20} color="#6b7280" /></div>
                    <div className="integration-text">
                      <h4>Slack Workspace</h4>
                      <p>Send daily attendance and leave updates to a Slack channel</p>
                    </div>
                  </div>
                  <button type="button" className="btn-connect">Connect</button>
                </div>

                <div className="integration-card">
                  <div className="integration-info">
                    <div className="integration-icon"><MessageSquare size={24} /></div>
                    <div className="integration-text">
                      <h4>Microsoft Teams</h4>
                      <p>Integrate notifications with MS Teams</p>
                    </div>
                  </div>
                  <button type="button" className="btn-connect">Connect</button>
                </div>
              </motion.div>
            )}

            {activeTab !== 'integrations' && (
              <div className="form-actions">
                <button type="submit" className="btn-primary">Save Changes</button>
              </div>
            )}
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminSettings;
