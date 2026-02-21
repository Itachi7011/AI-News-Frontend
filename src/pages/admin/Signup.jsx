import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
  Shield, Eye, EyeOff, Mail, Lock, User, ArrowRight, CheckCircle,
  Building2, Phone, Users, FileText, BarChart2, Settings,
  AlertTriangle, Zap, ChevronRight, Briefcase, Globe, Key
} from 'lucide-react';
import { ThemeContext } from '../../context/ThemeContext';

const DEPARTMENTS = ['content', 'user-management', 'technical', 'moderation', 'analytics', 'support'];
const ROLES = ['moderator', 'editor', 'analyst', 'support'];

const ROLE_DESCRIPTIONS = {
  moderator: { label: 'Moderator', icon: <Shield size={16} />, desc: 'Review flags, manage comments, enforce community guidelines', perms: ['View flags', 'Resolve flags', 'Manage comments'] },
  editor: { label: 'Editor', icon: <FileText size={16} />, desc: 'Create, edit, and publish AI news articles and manage categories', perms: ['Create articles', 'Publish articles', 'Feature content'] },
  analyst: { label: 'Analyst', icon: <BarChart2 size={16} />, desc: 'Access analytics, system logs, and generate performance reports', perms: ['View analytics', 'View logs', 'User data read'] },
  support: { label: 'Support', icon: <Users size={16} />, desc: 'Assist users with account issues, edit profiles, view flags', perms: ['View users', 'Edit users', 'View flags'] },
};

const CAPABILITIES = [
  { icon: <Shield size={18} />, title: 'Granular RBAC', desc: 'Role-based access control with 40+ individual permission flags' },
  { icon: <Key size={18} />, title: 'API Key Management', desc: 'Generate and revoke secure API keys for integrations' },
  { icon: <BarChart2 size={18} />, title: 'Admin Analytics', desc: 'Performance metrics, approval rates, and activity tracking' },
  { icon: <Settings size={18} />, title: 'MFA Enforced', desc: 'Multi-factor authentication required for all admin accounts' },
];

