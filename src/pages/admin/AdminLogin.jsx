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
  const { login, mockLogin } = useAuth();
  const [email, setEmail] = useState('admin@dropyhub.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await login(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/admin/dashboard');
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

          {error && <div style={{ color: 'red', marginBottom: '16px', fontSize: '14px', padding: '10px', backgroundColor: '#fee2e2', borderRadius: '4px' }}>{error}</div>}

          <form className="admin-auth-form" onSubmit={handleLogin}>
            <div className="admin-auth-form-group">
              <label className="admin-auth-form-label">Admin Email</label>
              <div className="admin-auth-input-wrap">
                <Mail size={18} className="admin-auth-input-icon" />
                <input type="email" placeholder="admin@dropyhub.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>

            <div className="admin-auth-form-group">
              <label className="admin-auth-form-label">Password</label>
              <div className="admin-auth-input-wrap">
                <Lock size={18} className="admin-auth-input-icon" />
                <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
            </div>

            <button type="submit" className="admin-auth-submit-btn" disabled={loading}>
              {loading ? 'Authenticating...' : 'Login to Dashboard'}
              {!loading && <ArrowRight size={18} />}
            </button>

            <button
              type="button"
              className="admin-auth-submit-btn"
              style={{ backgroundColor: '#10b981', marginTop: '10px' }}
              onClick={() => {
                mockLogin('admin');
                navigate('/admin/dashboard');
              }}
            >
              Bypass Login (Test UI)
            </button>
          </form>

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
