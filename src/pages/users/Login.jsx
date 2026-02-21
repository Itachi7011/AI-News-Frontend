import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
  Brain, Eye, EyeOff, Mail, Lock, ArrowRight, Zap,
  Shield, Globe, TrendingUp, Cpu, ChevronRight, Fingerprint,
  Rss, BookOpen, RefreshCw, AlertCircle
} from 'lucide-react';
import { ThemeContext } from '../../context/ThemeContext';

const RECENT_HEADLINES = [
  { tag: 'BREAKING', text: 'OpenAI releases GPT-5 with unprecedented reasoning capabilities' },
  { tag: 'RESEARCH', text: 'Google DeepMind achieves new milestone in protein structure prediction' },
  { tag: 'INDUSTRY', text: 'NVIDIA announces next-gen AI chips with 10x performance boost' },
  { tag: 'POLICY', text: 'EU AI Act enforcement begins — what it means for developers' },
  { tag: 'STARTUP', text: 'Anthropic raises $4B in Series D funding round' },
];

const FEATURES = [
  { icon: <Rss size={18} />, title: 'Live AI Feed', desc: '500+ sources tracked 24/7' },
  { icon: <Brain size={18} />, title: 'Smart Digest', desc: 'AI-summarized daily briefing' },
  { icon: <TrendingUp size={18} />, title: 'Trend Radar', desc: 'Spot emerging AI trends early' },
  { icon: <BookOpen size={18} />, title: 'Paper Tracker', desc: 'Latest research, simplified' },
];

