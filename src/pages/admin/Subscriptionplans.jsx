import { useState, useEffect, useContext, useCallback } from 'react';
import {
  Plus, Edit2, Trash2, Eye, EyeOff, Save, X, RefreshCw, Search,
  ChevronDown, ChevronUp, Users, DollarSign, TrendingUp, BarChart2,
  Check, AlertTriangle, Globe, Zap, Star, Crown, Copy, ToggleLeft,
  ToggleRight, Filter, Download, Upload, ArrowUp, ArrowDown,
  CheckCircle, Clock, Flame, Shield, Award, Cpu, Settings,
  FileText, ExternalLink, MoreVertical, Info
} from 'lucide-react';
import Swal from 'sweetalert2';
import { ThemeContext } from '../../context/ThemeContext';

const USER_TOKEN_KEY = 'ai_news_user_token';
const getUserToken = () => localStorage.getItem(USER_TOKEN_KEY);

/* ─── MOCK DATA ──────────────────────────────────────────── */
const MOCK_PLANS = [
  {
    _id: 'plan-free', name: 'Free', slug: 'free', tagline: 'Explore AI news without limits',
    price: { monthly: 0, annual: 0 },
    isActive: true, isVisible: true, isPopular: false,
    badge: null, color: '#888888', icon: 'globe', order: 1,
    features: [
      { label: '50 articles per month', included: true },
      { label: 'Breaking news access', included: true },
      { label: 'Basic search', included: true },
      { label: 'Comment on articles', included: true },
      { label: '1 bookmark list', included: true },
      { label: 'Weekly newsletter', included: true },
      { label: 'Analytics dashboard', included: false },
      { label: 'Deep-dive reports', included: false },
      { label: 'Early access', included: false },
      { label: 'Ad-free experience', included: false },
      { label: 'Priority support', included: false },
      { label: 'API access', included: false },
    ],
    limits: { articlesPerMonth: 50, bookmarkLists: 1, apiCalls: 0, teamMembers: 1 },
    stats: { subscribers: 28400, mrr: 0, churnRate: 12.4 },
    createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-11-01T00:00:00Z',
  },
  {
    _id: 'plan-pro', name: 'Pro', slug: 'pro', tagline: 'For AI enthusiasts who need more',
    price: { monthly: 12, annual: 9 },
    isActive: true, isVisible: true, isPopular: true,
    badge: 'Most Popular', color: '#e63946', icon: 'zap', order: 2,
    features: [
      { label: 'Unlimited articles', included: true },
      { label: 'Breaking news access', included: true },
      { label: 'Advanced search', included: true },
      { label: 'Comment on articles', included: true },
      { label: 'Unlimited bookmark lists', included: true },
      { label: 'Daily newsletter', included: true },
      { label: 'Analytics dashboard', included: true },
      { label: 'Deep-dive reports', included: true },
      { label: '24h early access', included: true },
      { label: 'Ad-free experience', included: true },
      { label: 'Priority support', included: false },
      { label: 'API access', included: false },
    ],
    limits: { articlesPerMonth: -1, bookmarkLists: -1, apiCalls: 0, teamMembers: 1 },
    stats: { subscribers: 6820, mrr: 81840, churnRate: 4.2 },
    createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-11-15T00:00:00Z',
  },
  {
    _id: 'plan-elite', name: 'Elite', slug: 'elite', tagline: 'Everything Pro, plus exclusive perks',
    price: { monthly: 24, annual: 19 },
    isActive: true, isVisible: true, isPopular: false,
    badge: 'Best Value', color: '#ffd166', icon: 'star', order: 3,
    features: [
      { label: 'Unlimited articles', included: true },
      { label: 'Breaking news access', included: true },
      { label: 'Advanced search', included: true },
      { label: 'Comment on articles', included: true },
      { label: 'Unlimited bookmark lists', included: true },
      { label: 'Real-time alerts newsletter', included: true },
      { label: 'Analytics dashboard', included: true },
      { label: 'Deep-dive reports', included: true },
      { label: '72h early access', included: true },
      { label: 'Ad-free experience', included: true },
      { label: 'Priority support (24h)', included: true },
      { label: 'API access (10k calls/mo)', included: true },
    ],
    limits: { articlesPerMonth: -1, bookmarkLists: -1, apiCalls: 10000, teamMembers: 1 },
    stats: { subscribers: 2190, mrr: 52560, churnRate: 2.8 },
    createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-12-01T00:00:00Z',
  },
  {
    _id: 'plan-enterprise', name: 'Enterprise', slug: 'enterprise', tagline: 'Custom solutions for teams',
    price: { monthly: null, annual: null },
    isActive: true, isVisible: true, isPopular: false,
    badge: 'Custom Pricing', color: '#118ab2', icon: 'crown', order: 4,
    features: [
      { label: 'Everything in Elite', included: true },
      { label: 'Unlimited team members', included: true },
      { label: 'Custom content feeds', included: true },
      { label: 'White-label options', included: true },
      { label: 'Dedicated account manager', included: true },
      { label: 'SLA uptime guarantee', included: true },
      { label: 'SSO & SAML', included: true },
      { label: 'Audit logs', included: true },
      { label: 'Unlimited API access', included: true },
      { label: 'Custom integrations', included: true },
      { label: 'Priority support (1h)', included: true },
      { label: 'Onboarding sessions', included: true },
    ],
    limits: { articlesPerMonth: -1, bookmarkLists: -1, apiCalls: -1, teamMembers: -1 },
    stats: { subscribers: 47, mrr: 94000, churnRate: 0.5 },
    createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-12-10T00:00:00Z',
  },
];

