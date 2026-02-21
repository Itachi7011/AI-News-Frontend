import { useState, useEffect, useContext, useCallback } from 'react';
import {
  Globe, Plus, Search, Edit2, Trash2, Eye, RefreshCw,
  CheckCircle, Map, Shield, AlertTriangle, X,
  ChevronRight, Info, List, LayoutGrid, BarChart2
} from 'lucide-react';
import Swal from 'sweetalert2';
import { ThemeContext } from '../../context/ThemeContext';

const TOKEN_KEY = 'ai_news_admin_token';
const getToken = () => localStorage.getItem(TOKEN_KEY);
const fmt = n => (n == null ? '—' : Number(n).toLocaleString());

const REGIONS = ['africa','asia','europe','north-america','south-america','oceania','antarctica'];
const MEASUREMENT = ['metric','imperial','both'];
const PRIVACY_THRESH = ['low','medium','high'];

const EMPTY = {
  name:'', code:'', code3:'', numericCode:'', region:'', subregion:'',
  defaultLanguage:'en', isActive:true, isEU:false, isEEA:false, specialNotes:'',
  'flag.emoji':'', 'flag.unicode':'', 'flag.image.url':'',
  'localization.dateFormat':'MM/DD/YYYY', 'localization.timeFormat':'12h',
  'localization.phoneCode':'', 'localization.currency.code':'',
  'localization.currency.symbol':'', 'localization.currency.name':'',
  'localization.measurementSystem':'metric',
  'contentRestrictions.isRestricted':false, 'contentRestrictions.ageRestriction':0,
  'contentRestrictions.requiresConsent':false,
  'gdprSpecifics.hasStricterLaws':false, 'gdprSpecifics.dataRetentionPeriod':365,
  'gdprSpecifics.consentRequired':true, 'gdprSpecifics.cookieConsentRequired':true,
  'gdprSpecifics.privacyThreshold':'medium',
  'legalInfo.dataProtectionAuthority':'', 'legalInfo.ageOfConsent':16,
  'legalInfo.isDataTransferSafe':false,
};

export default function AdminCountries() {
  const { isDarkMode } = useContext(ThemeContext);
  const validToken = getToken();

  const [countries, setCountries]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [filterRegion, setFilterRegion] = useState('');
  const [filterEU, setFilterEU]       = useState('');
  const [view, setView]               = useState('table');
  const [page, setPage]               = useState(1);
  const [modal, setModal]             = useState(null);
  const [selected, setSelected]       = useState(null);
  const [form, setForm]               = useState(EMPTY);
  const [saving, setSaving]           = useState(false);
  const [activeTab, setActiveTab]     = useState('core');

  const PER_PAGE = 15;

  const fetchCountries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/countries?limit=300', {
        headers: { 'Authorization': `Bearer ${validToken}`, 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCountries(data.countries || data.data || data || []);
    } catch {
      Swal.fire({ title: 'Error!', text: 'Failed to load countries', icon: 'error',
        background: isDarkMode ? '#10102a' : '#fff', color: isDarkMode ? '#eeeeff' : '#0d0d2b' });
    } finally { setLoading(false); }
  }, [validToken, isDarkMode]);

  useEffect(() => { fetchCountries(); }, [fetchCountries]);

  const filtered = countries.filter(c => {
    const s = search.toLowerCase();
    return (!s || c.name?.toLowerCase().includes(s) || c.code?.toLowerCase().includes(s))
      && (!filterRegion || c.region === filterRegion)
      && (filterEU === '' || c.isEU === (filterEU === 'true'));
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const stats = {
    total:      countries.length,
    active:     countries.filter(c => c.isActive).length,
    eu:         countries.filter(c => c.isEU).length,
    eea:        countries.filter(c => c.isEEA).length,
    restricted: countries.filter(c => c.contentRestrictions?.isRestricted).length,
  };

  const openAdd  = () => { setForm(EMPTY); setSelected(null); setActiveTab('core'); setModal('add'); };
  const openEdit = (c) => {
    setSelected(c);
    setForm({
      name: c.name||'', code: c.code||'', code3: c.code3||'', numericCode: c.numericCode||'',
      region: c.region||'', subregion: c.subregion||'', defaultLanguage: c.defaultLanguage||'en',
      isActive: c.isActive ?? true, isEU: c.isEU ?? false, isEEA: c.isEEA ?? false,
      specialNotes: c.specialNotes||'',
      'flag.emoji': c.flag?.emoji||'', 'flag.unicode': c.flag?.unicode||'',
      'flag.image.url': c.flag?.image?.url||'',
      'localization.dateFormat': c.localization?.dateFormat||'MM/DD/YYYY',
      'localization.timeFormat': c.localization?.timeFormat||'12h',
      'localization.phoneCode': c.localization?.phoneCode||'',
      'localization.currency.code': c.localization?.currency?.code||'',
      'localization.currency.symbol': c.localization?.currency?.symbol||'',
      'localization.currency.name': c.localization?.currency?.name||'',
      'localization.measurementSystem': c.localization?.measurementSystem||'metric',
      'contentRestrictions.isRestricted': c.contentRestrictions?.isRestricted ?? false,
      'contentRestrictions.ageRestriction': c.contentRestrictions?.ageRestriction||0,
      'contentRestrictions.requiresConsent': c.contentRestrictions?.requiresConsent ?? false,
      'gdprSpecifics.hasStricterLaws': c.gdprSpecifics?.hasStricterLaws ?? false,
      'gdprSpecifics.dataRetentionPeriod': c.gdprSpecifics?.dataRetentionPeriod||365,
      'gdprSpecifics.consentRequired': c.gdprSpecifics?.consentRequired ?? true,
      'gdprSpecifics.cookieConsentRequired': c.gdprSpecifics?.cookieConsentRequired ?? true,
      'gdprSpecifics.privacyThreshold': c.gdprSpecifics?.privacyThreshold||'medium',
      'legalInfo.dataProtectionAuthority': c.legalInfo?.dataProtectionAuthority||'',
      'legalInfo.ageOfConsent': c.legalInfo?.ageOfConsent||16,
      'legalInfo.isDataTransferSafe': c.legalInfo?.isDataTransferSafe ?? false,
    });
    setActiveTab('core'); setModal('edit');
  };
  const openView   = (c) => { setSelected(c); setModal('view'); };
  const closeModal = () => { setModal(null); setSelected(null); };
  const setField   = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name.trim() || !form.code.trim()) {
      return Swal.fire({ title: 'Validation', text: 'Name and Code are required', icon: 'warning',
        background: isDarkMode ? '#10102a' : '#fff', color: isDarkMode ? '#eeeeff' : '#0d0d2b' });
    }
    setSaving(true);
    const body = {
      name: form.name, code: form.code.toUpperCase(),
      code3: form.code3 ? form.code3.toUpperCase() : undefined,
      numericCode: form.numericCode || undefined, region: form.region || undefined,
      subregion: form.subregion || undefined, defaultLanguage: form.defaultLanguage,
      isActive: form.isActive, isEU: form.isEU, isEEA: form.isEEA,
      specialNotes: form.specialNotes || undefined,
      flag: { emoji: form['flag.emoji'], unicode: form['flag.unicode'], image: { url: form['flag.image.url'] } },
      localization: {
        dateFormat: form['localization.dateFormat'], timeFormat: form['localization.timeFormat'],
        phoneCode: form['localization.phoneCode'],
        currency: { code: form['localization.currency.code'], symbol: form['localization.currency.symbol'], name: form['localization.currency.name'] },
        measurementSystem: form['localization.measurementSystem'],
      },
      contentRestrictions: {
        isRestricted: form['contentRestrictions.isRestricted'],
        ageRestriction: Number(form['contentRestrictions.ageRestriction']),
        requiresConsent: form['contentRestrictions.requiresConsent'],
      },
      gdprSpecifics: {
        hasStricterLaws: form['gdprSpecifics.hasStricterLaws'],
        dataRetentionPeriod: Number(form['gdprSpecifics.dataRetentionPeriod']),
        consentRequired: form['gdprSpecifics.consentRequired'],
        cookieConsentRequired: form['gdprSpecifics.cookieConsentRequired'],
        privacyThreshold: form['gdprSpecifics.privacyThreshold'],
      },
      legalInfo: {
        dataProtectionAuthority: form['legalInfo.dataProtectionAuthority'],
        ageOfConsent: Number(form['legalInfo.ageOfConsent']),
        isDataTransferSafe: form['legalInfo.isDataTransferSafe'],
      },
    };
    try {
      const isEdit = modal === 'edit';
      const res = await fetch(isEdit ? `/api/admin/countries/${selected._id}` : '/api/admin/countries', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Authorization': `Bearer ${validToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message || 'Failed'); }
      Swal.fire({ title: 'Saved!', text: `Country ${isEdit ? 'updated' : 'created'}`, icon: 'success',
        timer: 1800, showConfirmButton: false, background: isDarkMode ? '#10102a' : '#fff', color: isDarkMode ? '#eeeeff' : '#0d0d2b' });
      closeModal(); fetchCountries();
    } catch (err) {
      Swal.fire({ title: 'Error!', text: err.message, icon: 'error',
        background: isDarkMode ? '#10102a' : '#fff', color: isDarkMode ? '#eeeeff' : '#0d0d2b' });
    } finally { setSaving(false); }
  };

  const handleDelete = async (c) => {
    const res = await Swal.fire({ title: `Delete "${c.name}"?`, text: 'Country will be removed.', icon: 'warning',
      showCancelButton: true, confirmButtonText: 'Delete', confirmButtonColor: '#ff4d6d',
      background: isDarkMode ? '#10102a' : '#fff', color: isDarkMode ? '#eeeeff' : '#0d0d2b' });
    if (!res.isConfirmed) return;
    try {
      const r = await fetch(`/api/admin/countries/${c._id}`, { method: 'DELETE',
        headers: { 'Authorization': `Bearer ${validToken}` } });
      if (!r.ok) throw new Error('Failed');
      Swal.fire({ title: 'Deleted', icon: 'success', timer: 1500, showConfirmButton: false,
        background: isDarkMode ? '#10102a' : '#fff', color: isDarkMode ? '#eeeeff' : '#0d0d2b' });
      fetchCountries();
    } catch (err) {
      Swal.fire({ title: 'Error!', text: err.message, icon: 'error',
        background: isDarkMode ? '#10102a' : '#fff', color: isDarkMode ? '#eeeeff' : '#0d0d2b' });
    }
  };

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

  const TABS = [
    { id: 'core', label: 'Core Info' },
    { id: 'localization', label: 'Localization' },
    { id: 'restrictions', label: 'Content Restrictions' },
    { id: 'gdpr', label: 'GDPR / Privacy' },
    { id: 'legal', label: 'Legal' },
  ];

  return (
    <div className={`ai-news-admin-managing-pages-root ${isDarkMode ? 'dark' : 'light'}`}>
      <main className="ai-news-admin-managing-pages-page">

        <nav className="ai-news-amp-breadcrumb" aria-label="Breadcrumb">
          <span>Admin</span><ChevronRight size={13} /><span>System</span><ChevronRight size={13} /><span>Countries</span>
        </nav>

        <header className="ai-news-admin-managing-pages-header">
          <div className="ai-news-admin-managing-pages-header-left">
            <div className="ai-news-admin-managing-pages-icon-wrap" aria-hidden="true"><Globe size={24} /></div>
            <div>
              <h1 className="ai-news-admin-managing-pages-title">Countries & Regions</h1>
              <p className="ai-news-admin-managing-pages-subtitle">
                Geo-targeting, GDPR compliance, and content restrictions
                <span className="ai-news-amp-badge ai-news-amp-badge-purple">{stats.total} Countries</span>
              </p>
            </div>
          </div>
          <div className="ai-news-admin-managing-pages-header-actions">
            <button className="ai-news-amp-btn ai-news-amp-btn-ghost" onClick={fetchCountries} aria-label="Refresh">
              <RefreshCw size={15} className={loading ? 'ai-news-amp-spinning' : ''} /> Refresh
            </button>
            <button className="ai-news-amp-btn ai-news-amp-btn-primary" onClick={openAdd}>
              <Plus size={16} /> Add Country
            </button>
          </div>
        </header>

        <div className="ai-news-amp-info-box" role="note">
          <div className="ai-news-amp-info-box-title"><Info size={14} /> Global Content Governance</div>
          <p className="ai-news-amp-info-box-text">
            The Countries module enables fine-grained geo-targeting and regulatory compliance for AI News. Each country defines GDPR applicability,
            data retention periods, content restriction categories, localization settings (currency, date/time formats, phone codes), and age-of-consent laws.
            EU and EEA countries automatically inherit stricter consent defaults under GDPR. With the EU AI Act (2024), China's AI governance rules, and
            emerging US state legislation, country-level controls are increasingly critical for compliant AI news distribution globally.
          </p>
        </div>

        <div className="ai-news-admin-managing-pages-stats" role="region" aria-label="Country statistics">
          {[
            { label: 'Total Countries', val: fmt(stats.total),      ico: Globe,         cls: 'ai-news-amp-ico-purple' },
            { label: 'Active',          val: fmt(stats.active),     ico: CheckCircle,   cls: 'ai-news-amp-ico-green'  },
            { label: 'EU Members',      val: fmt(stats.eu),         ico: Shield,        cls: 'ai-news-amp-ico-cyan'   },
            { label: 'EEA Members',     val: fmt(stats.eea),        ico: Map,           cls: 'ai-news-amp-ico-gold'   },
            { label: 'Restricted',      val: fmt(stats.restricted), ico: AlertTriangle, cls: 'ai-news-amp-ico-red'    },
          ].map(({ label, val, ico: Icon, cls }) => (
            <div key={label} className="ai-news-admin-managing-pages-stat">
              <div className={`ai-news-admin-managing-pages-stat-ico ${cls}`}><Icon size={20} /></div>
              <div>
                <div className="ai-news-admin-managing-pages-stat-val">
                  {loading ? <span className="ai-news-amp-skeleton" style={{ display: 'inline-block', width: 40, height: 22 }} /> : val}
                </div>
                <div className="ai-news-admin-managing-pages-stat-lbl">{label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="ai-news-admin-managing-pages-toolbar" role="search">
          <div className="ai-news-admin-managing-pages-search-box">
            <Search size={15} />
            <input className="ai-news-admin-managing-pages-search-input" placeholder="Search by name or code…"
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} aria-label="Search countries" />
            {search && <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--amp-text-3)', display: 'flex' }} onClick={() => setSearch('')}><X size={14} /></button>}
          </div>
          <select className="ai-news-admin-managing-pages-select" value={filterRegion} onChange={e => { setFilterRegion(e.target.value); setPage(1); }} aria-label="Filter region">
            <option value="">All Regions</option>
            {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select className="ai-news-admin-managing-pages-select" value={filterEU} onChange={e => { setFilterEU(e.target.value); setPage(1); }} aria-label="Filter EU">
            <option value="">All</option>
            <option value="true">EU Only</option>
            <option value="false">Non-EU</option>
          </select>
          <div className="ai-news-admin-managing-pages-toolbar-spacer" />
          <div className="ai-news-amp-view-toggle" role="group" aria-label="View mode">
            <button className={`ai-news-amp-view-btn ${view === 'table' ? 'ai-news-amp-view-btn-active' : ''}`} onClick={() => setView('table')} aria-label="Table view"><List size={16} /></button>
            <button className={`ai-news-amp-view-btn ${view === 'grid' ? 'ai-news-amp-view-btn-active' : ''}`} onClick={() => setView('grid')} aria-label="Grid view"><LayoutGrid size={16} /></button>
          </div>
        </div>

        {loading ? (
          <div className="ai-news-admin-managing-pages-table-wrap">
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--amp-border)' }}>
                <div className="ai-news-amp-skeleton" style={{ height: 20, width: '50%', marginBottom: 8 }} />
                <div className="ai-news-amp-skeleton" style={{ height: 14, width: '30%' }} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="ai-news-admin-managing-pages-table-wrap">
            <div className="ai-news-amp-empty">
              <div className="ai-news-amp-empty-ico"><Globe size={60} /></div>
              <div className="ai-news-amp-empty-title">No countries found</div>
              <p className="ai-news-amp-empty-text">Add countries to enable geo-targeting and compliance.</p>
              <button className="ai-news-amp-btn ai-news-amp-btn-primary" style={{ marginTop: '1rem' }} onClick={openAdd}><Plus size={15} />Add Country</button>
            </div>
          </div>
        ) : view === 'table' ? (
          <div className="ai-news-admin-managing-pages-table-wrap" role="region" aria-label="Countries list">
            <div className="ai-news-admin-managing-pages-table-scroll">
              <table className="ai-news-admin-managing-pages-table" aria-label="Countries table">
                <thead className="ai-news-admin-managing-pages-table-head">
                  <tr>
                    {['Flag', 'Country', 'Code', 'Region', 'EU/EEA', 'Users', 'Restricted', 'Status', 'Actions'].map(h => (
                      <th key={h} className="ai-news-admin-managing-pages-table-th">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(c => (
                    <tr key={c._id} className="ai-news-admin-managing-pages-table-row">
                      <td className="ai-news-admin-managing-pages-table-td" style={{ fontSize: '1.5rem' }}>{c.flag?.emoji || '🌐'}</td>
                      <td className="ai-news-admin-managing-pages-table-td">
                        <div style={{ fontWeight: 700, color: 'var(--amp-text)', fontSize: '0.9rem' }}>{c.name}</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--amp-text-3)' }}>{c.subregion}</div>
                      </td>
                      <td className="ai-news-admin-managing-pages-table-td"><span className="ai-news-amp-code-val">{c.code}</span></td>
                      <td className="ai-news-admin-managing-pages-table-td"><span className="ai-news-amp-badge ai-news-amp-badge-purple">{c.region || '—'}</span></td>
                      <td className="ai-news-admin-managing-pages-table-td">
                        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                          {c.isEU && <span className="ai-news-amp-badge ai-news-amp-badge-cyan">EU</span>}
                          {c.isEEA && <span className="ai-news-amp-badge ai-news-amp-badge-purple">EEA</span>}
                          {!c.isEU && !c.isEEA && <span className="ai-news-amp-badge ai-news-amp-badge-gray">Non-EU</span>}
                        </div>
                      </td>
                      <td className="ai-news-admin-managing-pages-table-td" style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '0.85rem' }}>
                        {fmt(c.analytics?.userCount)}
                      </td>
                      <td className="ai-news-admin-managing-pages-table-td">
                        {c.contentRestrictions?.isRestricted
                          ? <span className="ai-news-amp-badge ai-news-amp-badge-red"><AlertTriangle size={11} /> Yes</span>
                          : <span className="ai-news-amp-badge ai-news-amp-badge-green">Clear</span>}
                      </td>
                      <td className="ai-news-admin-managing-pages-table-td">
                        <span className={`ai-news-amp-badge ${c.isActive ? 'ai-news-amp-badge-green' : 'ai-news-amp-badge-red'}`}>
                          {c.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="ai-news-admin-managing-pages-table-td">
                        <div className="ai-news-admin-managing-pages-table-actions">
                          <button className="ai-news-amp-btn ai-news-amp-btn-ghost ai-news-amp-btn-sm ai-news-amp-btn-icon" onClick={() => openView(c)} aria-label={`View ${c.name}`}><Eye size={14} /></button>
                          <button className="ai-news-amp-btn ai-news-amp-btn-outline ai-news-amp-btn-sm ai-news-amp-btn-icon" onClick={() => openEdit(c)} aria-label={`Edit ${c.name}`}><Edit2 size={14} /></button>
                          <button className="ai-news-amp-btn ai-news-amp-btn-danger ai-news-amp-btn-sm ai-news-amp-btn-icon" onClick={() => handleDelete(c)} aria-label={`Delete ${c.name}`}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="ai-news-amp-pagination" role="navigation" aria-label="Pagination">
                <button className="ai-news-amp-page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
                {[...Array(Math.min(totalPages, 8))].map((_, i) => (
                  <button key={i} className={`ai-news-amp-page-btn ${page === i + 1 ? 'ai-news-amp-page-btn-active' : ''}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
                ))}
                <button className="ai-news-amp-page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</button>
              </div>
            )}
          </div>
        ) : (
          <div className="ai-news-admin-managing-pages-cards-grid" role="region" aria-label="Countries grid">
            {paginated.map(c => (
              <article key={c._id} className="ai-news-admin-managing-pages-card" aria-label={`Country: ${c.name}`}>
                <div className="ai-news-admin-managing-pages-card-head">
                  <div>
                    <div className="ai-news-admin-managing-pages-card-title">
                      <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>{c.flag?.emoji || '🌐'}</span>
                      {c.name}
                    </div>
                    <div className="ai-news-admin-managing-pages-card-meta">{c.code} · {c.region}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-end' }}>
                    {c.isEU && <span className="ai-news-amp-badge ai-news-amp-badge-cyan">EU</span>}
                    {c.isEEA && <span className="ai-news-amp-badge ai-news-amp-badge-purple">EEA</span>}
                    {c.contentRestrictions?.isRestricted && <span className="ai-news-amp-badge ai-news-amp-badge-red"><AlertTriangle size={10} /> Restricted</span>}
                  </div>
                </div>
                <div className="ai-news-amp-metric-grid" style={{ gridTemplateColumns: 'repeat(2,1fr)' }}>
                  <div className="ai-news-amp-metric-card"><div className="ai-news-amp-metric-lbl">Users</div><div className="ai-news-amp-metric-val" style={{ fontSize: '1.1rem' }}>{fmt(c.analytics?.userCount)}</div></div>
                  <div className="ai-news-amp-metric-card"><div className="ai-news-amp-metric-lbl">Views</div><div className="ai-news-amp-metric-val" style={{ fontSize: '1.1rem' }}>{fmt(c.analytics?.contentViews)}</div></div>
                </div>
                <div className="ai-news-admin-managing-pages-card-footer">
                  <div style={{ fontSize: '0.82rem', color: 'var(--amp-text-3)' }}>
                    {c.localization?.currency?.code} · {c.localization?.measurementSystem} · Age {c.legalInfo?.ageOfConsent}+
                  </div>
                  <div className="ai-news-admin-managing-pages-card-actions">
                    <button className="ai-news-amp-btn ai-news-amp-btn-ghost ai-news-amp-btn-sm ai-news-amp-btn-icon" onClick={() => openView(c)} aria-label="View"><Eye size={14} /></button>
                    <button className="ai-news-amp-btn ai-news-amp-btn-outline ai-news-amp-btn-sm ai-news-amp-btn-icon" onClick={() => openEdit(c)} aria-label="Edit"><Edit2 size={14} /></button>
                    <button className="ai-news-amp-btn ai-news-amp-btn-danger ai-news-amp-btn-sm ai-news-amp-btn-icon" onClick={() => handleDelete(c)} aria-label="Delete"><Trash2 size={14} /></button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* ─── ADD / EDIT MODAL ─────────────────────────────── */}
        {(modal === 'add' || modal === 'edit') && (
          <div className="ai-news-amp-modal-overlay" role="dialog" aria-modal="true" aria-label={modal === 'add' ? 'Add Country' : 'Edit Country'}
            onClick={e => e.target === e.currentTarget && closeModal()}>
            <div className="ai-news-amp-modal ai-news-amp-modal-xl">
              <div className="ai-news-amp-modal-header">
                <div className="ai-news-amp-modal-title"><Globe size={18} />{modal === 'add' ? 'Add Country' : 'Edit Country'}</div>
                <button className="ai-news-amp-modal-close" onClick={closeModal} aria-label="Close"><X size={18} /></button>
              </div>

              <div className="ai-news-amp-modal-body">
                <div className="ai-news-amp-tabs" style={{ marginBottom: '1.5rem' }}>
                  {TABS.map(({ id, label }) => (
                    <button key={id} className={`ai-news-amp-tab ${activeTab === id ? 'ai-news-amp-tab-active' : ''}`} onClick={() => setActiveTab(id)}>{label}</button>
                  ))}
                </div>

                {activeTab === 'core' && (
                  <div className="ai-news-amp-form-grid">
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">Name <span className="ai-news-amp-label-req">*</span></label><input className="ai-news-amp-input" placeholder="e.g. Germany" value={form.name} onChange={e => setField('name', e.target.value)} /></div>
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">ISO 2-letter Code <span className="ai-news-amp-label-req">*</span></label><input className="ai-news-amp-input" placeholder="DE" maxLength={2} value={form.code} onChange={e => setField('code', e.target.value.toUpperCase())} /></div>
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">ISO 3-letter Code</label><input className="ai-news-amp-input" placeholder="DEU" maxLength={3} value={form.code3} onChange={e => setField('code3', e.target.value.toUpperCase())} /></div>
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">Numeric Code</label><input className="ai-news-amp-input" placeholder="276" maxLength={3} value={form.numericCode} onChange={e => setField('numericCode', e.target.value)} /></div>
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">Region</label><select className="ai-news-amp-sel" value={form.region} onChange={e => setField('region', e.target.value)}><option value="">— Select —</option>{REGIONS.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">Subregion</label><input className="ai-news-amp-input" placeholder="Western Europe" value={form.subregion} onChange={e => setField('subregion', e.target.value)} /></div>
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">Flag Emoji</label><input className="ai-news-amp-input" placeholder="🇩🇪" value={form['flag.emoji']} onChange={e => setField('flag.emoji', e.target.value)} /></div>
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">Default Language</label><input className="ai-news-amp-input" placeholder="en" value={form.defaultLanguage} onChange={e => setField('defaultLanguage', e.target.value)} /></div>
                    <div className="ai-news-amp-field ai-news-amp-form-full"><label className="ai-news-amp-label">Special Notes</label><textarea className="ai-news-amp-textarea" style={{ minHeight: 60 }} placeholder="Regulatory or operational notes…" value={form.specialNotes} onChange={e => setField('specialNotes', e.target.value)} /></div>
                    <Toggle fieldKey="isActive" label="Active" desc="Country is enabled in the system" />
                    <Toggle fieldKey="isEU" label="EU Member" desc="Subject to EU GDPR regulations" />
                    <Toggle fieldKey="isEEA" label="EEA Member" desc="Part of European Economic Area" />
                  </div>
                )}

                {activeTab === 'localization' && (
                  <div className="ai-news-amp-form-grid">
                    <div className="ai-news-amp-form-section">Date & Time</div>
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">Date Format</label><input className="ai-news-amp-input" placeholder="MM/DD/YYYY" value={form['localization.dateFormat']} onChange={e => setField('localization.dateFormat', e.target.value)} /></div>
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">Time Format</label><select className="ai-news-amp-sel" value={form['localization.timeFormat']} onChange={e => setField('localization.timeFormat', e.target.value)}><option value="12h">12-hour</option><option value="24h">24-hour</option></select></div>
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">Phone Code</label><input className="ai-news-amp-input" placeholder="+49" value={form['localization.phoneCode']} onChange={e => setField('localization.phoneCode', e.target.value)} /></div>
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">Measurement</label><select className="ai-news-amp-sel" value={form['localization.measurementSystem']} onChange={e => setField('localization.measurementSystem', e.target.value)}>{MEASUREMENT.map(m => <option key={m} value={m}>{m}</option>)}</select></div>
                    <div className="ai-news-amp-form-section">Currency</div>
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">Currency Code</label><input className="ai-news-amp-input" placeholder="EUR" value={form['localization.currency.code']} onChange={e => setField('localization.currency.code', e.target.value)} /></div>
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">Currency Symbol</label><input className="ai-news-amp-input" placeholder="€" value={form['localization.currency.symbol']} onChange={e => setField('localization.currency.symbol', e.target.value)} /></div>
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">Currency Name</label><input className="ai-news-amp-input" placeholder="Euro" value={form['localization.currency.name']} onChange={e => setField('localization.currency.name', e.target.value)} /></div>
                  </div>
                )}

                {activeTab === 'restrictions' && (
                  <div className="ai-news-amp-form-grid">
                    <Toggle fieldKey="contentRestrictions.isRestricted" label="Content Restricted" desc="Some AI content categories are blocked in this country" />
                    <Toggle fieldKey="contentRestrictions.requiresConsent" label="Requires Explicit Consent" desc="Users must consent before viewing content" />
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">Age Restriction (years, 0 = none)</label><input type="number" min={0} max={21} className="ai-news-amp-input" value={form['contentRestrictions.ageRestriction']} onChange={e => setField('contentRestrictions.ageRestriction', e.target.value)} /></div>
                  </div>
                )}

                {activeTab === 'gdpr' && (
                  <div className="ai-news-amp-form-grid">
                    <Toggle fieldKey="gdprSpecifics.hasStricterLaws" label="Stricter Laws" desc="Country has stricter privacy laws than standard GDPR" />
                    <Toggle fieldKey="gdprSpecifics.consentRequired" label="Consent Required" desc="Data processing requires explicit consent" />
                    <Toggle fieldKey="gdprSpecifics.cookieConsentRequired" label="Cookie Consent Required" desc="Cookie banner required" />
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">Data Retention Period (days)</label><input type="number" min={1} className="ai-news-amp-input" value={form['gdprSpecifics.dataRetentionPeriod']} onChange={e => setField('gdprSpecifics.dataRetentionPeriod', e.target.value)} /></div>
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">Privacy Threshold</label><select className="ai-news-amp-sel" value={form['gdprSpecifics.privacyThreshold']} onChange={e => setField('gdprSpecifics.privacyThreshold', e.target.value)}>{PRIVACY_THRESH.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                  </div>
                )}

                {activeTab === 'legal' && (
                  <div className="ai-news-amp-form-grid">
                    <div className="ai-news-amp-field ai-news-amp-form-full"><label className="ai-news-amp-label">Data Protection Authority</label><input className="ai-news-amp-input" placeholder="e.g. BfDI (Germany)" value={form['legalInfo.dataProtectionAuthority']} onChange={e => setField('legalInfo.dataProtectionAuthority', e.target.value)} /></div>
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">Age of Consent (years)</label><input type="number" min={13} max={18} className="ai-news-amp-input" value={form['legalInfo.ageOfConsent']} onChange={e => setField('legalInfo.ageOfConsent', e.target.value)} /></div>
                    <Toggle fieldKey="legalInfo.isDataTransferSafe" label="Safe for Data Transfer" desc="Data transfers to/from this country are deemed safe" />
                  </div>
                )}
              </div>

              <div className="ai-news-amp-modal-footer">
                <button className="ai-news-amp-btn ai-news-amp-btn-ghost" onClick={closeModal}>Cancel</button>
                <button className="ai-news-amp-btn ai-news-amp-btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? <><span className="ai-news-amp-loader" style={{ width: 16, height: 16 }} /> Saving…</> : modal === 'add' ? <><Plus size={15} />Add Country</> : <><CheckCircle size={15} />Update</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── VIEW MODAL ───────────────────────────────────── */}
        {modal === 'view' && selected && (
          <div className="ai-news-amp-modal-overlay" role="dialog" aria-modal="true" aria-label="View Country"
            onClick={e => e.target === e.currentTarget && closeModal()}>
            <div className="ai-news-amp-modal ai-news-amp-modal-lg">
              <div className="ai-news-amp-modal-header">
                <div className="ai-news-amp-modal-title">
                  <span style={{ fontSize: '1.5rem' }}>{selected.flag?.emoji || '🌐'}</span>
                  {selected.name}
                </div>
                <button className="ai-news-amp-modal-close" onClick={closeModal} aria-label="Close"><X size={18} /></button>
              </div>
              <div className="ai-news-amp-modal-body">
                <div className="ai-news-amp-tags-wrap" style={{ marginBottom: '1rem' }}>
                  <span className="ai-news-amp-badge ai-news-amp-badge-purple">{selected.region}</span>
                  {selected.isEU && <span className="ai-news-amp-badge ai-news-amp-badge-cyan">EU</span>}
                  {selected.isEEA && <span className="ai-news-amp-badge ai-news-amp-badge-purple">EEA</span>}
                  {selected.isActive ? <span className="ai-news-amp-badge ai-news-amp-badge-green">Active</span> : <span className="ai-news-amp-badge ai-news-amp-badge-red">Inactive</span>}
                  {selected.contentRestrictions?.isRestricted && <span className="ai-news-amp-badge ai-news-amp-badge-red"><AlertTriangle size={11} /> Restricted</span>}
                </div>
                <div className="ai-news-amp-glow-sep" />
                <div className="ai-news-amp-metric-grid" style={{ marginBottom: '1.25rem' }}>
                  {[
                    { lbl: 'Users',        val: fmt(selected.analytics?.userCount) },
                    { lbl: 'Active Users', val: fmt(selected.analytics?.activeUsers) },
                    { lbl: 'Content Views',val: fmt(selected.analytics?.contentViews) },
                    { lbl: 'Age of Consent', val: `${selected.legalInfo?.ageOfConsent}+` },
                  ].map(({ lbl, val }) => (
                    <div key={lbl} className="ai-news-amp-metric-card">
                      <div className="ai-news-amp-metric-lbl">{lbl}</div>
                      <div className="ai-news-amp-metric-val">{val}</div>
                    </div>
                  ))}
                </div>
                <div className="ai-news-amp-detail-grid">
                  <div className="ai-news-amp-detail-item"><div className="ai-news-amp-detail-key">ISO Code</div><div className="ai-news-amp-code-val">{selected.code}</div></div>
                  <div className="ai-news-amp-detail-item"><div className="ai-news-amp-detail-key">ISO 3</div><div className="ai-news-amp-code-val">{selected.code3 || '—'}</div></div>
                  <div className="ai-news-amp-detail-item"><div className="ai-news-amp-detail-key">Currency</div><div className="ai-news-amp-detail-val">{selected.localization?.currency?.symbol} {selected.localization?.currency?.code}</div></div>
                  <div className="ai-news-amp-detail-item"><div className="ai-news-amp-detail-key">Phone Code</div><div className="ai-news-amp-detail-val">{selected.localization?.phoneCode || '—'}</div></div>
                  <div className="ai-news-amp-detail-item"><div className="ai-news-amp-detail-key">Date Format</div><div className="ai-news-amp-detail-val">{selected.localization?.dateFormat}</div></div>
                  <div className="ai-news-amp-detail-item"><div className="ai-news-amp-detail-key">Data Retention</div><div className="ai-news-amp-detail-val">{selected.gdprSpecifics?.dataRetentionPeriod} days</div></div>
                  <div className="ai-news-amp-detail-item"><div className="ai-news-amp-detail-key">DPA Authority</div><div className="ai-news-amp-detail-val">{selected.legalInfo?.dataProtectionAuthority || '—'}</div></div>
                  <div className="ai-news-amp-detail-item"><div className="ai-news-amp-detail-key">Privacy Level</div><div className="ai-news-amp-detail-val">{selected.gdprSpecifics?.privacyThreshold}</div></div>
                </div>
                {selected.specialNotes && (
                  <div style={{ marginTop: '1rem' }}>
                    <div className="ai-news-amp-detail-key" style={{ marginBottom: '0.35rem' }}>Special Notes</div>
                    <p style={{ fontSize: '0.87rem', color: 'var(--amp-text-2)' }}>{selected.specialNotes}</p>
                  </div>
                )}
              </div>
              <div className="ai-news-amp-modal-footer">
                <button className="ai-news-amp-btn ai-news-amp-btn-ghost" onClick={closeModal}>Close</button>
                <button className="ai-news-amp-btn ai-news-amp-btn-outline" onClick={() => openEdit(selected)}><Edit2 size={14} /> Edit</button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}