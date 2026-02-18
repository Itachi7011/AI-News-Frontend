import { useState, useEffect, useContext, useRef, useCallback } from "react";
import {
  BookmarkPlus, BookmarkCheck, Heart, Share2, Eye, MessageSquare,
  Clock, Calendar, RefreshCw, Tag, ExternalLink, ChevronUp, ChevronDown,
  Copy, Twitter, Linkedin, Facebook, Flag, ArrowUp, ArrowLeft,
  User, Brain, TrendingUp, AlertCircle, Telescope, Lightbulb,
  Cpu, BarChart2, Shield, Globe, Zap, Star, CheckCircle,
  Edit2, Trash2, Send, ThumbsUp, MoreVertical, X, Info
} from "lucide-react";

// ── ThemeContext mock (replace with your actual import) ──
const ThemeContext = { isDarkMode: false };
// import { ThemeContext } from '../../context/ThemeContext';

// ── SweetAlert2 (loaded via CDN in index.html) ──
const Swal = window.Swal;

// ─────────────────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────────────────
const MOCK_ARTICLE = {
  _id: "art_001",
  slug: "openai-gpt5-release-2025",
  title: "OpenAI Unveils GPT-5: A Quantum Leap in Multimodal Reasoning That Redefines the Boundaries of Artificial General Intelligence",
  subHeadline: "The latest flagship model demonstrates unprecedented chain-of-thought reasoning, real-time vision processing, and a 10-million-token context window — setting a new benchmark for the entire industry.",
  coverImage: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1400&q=85",
  category: { name: "Large Language Models", slug: "llm", color: "#6366f1" },
  author: {
    _id: "auth_001",
    name: "Dr. Aisha Renard",
    avatar: "https://i.pravatar.cc/150?img=47",
    bio: "AI Research Correspondent & Former ML Engineer at DeepMind. Covering frontier AI developments for 8 years.",
    title: "Senior AI Editor",
  },
  publishedAt: "2025-02-14T09:30:00Z",
  updatedAt: "2025-02-17T14:22:00Z",
  readingTime: 14,
  source: { name: "OpenAI Blog", url: "https://openai.com/blog" },
  isAIGenerated: false,
  tags: ["GPT-5", "OpenAI", "Multimodal AI", "AGI", "LLM", "AI Safety", "Reasoning Models"],
  views: 284719,
  likes: 18420,
  shares: 9341,
  bookmarks: 7214,
  engagementScore: 98.4,
  aiSummary: "OpenAI has launched GPT-5, its most capable model to date, featuring a 10-million token context window, real-time multimodal processing, and significantly improved reasoning capabilities. The model outperforms all previous benchmarks on MMLU, HumanEval, and the newly introduced 'ReasonBench' evaluation suite. Industry experts predict this release will accelerate the AI race and force competitors like Google DeepMind and Anthropic to expedite their own flagship model launches.",
  keyHighlights: [
    "10 million token context window — 10× larger than GPT-4 Turbo",
    "Real-time vision, audio, and document processing in a single inference pass",
    "Scores 96.3% on MMLU, surpassing human expert level across all 57 domains",
    "New 'Deep Reasoning Mode' reduces hallucination rate to under 0.8%",
    "API pricing reduced by 40% compared to GPT-4 Turbo",
    "Supports 47 languages including 12 low-resource languages for the first time",
  ],
  content: `
<p>In a move that has sent shockwaves through Silicon Valley and the broader technology landscape, OpenAI has officially released GPT-5 — a model that the company describes as "the most significant leap in AI capability since the invention of the transformer architecture itself."</p>

<h2>The Architecture Behind the Breakthrough</h2>
<p>GPT-5 is built on what OpenAI is calling the "Sparse Mixture of Experts v3" (SMoE-3) architecture, an evolution that allows the model to activate only the most relevant subset of its 1.8 trillion parameters for any given task. This approach dramatically improves both efficiency and specialization, allowing GPT-5 to reason like a domain expert rather than a generalist.</p>

<p>According to OpenAI's technical report, the model was trained on a dataset that spans over 15 trillion tokens — including curated scientific literature, legal documents, medical journals, software codebases, and a proprietary dataset of 800 billion tokens of human-annotated reasoning traces. The inclusion of reasoning traces is believed to be the primary driver behind the model's remarkable logical coherence.</p>

<blockquote>"We didn't just make GPT bigger. We made it think differently," said Dr. Ilya Sutskever during the live stream announcement. "GPT-5 approaches problems the way a senior researcher would — iterating, questioning its own assumptions, and verifying its conclusions before committing to an answer."</blockquote>

<h2>Multimodal Capabilities: A Unified Intelligence</h2>
<p>Perhaps the most striking technical achievement is GPT-5's native multimodal processing. Unlike previous iterations that used bolt-on vision modules, GPT-5 processes text, images, audio, video frames, and structured data through a single unified transformer pass. The model can watch a video, read accompanying subtitles, analyze embedded charts, and produce a coherent synthesis in real time.</p>

<p>In a live demonstration, GPT-5 was shown a 45-minute earnings call video and asked to produce a comprehensive investment analysis including risk factors, sentiment analysis, and financial projections — all in under 60 seconds. Analysts present described the output as "indistinguishable from what a seasoned equity research analyst would produce after hours of work."</p>

<h2>Performance Benchmarks</h2>
<p>The model's performance on standardized benchmarks has redefined what the industry considers the frontier. On the Massive Multitask Language Understanding (MMLU) benchmark, GPT-5 achieved a score of 96.3%, compared to GPT-4's 86.4% and human expert performance of approximately 89.8%. This marks the first time an AI system has measurably surpassed average human expert performance across all 57 academic domains in the benchmark.</p>

<p>On HumanEval, the standard coding benchmark, GPT-5 achieves a pass@1 rate of 94.7%, capable of solving nearly any competitive programming problem at the difficulty level of a Google-level software engineering interview. It can also autonomously debug and refactor existing codebases spanning hundreds of thousands of lines.</p>

<h2>The 10-Million Token Context Window</h2>
<p>The headline feature for enterprise customers is the 10-million token context window — equivalent to approximately 7,500 pages of text, or roughly 20 full-length novels processed simultaneously. This enables entirely new use cases: legal firms can feed an entire case history to the model; pharmaceutical companies can query against their full research database; software teams can load an entire codebase for automated review and refactoring.</p>

<p>OpenAI has also introduced "Persistent Memory Nodes," a complementary feature that allows enterprise deployments to maintain a rolling summary of interactions across sessions, effectively giving GPT-5 a form of long-term institutional memory that compounds in usefulness over time.</p>

<h2>Safety Measures and Alignment Research</h2>
<p>Alongside the capability announcements, OpenAI published an extensive 340-page safety evaluation report. The document details how GPT-5 was tested against an expanded version of their "red team" adversarial suite, including new categories specifically designed for more capable models: autonomous deception attempts, long-horizon goal misalignment, and constitutional AI stress testing.</p>

<p>The model incorporates a new generation of Reinforcement Learning from Human Feedback (RLHF) called "Constitutional Reinforcement Learning" (CRL), which encodes not just preference data but explicit moral reasoning chains into the reward model. Early results suggest a 73% reduction in cases where the model produces outputs that technically satisfy user requests but violate underlying user intent.</p>
  `,
  expertCommentary: [
    {
      name: "Prof. Yoshua Bengio",
      title: "Turing Award Winner & AI Safety Researcher",
      avatar: "https://i.pravatar.cc/150?img=12",
      quote: "The capability jump from GPT-4 to GPT-5 is more significant than anything we saw between GPT-3 and GPT-4. What concerns me is not the capability itself, but whether our alignment research has kept pace. The gap between what these models can do and what we can reliably ensure they will do is widening.",
    },
    {
      name: "Dr. Fei-Fei Li",
      title: "Co-Director, Stanford HAI",
      avatar: "https://i.pravatar.cc/150?img=32",
      quote: "The multimodal integration is genuinely impressive from a technical standpoint. What I find most significant is not the benchmark scores, but the model's demonstrated ability to transfer knowledge across modalities in ways that suggest something approaching genuine conceptual understanding.",
    },
    {
      name: "Mustafa Suleyman",
      title: "CEO, Microsoft AI",
      avatar: "https://i.pravatar.cc/150?img=61",
      quote: "GPT-5 represents the kind of capability threshold that I have been anticipating for two years. The question now for the industry is not 'when will AI reach this level' but 'what are the first-order economic effects' — and those effects will arrive faster than most enterprises are prepared for.",
    },
  ],
  marketTrend: {
    title: "AI Model Market: Accelerating to Singularity",
    description: "The frontier AI model market is experiencing exponential capability growth while simultaneously seeing precipitous cost declines. GPT-5's 40% API price reduction continues a trend where frontier model inference costs have dropped by approximately 95% over the past three years.",
    dataPoints: [
      { label: "Global AI Market (2025)", value: "$847B", change: "+34% YoY" },
      { label: "LLM API Revenue", value: "$12.4B", change: "+218% YoY" },
      { label: "Enterprise AI Adoption", value: "78%", change: "+23pts" },
      { label: "AI Startups Founded (2024)", value: "14,200", change: "+67% YoY" },
    ],
  },
  ethicalConsiderations: [
    {
      title: "Labor Market Disruption",
      description: "GPT-5's advanced reasoning capabilities threaten to automate significant portions of white-collar work previously considered safe from automation, including legal research, financial analysis, and software engineering.",
    },
    {
      title: "Concentration of Power",
      description: "The compute requirements for training frontier models continue to favor a small number of well-capitalized organizations, raising concerns about democratic access to transformative AI technology.",
    },
    {
      title: "AI-Generated Disinformation",
      description: "GPT-5's enhanced creativity and persuasion capabilities, if misused, could significantly amplify the scale and sophistication of AI-generated misinformation campaigns.",
    },
    {
      title: "Environmental Impact",
      description: "Training GPT-5 is estimated to have consumed approximately 15,000 MWh of electricity — roughly equivalent to the annual energy consumption of 1,400 US households.",
    },
  ],
  futureOutlook: "The release of GPT-5 is likely to trigger an accelerated timeline for GPT-6 development, with industry analysts now predicting a next major release within 12-18 months. More immediately, GPT-5's capabilities will enable a new generation of AI-native applications across healthcare diagnostics, autonomous scientific research, and next-generation software development. The model is expected to generate over $3.2 billion in API revenue in its first year, cementing OpenAI's position as the dominant commercial AI lab.",
  aiModelExplained: {
    name: "GPT-5 (Generative Pre-trained Transformer 5)",
    architecture: "Sparse Mixture of Experts v3 (SMoE-3)",
    parameters: "~1.8 Trillion (active: ~180B per inference)",
    contextWindow: "10 Million Tokens",
    trainingData: "15T+ tokens (text, code, vision, audio)",
    capabilities: ["Advanced Reasoning", "Multimodal Processing", "Code Generation", "Long-Form Analysis", "Multi-Language Support"],
  },
};

