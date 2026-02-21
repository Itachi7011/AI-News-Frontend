// src/components/Navbar.jsx
import { useContext, useState, useEffect, useRef } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import {
  Brain,
  ChevronDown,
  Search,
  Sun,
  Moon,
  Menu,
  X,
  Cpu,
  Bot,
  FlaskConical,
  Globe2,
  TrendingUp,
  Newspaper,
  Bookmark,
  Bell,
  Sparkles,
  Zap,
  Shield,
  Layers,
  User,
  LogIn,
  ChevronRight,
} from 'lucide-react';
import Swal from 'sweetalert2';

const navLinks = [
  {
    label: 'Discover',
    id: 'discover',
    icon: <Sparkles size={15} />,
    dropdown: [
      { label: 'Latest AI News', href: '/latest', icon: <Zap size={14} />, desc: 'Breaking stories updated live' },
      { label: 'Trending Now', href: '/trending', icon: <TrendingUp size={14} />, desc: 'What the AI world is talking about' },
      { label: 'Editors\' Picks', href: '/editors-picks', icon: <Newspaper size={14} />, desc: 'Curated by our AI specialists' },
      { label: 'Weekly Digest', href: '/digest', icon: <Bookmark size={14} />, desc: 'Best of the week, summarized' },
    ],
  },
  {
    label: 'Topics',
    id: 'topics',
    icon: <Layers size={15} />,
    dropdown: [
      { label: 'Large Language Models', href: '/topics/llm', icon: <Brain size={14} />, desc: 'GPT, Claude, Gemini & beyond' },
      { label: 'Robotics & Automation', href: '/topics/robotics', icon: <Bot size={14} />, desc: 'AI-powered physical systems' },
      { label: 'AI Research', href: '/topics/research', icon: <FlaskConical size={14} />, desc: 'Papers, breakthroughs & labs' },
      { label: 'AI Hardware & Chips', href: '/topics/hardware', icon: <Cpu size={14} />, desc: 'GPUs, TPUs and silicon race' },
      { label: 'AI Policy & Ethics', href: '/topics/policy', icon: <Shield size={14} />, desc: 'Regulation, safety & society' },
      { label: 'Global AI Race', href: '/topics/global', icon: <Globe2 size={14} />, desc: 'US, China, EU and the world' },
    ],
  },
  {
    label: 'Insights',
    id: 'insights',
    icon: <Brain size={15} />,
    dropdown: [
      { label: 'Deep Analysis', href: '/analysis', icon: <FlaskConical size={14} />, desc: 'Long-form investigative pieces' },
      { label: 'Market Intelligence', href: '/market', icon: <TrendingUp size={14} />, desc: 'AI startup & funding news' },
      { label: 'Expert Opinions', href: '/opinions', icon: <User size={14} />, desc: 'Perspectives from AI leaders' },
    ],
  },
  { label: 'Newsletter', id: 'newsletter', href: '/newsletter', icon: <Bell size={15} /> },
];

