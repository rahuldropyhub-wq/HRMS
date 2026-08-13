import React, { useState } from 'react';
import {
  Users,
  CalendarDays,
  ClipboardCheck,
  FileText,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../../styles/employee/login.css';
import { useAuth } from '../../contexts/AuthContext';
import { Key } from 'lucide-react';

function Login() {
  const navigate = useNavigate();
  const { loginWithOtp, verifyOtp } = useAuth();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Dynamic greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning!';
    if (hour < 17) return 'Good Afternoon!';
    return 'Good Evening!';
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Enforce Corporate Domain Email
    if (!email.toLowerCase().endsWith('@dropyhub.com')) {
      setError('Access denied. Please use your @dropyhub.com corporate email address.');
      return;
    }

    setLoading(true);

    // Bypass for UI Testing
    if (email === 'testotp@dropyhub.com') {
      setTimeout(() => {
        setSuccess('Test OTP sent! (Use 123456)');
        setOtpSent(true);
        setLoading(false);
      }, 1000);
      return;
    }

    const { error } = await loginWithOtp(email);

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
      navigate('/dashboard');
    }
    setLoading(false);
  };

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;
    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);
    if (element.nextSibling && element.value !== "") {
      element.nextSibling.focus();
    }
  };

  return (
    <div className="auth-layout">
      {/* Left Panel */}
      <div className="auth-left">
        <div className="auth-brand">
          <img src="/Fevicon.png" alt="Dropyhub Icon" className="auth-fevicon-img" />
          <img src="/Logo.png" alt="Dropyhub Logo" className="auth-logo-img" />
        </div>

        <div className="auth-hero">
          <div className="auth-greeting">{getGreeting()}</div>
          <h2>Welcome Back!<br /><span>Let's get to work</span></h2>
          <p>Your all-in-one workspace to manage attendance, tasks, leaves, documents and more.</p>
        </div>

        <div className="auth-features">
          <div className="auth-feature-item">
            <div className="auth-feature-icon blue">
              <Users size={24} />
            </div>
            <div className="auth-feature-text">
              <h4>Employee Dashboard</h4>
              <p>View your profile, team updates and important announcements.</p>
            </div>
          </div>

          <div className="auth-feature-item">
            <div className="auth-feature-icon green">
              <CalendarDays size={24} />
            </div>
            <div className="auth-feature-text">
              <h4>Attendance & Leaves</h4>
              <p>Track attendance, apply leaves and view leave history.</p>
            </div>
          </div>

          <div className="auth-feature-item">
            <div className="auth-feature-icon yellow">
              <ClipboardCheck size={24} />
            </div>
            <div className="auth-feature-text">
              <h4>Tasks & Worksheets</h4>
              <p>Manage tasks, submit worksheets and stay productive.</p>
            </div>
          </div>

          <div className="auth-feature-item">
            <div className="auth-feature-icon purple">
              <FileText size={24} />
            </div>
            <div className="auth-feature-text">
              <h4>Documents & Profile</h4>
              <p>Access your documents and manage your profile.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-lock-icon">
            <Lock size={32} />
          </div>

          <h3>Login to Your Account</h3>
          <p>Enter your work email and we'll send you a secure magic link (OTP) to log in.</p>

          {error && <div style={{ color: 'red', marginBottom: '16px', fontSize: '14px', padding: '10px', backgroundColor: '#fee2e2', borderRadius: '4px' }}>{error}</div>}
          {success && <div style={{ color: 'green', marginBottom: '16px', fontSize: '14px', padding: '10px', backgroundColor: '#dcfce7', borderRadius: '4px' }}>{success}</div>}

          {!otpSent ? (
            <form className="auth-form" onSubmit={handleSendOtp}>
              <div className="auth-form-group">
                <label className="auth-form-label">Work Email</label>
                <div className="auth-input-wrap">
                  <Mail size={18} className="auth-input-icon" />
                  <input type="email" placeholder="Enter your work email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
              </div>

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? 'Sending...' : 'Send OTP Code'}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleVerifyOtp}>
              <div className="auth-form-group">
                <label className="auth-form-label">Enter 6-Digit Code</label>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '10px', marginBottom: '20px' }}>
                  {otp.map((data, index) => {
                    return (
                      <input
                        className="otp-input"
                        type="text"
                        name="otp"
                        maxLength="1"
                        key={index}
                        value={data}
                        onChange={e => handleOtpChange(e.target, index)}
                        onFocus={e => e.target.select()}
                        style={{ width: '45px', height: '50px', fontSize: '24px', textAlign: 'center', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', transition: '0.2s', backgroundColor: '#f9fafb', color: '#111827' }}
                      />
                    );
                  })}
                </div>
              </div>

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify & Log In'}
                {!loading && <ArrowRight size={18} />}
              </button>

              <div style={{ textAlign: 'center', marginTop: '15px' }}>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>Didn't receive code? </span>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                  style={{ background: 'none', border: 'none', color: '#4f46e5', fontWeight: '500', cursor: 'pointer', fontSize: '14px', padding: 0 }}
                >
                  Resend OTP
                </button>
              </div>
            </form>
          )}

          <div className="auth-divider">OR</div>

          <div className="auth-secure-box">
            <ShieldCheck size={24} className="auth-secure-icon" />
            <div className="auth-secure-text">
              <h5>Secure & Easy Login</h5>
              <p>We use OTP verification to keep your account safe and secure.</p>
            </div>
          </div>

          <div className="auth-help">
            Need help? <a href="#">Contact HR Admin</a>
          </div>
        </div>

        <div className="auth-footer">
          <div className="auth-footer-trust">
            <Shield size={14} /> Secure &bull; Private &bull; Trusted
          </div>
          <div className="auth-footer-copy">
            &copy; 2025 Dropyhub HRMS Portal. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
