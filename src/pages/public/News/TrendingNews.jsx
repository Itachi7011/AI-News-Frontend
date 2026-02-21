import { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, Search, Filter, Grid, List, Bookmark, Heart,
  Share2, Eye, Clock, ChevronLeft, ChevronRight, X, ArrowUp,
  Flame, Star, Zap, MessageSquare, ExternalLink, Bell, Cpu,
  RefreshCw, ChevronDown, Award, BarChart2, Copy, Check
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

const TIME_FILTERS = [
  { value: '24h', label: 'Last 24h' },
  { value: '7d', label: 'This Week' },
  { value: '30d', label: 'This Month' },
  { value: 'all', label: 'All Time' },
];

const SORT_OPTIONS = [
  { value: 'views', label: 'Most Viewed' },
  { value: 'likes', label: 'Most Liked' },
  { value: 'comments', label: 'Most Commented' },
  { value: 'shares', label: 'Most Shared' },
  { value: 'publishedAt', label: 'Latest' },
];

const TICKER_ITEMS = [
  'GPT-5 rumors surface across AI research communities',
  'Google DeepMind announces breakthrough in protein folding accuracy',
  'EU AI Act implementation deadline approaches — companies scramble to comply',
  'OpenAI reaches $10B annualised revenue milestone',
  'Meta releases Llama 4 with 400B parameter multimodal architecture',
  'NVIDIA H200 GPUs now shipping to top-tier cloud providers',
  'Anthropic Claude 4 beats competitors on all major benchmarks',
  'AI-generated content now accounts for 12% of all web traffic',
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
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
};

const getAuthorInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'AI';

export default function TrendingNews() {
  const { isDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const userToken = getUserToken();
  const tickerRef = useRef(null);

  /* State */
  const [articles, setArticles] = useState([]);
  const [featuredArticle, setFeaturedArticle] = useState(null);
  const [sidebarArticles, setSidebarArticles] = useState([]);
  const [hotTopics, setHotTopics] = useState([]);
  const [stats, setStats] = useState({ total: 0, todayViews: 0, trendingCount: 0 });
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [timeFilter, setTimeFilter] = useState('7d');
  const [sortBy, setSortBy] = useState('views');
  const [likedArticles, setLikedArticles] = useState(new Set());
  const [bookmarkedArticles, setBookmarkedArticles] = useState(new Set());
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [shareModal, setShareModal] = useState(null);
  const [copied, setCopied] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [aiInsight, setAiInsight] = useState('');

  const swalTheme = {
    background: isDarkMode ? '#111111' : '#ffffff',
    color: isDarkMode ? '#f0f0f0' : '#0d0d0d',
  };

  /* ─── FETCH ─────────────────────────────────────── */
  const fetchTrendingArticles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 12,
        sort: sortBy,
        timeRange: timeFilter,
        isTrending: true,
        ...(activeCategory !== 'all' && { aiCategory: activeCategory }),
        ...(searchQuery && { search: searchQuery }),
      });
      const res = await fetch(`/api/public/articles/trending?${params}`);
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      const list = data.articles || data.data || [];
      setArticles(list);
      setTotalPages(data.totalPages || 1);
      setStats({
        total: data.total || list.length,
        todayViews: data.todayViews || 0,
        trendingCount: data.trendingCount || list.length,
      });
      if (list.length > 0 && page === 1) setFeaturedArticle(list[0]);
    } catch {
      Swal.fire({ title: 'Error', text: 'Failed to load trending articles', icon: 'error', ...swalTheme });
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, timeFilter, activeCategory, searchQuery]);

  const fetchSidebarArticles = useCallback(async () => {
    try {
      const res = await fetch('/api/public/articles?limit=5&sort=likes&status=published');
      if (!res.ok) return;
      const data = await res.json();
      setSidebarArticles(data.articles || data.data || []);
    } catch { /* silent */ }
  }, []);

  const fetchHotTopics = useCallback(async () => {
    try {
      const res = await fetch('/api/public/trending/topics?limit=10');
      if (!res.ok) return;
      const data = await res.json();
      setHotTopics(data.topics || data || []);
    } catch { /* silent */ }
  }, []);

  const fetchAiInsight = useCallback(async () => {
    try {
      const res = await fetch('/api/public/ai-insight/trending');
      if (!res.ok) return;
      const data = await res.json();
      setAiInsight(data.insight || data.text || '');
    } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchTrendingArticles(); }, [fetchTrendingArticles]);
  useEffect(() => { fetchSidebarArticles(); fetchHotTopics(); fetchAiInsight(); }, [fetchSidebarArticles, fetchHotTopics, fetchAiInsight]);

  /* Scroll listener */
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ─── VIEW COUNT ────────────────────────────────── */
  const recordView = useCallback(async (articleId) => {
    try {
      await fetch(`/api/public/articles/${articleId}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(userToken && { Authorization: `Bearer ${userToken}` }),
        },
      });
    } catch { /* silent */ }
  }, [userToken]);

  /* ─── LIKE ──────────────────────────────────────── */
  const handleLike = async (e, articleId) => {
    e.stopPropagation();
    if (!userToken) {
      Swal.fire({ title: 'Sign in required', text: 'Please log in to like articles', icon: 'info', ...swalTheme });
      return;
    }
    try {
      const res = await fetch(`/api/user/articles/${articleId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userToken}`, 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error();
      setLikedArticles(prev => {
        const next = new Set(prev);
        next.has(articleId) ? next.delete(articleId) : next.add(articleId);
        return next;
      });
      setArticles(prev => prev.map(a => a._id === articleId
        ? { ...a, metrics: { ...a.metrics, likes: (a.metrics?.likes || 0) + (likedArticles.has(articleId) ? -1 : 1) } }
        : a));
    } catch {
      Swal.fire({ title: 'Error', text: 'Could not update like', icon: 'error', timer: 1500, showConfirmButton: false, ...swalTheme });
    }
  };

  /* ─── BOOKMARK ──────────────────────────────────── */
  const handleBookmark = async (e, articleId) => {
    e.stopPropagation();
    if (!userToken) {
      Swal.fire({ title: 'Sign in required', text: 'Please log in to bookmark articles', icon: 'info', ...swalTheme });
      return;
    }
    try {
      const res = await fetch(`/api/user/articles/${articleId}/bookmark`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userToken}`, 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error();
      setBookmarkedArticles(prev => {
        const next = new Set(prev);
        next.has(articleId) ? next.delete(articleId) : next.add(articleId);
        return next;
      });
    } catch {
      Swal.fire({ title: 'Error', text: 'Could not update bookmark', icon: 'error', timer: 1500, showConfirmButton: false, ...swalTheme });
    }
  };

  /* ─── SHARE ─────────────────────────────────────── */
  const handleShare = async (e, article, platform = null) => {
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
      hackernews: `https://news.ycombinator.com/submitlink?u=${encodedUrl}&t=${text}`,
    };
    if (shareUrls[platform]) window.open(shareUrls[platform], '_blank', 'noopener');
    try {
      await fetch(`/api/public/articles/${article._id}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform }),
      });
    } catch { /* silent */ }
  };

  const handleCopyLink = (article) => {
    const url = `${window.location.origin}/article/${article.slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  /* ─── NAVIGATE TO ARTICLE ────────────────────────── */
  const goToArticle = (article) => {
    recordView(article._id);
    navigate(`/article/${article.slug}`);
  };

  /* ─── NEWSLETTER ─────────────────────────────────── */
  const handleNewsletterSubmit = async () => {
    if (!newsletterEmail.includes('@')) {
      Swal.fire({ title: 'Invalid Email', text: 'Please enter a valid email address', icon: 'warning', ...swalTheme });
      return;
    }
    try {
      const res = await fetch('/api/public/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail }),
      });
      if (!res.ok) throw new Error();
      Swal.fire({ title: 'Subscribed!', text: 'You\'re now subscribed to AI News', icon: 'success', timer: 2000, showConfirmButton: false, ...swalTheme });
      setNewsletterEmail('');
    } catch {
      Swal.fire({ title: 'Error', text: 'Subscription failed. Please try again.', icon: 'error', ...swalTheme });
    }
  };

  const displayArticles = featuredArticle && page === 1 ? articles.slice(1) : articles;
  const maxViews = Math.max(...articles.map(a => a.metrics?.views || 0), 1);

  return (
    <div className={`ai-news-trending-pages-root ${isDarkMode ? 'dark' : 'light'}`}>

      {/* Hero */}
      <div className="ai-news-trending-pages-hero">
        <div className="ai-news-trending-pages-hero-inner">
          <div className="ai-news-trending-pages-hero-badge">
            <span className="ai-news-trending-pages-hero-badge-dot" />
            Live Trending
          </div>
          <h1 className="ai-news-trending-pages-hero-title">
            What's <span className="ai-news-trending-pages-hero-title-italic">Trending</span> in AI
          </h1>
          <p className="ai-news-trending-pages-hero-sub">
            The most-read, most-shared AI news stories right now — curated by engagement signals and real-time reader data from across the web.
          </p>
          <div className="ai-news-trending-pages-hero-stats">
            <div className="ai-news-trending-pages-hero-stat">
              <span className="ai-news-trending-pages-hero-stat-val">{formatNum(stats.trendingCount)}</span>
              <span className="ai-news-trending-pages-hero-stat-lbl">Trending Now</span>
            </div>
            <div className="ai-news-trending-pages-hero-sep" />
            <div className="ai-news-trending-pages-hero-stat">
              <span className="ai-news-trending-pages-hero-stat-val">{formatNum(stats.todayViews)}</span>
              <span className="ai-news-trending-pages-hero-stat-lbl">Views Today</span>
            </div>
            <div className="ai-news-trending-pages-hero-sep" />
            <div className="ai-news-trending-pages-hero-stat">
              <span className="ai-news-trending-pages-hero-stat-val">{formatNum(stats.total)}</span>
              <span className="ai-news-trending-pages-hero-stat-lbl">Total Articles</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ticker */}
      <div className="ai-news-trending-pages-ticker-wrap" ref={tickerRef}>
        <div className="ai-news-trending-pages-ticker-label">
          <span className="ai-news-trending-pages-ticker-dot" />
          Trending
        </div>
        <div className="ai-news-trending-pages-ticker-track">
          <div className="ai-news-trending-pages-ticker-content">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span key={i} className="ai-news-trending-pages-ticker-item">
                <Flame size={12} />
                {item}
                {i < TICKER_ITEMS.length * 2 - 1 && <span className="ai-news-trending-pages-ticker-sep" />}
              </span>
            ))}
          </div>
        </div>
      </div>

      <main className="ai-news-trending-pages-page">

        {/* AI Insight */}
        {aiInsight && (
          <div className="ai-news-trending-pages-ai-insight">
            <div className="ai-news-trending-pages-ai-insight-title"><Cpu size={13} /> AI Trend Insight</div>
            <p className="ai-news-trending-pages-ai-insight-text">{aiInsight}</p>
          </div>
        )}

        {/* Featured Article */}
        {featuredArticle && page === 1 && !loading && (
          <div
            className="ai-news-trending-pages-featured"
            onClick={() => goToArticle(featuredArticle)}
            role="article"
            aria-label={featuredArticle.title}
          >
            <img
              className="ai-news-trending-pages-featured-img"
              src={featuredArticle.featuredImage?.url || `https://picsum.photos/seed/${featuredArticle._id}/1200/500`}
              alt={featuredArticle.featuredImage?.alt || featuredArticle.title}
              loading="eager"
            />
            <div className="ai-news-trending-pages-featured-body">
              <div className="ai-news-trending-pages-featured-meta">
                <span className="ai-news-trending-pages-badge anp-badge-red"><Flame size={10} /> Trending #1</span>
                {featuredArticle.aiMetadata?.isBreaking && <span className="ai-news-trending-pages-badge anp-badge-gold">Breaking</span>}
                <span className="ai-news-trending-pages-badge anp-badge-dark">{featuredArticle.aiCategory?.replace(/-/g, ' ')}</span>
              </div>
              <h2 className="ai-news-trending-pages-featured-title">{featuredArticle.title}</h2>
              <p className="ai-news-trending-pages-featured-excerpt">{featuredArticle.excerpt}</p>
              <div className="ai-news-trending-pages-featured-footer">
                <div className="ai-news-trending-pages-featured-author">
                  <div className="ai-news-trending-pages-featured-avatar">
                    {getAuthorInitials(featuredArticle.author?.name || 'AI')}
                  </div>
                  <div className="ai-news-trending-pages-featured-author-info">
                    <span className="ai-news-trending-pages-featured-author-name">
                      {featuredArticle.author?.name || 'AI News Team'}
                    </span>
                    <span className="ai-news-trending-pages-featured-author-date">
                      {timeAgo(featuredArticle.publishedAt)}
                      {featuredArticle.readability?.estimatedReadingTime && ` · ${featuredArticle.readability.estimatedReadingTime} min read`}
                    </span>
                  </div>
                </div>
                <div className="ai-news-trending-pages-featured-metrics">
                  <span className="ai-news-trending-pages-featured-metric"><Eye size={13} /> {formatNum(featuredArticle.metrics?.views)}</span>
                  <span className="ai-news-trending-pages-featured-metric"><Heart size={13} /> {formatNum(featuredArticle.metrics?.likes)}</span>
                  <span className="ai-news-trending-pages-featured-metric"><MessageSquare size={13} /> {formatNum(featuredArticle.metrics?.comments)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="ai-news-trending-pages-layout">
          <div className="ai-news-trending-pages-main">

            {/* Category Chips */}
            <div className="ai-news-trending-pages-cats" role="navigation" aria-label="Category filter">
              {AI_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  className={`ai-news-trending-pages-cat-chip ${activeCategory === cat ? 'ai-news-trending-pages-cat-chip-active' : ''}`}
                  onClick={() => { setActiveCategory(cat); setPage(1); }}
                >
                  {cat === 'all' ? '🔥 All' : cat.replace(/-/g, ' ')}
                </button>
              ))}
            </div>

            {/* Toolbar */}
            <div className="ai-news-trending-pages-toolbar">
              <div className="ai-news-trending-pages-search-wrap">
                <Search size={15} />
                <input
                  className="ai-news-trending-pages-search-inp"
                  placeholder="Search trending AI articles…"
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
                  aria-label="Search articles"
                />
                {searchQuery && (
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--anp-text-3)', display: 'flex' }} onClick={() => setSearchQuery('')}>
                    <X size={13} />
                  </button>
                )}
              </div>
              <select className="ai-news-trending-pages-select" value={timeFilter} onChange={e => { setTimeFilter(e.target.value); setPage(1); }} aria-label="Time filter">
                {TIME_FILTERS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
              <select className="ai-news-trending-pages-select" value={sortBy} onChange={e => { setSortBy(e.target.value); setPage(1); }} aria-label="Sort by">
                {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <div className="ai-news-trending-pages-toolbar-spacer" />
              <div className="ai-news-trending-pages-view-toggle">
                <button className={`ai-news-trending-pages-view-btn ${view === 'grid' ? 'ai-news-trending-pages-view-btn-active' : ''}`} onClick={() => setView('grid')} title="Grid view" aria-label="Grid view"><Grid size={16} /></button>
                <button className={`ai-news-trending-pages-view-btn ${view === 'list' ? 'ai-news-trending-pages-view-btn-active' : ''}`} onClick={() => setView('list')} title="List view" aria-label="List view"><List size={16} /></button>
              </div>
              <button className="anp-btn anp-btn-ghost anp-btn-sm" onClick={fetchTrendingArticles} title="Refresh" aria-label="Refresh articles">
                <RefreshCw size={14} className={loading ? 'ai-news-trending-pages-spinning' : ''} />
              </button>
            </div>

            {/* Articles */}
            {loading ? (
              <div className={view === 'grid' ? 'ai-news-trending-pages-grid' : 'ai-news-trending-pages-grid-list'}>
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="anp-skeleton" style={{ height: view === 'grid' ? 340 : 160, borderRadius: 16, animationDelay: `${i * 0.06}s` }} />
                ))}
              </div>
            ) : articles.length === 0 ? (
              <div className="anp-empty">
                <TrendingUp className="anp-empty-icon" />
                <div className="anp-empty-title">No Trending Articles</div>
                <p className="anp-empty-text">Try adjusting your filters or check back soon.</p>
              </div>
            ) : view === 'grid' ? (
              <div className="ai-news-trending-pages-grid">
                {displayArticles.map((article, idx) => (
                  <ArticleCard
                    key={article._id}
                    article={article}
                    rank={page === 1 ? idx + 2 : (page - 1) * 12 + idx + 1}
                    onNavigate={goToArticle}
                    onLike={handleLike}
                    onBookmark={handleBookmark}
                    onShare={(e) => handleShare(e, article)}
                    liked={likedArticles.has(article._id)}
                    bookmarked={bookmarkedArticles.has(article._id)}
                    trendScore={(article.metrics?.views || 0) / maxViews}
                    animDelay={idx * 0.05}
                  />
                ))}
              </div>
            ) : (
              <div className="ai-news-trending-pages-grid-list">
                {displayArticles.map((article, idx) => (
                  <ListCard
                    key={article._id}
                    article={article}
                    rank={page === 1 ? idx + 2 : (page - 1) * 12 + idx + 1}
                    onNavigate={goToArticle}
                    onLike={handleLike}
                    onBookmark={handleBookmark}
                    onShare={(e) => handleShare(e, article)}
                    liked={likedArticles.has(article._id)}
                    bookmarked={bookmarkedArticles.has(article._id)}
                    animDelay={idx * 0.04}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && !loading && (
              <div className="ai-news-trending-pages-pagination">
                <button className="ai-news-trending-pages-page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)} aria-label="Previous page"><ChevronLeft size={16} /></button>
                {[...Array(Math.min(totalPages, 7))].map((_, i) => {
                  const pg = i + 1;
                  return <button key={pg} className={`ai-news-trending-pages-page-btn ${page === pg ? 'ai-news-trending-pages-page-btn-active' : ''}`} onClick={() => setPage(pg)} aria-label={`Page ${pg}`} aria-current={page === pg ? 'page' : undefined}>{pg}</button>;
                })}
                <button className="ai-news-trending-pages-page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)} aria-label="Next page"><ChevronRight size={16} /></button>
              </div>
            )}

          </div>

          {/* Sidebar */}
          <aside className="ai-news-trending-pages-sidebar">

            {/* Hot Topics */}
            <div className="ai-news-trending-pages-widget">
              <div className="ai-news-trending-pages-widget-head">
                <div className="ai-news-trending-pages-widget-title"><Flame size={15} style={{ color: 'var(--anp-primary)' }} /> Hot Topics</div>
              </div>
              <div className="ai-news-trending-pages-widget-body">
                {hotTopics.length > 0 ? hotTopics.map((t, i) => (
                  <div key={i} className="ai-news-trending-pages-hot-topic" onClick={() => { setActiveCategory('all'); setSearchQuery(t.name || t); }}>
                    <span className={`ai-news-trending-pages-hot-topic-rank ${i < 3 ? 'ai-news-trending-pages-rank-top' : ''}`}>#{i + 1}</span>
                    <div className="ai-news-trending-pages-hot-topic-info">
                      <div className="ai-news-trending-pages-hot-topic-name">{t.name || t}</div>
                      <div className="ai-news-trending-pages-hot-topic-count">{formatNum(t.count || 0)} articles</div>
                    </div>
                    <TrendingUp size={13} style={{ color: 'var(--anp-primary)', flexShrink: 0 }} />
                  </div>
                )) : [...Array(8)].map((_, i) => (
                  <div key={i} className="anp-skeleton" style={{ height: 52, margin: '6px 1.25rem', borderRadius: 8 }} />
                ))}
              </div>
            </div>

            {/* Most Liked */}
            <div className="ai-news-trending-pages-widget">
              <div className="ai-news-trending-pages-widget-head">
                <div className="ai-news-trending-pages-widget-title"><Heart size={15} style={{ color: 'var(--anp-primary)' }} /> Most Loved</div>
              </div>
              <div className="ai-news-trending-pages-widget-body">
                {sidebarArticles.length > 0 ? sidebarArticles.map((art) => (
                  <div key={art._id} className="ai-news-trending-pages-mini-card" onClick={() => goToArticle(art)}>
                    <img
                      className="ai-news-trending-pages-mini-img"
                      src={art.featuredImage?.url || `https://picsum.photos/seed/${art._id}/140/104`}
                      alt={art.featuredImage?.alt || art.title}
                      loading="lazy"
                    />
                    <div>
                      <div className="ai-news-trending-pages-mini-title">{art.title}</div>
                      <div className="ai-news-trending-pages-mini-meta">
                        <Heart size={10} style={{ display: 'inline', marginRight: 3 }} />{formatNum(art.metrics?.likes)} · {timeAgo(art.publishedAt)}
                      </div>
                    </div>
                  </div>
                )) : [...Array(5)].map((_, i) => (
                  <div key={i} className="anp-skeleton" style={{ height: 70, margin: '6px 1.25rem', borderRadius: 8 }} />
                ))}
              </div>
            </div>

            {/* Newsletter */}
            <div className="ai-news-trending-pages-newsletter">
              <Bell size={20} style={{ marginBottom: '0.5rem', opacity: 0.9 }} />
              <div className="ai-news-trending-pages-newsletter-title">Stay Ahead of AI</div>
              <p className="ai-news-trending-pages-newsletter-sub">Get the top trending AI stories delivered to your inbox every morning.</p>
              <input
                className="ai-news-trending-pages-newsletter-inp"
                type="email"
                placeholder="your@email.com"
                value={newsletterEmail}
                onChange={e => setNewsletterEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleNewsletterSubmit()}
                aria-label="Newsletter email"
              />
              <button className="anp-btn anp-btn-white" style={{ width: '100%', justifyContent: 'center' }} onClick={handleNewsletterSubmit}>
                Subscribe Free
              </button>
            </div>

            {/* Reading Levels Widget */}
            <div className="ai-news-trending-pages-widget">
              <div className="ai-news-trending-pages-widget-head">
                <div className="ai-news-trending-pages-widget-title"><BarChart2 size={15} style={{ color: 'var(--anp-blue)' }} /> Article Breakdown</div>
              </div>
              <div className="ai-news-trending-pages-widget-body" style={{ padding: '1rem 1.25rem' }}>
                {[
                  { label: 'Beginner-friendly', pct: 35, color: 'var(--anp-teal)' },
                  { label: 'Intermediate', pct: 48, color: 'var(--anp-accent)' },
                  { label: 'Advanced / Research', pct: 17, color: 'var(--anp-primary)' },
                ].map((item, i) => (
                  <div key={i} style={{ marginBottom: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--anp-text-2)', marginBottom: '0.3rem' }}>
                      <span>{item.label}</span><span>{item.pct}%</span>
                    </div>
                    <div className="ai-news-trending-pages-trend-track">
                      <div className="ai-news-trending-pages-trend-fill" style={{ width: `${item.pct}%`, background: item.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </aside>
        </div>
      </main>

      {/* Scroll to top */}
      {showScrollTop && (
        <button className="ai-news-trending-pages-scroll-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Scroll to top">
          <ArrowUp size={18} />
        </button>
      )}

      {/* Share Modal */}
      {shareModal && (
        <div className="ai-news-trending-pages-share-overlay" onClick={() => setShareModal(null)}>
          <div className="ai-news-trending-pages-share-box" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div className="ai-news-trending-pages-share-title">Share Article</div>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--anp-text-3)', display: 'flex' }} onClick={() => setShareModal(null)}><X size={18} /></button>
            </div>
            <div className="ai-news-trending-pages-share-grid">
              {[
                { id: 'twitter', label: 'X / Twitter', emoji: '🐦' },
                { id: 'linkedin', label: 'LinkedIn', emoji: '💼' },
                { id: 'facebook', label: 'Facebook', emoji: '📘' },
                { id: 'reddit', label: 'Reddit', emoji: '🤖' },
                { id: 'hackernews', label: 'Hacker News', emoji: '🟠' },
                { id: 'whatsapp', label: 'WhatsApp', emoji: '💬' },
              ].map(p => (
                <button key={p.id} className="ai-news-trending-pages-share-btn" onClick={() => handleShare(null, shareModal, p.id)}>
                  <span style={{ fontSize: '1.5rem' }}>{p.emoji}</span>
                  {p.label}
                </button>
              ))}
            </div>
            <div className="ai-news-trending-pages-share-copy">
              <input className="ai-news-trending-pages-share-url" readOnly value={`${window.location.origin}/article/${shareModal.slug}`} aria-label="Article URL" />
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

/* ─── ARTICLE CARD COMPONENT ──────────────────────────── */
function ArticleCard({ article, rank, onNavigate, onLike, onBookmark, onShare, liked, bookmarked, trendScore, animDelay }) {
  return (
    <article
      className="ai-news-trending-pages-card"
      style={{ animationDelay: `${animDelay}s` }}
      onClick={() => onNavigate(article)}
      aria-label={article.title}
    >
      <div className="ai-news-trending-pages-card-img-wrap">
        <img
          className="ai-news-trending-pages-card-img"
          src={article.featuredImage?.url || `https://picsum.photos/seed/${article._id}/600/400`}
          alt={article.featuredImage?.alt || article.title}
          loading="lazy"
        />
        <div className="ai-news-trending-pages-card-img-overlay" />
        <div className="ai-news-trending-pages-card-img-badges">
          <span className="ai-news-trending-pages-badge anp-badge-red anp-badge-sm">
            <span className="ai-news-trending-pages-rank-top" style={{ fontSize: '0.68rem', fontFamily: 'JetBrains Mono, monospace' }}>#{rank}</span>
          </span>
          {article.aiMetadata?.isBreaking && <span className="ai-news-trending-pages-badge anp-badge-gold">🔴 Breaking</span>}
          {article.aiMetadata?.isFeatured && <span className="ai-news-trending-pages-badge anp-badge-teal"><Star size={9} /></span>}
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

        {/* Trend bar */}
        <div className="ai-news-trending-pages-trend-bar">
          <div className="ai-news-trending-pages-trend-track">
            <div className="ai-news-trending-pages-trend-fill" style={{ width: `${trendScore * 100}%` }} />
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--anp-text-3)', minWidth: 50, fontFamily: 'JetBrains Mono, monospace' }}>
            {formatNum(article.metrics?.views)} views
          </span>
        </div>

        {article.aiTags?.length > 0 && (
          <div className="ai-news-trending-pages-card-tags">
            {article.aiTags.slice(0, 3).map(t => (
              <span key={t} className="ai-news-trending-pages-card-tag" onClick={e => { e.stopPropagation(); }}>{t}</span>
            ))}
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
          <button className={`ai-news-trending-pages-card-action-btn ${liked ? 'ai-news-trending-pages-card-action-btn-liked' : ''}`} onClick={e => onLike(e, article._id)} aria-label="Like">
            <Heart size={13} fill={liked ? 'currentColor' : 'none'} /> {formatNum(article.metrics?.likes)}
          </button>
          <button className={`ai-news-trending-pages-card-action-btn ${bookmarked ? 'ai-news-trending-pages-card-action-btn-bookmarked' : ''}`} onClick={e => onBookmark(e, article._id)} aria-label="Bookmark">
            <Bookmark size={13} fill={bookmarked ? 'currentColor' : 'none'} />
          </button>
          <button className="ai-news-trending-pages-card-action-btn" onClick={onShare} aria-label="Share">
            <Share2 size={13} />
          </button>
        </div>
      </div>
    </article>
  );
}

/* ─── LIST CARD COMPONENT ─────────────────────────────── */
function ListCard({ article, rank, onNavigate, onLike, onBookmark, onShare, liked, bookmarked, animDelay }) {
  return (
    <article
      className="ai-news-trending-pages-list-card"
      style={{ animationDelay: `${animDelay}s` }}
      onClick={() => onNavigate(article)}
      aria-label={article.title}
    >
      <div className="ai-news-trending-pages-list-card-img-wrap">
        <img
          className="ai-news-trending-pages-list-card-img"
          src={article.featuredImage?.url || `https://picsum.photos/seed/${article._id}/440/320`}
          alt={article.featuredImage?.alt || article.title}
          loading="lazy"
        />
        <div style={{ position: 'absolute', top: '0.6rem', left: '0.6rem' }}>
          <span className="ai-news-trending-pages-badge anp-badge-red">#{rank}</span>
        </div>
      </div>
      <div className="ai-news-trending-pages-list-card-body">
        <div className="ai-news-trending-pages-list-card-meta">
          <span className="ai-news-trending-pages-card-cat">{article.aiCategory?.replace(/-/g, ' ')}</span>
          {article.aiMetadata?.isBreaking && <span className="ai-news-trending-pages-badge anp-badge-red" style={{ fontSize: '0.65rem' }}>Breaking</span>}
          {article.readability?.estimatedReadingTime && (
            <span style={{ fontSize: '0.72rem', color: 'var(--anp-text-3)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <Clock size={10} /> {article.readability.estimatedReadingTime} min
            </span>
          )}
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
            <button className={`ai-news-trending-pages-card-action-btn ${liked ? 'ai-news-trending-pages-card-action-btn-liked' : ''}`} onClick={e => onLike(e, article._id)}><Heart size={13} fill={liked ? 'currentColor' : 'none'} /> {formatNum(article.metrics?.likes)}</button>
            <button className={`ai-news-trending-pages-card-action-btn ${bookmarked ? 'ai-news-trending-pages-card-action-btn-bookmarked' : ''}`} onClick={e => onBookmark(e, article._id)}><Bookmark size={13} fill={bookmarked ? 'currentColor' : 'none'} /></button>
            <button className="ai-news-trending-pages-card-action-btn" onClick={onShare}><Share2 size={13} /></button>
            <span className="ai-news-trending-pages-card-action-btn" style={{ cursor: 'default' }}><Eye size={13} /> {formatNum(article.metrics?.views)}</span>
          </div>
        </div>
      </div>
    </article>
  );
}