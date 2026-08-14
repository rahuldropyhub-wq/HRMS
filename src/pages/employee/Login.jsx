import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  CalendarDays,
  ClipboardCheck,
  FileText,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Shield,
  Sparkles,
  Info,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Edit3,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../../styles/employee/login.css';
import { useAuth } from '../../contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { loginWithOtp, verifyOtp } = useAuth();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const otpInputRefs = useRef([]);

  // Dynamic greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning!';
    if (hour < 17) return 'Good Afternoon!';
    return 'Good Evening!';
  };

  // Resend cooldown timer
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Focus first OTP input when screen changes to OTP
  useEffect(() => {
    if (otpSent && otpInputRefs.current[0]) {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    }
  }, [otpSent]);

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setSuccess('');

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError('Please enter your corporate email address.');
      return;
    }

    // Enforce Corporate Domain Email
    if (!cleanEmail.endsWith('@dropyhub.com')) {
      setError('Access restricted: Please use your official @dropyhub.com corporate email address.');
      return;
    }

    setLoading(true);

    try {
      const { error: otpError } = await loginWithOtp(cleanEmail);

      if (otpError) {
        setError(otpError.message || 'Unable to send passcode. Please try again.');
      } else {
        setSuccess(`Verification code dispatched to ${cleanEmail}`);
        setOtpSent(true);
        setResendCooldown(30); // 30 seconds cooldown
      }
    } catch (err) {
      setError('An unexpected connection error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');
    const token = otp.join('').trim();

    if (token.length !== 6) {
      setError('Please enter the complete 6-digit passcode.');
      return;
    }

    setLoading(true);

    try {
      const { error: verifyError } = await verifyOtp(email.trim().toLowerCase(), token);

      if (verifyError) {
        setError(verifyError.message || 'Invalid or expired code. Please request a new one.');
      } else {
        setSuccess('Passcode verified! Directing to workspace...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 500);
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (e, index) => {
    const val = e.target.value;
    if (!/^\d*$/.test(val)) return; // Only allow numbers

    const newOtp = [...otp];
    newOtp[index] = val.slice(-1); // Take only last character
    setOtp(newOtp);

    // Auto-advance to next input
    if (val && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        otpInputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasted)) {
      const digits = pasted.split('');
      setOtp(digits);
      otpInputRefs.current[5]?.focus();
    }
  };

  return (
    <div className="auth-layout">
      {/* ── Left Hero & Features Panel ── */}
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-brand">
            <img src="/Fevicon.png" alt="Dropyhub Icon" className="auth-fevicon-img" />
            <img src="/Logo.png" alt="Dropyhub Logo" className="auth-logo-img" />
          </div>

          <div className="auth-portal-tag">
            <Sparkles size={13} />
            Employee Workspace
          </div>

          <div className="auth-hero">
            <h2>
              {getGreeting()}
              <span>Welcome Back to Work.</span>
            </h2>
            <p className="auth-hero-desc">
              Your centralized staff hub to seamlessly track attendance, submit daily worksheets, manage leaves, and view organizational updates.
            </p>
          </div>

          <div className="auth-features">
            <div className="auth-feature-item">
              <div className="auth-feature-icon blue">
                <Users size={20} />
              </div>
              <div className="auth-feature-text">
                <h4>Staff Dashboard</h4>
                <p>Personal profile, team updates & internal notices.</p>
              </div>
            </div>

            <div className="auth-feature-item">
              <div className="auth-feature-icon green">
                <CalendarDays size={20} />
              </div>
              <div className="auth-feature-text">
                <h4>Attendance & Leaves</h4>
                <p>One-click check-in, leave balance & holiday list.</p>
              </div>
            </div>

            <div className="auth-feature-item">
              <div className="auth-feature-icon yellow">
                <ClipboardCheck size={20} />
              </div>
              <div className="auth-feature-text">
                <h4>Tasks & Worksheets</h4>
                <p>Assigned project tasks & daily work logs.</p>
              </div>
            </div>

            <div className="auth-feature-item">
              <div className="auth-feature-icon purple">
                <FileText size={20} />
              </div>
              <div className="auth-feature-text">
                <h4>Documents & Assets</h4>
                <p>Secure company assets, payslips & policies.</p>
              </div>
            </div>
          </div>

          <div className="auth-left-footer">
            <span>&copy; {new Date().getFullYear()} Dropyhub Technologies</span>
            <span>Enterprise Edition v2.4</span>
          </div>
        </div>
      </div>

      {/* ── Right Auth Card Panel ── */}
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-badge-row">
              <span className="auth-step-pill">
                {!otpSent ? 'Step 1 of 2: Identity' : 'Step 2 of 2: Verification'}
              </span>
              <ShieldCheck size={18} color="#2563eb" />
            </div>
            <h3>{!otpSent ? 'Sign In to Your Account' : 'Verify Passcode'}</h3>
            <p>
              {!otpSent
                ? 'Enter your corporate email address to receive a secure login code.'
                : 'Enter the 6-digit one-time code sent to your registered work inbox.'}
            </p>
          </div>

          {/* Alert Messaging */}
          {error && (
            <div className="auth-alert error">
              <AlertCircle size={18} className="auth-alert-icon" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="auth-alert success">
              <CheckCircle2 size={18} className="auth-alert-icon" />
              <span>{success}</span>
            </div>
          )}

          {!otpSent ? (
            /* ── Step 1: Email Form ── */
            <form className="auth-form" onSubmit={handleSendOtp}>
              <div className="auth-instruction-box">
                <Info size={18} className="auth-instruction-icon" />
                <div>
                  <strong>Official Domain Requirement:</strong> Please provide your <code>@dropyhub.com</code> email. No password needed — we authenticate via instant One-Time Password.
                </div>
              </div>

              <div className="auth-form-group">
                <label className="auth-form-label">
                  Corporate Work Email
                </label>
                <div className="auth-input-wrap">
                  <input
                    type="email"
                    placeholder="name@dropyhub.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                  <Mail size={18} className="auth-input-icon" />
                </div>
                <div className="auth-input-hint">
                  <span>Must be an active @dropyhub.com corporate account</span>
                </div>
              </div>

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 size={18} className="spin-animate" />
                    <span>Dispatching Passcode...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* ── Step 2: OTP Verification Form ── */
            <form className="auth-form" onSubmit={handleVerifyOtp}>
              {/* Delivery Information Card */}
              <div className="auth-otp-card">
                <div className="auth-otp-target">
                  <div className="auth-otp-mail-badge">
                    <Mail size={18} />
                  </div>
                  <div className="auth-otp-email-text">
                    <span>Passcode sent to:</span>
                    <strong>{email}</strong>
                  </div>
                </div>
                <button
                  type="button"
                  className="auth-otp-edit-btn"
                  onClick={() => {
                    setOtpSent(false);
                    setError('');
                    setSuccess('');
                    setOtp(['', '', '', '', '', '']);
                  }}
                >
                  <Edit3 size={13} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                  Change
                </button>
              </div>

              <div className="auth-instruction-box">
                <Info size={18} className="auth-instruction-icon" />
                <div>
                  Check your inbox for a 6-digit code. Valid for 10 minutes. You can also paste the full 6-digit code directly into the boxes below.
                </div>
              </div>

              <div className="auth-form-group">
                <label className="auth-form-label">
                  <span>Enter 6-Digit Passcode</span>
                </label>
                <div className="auth-otp-inputs" onPaste={handleOtpPaste}>
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpInputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className="auth-otp-box"
                      value={digit}
                      onChange={(e) => handleOtpChange(e, idx)}
                      onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                      onFocus={(e) => e.target.select()}
                    />
                  ))}
                </div>
              </div>

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 size={18} className="spin-animate" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <span>Verify & Access Portal</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <div className="auth-otp-footer">
                <span className="auth-resend-timer">
                  {resendCooldown > 0 ? (
                    `Resend code in ${resendCooldown}s`
                  ) : (
                    "Didn't receive the email?"
                  )}
                </span>
                <button
                  type="button"
                  className="auth-resend-btn"
                  disabled={loading || resendCooldown > 0}
                  onClick={handleSendOtp}
                >
                  <RefreshCw size={13} />
                  Resend Code
                </button>
              </div>
            </form>
          )}

          <div className="auth-footer">
            <div className="auth-footer-trust">
              <Shield size={14} /> End-to-End Encrypted Session &bull; Private & Secure
            </div>
            <div className="auth-footer-copy">
              If you experience any issues, please contact IT Support at <code>support@dropyhub.com</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
