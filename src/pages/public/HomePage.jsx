import { useState, useEffect, useContext, useRef } from "react";
import {
  Brain,
  Zap,
  TrendingUp,
  Rocket,
  Eye,
  Heart,
  BookmarkPlus,
  Share2,
  Clock,
  ChevronRight,
  Sparkles,
  Cpu,
  Bot,
  Network,
  Globe,
  Shield,
  Microscope,
  BarChart3,
  Code2,
  Users,
  Mail,
  Twitter,
  Linkedin,
  Github,
  ArrowUp,
  Menu,
  X,
  Play,
  ChevronDown,
  Flame,
  Award,
  Target,
  Activity,
} from "lucide-react";

// ── MOCK DATA ──────────────────────────────────────────────────────────

const MOCK_HERO_ARTICLE = {
  _id: "hero_001",
  title:
    "OpenAI Unveils GPT-5: The Largest Leap in AI Reasoning Since Transformer Architecture",
  excerpt:
    "Revolutionary multimodal capabilities, 10M token context window, and breakthrough performance on reasoning benchmarks signal a new era in artificial general intelligence.",
  coverImage:
    "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1600&q=85",
  category: { name: "Large Language Models", slug: "llm", color: "#6366f1" },
  readingTime: 12,
  publishedAt: "2025-02-18T08:00:00Z",
  slug: "openai-gpt5-release",
};

const MOCK_BREAKING_NEWS = [
  {
    _id: "br1",
    title: "Google announces Gemini Ultra 2.0 with native video understanding",
    publishedAt: "2025-02-18T07:30:00Z",
    category: "LLMs",
  },
  {
    _id: "br2",
    title: "Microsoft invests $12B in AI chip manufacturing partnership",
    publishedAt: "2025-02-18T06:15:00Z",
    category: "Hardware",
  },
  {
    _id: "br3",
    title: "EU passes comprehensive AI regulation framework",
    publishedAt: "2025-02-18T05:00:00Z",
    category: "Policy",
  },
  {
    _id: "br4",
    title: "Tesla reveals Optimus Gen 3 with advanced manipulation skills",
    publishedAt: "2025-02-18T04:30:00Z",
    category: "Robotics",
  },
  {
    _id: "br5",
    title: "DeepMind achieves breakthrough in protein folding prediction",
    publishedAt: "2025-02-18T03:00:00Z",
    category: "Research",
  },
];

const MOCK_TRENDING = [
  {
    _id: "t1",
    title:
      "The AI Winter That Never Came: Inside 2025's $250B Investment Surge",
    excerpt:
      "Venture capital firms pour record-breaking funding into AI startups as enterprise adoption accelerates beyond all predictions.",
    coverImage:
      "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80",
    category: { name: "AI Investment", color: "#10b981" },
    author: { name: "Sarah Chen", avatar: "https://i.pravatar.cc/150?img=25" },
    publishedAt: "2025-02-17T14:00:00Z",
    views: 128500,
    likes: 8420,
    readingTime: 8,
    isAIGenerated: false,
    engagementScore: 94.2,
  },
  {
    _id: "t2",
    title:
      "How Anthropic's Constitutional AI Framework Is Reshaping Safety Standards",
    excerpt:
      "Claude's safety architecture becomes industry blueprint as competitors rush to implement similar alignment techniques.",
    coverImage:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80",
    category: { name: "AI Safety", color: "#ef4444" },
    author: { name: "Marcus Webb", avatar: "https://i.pravatar.cc/150?img=11" },
    publishedAt: "2025-02-17T11:30:00Z",
    views: 94300,
    likes: 5210,
    readingTime: 10,
    isAIGenerated: false,
    engagementScore: 91.8,
  },
  {
    _id: "t3",
    title:
      "NVIDIA H200 Benchmarks: Real-World Performance Analysis Across Enterprise Workloads",
    excerpt:
      "Independent testing reveals H200 delivers 45% improvement over H100 in LLM inference and 62% gains in training throughput.",
    coverImage:
      "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&q=80",
    category: { name: "AI Hardware", color: "#f59e0b" },
    author: {
      name: "Dr. Priya Nair",
      avatar: "https://i.pravatar.cc/150?img=32",
    },
    publishedAt: "2025-02-17T09:00:00Z",
    views: 76800,
    likes: 4320,
    readingTime: 15,
    isAIGenerated: false,
    engagementScore: 88.4,
  },
  {
    _id: "t4",
    title:
      "Inside Runway's Gen-3: The Multimodal AI Redefining Creative Workflows",
    excerpt:
      "Text-to-video capabilities reach new heights with 16-second clips, motion control, and director-level consistency.",
    coverImage:
      "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80",
    category: { name: "Generative AI", color: "#8b5cf6" },
    author: { name: "Alex Rivera", avatar: "https://i.pravatar.cc/150?img=67" },
    publishedAt: "2025-02-16T16:00:00Z",
    views: 103200,
    likes: 7840,
    readingTime: 7,
    isAIGenerated: false,
    engagementScore: 92.6,
  },
  {
    _id: "t5",
    title: "The AGI Timeline Debate: Why 2027 Is Now the Consensus Estimate",
    excerpt:
      "Leading AI researchers converge on narrow timeline as scaling laws continue to hold and new architectures emerge.",
    coverImage:
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
    category: { name: "AGI Research", color: "#06b6d4" },
    author: {
      name: "Dr. James Morton",
      avatar: "https://i.pravatar.cc/150?img=52",
    },
    publishedAt: "2025-02-16T13:00:00Z",
    views: 142600,
    likes: 12340,
    readingTime: 18,
    isAIGenerated: false,
    engagementScore: 96.8,
  },
  {
    _id: "t6",
    title:
      "AI-Powered Drug Discovery: Insilico Medicine Achieves Phase 2 Clinical Success",
    excerpt:
      "First AI-designed molecule to reach Phase 2 trials marks watershed moment for computational biology and pharmaceutical research.",
    coverImage:
      "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&q=80",
    category: { name: "AI Healthcare", color: "#ec4899" },
    author: {
      name: "Dr. Emily Zhao",
      avatar: "https://i.pravatar.cc/150?img=47",
    },
    publishedAt: "2025-02-16T10:00:00Z",
    views: 68900,
    likes: 3920,
    readingTime: 12,
    isAIGenerated: false,
    engagementScore: 87.2,
  },
];

const MOCK_FEATURED = {
  _id: "feat_001",
  title:
    "The Great AI Compute Wars: How the Battle for GPU Dominance Will Shape the Next Decade",
  excerpt:
    "As demand for AI compute outpaces supply by 10x, a new arms race emerges among hyperscalers, startups, and nation-states.",
  preview:
    "In the basement of a nondescript office building in Santa Clara, a quiet revolution is unfolding. Engineers cluster around racks of experimental silicon, monitoring power consumption and thermal output with the intensity of mission control during a rocket launch. They're testing prototypes that could determine whether their company survives the most consequential technological shift since the invention of the internet...",
  coverImage:
    "https://images.unsplash.com/photo-1639322537228-f710d846310a?w=1400&q=85",
  category: { name: "Deep Dive Analysis", color: "#3b82f6" },
  author: { name: "Michael Zhang", avatar: "https://i.pravatar.cc/150?img=61" },
  publishedAt: "2025-02-15T08:00:00Z",
  readingTime: 24,
  slug: "ai-compute-wars-analysis",
};

const MOCK_CATEGORIES = [
  {
    name: "Machine Learning",
    icon: "Brain",
    count: 342,
    slug: "machine-learning",
    color: "#6366f1",
  },
  {
    name: "Generative AI",
    icon: "Sparkles",
    count: 287,
    slug: "generative-ai",
    color: "#8b5cf6",
  },
  {
    name: "Robotics",
    icon: "Bot",
    count: 156,
    slug: "robotics",
    color: "#f59e0b",
  },
  {
    name: "AI Startups",
    icon: "Rocket",
    count: 423,
    slug: "startups",
    color: "#10b981",
  },
  {
    name: "AI Policy",
    icon: "Shield",
    count: 198,
    slug: "policy",
    color: "#ef4444",
  },
  {
    name: "AI Ethics",
    icon: "Users",
    count: 134,
    slug: "ethics",
    color: "#ec4899",
  },
  {
    name: "AI Hardware",
    icon: "Cpu",
    count: 245,
    slug: "hardware",
    color: "#f97316",
  },
  {
    name: "Computer Vision",
    icon: "Eye",
    count: 167,
    slug: "computer-vision",
    color: "#06b6d4",
  },
  { name: "NLP", icon: "Network", count: 289, slug: "nlp", color: "#3b82f6" },
];

const MOCK_AI_MODELS = [
  {
    name: "GPT-5",
    company: "OpenAI",
    description:
      "10M token context, multimodal reasoning, constitutional alignment",
    useCase:
      "Enterprise knowledge management, code generation, research synthesis",
    logo: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=400&q=80",
  },
  {
    name: "Gemini Ultra 2.0",
    company: "Google DeepMind",
    description:
      "Native video understanding, real-time web integration, 2M context",
    useCase: "Video analysis, search augmentation, multimodal applications",
    logo: "https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=400&q=80",
  },
  {
    name: "Claude Opus 4",
    company: "Anthropic",
    description:
      "Constitutional AI, extended thinking, harmlessness guarantees",
    useCase: "Sensitive applications, healthcare, legal research",
    logo: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&q=80",
  },
];

const MOCK_MOST_READ = [
  {
    rank: 1,
    title: "The Hidden Cost of Training Frontier AI Models",
    views: 284700,
    engagement: 98.4,
    readingTime: 14,
  },
  {
    rank: 2,
    title: "Why Microsoft's $13B OpenAI Investment Was a Bargain",
    views: 267300,
    engagement: 96.2,
    readingTime: 11,
  },
  {
    rank: 3,
    title: "Inside the Race to Build Open-Source LLMs That Match GPT-4",
    views: 245800,
    engagement: 94.8,
    readingTime: 16,
  },
  {
    rank: 4,
    title: "AI Chips Explained: A Technical Deep Dive",
    views: 198400,
    engagement: 92.1,
    readingTime: 22,
  },
  {
    rank: 5,
    title: "The Quiet Death of AI Hype: What Comes Next",
    views: 176200,
    engagement: 89.7,
    readingTime: 9,
  },
];

const AI_KEYWORDS = [
  "GPT-5",
  "AGI",
  "Transformers",
  "Neural Networks",
  "Deep Learning",
  "LLMs",
  "NVIDIA",
  "OpenAI",
  "Robotics",
  "AI Safety",
  "Alignment",
  "Constitutional AI",
  "Multimodal",
  "Diffusion Models",
  "Reasoning",
];

// ── UTILITY FUNCTIONS ──────────────────────────────────────────────────

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso)) / 1000;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function formatNumber(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n;
}

// ── COMPONENTS ─────────────────────────────────────────────────────────

function Header({ isDark, onThemeToggle }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`ai-news-homepage-header ${scrolled ? "scrolled" : ""}`}>
      <div className="ai-news-homepage-header-container">
        <div className="ai-news-homepage-logo-group">
          <Brain size={28} className="ai-news-homepage-logo-icon" />
          <div className="ai-news-homepage-logo-text">
            <span className="ai-news-homepage-logo-primary">News</span>
            <span className="ai-news-homepage-logo-accent">AI</span>
          </div>
        </div>

        <nav className="ai-news-homepage-nav-desktop">
          <a href="#trending" className="ai-news-homepage-nav-link">
            Trending
          </a>
          <a href="#categories" className="ai-news-homepage-nav-link">
            Categories
          </a>
          <a href="#models" className="ai-news-homepage-nav-link">
            AI Models
          </a>
          <a href="#newsletter" className="ai-news-homepage-nav-link">
            Newsletter
          </a>
        </nav>

        <div className="ai-news-homepage-header-actions">
          <button
            onClick={onThemeToggle}
            className="ai-news-homepage-theme-btn"
            title="Toggle theme"
          >
            {isDark ? "☀️" : "🌙"}
          </button>
          <button
            className="ai-news-homepage-mobile-menu-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="ai-news-homepage-nav-mobile">
          <a
            href="#trending"
            className="ai-news-homepage-nav-mobile-link"
            onClick={() => setMobileOpen(false)}
          >
            Trending
          </a>
          <a
            href="#categories"
            className="ai-news-homepage-nav-mobile-link"
            onClick={() => setMobileOpen(false)}
          >
            Categories
          </a>
          <a
            href="#models"
            className="ai-news-homepage-nav-mobile-link"
            onClick={() => setMobileOpen(false)}
          >
            AI Models
          </a>
          <a
            href="#newsletter"
            className="ai-news-homepage-nav-mobile-link"
            onClick={() => setMobileOpen(false)}
          >
            Newsletter
          </a>
        </nav>
      )}
    </header>
  );
}

function HeroSection() {
  const [keywordIndex, setKeywordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setKeywordIndex((prev) => (prev + 1) % AI_KEYWORDS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="ai-news-homepage-hero">
      <div
        className="ai-news-homepage-hero-bg"
        style={{ backgroundImage: `url(${MOCK_HERO_ARTICLE.coverImage})` }}
      />
      <div className="ai-news-homepage-hero-overlay" />
      <div className="ai-news-homepage-hero-grid-pattern" />

      <div className="ai-news-homepage-hero-content">
        <div className="ai-news-homepage-hero-badge">
          <Flame size={14} />
          <span>Breaking AI News</span>
        </div>

        <h1 className="ai-news-homepage-hero-headline">
          {MOCK_HERO_ARTICLE.title}
        </h1>
        <p className="ai-news-homepage-hero-excerpt">
          {MOCK_HERO_ARTICLE.excerpt}
        </p>

        <div className="ai-news-homepage-hero-meta">
          <span
            className="ai-news-homepage-hero-cat"
            style={{
              background: `${MOCK_HERO_ARTICLE.category.color}22`,
              color: MOCK_HERO_ARTICLE.category.color,
            }}
          >
            {MOCK_HERO_ARTICLE.category.name}
          </span>
          <span className="ai-news-homepage-hero-time">
            <Clock size={14} /> {MOCK_HERO_ARTICLE.readingTime} min read
          </span>
          <span className="ai-news-homepage-hero-published">
            {timeAgo(MOCK_HERO_ARTICLE.publishedAt)}
          </span>
        </div>

        <div className="ai-news-homepage-hero-actions">
          <button className="ai-news-homepage-hero-btn-primary">
            <span>Read Full Story</span>
            <ChevronRight size={18} />
          </button>
          <button className="ai-news-homepage-hero-btn-secondary">
            <Sparkles size={16} />
            <span>Explore AI News</span>
          </button>
        </div>

        <div className="ai-news-homepage-hero-tagline">
          <Zap size={16} />
          <span>Where Artificial Intelligence Meets Journalism</span>
        </div>
      </div>

      <div className="ai-news-homepage-hero-ticker">
        <div className="ai-news-homepage-ticker-content">
          {AI_KEYWORDS.map((keyword, i) => (
            <span key={i} className="ai-news-homepage-ticker-item">
              {keyword}
            </span>
          ))}
          {AI_KEYWORDS.map((keyword, i) => (
            <span key={`dup-${i}`} className="ai-news-homepage-ticker-item">
              {keyword}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function BreakingNewsStrip() {
  const scrollRef = useRef(null);

  return (
    <div className="ai-news-homepage-breaking">
      <div className="ai-news-homepage-breaking-label">
        <Activity size={16} />
        <span>Live Updates</span>
      </div>
      <div className="ai-news-homepage-breaking-scroll" ref={scrollRef}>
        <div className="ai-news-homepage-breaking-content">
          {MOCK_BREAKING_NEWS.map((item) => (
            <div key={item._id} className="ai-news-homepage-breaking-item">
              <span className="ai-news-homepage-breaking-cat">
                {item.category}
              </span>
              <span className="ai-news-homepage-breaking-title">
                {item.title}
              </span>
              <span className="ai-news-homepage-breaking-time">
                {timeAgo(item.publishedAt)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TrendingCard({ article }) {
  return (
    <article className="ai-news-homepage-trending-card">
      <div className="ai-news-homepage-card-img-wrap">
        <img
          src={article.coverImage}
          alt={article.title}
          className="ai-news-homepage-card-img"
        />
        <div className="ai-news-homepage-card-overlay-gradient" />
        <span
          className="ai-news-homepage-card-cat"
          style={{
            background: `${article.category.color}22`,
            color: article.category.color,
            borderColor: `${article.category.color}55`,
          }}
        >
          {article.category.name}
        </span>
        {!article.isAIGenerated && (
          <span className="ai-news-homepage-card-human-badge">
            <Award size={11} /> Human
          </span>
        )}
      </div>
      <div className="ai-news-homepage-card-content">
        <h3 className="ai-news-homepage-card-title">{article.title}</h3>
        <p className="ai-news-homepage-card-excerpt">{article.excerpt}</p>

        <div className="ai-news-homepage-card-footer">
          <div className="ai-news-homepage-card-author">
            <img
              src={article.author.avatar}
              alt={article.author.name}
              className="ai-news-homepage-card-author-img"
            />
            <div>
              <div className="ai-news-homepage-card-author-name">
                {article.author.name}
              </div>
              <div className="ai-news-homepage-card-meta-row">
                <span>{timeAgo(article.publishedAt)}</span>
                <span>•</span>
                <span>{article.readingTime} min</span>
              </div>
            </div>
          </div>

          <div className="ai-news-homepage-card-stats">
            <span>
              <Eye size={13} /> {formatNumber(article.views)}
            </span>
            <span>
              <Heart size={13} /> {formatNumber(article.likes)}
            </span>
            <span className="ai-news-homepage-card-engagement">
              ⚡ {article.engagementScore}%
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

function FeaturedDeepDive() {
  return (
    <section className="ai-news-homepage-featured" id="featured">
      <div className="ai-news-homepage-section-header">
        <div>
          <h2 className="ai-news-homepage-section-title">
            <Target size={24} />
            <span>Featured Deep Dive</span>
          </h2>
          <p className="ai-news-homepage-section-subtitle">
            Premium editorial analysis
          </p>
        </div>
      </div>

      <article className="ai-news-homepage-featured-card">
        <div className="ai-news-homepage-featured-img-wrap">
          <img
            src={MOCK_FEATURED.coverImage}
            alt={MOCK_FEATURED.title}
            className="ai-news-homepage-featured-img"
          />
          <div className="ai-news-homepage-featured-overlay" />
        </div>

        <div className="ai-news-homepage-featured-content">
          <div className="ai-news-homepage-featured-badges">
            <span
              className="ai-news-homepage-featured-badge"
              style={{
                background: `${MOCK_FEATURED.category.color}18`,
                color: MOCK_FEATURED.category.color,
              }}
            >
              <Microscope size={14} />
              {MOCK_FEATURED.category.name}
            </span>
            <span className="ai-news-homepage-featured-time">
              <Clock size={13} /> {MOCK_FEATURED.readingTime} min read
            </span>
          </div>

          <h3 className="ai-news-homepage-featured-title">
            {MOCK_FEATURED.title}
          </h3>
          <p className="ai-news-homepage-featured-excerpt">
            {MOCK_FEATURED.excerpt}
          </p>
          <p className="ai-news-homepage-featured-preview">
            {MOCK_FEATURED.preview}
          </p>

          <div className="ai-news-homepage-featured-footer">
            <div className="ai-news-homepage-featured-author">
              <img
                src={MOCK_FEATURED.author.avatar}
                alt={MOCK_FEATURED.author.name}
              />
              <div>
                <div className="ai-news-homepage-featured-author-name">
                  {MOCK_FEATURED.author.name}
                </div>
                <div className="ai-news-homepage-featured-author-meta">
                  {timeAgo(MOCK_FEATURED.publishedAt)}
                </div>
              </div>
            </div>

            <button className="ai-news-homepage-featured-btn">
              <span>Read Analysis</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </article>
    </section>
  );
}

function CategoriesGrid() {
  const iconMap = {
    Brain,
    Sparkles,
    Bot,
    Rocket,
    Shield,
    Users,
    Cpu,
    Eye,
    Network,
  };

  return (
    <section className="ai-news-homepage-categories" id="categories">
      <div className="ai-news-homepage-section-header">
        <div>
          <h2 className="ai-news-homepage-section-title">
            <Globe size={24} />
            <span>Explore AI Categories</span>
          </h2>
          <p className="ai-news-homepage-section-subtitle">
            Navigate the AI landscape
          </p>
        </div>
      </div>

      <div className="ai-news-homepage-categories-grid">
        {MOCK_CATEGORIES.map((cat) => {
          const Icon = iconMap[cat.icon] || Brain;
          return (
            <div
              key={cat.slug}
              className="ai-news-homepage-cat-card"
              style={{ "--cat-color": cat.color }}
            >
              <div className="ai-news-homepage-cat-icon">
                <Icon size={24} />
              </div>
              <h3 className="ai-news-homepage-cat-name">{cat.name}</h3>
              <p className="ai-news-homepage-cat-count">{cat.count} articles</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function AIModelsSpotlight() {
  return (
    <section className="ai-news-homepage-models" id="models">
      <div className="ai-news-homepage-section-header">
        <div>
          <h2 className="ai-news-homepage-section-title">
            <Cpu size={24} />
            <span>AI Models Spotlight</span>
          </h2>
          <p className="ai-news-homepage-section-subtitle">
            Frontier models shaping the future
          </p>
        </div>
      </div>

      <div className="ai-news-homepage-models-grid">
        {MOCK_AI_MODELS.map((model, i) => (
          <div key={i} className="ai-news-homepage-model-card">
            <div className="ai-news-homepage-model-header">
              <div
                className="ai-news-homepage-model-logo"
                style={{ backgroundImage: `url(${model.logo})` }}
              />
              <div>
                <h3 className="ai-news-homepage-model-name">{model.name}</h3>
                <p className="ai-news-homepage-model-company">
                  {model.company}
                </p>
              </div>
            </div>

            <p className="ai-news-homepage-model-desc">{model.description}</p>

            <div className="ai-news-homepage-model-use">
              <span className="ai-news-homepage-model-use-label">
                Use Cases
              </span>
              <p>{model.useCase}</p>
            </div>

            <button className="ai-news-homepage-model-btn">
              <span>Explore Coverage</span>
              <ChevronRight size={16} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function MarketInsights() {
  return (
    <section className="ai-news-homepage-market">
      <div className="ai-news-homepage-market-grid">
        <div className="ai-news-homepage-market-card">
          <div
            className="ai-news-homepage-market-icon"
            style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
          >
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="ai-news-homepage-market-value">$847B</div>
            <div className="ai-news-homepage-market-label">
              Global AI Market 2025
            </div>
            <div className="ai-news-homepage-market-change positive">
              +34% YoY
            </div>
          </div>
        </div>

        <div className="ai-news-homepage-market-card">
          <div
            className="ai-news-homepage-market-icon"
            style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)" }}
          >
            <Rocket size={24} />
          </div>
          <div>
            <div className="ai-news-homepage-market-value">14.2K</div>
            <div className="ai-news-homepage-market-label">
              AI Startups Founded
            </div>
            <div className="ai-news-homepage-market-change positive">
              +67% YoY
            </div>
          </div>
        </div>

        <div className="ai-news-homepage-market-card">
          <div
            className="ai-news-homepage-market-icon"
            style={{ background: "linear-gradient(135deg, #8b5cf6, #7c3aed)" }}
          >
            <BarChart3 size={24} />
          </div>
          <div>
            <div className="ai-news-homepage-market-value">78%</div>
            <div className="ai-news-homepage-market-label">
              Enterprise Adoption
            </div>
            <div className="ai-news-homepage-market-change positive">
              +23pts
            </div>
          </div>
        </div>

        <div className="ai-news-homepage-market-card">
          <div
            className="ai-news-homepage-market-icon"
            style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}
          >
            <Code2 size={24} />
          </div>
          <div>
            <div className="ai-news-homepage-market-value">$12.4B</div>
            <div className="ai-news-homepage-market-label">LLM API Revenue</div>
            <div className="ai-news-homepage-market-change positive">
              +218% YoY
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MostReadSection() {
  return (
    <section className="ai-news-homepage-most-read">
      <h2 className="ai-news-homepage-section-title-alt">
        <Flame size={22} />
        <span>Most Read This Week</span>
      </h2>

      <div className="ai-news-homepage-most-read-list">
        {MOCK_MOST_READ.map((item) => (
          <div key={item.rank} className="ai-news-homepage-most-read-item">
            <div className="ai-news-homepage-most-read-rank">{item.rank}</div>
            <div className="ai-news-homepage-most-read-content">
              <h3 className="ai-news-homepage-most-read-title">{item.title}</h3>
              <div className="ai-news-homepage-most-read-stats">
                <span>
                  <Eye size={12} /> {formatNumber(item.views)}
                </span>
                <span>⚡ {item.engagement}%</span>
                <span>
                  <Clock size={12} /> {item.readingTime} min
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      if (window.Swal) {
        window.Swal.fire({
          icon: "success",
          title: "Subscribed!",
          text: "You'll receive AI news updates in your inbox.",
          confirmButtonColor: "#6366f1",
        });
      }
      setEmail("");
      setLoading(false);
    }, 1000);
  };

  return (
    <section className="ai-news-homepage-newsletter" id="newsletter">
      <div className="ai-news-homepage-newsletter-glow" />
      <div className="ai-news-homepage-newsletter-content">
        <div className="ai-news-homepage-newsletter-icon">
          <Mail size={32} />
        </div>
        <h2 className="ai-news-homepage-newsletter-title">Stay Ahead in AI</h2>
        <p className="ai-news-homepage-newsletter-desc">
          Get the latest AI news, insights, and analysis delivered to your
          inbox. Join 50,000+ industry professionals.
        </p>

        <form
          className="ai-news-homepage-newsletter-form"
          onSubmit={handleSubscribe}
        >
          <input
            type="email"
            placeholder="Enter your email"
            className="ai-news-homepage-newsletter-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            className="ai-news-homepage-newsletter-btn"
            disabled={loading}
          >
            {loading ? "Subscribing..." : "Subscribe"}
            <ChevronRight size={18} />
          </button>
        </form>

        <p className="ai-news-homepage-newsletter-privacy">
          <Shield size={13} /> AI-curated updates. Unsubscribe anytime. Privacy
          guaranteed.
        </p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="ai-news-homepage-footer">
      <div className="ai-news-homepage-footer-grid">
        <div className="ai-news-homepage-footer-brand">
          <div className="ai-news-homepage-footer-logo">
            <Brain size={32} />
            <div>
              <span className="ai-news-homepage-footer-logo-text">News</span>
              <span className="ai-news-homepage-footer-logo-accent">AI</span>
            </div>
          </div>
          <p className="ai-news-homepage-footer-tagline">
            The central intelligence hub for AI news, insights, and analysis.
          </p>
          <div className="ai-news-homepage-footer-socials">
            <a href="#" className="ai-news-homepage-footer-social-link">
              <Twitter size={18} />
            </a>
            <a href="#" className="ai-news-homepage-footer-social-link">
              <Linkedin size={18} />
            </a>
            <a href="#" className="ai-news-homepage-footer-social-link">
              <Github size={18} />
            </a>
          </div>
        </div>

        <div className="ai-news-homepage-footer-links">
          <h3 className="ai-news-homepage-footer-heading">Categories</h3>
          <a href="#">Machine Learning</a>
          <a href="#">Generative AI</a>
          <a href="#">Robotics</a>
          <a href="#">AI Hardware</a>
        </div>

        <div className="ai-news-homepage-footer-links">
          <h3 className="ai-news-homepage-footer-heading">Company</h3>
          <a href="#">About Us</a>
          <a href="#">Contact</a>
          <a href="#">Careers</a>
          <a href="#">Press Kit</a>
        </div>

        <div className="ai-news-homepage-footer-links">
          <h3 className="ai-news-homepage-footer-heading">Legal</h3>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Cookie Policy</a>
        </div>
      </div>

      <div className="ai-news-homepage-footer-bottom">
        <p>© 2025 NewsAI. All rights reserved.</p>
        <p>Powered by cutting-edge AI journalism</p>
      </div>
    </footer>
  );
}

function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 800);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      className={`ai-news-homepage-back-to-top ${visible ? "visible" : ""}`}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <ArrowUp size={20} />
    </button>
  );
}

// ── MAIN COMPONENT ─────────────────────────────────────────────────────

const Homepage = () => {
  // const { isDarkMode } = useContext(ThemeContext);
  const [isDarkMode, setIsDarkMode] = useState(true); // Mock for demo

  useEffect(() => {
    document.title = "NewsAI - The Intelligence Hub for AI News & Analysis";
  }, []);

  return (
    <div className={`ai-news-homepage-root ${isDarkMode ? "dark" : "light"}`}>
      <Header
        isDark={isDarkMode}
        onThemeToggle={() => setIsDarkMode(!isDarkMode)}
      />

      <main className="ai-news-homepage-main">
        <HeroSection />
        <BreakingNewsStrip />

        <div className="ai-news-homepage-container">
          <section className="ai-news-homepage-trending" id="trending">
            <div className="ai-news-homepage-section-header">
              <div>
                <h2 className="ai-news-homepage-section-title">
                  <TrendingUp size={24} />
                  <span>Trending in AI</span>
                </h2>
                <p className="ai-news-homepage-section-subtitle">
                  Most engaging stories right now
                </p>
              </div>
              <button className="ai-news-homepage-see-all-btn">
                <span>View All</span>
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="ai-news-homepage-trending-grid">
              {MOCK_TRENDING.map((article) => (
                <TrendingCard key={article._id} article={article} />
              ))}
            </div>
          </section>

          <FeaturedDeepDive />
          <CategoriesGrid />
          <MarketInsights />
          <AIModelsSpotlight />
          <MostReadSection />
          <NewsletterSection />
        </div>
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
};

export default Homepage;
