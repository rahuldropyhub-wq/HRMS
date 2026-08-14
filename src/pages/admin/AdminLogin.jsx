import React, { useState, useEffect, useRef } from 'react';
import {
  Building2,
  Users,
  ShieldCheck,
  Settings,
  Lock,
  Mail,
  ArrowRight,
  Shield,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Edit3,
  ExternalLink,
  Loader2,
  KeyRound
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../../styles/admin/admin-login.css';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { loginAdminWithOtp, verifyOtp } = useAuth();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const otpInputRefs = useRef([]);

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

  // Focus first OTP input when step changes
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
      setError('Please enter your administrative email address.');
      return;
    }

    setLoading(true);

    try {
      const { error: otpError } = await loginAdminWithOtp(cleanEmail);

      if (otpError) {
        setError(otpError.message || 'Access denied. You do not have administrator credentials.');
      } else {
        setSuccess(`Administrative security passcode transmitted to ${cleanEmail}`);
        setOtpSent(true);
        setResendCooldown(30);
      }
    } catch (err) {
      setError('Connection failure. Please check your network and retry.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');
    const token = otp.join('').trim();

    if (token.length !== 6) {
      setError('Please provide the full 6-digit administrative code.');
      return;
    }

    setLoading(true);

    try {
      const { error: verifyError } = await verifyOtp(email.trim().toLowerCase(), token);

      if (verifyError) {
        setError(verifyError.message || 'Invalid or expired authorization passcode.');
      } else {
        setSuccess('Security clearance verified! Opening Admin Command Center...');
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 500);
      }
    } catch (err) {
      setError('Authorization verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (e, index) => {
    const val = e.target.value;
    if (!/^\d*$/.test(val)) return;

    const newOtp = [...otp];
    newOtp[index] = val.slice(-1);
    setOtp(newOtp);

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
    <div className="admin-auth-layout">
      {/* ── Left Hero & Command Center Panel ── */}
      <div className="admin-auth-left">
        <div className="admin-auth-left-content">
          <div className="admin-auth-brand">
            <img src="/Fevicon.png" alt="Dropyhub Icon" className="admin-auth-fevicon-img" />
            <img src="/Logo.png" alt="Dropyhub Logo" className="admin-auth-logo-img" />
          </div>

          <div className="admin-auth-badge">
            <div className="admin-auth-badge-dot" />
            Enterprise Admin Gateway
          </div>

          <div className="admin-auth-hero">
            <h2>
              Command Center
              <span>Administrative Access.</span>
            </h2>
            <p className="admin-auth-hero-desc">
              High-security portal for HR managers, department leads, and system administrators to manage personnel, configure company policies, and monitor organizational operations.
            </p>
          </div>

          <div className="admin-auth-features">
            <div className="admin-auth-feature-item">
              <div className="admin-auth-feature-icon indigo">
                <Users size={20} />
              </div>
              <div className="admin-auth-feature-text">
                <h4>Employee Directory</h4>
                <p>Onboarding, profiles & workforce management.</p>
              </div>
            </div>

            <div className="admin-auth-feature-item">
              <div className="admin-auth-feature-icon purple">
                <Building2 size={20} />
              </div>
              <div className="admin-auth-feature-text">
                <h4>Org Structure</h4>
                <p>Departments, designations & hierarchy trees.</p>
              </div>
            </div>

            <div className="admin-auth-feature-item">
              <div className="admin-auth-feature-icon emerald">
                <ShieldCheck size={20} />
              </div>
              <div className="admin-auth-feature-text">
                <h4>Leaves & Approvals</h4>
                <p>Real-time leave queue & attendance history.</p>
              </div>
            </div>

            <div className="admin-auth-feature-item">
              <div className="admin-auth-feature-icon amber">
                <Settings size={20} />
              </div>
              <div className="admin-auth-feature-text">
                <h4>Policies & Audits</h4>
                <p>System configuration, holidays & audit logs.</p>
              </div>
            </div>
          </div>

          <div className="admin-auth-left-footer">
            <span>&copy; {new Date().getFullYear()} Dropyhub Enterprise</span>
            <span>Security Protocol v3.2 &bull; TLS 256-Bit</span>
          </div>
        </div>
      </div>

      {/* ── Right Auth Card Panel ── */}
      <div className="admin-auth-right">
        <div className="admin-auth-card">
          <div className="admin-auth-header">
            <div className="admin-auth-badge-row">
              <span className="admin-auth-step-pill">
                {!otpSent ? 'Admin Step 1: Verification' : 'Admin Step 2: Passcode'}
              </span>
              <KeyRound size={18} color="#818cf8" />
            </div>
            <h3>{!otpSent ? 'Administrator Login' : 'Enter Admin Code'}</h3>
            <p>
              {!otpSent
                ? 'Enter your privileged administrator email to receive a secure authorization code.'
                : 'Enter the 6-digit one-time security token to unlock administrative controls.'}
            </p>
          </div>

          {/* Alert Messaging */}
          {error && (
            <div className="admin-auth-alert error">
              <AlertTriangle size={18} className="admin-auth-alert-icon" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="admin-auth-alert success">
              <CheckCircle2 size={18} className="admin-auth-alert-icon" />
              <span>{success}</span>
            </div>
          )}

          {!otpSent ? (
            /* ── Step 1: Admin Email Form ── */
            <form className="admin-auth-form" onSubmit={handleSendOtp}>
              <div className="admin-auth-instruction-box security">
                <Shield size={18} className="admin-auth-instruction-icon" style={{ color: '#ef4444' }} />
                <div>
                  <strong>Restricted Access Zone:</strong> Access is strictly restricted to authorized system administrators. All sign-in sessions are encrypted, audited, and logged.
                </div>
              </div>

              <div className="admin-auth-form-group">
                <label className="admin-auth-form-label">
                  Administrator Email
                </label>
                <div className="admin-auth-input-wrap">
                  <input
                    type="email"
                    placeholder="admin@dropyhub.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                  <Mail size={18} className="admin-auth-input-icon" />
                </div>
                <div className="admin-auth-input-hint">
                  <span>Enter your assigned administrator credentials</span>
                </div>
              </div>

              <button type="submit" className="admin-auth-submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 size={18} className="spin-animate" />
                    <span>Transmitting Security Code...</span>
                  </>
                ) : (
                  <>
                    <span>Authenticate & Send Code</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* ── Step 2: Admin OTP Verification Form ── */
            <form className="admin-auth-form" onSubmit={handleVerifyOtp}>
              {/* Delivery Information Card */}
              <div className="admin-auth-otp-card">
                <div className="admin-auth-otp-target">
                  <div className="admin-auth-otp-mail-badge">
                    <Mail size={18} />
                  </div>
                  <div className="admin-auth-otp-email-text">
                    <span>Passcode sent to:</span>
                    <strong>{email}</strong>
                  </div>
                </div>
                <button
                  type="button"
                  className="admin-auth-otp-edit-btn"
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

              <div className="admin-auth-instruction-box">
                <KeyRound size={18} className="admin-auth-instruction-icon" />
                <div>
                  Enter the 6-digit security token dispatched to your admin mailbox. You can paste the 6-digit code directly into the boxes below.
                </div>
              </div>

              <div className="admin-auth-form-group">
                <label className="admin-auth-form-label">
                  <span>Enter 6-Digit Admin Passcode</span>
                </label>
                <div className="admin-auth-otp-inputs" onPaste={handleOtpPaste}>
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpInputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className="admin-auth-otp-box"
                      value={digit}
                      onChange={(e) => handleOtpChange(e, idx)}
                      onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                      onFocus={(e) => e.target.select()}
                    />
                  ))}
                </div>
              </div>

              <button type="submit" className="admin-auth-submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 size={18} className="spin-animate" />
                    <span>Validating Security Clearance...</span>
                  </>
                ) : (
                  <>
                    <span>Verify & Open Admin Dashboard</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <div className="admin-auth-otp-footer">
                <span className="admin-auth-resend-timer">
                  {resendCooldown > 0 ? (
                    `Resend code in ${resendCooldown}s`
                  ) : (
                    "Didn't receive the passcode?"
                  )}
                </span>
                <button
                  type="button"
                  className="admin-auth-resend-btn"
                  disabled={loading || resendCooldown > 0}
                  onClick={handleSendOtp}
                >
                  <RefreshCw size={13} />
                  Resend Code
                </button>
              </div>
            </form>
          )}

          <div className="admin-auth-footer">
            <div className="admin-auth-footer-trust">
              <ShieldCheck size={14} color="#10b981" /> Encrypted Session &bull; Access Monitored & Logged
            </div>
            <div className="admin-auth-footer-copy">
              For elevated administrative permissions, contact Super Admin.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
