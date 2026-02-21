import { useState, useEffect, useContext, useCallback } from 'react';
import {
  Megaphone, Plus, Search, RefreshCw, Edit2, Trash2, Eye, EyeOff,
  ChevronRight, Info, X, Save, Pause, Play, Copy, BarChart2,
  DollarSign, TrendingUp, MousePointer, Users, Globe, Calendar,
  Filter, LayoutGrid, List, CheckCircle, AlertTriangle, Clock,
  ArrowUpRight, Target, Zap, Shield, Award, ChevronDown, ChevronUp,
  Monitor, Smartphone, Tablet, Image, Video, FileText, Link,
  PieChart, Activity, ArrowLeft, ArrowRight, ToggleLeft, Layers
} from 'lucide-react';
import Swal from 'sweetalert2';
import { ThemeContext } from '../../context/ThemeContext';

const TOKEN_KEY = 'ai_news_admin_token';
const getToken = () => localStorage.getItem(TOKEN_KEY);

/* ─── CONSTANTS ─────────────────────────────────────── */
const AD_TYPES = ['display', 'video', 'native', 'banner', 'interstitial', 'rewarded', 'sponsored_content'];
const AD_STATUSES = ['all', 'draft', 'review', 'approved', 'rejected', 'scheduled', 'active', 'paused', 'suspended', 'completed', 'archived', 'expired'];
const AD_CATEGORIES = ['technology', 'ai', 'education', 'business', 'finance', 'healthcare', 'automotive', 'retail', 'entertainment', 'gaming', 'travel', 'food', 'fashion', 'real_estate', 'recruitment', 'events', 'software', 'hardware', 'services'];
const BID_STRATEGIES = ['cpm', 'cpc', 'cpa', 'cpv', 'fixed'];
const BUDGET_TYPES = ['daily', 'weekly', 'monthly', 'total'];
const PLACEMENT_POSITIONS = ['header', 'footer', 'sidebar', 'content_top', 'content_middle', 'content_bottom', 'in_article', 'between_articles', 'popup', 'floating', 'sticky', 'interstitial', 'rewarded_video'];
const DELIVERY_METHODS = ['standard', 'accelerated', 'even'];

const STATUS_BADGE = {
  draft:      { cls: 'ai-news-amp-badge-gray',   label: 'Draft'      },
  review:     { cls: 'ai-news-amp-badge-orange',  label: 'In Review'  },
  approved:   { cls: 'ai-news-amp-badge-cyan',    label: 'Approved'   },
  rejected:   { cls: 'ai-news-amp-badge-red',     label: 'Rejected'   },
  scheduled:  { cls: 'ai-news-amp-badge-purple',  label: 'Scheduled'  },
  active:     { cls: 'ai-news-amp-badge-green',   label: 'Active'     },
  paused:     { cls: 'ai-news-amp-badge-orange',  label: 'Paused'     },
  suspended:  { cls: 'ai-news-amp-badge-red',     label: 'Suspended'  },
  completed:  { cls: 'ai-news-amp-badge-gray',    label: 'Completed'  },
  archived:   { cls: 'ai-news-amp-badge-gray',    label: 'Archived'   },
  expired:    { cls: 'ai-news-amp-badge-red',     label: 'Expired'    },
};

const TYPE_ICON = {
  display:          <Monitor size={14} />,
  video:            <Video size={14} />,
  native:           <FileText size={14} />,
  banner:           <Image size={14} />,
  interstitial:     <Layers size={14} />,
  rewarded:         <Award size={14} />,
  sponsored_content:<FileText size={14} />,
};

const EMPTY_AD_FORM = {
  name: '',
  description: '',
  type: 'display',
  category: 'technology',
  advertiserName: '',
  advertiserContact: { name: '', email: '', phone: '' },
  campaignName: '',
  tags: [],
  creative: {
    name: '',
    type: 'display',
    status: 'draft',
    content: {
      headline: '',
      description: '',
      cta: { text: '', type: 'learn_more' },
      brandName: '',
      disclaimer: '',
      sponsoredBy: '',
    },
    destination: {
      type: 'url',
      url: '',
      utmParams: { source: 'newsai', medium: 'ad', campaign: '', term: '', content: '' },
    },
  },
  placement: {
    position: {
      type: 'sidebar',
      location: { page: 'all' },
      size: { width: 300, height: 250, responsive: true },
      priority: 5,
      loadStrategy: 'lazy',
    },
    environment: { devices: ['mobile', 'desktop', 'tablet'], platforms: ['web'] },
    frequencyCap: { impressions: { perPage: 2, perSession: 5, perDay: 10 } },
  },
  budget: {
    type: 'monthly',
    amount: 1000,
    currency: 'USD',
    bidStrategy: { type: 'cpm', amount: 2.5, autoOptimize: false },
    pacing: { type: 'standard' },
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    isUnlimited: false,
  },
  schedule: { startImmediately: true, timezone: 'UTC' },
  delivery: { method: 'standard', priority: 5, guarantee: 'standard' },
  tracking: {
    utmParams: { source: 'newsai', medium: 'ad', campaign: '' },
  },
  optimization: { enabled: false, goal: 'clicks', algorithm: 'automatic' },
  compliance: {
    ageRestricted: false,
    regulatedIndustry: false,
    disclaimerRequired: false,
  },
};