const MOCK_RELATED = [
  {
    _id: "art_002",
    title: "Google DeepMind's Gemini Ultra 2 Responds: A Direct Comparison with GPT-5",
    coverImage: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&q=70",
    category: { name: "AI Competition", color: "#8b5cf6" },
    readingTime: 9,
    publishedAt: "2025-02-16T11:00:00Z",
    views: 142300,
  },
  {
    _id: "art_003",
    title: "The Business Case for GPT-5 Enterprise: ROI Analysis Across 12 Industries",
    coverImage: "https://images.unsplash.com/photo-1642132652803-c6a699203925?w=400&q=70",
    category: { name: "Enterprise AI", color: "#0ea5e9" },
    readingTime: 11,
    publishedAt: "2025-02-15T14:30:00Z",
    views: 98700,
  },
  {
    _id: "art_004",
    title: "AI Safety Researchers Sound Alarm Over GPT-5 Capability Jumps",
    coverImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&q=70",
    category: { name: "AI Safety", color: "#ef4444" },
    readingTime: 7,
    publishedAt: "2025-02-15T09:00:00Z",
    views: 203400,
  },
];

const MOCK_COMMENTS = [
  {
    _id: "cmt_001",
    user: { name: "Marcus Webb", avatar: "https://i.pravatar.cc/150?img=11" },
    content: "The 10M token context window is genuinely game-changing for legal tech. We've been waiting for this for years. The ability to feed an entire contract history into a single context is going to revolutionize due diligence workflows.",
    likes: 847,
    createdAt: "2025-02-14T11:45:00Z",
    isEdited: false,
  },
  {
    _id: "cmt_002",
    user: { name: "Priya Nair", avatar: "https://i.pravatar.cc/150?img=25" },
    content: "I'm cautiously optimistic. The capability improvements are undeniable, but I'd like to see more independent evaluation of the safety claims before drawing conclusions. OpenAI's self-reported safety metrics have historically been optimistic.",
    likes: 1204,
    createdAt: "2025-02-14T13:20:00Z",
    isEdited: false,
  },
  {
    _id: "cmt_003",
    user: { name: "Tom Eriksen", avatar: "https://i.pravatar.cc/150?img=67" },
    content: "The SMoE-3 architecture explanation is fascinating. The idea that only a subset of parameters activates per inference explains both the performance gains and the cost reduction simultaneously. Brilliant engineering.",
    likes: 623,
    createdAt: "2025-02-14T16:00:00Z",
    isEdited: true,
  },
];

// ─────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────
function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}
function formatTime(iso) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
}
function formatNumber(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n;
}
function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso)) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ─────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────

function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const scrolled = el.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      setProgress(total > 0 ? (scrolled / total) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="ai-news-detailed-page-progress-bar-wrap">
      <div className="ai-news-detailed-page-progress-bar-fill" style={{ width: `${progress}%` }} />
    </div>
  );
}

function BackToTopButton() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <button
      className={`ai-news-detailed-page-back-to-top ${visible ? "visible" : ""}`}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
    >
      <ArrowUp size={20} />
    </button>
  );
}

function ShareButtons({ title, isDark }) {
  const [copied, setCopied] = useState(false);
  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  const shareTwitter = () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(window.location.href)}`, "_blank");
  const shareLinkedIn = () => window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(title)}`, "_blank");
  const shareFacebook = () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, "_blank");
  return (
    <div className="ai-news-detailed-page-share-cluster">
      <span className="ai-news-detailed-page-share-label">Share</span>
      <button className="ai-news-detailed-page-share-btn twitter" onClick={shareTwitter} title="Share on Twitter"><Twitter size={16} /></button>
      <button className="ai-news-detailed-page-share-btn linkedin" onClick={shareLinkedIn} title="Share on LinkedIn"><Linkedin size={16} /></button>
      <button className="ai-news-detailed-page-share-btn facebook" onClick={shareFacebook} title="Share on Facebook"><Facebook size={16} /></button>
      <button className="ai-news-detailed-page-share-btn copy" onClick={copyLink} title="Copy link">
        {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
      </button>
    </div>
  );
}

function CommentSection({ isDark }) {
  const [comments, setComments] = useState(MOCK_COMMENTS);
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const textareaRef = useRef(null);

  const handleAdd = () => {
    if (!newComment.trim()) return;
    const comment = {
      _id: "cmt_" + Date.now(),
      user: { name: "You", avatar: "https://i.pravatar.cc/150?img=3" },
      content: newComment.trim(),
      likes: 0,
      createdAt: new Date().toISOString(),
      isEdited: false,
    };
    setComments([comment, ...comments]);
    setNewComment("");
  };

  const handleEdit = (id) => {
    const c = comments.find((c) => c._id === id);
    setEditingId(id);
    setEditText(c.content);
  };

  const handleEditSave = (id) => {
    setComments(comments.map((c) => c._id === id ? { ...c, content: editText, isEdited: true } : c));
    setEditingId(null);
  };

  const handleDelete = (id) => {
    if (Swal) {
      Swal.fire({
        title: "Delete comment?",
        text: "This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#64748b",
        confirmButtonText: "Delete",
        background: isDark ? "#0f172a" : "#ffffff",
        color: isDark ? "#f1f5f9" : "#0f172a",
      }).then((result) => {
        if (result.isConfirmed) setComments(comments.filter((c) => c._id !== id));
      });
    } else {
      if (window.confirm("Delete this comment?")) setComments(comments.filter((c) => c._id !== id));
    }
  };

  const handleLike = (id) => {
    setComments(comments.map((c) => c._id === id ? { ...c, likes: c.likes + 1 } : c));
  };

  return (
    <section className="ai-news-detailed-page-comments-section" id="comments">
      <h2 className="ai-news-detailed-page-section-heading">
        <MessageSquare size={22} />
        Discussion <span className="ai-news-detailed-page-comment-count">{comments.length}</span>
      </h2>

      <div className="ai-news-detailed-page-comment-compose">
        <div className="ai-news-detailed-page-compose-avatar">
          <img src="https://i.pravatar.cc/150?img=3" alt="You" />
        </div>
        <div className="ai-news-detailed-page-compose-right">
          <textarea
            ref={textareaRef}
            className="ai-news-detailed-page-compose-textarea"
            placeholder="Share your thoughts on this article…"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
          />
          <div className="ai-news-detailed-page-compose-actions">
            <span className="ai-news-detailed-page-compose-char">{newComment.length}/1000</span>
            <button className="ai-news-detailed-page-compose-submit" onClick={handleAdd} disabled={!newComment.trim()}>
              <Send size={15} /> Post Comment
            </button>
          </div>
        </div>
      </div>

      <div className="ai-news-detailed-page-comments-list">
        {comments.map((comment) => (
          <div key={comment._id} className="ai-news-detailed-page-comment-card">
            <img className="ai-news-detailed-page-comment-avatar" src={comment.user.avatar} alt={comment.user.name} />
            <div className="ai-news-detailed-page-comment-body">
              <div className="ai-news-detailed-page-comment-header">
                <span className="ai-news-detailed-page-comment-author">{comment.user.name}</span>
                {comment.isEdited && <span className="ai-news-detailed-page-comment-edited">edited</span>}
                <span className="ai-news-detailed-page-comment-time">{timeAgo(comment.createdAt)}</span>
                {comment.user.name === "You" && (
                  <div className="ai-news-detailed-page-comment-actions">
                    <button onClick={() => handleEdit(comment._id)} className="ai-news-detailed-page-comment-action-btn edit"><Edit2 size={13} /></button>
                    <button onClick={() => handleDelete(comment._id)} className="ai-news-detailed-page-comment-action-btn delete"><Trash2 size={13} /></button>
                  </div>
                )}
              </div>
              {editingId === comment._id ? (
                <div className="ai-news-detailed-page-comment-edit-wrap">
                  <textarea
                    className="ai-news-detailed-page-compose-textarea small"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={2}
                  />
                  <div className="ai-news-detailed-page-edit-btns">
                    <button className="ai-news-detailed-page-compose-submit small" onClick={() => handleEditSave(comment._id)}>Save</button>
                    <button className="ai-news-detailed-page-cancel-btn" onClick={() => setEditingId(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <p className="ai-news-detailed-page-comment-text">{comment.content}</p>
              )}
              <button className="ai-news-detailed-page-comment-like-btn" onClick={() => handleLike(comment._id)}>
                <ThumbsUp size={13} /> {formatNumber(comment.likes)}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function RelatedArticleCard({ article, isDark }) {
  return (
    <article className={`ai-news-detailed-page-related-card ${isDark ? "dark" : "light"}`}>
      <div className="ai-news-detailed-page-related-img-wrap">
        <img src={article.coverImage} alt={article.title} className="ai-news-detailed-page-related-img" />
        <span className="ai-news-detailed-page-related-category" style={{ background: article.category.color + "22", color: article.category.color }}>
          {article.category.name}
        </span>
      </div>
      <div className="ai-news-detailed-page-related-info">
        <h4 className="ai-news-detailed-page-related-title">{article.title}</h4>
        <div className="ai-news-detailed-page-related-meta">
          <span><Clock size={12} /> {article.readingTime} min read</span>
          <span><Eye size={12} /> {formatNumber(article.views)}</span>
        </div>
      </div>
    </article>
  );
}

// ─────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────
const SingleNewsPage = () => {
  // const { isDarkMode } = useContext(ThemeContext);
  const [isDarkMode, setIsDarkMode] = useState(true); // default dark

  const [article] = useState(MOCK_ARTICLE);
  const [relatedArticles] = useState(MOCK_RELATED);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(MOCK_ARTICLE.likes);
  const [bookmarkCount, setBookmarkCount] = useState(MOCK_ARTICLE.bookmarks);
  const [aiSummaryOpen, setAiSummaryOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Update document meta
  useEffect(() => {
    document.title = `${article.title} | News AI`;
    let desc = document.querySelector('meta[name="description"]');
    if (!desc) { desc = document.createElement("meta"); desc.name = "description"; document.head.appendChild(desc); }
    desc.content = article.aiSummary?.slice(0, 160) || "";
  }, [article]);

  const handleLike = useCallback(() => {
    setIsLiked((prev) => {
      setLikeCount((c) => prev ? c - 1 : c + 1);
      return !prev;
    });
  }, []);

  const handleBookmark = useCallback(() => {
    setIsBookmarked((prev) => {
      setBookmarkCount((c) => prev ? c - 1 : c + 1);
      if (Swal) {
        Swal.fire({
          toast: true, position: "top-end", icon: prev ? "info" : "success",
          title: prev ? "Bookmark removed" : "Article bookmarked!",
          showConfirmButton: false, timer: 2000,
          background: isDarkMode ? "#0f172a" : "#ffffff",
          color: isDarkMode ? "#f1f5f9" : "#0f172a",
        });
      }
      return !prev;
    });
  }, [isDarkMode]);

  const handleReport = () => {
    if (Swal) {
      Swal.fire({
        title: "Report Article",
        input: "select",
        inputOptions: {
          misinformation: "Misinformation / Inaccurate",
          spam: "Spam or Promotional",
          inappropriate: "Inappropriate Content",
          copyright: "Copyright Violation",
          other: "Other",
        },
        inputPlaceholder: "Select a reason",
        showCancelButton: true,
        confirmButtonText: "Submit Report",
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#64748b",
        background: isDarkMode ? "#0f172a" : "#ffffff",
        color: isDarkMode ? "#f1f5f9" : "#0f172a",
        inputValidator: (value) => !value && "Please select a reason",
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            title: "Report Submitted",
            text: "Thank you. Our team will review this article.",
            icon: "success",
            background: isDarkMode ? "#0f172a" : "#ffffff",
            color: isDarkMode ? "#f1f5f9" : "#0f172a",
          });
        }
      });
    }
  };

  return (
    <div className={`ai-news-detailed-page-root ${isDarkMode ? "dark" : "light"}`}>
      <ReadingProgressBar />

      {/* ── TOP NAVBAR STRIP ── */}
      <div className="ai-news-detailed-page-topbar">
        <button className="ai-news-detailed-page-back-btn" onClick={() => window.history.back()}>
          <ArrowLeft size={16} /> Back
        </button>
        <div className="ai-news-detailed-page-topbar-logo">
          <Brain size={20} /> <span>News<strong>AI</strong></span>
        </div>
        <div className="ai-news-detailed-page-topbar-right">
          <button
            className="ai-news-detailed-page-theme-toggle"
            onClick={() => setIsDarkMode((d) => !d)}
            title="Toggle theme"
          >
            {isDarkMode ? "☀️" : "🌙"}
          </button>
        </div>
      </div>

      {/* ── HERO ── */}
      <header className="ai-news-detailed-page-hero">
        <div className="ai-news-detailed-page-hero-bg" style={{ backgroundImage: `url(${article.coverImage})` }} />
        <div className="ai-news-detailed-page-hero-overlay" />
        <div className="ai-news-detailed-page-hero-content">
          <div className="ai-news-detailed-page-hero-meta-row">
            <span className="ai-news-detailed-page-category-badge" style={{ background: article.category.color + "33", color: article.category.color, borderColor: article.category.color + "55" }}>
              {article.category.name}
            </span>
            <span className="ai-news-detailed-page-badge-pill ai-badge">
              {article.isAIGenerated ? <><Cpu size={12} /> AI Generated</> : <><CheckCircle size={12} /> Human Curated</>}
            </span>
            <span className="ai-news-detailed-page-reading-time"><Clock size={13} /> {article.readingTime} min read</span>
          </div>
          <h1 className="ai-news-detailed-page-headline">{article.title}</h1>
          <p className="ai-news-detailed-page-subheadline">{article.subHeadline}</p>
          <div className="ai-news-detailed-page-author-row">
            <img className="ai-news-detailed-page-author-avatar" src={article.author.avatar} alt={article.author.name} />
            <div className="ai-news-detailed-page-author-info">
              <span className="ai-news-detailed-page-author-name">{article.author.name}</span>
              <span className="ai-news-detailed-page-author-title">{article.author.title}</span>
            </div>
            <div className="ai-news-detailed-page-date-cluster">
              <span><Calendar size={13} /> {formatDate(article.publishedAt)} at {formatTime(article.publishedAt)}</span>
              <span><RefreshCw size={12} /> Updated {formatDate(article.updatedAt)}</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── ENGAGEMENT BAR ── */}
      <div className="ai-news-detailed-page-engagement-bar">
        <div className="ai-news-detailed-page-engagement-stats">
          <span className="ai-news-detailed-page-stat"><Eye size={15} /> {formatNumber(article.views)} views</span>
          <span className="ai-news-detailed-page-stat"><Heart size={15} /> {formatNumber(likeCount)}</span>
          <span className="ai-news-detailed-page-stat"><Share2 size={15} /> {formatNumber(article.shares)}</span>
          <span className="ai-news-detailed-page-stat"><BookmarkPlus size={15} /> {formatNumber(bookmarkCount)}</span>
          <span className="ai-news-detailed-page-stat engagement-score"><Zap size={14} /> {article.engagementScore}% engagement</span>
        </div>
        <div className="ai-news-detailed-page-action-cluster">
          <button className={`ai-news-detailed-page-action-btn like-btn ${isLiked ? "active" : ""}`} onClick={handleLike}>
            <Heart size={16} fill={isLiked ? "currentColor" : "none"} /> {isLiked ? "Liked" : "Like"}
          </button>
          <button className={`ai-news-detailed-page-action-btn bookmark-btn ${isBookmarked ? "active" : ""}`} onClick={handleBookmark}>
            {isBookmarked ? <BookmarkCheck size={16} /> : <BookmarkPlus size={16} />} {isBookmarked ? "Saved" : "Save"}
          </button>
          <button className="ai-news-detailed-page-action-btn report-btn" onClick={handleReport}>
            <Flag size={14} /> Report
          </button>
        </div>
      </div>

      {/* ── MAIN LAYOUT ── */}
      <main className="ai-news-detailed-page-main-layout">

        {/* ── CONTENT COLUMN ── */}
        <div className="ai-news-detailed-page-content-col">

          {/* Source */}
          {article.source && (
            <div className="ai-news-detailed-page-source-strip">
              <Globe size={14} /> Source:&nbsp;
              <a href={article.source.url} target="_blank" rel="noopener noreferrer" className="ai-news-detailed-page-source-link">
                {article.source.name} <ExternalLink size={12} />
              </a>
            </div>
          )}

          {/* AI Summary */}
          <div className="ai-news-detailed-page-ai-summary-card">
            <button className="ai-news-detailed-page-ai-summary-toggle" onClick={() => setAiSummaryOpen((o) => !o)}>
              <div className="ai-news-detailed-page-ai-summary-title">
                <Brain size={18} />
                <span>AI Summary</span>
                <span className="ai-news-detailed-page-ai-badge-inline">Powered by NewsAI</span>
              </div>
              {aiSummaryOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {aiSummaryOpen && (
              <div className="ai-news-detailed-page-ai-summary-body">
                <p>{article.aiSummary}</p>
              </div>
            )}
          </div>

          {/* Key Highlights */}
          <section className="ai-news-detailed-page-highlights-section">
            <h2 className="ai-news-detailed-page-section-heading"><Star size={20} /> Key Highlights</h2>
            <ul className="ai-news-detailed-page-highlights-list">
              {article.keyHighlights.map((h, i) => (
                <li key={i} className="ai-news-detailed-page-highlight-item">
                  <span className="ai-news-detailed-page-highlight-bullet" />
                  {h}
                </li>
              ))}
            </ul>
          </section>

          {/* Article Body */}
          <article
            className="ai-news-detailed-page-article-body"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* AI Model Explained */}
          {article.aiModelExplained && (
            <section className="ai-news-detailed-page-model-section">
              <h2 className="ai-news-detailed-page-section-heading"><Cpu size={20} /> Model Explained: {article.aiModelExplained.name}</h2>
              <div className="ai-news-detailed-page-model-grid">
                {Object.entries(article.aiModelExplained).map(([key, val]) => {
                  if (key === "name" || key === "capabilities") return null;
                  return (
                    <div key={key} className="ai-news-detailed-page-model-stat">
                      <span className="ai-news-detailed-page-model-stat-label">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                      <span className="ai-news-detailed-page-model-stat-val">{val}</span>
                    </div>
                  );
                })}
              </div>
              <div className="ai-news-detailed-page-model-caps">
                {article.aiModelExplained.capabilities.map((cap) => (
                  <span key={cap} className="ai-news-detailed-page-model-cap-tag">{cap}</span>
                ))}
              </div>
            </section>
          )}

          {/* Expert Commentary */}
          <section className="ai-news-detailed-page-experts-section">
            <h2 className="ai-news-detailed-page-section-heading"><User size={20} /> Expert Commentary</h2>
            <div className="ai-news-detailed-page-experts-grid">
              {article.expertCommentary.map((expert, i) => (
                <div key={i} className="ai-news-detailed-page-expert-card">
                  <div className="ai-news-detailed-page-expert-top">
                    <img className="ai-news-detailed-page-expert-avatar" src={expert.avatar} alt={expert.name} />
                    <div>
                      <div className="ai-news-detailed-page-expert-name">{expert.name}</div>
                      <div className="ai-news-detailed-page-expert-title">{expert.title}</div>
                    </div>
                  </div>
                  <blockquote className="ai-news-detailed-page-expert-quote">"{expert.quote}"</blockquote>
                </div>
              ))}
            </div>
          </section>

          {/* Market Trend */}
          <section className="ai-news-detailed-page-market-section">
            <h2 className="ai-news-detailed-page-section-heading"><TrendingUp size={20} /> Market Trend Analysis</h2>
            <p className="ai-news-detailed-page-market-desc">{article.marketTrend.description}</p>
            <div className="ai-news-detailed-page-market-grid">
              {article.marketTrend.dataPoints.map((dp, i) => (
                <div key={i} className="ai-news-detailed-page-market-card">
                  <div className="ai-news-detailed-page-market-val">{dp.value}</div>
                  <div className="ai-news-detailed-page-market-label">{dp.label}</div>
                  <div className={`ai-news-detailed-page-market-change ${dp.change.startsWith("+") ? "positive" : "negative"}`}>{dp.change}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Ethical Considerations */}
          <section className="ai-news-detailed-page-ethics-section">
            <h2 className="ai-news-detailed-page-section-heading"><Shield size={20} /> Ethical Considerations</h2>
            <div className="ai-news-detailed-page-ethics-grid">
              {article.ethicalConsiderations.map((ec, i) => (
                <div key={i} className="ai-news-detailed-page-ethics-card">
                  <div className="ai-news-detailed-page-ethics-icon"><AlertCircle size={18} /></div>
                  <h3 className="ai-news-detailed-page-ethics-title">{ec.title}</h3>
                  <p className="ai-news-detailed-page-ethics-desc">{ec.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Future Outlook */}
          <section className="ai-news-detailed-page-outlook-section">
            <h2 className="ai-news-detailed-page-section-heading"><Telescope size={20} /> Future Outlook</h2>
            <div className="ai-news-detailed-page-outlook-card">
              <div className="ai-news-detailed-page-outlook-glow" />
              <p className="ai-news-detailed-page-outlook-text">{article.futureOutlook}</p>
            </div>
          </section>

          {/* Author Bio */}
          <section className="ai-news-detailed-page-author-bio-section">
            <div className="ai-news-detailed-page-author-bio-card">
              <img className="ai-news-detailed-page-author-bio-avatar" src={article.author.avatar} alt={article.author.name} />
              <div className="ai-news-detailed-page-author-bio-info">
                <span className="ai-news-detailed-page-author-bio-label">Written by</span>
                <h3 className="ai-news-detailed-page-author-bio-name">{article.author.name}</h3>
                <span className="ai-news-detailed-page-author-bio-role">{article.author.title}</span>
                <p className="ai-news-detailed-page-author-bio-text">{article.author.bio}</p>
              </div>
            </div>
          </section>

          {/* Tags */}
          <div className="ai-news-detailed-page-tags-section">
            <Tag size={15} />
            {article.tags.map((tag) => (
              <span key={tag} className="ai-news-detailed-page-tag">{tag}</span>
            ))}
          </div>

          {/* Bottom Share */}
          <div className="ai-news-detailed-page-bottom-share">
            <ShareButtons title={article.title} isDark={isDarkMode} />
          </div>

          {/* Comments */}
          <CommentSection isDark={isDarkMode} />
        </div>

        {/* ── SIDEBAR ── */}
        <aside className="ai-news-detailed-page-sidebar">
          <div className="ai-news-detailed-page-sidebar-sticky">

            {/* Quick Stats */}
            <div className="ai-news-detailed-page-sidebar-card">
              <h3 className="ai-news-detailed-page-sidebar-heading"><BarChart2 size={16} /> Quick Stats</h3>
              <div className="ai-news-detailed-page-sidebar-stats">
                <div className="ai-news-detailed-page-sidebar-stat"><Eye size={14} /><span>{formatNumber(article.views)}</span><small>Views</small></div>
                <div className="ai-news-detailed-page-sidebar-stat"><Heart size={14} /><span>{formatNumber(likeCount)}</span><small>Likes</small></div>
                <div className="ai-news-detailed-page-sidebar-stat"><Share2 size={14} /><span>{formatNumber(article.shares)}</span><small>Shares</small></div>
                <div className="ai-news-detailed-page-sidebar-stat"><BookmarkPlus size={14} /><span>{formatNumber(bookmarkCount)}</span><small>Saves</small></div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="ai-news-detailed-page-sidebar-card">
              <h3 className="ai-news-detailed-page-sidebar-heading"><Zap size={16} /> Quick Actions</h3>
              <button className={`ai-news-detailed-page-sidebar-action-btn ${isLiked ? "active-like" : ""}`} onClick={handleLike}>
                <Heart size={15} fill={isLiked ? "currentColor" : "none"} /> {isLiked ? "Unlike" : "Like Article"}
              </button>
              <button className={`ai-news-detailed-page-sidebar-action-btn ${isBookmarked ? "active-bookmark" : ""}`} onClick={handleBookmark}>
                {isBookmarked ? <BookmarkCheck size={15} /> : <BookmarkPlus size={15} />}
                {isBookmarked ? "Bookmarked" : "Bookmark"}
              </button>
              <button className="ai-news-detailed-page-sidebar-action-btn report" onClick={handleReport}>
                <Flag size={14} /> Report Article
              </button>
            </div>

            {/* Share */}
            <div className="ai-news-detailed-page-sidebar-card">
              <h3 className="ai-news-detailed-page-sidebar-heading"><Share2 size={16} /> Share Article</h3>
              <ShareButtons title={article.title} isDark={isDarkMode} />
            </div>

            {/* Related Articles */}
            <div className="ai-news-detailed-page-sidebar-card related">
              <h3 className="ai-news-detailed-page-sidebar-heading"><Lightbulb size={16} /> Related Articles</h3>
              <div className="ai-news-detailed-page-related-list">
                {relatedArticles.map((rel) => (
                  <RelatedArticleCard key={rel._id} article={rel} isDark={isDarkMode} />
                ))}
              </div>
            </div>
          </div>
        </aside>
      </main>

      <BackToTopButton />
    </div>
  );
};

export default SingleNewsPage;