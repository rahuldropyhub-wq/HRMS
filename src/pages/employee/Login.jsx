import React from 'react';
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

function Login() {
  const navigate = useNavigate();

  // Dynamic greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning!';
    if (hour < 17) return 'Good Afternoon!';
    return 'Good Evening!';
  };

  const handleLogin = (e) => {
    e.preventDefault();
    // Simulate login and redirect to dashboard
    navigate('/dashboard');
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
          <p>Enter your work email and we'll send you a one-time password (OTP)</p>

          <form className="auth-form" onSubmit={handleLogin}>
            <div className="auth-form-group">
              <label className="auth-form-label">Work Email</label>
              <div className="auth-input-wrap">
                <Mail size={18} className="auth-input-icon" />
                <input type="email" placeholder="Enter your work email" required />
              </div>
            </div>

            <button type="submit" className="auth-submit-btn">
              Send OTP
              <ArrowRight size={18} />
            </button>
          </form>

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
