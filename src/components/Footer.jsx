// src/components/Footer/Footer.jsx
import { useContext, useState, useRef, useEffect } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import Swal from 'sweetalert2';
import {
  Brain,
  Sparkles,
  ArrowRight,
  Mail,
  Github,
  Twitter,
  Linkedin,
  Youtube,
  Rss,
  Globe2,
  Cpu,
  Bot,
  FlaskConical,
  Shield,
  TrendingUp,
  Bookmark,
  MessageSquare,
  Users,
  HelpCircle,
  FileText,
  Briefcase,
  ChevronUp,
  Zap,
  Activity,
  Radio,
  ExternalLink,
  Lock,
  Eye,
  BarChart2,
  Star,
  Send,
} from 'lucide-react';
import './Footer.css';

/* ── DATA ────────────────────────────────────────────── */
const footerLinks = [
  {
    heading: 'Discover',
    icon: <Sparkles size={14} />,
    id: 'discover',
    links: [
      { label: 'Latest AI News',      href: '/latest',        icon: <Zap size={12} /> },
      { label: 'Trending Stories',    href: '/trending',      icon: <TrendingUp size={12} /> },
      { label: 'Editors\' Picks',     href: '/editors-picks', icon: <Star size={12} /> },
      { label: 'Weekly Digest',       href: '/digest',        icon: <Bookmark size={12} /> },
      { label: 'Live AI Feed',        href: '/live',          icon: <Radio size={12} /> },
      { label: 'Most Read',           href: '/most-read',     icon: <BarChart2 size={12} /> },
    ],
  },
  {
    heading: 'Topics',
    icon: <Brain size={14} />,
    id: 'topics',
    links: [
      { label: 'Large Language Models', href: '/topics/llm',      icon: <Brain size={12} /> },
      { label: 'Robotics & Automation', href: '/topics/robotics', icon: <Bot size={12} /> },
      { label: 'AI Research',           href: '/topics/research', icon: <FlaskConical size={12} /> },
      { label: 'AI Hardware & Chips',   href: '/topics/hardware', icon: <Cpu size={12} /> },
      { label: 'AI Policy & Ethics',    href: '/topics/policy',   icon: <Shield size={12} /> },
      { label: 'Global AI Race',        href: '/topics/global',   icon: <Globe2 size={12} /> },
    ],
  },
  {
    heading: 'Insights',
    icon: <Activity size={14} />,
    id: 'insights',
    links: [
      { label: 'Deep Analysis',      href: '/analysis',    icon: <Eye size={12} /> },
      { label: 'Market Intelligence',href: '/market',      icon: <BarChart2 size={12} /> },
      { label: 'Expert Opinions',    href: '/opinions',    icon: <MessageSquare size={12} /> },
      { label: 'Research Papers',    href: '/papers',      icon: <FileText size={12} /> },
      { label: 'Startup Watch',      href: '/startups',    icon: <TrendingUp size={12} /> },
    ],
  },
  {
    heading: 'Company',
    icon: <Briefcase size={14} />,
    id: 'company',
    links: [
      { label: 'About Us',        href: '/about',       icon: <Users size={12} /> },
      { label: 'Careers',         href: '/careers',     icon: <Briefcase size={12} />, badge: 'Hiring' },
      { label: 'Press Kit',       href: '/press',       icon: <FileText size={12} /> },
      { label: 'Advertise',       href: '/advertise',   icon: <Globe2 size={12} /> },
      { label: 'Contact Us',      href: '/contact',     icon: <Mail size={12} /> },
      { label: 'Help Center',     href: '/help',        icon: <HelpCircle size={12} /> },
    ],
  },
  {
    heading: 'Legal',
    icon: <Lock size={14} />,
    id: 'legal',
    links: [
      { label: 'Privacy Policy',   href: '/privacy',    icon: <Lock size={12} /> },
      { label: 'Terms of Service', href: '/terms',      icon: <FileText size={12} /> },
      { label: 'Cookie Policy',    href: '/cookies',    icon: <Shield size={12} /> },
      { label: 'GDPR',             href: '/gdpr',       icon: <Globe2 size={12} /> },
      { label: 'Accessibility',    href: '/a11y',       icon: <Eye size={12} /> },
    ],
  },
];

const socialLinks = [
  { label: 'Twitter / X',  href: 'https://twitter.com',  icon: <Twitter size={17} />,  color: '#1d9bf0' },
  { label: 'LinkedIn',     href: 'https://linkedin.com', icon: <Linkedin size={17} />, color: '#0a66c2' },
  { label: 'GitHub',       href: 'https://github.com',   icon: <Github size={17} />,   color: '#e2e8f0' },
  { label: 'YouTube',      href: 'https://youtube.com',  icon: <Youtube size={17} />,  color: '#ff0000' },
  { label: 'RSS Feed',     href: '/rss.xml',             icon: <Rss size={17} />,      color: '#f97316' },
];

const stats = [
  { value: '2.4M+', label: 'Monthly Readers',  icon: <Users size={16} /> },
  { value: '140+',  label: 'AI Topics Covered', icon: <Brain size={16} /> },
  { value: '98%',   label: 'Source Accuracy',   icon: <Shield size={16} /> },
  { value: '24/7',  label: 'Live AI Coverage',  icon: <Activity size={16} /> },
];

const recentBadges = [
  'GPT-5', 'Gemini Ultra', 'Claude 4', 'Llama 4', 'AI Regulation',
  'Humanoid Robots', 'AI Chips', 'OpenAI', 'DeepMind', 'Sora 2',
];

/* ── COMPONENT ───────────────────────────────────────── */
export default function Footer() {
  const { isDarkMode } = useContext(ThemeContext);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [activeCol, setActiveCol] = useState(null);
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  /* Particle canvas */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, particles;

    const resize = () => {
      w = canvas.width  = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
      init();
    };

    const init = () => {
      particles = Array.from({ length: 55 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.8 + 0.4,
        dx: (Math.random() - 0.5) * 0.25,
        dy: (Math.random() - 0.5) * 0.25,
        alpha: Math.random() * 0.4 + 0.08,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99,102,241,${p.alpha})`;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > w) p.dx *= -1;
        if (p.y < 0 || p.y > h) p.dy *= -1;
      });
      animRef.current = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      Swal.fire({
        title: 'Invalid Email',
        text: 'Please enter a valid email address.',
        icon: 'warning',
        confirmButtonColor: '#6366f1',
        background: isDarkMode ? '#0f0f1a' : '#ffffff',
        color: isDarkMode ? '#e2e8f0' : '#1e293b',
      });
      return;
    }
    Swal.fire({
      title: `<span style="font-family:'Syne',sans-serif">You're In! 🎉</span>`,
      html: `<p style="font-family:'DM Sans',sans-serif;color:#9ca3af">Welcome to <strong style="color:#6366f1">NewsAI</strong> — your daily AI intelligence briefing starts tomorrow.</p>`,
      icon: 'success',
      confirmButtonText: 'Awesome!',
      confirmButtonColor: '#6366f1',
      background: isDarkMode ? '#0f0f1a' : '#ffffff',
      color: isDarkMode ? '#e2e8f0' : '#1e293b',
    });
    setSubscribed(true);
    setEmail('');
  };

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const themeClass = isDarkMode ? 'dark' : 'light';

  return (
    <footer className={`nai-footer ${themeClass}`} id="nai-footer-root">

      {/* ── CANVAS PARTICLES ── */}
      <canvas ref={canvasRef} className="nai-footer__canvas" aria-hidden="true" />

      {/* ── DECORATIVE ORBS ── */}
      <div className="nai-footer__orb nai-footer__orb--1" aria-hidden="true" />
      <div className="nai-footer__orb nai-footer__orb--2" aria-hidden="true" />
      <div className="nai-footer__orb nai-footer__orb--3" aria-hidden="true" />

      {/* ── GRID PATTERN ── */}
      <div className="nai-footer__grid-overlay" aria-hidden="true" />

      {/* ══════════════════════════════════════════
          SECTION 1 — NEWSLETTER HERO BAND
      ══════════════════════════════════════════ */}
      <div className="nai-footer__nl-band">
        <div className="nai-footer__nl-inner">
          <div className="nai-footer__nl-left">
            <span className="nai-footer__nl-pill">
              <Zap size={11} /> Daily Briefing
            </span>
            <h2 className="nai-footer__nl-heading">
              Stay Ahead of the<br />
              <span className="nai-footer__nl-heading-gradient">AI Revolution</span>
            </h2>
            <p className="nai-footer__nl-sub">
              Join <strong>240,000+</strong> founders, engineers & researchers who read NewsAI every morning.
              Zero fluff. Pure signal.
            </p>
          </div>

          <div className="nai-footer__nl-right">
            {!subscribed ? (
              <form className="nai-footer__nl-form" onSubmit={handleSubscribe} noValidate>
                <div className="nai-footer__nl-input-wrap">
                  <Mail size={16} className="nai-footer__nl-input-icon" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your email address…"
                    className="nai-footer__nl-input"
                    aria-label="Email for newsletter"
                  />
                </div>
                <button type="submit" className="nai-footer__nl-btn">
                  <Send size={15} />
                  Subscribe Free
                  <div className="nai-footer__nl-btn-shine" aria-hidden="true" />
                </button>
              </form>
            ) : (
              <div className="nai-footer__nl-success">
                <Sparkles size={22} className="nai-footer__nl-success-icon" />
                <p>Check your inbox — your first briefing is on its way!</p>
              </div>
            )}
            <p className="nai-footer__nl-note">
              <Lock size={11} /> No spam. Unsubscribe anytime. Read by 2.4M+ people.
            </p>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          SECTION 2 — STATS ROW
      ══════════════════════════════════════════ */}
      <div className="nai-footer__stats-row">
        <div className="nai-footer__stats-inner">
          {stats.map((s, i) => (
            <div className="nai-footer__stat" key={i}>
              <div className="nai-footer__stat-icon">{s.icon}</div>
              <div className="nai-footer__stat-body">
                <span className="nai-footer__stat-value">{s.value}</span>
                <span className="nai-footer__stat-label">{s.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          SECTION 3 — MAIN LINKS GRID
      ══════════════════════════════════════════ */}
      <div className="nai-footer__main">
        <div className="nai-footer__main-inner">

          {/* Brand Column */}
          <div className="nai-footer__brand-col">
            <a href="/" className="nai-footer__logo" aria-label="NewsAI Home">
              <div className="nai-footer__logo-icon">
                <Brain size={20} />
                <div className="nai-footer__logo-ring" aria-hidden="true" />
              </div>
              <div className="nai-footer__logo-text">
                <span className="nai-footer__logo-news">News</span>
                <span className="nai-footer__logo-ai">AI</span>
              </div>
            </a>
            <p className="nai-footer__brand-desc">
              The world's most trusted source for artificial intelligence news, research, and insights. 
              We decode the AI future — one story at a time.
            </p>

            {/* Social Icons */}
            <div className="nai-footer__socials">
              <p className="nai-footer__socials-label">Follow our coverage</p>
              <div className="nai-footer__socials-row">
                {socialLinks.map(s => (
                  <a
                    key={s.href}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="nai-footer__social-btn"
                    style={{ '--nai-f-social-color': s.color }}
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* App badges */}
            <div className="nai-footer__apps">
              <a href="/app/ios" className="nai-footer__app-badge">
                <div className="nai-footer__app-badge-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                </div>
                <div>
                  <span className="nai-footer__app-badge-sub">Download on the</span>
                  <span className="nai-footer__app-badge-title">App Store</span>
                </div>
              </a>
              <a href="/app/android" className="nai-footer__app-badge">
                <div className="nai-footer__app-badge-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M3.18 23.76c.3.17.65.19.96.07L13.92 12 3.14.17c-.31-.12-.66-.1-.96.07C1.67.61 1.33 1.12 1.33 1.67v20.66c0 .55.34 1.06.85 1.43zM16.54 9.22l2.1-1.2c.59-.34.95-.95.95-1.64 0-.68-.35-1.3-.95-1.64l-2.1-1.2-2.4 2.35 2.4 2.33zm-2.62 2.78L4.14 22.83l11.78-6.78-2-2.05zm0-4L15.92 6 4.14 1.17l9.78 6.83z"/></svg>
                </div>
                <div>
                  <span className="nai-footer__app-badge-sub">Get it on</span>
                  <span className="nai-footer__app-badge-title">Google Play</span>
                </div>
              </a>
            </div>
          </div>

          {/* Link Columns */}
          <div className="nai-footer__link-cols">
            {footerLinks.map((col) => (
              <div className="nai-footer__link-col" key={col.id} id={`nai-footer-col-${col.id}`}>
                <button
                  className={`nai-footer__col-heading ${activeCol === col.id ? 'nai-footer__col-heading--open' : ''}`}
                  onClick={() => setActiveCol(activeCol === col.id ? null : col.id)}
                  aria-expanded={activeCol === col.id}
                >
                  <span className="nai-footer__col-heading-inner">
                    <span className="nai-footer__col-icon">{col.icon}</span>
                    {col.heading}
                  </span>
                  <ChevronUp size={14} className="nai-footer__col-chevron" />
                </button>
                <ul
                  className={`nai-footer__link-list ${activeCol === col.id ? 'nai-footer__link-list--open' : ''}`}
                  role="list"
                >
                  {col.links.map(link => (
                    <li key={link.href}>
                      <a href={link.href} className="nai-footer__link">
                        <span className="nai-footer__link-icon">{link.icon}</span>
                        <span className="nai-footer__link-label">{link.label}</span>
                        {link.badge && (
                          <span className="nai-footer__link-badge">{link.badge}</span>
                        )}
                        <ArrowRight size={10} className="nai-footer__link-arrow" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ══════════════════════════════════════════
          SECTION 4 — TRENDING TAGS
      ══════════════════════════════════════════ */}
      <div className="nai-footer__tags-row">
        <div className="nai-footer__tags-inner">
          <span className="nai-footer__tags-label">
            <TrendingUp size={13} /> Trending
          </span>
          <div className="nai-footer__tags">
            {recentBadges.map(tag => (
              <a key={tag} href={`/tag/${tag.toLowerCase().replace(/\s+/g, '-')}`} className="nai-footer__tag">
                # {tag}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          SECTION 5 — PARTNER / TRUST STRIP
      ══════════════════════════════════════════ */}
      <div className="nai-footer__trust-strip">
        <div className="nai-footer__trust-inner">
          <span className="nai-footer__trust-label">Trusted & featured by</span>
          <div className="nai-footer__trust-logos">
            {['TechCrunch', 'Wired', 'MIT Tech Review', 'Bloomberg', 'The Verge', 'Forbes'].map(name => (
              <span className="nai-footer__trust-logo" key={name}>{name}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          SECTION 6 — BOTTOM BAR
      ══════════════════════════════════════════ */}
      <div className="nai-footer__bottom-bar">
        <div className="nai-footer__bottom-inner">
          <p className="nai-footer__copyright">
            © {new Date().getFullYear()} <strong>NewsAI</strong>. All rights reserved.
            Built with <span className="nai-footer__heart">♥</span> for the AI-curious.
          </p>

          <div className="nai-footer__bottom-links">
            <a href="/privacy" className="nai-footer__bottom-link">Privacy</a>
            <span className="nai-footer__bottom-sep" />
            <a href="/terms" className="nai-footer__bottom-link">Terms</a>
            <span className="nai-footer__bottom-sep" />
            <a href="/sitemap.xml" className="nai-footer__bottom-link">Sitemap</a>
            <span className="nai-footer__bottom-sep" />
            <a href="/rss.xml" className="nai-footer__bottom-link">
              <Rss size={11} /> RSS
            </a>
          </div>

          <div className="nai-footer__bottom-right">
            <span className="nai-footer__status">
              <span className="nai-footer__status-dot" aria-hidden="true" />
              All systems operational
            </span>
            <button
              className="nai-footer__scroll-top"
              onClick={scrollTop}
              aria-label="Scroll to top"
              title="Back to top"
            >
              <ChevronUp size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ── BOTTOM GLOW LINE ── */}
      <div className="nai-footer__bottom-glow" aria-hidden="true" />
    </footer>
  );
}