const UserLogin = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const tickerRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState('');

  const [formData, setFormData] = useState({ email: '', password: '' });

  // Canvas neural network animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    const nodes = Array.from({ length: 40 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 3 + 1,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      pulse: Math.random() * Math.PI * 2,
    }));

    let animId;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      nodes.forEach(n => {
        n.x += n.dx; n.y += n.dy; n.pulse += 0.03;
        if (n.x < 0 || n.x > canvas.width) n.dx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.dy *= -1;
        const opacity = 0.3 + 0.2 * Math.sin(n.pulse);
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(56, 189, 248, ${opacity})`;
        ctx.fill();
      });
      nodes.forEach((a, i) => {
        nodes.slice(i + 1).forEach(b => {
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 120) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(56, 189, 248, ${0.08 * (1 - d / 120)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        });
      });
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
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password, rememberMe }),
        credentials: 'include',
      });
      const data = await res.json();

      if (res.ok) {
        if (rememberMe && data.token) localStorage.setItem('ai_news_user_token', data.token);
        await Swal.fire({
          icon: 'success',
          title: `Welcome back, ${data.user?.name?.split(' ')[0] || 'Reader'}! 👋`,
          text: 'Redirecting to your personalized feed...',
          timer: 1800,
          showConfirmButton: false,
          background: isDarkMode ? '#0f1623' : '#fff',
          color: isDarkMode ? '#e2e8f0' : '#1a1f2e',
        });
        navigate('/dashboard');
      } else {
        if (res.status === 423) {
          setLoginError('Account temporarily locked due to multiple failed attempts. Try again in 2 hours.');
        } else if (res.status === 403) {
          setLoginError('Your email address has not been verified. Please check your inbox.');
        } else {
          setLoginError(data.message || 'Invalid email or password. Please try again.');
        }
      }
    } catch {
      setLoginError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotLoading(true);
    try {
      const res = await fetch('/api/users/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      await Swal.fire({
        icon: 'success',
        title: 'Reset Email Sent',
        text: `If an account exists for ${forgotEmail}, you'll receive a password reset link shortly.`,
        background: isDarkMode ? '#0f1623' : '#fff',
        color: isDarkMode ? '#e2e8f0' : '#1a1f2e',
        confirmButtonColor: '#3b82f6',
      });
      setForgotMode(false);
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Unable to send reset email. Please try again.' });
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className={`ai-news-user-login-root ${isDarkMode ? 'dark' : 'light'}`}>
      <h1 className="ai-news-user-login-seo-title">
        Sign In to NewsAI | Your AI News Hub — Access Your Personalized Feed
      </h1>

      <canvas ref={canvasRef} className="ai-news-user-login-canvas" />
      <div className="ai-news-user-login-orb ai-news-user-login-orb-1" />
      <div className="ai-news-user-login-orb ai-news-user-login-orb-2" />

      <div className="ai-news-user-login-layout">
        {/* LEFT INFO PANEL */}
        <aside className="ai-news-user-login-left">
          <div className="ai-news-user-login-left-inner">
            <div className="ai-news-user-login-brand">
              <div className="ai-news-user-login-logo">
                <Brain size={28} />
                <span>News<strong>AI</strong></span>
              </div>
              <p className="ai-news-user-login-tagline">The Intelligence Behind AI News</p>
            </div>

            <div className="ai-news-user-login-hero">
              <h2>Your AI World,<br /><span className="ai-news-user-login-gradient-text">Perfectly Curated</span></h2>
              <p>
                Sign back in to access your personalized AI news feed, saved articles,
                reading history, and custom topic alerts. Thousands of new AI stories
                are added every day — don't miss a beat.
              </p>
            </div>

            {/* Live ticker */}
            <div className="ai-news-user-login-ticker-section">
              <div className="ai-news-user-login-ticker-header">
                <span className="ai-news-user-login-live-dot" />
                <span>Live Updates</span>
                <RefreshCw size={12} />
              </div>
              <div className="ai-news-user-login-ticker-wrap" ref={tickerRef}>
                <div className="ai-news-user-login-ticker-track">
                  {[...RECENT_HEADLINES, ...RECENT_HEADLINES].map((h, i) => (
                    <div key={i} className="ai-news-user-login-ticker-item">
                      <span className="ai-news-user-login-ticker-tag">{h.tag}</span>
                      <span className="ai-news-user-login-ticker-text">{h.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="ai-news-user-login-features">
              {FEATURES.map((f, i) => (
                <div key={i} className="ai-news-user-login-feature-card">
                  <div className="ai-news-user-login-feature-icon">{f.icon}</div>
                  <div>
                    <strong>{f.title}</strong>
                    <p>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="ai-news-user-login-security-badge">
              <Shield size={16} />
              <span>256-bit SSL encrypted • GDPR compliant • No data selling</span>
            </div>
          </div>
        </aside>

        {/* RIGHT FORM PANEL */}
        <main className="ai-news-user-login-right">
          <div className="ai-news-user-login-form-container">

            {!forgotMode ? (
              <>
                <div className="ai-news-user-login-form-header">
                  <div className="ai-news-user-login-form-icon">
                    <Fingerprint size={32} />
                  </div>
                  <h2>Welcome Back</h2>
                  <p>Sign in to your NewsAI account to continue your AI intelligence journey</p>
                </div>

                {loginError && (
                  <div className="ai-news-user-login-alert-error">
                    <AlertCircle size={16} />
                    <span>{loginError}</span>
                  </div>
                )}

                <form className="ai-news-user-login-form" onSubmit={handleSubmit} noValidate>
                  <div className="ai-news-user-login-field">
                    <label htmlFor="login-email" className="ai-news-user-login-label">
                      <Mail size={15} /> Email Address
                    </label>
                    <input
                      id="login-email" type="email" name="email"
                      className={`ai-news-user-login-input ${errors.email ? 'error' : ''}`}
                      placeholder="you@example.com"
                      value={formData.email} onChange={handleChange}
                      autoComplete="email"
                    />
                    {errors.email && <span className="ai-news-user-login-error">{errors.email}</span>}
                  </div>

                  <div className="ai-news-user-login-field">
                    <label htmlFor="login-password" className="ai-news-user-login-label">
                      <Lock size={15} /> Password
                      <button type="button" className="ai-news-user-login-forgot-inline"
                        onClick={() => setForgotMode(true)}>Forgot password?</button>
                    </label>
                    <div className="ai-news-user-login-password-wrap">
                      <input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        className={`ai-news-user-login-input ${errors.password ? 'error' : ''}`}
                        placeholder="Your password"
                        value={formData.password} onChange={handleChange}
                        autoComplete="current-password"
                      />
                      <button type="button" className="ai-news-user-login-eye-btn"
                        onClick={() => setShowPassword(p => !p)}>
                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                    {errors.password && <span className="ai-news-user-login-error">{errors.password}</span>}
                  </div>

                  <label className="ai-news-user-login-remember">
                    <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
                    <span className="ai-news-user-login-custom-checkbox" />
                    <span>Keep me signed in for 30 days</span>
                  </label>

                  <button type="submit" className="ai-news-user-login-btn-primary" disabled={loading}>
                    {loading ? <span className="ai-news-user-login-spinner" /> : <><Zap size={18} /> Sign In</>}
                  </button>
                </form>

                <div className="ai-news-user-login-divider"><span>New to NewsAI?</span></div>

                <div className="ai-news-user-login-signup-prompt">
                  <p>Join 2.4M+ AI enthusiasts getting smarter every day</p>
                  <Link to="/user/signup" className="ai-news-user-login-btn-outline">
                    Create Free Account <ChevronRight size={16} />
                  </Link>
                </div>

                <div className="ai-news-user-login-admin-link">
                  Are you an admin? <Link to="/admin/login">Admin Portal <ArrowRight size={13} /></Link>
                </div>

                <div className="ai-news-user-login-info-cards">
                  <div className="ai-news-user-login-info-card">
                    <Globe size={18} />
                    <div>
                      <strong>500+ Sources</strong>
                      <p>Curated globally, updated live</p>
                    </div>
                  </div>
                  <div className="ai-news-user-login-info-card">
                    <Cpu size={18} />
                    <div>
                      <strong>AI-Powered</strong>
                      <p>Smart summaries & categorization</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="ai-news-user-login-form-header">
                  <div className="ai-news-user-login-form-icon">
                    <Lock size={32} />
                  </div>
                  <h2>Reset Password</h2>
                  <p>Enter your email and we'll send you a secure link to reset your password</p>
                </div>
                <form className="ai-news-user-login-form" onSubmit={handleForgotPassword} noValidate>
                  <div className="ai-news-user-login-field">
                    <label htmlFor="forgot-email" className="ai-news-user-login-label">
                      <Mail size={15} /> Registered Email
                    </label>
                    <input
                      id="forgot-email" type="email"
                      className="ai-news-user-login-input"
                      placeholder="you@example.com"
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      autoComplete="email"
                    />
                  </div>
                  <button type="submit" className="ai-news-user-login-btn-primary" disabled={forgotLoading}>
                    {forgotLoading ? <span className="ai-news-user-login-spinner" /> : <><ArrowRight size={18} /> Send Reset Link</>}
                  </button>
                  <button type="button" className="ai-news-user-login-btn-ghost" onClick={() => setForgotMode(false)}>
                    ← Back to Sign In
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

export default UserLogin;