const MOCK_OVERVIEW = {
  totalRevenue: 228400,
  monthlyRecurring: 228400,
  totalSubscribers: 37457,
  paidSubscribers: 9057,
  avgRevenuePerUser: 25.21,
  conversionRate: 24.2,
  churnRate: 3.1,
  growth: { subscribers: 12.4, mrr: 18.7 },
};

const MOCK_RECENT_SUBSCRIBERS = [
  { _id: 's1', name: 'Alice Chen', email: 'alice@example.com', plan: 'pro', joinedAt: new Date(Date.now() - 3600000).toISOString(), status: 'active' },
  { _id: 's2', name: 'Bob Williams', email: 'bob@example.com', plan: 'elite', joinedAt: new Date(Date.now() - 7200000).toISOString(), status: 'active' },
  { _id: 's3', name: 'Carol Smith', email: 'carol@example.com', plan: 'pro', joinedAt: new Date(Date.now() - 10800000).toISOString(), status: 'trial' },
  { _id: 's4', name: 'David Park', email: 'david@example.com', plan: 'enterprise', joinedAt: new Date(Date.now() - 14400000).toISOString(), status: 'active' },
  { _id: 's5', name: 'Eva Mueller', email: 'eva@example.com', plan: 'pro', joinedAt: new Date(Date.now() - 18000000).toISOString(), status: 'active' },
];

const ICON_OPTIONS = [
  { value: 'globe', label: 'Globe' },
  { value: 'zap', label: 'Zap' },
  { value: 'star', label: 'Star' },
  { value: 'crown', label: 'Crown' },
  { value: 'shield', label: 'Shield' },
  { value: 'award', label: 'Award' },
];

const PLAN_ICONS_MAP = {
  globe: <Globe size={18} />, zap: <Zap size={18} />, star: <Star size={18} />,
  crown: <Crown size={18} />, shield: <Shield size={18} />, award: <Award size={18} />,
};

const formatNum = (n) => {
  if (!n && n !== 0) return '0';
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
};

