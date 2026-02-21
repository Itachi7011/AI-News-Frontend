import { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap, Search, Grid, List, Bookmark, Heart, Share2, Eye, Clock,
  ChevronLeft, ChevronRight, X, ArrowUp, Bell, AlertTriangle,
  RefreshCw, MessageSquare, Copy, Check, ExternalLink, Radio,
  TrendingUp, Flame, Star, Cpu
} from 'lucide-react';
import Swal from 'sweetalert2';
import { ThemeContext } from '../../context/ThemeContext';

const USER_TOKEN_KEY = 'ai_news_user_token';
const getUserToken = () => localStorage.getItem(USER_TOKEN_KEY);

const AI_CATEGORIES = [
  'all', 'machine-learning', 'deep-learning', 'natural-language-processing',
  'computer-vision', 'robotics', 'generative-ai', 'llm', 'ai-ethics',
  'ai-regulation', 'ai-business', 'ai-research', 'ai-hardware', 'ai-software',
  'ai-startups', 'ai-investment', 'general-ai'
];

const SORT_OPTIONS = [
  { value: 'publishedAt', label: 'Latest First' },
  { value: 'views', label: 'Most Viewed' },
  { value: 'likes', label: 'Most Liked' },
];

const formatNum = (n) => {
  if (!n && n !== 0) return '0';
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
};

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
};

const getAuthorInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'AI';

