// src/pages/Admin/UsersManagement.jsx
import { useContext, useState, useEffect, useRef, useCallback } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import Swal from 'sweetalert2';
import {
  Users, UserPlus, UserCheck, UserX, Shield, Crown, Globe2, Brain,
  Search, Filter, Download, Printer, ChevronDown, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight, Eye, Edit3, Trash2, Ban, CheckCircle,
  XCircle, Mail, Calendar, Bell, Bookmark, MessageSquare, Share2, Star,
  TrendingUp, Activity, Zap, BarChart3, PieChart, ArrowUpRight,
  SortAsc, SortDesc, RefreshCw, Settings2, Info, Sparkles, AlertTriangle,
  Moon, Sun, MapPin, Lock, Unlock, BadgeCheck, Radio, Cpu, FlaskConical,
  MoreVertical, X, Check, Clock, LogIn, Layers, Target, ToggleLeft, ToggleRight,
} from 'lucide-react';
import './UsersManagement.css';

/* ─────────────────────────────────
   SAMPLE DATA
───────────────────────────────── */
const SAMPLE_USERS = [
  { id: 1, fullName: 'Alexandra Chen', username: 'alexchen', avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=alex&backgroundColor=b6e3f4', gender: 'Female', role: 'Admin', plan: 'Enterprise', country: 'USA', categories: ['LLMs', 'AI Policy'], joinDate: '2023-01-15', emailVerified: true, articlesRead: 2840, bookmarks: 142, notifications: 387, lastLogin: '2025-02-16', status: 'Active', isBlocked: false, aiPersonalization: true, engagementScore: 98, comments: 234, shares: 89, expiryDate: '2026-01-15', theme: 'Dark' },
  { id: 2, fullName: 'Marcus Williams', username: 'mwilliams', avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=marcus&backgroundColor=c0aede', gender: 'Male', role: 'Editor', plan: 'Pro', country: 'UK', categories: ['Robotics', 'Research'], joinDate: '2023-03-22', emailVerified: true, articlesRead: 1920, bookmarks: 98, notifications: 215, lastLogin: '2025-02-15', status: 'Active', isBlocked: false, aiPersonalization: true, engagementScore: 87, comments: 156, shares: 67, expiryDate: '2025-12-31', theme: 'Light' },
  { id: 3, fullName: 'Priya Patel', username: 'priyap', avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=priya&backgroundColor=ffd5dc', gender: 'Female', role: 'Subscriber', plan: 'Pro', country: 'India', categories: ['AI Hardware', 'Global AI'], joinDate: '2023-06-10', emailVerified: true, articlesRead: 1340, bookmarks: 67, notifications: 189, lastLogin: '2025-02-14', status: 'Active', isBlocked: false, aiPersonalization: true, engagementScore: 74, comments: 88, shares: 45, expiryDate: '2025-09-10', theme: 'Dark' },
  { id: 4, fullName: 'James O\'Brien', username: 'jobrien', avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=james&backgroundColor=d1f0d1', gender: 'Male', role: 'Subscriber', plan: 'Free', country: 'Ireland', categories: ['LLMs', 'Ethics'], joinDate: '2023-09-05', emailVerified: false, articlesRead: 420, bookmarks: 12, notifications: 34, lastLogin: '2025-01-20', status: 'Inactive', isBlocked: false, aiPersonalization: false, engagementScore: 28, comments: 14, shares: 5, expiryDate: 'N/A', theme: 'Light' },
  { id: 5, fullName: 'Sofia Rossi', username: 'sofiarossi', avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=sofia&backgroundColor=ffdfbf', gender: 'Female', role: 'Editor', plan: 'Enterprise', country: 'Italy', categories: ['Research', 'Ethics', 'Robotics'], joinDate: '2023-02-28', emailVerified: true, articlesRead: 2210, bookmarks: 115, notifications: 298, lastLogin: '2025-02-17', status: 'Active', isBlocked: false, aiPersonalization: true, engagementScore: 92, comments: 198, shares: 76, expiryDate: '2026-02-28', theme: 'Dark' },
  { id: 6, fullName: 'Kwame Mensah', username: 'kwamem', avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=kwame&backgroundColor=b6e3f4', gender: 'Male', role: 'Guest', plan: 'Free', country: 'Ghana', categories: ['Global AI'], joinDate: '2024-11-01', emailVerified: false, articlesRead: 78, bookmarks: 3, notifications: 8, lastLogin: '2024-12-10', status: 'Logged Out', isBlocked: true, aiPersonalization: false, engagementScore: 9, comments: 2, shares: 1, expiryDate: 'N/A', theme: 'Light' },
  { id: 7, fullName: 'Yuki Tanaka', username: 'yukitan', avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=yuki&backgroundColor=e8d5f5', gender: 'Female', role: 'Subscriber', plan: 'Pro', country: 'Japan', categories: ['AI Hardware', 'Robotics'], joinDate: '2023-07-19', emailVerified: true, articlesRead: 1680, bookmarks: 84, notifications: 201, lastLogin: '2025-02-12', status: 'Active', isBlocked: false, aiPersonalization: true, engagementScore: 81, comments: 112, shares: 53, expiryDate: '2025-07-19', theme: 'Dark' },
  { id: 8, fullName: 'Carlos Mendez', username: 'carlosm', avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=carlos&backgroundColor=ffd5dc', gender: 'Male', role: 'Subscriber', plan: 'Free', country: 'Mexico', categories: ['LLMs'], joinDate: '2024-01-30', emailVerified: true, articlesRead: 560, bookmarks: 28, notifications: 56, lastLogin: '2025-02-01', status: 'Inactive', isBlocked: false, aiPersonalization: false, engagementScore: 35, comments: 22, shares: 8, expiryDate: 'N/A', theme: 'Light' },
];

const STATS_DATA = [
  { id: 'total',    label: 'Total Users',          value: 48291, icon: <Users size={20} />,     color: 'indigo', trend: '+12%', sub: 'vs last month' },
  { id: 'active',   label: 'Active Users',          value: 31840, icon: <Activity size={20} />,  color: 'emerald', trend: '+8%', sub: 'currently active' },
  { id: 'premium',  label: 'Premium Subscribers',   value: 12450, icon: <Crown size={20} />,     color: 'amber', trend: '+21%', sub: 'Pro + Enterprise' },
  { id: 'new',      label: 'New This Month',         value: 1834,  icon: <UserPlus size={20} />,  color: 'cyan', trend: '+5%', sub: 'registered users' },
  { id: 'country',  label: 'Top Country',            value: 'USA', icon: <Globe2 size={20} />,   color: 'violet', trend: '34%', sub: 'of total base', isText: true },
  { id: 'category', label: 'Top Category',           value: 'LLMs', icon: <Brain size={20} />,   color: 'rose', trend: '62%', sub: 'read rate', isText: true },
];

const ROLE_COLORS   = { Admin: 'role-admin', Editor: 'role-editor', Subscriber: 'role-sub', Guest: 'role-guest' };
const PLAN_COLORS   = { Enterprise: 'plan-enterprise', Pro: 'plan-pro', Free: 'plan-free' };
const STATUS_COLORS = { Active: 'status-active', Inactive: 'status-inactive', 'Logged Out': 'status-loggedout' };
const ENGAGEMENT_LEVEL = (s) => s >= 80 ? 'High' : s >= 50 ? 'Medium' : 'Low';
const ENGAGEMENT_COLOR = (s) => s >= 80 ? 'eng-high' : s >= 50 ? 'eng-med' : 'eng-low';

/* ─────────────────────────────────
   ANIMATED COUNTER
───────────────────────────────── */
function AnimatedCounter({ target, isText }) {
  const [val, setVal] = useState(isText ? target : 0);
  const ref = useRef(null);
  useEffect(() => {
    if (isText) return;
    let start = 0;
    const end = target;
    const dur = 1400;
    const step = end / (dur / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setVal(end); clearInterval(timer); }
      else setVal(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, isText]);
  return <span ref={ref}>{isText ? val : val.toLocaleString()}</span>;
}

/* ─────────────────────────────────
   TOOLTIP
───────────────────────────────── */
function Tip({ text, children }) {
  return (
    <span className="ump-tip-wrap">
      {children}
      <span className="ump-tip-box" role="tooltip">{text}</span>
    </span>
  );
}

/* ─────────────────────────────────
   TOGGLE SWITCH
───────────────────────────────── */
function Toggle({ checked, onChange, label }) {
  return (
    <button
      className={`ump-toggle ${checked ? 'ump-toggle--on' : ''}`}
      onClick={onChange}
      aria-label={label}
      title={label}
      role="switch"
      aria-checked={checked}
    >
      <span className="ump-toggle__knob" />
    </button>
  );
}

/* ─────────────────────────────────
   MAIN COMPONENT
───────────────────────────────── */
export default function UsersManagement() {
  const { isDarkMode } = useContext(ThemeContext);
  const [users, setUsers]             = useState(SAMPLE_USERS);
  const [search, setSearch]           = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterRole, setFilterRole]   = useState('All');
  const [filterPlan, setFilterPlan]   = useState('All');
  const [filterCountry, setFilterCountry] = useState('All');
  const [sortField, setSortField]     = useState('joinDate');
  const [sortDir, setSortDir]         = useState('desc');
  const [page, setPage]               = useState(1);
  const [perPage]                     = useState(5);
  const [selected, setSelected]       = useState([]);
  const [bulkAction, setBulkAction]   = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedUser, setExpandedUser] = useState(null);
  const theme = isDarkMode ? 'dark' : 'light';

  /* ── Filter + Sort ── */
  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.fullName.toLowerCase().includes(q) || u.username.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.country.toLowerCase().includes(q);
    const matchStatus  = filterStatus  === 'All' || u.status === filterStatus;
    const matchRole    = filterRole    === 'All' || u.role === filterRole;
    const matchPlan    = filterPlan    === 'All' || u.plan === filterPlan;
    const matchCountry = filterCountry === 'All' || u.country === filterCountry;
    return matchSearch && matchStatus && matchRole && matchPlan && matchCountry;
  }).sort((a, b) => {
    let va = a[sortField], vb = b[sortField];
    if (typeof va === 'string') va = va.toLowerCase();
    if (typeof vb === 'string') vb = vb.toLowerCase();
    return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated  = filtered.slice((page - 1) * perPage, page * perPage);
  const countries  = [...new Set(SAMPLE_USERS.map(u => u.country))];

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
    setPage(1);
  };

  const toggleSelect = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const selectAll    = () => setSelected(paginated.map(u => u.id));
  const clearSelect  = () => setSelected([]);

  /* ── Actions ── */
  const handleDelete = (user) => {
    Swal.fire({
      title: `<span style="font-family:'Syne',sans-serif;font-size:1.1rem">Delete User?</span>`,
      html: `<p style="font-family:'DM Sans',sans-serif;color:#9ca3af">This will permanently remove <strong style="color:#6366f1">${user.fullName}</strong> and all their data.</p>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6366f1',
      background: isDarkMode ? '#0f0f1a' : '#ffffff',
      color: isDarkMode ? '#e2e8f0' : '#1e293b',
    }).then(r => {
      if (r.isConfirmed) {
        setUsers(prev => prev.filter(u => u.id !== user.id));
        Swal.fire({ icon: 'success', title: 'Deleted!', timer: 1800, showConfirmButton: false, background: isDarkMode ? '#0f0f1a' : '#fff', color: isDarkMode ? '#e2e8f0' : '#1e293b' });
      }
    });
  };

  const handleBlock = (user) => {
    const action = user.isBlocked ? 'Unblock' : 'Block';
    Swal.fire({
      title: `<span style="font-family:'Syne',sans-serif">${action} ${user.fullName}?</span>`,
      html: `<p style="font-family:'DM Sans',sans-serif;color:#9ca3af">${user.isBlocked ? 'This will restore their access.' : 'This will prevent them from logging in.'}</p>`,
      icon: user.isBlocked ? 'question' : 'warning',
      showCancelButton: true,
      confirmButtonText: `Yes, ${action}`,
      confirmButtonColor: user.isBlocked ? '#10b981' : '#f59e0b',
      cancelButtonColor: '#6b7280',
      background: isDarkMode ? '#0f0f1a' : '#ffffff',
      color: isDarkMode ? '#e2e8f0' : '#1e293b',
    }).then(r => {
      if (r.isConfirmed) {
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isBlocked: !u.isBlocked } : u));
        Swal.fire({ icon: 'success', title: `User ${action}ed!`, timer: 1500, showConfirmButton: false, background: isDarkMode ? '#0f0f1a' : '#fff', color: isDarkMode ? '#e2e8f0' : '#1e293b' });
      }
    });
  };

  const handleAddUser = () => {
    Swal.fire({
      title: `<span style="font-family:'Syne',sans-serif">Add New User</span>`,
      html: `<p style="font-family:'DM Sans',sans-serif;color:#9ca3af">Navigate to the full Add User form to create a new account with all required details.</p>`,
      icon: 'info',
      confirmButtonText: 'Open Form',
      confirmButtonColor: '#6366f1',
      background: isDarkMode ? '#0f0f1a' : '#ffffff',
      color: isDarkMode ? '#e2e8f0' : '#1e293b',
    });
  };

  const handleEdit = (user) => {
    Swal.fire({
      title: `<span style="font-family:'Syne',sans-serif">Edit ${user.fullName}</span>`,
      html: `<p style="font-family:'DM Sans',sans-serif;color:#9ca3af">Opening edit panel for <strong style="color:#6366f1">@${user.username}</strong></p>`,
      icon: 'info',
      confirmButtonText: 'Open Editor',
      confirmButtonColor: '#6366f1',
      background: isDarkMode ? '#0f0f1a' : '#ffffff',
      color: isDarkMode ? '#e2e8f0' : '#1e293b',
    });
  };

  const handleViewDetails = (user) => setExpandedUser(expandedUser?.id === user.id ? null : user);

  const handleBulkAction = () => {
    if (!bulkAction || selected.length === 0) return;
    Swal.fire({
      title: `<span style="font-family:'Syne',sans-serif">Bulk Action: ${bulkAction}</span>`,
      html: `<p style="font-family:'DM Sans',sans-serif;color:#9ca3af">Apply <strong style="color:#6366f1">${bulkAction}</strong> to <strong>${selected.length}</strong> selected users?</p>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Apply',
      confirmButtonColor: '#6366f1',
      background: isDarkMode ? '#0f0f1a' : '#fff',
      color: isDarkMode ? '#e2e8f0' : '#1e293b',
    }).then(r => { if (r.isConfirmed) { clearSelect(); setBulkAction(''); } });
  };

  const handleExport = (type) => {
    Swal.fire({
      icon: 'success',
      title: `Exporting as ${type}…`,
      text: `Your ${type} file will be ready shortly.`,
      timer: 2000,
      showConfirmButton: false,
      background: isDarkMode ? '#0f0f1a' : '#fff',
      color: isDarkMode ? '#e2e8f0' : '#1e293b',
    });
  };

  const handlePrint = () => window.print();

  const handleToggleAI = (user) => {
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, aiPersonalization: !u.aiPersonalization } : u));
  };

  const SortBtn = ({ field, label }) => (
    <button className={`ump-sort-btn ${sortField === field ? 'ump-sort-btn--active' : ''}`} onClick={() => handleSort(field)}>
      {label}
      {sortField === field ? (sortDir === 'asc' ? <SortAsc size={12} /> : <SortDesc size={12} />) : <SortAsc size={12} className="ump-sort-btn__inactive" />}
    </button>
  );

  return (
    <main className={`ump-page ${theme}`} id="ump-users-management-page">

      {/* ── BG DECORATION ── */}
      <div className="ump-bg-orb ump-bg-orb--1" aria-hidden="true" />
      <div className="ump-bg-orb ump-bg-orb--2" aria-hidden="true" />
      <div className="ump-bg-grid" aria-hidden="true" />

      {/* ══════════════════════════════
          PAGE HEADER
      ══════════════════════════════ */}
      <header className="ump-page-header">
        <div className="ump-page-header__left">
          <div className="ump-page-header__icon">
            <Users size={22} />
            <span className="ump-page-header__icon-ring" aria-hidden="true" />
          </div>
          <div>
            <h1 className="ump-page-header__title">Users Management</h1>
            <p className="ump-page-header__sub">
              <Brain size={12} /> AI News Platform · <span>{filtered.length} records</span>
            </p>
          </div>
        </div>
        <div className="ump-page-header__actions">
          <button className="ump-btn ump-btn--outline" onClick={handlePrint} title="Print"><Printer size={15} /> Print</button>
          <button className="ump-btn ump-btn--outline" onClick={() => handleExport('CSV')} title="Export CSV"><Download size={15} /> CSV</button>
          <button className="ump-btn ump-btn--outline" onClick={() => handleExport('PDF')} title="Export PDF"><Download size={15} /> PDF</button>
          <button className="ump-btn ump-btn--primary" onClick={handleAddUser}><UserPlus size={15} /> Add User</button>
        </div>
      </header>

      {/* ══════════════════════════════
          STATS CARDS
      ══════════════════════════════ */}
      <section className="ump-stats-grid" aria-label="Summary statistics">
        {STATS_DATA.map((s, i) => (
          <article key={s.id} className={`ump-stat-card ump-stat-card--${s.color}`} style={{ '--ump-delay': `${i * 80}ms` }}>
            <div className="ump-stat-card__glow" aria-hidden="true" />
            <div className="ump-stat-card__top">
              <span className="ump-stat-card__icon">{s.icon}</span>
              <span className="ump-stat-card__trend">
                <ArrowUpRight size={11} /> {s.trend}
              </span>
            </div>
            <div className="ump-stat-card__value">
              <AnimatedCounter target={s.value} isText={s.isText} />
            </div>
            <div className="ump-stat-card__label">{s.label}</div>
            <div className="ump-stat-card__sub">{s.sub}</div>
          </article>
        ))}
      </section>

      {/* ══════════════════════════════
          INSIGHTS SECTION
      ══════════════════════════════ */}
      <section className="ump-insights-section">
        <div className="ump-insights-section__header">
          <Sparkles size={16} />
          <h2 className="ump-section-title">Platform Intelligence Overview</h2>
        </div>
        <div className="ump-insights-grid">
          <article className="ump-insight-card">
            <div className="ump-insight-card__icon-wrap ump-insight-card__icon-wrap--indigo"><Brain size={18} /></div>
            <h3 className="ump-insight-card__title">AI Personalization Engine</h3>
            <p className="ump-insight-card__body">Our adaptive AI personalization engine analyzes over 140 behavioral signals per user — including reading velocity, topic dwell time, scroll depth, re-read frequency, bookmark clustering, and share context — to construct an evolving "Interest Graph" for each subscriber. This graph powers hyper-relevant news feeds that update in real-time as new articles are published. Users with AI Personalization enabled see <strong>3.8× higher engagement scores</strong> and spend an average of <strong>22 additional minutes per session</strong> on the platform compared to non-personalized users.</p>
            <div className="ump-insight-card__stat-row">
              <span className="ump-insight-chip"><Zap size={11} /> 78% users enabled</span>
              <span className="ump-insight-chip ump-insight-chip--green"><TrendingUp size={11} /> +3.8× engagement</span>
            </div>
          </article>

          <article className="ump-insight-card">
            <div className="ump-insight-card__icon-wrap ump-insight-card__icon-wrap--emerald"><BarChart3 size={18} /></div>
            <h3 className="ump-insight-card__title">Engagement Score Methodology</h3>
            <p className="ump-insight-card__body">The Engagement Score (0–100) is a composite metric derived from a weighted algorithm incorporating: articles read per session (25%), comment activity (20%), bookmarking behavior (15%), share frequency (20%), notification interaction rate (10%), and AI recommendations accepted (10%). Scores above 80 classify users as <strong>Power Readers</strong>, 50–79 as <strong>Regular Readers</strong>, and below 50 as <strong>Casual Browsers</strong>. These segments directly inform our editorial calendar, push notification timing, and premium content gating strategies.</p>
            <div className="ump-insight-card__stat-row">
              <span className="ump-insight-chip ump-insight-chip--amber"><Star size={11} /> Avg score: 64.2</span>
              <span className="ump-insight-chip"><Target size={11} /> 26% Power Readers</span>
            </div>
          </article>

          <article className="ump-insight-card">
            <div className="ump-insight-card__icon-wrap ump-insight-card__icon-wrap--amber"><BadgeCheck size={18} /></div>
            <h3 className="ump-insight-card__title">Email Verification & Trust</h3>
            <p className="ump-insight-card__body">Email-verified accounts exhibit dramatically superior platform health metrics. Verified users report a <strong>94% lower churn rate</strong>, <strong>6.2× more newsletter opens</strong>, and a <strong>41% higher likelihood of upgrading to premium plans</strong>. Unverified accounts are restricted to 5 articles per day, cannot post comments, and are excluded from the AI personalization engine. The verification pipeline uses a double opt-in flow with 72-hour token expiry, DKIM signing, and spam-trap honeypot detection to maintain deliverability above 99.2%.</p>
            <div className="ump-insight-card__stat-row">
              <span className="ump-insight-chip ump-insight-chip--green"><CheckCircle size={11} /> 87% verified</span>
              <span className="ump-insight-chip"><Mail size={11} /> 99.2% deliverability</span>
            </div>
          </article>

          <article className="ump-insight-card">
            <div className="ump-insight-card__icon-wrap ump-insight-card__icon-wrap--violet"><Crown size={18} /></div>
            <h3 className="ump-insight-card__title">Subscription Tier Benefits</h3>
            <p className="ump-insight-card__body"><strong>Free:</strong> 10 articles/day, basic topic filters, standard notifications, no AI personalization. <strong>Pro ($12.99/mo):</strong> Unlimited articles, full AI personalization, advanced filtering, priority notifications, PDF exports, and ad-free experience. <strong>Enterprise ($49.99/mo):</strong> Everything in Pro plus team seats, custom RSS feeds, API access, white-label newsletter, dedicated analyst reports, and SLA-backed uptime guarantees. Pro and Enterprise users collectively generate <strong>84% of total platform revenue</strong> despite representing only 26% of the user base — a testament to the power of deep feature engagement.</p>
            <div className="ump-insight-card__stat-row">
              <span className="ump-insight-chip ump-insight-chip--violet"><Crown size={11} /> 26% premium users</span>
              <span className="ump-insight-chip ump-insight-chip--amber"><TrendingUp size={11} /> 84% of revenue</span>
            </div>
          </article>
        </div>
      </section>

      {/* ══════════════════════════════
          CONTROLS BAR
      ══════════════════════════════ */}
      <section className="ump-controls-bar">
        {/* Search */}
        <div className="ump-search-wrap">
          <Search size={15} className="ump-search-wrap__icon" />
          <input
            type="search"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, username, country…"
            className="ump-search-input"
            aria-label="Search users"
          />
          {search && <button className="ump-search-clear" onClick={() => setSearch('')} aria-label="Clear"><X size={13} /></button>}
        </div>

        {/* Sort Buttons */}
        <div className="ump-sort-row">
          <span className="ump-sort-row__label"><SortAsc size={13} /> Sort:</span>
          <SortBtn field="fullName"    label="Name" />
          <SortBtn field="joinDate"    label="Join Date" />
          <SortBtn field="lastLogin"   label="Last Login" />
          <SortBtn field="engagementScore" label="Engagement" />
          <SortBtn field="articlesRead" label="Articles" />
        </div>

        {/* Bulk + Filter toggle */}
        <div className="ump-controls-right">
          <select className="ump-select" value={bulkAction} onChange={e => setBulkAction(e.target.value)} aria-label="Bulk action">
            <option value="">Bulk Actions</option>
            <option value="Delete">Delete Selected</option>
            <option value="Block">Block Selected</option>
            <option value="Unblock">Unblock Selected</option>
            <option value="Export">Export Selected</option>
          </select>
          {bulkAction && selected.length > 0 && (
            <button className="ump-btn ump-btn--danger-sm" onClick={handleBulkAction}>Apply ({selected.length})</button>
          )}
          <button className={`ump-btn ump-btn--outline ${showFilters ? 'ump-btn--active' : ''}`} onClick={() => setShowFilters(v => !v)}>
            <Filter size={14} /> Filters {showFilters ? <ChevronDown size={12} style={{ transform: 'rotate(180deg)' }} /> : <ChevronDown size={12} />}
          </button>
          <button className="ump-btn ump-btn--ghost" onClick={() => { setSearch(''); setFilterStatus('All'); setFilterRole('All'); setFilterPlan('All'); setFilterCountry('All'); setPage(1); }} title="Reset all filters">
            <RefreshCw size={14} />
          </button>
        </div>
      </section>

      {/* ── FILTER PANEL ── */}
      <div className={`ump-filter-panel ${showFilters ? 'ump-filter-panel--open' : ''}`}>
        <div className="ump-filter-panel__inner">
          <div className="ump-filter-group">
            <label className="ump-filter-label"><Activity size={12} /> Status</label>
            <select className="ump-select" value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}>
              <option>All</option>
              <option>Active</option>
              <option>Inactive</option>
              <option>Logged Out</option>
            </select>
          </div>
          <div className="ump-filter-group">
            <label className="ump-filter-label"><Shield size={12} /> Role</label>
            <select className="ump-select" value={filterRole} onChange={e => { setFilterRole(e.target.value); setPage(1); }}>
              <option>All</option>
              <option>Admin</option>
              <option>Editor</option>
              <option>Subscriber</option>
              <option>Guest</option>
            </select>
          </div>
          <div className="ump-filter-group">
            <label className="ump-filter-label"><Crown size={12} /> Plan</label>
            <select className="ump-select" value={filterPlan} onChange={e => { setFilterPlan(e.target.value); setPage(1); }}>
              <option>All</option>
              <option>Enterprise</option>
              <option>Pro</option>
              <option>Free</option>
            </select>
          </div>
          <div className="ump-filter-group">
            <label className="ump-filter-label"><Globe2 size={12} /> Country</label>
            <select className="ump-select" value={filterCountry} onChange={e => { setFilterCountry(e.target.value); setPage(1); }}>
              <option>All</option>
              {countries.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="ump-filter-group">
            <label className="ump-filter-label"><CheckCircle size={12} /> Verification</label>
            <select className="ump-select">
              <option>All</option>
              <option>Verified</option>
              <option>Unverified</option>
            </select>
          </div>
          <div className="ump-filter-group">
            <label className="ump-filter-label"><Brain size={12} /> AI Enabled</label>
            <select className="ump-select">
              <option>All</option>
              <option>Enabled</option>
              <option>Disabled</option>
            </select>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════
          TABLE / CARDS
      ══════════════════════════════ */}
      <section className="ump-table-section">
        {/* Select-all bar */}
        {selected.length > 0 && (
          <div className="ump-selection-bar">
            <Check size={14} /> <strong>{selected.length}</strong> users selected
            <button className="ump-selection-bar__clear" onClick={clearSelect}><X size={12} /> Clear</button>
          </div>
        )}

        <div className="ump-table-wrap">
          <table className="ump-table" aria-label="Users table">
            <thead className="ump-table__head">
              <tr>
                <th className="ump-th ump-th--check">
                  <input type="checkbox" className="ump-checkbox" checked={selected.length === paginated.length && paginated.length > 0} onChange={selected.length === paginated.length ? clearSelect : selectAll} aria-label="Select all" />
                </th>
                <th className="ump-th">User</th>
                <th className="ump-th">Role / Plan</th>
                <th className="ump-th">Status</th>
                <th className="ump-th">Engagement</th>
                <th className="ump-th">Activity</th>
                <th className="ump-th">Joined</th>
                <th className="ump-th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 && (
                <tr>
                  <td colSpan="8" className="ump-td ump-td--empty">
                    <div className="ump-empty-state">
                      <Users size={36} />
                      <p>No users match your filters.</p>
                      <button className="ump-btn ump-btn--outline" onClick={() => { setSearch(''); setFilterStatus('All'); setFilterRole('All'); setFilterPlan('All'); setFilterCountry('All'); }}>Reset Filters</button>
                    </div>
                  </td>
                </tr>
              )}
              {paginated.map((user, ri) => (
                <>
                  <tr
                    key={user.id}
                    className={`ump-tr ${selected.includes(user.id) ? 'ump-tr--selected' : ''} ${expandedUser?.id === user.id ? 'ump-tr--expanded' : ''}`}
                    style={{ '--ump-row-delay': `${ri * 40}ms` }}
                  >
                    {/* Checkbox */}
                    <td className="ump-td ump-td--check">
                      <input type="checkbox" className="ump-checkbox" checked={selected.includes(user.id)} onChange={() => toggleSelect(user.id)} aria-label={`Select ${user.fullName}`} />
                    </td>

                    {/* User Info */}
                    <td className="ump-td">
                      <div className="ump-user-cell">
                        <div className="ump-user-avatar-wrap">
                          <img src={user.avatar} alt={user.fullName} className="ump-user-avatar" loading="lazy" />
                          <span className={`ump-user-status-dot ${STATUS_COLORS[user.status]}`} aria-label={user.status} />
                        </div>
                        <div className="ump-user-info">
                          <span className="ump-user-name">{user.fullName}</span>
                          <span className="ump-user-username">@{user.username}</span>
                          <div className="ump-user-meta">
                            <Tip text={`Gender: ${user.gender}`}>
                              <span className={`ump-gender-icon ${user.gender === 'Male' ? 'ump-gender-icon--male' : 'ump-gender-icon--female'}`}>
                                {user.gender === 'Male' ? '♂' : '♀'}
                              </span>
                            </Tip>
                            <Tip text={`Country: ${user.country}`}>
                              <span className="ump-user-country"><MapPin size={10} /> {user.country}</span>
                            </Tip>
                            <Tip text={`Email ${user.emailVerified ? 'Verified' : 'Not Verified'}`}>
                              {user.emailVerified
                                ? <BadgeCheck size={13} className="ump-icon-verified" />
                                : <XCircle size={13} className="ump-icon-unverified" />
                              }
                            </Tip>
                            <Tip text={`Theme: ${user.theme}`}>
                              {user.theme === 'Dark' ? <Moon size={11} className="ump-icon-theme" /> : <Sun size={11} className="ump-icon-theme" />}
                            </Tip>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role / Plan */}
                    <td className="ump-td">
                      <div className="ump-role-plan-cell">
                        <span className={`ump-badge ump-badge--role ${ROLE_COLORS[user.role]}`}>
                          <Shield size={10} /> {user.role}
                        </span>
                        <span className={`ump-badge ump-badge--plan ${PLAN_COLORS[user.plan]}`}>
                          <Crown size={10} /> {user.plan}
                        </span>
                        {user.plan !== 'Free' && (
                          <span className="ump-expiry-tag">
                            <Clock size={9} /> {user.expiryDate}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="ump-td">
                      <div className="ump-status-cell">
                        <span className={`ump-status-badge ${STATUS_COLORS[user.status]}`}>
                          {user.status === 'Active' && <Radio size={9} className="ump-status-badge__dot" />}
                          {user.status}
                        </span>
                        <Tip text={user.isBlocked ? 'Account Blocked' : 'Account Active'}>
                          <span className={`ump-blocked-badge ${user.isBlocked ? 'ump-blocked-badge--yes' : 'ump-blocked-badge--no'}`}>
                            {user.isBlocked ? <><Lock size={9} /> Blocked</> : <><Unlock size={9} /> Open</>}
                          </span>
                        </Tip>
                        <Tip text={`AI Personalization ${user.aiPersonalization ? 'On' : 'Off'}`}>
                          <Toggle checked={user.aiPersonalization} onChange={() => handleToggleAI(user)} label="AI Personalization" />
                        </Tip>
                      </div>
                    </td>

                    {/* Engagement */}
                    <td className="ump-td">
                      <div className="ump-eng-cell">
                        <div className="ump-eng-score-wrap">
                          <span className={`ump-eng-score ${ENGAGEMENT_COLOR(user.engagementScore)}`}>{user.engagementScore}</span>
                          <span className="ump-eng-level">{ENGAGEMENT_LEVEL(user.engagementScore)}</span>
                        </div>
                        <div className="ump-eng-bar-wrap">
                          <div className="ump-eng-bar" style={{ '--ump-eng-pct': `${user.engagementScore}%`, '--ump-eng-color': user.engagementScore >= 80 ? '#10b981' : user.engagementScore >= 50 ? '#f59e0b' : '#ef4444' }} />
                        </div>
                        <div className="ump-eng-cats">
                          {user.categories.slice(0, 2).map(c => (
                            <Tip key={c} text={`Topic: ${c}`}><span className="ump-cat-chip"><Brain size={9} /> {c}</span></Tip>
                          ))}
                          {user.categories.length > 2 && <span className="ump-cat-chip ump-cat-chip--more">+{user.categories.length - 2}</span>}
                        </div>
                      </div>
                    </td>

                    {/* Activity */}
                    <td className="ump-td">
                      <div className="ump-activity-cell">
                        <Tip text="Articles Read"><span className="ump-act-item"><Eye size={11} /> {user.articlesRead.toLocaleString()}</span></Tip>
                        <Tip text="Bookmarked Articles"><span className="ump-act-item"><Bookmark size={11} /> {user.bookmarks}</span></Tip>
                        <Tip text="Comments Posted"><span className="ump-act-item"><MessageSquare size={11} /> {user.comments}</span></Tip>
                        <Tip text="Total Shares"><span className="ump-act-item"><Share2 size={11} /> {user.shares}</span></Tip>
                        <Tip text="Notifications Received"><span className="ump-act-item"><Bell size={11} /> {user.notifications}</span></Tip>
                      </div>
                    </td>

                    {/* Joined */}
                    <td className="ump-td">
                      <div className="ump-date-cell">
                        <Tip text="Registration Date"><span className="ump-date-item"><Calendar size={10} /> {user.joinDate}</span></Tip>
                        <Tip text="Last Login"><span className="ump-date-item ump-date-item--muted"><LogIn size={10} /> {user.lastLogin}</span></Tip>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="ump-td">
                      <div className="ump-actions-cell">
                        <Tip text="View Details">
                          <button className="ump-action-btn ump-action-btn--view" onClick={() => handleViewDetails(user)} aria-label="View details">
                            <Eye size={14} />
                          </button>
                        </Tip>
                        <Tip text="Edit User">
                          <button className="ump-action-btn ump-action-btn--edit" onClick={() => handleEdit(user)} aria-label="Edit user">
                            <Edit3 size={14} />
                          </button>
                        </Tip>
                        <Tip text={user.isBlocked ? 'Unblock User' : 'Block User'}>
                          <button className={`ump-action-btn ${user.isBlocked ? 'ump-action-btn--unblock' : 'ump-action-btn--block'}`} onClick={() => handleBlock(user)} aria-label={user.isBlocked ? 'Unblock' : 'Block'}>
                            {user.isBlocked ? <Unlock size={14} /> : <Ban size={14} />}
                          </button>
                        </Tip>
                        <Tip text="Delete User">
                          <button className="ump-action-btn ump-action-btn--delete" onClick={() => handleDelete(user)} aria-label="Delete user">
                            <Trash2 size={14} />
                          </button>
                        </Tip>
                      </div>
                    </td>
                  </tr>

                  {/* ── EXPANDED DETAIL ROW ── */}
                  {expandedUser?.id === user.id && (
                    <tr className="ump-detail-row" key={`${user.id}-detail`}>
                      <td colSpan="8" className="ump-td ump-td--detail">
                        <div className="ump-detail-panel">
                          <div className="ump-detail-panel__close">
                            <button onClick={() => setExpandedUser(null)} className="ump-action-btn ump-action-btn--ghost"><X size={14} /></button>
                          </div>
                          <div className="ump-detail-grid">
                            <div className="ump-detail-block">
                              <span className="ump-detail-label"><Users size={11} /> Full Name</span>
                              <span className="ump-detail-value">{user.fullName}</span>
                            </div>
                            <div className="ump-detail-block">
                              <span className="ump-detail-label"><Settings2 size={11} /> Username</span>
                              <span className="ump-detail-value">@{user.username}</span>
                            </div>
                            <div className="ump-detail-block">
                              <span className="ump-detail-label"><Globe2 size={11} /> Country</span>
                              <span className="ump-detail-value">{user.country}</span>
                            </div>
                            <div className="ump-detail-block">
                              <span className="ump-detail-label"><Shield size={11} /> Role</span>
                              <span className={`ump-badge ump-badge--role ${ROLE_COLORS[user.role]}`}><Shield size={9} /> {user.role}</span>
                            </div>
                            <div className="ump-detail-block">
                              <span className="ump-detail-label"><Crown size={11} /> Plan</span>
                              <span className={`ump-badge ump-badge--plan ${PLAN_COLORS[user.plan]}`}><Crown size={9} /> {user.plan}</span>
                            </div>
                            <div className="ump-detail-block">
                              <span className="ump-detail-label"><Clock size={11} /> Plan Expiry</span>
                              <span className="ump-detail-value">{user.expiryDate}</span>
                            </div>
                            <div className="ump-detail-block">
                              <span className="ump-detail-label"><Mail size={11} /> Email Verified</span>
                              <span className="ump-detail-value">{user.emailVerified ? <BadgeCheck size={14} className="ump-icon-verified" /> : <XCircle size={14} className="ump-icon-unverified" />} {user.emailVerified ? 'Verified' : 'Unverified'}</span>
                            </div>
                            <div className="ump-detail-block">
                              <span className="ump-detail-label"><Activity size={11} /> Status</span>
                              <span className={`ump-status-badge ${STATUS_COLORS[user.status]}`}>{user.status}</span>
                            </div>
                            <div className="ump-detail-block">
                              <span className="ump-detail-label"><Lock size={11} /> Blocked</span>
                              <span className="ump-detail-value">{user.isBlocked ? 'Yes' : 'No'}</span>
                            </div>
                            <div className="ump-detail-block">
                              <span className="ump-detail-label"><Brain size={11} /> AI Personalization</span>
                              <span className="ump-detail-value">{user.aiPersonalization ? <><Sparkles size={12} className="ump-icon-ai" /> Enabled</> : 'Disabled'}</span>
                            </div>
                            <div className="ump-detail-block">
                              <span className="ump-detail-label"><Eye size={11} /> Articles Read</span>
                              <span className="ump-detail-value">{user.articlesRead.toLocaleString()}</span>
                            </div>
                            <div className="ump-detail-block">
                              <span className="ump-detail-label"><Bookmark size={11} /> Bookmarks</span>
                              <span className="ump-detail-value">{user.bookmarks}</span>
                            </div>
                            <div className="ump-detail-block">
                              <span className="ump-detail-label"><MessageSquare size={11} /> Comments</span>
                              <span className="ump-detail-value">{user.comments}</span>
                            </div>
                            <div className="ump-detail-block">
                              <span className="ump-detail-label"><Share2 size={11} /> Shares</span>
                              <span className="ump-detail-value">{user.shares}</span>
                            </div>
                            <div className="ump-detail-block">
                              <span className="ump-detail-label"><Bell size={11} /> Notifications</span>
                              <span className="ump-detail-value">{user.notifications}</span>
                            </div>
                            <div className="ump-detail-block">
                              <span className="ump-detail-label"><Zap size={11} /> Engagement Score</span>
                              <span className={`ump-eng-score ${ENGAGEMENT_COLOR(user.engagementScore)}`}>{user.engagementScore}/100</span>
                            </div>
                            <div className="ump-detail-block">
                              <span className="ump-detail-label"><Layers size={11} /> Categories</span>
                              <span className="ump-detail-value">{user.categories.join(', ')}</span>
                            </div>
                            <div className="ump-detail-block">
                              <span className="ump-detail-label">{user.theme === 'Dark' ? <Moon size={11} /> : <Sun size={11} />} Theme</span>
                              <span className="ump-detail-value">{user.theme}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION ── */}
        <div className="ump-pagination">
          <span className="ump-pagination__info">
            Showing <strong>{((page - 1) * perPage) + 1}–{Math.min(page * perPage, filtered.length)}</strong> of <strong>{filtered.length}</strong> users
          </span>
          <div className="ump-pagination__btns">
            <button className="ump-page-btn" onClick={() => setPage(1)} disabled={page === 1} title="First"><ChevronsLeft size={14} /></button>
            <button className="ump-page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} title="Previous"><ChevronLeft size={14} /></button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && arr[idx - 1] < p - 1) acc.push('…');
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) => p === '…'
                ? <span key={`ellipsis-${i}`} className="ump-page-ellipsis">…</span>
                : <button key={p} className={`ump-page-btn ${page === p ? 'ump-page-btn--active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              )}
            <button className="ump-page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} title="Next"><ChevronRight size={14} /></button>
            <button className="ump-page-btn" onClick={() => setPage(totalPages)} disabled={page === totalPages} title="Last"><ChevronsRight size={14} /></button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          DEEP INSIGHTS SECTION
      ══════════════════════════════ */}
      <section className="ump-deep-section">
        <div className="ump-deep-section__header">
          <FlaskConical size={16} />
          <h2 className="ump-section-title">User Activity Analysis & Predictions</h2>
        </div>
        <div className="ump-deep-grid">
          <article className="ump-deep-card">
            <div className="ump-deep-card__num">01</div>
            <h3 className="ump-deep-card__title"><TrendingUp size={16} /> Consumption Behavior Trends</h3>
            <p className="ump-deep-card__body">Analysis of 48,000+ user sessions reveals that AI news consumption peaks between <strong>7–9 AM</strong> and <strong>8–10 PM</strong> local time, aligning with commute windows and evening relaxation periods. Mobile devices account for <strong>67%</strong> of all article reads, while desktop remains dominant for long-form research articles exceeding 2,000 words. Users who read 5+ articles in a single session have a <strong>3.2× higher 30-day retention rate</strong>. Our predictive model forecasts a <strong>34% increase in video-embedded AI explainers</strong> demand by Q3 2025, driven by the rising "show-don't-tell" preference among Gen Z subscribers aged 18–26.</p>
          </article>
          <article className="ump-deep-card">
            <div className="ump-deep-card__num">02</div>
            <h3 className="ump-deep-card__title"><Target size={16} /> Role-Based Access & Permissions</h3>
            <p className="ump-deep-card__body"><strong>Admin:</strong> Full platform access including user management, analytics, content moderation, API configuration, and financial dashboards. Admins can assign and revoke roles, manage subscription overrides, and access audit logs. <strong>Editor:</strong> Article authoring, scheduling, tagging, and media upload rights. Can moderate comments on their own content. <strong>Subscriber:</strong> Reading, bookmarking, commenting (with verified email), sharing, and newsletter management. <strong>Guest:</strong> Read-only access to 10 free articles per day with no personalization features. Role upgrades require manual admin approval or automated rule-based triggers based on engagement thresholds.</p>
          </article>
          <article className="ump-deep-card">
            <div className="ump-deep-card__num">03</div>
            <h3 className="ump-deep-card__title"><Cpu size={16} /> AI Recommendation Engine</h3>
            <p className="ump-deep-card__body">The recommendation engine operates on a hybrid architecture combining <strong>collaborative filtering</strong> (users similar to you also read…), <strong>content-based filtering</strong> (articles similar to what you've read), and <strong>knowledge graph traversal</strong> (related AI concepts and entities). It ingests 140+ behavioral signals in real-time via a Kafka event stream, retrains embeddings every 6 hours, and serves personalized ranked article lists with sub-80ms latency via Redis-cached model inference. Recommendation acceptance rate stands at <strong>72%</strong> for Pro users and <strong>81%</strong> for Enterprise users who have accumulated 200+ behavioral events.</p>
          </article>
          <article className="ump-deep-card">
            <div className="ump-deep-card__num">04</div>
            <h3 className="ump-deep-card__title"><PieChart size={16} /> Engagement Prediction Model</h3>
            <p className="ump-deep-card__body">Our LSTM-based churn prediction model, trained on 18 months of behavioral data, can identify users at risk of churning 21 days before actual cancellation with <strong>89% precision</strong>. Key churn signals include: engagement score dropping below 30 for 7 consecutive days, notification open rate below 5%, no bookmark activity for 14 days, and absence of session starts for 10+ days. When these signals trigger, the platform automatically dispatches a personalized re-engagement email sequence with AI-curated content based on historical preferences, recovering <strong>31%</strong> of at-risk users through targeted interventions.</p>
          </article>
        </div>
      </section>

    </main>
  );
}