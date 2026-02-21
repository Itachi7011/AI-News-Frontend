import { useState, useEffect, useContext, useCallback } from 'react';
import {
  Settings, Save, RefreshCw, CheckCircle, AlertTriangle,
  Shield, Globe, Bell, Lock, Cpu, Zap, Database, Mail,
  ChevronRight, Info, X, Eye, EyeOff, ToggleLeft
} from 'lucide-react';
import Swal from 'sweetalert2';
import { ThemeContext } from '../../context/ThemeContext';

const TOKEN_KEY = 'ai_news_admin_token';
const getToken  = () => localStorage.getItem(TOKEN_KEY);

const TABS = [
  { id: 'general',       label: 'General',       icon: Globe    },
  { id: 'security',      label: 'Security',       icon: Shield   },
  { id: 'email',         label: 'Email',          icon: Mail     },
  { id: 'ai',            label: 'AI & ML',        icon: Cpu      },
  { id: 'notifications', label: 'Notifications',  icon: Bell     },
  { id: 'compliance',    label: 'Compliance',     icon: Lock     },
  { id: 'performance',   label: 'Performance',    icon: Zap      },
  { id: 'features',      label: 'Feature Flags',  icon: ToggleLeft },
];

const MAIL_PROVIDERS = ['smtp', 'sendgrid', 'mailgun', 'ses', 'postmark', 'resend'];
const AI_PROVIDERS   = ['openai', 'anthropic', 'google', 'huggingface', 'cohere', 'mistral', 'local'];
const ENVIRONMENTS   = ['development', 'staging', 'production'];
const TIMEZONES      = ['UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Europe/Berlin', 'Asia/Tokyo', 'Asia/Singapore'];
const LOG_LEVELS     = ['error', 'warn', 'info', 'debug', 'verbose'];

const EMPTY_SETTINGS = {
  /* General */
  siteName: 'AI News',
  siteTagline: 'The future of AI, delivered daily',
  siteUrl: '',
  siteDescription: '',
  environment: 'production',
  maintenanceMode: false,
  maintenanceMessage: '',
  defaultTimezone: 'UTC',
  defaultLanguage: 'en',
  defaultCurrency: 'USD',
  logoUrl: '',
  faviconUrl: '',
  /* Security */
  'security.sessionDuration': 3600,
  'security.maxLoginAttempts': 5,
  'security.lockoutDuration': 900,
  'security.requireEmailVerification': true,
  'security.requireTwoFactor': false,
  'security.allowedOrigins': '',
  'security.rateLimiting.enabled': true,
  'security.rateLimiting.requestsPerMinute': 60,
  'security.passwordMinLength': 8,
  'security.passwordRequireSpecial': true,
  /* Email */
  'email.provider': 'smtp',
  'email.fromName': 'AI News',
  'email.fromAddress': '',
  'email.replyTo': '',
  'email.smtp.host': '',
  'email.smtp.port': 587,
  'email.smtp.secure': false,
  'email.smtp.user': '',
  'email.smtp.pass': '',
  'email.sendgridKey': '',
  'email.mailgunKey': '',
  'email.mailgunDomain': '',
  /* AI */
  'ai.primaryProvider': 'openai',
  'ai.fallbackProvider': 'anthropic',
  'ai.openaiKey': '',
  'ai.anthropicKey': '',
  'ai.googleKey': '',
  'ai.defaultModel': 'gpt-4o-mini',
  'ai.maxTokens': 2000,
  'ai.temperature': 0.7,
  'ai.summarizationEnabled': true,
  'ai.tagExtractionEnabled': true,
  'ai.sentimentAnalysisEnabled': true,
  'ai.embeddingsEnabled': false,
  'ai.moderationEnabled': true,
  'ai.moderationThreshold': 0.7,
  'ai.dailyTokenBudget': 1000000,
  /* Notifications */
  'notifications.emailEnabled': true,
  'notifications.pushEnabled': false,
  'notifications.slackEnabled': false,
  'notifications.slackWebhook': '',
  'notifications.discordEnabled': false,
  'notifications.discordWebhook': '',
  'notifications.adminAlertEmail': '',
  'notifications.errorAlertThreshold': 10,
  /* Compliance */
  'compliance.gdprEnabled': true,
  'compliance.ccpaEnabled': false,
  'compliance.cookieBannerEnabled': true,
  'compliance.privacyPolicyUrl': '',
  'compliance.termsUrl': '',
  'compliance.dataRetentionDays': 365,
  'compliance.rightToErasureEnabled': true,
  'compliance.dataExportEnabled': true,
  'compliance.consentLoggingEnabled': true,
  'compliance.ageGateEnabled': false,
  'compliance.minimumAge': 13,
  /* Performance */
  'performance.cacheEnabled': true,
  'performance.cacheTtlSeconds': 300,
  'performance.cdnEnabled': false,
  'performance.cdnUrl': '',
  'performance.compressionEnabled': true,
  'performance.imageOptimization': true,
  'performance.lazyLoadingEnabled': true,
  'performance.logLevel': 'info',
  'performance.analyticsEnabled': true,
  'performance.analyticsId': '',
  /* Feature Flags */
  'features.newsletterEnabled': true,
  'features.bookmarksEnabled': true,
  'features.commentsEnabled': false,
  'features.reactionsEnabled': true,
  'features.sharingEnabled': true,
  'features.searchEnabled': true,
  'features.aiSearchEnabled': false,
  'features.recommendationsEnabled': true,
  'features.trendingEnabled': true,
  'features.breakingNewsEnabled': true,
  'features.podcastEnabled': false,
  'features.videoEnabled': false,
  'features.premiumEnabled': false,
  'features.advertisingEnabled': true,
  'features.affiliateEnabled': false,
  'features.multiLanguageEnabled': false,
  'features.darkModeEnabled': true,
  'features.betaFeaturesEnabled': false,
};