export default function BreakingNews() {
  const { isDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const userToken = getUserToken();
  const refreshTimerRef = useRef(null);

  const [articles, setArticles] = useState([]);
  const [featuredArticle, setFeaturedArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [view, setView] = useState('grid');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('publishedAt');
  const [likedArticles, setLikedArticles] = useState(new Set());
  const [bookmarkedArticles, setBookmarkedArticles] = useState(new Set());
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [shareModal, setShareModal] = useState(null);
  const [copied, setCopied] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [newArticlesCount, setNewArticlesCount] = useState(0);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [sidebarArticles, setSidebarArticles] = useState([]);

  const swalTheme = { background: isDarkMode ? '#111111' : '#ffffff', color: isDarkMode ? '#f0f0f0' : '#0d0d0d' };

  /* ─── FETCH ─────────────────────────────────────── */
  const fetchBreakingArticles = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const params = new URLSearchParams({
        page, limit: 12, sort: sortBy,
        isBreaking: true,
        ...(activeCategory !== 'all' && { aiCategory: activeCategory }),
        ...(searchQuery && { search: searchQuery }),
      });
      const res = await fetch(`/api/public/articles/breaking?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      const list = data.articles || data.data || [];

      if (silent && list.length > 0 && articles.length > 0 && list[0]._id !== articles[0]._id) {
        setNewArticlesCount(prev => prev + 1);
      }

      setArticles(list);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.total || list.length);
      if (list.length > 0 && page === 1) setFeaturedArticle(list[0]);
      setLastRefreshed(new Date());
    } catch {
      if (!silent) Swal.fire({ title: 'Error', text: 'Failed to load breaking news', icon: 'error', ...swalTheme });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, sortBy, activeCategory, searchQuery]);

  const fetchSidebarArticles = useCallback(async () => {
    try {
      const res = await fetch('/api/public/articles?limit=4&sort=views&status=published');
      if (!res.ok) return;
      const data = await res.json();
      setSidebarArticles(data.articles || data.data || []);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchBreakingArticles(); }, [fetchBreakingArticles]);
  useEffect(() => { fetchSidebarArticles(); }, [fetchSidebarArticles]);

  /* Auto-refresh every 90 seconds */
  useEffect(() => {
    if (!autoRefresh) { clearInterval(refreshTimerRef.current); return; }
    refreshTimerRef.current = setInterval(() => fetchBreakingArticles(true), 90000);
    return () => clearInterval(refreshTimerRef.current);
  }, [autoRefresh, fetchBreakingArticles]);

  /* Scroll listener */
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ─── INTERACTIONS ──────────────────────────────── */
  const recordView = useCallback(async (articleId) => {
    try {
      await fetch(`/api/public/articles/${articleId}/view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(userToken && { Authorization: `Bearer ${userToken}` }) },
      });
    } catch { /* silent */ }
  }, [userToken]);

  const handleLike = async (e, articleId) => {
    e.stopPropagation();
    if (!userToken) { Swal.fire({ title: 'Sign in required', text: 'Please log in to like articles', icon: 'info', ...swalTheme }); return; }
    try {
      const res = await fetch(`/api/user/articles/${articleId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userToken}`, 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error();
      setLikedArticles(prev => { const next = new Set(prev); next.has(articleId) ? next.delete(articleId) : next.add(articleId); return next; });
      setArticles(prev => prev.map(a => a._id === articleId
        ? { ...a, metrics: { ...a.metrics, likes: (a.metrics?.likes || 0) + (likedArticles.has(articleId) ? -1 : 1) } } : a));
    } catch { Swal.fire({ title: 'Error', text: 'Could not update like', icon: 'error', timer: 1500, showConfirmButton: false, ...swalTheme }); }
  };

  const handleBookmark = async (e, articleId) => {
    e.stopPropagation();
    if (!userToken) { Swal.fire({ title: 'Sign in required', text: 'Please log in to bookmark articles', icon: 'info', ...swalTheme }); return; }
    try {
      const res = await fetch(`/api/user/articles/${articleId}/bookmark`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userToken}`, 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error();
      setBookmarkedArticles(prev => { const next = new Set(prev); next.has(articleId) ? next.delete(articleId) : next.add(articleId); return next; });
    } catch { Swal.fire({ title: 'Error', text: 'Could not update bookmark', icon: 'error', timer: 1500, showConfirmButton: false, ...swalTheme }); }
  };

  const handleShare = (e, article, platform = null) => {
    if (e) e.stopPropagation();
    const url = `${window.location.origin}/article/${article.slug}`;
    if (!platform) { setShareModal(article); return; }
    const text = encodeURIComponent(article.title);
    const encodedUrl = encodeURIComponent(url);
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${text}`,
    };
    if (shareUrls[platform]) window.open(shareUrls[platform], '_blank', 'noopener');
    try {
      fetch(`/api/public/articles/${article._id}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform }),
      });
    } catch { /* silent */ }
  };

  const handleCopyLink = (article) => {
    const url = `${window.location.origin}/article/${article.slug}`;
    navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const goToArticle = (article) => { recordView(article._id); navigate(`/article/${article.slug}`); };

  const handleNewsletterSubmit = async () => {
    if (!newsletterEmail.includes('@')) { Swal.fire({ title: 'Invalid Email', icon: 'warning', ...swalTheme }); return; }
    try {
      await fetch('/api/public/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail, type: 'breaking' }),
      });
      Swal.fire({ title: 'Subscribed!', text: 'You\'ll receive breaking AI alerts', icon: 'success', timer: 2000, showConfirmButton: false, ...swalTheme });
      setNewsletterEmail('');
    } catch { Swal.fire({ title: 'Error', text: 'Subscription failed', icon: 'error', ...swalTheme }); }
  };

  const handleLoadNew = () => { setNewArticlesCount(0); fetchBreakingArticles(); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const displayArticles = featuredArticle && page === 1 ? articles.slice(1) : articles;

  return (
    <div className={`ai-news-trending-pages-root ${isDarkMode ? 'dark' : 'light'}`}>

      {/* Hero */}
      <div className="ai-news-trending-pages-hero ai-news-trending-pages-hero-breaking">
        <div className="ai-news-trending-pages-hero-inner">
          <div className="ai-news-trending-pages-hero-badge">
            <span className="ai-news-trending-pages-hero-badge-dot" style={{ background: '#fff', animationDuration: '0.8s' }} />
            Live · Breaking Now
          </div>
          <h1 className="ai-news-trending-pages-hero-title">
            Breaking <span className="ai-news-trending-pages-hero-title-italic">AI News</span>
          </h1>
          <p className="ai-news-trending-pages-hero-sub">
            The most urgent, developing stories in artificial intelligence — updated in real-time as events unfold worldwide.
          </p>
          <div className="ai-news-trending-pages-hero-stats">
            <div className="ai-news-trending-pages-hero-stat">
              <span className="ai-news-trending-pages-hero-stat-val">{totalCount}</span>
              <span className="ai-news-trending-pages-hero-stat-lbl">Breaking Stories</span>
            </div>
            <div className="ai-news-trending-pages-hero-sep" />
            <div className="ai-news-trending-pages-hero-stat">
              <span className="ai-news-trending-pages-hero-stat-val">{lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <span className="ai-news-trending-pages-hero-stat-lbl">Last Updated</span>
            </div>
            <div className="ai-news-trending-pages-hero-sep" />
            <div className="ai-news-trending-pages-hero-stat">
              <span className="ai-news-trending-pages-hero-stat-val" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: autoRefresh ? '#06d6a0' : '#888', display: 'inline-block', animation: autoRefresh ? 'anp-pulse 1s infinite' : 'none' }} />
                {autoRefresh ? 'Live' : 'Paused'}
              </span>
              <span className="ai-news-trending-pages-hero-stat-lbl">Auto-refresh</span>
            </div>
          </div>
        </div>
      </div>

      {/* Auto-refresh toggle bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.6rem 1.5rem', gap: '1rem', flexWrap: 'wrap',
        background: isDarkMode ? '#1a0000' : '#fff5f5',
        borderBottom: '2px solid #c1121f'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#c1121f', fontSize: '0.82rem', fontWeight: 600 }}>
          <Radio size={14} />
          Breaking News updates automatically every 90 seconds
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {refreshing && <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--anp-text-3)' }}><span className="anp-loader" style={{ width: 14, height: 14 }} /> Refreshing…</span>}
          <button
            className="anp-btn anp-btn-ghost anp-btn-sm"
            onClick={() => setAutoRefresh(p => !p)}
            style={{ color: autoRefresh ? '#06d6a0' : 'var(--anp-text-3)', borderColor: autoRefresh ? '#06d6a0' : 'var(--anp-border)' }}
          >
            {autoRefresh ? '⏸ Pause' : '▶ Resume'} Auto-refresh
          </button>
          <button className="anp-btn anp-btn-ghost anp-btn-sm" onClick={() => fetchBreakingArticles(false)}>
            <RefreshCw size={13} /> Refresh Now
          </button>
        </div>
      </div>

      <main className="ai-news-trending-pages-page" style={{ paddingTop: '1.5rem' }}>

        {/* New articles banner */}
        {newArticlesCount > 0 && (
          <button
            onClick={handleLoadNew}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              width: '100%', padding: '0.75rem 1.25rem', borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg, #c1121f, #780000)', color: '#fff',
              cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: 600,
              fontSize: '0.9rem', marginBottom: '1.5rem',
              animation: 'anp-card-in 0.3s ease',
              boxShadow: '0 4px 20px rgba(193,18,31,0.4)',
            }}
          >
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#fff', animation: 'anp-pulse 0.8s infinite' }} />
            {newArticlesCount} new breaking stor{newArticlesCount === 1 ? 'y' : 'ies'} — click to load
            <ArrowUp size={15} style={{ marginLeft: 'auto' }} />
          </button>
        )}

        {/* Breaking alert bar */}
        {featuredArticle && page === 1 && !loading && (
          <div className="ai-news-trending-pages-breaking-bar">
            <span className="ai-news-trending-pages-breaking-label">
              <AlertTriangle size={11} style={{ display: 'inline', marginRight: 4 }} />
              Breaking
            </span>
            <span className="ai-news-trending-pages-breaking-text">{featuredArticle.title}</span>
            <button onClick={() => goToArticle(featuredArticle)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', color: '#fff', borderRadius: 6, padding: '0.2rem 0.6rem', fontSize: '0.72rem', fontWeight: 600, flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.3rem', fontFamily: 'DM Sans, sans-serif' }}>
              Read <ExternalLink size={10} />
            </button>
          </div>
        )}

        {/* Featured */}
        {featuredArticle && page === 1 && !loading && (
          <div className="ai-news-trending-pages-featured" onClick={() => goToArticle(featuredArticle)} role="article">
            <img className="ai-news-trending-pages-featured-img"
              src={featuredArticle.featuredImage?.url || `https://picsum.photos/seed/${featuredArticle._id}/1200/500`}
              alt={featuredArticle.featuredImage?.alt || featuredArticle.title} loading="eager" />
            <div className="ai-news-trending-pages-featured-body">
              <div className="ai-news-trending-pages-featured-meta">
                <span className="ai-news-trending-pages-badge anp-badge-red" style={{ animation: 'anp-pulse 1.2s infinite' }}>
                  <AlertTriangle size={10} /> BREAKING
                </span>
                <span className="ai-news-trending-pages-badge anp-badge-dark">{timeAgo(featuredArticle.publishedAt)}</span>
                <span className="ai-news-trending-pages-badge anp-badge-dark">{featuredArticle.aiCategory?.replace(/-/g, ' ')}</span>
              </div>
              <h2 className="ai-news-trending-pages-featured-title">{featuredArticle.title}</h2>
              <p className="ai-news-trending-pages-featured-excerpt">{featuredArticle.excerpt}</p>
              <div className="ai-news-trending-pages-featured-footer">
                <div className="ai-news-trending-pages-featured-author">
                  <div className="ai-news-trending-pages-featured-avatar">{getAuthorInitials(featuredArticle.author?.name || 'AI')}</div>
                  <div className="ai-news-trending-pages-featured-author-info">
                    <span className="ai-news-trending-pages-featured-author-name">{featuredArticle.author?.name || 'AI News'}</span>
                    <span className="ai-news-trending-pages-featured-author-date">{timeAgo(featuredArticle.publishedAt)}</span>
                  </div>
                </div>
                <div className="ai-news-trending-pages-featured-metrics">
                  <span className="ai-news-trending-pages-featured-metric"><Eye size={13} /> {formatNum(featuredArticle.metrics?.views)}</span>
                  <span className="ai-news-trending-pages-featured-metric"><MessageSquare size={13} /> {formatNum(featuredArticle.metrics?.comments)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="ai-news-trending-pages-layout">
          <div className="ai-news-trending-pages-main">

            {/* Category Chips */}
            <div className="ai-news-trending-pages-cats">
              {AI_CATEGORIES.map(cat => (
                <button key={cat}
                  className={`ai-news-trending-pages-cat-chip ${activeCategory === cat ? 'ai-news-trending-pages-cat-chip-active' : ''}`}
                  onClick={() => { setActiveCategory(cat); setPage(1); }}>
                  {cat === 'all' ? '🔴 All Breaking' : cat.replace(/-/g, ' ')}
                </button>
              ))}
            </div>

            {/* Toolbar */}
            <div className="ai-news-trending-pages-toolbar">
              <div className="ai-news-trending-pages-search-wrap">
                <Search size={15} />
                <input className="ai-news-trending-pages-search-inp" placeholder="Search breaking AI stories…"
                  value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setPage(1); }} />
                {searchQuery && <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--anp-text-3)', display: 'flex' }} onClick={() => setSearchQuery('')}><X size={13} /></button>}
              </div>
              <select className="ai-news-trending-pages-select" value={sortBy} onChange={e => { setSortBy(e.target.value); setPage(1); }}>
                {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <div className="ai-news-trending-pages-toolbar-spacer" />
              <span style={{ fontSize: '0.78rem', color: 'var(--anp-text-3)' }}>{totalCount} stories</span>
              <div className="ai-news-trending-pages-view-toggle">
                <button className={`ai-news-trending-pages-view-btn ${view === 'grid' ? 'ai-news-trending-pages-view-btn-active' : ''}`} onClick={() => setView('grid')}><Grid size={16} /></button>
                <button className={`ai-news-trending-pages-view-btn ${view === 'list' ? 'ai-news-trending-pages-view-btn-active' : ''}`} onClick={() => setView('list')}><List size={16} /></button>
              </div>
            </div>

            {/* Articles */}
            {loading ? (
              <div className={view === 'grid' ? 'ai-news-trending-pages-grid' : 'ai-news-trending-pages-grid-list'}>
                {[...Array(8)].map((_, i) => <div key={i} className="anp-skeleton" style={{ height: view === 'grid' ? 340 : 150, borderRadius: 16, animationDelay: `${i * 0.06}s` }} />)}
              </div>
            ) : displayArticles.length === 0 ? (
              <div className="anp-empty">
                <AlertTriangle className="anp-empty-icon" />
                <div className="anp-empty-title">No Breaking Stories</div>
                <p className="anp-empty-text">No breaking news at the moment. Check back soon.</p>
              </div>
            ) : view === 'grid' ? (
              <div className="ai-news-trending-pages-grid">
                {displayArticles.map((article, idx) => (
                  <article
                    key={article._id}
                    className="ai-news-trending-pages-card"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                    onClick={() => goToArticle(article)}
                  >
                    <div className="ai-news-trending-pages-card-img-wrap">
                      <img className="ai-news-trending-pages-card-img"
                        src={article.featuredImage?.url || `https://picsum.photos/seed/${article._id}/600/400`}
                        alt={article.featuredImage?.alt || article.title} loading="lazy" />
                      <div className="ai-news-trending-pages-card-img-overlay" />
                      <div className="ai-news-trending-pages-card-img-badges">
                        <span className="ai-news-trending-pages-badge anp-badge-red" style={{ animation: 'anp-pulse 1.5s infinite' }}>
                          <AlertTriangle size={9} /> Breaking
                        </span>
                        {article.aiMetadata?.isFeatured && <span className="ai-news-trending-pages-badge anp-badge-gold"><Star size={9} /></span>}
                      </div>
                      {article.readability?.estimatedReadingTime && (
                        <div className="ai-news-trending-pages-card-read-time">
                          <Clock size={10} /> {article.readability.estimatedReadingTime} min
                        </div>
                      )}
                    </div>
                    <div className="ai-news-trending-pages-card-body">
                      <div className="ai-news-trending-pages-card-cat">{article.aiCategory?.replace(/-/g, ' ')}</div>
                      <h2 className="ai-news-trending-pages-card-title">{article.title}</h2>
                      <p className="ai-news-trending-pages-card-excerpt">{article.excerpt}</p>
                      {article.aiTags?.length > 0 && (
                        <div className="ai-news-trending-pages-card-tags">
                          {article.aiTags.slice(0, 3).map(t => <span key={t} className="ai-news-trending-pages-card-tag" onClick={e => e.stopPropagation()}>{t}</span>)}
                        </div>
                      )}
                    </div>
                    <div className="ai-news-trending-pages-card-footer">
                      <div className="ai-news-trending-pages-card-author">
                        <div className="ai-news-trending-pages-card-avatar">{getAuthorInitials(article.author?.name || 'AI')}</div>
                        <div>
                          <div className="ai-news-trending-pages-card-author-name">{article.author?.name || 'AI News'}</div>
                          <div className="ai-news-trending-pages-card-date">{timeAgo(article.publishedAt)}</div>
                        </div>
                      </div>
                      <div className="ai-news-trending-pages-card-actions">
                        <button className={`ai-news-trending-pages-card-action-btn ${likedArticles.has(article._id) ? 'ai-news-trending-pages-card-action-btn-liked' : ''}`} onClick={e => handleLike(e, article._id)}>
                          <Heart size={13} fill={likedArticles.has(article._id) ? 'currentColor' : 'none'} /> {formatNum(article.metrics?.likes)}
                        </button>
                        <button className={`ai-news-trending-pages-card-action-btn ${bookmarkedArticles.has(article._id) ? 'ai-news-trending-pages-card-action-btn-bookmarked' : ''}`} onClick={e => handleBookmark(e, article._id)}>
                          <Bookmark size={13} fill={bookmarkedArticles.has(article._id) ? 'currentColor' : 'none'} />
                        </button>
                        <button className="ai-news-trending-pages-card-action-btn" onClick={e => handleShare(e, article)}><Share2 size={13} /></button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="ai-news-trending-pages-grid-list">
                {displayArticles.map((article, idx) => (
                  <article key={article._id} className="ai-news-trending-pages-list-card" style={{ animationDelay: `${idx * 0.04}s` }} onClick={() => goToArticle(article)}>
                    <div className="ai-news-trending-pages-list-card-img-wrap">
                      <img className="ai-news-trending-pages-list-card-img"
                        src={article.featuredImage?.url || `https://picsum.photos/seed/${article._id}/440/320`}
                        alt={article.featuredImage?.alt || article.title} loading="lazy" />
                      <div style={{ position: 'absolute', top: '0.6rem', left: '0.6rem' }}>
                        <span className="ai-news-trending-pages-badge anp-badge-red" style={{ animation: 'anp-pulse 1.5s infinite' }}>🔴</span>
                      </div>
                    </div>
                    <div className="ai-news-trending-pages-list-card-body">
                      <div className="ai-news-trending-pages-list-card-meta">
                        <span className="ai-news-trending-pages-card-cat">{article.aiCategory?.replace(/-/g, ' ')}</span>
                        <span className="ai-news-trending-pages-badge anp-badge-red" style={{ fontSize: '0.62rem' }}>Breaking</span>
                      </div>
                      <h2 className="ai-news-trending-pages-list-card-title">{article.title}</h2>
                      <p className="ai-news-trending-pages-list-card-excerpt">{article.excerpt}</p>
                      <div className="ai-news-trending-pages-list-card-footer">
                        <div className="ai-news-trending-pages-card-author">
                          <div className="ai-news-trending-pages-card-avatar">{getAuthorInitials(article.author?.name || 'AI')}</div>
                          <span className="ai-news-trending-pages-card-author-name">{article.author?.name || 'AI News'}</span>
                        </div>
                        <span className="ai-news-trending-pages-card-date">{timeAgo(article.publishedAt)}</span>
                        <div className="ai-news-trending-pages-card-actions">
                          <button className={`ai-news-trending-pages-card-action-btn ${likedArticles.has(article._id) ? 'ai-news-trending-pages-card-action-btn-liked' : ''}`} onClick={e => handleLike(e, article._id)}><Heart size={13} fill={likedArticles.has(article._id) ? 'currentColor' : 'none'} /></button>
                          <button className={`ai-news-trending-pages-card-action-btn ${bookmarkedArticles.has(article._id) ? 'ai-news-trending-pages-card-action-btn-bookmarked' : ''}`} onClick={e => handleBookmark(e, article._id)}><Bookmark size={13} fill={bookmarkedArticles.has(article._id) ? 'currentColor' : 'none'} /></button>
                          <button className="ai-news-trending-pages-card-action-btn" onClick={e => handleShare(e, article)}><Share2 size={13} /></button>
                          <span className="ai-news-trending-pages-card-action-btn" style={{ cursor: 'default' }}><Eye size={13} /> {formatNum(article.metrics?.views)}</span>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {totalPages > 1 && !loading && (
              <div className="ai-news-trending-pages-pagination">
                <button className="ai-news-trending-pages-page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={16} /></button>
                {[...Array(Math.min(totalPages, 7))].map((_, i) => {
                  const pg = i + 1;
                  return <button key={pg} className={`ai-news-trending-pages-page-btn ${page === pg ? 'ai-news-trending-pages-page-btn-active' : ''}`} onClick={() => setPage(pg)}>{pg}</button>;
                })}
                <button className="ai-news-trending-pages-page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight size={16} /></button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="ai-news-trending-pages-sidebar">
            <div className="ai-news-trending-pages-widget">
              <div className="ai-news-trending-pages-widget-head">
                <div className="ai-news-trending-pages-widget-title"><Star size={15} style={{ color: 'var(--anp-gold)' }} /> Editor's Picks</div>
              </div>
              <div className="ai-news-trending-pages-widget-body">
                {sidebarArticles.map(art => (
                  <div key={art._id} className="ai-news-trending-pages-mini-card" onClick={() => goToArticle(art)}>
                    <img className="ai-news-trending-pages-mini-img" src={art.featuredImage?.url || `https://picsum.photos/seed/${art._id}/140/104`} alt={art.title} loading="lazy" />
                    <div>
                      <div className="ai-news-trending-pages-mini-title">{art.title}</div>
                      <div className="ai-news-trending-pages-mini-meta"><Eye size={10} style={{ display: 'inline', marginRight: 3 }} />{formatNum(art.metrics?.views)} · {timeAgo(art.publishedAt)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="ai-news-trending-pages-newsletter">
              <Bell size={20} style={{ marginBottom: '0.5rem', opacity: 0.9 }} />
              <div className="ai-news-trending-pages-newsletter-title">Breaking Alerts</div>
              <p className="ai-news-trending-pages-newsletter-sub">Get instant notifications for breaking AI news. Never miss a major development.</p>
              <input className="ai-news-trending-pages-newsletter-inp" type="email" placeholder="your@email.com"
                value={newsletterEmail} onChange={e => setNewsletterEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleNewsletterSubmit()} />
              <button className="anp-btn anp-btn-white" style={{ width: '100%', justifyContent: 'center' }} onClick={handleNewsletterSubmit}>
                <Bell size={14} /> Enable Alerts
              </button>
            </div>

            <div className="ai-news-trending-pages-widget">
              <div className="ai-news-trending-pages-widget-head">
                <div className="ai-news-trending-pages-widget-title"><Cpu size={15} style={{ color: 'var(--anp-blue)' }} /> Why It Matters</div>
              </div>
              <div className="ai-news-trending-pages-widget-body" style={{ padding: '1rem 1.25rem' }}>
                <p style={{ fontSize: '0.83rem', color: 'var(--anp-text-2)', lineHeight: 1.6 }}>
                  Breaking AI news shapes the trajectory of technology, policy, and society. Our editors manually verify each breaking story before publication to ensure accuracy and context.
                </p>
                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {['Human-verified before publishing', 'Cross-referenced with primary sources', 'Updated as events develop', 'Expert context added within hours'].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--anp-text-2)' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--anp-teal)', flexShrink: 0 }} />{item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {showScrollTop && (
        <button className="ai-news-trending-pages-scroll-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><ArrowUp size={18} /></button>
      )}

      {shareModal && (
        <div className="ai-news-trending-pages-share-overlay" onClick={() => setShareModal(null)}>
          <div className="ai-news-trending-pages-share-box" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div className="ai-news-trending-pages-share-title">Share This Story</div>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--anp-text-3)', display: 'flex' }} onClick={() => setShareModal(null)}><X size={18} /></button>
            </div>
            <div className="ai-news-trending-pages-share-grid">
              {[{ id: 'twitter', label: 'X / Twitter', emoji: '🐦' }, { id: 'linkedin', label: 'LinkedIn', emoji: '💼' }, { id: 'facebook', label: 'Facebook', emoji: '📘' }, { id: 'reddit', label: 'Reddit', emoji: '🤖' }].map(p => (
                <button key={p.id} className="ai-news-trending-pages-share-btn" onClick={() => handleShare(null, shareModal, p.id)}>
                  <span style={{ fontSize: '1.5rem' }}>{p.emoji}</span>{p.label}
                </button>
              ))}
            </div>
            <div className="ai-news-trending-pages-share-copy">
              <input className="ai-news-trending-pages-share-url" readOnly value={`${window.location.origin}/article/${shareModal.slug}`} />
              <button className="anp-btn anp-btn-ghost anp-btn-sm" onClick={() => handleCopyLink(shareModal)}>
                {copied ? <Check size={14} style={{ color: 'var(--anp-teal)' }} /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}