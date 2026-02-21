import { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Newspaper, Search, Grid, List, Bookmark, Heart, Share2, Eye, Clock,
  ChevronLeft, ChevronRight, X, ArrowUp, Bell, Filter, RefreshCw,
  MessageSquare, Copy, Check, TrendingUp, Flame, Star, Cpu,
  SlidersHorizontal, ChevronDown
} from 'lucide-react';
import Swal from 'sweetalert2';
import { ThemeContext } from '../../context/ThemeContext';

const USER_TOKEN_KEY = 'ai_news_user_token';
const getUserToken = () => localStorage.getItem(USER_TOKEN_KEY);

const AI_CATEGORIES = [
  'all', 'machine-learning', 'deep-learning', 'natural-language-processing',
  'computer-vision', 'robotics', 'generative-ai', 'llm', 'ai-ethics',
  'ai-regulation', 'ai-business', 'ai-research', 'ai-hardware', 'ai-software',
  'ai-startups', 'ai-investment', 'ai-education', 'ai-healthcare', 'ai-finance',
  'ai-automotive', 'general-ai'
];

const SORT_OPTIONS = [
  { value: 'publishedAt', label: 'Newest First' },
  { value: 'views', label: 'Most Viewed' },
  { value: 'likes', label: 'Most Liked' },
  { value: 'comments', label: 'Most Discussed' },
  { value: 'shares', label: 'Most Shared' },
];

const READING_LEVELS = ['all', 'beginner', 'intermediate', 'advanced'];
const AI_TECH_FILTERS = ['all', 'llm', 'gpt', 'claude', 'gemini', 'llama', 'stable-diffusion', 'midjourney', 'copilot'];

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
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getAuthorInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'AI';

