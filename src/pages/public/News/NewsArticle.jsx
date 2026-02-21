import { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Heart, Bookmark, Share2, Eye, Clock, MessageSquare,
  ThumbsUp, ThumbsDown, Copy, Check, X, ExternalLink, Link2,
  ArrowUp, Cpu, CheckCircle, AlertTriangle, HelpCircle, TrendingUp,
  Code2, FileText, Flame, Star, Send, ChevronDown, ChevronUp,
  Users, Calendar, Twitter, Linkedin, Facebook, Globe, Rss,
  BookOpen, Zap, Shield, Award, BarChart2, Radio, Hash, Info
} from 'lucide-react';
import Swal from 'sweetalert2';
import { ThemeContext } from '../../../context/ThemeContext';

const USER_TOKEN_KEY = 'ai_news_user_token';
const getUserToken = () => localStorage.getItem(USER_TOKEN_KEY);

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
  if (d < 30) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const getAuthorInitials = (name) =>
  name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'AI';

const VERDICT_ICONS = {
  true: <CheckCircle size={11} />,
  false: <X size={11} />,
  misleading: <AlertTriangle size={11} />,
  unverifiable: <HelpCircle size={11} />,
  outdated: <Clock size={11} />,
};

const VERDICT_LABELS = {
  true: 'Verified True',
  false: 'False',
  misleading: 'Misleading',
  unverifiable: 'Unverifiable',
  outdated: 'Outdated',
};

/* ── MOCK DATA for skeleton/empty state ──────────────────── */
const MOCK_ARTICLE = {
  _id: 'demo-id',
  title: 'GPT-5 Unveiled: OpenAI\'s Most Powerful Model Yet Arrives with Real-Time Reasoning',
  subtitle: 'The latest iteration achieves unprecedented benchmark scores, introduces native multimodality, and challenges the very definition of machine intelligence.',
  slug: 'gpt-5-unveiled-openai-most-powerful',
  aiCategory: 'llm',
  aiTags: ['openai', 'gpt-5', 'language-model', 'multimodal', 'agi', 'deep-learning'],
  status: 'published',
  publishedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  content: `<h2>A Landmark Moment in AI</h2>
<p>OpenAI has officially unveiled GPT-5, its most advanced language model to date, sending shockwaves through the artificial intelligence industry. The model, trained on an unprecedented scale, demonstrates capabilities that blur the boundary between narrow AI and broader general intelligence.</p>
<p>In internal evaluations, GPT-5 outperforms its predecessor on virtually every benchmark, achieving human-expert-level scores in medicine, law, mathematics, and scientific reasoning — a milestone that even the most optimistic researchers did not expect until 2026.</p>

<blockquote>"This is not just an incremental improvement. GPT-5 represents a qualitative leap in what language models can do," said Sam Altman at the San Francisco launch event.</blockquote>

<h2>What's Actually New?</h2>
<p>Unlike previous GPT iterations which required separate vision models, GPT-5 is natively multimodal from the ground up. It processes text, images, audio, video, and code in a unified architecture — without any post-hoc patching. This architectural choice enables far richer contextual understanding.</p>
<p>One of the most significant breakthroughs is the introduction of <strong>persistent reasoning chains</strong>. The model can now pause mid-inference, query external tools, re-evaluate its own conclusions, and produce verified answers — a capability that dramatically reduces hallucinations on complex tasks.</p>

<h3>Extended Context Window</h3>
<p>GPT-5 ships with a 2-million-token context window as standard. To put that in perspective: you could feed it the entire Lord of the Rings trilogy, two legal contracts, and 50 technical papers simultaneously, and it would maintain coherent reasoning across all of them.</p>

<h2>Benchmarks That Speak for Themselves</h2>
<p>The model scores 92.3% on MMLU (Massive Multitask Language Understanding), compared to 87.7% for GPT-4 and 90.1% for Google's Gemini Ultra 2.0. On HumanEval coding benchmarks, GPT-5 achieves 97.8% — essentially solving almost every standard coding challenge correctly.</p>

<h3>Medical and Scientific Reasoning</h3>
<p>Perhaps most striking are the results on MedQA and USMLE-style questions. GPT-5 achieves 96.2%, a score that surpasses the average practicing physician and rivals senior specialists — though OpenAI is careful to note these benchmarks don't capture the full complexity of clinical decision-making.</p>

<h2>Safety and Alignment Work</h2>
<p>OpenAI spent nearly 18 months on red-teaming and alignment work before release. The model incorporates a new constitutional AI framework dubbed "Lighthouse," which embeds explicit ethical reasoning at inference time rather than relying purely on RLHF fine-tuning.</p>
<p>Early third-party audits suggest meaningful improvements in refusing genuinely harmful requests while being substantially less prone to over-refusal — a common complaint with GPT-4.</p>

<h2>Availability and Pricing</h2>
<p>GPT-5 will roll out in three tiers: a free tier with usage caps, a Pro subscription at $30/month with expanded access, and an Enterprise tier with custom rate limits and dedicated infrastructure. API pricing has been set at $15 per million input tokens and $60 per million output tokens.</p>

<h2>Industry Reactions</h2>
<p>Google, Anthropic, and Meta all declined to comment on the launch. However, sources close to Google DeepMind suggest Gemini 2.0 Ultra's release timeline may be accelerated. The AI arms race shows no sign of slowing, and GPT-5 has just raised the stakes dramatically.</p>`,
  featuredImage: {
    url: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1200&h=600&fit=crop',
    alt: 'AI Neural Network Abstract',
    caption: 'Abstract visualization of a neural network architecture',
    credit: 'Unsplash / Google DeepMind'
  },
  author: { _id: 'author-1', name: 'Sophia Chen', role: 'Senior AI Correspondent', avatar: null },
  coAuthors: [{ _id: 'co-1', name: 'Marcus Liu', role: 'Tech Analyst' }],
  aiMetadata: { isBreaking: true, isFeatured: true, isTrending: true, hasCode: false, hasPaper: true, paperUrl: 'https://arxiv.org', modelName: 'GPT-5', modelType: 'LLM', modelOpenSource: false, apiAvailable: true },
  aiTechnologies: [
    { name: 'GPT-5', type: 'model', version: '5.0' },
    { name: 'OpenAI API', type: 'api', version: 'v2' },
    { name: 'PyTorch', type: 'framework', version: '2.3' },
    { name: 'Triton', type: 'library', version: '2.1' },
  ],
  companiesMentioned: [
    { name: 'OpenAI', website: 'openai.com', role: 'developer' },
    { name: 'Google DeepMind', website: 'deepmind.google', role: 'competitor' },
    { name: 'Anthropic', website: 'anthropic.com', role: 'competitor' },
    { name: 'Meta AI', website: 'ai.meta.com', role: 'competitor' },
  ],
  readability: { estimatedReadingTime: 8, level: 'intermediate', wordCount: 1820 },
  metrics: { views: 284712, uniqueViews: 201432, likes: 14231, comments: 874, shares: { total: 6211, twitter: 2100, linkedin: 1800, facebook: 900, reddit: 1200, hackernews: 211 }, bookmarks: 3819 },
  sources: [
    { title: 'OpenAI Official Blog', url: 'https://openai.com/blog', sourceType: 'official', credibility: 10, publisher: 'OpenAI' },
    { title: 'MMLU Benchmark Paper', url: 'https://arxiv.org', sourceType: 'research-paper', credibility: 9, publisher: 'arXiv' },
    { title: 'GPT-5 Technical Report', url: 'https://openai.com', sourceType: 'official', credibility: 10, publisher: 'OpenAI' },
  ],
  factChecks: [
    { claim: 'GPT-5 scores 92.3% on MMLU benchmark', verdict: 'true', explanation: 'Confirmed by OpenAI\'s official technical report published alongside the model release.', checkedAt: new Date().toISOString() },
    { claim: 'The model has a 2-million token context window', verdict: 'true', explanation: 'Verified through independent developer testing via the API. The default is 1M; 2M is available on enterprise tiers.', checkedAt: new Date().toISOString() },
    { claim: 'GPT-5 surpasses all human doctors on medical tests', verdict: 'misleading', explanation: 'While it scores 96.2% on USMLE-style questions, this benchmark does not capture the full complexity of real clinical decision-making involving patient interaction, uncertainty, and ethics.', checkedAt: new Date().toISOString() },
  ],
  seo: { metaTitle: 'GPT-5 Unveiled: OpenAI\'s Most Powerful AI Model | AI News', metaDescription: 'OpenAI launches GPT-5 with 92.3% MMLU score, native multimodality, and 2M token context window. Everything you need to know.', metaKeywords: ['GPT-5', 'OpenAI', 'AI model', 'large language model', 'AI news'] },
  isAIGenerated: false,
  comments: [],
};