export default function AdminMainSettings() {
  const { isDarkMode } = useContext(ThemeContext);
  const validToken = getToken();

  const [settings, setSettings]   = useState(null);
  const [form, setForm]           = useState(EMPTY_SETTINGS);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [showSecrets, setShowSecrets] = useState({});
  const [dirty, setDirty]         = useState(false);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings', {
        headers: { 'Authorization': `Bearer ${validToken}`, 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const s = data.settings || data;
      setSettings(s);
      setForm(flattenSettings(s));
      setDirty(false);
    } catch {
      Swal.fire({ title:'Error!', text:'Failed to load settings', icon:'error',
        background:isDarkMode?'#10102a':'#fff', color:isDarkMode?'#eeeeff':'#0d0d2b' });
    } finally { setLoading(false); }
  }, [validToken, isDarkMode]);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const flattenSettings = (s) => ({
    siteName: s.siteName||'AI News',
    siteTagline: s.siteTagline||'',
    siteUrl: s.siteUrl||'',
    siteDescription: s.siteDescription||'',
    environment: s.environment||'production',
    maintenanceMode: s.maintenanceMode??false,
    maintenanceMessage: s.maintenanceMessage||'',
    defaultTimezone: s.defaultTimezone||'UTC',
    defaultLanguage: s.defaultLanguage||'en',
    defaultCurrency: s.defaultCurrency||'USD',
    logoUrl: s.logoUrl||'',
    faviconUrl: s.faviconUrl||'',
    'security.sessionDuration': s.security?.sessionDuration||3600,
    'security.maxLoginAttempts': s.security?.maxLoginAttempts||5,
    'security.lockoutDuration': s.security?.lockoutDuration||900,
    'security.requireEmailVerification': s.security?.requireEmailVerification??true,
    'security.requireTwoFactor': s.security?.requireTwoFactor??false,
    'security.allowedOrigins': (s.security?.allowedOrigins||[]).join(', '),
    'security.rateLimiting.enabled': s.security?.rateLimiting?.enabled??true,
    'security.rateLimiting.requestsPerMinute': s.security?.rateLimiting?.requestsPerMinute||60,
    'security.passwordMinLength': s.security?.passwordMinLength||8,
    'security.passwordRequireSpecial': s.security?.passwordRequireSpecial??true,
    'email.provider': s.email?.provider||'smtp',
    'email.fromName': s.email?.fromName||'',
    'email.fromAddress': s.email?.fromAddress||'',
    'email.replyTo': s.email?.replyTo||'',
    'email.smtp.host': s.email?.smtp?.host||'',
    'email.smtp.port': s.email?.smtp?.port||587,
    'email.smtp.secure': s.email?.smtp?.secure??false,
    'email.smtp.user': s.email?.smtp?.user||'',
    'email.smtp.pass': s.email?.smtp?.pass||'',
    'email.sendgridKey': s.email?.sendgridKey||'',
    'email.mailgunKey': s.email?.mailgunKey||'',
    'email.mailgunDomain': s.email?.mailgunDomain||'',
    'ai.primaryProvider': s.ai?.primaryProvider||'openai',
    'ai.fallbackProvider': s.ai?.fallbackProvider||'anthropic',
    'ai.openaiKey': s.ai?.openaiKey||'',
    'ai.anthropicKey': s.ai?.anthropicKey||'',
    'ai.googleKey': s.ai?.googleKey||'',
    'ai.defaultModel': s.ai?.defaultModel||'gpt-4o-mini',
    'ai.maxTokens': s.ai?.maxTokens||2000,
    'ai.temperature': s.ai?.temperature||0.7,
    'ai.summarizationEnabled': s.ai?.summarizationEnabled??true,
    'ai.tagExtractionEnabled': s.ai?.tagExtractionEnabled??true,
    'ai.sentimentAnalysisEnabled': s.ai?.sentimentAnalysisEnabled??true,
    'ai.embeddingsEnabled': s.ai?.embeddingsEnabled??false,
    'ai.moderationEnabled': s.ai?.moderationEnabled??true,
    'ai.moderationThreshold': s.ai?.moderationThreshold||0.7,
    'ai.dailyTokenBudget': s.ai?.dailyTokenBudget||1000000,
    'notifications.emailEnabled': s.notifications?.emailEnabled??true,
    'notifications.pushEnabled': s.notifications?.pushEnabled??false,
    'notifications.slackEnabled': s.notifications?.slackEnabled??false,
    'notifications.slackWebhook': s.notifications?.slackWebhook||'',
    'notifications.discordEnabled': s.notifications?.discordEnabled??false,
    'notifications.discordWebhook': s.notifications?.discordWebhook||'',
    'notifications.adminAlertEmail': s.notifications?.adminAlertEmail||'',
    'notifications.errorAlertThreshold': s.notifications?.errorAlertThreshold||10,
    'compliance.gdprEnabled': s.compliance?.gdprEnabled??true,
    'compliance.ccpaEnabled': s.compliance?.ccpaEnabled??false,
    'compliance.cookieBannerEnabled': s.compliance?.cookieBannerEnabled??true,
    'compliance.privacyPolicyUrl': s.compliance?.privacyPolicyUrl||'',
    'compliance.termsUrl': s.compliance?.termsUrl||'',
    'compliance.dataRetentionDays': s.compliance?.dataRetentionDays||365,
    'compliance.rightToErasureEnabled': s.compliance?.rightToErasureEnabled??true,
    'compliance.dataExportEnabled': s.compliance?.dataExportEnabled??true,
    'compliance.consentLoggingEnabled': s.compliance?.consentLoggingEnabled??true,
    'compliance.ageGateEnabled': s.compliance?.ageGateEnabled??false,
    'compliance.minimumAge': s.compliance?.minimumAge||13,
    'performance.cacheEnabled': s.performance?.cacheEnabled??true,
    'performance.cacheTtlSeconds': s.performance?.cacheTtlSeconds||300,
    'performance.cdnEnabled': s.performance?.cdnEnabled??false,
    'performance.cdnUrl': s.performance?.cdnUrl||'',
    'performance.compressionEnabled': s.performance?.compressionEnabled??true,
    'performance.imageOptimization': s.performance?.imageOptimization??true,
    'performance.lazyLoadingEnabled': s.performance?.lazyLoadingEnabled??true,
    'performance.logLevel': s.performance?.logLevel||'info',
    'performance.analyticsEnabled': s.performance?.analyticsEnabled??true,
    'performance.analyticsId': s.performance?.analyticsId||'',
    'features.newsletterEnabled': s.features?.newsletterEnabled??true,
    'features.bookmarksEnabled': s.features?.bookmarksEnabled??true,
    'features.commentsEnabled': s.features?.commentsEnabled??false,
    'features.reactionsEnabled': s.features?.reactionsEnabled??true,
    'features.sharingEnabled': s.features?.sharingEnabled??true,
    'features.searchEnabled': s.features?.searchEnabled??true,
    'features.aiSearchEnabled': s.features?.aiSearchEnabled??false,
    'features.recommendationsEnabled': s.features?.recommendationsEnabled??true,
    'features.trendingEnabled': s.features?.trendingEnabled??true,
    'features.breakingNewsEnabled': s.features?.breakingNewsEnabled??true,
    'features.podcastEnabled': s.features?.podcastEnabled??false,
    'features.videoEnabled': s.features?.videoEnabled??false,
    'features.premiumEnabled': s.features?.premiumEnabled??false,
    'features.advertisingEnabled': s.features?.advertisingEnabled??true,
    'features.affiliateEnabled': s.features?.affiliateEnabled??false,
    'features.multiLanguageEnabled': s.features?.multiLanguageEnabled??false,
    'features.darkModeEnabled': s.features?.darkModeEnabled??true,
    'features.betaFeaturesEnabled': s.features?.betaFeaturesEnabled??false,
  });

  const setField = (k, v) => { setForm(f => ({ ...f, [k]: v })); setDirty(true); };

  const handleSave = async () => {
    setSaving(true);
    const body = {
      siteName: form.siteName, siteTagline: form.siteTagline, siteUrl: form.siteUrl,
      siteDescription: form.siteDescription, environment: form.environment,
      maintenanceMode: form.maintenanceMode, maintenanceMessage: form.maintenanceMessage,
      defaultTimezone: form.defaultTimezone, defaultLanguage: form.defaultLanguage,
      defaultCurrency: form.defaultCurrency, logoUrl: form.logoUrl, faviconUrl: form.faviconUrl,
      security: {
        sessionDuration: Number(form['security.sessionDuration']),
        maxLoginAttempts: Number(form['security.maxLoginAttempts']),
        lockoutDuration: Number(form['security.lockoutDuration']),
        requireEmailVerification: form['security.requireEmailVerification'],
        requireTwoFactor: form['security.requireTwoFactor'],
        allowedOrigins: form['security.allowedOrigins'].split(',').map(s => s.trim()).filter(Boolean),
        rateLimiting: { enabled: form['security.rateLimiting.enabled'], requestsPerMinute: Number(form['security.rateLimiting.requestsPerMinute']) },
        passwordMinLength: Number(form['security.passwordMinLength']),
        passwordRequireSpecial: form['security.passwordRequireSpecial'],
      },
      email: {
        provider: form['email.provider'], fromName: form['email.fromName'],
        fromAddress: form['email.fromAddress'], replyTo: form['email.replyTo'],
        smtp: { host: form['email.smtp.host'], port: Number(form['email.smtp.port']), secure: form['email.smtp.secure'], user: form['email.smtp.user'], pass: form['email.smtp.pass'] },
        sendgridKey: form['email.sendgridKey']||undefined, mailgunKey: form['email.mailgunKey']||undefined, mailgunDomain: form['email.mailgunDomain']||undefined,
      },
      ai: {
        primaryProvider: form['ai.primaryProvider'], fallbackProvider: form['ai.fallbackProvider'],
        openaiKey: form['ai.openaiKey']||undefined, anthropicKey: form['ai.anthropicKey']||undefined, googleKey: form['ai.googleKey']||undefined,
        defaultModel: form['ai.defaultModel'], maxTokens: Number(form['ai.maxTokens']),
        temperature: parseFloat(form['ai.temperature']),
        summarizationEnabled: form['ai.summarizationEnabled'], tagExtractionEnabled: form['ai.tagExtractionEnabled'],
        sentimentAnalysisEnabled: form['ai.sentimentAnalysisEnabled'], embeddingsEnabled: form['ai.embeddingsEnabled'],
        moderationEnabled: form['ai.moderationEnabled'], moderationThreshold: parseFloat(form['ai.moderationThreshold']),
        dailyTokenBudget: Number(form['ai.dailyTokenBudget']),
      },
      notifications: {
        emailEnabled: form['notifications.emailEnabled'], pushEnabled: form['notifications.pushEnabled'],
        slackEnabled: form['notifications.slackEnabled'], slackWebhook: form['notifications.slackWebhook']||undefined,
        discordEnabled: form['notifications.discordEnabled'], discordWebhook: form['notifications.discordWebhook']||undefined,
        adminAlertEmail: form['notifications.adminAlertEmail'], errorAlertThreshold: Number(form['notifications.errorAlertThreshold']),
      },
      compliance: {
        gdprEnabled: form['compliance.gdprEnabled'], ccpaEnabled: form['compliance.ccpaEnabled'],
        cookieBannerEnabled: form['compliance.cookieBannerEnabled'],
        privacyPolicyUrl: form['compliance.privacyPolicyUrl'], termsUrl: form['compliance.termsUrl'],
        dataRetentionDays: Number(form['compliance.dataRetentionDays']),
        rightToErasureEnabled: form['compliance.rightToErasureEnabled'],
        dataExportEnabled: form['compliance.dataExportEnabled'],
        consentLoggingEnabled: form['compliance.consentLoggingEnabled'],
        ageGateEnabled: form['compliance.ageGateEnabled'], minimumAge: Number(form['compliance.minimumAge']),
      },
      performance: {
        cacheEnabled: form['performance.cacheEnabled'], cacheTtlSeconds: Number(form['performance.cacheTtlSeconds']),
        cdnEnabled: form['performance.cdnEnabled'], cdnUrl: form['performance.cdnUrl']||undefined,
        compressionEnabled: form['performance.compressionEnabled'], imageOptimization: form['performance.imageOptimization'],
        lazyLoadingEnabled: form['performance.lazyLoadingEnabled'], logLevel: form['performance.logLevel'],
        analyticsEnabled: form['performance.analyticsEnabled'], analyticsId: form['performance.analyticsId']||undefined,
      },
      features: {
        newsletterEnabled: form['features.newsletterEnabled'], bookmarksEnabled: form['features.bookmarksEnabled'],
        commentsEnabled: form['features.commentsEnabled'], reactionsEnabled: form['features.reactionsEnabled'],
        sharingEnabled: form['features.sharingEnabled'], searchEnabled: form['features.searchEnabled'],
        aiSearchEnabled: form['features.aiSearchEnabled'], recommendationsEnabled: form['features.recommendationsEnabled'],
        trendingEnabled: form['features.trendingEnabled'], breakingNewsEnabled: form['features.breakingNewsEnabled'],
        podcastEnabled: form['features.podcastEnabled'], videoEnabled: form['features.videoEnabled'],
        premiumEnabled: form['features.premiumEnabled'], advertisingEnabled: form['features.advertisingEnabled'],
        affiliateEnabled: form['features.affiliateEnabled'], multiLanguageEnabled: form['features.multiLanguageEnabled'],
        darkModeEnabled: form['features.darkModeEnabled'], betaFeaturesEnabled: form['features.betaFeaturesEnabled'],
      },
    };
    try {
      const res = await fetch('/api/admin/settings', {
        method: settings ? 'PUT' : 'POST',
        headers: { 'Authorization': `Bearer ${validToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message || 'Failed'); }
      Swal.fire({ title:'Settings Saved!', text:'Configuration updated successfully', icon:'success',
        timer:2000, showConfirmButton:false, background:isDarkMode?'#10102a':'#fff', color:isDarkMode?'#eeeeff':'#0d0d2b' });
      setDirty(false); fetchSettings();
    } catch (err) {
      Swal.fire({ title:'Error!', text:err.message, icon:'error',
        background:isDarkMode?'#10102a':'#fff', color:isDarkMode?'#eeeeff':'#0d0d2b' });
    } finally { setSaving(false); }
  };

  const toggleSecret = (k) => setShowSecrets(s => ({ ...s, [k]: !s[k] }));

  const Toggle = ({ fieldKey, label, desc }) => (
    <div className="ai-news-amp-toggle-row ai-news-amp-form-full">
      <div className="ai-news-amp-toggle-info">
        <div className="ai-news-amp-toggle-name">{label}</div>
        {desc && <div className="ai-news-amp-toggle-desc">{desc}</div>}
      </div>
      <label className="ai-news-amp-switch">
        <input type="checkbox" className="ai-news-amp-switch-inp" checked={!!form[fieldKey]} onChange={e => setField(fieldKey, e.target.checked)} />
        <span className="ai-news-amp-switch-track" />
      </label>
    </div>
  );

  const SecretInput = ({ fieldKey, label, placeholder }) => (
    <div className="ai-news-amp-field">
      <label className="ai-news-amp-label">{label}</label>
      <div style={{ position:'relative' }}>
        <input className="ai-news-amp-input" style={{ paddingRight:'2.5rem' }}
          type={showSecrets[fieldKey] ? 'text' : 'password'} placeholder={placeholder}
          value={form[fieldKey]} onChange={e => setField(fieldKey, e.target.value)} />
        <button type="button" style={{ position:'absolute', right:'0.75rem', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--amp-text-3)', display:'flex' }}
          onClick={() => toggleSecret(fieldKey)} aria-label="Toggle visibility">
          {showSecrets[fieldKey] ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  );

  const FEATURE_FLAGS = [
    { key:'features.newsletterEnabled',      label:'Newsletter',         desc:'Email newsletter subscriptions' },
    { key:'features.bookmarksEnabled',        label:'Bookmarks',          desc:'Article saving and reading lists' },
    { key:'features.commentsEnabled',         label:'Comments',           desc:'User comments on articles' },
    { key:'features.reactionsEnabled',        label:'Reactions',          desc:'Like, love, insightful reactions' },
    { key:'features.sharingEnabled',          label:'Social Sharing',     desc:'Share buttons on articles' },
    { key:'features.searchEnabled',           label:'Search',             desc:'Full-text article search' },
    { key:'features.aiSearchEnabled',         label:'AI Search',          desc:'Semantic/vector search with AI' },
    { key:'features.recommendationsEnabled',  label:'Recommendations',    desc:'Personalised article recommendations' },
    { key:'features.trendingEnabled',         label:'Trending',           desc:'Trending topics and articles' },
    { key:'features.breakingNewsEnabled',     label:'Breaking News',      desc:'Breaking news push alerts' },
    { key:'features.podcastEnabled',          label:'Podcast',            desc:'Audio podcast integration' },
    { key:'features.videoEnabled',            label:'Video',              desc:'Video content support' },
    { key:'features.premiumEnabled',          label:'Premium Tier',       desc:'Paid subscription tiers' },
    { key:'features.advertisingEnabled',      label:'Advertising',        desc:'Ad campaign display' },
    { key:'features.affiliateEnabled',        label:'Affiliate Links',    desc:'Affiliate revenue integration' },
    { key:'features.multiLanguageEnabled',    label:'Multi-Language',     desc:'Localised content in multiple languages' },
    { key:'features.darkModeEnabled',         label:'Dark Mode',          desc:'Dark/light theme switching' },
    { key:'features.betaFeaturesEnabled',     label:'Beta Features',      desc:'Enable experimental features for all users' },
  ];

  return (
    <div className={`ai-news-admin-managing-pages-root ${isDarkMode ? 'dark' : 'light'}`}>
      <main className="ai-news-admin-managing-pages-page">

        <nav className="ai-news-amp-breadcrumb" aria-label="Breadcrumb">
          <span>Admin</span><ChevronRight size={13} /><span>System</span><ChevronRight size={13} /><span>Main Settings</span>
        </nav>

        <header className="ai-news-admin-managing-pages-header">
          <div className="ai-news-admin-managing-pages-header-left">
            <div className="ai-news-admin-managing-pages-icon-wrap"><Settings size={24} /></div>
            <div>
              <h1 className="ai-news-admin-managing-pages-title">Main Settings</h1>
              <p className="ai-news-admin-managing-pages-subtitle">
                Global application configuration — security, AI, email, compliance & features
                {dirty && <span className="ai-news-amp-badge ai-news-amp-badge-orange">Unsaved Changes</span>}
              </p>
            </div>
          </div>
          <div className="ai-news-admin-managing-pages-header-actions">
            <button className="ai-news-amp-btn ai-news-amp-btn-ghost" onClick={fetchSettings}>
              <RefreshCw size={15} className={loading ? 'ai-news-amp-spinning' : ''} /> Reload
            </button>
            <button className="ai-news-amp-btn ai-news-amp-btn-primary" onClick={handleSave} disabled={saving || loading}>
              {saving ? <><span className="ai-news-amp-loader" style={{ width:15, height:15 }} /> Saving…</> : <><Save size={15} />Save Settings</>}
            </button>
          </div>
        </header>

        <div className="ai-news-amp-info-box" role="note">
          <div className="ai-news-amp-info-box-title"><Info size={14} /> Singleton Configuration</div>
          <p className="ai-news-amp-info-box-text">
            Main Settings is a singleton document — there is only one global configuration for the AI News platform. Changes here affect all users, API consumers,
            and third-party integrations in real-time. Sensitive keys (SMTP passwords, API keys) are stored encrypted at rest.
            AI provider settings control which LLM handles article summarisation, tag extraction, and content moderation.
            The Feature Flags section lets you toggle capabilities without deployments, enabling safe gradual rollouts.
          </p>
        </div>

        {form.maintenanceMode && (
          <div style={{ background:'rgba(255,180,0,0.12)', border:'1px solid #f59e0b', borderRadius:10, padding:'0.9rem 1.25rem', marginBottom:'1.5rem', display:'flex', alignItems:'center', gap:'0.75rem', color:'#f59e0b' }}>
            <AlertTriangle size={18} />
            <strong>Maintenance Mode is ON</strong> — the site is currently inaccessible to regular users.
          </div>
        )}

        {loading ? (
          <div style={{ padding:'2rem' }}>
            {[...Array(6)].map((_, i) => <div key={i} className="ai-news-amp-skeleton" style={{ height:48, marginBottom:16, borderRadius:10 }} />)}
          </div>
        ) : (
          <div className="ai-news-amp-settings-layout">
            {/* Sidebar Tabs */}
            <aside className="ai-news-amp-settings-sidebar">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button key={id} className={`ai-news-amp-settings-tab ${activeTab===id?'ai-news-amp-settings-tab-active':''}`} onClick={() => setActiveTab(id)}>
                  <Icon size={16} />{label}
                </button>
              ))}
            </aside>

            {/* Content Panel */}
            <div className="ai-news-amp-settings-panel">

              {activeTab === 'general' && (
                <div className="ai-news-amp-form-grid">
                  <div className="ai-news-amp-form-section">Site Identity</div>
                  <div className="ai-news-amp-field"><label className="ai-news-amp-label">Site Name</label><input className="ai-news-amp-input" value={form.siteName} onChange={e => setField('siteName', e.target.value)} /></div>
                  <div className="ai-news-amp-field"><label className="ai-news-amp-label">Tagline</label><input className="ai-news-amp-input" placeholder="The future of AI, delivered daily" value={form.siteTagline} onChange={e => setField('siteTagline', e.target.value)} /></div>
                  <div className="ai-news-amp-field ai-news-amp-form-full"><label className="ai-news-amp-label">Site URL</label><input className="ai-news-amp-input" placeholder="https://ainews.com" value={form.siteUrl} onChange={e => setField('siteUrl', e.target.value)} /></div>
                  <div className="ai-news-amp-field ai-news-amp-form-full"><label className="ai-news-amp-label">Description (SEO)</label><textarea className="ai-news-amp-textarea" style={{ minHeight:70 }} value={form.siteDescription} onChange={e => setField('siteDescription', e.target.value)} /></div>
                  <div className="ai-news-amp-form-section">Localisation & Branding</div>
                  <div className="ai-news-amp-field"><label className="ai-news-amp-label">Default Timezone</label><select className="ai-news-amp-sel" value={form.defaultTimezone} onChange={e => setField('defaultTimezone', e.target.value)}>{TIMEZONES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                  <div className="ai-news-amp-field"><label className="ai-news-amp-label">Default Language</label><input className="ai-news-amp-input" placeholder="en" value={form.defaultLanguage} onChange={e => setField('defaultLanguage', e.target.value)} /></div>
                  <div className="ai-news-amp-field"><label className="ai-news-amp-label">Default Currency</label><input className="ai-news-amp-input" placeholder="USD" value={form.defaultCurrency} onChange={e => setField('defaultCurrency', e.target.value)} /></div>
                  <div className="ai-news-amp-field"><label className="ai-news-amp-label">Environment</label><select className="ai-news-amp-sel" value={form.environment} onChange={e => setField('environment', e.target.value)}>{ENVIRONMENTS.map(e => <option key={e} value={e}>{e}</option>)}</select></div>
                  <div className="ai-news-amp-field"><label className="ai-news-amp-label">Logo URL</label><input className="ai-news-amp-input" placeholder="https://…/logo.svg" value={form.logoUrl} onChange={e => setField('logoUrl', e.target.value)} /></div>
                  <div className="ai-news-amp-field"><label className="ai-news-amp-label">Favicon URL</label><input className="ai-news-amp-input" placeholder="https://…/favicon.ico" value={form.faviconUrl} onChange={e => setField('faviconUrl', e.target.value)} /></div>
                  <div className="ai-news-amp-form-section">Maintenance</div>
                  <Toggle fieldKey="maintenanceMode" label="Maintenance Mode" desc="Show maintenance page to all non-admin users" />
                  {form.maintenanceMode && (
                    <div className="ai-news-amp-field ai-news-amp-form-full"><label className="ai-news-amp-label">Maintenance Message</label><textarea className="ai-news-amp-textarea" style={{ minHeight:60 }} placeholder="We'll be back shortly…" value={form.maintenanceMessage} onChange={e => setField('maintenanceMessage', e.target.value)} /></div>
                  )}
                </div>
              )}

              {activeTab === 'security' && (
                <div className="ai-news-amp-form-grid">
                  <div className="ai-news-amp-form-section">Authentication</div>
                  <div className="ai-news-amp-field"><label className="ai-news-amp-label">Session Duration (seconds)</label><input type="number" className="ai-news-amp-input" value={form['security.sessionDuration']} onChange={e => setField('security.sessionDuration', e.target.value)} /></div>
                  <div className="ai-news-amp-field"><label className="ai-news-amp-label">Max Login Attempts</label><input type="number" min={1} max={20} className="ai-news-amp-input" value={form['security.maxLoginAttempts']} onChange={e => setField('security.maxLoginAttempts', e.target.value)} /></div>
                  <div className="ai-news-amp-field"><label className="ai-news-amp-label">Lockout Duration (seconds)</label><input type="number" className="ai-news-amp-input" value={form['security.lockoutDuration']} onChange={e => setField('security.lockoutDuration', e.target.value)} /></div>
                  <div className="ai-news-amp-field"><label className="ai-news-amp-label">Min Password Length</label><input type="number" min={6} max={32} className="ai-news-amp-input" value={form['security.passwordMinLength']} onChange={e => setField('security.passwordMinLength', e.target.value)} /></div>
                  <Toggle fieldKey="security.requireEmailVerification" label="Require Email Verification" desc="Users must verify email before accessing the platform" />
                  <Toggle fieldKey="security.requireTwoFactor" label="Require 2FA for Admins" desc="All admin accounts must use two-factor authentication" />
                  <Toggle fieldKey="security.passwordRequireSpecial" label="Require Special Characters" desc="Passwords must contain at least one special character" />
                  <div className="ai-news-amp-form-section">Network</div>
                  <Toggle fieldKey="security.rateLimiting.enabled" label="Rate Limiting" desc="Throttle excessive API requests per IP" />
                  <div className="ai-news-amp-field"><label className="ai-news-amp-label">Requests per Minute</label><input type="number" min={1} className="ai-news-amp-input" value={form['security.rateLimiting.requestsPerMinute']} onChange={e => setField('security.rateLimiting.requestsPerMinute', e.target.value)} /></div>
                  <div className="ai-news-amp-field ai-news-amp-form-full"><label className="ai-news-amp-label">Allowed Origins (comma-separated)</label><input className="ai-news-amp-input" placeholder="https://app.com, https://admin.app.com" value={form['security.allowedOrigins']} onChange={e => setField('security.allowedOrigins', e.target.value)} /></div>
                </div>
              )}

              {activeTab === 'email' && (
                <div className="ai-news-amp-form-grid">
                  <div className="ai-news-amp-form-section">Email Provider</div>
                  <div className="ai-news-amp-field"><label className="ai-news-amp-label">Provider</label><select className="ai-news-amp-sel" value={form['email.provider']} onChange={e => setField('email.provider', e.target.value)}>{MAIL_PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                  <div className="ai-news-amp-field"><label className="ai-news-amp-label">From Name</label><input className="ai-news-amp-input" placeholder="AI News" value={form['email.fromName']} onChange={e => setField('email.fromName', e.target.value)} /></div>
                  <div className="ai-news-amp-field"><label className="ai-news-amp-label">From Address</label><input type="email" className="ai-news-amp-input" placeholder="noreply@ainews.com" value={form['email.fromAddress']} onChange={e => setField('email.fromAddress', e.target.value)} /></div>
                  <div className="ai-news-amp-field"><label className="ai-news-amp-label">Reply-To</label><input type="email" className="ai-news-amp-input" placeholder="support@ainews.com" value={form['email.replyTo']} onChange={e => setField('email.replyTo', e.target.value)} /></div>
                  {form['email.provider'] === 'smtp' && (
                    <>
                      <div className="ai-news-amp-form-section">SMTP Configuration</div>
                      <div className="ai-news-amp-field"><label className="ai-news-amp-label">SMTP Host</label><input className="ai-news-amp-input" placeholder="smtp.example.com" value={form['email.smtp.host']} onChange={e => setField('email.smtp.host', e.target.value)} /></div>
                      <div className="ai-news-amp-field"><label className="ai-news-amp-label">SMTP Port</label><input type="number" className="ai-news-amp-input" value={form['email.smtp.port']} onChange={e => setField('email.smtp.port', e.target.value)} /></div>
                      <div className="ai-news-amp-field"><label className="ai-news-amp-label">SMTP User</label><input className="ai-news-amp-input" value={form['email.smtp.user']} onChange={e => setField('email.smtp.user', e.target.value)} /></div>
                      <SecretInput fieldKey="email.smtp.pass" label="SMTP Password" placeholder="••••••••" />
                      <Toggle fieldKey="email.smtp.secure" label="Use TLS/SSL" desc="Enable secure SMTP connection (port 465)" />
                    </>
                  )}
                  {form['email.provider'] === 'sendgrid' && (
                    <SecretInput fieldKey="email.sendgridKey" label="SendGrid API Key" placeholder="SG.••••••••" />
                  )}
                  {form['email.provider'] === 'mailgun' && (
                    <>
                      <SecretInput fieldKey="email.mailgunKey" label="Mailgun API Key" placeholder="key-••••••••" />
                      <div className="ai-news-amp-field"><label className="ai-news-amp-label">Mailgun Domain</label><input className="ai-news-amp-input" placeholder="mg.ainews.com" value={form['email.mailgunDomain']} onChange={e => setField('email.mailgunDomain', e.target.value)} /></div>
                    </>
                  )}
                </div>
              )}

              {activeTab === 'ai' && (
                <div className="ai-news-amp-form-grid">
                  <div className="ai-news-amp-form-section">AI Provider Configuration</div>
                  <div className="ai-news-amp-field"><label className="ai-news-amp-label">Primary Provider</label><select className="ai-news-amp-sel" value={form['ai.primaryProvider']} onChange={e => setField('ai.primaryProvider', e.target.value)}>{AI_PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                  <div className="ai-news-amp-field"><label className="ai-news-amp-label">Fallback Provider</label><select className="ai-news-amp-sel" value={form['ai.fallbackProvider']} onChange={e => setField('ai.fallbackProvider', e.target.value)}>{AI_PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                  <SecretInput fieldKey="ai.openaiKey" label="OpenAI API Key" placeholder="sk-••••••••" />
                  <SecretInput fieldKey="ai.anthropicKey" label="Anthropic API Key" placeholder="sk-ant-••••••••" />
                  <SecretInput fieldKey="ai.googleKey" label="Google AI Key" placeholder="AIza••••••••" />
                  <div className="ai-news-amp-form-section">Model Settings</div>
                  <div className="ai-news-amp-field"><label className="ai-news-amp-label">Default Model</label><input className="ai-news-amp-input" placeholder="gpt-4o-mini" value={form['ai.defaultModel']} onChange={e => setField('ai.defaultModel', e.target.value)} /></div>
                  <div className="ai-news-amp-field"><label className="ai-news-amp-label">Max Tokens</label><input type="number" min={256} max={128000} className="ai-news-amp-input" value={form['ai.maxTokens']} onChange={e => setField('ai.maxTokens', e.target.value)} /></div>
                  <div className="ai-news-amp-field ai-news-amp-form-full">
                    <label className="ai-news-amp-label">Temperature: <strong>{form['ai.temperature']}</strong></label>
                    <input type="range" min={0} max={2} step={0.1} style={{ width:'100%', accentColor:'var(--amp-primary)', marginTop:'0.5rem' }} value={form['ai.temperature']} onChange={e => setField('ai.temperature', parseFloat(e.target.value))} />
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.75rem', color:'var(--amp-text-3)' }}><span>0 — Precise</span><span>1 — Balanced</span><span>2 — Creative</span></div>
                  </div>
                  <div className="ai-news-amp-field"><label className="ai-news-amp-label">Daily Token Budget</label><input type="number" className="ai-news-amp-input" value={form['ai.dailyTokenBudget']} onChange={e => setField('ai.dailyTokenBudget', e.target.value)} /></div>
                  <div className="ai-news-amp-form-section">AI Features</div>
                  <Toggle fieldKey="ai.summarizationEnabled" label="Article Summarisation" desc="Auto-generate TL;DR summaries for articles" />
                  <Toggle fieldKey="ai.tagExtractionEnabled" label="Tag Extraction" desc="Auto-extract relevant tags from article content" />
                  <Toggle fieldKey="ai.sentimentAnalysisEnabled" label="Sentiment Analysis" desc:"Classify articles as positive, negative, or neutral" />
                  <Toggle fieldKey="ai.embeddingsEnabled" label="Semantic Embeddings" desc="Generate vector embeddings for semantic search" />
                  <Toggle fieldKey="ai.moderationEnabled" label="Content Moderation" desc="Run AI moderation on user-submitted content" />
                  {form['ai.moderationEnabled'] && (
                    <div className="ai-news-amp-field ai-news-amp-form-full">
                      <label className="ai-news-amp-label">Moderation Threshold: <strong>{form['ai.moderationThreshold']}</strong></label>
                      <input type="range" min={0} max={1} step={0.05} style={{ width:'100%', accentColor:'var(--amp-primary)', marginTop:'0.5rem' }} value={form['ai.moderationThreshold']} onChange={e => setField('ai.moderationThreshold', parseFloat(e.target.value))} />
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.75rem', color:'var(--amp-text-3)' }}><span>0 — Block most</span><span>0.5 — Balanced</span><span>1 — Allow most</span></div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="ai-news-amp-form-grid">
                  <div className="ai-news-amp-form-section">Notification Channels</div>
                  <Toggle fieldKey="notifications.emailEnabled" label="Email Notifications" desc="System sends transactional and alert emails" />
                  <Toggle fieldKey="notifications.pushEnabled" label="Push Notifications" desc="Browser / mobile push notifications" />
                  <Toggle fieldKey="notifications.slackEnabled" label="Slack Alerts" desc="Send error and system alerts to Slack" />
                  {form['notifications.slackEnabled'] && <div className="ai-news-amp-field ai-news-amp-form-full"><label className="ai-news-amp-label">Slack Webhook URL</label><input className="ai-news-amp-input" placeholder="https://hooks.slack.com/services/…" value={form['notifications.slackWebhook']} onChange={e => setField('notifications.slackWebhook', e.target.value)} /></div>}
                  <Toggle fieldKey="notifications.discordEnabled" label="Discord Alerts" desc="Send alerts to a Discord channel" />
                  {form['notifications.discordEnabled'] && <div className="ai-news-amp-field ai-news-amp-form-full"><label className="ai-news-amp-label">Discord Webhook URL</label><input className="ai-news-amp-input" placeholder="https://discord.com/api/webhooks/…" value={form['notifications.discordWebhook']} onChange={e => setField('notifications.discordWebhook', e.target.value)} /></div>}
                  <div className="ai-news-amp-form-section">Alert Settings</div>
                  <div className="ai-news-amp-field"><label className="ai-news-amp-label">Admin Alert Email</label><input type="email" className="ai-news-amp-input" placeholder="admin@ainews.com" value={form['notifications.adminAlertEmail']} onChange={e => setField('notifications.adminAlertEmail', e.target.value)} /></div>
                  <div className="ai-news-amp-field"><label className="ai-news-amp-label">Error Alert Threshold (per minute)</label><input type="number" min={1} className="ai-news-amp-input" value={form['notifications.errorAlertThreshold']} onChange={e => setField('notifications.errorAlertThreshold', e.target.value)} /></div>
                </div>
              )}

              {activeTab === 'compliance' && (
                <div className="ai-news-amp-form-grid">
                  <div className="ai-news-amp-form-section">Privacy Regulations</div>
                  <Toggle fieldKey="compliance.gdprEnabled" label="GDPR Compliance" desc="Enable GDPR consent flows (EU/EEA users)" />
                  <Toggle fieldKey="compliance.ccpaEnabled" label="CCPA Compliance" desc="Enable CCPA opt-out features (California users)" />
                  <Toggle fieldKey="compliance.cookieBannerEnabled" label="Cookie Consent Banner" desc="Show cookie consent banner to new users" />
                  <Toggle fieldKey="compliance.consentLoggingEnabled" label="Consent Logging" desc="Log all user consent decisions with timestamps" />
                  <div className="ai-news-amp-form-section">Data Rights</div>
                  <Toggle fieldKey="compliance.rightToErasureEnabled" label="Right to Erasure" desc="Users can request deletion of their data" />
                  <Toggle fieldKey="compliance.dataExportEnabled" label="Data Export" desc="Users can download their personal data" />
                  <div className="ai-news-amp-field"><label className="ai-news-amp-label">Data Retention (days)</label><input type="number" min={1} className="ai-news-amp-input" value={form['compliance.dataRetentionDays']} onChange={e => setField('compliance.dataRetentionDays', e.target.value)} /></div>
                  <div className="ai-news-amp-form-section">Age Restriction</div>
                  <Toggle fieldKey="compliance.ageGateEnabled" label="Age Gate" desc="Block underage users from accessing the platform" />
                  <div className="ai-news-amp-field"><label className="ai-news-amp-label">Minimum Age</label><input type="number" min={13} max={21} className="ai-news-amp-input" value={form['compliance.minimumAge']} onChange={e => setField('compliance.minimumAge', e.target.value)} /></div>
                  <div className="ai-news-amp-form-section">Legal Pages</div>
                  <div className="ai-news-amp-field"><label className="ai-news-amp-label">Privacy Policy URL</label><input className="ai-news-amp-input" placeholder="https://ainews.com/privacy" value={form['compliance.privacyPolicyUrl']} onChange={e => setField('compliance.privacyPolicyUrl', e.target.value)} /></div>
                  <div className="ai-news-amp-field"><label className="ai-news-amp-label">Terms of Service URL</label><input className="ai-news-amp-input" placeholder="https://ainews.com/terms" value={form['compliance.termsUrl']} onChange={e => setField('compliance.termsUrl', e.target.value)} /></div>
                </div>
              )}

              {activeTab === 'performance' && (
                <div className="ai-news-amp-form-grid">
                  <div className="ai-news-amp-form-section">Caching</div>
                  <Toggle fieldKey="performance.cacheEnabled" label="Server Caching" desc="Cache API responses to reduce database load" />
                  <div className="ai-news-amp-field"><label className="ai-news-amp-label">Cache TTL (seconds)</label><input type="number" min={10} className="ai-news-amp-input" value={form['performance.cacheTtlSeconds']} onChange={e => setField('performance.cacheTtlSeconds', e.target.value)} /></div>
                  <div className="ai-news-amp-form-section">Content Delivery</div>
                  <Toggle fieldKey="performance.cdnEnabled" label="CDN" desc="Serve static assets via CDN" />
                  {form['performance.cdnEnabled'] && <div className="ai-news-amp-field ai-news-amp-form-full"><label className="ai-news-amp-label">CDN Base URL</label><input className="ai-news-amp-input" placeholder="https://cdn.ainews.com" value={form['performance.cdnUrl']} onChange={e => setField('performance.cdnUrl', e.target.value)} /></div>}
                  <Toggle fieldKey="performance.compressionEnabled" label="Gzip Compression" desc="Compress API responses" />
                  <Toggle fieldKey="performance.imageOptimization" label="Image Optimisation" desc="Auto-compress and resize images on upload" />
                  <Toggle fieldKey="performance.lazyLoadingEnabled" label="Lazy Loading" desc="Load images lazily for better performance" />
                  <div className="ai-news-amp-form-section">Observability</div>
                  <div className="ai-news-amp-field"><label className="ai-news-amp-label">Log Level</label><select className="ai-news-amp-sel" value={form['performance.logLevel']} onChange={e => setField('performance.logLevel', e.target.value)}>{LOG_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}</select></div>
                  <Toggle fieldKey="performance.analyticsEnabled" label="Analytics" desc="Track user events and page views" />
                  {form['performance.analyticsEnabled'] && <div className="ai-news-amp-field"><label className="ai-news-amp-label">Analytics ID (GA4/Plausible)</label><input className="ai-news-amp-input" placeholder="G-XXXXXXXXXX" value={form['performance.analyticsId']} onChange={e => setField('performance.analyticsId', e.target.value)} /></div>}
                </div>
              )}

              {activeTab === 'features' && (
                <div className="ai-news-amp-form-grid">
                  <div className="ai-news-amp-form-section">Feature Flags — toggle platform capabilities</div>
                  {FEATURE_FLAGS.map(({ key, label, desc }) => (
                    <Toggle key={key} fieldKey={key} label={label} desc={desc} />
                  ))}
                </div>
              )}

              <div style={{ marginTop:'2rem', display:'flex', justifyContent:'flex-end', gap:'0.75rem' }}>
                <button className="ai-news-amp-btn ai-news-amp-btn-ghost" onClick={fetchSettings}>Discard Changes</button>
                <button className="ai-news-amp-btn ai-news-amp-btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? <><span className="ai-news-amp-loader" style={{ width:15, height:15 }} /> Saving…</> : <><Save size={15} />Save Settings</>}
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}