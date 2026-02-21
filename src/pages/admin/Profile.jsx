import React, { useState, useContext, useEffect, useRef, useCallback } from 'react';
import Swal from 'sweetalert2';
import {
  Shield, Eye, EyeOff, Mail, Lock, User, Edit3, Save,
  Camera, X, Check, CheckCircle, AlertTriangle, Info,
  Building2, Phone, Briefcase, Key, Activity, BarChart2,
  Users, FileText, Settings, RefreshCw, Trash2, Plus,
  Clock, AlertCircle, Star, Globe, ChevronRight, Zap,
  TrendingUp, LogOut, Download, Bell, Award, Calendar
} from 'lucide-react';
import { ThemeContext } from '../../context/ThemeContext';

/* ── helpers ──────────────────────────────────────────────── */
const val = (v, fallback = 'Not entered yet') =>
  v !== undefined && v !== null && v !== '' ? v : fallback;

const Tip = ({ text, children }) => {
  const [show, setShow] = useState(false);
  return (
    <span className="ai-news-profile-main-tip-wrap"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}>
      {children}
      {show && <span className="ai-news-profile-main-tooltip">{text}</span>}
    </span>
  );
};

const ADMIN_TABS = [
  { id: 'overview',      label: 'Overview',       icon: <User size={16} /> },
  { id: 'edit',          label: 'Edit Profile',   icon: <Edit3 size={16} /> },
  { id: 'security',      label: 'Security',        icon: <Shield size={16} /> },
  { id: 'permissions',   label: 'Permissions',    icon: <Key size={16} /> },
  { id: 'performance',   label: 'Performance',    icon: <BarChart2 size={16} /> },
  { id: 'tasks',         label: 'Tasks',           icon: <CheckCircle size={16} /> },
];

const PERM_GROUPS = {
  users:      { label: 'User Management',   icon: <Users size={14} /> },
  articles:   { label: 'Article Control',   icon: <FileText size={14} /> },
  moderation: { label: 'Moderation',        icon: <Shield size={14} /> },
  admins:     { label: 'Admin Management',  icon: <Award size={14} /> },
  system:     { label: 'System Access',     icon: <Settings size={14} /> },
  categories: { label: 'Categories',        icon: <Globe size={14} /> },
};

/* ══════════════════════════════════════════════════════════════
   ADMIN PROFILE
══════════════════════════════════════════════════════════════ */
const AdminProfile = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef(null);

  /* forms */
  const [editForm, setEditForm] = useState({});
  const [profileForm, setProfileForm] = useState({});
  const [notifForm, setNotifForm] = useState({});

  /* security */
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [pwStrength, setPwStrength] = useState(0);

  /* task form */
  const [newTask, setNewTask] = useState({ title: '', type: 'review', priority: 'medium', description: '' });
  const [showTaskForm, setShowTaskForm] = useState(false);

  /* ── fetch ──────────────────────────────────────────────── */
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/profile', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      const a = data.admin || data;
      setProfile(a);
      setEditForm({ name: a.name || '', timezone: a.timezone || '', preferredLanguage: a.preferredLanguage || 'en' });
      setProfileForm({ firstName: a.profile?.firstName || '', lastName: a.profile?.lastName || '', phone: a.profile?.phone || '', position: a.profile?.position || '', department: a.profile?.department || 'content', bio: a.profile?.bio || '', employeeId: a.profile?.employeeId || '' });
      setNotifForm(a.notificationPreferences?.email || {});
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load admin profile.', background: isDarkMode ? '#0a0806' : '#fff', color: isDarkMode ? '#fef3e2' : '#1a1006' });
    } finally {
      setLoading(false);
    }
  }, [isDarkMode]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  /* pw strength */
  useEffect(() => {
    const p = pwForm.newPassword;
    let s = 0;
    if (p.length >= 8) s++;
    if (p.length >= 12) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    setPwStrength(s);
  }, [pwForm.newPassword]);

  /* ── save profile ───────────────────────────────────────── */
  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...editForm, profile: profileForm }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setProfile(data.admin || data);
      Swal.fire({ icon: 'success', title: 'Profile Updated!', timer: 1800, showConfirmButton: false, background: isDarkMode ? '#0a0806' : '#fff', color: isDarkMode ? '#fef3e2' : '#1a1006' });
    } catch {
      Swal.fire({ icon: 'error', title: 'Save Failed', text: 'Could not save profile.', background: isDarkMode ? '#0a0806' : '#fff' });
    } finally {
      setSaving(false);
    }
  };

  /* ── avatar ─────────────────────────────────────────────── */
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({ icon: 'warning', title: 'File Too Large', text: 'Max 5MB.', background: isDarkMode ? '#0a0806' : '#fff' });
      return;
    }
    setAvatarUploading(true);
    const fd = new FormData();
    fd.append('avatar', file);
    try {
      const res = await fetch('/api/admin/avatar', { method: 'POST', body: fd, credentials: 'include' });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setProfile(p => ({ ...p, profile: { ...p.profile, avatar: data.avatar } }));
      Swal.fire({ icon: 'success', title: 'Avatar Updated!', timer: 1500, showConfirmButton: false, background: isDarkMode ? '#0a0806' : '#fff' });
    } catch {
      Swal.fire({ icon: 'error', title: 'Upload Failed', text: 'Could not upload avatar.', background: isDarkMode ? '#0a0806' : '#fff' });
    } finally {
      setAvatarUploading(false);
    }
  };

  /* ── change password ────────────────────────────────────── */
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      Swal.fire({ icon: 'warning', title: 'Mismatch', text: 'Passwords do not match.', background: isDarkMode ? '#0a0806' : '#fff' });
      return;
    }
    if (pwStrength < 3) {
      Swal.fire({ icon: 'warning', title: 'Weak Password', text: 'Please choose a stronger password.', background: isDarkMode ? '#0a0806' : '#fff' });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Failed');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      Swal.fire({ icon: 'success', title: 'Password Changed!', text: 'Secure your new password carefully.', background: isDarkMode ? '#0a0806' : '#fff', confirmButtonColor: '#f59e0b' });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Failed', text: err.message || 'Incorrect current password.', background: isDarkMode ? '#0a0806' : '#fff' });
    } finally {
      setSaving(false);
    }
  };

  /* ── save notifications ─────────────────────────────────── */
  const saveNotifications = async () => {
    setSaving(true);
    try {
      await fetch('/api/admin/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: notifForm }),
      });
      Swal.fire({ icon: 'success', title: 'Notifications Saved!', timer: 1500, showConfirmButton: false, background: isDarkMode ? '#0a0806' : '#fff' });
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Could not save notification preferences.', background: isDarkMode ? '#0a0806' : '#fff' });
    } finally {
      setSaving(false);
    }
  };

  /* ── generate API key ───────────────────────────────────── */
  const generateApiKey = async () => {
    const { value: keyName } = await Swal.fire({
      title: 'Generate API Key',
      input: 'text',
      inputPlaceholder: 'Key name (e.g. automation-bot)',
      showCancelButton: true,
      confirmButtonText: 'Generate',
      confirmButtonColor: '#f59e0b',
      background: isDarkMode ? '#0a0806' : '#fff',
      color: isDarkMode ? '#fef3e2' : '#1a1006',
    });
    if (!keyName) return;
    try {
      const res = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: keyName }),
      });
      const data = await res.json();
      Swal.fire({
        icon: 'success',
        title: 'API Key Generated',
        html: `<code style="word-break:break-all;font-size:0.8rem;background:#1c1610;padding:0.5rem;border-radius:6px;display:block;">${data.key}</code><p style="font-size:0.8rem;margin-top:0.75rem;color:#f97316">⚠ Copy this key now — it won't be shown again.</p>`,
        confirmButtonColor: '#f59e0b',
        background: isDarkMode ? '#0a0806' : '#fff',
        color: isDarkMode ? '#fef3e2' : '#1a1006',
      });
      fetchProfile();
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Could not generate API key.', background: isDarkMode ? '#0a0806' : '#fff' });
    }
  };

  /* ── revoke API key ─────────────────────────────────────── */
  const revokeApiKey = async (keyId) => {
    const res = await Swal.fire({
      icon: 'warning', title: 'Revoke API Key?', text: 'This will immediately invalidate the key.',
      showCancelButton: true, confirmButtonText: 'Revoke', confirmButtonColor: '#ef4444',
      background: isDarkMode ? '#0a0806' : '#fff', color: isDarkMode ? '#fef3e2' : '#1a1006',
    });
    if (!res.isConfirmed) return;
    try {
      await fetch(`/api/admin/api-keys/${keyId}`, { method: 'DELETE', credentials: 'include' });
      setProfile(p => ({ ...p, apiKeys: p.apiKeys.map(k => k.keyId === keyId ? { ...k, isActive: false } : k) }));
      Swal.fire({ icon: 'success', title: 'Key Revoked', timer: 1500, showConfirmButton: false, background: isDarkMode ? '#0a0806' : '#fff' });
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Could not revoke key.', background: isDarkMode ? '#0a0806' : '#fff' });
    }
  };

  /* ── end all sessions ───────────────────────────────────── */
  const endAllSessions = async () => {
    const res = await Swal.fire({
      icon: 'warning', title: 'End All Sessions?', text: 'You will be logged out on all devices.',
      showCancelButton: true, confirmButtonText: 'End All', confirmButtonColor: '#ef4444',
      background: isDarkMode ? '#0a0806' : '#fff',
    });
    if (!res.isConfirmed) return;
    try {
      await fetch('/api/admin/sessions', { method: 'DELETE', credentials: 'include' });
      Swal.fire({ icon: 'success', title: 'All Sessions Ended', timer: 1800, showConfirmButton: false, background: isDarkMode ? '#0a0806' : '#fff' });
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Could not end sessions.', background: isDarkMode ? '#0a0806' : '#fff' });
    }
  };

  /* ── add task ───────────────────────────────────────────── */
  const addTask = async () => {
    if (!newTask.title.trim()) return;
    try {
      const res = await fetch('/api/admin/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newTask),
      });
      const data = await res.json();
      setProfile(p => ({ ...p, tasks: [data.task || data, ...(p.tasks || [])] }));
      setNewTask({ title: '', type: 'review', priority: 'medium', description: '' });
      setShowTaskForm(false);
      Swal.fire({ icon: 'success', title: 'Task Added!', timer: 1500, showConfirmButton: false, background: isDarkMode ? '#0a0806' : '#fff' });
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Could not add task.', background: isDarkMode ? '#0a0806' : '#fff' });
    }
  };

  /* ── update task status ─────────────────────────────────── */
  const updateTaskStatus = async (taskId, status) => {
    try {
      await fetch(`/api/admin/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      setProfile(p => ({ ...p, tasks: p.tasks.map(t => String(t.taskId) === String(taskId) ? { ...t, status } : t) }));
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Could not update task.', background: isDarkMode ? '#0a0806' : '#fff' });
    }
  };

  if (loading) {
    return (
      <div className={`ai-news-profile-main-loader-screen ${isDarkMode ? 'dark' : 'light'} admin`}>
        <div className="ai-news-profile-main-loader-ring admin-ring" />
        <span>Loading admin profile…</span>
      </div>
    );
  }

  const a = profile || {};
  const pr = a.profile || {};
  const perf = a.performance || {};
  const strengthLabels = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  const strengthColors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4'];

  /* ══════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════ */
  return (
    <div className={`ai-news-profile-main-root admin ${isDarkMode ? 'dark' : 'light'}`}>
      <h1 className="ai-news-profile-main-seo-h1">
        {val(a.name, 'Admin')} — Admin Profile | NewsAI Command Center
      </h1>

      {/* ── ADMIN HERO ──────────────────────────────────── */}
      <header className="ai-news-profile-main-hero admin-hero">
        <div className="ai-news-profile-main-hero-bg admin-hero-bg" />
        <div className="ai-news-profile-main-hero-content">
          {/* Avatar */}
          <div className="ai-news-profile-main-avatar-wrap">
            <div className="ai-news-profile-main-avatar-ring admin-ring-border">
              {pr.avatar?.url
                ? <img src={pr.avatar.url} alt={a.name} className="ai-news-profile-main-avatar-img" />
                : <div className="ai-news-profile-main-avatar-placeholder admin-avatar-placeholder">
                    {(a.name || 'A').charAt(0).toUpperCase()}
                  </div>
              }
              {avatarUploading && <div className="ai-news-profile-main-avatar-overlay"><div className="ai-news-profile-main-loader-ring small admin-ring" /></div>}
            </div>
            <Tip text="Upload admin avatar (max 5MB)">
              <button className="ai-news-profile-main-avatar-edit-btn admin-avatar-btn" onClick={() => fileInputRef.current?.click()}>
                <Camera size={14} />
              </button>
            </Tip>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
          </div>

          {/* Info */}
          <div className="ai-news-profile-main-hero-info">
            <div className="ai-news-profile-main-hero-name-row">
              <span className="ai-news-profile-main-hero-name">{val(a.name, 'Admin User')}</span>
              {a.emailVerified && <Tip text="Email verified"><span className="ai-news-profile-main-verified-badge admin-verified"><Check size={11} /> Verified</span></Tip>}
              <span className={`ai-news-profile-main-role-badge role-admin-${a.role || 'moderator'}`}>
                <Shield size={11} /> {val(a.role, 'moderator').replace('_', ' ')}
              </span>
              <span className={`ai-news-profile-main-status-badge status-${a.status || 'pending'}`}>{val(a.status, 'pending')}</span>
            </div>
            <span className="ai-news-profile-main-hero-email"><Mail size={13} /> {val(a.email)}</span>
            {pr.bio && <p className="ai-news-profile-main-hero-bio">{pr.bio}</p>}

            <div className="ai-news-profile-main-hero-meta">
              {pr.department && <span><Building2 size={12} /> {pr.department.replace('-', ' ')}</span>}
              {pr.position && <span><Briefcase size={12} /> {pr.position}</span>}
              {pr.employeeId && <span><Award size={12} /> ID: {pr.employeeId}</span>}
              {pr.phone && <span><Phone size={12} /> {pr.phone}</span>}
              {a.lastLogin && <span><Clock size={12} /> Last login {new Date(a.lastLogin).toLocaleDateString()}</span>}
            </div>
          </div>

          {/* Performance quick stats */}
          <div className="ai-news-profile-main-hero-stats admin-stats">
            <div className="ai-news-profile-main-stat"><strong>{val(perf.articlesReviewed, 0)}</strong><span>Reviewed</span></div>
            <div className="ai-news-profile-main-stat"><strong>{val(perf.articlesPublished, 0)}</strong><span>Published</span></div>
            <div className="ai-news-profile-main-stat"><strong>{val(perf.flagsResolved, 0)}</strong><span>Flags Resolved</span></div>
            <div className="ai-news-profile-main-stat"><strong>{perf.approvalRate != null ? `${perf.approvalRate}%` : '—'}</strong><span>Approval Rate</span></div>
          </div>
        </div>
      </header>

      {/* ── TABS ────────────────────────────────────────── */}
      <nav className="ai-news-profile-main-tabs-nav admin-tabs" role="tablist">
        {ADMIN_TABS.map(t => (
          <button key={t.id} role="tab" aria-selected={activeTab === t.id}
            className={`ai-news-profile-main-tab-btn admin-tab-btn ${activeTab === t.id ? 'active admin-active' : ''}`}
            onClick={() => setActiveTab(t.id)}>
            {t.icon} <span>{t.label}</span>
          </button>
        ))}
      </nav>

      {/* ── TAB CONTENT ─────────────────────────────────── */}
      <main className="ai-news-profile-main-tab-content" role="tabpanel">

        {/* ══ OVERVIEW ══ */}
        {activeTab === 'overview' && (
          <div className="ai-news-profile-main-section-grid">
            <div className="ai-news-profile-main-card">
              <div className="ai-news-profile-main-card-header"><User size={17} /><span>Personal Details</span></div>
              <div className="ai-news-profile-main-info-list">
                {[
                  ['Full Name', val(a.name)],
                  ['First Name', val(pr.firstName)],
                  ['Last Name', val(pr.lastName)],
                  ['Email', val(a.email)],
                  ['Phone', val(pr.phone)],
                  ['Department', val(pr.department)?.replace('-', ' ')],
                  ['Position', val(pr.position)],
                  ['Employee ID', val(pr.employeeId)],
                  ['Timezone', val(a.timezone)],
                  ['Language', val(a.preferredLanguage)],
                  ['Status', val(a.status)],
                  ['Role', val(a.role)?.replace('_', ' ')],
                  ['Account Created', a.createdAt ? new Date(a.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Not entered yet'],
                  ['Last Active', perf.lastActive ? new Date(perf.lastActive).toLocaleDateString() : 'Not entered yet'],
                ].map(([label, value]) => (
                  <div key={label} className="ai-news-profile-main-info-row">
                    <span className="ai-news-profile-main-info-label">{label}</span>
                    <span className="ai-news-profile-main-info-value capitalize">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="ai-news-profile-main-card">
              <div className="ai-news-profile-main-card-header"><Activity size={17} /><span>Activity Summary</span>
                <Tip text="Aggregated login and action data"><Info size={13} className="ai-news-profile-main-tip-icon" /></Tip>
              </div>
              <div className="ai-news-profile-main-stats-grid-2">
                <div className="ai-news-profile-main-stat-card-2 admin"><Activity size={18} /><div><strong>{a.activitySummary?.last7Days?.logins ?? 0}</strong><p>Logins (7d)</p></div></div>
                <div className="ai-news-profile-main-stat-card-2 admin"><Zap size={18} /><div><strong>{a.activitySummary?.last7Days?.actions ?? 0}</strong><p>Actions (7d)</p></div></div>
                <div className="ai-news-profile-main-stat-card-2 admin"><TrendingUp size={18} /><div><strong>{a.activitySummary?.last30Days?.logins ?? 0}</strong><p>Logins (30d)</p></div></div>
                <div className="ai-news-profile-main-stat-card-2 admin"><BarChart2 size={18} /><div><strong>{a.activitySummary?.last30Days?.actions ?? 0}</strong><p>Actions (30d)</p></div></div>
              </div>
            </div>

            {/* MFA Status */}
            <div className="ai-news-profile-main-card">
              <div className="ai-news-profile-main-card-header"><Shield size={17} /><span>MFA Status</span>
                <Tip text="Multi-factor authentication is mandatory for all admins"><Info size={13} className="ai-news-profile-main-tip-icon" /></Tip>
              </div>
              <div className="ai-news-profile-main-info-list">
                <div className="ai-news-profile-main-info-row">
                  <span className="ai-news-profile-main-info-label">MFA Enabled</span>
                  <span className={`ai-news-profile-main-info-value ${a.mfa?.enabled ? 'text-green' : 'text-red'}`}>
                    {a.mfa?.enabled ? <><CheckCircle size={13} /> Yes — Active</> : <><AlertTriangle size={13} /> Not Enabled</>}
                  </span>
                </div>
                <div className="ai-news-profile-main-info-row">
                  <span className="ai-news-profile-main-info-label">MFA Method</span>
                  <span className="ai-news-profile-main-info-value">{val(a.mfa?.method)}</span>
                </div>
                <div className="ai-news-profile-main-info-row">
                  <span className="ai-news-profile-main-info-label">Recovery Email</span>
                  <span className="ai-news-profile-main-info-value">{val(a.mfa?.recoveryEmail)}</span>
                </div>
                <div className="ai-news-profile-main-info-row">
                  <span className="ai-news-profile-main-info-label">Recovery Phone</span>
                  <span className="ai-news-profile-main-info-value">{val(a.mfa?.recoveryPhone)}</span>
                </div>
              </div>
              {!a.mfa?.enabled && (
                <div className="ai-news-profile-main-mfa-warning">
                  <AlertTriangle size={14} />
                  <p>MFA is mandatory. Please enable it immediately to avoid account suspension.</p>
                </div>
              )}
            </div>

            {/* Login History */}
            <div className="ai-news-profile-main-card">
              <div className="ai-news-profile-main-card-header"><Clock size={17} /><span>Recent Login History</span></div>
              {a.loginHistory?.length > 0
                ? <div className="ai-news-profile-main-activity-list">
                    {a.loginHistory.slice(0, 10).map((l, i) => (
                      <div key={i} className="ai-news-profile-main-activity-row">
                        <div className={`ai-news-profile-main-activity-dot ${l.success ? 'done' : 'fail'}`} />
                        <div className="ai-news-profile-main-activity-info">
                          <strong>{l.success ? '✓ Successful' : '✗ Failed'} — {val(l.ipAddress)}</strong>
                          <span>{val(l.userAgent, 'Unknown device').substring(0, 50)} · {l.timestamp ? new Date(l.timestamp).toLocaleString() : 'Unknown'}</span>
                          {!l.success && l.failureReason && <span className="ai-news-profile-main-fail-reason">{l.failureReason}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                : <span className="ai-news-profile-main-empty-msg">No login history found.</span>
              }
            </div>
          </div>
        )}

        {/* ══ EDIT ══ */}
        {activeTab === 'edit' && (
          <div className="ai-news-profile-main-form-layout">
            <div className="ai-news-profile-main-card wide">
              <div className="ai-news-profile-main-card-header"><User size={17} /><span>Basic Information</span></div>
              <div className="ai-news-profile-main-form-grid">
                <div className="ai-news-profile-main-field">
                  <label className="ai-news-profile-main-label"><User size={13} /> Full Name</label>
                  <input className="ai-news-profile-main-input admin-input" value={editForm.name || ''} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name" />
                </div>
                <div className="ai-news-profile-main-field">
                  <label className="ai-news-profile-main-label"><Globe size={13} /> Language</label>
                  <select className="ai-news-profile-main-select admin-select" value={editForm.preferredLanguage || 'en'} onChange={e => setEditForm(f => ({ ...f, preferredLanguage: e.target.value }))}>
                    {[['en','English'],['hi','Hindi'],['es','Spanish'],['fr','French'],['de','German']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div className="ai-news-profile-main-field">
                  <label className="ai-news-profile-main-label"><Clock size={13} /> Timezone</label>
                  <input className="ai-news-profile-main-input admin-input" value={editForm.timezone || ''} onChange={e => setEditForm(f => ({ ...f, timezone: e.target.value }))} placeholder="e.g. UTC, Asia/Kolkata" />
                </div>
              </div>
            </div>

            <div className="ai-news-profile-main-card wide">
              <div className="ai-news-profile-main-card-header"><Briefcase size={17} /><span>Professional Profile</span></div>
              <div className="ai-news-profile-main-form-grid">
                <div className="ai-news-profile-main-field">
                  <label className="ai-news-profile-main-label"><User size={13} /> First Name</label>
                  <input className="ai-news-profile-main-input admin-input" value={profileForm.firstName || ''} onChange={e => setProfileForm(f => ({ ...f, firstName: e.target.value }))} placeholder="First name" />
                </div>
                <div className="ai-news-profile-main-field">
                  <label className="ai-news-profile-main-label"><User size={13} /> Last Name</label>
                  <input className="ai-news-profile-main-input admin-input" value={profileForm.lastName || ''} onChange={e => setProfileForm(f => ({ ...f, lastName: e.target.value }))} placeholder="Last name" />
                </div>
                <div className="ai-news-profile-main-field">
                  <label className="ai-news-profile-main-label"><Phone size={13} /> Phone</label>
                  <input className="ai-news-profile-main-input admin-input" value={profileForm.phone || ''} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1 000 000 0000" />
                </div>
                <div className="ai-news-profile-main-field">
                  <label className="ai-news-profile-main-label"><Briefcase size={13} /> Position</label>
                  <input className="ai-news-profile-main-input admin-input" value={profileForm.position || ''} onChange={e => setProfileForm(f => ({ ...f, position: e.target.value }))} placeholder="Your job title" />
                </div>
                <div className="ai-news-profile-main-field">
                  <label className="ai-news-profile-main-label"><Building2 size={13} /> Department</label>
                  <select className="ai-news-profile-main-select admin-select" value={profileForm.department || 'content'} onChange={e => setProfileForm(f => ({ ...f, department: e.target.value }))}>
                    {['content','user-management','technical','moderation','analytics','support'].map(d => <option key={d} value={d}>{d.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
                  </select>
                </div>
                <div className="ai-news-profile-main-field">
                  <label className="ai-news-profile-main-label"><Award size={13} /> Employee ID</label>
                  <input className="ai-news-profile-main-input admin-input" value={profileForm.employeeId || ''} onChange={e => setProfileForm(f => ({ ...f, employeeId: e.target.value }))} placeholder="Company employee ID" />
                </div>
                <div className="ai-news-profile-main-field full-span">
                  <label className="ai-news-profile-main-label"><FileText size={13} /> Bio</label>
                  <textarea className="ai-news-profile-main-textarea admin-textarea" rows={3} value={profileForm.bio || ''} onChange={e => setProfileForm(f => ({ ...f, bio: e.target.value }))} placeholder="Brief professional bio…" />
                </div>
              </div>
            </div>

            <div className="ai-news-profile-main-card wide">
              <div className="ai-news-profile-main-card-header"><Bell size={17} /><span>Email Notifications</span></div>
              <div className="ai-news-profile-main-toggles-list">
                {[
                  { key: 'securityAlerts', label: 'Security Alerts', desc: 'Suspicious login attempts and security events' },
                  { key: 'userReports', label: 'User Reports', desc: 'Reports filed by platform users' },
                  { key: 'contentFlags', label: 'Content Flags', desc: 'Flagged articles and comments needing review' },
                  { key: 'systemUpdates', label: 'System Updates', desc: 'Platform maintenance and update notifications' },
                  { key: 'dailyDigest', label: 'Daily Digest', desc: 'Daily summary of platform activity' },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="ai-news-profile-main-toggle-row">
                    <div><strong>{label}</strong><p>{desc}</p></div>
                    <label className="ai-news-profile-main-switch admin-switch">
                      <input type="checkbox" checked={notifForm[key] ?? false} onChange={e => setNotifForm(n => ({ ...n, [key]: e.target.checked }))} />
                      <span className="ai-news-profile-main-slider admin-slider" />
                    </label>
                  </div>
                ))}
              </div>
              <div className="ai-news-profile-main-form-actions" style={{marginTop:'1rem'}}>
                <button className="ai-news-profile-main-btn-primary admin-btn" onClick={saveNotifications} disabled={saving} style={{width:'fit-content'}}>
                  {saving ? <span className="ai-news-profile-main-spinner admin-spinner" /> : <><Save size={15} /> Save Notifications</>}
                </button>
              </div>
            </div>

            <div className="ai-news-profile-main-form-actions">
              <button className="ai-news-profile-main-btn-primary admin-btn" onClick={saveProfile} disabled={saving}>
                {saving ? <span className="ai-news-profile-main-spinner admin-spinner" /> : <><Save size={16} /> Save Profile</>}
              </button>
              <button className="ai-news-profile-main-btn-ghost admin-ghost" onClick={fetchProfile}>
                <RefreshCw size={15} /> Reset
              </button>
            </div>
          </div>
        )}

        {/* ══ SECURITY ══ */}
        {activeTab === 'security' && (
          <div className="ai-news-profile-main-form-layout">
            <div className="ai-news-profile-main-card wide">
              <div className="ai-news-profile-main-card-header"><Lock size={17} /><span>Change Password</span></div>
              <form className="ai-news-profile-main-form-grid" onSubmit={handlePasswordChange} noValidate>
                {[
                  { key: 'currentPassword', label: 'Current Password', vis: 'current' },
                  { key: 'newPassword', label: 'New Password', vis: 'new' },
                  { key: 'confirmPassword', label: 'Confirm Password', vis: 'confirm' },
                ].map(({ key, label, vis }) => (
                  <div key={key} className="ai-news-profile-main-field">
                    <label className="ai-news-profile-main-label"><Lock size={13} /> {label}</label>
                    <div className="ai-news-profile-main-pw-wrap">
                      <input className="ai-news-profile-main-input admin-input" type={showPw[vis] ? 'text' : 'password'}
                        value={pwForm[key]} onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))}
                        placeholder={`Enter ${label.toLowerCase()}`} />
                      <button type="button" className="ai-news-profile-main-eye-btn admin-eye" onClick={() => setShowPw(s => ({ ...s, [vis]: !s[vis] }))}>
                        {showPw[vis] ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {key === 'newPassword' && pwForm.newPassword && (
                      <div className="ai-news-profile-main-strength-row">
                        {[1,2,3,4,5].map(i => <div key={i} className="ai-news-profile-main-strength-bar admin-bar" style={{ background: i <= pwStrength ? strengthColors[pwStrength] : undefined }} />)}
                        <span style={{ color: strengthColors[pwStrength] }}>{strengthLabels[pwStrength]}</span>
                      </div>
                    )}
                  </div>
                ))}
                <div className="ai-news-profile-main-field full-span">
                  <button type="submit" className="ai-news-profile-main-btn-primary admin-btn" disabled={saving} style={{width:'fit-content'}}>
                    {saving ? <span className="ai-news-profile-main-spinner admin-spinner" /> : <><Shield size={16} /> Update Password</>}
                  </button>
                </div>
              </form>
            </div>

            {/* API Keys */}
            <div className="ai-news-profile-main-card wide">
              <div className="ai-news-profile-main-card-header">
                <Key size={17} /><span>API Keys</span>
                <Tip text="API keys allow programmatic access to the admin API. Keep them secret."><Info size={13} className="ai-news-profile-main-tip-icon" /></Tip>
                <button className="ai-news-profile-main-btn-xs admin-btn-xs" onClick={generateApiKey} style={{marginLeft:'auto'}}>
                  <Plus size={13} /> Generate Key
                </button>
              </div>
              {a.apiKeys?.length > 0
                ? <div className="ai-news-profile-main-keys-list">
                    {a.apiKeys.map((k, i) => (
                      <div key={i} className={`ai-news-profile-main-key-row ${!k.isActive ? 'revoked' : ''}`}>
                        <div className="ai-news-profile-main-key-info">
                          <strong>{val(k.name, 'Unnamed Key')}</strong>
                          <span className="ai-news-profile-main-key-id">ID: {k.keyId}</span>
                          <span>{k.isActive ? '● Active' : '○ Revoked'} · Created {k.createdAt ? new Date(k.createdAt).toLocaleDateString() : 'Unknown'}{k.expiresAt ? ` · Expires ${new Date(k.expiresAt).toLocaleDateString()}` : ''}</span>
                        </div>
                        {k.isActive && (
                          <button className="ai-news-profile-main-remove-btn admin-remove" onClick={() => revokeApiKey(k.keyId)}>
                            <X size={13} /> Revoke
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                : <span className="ai-news-profile-main-empty-msg">No API keys yet. Generate one to access the admin API programmatically.</span>
              }
            </div>

            {/* Sessions */}
            <div className="ai-news-profile-main-card wide">
              <div className="ai-news-profile-main-card-header">
                <Activity size={17} /><span>Active Sessions</span>
                <button className="ai-news-profile-main-btn-xs admin-btn-xs danger-xs" onClick={endAllSessions} style={{marginLeft:'auto'}}>
                  <LogOut size={13} /> End All
                </button>
              </div>
              {a.sessions?.filter(s => s.isActive).length > 0
                ? a.sessions.filter(s => s.isActive).map((s, i) => (
                    <div key={i} className="ai-news-profile-main-session-row admin-session">
                      <div className="ai-news-profile-main-session-dot admin-dot" />
                      <div className="ai-news-profile-main-session-info">
                        <strong>{val(s.deviceInfo?.browser, 'Unknown Browser')} on {val(s.deviceInfo?.platform, 'Unknown')}</strong>
                        <span>{val(s.ipAddress)} · {val(s.location?.city, 'Unknown city')} · Last active {s.lastActive ? new Date(s.lastActive).toLocaleDateString() : 'Unknown'}</span>
                      </div>
                    </div>
                  ))
                : <span className="ai-news-profile-main-empty-msg">No active sessions.</span>
              }
            </div>
          </div>
        )}

        {/* ══ PERMISSIONS ══ */}
        {activeTab === 'permissions' && (
          <div className="ai-news-profile-main-section-grid">
            {Object.entries(a.permissions || {}).map(([group, perms]) => (
              <div key={group} className="ai-news-profile-main-card">
                <div className="ai-news-profile-main-card-header">
                  {PERM_GROUPS[group]?.icon}
                  <span>{PERM_GROUPS[group]?.label || group}</span>
                  <Tip text={`Permissions for the ${group} resource group`}><Info size={13} className="ai-news-profile-main-tip-icon" /></Tip>
                </div>
                <div className="ai-news-profile-main-perms-grid">
                  {Object.entries(perms).map(([action, granted]) => (
                    <div key={action} className={`ai-news-profile-main-perm-item ${granted ? 'granted' : 'denied'}`}>
                      {granted ? <CheckCircle size={13} /> : <X size={13} />}
                      <span>{action.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className="ai-news-profile-main-card">
              <div className="ai-news-profile-main-card-header"><Shield size={17} /><span>Admin Restrictions</span></div>
              <div className="ai-news-profile-main-info-list">
                {a.restrictions && Object.entries({
                  'Sensitive Data Access': a.restrictions.canAccessSensitiveData,
                  'Data Export': a.restrictions.canExportData,
                  'Max Sessions': a.restrictions.maxLoginSessions,
                  'Require MFA': a.restrictions.requireMFA,
                }).map(([label, value]) => (
                  <div key={label} className="ai-news-profile-main-info-row">
                    <span className="ai-news-profile-main-info-label">{label}</span>
                    <span className={`ai-news-profile-main-info-value ${typeof value === 'boolean' ? (value ? 'text-green' : 'text-red') : ''}`}>
                      {typeof value === 'boolean' ? (value ? 'Enabled' : 'Disabled') : val(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ PERFORMANCE ══ */}
        {activeTab === 'performance' && (
          <div className="ai-news-profile-main-section-grid">
            <div className="ai-news-profile-main-card wide">
              <div className="ai-news-profile-main-card-header"><BarChart2 size={17} /><span>Performance Metrics</span></div>
              <div className="ai-news-profile-main-stats-grid-2">
                {[
                  { icon: <FileText size={18} />, value: val(perf.articlesReviewed, 0), label: 'Articles Reviewed' },
                  { icon: <CheckCircle size={18} />, value: val(perf.articlesPublished, 0), label: 'Articles Published' },
                  { icon: <Shield size={18} />, value: val(perf.commentsModerated, 0), label: 'Comments Moderated' },
                  { icon: <Users size={18} />, value: val(perf.usersManaged, 0), label: 'Users Managed' },
                  { icon: <AlertTriangle size={18} />, value: val(perf.flagsResolved, 0), label: 'Flags Resolved' },
                  { icon: <Clock size={18} />, value: perf.averageResponseTime != null ? `${perf.averageResponseTime}h` : '—', label: 'Avg Response Time' },
                  { icon: <TrendingUp size={18} />, value: perf.approvalRate != null ? `${perf.approvalRate}%` : '—', label: 'Approval Rate' },
                  { icon: <BarChart2 size={18} />, value: perf.rejectionRate != null ? `${perf.rejectionRate}%` : '—', label: 'Rejection Rate' },
                ].map(({ icon, value, label }) => (
                  <div key={label} className="ai-news-profile-main-stat-card-2 admin">
                    {icon}<div><strong>{value}</strong><p>{label}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ TASKS ══ */}
        {activeTab === 'tasks' && (
          <div className="ai-news-profile-main-form-layout">
            <div className="ai-news-profile-main-card wide">
              <div className="ai-news-profile-main-card-header">
                <CheckCircle size={17} /><span>My Tasks</span>
                <button className="ai-news-profile-main-btn-xs admin-btn-xs" onClick={() => setShowTaskForm(s => !s)} style={{marginLeft:'auto'}}>
                  <Plus size={13} /> New Task
                </button>
              </div>

              {showTaskForm && (
                <div className="ai-news-profile-main-task-form">
                  <div className="ai-news-profile-main-form-grid">
                    <div className="ai-news-profile-main-field full-span">
                      <label className="ai-news-profile-main-label">Task Title</label>
                      <input className="ai-news-profile-main-input admin-input" value={newTask.title} onChange={e => setNewTask(t => ({ ...t, title: e.target.value }))} placeholder="What needs to be done?" />
                    </div>
                    <div className="ai-news-profile-main-field">
                      <label className="ai-news-profile-main-label">Type</label>
                      <select className="ai-news-profile-main-select admin-select" value={newTask.type} onChange={e => setNewTask(t => ({ ...t, type: e.target.value }))}>
                        {['review', 'approval', 'moderation', 'fact-check', 'maintenance'].map(v => <option key={v} value={v}>{v.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
                      </select>
                    </div>
                    <div className="ai-news-profile-main-field">
                      <label className="ai-news-profile-main-label">Priority</label>
                      <select className="ai-news-profile-main-select admin-select" value={newTask.priority} onChange={e => setNewTask(t => ({ ...t, priority: e.target.value }))}>
                        {['low', 'medium', 'high', 'urgent'].map(v => <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>)}
                      </select>
                    </div>
                    <div className="ai-news-profile-main-field full-span">
                      <label className="ai-news-profile-main-label">Description (optional)</label>
                      <textarea className="ai-news-profile-main-textarea admin-textarea" rows={2} value={newTask.description} onChange={e => setNewTask(t => ({ ...t, description: e.target.value }))} placeholder="Additional details…" />
                    </div>
                  </div>
                  <div className="ai-news-profile-main-form-actions" style={{marginTop:'0.75rem'}}>
                    <button className="ai-news-profile-main-btn-primary admin-btn" onClick={addTask}><Plus size={15} /> Add Task</button>
                    <button className="ai-news-profile-main-btn-ghost admin-ghost" onClick={() => setShowTaskForm(false)}>Cancel</button>
                  </div>
                </div>
              )}

              {a.tasks?.length > 0
                ? <div className="ai-news-profile-main-tasks-list">
                    {a.tasks.map((t, i) => (
                      <div key={i} className={`ai-news-profile-main-task-row priority-${t.priority}`}>
                        <div className="ai-news-profile-main-task-meta">
                          <span className={`ai-news-profile-main-task-status status-${t.status}`}>{val(t.status, 'pending')}</span>
                          <span className={`ai-news-profile-main-task-priority prio-${t.priority}`}>{val(t.priority, 'medium')}</span>
                          <span className="ai-news-profile-main-task-type">{val(t.type)}</span>
                        </div>
                        <strong className="ai-news-profile-main-task-title">{val(t.title, 'Untitled Task')}</strong>
                        {t.description && <p className="ai-news-profile-main-task-desc">{t.description}</p>}
                        {t.dueDate && <span className="ai-news-profile-main-task-due"><Calendar size={12} /> Due: {new Date(t.dueDate).toLocaleDateString()}</span>}
                        {t.status !== 'completed' && t.status !== 'cancelled' && (
                          <div className="ai-news-profile-main-task-actions">
                            {t.status === 'pending' && <button className="ai-news-profile-main-btn-xs admin-btn-xs" onClick={() => updateTaskStatus(t.taskId, 'in-progress')}>Start</button>}
                            {t.status === 'in-progress' && <button className="ai-news-profile-main-btn-xs admin-btn-xs" onClick={() => updateTaskStatus(t.taskId, 'completed')}>Complete</button>}
                            <button className="ai-news-profile-main-btn-xs danger-xs" onClick={() => updateTaskStatus(t.taskId, 'cancelled')}>Cancel</button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                : <span className="ai-news-profile-main-empty-msg">No tasks assigned yet.</span>
              }
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminProfile;