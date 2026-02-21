import React, { useState, useContext, useEffect, useRef, useCallback } from 'react';
import Swal from 'sweetalert2';
import {
  User, Mail, Lock, Globe, Bell, BookOpen, Heart, Bookmark,
  Eye, EyeOff, Camera, Edit3, Save, X, Check, Clock,
  TrendingUp, MessageCircle, Share2, Star, Shield,
  Twitter, Linkedin, Github, Link2, ChevronRight,
  AlertCircle, Info, Trash2, Plus, BarChart3, Activity,
  Calendar, MapPin, Phone, FileText, Zap, RefreshCw,
  LogOut, Download, Moon, Sun, Type
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

const TABS = [
  { id: 'overview',      label: 'Overview',       icon: <User size={16} /> },
  { id: 'edit',          label: 'Edit Profile',   icon: <Edit3 size={16} /> },
  { id: 'security',      label: 'Security',        icon: <Shield size={16} /> },
  { id: 'preferences',   label: 'Preferences',    icon: <Bell size={16} /> },
  { id: 'activity',      label: 'Activity',        icon: <Activity size={16} /> },
  { id: 'saved',         label: 'Saved',           icon: <Bookmark size={16} /> },
];

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
const UserProfile = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef(null);

  /* edit state */
  const [editForm, setEditForm] = useState({});
  const [socialLinks, setSocialLinks] = useState({});
  const [prefs, setPrefs] = useState({});
  const [notifPrefs, setNotifPrefs] = useState({});
  const [uiPrefs, setUiPrefs] = useState({});

  /* security */
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [pwStrength, setPwStrength] = useState(0);

  /* ── fetch profile ─────────────────────────────────────── */
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users/profile', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setProfile(data.user || data);
      const u = data.user || data;
      setEditForm({
        name: u.name || '',
        bio: u.bio || '',
        timezone: u.timezone || '',
        preferredLanguage: u.preferredLanguage || 'en',
      });
      setSocialLinks(u.socialLinks || {});
      setPrefs(u.preferences?.readingPreferences || {});
      setNotifPrefs(u.preferences?.emailNotifications || {});
      setUiPrefs(u.preferences?.uiPreferences || {});
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load profile.', background: isDarkMode ? '#0d1117' : '#fff', color: isDarkMode ? '#e6edf3' : '#24292f' });
    } finally {
      setLoading(false);
    }
  }, [isDarkMode]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  /* ── save profile ──────────────────────────────────────── */
  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...editForm, socialLinks }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setProfile(data.user || data);
      Swal.fire({ icon: 'success', title: 'Profile Updated!', timer: 1800, showConfirmButton: false, background: isDarkMode ? '#0d1117' : '#fff', color: isDarkMode ? '#e6edf3' : '#24292f' });
    } catch {
      Swal.fire({ icon: 'error', title: 'Save Failed', text: 'Could not update profile. Try again.', background: isDarkMode ? '#0d1117' : '#fff', color: isDarkMode ? '#e6edf3' : '#24292f' });
    } finally {
      setSaving(false);
    }
  };

  /* ── avatar upload ─────────────────────────────────────── */
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({ icon: 'warning', title: 'File Too Large', text: 'Avatar must be under 5MB.', background: isDarkMode ? '#0d1117' : '#fff' });
      return;
    }
    setAvatarUploading(true);
    const fd = new FormData();
    fd.append('avatar', file);
    try {
      const res = await fetch('/api/users/avatar', { method: 'POST', body: fd, credentials: 'include' });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setProfile(p => ({ ...p, avatar: data.avatar }));
      Swal.fire({ icon: 'success', title: 'Avatar Updated!', timer: 1500, showConfirmButton: false, background: isDarkMode ? '#0d1117' : '#fff' });
    } catch {
      Swal.fire({ icon: 'error', title: 'Upload Failed', text: 'Could not upload avatar.', background: isDarkMode ? '#0d1117' : '#fff' });
    } finally {
      setAvatarUploading(false);
    }
  };

  /* ── change password ───────────────────────────────────── */
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      Swal.fire({ icon: 'warning', title: 'Mismatch', text: 'Passwords do not match.', background: isDarkMode ? '#0d1117' : '#fff' });
      return;
    }
    if (pwStrength < 3) {
      Swal.fire({ icon: 'warning', title: 'Weak Password', text: 'Choose a stronger password.', background: isDarkMode ? '#0d1117' : '#fff' });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Failed');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      Swal.fire({ icon: 'success', title: 'Password Changed!', text: 'Your password has been updated.', background: isDarkMode ? '#0d1117' : '#fff', confirmButtonColor: '#3b82f6' });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Failed', text: err.message || 'Incorrect current password.', background: isDarkMode ? '#0d1117' : '#fff' });
    } finally {
      setSaving(false);
    }
  };

  /* ── save preferences ──────────────────────────────────── */
  const savePreferences = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/users/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ emailNotifications: notifPrefs, uiPreferences: uiPrefs }),
      });
      if (!res.ok) throw new Error();
      Swal.fire({ icon: 'success', title: 'Preferences Saved!', timer: 1500, showConfirmButton: false, background: isDarkMode ? '#0d1117' : '#fff' });
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Could not save preferences.', background: isDarkMode ? '#0d1117' : '#fff' });
    } finally {
      setSaving(false);
    }
  };

  /* ── delete account ────────────────────────────────────── */
  const handleDeleteAccount = async () => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Delete Account?',
      html: `<p style="font-size:0.9rem;color:#94a3b8">This action is <strong>permanent</strong> and cannot be undone.<br/>All your data, reading history, and bookmarks will be erased.</p>`,
      input: 'text',
      inputPlaceholder: 'Type DELETE to confirm',
      showCancelButton: true,
      confirmButtonText: 'Delete Forever',
      confirmButtonColor: '#ef4444',
      cancelButtonText: 'Cancel',
      background: isDarkMode ? '#0d1117' : '#fff',
      color: isDarkMode ? '#e6edf3' : '#24292f',
      preConfirm: (v) => {
        if (v !== 'DELETE') { Swal.showValidationMessage('Type DELETE to confirm'); return false; }
      }
    });
    if (!result.isConfirmed) return;
    try {
      const res = await fetch('/api/users/account', { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error();
      Swal.fire({ icon: 'success', title: 'Account Deleted', text: 'Redirecting...', timer: 2000, showConfirmButton: false });
      setTimeout(() => window.location.href = '/', 2100);
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Could not delete account. Contact support.' });
    }
  };

  /* ── password strength ─────────────────────────────────── */
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

  /* ── remove bookmark ───────────────────────────────────── */
  const removeBookmark = async (articleId) => {
    try {
      await fetch(`/api/users/bookmarks/${articleId}`, { method: 'DELETE', credentials: 'include' });
      setProfile(p => ({ ...p, engagement: { ...p.engagement, bookmarkedArticles: p.engagement.bookmarkedArticles.filter(b => b.articleId !== articleId) } }));
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Could not remove bookmark.', background: isDarkMode ? '#0d1117' : '#fff' });
    }
  };

  if (loading) {
    return (
      <div className={`ai-news-profile-main-loader-screen ${isDarkMode ? 'dark' : 'light'}`}>
        <div className="ai-news-profile-main-loader-ring" />
        <span>Loading your profile…</span>
      </div>
    );
  }

  const p = profile || {};
  const ap = p.authorProfile || {};
  const strengthLabels = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  const strengthColors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4'];

  /* ══════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════ */
  return (
    <div className={`ai-news-profile-main-root ${isDarkMode ? 'dark' : 'light'}`}>
      {/* SEO */}
      <h1 className="ai-news-profile-main-seo-h1">
        {val(p.name, 'User')} — Profile | NewsAI
      </h1>

      {/* ── HERO BANNER ─────────────────────────────────── */}
      <header className="ai-news-profile-main-hero">
        <div className="ai-news-profile-main-hero-bg" />
        <div className="ai-news-profile-main-hero-content">
          {/* Avatar */}
          <div className="ai-news-profile-main-avatar-wrap">
            <div className="ai-news-profile-main-avatar-ring">
              {p.avatar?.url
                ? <img src={p.avatar.url} alt={val(p.avatar.alt, p.name)} className="ai-news-profile-main-avatar-img" />
                : <div className="ai-news-profile-main-avatar-placeholder">
                    {(p.name || 'U').charAt(0).toUpperCase()}
                  </div>
              }
              {avatarUploading && <div className="ai-news-profile-main-avatar-overlay"><div className="ai-news-profile-main-loader-ring small" /></div>}
            </div>
            <Tip text="Upload a profile photo (max 5MB)">
              <button className="ai-news-profile-main-avatar-edit-btn" onClick={() => fileInputRef.current?.click()}>
                <Camera size={14} />
              </button>
            </Tip>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
          </div>

          {/* User Info */}
          <div className="ai-news-profile-main-hero-info">
            <div className="ai-news-profile-main-hero-name-row">
              <span className="ai-news-profile-main-hero-name">{val(p.name, 'Anonymous User')}</span>
              {p.emailVerified && (
                <Tip text="Email verified">
                  <span className="ai-news-profile-main-verified-badge"><Check size={11} /> Verified</span>
                </Tip>
              )}
              <span className={`ai-news-profile-main-role-badge role-${p.role || 'user'}`}>
                {val(p.role, 'user')}
              </span>
            </div>
            <span className="ai-news-profile-main-hero-email"><Mail size={13} /> {val(p.email)}</span>
            {p.bio && <p className="ai-news-profile-main-hero-bio">{p.bio}</p>}

            <div className="ai-news-profile-main-hero-meta">
              {p.timezone && <span><MapPin size={12} /> {p.timezone}</span>}
              {p.preferredLanguage && <span><Globe size={12} /> {p.preferredLanguage.toUpperCase()}</span>}
              {p.createdAt && <span><Calendar size={12} /> Joined {new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>}
              {p.lastLogin && <span><Clock size={12} /> Last seen {new Date(p.lastLogin).toLocaleDateString()}</span>}
            </div>

            {/* Social Links */}
            <div className="ai-news-profile-main-social-row">
              {p.socialLinks?.twitter && <a href={`https://twitter.com/${p.socialLinks.twitter}`} target="_blank" rel="noreferrer" className="ai-news-profile-main-social-link twitter"><Twitter size={15} /></a>}
              {p.socialLinks?.linkedin && <a href={p.socialLinks.linkedin} target="_blank" rel="noreferrer" className="ai-news-profile-main-social-link linkedin"><Linkedin size={15} /></a>}
              {p.socialLinks?.github && <a href={`https://github.com/${p.socialLinks.github}`} target="_blank" rel="noreferrer" className="ai-news-profile-main-social-link github"><Github size={15} /></a>}
              {p.socialLinks?.website && <a href={p.socialLinks.website} target="_blank" rel="noreferrer" className="ai-news-profile-main-social-link website"><Link2 size={15} /></a>}
            </div>
          </div>

          {/* Stats */}
          {(p.role === 'author' || p.role === 'editor') && (
            <div className="ai-news-profile-main-hero-stats">
              <div className="ai-news-profile-main-stat"><strong>{val(ap.totalArticles, 0)}</strong><span>Articles</span></div>
              <div className="ai-news-profile-main-stat"><strong>{val(ap.totalViews, 0)}</strong><span>Views</span></div>
              <div className="ai-news-profile-main-stat"><strong>{val(ap.totalLikes, 0)}</strong><span>Likes</span></div>
              <div className="ai-news-profile-main-stat"><strong>{val(ap.followersCount, 0)}</strong><span>Followers</span></div>
            </div>
          )}
        </div>
      </header>

      {/* ── TABS ────────────────────────────────────────── */}
      <nav className="ai-news-profile-main-tabs-nav" role="tablist">
        {TABS.map(t => (
          <button key={t.id} role="tab" aria-selected={activeTab === t.id}
            className={`ai-news-profile-main-tab-btn ${activeTab === t.id ? 'active' : ''}`}
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

            {/* About Card */}
            <div className="ai-news-profile-main-card">
              <div className="ai-news-profile-main-card-header">
                <User size={17} /><span>About</span>
              </div>
              <div className="ai-news-profile-main-info-list">
                <div className="ai-news-profile-main-info-row">
                  <span className="ai-news-profile-main-info-label">Full Name</span>
                  <span className="ai-news-profile-main-info-value">{val(p.name)}</span>
                </div>
                <div className="ai-news-profile-main-info-row">
                  <span className="ai-news-profile-main-info-label">Email</span>
                  <span className="ai-news-profile-main-info-value">{val(p.email)}</span>
                </div>
                <div className="ai-news-profile-main-info-row">
                  <span className="ai-news-profile-main-info-label">Bio</span>
                  <span className="ai-news-profile-main-info-value">{val(p.bio)}</span>
                </div>
                <div className="ai-news-profile-main-info-row">
                  <span className="ai-news-profile-main-info-label">Timezone</span>
                  <span className="ai-news-profile-main-info-value">{val(p.timezone)}</span>
                </div>
                <div className="ai-news-profile-main-info-row">
                  <span className="ai-news-profile-main-info-label">Language</span>
                  <span className="ai-news-profile-main-info-value">{val(p.preferredLanguage)}</span>
                </div>
                <div className="ai-news-profile-main-info-row">
                  <span className="ai-news-profile-main-info-label">Account Role</span>
                  <span className="ai-news-profile-main-info-value capitalize">{val(p.role)}</span>
                </div>
                <div className="ai-news-profile-main-info-row">
                  <span className="ai-news-profile-main-info-label">Member Since</span>
                  <span className="ai-news-profile-main-info-value">{p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Not entered yet'}</span>
                </div>
              </div>
            </div>

            {/* AI Interests */}
            <div className="ai-news-profile-main-card">
              <div className="ai-news-profile-main-card-header">
                <Zap size={17} /><span>AI Interests</span>
                <Tip text="Topics you follow to personalize your feed"><Info size={13} className="ai-news-profile-main-tip-icon" /></Tip>
              </div>
              {(p.preferences?.readingPreferences?.topics?.length > 0)
                ? <div className="ai-news-profile-main-topics-wrap">
                    {p.preferences.readingPreferences.topics.map((t, i) => (
                      <span key={i} className="ai-news-profile-main-topic-chip">{t}</span>
                    ))}
                  </div>
                : <span className="ai-news-profile-main-empty-msg">No topics selected yet.</span>
              }
            </div>

            {/* Author Profile */}
            {(p.role === 'author' || p.role === 'editor') && (
              <div className="ai-news-profile-main-card">
                <div className="ai-news-profile-main-card-header">
                  <Star size={17} /><span>Author Stats</span>
                </div>
                <div className="ai-news-profile-main-stats-grid-2">
                  <div className="ai-news-profile-main-stat-card-2"><TrendingUp size={18} /><div><strong>{val(ap.totalArticles, 0)}</strong><p>Articles</p></div></div>
                  <div className="ai-news-profile-main-stat-card-2"><Eye size={18} /><div><strong>{val(ap.totalViews, 0).toLocaleString?.() ?? 0}</strong><p>Total Views</p></div></div>
                  <div className="ai-news-profile-main-stat-card-2"><Heart size={18} /><div><strong>{val(ap.totalLikes, 0)}</strong><p>Likes</p></div></div>
                  <div className="ai-news-profile-main-stat-card-2"><Star size={18} /><div><strong>{ap.averageRating ? ap.averageRating.toFixed(1) : '—'}</strong><p>Avg Rating</p></div></div>
                </div>
                {ap.penName && <div className="ai-news-profile-main-info-row" style={{marginTop:'1rem'}}><span className="ai-news-profile-main-info-label">Pen Name</span><span className="ai-news-profile-main-info-value">{ap.penName}</span></div>}
                {ap.expertise?.length > 0 && (
                  <div className="ai-news-profile-main-topics-wrap" style={{marginTop:'0.75rem'}}>
                    {ap.expertise.map((e, i) => <span key={i} className="ai-news-profile-main-topic-chip accent">{e}</span>)}
                  </div>
                )}
              </div>
            )}

            {/* Quick engagement */}
            <div className="ai-news-profile-main-card">
              <div className="ai-news-profile-main-card-header">
                <BarChart3 size={17} /><span>Engagement</span>
              </div>
              <div className="ai-news-profile-main-stats-grid-2">
                <div className="ai-news-profile-main-stat-card-2"><Bookmark size={18} /><div><strong>{p.engagement?.bookmarkedArticles?.length ?? 0}</strong><p>Bookmarks</p></div></div>
                <div className="ai-news-profile-main-stat-card-2"><Heart size={18} /><div><strong>{p.engagement?.likedArticles?.length ?? 0}</strong><p>Liked</p></div></div>
                <div className="ai-news-profile-main-stat-card-2"><Share2 size={18} /><div><strong>{p.engagement?.sharedArticles?.length ?? 0}</strong><p>Shared</p></div></div>
                <div className="ai-news-profile-main-stat-card-2"><MessageCircle size={18} /><div><strong>{p.engagement?.comments?.length ?? 0}</strong><p>Comments</p></div></div>
              </div>
            </div>
          </div>
        )}

        {/* ══ EDIT PROFILE ══ */}
        {activeTab === 'edit' && (
          <div className="ai-news-profile-main-form-layout">
            <div className="ai-news-profile-main-card wide">
              <div className="ai-news-profile-main-card-header"><Edit3 size={17} /><span>Personal Information</span></div>
              <div className="ai-news-profile-main-form-grid">
                <div className="ai-news-profile-main-field">
                  <label className="ai-news-profile-main-label"><User size={13} /> Full Name</label>
                  <input className="ai-news-profile-main-input" value={editForm.name || ''} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} placeholder="Your full name" />
                </div>
                <div className="ai-news-profile-main-field">
                  <label className="ai-news-profile-main-label"><Globe size={13} /> Language</label>
                  <select className="ai-news-profile-main-select" value={editForm.preferredLanguage || 'en'} onChange={e => setEditForm(f => ({ ...f, preferredLanguage: e.target.value }))}>
                    {[['en','English'],['hi','Hindi'],['es','Spanish'],['fr','French'],['de','German'],['zh','Chinese'],['ja','Japanese']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div className="ai-news-profile-main-field">
                  <label className="ai-news-profile-main-label"><MapPin size={13} /> Timezone</label>
                  <input className="ai-news-profile-main-input" value={editForm.timezone || ''} onChange={e => setEditForm(f => ({ ...f, timezone: e.target.value }))} placeholder="e.g. Asia/Kolkata" />
                </div>
                <div className="ai-news-profile-main-field full-span">
                  <label className="ai-news-profile-main-label">
                    <FileText size={13} /> Bio
                    <Tip text="Tell the community about yourself (max 500 chars)"><Info size={12} className="ai-news-profile-main-tip-icon" /></Tip>
                  </label>
                  <textarea className="ai-news-profile-main-textarea" rows={4} maxLength={500}
                    value={editForm.bio || ''} onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))}
                    placeholder="Write a short bio about yourself…" />
                  <span className="ai-news-profile-main-char-count">{(editForm.bio || '').length}/500</span>
                </div>
              </div>
            </div>

            <div className="ai-news-profile-main-card wide">
              <div className="ai-news-profile-main-card-header"><Link2 size={17} /><span>Social Links</span></div>
              <div className="ai-news-profile-main-form-grid">
                {[
                  { key: 'twitter', icon: <Twitter size={14} />, placeholder: 'Twitter handle (without @)' },
                  { key: 'linkedin', icon: <Linkedin size={14} />, placeholder: 'LinkedIn profile URL' },
                  { key: 'github', icon: <Github size={14} />, placeholder: 'GitHub username' },
                  { key: 'website', icon: <Link2 size={14} />, placeholder: 'Personal website URL' },
                ].map(({ key, icon, placeholder }) => (
                  <div key={key} className="ai-news-profile-main-field">
                    <label className="ai-news-profile-main-label">{icon} {key.charAt(0).toUpperCase() + key.slice(1)}</label>
                    <input className="ai-news-profile-main-input" value={socialLinks[key] || ''} onChange={e => setSocialLinks(s => ({ ...s, [key]: e.target.value }))} placeholder={placeholder} />
                  </div>
                ))}
              </div>
            </div>

            <div className="ai-news-profile-main-form-actions">
              <button className="ai-news-profile-main-btn-primary" onClick={saveProfile} disabled={saving}>
                {saving ? <span className="ai-news-profile-main-spinner" /> : <><Save size={16} /> Save Changes</>}
              </button>
              <button className="ai-news-profile-main-btn-ghost" onClick={fetchProfile} disabled={saving}>
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
                  { key: 'confirmPassword', label: 'Confirm New Password', vis: 'confirm' },
                ].map(({ key, label, vis }) => (
                  <div key={key} className="ai-news-profile-main-field">
                    <label className="ai-news-profile-main-label"><Lock size={13} /> {label}</label>
                    <div className="ai-news-profile-main-pw-wrap">
                      <input className="ai-news-profile-main-input" type={showPw[vis] ? 'text' : 'password'}
                        value={pwForm[key]} onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))}
                        placeholder={`Enter ${label.toLowerCase()}`} autoComplete={key === 'currentPassword' ? 'current-password' : 'new-password'} />
                      <button type="button" className="ai-news-profile-main-eye-btn" onClick={() => setShowPw(s => ({ ...s, [vis]: !s[vis] }))}>
                        {showPw[vis] ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {key === 'newPassword' && pwForm.newPassword && (
                      <div className="ai-news-profile-main-strength-row">
                        {[1,2,3,4,5].map(i => <div key={i} className="ai-news-profile-main-strength-bar" style={{ background: i <= pwStrength ? strengthColors[pwStrength] : undefined }} />)}
                        <span style={{ color: strengthColors[pwStrength] }}>{strengthLabels[pwStrength]}</span>
                      </div>
                    )}
                  </div>
                ))}
                <div className="ai-news-profile-main-field full-span">
                  <button type="submit" className="ai-news-profile-main-btn-primary" disabled={saving} style={{width:'fit-content'}}>
                    {saving ? <span className="ai-news-profile-main-spinner" /> : <><Shield size={16} /> Update Password</>}
                  </button>
                </div>
              </form>
            </div>

            <div className="ai-news-profile-main-card wide">
              <div className="ai-news-profile-main-card-header"><Activity size={17} /><span>Active Sessions</span>
                <Tip text="These are devices currently signed into your account"><Info size={13} className="ai-news-profile-main-tip-icon" /></Tip>
              </div>
              {p.sessions?.filter(s => s.isActive).length > 0
                ? p.sessions.filter(s => s.isActive).map((s, i) => (
                  <div key={i} className="ai-news-profile-main-session-row">
                    <div className="ai-news-profile-main-session-dot" />
                    <div className="ai-news-profile-main-session-info">
                      <strong>{val(s.deviceInfo?.browser, 'Unknown Browser')} on {val(s.deviceInfo?.platform, 'Unknown Device')}</strong>
                      <span>{val(s.ipAddress)} · {val(s.location?.city)} · Last active {s.lastActive ? new Date(s.lastActive).toLocaleDateString() : 'Unknown'}</span>
                    </div>
                  </div>
                ))
                : <span className="ai-news-profile-main-empty-msg">No active sessions found.</span>
              }
            </div>

            <div className="ai-news-profile-main-card wide danger-zone">
              <div className="ai-news-profile-main-card-header danger"><Trash2 size={17} /><span>Danger Zone</span></div>
              <p className="ai-news-profile-main-danger-desc">Permanently delete your NewsAI account. All data — reading history, bookmarks, comments — will be erased. This action cannot be undone.</p>
              <button className="ai-news-profile-main-btn-danger" onClick={handleDeleteAccount}>
                <Trash2 size={15} /> Delete My Account
              </button>
            </div>
          </div>
        )}

        {/* ══ PREFERENCES ══ */}
        {activeTab === 'preferences' && (
          <div className="ai-news-profile-main-form-layout">
            <div className="ai-news-profile-main-card wide">
              <div className="ai-news-profile-main-card-header"><Bell size={17} /><span>Email Notifications</span></div>
              <div className="ai-news-profile-main-toggles-list">
                {[
                  { key: 'newArticles', label: 'New Articles', desc: 'Get notified when new AI articles are published' },
                  { key: 'comments', label: 'Comments', desc: 'Notifications for replies and comments on your posts' },
                  { key: 'newsletter', label: 'Newsletter', desc: 'Weekly AI digest delivered to your inbox' },
                  { key: 'mentions', label: 'Mentions', desc: 'Alerts when other users mention you' },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="ai-news-profile-main-toggle-row">
                    <div><strong>{label}</strong><p>{desc}</p></div>
                    <label className="ai-news-profile-main-switch">
                      <input type="checkbox" checked={notifPrefs[key] ?? false} onChange={e => setNotifPrefs(n => ({ ...n, [key]: e.target.checked }))} />
                      <span className="ai-news-profile-main-slider" />
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="ai-news-profile-main-card wide">
              <div className="ai-news-profile-main-card-header"><Type size={17} /><span>Display Preferences</span></div>
              <div className="ai-news-profile-main-form-grid">
                <div className="ai-news-profile-main-field">
                  <label className="ai-news-profile-main-label">
                    Theme
                    <Tip text="Controls how the platform looks. 'System' uses your device setting."><Info size={12} className="ai-news-profile-main-tip-icon" /></Tip>
                  </label>
                  <select className="ai-news-profile-main-select" value={uiPrefs.theme || 'system'} onChange={e => setUiPrefs(u => ({ ...u, theme: e.target.value }))}>
                    <option value="system">System Default</option>
                    <option value="light">Light Mode</option>
                    <option value="dark">Dark Mode</option>
                  </select>
                </div>
                <div className="ai-news-profile-main-field">
                  <label className="ai-news-profile-main-label">Font Size</label>
                  <select className="ai-news-profile-main-select" value={uiPrefs.fontSize || 'medium'} onChange={e => setUiPrefs(u => ({ ...u, fontSize: e.target.value }))}>
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="ai-news-profile-main-form-actions">
              <button className="ai-news-profile-main-btn-primary" onClick={savePreferences} disabled={saving}>
                {saving ? <span className="ai-news-profile-main-spinner" /> : <><Save size={16} /> Save Preferences</>}
              </button>
            </div>
          </div>
        )}

        {/* ══ ACTIVITY ══ */}
        {activeTab === 'activity' && (
          <div className="ai-news-profile-main-section-grid">
            <div className="ai-news-profile-main-card wide">
              <div className="ai-news-profile-main-card-header"><BookOpen size={17} /><span>Reading History</span>
                <Tip text="Last 100 articles you've read"><Info size={13} className="ai-news-profile-main-tip-icon" /></Tip>
              </div>
              {p.readingHistory?.length > 0
                ? <div className="ai-news-profile-main-activity-list">
                    {p.readingHistory.slice(0, 20).map((r, i) => (
                      <div key={i} className="ai-news-profile-main-activity-row">
                        <div className={`ai-news-profile-main-activity-dot ${r.completed ? 'done' : ''}`} />
                        <div className="ai-news-profile-main-activity-info">
                          <strong>Article #{typeof r.articleId === 'object' ? r.articleId._id || r.articleId : r.articleId}</strong>
                          <span>{r.readAt ? new Date(r.readAt).toLocaleDateString() : 'Unknown date'} · {r.timeSpent ? `${Math.round(r.timeSpent / 60)} min` : 'n/a'} · {r.completed ? '✓ Completed' : 'In progress'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                : <span className="ai-news-profile-main-empty-msg">No reading history yet. Start exploring AI news!</span>
              }
            </div>

            <div className="ai-news-profile-main-card wide">
              <div className="ai-news-profile-main-card-header"><Heart size={17} /><span>Liked Articles</span></div>
              {p.engagement?.likedArticles?.length > 0
                ? <div className="ai-news-profile-main-activity-list">
                    {p.engagement.likedArticles.slice(0, 15).map((a, i) => (
                      <div key={i} className="ai-news-profile-main-activity-row">
                        <Heart size={13} className="ai-news-profile-main-activity-heart" />
                        <div className="ai-news-profile-main-activity-info">
                          <strong>Article ID: {typeof a.articleId === 'object' ? a.articleId._id || String(a.articleId) : String(a.articleId)}</strong>
                          <span>Liked on {a.likedAt ? new Date(a.likedAt).toLocaleDateString() : 'Unknown'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                : <span className="ai-news-profile-main-empty-msg">No liked articles yet.</span>
              }
            </div>
          </div>
        )}

        {/* ══ SAVED ══ */}
        {activeTab === 'saved' && (
          <div className="ai-news-profile-main-section-grid">
            <div className="ai-news-profile-main-card wide">
              <div className="ai-news-profile-main-card-header"><Bookmark size={17} /><span>Bookmarked Articles</span>
                <span className="ai-news-profile-main-count-badge">{p.engagement?.bookmarkedArticles?.length ?? 0}</span>
              </div>
              {p.engagement?.bookmarkedArticles?.length > 0
                ? <div className="ai-news-profile-main-saved-list">
                    {p.engagement.bookmarkedArticles.map((b, i) => (
                      <div key={i} className="ai-news-profile-main-saved-row">
                        <Bookmark size={14} className="ai-news-profile-main-saved-icon" />
                        <div className="ai-news-profile-main-saved-info">
                          <strong>Article #{typeof b.articleId === 'object' ? b.articleId._id || String(b.articleId) : String(b.articleId)}</strong>
                          <span>Saved {b.bookmarkedAt ? new Date(b.bookmarkedAt).toLocaleDateString() : 'Unknown'}</span>
                        </div>
                        <button className="ai-news-profile-main-remove-btn" onClick={() => removeBookmark(b.articleId)} title="Remove bookmark">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                : <span className="ai-news-profile-main-empty-msg">No bookmarks yet. Save articles to read later!</span>
              }
            </div>

            <div className="ai-news-profile-main-card wide">
              <div className="ai-news-profile-main-card-header"><Clock size={17} /><span>Saved For Later</span></div>
              {p.preferences?.readingPreferences?.savedForLater?.length > 0
                ? <div className="ai-news-profile-main-saved-list">
                    {p.preferences.readingPreferences.savedForLater.map((s, i) => (
                      <div key={i} className="ai-news-profile-main-saved-row">
                        <Clock size={14} className="ai-news-profile-main-saved-icon" />
                        <div className="ai-news-profile-main-saved-info">
                          <strong>Article #{typeof s.articleId === 'object' ? s.articleId._id || String(s.articleId) : String(s.articleId)}</strong>
                          <span>Queued {s.savedAt ? new Date(s.savedAt).toLocaleDateString() : 'Unknown'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                : <span className="ai-news-profile-main-empty-msg">Nothing queued for later.</span>
              }
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserProfile;