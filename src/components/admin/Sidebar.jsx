// src/components/AdminSidebar/AdminSidebar.jsx
import { useContext, useState, useRef, useEffect } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import {
  Brain,
  LayoutDashboard,
  Newspaper,
  Users,
  Bot,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Bell,
  Shield,
  Tag,
  Globe2,
  FileText,
  TrendingUp,
  MessageSquare,
  Cpu,
  FlaskConical,
  Layers,
  Bookmark,
  Mail,
  Key,
  AlertTriangle,
  Activity,
  Database,
  Zap,
  Eye,
  Edit3,
  Trash2,
  PlusCircle,
  Search,
  LogOut,
  Star,
  Radio,
  Lock,
  UserCheck,
  BarChart2,
  Rss,
  Sliders,
  HelpCircle,
  Palette,
  Server,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import './AdminSidebar.css';

/* ─────────────────────────────────────────
   NAV STRUCTURE
───────────────────────────────────────── */
const NAV_SECTIONS = [
  {
    sectionLabel: 'Main',
    sectionId: 'nai-sb-sec-main',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: <LayoutDashboard size={18} />,
        href: '/admin',
        badge: null,
      },
      {
        id: 'analytics',
        label: 'Analytics',
        icon: <BarChart3 size={18} />,
        badge: 'New',
        badgeType: 'new',
        children: [
          { id: 'analytics-overview',  label: 'Overview',        href: '/admin/analytics',           icon: <Activity size={14} /> },
          { id: 'analytics-traffic',   label: 'Traffic Reports', href: '/admin/analytics/traffic',   icon: <TrendingUp size={14} /> },
          { id: 'analytics-readers',   label: 'Reader Insights', href: '/admin/analytics/readers',   icon: <Eye size={14} /> },
          { id: 'analytics-revenue',   label: 'Revenue',         href: '/admin/analytics/revenue',   icon: <BarChart2 size={14} /> },
        ],
      },
    ],
  },
  {
    sectionLabel: 'Content',
    sectionId: 'nai-sb-sec-content',
    items: [
      {
        id: 'articles',
        label: 'Articles',
        icon: <Newspaper size={18} />,
        badge: '12',
        badgeType: 'count',
        children: [
          { id: 'articles-all',       label: 'All Articles',    href: '/admin/articles',            icon: <Layers size={14} /> },
          { id: 'articles-new',       label: 'Write New',       href: '/admin/articles/new',        icon: <PlusCircle size={14} /> },
          { id: 'articles-drafts',    label: 'Drafts',          href: '/admin/articles/drafts',     icon: <Edit3 size={14} /> },
          { id: 'articles-scheduled', label: 'Scheduled',       href: '/admin/articles/scheduled',  icon: <Radio size={14} /> },
          { id: 'articles-trash',     label: 'Trash',           href: '/admin/articles/trash',      icon: <Trash2 size={14} /> },
        ],
      },
      {
        id: 'topics',
        label: 'AI Topics',
        icon: <Brain size={18} />,
        children: [
          { id: 'topics-llm',       label: 'Language Models', href: '/admin/topics/llm',      icon: <Bot size={14} /> },
          { id: 'topics-robotics',  label: 'Robotics',        href: '/admin/topics/robotics', icon: <Cpu size={14} /> },
          { id: 'topics-research',  label: 'Research',        href: '/admin/topics/research', icon: <FlaskConical size={14} /> },
          { id: 'topics-policy',    label: 'Policy & Ethics', href: '/admin/topics/policy',   icon: <Shield size={14} /> },
          { id: 'topics-global',    label: 'Global AI',       href: '/admin/topics/global',   icon: <Globe2 size={14} /> },
        ],
      },
      {
        id: 'tags',
        label: 'Tags & Labels',
        icon: <Tag size={18} />,
        href: '/admin/tags',
      },
      {
        id: 'media',
        label: 'Media Library',
        icon: <Database size={18} />,
        href: '/admin/media',
        badge: '3',
        badgeType: 'alert',
      },
    ],
  },
  {
    sectionLabel: 'Audience',
    sectionId: 'nai-sb-sec-audience',
    items: [
      {
        id: 'users',
        label: 'Users',
        icon: <Users size={18} />,
        badge: '5',
        badgeType: 'count',
        children: [
          { id: 'users-all',       label: 'All Users',    href: '/admin/users',           icon: <Users size={14} /> },
          { id: 'users-verified',  label: 'Verified',     href: '/admin/users/verified',  icon: <UserCheck size={14} /> },
          { id: 'users-roles',     label: 'Roles',        href: '/admin/users/roles',     icon: <Key size={14} /> },
          { id: 'users-banned',    label: 'Banned',       href: '/admin/users/banned',    icon: <Lock size={14} /> },
        ],
      },
      {
        id: 'comments',
        label: 'Comments',
        icon: <MessageSquare size={18} />,
        badge: '24',
        badgeType: 'alert',
        children: [
          { id: 'comments-all',     label: 'All Comments', href: '/admin/comments',          icon: <MessageSquare size={14} /> },
          { id: 'comments-pending', label: 'Pending',      href: '/admin/comments/pending',  icon: <AlertTriangle size={14} /> },
          { id: 'comments-spam',    label: 'Spam',         href: '/admin/comments/spam',     icon: <Trash2 size={14} /> },
        ],
      },
      {
        id: 'newsletter',
        label: 'Newsletter',
        icon: <Mail size={18} />,
        children: [
          { id: 'nl-subscribers', label: 'Subscribers',  href: '/admin/newsletter/subscribers', icon: <Users size={14} /> },
          { id: 'nl-campaigns',   label: 'Campaigns',    href: '/admin/newsletter/campaigns',   icon: <Rss size={14} /> },
          { id: 'nl-compose',     label: 'Compose',      href: '/admin/newsletter/compose',     icon: <Edit3 size={14} /> },
        ],
      },
      {
        id: 'bookmarks',
        label: 'Bookmarks',
        icon: <Bookmark size={18} />,
        href: '/admin/bookmarks',
      },
    ],
  },
  {
    sectionLabel: 'AI Engine',
    sectionId: 'nai-sb-sec-ai',
    items: [
      {
        id: 'ai-tools',
        label: 'AI Tools',
        icon: <Sparkles size={18} />,
        badge: 'Beta',
        badgeType: 'beta',
        children: [
          { id: 'ai-summarizer',  label: 'Summarizer',    href: '/admin/ai/summarizer',   icon: <FileText size={14} /> },
          { id: 'ai-classifier',  label: 'Classifier',    href: '/admin/ai/classifier',   icon: <Bot size={14} /> },
          { id: 'ai-trending',    label: 'Trend Detector',href: '/admin/ai/trending',     icon: <TrendingUp size={14} /> },
          { id: 'ai-search',      label: 'Smart Search',  href: '/admin/ai/search',       icon: <Search size={14} /> },
        ],
      },
      {
        id: 'feeds',
        label: 'News Feeds',
        icon: <Zap size={18} />,
        href: '/admin/feeds',
      },
    ],
  },
  {
    sectionLabel: 'System',
    sectionId: 'nai-sb-sec-system',
    items: [
      {
        id: 'notifications',
        label: 'Notifications',
        icon: <Bell size={18} />,
        badge: '7',
        badgeType: 'alert',
        href: '/admin/notifications',
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: <Settings size={18} />,
        children: [
          { id: 'settings-general',    label: 'General',      href: '/admin/settings',           icon: <Sliders size={14} /> },
          { id: 'settings-appearance', label: 'Appearance',   href: '/admin/settings/appearance', icon: <Palette size={14} /> },
          { id: 'settings-security',   label: 'Security',     href: '/admin/settings/security',   icon: <Shield size={14} /> },
          { id: 'settings-api',        label: 'API Keys',     href: '/admin/settings/api',        icon: <Key size={14} /> },
          { id: 'settings-server',     label: 'Server',       href: '/admin/settings/server',     icon: <Server size={14} /> },
        ],
      },
      {
        id: 'help',
        label: 'Help & Docs',
        icon: <HelpCircle size={18} />,
        href: '/admin/help',
      },
      {
        id: 'visit-site',
        label: 'Visit Site',
        icon: <ExternalLink size={18} />,
        href: '/',
        external: true,
      },
    ],
  },
];