const AdminSignup = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    profile: {
      firstName: '',
      lastName: '',
      phone: '',
      department: 'content',
      position: '',
      bio: '',
      employeeId: '',
    },
    role: 'moderator',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    preferredLanguage: 'en',
    agreeToTerms: false,
    agreeToSecurityPolicy: false,
    accessCode: '',
  });

  // Grid mesh animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    let t = 0;
    let animId;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.008;

      const cols = 16, rows = 10;
      const cw = canvas.width / cols;
      const rh = canvas.height / rows;

      for (let i = 0; i <= cols; i++) {
        for (let j = 0; j <= rows; j++) {
          const wave = Math.sin(t + i * 0.4 + j * 0.3) * 4;
          const x = i * cw + wave;
          const y = j * rh + wave;
          const opacity = 0.06 + 0.04 * Math.sin(t + i + j);

          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(245, 158, 11, ${opacity})`;
          ctx.fill();

          if (i < cols) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            const nx = (i + 1) * cw + Math.sin(t + (i + 1) * 0.4 + j * 0.3) * 4;
            const ny = j * rh + Math.sin(t + (i + 1) + j * 0.3) * 4;
            ctx.lineTo(nx, ny);
            ctx.strokeStyle = `rgba(245, 158, 11, ${opacity * 0.6})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }

          if (j < rows) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            const bx = i * cw + Math.sin(t + i * 0.4 + (j + 1) * 0.3) * 4;
            const by = (j + 1) * rh + Math.sin(t + i + (j + 1)) * 4;
            ctx.lineTo(bx, by);
            ctx.strokeStyle = `rgba(245, 158, 11, ${opacity * 0.5})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('profile.')) {
      const key = name.replace('profile.', '');
      setFormData(prev => ({ ...prev, profile: { ...prev.profile, [key]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateStep1 = () => {
    const errs = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) errs.name = 'Full name required';
    if (!formData.email.match(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/)) errs.email = 'Valid email required';
    if (formData.password.length < 8) errs.password = 'Min. 8 characters';
    if (formData.password !== formData.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (!formData.accessCode.trim()) errs.accessCode = 'Admin access code is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs = {};
    if (!formData.profile.firstName.trim()) errs['profile.firstName'] = 'First name required';
    if (!formData.profile.lastName.trim()) errs['profile.lastName'] = 'Last name required';
    if (!formData.profile.position.trim()) errs['profile.position'] = 'Position/title required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep3 = () => {
    if (!formData.agreeToTerms || !formData.agreeToSecurityPolicy) {
      Swal.fire({ icon: 'warning', title: 'Acknowledgement Required', text: 'Please agree to all admin policies and terms.', background: isDarkMode ? '#0d0a1a' : '#fff', color: isDarkMode ? '#f5f3ff' : '#1a1230' });
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep3()) return;
    setLoading(true);

    const payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      profile: formData.profile,
      role: formData.role,
      timezone: formData.timezone,
      preferredLanguage: formData.preferredLanguage,
      accessCode: formData.accessCode,
    };

    try {
      const res = await fetch('/api/admin/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok) {
        await Swal.fire({
          icon: 'success',
          title: 'Admin Account Submitted',
          text: 'Your application is under review. You\'ll receive an approval email within 24 hours.',
          background: isDarkMode ? '#0d0a1a' : '#fff',
          color: isDarkMode ? '#f5f3ff' : '#1a1230',
          confirmButtonColor: '#f59e0b',
        });
        navigate('/admin/login');
      } else {
        Swal.fire({ icon: 'error', title: 'Submission Failed', text: data.message || 'Invalid access code or server error.', background: isDarkMode ? '#0d0a1a' : '#fff', color: isDarkMode ? '#f5f3ff' : '#1a1230', confirmButtonColor: '#f59e0b' });
      }
    } catch {
      Swal.fire({ icon: 'error', title: 'Network Error', text: 'Unable to reach the server. Please try again.', background: isDarkMode ? '#0d0a1a' : '#fff', color: isDarkMode ? '#f5f3ff' : '#1a1230' });
    } finally {
      setLoading(false);
    }
  };

  const pwStrength = () => {
    const p = formData.password;
    if (!p) return { score: 0, label: '', color: '' };
    let s = 0;
    if (p.length >= 8) s++;
    if (p.length >= 12) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return { score: s, label: ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'][s], color: ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4'][s] };
  };
  const strength = pwStrength();
  const roleInfo = ROLE_DESCRIPTIONS[formData.role];

  return (
    <div className={`ai-news-admin-signup-root ${isDarkMode ? 'dark' : 'light'}`}>
      <h1 className="ai-news-admin-signup-seo-title">
        NewsAI Admin Portal — Apply for Admin Access | Secure Onboarding
      </h1>

      <canvas ref={canvasRef} className="ai-news-admin-signup-canvas" />
      <div className="ai-news-admin-signup-orb ai-news-admin-signup-orb-1" />
      <div className="ai-news-admin-signup-orb ai-news-admin-signup-orb-2" />

      <div className="ai-news-admin-signup-layout">
        {/* LEFT */}
        <aside className="ai-news-admin-signup-left">
          <div className="ai-news-admin-signup-left-inner">
            <div className="ai-news-admin-signup-brand">
              <div className="ai-news-admin-signup-logo">
                <Shield size={26} />
                <span>News<strong>AI</strong> <em>Admin</em></span>
              </div>
              <span className="ai-news-admin-signup-badge">Restricted Access</span>
            </div>

            <div className="ai-news-admin-signup-hero">
              <h2>Join the<br /><span className="ai-news-admin-signup-gradient-text">Command Center</span></h2>
              <p>
                The NewsAI admin portal is the operational backbone of the world's largest AI news platform.
                As an admin, you'll have the tools and authority to shape content, moderate discourse,
                manage thousands of user accounts, and maintain editorial excellence across our platform.
              </p>
            </div>

            <div className="ai-news-admin-signup-warning">
              <AlertTriangle size={16} />
              <div>
                <strong>Restricted Application</strong>
                <p>Admin accounts require a valid access code issued by a super administrator. Unauthorized applications will be rejected and logged.</p>
              </div>
            </div>

            <div className="ai-news-admin-signup-capabilities">
              <h3>Admin Capabilities</h3>
              {CAPABILITIES.map((c, i) => (
                <div key={i} className="ai-news-admin-signup-capability-item">
                  <div className="ai-news-admin-signup-capability-icon">{c.icon}</div>
                  <div>
                    <strong>{c.title}</strong>
                    <p>{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="ai-news-admin-signup-role-preview">
              <h3>Selected Role Preview</h3>
              <div className="ai-news-admin-signup-role-card">
                <div className="ai-news-admin-signup-role-header">
                  {roleInfo.icon}
                  <strong>{roleInfo.label}</strong>
                </div>
                <p>{roleInfo.desc}</p>
                <div className="ai-news-admin-signup-role-perms">
                  {roleInfo.perms.map((p, i) => (
                    <span key={i} className="ai-news-admin-signup-perm-chip">
                      <CheckCircle size={11} /> {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="ai-news-admin-signup-security-note">
              <Shield size={14} />
              <span>All admin actions are audited and logged. MFA is mandatory within 24h of approval.</span>
            </div>
          </div>
        </aside>

        {/* RIGHT */}
        <main className="ai-news-admin-signup-right">
          <div className="ai-news-admin-signup-form-container">

            <div className="ai-news-admin-signup-steps">
              {[1, 2, 3].map(s => (
                <React.Fragment key={s}>
                  <div className={`ai-news-admin-signup-step ${step >= s ? 'active' : ''} ${step > s ? 'done' : ''}`}>
                    {step > s ? <CheckCircle size={15} /> : s}
                  </div>
                  {s < 3 && <div className={`ai-news-admin-signup-step-line ${step > s ? 'active' : ''}`} />}
                </React.Fragment>
              ))}
            </div>
            <div className="ai-news-admin-signup-step-labels">
              <span>Credentials</span><span>Profile</span><span>Review</span>
            </div>

            <div className="ai-news-admin-signup-form-header">
              {step === 1 && <><h2>Create Admin Account</h2><p>Enter your credentials and admin access code</p></>}
              {step === 2 && <><h2>Admin Profile</h2><p>Your professional details and role selection</p></>}
              {step === 3 && <><h2>Review & Submit</h2><p>Confirm your details and agree to policies</p></>}
            </div>

            <form className="ai-news-admin-signup-form" onSubmit={handleSubmit} noValidate>

              {/* STEP 1 */}
              {step === 1 && (
                <div className="ai-news-admin-signup-step-content">
                  <div className="ai-news-admin-signup-field">
                    <label htmlFor="admin-signup-name" className="ai-news-admin-signup-label"><User size={14} /> Full Name</label>
                    <input id="admin-signup-name" type="text" name="name"
                      className={`ai-news-admin-signup-input ${errors.name ? 'error' : ''}`}
                      placeholder="Your legal full name"
                      value={formData.name} onChange={handleChange} autoComplete="name" />
                    {errors.name && <span className="ai-news-admin-signup-error">{errors.name}</span>}
                  </div>

                  <div className="ai-news-admin-signup-field">
                    <label htmlFor="admin-signup-email" className="ai-news-admin-signup-label"><Mail size={14} /> Work Email</label>
                    <input id="admin-signup-email" type="email" name="email"
                      className={`ai-news-admin-signup-input ${errors.email ? 'error' : ''}`}
                      placeholder="admin@newsai.com"
                      value={formData.email} onChange={handleChange} autoComplete="email" />
                    {errors.email && <span className="ai-news-admin-signup-error">{errors.email}</span>}
                  </div>

                  <div className="ai-news-admin-signup-field">
                    <label htmlFor="admin-signup-access-code" className="ai-news-admin-signup-label">
                      <Key size={14} /> Admin Access Code
                    </label>
                    <input id="admin-signup-access-code" type="text" name="accessCode"
                      className={`ai-news-admin-signup-input ${errors.accessCode ? 'error' : ''}`}
                      placeholder="Enter your issued access code"
                      value={formData.accessCode} onChange={handleChange} autoComplete="off" />
                    {errors.accessCode && <span className="ai-news-admin-signup-error">{errors.accessCode}</span>}
                    <span className="ai-news-admin-signup-hint">Obtained from a super administrator</span>
                  </div>

                  <div className="ai-news-admin-signup-field">
                    <label htmlFor="admin-signup-password" className="ai-news-admin-signup-label"><Lock size={14} /> Password</label>
                    <div className="ai-news-admin-signup-password-wrap">
                      <input id="admin-signup-password"
                        type={showPassword ? 'text' : 'password'} name="password"
                        className={`ai-news-admin-signup-input ${errors.password ? 'error' : ''}`}
                        placeholder="Strong password required"
                        value={formData.password} onChange={handleChange} autoComplete="new-password" />
                      <button type="button" className="ai-news-admin-signup-eye-btn" onClick={() => setShowPassword(p => !p)}>
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {formData.password && (
                      <div className="ai-news-admin-signup-strength">
                        <div className="ai-news-admin-signup-strength-bars">
                          {[1,2,3,4,5].map(i => (
                            <div key={i} className="ai-news-admin-signup-strength-bar"
                              style={{ background: i <= strength.score ? strength.color : undefined }} />
                          ))}
                        </div>
                        <span style={{ color: strength.color }}>{strength.label}</span>
                      </div>
                    )}
                    {errors.password && <span className="ai-news-admin-signup-error">{errors.password}</span>}
                  </div>

                  <div className="ai-news-admin-signup-field">
                    <label htmlFor="admin-signup-confirm" className="ai-news-admin-signup-label"><Lock size={14} /> Confirm Password</label>
                    <div className="ai-news-admin-signup-password-wrap">
                      <input id="admin-signup-confirm"
                        type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword"
                        className={`ai-news-admin-signup-input ${errors.confirmPassword ? 'error' : ''}`}
                        placeholder="Repeat password"
                        value={formData.confirmPassword} onChange={handleChange} autoComplete="new-password" />
                      <button type="button" className="ai-news-admin-signup-eye-btn" onClick={() => setShowConfirmPassword(p => !p)}>
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors.confirmPassword && <span className="ai-news-admin-signup-error">{errors.confirmPassword}</span>}
                  </div>

                  <button type="button" className="ai-news-admin-signup-btn-primary" onClick={handleNext}>
                    Continue <ArrowRight size={17} />
                  </button>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div className="ai-news-admin-signup-step-content">
                  <div className="ai-news-admin-signup-two-col">
                    <div className="ai-news-admin-signup-field">
                      <label className="ai-news-admin-signup-label"><User size={14} /> First Name</label>
                      <input type="text" name="profile.firstName"
                        className={`ai-news-admin-signup-input ${errors['profile.firstName'] ? 'error' : ''}`}
                        placeholder="First name"
                        value={formData.profile.firstName} onChange={handleChange} />
                      {errors['profile.firstName'] && <span className="ai-news-admin-signup-error">{errors['profile.firstName']}</span>}
                    </div>
                    <div className="ai-news-admin-signup-field">
                      <label className="ai-news-admin-signup-label"><User size={14} /> Last Name</label>
                      <input type="text" name="profile.lastName"
                        className={`ai-news-admin-signup-input ${errors['profile.lastName'] ? 'error' : ''}`}
                        placeholder="Last name"
                        value={formData.profile.lastName} onChange={handleChange} />
                      {errors['profile.lastName'] && <span className="ai-news-admin-signup-error">{errors['profile.lastName']}</span>}
                    </div>
                  </div>

                  <div className="ai-news-admin-signup-field">
                    <label className="ai-news-admin-signup-label"><Briefcase size={14} /> Position / Job Title</label>
                    <input type="text" name="profile.position"
                      className={`ai-news-admin-signup-input ${errors['profile.position'] ? 'error' : ''}`}
                      placeholder="e.g. Senior Content Editor"
                      value={formData.profile.position} onChange={handleChange} />
                    {errors['profile.position'] && <span className="ai-news-admin-signup-error">{errors['profile.position']}</span>}
                  </div>

                  <div className="ai-news-admin-signup-two-col">
                    <div className="ai-news-admin-signup-field">
                      <label className="ai-news-admin-signup-label"><Building2 size={14} /> Department</label>
                      <select name="profile.department" className="ai-news-admin-signup-select"
                        value={formData.profile.department} onChange={handleChange}>
                        {DEPARTMENTS.map(d => <option key={d} value={d}>{d.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
                      </select>
                    </div>
                    <div className="ai-news-admin-signup-field">
                      <label className="ai-news-admin-signup-label"><Phone size={14} /> Phone (optional)</label>
                      <input type="tel" name="profile.phone"
                        className="ai-news-admin-signup-input"
                        placeholder="+1 (000) 000-0000"
                        value={formData.profile.phone} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="ai-news-admin-signup-field">
                    <label className="ai-news-admin-signup-label"><Globe size={14} /> Employee ID (optional)</label>
                    <input type="text" name="profile.employeeId"
                      className="ai-news-admin-signup-input"
                      placeholder="Your organization employee ID"
                      value={formData.profile.employeeId} onChange={handleChange} />
                  </div>

                  <div className="ai-news-admin-signup-field">
                    <label className="ai-news-admin-signup-label">Requested Role</label>
                    <div className="ai-news-admin-signup-roles-grid">
                      {ROLES.map(r => {
                        const ri = ROLE_DESCRIPTIONS[r];
                        return (
                          <label key={r} className={`ai-news-admin-signup-role-option ${formData.role === r ? 'selected' : ''}`}>
                            <input type="radio" name="role" value={r}
                              checked={formData.role === r} onChange={handleChange} />
                            <div className="ai-news-admin-signup-role-opt-icon">{ri.icon}</div>
                            <div>
                              <strong>{ri.label}</strong>
                              <p>{ri.desc.substring(0, 45)}...</p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="ai-news-admin-signup-btn-row">
                    <button type="button" className="ai-news-admin-signup-btn-secondary" onClick={() => setStep(1)}>Back</button>
                    <button type="button" className="ai-news-admin-signup-btn-primary" onClick={handleNext}>
                      Continue <ArrowRight size={17} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <div className="ai-news-admin-signup-step-content">
                  <div className="ai-news-admin-signup-review-card">
                    <h4>Account Summary</h4>
                    <div className="ai-news-admin-signup-review-grid">
                      <div><span>Name</span><strong>{formData.name}</strong></div>
                      <div><span>Email</span><strong>{formData.email}</strong></div>
                      <div><span>Role</span><strong>{ROLE_DESCRIPTIONS[formData.role]?.label}</strong></div>
                      <div><span>Department</span><strong>{formData.profile.department?.replace('-', ' ')}</strong></div>
                      <div><span>Position</span><strong>{formData.profile.position || '—'}</strong></div>
                      <div><span>Employee ID</span><strong>{formData.profile.employeeId || '—'}</strong></div>
                    </div>
                  </div>

                  <div className="ai-news-admin-signup-policies">
                    <label className="ai-news-admin-signup-checkbox-label">
                      <input type="checkbox" name="agreeToTerms" checked={formData.agreeToTerms} onChange={handleChange} />
                      <span className="ai-news-admin-signup-custom-checkbox" />
                      I agree to NewsAI's <a href="/terms" target="_blank">Admin Terms of Service</a> and <a href="/privacy" target="_blank">Privacy Policy</a>
                    </label>
                    <label className="ai-news-admin-signup-checkbox-label">
                      <input type="checkbox" name="agreeToSecurityPolicy" checked={formData.agreeToSecurityPolicy} onChange={handleChange} />
                      <span className="ai-news-admin-signup-custom-checkbox" />
                      I acknowledge the <a href="/security-policy" target="_blank">Security & Data Handling Policy</a> and understand all admin actions are logged and audited
                    </label>
                  </div>

                  <div className="ai-news-admin-signup-final-note">
                    <AlertTriangle size={15} />
                    <p>Your account will be in <strong>pending_approval</strong> status until verified by a super admin. You'll receive an email notification upon approval.</p>
                  </div>

                  <div className="ai-news-admin-signup-btn-row">
                    <button type="button" className="ai-news-admin-signup-btn-secondary" onClick={() => setStep(2)}>Back</button>
                    <button type="submit" className="ai-news-admin-signup-btn-primary" disabled={loading}>
                      {loading ? <span className="ai-news-admin-signup-spinner" /> : <><Zap size={17} /> Submit Application</>}
                    </button>
                  </div>
                </div>
              )}
            </form>

            <p className="ai-news-admin-signup-login-link">
              Already have an admin account? <Link to="/admin/login">Admin Sign In <ChevronRight size={13} /></Link>
            </p>
            <p className="ai-news-admin-signup-user-link">
              Looking for the user portal? <Link to="/user/signup">User Signup <ChevronRight size={13} /></Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminSignup;