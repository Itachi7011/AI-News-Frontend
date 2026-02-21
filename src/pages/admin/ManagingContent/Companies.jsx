import { useState, useEffect, useContext, useCallback } from 'react';
import {
  Building2, Plus, Search, Edit2, Trash2, Eye, RefreshCw,
  CheckCircle, Globe, Mail, Phone, MapPin, Link2, Users,
  Award, FileText, X, ChevronRight, Info, LayoutGrid, List,
  Shield, Star, Briefcase, ExternalLink
} from 'lucide-react';
import Swal from 'sweetalert2';
import { ThemeContext } from '../../context/ThemeContext';

const TOKEN_KEY = 'ai_news_admin_token';
const getToken  = () => localStorage.getItem(TOKEN_KEY);
const fmt       = n => (n == null ? '—' : Number(n).toLocaleString());

// fix missing import alias used as placeholder
function BarChart({ size }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="18" y="3" width="4" height="18"/><rect x="10" y="8" width="4" height="13"/><rect x="2" y="13" width="4" height="8"/></svg>; }

const INDUSTRIES       = ['ai','technology','media','news','publishing','education','research'];
const AI_FOCUS_OPTIONS = ['machine-learning','deep-learning','nlp','computer-vision','generative-ai','llm','robotics','ai-ethics','ai-research','ai-tools','ai-education'];
const STATUSES         = ['active','inactive','pending','suspended'];
const VERIFICATION     = ['none','basic','premium','enterprise'];
const LEGAL_STRUCTS    = ['llc','corporation','nonprofit','partnership','sole_proprietorship'];
const TEAM_SIZES       = ['1-10','11-50','51-200','201-500','501-1000','1000+'];

const statusColor = s => ({ active:'green', inactive:'red', pending:'orange', suspended:'red' }[s] || 'gray');
const verifyColor = v => ({ none:'gray', basic:'cyan', premium:'purple', enterprise:'gold' }[v] || 'gray');

const EMPTY = {
  name:'', legalName:'', slug:'', tagline:'', description:'', industry:'ai',
  aiFocus:[], status:'active', isVerified:false, verificationBadge:'none',
  'website.main':'', 'website.blog':'', 'website.careers':'', 'website.api':'',
  'branding.colors.primary':'#6366f1', 'branding.colors.secondary':'#8b5cf6',
  'branding.colors.accent':'#ec4899',
  'branding.typography.fontFamily':'Inter',
  'founded.year':'', 'founded.month':'', 'founded.day':'',
  'team.size':'11-50', 'team.remote':true,
  'legal.legalStructure':'llc', 'legal.registrationNumber':'', 'legal.taxId':'',
  'metrics.monthlyActiveUsers':'', 'metrics.totalUsers':'', 'metrics.totalArticles':'',
  notes:'',
};

