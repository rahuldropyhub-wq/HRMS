import React, { useState } from 'react';
import {
  Building2,
  Users,
  ShieldCheck,
  Settings,
  Lock,
  Mail,
  ArrowRight,
  Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../../styles/admin/admin-login.css';
import { useAuth } from '../../contexts/AuthContext';

function AdminLogin() {
  const navigate = useNavigate();
  const { loginAdminWithOtp, verifyOtp } = useAuth();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const { error } = await loginAdminWithOtp(email);

    if (error) {
      setError(error.message);
    } else {
      setSuccess('OTP sent! Please check your email.');
      setOtpSent(true);
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    const token = otp.join('');
    if (token.length !== 6) {
      setError('Please enter the full 6-digit OTP.');
      return;
    }
    setLoading(true);

    const { error } = await verifyOtp(email, token);

    if (error) {
      setError(error.message || 'Invalid OTP. Please try again.');
    } else {
      setSuccess('Verified successfully!');
      navigate('/admin/dashboard');
    }
    setLoading(false);
  };

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);
    if (element.nextSibling && element.value !== '') {
      element.nextSibling.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (otp[index] === '' && e.target.previousSibling) {
        e.target.previousSibling.focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  return (
    <div className="admin-auth-layout">
      {/* Left Panel */}
      <div className="admin-auth-left">
        <div className="admin-auth-brand">
          <img src="/Fevicon.png" alt="Dropyhub Icon" className="admin-auth-fevicon-img" />
          <img src="/Logo.png" alt="Dropyhub Logo" className="admin-auth-logo-img" />
        </div>

        <div className="admin-auth-hero">
          <div className="admin-auth-badge">Enterprise Admin Portal</div>
          <h2>Command Center<br /><span>Manage Dropyhub</span></h2>
          <p>Access the central administration panel to manage employees, permissions, and system settings securely.</p>
        </div>

        <div className="admin-auth-features">
          <div className="admin-auth-feature-item">
            <div className="admin-auth-feature-icon blue">
              <Users size={24} />
            </div>
            <div className="admin-auth-feature-text">
              <h4>Employee Management</h4>
              <p>Manage the complete employee lifecycle and directory.</p>
            </div>
          </div>

          <div className="admin-auth-feature-item">
            <div className="admin-auth-feature-icon purple">
              <Building2 size={24} />
            </div>
            <div className="admin-auth-feature-text">
              <h4>Organization Structure</h4>
              <p>Configure departments, roles, shifts, and locations.</p>
            </div>
          </div>

          <div className="admin-auth-feature-item">
            <div className="admin-auth-feature-icon orange">
              <Settings size={24} />
            </div>
            <div className="admin-auth-feature-text">
              <h4>System Settings</h4>
              <p>Control global policies, attendance rules, and integrations.</p>
            </div>
          </div>

          <div className="admin-auth-feature-item">
            <div className="admin-auth-feature-icon green">
              <ShieldCheck size={24} />
            </div>
            <div className="admin-auth-feature-text">
              <h4>Security & Audit Logs</h4>
              <p>Monitor system activity and manage access permissions.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="admin-auth-right">
        <div className="admin-auth-card">
          <div className="admin-auth-lock-icon">
            <Shield size={32} />
          </div>

          <h3>Admin Authentication</h3>
          <p>Enter your administrator credentials to access the system.</p>

          {error && <div style={{ color: '#b91c1c', marginBottom: '16px', fontSize: '14px', padding: '12px', backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '6px' }}>{error}</div>}
          {success && <div style={{ color: '#047857', marginBottom: '16px', fontSize: '14px', padding: '12px', backgroundColor: '#ecfdf5', border: '1px solid #6ee7b7', borderRadius: '6px' }}>{success}</div>}

          {!otpSent ? (
            <form className="admin-auth-form" onSubmit={handleSendOtp}>
              <div className="admin-auth-form-group">
                <label className="admin-auth-form-label">Admin Email</label>
                <div className="admin-auth-input-wrap">
                  <Mail size={18} className="admin-auth-input-icon" />
                  <input type="email" placeholder="Enter your admin email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
              </div>

              <button type="submit" className="admin-auth-submit-btn" disabled={loading}>
                {loading ? 'Sending OTP...' : 'Send OTP Code'}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>
          ) : (
            <form className="admin-auth-form" onSubmit={handleVerifyOtp}>
              <div className="admin-auth-form-group">
                <label className="admin-auth-form-label">Enter 6-digit OTP</label>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between', marginBottom: '20px' }}>
                  {otp.map((data, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength="1"
                      value={data}
                      onChange={(e) => handleOtpChange(e.target, index)}
                      onKeyDown={(e) => handleOtpKeyDown(e, index)}
                      style={{
                        width: '45px',
                        height: '55px',
                        fontSize: '24px',
                        textAlign: 'center',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        backgroundColor: '#f9fafb',
                        color: '#111827',
                        fontWeight: '600'
                      }}
                      onFocus={(e) => e.target.select()}
                    />
                  ))}
                </div>
              </div>

              <button type="submit" className="admin-auth-submit-btn" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify & Login'}
                {!loading && <ArrowRight size={18} />}
              </button>

              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <button 
                  type="button" 
                  onClick={() => setOtpSent(false)}
                  style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: '14px', cursor: 'pointer', fontWeight: 500 }}
                >
                  &larr; Back to Email
                </button>
              </div>
            </form>
          )}

          <div className="admin-auth-divider">RESTRICTED ACCESS</div>

          <div className="admin-auth-secure-box">
            <ShieldCheck size={24} className="admin-auth-secure-icon" />
            <div className="admin-auth-secure-text">
              <h5>High Security Zone</h5>
              <p>Your session is encrypted and all administrative actions are logged.</p>
            </div>
          </div>
        </div>

        <div className="admin-auth-footer">
          <div className="admin-auth-footer-trust">
            Dropyhub Enterprise Security Protocol
          </div>
          <div className="admin-auth-footer-copy">
            &copy; 2026 Dropyhub HRMS Portal. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
