import { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Filter, Plus, Edit2, Trash2, Eye, EyeOff, Ban, CheckCircle,
  RefreshCw, ChevronDown, ChevronUp, ArrowUp, ArrowDown, X, Check,
  MoreVertical, FileText, Clock, Flame, TrendingUp, Star, Archive,
  AlertTriangle, Shield, Tag, Globe, ExternalLink, Copy, Download,
  MessageSquare, Heart, Share2, BookOpen, Cpu, Calendar, Users,
  BarChart2, Hash, Settings, ChevronLeft, ChevronRight, Pin,
  Bookmark, Code2, Image, Video, Zap, AlertCircle, Lock, Unlock,
  Send, RotateCcw, Flag, Mail, Link2, Info, Layers, Database, Award
} from 'lucide-react';
import Swal from 'sweetalert2';
import { ThemeContext } from '../../context/ThemeContext';

const USER_TOKEN_KEY = 'ai_news_user_token';
const getUserToken = () => localStorage.getItem(USER_TOKEN_KEY);

/* ─── HELPERS ────────────────────────────────────────────── */
const formatNum = (n) => {
  if (!n && n !== 0) return '0';
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
};

const timeAgo = (d) => {
  if (!d) return '—';
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const fullDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const categoryLabel = (c) => c ? c.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : '—';

/* ─── MOCK DATA ──────────────────────────────────────────── */
const MOCK_ARTICLES = Array.from({ length: 48 }, (_, i) => ({
  _id: `art-${i + 1}`,
  articleId: `art-${i + 1}`,
  title: [
    'GPT-5 Unveiled: OpenAI\'s Most Powerful Model Yet Changes Everything',
    'Anthropic\'s Claude 4 Achieves Record Safety Scores in Red Team Trials',
    'Google DeepMind Releases Gemini Ultra 2.0 with Native Video Understanding',
    'Meta\'s Llama 4 Goes Open Source: 400B Parameters, Free for Commercial Use',
    'EU AI Act Takes Effect: What Every Developer Must Know',
    'NVIDIA B200 Blackwell GPU: The Hardware Powering Next-Gen AI Training',
    'Microsoft Integrates GPT-5 Across All Office 365 Products',
    'DeepSeek V3 Outperforms Western Models at 10% of the Cost',
    'Apple\'s On-Device AI: Privacy-First Machine Learning Arrives on iPhone 17',
    'Mistral Releases Mixtral 8x22B: Open Source Beats GPT-4 on Key Benchmarks',
    'AI Discovers New Antibiotic Compounds That Kill Drug-Resistant Bacteria',
    'Tesla\'s Full Self-Driving 13.0 Passes California DMV Autonomous Test',
    'OpenAI\'s Sora Enterprise: Video Generation at Professional Scale',
    'Researchers Create AI That Can Learn From a Single Example Like Humans',
    'China\'s Kimi-VL Sets New Record on Multimodal Reasoning Benchmarks',
    'Stanford AI Index 2025: Investment Surges, Safety Concerns Mount',
  ][i % 16],
  slug: `article-slug-${i + 1}`,
  subtitle: 'A comprehensive analysis of what this means for the industry and developers worldwide.',
  excerpt: 'This groundbreaking development represents a significant shift in how artificial intelligence systems are designed and deployed across enterprise environments.',
  aiCategory: ['llm', 'computer-vision', 'ai-regulation', 'ai-hardware', 'robotics', 'generative-ai', 'ai-research', 'ai-healthcare'][i % 8],
  aiTags: ['openai', 'llm', 'gpt', 'ai-research', 'benchmark'].slice(0, 3 + (i % 3)),
  status: ['published', 'published', 'published', 'draft', 'review', 'archived', 'scheduled', 'published'][i % 8],
  isDeleted: i === 5 || i === 11,
  isAIGenerated: i % 5 === 0,
  publishedAt: i % 4 !== 3 ? new Date(Date.now() - i * 3600000 * 8).toISOString() : null,
  scheduledAt: i % 8 === 6 ? new Date(Date.now() + 86400000 * 2).toISOString() : null,
  createdAt: new Date(Date.now() - i * 3600000 * 24).toISOString(),
  updatedAt: new Date(Date.now() - i * 3600000 * 4).toISOString(),
  author: { _id: `u${(i % 4) + 1}`, name: ['Sophia Chen', 'Marcus Liu', 'Priya Nair', 'Jordan Kim'][i % 4], role: 'Senior AI Correspondent' },
  coAuthors: i % 3 === 0 ? [{ name: 'Alex Rivera' }] : [],
  featuredImage: { url: `https://images.unsplash.com/photo-${1677442135703 + i * 1000}?w=400&h=200&fit=crop`, alt: 'Article image', credit: 'Unsplash' },
  aiMetadata: {
    isBreaking: i % 7 === 0,
    isFeatured: i % 5 === 0,
    isTrending: i % 4 === 0,
    isFromConference: i % 9 === 0,
    conferenceName: i % 9 === 0 ? 'NeurIPS 2025' : null,
    hasCode: i % 6 === 0,
    codeUrl: i % 6 === 0 ? 'https://github.com/example/repo' : null,
    hasPaper: i % 4 === 0,
    paperUrl: i % 4 === 0 ? 'https://arxiv.org/abs/example' : null,
    paperDoi: i % 4 === 0 ? '10.1234/example' : null,
    modelName: i % 3 === 0 ? ['GPT-5', 'Claude 4', 'Gemini Ultra', 'Llama 4'][i % 4] : null,
    modelVersion: i % 3 === 0 ? '1.0' : null,
    modelType: i % 3 === 0 ? 'LLM' : null,
    modelOpenSource: i % 6 === 0,
    apiAvailable: i % 4 === 0,
  },
  readability: { score: 70 + (i % 25), level: ['beginner', 'intermediate', 'advanced'][i % 3], estimatedReadingTime: 4 + (i % 12), wordCount: 800 + i * 50 },
  metrics: {
    views: Math.floor(Math.random() * 200000 + 1000),
    uniqueViews: Math.floor(Math.random() * 150000 + 800),
    likes: Math.floor(Math.random() * 15000 + 100),
    dislikes: Math.floor(Math.random() * 500),
    shares: { total: Math.floor(Math.random() * 5000 + 50), twitter: 1200, linkedin: 800, facebook: 400, reddit: 600, hackernews: 200 },
    comments: Math.floor(Math.random() * 800 + 10),
    bookmarks: Math.floor(Math.random() * 3000 + 50),
    averageTimeSpent: 180 + i * 10,
    bounceRate: 20 + (i % 40),
    clickThroughRate: 2 + (i % 8),
  },
  seo: {
    metaTitle: `Article ${i + 1} - AI News`,
    metaDescription: 'Comprehensive AI news coverage',
    metaKeywords: ['ai', 'machine learning', 'openai'],
    canonicalUrl: `https://ainews.com/articles/article-${i + 1}`,
  },
  sources: i % 2 === 0 ? [{ title: 'Official Blog', url: 'https://example.com', sourceType: 'official', credibility: 9, publisher: 'OpenAI' }] : [],
  moderationFlags: i % 7 === 3 ? [{ type: 'spam', status: 'pending', reason: 'Promotional content', createdAt: new Date().toISOString() }] : [],
  factChecks: i % 5 === 0 ? [{ claim: 'Model scores 92.3% on MMLU', verdict: 'true', explanation: 'Verified by official report' }] : [],
  version: 1 + (i % 4),
  aiTechnologies: [{ name: 'PyTorch', type: 'framework', version: '2.3' }, { name: 'GPT-5', type: 'model' }].slice(0, 1 + (i % 2)),
  companiesMentioned: [{ name: 'OpenAI', website: 'openai.com', role: 'developer' }, { name: 'Google', website: 'google.com', role: 'competitor' }].slice(0, 1 + (i % 2)),
  comments: [],
  gallery: [],
  videoUrl: i % 10 === 0 ? 'https://youtube.com/watch?v=example' : null,
}));

const STATUS_CONFIG = {
  published: { label: 'Published', color: 'var(--ana-teal)', bg: 'rgba(6,214,160,0.1)', icon: <CheckCircle size={11} /> },
  draft: { label: 'Draft', color: 'var(--ana-text-3)', bg: 'var(--ana-bg-raised)', icon: <FileText size={11} /> },
  review: { label: 'In Review', color: '#f4a261', bg: 'rgba(244,162,97,0.1)', icon: <Clock size={11} /> },
  archived: { label: 'Archived', color: 'var(--ana-text-3)', bg: 'var(--ana-bg-raised)', icon: <Archive size={11} /> },
  scheduled: { label: 'Scheduled', color: '#118ab2', bg: 'rgba(17,138,178,0.1)', icon: <Calendar size={11} /> },
};

const VERDICT_COLORS = {
  true: { bg: 'rgba(6,214,160,0.12)', color: 'var(--ana-teal)' },
  false: { bg: 'rgba(230,57,70,0.12)', color: 'var(--ana-primary)' },
  misleading: { bg: 'rgba(244,162,97,0.12)', color: '#f4a261' },
  unverifiable: { bg: 'rgba(136,136,136,0.1)', color: 'var(--ana-text-3)' },
  outdated: { bg: 'rgba(136,136,136,0.1)', color: 'var(--ana-text-3)' },
};

/* ──────────────────────────────────────────────────────────── */
export default function AdminNewsArticles() {
  const { isDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const userToken = getUserToken();

  // List state
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalArticles, setTotalArticles] = useState(0);
  const [page, setPage] = useState(1);
  const LIMIT = 15;

  // Filters & Sort
  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterAuthor, setFilterAuthor] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterFlagged, setFilterFlagged] = useState(false);
  const [filterDeleted, setFilterDeleted] = useState(false);
  const [filterAIGenerated, setFilterAIGenerated] = useState(false);
  const [filterBreaking, setFilterBreaking] = useState(false);
  const [filterFeatured, setFilterFeatured] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sortField, setSortField] = useState('publishedAt');
  const [sortDir, setSortDir] = useState('desc');

  // Selection
  const [selected, setSelected] = useState(new Set());

  // Modals
  const [viewArticle, setViewArticle] = useState(null);
  const [editArticle, setEditArticle] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const [activeMenuRef, setActiveMenuRef] = useState(null);

  // Action loading
  const [actionLoading, setActionLoading] = useState({});

  const searchTimerRef = useRef(null);
  const menuRef = useRef(null);

  const swalTheme = {
    background: isDarkMode ? '#111' : '#fff',
    color: isDarkMode ? '#f0f0f0' : '#0d0d0d',
    confirmButtonColor: '#e63946',
  };

  /* ─── DEBOUNCED SEARCH ──────────────── */
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setSearchDebounced(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(searchTimerRef.current);
  }, [search]);

  /* ─── FETCH ARTICLES ────────────────── */
  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page, limit: LIMIT,
        search: searchDebounced,
        status: filterStatus,
        category: filterCategory,
        author: filterAuthor,
        dateFrom: filterDateFrom,
        dateTo: filterDateTo,
        flagged: filterFlagged,
        deleted: filterDeleted,
        aiGenerated: filterAIGenerated,
        breaking: filterBreaking,
        featured: filterFeatured,
        sort: sortField,
        dir: sortDir,
      });
      const res = await fetch(`/api/admin/articles?${params}`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setArticles(data.articles || data.data || []);
      setTotalArticles(data.total || 0);
    } catch {
      // Use mock data
      let filtered = MOCK_ARTICLES;
      if (searchDebounced) {
        const q = searchDebounced.toLowerCase();
        filtered = filtered.filter(a => a.title.toLowerCase().includes(q) || a.aiTags.some(t => t.includes(q)) || a.author?.name?.toLowerCase().includes(q));
      }
      if (filterStatus !== 'all') filtered = filtered.filter(a => a.status === filterStatus);
      if (filterCategory !== 'all') filtered = filtered.filter(a => a.aiCategory === filterCategory);
      if (filterFlagged) filtered = filtered.filter(a => a.moderationFlags?.length > 0);
      if (filterDeleted) filtered = filtered.filter(a => a.isDeleted);
      if (filterAIGenerated) filtered = filtered.filter(a => a.isAIGenerated);
      if (filterBreaking) filtered = filtered.filter(a => a.aiMetadata?.isBreaking);
      if (filterFeatured) filtered = filtered.filter(a => a.aiMetadata?.isFeatured);

      filtered.sort((a, b) => {
        const va = a.metrics?.[sortField] ?? a[sortField] ?? 0;
        const vb = b.metrics?.[sortField] ?? b[sortField] ?? 0;
        return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
      });

      const start = (page - 1) * LIMIT;
      setArticles(filtered.slice(start, start + LIMIT));
      setTotalArticles(filtered.length);
    } finally {
      setLoading(false);
    }
  }, [page, searchDebounced, filterStatus, filterCategory, filterAuthor, filterDateFrom, filterDateTo, filterFlagged, filterDeleted, filterAIGenerated, filterBreaking, filterFeatured, sortField, sortDir, userToken]);

  useEffect(() => { fetchArticles(); }, [fetchArticles]);

  /* ─── CLOSE MENU ON OUTSIDE CLICK ──── */
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setActiveMenu(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ─── SORT ──────────────────────────── */
  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
    setPage(1);
  };
  const SortIcon = ({ field }) => sortField !== field
    ? <span className="ana-sort-icon inactive"><ArrowDown size={11} /></span>
    : <span className="ana-sort-icon active">{sortDir === 'asc' ? <ArrowUp size={11} /> : <ArrowDown size={11} />}</span>;

  /* ─── SELECTION ─────────────────────── */
  const toggleSelect = (id) => setSelected(prev => {
    const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s;
  });
  const toggleSelectAll = () => {
    if (selected.size === articles.length) setSelected(new Set());
    else setSelected(new Set(articles.map(a => a._id)));
  };

  /* ─── SINGLE ARTICLE ACTIONS ────────── */
  const setLoading1 = (id, val) => setActionLoading(prev => ({ ...prev, [id]: val }));

  const handleStatusChange = async (article, newStatus) => {
    setLoading1(article._id, true);
    setActiveMenu(null);
    try {
      await fetch(`/api/admin/articles/${article._id}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${userToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      setArticles(prev => prev.map(a => a._id === article._id ? { ...a, status: newStatus, publishedAt: newStatus === 'published' ? new Date().toISOString() : a.publishedAt } : a));
      Swal.fire({ title: 'Updated', text: `Status changed to "${newStatus}"`, icon: 'success', timer: 1200, showConfirmButton: false, ...swalTheme });
    } catch {
      Swal.fire({ title: 'Error', text: 'Could not update status', icon: 'error', timer: 1500, showConfirmButton: false, ...swalTheme });
    } finally { setLoading1(article._id, false); }
  };

  const handleBlock = async (article) => {
    const isBlocked = article.status === 'archived' && article._blocked;
    const confirmed = await Swal.fire({
      title: isBlocked ? 'Unblock Article?' : 'Block Article?',
      text: isBlocked ? 'This will make the article publicly visible again.' : 'This will immediately hide the article from all public views.',
      icon: 'warning', showCancelButton: true,
      confirmButtonText: isBlocked ? 'Unblock' : 'Block Article',
      confirmButtonColor: isBlocked ? '#06d6a0' : '#e63946',
      ...swalTheme,
    });
    if (!confirmed.isConfirmed) return;
    setLoading1(article._id, true);
    setActiveMenu(null);
    try {
      await fetch(`/api/admin/articles/${article._id}/block`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${userToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocked: !isBlocked }),
      });
      setArticles(prev => prev.map(a => a._id === article._id ? { ...a, _blocked: !isBlocked, status: !isBlocked ? 'archived' : 'published' } : a));
      Swal.fire({ title: isBlocked ? 'Unblocked!' : 'Blocked!', icon: 'success', timer: 1200, showConfirmButton: false, ...swalTheme });
    } catch {
      Swal.fire({ title: 'Error', icon: 'error', timer: 1500, showConfirmButton: false, ...swalTheme });
    } finally { setLoading1(article._id, false); }
  };

  const handleFeatureToggle = async (article, field) => {
    setActiveMenu(null);
    try {
      await fetch(`/api/admin/articles/${article._id}/metadata`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${userToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: !article.aiMetadata?.[field] }),
      });
      setArticles(prev => prev.map(a => a._id === article._id ? { ...a, aiMetadata: { ...a.aiMetadata, [field]: !a.aiMetadata?.[field] } } : a));
    } catch { /* silent */ }
  };

  const handlePin = async (article) => {
    setActiveMenu(null);
    try {
      await fetch(`/api/admin/articles/${article._id}/pin`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${userToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinned: !article._pinned }),
      });
      setArticles(prev => prev.map(a => a._id === article._id ? { ...a, _pinned: !a._pinned } : a));
    } catch { /* silent */ }
  };

  const handleSoftDelete = async (article) => {
    const confirmed = await Swal.fire({
      title: `Delete "${article.title.slice(0, 40)}…"?`,
      html: '<p>Article will be soft-deleted and hidden from public. Can be restored later.</p>',
      icon: 'warning', showCancelButton: true,
      confirmButtonText: 'Delete', confirmButtonColor: '#e63946',
      ...swalTheme,
    });
    if (!confirmed.isConfirmed) return;
    setLoading1(article._id, true);
    setActiveMenu(null);
    try {
      await fetch(`/api/admin/articles/${article._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${userToken}` },
      });
      setArticles(prev => prev.map(a => a._id === article._id ? { ...a, isDeleted: true, deletedAt: new Date().toISOString() } : a));
      Swal.fire({ title: 'Deleted', icon: 'success', timer: 1200, showConfirmButton: false, ...swalTheme });
    } catch {
      Swal.fire({ title: 'Error', icon: 'error', timer: 1500, showConfirmButton: false, ...swalTheme });
    } finally { setLoading1(article._id, false); }
  };

  const handleHardDelete = async (article) => {
    const { value } = await Swal.fire({
      title: '⚠️ Permanently Delete?',
      html: `<p style="color:#e63946;font-weight:600">This CANNOT be undone.</p><p>Type <strong>DELETE</strong> to confirm permanent deletion of "${article.title.slice(0, 30)}…"</p>`,
      input: 'text', inputPlaceholder: 'Type DELETE to confirm',
      icon: 'error', showCancelButton: true,
      confirmButtonText: 'Permanently Delete', confirmButtonColor: '#e63946',
      preConfirm: (val) => { if (val !== 'DELETE') { Swal.showValidationMessage('You must type DELETE exactly'); return false; } return true; },
      ...swalTheme,
    });
    if (!value) return;
    setLoading1(article._id, true);
    setActiveMenu(null);
    try {
      await fetch(`/api/admin/articles/${article._id}/permanent`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${userToken}` },
      });
      setArticles(prev => prev.filter(a => a._id !== article._id));
      setTotalArticles(prev => prev - 1);
      Swal.fire({ title: 'Permanently Deleted', icon: 'success', timer: 1200, showConfirmButton: false, ...swalTheme });
    } catch {
      Swal.fire({ title: 'Error', icon: 'error', timer: 1500, showConfirmButton: false, ...swalTheme });
    } finally { setLoading1(article._id, false); }
  };

  const handleRestore = async (article) => {
    setLoading1(article._id, true);
    setActiveMenu(null);
    try {
      await fetch(`/api/admin/articles/${article._id}/restore`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${userToken}`, 'Content-Type': 'application/json' },
      });
      setArticles(prev => prev.map(a => a._id === article._id ? { ...a, isDeleted: false, deletedAt: null, status: 'draft' } : a));
      Swal.fire({ title: 'Restored!', text: 'Article restored as draft', icon: 'success', timer: 1500, showConfirmButton: false, ...swalTheme });
    } catch {
      Swal.fire({ title: 'Error', icon: 'error', timer: 1500, showConfirmButton: false, ...swalTheme });
    } finally { setLoading1(article._id, false); }
  };

  const handleDuplicate = async (article) => {
    setActiveMenu(null);
    try {
      const res = await fetch(`/api/admin/articles/${article._id}/duplicate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userToken}` },
      });
      const data = await res.json();
      const dup = data.article || { ...article, _id: `dup-${Date.now()}`, title: `${article.title} (Copy)`, status: 'draft', publishedAt: null, metrics: { views: 0, likes: 0, comments: 0, shares: { total: 0 }, bookmarks: 0, uniqueViews: 0, dislikes: 0 } };
      setArticles(prev => [dup, ...prev]);
      Swal.fire({ title: 'Duplicated!', text: 'A draft copy has been created.', icon: 'success', timer: 1500, showConfirmButton: false, ...swalTheme });
    } catch {
      Swal.fire({ title: 'Error', icon: 'error', timer: 1500, showConfirmButton: false, ...swalTheme });
    }
  };

  const handleResolveFlagged = async (article) => {
    setActiveMenu(null);
    try {
      await fetch(`/api/admin/articles/${article._id}/flags/resolve`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${userToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'dismiss' }),
      });
      setArticles(prev => prev.map(a => a._id === article._id ? { ...a, moderationFlags: [] } : a));
      Swal.fire({ title: 'Flags Cleared', icon: 'success', timer: 1200, showConfirmButton: false, ...swalTheme });
    } catch { /* silent */ }
  };

  const handleSendForReview = async (article) => {
    setActiveMenu(null);
    await handleStatusChange(article, 'review');
  };

  const handleMarkFactChecked = async (article) => {
    setActiveMenu(null);
    Swal.fire({ title: 'Mark as Fact Checked', text: 'This would open a fact-check interface in production.', icon: 'info', ...swalTheme });
  };

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    Swal.fire({ title: 'Copied!', text: 'Article ID copied to clipboard', icon: 'success', timer: 1000, showConfirmButton: false, ...swalTheme });
    setActiveMenu(null);
  };

  /* ─── BULK ACTIONS ──────────────────── */
  const bulkAction = async (action) => {
    if (selected.size === 0) return;
    const ids = Array.from(selected);

    const map = {
      publish: { label: 'Publish', endpoint: '/api/admin/articles/bulk/publish', newStatus: 'published' },
      archive: { label: 'Archive', endpoint: '/api/admin/articles/bulk/archive', newStatus: 'archived' },
      draft: { label: 'Set to Draft', endpoint: '/api/admin/articles/bulk/draft', newStatus: 'draft' },
      delete: { label: 'Delete', endpoint: '/api/admin/articles/bulk/delete', danger: true },
    };

    const cfg = map[action];
    if (!cfg) return;

    const confirmed = await Swal.fire({
      title: `${cfg.label} ${ids.length} Articles?`,
      text: cfg.danger ? 'These articles will be soft-deleted.' : `All selected articles will be set to "${cfg.newStatus || action}"`,
      icon: cfg.danger ? 'warning' : 'question',
      showCancelButton: true,
      confirmButtonText: cfg.label,
      confirmButtonColor: cfg.danger ? '#e63946' : '#e63946',
      ...swalTheme,
    });
    if (!confirmed.isConfirmed) return;

    try {
      await fetch(cfg.endpoint, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleIds: ids }),
      });
      if (cfg.danger) {
        setArticles(prev => prev.map(a => ids.includes(a._id) ? { ...a, isDeleted: true } : a));
      } else {
        setArticles(prev => prev.map(a => ids.includes(a._id) ? { ...a, status: cfg.newStatus } : a));
      }
      setSelected(new Set());
      Swal.fire({ title: 'Done!', text: `${ids.length} articles updated`, icon: 'success', timer: 1500, showConfirmButton: false, ...swalTheme });
    } catch {
      Swal.fire({ title: 'Error', text: 'Bulk action failed', icon: 'error', ...swalTheme });
    }
  };

  /* ─── EXPORT ────────────────────────── */
  const handleExport = async (format = 'csv') => {
    try {
      const res = await fetch(`/api/admin/articles/export?format=${format}`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      if (res.ok) {
        const blob = await res.blob();
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `articles-${new Date().toISOString().split('T')[0]}.${format}`;
        a.click();
      }
    } catch {
      Swal.fire({ title: 'Export Failed', icon: 'error', timer: 1500, showConfirmButton: false, ...swalTheme });
    }
  };

  /* ─── PAGINATION ────────────────────── */
  const totalPages = Math.ceil(totalArticles / LIMIT);

  /* ─── RESET FILTERS ─────────────────── */
  const resetFilters = () => {
    setSearch(''); setFilterStatus('all'); setFilterCategory('all');
    setFilterAuthor(''); setFilterDateFrom(''); setFilterDateTo('');
    setFilterFlagged(false); setFilterDeleted(false); setFilterAIGenerated(false);
    setFilterBreaking(false); setFilterFeatured(false); setPage(1);
  };

  const hasActiveFilters = filterStatus !== 'all' || filterCategory !== 'all' || filterAuthor || filterDateFrom || filterDateTo || filterFlagged || filterDeleted || filterAIGenerated || filterBreaking || filterFeatured;

  /* ─── CATEGORIES ────────────────────── */
  const CATEGORIES = ['machine-learning', 'deep-learning', 'natural-language-processing', 'computer-vision', 'robotics', 'generative-ai', 'llm', 'ai-ethics', 'ai-regulation', 'ai-business', 'ai-research', 'ai-hardware', 'ai-software', 'ai-startups', 'ai-investment', 'ai-education', 'ai-healthcare', 'ai-finance', 'ai-automotive', 'general-ai'];

  return (
    <div className={`ana-admin-root ${isDarkMode ? 'dark' : ''}`}>

      {/* ── HEADER ─────────────────────────────────── */}
      <div className="ana-admin-header">
        <div className="ana-admin-header-left">
          <div className="ana-admin-header-icon">
            <Layers size={22} />
          </div>
          <div>
            <h1 className="ana-admin-header-title">News Articles</h1>
            <p className="ana-admin-header-sub">
              {formatNum(totalArticles)} total articles · {articles.filter(a => a.status === 'published').length} published on this page
            </p>
          </div>
        </div>
        <div className="ana-admin-header-actions">
          <button className="ana-admin-btn ana-admin-btn-ghost" onClick={() => handleExport('csv')}>
            <Download size={14} /> Export CSV
          </button>
          <button className="ana-admin-btn ana-admin-btn-ghost" onClick={() => handleExport('json')}>
            <Database size={14} /> Export JSON
          </button>
          <button className="ana-admin-btn ana-admin-btn-primary" onClick={() => navigate('/admin/articles/create')}>
            <Plus size={14} /> New Article
          </button>
        </div>
      </div>

      {/* ── STATS STRIP ────────────────────────────── */}
      <div className="ana-admin-stats-strip">
        {[
          { label: 'Published', value: MOCK_ARTICLES.filter(a => a.status === 'published').length, color: 'var(--ana-teal)', icon: <CheckCircle size={14} /> },
          { label: 'In Review', value: MOCK_ARTICLES.filter(a => a.status === 'review').length, color: '#f4a261', icon: <Clock size={14} /> },
          { label: 'Drafts', value: MOCK_ARTICLES.filter(a => a.status === 'draft').length, color: 'var(--ana-text-3)', icon: <FileText size={14} /> },
          { label: 'Scheduled', value: MOCK_ARTICLES.filter(a => a.status === 'scheduled').length, color: 'var(--ana-blue)', icon: <Calendar size={14} /> },
          { label: 'Flagged', value: MOCK_ARTICLES.filter(a => a.moderationFlags?.length > 0).length, color: 'var(--ana-primary)', icon: <Flag size={14} /> },
          { label: 'Deleted', value: MOCK_ARTICLES.filter(a => a.isDeleted).length, color: 'var(--ana-primary)', icon: <Trash2 size={14} /> },
          { label: 'AI-Written', value: MOCK_ARTICLES.filter(a => a.isAIGenerated).length, color: 'var(--ana-blue)', icon: <Cpu size={14} /> },
          { label: 'Total Views', value: formatNum(MOCK_ARTICLES.reduce((s, a) => s + (a.metrics?.views || 0), 0)), color: 'var(--ana-gold)', icon: <Eye size={14} /> },
        ].map((stat, i) => (
          <div key={i} className="ana-admin-stat-chip">
            <span className="ana-admin-stat-icon" style={{ color: stat.color }}>{stat.icon}</span>
            <span className="ana-admin-stat-val">{stat.value}</span>
            <span className="ana-admin-stat-label">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* ── FILTERS ────────────────────────────────── */}
      <div className="ana-admin-filters-bar">
        {/* Search */}
        <div className="ana-admin-search-wrap">
          <Search size={15} className="ana-admin-search-icon" />
          <input
            type="text"
            className="ana-admin-search-inp"
            placeholder="Search by title, tag, author, slug…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="ana-admin-search-clear" onClick={() => setSearch('')}><X size={14} /></button>
          )}
        </div>

        {/* Status Filter */}
        <select className="ana-admin-select" value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}>
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="review">In Review</option>
          <option value="archived">Archived</option>
          <option value="scheduled">Scheduled</option>
        </select>

        {/* Category Filter */}
        <select className="ana-admin-select" value={filterCategory} onChange={e => { setFilterCategory(e.target.value); setPage(1); }}>
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{categoryLabel(c)}</option>)}
        </select>

        {/* Advanced Filters Toggle */}
        <button
          className={`ana-admin-btn ana-admin-btn-ghost ana-admin-btn-sm ${showAdvancedFilters ? 'active' : ''}`}
          onClick={() => setShowAdvancedFilters(p => !p)}
        >
          <Filter size={14} /> Filters {hasActiveFilters && <span className="ana-admin-filter-dot" />}
          {showAdvancedFilters ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>

        {hasActiveFilters && (
          <button className="ana-admin-btn ana-admin-btn-ghost ana-admin-btn-sm" onClick={resetFilters}>
            <RotateCcw size={13} /> Reset
          </button>
        )}

        <div style={{ flex: 1 }} />

        {/* View Count */}
        <span className="ana-admin-result-count">
          {loading ? 'Loading…' : `${articles.length} of ${formatNum(totalArticles)}`}
        </span>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <div className="ana-admin-adv-filters">
          <div className="ana-admin-adv-filters-grid">
            <div className="ana-admin-form-group">
              <label>Author Name</label>
              <input className="ana-admin-inp" value={filterAuthor} onChange={e => setFilterAuthor(e.target.value)} placeholder="Filter by author…" />
            </div>
            <div className="ana-admin-form-group">
              <label>Date From</label>
              <input type="date" className="ana-admin-inp" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} />
            </div>
            <div className="ana-admin-form-group">
              <label>Date To</label>
              <input type="date" className="ana-admin-inp" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} />
            </div>
            <div className="ana-admin-form-group">
              <label>Sort By</label>
              <select className="ana-admin-inp" value={sortField} onChange={e => setSortField(e.target.value)}>
                <option value="publishedAt">Published Date</option>
                <option value="createdAt">Created Date</option>
                <option value="updatedAt">Last Updated</option>
                <option value="views">Views</option>
                <option value="likes">Likes</option>
                <option value="comments">Comments</option>
              </select>
            </div>
          </div>
          <div className="ana-admin-adv-filters-toggles">
            {[
              { key: 'filterFlagged', label: 'Flagged Only', state: filterFlagged, set: setFilterFlagged },
              { key: 'filterDeleted', label: 'Show Deleted', state: filterDeleted, set: setFilterDeleted },
              { key: 'filterAIGenerated', label: 'AI-Generated', state: filterAIGenerated, set: setFilterAIGenerated },
              { key: 'filterBreaking', label: 'Breaking News', state: filterBreaking, set: setFilterBreaking },
              { key: 'filterFeatured', label: 'Featured Only', state: filterFeatured, set: setFilterFeatured },
            ].map(t => (
              <label key={t.key} className="ana-admin-toggle-label">
                <input type="checkbox" checked={t.state} onChange={e => { t.set(e.target.checked); setPage(1); }} />
                <span className="ana-admin-toggle-track"><span className="ana-admin-toggle-thumb" /></span>
                {t.label}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* ── BULK ACTIONS BAR ───────────────────────── */}
      {selected.size > 0 && (
        <div className="ana-admin-bulk-bar">
          <span className="ana-admin-bulk-count"><CheckCircle size={14} /> {selected.size} selected</span>
          <button className="ana-admin-btn ana-admin-btn-sm ana-admin-btn-ghost" onClick={() => bulkAction('publish')}>
            <CheckCircle size={13} /> Publish
          </button>
          <button className="ana-admin-btn ana-admin-btn-sm ana-admin-btn-ghost" onClick={() => bulkAction('draft')}>
            <FileText size={13} /> Set Draft
          </button>
          <button className="ana-admin-btn ana-admin-btn-sm ana-admin-btn-ghost" onClick={() => bulkAction('archive')}>
            <Archive size={13} /> Archive
          </button>
          <button className="ana-admin-btn ana-admin-btn-sm ana-admin-btn-danger" onClick={() => bulkAction('delete')}>
            <Trash2 size={13} /> Delete
          </button>
          <button className="ana-admin-btn ana-admin-btn-sm ana-admin-btn-ghost" onClick={() => setSelected(new Set())}>
            <X size={13} /> Clear
          </button>
        </div>
      )}

      {/* ── TABLE ──────────────────────────────────── */}
      <div className="ana-admin-table-wrap">
        {loading ? (
          <div className="ana-admin-loading">
            <RefreshCw size={28} className="ana-admin-spin" />
            <span>Loading articles…</span>
          </div>
        ) : articles.length === 0 ? (
          <div className="ana-admin-empty">
            <FileText size={44} />
            <h3>No articles found</h3>
            <p>Try adjusting your filters or search query.</p>
            <button className="ana-admin-btn ana-admin-btn-ghost" onClick={resetFilters}>Reset Filters</button>
          </div>
        ) : (
          <table className="ana-admin-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>
                  <input type="checkbox" checked={selected.size === articles.length && articles.length > 0} onChange={toggleSelectAll} className="ana-admin-checkbox" />
                </th>
                <th style={{ width: 56 }}>Image</th>
                <th className="sortable" onClick={() => handleSort('title')}>
                  Title <SortIcon field="title" />
                </th>
                <th className="sortable" onClick={() => handleSort('status')}>Status <SortIcon field="status" /></th>
                <th>Category</th>
                <th className="sortable" onClick={() => handleSort('publishedAt')}>Published <SortIcon field="publishedAt" /></th>
                <th className="sortable" onClick={() => handleSort('views')}>
                  <Eye size={12} /> Views <SortIcon field="views" />
                </th>
                <th className="sortable" onClick={() => handleSort('likes')}>
                  <Heart size={12} /> Likes <SortIcon field="likes" />
                </th>
                <th className="sortable" onClick={() => handleSort('comments')}>
                  <MessageSquare size={12} /> Comments <SortIcon field="comments" />
                </th>
                <th>Badges</th>
                <th>Author</th>
                <th style={{ width: 80 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map(article => {
                const statusCfg = STATUS_CONFIG[article.status] || STATUS_CONFIG.draft;
                const isSelected = selected.has(article._id);
                const isLoading = actionLoading[article._id];
                const isFlagged = article.moderationFlags?.length > 0;
                const isDeleted = article.isDeleted;

                return (
                  <tr
                    key={article._id}
                    className={`${isSelected ? 'selected' : ''} ${isDeleted ? 'deleted-row' : ''} ${isFlagged ? 'flagged-row' : ''}`}
                  >
                    <td>
                      <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(article._id)} className="ana-admin-checkbox" />
                    </td>

                    {/* Thumbnail */}
                    <td>
                      <div className="ana-admin-thumb-wrap">
                        {article.featuredImage?.url ? (
                          <img src={article.featuredImage.url} alt={article.title} className="ana-admin-thumb" onError={e => { e.target.style.display = 'none'; }} />
                        ) : (
                          <div className="ana-admin-thumb-placeholder"><Image size={14} /></div>
                        )}
                        {article._pinned && <span className="ana-admin-pin-badge"><Pin size={8} /></span>}
                        {isDeleted && <span className="ana-admin-deleted-badge"><Trash2 size={8} /></span>}
                      </div>
                    </td>

                    {/* Title */}
                    <td className="ana-admin-title-cell">
                      <div className="ana-admin-article-title" title={article.title}>
                        {article.title}
                      </div>
                      <div className="ana-admin-article-meta">
                        <span className="ana-admin-slug" title={article.slug}>/{article.slug}</span>
                        {article.readability?.estimatedReadingTime && (
                          <span><Clock size={10} /> {article.readability.estimatedReadingTime}m</span>
                        )}
                        {article.readability?.wordCount && (
                          <span>{formatNum(article.readability.wordCount)} words</span>
                        )}
                        {article.isAIGenerated && <span className="ana-admin-ai-chip"><Cpu size={9} /> AI</span>}
                        {isFlagged && <span className="ana-admin-flag-chip"><Flag size={9} /> {article.moderationFlags.length} flag{article.moderationFlags.length > 1 ? 's' : ''}</span>}
                        {article.aiMetadata?.isFromConference && <span className="ana-admin-conf-chip"><Award size={9} /> {article.aiMetadata.conferenceName}</span>}
                      </div>
                    </td>

                    {/* Status */}
                    <td>
                      <span className="ana-admin-status-chip" style={{ color: statusCfg.color, background: statusCfg.bg }}>
                        {statusCfg.icon} {statusCfg.label}
                      </span>
                      {isDeleted && (
                        <div style={{ marginTop: '0.25rem' }}>
                          <span className="ana-admin-status-chip" style={{ color: '#e63946', background: 'rgba(230,57,70,0.1)', fontSize: '0.65rem' }}>
                            <Trash2 size={9} /> Deleted
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Category */}
                    <td>
                      <span className="ana-admin-category-chip">{categoryLabel(article.aiCategory)}</span>
                    </td>

                    {/* Published */}
                    <td className="ana-admin-date-cell">
                      <span title={fullDate(article.publishedAt || article.createdAt)}>
                        {timeAgo(article.publishedAt || article.createdAt)}
                      </span>
                      {article.scheduledAt && (
                        <div style={{ fontSize: '0.68rem', color: 'var(--ana-blue)', marginTop: '0.15rem' }}>
                          <Calendar size={9} /> Sched. {timeAgo(article.scheduledAt)}
                        </div>
                      )}
                    </td>

                    {/* Views */}
                    <td className="ana-admin-num-cell">{formatNum(article.metrics?.views)}</td>

                    {/* Likes */}
                    <td className="ana-admin-num-cell">{formatNum(article.metrics?.likes)}</td>

                    {/* Comments */}
                    <td className="ana-admin-num-cell">{formatNum(article.metrics?.comments)}</td>

                    {/* Badges */}
                    <td>
                      <div className="ana-admin-badges-cell">
                        {article.aiMetadata?.isBreaking && <span className="ana-admin-badge-chip breaking"><Flame size={9} /></span>}
                        {article.aiMetadata?.isFeatured && <span className="ana-admin-badge-chip featured"><Star size={9} /></span>}
                        {article.aiMetadata?.isTrending && <span className="ana-admin-badge-chip trending"><TrendingUp size={9} /></span>}
                        {article.aiMetadata?.hasPaper && <span className="ana-admin-badge-chip paper"><FileText size={9} /></span>}
                        {article.aiMetadata?.hasCode && <span className="ana-admin-badge-chip code"><Code2 size={9} /></span>}
                        {article.videoUrl && <span className="ana-admin-badge-chip video"><Video size={9} /></span>}
                      </div>
                    </td>

                    {/* Author */}
                    <td className="ana-admin-author-cell">
                      <span title={article.author?.name}>{article.author?.name?.split(' ')[0]}</span>
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="ana-admin-row-actions">
                        <button
                          className="ana-admin-icon-btn"
                          onClick={() => setViewArticle(article)}
                          title="View full details"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          className="ana-admin-icon-btn"
                          onClick={() => navigate(`/admin/articles/${article._id}/edit`)}
                          title="Edit article"
                        >
                          <Edit2 size={14} />
                        </button>

                        {/* Context Menu */}
                        <div className="ana-admin-menu-wrap" ref={activeMenu === article._id ? menuRef : null}>
                          <button
                            className="ana-admin-icon-btn"
                            onClick={() => setActiveMenu(activeMenu === article._id ? null : article._id)}
                            disabled={!!isLoading}
                          >
                            {isLoading ? <RefreshCw size={14} className="ana-admin-spin" /> : <MoreVertical size={14} />}
                          </button>
                          {activeMenu === article._id && (
                            <div className="ana-admin-context-menu">
                              {/* View on site */}
                              {article.status === 'published' && (
                                <a href={`/news/${article.slug}`} target="_blank" rel="noopener noreferrer" className="ana-admin-menu-item">
                                  <ExternalLink size={13} /> View on Site
                                </a>
                              )}

                              {/* Status changes */}
                              <div className="ana-admin-menu-divider">Status</div>
                              {article.status !== 'published' && !isDeleted && (
                                <button className="ana-admin-menu-item" onClick={() => handleStatusChange(article, 'published')}>
                                  <CheckCircle size={13} /> Publish Now
                                </button>
                              )}
                              {article.status !== 'review' && !isDeleted && (
                                <button className="ana-admin-menu-item" onClick={() => handleSendForReview(article)}>
                                  <Send size={13} /> Send for Review
                                </button>
                              )}
                              {article.status !== 'draft' && !isDeleted && (
                                <button className="ana-admin-menu-item" onClick={() => handleStatusChange(article, 'draft')}>
                                  <FileText size={13} /> Set as Draft
                                </button>
                              )}
                              {article.status !== 'archived' && !isDeleted && (
                                <button className="ana-admin-menu-item" onClick={() => handleStatusChange(article, 'archived')}>
                                  <Archive size={13} /> Archive
                                </button>
                              )}

                              {/* Feature toggles */}
                              <div className="ana-admin-menu-divider">Metadata</div>
                              <button className="ana-admin-menu-item" onClick={() => handleFeatureToggle(article, 'isBreaking')}>
                                <Flame size={13} /> {article.aiMetadata?.isBreaking ? 'Remove Breaking' : 'Mark Breaking'}
                              </button>
                              <button className="ana-admin-menu-item" onClick={() => handleFeatureToggle(article, 'isFeatured')}>
                                <Star size={13} /> {article.aiMetadata?.isFeatured ? 'Unfeature' : 'Feature'}
                              </button>
                              <button className="ana-admin-menu-item" onClick={() => handleFeatureToggle(article, 'isTrending')}>
                                <TrendingUp size={13} /> {article.aiMetadata?.isTrending ? 'Remove Trending' : 'Mark Trending'}
                              </button>
                              <button className="ana-admin-menu-item" onClick={() => handlePin(article)}>
                                <Pin size={13} /> {article._pinned ? 'Unpin' : 'Pin to Top'}
                              </button>

                              {/* Moderation */}
                              <div className="ana-admin-menu-divider">Moderation</div>
                              <button className="ana-admin-menu-item" onClick={() => handleBlock(article)}>
                                <Ban size={13} /> {article._blocked ? 'Unblock' : 'Block Article'}
                              </button>
                              {isFlagged && (
                                <button className="ana-admin-menu-item" onClick={() => handleResolveFlagged(article)}>
                                  <Shield size={13} /> Clear Flags
                                </button>
                              )}
                              <button className="ana-admin-menu-item" onClick={() => handleMarkFactChecked(article)}>
                                <CheckCircle size={13} /> Manage Fact Checks
                              </button>

                              {/* Utilities */}
                              <div className="ana-admin-menu-divider">Utilities</div>
                              <button className="ana-admin-menu-item" onClick={() => handleDuplicate(article)}>
                                <Copy size={13} /> Duplicate
                              </button>
                              <button className="ana-admin-menu-item" onClick={() => handleCopyId(article._id)}>
                                <Hash size={13} /> Copy Article ID
                              </button>
                              <a href={`/api/admin/articles/${article._id}/export`} className="ana-admin-menu-item" target="_blank" rel="noopener noreferrer">
                                <Download size={13} /> Export JSON
                              </a>

                              {/* Danger zone */}
                              <div className="ana-admin-menu-divider danger">Danger Zone</div>
                              {!isDeleted ? (
                                <button className="ana-admin-menu-item danger" onClick={() => handleSoftDelete(article)}>
                                  <Trash2 size={13} /> Delete Article
                                </button>
                              ) : (
                                <>
                                  <button className="ana-admin-menu-item" onClick={() => handleRestore(article)}>
                                    <RotateCcw size={13} /> Restore
                                  </button>
                                  <button className="ana-admin-menu-item danger" onClick={() => handleHardDelete(article)}>
                                    <AlertTriangle size={13} /> Permanently Delete
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── PAGINATION ─────────────────────────────── */}
      {totalPages > 1 && (
        <div className="ana-admin-pagination">
          <button className="ana-admin-page-btn" onClick={() => setPage(1)} disabled={page === 1}><ChevronLeft size={14} /><ChevronLeft size={14} /></button>
          <button className="ana-admin-page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft size={14} /></button>
          {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
            let p;
            if (totalPages <= 7) p = i + 1;
            else if (page <= 4) p = i + 1;
            else if (page >= totalPages - 3) p = totalPages - 6 + i;
            else p = page - 3 + i;
            return p;
          }).map(p => (
            <button key={p} className={`ana-admin-page-btn ${page === p ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
          ))}
          <button className="ana-admin-page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}><ChevronRight size={14} /></button>
          <button className="ana-admin-page-btn" onClick={() => setPage(totalPages)} disabled={page === totalPages}><ChevronRight size={14} /><ChevronRight size={14} /></button>
          <span className="ana-admin-page-info">Page {page} of {totalPages}</span>
        </div>
      )}

      {/* ═══════════════════════════════════════════ */}
      {/* ARTICLE DETAIL MODAL                       */}
      {/* ═══════════════════════════════════════════ */}
      {viewArticle && (
        <div className="ana-admin-modal-overlay" onClick={() => setViewArticle(null)}>
          <div className="ana-admin-modal" onClick={e => e.stopPropagation()}>

            {/* Modal Header */}
            <div className="ana-admin-modal-header">
              <div className="ana-admin-modal-header-left">
                <div className="ana-admin-modal-icon"><Eye size={18} /></div>
                <div>
                  <h2 className="ana-admin-modal-title">Article Details</h2>
                  <p style={{ fontSize: '0.75rem', color: 'var(--ana-text-3)', marginTop: '0.1rem' }}>
                    ID: {viewArticle._id} · v{viewArticle.version}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button className="ana-admin-btn ana-admin-btn-ghost ana-admin-btn-sm" onClick={() => navigate(`/admin/articles/${viewArticle._id}/edit`)}>
                  <Edit2 size={13} /> Edit
                </button>
                {viewArticle.status === 'published' && (
                  <a href={`/news/${viewArticle.slug}`} target="_blank" rel="noopener noreferrer" className="ana-admin-btn ana-admin-btn-ghost ana-admin-btn-sm" style={{ textDecoration: 'none' }}>
                    <ExternalLink size={13} /> View Live
                  </a>
                )}
                <button className="ana-admin-icon-btn" onClick={() => setViewArticle(null)}><X size={18} /></button>
              </div>
            </div>

            <div className="ana-admin-modal-body">
              {/* Featured Image */}
              {viewArticle.featuredImage?.url && (
                <div className="ana-admin-modal-hero">
                  <img src={viewArticle.featuredImage.url} alt={viewArticle.featuredImage.alt || viewArticle.title} className="ana-admin-modal-hero-img" />
                  <div className="ana-admin-modal-hero-overlay">
                    <div className="ana-admin-modal-hero-badges">
                      <span className="ana-admin-status-chip" style={{ color: STATUS_CONFIG[viewArticle.status]?.color, background: STATUS_CONFIG[viewArticle.status]?.bg }}>
                        {STATUS_CONFIG[viewArticle.status]?.icon} {STATUS_CONFIG[viewArticle.status]?.label}
                      </span>
                      {viewArticle.isDeleted && <span className="ana-admin-status-chip" style={{ color: '#e63946', background: 'rgba(230,57,70,0.15)' }}><Trash2 size={10} /> Deleted</span>}
                      {viewArticle.aiMetadata?.isBreaking && <span className="ana-admin-badge-chip breaking"><Flame size={10} /> Breaking</span>}
                      {viewArticle.aiMetadata?.isFeatured && <span className="ana-admin-badge-chip featured"><Star size={10} /> Featured</span>}
                      {viewArticle.aiMetadata?.isTrending && <span className="ana-admin-badge-chip trending"><TrendingUp size={10} /> Trending</span>}
                    </div>
                  </div>
                  {viewArticle.featuredImage.caption && (
                    <p className="ana-admin-modal-img-caption">
                      {viewArticle.featuredImage.caption}
                      {viewArticle.featuredImage.credit && ` — ${viewArticle.featuredImage.credit}`}
                    </p>
                  )}
                </div>
              )}

              {/* Title & Subtitle */}
              <div className="ana-admin-modal-section">
                <h3 className="ana-admin-modal-article-title">{viewArticle.title}</h3>
                {viewArticle.subtitle && <p className="ana-admin-modal-article-subtitle">{viewArticle.subtitle}</p>}
                <div className="ana-admin-modal-slug-row">
                  <Link2 size={12} />
                  <code className="ana-admin-modal-slug">/{viewArticle.slug}</code>
                  <button className="ana-admin-icon-btn-xs" onClick={() => handleCopyId(viewArticle.slug)} title="Copy slug"><Copy size={10} /></button>
                </div>
                {viewArticle.excerpt && (
                  <p className="ana-admin-modal-excerpt">"{viewArticle.excerpt}"</p>
                )}
              </div>

              {/* Info Grid */}
              <div className="ana-admin-modal-grid">

                {/* Core Info */}
                <div className="ana-admin-modal-card">
                  <div className="ana-admin-modal-card-title"><Info size={14} /> Core Information</div>
                  <div className="ana-admin-modal-kv-list">
                    <div className="ana-admin-modal-kv"><span>Article ID</span><code>{viewArticle._id}</code></div>
                    <div className="ana-admin-modal-kv"><span>Status</span><span>{viewArticle.status}</span></div>
                    <div className="ana-admin-modal-kv"><span>Category</span><span>{categoryLabel(viewArticle.aiCategory)}</span></div>
                    <div className="ana-admin-modal-kv"><span>Version</span><span>v{viewArticle.version}</span></div>
                    <div className="ana-admin-modal-kv"><span>AI Generated</span><span>{viewArticle.isAIGenerated ? 'Yes' : 'No'}</span></div>
                    <div className="ana-admin-modal-kv"><span>Deleted</span><span style={{ color: viewArticle.isDeleted ? '#e63946' : 'var(--ana-teal)' }}>{viewArticle.isDeleted ? 'Yes' : 'No'}</span></div>
                    <div className="ana-admin-modal-kv"><span>Created</span><span>{fullDate(viewArticle.createdAt)}</span></div>
                    <div className="ana-admin-modal-kv"><span>Published</span><span>{fullDate(viewArticle.publishedAt)}</span></div>
                    <div className="ana-admin-modal-kv"><span>Updated</span><span>{fullDate(viewArticle.updatedAt)}</span></div>
                    {viewArticle.scheduledAt && <div className="ana-admin-modal-kv"><span>Scheduled</span><span>{fullDate(viewArticle.scheduledAt)}</span></div>}
                    {viewArticle.deletedAt && <div className="ana-admin-modal-kv"><span>Deleted At</span><span>{fullDate(viewArticle.deletedAt)}</span></div>}
                  </div>
                </div>

                {/* Author */}
                <div className="ana-admin-modal-card">
                  <div className="ana-admin-modal-card-title"><Users size={14} /> Author Information</div>
                  <div className="ana-admin-modal-kv-list">
                    <div className="ana-admin-modal-kv"><span>Author</span><span>{viewArticle.author?.name || '—'}</span></div>
                    <div className="ana-admin-modal-kv"><span>Author ID</span><code style={{ fontSize: '0.72rem' }}>{viewArticle.author?._id || '—'}</code></div>
                    <div className="ana-admin-modal-kv"><span>Role</span><span>{viewArticle.author?.role || '—'}</span></div>
                    <div className="ana-admin-modal-kv"><span>Co-Authors</span><span>{viewArticle.coAuthors?.length > 0 ? viewArticle.coAuthors.map(c => c.name).join(', ') : 'None'}</span></div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="ana-admin-modal-card">
                  <div className="ana-admin-modal-card-title"><BarChart2 size={14} /> Engagement Metrics</div>
                  <div className="ana-admin-modal-kv-list">
                    <div className="ana-admin-modal-kv"><span>Total Views</span><strong>{formatNum(viewArticle.metrics?.views)}</strong></div>
                    <div className="ana-admin-modal-kv"><span>Unique Views</span><strong>{formatNum(viewArticle.metrics?.uniqueViews)}</strong></div>
                    <div className="ana-admin-modal-kv"><span>Likes</span><strong>{formatNum(viewArticle.metrics?.likes)}</strong></div>
                    <div className="ana-admin-modal-kv"><span>Dislikes</span><strong>{formatNum(viewArticle.metrics?.dislikes)}</strong></div>
                    <div className="ana-admin-modal-kv"><span>Comments</span><strong>{formatNum(viewArticle.metrics?.comments)}</strong></div>
                    <div className="ana-admin-modal-kv"><span>Bookmarks</span><strong>{formatNum(viewArticle.metrics?.bookmarks)}</strong></div>
                    <div className="ana-admin-modal-kv"><span>Total Shares</span><strong>{formatNum(viewArticle.metrics?.shares?.total)}</strong></div>
                    <div className="ana-admin-modal-kv"><span>Twitter Shares</span><span>{formatNum(viewArticle.metrics?.shares?.twitter)}</span></div>
                    <div className="ana-admin-modal-kv"><span>LinkedIn Shares</span><span>{formatNum(viewArticle.metrics?.shares?.linkedin)}</span></div>
                    <div className="ana-admin-modal-kv"><span>Reddit Shares</span><span>{formatNum(viewArticle.metrics?.shares?.reddit)}</span></div>
                    <div className="ana-admin-modal-kv"><span>HN Shares</span><span>{formatNum(viewArticle.metrics?.shares?.hackernews)}</span></div>
                    {viewArticle.metrics?.averageTimeSpent && <div className="ana-admin-modal-kv"><span>Avg. Time Spent</span><span>{viewArticle.metrics.averageTimeSpent}s</span></div>}
                    {viewArticle.metrics?.bounceRate && <div className="ana-admin-modal-kv"><span>Bounce Rate</span><span>{viewArticle.metrics.bounceRate}%</span></div>}
                    {viewArticle.metrics?.clickThroughRate && <div className="ana-admin-modal-kv"><span>CTR</span><span>{viewArticle.metrics.clickThroughRate}%</span></div>}
                  </div>
                </div>

                {/* AI Metadata */}
                <div className="ana-admin-modal-card">
                  <div className="ana-admin-modal-card-title"><Cpu size={14} /> AI Metadata</div>
                  <div className="ana-admin-modal-kv-list">
                    <div className="ana-admin-modal-kv"><span>Breaking</span><span style={{ color: viewArticle.aiMetadata?.isBreaking ? '#e63946' : 'var(--ana-text-3)' }}>{viewArticle.aiMetadata?.isBreaking ? 'Yes' : 'No'}</span></div>
                    <div className="ana-admin-modal-kv"><span>Featured</span><span>{viewArticle.aiMetadata?.isFeatured ? 'Yes' : 'No'}</span></div>
                    <div className="ana-admin-modal-kv"><span>Trending</span><span>{viewArticle.aiMetadata?.isTrending ? 'Yes' : 'No'}</span></div>
                    <div className="ana-admin-modal-kv"><span>From Conference</span><span>{viewArticle.aiMetadata?.isFromConference ? viewArticle.aiMetadata.conferenceName || 'Yes' : 'No'}</span></div>
                    <div className="ana-admin-modal-kv"><span>Has Code</span><span>{viewArticle.aiMetadata?.hasCode ? 'Yes' : 'No'}</span></div>
                    {viewArticle.aiMetadata?.codeUrl && <div className="ana-admin-modal-kv"><span>Code URL</span><a href={viewArticle.aiMetadata.codeUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ana-primary)', fontSize: '0.75rem' }}>Link <ExternalLink size={9} /></a></div>}
                    <div className="ana-admin-modal-kv"><span>Has Paper</span><span>{viewArticle.aiMetadata?.hasPaper ? 'Yes' : 'No'}</span></div>
                    {viewArticle.aiMetadata?.paperUrl && <div className="ana-admin-modal-kv"><span>Paper URL</span><a href={viewArticle.aiMetadata.paperUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ana-primary)', fontSize: '0.75rem' }}>arXiv <ExternalLink size={9} /></a></div>}
                    {viewArticle.aiMetadata?.paperDoi && <div className="ana-admin-modal-kv"><span>DOI</span><span>{viewArticle.aiMetadata.paperDoi}</span></div>}
                    {viewArticle.aiMetadata?.modelName && <div className="ana-admin-modal-kv"><span>Model Name</span><strong>{viewArticle.aiMetadata.modelName}</strong></div>}
                    {viewArticle.aiMetadata?.modelVersion && <div className="ana-admin-modal-kv"><span>Model Version</span><span>{viewArticle.aiMetadata.modelVersion}</span></div>}
                    {viewArticle.aiMetadata?.modelType && <div className="ana-admin-modal-kv"><span>Model Type</span><span>{viewArticle.aiMetadata.modelType}</span></div>}
                    <div className="ana-admin-modal-kv"><span>Open Source</span><span>{viewArticle.aiMetadata?.modelOpenSource === true ? 'Yes' : viewArticle.aiMetadata?.modelOpenSource === false ? 'No' : '—'}</span></div>
                    <div className="ana-admin-modal-kv"><span>API Available</span><span>{viewArticle.aiMetadata?.apiAvailable === true ? 'Yes' : viewArticle.aiMetadata?.apiAvailable === false ? 'No' : '—'}</span></div>
                    {viewArticle.aiMetadata?.apiEndpoint && <div className="ana-admin-modal-kv"><span>API Endpoint</span><a href={viewArticle.aiMetadata.apiEndpoint} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ana-primary)', fontSize: '0.75rem' }}>Link <ExternalLink size={9} /></a></div>}
                  </div>
                </div>

                {/* Readability */}
                <div className="ana-admin-modal-card">
                  <div className="ana-admin-modal-card-title"><BookOpen size={14} /> Readability</div>
                  <div className="ana-admin-modal-kv-list">
                    <div className="ana-admin-modal-kv"><span>Score</span><span>{viewArticle.readability?.score ?? '—'}/100</span></div>
                    <div className="ana-admin-modal-kv"><span>Level</span><span style={{ textTransform: 'capitalize' }}>{viewArticle.readability?.level || '—'}</span></div>
                    <div className="ana-admin-modal-kv"><span>Word Count</span><span>{formatNum(viewArticle.readability?.wordCount)}</span></div>
                    <div className="ana-admin-modal-kv"><span>Reading Time</span><span>{viewArticle.readability?.estimatedReadingTime || '—'} min</span></div>
                  </div>
                </div>

                {/* SEO */}
                <div className="ana-admin-modal-card">
                  <div className="ana-admin-modal-card-title"><Globe size={14} /> SEO Metadata</div>
                  <div className="ana-admin-modal-kv-list">
                    <div className="ana-admin-modal-kv"><span>Meta Title</span><span>{viewArticle.seo?.metaTitle || '—'}</span></div>
                    <div className="ana-admin-modal-kv"><span>Meta Desc</span><span style={{ fontSize: '0.78rem' }}>{viewArticle.seo?.metaDescription || '—'}</span></div>
                    <div className="ana-admin-modal-kv"><span>Canonical</span><a href={viewArticle.seo?.canonicalUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ana-primary)', fontSize: '0.75rem', wordBreak: 'break-all' }}>{viewArticle.seo?.canonicalUrl || '—'}</a></div>
                    <div className="ana-admin-modal-kv"><span>OG Image</span><span>{viewArticle.seo?.ogImage ? 'Set' : '—'}</span></div>
                    <div className="ana-admin-modal-kv"><span>Twitter Card</span><span>{viewArticle.seo?.twitterCard || '—'}</span></div>
                    <div className="ana-admin-modal-kv"><span>Keywords</span><span>{viewArticle.seo?.metaKeywords?.join(', ') || '—'}</span></div>
                  </div>
                </div>

                {/* AI Generation */}
                {viewArticle.isAIGenerated && (
                  <div className="ana-admin-modal-card">
                    <div className="ana-admin-modal-card-title"><Cpu size={14} /> AI Generation Metadata</div>
                    <div className="ana-admin-modal-kv-list">
                      <div className="ana-admin-modal-kv"><span>Model Used</span><span>{viewArticle.aiGenerationMetadata?.model || '—'}</span></div>
                      <div className="ana-admin-modal-kv"><span>Temperature</span><span>{viewArticle.aiGenerationMetadata?.temperature ?? '—'}</span></div>
                      <div className="ana-admin-modal-kv"><span>Human Reviewed</span><span>{viewArticle.aiGenerationMetadata?.reviewedByHuman ? 'Yes' : 'No'}</span></div>
                      <div className="ana-admin-modal-kv"><span>Reviewed At</span><span>{fullDate(viewArticle.aiGenerationMetadata?.reviewedAt)}</span></div>
                    </div>
                  </div>
                )}

                {/* Media */}
                <div className="ana-admin-modal-card">
                  <div className="ana-admin-modal-card-title"><Image size={14} /> Media</div>
                  <div className="ana-admin-modal-kv-list">
                    <div className="ana-admin-modal-kv"><span>Featured Image</span><span>{viewArticle.featuredImage?.url ? 'Set' : 'None'}</span></div>
                    {viewArticle.featuredImage?.publicId && <div className="ana-admin-modal-kv"><span>Cloudinary ID</span><code style={{ fontSize: '0.7rem' }}>{viewArticle.featuredImage.publicId}</code></div>}
                    <div className="ana-admin-modal-kv"><span>Gallery Images</span><span>{viewArticle.gallery?.length || 0}</span></div>
                    <div className="ana-admin-modal-kv"><span>Video</span>{viewArticle.videoUrl ? <a href={viewArticle.videoUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ana-primary)', fontSize: '0.78rem' }}>View <ExternalLink size={9} /></a> : <span>None</span>}</div>
                  </div>
                </div>

              </div>

              {/* Tags & Technologies */}
              <div className="ana-admin-modal-section">
                <div className="ana-admin-modal-section-title"><Hash size={14} /> AI Tags</div>
                <div className="ana-admin-modal-tags">
                  {viewArticle.aiTags?.length > 0 ? viewArticle.aiTags.map((t, i) => (
                    <span key={i} className="ana-admin-tag-chip">#{t}</span>
                  )) : <span style={{ color: 'var(--ana-text-3)', fontSize: '0.82rem' }}>No tags</span>}
                </div>
              </div>

              {viewArticle.aiTechnologies?.length > 0 && (
                <div className="ana-admin-modal-section">
                  <div className="ana-admin-modal-section-title"><Cpu size={14} /> Technologies</div>
                  <div className="ana-admin-modal-tags">
                    {viewArticle.aiTechnologies.map((t, i) => (
                      <span key={i} className="ana-admin-tech-chip">
                        {t.name} {t.version && `v${t.version}`}
                        <span className="ana-admin-tech-type">{t.type}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {viewArticle.companiesMentioned?.length > 0 && (
                <div className="ana-admin-modal-section">
                  <div className="ana-admin-modal-section-title"><Globe size={14} /> Companies Mentioned</div>
                  <div className="ana-admin-modal-tags">
                    {viewArticle.companiesMentioned.map((c, i) => (
                      <a key={i} href={`https://${c.website}`} target="_blank" rel="noopener noreferrer" className="ana-admin-company-chip">
                        {c.name} <span>({c.role})</span> <ExternalLink size={9} />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Sources */}
              {viewArticle.sources?.length > 0 && (
                <div className="ana-admin-modal-section">
                  <div className="ana-admin-modal-section-title"><Link2 size={14} /> Sources</div>
                  <div className="ana-admin-modal-sources">
                    {viewArticle.sources.map((s, i) => (
                      <div key={i} className="ana-admin-modal-source-row">
                        <span className="ana-admin-source-dot" />
                        <div>
                          <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ana-primary)', fontWeight: 600, fontSize: '0.85rem' }}>
                            {s.title || s.publisher} <ExternalLink size={10} />
                          </a>
                          <div style={{ fontSize: '0.72rem', color: 'var(--ana-text-3)' }}>
                            {s.publisher && `${s.publisher} · `}{s.sourceType} · Credibility: {s.credibility}/10
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fact Checks */}
              {viewArticle.factChecks?.length > 0 && (
                <div className="ana-admin-modal-section">
                  <div className="ana-admin-modal-section-title"><CheckCircle size={14} /> Fact Checks</div>
                  {viewArticle.factChecks.map((fc, i) => (
                    <div key={i} className="ana-admin-modal-fact-row">
                      <div className="ana-admin-modal-fact-claim">"{fc.claim}"</div>
                      <span className="ana-admin-fact-verdict" style={VERDICT_COLORS[fc.verdict]}>
                        {fc.verdict?.toUpperCase()}
                      </span>
                      {fc.explanation && <div className="ana-admin-modal-fact-exp">{fc.explanation}</div>}
                    </div>
                  ))}
                </div>
              )}

              {/* Moderation Flags */}
              {viewArticle.moderationFlags?.length > 0 && (
                <div className="ana-admin-modal-section">
                  <div className="ana-admin-modal-section-title" style={{ color: '#e63946' }}><Flag size={14} /> Moderation Flags</div>
                  {viewArticle.moderationFlags.map((flag, i) => (
                    <div key={i} className="ana-admin-modal-flag-row">
                      <span className="ana-admin-flag-type">{flag.type}</span>
                      <span className="ana-admin-flag-status">{flag.status}</span>
                      {flag.reason && <span className="ana-admin-flag-reason">{flag.reason}</span>}
                      <span style={{ fontSize: '0.7rem', color: 'var(--ana-text-3)' }}>{timeAgo(flag.createdAt)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Original Source */}
              {viewArticle.originalSource?.name && (
                <div className="ana-admin-modal-section">
                  <div className="ana-admin-modal-section-title"><Info size={14} /> Original Source</div>
                  <div className="ana-admin-modal-kv-list" style={{ maxWidth: 400 }}>
                    <div className="ana-admin-modal-kv"><span>Name</span><span>{viewArticle.originalSource.name}</span></div>
                    {viewArticle.originalSource.author && <div className="ana-admin-modal-kv"><span>Author</span><span>{viewArticle.originalSource.author}</span></div>}
                    {viewArticle.originalSource.publishedAt && <div className="ana-admin-modal-kv"><span>Published</span><span>{fullDate(viewArticle.originalSource.publishedAt)}</span></div>}
                    {viewArticle.originalSource.url && <div className="ana-admin-modal-kv"><span>URL</span><a href={viewArticle.originalSource.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ana-primary)', fontSize: '0.78rem' }}>View <ExternalLink size={9} /></a></div>}
                  </div>
                </div>
              )}

              {/* Quick Actions in Modal */}
              <div className="ana-admin-modal-actions">
                <div className="ana-admin-modal-actions-title">Quick Actions</div>
                <div className="ana-admin-modal-actions-grid">
                  {viewArticle.status !== 'published' && !viewArticle.isDeleted && (
                    <button className="ana-admin-btn ana-admin-btn-sm" style={{ background: 'var(--ana-teal)', color: '#111' }} onClick={() => { handleStatusChange(viewArticle, 'published'); setViewArticle(null); }}>
                      <CheckCircle size={13} /> Publish
                    </button>
                  )}
                  {viewArticle.status !== 'archived' && !viewArticle.isDeleted && (
                    <button className="ana-admin-btn ana-admin-btn-ghost ana-admin-btn-sm" onClick={() => { handleStatusChange(viewArticle, 'archived'); setViewArticle(null); }}>
                      <Archive size={13} /> Archive
                    </button>
                  )}
                  <button className="ana-admin-btn ana-admin-btn-ghost ana-admin-btn-sm" onClick={() => { handleFeatureToggle(viewArticle, 'isBreaking'); }}>
                    <Flame size={13} /> {viewArticle.aiMetadata?.isBreaking ? 'Remove Breaking' : 'Mark Breaking'}
                  </button>
                  <button className="ana-admin-btn ana-admin-btn-ghost ana-admin-btn-sm" onClick={() => { handleFeatureToggle(viewArticle, 'isFeatured'); }}>
                    <Star size={13} /> {viewArticle.aiMetadata?.isFeatured ? 'Unfeature' : 'Feature'}
                  </button>
                  <button className="ana-admin-btn ana-admin-btn-ghost ana-admin-btn-sm" onClick={() => handleBlock(viewArticle)}>
                    <Ban size={13} /> {viewArticle._blocked ? 'Unblock' : 'Block'}
                  </button>
                  {!viewArticle.isDeleted ? (
                    <button className="ana-admin-btn ana-admin-btn-danger ana-admin-btn-sm" onClick={() => { handleSoftDelete(viewArticle); setViewArticle(null); }}>
                      <Trash2 size={13} /> Delete
                    </button>
                  ) : (
                    <button className="ana-admin-btn ana-admin-btn-ghost ana-admin-btn-sm" onClick={() => { handleRestore(viewArticle); setViewArticle(null); }}>
                      <RotateCcw size={13} /> Restore
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}