export default function AdminCompany() {
  const { isDarkMode } = useContext(ThemeContext);
  const validToken = getToken();

  const [companies, setCompanies]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [filterStatus, setFilter]   = useState('');
  const [view, setView]             = useState('table');
  const [page, setPage]             = useState(1);
  const [modal, setModal]           = useState(null);
  const [selected, setSelected]     = useState(null);
  const [form, setForm]             = useState(EMPTY);
  const [saving, setSaving]         = useState(false);
  const [activeTab, setActiveTab]   = useState('basic');

  const PER_PAGE = 10;

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/companies?limit=100', {
        headers: { 'Authorization': `Bearer ${validToken}`, 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCompanies(data.companies || data.data || (Array.isArray(data) ? data : []));
    } catch {
      Swal.fire({ title:'Error!', text:'Failed to load companies', icon:'error',
        background:isDarkMode?'#10102a':'#fff', color:isDarkMode?'#eeeeff':'#0d0d2b' });
    } finally { setLoading(false); }
  }, [validToken, isDarkMode]);

  useEffect(() => { fetchCompanies(); }, [fetchCompanies]);

  const filtered = companies.filter(c => {
    const s = search.toLowerCase();
    return (!s || c.name?.toLowerCase().includes(s) || c.slug?.toLowerCase().includes(s))
      && (!filterStatus || c.status === filterStatus);
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const openAdd  = () => { setForm(EMPTY); setSelected(null); setActiveTab('basic'); setModal('add'); };
  const openEdit = (co) => {
    setSelected(co);
    setForm({
      name: co.name||'', legalName: co.legalName||'', slug: co.slug||'',
      tagline: co.tagline||'', description: co.description||'', industry: co.industry||'ai',
      aiFocus: co.aiFocus||[], status: co.status||'active',
      isVerified: co.isVerified??false, verificationBadge: co.verificationBadge||'none',
      'website.main': co.website?.main||'', 'website.blog': co.website?.blog||'',
      'website.careers': co.website?.careers||'', 'website.api': co.website?.api||'',
      'branding.colors.primary': co.branding?.colors?.primary||'#6366f1',
      'branding.colors.secondary': co.branding?.colors?.secondary||'#8b5cf6',
      'branding.colors.accent': co.branding?.colors?.accent||'#ec4899',
      'branding.typography.fontFamily': co.branding?.typography?.fontFamily||'Inter',
      'founded.year': co.founded?.year||'', 'founded.month': co.founded?.month||'',
      'founded.day': co.founded?.day||'',
      'team.size': co.team?.size||'11-50', 'team.remote': co.team?.remote??true,
      'legal.legalStructure': co.legal?.legalStructure||'llc',
      'legal.registrationNumber': co.legal?.registrationNumber||'',
      'legal.taxId': co.legal?.taxId||'',
      'metrics.monthlyActiveUsers': co.metrics?.monthlyActiveUsers||'',
      'metrics.totalUsers': co.metrics?.totalUsers||'',
      'metrics.totalArticles': co.metrics?.totalArticles||'',
      notes: co.notes||'',
    });
    setActiveTab('basic'); setModal('edit');
  };
  const openView   = (co) => { setSelected(co); setModal('view'); };
  const closeModal = () => { setModal(null); setSelected(null); };
  const setField   = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleFocus = (f) => setField('aiFocus', form.aiFocus.includes(f) ? form.aiFocus.filter(x => x !== f) : [...form.aiFocus, f]);

  const handleSave = async () => {
    if (!form.name.trim()) {
      return Swal.fire({ title:'Validation', text:'Company name is required', icon:'warning',
        background:isDarkMode?'#10102a':'#fff', color:isDarkMode?'#eeeeff':'#0d0d2b' });
    }
    setSaving(true);
    const body = {
      name: form.name, legalName: form.legalName||undefined, slug: form.slug||undefined,
      tagline: form.tagline, description: form.description, industry: form.industry,
      aiFocus: form.aiFocus, status: form.status, isVerified: form.isVerified,
      verificationBadge: form.verificationBadge,
      website: { main: form['website.main'], blog: form['website.blog'], careers: form['website.careers'], api: form['website.api'] },
      branding: {
        colors: { primary: form['branding.colors.primary'], secondary: form['branding.colors.secondary'], accent: form['branding.colors.accent'] },
        typography: { fontFamily: form['branding.typography.fontFamily'] },
      },
      founded: { year: form['founded.year']||undefined, month: form['founded.month']||undefined, day: form['founded.day']||undefined },
      team: { size: form['team.size'], remote: form['team.remote'] },
      legal: { legalStructure: form['legal.legalStructure'], registrationNumber: form['legal.registrationNumber'], taxId: form['legal.taxId'] },
      metrics: { monthlyActiveUsers: form['metrics.monthlyActiveUsers']||undefined, totalUsers: form['metrics.totalUsers']||undefined, totalArticles: form['metrics.totalArticles']||undefined },
      notes: form.notes,
    };
    try {
      const isEdit = modal === 'edit';
      const res = await fetch(isEdit ? `/api/admin/companies/${selected._id}` : '/api/admin/companies', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Authorization': `Bearer ${validToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message || 'Failed'); }
      Swal.fire({ title:'Saved!', text:`Company ${isEdit ? 'updated' : 'created'}`, icon:'success',
        timer:1800, showConfirmButton:false, background:isDarkMode?'#10102a':'#fff', color:isDarkMode?'#eeeeff':'#0d0d2b' });
      closeModal(); fetchCompanies();
    } catch (err) {
      Swal.fire({ title:'Error!', text:err.message, icon:'error',
        background:isDarkMode?'#10102a':'#fff', color:isDarkMode?'#eeeeff':'#0d0d2b' });
    } finally { setSaving(false); }
  };

  const handleDelete = async (co) => {
    const res = await Swal.fire({ title:`Delete "${co.name}"?`, text:'This will soft-delete the company.', icon:'warning',
      showCancelButton:true, confirmButtonText:'Delete', confirmButtonColor:'#ff4d6d',
      background:isDarkMode?'#10102a':'#fff', color:isDarkMode?'#eeeeff':'#0d0d2b' });
    if (!res.isConfirmed) return;
    try {
      const r = await fetch(`/api/admin/companies/${co._id}`, { method:'DELETE',
        headers: { 'Authorization': `Bearer ${validToken}` } });
      if (!r.ok) throw new Error('Failed');
      Swal.fire({ title:'Deleted', icon:'success', timer:1500, showConfirmButton:false,
        background:isDarkMode?'#10102a':'#fff', color:isDarkMode?'#eeeeff':'#0d0d2b' });
      fetchCompanies();
    } catch (err) {
      Swal.fire({ title:'Error!', text:err.message, icon:'error',
        background:isDarkMode?'#10102a':'#fff', color:isDarkMode?'#eeeeff':'#0d0d2b' });
    }
  };

  const TABS = [
    { id:'basic',    label:'Basic Info',  icon: Building2 },
    { id:'branding', label:'Branding',    icon: Award },
    { id:'web',      label:'Web & Social',icon: Globe },
    { id:'team',     label:'Team & Legal',icon: Users },
    { id:'metrics',  label:'Metrics',     icon: BarChart },
  ];

  return (
    <div className={`ai-news-admin-managing-pages-root ${isDarkMode ? 'dark' : 'light'}`}>
      <main className="ai-news-admin-managing-pages-page">

        <nav className="ai-news-amp-breadcrumb" aria-label="Breadcrumb">
          <span>Admin</span><ChevronRight size={13} /><span>Organization</span><ChevronRight size={13} /><span>Company</span>
        </nav>

        <header className="ai-news-admin-managing-pages-header">
          <div className="ai-news-admin-managing-pages-header-left">
            <div className="ai-news-admin-managing-pages-icon-wrap"><Building2 size={24} /></div>
            <div>
              <h1 className="ai-news-admin-managing-pages-title">Company Profiles</h1>
              <p className="ai-news-admin-managing-pages-subtitle">
                AI companies, publishers, and research organisations
                <span className="ai-news-amp-badge ai-news-amp-badge-purple">{companies.length} Total</span>
              </p>
            </div>
          </div>
          <div className="ai-news-admin-managing-pages-header-actions">
            <button className="ai-news-amp-btn ai-news-amp-btn-ghost" onClick={fetchCompanies}>
              <RefreshCw size={15} className={loading ? 'ai-news-amp-spinning' : ''} /> Refresh
            </button>
            <button className="ai-news-amp-btn ai-news-amp-btn-primary" onClick={openAdd}><Plus size={16} />Add Company</button>
          </div>
        </header>

        <div className="ai-news-amp-info-box" role="note">
          <div className="ai-news-amp-info-box-title"><Info size={14} /> Company & Organisation Profiles</div>
          <p className="ai-news-amp-info-box-text">
            Company profiles represent AI labs, tech companies, publishers, and research institutions that appear across AI News content.
            Each profile includes branding assets (logo, color palette), legal information, team composition, social media presence,
            verification badges, and business metrics. Verified companies receive a trust badge displayed on associated articles.
            This data powers entity-recognition for source attribution, advertiser profiling, and related company suggestions.
          </p>
        </div>

        <div className="ai-news-admin-managing-pages-stats">
          {[
            { label:'Total',     val:fmt(companies.length),                                     ico:Building2,    cls:'ai-news-amp-ico-purple' },
            { label:'Active',    val:fmt(companies.filter(c=>c.status==='active').length),       ico:CheckCircle,  cls:'ai-news-amp-ico-green'  },
            { label:'Verified',  val:fmt(companies.filter(c=>c.isVerified).length),              ico:Shield,       cls:'ai-news-amp-ico-cyan'   },
            { label:'Enterprise',val:fmt(companies.filter(c=>c.verificationBadge==='enterprise').length), ico:Award, cls:'ai-news-amp-ico-gold' },
          ].map(({ label, val, ico: Icon, cls }) => (
            <div key={label} className="ai-news-admin-managing-pages-stat">
              <div className={`ai-news-admin-managing-pages-stat-ico ${cls}`}><Icon size={20} /></div>
              <div>
                <div className="ai-news-admin-managing-pages-stat-val">{loading ? <span className="ai-news-amp-skeleton" style={{ display:'inline-block', width:40, height:22 }} /> : val}</div>
                <div className="ai-news-admin-managing-pages-stat-lbl">{label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="ai-news-admin-managing-pages-toolbar">
          <div className="ai-news-admin-managing-pages-search-box">
            <Search size={15} />
            <input className="ai-news-admin-managing-pages-search-input" placeholder="Search companies…"
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} aria-label="Search companies" />
            {search && <button style={{ background:'none',border:'none',cursor:'pointer',color:'var(--amp-text-3)',display:'flex' }} onClick={() => setSearch('')}><X size={14} /></button>}
          </div>
          <select className="ai-news-admin-managing-pages-select" value={filterStatus} onChange={e => { setFilter(e.target.value); setPage(1); }} aria-label="Filter status">
            <option value="">All Status</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="ai-news-admin-managing-pages-toolbar-spacer" />
          <div className="ai-news-amp-view-toggle">
            <button className={`ai-news-amp-view-btn ${view==='table'?'ai-news-amp-view-btn-active':''}`} onClick={() => setView('table')}><List size={16} /></button>
            <button className={`ai-news-amp-view-btn ${view==='grid'?'ai-news-amp-view-btn-active':''}`} onClick={() => setView('grid')}><LayoutGrid size={16} /></button>
          </div>
        </div>

        {loading ? (
          <div className="ai-news-admin-managing-pages-table-wrap">
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{ padding:'1rem 1.5rem', borderBottom:'1px solid var(--amp-border)' }}>
                <div className="ai-news-amp-skeleton" style={{ height:20, width:'55%', marginBottom:8 }} />
                <div className="ai-news-amp-skeleton" style={{ height:14, width:'30%' }} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="ai-news-admin-managing-pages-table-wrap">
            <div className="ai-news-amp-empty">
              <div className="ai-news-amp-empty-ico"><Building2 size={60} /></div>
              <div className="ai-news-amp-empty-title">No companies found</div>
              <p className="ai-news-amp-empty-text">Add AI companies to enable source attribution.</p>
              <button className="ai-news-amp-btn ai-news-amp-btn-primary" style={{ marginTop:'1rem' }} onClick={openAdd}><Plus size={15} />Add Company</button>
            </div>
          </div>
        ) : view === 'table' ? (
          <div className="ai-news-admin-managing-pages-table-wrap">
            <div className="ai-news-admin-managing-pages-table-scroll">
              <table className="ai-news-admin-managing-pages-table" aria-label="Companies table">
                <thead className="ai-news-admin-managing-pages-table-head">
                  <tr>{['Company','Industry','AI Focus','Team Size','Verification','Status','Actions'].map(h => <th key={h} className="ai-news-admin-managing-pages-table-th">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {paginated.map(co => (
                    <tr key={co._id} className="ai-news-admin-managing-pages-table-row">
                      <td className="ai-news-admin-managing-pages-table-td">
                        <div className="ai-news-admin-managing-pages-table-td-name">
                          <div className="ai-news-amp-avatar" style={{ background: co.branding?.colors?.primary || undefined, width:32, height:32, fontSize:'0.78rem' }}>
                            {co.name?.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight:700, color:'var(--amp-text)' }}>{co.name}</div>
                            <div style={{ fontSize:'0.74rem', color:'var(--amp-text-3)' }}>{co.tagline}</div>
                          </div>
                          {co.isVerified && <Shield size={13} color="var(--amp-success)" style={{ flexShrink:0 }} />}
                        </div>
                      </td>
                      <td className="ai-news-admin-managing-pages-table-td"><span className="ai-news-amp-badge ai-news-amp-badge-purple">{co.industry}</span></td>
                      <td className="ai-news-admin-managing-pages-table-td">
                        <div style={{ display:'flex', gap:'0.3rem', flexWrap:'wrap' }}>
                          {(co.aiFocus||[]).slice(0,2).map(f => <span key={f} className="ai-news-amp-badge ai-news-amp-badge-cyan" style={{ fontSize:'0.68rem' }}>{f}</span>)}
                          {(co.aiFocus||[]).length > 2 && <span className="ai-news-amp-badge ai-news-amp-badge-gray">+{co.aiFocus.length-2}</span>}
                        </div>
                      </td>
                      <td className="ai-news-admin-managing-pages-table-td"><span className="ai-news-amp-badge ai-news-amp-badge-orange">{co.team?.size||'—'}</span></td>
                      <td className="ai-news-admin-managing-pages-table-td"><span className={`ai-news-amp-badge ai-news-amp-badge-${verifyColor(co.verificationBadge)}`}>{co.verificationBadge||'none'}</span></td>
                      <td className="ai-news-admin-managing-pages-table-td"><span className={`ai-news-amp-badge ai-news-amp-badge-${statusColor(co.status)}`}>{co.status}</span></td>
                      <td className="ai-news-admin-managing-pages-table-td">
                        <div className="ai-news-admin-managing-pages-table-actions">
                          <button className="ai-news-amp-btn ai-news-amp-btn-ghost ai-news-amp-btn-sm ai-news-amp-btn-icon" onClick={() => openView(co)} aria-label="View"><Eye size={14} /></button>
                          <button className="ai-news-amp-btn ai-news-amp-btn-outline ai-news-amp-btn-sm ai-news-amp-btn-icon" onClick={() => openEdit(co)} aria-label="Edit"><Edit2 size={14} /></button>
                          <button className="ai-news-amp-btn ai-news-amp-btn-danger ai-news-amp-btn-sm ai-news-amp-btn-icon" onClick={() => handleDelete(co)} aria-label="Delete"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="ai-news-amp-pagination">
                <button className="ai-news-amp-page-btn" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}>‹</button>
                {[...Array(totalPages)].map((_, i) => <button key={i} className={`ai-news-amp-page-btn ${page===i+1?'ai-news-amp-page-btn-active':''}`} onClick={() => setPage(i+1)}>{i+1}</button>)}
                <button className="ai-news-amp-page-btn" onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages}>›</button>
              </div>
            )}
          </div>
        ) : (
          <div className="ai-news-admin-managing-pages-cards-grid">
            {paginated.map(co => (
              <article key={co._id} className="ai-news-admin-managing-pages-card">
                <div className="ai-news-admin-managing-pages-card-head">
                  <div>
                    <div className="ai-news-admin-managing-pages-card-title">
                      <div className="ai-news-amp-avatar" style={{ background:co.branding?.colors?.primary, width:30, height:30, fontSize:'0.72rem' }}>{co.name?.charAt(0)}</div>
                      {co.name} {co.isVerified && <Shield size={14} color="var(--amp-success)" />}
                    </div>
                    <div className="ai-news-admin-managing-pages-card-meta">{co.industry} · {co.team?.size}</div>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:'0.3rem', alignItems:'flex-end' }}>
                    <span className={`ai-news-amp-badge ai-news-amp-badge-${statusColor(co.status)}`}>{co.status}</span>
                    <span className={`ai-news-amp-badge ai-news-amp-badge-${verifyColor(co.verificationBadge)}`}>{co.verificationBadge}</span>
                  </div>
                </div>
                {co.tagline && <div className="ai-news-admin-managing-pages-card-body" style={{ fontStyle:'italic', color:'var(--amp-text-3)' }}>"{co.tagline}"</div>}
                <div className="ai-news-amp-tags-wrap">{(co.aiFocus||[]).map(f => <span key={f} className="ai-news-amp-tag-pill">{f}</span>)}</div>
                <div className="ai-news-amp-metric-grid" style={{ gridTemplateColumns:'repeat(3,1fr)' }}>
                  <div className="ai-news-amp-metric-card"><div className="ai-news-amp-metric-lbl">MAU</div><div className="ai-news-amp-metric-val" style={{ fontSize:'1rem' }}>{fmt(co.metrics?.monthlyActiveUsers)}</div></div>
                  <div className="ai-news-amp-metric-card"><div className="ai-news-amp-metric-lbl">Users</div><div className="ai-news-amp-metric-val" style={{ fontSize:'1rem' }}>{fmt(co.metrics?.totalUsers)}</div></div>
                  <div className="ai-news-amp-metric-card"><div className="ai-news-amp-metric-lbl">Articles</div><div className="ai-news-amp-metric-val" style={{ fontSize:'1rem' }}>{fmt(co.metrics?.totalArticles)}</div></div>
                </div>
                <div className="ai-news-admin-managing-pages-card-footer">
                  <div className="ai-news-amp-color-row">
                    {[co.branding?.colors?.primary, co.branding?.colors?.secondary, co.branding?.colors?.accent].map((c,i) => c && <div key={i} className="ai-news-amp-color-dot" style={{ background:c }} title={c} />)}
                  </div>
                  <div className="ai-news-admin-managing-pages-card-actions">
                    <button className="ai-news-amp-btn ai-news-amp-btn-ghost ai-news-amp-btn-sm ai-news-amp-btn-icon" onClick={() => openView(co)}><Eye size={14} /></button>
                    <button className="ai-news-amp-btn ai-news-amp-btn-outline ai-news-amp-btn-sm ai-news-amp-btn-icon" onClick={() => openEdit(co)}><Edit2 size={14} /></button>
                    <button className="ai-news-amp-btn ai-news-amp-btn-danger ai-news-amp-btn-sm ai-news-amp-btn-icon" onClick={() => handleDelete(co)}><Trash2 size={14} /></button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* ─── ADD/EDIT MODAL ────────────────────────────── */}
        {(modal === 'add' || modal === 'edit') && (
          <div className="ai-news-amp-modal-overlay" role="dialog" aria-modal="true" onClick={e => e.target === e.currentTarget && closeModal()}>
            <div className="ai-news-amp-modal ai-news-amp-modal-xl">
              <div className="ai-news-amp-modal-header">
                <div className="ai-news-amp-modal-title"><Building2 size={18} />{modal === 'add' ? 'Add Company' : 'Edit Company'}</div>
                <button className="ai-news-amp-modal-close" onClick={closeModal} aria-label="Close"><X size={18} /></button>
              </div>
              <div className="ai-news-amp-modal-body">
                <div className="ai-news-amp-tabs" style={{ marginBottom:'1.5rem' }}>
                  {TABS.map(({ id, label, icon: Icon }) => (
                    <button key={id} className={`ai-news-amp-tab ${activeTab===id?'ai-news-amp-tab-active':''}`} onClick={() => setActiveTab(id)}>
                      <Icon size={14} />{label}
                    </button>
                  ))}
                </div>

                {activeTab === 'basic' && (
                  <div className="ai-news-amp-form-grid">
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">Company Name <span className="ai-news-amp-label-req">*</span></label><input className="ai-news-amp-input" placeholder="e.g. OpenAI" value={form.name} onChange={e => setField('name', e.target.value)} /></div>
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">Legal Name</label><input className="ai-news-amp-input" placeholder="OpenAI LLC" value={form.legalName} onChange={e => setField('legalName', e.target.value)} /></div>
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">Slug</label><input className="ai-news-amp-input" placeholder="auto-generated" value={form.slug} onChange={e => setField('slug', e.target.value)} /></div>
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">Industry</label><select className="ai-news-amp-sel" value={form.industry} onChange={e => setField('industry', e.target.value)}>{INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}</select></div>
                    <div className="ai-news-amp-field ai-news-amp-form-full"><label className="ai-news-amp-label">Tagline</label><input className="ai-news-amp-input" placeholder="Short company motto…" value={form.tagline} onChange={e => setField('tagline', e.target.value)} /></div>
                    <div className="ai-news-amp-field ai-news-amp-form-full"><label className="ai-news-amp-label">Description</label><textarea className="ai-news-amp-textarea" placeholder="Company overview…" value={form.description} onChange={e => setField('description', e.target.value)} /></div>
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">Status</label><select className="ai-news-amp-sel" value={form.status} onChange={e => setField('status', e.target.value)}>{STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">Verification Badge</label><select className="ai-news-amp-sel" value={form.verificationBadge} onChange={e => setField('verificationBadge', e.target.value)}>{VERIFICATION.map(v => <option key={v} value={v}>{v}</option>)}</select></div>
                    <div className="ai-news-amp-form-section">AI Focus Areas (select all that apply)</div>
                    <div className="ai-news-amp-form-full" style={{ display:'flex', flexWrap:'wrap', gap:'0.5rem' }}>
                      {AI_FOCUS_OPTIONS.map(f => (
                        <button key={f} type="button"
                          className={`ai-news-amp-btn ai-news-amp-btn-sm ${form.aiFocus.includes(f) ? 'ai-news-amp-btn-primary' : 'ai-news-amp-btn-ghost'}`}
                          onClick={() => toggleFocus(f)} style={{ borderRadius:999 }}>
                          {f}
                        </button>
                      ))}
                    </div>
                    <div className="ai-news-amp-toggle-row ai-news-amp-form-full">
                      <div className="ai-news-amp-toggle-info"><div className="ai-news-amp-toggle-name">Verified</div><div className="ai-news-amp-toggle-desc">Company identity confirmed by admin</div></div>
                      <label className="ai-news-amp-switch"><input type="checkbox" className="ai-news-amp-switch-inp" checked={!!form.isVerified} onChange={e => setField('isVerified', e.target.checked)} /><span className="ai-news-amp-switch-track" /></label>
                    </div>
                  </div>
                )}

                {activeTab === 'branding' && (
                  <div className="ai-news-amp-form-grid">
                    <div className="ai-news-amp-form-section">Brand Colors</div>
                    {[['branding.colors.primary','Primary Color'],['branding.colors.secondary','Secondary Color'],['branding.colors.accent','Accent Color']].map(([k,l]) => (
                      <div key={k} className="ai-news-amp-field">
                        <label className="ai-news-amp-label">{l}</label>
                        <div style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}>
                          <input type="color" style={{ width:38, height:38, border:'none', background:'none', cursor:'pointer', borderRadius:8 }} value={form[k]} onChange={e => setField(k, e.target.value)} />
                          <input className="ai-news-amp-input" style={{ flex:1 }} value={form[k]} onChange={e => setField(k, e.target.value)} />
                        </div>
                      </div>
                    ))}
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">Font Family</label><input className="ai-news-amp-input" placeholder="Inter" value={form['branding.typography.fontFamily']} onChange={e => setField('branding.typography.fontFamily', e.target.value)} /></div>
                    <div className="ai-news-amp-form-section">Founded</div>
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">Year</label><input type="number" className="ai-news-amp-input" placeholder="2023" value={form['founded.year']} onChange={e => setField('founded.year', e.target.value)} /></div>
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">Month</label><input type="number" min={1} max={12} className="ai-news-amp-input" placeholder="1-12" value={form['founded.month']} onChange={e => setField('founded.month', e.target.value)} /></div>
                  </div>
                )}

                {activeTab === 'web' && (
                  <div className="ai-news-amp-form-grid">
                    <div className="ai-news-amp-form-section">Websites</div>
                    {[['website.main','Main Website','https://company.com'],['website.blog','Blog URL','https://blog.company.com'],['website.careers','Careers Page','https://jobs.company.com'],['website.api','API Docs','https://api.company.com']].map(([k,l,p]) => (
                      <div key={k} className="ai-news-amp-field"><label className="ai-news-amp-label">{l}</label><input className="ai-news-amp-input" placeholder={p} value={form[k]} onChange={e => setField(k, e.target.value)} /></div>
                    ))}
                  </div>
                )}

                {activeTab === 'team' && (
                  <div className="ai-news-amp-form-grid">
                    <div className="ai-news-amp-form-section">Team</div>
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">Team Size</label><select className="ai-news-amp-sel" value={form['team.size']} onChange={e => setField('team.size', e.target.value)}>{TEAM_SIZES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                    <div className="ai-news-amp-toggle-row ai-news-amp-form-full">
                      <div className="ai-news-amp-toggle-info"><div className="ai-news-amp-toggle-name">Remote-Friendly</div><div className="ai-news-amp-toggle-desc">Company supports remote work</div></div>
                      <label className="ai-news-amp-switch"><input type="checkbox" className="ai-news-amp-switch-inp" checked={!!form['team.remote']} onChange={e => setField('team.remote', e.target.checked)} /><span className="ai-news-amp-switch-track" /></label>
                    </div>
                    <div className="ai-news-amp-form-section">Legal Information</div>
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">Legal Structure</label><select className="ai-news-amp-sel" value={form['legal.legalStructure']} onChange={e => setField('legal.legalStructure', e.target.value)}>{LEGAL_STRUCTS.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">Registration No.</label><input className="ai-news-amp-input" placeholder="REG-123456" value={form['legal.registrationNumber']} onChange={e => setField('legal.registrationNumber', e.target.value)} /></div>
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">Tax ID</label><input className="ai-news-amp-input" placeholder="12-3456789" value={form['legal.taxId']} onChange={e => setField('legal.taxId', e.target.value)} /></div>
                    <div className="ai-news-amp-field ai-news-amp-form-full"><label className="ai-news-amp-label">Notes</label><textarea className="ai-news-amp-textarea" style={{ minHeight:60 }} value={form.notes} onChange={e => setField('notes', e.target.value)} /></div>
                  </div>
                )}

                {activeTab === 'metrics' && (
                  <div className="ai-news-amp-form-grid">
                    <div className="ai-news-amp-form-section">Platform Metrics</div>
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">Monthly Active Users</label><input type="number" className="ai-news-amp-input" value={form['metrics.monthlyActiveUsers']} onChange={e => setField('metrics.monthlyActiveUsers', e.target.value)} /></div>
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">Total Users</label><input type="number" className="ai-news-amp-input" value={form['metrics.totalUsers']} onChange={e => setField('metrics.totalUsers', e.target.value)} /></div>
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">Total Articles</label><input type="number" className="ai-news-amp-input" value={form['metrics.totalArticles']} onChange={e => setField('metrics.totalArticles', e.target.value)} /></div>
                  </div>
                )}
              </div>
              <div className="ai-news-amp-modal-footer">
                <button className="ai-news-amp-btn ai-news-amp-btn-ghost" onClick={closeModal}>Cancel</button>
                <button className="ai-news-amp-btn ai-news-amp-btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? <><span className="ai-news-amp-loader" style={{ width:16, height:16 }} /> Saving…</> : modal==='add' ? <><Plus size={15} />Create</> : <><CheckCircle size={15} />Update</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── VIEW MODAL ─────────────────────────────────── */}
        {modal === 'view' && selected && (
          <div className="ai-news-amp-modal-overlay" role="dialog" aria-modal="true" onClick={e => e.target === e.currentTarget && closeModal()}>
            <div className="ai-news-amp-modal ai-news-amp-modal-lg">
              <div className="ai-news-amp-modal-header">
                <div className="ai-news-amp-modal-title">
                  <div className="ai-news-amp-avatar" style={{ background:selected.branding?.colors?.primary, width:28, height:28, fontSize:'0.75rem' }}>{selected.name?.charAt(0)}</div>
                  {selected.name}
                  {selected.isVerified && <Shield size={15} color="var(--amp-success)" />}
                </div>
                <button className="ai-news-amp-modal-close" onClick={closeModal} aria-label="Close"><X size={18} /></button>
              </div>
              <div className="ai-news-amp-modal-body">
                <div className="ai-news-amp-tags-wrap" style={{ marginBottom:'1rem' }}>
                  <span className="ai-news-amp-badge ai-news-amp-badge-purple">{selected.industry}</span>
                  <span className={`ai-news-amp-badge ai-news-amp-badge-${statusColor(selected.status)}`}>{selected.status}</span>
                  <span className={`ai-news-amp-badge ai-news-amp-badge-${verifyColor(selected.verificationBadge)}`}>{selected.verificationBadge}</span>
                </div>
                {selected.tagline && <p style={{ fontStyle:'italic', color:'var(--amp-text-3)', marginBottom:'0.75rem' }}>"{selected.tagline}"</p>}
                {selected.description && <p style={{ fontSize:'0.9rem', color:'var(--amp-text-2)', marginBottom:'1rem', lineHeight:1.6 }}>{selected.description}</p>}
                <div className="ai-news-amp-glow-sep" />
                <div className="ai-news-amp-metric-grid" style={{ marginBottom:'1.25rem' }}>
                  {[
                    { lbl:'MAU',       val:fmt(selected.metrics?.monthlyActiveUsers) },
                    { lbl:'Users',     val:fmt(selected.metrics?.totalUsers) },
                    { lbl:'Articles',  val:fmt(selected.metrics?.totalArticles) },
                    { lbl:'Team Size', val:selected.team?.size||'—' },
                  ].map(({ lbl, val }) => (
                    <div key={lbl} className="ai-news-amp-metric-card"><div className="ai-news-amp-metric-lbl">{lbl}</div><div className="ai-news-amp-metric-val">{val}</div></div>
                  ))}
                </div>
                <div className="ai-news-amp-tags-wrap" style={{ marginBottom:'1rem' }}>
                  {(selected.aiFocus||[]).map(f => <span key={f} className="ai-news-amp-tag-pill">{f}</span>)}
                </div>
                {selected.website?.main && (
                  <div className="ai-news-amp-detail-item" style={{ marginBottom:'0.75rem' }}>
                    <div className="ai-news-amp-detail-key">Website</div>
                    <a href={selected.website.main} target="_blank" rel="noopener noreferrer" style={{ color:'var(--amp-primary)', fontSize:'0.88rem', display:'flex', alignItems:'center', gap:'0.3rem' }}>
                      {selected.website.main} <ExternalLink size={12} />
                    </a>
                  </div>
                )}
                <div className="ai-news-amp-detail-grid">
                  <div className="ai-news-amp-detail-item"><div className="ai-news-amp-detail-key">Legal Structure</div><div className="ai-news-amp-detail-val">{selected.legal?.legalStructure||'—'}</div></div>
                  <div className="ai-news-amp-detail-item"><div className="ai-news-amp-detail-key">Founded</div><div className="ai-news-amp-detail-val">{[selected.founded?.month, selected.founded?.year].filter(Boolean).join('/') || '—'}</div></div>
                  <div className="ai-news-amp-detail-item"><div className="ai-news-amp-detail-key">Remote</div><div className="ai-news-amp-detail-val">{selected.team?.remote ? 'Yes' : 'No'}</div></div>
                </div>
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