/* ─────────────────────────────────────────
   ADMIN INFO (replace with real data/context)
───────────────────────────────────────── */
const ADMIN = {
  name: 'Alex Morgan',
  role: 'Super Admin',
  avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=alexmorgan&backgroundColor=b6e3f4',
  status: 'online',
  initials: 'AM',
};

/* ─────────────────────────────────────────
   COMPONENT
───────────────────────────────────────── */
export default function AdminSidebar() {
  const { isDarkMode } = useContext(ThemeContext);
  const [expanded, setExpanded] = useState(true);
  const [openDropdowns, setOpenDropdowns] = useState({});
  const [activeItem, setActiveItem] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const tooltipTimerRef = useRef(null);

  // Close mobile on resize
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 900) setMobileOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Lock body scroll on mobile open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const toggleDropdown = (id) => {
    if (!expanded) {
      setExpanded(true);
      setOpenDropdowns({ [id]: true });
      return;
    }
    setOpenDropdowns(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleItemClick = (item) => {
    if (item.children) {
      toggleDropdown(item.id);
    } else {
      setActiveItem(item.id);
      if (mobileOpen) setMobileOpen(false);
    }
  };

  const handleCollapse = () => {
    setExpanded(prev => {
      if (prev) setOpenDropdowns({});
      return !prev;
    });
  };

  const handleTooltipEnter = (id) => {
    if (!expanded) {
      clearTimeout(tooltipTimerRef.current);
      setHoveredItem(id);
    }
  };
  const handleTooltipLeave = () => {
    tooltipTimerRef.current = setTimeout(() => setHoveredItem(null), 100);
  };

  const themeClass = isDarkMode ? 'dark' : 'light';

  return (
    <>
      {/* Mobile Hamburger Trigger */}
      <button
        className={`nai-sb-mobile-trigger ${themeClass}`}
        onClick={() => setMobileOpen(v => !v)}
        aria-label="Toggle admin sidebar"
        aria-expanded={mobileOpen}
      >
        {mobileOpen
          ? <PanelLeftClose size={20} />
          : <PanelLeftOpen size={20} />
        }
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="nai-sb-overlay"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── SIDEBAR SHELL ── */}
      <aside
        className={`nai-sb ${themeClass} ${expanded ? 'nai-sb--expanded' : 'nai-sb--collapsed'} ${mobileOpen ? 'nai-sb--mobile-open' : ''}`}
        id="nai-admin-sidebar"
        aria-label="Admin Navigation"
      >
        {/* Decorative background elements */}
        <div className="nai-sb__bg-glow nai-sb__bg-glow--1" aria-hidden="true" />
        <div className="nai-sb__bg-glow nai-sb__bg-glow--2" aria-hidden="true" />
        <div className="nai-sb__bg-grid" aria-hidden="true" />

        {/* ── HEADER ── */}
        <header className="nai-sb__header">
          <a href="/admin" className="nai-sb__logo" aria-label="NewsAI Admin">
            <span className="nai-sb__logo-icon">
              <Brain size={19} />
              <span className="nai-sb__logo-pulse" aria-hidden="true" />
            </span>
            {expanded && (
              <span className="nai-sb__logo-text">
                <span className="nai-sb__logo-name">News<em>AI</em></span>
                <span className="nai-sb__logo-sub">Admin Console</span>
              </span>
            )}
          </a>

          <button
            className="nai-sb__collapse-btn"
            onClick={handleCollapse}
            aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
            title={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded
              ? <PanelLeftClose size={16} />
              : <PanelLeftOpen size={16} />
            }
          </button>
        </header>

        {/* ── ADMIN PROFILE ── */}
        <div className={`nai-sb__profile ${expanded ? 'nai-sb__profile--expanded' : 'nai-sb__profile--collapsed'}`}>
          <a href="/admin/profile" className="nai-sb__profile-avatar-wrap" aria-label="Admin profile">
            <span className="nai-sb__profile-avatar-ring" aria-hidden="true" />
            <img
              src={ADMIN.avatar}
              alt={ADMIN.name}
              className="nai-sb__profile-avatar"
              onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
            />
            <span className="nai-sb__profile-avatar-fallback" aria-hidden="true">{ADMIN.initials}</span>
            <span
              className={`nai-sb__profile-status nai-sb__profile-status--${ADMIN.status}`}
              aria-label={`Status: ${ADMIN.status}`}
            />
          </a>
          {expanded && (
            <span className="nai-sb__profile-info">
              <span className="nai-sb__profile-name">{ADMIN.name}</span>
              <span className="nai-sb__profile-role">
                <Star size={9} /> {ADMIN.role}
              </span>
            </span>
          )}
        </div>

        {/* ── SEARCH (expanded only) ── */}
        {expanded && (
          <div className="nai-sb__search-wrap">
            <Search size={13} className="nai-sb__search-icon" />
            <input
              type="search"
              placeholder="Quick search…"
              className="nai-sb__search-input"
              aria-label="Quick search"
            />
          </div>
        )}

        {/* ── NAV ── */}
        <nav className="nai-sb__nav" aria-label="Admin sections">
          {NAV_SECTIONS.map((section) => (
            <section key={section.sectionId} className="nai-sb__section" id={section.sectionId}>
              {expanded && (
                <span className="nai-sb__section-label">{section.sectionLabel}</span>
              )}
              {!expanded && <span className="nai-sb__section-divider" aria-hidden="true" />}

              <ul className="nai-sb__nav-list" role="list">
                {section.items.map((item) => (
                  <li key={item.id} className="nai-sb__nav-item">
                    {/* Parent / leaf node */}
                    {item.href && !item.children ? (
                      <a
                        href={item.href}
                        target={item.external ? '_blank' : undefined}
                        rel={item.external ? 'noopener noreferrer' : undefined}
                        className={`nai-sb__nav-link ${activeItem === item.id ? 'nai-sb__nav-link--active' : ''}`}
                        onClick={() => handleItemClick(item)}
                        onMouseEnter={() => handleTooltipEnter(item.id)}
                        onMouseLeave={handleTooltipLeave}
                        aria-current={activeItem === item.id ? 'page' : undefined}
                      >
                        <span className="nai-sb__nav-link-inner">
                          <span className="nai-sb__nav-icon">{item.icon}</span>
                          {expanded && <span className="nai-sb__nav-label">{item.label}</span>}
                        </span>
                        {expanded && item.badge && (
                          <span className={`nai-sb__badge nai-sb__badge--${item.badgeType}`}>{item.badge}</span>
                        )}
                        {item.external && expanded && <ExternalLink size={11} className="nai-sb__external-icon" />}
                        {/* Tooltip when collapsed */}
                        {!expanded && hoveredItem === item.id && (
                          <span className="nai-sb__tooltip" role="tooltip">{item.label}</span>
                        )}
                      </a>
                    ) : (
                      <>
                        <button
                          className={`nai-sb__nav-link nai-sb__nav-link--trigger ${openDropdowns[item.id] ? 'nai-sb__nav-link--open' : ''} ${activeItem === item.id ? 'nai-sb__nav-link--active' : ''}`}
                          onClick={() => handleItemClick(item)}
                          onMouseEnter={() => handleTooltipEnter(item.id)}
                          onMouseLeave={handleTooltipLeave}
                          aria-expanded={!!openDropdowns[item.id]}
                          aria-haspopup="true"
                        >
                          <span className="nai-sb__nav-link-inner">
                            <span className="nai-sb__nav-icon">{item.icon}</span>
                            {expanded && <span className="nai-sb__nav-label">{item.label}</span>}
                          </span>
                          {expanded && (
                            <>
                              {item.badge && (
                                <span className={`nai-sb__badge nai-sb__badge--${item.badgeType}`}>{item.badge}</span>
                              )}
                              <ChevronDown
                                size={13}
                                className={`nai-sb__nav-chevron ${openDropdowns[item.id] ? 'nai-sb__nav-chevron--open' : ''}`}
                              />
                            </>
                          )}
                          {/* Tooltip when collapsed */}
                          {!expanded && hoveredItem === item.id && (
                            <span className="nai-sb__tooltip" role="tooltip">{item.label}</span>
                          )}
                        </button>

                        {/* Sub-menu */}
                        <ul
                          className={`nai-sb__sub-list ${openDropdowns[item.id] && expanded ? 'nai-sb__sub-list--open' : ''}`}
                          role="list"
                          aria-label={`${item.label} submenu`}
                        >
                          {item.children?.map((child, ci) => (
                            <li key={child.id} className="nai-sb__sub-item">
                              <a
                                href={child.href}
                                className={`nai-sb__sub-link ${activeItem === child.id ? 'nai-sb__sub-link--active' : ''}`}
                                onClick={() => { setActiveItem(child.id); if (mobileOpen) setMobileOpen(false); }}
                                style={{ '--nai-sb-sub-delay': `${ci * 35}ms` }}
                              >
                                <span className="nai-sb__sub-icon">{child.icon}</span>
                                <span className="nai-sb__sub-label">{child.label}</span>
                                <ChevronRight size={10} className="nai-sb__sub-arrow" />
                              </a>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </nav>

        {/* ── FOOTER ── */}
        <footer className="nai-sb__footer">
          {expanded && (
            <span className="nai-sb__footer-version">
              <Zap size={10} /> NewsAI v2.4.1
            </span>
          )}
          <a
            href="/admin/logout"
            className="nai-sb__logout"
            aria-label="Log out"
            title="Log out"
            onMouseEnter={() => !expanded && handleTooltipEnter('logout')}
            onMouseLeave={handleTooltipLeave}
          >
            <LogOut size={16} />
            {expanded && <span className="nai-sb__logout-label">Log Out</span>}
            {!expanded && hoveredItem === 'logout' && (
              <span className="nai-sb__tooltip" role="tooltip">Log Out</span>
            )}
          </a>
        </footer>
      </aside>
    </>
  );
}