const formatCurrency = (n) => {
  if (!n && n !== 0) return '$0';
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${n}`;
};

const timeAgo = (d) => {
  if (!d) return '';
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(d).toLocaleDateString();
};

/* ─── PLAN FORM STATE ──────────────────────────────────── */
const EMPTY_PLAN = {
  name: '', slug: '', tagline: '', badge: '', color: '#e63946', icon: 'zap',
  price: { monthly: 0, annual: 0 },
  isActive: true, isVisible: true, isPopular: false,
  features: [
    { label: '', included: true },
  ],
  limits: { articlesPerMonth: -1, bookmarkLists: -1, apiCalls: 0, teamMembers: 1 },
  order: 1,
};

/* ──────────────────────────────────────────────────────── */
export default function AdminSubscriptionPlans() {
  const { isDarkMode } = useContext(ThemeContext);
  const userToken = getUserToken();

  const [plans, setPlans] = useState(MOCK_PLANS);
  const [overview, setOverview] = useState(MOCK_OVERVIEW);
  const [recentSubs, setRecentSubs] = useState(MOCK_RECENT_SUBSCRIBERS);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('plans'); // 'plans' | 'overview' | 'subscribers'
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState(EMPTY_PLAN);
  const [savingPlan, setSavingPlan] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [searchSubs, setSearchSubs] = useState('');
  const [filterPlan, setFilterPlan] = useState('all');
  const [expandedPlan, setExpandedPlan] = useState(null);
  const [subsLoading, setSubsLoading] = useState(false);
  const [allSubscribers, setAllSubscribers] = useState([]);
  const [subsPage, setSubsPage] = useState(1);
  const [totalSubs, setTotalSubs] = useState(0);
  const [sortField, setSortField] = useState('joinedAt');
  const [sortDir, setSortDir] = useState('desc');
  const [dragging, setDragging] = useState(null);

  const swalTheme = {
    background: isDarkMode ? '#111' : '#fff',
    color: isDarkMode ? '#f0f0f0' : '#0d0d0d',
    confirmButtonColor: '#e63946',
  };

  /* ─── FETCH ─────────────────────────────── */
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [pr, or] = await Promise.all([
          fetch('/api/admin/subscription/plans', { headers: { Authorization: `Bearer ${userToken}` } }),
          fetch('/api/admin/subscription/overview', { headers: { Authorization: `Bearer ${userToken}` } }),
        ]);
        if (pr.ok) { const pd = await pr.json(); setPlans(pd.plans || pd); }
        if (or.ok) { const od = await or.json(); setOverview(od); }
      } catch { /* use mock */ } finally { setLoading(false); }
    };
    fetchAll();
  }, [userToken]);

  const fetchSubscribers = useCallback(async (page = 1, append = false) => {
    setSubsLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20, search: searchSubs, plan: filterPlan, sort: sortField, dir: sortDir });
      const res = await fetch(`/api/admin/subscription/subscribers?${params}`, { headers: { Authorization: `Bearer ${userToken}` } });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAllSubscribers(prev => append ? [...prev, ...(data.subscribers || [])] : (data.subscribers || []));
      setTotalSubs(data.total || 0);
    } catch {
      setAllSubscribers(MOCK_RECENT_SUBSCRIBERS);
      setTotalSubs(50);
    } finally { setSubsLoading(false); }
  }, [userToken, searchSubs, filterPlan, sortField, sortDir]);

  useEffect(() => {
    if (activeTab === 'subscribers') { setSubsPage(1); fetchSubscribers(1, false); }
  }, [activeTab, searchSubs, filterPlan, sortField, sortDir]);

  /* ─── PLAN CRUD ─────────────────────────── */
  const openCreateForm = () => {
    setEditingPlan(null);
    setFormData({ ...EMPTY_PLAN, order: plans.length + 1 });
    setShowForm(true);
  };

  const openEditForm = (plan) => {
    setEditingPlan(plan);
    setFormData({ ...plan });
    setShowForm(true);
  };

  const handleSavePlan = async () => {
    if (!formData.name.trim() || !formData.slug.trim()) {
      Swal.fire({ title: 'Validation Error', text: 'Name and slug are required.', icon: 'warning', ...swalTheme });
      return;
    }
    setSavingPlan(true);
    try {
      const isEdit = !!editingPlan;
      const url = isEdit ? `/api/admin/subscription/plans/${editingPlan._id}` : '/api/admin/subscription/plans';
      const method = isEdit ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${userToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const saved = res.ok ? await res.json() : null;
      const planData = saved?.plan || { ...formData, _id: editingPlan?._id || `plan-${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), stats: { subscribers: 0, mrr: 0, churnRate: 0 } };
      setPlans(prev => isEdit ? prev.map(p => p._id === editingPlan._id ? planData : p) : [...prev, planData]);
      setShowForm(false);
      Swal.fire({ title: isEdit ? 'Updated!' : 'Created!', text: `Plan "${formData.name}" has been ${isEdit ? 'updated' : 'created'}.`, icon: 'success', timer: 1800, showConfirmButton: false, ...swalTheme });
    } catch {
      Swal.fire({ title: 'Error', text: 'Failed to save plan. Please try again.', icon: 'error', ...swalTheme });
    } finally { setSavingPlan(false); }
  };

  const handleDeletePlan = async (plan) => {
    if (plan.stats?.subscribers > 0) {
      const c = await Swal.fire({
        title: `Delete "${plan.name}"?`,
        html: `<p style="color:#e63946;font-weight:600">⚠️ This plan has ${plan.stats.subscribers} active subscribers!</p><p>Deleting will move them to the Free plan. This action cannot be undone.</p>`,
        icon: 'warning', showCancelButton: true,
        confirmButtonText: 'Delete Anyway', confirmButtonColor: '#e63946',
        ...swalTheme,
      });
      if (!c.isConfirmed) return;
    } else {
      const c = await Swal.fire({
        title: `Delete "${plan.name}"?`, text: 'This action cannot be undone.',
        icon: 'warning', showCancelButton: true, confirmButtonText: 'Delete', confirmButtonColor: '#e63946', ...swalTheme,
      });
      if (!c.isConfirmed) return;
    }
    setDeletingId(plan._id);
    try {
      await fetch(`/api/admin/subscription/plans/${plan._id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${userToken}` },
      });
      setPlans(prev => prev.filter(p => p._id !== plan._id));
      Swal.fire({ title: 'Deleted', icon: 'success', timer: 1200, showConfirmButton: false, ...swalTheme });
    } catch {
      Swal.fire({ title: 'Error', text: 'Could not delete plan.', icon: 'error', ...swalTheme });
    } finally { setDeletingId(null); }
  };

  const handleToggleVisibility = async (plan) => {
    try {
      await fetch(`/api/admin/subscription/plans/${plan._id}/visibility`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${userToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVisible: !plan.isVisible }),
      });
      setPlans(prev => prev.map(p => p._id === plan._id ? { ...p, isVisible: !p.isVisible } : p));
    } catch {
      Swal.fire({ title: 'Error', text: 'Could not update visibility.', icon: 'error', timer: 1500, showConfirmButton: false, ...swalTheme });
    }
  };

  const handleToggleActive = async (plan) => {
    try {
      await fetch(`/api/admin/subscription/plans/${plan._id}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${userToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !plan.isActive }),
      });
      setPlans(prev => prev.map(p => p._id === plan._id ? { ...p, isActive: !p.isActive } : p));
    } catch { /* silent */ }
  };

  const handleTogglePopular = async (plan) => {
    // Only one plan can be "popular"
    try {
      await fetch(`/api/admin/subscription/plans/${plan._id}/popular`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${userToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPopular: !plan.isPopular }),
      });
      setPlans(prev => prev.map(p => ({
        ...p, isPopular: p._id === plan._id ? !plan.isPopular : false,
      })));
    } catch { /* silent */ }
  };

  const handleDuplicatePlan = async (plan) => {
    const newPlan = {
      ...plan,
      _id: `plan-${Date.now()}`,
      name: `${plan.name} (Copy)`,
      slug: `${plan.slug}-copy`,
      isActive: false,
      isVisible: false,
      stats: { subscribers: 0, mrr: 0, churnRate: 0 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    try {
      await fetch('/api/admin/subscription/plans', {
        method: 'POST',
        headers: { Authorization: `Bearer ${userToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(newPlan),
      });
      setPlans(prev => [...prev, newPlan]);
      Swal.fire({ title: 'Duplicated!', text: `"${plan.name} (Copy)" created as inactive draft.`, icon: 'success', timer: 1500, showConfirmButton: false, ...swalTheme });
    } catch {
      setPlans(prev => [...prev, newPlan]);
    }
  };

  const handleReorderPlans = async (newOrder) => {
    setPlans(newOrder);
    try {
      await fetch('/api/admin/subscription/plans/reorder', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${userToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: newOrder.map((p, i) => ({ id: p._id, order: i + 1 })) }),
      });
    } catch { /* silent */ }
  };

  const handleExportCSV = async () => {
    try {
      const res = await fetch('/api/admin/subscription/export/csv', { headers: { Authorization: `Bearer ${userToken}` } });
      if (res.ok) {
        const blob = await res.blob();
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
        a.download = `subscribers-${new Date().toISOString().split('T')[0]}.csv`; a.click();
      }
    } catch {
      Swal.fire({ title: 'Export Failed', text: 'Could not export subscriber data.', icon: 'error', ...swalTheme });
    }
  };

  /* ─── FEATURE FIELD HELPERS ─────────────── */
  const addFeature = () => setFormData(prev => ({ ...prev, features: [...prev.features, { label: '', included: true }] }));
  const removeFeature = (i) => setFormData(prev => ({ ...prev, features: prev.features.filter((_, fi) => fi !== i) }));
  const updateFeature = (i, field, val) => setFormData(prev => ({
    ...prev, features: prev.features.map((f, fi) => fi === i ? { ...f, [field]: val } : f),
  }));

  /* ─── AUTO-SLUG ─────────────────────────── */
  const handleNameChange = (val) => {
    setFormData(prev => ({
      ...prev, name: val,
      slug: prev.slug === '' || prev.slug === prev.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        ? val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        : prev.slug,
    }));
  };

  /* ─── STATUS CHIP ───────────────────────── */
  const StatusChip = ({ status }) => (
    <span className={`asub-status-chip ${status}`}>
      {status === 'active' && <><CheckCircle size={10} /> Active</>}
      {status === 'trial' && <><Clock size={10} /> Trial</>}
      {status === 'cancelled' && <><X size={10} /> Cancelled</>}
      {status === 'past_due' && <><AlertTriangle size={10} /> Past Due</>}
    </span>
  );

  /* ─── SORT HANDLER ──────────────────────── */
  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ArrowDown size={12} style={{ opacity: 0.3 }} />;
    return sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />;
  };

  return (
    <div className={`asub-root ${isDarkMode ? 'dark' : ''}`}>

      {/* ── HEADER ──────────────────────────── */}
      <div className="asub-header">
        <div className="asub-header-left">
          <div className="asub-header-icon"><Settings size={22} /></div>
          <div>
            <h1 className="asub-header-title">Subscription Plans</h1>
            <p className="asub-header-sub">Manage pricing, features, and subscribers</p>
          </div>
        </div>
        <div className="asub-header-actions">
          <button className="asub-btn asub-btn-ghost" onClick={handleExportCSV}>
            <Download size={15} /> Export CSV
          </button>
          <button className="asub-btn asub-btn-primary" onClick={openCreateForm}>
            <Plus size={15} /> New Plan
          </button>
        </div>
      </div>

      {/* ── TABS ────────────────────────────── */}
      <div className="asub-tabs">
        {[
          { key: 'plans', label: 'Plans', icon: <FileText size={15} /> },
          { key: 'overview', label: 'Revenue Overview', icon: <BarChart2 size={15} /> },
          { key: 'subscribers', label: 'Subscribers', icon: <Users size={15} /> },
        ].map(tab => (
          <button key={tab.key} className={`asub-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════ */}
      {/* TAB: PLANS                              */}
      {/* ═══════════════════════════════════════ */}
      {activeTab === 'plans' && (
        <div className="asub-plans-section">
          {/* Summary Row */}
          <div className="asub-summary-row">
            {plans.map(p => (
              <div key={p._id} className="asub-summary-card" style={{ '--plan-c': p.color }}>
                <div className="asub-summary-card-top">
                  <span className="asub-summary-icon" style={{ color: p.color, background: `${p.color}18` }}>
                    {PLAN_ICONS_MAP[p.icon] || <Zap size={16} />}
                  </span>
                  <span className="asub-summary-name">{p.name}</span>
                  {!p.isActive && <span className="asub-badge asub-badge-inactive">Inactive</span>}
                  {!p.isVisible && <span className="asub-badge asub-badge-hidden"><EyeOff size={9} /> Hidden</span>}
                  {p.isPopular && <span className="asub-badge asub-badge-popular"><Flame size={9} /> Popular</span>}
                </div>
                <div className="asub-summary-price">
                  {p.price.monthly === null ? 'Custom' : p.price.monthly === 0 ? 'Free' : `$${p.price.monthly}/mo`}
                </div>
                <div className="asub-summary-stats">
                  <span><Users size={11} /> {formatNum(p.stats?.subscribers)}</span>
                  <span><DollarSign size={11} /> {formatCurrency(p.stats?.mrr)} MRR</span>
                </div>
              </div>
            ))}
          </div>

          {/* Plans List */}
          <div className="asub-plans-list">
            {plans.map((plan, idx) => (
              <div key={plan._id} className={`asub-plan-row ${!plan.isActive ? 'inactive' : ''} ${deletingId === plan._id ? 'deleting' : ''}`}>
                <div className="asub-plan-row-main">
                  {/* Drag Handle (visual) */}
                  <div className="asub-drag-handle" title="Drag to reorder">
                    <div className="asub-drag-dots" />
                  </div>

                  {/* Icon & Info */}
                  <div className="asub-plan-row-icon" style={{ background: `${plan.color}18`, color: plan.color }}>
                    {PLAN_ICONS_MAP[plan.icon] || <Zap size={18} />}
                  </div>
                  <div className="asub-plan-row-info">
                    <div className="asub-plan-row-name">
                      {plan.name}
                      {plan.badge && <span className="asub-badge" style={{ background: `${plan.color}20`, color: plan.color }}>{plan.badge}</span>}
                      {!plan.isActive && <span className="asub-badge asub-badge-inactive">Inactive</span>}
                      {!plan.isVisible && <span className="asub-badge asub-badge-hidden"><EyeOff size={9} /> Hidden</span>}
                    </div>
                    <div className="asub-plan-row-tagline">{plan.tagline}</div>
                  </div>

                  {/* Price */}
                  <div className="asub-plan-row-price">
                    <div className="asub-plan-row-price-main">
                      {plan.price.monthly === null ? 'Custom' : plan.price.monthly === 0 ? 'Free' : `$${plan.price.monthly}/mo`}
                    </div>
                    {plan.price.annual > 0 && (
                      <div className="asub-plan-row-price-sub">${plan.price.annual}/mo (annual)</div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="asub-plan-row-stats">
                    <div className="asub-plan-row-stat"><Users size={12} /> {formatNum(plan.stats?.subscribers)} subs</div>
                    <div className="asub-plan-row-stat"><DollarSign size={12} /> {formatCurrency(plan.stats?.mrr)} MRR</div>
                    <div className="asub-plan-row-stat" style={{ color: plan.stats?.churnRate > 5 ? 'var(--asub-danger)' : 'var(--asub-success)' }}>
                      <TrendingUp size={12} /> {plan.stats?.churnRate}% churn
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="asub-plan-row-toggles">
                    <button className="asub-toggle-btn" onClick={() => handleToggleActive(plan)} title={plan.isActive ? 'Deactivate' : 'Activate'}>
                      {plan.isActive ? <ToggleRight size={20} color="var(--asub-success)" /> : <ToggleLeft size={20} />}
                      <span>{plan.isActive ? 'Active' : 'Inactive'}</span>
                    </button>
                    <button className="asub-toggle-btn" onClick={() => handleToggleVisibility(plan)} title={plan.isVisible ? 'Hide from public' : 'Show to public'}>
                      {plan.isVisible ? <Eye size={15} /> : <EyeOff size={15} />}
                      <span>{plan.isVisible ? 'Visible' : 'Hidden'}</span>
                    </button>
                    <button className="asub-toggle-btn" onClick={() => handleTogglePopular(plan)} title="Mark as popular">
                      <Flame size={15} color={plan.isPopular ? '#ffd166' : undefined} />
                      <span>{plan.isPopular ? 'Popular' : 'Set Popular'}</span>
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="asub-plan-row-actions">
                    <button className="asub-icon-btn" onClick={() => openEditForm(plan)} title="Edit plan">
                      <Edit2 size={15} />
                    </button>
                    <button className="asub-icon-btn" onClick={() => handleDuplicatePlan(plan)} title="Duplicate plan">
                      <Copy size={15} />
                    </button>
                    <button className="asub-icon-btn asub-icon-btn-danger" onClick={() => handleDeletePlan(plan)} title="Delete plan">
                      {deletingId === plan._id ? <RefreshCw size={15} className="asub-spin" /> : <Trash2 size={15} />}
                    </button>
                    <button className="asub-icon-btn" onClick={() => setExpandedPlan(expandedPlan === plan._id ? null : plan._id)} title="View features">
                      {expandedPlan === plan._id ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Features */}
                {expandedPlan === plan._id && (
                  <div className="asub-plan-features-expand">
                    <div className="asub-plan-features-grid">
                      {plan.features.map((f, i) => (
                        <div key={i} className={`asub-feature-row ${f.included ? 'included' : 'excluded'}`}>
                          {f.included ? <Check size={12} /> : <X size={12} />}
                          <span>{f.label}</span>
                        </div>
                      ))}
                    </div>
                    <div className="asub-plan-limits">
                      <div className="asub-plan-limit-item"><strong>Articles:</strong> {plan.limits.articlesPerMonth === -1 ? 'Unlimited' : plan.limits.articlesPerMonth}/mo</div>
                      <div className="asub-plan-limit-item"><strong>Bookmarks:</strong> {plan.limits.bookmarkLists === -1 ? 'Unlimited' : plan.limits.bookmarkLists} lists</div>
                      <div className="asub-plan-limit-item"><strong>API Calls:</strong> {plan.limits.apiCalls === -1 ? 'Unlimited' : plan.limits.apiCalls === 0 ? 'None' : `${formatNum(plan.limits.apiCalls)}/mo`}</div>
                      <div className="asub-plan-limit-item"><strong>Team Members:</strong> {plan.limits.teamMembers === -1 ? 'Unlimited' : plan.limits.teamMembers}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                      <button className="asub-btn asub-btn-sm asub-btn-ghost" onClick={() => openEditForm(plan)}>
                        <Edit2 size={13} /> Edit Plan
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {plans.length === 0 && (
              <div className="asub-empty">
                <FileText size={40} />
                <h3>No Plans Yet</h3>
                <p>Create your first subscription plan to get started.</p>
                <button className="asub-btn asub-btn-primary" onClick={openCreateForm}>
                  <Plus size={15} /> Create Plan
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════ */}
      {/* TAB: OVERVIEW                           */}
      {/* ═══════════════════════════════════════ */}
      {activeTab === 'overview' && (
        <div className="asub-overview-section">
          <div className="asub-overview-grid">
            {[
              { label: 'Monthly Recurring Revenue', value: formatCurrency(overview.monthlyRecurring), sub: `+${overview.growth?.mrr}% vs last month`, icon: <DollarSign size={20} />, color: 'var(--asub-primary)' },
              { label: 'Total Subscribers', value: formatNum(overview.totalSubscribers), sub: `${formatNum(overview.paidSubscribers)} paid`, icon: <Users size={20} />, color: 'var(--asub-blue)' },
              { label: 'Conversion Rate', value: `${overview.conversionRate}%`, sub: 'Free → Paid', icon: <TrendingUp size={20} />, color: 'var(--asub-teal)' },
              { label: 'Avg Revenue / User', value: `$${overview.avgRevenuePerUser}`, sub: 'Per paying subscriber', icon: <Award size={20} />, color: 'var(--asub-gold)' },
              { label: 'Overall Churn Rate', value: `${overview.churnRate}%`, sub: 'Monthly average', icon: <BarChart2 size={20} />, color: overview.churnRate > 5 ? 'var(--asub-danger)' : 'var(--asub-success)' },
              { label: 'Subscriber Growth', value: `+${overview.growth?.subscribers}%`, sub: 'vs last month', icon: <ArrowUp size={20} />, color: 'var(--asub-teal)' },
            ].map((stat, i) => (
              <div key={i} className="asub-stat-card">
                <div className="asub-stat-icon" style={{ color: stat.color, background: `${stat.color.replace('var(', '').replace(')', '')}` ? undefined : undefined }}>
                  {stat.icon}
                </div>
                <div>
                  <div className="asub-stat-label">{stat.label}</div>
                  <div className="asub-stat-value">{stat.value}</div>
                  <div className="asub-stat-sub">{stat.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Plan Breakdown */}
          <h2 className="asub-section-title">Revenue by Plan</h2>
          <div className="asub-revenue-breakdown">
            {plans.filter(p => p.stats?.mrr > 0 || p.stats?.subscribers > 0).map(plan => {
              const totalMRR = plans.reduce((s, p) => s + (p.stats?.mrr || 0), 0);
              const pct = totalMRR > 0 ? Math.round((plan.stats?.mrr / totalMRR) * 100) : 0;
              return (
                <div key={plan._id} className="asub-revenue-row">
                  <div className="asub-revenue-plan">
                    <span className="asub-revenue-icon" style={{ background: `${plan.color}18`, color: plan.color }}>
                      {PLAN_ICONS_MAP[plan.icon]}
                    </span>
                    <span className="asub-revenue-name">{plan.name}</span>
                  </div>
                  <div className="asub-revenue-bar-wrap">
                    <div className="asub-revenue-bar" style={{ width: `${pct}%`, background: plan.color }} />
                  </div>
                  <div className="asub-revenue-stats">
                    <span>{pct}%</span>
                    <span>{formatCurrency(plan.stats?.mrr)} MRR</span>
                    <span><Users size={11} /> {formatNum(plan.stats?.subscribers)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recent Subscribers */}
          <h2 className="asub-section-title" style={{ marginTop: '2rem' }}>Recent Subscribers</h2>
          <div className="asub-recent-table-wrap">
            <table className="asub-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Plan</th>
                  <th>Joined</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentSubs.map(s => (
                  <tr key={s._id}>
                    <td>
                      <div className="asub-user-cell">
                        <div className="asub-user-avatar">{s.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--asub-text)' }}>{s.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--asub-text-3)' }}>{s.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="asub-plan-pill" style={{ textTransform: 'capitalize' }}>{s.plan}</span></td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--asub-text-3)' }}>{timeAgo(s.joinedAt)}</td>
                    <td><StatusChip status={s.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════ */}
      {/* TAB: SUBSCRIBERS                        */}
      {/* ═══════════════════════════════════════ */}
      {activeTab === 'subscribers' && (
        <div className="asub-subscribers-section">
          {/* Filters */}
          <div className="asub-subs-filters">
            <div className="asub-search-wrap">
              <Search size={15} className="asub-search-icon" />
              <input
                type="text"
                className="asub-search-inp"
                placeholder="Search by name or email…"
                value={searchSubs}
                onChange={e => setSearchSubs(e.target.value)}
              />
            </div>
            <div className="asub-filter-group">
              <Filter size={14} />
              <select className="asub-select" value={filterPlan} onChange={e => setFilterPlan(e.target.value)}>
                <option value="all">All Plans</option>
                {plans.map(p => <option key={p._id} value={p.slug}>{p.name}</option>)}
              </select>
            </div>
            <button className="asub-btn asub-btn-ghost asub-btn-sm" onClick={handleExportCSV}>
              <Download size={14} /> Export
            </button>
            <span className="asub-subs-count">{formatNum(totalSubs)} subscribers</span>
          </div>

          {/* Table */}
          <div className="asub-recent-table-wrap">
            <table className="asub-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th className="sortable" onClick={() => handleSort('plan')}>Plan <SortIcon field="plan" /></th>
                  <th className="sortable" onClick={() => handleSort('joinedAt')}>Joined <SortIcon field="joinedAt" /></th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(allSubscribers.length > 0 ? allSubscribers : MOCK_RECENT_SUBSCRIBERS).map(s => (
                  <tr key={s._id}>
                    <td>
                      <div className="asub-user-cell">
                        <div className="asub-user-avatar">{s.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--asub-text)' }}>{s.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--asub-text-3)' }}>{s.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="asub-plan-pill" style={{ textTransform: 'capitalize' }}>{s.plan}</span></td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--asub-text-3)' }}>{timeAgo(s.joinedAt)}</td>
                    <td><StatusChip status={s.status} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className="asub-icon-btn" title="View user" onClick={() => window.open(`/admin/users/${s._id}`, '_blank')}>
                          <ExternalLink size={13} />
                        </button>
                        <button className="asub-icon-btn asub-icon-btn-danger" title="Cancel subscription"
                          onClick={async () => {
                            const c = await Swal.fire({ title: 'Cancel Subscription?', text: `Cancel ${s.name}'s ${s.plan} plan?`, icon: 'warning', showCancelButton: true, confirmButtonText: 'Cancel Sub', confirmButtonColor: '#e63946', ...swalTheme });
                            if (!c.isConfirmed) return;
                            await fetch(`/api/admin/subscription/subscribers/${s._id}/cancel`, { method: 'POST', headers: { Authorization: `Bearer ${userToken}` } });
                            setAllSubscribers(prev => prev.map(sub => sub._id === s._id ? { ...sub, status: 'cancelled' } : sub));
                          }}>
                          <X size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {allSubscribers.length < totalSubs && (
            <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
              <button className="asub-btn asub-btn-ghost" onClick={() => { const next = subsPage + 1; setSubsPage(next); fetchSubscribers(next, true); }} disabled={subsLoading}>
                {subsLoading ? <RefreshCw size={14} className="asub-spin" /> : 'Load More'} {!subsLoading && <ChevronDown size={14} />}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════ */}
      {/* PLAN FORM MODAL                         */}
      {/* ═══════════════════════════════════════ */}
      {showForm && (
        <div className="asub-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="asub-modal" onClick={e => e.stopPropagation()}>
            <div className="asub-modal-header">
              <h2 className="asub-modal-title">
                {editingPlan ? `Edit Plan: ${editingPlan.name}` : 'Create New Plan'}
              </h2>
              <button className="asub-icon-btn" onClick={() => setShowForm(false)}><X size={18} /></button>
            </div>

            <div className="asub-modal-body">
              <div className="asub-form-grid">
                {/* Name */}
                <div className="asub-form-group asub-form-col-2">
                  <label className="asub-form-label">Plan Name *</label>
                  <input className="asub-form-input" value={formData.name} onChange={e => handleNameChange(e.target.value)} placeholder="e.g. Pro" />
                </div>
                {/* Slug */}
                <div className="asub-form-group asub-form-col-2">
                  <label className="asub-form-label">Slug * <span className="asub-form-hint">URL-safe identifier</span></label>
                  <input className="asub-form-input" value={formData.slug} onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value }))} placeholder="e.g. pro" />
                </div>
                {/* Tagline */}
                <div className="asub-form-group asub-form-col-4">
                  <label className="asub-form-label">Tagline</label>
                  <input className="asub-form-input" value={formData.tagline} onChange={e => setFormData(prev => ({ ...prev, tagline: e.target.value }))} placeholder="Short description…" />
                </div>
                {/* Monthly Price */}
                <div className="asub-form-group">
                  <label className="asub-form-label">Monthly Price ($)</label>
                  <input className="asub-form-input" type="number" min="0" value={formData.price.monthly ?? ''} onChange={e => setFormData(prev => ({ ...prev, price: { ...prev.price, monthly: e.target.value === '' ? null : Number(e.target.value) } }))} placeholder="0 for free, empty for custom" />
                </div>
                {/* Annual Price */}
                <div className="asub-form-group">
                  <label className="asub-form-label">Annual Price ($/mo)</label>
                  <input className="asub-form-input" type="number" min="0" value={formData.price.annual ?? ''} onChange={e => setFormData(prev => ({ ...prev, price: { ...prev.price, annual: e.target.value === '' ? null : Number(e.target.value) } }))} placeholder="per-month equivalent" />
                </div>
                {/* Color */}
                <div className="asub-form-group">
                  <label className="asub-form-label">Color</label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input type="color" value={formData.color} onChange={e => setFormData(prev => ({ ...prev, color: e.target.value }))} className="asub-color-inp" />
                    <input className="asub-form-input" value={formData.color} onChange={e => setFormData(prev => ({ ...prev, color: e.target.value }))} style={{ flex: 1 }} />
                  </div>
                </div>
                {/* Icon */}
                <div className="asub-form-group">
                  <label className="asub-form-label">Icon</label>
                  <select className="asub-form-input" value={formData.icon} onChange={e => setFormData(prev => ({ ...prev, icon: e.target.value }))}>
                    {ICON_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                {/* Badge */}
                <div className="asub-form-group">
                  <label className="asub-form-label">Badge Label</label>
                  <input className="asub-form-input" value={formData.badge || ''} onChange={e => setFormData(prev => ({ ...prev, badge: e.target.value }))} placeholder="e.g. Most Popular" />
                </div>
                {/* Order */}
                <div className="asub-form-group">
                  <label className="asub-form-label">Display Order</label>
                  <input className="asub-form-input" type="number" min="1" value={formData.order} onChange={e => setFormData(prev => ({ ...prev, order: Number(e.target.value) }))} />
                </div>

                {/* Toggles */}
                <div className="asub-form-group asub-form-col-4 asub-form-toggles-row">
                  {[
                    { key: 'isActive', label: 'Active' },
                    { key: 'isVisible', label: 'Visible to Public' },
                    { key: 'isPopular', label: 'Mark as Popular' },
                  ].map(t => (
                    <label key={t.key} className="asub-form-toggle">
                      <input type="checkbox" checked={formData[t.key]} onChange={e => setFormData(prev => ({ ...prev, [t.key]: e.target.checked }))} />
                      <span className="asub-form-toggle-track">
                        <span className="asub-form-toggle-thumb" />
                      </span>
                      {t.label}
                    </label>
                  ))}
                </div>

                {/* Limits */}
                <div className="asub-form-group asub-form-col-4">
                  <label className="asub-form-label">Limits <span className="asub-form-hint">(-1 = unlimited)</span></label>
                  <div className="asub-limits-grid">
                    {[
                      { key: 'articlesPerMonth', label: 'Articles/mo' },
                      { key: 'bookmarkLists', label: 'Bookmark Lists' },
                      { key: 'apiCalls', label: 'API Calls/mo' },
                      { key: 'teamMembers', label: 'Team Members' },
                    ].map(l => (
                      <div key={l.key}>
                        <label className="asub-form-label" style={{ fontSize: '0.72rem', marginBottom: '0.2rem' }}>{l.label}</label>
                        <input className="asub-form-input" type="number" value={formData.limits[l.key]} onChange={e => setFormData(prev => ({ ...prev, limits: { ...prev.limits, [l.key]: Number(e.target.value) } }))} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div className="asub-form-group asub-form-col-4">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <label className="asub-form-label" style={{ margin: 0 }}>Features</label>
                    <button type="button" className="asub-btn asub-btn-ghost asub-btn-sm" onClick={addFeature}>
                      <Plus size={13} /> Add Feature
                    </button>
                  </div>
                  <div className="asub-features-edit-list">
                    {formData.features.map((f, i) => (
                      <div key={i} className="asub-feature-edit-row">
                        <button type="button" className="asub-feature-toggle-btn" onClick={() => updateFeature(i, 'included', !f.included)} title={f.included ? 'Included' : 'Not included'}>
                          {f.included ? <Check size={13} color="var(--asub-success)" /> : <X size={13} color="var(--asub-text-3)" />}
                        </button>
                        <input
                          className="asub-form-input asub-feature-inp"
                          value={f.label}
                          onChange={e => updateFeature(i, 'label', e.target.value)}
                          placeholder="Feature description…"
                        />
                        <button type="button" className="asub-icon-btn asub-icon-btn-danger" onClick={() => removeFeature(i)}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="asub-modal-footer">
              <button className="asub-btn asub-btn-ghost" onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button className="asub-btn asub-btn-primary" onClick={handleSavePlan} disabled={savingPlan}>
                {savingPlan ? <><RefreshCw size={14} className="asub-spin" /> Saving…</> : <><Save size={14} /> {editingPlan ? 'Save Changes' : 'Create Plan'}</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}