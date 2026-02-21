import { useState, useEffect, useContext, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Check, X, Zap, Shield, Star, Crown, Rocket, ChevronDown, ChevronUp,
  HelpCircle, ArrowRight, Sparkles, Globe, Users, BarChart2, Clock,
  BookOpen, Bell, Download, Cpu, Award, RefreshCw, Lock, ExternalLink,
  CheckCircle, AlertCircle, Info, Flame, TrendingUp
} from 'lucide-react';
import Swal from 'sweetalert2';
import { ThemeContext } from '../../context/ThemeContext';

const USER_TOKEN_KEY = 'ai_news_user_token';
const getUserToken = () => localStorage.getItem(USER_TOKEN_KEY);

/* ─── MOCK DATA ──────────────────────────────────────────── */
const PLANS_MOCK = [
  {
    _id: 'plan-free',
    name: 'Free',
    slug: 'free',
    tagline: 'Explore AI news without limits',
    price: { monthly: 0, annual: 0 },
    badge: null,
    color: '#888888',
    icon: 'globe',
    isPopular: false,
    isCurrent: false,
    features: [
      { label: '50 articles per month', included: true },
      { label: 'Access to breaking news', included: true },
      { label: 'Basic search & filters', included: true },
      { label: 'Comment on articles', included: true },
      { label: '1 saved bookmark list', included: true },
      { label: 'Email newsletter (weekly)', included: true },
      { label: 'Advanced analytics dashboard', included: false },
      { label: 'Exclusive deep-dive reports', included: false },
      { label: 'Early access to articles', included: false },
      { label: 'Ad-free experience', included: false },
      { label: 'Priority support', included: false },
      { label: 'API access', included: false },
    ],
    limits: { articlesPerMonth: 50, bookmarkLists: 1, apiCalls: 0, teamMembers: 1 },
    ctaLabel: 'Get Started Free',
    ctaAction: 'signup',
  },
  {
    _id: 'plan-pro',
    name: 'Pro',
    slug: 'pro',
    tagline: 'For AI enthusiasts who need more',
    price: { monthly: 12, annual: 9 },
    badge: 'Most Popular',
    color: '#e63946',
    icon: 'zap',
    isPopular: true,
    isCurrent: false,
    features: [
      { label: 'Unlimited articles', included: true },
      { label: 'Access to breaking news', included: true },
      { label: 'Advanced search & filters', included: true },
      { label: 'Comment on articles', included: true },
      { label: 'Unlimited bookmark lists', included: true },
      { label: 'Email newsletter (daily digest)', included: true },
      { label: 'Advanced analytics dashboard', included: true },
      { label: 'Exclusive deep-dive reports', included: true },
      { label: '24-hour early access to articles', included: true },
      { label: 'Ad-free experience', included: true },
      { label: 'Priority support', included: false },
      { label: 'API access (1,000 calls/mo)', included: false },
    ],
    limits: { articlesPerMonth: -1, bookmarkLists: -1, apiCalls: 0, teamMembers: 1 },
    ctaLabel: 'Upgrade to Pro',
    ctaAction: 'upgrade',
  },
  {
    _id: 'plan-elite',
    name: 'Elite',
    slug: 'elite',
    tagline: 'Everything Pro, plus exclusive perks',
    price: { monthly: 24, annual: 19 },
    badge: 'Best Value',
    color: '#ffd166',
    icon: 'star',
    isPopular: false,
    isCurrent: false,
    features: [
      { label: 'Unlimited articles', included: true },
      { label: 'Access to breaking news', included: true },
      { label: 'Advanced search & filters', included: true },
      { label: 'Comment on articles', included: true },
      { label: 'Unlimited bookmark lists', included: true },
      { label: 'Email newsletter (real-time alerts)', included: true },
      { label: 'Advanced analytics dashboard', included: true },
      { label: 'Exclusive deep-dive reports', included: true },
      { label: '72-hour early access to articles', included: true },
      { label: 'Ad-free experience', included: true },
      { label: 'Priority support (24h response)', included: true },
      { label: 'API access (10,000 calls/mo)', included: true },
    ],
    limits: { articlesPerMonth: -1, bookmarkLists: -1, apiCalls: 10000, teamMembers: 1 },
    ctaLabel: 'Go Elite',
    ctaAction: 'upgrade',
  },
  {
    _id: 'plan-enterprise',
    name: 'Enterprise',
    slug: 'enterprise',
    tagline: 'Custom solutions for teams & organizations',
    price: { monthly: null, annual: null },
    badge: 'Custom Pricing',
    color: '#118ab2',
    icon: 'crown',
    isPopular: false,
    isCurrent: false,
    features: [
      { label: 'Everything in Elite', included: true },
      { label: 'Unlimited team members', included: true },
      { label: 'Custom content feeds', included: true },
      { label: 'White-label options', included: true },
      { label: 'Dedicated account manager', included: true },
      { label: 'SLA-backed uptime guarantee', included: true },
      { label: 'SSO & SAML integration', included: true },
      { label: 'Audit logs & compliance tools', included: true },
      { label: 'API access (unlimited)', included: true },
      { label: 'Custom integrations & webhooks', included: true },
      { label: 'Priority support (1h response)', included: true },
      { label: 'Onboarding & training sessions', included: true },
    ],
    limits: { articlesPerMonth: -1, bookmarkLists: -1, apiCalls: -1, teamMembers: -1 },
    ctaLabel: 'Contact Sales',
    ctaAction: 'contact',
  },
];