const MOCK_RELATED = [
  { _id: 'r1', title: 'Anthropic\'s Claude 4 Sonnet Sets New Safety Benchmark in Red Team Trials', slug: 'claude-4-sonnet-safety', aiCategory: 'llm', publishedAt: new Date(Date.now() - 86400000).toISOString(), featuredImage: { url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=200&h=120&fit=crop' }, metrics: { views: 98340 } },
  { _id: 'r2', title: 'Google Gemini 2.0 Ultra: Real-Time Video Understanding Arrives', slug: 'gemini-2-ultra-video', aiCategory: 'computer-vision', publishedAt: new Date(Date.now() - 172800000).toISOString(), featuredImage: { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=120&fit=crop' }, metrics: { views: 77210 } },
  { _id: 'r3', title: 'Meta\'s Llama 4 Goes Open Source with 400B Parameters', slug: 'meta-llama-4-open-source', aiCategory: 'llm', publishedAt: new Date(Date.now() - 259200000).toISOString(), featuredImage: { url: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=200&h=120&fit=crop' }, metrics: { views: 65004 } },
  { _id: 'r4', title: 'EU AI Act: What Every Developer Needs to Know Before August Deadline', slug: 'eu-ai-act-developers-guide', aiCategory: 'ai-regulation', publishedAt: new Date(Date.now() - 345600000).toISOString(), featuredImage: { url: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=200&h=120&fit=crop' }, metrics: { views: 54678 } },
  { _id: 'r5', title: 'NVIDIA\'s B200 Blackwell: The GPU Powering Next-Gen AI Training', slug: 'nvidia-b200-blackwell-gpu', aiCategory: 'ai-hardware', publishedAt: new Date(Date.now() - 432000000).toISOString(), featuredImage: { url: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=200&h=120&fit=crop' }, metrics: { views: 43219 } },
];

/* ──────────────────────────────────────────────────────────── */
export default function NewsArticle() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useContext(ThemeContext);
  const userToken = getUserToken();
  const contentRef = useRef(null);
  const commentSectionRef = useRef(null);

  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsPage, setCommentsPage] = useState(1);
  const [totalComments, setTotalComments] = useState(0);
  const [loadingMoreComments, setLoadingMoreComments] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false);
  const [newsletterDone, setNewsletterDone] = useState(false);
  const [tocExpanded, setTocExpanded] = useState(true);
  const [likedComments, setLikedComments] = useState(new Set());
  const [viewRecorded, setViewRecorded] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  const swalTheme = {
    background: isDarkMode ? '#111111' : '#ffffff',
    color: isDarkMode ? '#f0f0f0' : '#0d0d0d',
    confirmButtonColor: '#e63946',
  };

  /* ─── EXTRACT TOC FROM CONTENT ─────────────────── */
  const extractToc = (htmlContent) => {
    if (!htmlContent) return [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const headings = doc.querySelectorAll('h2, h3');
    return Array.from(headings).map((h, i) => ({
      id: `section-${i}`,
      text: h.textContent,
      level: h.tagName.toLowerCase(),
    }));
  };

  /* ─── FETCH ARTICLE ──────────────────────────── */
  const fetchArticle = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/public/articles/slug/${slug}`, {
        headers: { ...(userToken && { Authorization: `Bearer ${userToken}` }) },
      });
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      const art = data.article || data;
      setArticle(art);
      setLiked(data.userInteraction?.liked || false);
      setBookmarked(data.userInteraction?.bookmarked || false);
    } catch {
      // Use mock data for demo purposes when API not available
      setArticle(MOCK_ARTICLE);
      setRelatedArticles(MOCK_RELATED);
    } finally {
      setLoading(false);
    }
  }, [slug, userToken]);

  const fetchRelatedArticles = useCallback(async () => {
    if (!article?._id) return;
    try {
      const res = await fetch(`/api/public/articles/${article._id}/related?limit=5`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRelatedArticles(data.articles || data || []);
    } catch {
      setRelatedArticles(MOCK_RELATED);
    }
  }, [article?._id]);

  const fetchComments = useCallback(async (page = 1, append = false) => {
    if (!article?._id) return;
    if (append) setLoadingMoreComments(true);
    try {
      const res = await fetch(`/api/public/articles/${article._id}/comments?page=${page}&limit=10`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      const incoming = data.comments || data.data || [];
      setComments(prev => append ? [...prev, ...incoming] : incoming);
      setTotalComments(data.total || incoming.length);
    } catch {
      // Mock comments
      const mockComments = [
        { _id: 'c1', commentId: 'c1', user: { name: 'Alex Rivera', _id: 'u1' }, content: 'This is absolutely groundbreaking. The jump from GPT-4 to GPT-5 seems far more significant than the previous iterations. The persistent reasoning chains alone could revolutionize how we use AI for complex problem-solving.', likes: 342, dislikes: 12, createdAt: new Date(Date.now() - 7200000).toISOString(), replies: [], status: 'active' },
        { _id: 'c2', commentId: 'c2', user: { name: 'Priya Nair', _id: 'u2' }, content: 'I\'m cautiously optimistic. The benchmark results are impressive, but I\'ve seen GPT-4 fail on seemingly simple reasoning tasks. Real-world performance in production systems will be the true test. That said, the 2M context window is genuinely useful for document analysis workflows.', likes: 218, dislikes: 8, createdAt: new Date(Date.now() - 14400000).toISOString(), replies: [{ _id: 'r1', user: { name: 'Jordan Kim' }, content: 'Totally agree on the context window — that\'s the real killer feature for enterprise use cases.', likes: 67, createdAt: new Date(Date.now() - 10800000).toISOString() }], status: 'active' },
        { _id: 'c3', commentId: 'c3', user: { name: 'Dr. Benjamin Walsh', _id: 'u3' }, content: 'As a physician, the 96.2% USMLE score claims need serious scrutiny. Medical reasoning is fundamentally different from test-taking. Pattern matching on standardized questions ≠ diagnosing a complex patient with atypical presentation. The fact-checker is right to flag this.', likes: 891, dislikes: 24, createdAt: new Date(Date.now() - 21600000).toISOString(), replies: [], status: 'active' },
        { _id: 'c4', commentId: 'c4', user: { name: 'Yuki Tanaka', _id: 'u4' }, content: 'The pricing is aggressive. $15/M input, $60/M output puts it above Claude 3.5 Sonnet and Gemini 1.5 Pro. For enterprise customers building at scale, the math gets complicated fast. But if the capabilities hold up, ROI could still work out.', likes: 156, dislikes: 5, createdAt: new Date(Date.now() - 28800000).toISOString(), replies: [], status: 'active' },
      ];
      setComments(append ? prev => [...prev, ...mockComments] : mockComments);
      setTotalComments(47);
    } finally {
      setLoadingMoreComments(false);
    }
  }, [article?._id]);

  useEffect(() => { fetchArticle(); }, [fetchArticle]);

  useEffect(() => {
    if (article) {
      if (article._id !== 'demo-id') {
        fetchRelatedArticles();
        fetchComments(1, false);
      } else {
        setRelatedArticles(MOCK_RELATED);
        // Trigger mock comments fetch
        fetchComments(1, false);
      }
    }
  }, [article?._id]);

  /* ─── VIEW COUNT ────────────────────────────── */
  useEffect(() => {
    if (!article?._id || viewRecorded || article._id === 'demo-id') return;
    const timer = setTimeout(async () => {
      try {
        await fetch(`/api/public/articles/${article._id}/view`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(userToken && { Authorization: `Bearer ${userToken}` }) },
        });
        setViewRecorded(true);
      } catch { /* silent */ }
    }, 3000);
    return () => clearTimeout(timer);
  }, [article?._id, viewRecorded, userToken]);

  /* ─── READING PROGRESS + SCROLL ─────────────── */
  useEffect(() => {
    const onScroll = () => {
      const el = contentRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const windowH = window.innerHeight;
      const totalHeight = el.offsetHeight;
      const scrolled = Math.max(0, windowH - rect.top);
      const pct = Math.min(100, (scrolled / totalHeight) * 100);
      setReadingProgress(pct);
      setShowScrollTop(window.scrollY > 400);

      // Active TOC section
      const sections = el.querySelectorAll('h2, h3');
      sections.forEach((s, i) => {
        const top = s.getBoundingClientRect().top;
        if (top < 150) setActiveSection(`section-${i}`);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ─── LIKE ──────────────────────────────────── */
  const handleLike = async () => {
    if (!userToken) {
      Swal.fire({ title: 'Sign in required', text: 'Please log in to like articles', icon: 'info', ...swalTheme });
      return;
    }
    try {
      const res = await fetch(`/api/user/articles/${article._id}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userToken}`, 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error();
      const wasLiked = liked;
      setLiked(p => !p);
      setArticle(prev => ({
        ...prev,
        metrics: { ...prev.metrics, likes: (prev.metrics?.likes || 0) + (wasLiked ? -1 : 1) }
      }));
    } catch {
      Swal.fire({ title: 'Error', text: 'Could not update like', icon: 'error', timer: 1500, showConfirmButton: false, ...swalTheme });
    }
  };

  /* ─── BOOKMARK ──────────────────────────────── */
  const handleBookmark = async () => {
    if (!userToken) {
      Swal.fire({ title: 'Sign in required', text: 'Please log in to bookmark', icon: 'info', ...swalTheme });
      return;
    }
    try {
      const res = await fetch(`/api/user/articles/${article._id}/bookmark`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userToken}`, 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error();
      setBookmarked(p => !p);
      Swal.fire({ title: bookmarked ? 'Removed' : 'Saved!', text: bookmarked ? 'Removed from bookmarks' : 'Article bookmarked', icon: 'success', timer: 1200, showConfirmButton: false, ...swalTheme });
    } catch {
      Swal.fire({ title: 'Error', text: 'Could not update bookmark', icon: 'error', timer: 1500, showConfirmButton: false, ...swalTheme });
    }
  };

  /* ─── SHARE ─────────────────────────────────── */
  const shareVia = async (platform) => {
    const url = window.location.href;
    const text = encodeURIComponent(article?.title || '');
    const encodedUrl = encodeURIComponent(url);
    const map = {
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${text}`,
      hackernews: `https://news.ycombinator.com/submitlink?u=${encodedUrl}&t=${text}`,
    };
    if (map[platform]) window.open(map[platform], '_blank', 'noopener,width=600,height=500');

    // Record share
    if (article?._id && article._id !== 'demo-id') {
      try {
        await fetch(`/api/public/articles/${article._id}/share`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ platform }),
        });
      } catch { /* silent */ }
    }
    setShowShareModal(false);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch { /* silent */ }
  };

  /* ─── COMMENT ───────────────────────────────── */
  const handleSubmitComment = async () => {
    if (!userToken) {
      Swal.fire({ title: 'Sign in required', text: 'Please log in to comment', icon: 'info', ...swalTheme });
      return;
    }
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/user/articles/${article._id}/comments`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentText.trim() }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const newComment = data.comment || {
        _id: Date.now(),
        user: { name: 'You', _id: 'me' },
        content: commentText.trim(),
        likes: 0,
        dislikes: 0,
        replies: [],
        createdAt: new Date().toISOString(),
        status: 'active',
      };
      setComments(prev => [newComment, ...prev]);
      setTotalComments(prev => prev + 1);
      setCommentText('');
      setArticle(prev => ({ ...prev, metrics: { ...prev.metrics, comments: (prev.metrics?.comments || 0) + 1 } }));
      Swal.fire({ title: 'Posted!', text: 'Your comment has been added', icon: 'success', timer: 1200, showConfirmButton: false, ...swalTheme });
    } catch {
      Swal.fire({ title: 'Error', text: 'Could not post comment', icon: 'error', timer: 1500, showConfirmButton: false, ...swalTheme });
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleLikeComment = async (commentId) => {
    if (!userToken) {
      Swal.fire({ title: 'Sign in required', text: 'Please log in to like comments', icon: 'info', ...swalTheme });
      return;
    }
    const wasLiked = likedComments.has(commentId);
    setLikedComments(prev => {
      const s = new Set(prev);
      wasLiked ? s.delete(commentId) : s.add(commentId);
      return s;
    });
    setComments(prev => prev.map(c => c._id === commentId
      ? { ...c, likes: (c.likes || 0) + (wasLiked ? -1 : 1) }
      : c
    ));
    try {
      await fetch(`/api/user/comments/${commentId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userToken}`, 'Content-Type': 'application/json' },
      });
    } catch { /* silent */ }
  };

  const handleSubmitReply = async (commentId) => {
    if (!userToken) {
      Swal.fire({ title: 'Sign in required', text: 'Please log in to reply', icon: 'info', ...swalTheme });
      return;
    }
    if (!replyText.trim()) return;
    try {
      const res = await fetch(`/api/user/comments/${commentId}/replies`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyText.trim() }),
      });
      const newReply = { _id: Date.now(), user: { name: 'You' }, content: replyText.trim(), likes: 0, createdAt: new Date().toISOString() };
      setComments(prev => prev.map(c => c._id === commentId
        ? { ...c, replies: [...(c.replies || []), newReply] }
        : c
      ));
      setReplyText('');
      setReplyingTo(null);
    } catch { /* silent */ }
  };

  const loadMoreComments = () => {
    const nextPage = commentsPage + 1;
    setCommentsPage(nextPage);
    fetchComments(nextPage, true);
  };

  /* ─── NEWSLETTER ────────────────────────────── */
  const handleNewsletter = async (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterSubmitting(true);
    try {
      await fetch('/api/public/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail }),
      });
      setNewsletterDone(true);
      setNewsletterEmail('');
    } catch {
      setNewsletterDone(true);
    } finally {
      setNewsletterSubmitting(false);
    }
  };

  /* ─── REPORT ARTICLE ────────────────────────── */
  const handleReport = async () => {
    const { value: reason } = await Swal.fire({
      title: 'Report Article',
      input: 'select',
      inputOptions: {
        spam: 'Spam',
        inappropriate: 'Inappropriate Content',
        'factually-incorrect': 'Factually Incorrect',
        biased: 'Biased Reporting',
        outdated: 'Outdated Information',
      },
      inputPlaceholder: 'Select a reason',
      showCancelButton: true,
      confirmButtonText: 'Report',
      ...swalTheme,
    });
    if (!reason) return;
    try {
      await fetch(`/api/user/articles/${article._id}/report`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: reason }),
      });
      Swal.fire({ title: 'Reported', text: 'Thank you. Our team will review this article.', icon: 'success', timer: 2000, showConfirmButton: false, ...swalTheme });
    } catch {
      Swal.fire({ title: 'Error', text: 'Could not submit report', icon: 'error', timer: 1500, showConfirmButton: false, ...swalTheme });
    }
  };

  /* ─── SEO ───────────────────────────────────── */
  useEffect(() => {
    if (!article) return;
    document.title = article.seo?.metaTitle || article.title;
    const mDesc = document.querySelector('meta[name="description"]');
    if (mDesc) mDesc.setAttribute('content', article.seo?.metaDescription || article.excerpt || '');
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', article.seo?.canonicalUrl || window.location.href);
  }, [article]);

  /* ─── CATEGORY LABEL ────────────────────────── */
  const categoryLabel = (cat) => {
    if (!cat) return 'General';
    return cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  /* ─── LOADING SKELETON ──────────────────────── */
  if (loading) {
    return (
      <div className={`ai-news-article-root ${isDarkMode ? 'dark' : ''}`}>
        <div className="ai-news-article-progress-wrap">
          <div className="ai-news-article-progress-bar" style={{ width: '30%' }} />
        </div>
        <div className="ai-news-article-hero">
          <div className="ana-skeleton" style={{ width: '100%', height: '100%' }} />
        </div>
        <div className="ai-news-article-layout">
          <div>
            <div className="ana-skeleton" style={{ height: 28, width: '60%', marginBottom: '1rem' }} />
            <div className="ana-skeleton" style={{ height: 44, width: '100%', marginBottom: '0.5rem' }} />
            <div className="ana-skeleton" style={{ height: 44, width: '80%', marginBottom: '2rem' }} />
            {[...Array(6)].map((_, i) => (
              <div key={i} className="ana-skeleton" style={{ height: 18, width: `${90 - i * 5}%`, marginBottom: '0.75rem' }} />
            ))}
          </div>
          <div>
            <div className="ai-news-article-widget">
              <div className="ai-news-article-widget-head">
                <div className="ana-skeleton" style={{ height: 18, width: '60%' }} />
              </div>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="ai-news-article-related-card">
                  <div className="ana-skeleton" style={{ width: 72, height: 56, borderRadius: 8, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div className="ana-skeleton" style={{ height: 14, width: '90%', marginBottom: '0.4rem' }} />
                    <div className="ana-skeleton" style={{ height: 14, width: '60%' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!article) return null;

  const toc = extractToc(article.content);

  return (
    <div className={`ai-news-article-root ${isDarkMode ? 'dark' : ''}`}>

      {/* SEO Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: article.title,
        description: article.excerpt || article.subtitle,
        image: article.featuredImage?.url,
        datePublished: article.publishedAt,
        dateModified: article.updatedAt || article.publishedAt,
        author: { '@type': 'Person', name: article.author?.name },
        publisher: { '@type': 'Organization', name: 'AI News', logo: { '@type': 'ImageObject', url: '/logo.png' } },
        keywords: article.aiTags?.join(', '),
      })}} />

      {/* Reading Progress Bar */}
      <div className="ai-news-article-progress-wrap">
        <div className="ai-news-article-progress-bar" style={{ width: `${readingProgress}%` }} />
      </div>

      {/* Sticky Toolbar */}
      <div className="ai-news-article-sticky-bar">
        <button className="ai-news-article-hero-back" onClick={() => navigate(-1)} style={{ position: 'static', background: 'var(--ana-bg-raised)', color: 'var(--ana-text)', border: '1px solid var(--ana-border)' }}>
          <ArrowLeft size={14} /> Back
        </button>
        <span className="ai-news-article-sticky-title">{article.title}</span>
        <div className="ai-news-article-sticky-actions">
          <button className={`ana-action-btn ana-btn-sm ${liked ? 'ana-action-btn-liked' : ''}`} onClick={handleLike} title="Like">
            <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
            <span>{formatNum(article.metrics?.likes)}</span>
          </button>
          <button className={`ana-action-btn ana-btn-sm ${bookmarked ? 'ana-action-btn-bookmarked' : ''}`} onClick={handleBookmark} title="Bookmark">
            <Bookmark size={14} fill={bookmarked ? 'currentColor' : 'none'} />
          </button>
          <button className="ana-action-btn ana-btn-sm" onClick={() => setShowShareModal(true)} title="Share">
            <Share2 size={14} />
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className="ai-news-article-hero">
        <img
          className="ai-news-article-hero-img"
          src={article.featuredImage?.url}
          alt={article.featuredImage?.alt || article.title}
          loading="eager"
        />
        <div className="ai-news-article-hero-overlay" />
        <a href="/" className="ai-news-article-hero-back">
          <ArrowLeft size={14} /> All News
        </a>
        <div className="ai-news-article-hero-content">
          <div className="ai-news-article-hero-meta">
            {article.aiMetadata?.isBreaking && (
              <span className="ai-news-article-badge ana-badge-red">
                <Flame size={10} /> Breaking
              </span>
            )}
            {article.aiMetadata?.isTrending && (
              <span className="ai-news-article-badge ana-badge-gold">
                <TrendingUp size={10} /> Trending
              </span>
            )}
            {article.aiMetadata?.isFeatured && (
              <span className="ai-news-article-badge ana-badge-teal">
                <Star size={10} /> Featured
              </span>
            )}
            <span className="ai-news-article-badge ana-badge-dark">
              {categoryLabel(article.aiCategory)}
            </span>
            {article.isAIGenerated && (
              <span className="ai-news-article-badge ana-badge-blue">
                <Cpu size={10} /> AI-Assisted
              </span>
            )}
          </div>
          <h1 className="ai-news-article-hero-title">{article.title}</h1>
          {article.subtitle && (
            <p className="ai-news-article-hero-subtitle">{article.subtitle}</p>
          )}
        </div>
      </div>

      {/* Main Layout */}
      <div className="ai-news-article-layout">

        {/* ── LEFT / MAIN COLUMN ─────────────────────── */}
        <main>

          {/* Article Header */}
          <header className="ai-news-article-header">
            <div className="ai-news-article-meta-row">
              <span className="ai-news-article-badge ana-badge-outline">
                <Hash size={10} /> {categoryLabel(article.aiCategory)}
              </span>
              {article.aiMetadata?.hasPaper && (
                <a href={article.aiMetadata.paperUrl} target="_blank" rel="noopener noreferrer" className="ai-news-article-badge ana-badge-blue" style={{ textDecoration: 'none' }}>
                  <FileText size={10} /> Research Paper
                </a>
              )}
              {article.aiMetadata?.hasCode && (
                <a href={article.aiMetadata.codeUrl} target="_blank" rel="noopener noreferrer" className="ai-news-article-badge ana-badge-dark" style={{ textDecoration: 'none' }}>
                  <Code2 size={10} /> Code Available
                </a>
              )}
            </div>

            <h1 className="ai-news-article-title">{article.title}</h1>
            {article.subtitle && <p className="ai-news-article-subtitle">{article.subtitle}</p>}

            {/* Author Bar */}
            <div className="ai-news-article-author-bar">
              <div className="ai-news-article-author-info">
                <div className="ai-news-article-author-avatar">
                  {article.author?.avatar
                    ? <img src={article.author.avatar} alt={article.author.name} style={{ width: '100%', height: '100%', borderRadius: 12, objectFit: 'cover' }} />
                    : getAuthorInitials(article.author?.name)}
                </div>
                <div>
                  <div className="ai-news-article-author-name">{article.author?.name || 'AI News Staff'}</div>
                  <div className="ai-news-article-author-role">{article.author?.role || 'Correspondent'}</div>
                  <div className="ai-news-article-author-date">
                    <Calendar size={11} />
                    {timeAgo(article.publishedAt)}
                    {article.updatedAt && article.updatedAt !== article.publishedAt && (
                      <span style={{ color: 'var(--ana-text-3)' }}> · Updated {timeAgo(article.updatedAt)}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="ai-news-article-metrics-row">
                <span className="ai-news-article-metric"><Eye size={13} /> {formatNum(article.metrics?.views)}</span>
                <span className="ai-news-article-metric"><Heart size={13} /> {formatNum(article.metrics?.likes)}</span>
                <span className="ai-news-article-metric"><MessageSquare size={13} /> {formatNum(article.metrics?.comments)}</span>
                <span className="ai-news-article-metric"><Clock size={13} /> {article.readability?.estimatedReadingTime || '?'} min read</span>
                {article.readability?.level && (
                  <span className="ai-news-article-metric">
                    <BookOpen size={13} />
                    <span style={{ textTransform: 'capitalize' }}>{article.readability.level}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Co-Authors */}
            {article.coAuthors?.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.82rem', color: 'var(--ana-text-3)' }}>
                <Users size={13} />
                <span>Also by: </span>
                {article.coAuthors.map((ca, i) => (
                  <span key={ca._id} style={{ color: 'var(--ana-text-2)', fontWeight: 600 }}>
                    {ca.name}{i < article.coAuthors.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* AI Metadata Info Box */}
          {(article.aiMetadata?.modelName || article.aiMetadata?.apiAvailable) && (
            <div className="ai-news-article-ai-box">
              <div className="ai-news-article-ai-box-title">
                <Cpu size={12} /> AI Model Details
              </div>
              <div className="ai-news-article-ai-box-text">
                {article.aiMetadata.modelName && (
                  <span><strong>Model:</strong> {article.aiMetadata.modelName} {article.aiMetadata.modelVersion && `(${article.aiMetadata.modelVersion})`} · </span>
                )}
                {article.aiMetadata.modelType && (
                  <span><strong>Type:</strong> {article.aiMetadata.modelType} · </span>
                )}
                {typeof article.aiMetadata.modelOpenSource === 'boolean' && (
                  <span><strong>Open Source:</strong> {article.aiMetadata.modelOpenSource ? 'Yes' : 'No'} · </span>
                )}
                {typeof article.aiMetadata.apiAvailable === 'boolean' && (
                  <span><strong>API Available:</strong> {article.aiMetadata.apiAvailable ? 'Yes' : 'No'}</span>
                )}
                {article.aiMetadata.apiEndpoint && (
                  <span> · <a href={article.aiMetadata.apiEndpoint} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ana-blue)' }}>API Docs <ExternalLink size={10} /></a></span>
                )}
              </div>
            </div>
          )}

          {/* Article Content */}
          <article
            className="ai-news-article-content"
            ref={contentRef}
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Featured Image Caption */}
          {article.featuredImage?.caption && (
            <p style={{ fontSize: '0.78rem', color: 'var(--ana-text-3)', textAlign: 'center', marginTop: '-1rem', marginBottom: '1.5rem', fontStyle: 'italic' }}>
              {article.featuredImage.caption}
              {article.featuredImage.credit && ` — Photo: ${article.featuredImage.credit}`}
            </p>
          )}

          {/* AI Technologies Mentioned */}
          {article.aiTechnologies?.length > 0 && (
            <div className="ai-news-article-ai-box" style={{ marginTop: '1.5rem' }}>
              <div className="ai-news-article-ai-box-title">
                <Zap size={12} /> Technologies Mentioned
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
                {article.aiTechnologies.map((tech, i) => (
                  <span key={i} className="ai-news-article-tech-chip">
                    <Cpu size={11} />
                    {tech.name}
                    {tech.version && <span style={{ opacity: 0.6, fontSize: '0.68rem' }}>v{tech.version}</span>}
                    <span style={{ opacity: 0.5, fontSize: '0.68rem', textTransform: 'capitalize' }}>{tech.type}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Companies Mentioned */}
          {article.companiesMentioned?.length > 0 && (
            <div style={{ marginTop: '1rem', padding: '1rem 1.25rem', background: 'var(--ana-bg-raised)', borderRadius: 'var(--ana-radius)', border: '1px solid var(--ana-border)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ana-text-3)', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Globe size={12} /> Organizations Mentioned
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {article.companiesMentioned.map((c, i) => (
                  <a key={i} href={`https://${c.website}`} target="_blank" rel="noopener noreferrer" className="ai-news-article-tag">
                    {c.name}
                    {c.role && <span style={{ opacity: 0.6, fontSize: '0.68rem', marginLeft: '0.25rem' }}>({c.role})</span>}
                    <ExternalLink size={9} />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {article.aiTags?.length > 0 && (
            <div className="ai-news-article-tags-section">
              <div className="ai-news-article-tags-title">Topics Covered</div>
              <div className="ai-news-article-tags-wrap">
                {article.aiTags.map((tag, i) => (
                  <Link key={i} to={`/all-news?tag=${tag}`} className="ai-news-article-tag">
                    # {tag}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Action Bar */}
          <div className="ai-news-article-actions">
            <button className={`ana-action-btn ${liked ? 'ana-action-btn-liked' : ''}`} onClick={handleLike}>
              <Heart size={15} fill={liked ? 'currentColor' : 'none'} />
              {formatNum(article.metrics?.likes)} Likes
            </button>
            <button className={`ana-action-btn ${bookmarked ? 'ana-action-btn-bookmarked' : ''}`} onClick={handleBookmark}>
              <Bookmark size={15} fill={bookmarked ? 'currentColor' : 'none'} />
              {bookmarked ? 'Saved' : 'Save'}
            </button>
            <button className="ana-action-btn" onClick={() => { commentSectionRef.current?.scrollIntoView({ behavior: 'smooth' }); }}>
              <MessageSquare size={15} />
              {formatNum(article.metrics?.comments)} Comments
            </button>
            <div className="ai-news-article-actions-sep" />
            <button className="ana-action-btn ana-action-btn-primary" onClick={() => setShowShareModal(true)}>
              <Share2 size={15} />
              Share
            </button>
            {userToken && (
              <button className="ana-action-btn" onClick={handleReport} title="Report Article" style={{ fontSize: '0.78rem', padding: '0.45rem 0.75rem' }}>
                <AlertTriangle size={13} /> Report
              </button>
            )}
          </div>

          {/* Share Stats */}
          {article.metrics?.shares?.total > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', background: 'var(--ana-bg-raised)', borderRadius: 'var(--ana-radius-sm)', border: '1px solid var(--ana-border)', marginBottom: '1.5rem', fontSize: '0.78rem', color: 'var(--ana-text-3)', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 700, color: 'var(--ana-text-2)' }}>
                <Share2 size={12} style={{ display: 'inline', marginRight: 4 }} />
                {formatNum(article.metrics.shares.total)} shares
              </span>
              {article.metrics.shares.twitter > 0 && <span>𝕏 {formatNum(article.metrics.shares.twitter)}</span>}
              {article.metrics.shares.linkedin > 0 && <span>LinkedIn {formatNum(article.metrics.shares.linkedin)}</span>}
              {article.metrics.shares.reddit > 0 && <span>Reddit {formatNum(article.metrics.shares.reddit)}</span>}
              {article.metrics.shares.hackernews > 0 && <span>HN {formatNum(article.metrics.shares.hackernews)}</span>}
            </div>
          )}

          {/* Sources */}
          {article.sources?.length > 0 && (
            <div className="ai-news-article-sources">
              <div className="ai-news-article-sources-head">
                <Link2 size={13} /> Sources & References
              </div>
              {article.sources.map((src, i) => (
                <div key={i} className="ai-news-article-source-item">
                  <div className="ai-news-article-source-dot" style={{ background: src.credibility >= 8 ? 'var(--ana-teal)' : src.credibility >= 5 ? 'var(--ana-gold)' : 'var(--ana-accent)' }} />
                  <div style={{ flex: 1 }}>
                    <a href={src.url} target="_blank" rel="noopener noreferrer" className="ai-news-article-source-link">
                      {src.title || src.publisher} <ExternalLink size={11} />
                    </a>
                    {src.publisher && <span style={{ fontSize: '0.72rem', color: 'var(--ana-text-3)', marginLeft: '0.4rem' }}>— {src.publisher}</span>}
                  </div>
                  <span className="ai-news-article-badge ana-badge-outline" style={{ fontSize: '0.65rem' }}>
                    {src.sourceType?.replace('-', ' ')}
                  </span>
                  {src.credibility && (
                    <span style={{ fontSize: '0.68rem', color: src.credibility >= 8 ? 'var(--ana-teal)' : 'var(--ana-text-3)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <Shield size={10} /> {src.credibility}/10
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Original Source */}
          {article.originalSource?.name && (
            <div style={{ padding: '0.75rem 1rem', background: 'var(--ana-bg-raised)', border: '1px solid var(--ana-border)', borderRadius: 'var(--ana-radius-sm)', marginBottom: '1.5rem', fontSize: '0.82rem', color: 'var(--ana-text-2)' }}>
              <Info size={13} style={{ display: 'inline', marginRight: 6 }} />
              Originally published by <strong>{article.originalSource.name}</strong>
              {article.originalSource.author && ` · By ${article.originalSource.author}`}
              {article.originalSource.publishedAt && ` · ${timeAgo(article.originalSource.publishedAt)}`}
              {article.originalSource.url && (
                <a href={article.originalSource.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ana-primary)', marginLeft: 8 }}>
                  View Original <ExternalLink size={10} />
                </a>
              )}
            </div>
          )}

          {/* Fact Checks */}
          {article.factChecks?.length > 0 && (
            <div className="ai-news-article-fact-check">
              <div className="ai-news-article-fact-head">
                <CheckCircle size={13} /> Fact Check
              </div>
              {article.factChecks.map((fc, i) => (
                <div key={i} className="ai-news-article-fact-item">
                  <div className="ai-news-article-fact-claim">"{fc.claim}"</div>
                  <span className={`ai-news-article-fact-verdict ana-verdict-${fc.verdict}`}>
                    {VERDICT_ICONS[fc.verdict]} {VERDICT_LABELS[fc.verdict] || fc.verdict}
                  </span>
                  {fc.explanation && <div className="ai-news-article-fact-explanation">{fc.explanation}</div>}
                  {fc.checkedAt && (
                    <div style={{ fontSize: '0.7rem', color: 'var(--ana-text-3)', marginTop: '0.3rem' }}>
                      Checked {timeAgo(fc.checkedAt)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* AI Generated Notice */}
          {article.isAIGenerated && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', padding: '0.85rem 1.1rem', background: 'rgba(17,138,178,0.07)', border: '1px solid rgba(17,138,178,0.2)', borderRadius: 'var(--ana-radius-sm)', marginBottom: '1.5rem', fontSize: '0.82rem', color: 'var(--ana-text-2)' }}>
              <Cpu size={15} style={{ color: 'var(--ana-blue)', flexShrink: 0, marginTop: 1 }} />
              <div>
                <strong style={{ color: 'var(--ana-blue)' }}>AI-Assisted Content</strong> — This article was drafted with AI assistance
                {article.aiGenerationMetadata?.model && ` using ${article.aiGenerationMetadata.model}`}
                {article.aiGenerationMetadata?.reviewedByHuman && ' and reviewed by a human editor'}.
              </div>
            </div>
          )}

          {/* Comments Section */}
          <section className="ai-news-article-comments" ref={commentSectionRef}>
            <h2 className="ai-news-article-comments-title">
              <MessageSquare size={22} />
              Discussion ({formatNum(totalComments)})
            </h2>

            {/* Comment Form */}
            <div className="ai-news-article-comment-form">
              {userToken ? (
                <>
                  <textarea
                    className="ai-news-article-comment-textarea"
                    placeholder="Share your thoughts on this article…"
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    rows={3}
                  />
                  <div className="ai-news-article-comment-footer">
                    <span style={{ fontSize: '0.75rem', color: 'var(--ana-text-3)' }}>
                      {commentText.length}/2000 characters
                    </span>
                    <button
                      className="ana-btn ana-btn-primary"
                      onClick={handleSubmitComment}
                      disabled={submittingComment || !commentText.trim()}
                      style={{ opacity: (!commentText.trim() || submittingComment) ? 0.6 : 1 }}
                    >
                      <Send size={14} />
                      {submittingComment ? 'Posting…' : 'Post Comment'}
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
                  <MessageSquare size={28} style={{ color: 'var(--ana-text-3)', marginBottom: '0.6rem' }} />
                  <p style={{ fontSize: '0.9rem', color: 'var(--ana-text-2)', marginBottom: '1rem' }}>
                    Sign in to join the conversation
                  </p>
                  <Link to="/login" className="ana-btn ana-btn-primary">Sign In to Comment</Link>
                </div>
              )}
            </div>

            {/* Comments List */}
            {comments.map((comment) => (
              <div key={comment._id} className="ai-news-article-comment-item">
                <div className="ai-news-article-comment-header">
                  <div className="ai-news-article-comment-avatar">
                    {getAuthorInitials(comment.user?.name)}
                  </div>
                  <div>
                    <div className="ai-news-article-comment-user">{comment.user?.name || 'Anonymous'}</div>
                    <div className="ai-news-article-comment-date">{timeAgo(comment.createdAt)}</div>
                  </div>
                  {comment.isEdited && (
                    <span style={{ fontSize: '0.68rem', color: 'var(--ana-text-3)', marginLeft: 'auto', fontStyle: 'italic' }}>edited</span>
                  )}
                </div>
                <div className="ai-news-article-comment-text">{comment.content}</div>
                <div className="ai-news-article-comment-actions">
                  <button
                    className="ai-news-article-comment-action"
                    onClick={() => handleLikeComment(comment._id)}
                    style={{ color: likedComments.has(comment._id) ? 'var(--ana-primary)' : undefined }}
                  >
                    <ThumbsUp size={13} fill={likedComments.has(comment._id) ? 'currentColor' : 'none'} />
                    {formatNum(comment.likes)}
                  </button>
                  <button className="ai-news-article-comment-action">
                    <ThumbsDown size={13} />
                    {comment.dislikes > 0 ? formatNum(comment.dislikes) : ''}
                  </button>
                  <button
                    className="ai-news-article-comment-action"
                    onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                  >
                    <MessageSquare size={13} />
                    Reply {comment.replies?.length > 0 && `(${comment.replies.length})`}
                  </button>
                </div>

                {/* Reply Input */}
                {replyingTo === comment._id && (
                  <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--ana-border)' }}>
                    {userToken ? (
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                        <textarea
                          className="ai-news-article-comment-textarea"
                          placeholder="Write a reply…"
                          value={replyText}
                          onChange={e => setReplyText(e.target.value)}
                          rows={2}
                          style={{ minHeight: 60, flex: 1 }}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          <button className="ana-btn ana-btn-primary ana-btn-sm" onClick={() => handleSubmitReply(comment._id)}>
                            <Send size={12} />
                          </button>
                          <button className="ana-btn ana-btn-ghost ana-btn-sm" onClick={() => { setReplyingTo(null); setReplyText(''); }}>
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p style={{ fontSize: '0.82rem', color: 'var(--ana-text-3)' }}>
                        <Link to="/login" style={{ color: 'var(--ana-primary)' }}>Sign in</Link> to reply
                      </p>
                    )}
                  </div>
                )}

                {/* Replies */}
                {comment.replies?.length > 0 && (
                  <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--ana-border)', paddingLeft: '1rem', borderLeft: '2px solid var(--ana-border)' }}>
                    {comment.replies.map((reply, ri) => (
                      <div key={ri} style={{ marginBottom: ri < comment.replies.length - 1 ? '0.75rem' : 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <div className="ai-news-article-comment-avatar" style={{ width: 26, height: 26, fontSize: '0.65rem', borderRadius: 7 }}>
                            {getAuthorInitials(reply.user?.name)}
                          </div>
                          <span className="ai-news-article-comment-user" style={{ fontSize: '0.82rem' }}>{reply.user?.name}</span>
                          <span className="ai-news-article-comment-date">{timeAgo(reply.createdAt)}</span>
                        </div>
                        <div className="ai-news-article-comment-text" style={{ fontSize: '0.85rem', marginBottom: 0 }}>{reply.content}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Load More Comments */}
            {comments.length < totalComments && (
              <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
                <button className="ana-btn ana-btn-ghost" onClick={loadMoreComments} disabled={loadingMoreComments}>
                  {loadingMoreComments ? 'Loading…' : `Load More Comments (${totalComments - comments.length} remaining)`}
                  {!loadingMoreComments && <ChevronDown size={15} />}
                </button>
              </div>
            )}

            {comments.length === 0 && !loading && (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--ana-text-3)' }}>
                <MessageSquare size={32} style={{ marginBottom: '0.5rem', opacity: 0.4 }} />
                <p>Be the first to share your thoughts!</p>
              </div>
            )}
          </section>
        </main>

        {/* ── SIDEBAR ────────────────────────────────── */}
        <aside className="ai-news-article-sidebar">

          {/* Table of Contents */}
          {toc.length > 0 && (
            <div className="ai-news-article-widget">
              <div className="ai-news-article-widget-head">
                <span className="ai-news-article-widget-title">
                  <FileText size={15} /> Table of Contents
                </span>
                <button
                  className="ana-btn ana-btn-ghost ana-btn-sm"
                  onClick={() => setTocExpanded(p => !p)}
                  style={{ padding: '0.2rem 0.4rem' }}
                >
                  {tocExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              </div>
              {tocExpanded && (
                <nav className="ai-news-article-toc">
                  {toc.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className={`ai-news-article-toc-item ${activeSection === item.id ? 'ai-news-article-toc-item-active' : ''}`}
                      style={{ paddingLeft: item.level === 'h3' ? '2rem' : undefined, fontSize: item.level === 'h3' ? '0.76rem' : undefined }}
                    >
                      {item.text}
                    </a>
                  ))}
                </nav>
              )}
            </div>
          )}

          {/* Article Stats Widget */}
          <div className="ai-news-article-widget">
            <div className="ai-news-article-widget-head">
              <span className="ai-news-article-widget-title"><BarChart2 size={15} /> Article Stats</span>
            </div>
            <div style={{ padding: '1rem 1.25rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {[
                { label: 'Total Views', value: formatNum(article.metrics?.views), icon: <Eye size={14} /> },
                { label: 'Unique Views', value: formatNum(article.metrics?.uniqueViews), icon: <Users size={14} /> },
                { label: 'Likes', value: formatNum(article.metrics?.likes), icon: <Heart size={14} /> },
                { label: 'Bookmarks', value: formatNum(article.metrics?.bookmarks), icon: <Bookmark size={14} /> },
                { label: 'Comments', value: formatNum(article.metrics?.comments), icon: <MessageSquare size={14} /> },
                { label: 'Total Shares', value: formatNum(article.metrics?.shares?.total), icon: <Share2 size={14} /> },
              ].map((stat, i) => (
                <div key={i} style={{ background: 'var(--ana-bg-raised)', borderRadius: 'var(--ana-radius-xs)', padding: '0.6rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--ana-text-3)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    {stat.icon} {stat.label}
                  </span>
                  <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--ana-text)' }}>{stat.value}</span>
                </div>
              ))}
            </div>
            {article.readability?.wordCount && (
              <div style={{ padding: '0 1.25rem 1rem', display: 'flex', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--ana-text-3)' }}>
                <BookOpen size={13} />
                {formatNum(article.readability.wordCount)} words · ~{article.readability.estimatedReadingTime} min read
                · <span style={{ textTransform: 'capitalize' }}>{article.readability.level}</span>
              </div>
            )}
          </div>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <div className="ai-news-article-widget">
              <div className="ai-news-article-widget-head">
                <span className="ai-news-article-widget-title"><TrendingUp size={15} /> Related Articles</span>
              </div>
              {relatedArticles.map((rel) => (
                <Link key={rel._id} to={`/news/${rel.slug}`} className="ai-news-article-related-card">
                  {rel.featuredImage?.url && (
                    <img
                      className="ai-news-article-related-img"
                      src={rel.featuredImage.url}
                      alt={rel.title}
                      loading="lazy"
                    />
                  )}
                  <div>
                    <div className="ai-news-article-related-title">{rel.title}</div>
                    <div className="ai-news-article-related-meta">
                      {categoryLabel(rel.aiCategory)} · {timeAgo(rel.publishedAt)}
                      {rel.metrics?.views > 0 && <span> · <Eye size={10} style={{ display: 'inline' }} /> {formatNum(rel.metrics.views)}</span>}
                    </div>
                  </div>
                </Link>
              ))}
              <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid var(--ana-border)' }}>
                <Link to={`/all-news?category=${article.aiCategory}`} className="ana-btn ana-btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem' }}>
                  More in {categoryLabel(article.aiCategory)} <ExternalLink size={12} />
                </Link>
              </div>
            </div>
          )}

          {/* Newsletter Widget */}
          <div className="ai-news-article-widget" style={{ overflow: 'hidden' }}>
            <div className="ai-news-article-newsletter">
              <div className="ai-news-article-newsletter-title">
                <Rss size={16} style={{ display: 'inline', marginRight: 6 }} />
                Stay Ahead of AI
              </div>
              <div className="ai-news-article-newsletter-sub">
                Get the most important AI news delivered to your inbox — daily digest, no spam.
              </div>
              {newsletterDone ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem', background: 'rgba(255,255,255,0.15)', borderRadius: 'var(--ana-radius-sm)', color: '#fff', fontSize: '0.85rem', fontWeight: 600 }}>
                  <CheckCircle size={16} /> You're subscribed!
                </div>
              ) : (
                <form onSubmit={handleNewsletter}>
                  <input
                    type="email"
                    className="ai-news-article-newsletter-inp"
                    placeholder="your@email.com"
                    value={newsletterEmail}
                    onChange={e => setNewsletterEmail(e.target.value)}
                    required
                  />
                  <button type="submit" className="ana-btn" style={{ width: '100%', background: '#fff', color: 'var(--ana-primary)', fontWeight: 700, justifyContent: 'center' }} disabled={newsletterSubmitting}>
                    {newsletterSubmitting ? 'Subscribing…' : 'Subscribe Free'}
                    {!newsletterSubmitting && <ArrowUp size={14} style={{ transform: 'rotate(45deg)' }} />}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Quick Share */}
          <div className="ai-news-article-widget">
            <div className="ai-news-article-widget-head">
              <span className="ai-news-article-widget-title"><Share2 size={15} /> Share This Article</span>
            </div>
            <div style={{ padding: '1rem 1.25rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {[
                { platform: 'twitter', label: '𝕏 Twitter', color: '#000' },
                { platform: 'linkedin', label: 'LinkedIn', color: '#0077b5' },
                { platform: 'facebook', label: 'Facebook', color: '#1877f2' },
                { platform: 'reddit', label: 'Reddit', color: '#ff4500' },
              ].map(s => (
                <button
                  key={s.platform}
                  className="ai-news-article-share-btn"
                  onClick={() => shareVia(s.platform)}
                  style={{ '--hover-color': s.color }}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <div style={{ padding: '0 1.25rem 1rem' }}>
              <div className="ai-news-article-share-copy">
                <input className="ai-news-article-share-url" readOnly value={window.location.href} />
                <button className="ana-btn ana-btn-ghost ana-btn-sm" onClick={copyLink}>
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>

          {/* Tags sidebar widget */}
          {article.aiTags?.length > 0 && (
            <div className="ai-news-article-widget">
              <div className="ai-news-article-widget-head">
                <span className="ai-news-article-widget-title"><Hash size={15} /> Tags</span>
              </div>
              <div style={{ padding: '0.85rem 1.25rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {article.aiTags.map((tag, i) => (
                  <Link key={i} to={`/all-news?tag=${tag}`} className="ai-news-article-tag" style={{ fontSize: '0.72rem' }}>
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="ai-news-article-share-overlay" onClick={() => setShowShareModal(false)}>
          <div className="ai-news-article-share-box" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontFamily: 'var(--ana-font-display)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--ana-text)' }}>
                Share Article
              </h3>
              <button className="ana-btn ana-btn-ghost" style={{ padding: '0.3rem' }} onClick={() => setShowShareModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="ai-news-article-share-grid">
              {[
                { platform: 'twitter', label: '𝕏 Twitter' },
                { platform: 'linkedin', label: 'LinkedIn' },
                { platform: 'facebook', label: 'Facebook' },
                { platform: 'reddit', label: 'Reddit' },
                { platform: 'hackernews', label: 'Hacker News' },
              ].map(s => (
                <button key={s.platform} className="ai-news-article-share-btn" onClick={() => shareVia(s.platform)}>
                  <Share2 size={18} />
                  {s.label}
                </button>
              ))}
              <button className="ai-news-article-share-btn" onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: article.title, url: window.location.href });
                } else {
                  copyLink();
                }
              }}>
                <Rss size={18} />
                More…
              </button>
            </div>
            <div className="ai-news-article-share-copy">
              <input className="ai-news-article-share-url" readOnly value={window.location.href} />
              <button className="ana-btn ana-btn-ghost ana-btn-sm" onClick={copyLink}>
                {copied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scroll to top */}
      {showScrollTop && (
        <button
          className="ai-news-article-scroll-top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          title="Back to top"
        >
          <ArrowUp size={20} />
        </button>
      )}
    </div>
  );
}