export default function AllNews() {
  const { isDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const userToken = getUserToken();

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState('publishedAt');
  const [readingLevel, setReadingLevel] = useState('all');
  const [techFilter, setTechFilter] = useState('all');
  const [showAdvFilters, setShowAdvFilters] = useState(false);
  const [likedArticles, setLikedArticles] = useState(new Set());
  const [bookmarkedArticles, setBookmarkedArticles] = useState(new Set());
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [shareModal, setShareModal] = useState(null);
  const [copied, setCopied] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [sidebarArticles, setSidebarArticles] = useState([]);
  const [hotTopics, setHotTopics] = useState([]);
  const [stats, setStats] = useState({ total: 0, publishedToday: 0, categories: 0 });
  const [aiGeneratedOnly, setAiGeneratedOnly] = useState(false);
  const [hasPaperOnly, setHasPaperOnly] = useState(false);
  const [hasCodeOnly, setHasCodeOnly] = useState(false);

  const swalTheme = { background: isDarkMode ? '#111111' : '#ffffff', color: isDarkMode ? '#f0f0f0' : '#0d0d0d' };

  /* ─── FETCH ─────────────────────────────────────── */
  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page, limit: 15, sort: sortBy, status: 'published',
        ...(activeCategory !== 'all' && { aiCategory: activeCategory }),
        ...(searchQuery && { search: searchQuery }),
        ...(readingLevel !== 'all' && { 'readability.level': readingLevel }),
        ...(techFilter !== 'all' && { aiTechnology: techFilter }),
        ...(aiGeneratedOnly && { isAIGenerated: true }),
        ...(hasPaperOnly && { 'aiMetadata.hasPaper': true }),
        ...(hasCodeOnly && { 'aiMetadata.hasCode': true }),
      });
      setSearchParams({ ...(searchQuery && { q: searchQuery }), ...(activeCategory !== 'all' && { category: activeCategory }), page: String(page) });
      const res = await fetch(`/api/public/articles?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setArticles(data.articles || data.data || []);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.total || 0);
      setStats({ total: data.total || 0, publishedToday: data.publishedToday || 0, categories: data.categoriesCount || 20 });
    } catch {
      Swal.fire({ title: 'Error', text: 'Failed to load articles', icon: 'error', ...swalTheme });
    } finally { setLoading(false); }
  }, [page, sortBy, activeCategory, searchQuery, readingLevel, techFilter, aiGeneratedOnly, hasPaperOnly, hasCodeOnly]);

  const fetchSidebar = useCallback(async () => {
    try {
      const [topRes, topicsRes] = await Promise.all([
        fetch('/api/public/articles?limit=5&sort=views&status=published'),
        fetch('/api/public/trending/topics?limit=8'),
      ]);
      if (topRes.ok) { const d = await topRes.json(); setSidebarArticles(d.articles || d.data || []); }
      if (topicsRes.ok) { const d = await topicsRes.json(); setHotTopics(d.topics || d || []); }
    } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchArticles(); }, [fetchArticles]);
  useEffect(() => { fetchSidebar(); }, [fetchSidebar]);

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
      setArticles(prev => prev.map(a => a._id === articleId ? { ...a, metrics: { ...a.metrics, likes: (a.metrics?.likes || 0) + (likedArticles.has(articleId) ? -1 : 1) } } : a));
    } catch { Swal.fire({ title: 'Error', text: 'Could not update like', icon: 'error', timer: 1500, showConfirmButton: false, ...swalTheme }); }
  };

  const handleBookmark = async (e, articleId) => {
    e.stopPropagation();
    if (!userToken) { Swal.fire({ title: 'Sign in required', text: 'Please log in to bookmark', icon: 'info', ...swalTheme }); return; }
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
    fetch(`/api/public/articles/${article._id}/share`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ platform }) }).catch(() => {});
  };

  const handleCopyLink = (article) => {
    navigator.clipboard.writeText(`${window.location.origin}/article/${article.slug}`).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const goToArticle = (article) => { recordView(article._id); navigate(`/article/${article.slug}`); };

  const handleNewsletterSubmit = async () => {
    if (!newsletterEmail.includes('@')) { Swal.fire({ title: 'Invalid Email', icon: 'warning', ...swalTheme }); return; }
    try {
      await fetch('/api/public/newsletter/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: newsletterEmail }) });
      Swal.fire({ title: 'Subscribed!', text: 'Welcome to AI News!', icon: 'success', timer: 2000, showConfirmButton: false, ...swalTheme });
      setNewsletterEmail('');
    } catch { Swal.fire({ title: 'Error', text: 'Subscription failed', icon: 'error', ...swalTheme }); }
  };

  const clearAllFilters = () => { setSearchQuery(''); setActiveCategory('all'); setReadingLevel('all'); setTechFilter('all'); setAiGeneratedOnly(false); setHasPaperOnly(false); setHasCodeOnly(false); setPage(1); };

  const hasActiveFilters = searchQuery || activeCategory !== 'all' || readingLevel !== 'all' || techFilter !== 'all' || aiGeneratedOnly || hasPaperOnly || hasCodeOnly;

  return (
    <div className={`ai-news-trending-pages-root ${isDarkMode ? 'dark' : 'light'}`}>

      {/* Hero */}
      <div className="ai-news-trending-pages-hero ai-news-trending-pages-hero-all">
        <div className="ai-news-trending-pages-hero-inner">
          <div className="ai-news-trending-pages-hero-badge">
            <span className="ai-news-trending-pages-hero-badge-dot" />
            Complete AI Coverage
          </div>
          <h1 className="ai-news-trending-pages-hero-title">
            All <span className="ai-news-trending-pages-hero-title-italic">AI News</span>
          </h1>
          <p className="ai-news-trending-pages-hero-sub">
            Every published story from our AI news network — searchable, filterable, and updated continuously. From research breakthroughs to startup launches.
          </p>
          <div className="ai-news-trending-pages-hero-stats">
            <div className="ai-news-trending-pages-hero-stat">
              <span className="ai-news-trending-pages-hero-stat-val">{formatNum(stats.total)}</span>
              <span className="ai-news-trending-pages-hero-stat-lbl">Total Articles</span>
            </div>
            <div className="ai-news-trending-pages-hero-sep" />
            <div className="ai-news-trending-pages-hero-stat">
              <span className="ai-news-trending-pages-hero-stat-val">{stats.publishedToday}</span>
              <span className="ai-news-trending-pages-hero-stat-lbl">Published Today</span>
            </div>
            <div className="ai-news-trending-pages-hero-sep" />
            <div className="ai-news-trending-pages-hero-stat">
              <span className="ai-news-trending-pages-hero-stat-val">{stats.categories}</span>
              <span className="ai-news-trending-pages-hero-stat-lbl">Categories</span>
            </div>
          </div>
        </div>
      </div>

      <main className="ai-news-trending-pages-page" style={{ paddingTop: '2rem' }}>

        {/* Category Chips */}
        <div className="ai-news-trending-pages-cats" role="navigation" aria-label="Filter by category">
          {AI_CATEGORIES.map(cat => (
            <button key={cat}
              className={`ai-news-trending-pages-cat-chip ${activeCategory === cat ? 'ai-news-trending-pages-cat-chip-active' : ''}`}
              onClick={() => { setActiveCategory(cat); setPage(1); }}>
              {cat === 'all' ? '📰 All' : cat.replace(/-/g, ' ')}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="ai-news-trending-pages-toolbar">
          <div className="ai-news-trending-pages-search-wrap">
            <Search size={15} />
            <input className="ai-news-trending-pages-search-inp" placeholder="Search all AI articles by title, topic, technology…"
              value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setPage(1); }} aria-label="Search" />
            {searchQuery && <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--anp-text-3)', display: 'flex' }} onClick={() => setSearchQuery('')}><X size={13} /></button>}
          </div>
          <select className="ai-news-trending-pages-select" value={sortBy} onChange={e => { setSortBy(e.target.value); setPage(1); }} aria-label="Sort">
            {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <button
            className={`anp-btn anp-btn-ghost anp-btn-sm ${showAdvFilters ? 'anp-btn-primary' : ''}`}
            onClick={() => setShowAdvFilters(p => !p)}
            style={showAdvFilters ? { background: 'var(--anp-primary)', color: '#fff' } : {}}
          >
            <SlidersHorizontal size={14} /> Filters {hasActiveFilters && <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--anp-gold)', marginLeft: 2 }} />}
            <ChevronDown size={12} style={{ transition: '0.2s', transform: showAdvFilters ? 'rotate(180deg)' : 'none' }} />
          </button>
          {hasActiveFilters && (
            <button className="anp-btn anp-btn-ghost anp-btn-sm" onClick={clearAllFilters} style={{ color: 'var(--anp-primary)' }}>
              <X size={13} /> Clear
            </button>
          )}
          <div className="ai-news-trending-pages-toolbar-spacer" />
          <span style={{ fontSize: '0.78rem', color: 'var(--anp-text-3)', whiteSpace: 'nowrap' }}>{totalCount.toLocaleString()} articles</span>
          <div className="ai-news-trending-pages-view-toggle">
            <button className={`ai-news-trending-pages-view-btn ${view === 'grid' ? 'ai-news-trending-pages-view-btn-active' : ''}`} onClick={() => setView('grid')} aria-label="Grid"><Grid size={16} /></button>
            <button className={`ai-news-trending-pages-view-btn ${view === 'list' ? 'ai-news-trending-pages-view-btn-active' : ''}`} onClick={() => setView('list')} aria-label="List"><List size={16} /></button>
          </div>
          <button className="anp-btn anp-btn-ghost anp-btn-sm" onClick={fetchArticles} aria-label="Refresh"><RefreshCw size={14} className={loading ? 'anp-spin' : ''} /></button>
        </div>

        {/* Advanced Filters */}
        {showAdvFilters && (
          <div style={{
            background: 'var(--anp-bg-card)', border: '1px solid var(--anp-border)',
            borderRadius: 14, padding: '1.25rem 1.5rem', marginBottom: '1.5rem',
            animation: 'anp-card-in 0.25s ease', display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--anp-text-3)', marginBottom: '0.5rem' }}>Reading Level</div>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {READING_LEVELS.map(l => (
                  <button key={l} className={`ai-news-trending-pages-cat-chip ${readingLevel === l ? 'ai-news-trending-pages-cat-chip-active' : ''}`} style={{ padding: '0.28rem 0.65rem', fontSize: '0.75rem' }} onClick={() => { setReadingLevel(l); setPage(1); }}>
                    {l === 'all' ? 'Any' : l.charAt(0).toUpperCase() + l.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--anp-text-3)', marginBottom: '0.5rem' }}>AI Technology</div>
              <select className="ai-news-trending-pages-select" style={{ width: '100%' }} value={techFilter} onChange={e => { setTechFilter(e.target.value); setPage(1); }}>
                {AI_TECH_FILTERS.map(t => <option key={t} value={t}>{t === 'all' ? 'Any Technology' : t.toUpperCase()}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--anp-text-3)', marginBottom: '0.5rem' }}>Content Type</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {[
                  { label: '🤖 AI-Generated Content', value: aiGeneratedOnly, setter: setAiGeneratedOnly },
                  { label: '📄 Has Research Paper', value: hasPaperOnly, setter: setHasPaperOnly },
                  { label: '💻 Has Code / Demo', value: hasCodeOnly, setter: setHasCodeOnly },
                ].map(({ label, value, setter }) => (
                  <label key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--anp-text-2)' }}>
                    <input type="checkbox" checked={value} onChange={e => { setter(e.target.checked); setPage(1); }} style={{ accentColor: 'var(--anp-primary)' }} />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="ai-news-trending-pages-layout">
          <div className="ai-news-trending-pages-main">

            {/* Articles */}
            {loading ? (
              <div className={view === 'grid' ? 'ai-news-trending-pages-grid' : 'ai-news-trending-pages-grid-list'}>
                {[...Array(9)].map((_, i) => <div key={i} className="anp-skeleton" style={{ height: view === 'grid' ? 340 : 150, borderRadius: 16, animationDelay: `${i * 0.05}s` }} />)}
              </div>
            ) : articles.length === 0 ? (
              <div className="anp-empty">
                <Newspaper className="anp-empty-icon" />
                <div className="anp-empty-title">No Articles Found</div>
                <p className="anp-empty-text">Try different search terms or clear your filters.</p>
                {hasActiveFilters && <button className="anp-btn anp-btn-primary" style={{ marginTop: '1rem' }} onClick={clearAllFilters}>Clear All Filters</button>}
              </div>
            ) : view === 'grid' ? (
              <div className="ai-news-trending-pages-grid">
                {articles.map((article, idx) => (
                  <article key={article._id} className="ai-news-trending-pages-card" style={{ animationDelay: `${idx * 0.04}s` }} onClick={() => goToArticle(article)}>
                    <div className="ai-news-trending-pages-card-img-wrap">
                      <img className="ai-news-trending-pages-card-img"
                        src={article.featuredImage?.url || `https://picsum.photos/seed/${article._id}/600/400`}
                        alt={article.featuredImage?.alt || article.title} loading="lazy" />
                      <div className="ai-news-trending-pages-card-img-overlay" />
                      <div className="ai-news-trending-pages-card-img-badges">
                        {article.aiMetadata?.isBreaking && <span className="ai-news-trending-pages-badge anp-badge-red">🔴 Breaking</span>}
                        {article.aiMetadata?.isFeatured && <span className="ai-news-trending-pages-badge anp-badge-gold"><Star size={9} /></span>}
                        {article.aiMetadata?.isTrending && <span className="ai-news-trending-pages-badge anp-badge-teal"><TrendingUp size={9} /></span>}
                        {article.aiMetadata?.hasPaper && <span className="ai-news-trending-pages-badge anp-badge-blue">📄</span>}
                      </div>
                      {article.readability?.estimatedReadingTime && (
                        <div className="ai-news-trending-pages-card-read-time">
                          <Clock size={10} /> {article.readability.estimatedReadingTime} min
                        </div>
                      )}
                    </div>
                    <div className="ai-news-trending-pages-card-body">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <div className="ai-news-trending-pages-card-cat">{article.aiCategory?.replace(/-/g, ' ')}</div>
                        {article.readability?.level && (
                          <span className="ai-news-trending-pages-badge anp-badge-outline" style={{ fontSize: '0.65rem' }}>{article.readability.level}</span>
                        )}
                      </div>
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
                        <button className={`ai-news-trending-pages-card-action-btn ${likedArticles.has(article._id) ? 'ai-news-trending-pages-card-action-btn-liked' : ''}`} onClick={e => handleLike(e, article._id)}><Heart size={13} fill={likedArticles.has(article._id) ? 'currentColor' : 'none'} /> {formatNum(article.metrics?.likes)}</button>
                        <button className={`ai-news-trending-pages-card-action-btn ${bookmarkedArticles.has(article._id) ? 'ai-news-trending-pages-card-action-btn-bookmarked' : ''}`} onClick={e => handleBookmark(e, article._id)}><Bookmark size={13} fill={bookmarkedArticles.has(article._id) ? 'currentColor' : 'none'} /></button>
                        <button className="ai-news-trending-pages-card-action-btn" onClick={e => handleShare(e, article)}><Share2 size={13} /></button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="ai-news-trending-pages-grid-list">
                {articles.map((article, idx) => (
                  <article key={article._id} className="ai-news-trending-pages-list-card" style={{ animationDelay: `${idx * 0.035}s` }} onClick={() => goToArticle(article)}>
                    <div className="ai-news-trending-pages-list-card-img-wrap">
                      <img className="ai-news-trending-pages-list-card-img"
                        src={article.featuredImage?.url || `https://picsum.photos/seed/${article._id}/440/320`}
                        alt={article.featuredImage?.alt || article.title} loading="lazy" />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(0,0,0,0.2) 0%, transparent 60%)', pointerEvents: 'none' }} />
                    </div>
                    <div className="ai-news-trending-pages-list-card-body">
                      <div className="ai-news-trending-pages-list-card-meta">
                        <span className="ai-news-trending-pages-card-cat">{article.aiCategory?.replace(/-/g, ' ')}</span>
                        {article.aiMetadata?.isBreaking && <span className="ai-news-trending-pages-badge anp-badge-red" style={{ fontSize: '0.62rem' }}>Breaking</span>}
                        {article.aiMetadata?.isFeatured && <span className="ai-news-trending-pages-badge anp-badge-gold" style={{ fontSize: '0.62rem' }}>Featured</span>}
                        {article.aiMetadata?.hasPaper && <span className="ai-news-trending-pages-badge anp-badge-blue" style={{ fontSize: '0.62rem' }}>📄 Paper</span>}
                        {article.readability?.estimatedReadingTime && <span style={{ fontSize: '0.72rem', color: 'var(--anp-text-3)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Clock size={10} /> {article.readability.estimatedReadingTime} min</span>}
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
                          <button className={`ai-news-trending-pages-card-action-btn ${likedArticles.has(article._id) ? 'ai-news-trending-pages-card-action-btn-liked' : ''}`} onClick={e => handleLike(e, article._id)}><Heart size={13} fill={likedArticles.has(article._id) ? 'currentColor' : 'none'} /> {formatNum(article.metrics?.likes)}</button>
                          <button className={`ai-news-trending-pages-card-action-btn ${bookmarkedArticles.has(article._id) ? 'ai-news-trending-pages-card-action-btn-bookmarked' : ''}`} onClick={e => handleBookmark(e, article._id)}><Bookmark size={13} fill={bookmarkedArticles.has(article._id) ? 'currentColor' : 'none'} /></button>
                          <button className="ai-news-trending-pages-card-action-btn" onClick={e => handleShare(e, article)}><Share2 size={13} /></button>
                          <span className="ai-news-trending-pages-card-action-btn" style={{ cursor: 'default' }}><Eye size={13} /> {formatNum(article.metrics?.views)}</span>
                          <span className="ai-news-trending-pages-card-action-btn" style={{ cursor: 'default' }}><MessageSquare size={13} /> {formatNum(article.metrics?.comments)}</span>
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
                  return <button key={pg} className={`ai-news-trending-pages-page-btn ${page === pg ? 'ai-news-trending-pages-page-btn-active' : ''}`} onClick={() => setPage(pg)} aria-current={page === pg ? 'page' : undefined}>{pg}</button>;
                })}
                <button className="ai-news-trending-pages-page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight size={16} /></button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="ai-news-trending-pages-sidebar">
            <div className="ai-news-trending-pages-widget">
              <div className="ai-news-trending-pages-widget-head">
                <div className="ai-news-trending-pages-widget-title"><TrendingUp size={15} style={{ color: 'var(--anp-primary)' }} /> Trending</div>
              </div>
              <div className="ai-news-trending-pages-widget-body">
                {sidebarArticles.map((art, i) => (
                  <div key={art._id} className="ai-news-trending-pages-mini-card" onClick={() => goToArticle(art)}>
                    <img className="ai-news-trending-pages-mini-img" src={art.featuredImage?.url || `https://picsum.photos/seed/${art._id}/140/104`} alt={art.title} loading="lazy" />
                    <div>
                      <div className="ai-news-trending-pages-mini-title">{art.title}</div>
                      <div className="ai-news-trending-pages-mini-meta"><Eye size={10} style={{ display: 'inline', marginRight: 3 }} />{formatNum(art.metrics?.views)} views</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="ai-news-trending-pages-widget">
              <div className="ai-news-trending-pages-widget-head">
                <div className="ai-news-trending-pages-widget-title"><Flame size={15} style={{ color: 'var(--anp-primary)' }} /> Hot Topics</div>
              </div>
              <div className="ai-news-trending-pages-widget-body">
                {hotTopics.map((t, i) => (
                  <div key={i} className="ai-news-trending-pages-hot-topic" onClick={() => { setSearchQuery(t.name || t); setPage(1); }}>
                    <span className={`ai-news-trending-pages-hot-topic-rank ${i < 3 ? 'ai-news-trending-pages-rank-top' : ''}`}>#{i + 1}</span>
                    <div className="ai-news-trending-pages-hot-topic-info">
                      <div className="ai-news-trending-pages-hot-topic-name">{t.name || t}</div>
                      <div className="ai-news-trending-pages-hot-topic-count">{formatNum(t.count || 0)} articles</div>
                    </div>
                    <TrendingUp size={12} style={{ color: 'var(--anp-primary)', flexShrink: 0 }} />
                  </div>
                ))}
              </div>
            </div>

            <div className="ai-news-trending-pages-newsletter">
              <Bell size={20} style={{ marginBottom: '0.5rem', opacity: 0.9 }} />
              <div className="ai-news-trending-pages-newsletter-title">Daily AI Digest</div>
              <p className="ai-news-trending-pages-newsletter-sub">The best AI stories of the day, curated and delivered to your inbox every evening.</p>
              <input className="ai-news-trending-pages-newsletter-inp" type="email" placeholder="your@email.com"
                value={newsletterEmail} onChange={e => setNewsletterEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleNewsletterSubmit()} />
              <button className="anp-btn anp-btn-white" style={{ width: '100%', justifyContent: 'center' }} onClick={handleNewsletterSubmit}>Subscribe Free</button>
            </div>
          </aside>
        </div>
      </main>

      {showScrollTop && (
        <button className="ai-news-trending-pages-scroll-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Scroll to top"><ArrowUp size={18} /></button>
      )}

      {shareModal && (
        <div className="ai-news-trending-pages-share-overlay" onClick={() => setShareModal(null)}>
          <div className="ai-news-trending-pages-share-box" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div className="ai-news-trending-pages-share-title">Share Article</div>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--anp-text-3)', display: 'flex' }} onClick={() => setShareModal(null)}><X size={18} /></button>
            </div>
            <div className="ai-news-trending-pages-share-grid">
              {[{ id: 'twitter', label: 'X / Twitter', emoji: '🐦' }, { id: 'linkedin', label: 'LinkedIn', emoji: '💼' }, { id: 'facebook', label: 'Facebook', emoji: '📘' }, { id: 'reddit', label: 'Reddit', emoji: '🤖' }].map(p => (
                <button key={p.id} className="ai-news-trending-pages-share-btn" onClick={() => handleShare(null, shareModal, p.id)}><span style={{ fontSize: '1.5rem' }}>{p.emoji}</span>{p.label}</button>
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