const FAQS = [
  { q: 'Can I switch plans at any time?', a: 'Yes! You can upgrade or downgrade your plan at any time. Upgrades take effect immediately and you\'ll receive a prorated credit. Downgrades take effect at the end of your current billing cycle.' },
  { q: 'What payment methods do you accept?', a: 'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and for Enterprise customers we also support wire transfer and invoice-based billing.' },
  { q: 'Is there a free trial for paid plans?', a: 'Yes! All paid plans come with a 14-day free trial, no credit card required. You\'ll only be charged when your trial ends and you choose to continue.' },
  { q: 'What happens to my data if I downgrade?', a: 'Your data is never deleted. If you downgrade, you\'ll retain access to content you created, but some features may become locked. Your bookmarks, comments, and history are always preserved.' },
  { q: 'Do annual plans auto-renew?', a: 'Yes, all subscriptions auto-renew. You\'ll receive a reminder email 7 days before renewal. You can cancel anytime from your account settings.' },
  { q: 'Is there a student or nonprofit discount?', a: 'Absolutely. We offer 50% off all paid plans for verified students and nonprofit organizations. Contact our support team with your credentials to apply.' },
];

const TESTIMONIALS = [
  { name: 'Sarah K.', role: 'ML Engineer @ Stripe', plan: 'Elite', text: 'The early access feature alone is worth it. I get to read about model releases 72 hours before they trend on Twitter. Game-changer for staying ahead in this field.' },
  { name: 'Marcus T.', role: 'AI Researcher', plan: 'Pro', text: 'Upgraded from Free to Pro and instantly had access to deep-dive reports I\'d been missing. The analytics dashboard showing what topics are trending is genuinely useful.' },
  { name: 'Zainab O.', role: 'Head of AI @ TechCorp', plan: 'Enterprise', text: 'Our entire AI strategy team is on the Enterprise plan. The custom feeds and API access let us integrate AI news directly into our internal dashboards. The account manager is incredibly responsive.' },
];

const PLAN_ICONS = {
  globe: <Globe size={22} />,
  zap: <Zap size={22} />,
  star: <Star size={22} />,
  crown: <Crown size={22} />,
};