/* ─── HELPERS ───────────────────────────────────────── */
const fmt = (n) => n?.toLocaleString() ?? '—';
const fmtMoney = (n, cur = 'USD') => n != null ? `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—';
const fmtPct = (n) => n != null ? `${Number(n).toFixed(2)}%` : '—';
const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

export default function Advertisement() {
  const { isDarkMode } = useContext(ThemeContext);
  const validToken = getToken();

  /* State */
  const [ads, setAds] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState('table'); // table | cards
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAds, setTotalAds] = useState(0);
  const [stats, setStats] = useState({ total: 0, active: 0, paused: 0, totalSpend: 0, totalImpressions: 0, totalClicks: 0, avgCtr: 0, pendingReview: 0 });

  /* Modals */
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showMetricsModal, setShowMetricsModal] = useState(false);
  const [selectedAd, setSelectedAd] = useState(null);
  const [adForm, setAdForm] = useState(EMPTY_AD_FORM);
  const [formTab, setFormTab] = useState('basic');
  const [tagInput, setTagInput] = useState('');

  const swalTheme = {
    background: isDarkMode ? '#10102a' : '#ffffff',
    color: isDarkMode ? '#eeeeff' : '#0d0d2b',
  };

  /* ─── FETCH ─────────────────────────────────────── */
  const AINewsFetchAds = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 15,
        ...(searchQuery && { search: searchQuery }),
        ...(filterType !== 'all' && { type: filterType }),
        ...(filterStatus !== 'all' && { status: filterStatus }),
        ...(filterCategory !== 'all' && { category: filterCategory }),
        includeDeleted: false,
      });
      const res = await fetch(`/api/admin/advertisements?${params}`, {
        headers: { Authorization: `Bearer ${validToken}`, 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to load advertisements');
      const data = await res.json();
      setAds(data.advertisements || data.data || []);
      setTotalPages(data.totalPages || 1);
      setTotalAds(data.total || 0);
    } catch (err) {
      Swal.fire({ title: 'Error!', text: err.message, icon: 'error', ...swalTheme });
    } finally {
      setLoading(false);
    }
  }, [validToken, page, searchQuery, filterType, filterStatus, filterCategory]);

  const AINewsFetchAdStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/advertisements/stats', {
        headers: { Authorization: `Bearer ${validToken}`, 'Content-Type': 'application/json' },
      });
      if (!res.ok) return;
      const data = await res.json();
      setStats(data.stats || data);
    } catch { /* silent */ }
  }, [validToken]);

  const AINewsFetchCampaigns = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/ad-campaigns?limit=100', {
        headers: { Authorization: `Bearer ${validToken}`, 'Content-Type': 'application/json' },
      });
      if (!res.ok) return;
      const data = await res.json();
      setCampaigns(data.campaigns || data.data || []);
    } catch { /* silent */ }
  }, [validToken]);

  useEffect(() => { AINewsFetchAds(); }, [AINewsFetchAds]);
  useEffect(() => { AINewsFetchAdStats(); AINewsFetchCampaigns(); }, [AINewsFetchAdStats, AINewsFetchCampaigns]);

  /* ─── CREATE ─────────────────────────────────────── */
  const AINewsCreateAd = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/advertisements', {
        method: 'POST',
        headers: { Authorization: `Bearer ${validToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(adForm),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message || 'Failed to create'); }
      Swal.fire({ title: 'Created!', text: 'Advertisement created successfully', icon: 'success', timer: 2000, showConfirmButton: false, ...swalTheme });
      setShowAddModal(false);
      setAdForm(EMPTY_AD_FORM);
      AINewsFetchAds();
      AINewsFetchAdStats();
    } catch (err) {
      Swal.fire({ title: 'Error!', text: err.message, icon: 'error', ...swalTheme });
    } finally { setSaving(false); }
  };

  /* ─── UPDATE ─────────────────────────────────────── */
  const AINewsUpdateAd = async () => {
    if (!selectedAd) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/advertisements/${selectedAd._id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${validToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(adForm),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message || 'Failed to update'); }
      Swal.fire({ title: 'Updated!', text: 'Advertisement updated successfully', icon: 'success', timer: 2000, showConfirmButton: false, ...swalTheme });
      setShowEditModal(false);
      AINewsFetchAds();
      AINewsFetchAdStats();
    } catch (err) {
      Swal.fire({ title: 'Error!', text: err.message, icon: 'error', ...swalTheme });
    } finally { setSaving(false); }
  };

  /* ─── DELETE ─────────────────────────────────────── */
  const AINewsDeleteAd = async (ad) => {
    const result = await Swal.fire({
      title: 'Delete Advertisement?',
      text: `"${ad.name}" will be permanently deleted and all metrics will be lost.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ff4d6d',
      cancelButtonText: 'Cancel',
      confirmButtonText: 'Yes, delete it',
      ...swalTheme,
    });
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`/api/admin/advertisements/${ad._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${validToken}`, 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Delete failed');
      Swal.fire({ title: 'Deleted!', text: 'Advertisement removed.', icon: 'success', timer: 1800, showConfirmButton: false, ...swalTheme });
      AINewsFetchAds();
      AINewsFetchAdStats();
    } catch (err) {
      Swal.fire({ title: 'Error!', text: err.message, icon: 'error', ...swalTheme });
    }
  };

  /* ─── STATUS ACTIONS ──────────────────────────────── */
  const AINewsChangeAdStatus = async (ad, newStatus, reason = '') => {
    try {
      const res = await fetch(`/api/admin/advertisements/${ad._id}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${validToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, reason }),
      });
      if (!res.ok) throw new Error('Status update failed');
      Swal.fire({ title: 'Status Updated!', text: `Ad is now ${newStatus}`, icon: 'success', timer: 1800, showConfirmButton: false, ...swalTheme });
      AINewsFetchAds();
      AINewsFetchAdStats();
    } catch (err) {
      Swal.fire({ title: 'Error!', text: err.message, icon: 'error', ...swalTheme });
    }
  };

  /* ─── DUPLICATE ──────────────────────────────────── */
  const AINewsDuplicateAd = async (ad) => {
    try {
      const res = await fetch(`/api/admin/advertisements/${ad._id}/duplicate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${validToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: `${ad.name} (Copy)` }),
      });
      if (!res.ok) throw new Error('Duplicate failed');
      Swal.fire({ title: 'Duplicated!', text: 'A copy has been created as draft.', icon: 'success', timer: 1800, showConfirmButton: false, ...swalTheme });
      AINewsFetchAds();
    } catch (err) {
      Swal.fire({ title: 'Error!', text: err.message, icon: 'error', ...swalTheme });
    }
  };

  /* ─── APPROVE / REJECT ───────────────────────────── */
  const AINewsApproveAd = (ad) => AINewsChangeAdStatus(ad, 'approved');
  const AINewsRejectAd = async (ad) => {
    const { value: reason } = await Swal.fire({
      title: 'Reject Advertisement',
      input: 'textarea',
      inputLabel: 'Reason for rejection',
      inputPlaceholder: 'Explain why this ad is being rejected…',
      showCancelButton: true,
      ...swalTheme,
    });
    if (reason !== undefined) AINewsChangeAdStatus(ad, 'rejected', reason);
  };

  /* ─── FORM HELPERS ───────────────────────────────── */
  const setField = (path, value) => {
    setAdForm(prev => {
      const keys = path.split('.');
      const updated = { ...prev };
      let cur = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        cur[keys[i]] = { ...cur[keys[i]] };
        cur = cur[keys[i]];
      }
      cur[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  const openEdit = (ad) => {
    setSelectedAd(ad);
    setAdForm({
      name: ad.name || '',
      description: ad.description || '',
      type: ad.type || 'display',
      category: ad.category || 'technology',
      advertiserName: ad.advertiserName || '',
      advertiserContact: ad.advertiserContact || { name: '', email: '', phone: '' },
      campaignName: ad.campaignName || '',
      tags: ad.tags || [],
      creative: ad.creative || EMPTY_AD_FORM.creative,
      placement: ad.placement || EMPTY_AD_FORM.placement,
      budget: {
        ...EMPTY_AD_FORM.budget,
        ...ad.budget,
        startDate: ad.budget?.startDate ? new Date(ad.budget.startDate).toISOString().split('T')[0] : '',
        endDate: ad.budget?.endDate ? new Date(ad.budget.endDate).toISOString().split('T')[0] : '',
      },
      schedule: ad.schedule || EMPTY_AD_FORM.schedule,
      delivery: ad.delivery || EMPTY_AD_FORM.delivery,
      tracking: ad.tracking || EMPTY_AD_FORM.tracking,
      optimization: ad.optimization || EMPTY_AD_FORM.optimization,
      compliance: ad.compliance || EMPTY_AD_FORM.compliance,
    });
    setFormTab('basic');
    setShowEditModal(true);
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !adForm.tags.includes(t)) setAdForm(f => ({ ...f, tags: [...f.tags, t] }));
    setTagInput('');
  };
  const removeTag = (t) => setAdForm(f => ({ ...f, tags: f.tags.filter(x => x !== t) }));

  /* ─── FORM TABS ──────────────────────────────────── */
  const FORM_TABS = [
    { id: 'basic',      label: 'Basic Info',   icon: <FileText size={14} /> },
    { id: 'creative',   label: 'Creative',     icon: <Image size={14} /> },
    { id: 'placement',  label: 'Placement',    icon: <Target size={14} /> },
    { id: 'budget',     label: 'Budget',       icon: <DollarSign size={14} /> },
    { id: 'targeting',  label: 'Targeting',    icon: <Globe size={14} /> },
    { id: 'advanced',   label: 'Advanced',     icon: <Zap size={14} /> },
  ];

  /* ─── FILTERED ADS ───────────────────────────────── */
  const filteredAds = ads.filter(ad => {
    if (activeTab !== 'all' && ad.status !== activeTab) return false;
    return true;
  });

  /* ─── STAT TILES ─────────────────────────────────── */
  const STAT_TILES = [
    { icon: <Megaphone size={18} />, ico: 'ai-news-amp-ico-purple', val: fmt(stats.total || totalAds), lbl: 'Total Ads' },
    { icon: <Activity size={18} />, ico: 'ai-news-amp-ico-green', val: fmt(stats.active), lbl: 'Active' },
    { icon: <Pause size={18} />, ico: 'ai-news-amp-ico-orange', val: fmt(stats.paused), lbl: 'Paused' },
    { icon: <Clock size={18} />, ico: 'ai-news-amp-ico-cyan', val: fmt(stats.pendingReview), lbl: 'Pending Review' },
    { icon: <DollarSign size={18} />, ico: 'ai-news-amp-ico-gold', val: fmtMoney(stats.totalSpend), lbl: 'Total Spend' },
    { icon: <Eye size={18} />, ico: 'ai-news-amp-ico-purple', val: fmt(stats.totalImpressions), lbl: 'Impressions' },
    { icon: <MousePointer size={18} />, ico: 'ai-news-amp-ico-cyan', val: fmt(stats.totalClicks), lbl: 'Total Clicks' },
    { icon: <TrendingUp size={18} />, ico: 'ai-news-amp-ico-green', val: fmtPct(stats.avgCtr), lbl: 'Avg CTR' },
  ];

  /* ─── QUICK STATUS TABS ──────────────────────────── */
  const STATUS_TABS = ['all', 'active', 'paused', 'review', 'draft', 'completed'];

  /* ─── RENDER ─────────────────────────────────────── */
  return (
    <div className={`ai-news-admin-managing-pages-root ${isDarkMode ? 'dark' : 'light'}`}>
      <main className="ai-news-admin-managing-pages-page">

        {/* Breadcrumb */}
        <nav className="ai-news-amp-breadcrumb" aria-label="Breadcrumb">
          <span>Admin</span><ChevronRight size={13} /><span>Monetisation</span><ChevronRight size={13} /><span>Advertisement</span>
        </nav>

        {/* Header */}
        <header className="ai-news-admin-managing-pages-header">
          <div className="ai-news-admin-managing-pages-header-left">
            <div className="ai-news-admin-managing-pages-icon-wrap"><Megaphone size={24} /></div>
            <div>
              <h1 className="ai-news-admin-managing-pages-title">Advertisement Manager</h1>
              <p className="ai-news-admin-managing-pages-subtitle">
                Manage ad campaigns, creatives, targeting, budgets and real-time performance metrics
                <span className="ai-news-amp-badge ai-news-amp-badge-green">
                  <Activity size={10} /> {stats.active || 0} Live
                </span>
              </p>
            </div>
          </div>
          <div className="ai-news-admin-managing-pages-header-actions">
            <button className="ai-news-amp-btn ai-news-amp-btn-ghost" onClick={() => { AINewsFetchAds(); AINewsFetchAdStats(); }}>
              <RefreshCw size={15} className={loading ? 'ai-news-amp-spinning' : ''} /> Reload
            </button>
            <button className="ai-news-amp-btn ai-news-amp-btn-primary" onClick={() => { setAdForm(EMPTY_AD_FORM); setFormTab('basic'); setShowAddModal(true); }}>
              <Plus size={15} /> New Ad
            </button>
          </div>
        </header>

        {/* Info box */}
        <div className="ai-news-amp-info-box" role="note">
          <div className="ai-news-amp-info-box-title"><Info size={14} /> Ad Management System</div>
          <p className="ai-news-amp-info-box-text">
            Create and manage display, video, native, banner, interstitial, and sponsored content advertisements. Each ad supports precise geo, demographic, behavioural and content-based targeting, CPM/CPC/CPA bidding strategies, A/B testing, real-time fraud detection and comprehensive performance analytics. Ads require admin approval before going live.
          </p>
        </div>

        {/* Stats */}
        <div className="ai-news-admin-managing-pages-stats">
          {STAT_TILES.map((s, i) => (
            <div key={i} className="ai-news-admin-managing-pages-stat">
              <div className={`ai-news-admin-managing-pages-stat-ico ${s.ico}`}>{s.icon}</div>
              <div>
                <div className="ai-news-admin-managing-pages-stat-val">{s.val}</div>
                <div className="ai-news-admin-managing-pages-stat-lbl">{s.lbl}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Status Tabs */}
        <div className="ai-news-amp-tabs" role="tablist">
          {STATUS_TABS.map(t => (
            <button key={t} role="tab" aria-selected={activeTab === t}
              className={`ai-news-amp-tab ${activeTab === t ? 'ai-news-amp-tab-active' : ''}`}
              onClick={() => { setActiveTab(t); setPage(1); }}>
              {capitalize(t === 'all' ? 'All Ads' : t)}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="ai-news-admin-managing-pages-toolbar">
          <div className="ai-news-admin-managing-pages-search-box">
            <Search size={15} />
            <input className="ai-news-admin-managing-pages-search-input" placeholder="Search ads by name, advertiser, campaign…"
              value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setPage(1); }} />
            {searchQuery && <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--amp-text-3)', display: 'flex' }} onClick={() => setSearchQuery('')}><X size={13} /></button>}
          </div>
          <select className="ai-news-admin-managing-pages-select" value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1); }}>
            <option value="all">All Types</option>
            {AD_TYPES.map(t => <option key={t} value={t}>{capitalize(t.replace('_', ' '))}</option>)}
          </select>
          <select className="ai-news-admin-managing-pages-select" value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}>
            {AD_STATUSES.map(s => <option key={s} value={s}>{capitalize(s)}</option>)}
          </select>
          <select className="ai-news-admin-managing-pages-select" value={filterCategory} onChange={e => { setFilterCategory(e.target.value); setPage(1); }}>
            <option value="all">All Categories</option>
            {AD_CATEGORIES.map(c => <option key={c} value={c}>{capitalize(c.replace('_', ' '))}</option>)}
          </select>
          <div className="ai-news-admin-managing-pages-toolbar-spacer" />
          <span style={{ fontSize: '0.8rem', color: 'var(--amp-text-3)' }}>{totalAds} ads</span>
          <div className="ai-news-amp-view-toggle">
            <button className={`ai-news-amp-view-btn ${view === 'table' ? 'ai-news-amp-view-btn-active' : ''}`} onClick={() => setView('table')} title="Table view"><List size={16} /></button>
            <button className={`ai-news-amp-view-btn ${view === 'cards' ? 'ai-news-amp-view-btn-active' : ''}`} onClick={() => setView('cards')} title="Card view"><LayoutGrid size={16} /></button>
          </div>
        </div>

        {/* ─── TABLE VIEW ─── */}
        {loading ? (
          <div style={{ padding: '2rem' }}>
            {[...Array(6)].map((_, i) => <div key={i} className="ai-news-amp-skeleton" style={{ height: 52, marginBottom: 12, borderRadius: 10 }} />)}
          </div>
        ) : filteredAds.length === 0 ? (
          <div className="ai-news-amp-empty">
            <Megaphone className="ai-news-amp-empty-ico" />
            <div className="ai-news-amp-empty-title">No Advertisements Found</div>
            <p className="ai-news-amp-empty-text">Try adjusting your filters or create your first ad.</p>
          </div>
        ) : view === 'table' ? (
          <div className="ai-news-admin-managing-pages-table-wrap">
            <div className="ai-news-admin-managing-pages-table-scroll">
              <table className="ai-news-admin-managing-pages-table" role="grid">
                <thead className="ai-news-admin-managing-pages-table-head">
                  <tr>
                    <th className="ai-news-admin-managing-pages-table-th">Ad / Advertiser</th>
                    <th className="ai-news-admin-managing-pages-table-th">Type</th>
                    <th className="ai-news-admin-managing-pages-table-th">Status</th>
                    <th className="ai-news-admin-managing-pages-table-th">Budget</th>
                    <th className="ai-news-admin-managing-pages-table-th">Impressions</th>
                    <th className="ai-news-admin-managing-pages-table-th">Clicks</th>
                    <th className="ai-news-admin-managing-pages-table-th">CTR</th>
                    <th className="ai-news-admin-managing-pages-table-th">Spend</th>
                    <th className="ai-news-admin-managing-pages-table-th">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAds.map(ad => {
                    const badge = STATUS_BADGE[ad.status] || { cls: 'ai-news-amp-badge-gray', label: ad.status };
                    return (
                      <tr key={ad._id} className="ai-news-admin-managing-pages-table-row">
                        <td className="ai-news-admin-managing-pages-table-td">
                          <div className="ai-news-admin-managing-pages-table-td-name">
                            <div className="ai-news-amp-avatar" style={{ width: 32, height: 32, fontSize: '0.7rem', borderRadius: 8 }}>
                              {ad.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--amp-text)', fontSize: '0.88rem' }}>{ad.name}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--amp-text-3)' }}>{ad.advertiserName || 'Unknown Advertiser'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="ai-news-admin-managing-pages-table-td">
                          <span className="ai-news-amp-badge ai-news-amp-badge-purple">
                            {TYPE_ICON[ad.type]} {capitalize(ad.type?.replace('_', ' '))}
                          </span>
                        </td>
                        <td className="ai-news-admin-managing-pages-table-td">
                          <span className={`ai-news-amp-badge ${badge.cls}`}>{badge.label}</span>
                        </td>
                        <td className="ai-news-admin-managing-pages-table-td">
                          <div style={{ fontSize: '0.88rem' }}>{fmtMoney(ad.budget?.amount)} <span style={{ color: 'var(--amp-text-3)', fontSize: '0.75rem' }}>/ {ad.budget?.type}</span></div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--amp-text-3)' }}>Spent: {fmtMoney(ad.budget?.spent || 0)}</div>
                        </td>
                        <td className="ai-news-admin-managing-pages-table-td">{fmt(ad.metrics?.impressions)}</td>
                        <td className="ai-news-admin-managing-pages-table-td">{fmt(ad.metrics?.clicks)}</td>
                        <td className="ai-news-admin-managing-pages-table-td">
                          <div className="ai-news-amp-score-bar">
                            <div className="ai-news-amp-score-track">
                              <div className="ai-news-amp-score-fill" style={{ width: `${Math.min(ad.metrics?.ctr || 0, 10) * 10}%` }} />
                            </div>
                            <span className="ai-news-amp-score-val">{fmtPct(ad.metrics?.ctr)}</span>
                          </div>
                        </td>
                        <td className="ai-news-admin-managing-pages-table-td">{fmtMoney(ad.metrics?.cost?.total)}</td>
                        <td className="ai-news-admin-managing-pages-table-td">
                          <div className="ai-news-admin-managing-pages-table-actions">
                            <button className="ai-news-amp-btn ai-news-amp-btn-ghost ai-news-amp-btn-sm ai-news-amp-btn-icon" title="View details" onClick={() => { setSelectedAd(ad); setShowDetailModal(true); }}><Eye size={14} /></button>
                            <button className="ai-news-amp-btn ai-news-amp-btn-ghost ai-news-amp-btn-sm ai-news-amp-btn-icon" title="Metrics" onClick={() => { setSelectedAd(ad); setShowMetricsModal(true); }}><BarChart2 size={14} /></button>
                            <button className="ai-news-amp-btn ai-news-amp-btn-ghost ai-news-amp-btn-sm ai-news-amp-btn-icon" title="Edit" onClick={() => openEdit(ad)}><Edit2 size={14} /></button>
                            {ad.status === 'active' && <button className="ai-news-amp-btn ai-news-amp-btn-warning ai-news-amp-btn-sm ai-news-amp-btn-icon" title="Pause" onClick={() => AINewsChangeAdStatus(ad, 'paused', 'Admin paused')}><Pause size={14} /></button>}
                            {ad.status === 'paused' && <button className="ai-news-amp-btn ai-news-amp-btn-success ai-news-amp-btn-sm ai-news-amp-btn-icon" title="Resume" onClick={() => AINewsChangeAdStatus(ad, 'active')}><Play size={14} /></button>}
                            {ad.status === 'review' && <>
                              <button className="ai-news-amp-btn ai-news-amp-btn-success ai-news-amp-btn-sm ai-news-amp-btn-icon" title="Approve" onClick={() => AINewsApproveAd(ad)}><CheckCircle size={14} /></button>
                              <button className="ai-news-amp-btn ai-news-amp-btn-danger ai-news-amp-btn-sm ai-news-amp-btn-icon" title="Reject" onClick={() => AINewsRejectAd(ad)}><X size={14} /></button>
                            </>}
                            <button className="ai-news-amp-btn ai-news-amp-btn-ghost ai-news-amp-btn-sm ai-news-amp-btn-icon" title="Duplicate" onClick={() => AINewsDuplicateAd(ad)}><Copy size={14} /></button>
                            <button className="ai-news-amp-btn ai-news-amp-btn-danger ai-news-amp-btn-sm ai-news-amp-btn-icon" title="Delete" onClick={() => AINewsDeleteAd(ad)}><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="ai-news-amp-pagination">
                <button className="ai-news-amp-page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}><ArrowLeft size={14} /></button>
                {[...Array(Math.min(totalPages, 7))].map((_, i) => {
                  const pg = i + 1;
                  return <button key={pg} className={`ai-news-amp-page-btn ${page === pg ? 'ai-news-amp-page-btn-active' : ''}`} onClick={() => setPage(pg)}>{pg}</button>;
                })}
                <button className="ai-news-amp-page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}><ArrowRight size={14} /></button>
              </div>
            )}
          </div>
        ) : (
          /* ─── CARD VIEW ─── */
          <div className="ai-news-admin-managing-pages-cards-grid">
            {filteredAds.map(ad => {
              const badge = STATUS_BADGE[ad.status] || { cls: 'ai-news-amp-badge-gray', label: ad.status };
              return (
                <article key={ad._id} className="ai-news-admin-managing-pages-card">
                  <div className="ai-news-admin-managing-pages-card-head">
                    <div>
                      <div className="ai-news-admin-managing-pages-card-title">
                        {TYPE_ICON[ad.type]}
                        {ad.name}
                      </div>
                      <div className="ai-news-admin-managing-pages-card-meta">{ad.advertiserName || 'Unknown Advertiser'} · {capitalize(ad.category?.replace('_', ' '))}</div>
                    </div>
                    <span className={`ai-news-amp-badge ${badge.cls}`}>{badge.label}</span>
                  </div>

                  <div className="ai-news-admin-managing-pages-card-body">
                    <div className="ai-news-amp-metric-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                      <div className="ai-news-amp-metric-card">
                        <div className="ai-news-amp-metric-lbl">Impressions</div>
                        <div className="ai-news-amp-metric-val" style={{ fontSize: '1.1rem' }}>{fmt(ad.metrics?.impressions)}</div>
                      </div>
                      <div className="ai-news-amp-metric-card">
                        <div className="ai-news-amp-metric-lbl">Clicks</div>
                        <div className="ai-news-amp-metric-val" style={{ fontSize: '1.1rem' }}>{fmt(ad.metrics?.clicks)}</div>
                      </div>
                      <div className="ai-news-amp-metric-card">
                        <div className="ai-news-amp-metric-lbl">CTR</div>
                        <div className="ai-news-amp-metric-val" style={{ fontSize: '1.1rem' }}>{fmtPct(ad.metrics?.ctr)}</div>
                      </div>
                      <div className="ai-news-amp-metric-card">
                        <div className="ai-news-amp-metric-lbl">Spend</div>
                        <div className="ai-news-amp-metric-val" style={{ fontSize: '1.1rem' }}>{fmtMoney(ad.metrics?.cost?.total)}</div>
                      </div>
                    </div>

                    <div style={{ marginTop: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--amp-text-3)', marginBottom: '0.3rem' }}>
                        <span>Budget spent</span>
                        <span>{fmtMoney(ad.budget?.spent || 0)} / {fmtMoney(ad.budget?.amount)}</span>
                      </div>
                      <div className="ai-news-amp-score-track">
                        <div className="ai-news-amp-score-fill" style={{ width: `${Math.min(((ad.budget?.spent || 0) / (ad.budget?.amount || 1)) * 100, 100)}%` }} />
                      </div>
                    </div>

                    {ad.tags?.length > 0 && (
                      <div className="ai-news-amp-tags-wrap" style={{ marginTop: '0.65rem' }}>
                        {ad.tags.slice(0, 3).map(t => <span key={t} className="ai-news-amp-tag-pill">{t}</span>)}
                        {ad.tags.length > 3 && <span className="ai-news-amp-tag-pill">+{ad.tags.length - 3}</span>}
                      </div>
                    )}
                  </div>

                  <div className="ai-news-admin-managing-pages-card-footer">
                    <div style={{ fontSize: '0.78rem', color: 'var(--amp-text-3)' }}>
                      <Calendar size={11} style={{ display: 'inline', marginRight: 3 }} />
                      {ad.budget?.startDate ? new Date(ad.budget.startDate).toLocaleDateString() : '—'}
                    </div>
                    <div className="ai-news-admin-managing-pages-card-actions">
                      <button className="ai-news-amp-btn ai-news-amp-btn-ghost ai-news-amp-btn-sm" onClick={() => { setSelectedAd(ad); setShowDetailModal(true); }}><Eye size={13} /></button>
                      <button className="ai-news-amp-btn ai-news-amp-btn-ghost ai-news-amp-btn-sm" onClick={() => openEdit(ad)}><Edit2 size={13} /></button>
                      {ad.status === 'review' && <button className="ai-news-amp-btn ai-news-amp-btn-success ai-news-amp-btn-sm" onClick={() => AINewsApproveAd(ad)}><CheckCircle size={13} /></button>}
                      <button className="ai-news-amp-btn ai-news-amp-btn-danger ai-news-amp-btn-sm" onClick={() => AINewsDeleteAd(ad)}><Trash2 size={13} /></button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* ══════════════════════════════════════════════
            ADD / EDIT MODAL
        ══════════════════════════════════════════════ */}
        {(showAddModal || showEditModal) && (
          <div className="ai-news-amp-modal-overlay" role="dialog" aria-modal="true">
            <div className="ai-news-amp-modal ai-news-amp-modal-xl">
              <div className="ai-news-amp-modal-header">
                <div className="ai-news-amp-modal-title">
                  <Megaphone size={18} />
                  {showAddModal ? 'Create New Advertisement' : `Edit: ${selectedAd?.name}`}
                </div>
                <button className="ai-news-amp-modal-close" onClick={() => { setShowAddModal(false); setShowEditModal(false); }}><X size={16} /></button>
              </div>

              {/* Form Tabs */}
              <div style={{ padding: '0.75rem 1.5rem 0', background: 'var(--amp-bg-raised)', borderBottom: '1px solid var(--amp-border)', display: 'flex', gap: '0.25rem', overflowX: 'auto' }}>
                {FORM_TABS.map(t => (
                  <button key={t.id} className={`ai-news-amp-tab ${formTab === t.id ? 'ai-news-amp-tab-active' : ''}`} onClick={() => setFormTab(t.id)}>
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>

              <div className="ai-news-amp-modal-body">

                {/* ── BASIC INFO ── */}
                {formTab === 'basic' && (
                  <div className="ai-news-amp-form-grid">
                    <div className="ai-news-amp-form-section">Ad Identity</div>
                    <div className="ai-news-amp-field ai-news-amp-form-full">
                      <label className="ai-news-amp-label">Ad Name <span className="ai-news-amp-label-req">*</span></label>
                      <input className="ai-news-amp-input" placeholder="e.g. Summer AI Tools Campaign — Banner" value={adForm.name} onChange={e => setField('name', e.target.value)} />
                    </div>
                    <div className="ai-news-amp-field ai-news-amp-form-full">
                      <label className="ai-news-amp-label">Description</label>
                      <textarea className="ai-news-amp-textarea" placeholder="Internal notes about this ad…" value={adForm.description} onChange={e => setField('description', e.target.value)} />
                    </div>
                    <div className="ai-news-amp-field">
                      <label className="ai-news-amp-label">Ad Type <span className="ai-news-amp-label-req">*</span></label>
                      <select className="ai-news-amp-sel" value={adForm.type} onChange={e => setField('type', e.target.value)}>
                        {AD_TYPES.map(t => <option key={t} value={t}>{capitalize(t.replace('_', ' '))}</option>)}
                      </select>
                    </div>
                    <div className="ai-news-amp-field">
                      <label className="ai-news-amp-label">Category</label>
                      <select className="ai-news-amp-sel" value={adForm.category} onChange={e => setField('category', e.target.value)}>
                        {AD_CATEGORIES.map(c => <option key={c} value={c}>{capitalize(c.replace('_', ' '))}</option>)}
                      </select>
                    </div>

                    <div className="ai-news-amp-form-section">Advertiser</div>
                    <div className="ai-news-amp-field">
                      <label className="ai-news-amp-label">Advertiser Name</label>
                      <input className="ai-news-amp-input" placeholder="Company name" value={adForm.advertiserName} onChange={e => setField('advertiserName', e.target.value)} />
                    </div>
                    <div className="ai-news-amp-field">
                      <label className="ai-news-amp-label">Campaign Name</label>
                      <input className="ai-news-amp-input" placeholder="Campaign this ad belongs to" value={adForm.campaignName} onChange={e => setField('campaignName', e.target.value)} />
                    </div>
                    <div className="ai-news-amp-field">
                      <label className="ai-news-amp-label">Contact Name</label>
                      <input className="ai-news-amp-input" value={adForm.advertiserContact?.name || ''} onChange={e => setField('advertiserContact.name', e.target.value)} />
                    </div>
                    <div className="ai-news-amp-field">
                      <label className="ai-news-amp-label">Contact Email</label>
                      <input type="email" className="ai-news-amp-input" value={adForm.advertiserContact?.email || ''} onChange={e => setField('advertiserContact.email', e.target.value)} />
                    </div>
                    <div className="ai-news-amp-field">
                      <label className="ai-news-amp-label">Contact Phone</label>
                      <input className="ai-news-amp-input" value={adForm.advertiserContact?.phone || ''} onChange={e => setField('advertiserContact.phone', e.target.value)} />
                    </div>

                    <div className="ai-news-amp-form-section ai-news-amp-form-full">Tags</div>
                    <div className="ai-news-amp-field ai-news-amp-form-full">
                      <label className="ai-news-amp-label">Tags</label>
                      <div className="ai-news-amp-chip-wrap">
                        {adForm.tags.map(t => (
                          <span key={t} className="ai-news-amp-chip">{t}
                            <button className="ai-news-amp-chip-rm" onClick={() => removeTag(t)}><X size={10} /></button>
                          </span>
                        ))}
                        <input className="ai-news-amp-chip-text-inp" placeholder="Add tag…" value={tagInput}
                          onChange={e => setTagInput(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); } }} />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── CREATIVE ── */}
                {formTab === 'creative' && (
                  <div className="ai-news-amp-form-grid">
                    <div className="ai-news-amp-form-section">Creative Content</div>
                    <div className="ai-news-amp-field">
                      <label className="ai-news-amp-label">Headline <span style={{ fontSize: '0.72rem', color: 'var(--amp-text-3)' }}>(max 100)</span></label>
                      <input className="ai-news-amp-input" maxLength={100} placeholder="Compelling headline…" value={adForm.creative?.content?.headline || ''} onChange={e => setField('creative.content.headline', e.target.value)} />
                    </div>
                    <div className="ai-news-amp-field">
                      <label className="ai-news-amp-label">Brand Name</label>
                      <input className="ai-news-amp-input" placeholder="Your brand" value={adForm.creative?.content?.brandName || ''} onChange={e => setField('creative.content.brandName', e.target.value)} />
                    </div>
                    <div className="ai-news-amp-field ai-news-amp-form-full">
                      <label className="ai-news-amp-label">Description <span style={{ fontSize: '0.72rem', color: 'var(--amp-text-3)' }}>(max 500)</span></label>
                      <textarea className="ai-news-amp-textarea" maxLength={500} placeholder="Ad description copy…" value={adForm.creative?.content?.description || ''} onChange={e => setField('creative.content.description', e.target.value)} />
                    </div>
                    <div className="ai-news-amp-field">
                      <label className="ai-news-amp-label">CTA Text <span style={{ fontSize: '0.72rem', color: 'var(--amp-text-3)' }}>(max 50)</span></label>
                      <input className="ai-news-amp-input" maxLength={50} placeholder="Learn More" value={adForm.creative?.content?.cta?.text || ''} onChange={e => setField('creative.content.cta.text', e.target.value)} />
                    </div>
                    <div className="ai-news-amp-field">
                      <label className="ai-news-amp-label">CTA Type</label>
                      <select className="ai-news-amp-sel" value={adForm.creative?.content?.cta?.type || 'learn_more'} onChange={e => setField('creative.content.cta.type', e.target.value)}>
                        {['learn_more', 'buy_now', 'sign_up', 'download', 'contact', 'book_now', 'get_offer'].map(c => <option key={c} value={c}>{capitalize(c.replace(/_/g, ' '))}</option>)}
                      </select>
                    </div>
                    <div className="ai-news-amp-field">
                      <label className="ai-news-amp-label">Sponsored By</label>
                      <input className="ai-news-amp-input" value={adForm.creative?.content?.sponsoredBy || ''} onChange={e => setField('creative.content.sponsoredBy', e.target.value)} />
                    </div>
                    <div className="ai-news-amp-field ai-news-amp-form-full">
                      <label className="ai-news-amp-label">Disclaimer</label>
                      <input className="ai-news-amp-input" placeholder="Legal disclaimer text…" value={adForm.creative?.content?.disclaimer || ''} onChange={e => setField('creative.content.disclaimer', e.target.value)} />
                    </div>

                    <div className="ai-news-amp-form-section">Destination</div>
                    <div className="ai-news-amp-field">
                      <label className="ai-news-amp-label">Destination Type</label>
                      <select className="ai-news-amp-sel" value={adForm.creative?.destination?.type || 'url'} onChange={e => setField('creative.destination.type', e.target.value)}>
                        {['url', 'article', 'category', 'app', 'deep_link', 'download'].map(d => <option key={d} value={d}>{capitalize(d.replace('_', ' '))}</option>)}
                      </select>
                    </div>
                    <div className="ai-news-amp-field ai-news-amp-form-full">
                      <label className="ai-news-amp-label">Destination URL</label>
                      <input className="ai-news-amp-input" placeholder="https://…" value={adForm.creative?.destination?.url || ''} onChange={e => setField('creative.destination.url', e.target.value)} />
                    </div>

                    <div className="ai-news-amp-form-section">UTM Parameters</div>
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">UTM Source</label><input className="ai-news-amp-input" value={adForm.creative?.destination?.utmParams?.source || 'newsai'} onChange={e => setField('creative.destination.utmParams.source', e.target.value)} /></div>
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">UTM Medium</label><input className="ai-news-amp-input" value={adForm.creative?.destination?.utmParams?.medium || 'ad'} onChange={e => setField('creative.destination.utmParams.medium', e.target.value)} /></div>
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">UTM Campaign</label><input className="ai-news-amp-input" value={adForm.creative?.destination?.utmParams?.campaign || ''} onChange={e => setField('creative.destination.utmParams.campaign', e.target.value)} /></div>
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">UTM Term</label><input className="ai-news-amp-input" value={adForm.creative?.destination?.utmParams?.term || ''} onChange={e => setField('creative.destination.utmParams.term', e.target.value)} /></div>
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">UTM Content</label><input className="ai-news-amp-input" value={adForm.creative?.destination?.utmParams?.content || ''} onChange={e => setField('creative.destination.utmParams.content', e.target.value)} /></div>
                  </div>
                )}

                {/* ── PLACEMENT ── */}
                {formTab === 'placement' && (
                  <div className="ai-news-amp-form-grid">
                    <div className="ai-news-amp-form-section">Position</div>
                    <div className="ai-news-amp-field">
                      <label className="ai-news-amp-label">Placement Position <span className="ai-news-amp-label-req">*</span></label>
                      <select className="ai-news-amp-sel" value={adForm.placement?.position?.type || 'sidebar'} onChange={e => setField('placement.position.type', e.target.value)}>
                        {PLACEMENT_POSITIONS.map(p => <option key={p} value={p}>{capitalize(p.replace(/_/g, ' '))}</option>)}
                      </select>
                    </div>
                    <div className="ai-news-amp-field">
                      <label className="ai-news-amp-label">Page</label>
                      <select className="ai-news-amp-sel" value={adForm.placement?.position?.location?.page || 'all'} onChange={e => setField('placement.position.location.page', e.target.value)}>
                        {['home', 'category', 'article', 'search', 'profile', 'all'].map(p => <option key={p} value={p}>{capitalize(p)}</option>)}
                      </select>
                    </div>
                    <div className="ai-news-amp-field">
                      <label className="ai-news-amp-label">Width (px)</label>
                      <input type="number" className="ai-news-amp-input" value={adForm.placement?.position?.size?.width || 300} onChange={e => setField('placement.position.size.width', Number(e.target.value))} />
                    </div>
                    <div className="ai-news-amp-field">
                      <label className="ai-news-amp-label">Height (px)</label>
                      <input type="number" className="ai-news-amp-input" value={adForm.placement?.position?.size?.height || 250} onChange={e => setField('placement.position.size.height', Number(e.target.value))} />
                    </div>
                    <div className="ai-news-amp-field">
                      <label className="ai-news-amp-label">Priority (1–10)</label>
                      <input type="number" min={1} max={10} className="ai-news-amp-input" value={adForm.placement?.position?.priority || 5} onChange={e => setField('placement.position.priority', Number(e.target.value))} />
                    </div>
                    <div className="ai-news-amp-field">
                      <label className="ai-news-amp-label">Load Strategy</label>
                      <select className="ai-news-amp-sel" value={adForm.placement?.position?.loadStrategy || 'lazy'} onChange={e => setField('placement.position.loadStrategy', e.target.value)}>
                        {['immediate', 'lazy', 'on_scroll', 'on_interaction'].map(s => <option key={s} value={s}>{capitalize(s.replace('_', ' '))}</option>)}
                      </select>
                    </div>

                    <div className="ai-news-amp-form-section">Frequency Caps</div>
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">Per Page</label><input type="number" min={0} className="ai-news-amp-input" value={adForm.placement?.frequencyCap?.impressions?.perPage || 2} onChange={e => setField('placement.frequencyCap.impressions.perPage', Number(e.target.value))} /></div>
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">Per Session</label><input type="number" min={0} className="ai-news-amp-input" value={adForm.placement?.frequencyCap?.impressions?.perSession || 5} onChange={e => setField('placement.frequencyCap.impressions.perSession', Number(e.target.value))} /></div>
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">Per Day</label><input type="number" min={0} className="ai-news-amp-input" value={adForm.placement?.frequencyCap?.impressions?.perDay || 10} onChange={e => setField('placement.frequencyCap.impressions.perDay', Number(e.target.value))} /></div>
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">Per Week</label><input type="number" min={0} className="ai-news-amp-input" value={adForm.placement?.frequencyCap?.impressions?.perWeek || ''} onChange={e => setField('placement.frequencyCap.impressions.perWeek', Number(e.target.value))} /></div>
                  </div>
                )}

                {/* ── BUDGET ── */}
                {formTab === 'budget' && (
                  <div className="ai-news-amp-form-grid">
                    <div className="ai-news-amp-form-section">Budget</div>
                    <div className="ai-news-amp-field">
                      <label className="ai-news-amp-label">Budget Type</label>
                      <select className="ai-news-amp-sel" value={adForm.budget?.type || 'monthly'} onChange={e => setField('budget.type', e.target.value)}>
                        {BUDGET_TYPES.map(b => <option key={b} value={b}>{capitalize(b)}</option>)}
                      </select>
                    </div>
                    <div className="ai-news-amp-field">
                      <label className="ai-news-amp-label">Budget Amount</label>
                      <input type="number" min={0} className="ai-news-amp-input" value={adForm.budget?.amount || 0} onChange={e => setField('budget.amount', Number(e.target.value))} />
                    </div>
                    <div className="ai-news-amp-field">
                      <label className="ai-news-amp-label">Currency</label>
                      <input className="ai-news-amp-input" value={adForm.budget?.currency || 'USD'} onChange={e => setField('budget.currency', e.target.value)} />
                    </div>
                    <div className="ai-news-amp-field">
                      <label className="ai-news-amp-label">Start Date</label>
                      <input type="date" className="ai-news-amp-input" value={adForm.budget?.startDate || ''} onChange={e => setField('budget.startDate', e.target.value)} />
                    </div>
                    <div className="ai-news-amp-field">
                      <label className="ai-news-amp-label">End Date</label>
                      <input type="date" className="ai-news-amp-input" value={adForm.budget?.endDate || ''} onChange={e => setField('budget.endDate', e.target.value)} />
                    </div>

                    <div className="ai-news-amp-form-section">Bidding Strategy</div>
                    <div className="ai-news-amp-field">
                      <label className="ai-news-amp-label">Bid Strategy</label>
                      <select className="ai-news-amp-sel" value={adForm.budget?.bidStrategy?.type || 'cpm'} onChange={e => setField('budget.bidStrategy.type', e.target.value)}>
                        {BID_STRATEGIES.map(b => <option key={b} value={b}>{b.toUpperCase()}</option>)}
                      </select>
                    </div>
                    <div className="ai-news-amp-field">
                      <label className="ai-news-amp-label">Bid Amount ($)</label>
                      <input type="number" min={0} step={0.01} className="ai-news-amp-input" value={adForm.budget?.bidStrategy?.amount || 0} onChange={e => setField('budget.bidStrategy.amount', Number(e.target.value))} />
                    </div>
                    <div className="ai-news-amp-field">
                      <label className="ai-news-amp-label">Max Bid ($)</label>
                      <input type="number" min={0} step={0.01} className="ai-news-amp-input" value={adForm.budget?.bidStrategy?.maxBid || ''} onChange={e => setField('budget.bidStrategy.maxBid', Number(e.target.value))} />
                    </div>
                    <div className="ai-news-amp-field">
                      <label className="ai-news-amp-label">Pacing</label>
                      <select className="ai-news-amp-sel" value={adForm.budget?.pacing?.type || 'standard'} onChange={e => setField('budget.pacing.type', e.target.value)}>
                        {['standard', 'accelerated', 'asap', 'even'].map(p => <option key={p} value={p}>{capitalize(p)}</option>)}
                      </select>
                    </div>
                  </div>
                )}

                {/* ── TARGETING ── */}
                {formTab === 'targeting' && (
                  <div className="ai-news-amp-form-grid">
                    <div className="ai-news-amp-alert ai-news-amp-alert-info ai-news-amp-form-full">
                      <Info size={15} />
                      <span>Targeting settings control who sees this ad. Narrower targeting reduces reach but improves relevance and performance. Use the API or admin SDK to set advanced custom audiences and behavioural rules.</span>
                    </div>
                    <div className="ai-news-amp-form-section">User Targeting</div>
                    <div className="ai-news-amp-field">
                      <label className="ai-news-amp-label">Target Users</label>
                      <select className="ai-news-amp-sel" value={adForm.targeting?.users?.type || 'all'} onChange={e => setField('targeting.users.type', e.target.value)}>
                        {['all', 'logged_in', 'anonymous', 'subscribed', 'free', 'premium', 'custom'].map(u => <option key={u} value={u}>{capitalize(u.replace('_', ' '))}</option>)}
                      </select>
                    </div>
                    <div className="ai-news-amp-form-section">Demographics</div>
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">Min Age</label><input type="number" min={13} max={100} className="ai-news-amp-input" value={adForm.targeting?.demographics?.ageRange?.min || ''} onChange={e => setField('targeting.demographics.ageRange.min', Number(e.target.value))} /></div>
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">Max Age</label><input type="number" min={13} max={100} className="ai-news-amp-input" value={adForm.targeting?.demographics?.ageRange?.max || ''} onChange={e => setField('targeting.demographics.ageRange.max', Number(e.target.value))} /></div>
                    <div className="ai-news-amp-form-section">Schedule</div>
                    <div className="ai-news-amp-field">
                      <label className="ai-news-amp-label">Time Schedule</label>
                      <select className="ai-news-amp-sel" value={adForm.targeting?.time?.schedule?.type || 'always'} onChange={e => setField('targeting.time.schedule.type', e.target.value)}>
                        {['always', 'specific_hours', 'specific_days'].map(s => <option key={s} value={s}>{capitalize(s.replace('_', ' '))}</option>)}
                      </select>
                    </div>
                    <div className="ai-news-amp-field">
                      <label className="ai-news-amp-label">Timezone</label>
                      <input className="ai-news-amp-input" value={adForm.targeting?.time?.schedule?.timezone || 'UTC'} onChange={e => setField('targeting.time.schedule.timezone', e.target.value)} />
                    </div>
                    <div className="ai-news-amp-form-section">Frequency</div>
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">Max Impressions / User</label><input type="number" min={0} className="ai-news-amp-input" value={adForm.targeting?.time?.frequency?.maxImpressionsPerUser || ''} onChange={e => setField('targeting.time.frequency.maxImpressionsPerUser', Number(e.target.value))} /></div>
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">Max Clicks / User</label><input type="number" min={0} className="ai-news-amp-input" value={adForm.targeting?.time?.frequency?.maxClicksPerUser || ''} onChange={e => setField('targeting.time.frequency.maxClicksPerUser', Number(e.target.value))} /></div>
                  </div>
                )}

                {/* ── ADVANCED ── */}
                {formTab === 'advanced' && (
                  <div className="ai-news-amp-form-grid">
                    <div className="ai-news-amp-form-section">Delivery</div>
                    <div className="ai-news-amp-field">
                      <label className="ai-news-amp-label">Delivery Method</label>
                      <select className="ai-news-amp-sel" value={adForm.delivery?.method || 'standard'} onChange={e => setField('delivery.method', e.target.value)}>
                        {DELIVERY_METHODS.map(m => <option key={m} value={m}>{capitalize(m)}</option>)}
                      </select>
                    </div>
                    <div className="ai-news-amp-field">
                      <label className="ai-news-amp-label">Delivery Priority (1–10)</label>
                      <input type="number" min={1} max={10} className="ai-news-amp-input" value={adForm.delivery?.priority || 5} onChange={e => setField('delivery.priority', Number(e.target.value))} />
                    </div>
                    <div className="ai-news-amp-field">
                      <label className="ai-news-amp-label">Guarantee</label>
                      <select className="ai-news-amp-sel" value={adForm.delivery?.guarantee || 'standard'} onChange={e => setField('delivery.guarantee', e.target.value)}>
                        {['standard', 'premium', 'guaranteed'].map(g => <option key={g} value={g}>{capitalize(g)}</option>)}
                      </select>
                    </div>

                    <div className="ai-news-amp-form-section">Optimisation</div>
                    <div className="ai-news-amp-toggle-row ai-news-amp-form-full">
                      <div className="ai-news-amp-toggle-info">
                        <div className="ai-news-amp-toggle-name">Auto-Optimise</div>
                        <div className="ai-news-amp-toggle-desc">Automatically adjust bids and targeting to hit your goal</div>
                      </div>
                      <label className="ai-news-amp-switch">
                        <input type="checkbox" className="ai-news-amp-switch-inp" checked={!!adForm.optimization?.enabled} onChange={e => setField('optimization.enabled', e.target.checked)} />
                        <span className="ai-news-amp-switch-track" />
                      </label>
                    </div>
                    {adForm.optimization?.enabled && <>
                      <div className="ai-news-amp-field">
                        <label className="ai-news-amp-label">Optimisation Goal</label>
                        <select className="ai-news-amp-sel" value={adForm.optimization?.goal || 'clicks'} onChange={e => setField('optimization.goal', e.target.value)}>
                          {['clicks', 'impressions', 'conversions', 'ctr', 'roas'].map(g => <option key={g} value={g}>{g.toUpperCase()}</option>)}
                        </select>
                      </div>
                      <div className="ai-news-amp-field">
                        <label className="ai-news-amp-label">Algorithm</label>
                        <select className="ai-news-amp-sel" value={adForm.optimization?.algorithm || 'automatic'} onChange={e => setField('optimization.algorithm', e.target.value)}>
                          {['manual', 'automatic', 'machine_learning'].map(a => <option key={a} value={a}>{capitalize(a.replace('_', ' '))}</option>)}
                        </select>
                      </div>
                    </>}

                    <div className="ai-news-amp-form-section">Compliance</div>
                    <div className="ai-news-amp-toggle-row ai-news-amp-form-full">
                      <div className="ai-news-amp-toggle-info">
                        <div className="ai-news-amp-toggle-name">Age Restricted</div>
                        <div className="ai-news-amp-toggle-desc">Only show to users above legal age</div>
                      </div>
                      <label className="ai-news-amp-switch">
                        <input type="checkbox" className="ai-news-amp-switch-inp" checked={!!adForm.compliance?.ageRestricted} onChange={e => setField('compliance.ageRestricted', e.target.checked)} />
                        <span className="ai-news-amp-switch-track" />
                      </label>
                    </div>
                    <div className="ai-news-amp-toggle-row ai-news-amp-form-full">
                      <div className="ai-news-amp-toggle-info">
                        <div className="ai-news-amp-toggle-name">Regulated Industry</div>
                        <div className="ai-news-amp-toggle-desc">Finance, healthcare, legal — requires additional review</div>
                      </div>
                      <label className="ai-news-amp-switch">
                        <input type="checkbox" className="ai-news-amp-switch-inp" checked={!!adForm.compliance?.regulatedIndustry} onChange={e => setField('compliance.regulatedIndustry', e.target.checked)} />
                        <span className="ai-news-amp-switch-track" />
                      </label>
                    </div>
                    <div className="ai-news-amp-toggle-row ai-news-amp-form-full">
                      <div className="ai-news-amp-toggle-info">
                        <div className="ai-news-amp-toggle-name">Disclaimer Required</div>
                        <div className="ai-news-amp-toggle-desc">Show legal disclaimer alongside this ad</div>
                      </div>
                      <label className="ai-news-amp-switch">
                        <input type="checkbox" className="ai-news-amp-switch-inp" checked={!!adForm.compliance?.disclaimerRequired} onChange={e => setField('compliance.disclaimerRequired', e.target.checked)} />
                        <span className="ai-news-amp-switch-track" />
                      </label>
                    </div>

                    <div className="ai-news-amp-form-section">Fraud Detection</div>
                    <div className="ai-news-amp-toggle-row ai-news-amp-form-full">
                      <div className="ai-news-amp-toggle-info">
                        <div className="ai-news-amp-toggle-name">Enable Fraud Detection</div>
                        <div className="ai-news-amp-toggle-desc">Flag suspicious impressions and clicks from bots and invalid traffic</div>
                      </div>
                      <label className="ai-news-amp-switch">
                        <input type="checkbox" className="ai-news-amp-switch-inp" checked={adForm.fraudDetection?.enabled ?? true} onChange={e => setField('fraudDetection.enabled', e.target.checked)} />
                        <span className="ai-news-amp-switch-track" />
                      </label>
                    </div>

                    <div className="ai-news-amp-form-section">A/B Testing</div>
                    <div className="ai-news-amp-toggle-row ai-news-amp-form-full">
                      <div className="ai-news-amp-toggle-info">
                        <div className="ai-news-amp-toggle-name">Enable A/B Test</div>
                        <div className="ai-news-amp-toggle-desc">Run this ad as part of a split test against other variants</div>
                      </div>
                      <label className="ai-news-amp-switch">
                        <input type="checkbox" className="ai-news-amp-switch-inp" checked={!!adForm.abTesting?.enabled} onChange={e => setField('abTesting.enabled', e.target.checked)} />
                        <span className="ai-news-amp-switch-track" />
                      </label>
                    </div>
                  </div>
                )}
              </div>

              <div className="ai-news-amp-modal-footer">
                <button className="ai-news-amp-btn ai-news-amp-btn-ghost" onClick={() => { setShowAddModal(false); setShowEditModal(false); }}>Cancel</button>
                <button className="ai-news-amp-btn ai-news-amp-btn-primary" onClick={showAddModal ? AINewsCreateAd : AINewsUpdateAd} disabled={saving || !adForm.name}>
                  {saving ? <><span className="ai-news-amp-loader" style={{ width: 15, height: 15 }} /> Saving…</> : <><Save size={15} />{showAddModal ? 'Create Ad' : 'Save Changes'}</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            DETAIL MODAL
        ══════════════════════════════════════════════ */}
        {showDetailModal && selectedAd && (
          <div className="ai-news-amp-modal-overlay" role="dialog" aria-modal="true">
            <div className="ai-news-amp-modal ai-news-amp-modal-lg">
              <div className="ai-news-amp-modal-header">
                <div className="ai-news-amp-modal-title"><Eye size={17} /> Ad Details</div>
                <button className="ai-news-amp-modal-close" onClick={() => setShowDetailModal(false)}><X size={16} /></button>
              </div>
              <div className="ai-news-amp-modal-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div className="ai-news-amp-avatar" style={{ width: 52, height: 52, fontSize: '1.2rem', borderRadius: 14 }}>{selectedAd.name?.charAt(0)}</div>
                  <div>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.15rem', color: 'var(--amp-text)' }}>{selectedAd.name}</div>
                    <div style={{ color: 'var(--amp-text-3)', fontSize: '0.85rem' }}>{selectedAd.advertiserName} · {capitalize(selectedAd.type?.replace('_', ' '))} · {capitalize(selectedAd.category?.replace('_', ' '))}</div>
                    <div style={{ marginTop: '0.4rem' }}>
                      <span className={`ai-news-amp-badge ${STATUS_BADGE[selectedAd.status]?.cls}`}>{STATUS_BADGE[selectedAd.status]?.label}</span>
                    </div>
                  </div>
                </div>

                {selectedAd.description && <p style={{ fontSize: '0.88rem', color: 'var(--amp-text-2)', marginBottom: '1.25rem', lineHeight: 1.6 }}>{selectedAd.description}</p>}

                <div className="ai-news-amp-glow-sep" />

                <div className="ai-news-amp-detail-grid" style={{ marginBottom: '1.25rem' }}>
                  <div className="ai-news-amp-detail-item"><span className="ai-news-amp-detail-key">Campaign</span><span className="ai-news-amp-detail-val">{selectedAd.campaignName || '—'}</span></div>
                  <div className="ai-news-amp-detail-item"><span className="ai-news-amp-detail-key">Contact</span><span className="ai-news-amp-detail-val">{selectedAd.advertiserContact?.email || '—'}</span></div>
                  <div className="ai-news-amp-detail-item"><span className="ai-news-amp-detail-key">Budget</span><span className="ai-news-amp-detail-val">{fmtMoney(selectedAd.budget?.amount)} / {selectedAd.budget?.type}</span></div>
                  <div className="ai-news-amp-detail-item"><span className="ai-news-amp-detail-key">Spent</span><span className="ai-news-amp-detail-val">{fmtMoney(selectedAd.budget?.spent || 0)}</span></div>
                  <div className="ai-news-amp-detail-item"><span className="ai-news-amp-detail-key">Bid Strategy</span><span className="ai-news-amp-detail-val">{selectedAd.budget?.bidStrategy?.type?.toUpperCase()} @ {fmtMoney(selectedAd.budget?.bidStrategy?.amount)}</span></div>
                  <div className="ai-news-amp-detail-item"><span className="ai-news-amp-detail-key">Placement</span><span className="ai-news-amp-detail-val">{capitalize(selectedAd.placement?.position?.type?.replace(/_/g, ' '))}</span></div>
                  <div className="ai-news-amp-detail-item"><span className="ai-news-amp-detail-key">Start Date</span><span className="ai-news-amp-detail-val">{selectedAd.budget?.startDate ? new Date(selectedAd.budget.startDate).toLocaleDateString() : '—'}</span></div>
                  <div className="ai-news-amp-detail-item"><span className="ai-news-amp-detail-key">End Date</span><span className="ai-news-amp-detail-val">{selectedAd.budget?.endDate ? new Date(selectedAd.budget.endDate).toLocaleDateString() : 'No end date'}</span></div>
                  <div className="ai-news-amp-detail-item"><span className="ai-news-amp-detail-key">Delivery</span><span className="ai-news-amp-detail-val">{capitalize(selectedAd.delivery?.method)}</span></div>
                  <div className="ai-news-amp-detail-item"><span className="ai-news-amp-detail-key">Priority</span><span className="ai-news-amp-detail-val">{selectedAd.delivery?.priority}/10</span></div>
                </div>

                {selectedAd.creative?.content?.headline && <>
                  <div className="ai-news-amp-glow-sep" />
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--amp-text-3)', marginBottom: '0.6rem' }}>Creative Preview</div>
                    <div className="ai-news-amp-ad-prev" style={{ flexDirection: 'column', gap: '0.5rem', textAlign: 'left', padding: '1.25rem' }}>
                      {selectedAd.creative.content.brandName && <div style={{ fontSize: '0.72rem', color: 'var(--amp-text-3)', textTransform: 'uppercase' }}>Sponsored by {selectedAd.creative.content.brandName}</div>}
                      <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1rem', color: 'var(--amp-text)' }}>{selectedAd.creative.content.headline}</div>
                      {selectedAd.creative.content.description && <div style={{ fontSize: '0.85rem', color: 'var(--amp-text-2)' }}>{selectedAd.creative.content.description}</div>}
                      {selectedAd.creative.content.cta?.text && <button className="ai-news-amp-btn ai-news-amp-btn-primary ai-news-amp-btn-sm" style={{ alignSelf: 'flex-start', marginTop: '0.25rem' }}>{selectedAd.creative.content.cta.text}</button>}
                      {selectedAd.creative.content.disclaimer && <div style={{ fontSize: '0.7rem', color: 'var(--amp-text-3)' }}>{selectedAd.creative.content.disclaimer}</div>}
                    </div>
                  </div>
                </>}

                {selectedAd.tags?.length > 0 && (
                  <div>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--amp-text-3)', marginBottom: '0.5rem' }}>Tags</div>
                    <div className="ai-news-amp-tags-wrap">
                      {selectedAd.tags.map(t => <span key={t} className="ai-news-amp-tag-pill">{t}</span>)}
                    </div>
                  </div>
                )}

                {/* Compliance flags */}
                <div className="ai-news-amp-glow-sep" />
                <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                  {selectedAd.compliance?.ageRestricted && <span className="ai-news-amp-badge ai-news-amp-badge-orange"><Shield size={11} /> Age Restricted</span>}
                  {selectedAd.compliance?.regulatedIndustry && <span className="ai-news-amp-badge ai-news-amp-badge-red"><AlertTriangle size={11} /> Regulated Industry</span>}
                  {selectedAd.fraudDetection?.enabled && <span className="ai-news-amp-badge ai-news-amp-badge-green"><CheckCircle size={11} /> Fraud Detection</span>}
                  {selectedAd.abTesting?.enabled && <span className="ai-news-amp-badge ai-news-amp-badge-cyan"><Zap size={11} /> A/B Test</span>}
                  {selectedAd.optimization?.enabled && <span className="ai-news-amp-badge ai-news-amp-badge-purple"><TrendingUp size={11} /> Auto-Optimised</span>}
                </div>
              </div>
              <div className="ai-news-amp-modal-footer">
                {selectedAd.status === 'review' && <>
                  <button className="ai-news-amp-btn ai-news-amp-btn-success ai-news-amp-btn-sm" onClick={() => { AINewsApproveAd(selectedAd); setShowDetailModal(false); }}><CheckCircle size={14} /> Approve</button>
                  <button className="ai-news-amp-btn ai-news-amp-btn-danger ai-news-amp-btn-sm" onClick={() => { AINewsRejectAd(selectedAd); setShowDetailModal(false); }}><X size={14} /> Reject</button>
                </>}
                <button className="ai-news-amp-btn ai-news-amp-btn-ghost" onClick={() => { openEdit(selectedAd); setShowDetailModal(false); }}><Edit2 size={14} /> Edit</button>
                <button className="ai-news-amp-btn ai-news-amp-btn-ghost" onClick={() => setShowDetailModal(false)}>Close</button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            METRICS MODAL
        ══════════════════════════════════════════════ */}
        {showMetricsModal && selectedAd && (
          <div className="ai-news-amp-modal-overlay" role="dialog" aria-modal="true">
            <div className="ai-news-amp-modal ai-news-amp-modal-lg">
              <div className="ai-news-amp-modal-header">
                <div className="ai-news-amp-modal-title"><BarChart2 size={17} /> Performance — {selectedAd.name}</div>
                <button className="ai-news-amp-modal-close" onClick={() => setShowMetricsModal(false)}><X size={16} /></button>
              </div>
              <div className="ai-news-amp-modal-body">
                <div className="ai-news-amp-metric-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', marginBottom: '1.5rem' }}>
                  {[
                    { lbl: 'Impressions',   val: fmt(selectedAd.metrics?.impressions),            sub: `${fmt(selectedAd.metrics?.uniqueImpressions)} unique` },
                    { lbl: 'Clicks',        val: fmt(selectedAd.metrics?.clicks),                  sub: `${fmt(selectedAd.metrics?.uniqueClicks)} unique` },
                    { lbl: 'CTR',           val: fmtPct(selectedAd.metrics?.ctr),                  sub: 'Click-through rate' },
                    { lbl: 'Conversions',   val: fmt(selectedAd.metrics?.conversions?.count),      sub: fmtPct(selectedAd.metrics?.conversions?.rate) + ' rate' },
                    { lbl: 'Conv. Value',   val: fmtMoney(selectedAd.metrics?.conversions?.value), sub: 'Total value' },
                    { lbl: 'Total Cost',    val: fmtMoney(selectedAd.metrics?.cost?.total),        sub: `CPM ${fmtMoney(selectedAd.metrics?.performance?.cpm)}` },
                    { lbl: 'CPC',           val: fmtMoney(selectedAd.metrics?.performance?.cpc),   sub: 'Cost per click' },
                    { lbl: 'CPA',           val: fmtMoney(selectedAd.metrics?.performance?.cpa),   sub: 'Cost per acquisition' },
                    { lbl: 'ROAS',          val: selectedAd.metrics?.performance?.roas ? `${Number(selectedAd.metrics.performance.roas).toFixed(2)}x` : '—', sub: 'Return on ad spend' },
                    { lbl: 'Viewability',   val: fmtPct(selectedAd.metrics?.viewability),          sub: '% viewed' },
                    { lbl: 'Interactions',  val: fmt(selectedAd.metrics?.interactions),            sub: 'Engagement events' },
                    { lbl: 'Completion',    val: fmtPct(selectedAd.metrics?.completionRate),       sub: 'Video completion' },
                  ].map((m, i) => (
                    <div key={i} className="ai-news-amp-metric-card">
                      <div className="ai-news-amp-metric-lbl">{m.lbl}</div>
                      <div className="ai-news-amp-metric-val" style={{ fontSize: '1.1rem' }}>{m.val}</div>
                      <div className="ai-news-amp-metric-sub">{m.sub}</div>
                    </div>
                  ))}
                </div>

                {/* Device breakdown */}
                {selectedAd.metrics?.devices?.length > 0 && (
                  <>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--amp-text-3)', marginBottom: '0.75rem' }}>Device Breakdown</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
                      {selectedAd.metrics.devices.map((d, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', width: 100, fontSize: '0.82rem', color: 'var(--amp-text-2)' }}>
                            {d.type === 'mobile' ? <Smartphone size={13} /> : d.type === 'tablet' ? <Tablet size={13} /> : <Monitor size={13} />}
                            {capitalize(d.type)}
                          </div>
                          <div className="ai-news-amp-score-track" style={{ flex: 1 }}>
                            <div className="ai-news-amp-score-fill" style={{ width: `${((d.impressions || 0) / (selectedAd.metrics?.impressions || 1)) * 100}%` }} />
                          </div>
                          <span style={{ fontSize: '0.78rem', color: 'var(--amp-text-3)', minWidth: 60 }}>{fmt(d.impressions)} impr.</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Budget pace */}
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--amp-text-3)', marginBottom: '0.5rem' }}>Budget Utilisation</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--amp-text-3)', marginBottom: '0.35rem' }}>
                  <span>Spent: {fmtMoney(selectedAd.budget?.spent || 0)}</span>
                  <span>Total: {fmtMoney(selectedAd.budget?.amount)}</span>
                </div>
                <div className="ai-news-amp-score-track" style={{ height: 10, borderRadius: 8 }}>
                  <div className="ai-news-amp-score-fill" style={{ width: `${Math.min(((selectedAd.budget?.spent || 0) / (selectedAd.budget?.amount || 1)) * 100, 100)}%`, height: '100%' }} />
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.78rem', color: 'var(--amp-text-3)', marginTop: '0.3rem' }}>
                  {(((selectedAd.budget?.spent || 0) / (selectedAd.budget?.amount || 1)) * 100).toFixed(1)}% used
                </div>

                {/* Fraud */}
                {selectedAd.fraudDetection?.enabled && (
                  <>
                    <div className="ai-news-amp-glow-sep" />
                    <div className="ai-news-amp-alert ai-news-amp-alert-warning">
                      <Shield size={15} />
                      <span>Fraud Detection: <strong>{fmt(selectedAd.fraudDetection?.suspiciousImpressions)}</strong> suspicious impressions and <strong>{fmt(selectedAd.fraudDetection?.suspiciousClicks)}</strong> suspicious clicks flagged. <strong>{selectedAd.fraudDetection?.blockedIps?.length || 0}</strong> IPs blocked.</span>
                    </div>
                  </>
                )}
              </div>
              <div className="ai-news-amp-modal-footer">
                <button className="ai-news-amp-btn ai-news-amp-btn-ghost" onClick={() => setShowMetricsModal(false)}>Close</button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}