import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
  Shield, Eye, EyeOff, Mail, Lock, AlertCircle,
  ArrowRight, Zap, BarChart2, FileText, Users,
  Settings, Activity, CheckCircle, ChevronRight,
  Key, AlertTriangle, LogIn
} from 'lucide-react';
import { ThemeContext } from '../../context/ThemeContext';

const ADMIN_STATS = [
  { icon: <Users size={18} />, value: '12,400+', label: 'Users Managed' },
  { icon: <FileText size={18} />, value: '48,200+', label: 'Articles Published' },
  { icon: <Activity size={18} />, value: '99.98%', label: 'Uptime This Month' },
  { icon: <CheckCircle size={18} />, value: '3,200+', label: 'Flags Resolved' },
];

const QUICK_ACTIONS = [
  { icon: <FileText size={16} />, label: 'Article Review Queue', count: '23 pending' },
  { icon: <Users size={16} />, label: 'User Management', count: '5 reports' },
  { icon: <AlertTriangle size={16} />, label: 'Moderation Flags', count: '8 urgent' },
  { icon: <BarChart2 size={16} />, label: 'Platform Analytics', count: 'Live' },
];

const AdminLogin = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState(null);
  const [showMfaField, setShowMfaField] = useState(false);
  const [mfaToken, setMfaToken] = useState('');

  const [formData, setFormData] = useState({ email: '', password: '' });

  // Scanning-line animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    let scanY = 0;
    let animId;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Hexagonal dots grid
      const hex = 38;
      for (let row = 0; row * hex * 0.86 < canvas.height + hex; row++) {
        for (let col = 0; col * hex < canvas.width + hex; col++) {
          const x = col * hex + (row % 2 === 0 ? 0 : hex / 2);
          const y = row * hex * 0.86;
          const dist = Math.abs(y - scanY);
          const base = 0.03;
          const highlight = Math.max(0, 0.15 - dist / 120);
          ctx.beginPath();
          ctx.arc(x, y, 1.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(245, 158, 11, ${base + highlight})`;
          ctx.fill();
        }
      }

      // Scan line
      const grad = ctx.createLinearGradient(0, scanY - 20, 0, scanY + 20);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(0.5, 'rgba(245, 158, 11, 0.06)');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, scanY - 20, canvas.width, 40);

      scanY += 0.7;
      if (scanY > canvas.height + 40) scanY = -40;
      animId = requestAnimationFrame(animate);
    };
    animate();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  const validate = () => {
    const errs = {};
    if (!formData.email.match(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/)) errs.email = 'Valid email required';
    if (!formData.password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (loginError) setLoginError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setLoginError('');

    try {
      const payload = { email: formData.email, password: formData.password, rememberMe };
      if (showMfaField && mfaToken) payload.mfaToken = mfaToken;

      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });
      const data = await res.json();

      if (res.ok) {
        if (data.requiresMfa && !showMfaField) {
          setShowMfaField(true);
          setLoginError('');
          await Swal.fire({ icon: 'info', title: 'MFA Required', text: 'Enter the 6-digit code from your authenticator app.', background: isDarkMode ? '#0d0a1a' : '#fff', color: isDarkMode ? '#f5f3ff' : '#1a1230', confirmButtonColor: '#f59e0b' });
        } else {
          if (rememberMe && data.token) localStorage.setItem('ai_news_admin_token', data.token);
          await Swal.fire({
            icon: 'success',
            title: `Welcome, ${data.admin?.name?.split(' ')[0] || 'Admin'}!`,
            text: 'Redirecting to the admin dashboard...',
            timer: 1600,
            showConfirmButton: false,
            background: isDarkMode ? '#0d0a1a' : '#fff',
            color: isDarkMode ? '#f5f3ff' : '#1a1230',
          });
          navigate('/admin/dashboard');
        }
      } else {
        if (res.status === 423) {
          setLoginError('Account locked. Too many failed attempts. Please try again in 30 minutes or contact a super admin.');
        } else if (res.status === 403) {
          if (data.status === 'pending_approval') {
            setLoginError('Your account is pending approval. You\'ll receive an email when approved.');
          } else if (data.status === 'suspended') {
            setLoginError('This admin account has been suspended. Contact a super administrator.');
          } else {
            setLoginError('Email not verified. Please check your inbox.');
          }
        } else {
          const remaining = data.remainingAttempts;
          if (remaining !== undefined) setAttemptsLeft(remaining);
          setLoginError(data.message || 'Invalid credentials. Please try again.');
        }
      }
    } catch {
      setLoginError('Network error. Cannot connect to the admin server.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotLoading(true);
    try {
      await fetch('/api/admin/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      await Swal.fire({
        icon: 'success',
        title: 'Reset Email Dispatched',
        text: `If this admin email exists, a secure reset link has been sent to ${forgotEmail}.`,
        background: isDarkMode ? '#0d0a1a' : '#fff',
        color: isDarkMode ? '#f5f3ff' : '#1a1230',
        confirmButtonColor: '#f59e0b',
      });
      setForgotMode(false);
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Unable to process request. Please try again.' });
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className={`ai-news-admin-login-root ${isDarkMode ? 'dark' : 'light'}`}>
      <h1 className="ai-news-admin-login-seo-title">
        NewsAI Admin Portal — Secure Administrator Login | Command Center Access
      </h1>

      <canvas ref={canvasRef} className="ai-news-admin-login-canvas" />
      <div className="ai-news-admin-login-orb ai-news-admin-login-orb-1" />
      <div className="ai-news-admin-login-orb ai-news-admin-login-orb-2" />

      <div className="ai-news-admin-login-layout">
        {/* LEFT */}
        <aside className="ai-news-admin-login-left">
          <div className="ai-news-admin-login-left-inner">
            <div className="ai-news-admin-login-brand">
              <div className="ai-news-admin-login-logo">
                <Shield size={26} />
                <span>News<strong>AI</strong> <em>Admin</em></span>
              </div>
              <span className="ai-news-admin-login-badge">Command Center</span>
            </div>

            <div className="ai-news-admin-login-hero">
              <h2>Platform<br /><span className="ai-news-admin-login-gradient-text">Control Hub</span></h2>
              <p>
                The NewsAI admin dashboard gives you real-time control over every aspect of the platform —
                from content pipelines and editorial workflows to user management and performance analytics.
                Thousands of decisions happen here every day.
              </p>
            </div>

            {/* Live stats */}
            <div className="ai-news-admin-login-stats-section">
              <div className="ai-news-admin-login-stats-header">
                <span className="ai-news-admin-login-live-indicator" />
                <span>Platform Status — Live</span>
              </div>
              <div className="ai-news-admin-login-stats-grid">
                {ADMIN_STATS.map((s, i) => (
                  <div key={i} className="ai-news-admin-login-stat-card">
                    <div className="ai-news-admin-login-stat-icon">{s.icon}</div>
                    <div>
                      <strong>{s.value}</strong>
                      <p>{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div className="ai-news-admin-login-quick-section">
              <h3>Awaiting Your Attention</h3>
              {QUICK_ACTIONS.map((a, i) => (
                <div key={i} className="ai-news-admin-login-quick-item">
                  <div className="ai-news-admin-login-quick-icon">{a.icon}</div>
                  <span className="ai-news-admin-login-quick-label">{a.label}</span>
                  <span className="ai-news-admin-login-quick-count">{a.count}</span>
                </div>
              ))}
            </div>

            <div className="ai-news-admin-login-security-note">
              <Shield size={14} />
              <span>This portal uses 256-bit TLS, rate limiting, and session fingerprinting. All access attempts are logged.</span>
            </div>
          </div>
        </aside>

        {/* RIGHT */}
        <main className="ai-news-admin-login-right">
          <div className="ai-news-admin-login-form-container">

            {!forgotMode ? (
              <>
                <div className="ai-news-admin-login-form-header">
                  <div className="ai-news-admin-login-form-icon">
                    <LogIn size={30} />
                  </div>
                  <h2>Admin Sign In</h2>
                  <p>Secure access to the NewsAI administration portal</p>
                </div>

                {loginError && (
                  <div className="ai-news-admin-login-alert-error">
                    <AlertCircle size={15} />
                    <div>
                      <span>{loginError}</span>
                      {attemptsLeft !== null && (
                        <span className="ai-news-admin-login-attempts"> {attemptsLeft} attempt{attemptsLeft !== 1 ? 's' : ''} remaining before lockout.</span>
                      )}
                    </div>
                  </div>
                )}

                <form className="ai-news-admin-login-form" onSubmit={handleSubmit} noValidate>
                  <div className="ai-news-admin-login-field">
                    <label htmlFor="admin-login-email" className="ai-news-admin-login-label">
                      <Mail size={14} /> Admin Email
                    </label>
                    <input id="admin-login-email" type="email" name="email"
                      className={`ai-news-admin-login-input ${errors.email ? 'error' : ''}`}
                      placeholder="admin@newsai.com"
                      value={formData.email} onChange={handleChange} autoComplete="email" />
                    {errors.email && <span className="ai-news-admin-login-error">{errors.email}</span>}
                  </div>

                  <div className="ai-news-admin-login-field">
                    <label htmlFor="admin-login-password" className="ai-news-admin-login-label">
                      <Lock size={14} /> Password
                      <button type="button" className="ai-news-admin-login-forgot-inline"
                        onClick={() => setForgotMode(true)}>Forgot?</button>
                    </label>
                    <div className="ai-news-admin-login-password-wrap">
                      <input id="admin-login-password"
                        type={showPassword ? 'text' : 'password'} name="password"
                        className={`ai-news-admin-login-input ${errors.password ? 'error' : ''}`}
                        placeholder="Your admin password"
                        value={formData.password} onChange={handleChange} autoComplete="current-password" />
                      <button type="button" className="ai-news-admin-login-eye-btn" onClick={() => setShowPassword(p => !p)}>
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors.password && <span className="ai-news-admin-login-error">{errors.password}</span>}
                  </div>

                  {showMfaField && (
                    <div className="ai-news-admin-login-field">
                      <label htmlFor="admin-mfa" className="ai-news-admin-login-label">
                        <Key size={14} /> MFA Code
                      </label>
                      <input id="admin-mfa" type="text" name="mfaToken"
                        className="ai-news-admin-login-input ai-news-admin-login-mfa-input"
                        placeholder="6-digit authenticator code"
                        value={mfaToken} onChange={e => setMfaToken(e.target.value)}
                        maxLength={6} autoComplete="one-time-code" />
                      <span className="ai-news-admin-login-hint">Check your authenticator app (TOTP)</span>
                    </div>
                  )}

                  <label className="ai-news-admin-login-remember">
                    <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
                    <span className="ai-news-admin-login-custom-checkbox" />
                    <span>Keep me signed in (24 hours, this device only)</span>
                  </label>

                  <button type="submit" className="ai-news-admin-login-btn-primary" disabled={loading}>
                    {loading ? <span className="ai-news-admin-login-spinner" /> : <><Zap size={17} /> Access Portal</>}
                  </button>
                </form>

                <div className="ai-news-admin-login-divider"><span>Need access?</span></div>

                <div className="ai-news-admin-login-apply-prompt">
                  <p>Don't have an admin account? Apply with a valid access code issued by a super administrator.</p>
                  <Link to="/admin/signup" className="ai-news-admin-login-btn-outline">
                    Apply for Admin Access <ChevronRight size={15} />
                  </Link>
                </div>

                <div className="ai-news-admin-login-user-link">
                  Not an admin? <Link to="/user/login">Go to User Portal <ArrowRight size={13} /></Link>
                </div>

                <div className="ai-news-admin-login-role-chips">
                  {['Super Admin', 'Editor', 'Moderator', 'Analyst', 'Support'].map(r => (
                    <span key={r} className="ai-news-admin-login-role-chip">{r}</span>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="ai-news-admin-login-form-header">
                  <div className="ai-news-admin-login-form-icon">
                    <Lock size={30} />
                  </div>
                  <h2>Admin Password Reset</h2>
                  <p>Enter your registered admin email to receive a secure reset link</p>
                </div>

                <div className="ai-news-admin-login-forgot-warning">
                  <AlertTriangle size={15} />
                  <p>Password reset requests for admin accounts are logged and may trigger a security review.</p>
                </div>

                <form className="ai-news-admin-login-form" onSubmit={handleForgotPassword} noValidate>
                  <div className="ai-news-admin-login-field">
                    <label htmlFor="admin-forgot-email" className="ai-news-admin-login-label">
                      <Mail size={14} /> Admin Email Address
                    </label>
                    <input id="admin-forgot-email" type="email"
                      className="ai-news-admin-login-input"
                      placeholder="admin@newsai.com"
                      value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} autoComplete="email" />
                  </div>
                  <button type="submit" className="ai-news-admin-login-btn-primary" disabled={forgotLoading}>
                    {forgotLoading ? <span className="ai-news-admin-login-spinner" /> : <><ArrowRight size={17} /> Send Reset Link</>}
                  </button>
                  <button type="button" className="ai-news-admin-login-btn-ghost" onClick={() => setForgotMode(false)}>
                    ← Back to Admin Login
                  </button>
                </form>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLogin;