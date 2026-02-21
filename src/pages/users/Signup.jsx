import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
  Brain, Eye, EyeOff, Mail, Lock, User, ArrowRight, CheckCircle,
  Zap, Globe, TrendingUp, Shield, Sparkles, ChevronRight, Star,
  BookOpen, Cpu, BarChart3, Rss, Bell, Heart
} from 'lucide-react';
import { ThemeContext } from '../../context/ThemeContext';

const TOPICS = [
  'Machine Learning', 'Natural Language Processing', 'Computer Vision',
  'Robotics', 'Generative AI', 'Deep Learning', 'Reinforcement Learning',
  'AI Ethics', 'Neural Networks', 'Large Language Models', 'AI in Healthcare',
  'Autonomous Vehicles', 'AI Policy', 'Edge AI', 'Quantum AI'
];

const BENEFITS = [
  { icon: <Rss size={20} />, title: 'Curated AI News', desc: 'Hand-picked stories from 500+ sources' },
  { icon: <Brain size={20} />, title: 'Deep Analysis', desc: 'Expert breakdowns of complex AI research' },
  { icon: <TrendingUp size={20} />, title: 'Market Insights', desc: 'AI industry trends and investment signals' },
  { icon: <Bell size={20} />, title: 'Smart Alerts', desc: 'Real-time notifications on topics you follow' },
  { icon: <BookOpen size={20} />, title: 'Research Digest', desc: 'Weekly summaries of top AI papers' },
  { icon: <Globe size={20} />, title: 'Global Coverage', desc: 'AI news from every corner of the world' },
];

const STATS = [
  { value: '2.4M+', label: 'Active Readers' },
  { value: '500+', label: 'AI Sources' },
  { value: '10K+', label: 'Articles Monthly' },
  { value: '98%', label: 'Reader Satisfaction' },
];

const UserSignup = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    bio: '',
    preferredLanguage: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    preferences: {
      emailNotifications: { newArticles: true, comments: true, newsletter: false, mentions: true },
      uiPreferences: { theme: 'system', fontSize: 'medium', language: 'en' },
      readingPreferences: { topics: [] },
    },
    socialLinks: { twitter: '', linkedin: '', github: '', website: '' },
    agreeToTerms: false,
  });

  // Particle canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 0.5,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.5 + 0.2,
    }));

    let animId;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99, 179, 237, ${p.opacity})`;
        ctx.fill();
      });
      // draw connections
      particles.forEach((p, i) => {
        particles.slice(i + 1).forEach(q => {
          const dist = Math.hypot(p.x - q.x, p.y - q.y);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(99, 179, 237, ${0.12 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
      animId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const toggleTopic = (topic) => {
    setSelectedTopics(prev =>
      prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
    );
  };

  const validateStep1 = () => {
    const errs = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
    if (!formData.email.match(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/)) errs.email = 'Please enter a valid email';
    if (formData.password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    if (!formData.agreeToTerms) {
      Swal.fire({ icon: 'warning', title: 'Terms Required', text: 'Please agree to Terms & Privacy Policy', background: isDarkMode ? '#1a1f2e' : '#fff', color: isDarkMode ? '#e2e8f0' : '#1a1f2e' });
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2) setStep(3);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;
    setLoading(true);

    const payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      bio: formData.bio,
      preferredLanguage: formData.preferredLanguage,
      timezone: formData.timezone,
      preferences: {
        ...formData.preferences,
        readingPreferences: { topics: selectedTopics },
      },
      socialLinks: formData.socialLinks,
    };

    try {
      const res = await fetch('/api/users/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok) {
        await Swal.fire({
          icon: 'success',
          title: '🎉 Welcome to NewsAI!',
          text: 'Your account has been created. Please verify your email.',
          background: isDarkMode ? '#1a1f2e' : '#fff',
          color: isDarkMode ? '#e2e8f0' : '#1a1f2e',
          confirmButtonColor: '#3b82f6',
        });
        navigate('/user/login');
      } else {
        Swal.fire({ icon: 'error', title: 'Signup Failed', text: data.message || 'Something went wrong', background: isDarkMode ? '#1a1f2e' : '#fff', color: isDarkMode ? '#e2e8f0' : '#1a1f2e' });
      }
    } catch {
      Swal.fire({ icon: 'error', title: 'Network Error', text: 'Unable to connect. Please try again.', background: isDarkMode ? '#1a1f2e' : '#fff', color: isDarkMode ? '#e2e8f0' : '#1a1f2e' });
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = () => {
    const p = formData.password;
    if (!p) return { score: 0, label: '', color: '' };
    let score = 0;
    if (p.length >= 8) score++;
    if (p.length >= 12) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    const labels = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
    const colors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4'];
    return { score, label: labels[score], color: colors[score] };
  };

  const strength = passwordStrength();

  return (
    <div className={`ai-news-user-signup-root ${isDarkMode ? 'dark' : 'light'}`}>
      {/* SEO Meta-like hidden content */}
      <h1 className="ai-news-user-signup-seo-title">
        Join NewsAI – The Premier AI News Platform | Sign Up Free
      </h1>

      <canvas ref={canvasRef} className="ai-news-user-signup-canvas" />

      {/* Floating orbs */}
      <div className="ai-news-user-signup-orb ai-news-user-signup-orb-1" />
      <div className="ai-news-user-signup-orb ai-news-user-signup-orb-2" />
      <div className="ai-news-user-signup-orb ai-news-user-signup-orb-3" />

      <div className="ai-news-user-signup-layout">
        {/* LEFT PANEL */}
        <aside className="ai-news-user-signup-left">
          <div className="ai-news-user-signup-left-inner">
            <div className="ai-news-user-signup-brand">
              <div className="ai-news-user-signup-logo">
                <Brain size={28} />
                <span>News<strong>AI</strong></span>
              </div>
              <p className="ai-news-user-signup-tagline">
                The Intelligence Behind Your AI News
              </p>
            </div>

            <div className="ai-news-user-signup-hero-text">
              <h2>Stay Ahead of the<br /><span className="ai-news-user-signup-gradient-text">AI Revolution</span></h2>
              <p>
                Join over 2.4 million professionals, researchers, and enthusiasts who trust NewsAI
                for the most comprehensive, accurate, and insightful coverage of artificial intelligence
                across every domain — from breakthrough research papers to real-world deployment stories.
              </p>
            </div>

            <div className="ai-news-user-signup-stats">
              {STATS.map((s, i) => (
                <div key={i} className="ai-news-user-signup-stat-item">
                  <span className="ai-news-user-signup-stat-value">{s.value}</span>
                  <span className="ai-news-user-signup-stat-label">{s.label}</span>
                </div>
              ))}
            </div>

            <div className="ai-news-user-signup-benefits">
              <h3>Everything you get with NewsAI</h3>
              {BENEFITS.map((b, i) => (
                <div key={i} className="ai-news-user-signup-benefit-item">
                  <div className="ai-news-user-signup-benefit-icon">{b.icon}</div>
                  <div>
                    <strong>{b.title}</strong>
                    <p>{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="ai-news-user-signup-testimonial">
              <div className="ai-news-user-signup-stars">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
              </div>
              <blockquote>
                "NewsAI transformed how I consume AI news. The curation is unmatched — it's like having
                a personal AI research assistant filtering the noise for me every single day."
              </blockquote>
              <cite>— Dr. Sarah Chen, ML Research Lead at DeepMind</cite>
            </div>
          </div>
        </aside>

        {/* RIGHT PANEL - FORM */}
        <main className="ai-news-user-signup-right">
          <div className="ai-news-user-signup-form-container">

            {/* Step indicator */}
            <div className="ai-news-user-signup-steps">
              {[1, 2, 3].map(s => (
                <React.Fragment key={s}>
                  <div className={`ai-news-user-signup-step ${step >= s ? 'active' : ''} ${step > s ? 'done' : ''}`}>
                    {step > s ? <CheckCircle size={16} /> : s}
                  </div>
                  {s < 3 && <div className={`ai-news-user-signup-step-line ${step > s ? 'active' : ''}`} />}
                </React.Fragment>
              ))}
            </div>
            <div className="ai-news-user-signup-step-labels">
              <span>Account</span><span>Interests</span><span>Confirm</span>
            </div>

            <div className="ai-news-user-signup-form-header">
              {step === 1 && <><h2>Create Your Account</h2><p>Join the world's most trusted AI news platform</p></>}
              {step === 2 && <><h2>Personalize Your Feed</h2><p>Select your AI interests for a tailored experience</p></>}
              {step === 3 && <><h2>Final Details</h2><p>Complete your profile and confirm your preferences</p></>}
            </div>

            <form className="ai-news-user-signup-form" onSubmit={handleSubmit} noValidate>

              {/* STEP 1 */}
              {step === 1 && (
                <div className="ai-news-user-signup-step-content">
                  <div className="ai-news-user-signup-field">
                    <label htmlFor="signup-name" className="ai-news-user-signup-label">
                      <User size={15} /> Full Name
                    </label>
                    <input
                      id="signup-name" type="text" name="name"
                      className={`ai-news-user-signup-input ${errors.name ? 'error' : ''}`}
                      placeholder="e.g. Alex Johnson"
                      value={formData.name} onChange={handleChange}
                      autoComplete="name"
                    />
                    {errors.name && <span className="ai-news-user-signup-error">{errors.name}</span>}
                  </div>

                  <div className="ai-news-user-signup-field">
                    <label htmlFor="signup-email" className="ai-news-user-signup-label">
                      <Mail size={15} /> Email Address
                    </label>
                    <input
                      id="signup-email" type="email" name="email"
                      className={`ai-news-user-signup-input ${errors.email ? 'error' : ''}`}
                      placeholder="you@example.com"
                      value={formData.email} onChange={handleChange}
                      autoComplete="email"
                    />
                    {errors.email && <span className="ai-news-user-signup-error">{errors.email}</span>}
                  </div>

                  <div className="ai-news-user-signup-field">
                    <label htmlFor="signup-password" className="ai-news-user-signup-label">
                      <Lock size={15} /> Password
                    </label>
                    <div className="ai-news-user-signup-password-wrap">
                      <input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        className={`ai-news-user-signup-input ${errors.password ? 'error' : ''}`}
                        placeholder="Min. 8 characters"
                        value={formData.password} onChange={handleChange}
                        autoComplete="new-password"
                      />
                      <button type="button" className="ai-news-user-signup-eye-btn"
                        onClick={() => setShowPassword(p => !p)}>
                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                    {formData.password && (
                      <div className="ai-news-user-signup-strength">
                        <div className="ai-news-user-signup-strength-bars">
                          {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="ai-news-user-signup-strength-bar"
                              style={{ background: i <= strength.score ? strength.color : undefined }} />
                          ))}
                        </div>
                        <span style={{ color: strength.color }}>{strength.label}</span>
                      </div>
                    )}
                    {errors.password && <span className="ai-news-user-signup-error">{errors.password}</span>}
                  </div>

                  <div className="ai-news-user-signup-field">
                    <label htmlFor="signup-confirm" className="ai-news-user-signup-label">
                      <Lock size={15} /> Confirm Password
                    </label>
                    <div className="ai-news-user-signup-password-wrap">
                      <input
                        id="signup-confirm"
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        className={`ai-news-user-signup-input ${errors.confirmPassword ? 'error' : ''}`}
                        placeholder="Repeat your password"
                        value={formData.confirmPassword} onChange={handleChange}
                        autoComplete="new-password"
                      />
                      <button type="button" className="ai-news-user-signup-eye-btn"
                        onClick={() => setShowConfirmPassword(p => !p)}>
                        {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                    {errors.confirmPassword && <span className="ai-news-user-signup-error">{errors.confirmPassword}</span>}
                  </div>

                  <button type="button" className="ai-news-user-signup-btn-primary" onClick={handleNext}>
                    Continue <ArrowRight size={18} />
                  </button>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div className="ai-news-user-signup-step-content">
                  <p className="ai-news-user-signup-topics-desc">
                    Choose the AI domains you're most interested in. We'll use these to personalize
                    your news feed, recommendations, and weekly digest. You can always update these later.
                  </p>
                  <div className="ai-news-user-signup-topics-grid">
                    {TOPICS.map(topic => (
                      <button
                        key={topic} type="button"
                        className={`ai-news-user-signup-topic-chip ${selectedTopics.includes(topic) ? 'selected' : ''}`}
                        onClick={() => toggleTopic(topic)}
                      >
                        {selectedTopics.includes(topic) && <CheckCircle size={13} />}
                        {topic}
                      </button>
                    ))}
                  </div>
                  <div className="ai-news-user-signup-field" style={{ marginTop: '1.25rem' }}>
                    <label className="ai-news-user-signup-label"><User size={15} /> Short Bio (optional)</label>
                    <textarea
                      name="bio"
                      className="ai-news-user-signup-textarea"
                      placeholder="Tell the community a bit about yourself and your AI interests..."
                      value={formData.bio}
                      onChange={handleChange}
                      maxLength={500}
                      rows={3}
                    />
                    <span className="ai-news-user-signup-char-count">{formData.bio.length}/500</span>
                  </div>
                  <div className="ai-news-user-signup-btn-row">
                    <button type="button" className="ai-news-user-signup-btn-secondary" onClick={() => setStep(1)}>Back</button>
                    <button type="button" className="ai-news-user-signup-btn-primary" onClick={handleNext}>
                      Continue <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <div className="ai-news-user-signup-step-content">
                  <div className="ai-news-user-signup-prefs-section">
                    <h4><Bell size={16} /> Notification Preferences</h4>
                    <div className="ai-news-user-signup-toggles">
                      {[
                        { key: 'newArticles', label: 'New Articles', desc: 'Get notified about fresh AI stories' },
                        { key: 'comments', label: 'Comments', desc: 'Activity on your interactions' },
                        { key: 'newsletter', label: 'Newsletter', desc: 'Weekly AI digest in your inbox' },
                        { key: 'mentions', label: 'Mentions', desc: 'When others mention you' },
                      ].map(({ key, label, desc }) => (
                        <div key={key} className="ai-news-user-signup-toggle-row">
                          <div>
                            <span className="ai-news-user-signup-toggle-label">{label}</span>
                            <span className="ai-news-user-signup-toggle-desc">{desc}</span>
                          </div>
                          <label className="ai-news-user-signup-switch">
                            <input
                              type="checkbox"
                              checked={formData.preferences.emailNotifications[key]}
                              onChange={e => setFormData(prev => ({
                                ...prev,
                                preferences: {
                                  ...prev.preferences,
                                  emailNotifications: {
                                    ...prev.preferences.emailNotifications,
                                    [key]: e.target.checked
                                  }
                                }
                              }))}
                            />
                            <span className="ai-news-user-signup-slider" />
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="ai-news-user-signup-prefs-section">
                    <h4><Sparkles size={16} /> Display Preferences</h4>
                    <div className="ai-news-user-signup-select-row">
                      <div className="ai-news-user-signup-field">
                        <label className="ai-news-user-signup-label">Theme</label>
                        <select
                          className="ai-news-user-signup-select"
                          value={formData.preferences.uiPreferences.theme}
                          onChange={e => setFormData(prev => ({
                            ...prev,
                            preferences: { ...prev.preferences, uiPreferences: { ...prev.preferences.uiPreferences, theme: e.target.value } }
                          }))}
                        >
                          <option value="system">System Default</option>
                          <option value="light">Light Mode</option>
                          <option value="dark">Dark Mode</option>
                        </select>
                      </div>
                      <div className="ai-news-user-signup-field">
                        <label className="ai-news-user-signup-label">Font Size</label>
                        <select
                          className="ai-news-user-signup-select"
                          value={formData.preferences.uiPreferences.fontSize}
                          onChange={e => setFormData(prev => ({
                            ...prev,
                            preferences: { ...prev.preferences, uiPreferences: { ...prev.preferences.uiPreferences, fontSize: e.target.value } }
                          }))}
                        >
                          <option value="small">Small</option>
                          <option value="medium">Medium</option>
                          <option value="large">Large</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="ai-news-user-signup-terms-wrap">
                    <label className="ai-news-user-signup-checkbox-label">
                      <input type="checkbox" name="agreeToTerms" checked={formData.agreeToTerms} onChange={handleChange} />
                      <span className="ai-news-user-signup-custom-checkbox" />
                      I agree to NewsAI's <a href="/terms" target="_blank">Terms of Service</a> and <a href="/privacy" target="_blank">Privacy Policy</a>
                    </label>
                  </div>

                  <div className="ai-news-user-signup-btn-row">
                    <button type="button" className="ai-news-user-signup-btn-secondary" onClick={() => setStep(2)}>Back</button>
                    <button type="submit" className="ai-news-user-signup-btn-primary" disabled={loading}>
                      {loading ? (
                        <span className="ai-news-user-signup-spinner" />
                      ) : (
                        <><Zap size={18} /> Create Account</>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>

            <p className="ai-news-user-signup-login-link">
              Already have an account? <Link to="/user/login">Sign in <ChevronRight size={14} /></Link>
            </p>

            <div className="ai-news-user-signup-divider"><span>Why NewsAI?</span></div>
            <div className="ai-news-user-signup-bottom-features">
              <div className="ai-news-user-signup-feat"><Cpu size={16} /><span>AI-Powered Curation</span></div>
              <div className="ai-news-user-signup-feat"><Shield size={16} /><span>No Ads. Ever.</span></div>
              <div className="ai-news-user-signup-feat"><Heart size={16} /><span>Free Forever Plan</span></div>
              <div className="ai-news-user-signup-feat"><BarChart3 size={16} /><span>Reading Analytics</span></div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserSignup;