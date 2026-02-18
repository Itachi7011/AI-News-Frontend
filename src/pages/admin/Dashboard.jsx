import { useState, useEffect, useContext, useCallback, useRef } from "react";
import {
  LayoutDashboard,
  FileText,
  Eye,
  MessageSquare,
  Share2,
  Bookmark,
  Bot,
  User,
  Users,
  Mail,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Download,
  Plus,
  Settings,
  Flag,
  Tag,
  Cpu,
  Home,
  Activity,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  Bell,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Zap,
  BarChart2,
  PieChart,
  Clock,
  Edit,
  ExternalLink,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Shield,
  Layers,
  Database,
  Wifi,
  Server,
  DollarSign,
  Search,
  Filter,
} from "lucide-react";
import { ThemeContext } from "../../context/ThemeContext";

// ─── Utility: animated counter hook ────────────────────────────────────────
function useCountUp(target, duration = 1400, start = 0) {
  const [value, setValue] = useState(start);
  const rafRef = useRef(null);
  useEffect(() => {
    const startTime = performance.now();
    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(start + (target - start) * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration, start]);
  return value;
}

// ─── Mini Sparkline SVG ─────────────────────────────────────────────────────
function Sparkline({ data, color = "#38bdf8", height = 32 }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80,
    h = height;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");
  const areaPath = `M ${data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      return `${x},${y}`;
    })
    .join(" L ")} L ${w},${h} L 0,${h} Z`;
  return (
    <svg width={w} height={h} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient
          id={`sg-${color.replace("#", "")}`}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#sg-${color.replace("#", "")})`} />
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── KPI Card ────────────────────────────────────────────────────────────────
function KPICard({
  icon: Icon,
  label,
  value,
  growth,
  sparkData,
  accent,
  isDark,
}) {
  const animated = useCountUp(value);
  const isPositive = growth >= 0;
  const formatted =
    animated >= 1000000
      ? (animated / 1000000).toFixed(1) + "M"
      : animated >= 1000
        ? (animated / 1000).toFixed(1) + "K"
        : animated.toLocaleString();

  return (
    <div
      className={`ai-news-admin-dashboard-main-kpi-card ${isDark ? "dark" : "light"}`}
      style={{ "--accent": accent }}
    >
      <div className="ai-news-admin-dashboard-main-kpi-card-header">
        <div className="ai-news-admin-dashboard-main-kpi-icon">
          <Icon size={16} />
        </div>
        <span
          className={`ai-news-admin-dashboard-main-kpi-growth ${isPositive ? "pos" : "neg"}`}
        >
          {isPositive ? (
            <ArrowUpRight size={12} />
          ) : (
            <ArrowDownRight size={12} />
          )}
          {Math.abs(growth)}%
        </span>
      </div>
      <div className="ai-news-admin-dashboard-main-kpi-value">{formatted}</div>
      <div className="ai-news-admin-dashboard-main-kpi-label">{label}</div>
      <div className="ai-news-admin-dashboard-main-kpi-sparkline">
        <Sparkline data={sparkData} color={accent} />
      </div>
    </div>
  );
}

// ─── Donut Chart SVG ────────────────────────────────────────────────────────
function DonutChart({ aiPct }) {
  const r = 60,
    cx = 80,
    cy = 80,
    sw = 18;
  const circ = 2 * Math.PI * r;
  const aiDash = (aiPct / 100) * circ;
  const humanDash = circ - aiDash;
  return (
    <svg width="160" height="160" viewBox="0 0 160 160">
      <defs>
        <linearGradient id="aiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id="humanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={sw}
      />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="url(#humanGrad)"
        strokeWidth={sw}
        strokeDasharray={`${humanDash} ${aiDash}`}
        strokeDashoffset={-aiDash}
        strokeLinecap="round"
        style={{
          transition: "stroke-dasharray 1s ease",
          transform: "rotate(-90deg)",
          transformOrigin: "80px 80px",
        }}
      />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="url(#aiGrad)"
        strokeWidth={sw}
        strokeDasharray={`${aiDash} ${humanDash}`}
        strokeLinecap="round"
        style={{
          transition: "stroke-dasharray 1s ease",
          transform: "rotate(-90deg)",
          transformOrigin: "80px 80px",
        }}
      />
      <text
        x={cx}
        y={cy - 6}
        textAnchor="middle"
        fill="#38bdf8"
        fontSize="20"
        fontWeight="700"
      >
        {aiPct}%
      </text>
      <text
        x={cx}
        y={cy + 14}
        textAnchor="middle"
        fill="rgba(255,255,255,0.45)"
        fontSize="10"
      >
        AI Content
      </text>
    </svg>
  );
}

// ─── Progress Bar ────────────────────────────────────────────────────────────
function ProgressBar({ label, value, color, max = 100 }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="ai-news-admin-dashboard-main-prog-row">
      <div className="ai-news-admin-dashboard-main-prog-meta">
        <span className="ai-news-admin-dashboard-main-prog-label">{label}</span>
        <span className="ai-news-admin-dashboard-main-prog-val">{value}%</span>
      </div>
      <div className="ai-news-admin-dashboard-main-prog-track">
        <div
          className="ai-news-admin-dashboard-main-prog-fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

// ─── Badge ───────────────────────────────────────────────────────────────────
function Badge({ type, text }) {
  const map = {
    warning: {
      bg: "rgba(251,191,36,0.15)",
      color: "#fbbf24",
      icon: <AlertTriangle size={11} />,
    },
    error: {
      bg: "rgba(239,68,68,0.15)",
      color: "#ef4444",
      icon: <XCircle size={11} />,
    },
    success: {
      bg: "rgba(16,185,129,0.15)",
      color: "#10b981",
      icon: <CheckCircle size={11} />,
    },
    info: {
      bg: "rgba(56,189,248,0.15)",
      color: "#38bdf8",
      icon: <Info size={11} />,
    },
  };
  const s = map[type] || map.info;
  return (
    <span
      className="ai-news-admin-dashboard-main-badge"
      style={{ background: s.bg, color: s.color }}
    >
      {s.icon} {text}
    </span>
  );
}

// ─── Skeleton loader ─────────────────────────────────────────────────────────
function SkeletonCard() {
  return <div className="ai-news-admin-dashboard-main-skeleton" />;
}

// ─── Mock data generators ────────────────────────────────────────────────────
const spark = (base, len = 10) =>
  Array.from({ length: len }, (_, i) =>
    Math.max(
      0,
      base +
        Math.floor(
          Math.sin(i * 1.2) * base * 0.15 + Math.random() * base * 0.1,
        ),
    ),
  );

const mockStats = {
  totalArticles: 4872,
  published: 3914,
  drafts: 958,
  totalViews: 2840000,
  engagementScore: 87,
  comments: 34200,
  shares: 18900,
  bookmarks: 9340,
  aiArticles: 2920,
  humanArticles: 1952,
  users: 145800,
  subscribers: 62400,
};

const growthData = {
  totalArticles: 12,
  published: 8,
  drafts: -3,
  totalViews: 21,
  engagementScore: 5,
  comments: 14,
  shares: 9,
  bookmarks: 17,
  aiArticles: 28,
  humanArticles: 4,
  users: 11,
  subscribers: 19,
};

const sparklines = {
  totalArticles: spark(80),
  published: spark(65),
  drafts: spark(15),
  totalViews: spark(200),
  engagementScore: spark(85),
  comments: spark(40),
  shares: spark(25),
  bookmarks: spark(12),
  aiArticles: spark(50),
  humanArticles: spark(30),
  users: spark(110),
  subscribers: spark(60),
};

const trendingArticles = [
  {
    id: 1,
    title:
      "GPT-5 Breaks Reasoning Benchmarks: What It Means for AI Development",
    views: "284K",
    shares: "12.4K",
    comments: 892,
    growth: "+340%",
    badge: "🔥",
  },
  {
    id: 2,
    title: "OpenAI Secures $40B in New Funding Round Valuing It at $340B",
    views: "198K",
    shares: "8.7K",
    comments: 654,
    growth: "+218%",
    badge: "📈",
  },
  {
    id: 3,
    title: "Anthropic's Claude 4 Outperforms All Models in Safety Evaluation",
    views: "176K",
    shares: "7.1K",
    comments: 512,
    growth: "+187%",
    badge: "⚡",
  },
  {
    id: 4,
    title: "Google DeepMind Unveils AlphaCode 3 With 98% Competitive Accuracy",
    views: "143K",
    shares: "5.9K",
    comments: 423,
    growth: "+156%",
    badge: "🎯",
  },
  {
    id: 5,
    title: "EU AI Act: How New Regulations Will Reshape the Industry in 2025",
    views: "128K",
    shares: "5.2K",
    comments: 387,
    growth: "+134%",
    badge: "📋",
  },
];

const activityLogs = [
  {
    id: 1,
    icon: <Plus size={13} />,
    color: "#10b981",
    admin: "admin@ainews.io",
    action: "Published new article",
    entity: "GPT-5 Analysis Report",
    time: "2 min ago",
  },
  {
    id: 2,
    icon: <Edit size={13} />,
    color: "#38bdf8",
    admin: "editor@ainews.io",
    action: "Edited article metadata",
    entity: "OpenAI Funding Round",
    time: "8 min ago",
  },
  {
    id: 3,
    icon: <XCircle size={13} />,
    color: "#ef4444",
    admin: "mod@ainews.io",
    action: "Deleted spam comment",
    entity: "Comment #84291",
    time: "15 min ago",
  },
  {
    id: 4,
    icon: <Shield size={13} />,
    color: "#f97316",
    admin: "admin@ainews.io",
    action: "Banned user account",
    entity: "user_spammer_441",
    time: "32 min ago",
  },
  {
    id: 5,
    icon: <Home size={13} />,
    color: "#a78bfa",
    admin: "editor@ainews.io",
    action: "Updated homepage highlights",
    entity: "Homepage Section A",
    time: "1 hr ago",
  },
  {
    id: 6,
    icon: <Cpu size={13} />,
    color: "#f472b6",
    admin: "admin@ainews.io",
    action: "Added new AI model",
    entity: "Claude-4-Sonnet",
    time: "2 hr ago",
  },
  {
    id: 7,
    icon: <FileText size={13} />,
    color: "#38bdf8",
    admin: "writer@ainews.io",
    action: "Created draft article",
    entity: "Gemini 2.0 Ultra Review",
    time: "3 hr ago",
  },
];

const alerts = [
  {
    id: 1,
    type: "error",
    text: "14 articles flagged for review",
    detail: "Reported by users in last 24h",
  },
  {
    id: 2,
    type: "warning",
    text: "82 comments pending moderation",
    detail: "Oldest pending: 6 hours ago",
  },
  {
    id: 3,
    type: "warning",
    text: "3 articles with low engagement",
    detail: "Below 2% engagement rate threshold",
  },
  {
    id: 4,
    type: "info",
    text: "API rate limit at 71% capacity",
    detail: "Consider upgrading plan",
  },
  {
    id: 5,
    type: "success",
    text: "Backup completed successfully",
    detail: "Last backup: Today 03:00 AM UTC",
  },
];

const quickActions = [
  { icon: Plus, label: "New Article", color: "#38bdf8" },
  { icon: Layers, label: "Manage Articles", color: "#6366f1" },
  { icon: MessageSquare, label: "Moderate Comments", color: "#10b981" },
  { icon: Flag, label: "Review Reports", color: "#ef4444" },
  { icon: Tag, label: "Manage Categories", color: "#f97316" },
  { icon: Cpu, label: "AI Models", color: "#a78bfa" },
  { icon: Users, label: "Manage Users", color: "#f472b6" },
  { icon: Home, label: "Homepage Highlights", color: "#fbbf24" },
];

const kpiConfig = [
  {
    key: "totalArticles",
    label: "Total Articles",
    icon: FileText,
    accent: "#38bdf8",
  },
  {
    key: "published",
    label: "Published",
    icon: CheckCircle,
    accent: "#10b981",
  },
  { key: "drafts", label: "Draft Articles", icon: Clock, accent: "#f97316" },
  { key: "totalViews", label: "Total Views", icon: Eye, accent: "#6366f1" },
  {
    key: "engagementScore",
    label: "Engagement Score",
    icon: Activity,
    accent: "#a78bfa",
  },
  {
    key: "comments",
    label: "Total Comments",
    icon: MessageSquare,
    accent: "#38bdf8",
  },
  { key: "shares", label: "Total Shares", icon: Share2, accent: "#10b981" },
  {
    key: "bookmarks",
    label: "Total Bookmarks",
    icon: Bookmark,
    accent: "#fbbf24",
  },
  { key: "aiArticles", label: "AI Generated", icon: Bot, accent: "#6366f1" },
  {
    key: "humanArticles",
    label: "Human Curated",
    icon: User,
    accent: "#10b981",
  },
  { key: "users", label: "Total Users", icon: Users, accent: "#f472b6" },
  {
    key: "subscribers",
    label: "Newsletter Subs",
    icon: Mail,
    accent: "#38bdf8",
  },
];

// ─── Main Component ──────────────────────────────────────────────────────────
const AdminDashboardMain = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const [range, setRange] = useState("7d");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats] = useState(mockStats);
  const aiPct = Math.round((stats.aiArticles / stats.totalArticles) * 100);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1400);
  }, []);

  const ranges = [
    { val: "today", label: "Today" },
    { val: "7d", label: "7 Days" },
    { val: "30d", label: "30 Days" },
    { val: "custom", label: "Custom" },
  ];

  return (
    <div
      className={`ai-news-admin-dashboard-main-root ${isDarkMode ? "dark" : "light"}`}
    >
      <div className="ai-news-admin-dashboard-main-header">
        <div className="ai-news-admin-dashboard-main-header-left">
          <div className="ai-news-admin-dashboard-main-eyebrow">
            <span className="ai-news-admin-dashboard-main-eyebrow-dot" />
            Live Intelligence Feed
          </div>
          <h1 className="ai-news-admin-dashboard-main-title">
            Dashboard Overview
          </h1>
          <p className="ai-news-admin-dashboard-main-subtitle">
            AI News Platform Performance &amp; Intelligence
          </p>
        </div>
        <div className="ai-news-admin-dashboard-main-header-right">
          <div className="ai-news-admin-dashboard-main-range-group">
            {ranges.map((r) => (
              <button
                key={r.val}
                className={`ai-news-admin-dashboard-main-range-btn ${range === r.val ? "active" : ""}`}
                onClick={() => setRange(r.val)}
              >
                {r.label}
              </button>
            ))}
          </div>
          <button
            className="ai-news-admin-dashboard-main-icon-btn"
            onClick={handleRefresh}
          >
            <RefreshCw
              size={13}
              className={refreshing ? "ai-news-admin-dashboard-main-spin" : ""}
            />
            Refresh
          </button>
          <button className="ai-news-admin-dashboard-main-icon-btn">
            <Download size={13} />
            Export
          </button>
        </div>
      </div>

      {/* ── 2. KPI CARDS ── */}
      <p className="ai-news-admin-dashboard-main-section-title">
        <BarChart2 size={13} /> Platform Metrics
      </p>
      <div className="ai-news-admin-dashboard-main-kpi-grid">
        {loading
          ? Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)
          : kpiConfig.map(({ key, label, icon, accent }) => (
              <KPICard
                key={key}
                icon={icon}
                label={label}
                value={stats[key]}
                growth={growthData[key]}
                sparkData={sparklines[key]}
                accent={accent}
                isDark={isDarkMode}
              />
            ))}
      </div>

      {/* ── 3 + REALTIME: AI vs Human + Real-Time ── */}
      <div className="ai-news-admin-dashboard-main-two-col">
        {/* AI vs Human */}
        <div className="ai-news-admin-dashboard-main-panel">
          <div className="ai-news-admin-dashboard-main-panel-title">
            <span className="ai-news-admin-dashboard-main-panel-title-icon">
              <PieChart size={14} />
            </span>
            AI vs Human Content Ratio
          </div>
          <div className="ai-news-admin-dashboard-main-ratio-inner">
            <DonutChart aiPct={aiPct} />
            <div style={{ flex: 1 }}>
              <div className="ai-news-admin-dashboard-main-ratio-legend-item">
                <span
                  className="ai-news-admin-dashboard-main-ratio-dot"
                  style={{ background: "#38bdf8" }}
                />
                <span className="ai-news-admin-dashboard-main-ratio-item-label">
                  AI Generated
                </span>
                <span className="ai-news-admin-dashboard-main-ratio-item-val">
                  {stats.aiArticles.toLocaleString()}
                </span>
              </div>
              <div className="ai-news-admin-dashboard-main-ratio-legend-item">
                <span
                  className="ai-news-admin-dashboard-main-ratio-dot"
                  style={{ background: "#10b981" }}
                />
                <span className="ai-news-admin-dashboard-main-ratio-item-label">
                  Human Curated
                </span>
                <span className="ai-news-admin-dashboard-main-ratio-item-val">
                  {stats.humanArticles.toLocaleString()}
                </span>
              </div>
              <div style={{ marginTop: 14 }}>
                <ProgressBar
                  label="AI Share"
                  value={aiPct}
                  color="linear-gradient(90deg,#38bdf8,#6366f1)"
                />
                <ProgressBar
                  label="Human Share"
                  value={100 - aiPct}
                  color="linear-gradient(90deg,#10b981,#059669)"
                />
              </div>
            </div>
          </div>
          <div className="ai-news-admin-dashboard-main-ratio-insight">
            <strong style={{ color: "#38bdf8" }}>Insight:</strong> AI-generated
            content accounts for <strong>{aiPct}%</strong> of total
            publications. This ratio has grown <strong>+28%</strong> over the
            last 30 days, indicating accelerated AI content adoption across all
            coverage categories.
          </div>
        </div>

        {/* Real-Time Activity */}
        <div className="ai-news-admin-dashboard-main-panel">
          <div className="ai-news-admin-dashboard-main-panel-title">
            <span className="ai-news-admin-dashboard-main-panel-title-icon">
              <Activity size={14} />
            </span>
            Real-Time Activity
            <span
              className="ai-news-admin-dashboard-main-live-dot"
              style={{ marginLeft: "auto" }}
            />
          </div>
          <div className="ai-news-admin-dashboard-main-realtime-stat">
            <span className="ai-news-admin-dashboard-main-realtime-label">
              <Users size={13} /> Live Active Users
            </span>
            <span className="ai-news-admin-dashboard-main-realtime-val">
              4,821
            </span>
          </div>
          <div className="ai-news-admin-dashboard-main-realtime-stat">
            <span className="ai-news-admin-dashboard-main-realtime-label">
              <Eye size={13} /> Articles Being Read Now
            </span>
            <span className="ai-news-admin-dashboard-main-realtime-val">
              312
            </span>
          </div>
          <div className="ai-news-admin-dashboard-main-realtime-stat">
            <span className="ai-news-admin-dashboard-main-realtime-label">
              <Zap size={13} /> Top Article Right Now
            </span>
            <span className="ai-news-admin-dashboard-main-realtime-val">
              GPT-5 Analysis
            </span>
          </div>
          <div className="ai-news-admin-dashboard-main-realtime-stat">
            <span className="ai-news-admin-dashboard-main-realtime-label">
              <Smartphone size={13} /> Mobile Traffic
            </span>
            <span className="ai-news-admin-dashboard-main-realtime-val">
              62%
            </span>
          </div>
          <div className="ai-news-admin-dashboard-main-realtime-stat">
            <span className="ai-news-admin-dashboard-main-realtime-label">
              <Monitor size={13} /> Desktop Traffic
            </span>
            <span className="ai-news-admin-dashboard-main-realtime-val">
              29%
            </span>
          </div>
          <div className="ai-news-admin-dashboard-main-realtime-stat">
            <span className="ai-news-admin-dashboard-main-realtime-label">
              <Tablet size={13} /> Tablet Traffic
            </span>
            <span className="ai-news-admin-dashboard-main-realtime-val">
              9%
            </span>
          </div>
          <div style={{ marginTop: 14 }}>
            <ProgressBar
              label="Organic Search"
              value={48}
              color="linear-gradient(90deg,#38bdf8,#6366f1)"
              max={100}
            />
            <ProgressBar
              label="Direct"
              value={27}
              color="linear-gradient(90deg,#10b981,#059669)"
              max={100}
            />
            <ProgressBar
              label="Social Media"
              value={16}
              color="linear-gradient(90deg,#f472b6,#a78bfa)"
              max={100}
            />
            <ProgressBar
              label="Referral"
              value={9}
              color="linear-gradient(90deg,#fbbf24,#f97316)"
              max={100}
            />
          </div>
        </div>
      </div>

      {/* ── 5. TRENDING ARTICLES ── */}
      <div className="ai-news-admin-dashboard-main-three-col">
        <div className="ai-news-admin-dashboard-main-panel">
          <div className="ai-news-admin-dashboard-main-panel-title">
            <span className="ai-news-admin-dashboard-main-panel-title-icon">
              <TrendingUp size={14} />
            </span>
            Trending &amp; Performance Insights
          </div>
          {trendingArticles.map((a, idx) => (
            <div
              key={a.id}
              className="ai-news-admin-dashboard-main-trending-item"
            >
              <span className="ai-news-admin-dashboard-main-trending-rank">
                {a.badge}
              </span>
              <div className="ai-news-admin-dashboard-main-trending-info">
                <div className="ai-news-admin-dashboard-main-trending-title">
                  {a.title}
                </div>
                <div className="ai-news-admin-dashboard-main-trending-meta">
                  <span className="ai-news-admin-dashboard-main-trending-meta-item">
                    <Eye size={10} />
                    {a.views}
                  </span>
                  <span className="ai-news-admin-dashboard-main-trending-meta-item">
                    <Share2 size={10} />
                    {a.shares}
                  </span>
                  <span className="ai-news-admin-dashboard-main-trending-meta-item">
                    <MessageSquare size={10} />
                    {a.comments}
                  </span>
                </div>
              </div>
              <span className="ai-news-admin-dashboard-main-trending-growth">
                {a.growth}
              </span>
              <div className="ai-news-admin-dashboard-main-trending-actions">
                <button
                  className="ai-news-admin-dashboard-main-trending-btn"
                  title="View"
                >
                  <ExternalLink size={12} />
                </button>
                <button
                  className="ai-news-admin-dashboard-main-trending-btn"
                  title="Edit"
                >
                  <Edit size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Highlight stats */}
          <div
            className="ai-news-admin-dashboard-main-panel"
            style={{ flex: "0 0 auto" }}
          >
            <div className="ai-news-admin-dashboard-main-panel-title">
              <span className="ai-news-admin-dashboard-main-panel-title-icon">
                <Zap size={14} />
              </span>
              Top Performers
            </div>
            {[
              {
                label: "Most Viewed",
                val: "GPT-5 Analysis",
                icon: <Eye size={11} />,
                color: "#38bdf8",
              },
              {
                label: "Most Shared",
                val: "OpenAI $40B Round",
                icon: <Share2 size={11} />,
                color: "#6366f1",
              },
              {
                label: "Fastest 24h",
                val: "+340% GPT-5 Breaks",
                icon: <TrendingUp size={11} />,
                color: "#10b981",
              },
              {
                label: "Most Comments",
                val: "EU AI Act Impact",
                icon: <MessageSquare size={11} />,
                color: "#f472b6",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="ai-news-admin-dashboard-main-realtime-stat"
              >
                <span
                  className="ai-news-admin-dashboard-main-realtime-label"
                  style={{ color: item.color, gap: 6 }}
                >
                  {item.icon} {item.label}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: "rgba(148,163,184,0.8)",
                    textAlign: "right",
                    maxWidth: 120,
                    lineHeight: 1.3,
                  }}
                >
                  {item.val}
                </span>
              </div>
            ))}
          </div>

          {/* Engagement panel */}
          <div className="ai-news-admin-dashboard-main-panel">
            <div className="ai-news-admin-dashboard-main-panel-title">
              <span className="ai-news-admin-dashboard-main-panel-title-icon">
                <BarChart2 size={14} />
              </span>
              Engagement Breakdown
            </div>
            <ProgressBar
              label="Comments per Article"
              value={72}
              color="linear-gradient(90deg,#38bdf8,#6366f1)"
            />
            <ProgressBar
              label="Share Rate"
              value={58}
              color="linear-gradient(90deg,#10b981,#059669)"
            />
            <ProgressBar
              label="Bookmark Rate"
              value={43}
              color="linear-gradient(90deg,#fbbf24,#f97316)"
            />
            <ProgressBar
              label="Return Visitors"
              value={66}
              color="linear-gradient(90deg,#f472b6,#a78bfa)"
            />
          </div>
        </div>
      </div>

      {/* ── 6. QUICK ACTIONS ── */}
      <p className="ai-news-admin-dashboard-main-section-title">
        <Zap size={13} /> Quick Actions
      </p>
      <div className="ai-news-admin-dashboard-main-actions-grid">
        {quickActions.map(({ icon: Icon, label, color }) => (
          <div key={label} className="ai-news-admin-dashboard-main-action-card">
            <div
              className="ai-news-admin-dashboard-main-action-icon"
              style={{ background: `${color}18`, color }}
            >
              <Icon size={18} />
            </div>
            <span className="ai-news-admin-dashboard-main-action-label">
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* ── 7 + 8: Activity Logs & Alerts ── */}
      <div className="ai-news-admin-dashboard-main-two-col">
        <div className="ai-news-admin-dashboard-main-panel">
          <div className="ai-news-admin-dashboard-main-panel-title">
            <span className="ai-news-admin-dashboard-main-panel-title-icon">
              <Clock size={14} />
            </span>
            Recent Activity Logs
          </div>
          <div className="ai-news-admin-dashboard-main-log-scroll">
            {activityLogs.map((log) => (
              <div
                key={log.id}
                className="ai-news-admin-dashboard-main-log-item"
              >
                <div
                  className="ai-news-admin-dashboard-main-log-icon-wrap"
                  style={{ background: `${log.color}15`, color: log.color }}
                >
                  {log.icon}
                </div>
                <div className="ai-news-admin-dashboard-main-log-body">
                  <div className="ai-news-admin-dashboard-main-log-action">
                    {log.action}
                  </div>
                  <div className="ai-news-admin-dashboard-main-log-detail">
                    By <strong style={{ color: "#94a3b8" }}>{log.admin}</strong>{" "}
                    ·{" "}
                    <span className="ai-news-admin-dashboard-main-log-entity">
                      {log.entity}
                    </span>
                  </div>
                </div>
                <span className="ai-news-admin-dashboard-main-log-time">
                  {log.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="ai-news-admin-dashboard-main-panel">
          <div className="ai-news-admin-dashboard-main-panel-title">
            <span className="ai-news-admin-dashboard-main-panel-title-icon">
              <Bell size={14} />
            </span>
            System Alerts &amp; Notifications
          </div>
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="ai-news-admin-dashboard-main-alert-item"
            >
              <div className="ai-news-admin-dashboard-main-alert-icon">
                <Badge type={alert.type} text="" />
              </div>
              <div style={{ flex: 1 }}>
                <div className="ai-news-admin-dashboard-main-alert-text">
                  {alert.text}
                </div>
                <div className="ai-news-admin-dashboard-main-alert-detail">
                  {alert.detail}
                </div>
              </div>
              <ChevronRight
                size={14}
                style={{ color: "rgba(148,163,184,0.3)", flexShrink: 0 }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── 9. MARKET SNAPSHOT ── */}
      <p
        className="ai-news-admin-dashboard-main-section-title"
        style={{ marginTop: 4 }}
      >
        <Globe size={13} /> AI Market &amp; Industry Snapshot
      </p>
      <div className="ai-news-admin-dashboard-main-market-grid">
        <div className="ai-news-admin-dashboard-main-market-card">
          <div className="ai-news-admin-dashboard-main-market-card-label">
            AI Industry Growth
          </div>
          <div className="ai-news-admin-dashboard-main-market-card-val">
            +38.4%
          </div>
          <div className="ai-news-admin-dashboard-main-market-card-sub">
            YoY global market expansion
          </div>
          <div
            className="ai-news-admin-dashboard-main-market-card-sentiment"
            style={{ color: "#10b981" }}
          >
            <TrendingUp size={14} /> Accelerating
          </div>
        </div>
        <div className="ai-news-admin-dashboard-main-market-card">
          <div className="ai-news-admin-dashboard-main-market-card-label">
            Latest AI Funding
          </div>
          <div className="ai-news-admin-dashboard-main-market-card-val">
            $92.4B
          </div>
          <div className="ai-news-admin-dashboard-main-market-card-sub">
            Total Q1 2025 investment rounds
          </div>
          <div
            className="ai-news-admin-dashboard-main-market-card-sentiment"
            style={{ color: "#38bdf8" }}
          >
            <DollarSign size={14} /> Record High
          </div>
        </div>
        <div className="ai-news-admin-dashboard-main-market-card">
          <div className="ai-news-admin-dashboard-main-market-card-label">
            Company Spotlight
          </div>
          <div
            className="ai-news-admin-dashboard-main-market-card-val"
            style={{ fontSize: 16, marginTop: 4 }}
          >
            Anthropic
          </div>
          <div className="ai-news-admin-dashboard-main-market-card-sub">
            Claude 4 Series · $61.5B Valuation · Safety-first AI leader
          </div>
        </div>
        <div className="ai-news-admin-dashboard-main-market-card">
          <div className="ai-news-admin-dashboard-main-market-card-label">
            Market Sentiment
          </div>
          <div
            className="ai-news-admin-dashboard-main-market-card-val"
            style={{ fontSize: 20 }}
          >
            Bullish
          </div>
          <div className="ai-news-admin-dashboard-main-market-card-sub">
            Confidence Index: 84 / 100
          </div>
          <div
            className="ai-news-admin-dashboard-main-market-card-sentiment"
            style={{ color: "#10b981" }}
          >
            <TrendingUp size={14} /> Strong Buy Signal
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardMain;