/* ──────────────────────────────────────────────────────────── */
export default function SubscriptionPlans() {
  const { isDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const userToken = getUserToken();

  const [plans, setPlans] = useState(PLANS_MOCK);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [billing, setBilling] = useState('monthly'); // 'monthly' | 'annual'
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
  const [compareOpen, setCompareOpen] = useState(false);

  const swalTheme = {
    background: isDarkMode ? '#111' : '#fff',
    color: isDarkMode ? '#f0f0f0' : '#0d0d0d',
    confirmButtonColor: '#e63946',
  };

  /* ─── FETCH PLANS + USER'S CURRENT PLAN ──── */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const plansRes = await fetch('/api/public/subscription/plans');
        if (plansRes.ok) {
          const pd = await plansRes.json();
          setPlans(pd.plans || pd || PLANS_MOCK);
        }
        if (userToken) {
          const userRes = await fetch('/api/user/subscription/current', {
            headers: { Authorization: `Bearer ${userToken}` },
          });
          if (userRes.ok) {
            const ud = await userRes.json();
            setCurrentPlan(ud.plan?.slug || 'free');
            setPlans(prev => prev.map(p => ({
              ...p,
              isCurrent: p.slug === (ud.plan?.slug || 'free'),
            })));
          } else {
            setCurrentPlan('free');
            setPlans(prev => prev.map(p => ({ ...p, isCurrent: p.slug === 'free' })));
          }
        }
      } catch {
        setCurrentPlan('free');
        setPlans(prev => prev.map(p => ({ ...p, isCurrent: p.slug === 'free' })));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userToken]);

  /* ─── HANDLE CTA ─────────────────────────── */
  const handlePlanAction = async (plan) => {
    if (plan.ctaAction === 'contact') {
      navigate('/contact?subject=Enterprise+Inquiry');
      return;
    }
    if (!userToken) {
      Swal.fire({
        title: 'Create an account',
        text: `Sign up to get started with the ${plan.name} plan`,
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Sign Up',
        cancelButtonText: 'Log In',
        ...swalTheme,
      }).then(r => {
        if (r.isConfirmed) navigate('/signup');
        else if (r.dismiss === Swal.DismissReason.cancel) navigate('/login');
      });
      return;
    }
    if (plan.isCurrent) return;

    const planOrder = ['free', 'pro', 'elite', 'enterprise'];
    const currentIdx = planOrder.indexOf(currentPlan);
    const targetIdx = planOrder.indexOf(plan.slug);
    const isUpgrade = targetIdx > currentIdx;
    const isDowngrade = targetIdx < currentIdx;

    const confirmed = await Swal.fire({
      title: isUpgrade ? `Upgrade to ${plan.name}?` : `Downgrade to ${plan.name}?`,
      html: isUpgrade
        ? `<p>You'll be charged <strong>${billing === 'annual' ? `$${plan.price.annual}/mo` : `$${plan.price.monthly}/mo`}</strong> (billed ${billing}).</p><p style="margin-top:0.5rem;font-size:0.85rem;opacity:0.7">14-day free trial included if you haven't used one.</p>`
        : `<p>Downgrading will take effect at the end of your current billing period. Some features will become unavailable.</p>`,
      icon: isUpgrade ? 'question' : 'warning',
      showCancelButton: true,
      confirmButtonText: isUpgrade ? `Upgrade Now` : `Yes, Downgrade`,
      cancelButtonText: 'Cancel',
      ...swalTheme,
    });

    if (!confirmed.isConfirmed) return;
    setActionLoading(plan._id);

    try {
      const res = await fetch('/api/user/subscription/change', {
        method: 'POST',
        headers: { Authorization: `Bearer ${userToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan._id, planSlug: plan.slug, billingCycle: billing }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();

      // If payment URL is returned, redirect
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      setCurrentPlan(plan.slug);
      setPlans(prev => prev.map(p => ({ ...p, isCurrent: p.slug === plan.slug })));
      Swal.fire({
        title: isUpgrade ? 'Upgraded!' : 'Plan Changed',
        text: isUpgrade ? `Welcome to ${plan.name}! Your new features are active.` : `You've been moved to ${plan.name}. Changes take effect next cycle.`,
        icon: 'success',
        timer: 2500,
        showConfirmButton: false,
        ...swalTheme,
      });
    } catch {
      Swal.fire({ title: 'Error', text: 'Could not change your plan. Please try again or contact support.', icon: 'error', ...swalTheme });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelSubscription = async () => {
    if (!userToken) return;
    const confirmed = await Swal.fire({
      title: 'Cancel Subscription?',
      text: 'You\'ll retain access until the end of your billing period. You can resubscribe anytime.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Cancel',
      cancelButtonText: 'Keep My Plan',
      confirmButtonColor: '#888',
      ...swalTheme,
    });
    if (!confirmed.isConfirmed) return;
    try {
      await fetch('/api/user/subscription/cancel', {
        method: 'POST',
        headers: { Authorization: `Bearer ${userToken}`, 'Content-Type': 'application/json' },
      });
      Swal.fire({ title: 'Cancelled', text: 'Your subscription has been cancelled. You\'ll retain access until the end of the billing period.', icon: 'success', ...swalTheme });
    } catch {
      Swal.fire({ title: 'Error', text: 'Could not cancel subscription. Please contact support.', icon: 'error', ...swalTheme });
    }
  };

  const getPlanIcon = (iconKey) => PLAN_ICONS[iconKey] || <Zap size={22} />;

  const annualSavings = (plan) => {
    if (!plan.price.monthly || !plan.price.annual) return null;
    const saved = ((plan.price.monthly - plan.price.annual) * 12).toFixed(0);
    const pct = Math.round(((plan.price.monthly - plan.price.annual) / plan.price.monthly) * 100);
    return { saved, pct };
  };

  return (
    <div className={`ai-news-sub-root ${isDarkMode ? 'dark' : ''}`}>

      {/* ── HERO ──────────────────────────────────── */}
      <div className="ai-news-sub-hero">
        <div className="ai-news-sub-hero-bg" />
        <div className="ai-news-sub-hero-content">
          <div className="ai-news-sub-hero-label">
            <Sparkles size={13} /> Flexible Plans for Every AI Enthusiast
          </div>
          <h1 className="ai-news-sub-hero-title">
            Choose Your AI News Experience
          </h1>
          <p className="ai-news-sub-hero-sub">
            From casual browsing to deep research, we have a plan that fits your needs.
            All paid plans include a 14-day free trial.
          </p>

          {/* Billing Toggle */}
          <div className="ai-news-sub-billing-toggle">
            <button
              className={`ai-news-sub-billing-btn ${billing === 'monthly' ? 'active' : ''}`}
              onClick={() => setBilling('monthly')}
            >
              Monthly
            </button>
            <button
              className={`ai-news-sub-billing-btn ${billing === 'annual' ? 'active' : ''}`}
              onClick={() => setBilling('annual')}
            >
              Annual
              <span className="ai-news-sub-billing-save">Save up to 25%</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── CURRENT PLAN NOTICE ───────────────────── */}
      {userToken && currentPlan && currentPlan !== 'free' && (
        <div className="ai-news-sub-current-notice">
          <CheckCircle size={15} />
          You're currently on the <strong style={{ textTransform: 'capitalize' }}>{currentPlan}</strong> plan.
          <button className="ai-news-sub-cancel-link" onClick={handleCancelSubscription}>
            Cancel subscription
          </button>
        </div>
      )}

      {/* ── PLANS GRID ────────────────────────────── */}
      <div className="ai-news-sub-plans-wrap">
        <div className="ai-news-sub-plans-grid">
          {plans.map((plan) => {
            const savings = annualSavings(plan);
            const isActive = actionLoading === plan._id;
            const price = billing === 'annual' ? plan.price.annual : plan.price.monthly;

            return (
              <div
                key={plan._id}
                className={`ai-news-sub-plan-card ${plan.isPopular ? 'popular' : ''} ${plan.isCurrent ? 'current' : ''}`}
                style={{ '--plan-color': plan.color }}
              >
                {plan.badge && (
                  <div className="ai-news-sub-plan-badge" style={{ background: plan.color, color: plan.slug === 'elite' ? '#111' : '#fff' }}>
                    {plan.badge}
                  </div>
                )}
                {plan.isCurrent && (
                  <div className="ai-news-sub-plan-badge" style={{ background: 'var(--sub-teal)', color: '#111' }}>
                    <CheckCircle size={11} /> Your Plan
                  </div>
                )}

                <div className="ai-news-sub-plan-icon" style={{ background: `${plan.color}18`, color: plan.color }}>
                  {getPlanIcon(plan.icon)}
                </div>

                <h2 className="ai-news-sub-plan-name">{plan.name}</h2>
                <p className="ai-news-sub-plan-tagline">{plan.tagline}</p>

                <div className="ai-news-sub-plan-price">
                  {price === null ? (
                    <span className="ai-news-sub-plan-price-custom">Custom</span>
                  ) : price === 0 ? (
                    <><span className="ai-news-sub-plan-amount">Free</span></>
                  ) : (
                    <>
                      <span className="ai-news-sub-plan-currency">$</span>
                      <span className="ai-news-sub-plan-amount">{price}</span>
                      <span className="ai-news-sub-plan-period">/mo</span>
                    </>
                  )}
                </div>

                {billing === 'annual' && savings && (
                  <div className="ai-news-sub-plan-annual-note">
                    Billed ${(savings.saved / 1).toFixed(0) && price && (price * 12).toFixed(0)} annually · Save {savings.pct}%
                  </div>
                )}

                {billing === 'monthly' && plan.price.annual && plan.price.monthly && (
                  <div className="ai-news-sub-plan-annual-note" style={{ color: 'var(--sub-teal)' }}>
                    Switch to annual & save {annualSavings(plan)?.pct}%
                  </div>
                )}

                <ul className="ai-news-sub-plan-features">
                  {plan.features.map((f, i) => (
                    <li key={i} className={`ai-news-sub-plan-feature ${f.included ? 'included' : 'excluded'}`}>
                      {f.included
                        ? <Check size={14} style={{ color: plan.color, flexShrink: 0 }} />
                        : <X size={14} style={{ color: 'var(--sub-text-3)', flexShrink: 0 }} />
                      }
                      <span>{f.label}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`ai-news-sub-plan-cta ${plan.isPopular ? 'primary' : 'ghost'} ${plan.isCurrent ? 'current' : ''}`}
                  style={plan.isPopular ? { background: plan.color, boxShadow: `0 4px 20px ${plan.color}40` } : {}}
                  onClick={() => handlePlanAction(plan)}
                  disabled={plan.isCurrent || isActive}
                >
                  {isActive ? (
                    <RefreshCw size={15} className="ai-news-sub-spin" />
                  ) : plan.isCurrent ? (
                    <><CheckCircle size={15} /> Current Plan</>
                  ) : (
                    <>{plan.ctaLabel} <ArrowRight size={15} /></>
                  )}
                </button>

                {plan.slug !== 'free' && plan.slug !== 'enterprise' && !plan.isCurrent && (
                  <p className="ai-news-sub-plan-trial-note">
                    <Shield size={11} /> 14-day free trial · No credit card required
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── FEATURE COMPARISON TABLE ──────────────── */}
      <div className="ai-news-sub-compare-wrap">
        <button className="ai-news-sub-compare-toggle" onClick={() => setCompareOpen(p => !p)}>
          {compareOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          {compareOpen ? 'Hide' : 'Show'} Full Feature Comparison
        </button>
        {compareOpen && (
          <div className="ai-news-sub-compare-table-wrap">
            <table className="ai-news-sub-compare-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  {plans.map(p => (
                    <th key={p._id} style={{ color: p.color }}>
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {plans[1].features.map((_, fi) => (
                  <tr key={fi}>
                    <td>{plans[1].features[fi].label.replace(/\s*\(.*\)/, '')}</td>
                    {plans.map(p => (
                      <td key={p._id}>
                        {p.features[fi]?.included
                          ? <Check size={16} style={{ color: p.color }} />
                          : <X size={16} style={{ color: 'var(--sub-text-3)' }} />
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── TESTIMONIALS ─────────────────────────── */}
      <div className="ai-news-sub-testimonials-wrap">
        <h2 className="ai-news-sub-section-title">What Our Members Say</h2>
        <div className="ai-news-sub-testimonials-grid">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="ai-news-sub-testimonial">
              <div className="ai-news-sub-testimonial-stars">
                {[...Array(5)].map((_, si) => <Star key={si} size={14} fill="#ffd166" color="#ffd166" />)}
              </div>
              <p className="ai-news-sub-testimonial-text">"{t.text}"</p>
              <div className="ai-news-sub-testimonial-author">
                <div className="ai-news-sub-testimonial-avatar">
                  {t.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="ai-news-sub-testimonial-name">{t.name}</div>
                  <div className="ai-news-sub-testimonial-role">{t.role}</div>
                </div>
                <span className="ai-news-sub-plan-chip" style={{ marginLeft: 'auto' }}>{t.plan}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── TRUST BADGES ─────────────────────────── */}
      <div className="ai-news-sub-trust-wrap">
        {[
          { icon: <Shield size={20} />, label: 'Secure Payments', sub: 'SSL encrypted checkout' },
          { icon: <RefreshCw size={20} />, label: 'Cancel Anytime', sub: 'No lock-in contracts' },
          { icon: <Award size={20} />, label: '14-Day Trial', sub: 'Risk-free for all paid plans' },
          { icon: <Clock size={20} />, label: '24/7 Access', sub: 'Always-on news coverage' },
        ].map((b, i) => (
          <div key={i} className="ai-news-sub-trust-item">
            <div className="ai-news-sub-trust-icon">{b.icon}</div>
            <div>
              <div className="ai-news-sub-trust-label">{b.label}</div>
              <div className="ai-news-sub-trust-sub">{b.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── FAQ ──────────────────────────────────── */}
      <div className="ai-news-sub-faq-wrap">
        <h2 className="ai-news-sub-section-title">Frequently Asked Questions</h2>
        <div className="ai-news-sub-faq-list">
          {FAQS.map((faq, i) => (
            <div key={i} className={`ai-news-sub-faq-item ${openFaq === i ? 'open' : ''}`}>
              <button className="ai-news-sub-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <HelpCircle size={16} />
                <span>{faq.q}</span>
                {openFaq === i ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {openFaq === i && (
                <div className="ai-news-sub-faq-a">{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── BOTTOM CTA ───────────────────────────── */}
      <div className="ai-news-sub-bottom-cta">
        <div className="ai-news-sub-bottom-cta-content">
          <h2>Ready to Level Up Your AI News?</h2>
          <p>Join 50,000+ professionals who trust AI News for their daily intelligence.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="ai-news-sub-plan-cta primary" style={{ background: '#e63946', boxShadow: '0 4px 20px rgba(230,57,70,0.4)', display: 'inline-flex', width: 'auto', padding: '0.8rem 2rem' }}
              onClick={() => userToken ? navigate('/all-news') : navigate('/signup')}>
              {userToken ? 'Browse News' : 'Start Free Trial'} <ArrowRight size={16} />
            </button>
            <Link to="/contact" className="ai-news-sub-plan-cta ghost" style={{ display: 'inline-flex', width: 'auto', padding: '0.8rem 2rem' }}>
              Talk to Sales <ExternalLink size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}