export default function Navbar() {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const searchRef = useRef(null);
  const navRef = useRef(null);
  const dropdownTimerRef = useRef(null);

  // Scroll listener
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setActiveDropdown(null);
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleDropdownEnter = (id) => {
    clearTimeout(dropdownTimerRef.current);
    setActiveDropdown(id);
  };

  const handleDropdownLeave = () => {
    dropdownTimerRef.current = setTimeout(() => setActiveDropdown(null), 140);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchVal.trim()) return;
    Swal.fire({
      title: `<span style="font-family:'Syne',sans-serif;font-size:1.1rem">Searching AI News</span>`,
      html: `<p style="font-family:'DM Sans',sans-serif;color:#9ca3af">Results for: <strong style="color:#6366f1">"${searchVal}"</strong></p>`,
      icon: 'info',
      confirmButtonText: 'View Results',
      confirmButtonColor: '#6366f1',
      background: isDarkMode ? '#0f0f1a' : '#ffffff',
      color: isDarkMode ? '#e2e8f0' : '#1e293b',
      showClass: { popup: 'animate__animated animate__fadeInDown' },
    });
    setSearchVal('');
    setSearchOpen(false);
  };

  const handleNewsletterClick = (e) => {
    e.preventDefault();
    Swal.fire({
      title: `<span style="font-family:'Syne',sans-serif">Join NewsAI Newsletter</span>`,
      html: `
        <p style="font-family:'DM Sans',sans-serif;color:#9ca3af;margin-bottom:1rem">Get daily AI breakthroughs, curated for you.</p>
        <input id="swal-email" type="email" placeholder="your@email.com"
          style="width:100%;padding:.65rem 1rem;border-radius:8px;border:1.5px solid #6366f1;background:${isDarkMode ? '#1a1a2e' : '#f8fafc'};color:${isDarkMode ? '#e2e8f0' : '#1e293b'};font-family:'DM Sans',sans-serif;font-size:.95rem;outline:none;" />
      `,
      confirmButtonText: 'Subscribe Free',
      confirmButtonColor: '#6366f1',
      background: isDarkMode ? '#0f0f1a' : '#ffffff',
      color: isDarkMode ? '#e2e8f0' : '#1e293b',
      preConfirm: () => {
        const email = document.getElementById('swal-email').value;
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
          Swal.showValidationMessage('Please enter a valid email');
        }
        return email;
      },
    }).then((res) => {
      if (res.isConfirmed) {
        Swal.fire({
          icon: 'success',
          title: 'You\'re In! 🎉',
          text: 'Welcome to the NewsAI community.',
          confirmButtonColor: '#6366f1',
          background: isDarkMode ? '#0f0f1a' : '#ffffff',
          color: isDarkMode ? '#e2e8f0' : '#1e293b',
        });
      }
    });
  };

  const themeClass = isDarkMode ? 'nai-dark' : 'nai-light';

  return (
    <nav
      ref={navRef}
      className={`nai-navbar ${themeClass} ${scrolled ? 'nai-navbar--scrolled' : ''} ${mobileOpen ? 'nai-navbar--mobile-open' : ''}`}
      role="navigation"
      aria-label="Main Navigation"
    >
      {/* Animated top accent line */}
      <div className="nai-top-accent" aria-hidden="true">
        <div className="nai-top-accent__bar" />
      </div>

      <div className="nai-navbar__inner">
        {/* ── LOGO ── */}
        <a href="/" className="nai-logo" aria-label="NewsAI Home">
          <div className="nai-logo__icon-wrap">
            <Brain className="nai-logo__brain" size={22} />
            <div className="nai-logo__pulse" aria-hidden="true" />
          </div>
          <div className="nai-logo__text">
            <span className="nai-logo__news">News</span>
            <span className="nai-logo__ai">AI</span>
            <span className="nai-logo__badge">BETA</span>
          </div>
        </a>

        {/* ── DESKTOP NAV ── */}
        <ul className="nai-navlist" role="list">
          {navLinks.map((link) => (
            <li
              key={link.id}
              className={`nai-navlist__item ${link.dropdown ? 'nai-navlist__item--has-dropdown' : ''}`}
              onMouseEnter={() => link.dropdown && handleDropdownEnter(link.id)}
              onMouseLeave={() => link.dropdown && handleDropdownLeave()}
            >
              {link.href && !link.dropdown ? (
                <a
                  href={link.href === '/newsletter' ? '#newsletter' : link.href}
                  className="nai-navlist__link"
                  onClick={link.href === '/newsletter' ? handleNewsletterClick : undefined}
                >
                  <span className="nai-navlist__link-icon">{link.icon}</span>
                  {link.label}
                </a>
              ) : (
                <button
                  className={`nai-navlist__link nai-navlist__link--btn ${activeDropdown === link.id ? 'nai-navlist__link--active' : ''}`}
                  aria-expanded={activeDropdown === link.id}
                  aria-haspopup="true"
                  onClick={() => setActiveDropdown(activeDropdown === link.id ? null : link.id)}
                >
                  <span className="nai-navlist__link-icon">{link.icon}</span>
                  {link.label}
                  <ChevronDown
                    size={13}
                    className={`nai-navlist__chevron ${activeDropdown === link.id ? 'nai-navlist__chevron--open' : ''}`}
                  />
                </button>
              )}

              {/* Dropdown Panel */}
              {link.dropdown && (
                <div
                  className={`nai-dropdown ${activeDropdown === link.id ? 'nai-dropdown--visible' : ''} ${link.dropdown.length > 4 ? 'nai-dropdown--wide' : ''}`}
                  role="menu"
                  aria-label={`${link.label} submenu`}
                >
                  <div className="nai-dropdown__glow" aria-hidden="true" />
                  <div className="nai-dropdown__grid">
                    {link.dropdown.map((item) => (
                      <a
                        key={item.href}
                        href={item.href}
                        className="nai-dropdown__item"
                        role="menuitem"
                      >
                        <div className="nai-dropdown__item-icon">{item.icon}</div>
                        <div className="nai-dropdown__item-text">
                          <span className="nai-dropdown__item-label">{item.label}</span>
                          <span className="nai-dropdown__item-desc">{item.desc}</span>
                        </div>
                        <ChevronRight size={12} className="nai-dropdown__item-arrow" />
                      </a>
                    ))}
                  </div>
                  <div className="nai-dropdown__footer">
                    <span className="nai-dropdown__footer-dot" />
                    Powered by NewsAI Intelligence Engine
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>

        {/* ── DESKTOP ACTIONS ── */}
        <div className="nai-actions">
          {/* Search */}
          <div className={`nai-search ${searchOpen ? 'nai-search--open' : ''}`}>
            <form onSubmit={handleSearchSubmit} className="nai-search__form">
              <input
                ref={searchRef}
                type="search"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                placeholder="Search AI news…"
                className="nai-search__input"
                aria-label="Search"
              />
            </form>
            <button
              className="nai-actions__btn nai-actions__btn--search"
              onClick={() => setSearchOpen((v) => !v)}
              aria-label={searchOpen ? 'Close search' : 'Open search'}
              title="Search"
            >
              {searchOpen ? <X size={17} /> : <Search size={17} />}
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            className="nai-actions__btn nai-actions__btn--theme"
           onClick={toggleTheme}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
          >
            <span className={`nai-theme-icon ${isDarkMode ? 'nai-theme-icon--spin-in' : ''}`}>
              {isDarkMode ? <Sun size={17} /> : <Moon size={17} />}
            </span>
          </button>

          {/* Sign In */}
          <a href="/signin" className="nai-actions__signin">
            <LogIn size={15} />
            <span>Sign In</span>
          </a>

          {/* CTA */}
          <a href="/signup" className="nai-actions__cta">
            <Sparkles size={14} />
            <span>Get Started</span>
            <div className="nai-actions__cta-shine" aria-hidden="true" />
          </a>
        </div>

        {/* ── MOBILE HAMBURGER ── */}
        <button
          className="nai-hamburger"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          <span className={`nai-hamburger__lines ${mobileOpen ? 'nai-hamburger__lines--open' : ''}`}>
            <span /><span /><span />
          </span>
        </button>
      </div>

      {/* ── MOBILE DRAWER ── */}
      <div className={`nai-mobile-drawer ${mobileOpen ? 'nai-mobile-drawer--open' : ''}`} aria-hidden={!mobileOpen}>
        <div className="nai-mobile-drawer__inner">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="nai-mobile-search">
            <Search size={16} className="nai-mobile-search__icon" />
            <input
              type="search"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="Search AI news…"
              className="nai-mobile-search__input"
            />
          </form>

          <ul className="nai-mobile-nav" role="list">
            {navLinks.map((link) => (
              <li key={link.id} className="nai-mobile-nav__item">
                {link.dropdown ? (
                  <>
                    <button
                      className={`nai-mobile-nav__link nai-mobile-nav__link--toggle ${mobileExpanded === link.id ? 'nai-mobile-nav__link--expanded' : ''}`}
                      onClick={() => setMobileExpanded(mobileExpanded === link.id ? null : link.id)}
                    >
                      <span className="nai-mobile-nav__link-left">
                        {link.icon} {link.label}
                      </span>
                      <ChevronDown
                        size={15}
                        className={`nai-mobile-nav__chevron ${mobileExpanded === link.id ? 'nai-mobile-nav__chevron--open' : ''}`}
                      />
                    </button>
                    <div className={`nai-mobile-subnav ${mobileExpanded === link.id ? 'nai-mobile-subnav--open' : ''}`}>
                      {link.dropdown.map((item) => (
                        <a key={item.href} href={item.href} className="nai-mobile-subnav__item" onClick={() => setMobileOpen(false)}>
                          <span className="nai-mobile-subnav__icon">{item.icon}</span>
                          <span>{item.label}</span>
                        </a>
                      ))}
                    </div>
                  </>
                ) : (
                  <a
                    href={link.href === '/newsletter' ? '#newsletter' : link.href}
                    className="nai-mobile-nav__link"
                    onClick={(e) => {
                      if (link.href === '/newsletter') { handleNewsletterClick(e); }
                      setMobileOpen(false);
                    }}
                  >
                    <span className="nai-mobile-nav__link-left">
                      {link.icon} {link.label}
                    </span>
                  </a>
                )}
              </li>
            ))}
          </ul>

          <div className="nai-mobile-footer">
            <button className="nai-mobile-theme-btn" onClick={() => {
                toggleTheme();
              }}>
              {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
            <div className="nai-mobile-auth">
              <a href="/signin" className="nai-mobile-auth__signin">
                <LogIn size={14} /> Sign In
              </a>
              <a href="/signup" className="nai-mobile-auth__cta">
                <Sparkles size={14} /> Get Started
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="nai-mobile-overlay"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
    </nav>
  );
}