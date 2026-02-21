import { useState, useEffect, useContext, useCallback } from 'react';
import {
  Link2, Plus, Search, Edit2, Trash2, Eye, RefreshCw,
  CheckCircle, XCircle, Star, Shield, AlertTriangle, X,
  ChevronRight, Info, List, LayoutGrid, Globe, BookOpen,
  TrendingUp, Award, ExternalLink, Flag
} from 'lucide-react';
import Swal from 'sweetalert2';
import { ThemeContext } from '../../context/ThemeContext';

const TOKEN_KEY = 'ai_news_admin_token';
const getToken  = () => localStorage.getItem(TOKEN_KEY);
const fmt       = n => (n == null ? '—' : Number(n).toLocaleString());

const SOURCE_TYPES  = ['research-paper','academic-journal','conference','university','research-lab','tech-company','blog','news-outlet','social-media','github','arxiv','medium','substack','youtube','podcast','government','nonprofit','other'];
const SOURCE_STATUS = ['active','inactive','under-review','blacklisted'];
const PUB_FREQ      = ['daily','weekly','monthly','quarterly','irregular'];
const LICENSES      = ['all-rights-reserved','cc-by','cc-by-sa','cc-by-nc','cc-by-nd','cc-by-nc-sa','cc-by-nc-nd','cc0','public-domain','unknown'];

const statusColor = s => ({ active:'green', inactive:'gray', 'under-review':'orange', blacklisted:'red' }[s] || 'gray');
const credColor   = n => n >= 8 ? 'green' : n >= 5 ? 'orange' : 'red';

const EMPTY = {
  name:'', displayName:'', type:'blog', subtype:'', description:'',
  status:'active', license:'unknown',
  'website.url':'', 'website.domain':'', rssFeed:'', apiEndpoint:'',
  'socialMedia.twitter':'', 'socialMedia.linkedin':'', 'socialMedia.github':'',
  'credibility.score':5, 'credibility.verified':false,
  'credibility.trustIndicators.hasPeerReview':false,
  'credibility.trustIndicators.hasCitations':false,
  'credibility.trustIndicators.isInstitutional':false,
  'credibility.trustIndicators.hasOriginalResearch':false,
  'credibility.trustIndicators.transparencyScore':5,
  publicationFrequency:'weekly', averageArticlesPerWeek:'',
  categories:[], expertise:[], languages:['en'], tags:[],
  'qualityIndicators.isOpenAccess':false, 'qualityIndicators.isReputable':false,
  'qualityIndicators.hasISSN':'', 'qualityIndicators.impactScore':'',
  'contactInfo.email':'', 'contactInfo.editorialEmail':'',
  'apiInfo.hasApi':false, 'apiInfo.apiType':'', 'apiInfo.requiresKey':false,
  notes:'',
};

export default function AdminSource() {
  const { isDarkMode } = useContext(ThemeContext);
  const validToken = getToken();

  const [sources, setSources]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [view, setView]             = useState('table');
  const [page, setPage]             = useState(1);
  const [modal, setModal]           = useState(null);
  const [selected, setSelected]     = useState(null);
  const [form, setForm]             = useState(EMPTY);
  const [saving, setSaving]         = useState(false);
  const [activeTab, setActiveTab]   = useState('basic');

  const PER_PAGE = 12;

  const fetchSources = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/sources?limit=200', {
        headers: { 'Authorization': `Bearer ${validToken}`, 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSources(data.sources || data.data || (Array.isArray(data) ? data : []));
    } catch {
      Swal.fire({ title:'Error!', text:'Failed to load sources', icon:'error',
        background:isDarkMode?'#10102a':'#fff', color:isDarkMode?'#eeeeff':'#0d0d2b' });
    } finally { setLoading(false); }
  }, [validToken, isDarkMode]);

  useEffect(() => { fetchSources(); }, [fetchSources]);

  const filtered = sources.filter(s => {
    const q = search.toLowerCase();
    return (!q || s.name?.toLowerCase().includes(q) || s.website?.domain?.toLowerCase().includes(q))
      && (!filterType   || s.type === filterType)
      && (!filterStatus || s.status === filterStatus);
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const stats = {
    total:      sources.length,
    active:     sources.filter(s => s.status === 'active').length,
    verified:   sources.filter(s => s.credibility?.verified).length,
    highCred:   sources.filter(s => (s.credibility?.score||0) >= 8).length,
    underReview:sources.filter(s => s.status === 'under-review').length,
  };

  const openAdd  = () => { setForm(EMPTY); setSelected(null); setActiveTab('basic'); setModal('add'); };
  const openEdit = (src) => {
    setSelected(src);
    setForm({
      name: src.name||'', displayName: src.displayName||'', type: src.type||'blog',
      subtype: src.subtype||'', description: src.description||'', status: src.status||'active',
      license: src.license||'unknown',
      'website.url': src.website?.url||'', 'website.domain': src.website?.domain||'',
      rssFeed: src.rssFeed||'', apiEndpoint: src.apiEndpoint||'',
      'socialMedia.twitter': src.socialMedia?.twitter||'',
      'socialMedia.linkedin': src.socialMedia?.linkedin||'',
      'socialMedia.github': src.socialMedia?.github||'',
      'credibility.score': src.credibility?.score||5,
      'credibility.verified': src.credibility?.verified??false,
      'credibility.trustIndicators.hasPeerReview': src.credibility?.trustIndicators?.hasPeerReview??false,
      'credibility.trustIndicators.hasCitations': src.credibility?.trustIndicators?.hasCitations??false,
      'credibility.trustIndicators.isInstitutional': src.credibility?.trustIndicators?.isInstitutional??false,
      'credibility.trustIndicators.hasOriginalResearch': src.credibility?.trustIndicators?.hasOriginalResearch??false,
      'credibility.trustIndicators.transparencyScore': src.credibility?.trustIndicators?.transparencyScore||5,
      publicationFrequency: src.publicationFrequency||'weekly',
      averageArticlesPerWeek: src.averageArticlesPerWeek||'',
      categories: src.categories||[], expertise: src.expertise||[], languages: src.languages||['en'], tags: src.tags||[],
      'qualityIndicators.isOpenAccess': src.qualityIndicators?.isOpenAccess??false,
      'qualityIndicators.isReputable': src.qualityIndicators?.isReputable??false,
      'qualityIndicators.hasISSN': src.qualityIndicators?.hasISSN||'',
      'qualityIndicators.impactScore': src.qualityIndicators?.impactScore||'',
      'contactInfo.email': src.contactInfo?.email||'',
      'contactInfo.editorialEmail': src.contactInfo?.editorialEmail||'',
      'apiInfo.hasApi': src.apiInfo?.hasApi??false,
      'apiInfo.apiType': src.apiInfo?.apiType||'',
      'apiInfo.requiresKey': src.apiInfo?.requiresKey??false,
      notes: src.notes||'',
    });
    setActiveTab('basic'); setModal('edit');
  };
  const openView   = (src) => { setSelected(src); setModal('view'); };
  const closeModal = () => { setModal(null); setSelected(null); };
  const setField   = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name.trim() || !form.type) {
      return Swal.fire({ title:'Validation', text:'Name and Type are required', icon:'warning',
        background:isDarkMode?'#10102a':'#fff', color:isDarkMode?'#eeeeff':'#0d0d2b' });
    }
    setSaving(true);
    const body = {
      name: form.name, displayName: form.displayName||undefined, type: form.type,
      subtype: form.subtype||undefined, description: form.description, status: form.status, license: form.license,
      website: { url: form['website.url'], domain: form['website.domain'] },
      rssFeed: form.rssFeed||undefined, apiEndpoint: form.apiEndpoint||undefined,
      socialMedia: { twitter: form['socialMedia.twitter'], linkedin: form['socialMedia.linkedin'], github: form['socialMedia.github'] },
      credibility: {
        score: Number(form['credibility.score']),
        verified: form['credibility.verified'],
        trustIndicators: {
          hasPeerReview: form['credibility.trustIndicators.hasPeerReview'],
          hasCitations: form['credibility.trustIndicators.hasCitations'],
          isInstitutional: form['credibility.trustIndicators.isInstitutional'],
          hasOriginalResearch: form['credibility.trustIndicators.hasOriginalResearch'],
          transparencyScore: Number(form['credibility.trustIndicators.transparencyScore']),
        },
      },
      publicationFrequency: form.publicationFrequency,
      averageArticlesPerWeek: form.averageArticlesPerWeek ? Number(form.averageArticlesPerWeek) : undefined,
      categories: form.categories, expertise: form.expertise, languages: form.languages, tags: form.tags,
      qualityIndicators: {
        isOpenAccess: form['qualityIndicators.isOpenAccess'],
        isReputable: form['qualityIndicators.isReputable'],
        hasISSN: form['qualityIndicators.hasISSN']||undefined,
        impactScore: form['qualityIndicators.impactScore'] ? Number(form['qualityIndicators.impactScore']) : undefined,
      },
      contactInfo: { email: form['contactInfo.email'], editorialEmail: form['contactInfo.editorialEmail'] },
      apiInfo: { hasApi: form['apiInfo.hasApi'], apiType: form['apiInfo.apiType']||undefined, requiresKey: form['apiInfo.requiresKey'] },
      notes: form.notes||undefined,
    };
    try {
      const isEdit = modal === 'edit';
      const res = await fetch(isEdit ? `/api/admin/sources/${selected._id}` : '/api/admin/sources', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Authorization': `Bearer ${validToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message || 'Failed'); }
      Swal.fire({ title:'Saved!', text:`Source ${isEdit ? 'updated' : 'created'}`, icon:'success',
        timer:1800, showConfirmButton:false, background:isDarkMode?'#10102a':'#fff', color:isDarkMode?'#eeeeff':'#0d0d2b' });
      closeModal(); fetchSources();
    } catch (err) {
      Swal.fire({ title:'Error!', text:err.message, icon:'error',
        background:isDarkMode?'#10102a':'#fff', color:isDarkMode?'#eeeeff':'#0d0d2b' });
    } finally { setSaving(false); }
  };

  const handleDelete = async (src) => {
    const res = await Swal.fire({ title:`Delete "${src.name}"?`, text:'Source will be removed.', icon:'warning',
      showCancelButton:true, confirmButtonText:'Delete', confirmButtonColor:'#ff4d6d',
      background:isDarkMode?'#10102a':'#fff', color:isDarkMode?'#eeeeff':'#0d0d2b' });
    if (!res.isConfirmed) return;
    try {
      const r = await fetch(`/api/admin/sources/${src._id}`, { method:'DELETE',
        headers: { 'Authorization': `Bearer ${validToken}` } });
      if (!r.ok) throw new Error('Failed');
      Swal.fire({ title:'Deleted', icon:'success', timer:1500, showConfirmButton:false,
        background:isDarkMode?'#10102a':'#fff', color:isDarkMode?'#eeeeff':'#0d0d2b' });
      fetchSources();
    } catch (err) {
      Swal.fire({ title:'Error!', text:err.message, icon:'error',
        background:isDarkMode?'#10102a':'#fff', color:isDarkMode?'#eeeeff':'#0d0d2b' });
    }
  };

  const flagSource = async (src) => {
    const { value: flagType } = await Swal.fire({
      title: 'Flag Source', text: 'Select a flag reason:',
      input: 'select', inputOptions: { bias:'Bias', inaccurate:'Inaccurate', unreliable:'Unreliable' },
      showCancelButton:true, confirmButtonText:'Flag',
      background:isDarkMode?'#10102a':'#fff', color:isDarkMode?'#eeeeff':'#0d0d2b'
    });
    if (!flagType) return;
    try {
      await fetch(`/api/admin/sources/${src._id}/flag`, {
        method:'POST', headers:{ 'Authorization':`Bearer ${validToken}`, 'Content-Type':'application/json' },
        body: JSON.stringify({ flagType })
      });
      Swal.fire({ title:'Flagged!', icon:'success', timer:1500, showConfirmButton:false,
        background:isDarkMode?'#10102a':'#fff', color:isDarkMode?'#eeeeff':'#0d0d2b' });
      fetchSources();
    } catch { /**/ }
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
    { id:'basic',   label:'Basic Info' },
    { id:'cred',    label:'Credibility' },
    { id:'quality', label:'Quality' },
    { id:'contact', label:'Contact & API' },
  ];

  return (
    <div className={`ai-news-admin-managing-pages-root ${isDarkMode ? 'dark' : 'light'}`}>
      <main className="ai-news-admin-managing-pages-page">

        <nav className="ai-news-amp-breadcrumb" aria-label="Breadcrumb">
          <span>Admin</span><ChevronRight size={13} /><span>Content</span><ChevronRight size={13} /><span>Sources</span>
        </nav>

        <header className="ai-news-admin-managing-pages-header">
          <div className="ai-news-admin-managing-pages-header-left">
            <div className="ai-news-admin-managing-pages-icon-wrap"><Link2 size={24} /></div>
            <div>
              <h1 className="ai-news-admin-managing-pages-title">Content Sources</h1>
              <p className="ai-news-admin-managing-pages-subtitle">
                Journals, blogs, research labs, and news outlets powering AI News
                <span className="ai-news-amp-badge ai-news-amp-badge-purple">{stats.total} Sources</span>
              </p>
            </div>
          </div>
          <div className="ai-news-admin-managing-pages-header-actions">
            <button className="ai-news-amp-btn ai-news-amp-btn-ghost" onClick={fetchSources}>
              <RefreshCw size={15} className={loading ? 'ai-news-amp-spinning' : ''} /> Refresh
            </button>
            <button className="ai-news-amp-btn ai-news-amp-btn-primary" onClick={openAdd}><Plus size={16} />Add Source</button>
          </div>
        </header>

        <div className="ai-news-amp-info-box" role="note">
          <div className="ai-news-amp-info-box-title"><Info size={14} /> Source Trust Framework</div>
          <p className="ai-news-amp-info-box-text">
            AI News evaluates every content source on a 10-point credibility score based on peer-review status, citation count,
            institutional backing, and transparency metrics. Sources scoring below 5 are flagged for editorial review. The trust framework
            ensures AI-generated summaries and recommendations only draw from verified, high-quality sources. Research predicts that
            by 2026, 70% of AI news content will cite academic or institutional sources — making source provenance tracking essential
            for editorial credibility and SEO E-E-A-T signals.
          </p>
        </div>

        <div className="ai-news-admin-managing-pages-stats">
          {[
            { label:'Total Sources',  val:fmt(stats.total),       ico:Link2,        cls:'ai-news-amp-ico-purple' },
            { label:'Active',         val:fmt(stats.active),      ico:CheckCircle,  cls:'ai-news-amp-ico-green'  },
            { label:'Verified',       val:fmt(stats.verified),    ico:Shield,       cls:'ai-news-amp-ico-cyan'   },
            { label:'High Credibility',val:fmt(stats.highCred),   ico:Star,         cls:'ai-news-amp-ico-gold'   },
            { label:'Under Review',   val:fmt(stats.underReview), ico:AlertTriangle,cls:'ai-news-amp-ico-red'    },
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
            <input className="ai-news-admin-managing-pages-search-input" placeholder="Search sources by name or domain…"
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} aria-label="Search sources" />
            {search && <button style={{ background:'none',border:'none',cursor:'pointer',color:'var(--amp-text-3)',display:'flex' }} onClick={() => setSearch('')}><X size={14} /></button>}
          </div>
          <select className="ai-news-admin-managing-pages-select" value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1); }} aria-label="Filter type">
            <option value="">All Types</option>
            {SOURCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select className="ai-news-admin-managing-pages-select" value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }} aria-label="Filter status">
            <option value="">All Status</option>
            {SOURCE_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="ai-news-admin-managing-pages-toolbar-spacer" />
          <div className="ai-news-amp-view-toggle">
            <button className={`ai-news-amp-view-btn ${view==='table'?'ai-news-amp-view-btn-active':''}`} onClick={() => setView('table')}><List size={16} /></button>
            <button className={`ai-news-amp-view-btn ${view==='grid'?'ai-news-amp-view-btn-active':''}`} onClick={() => setView('grid')}><LayoutGrid size={16} /></button>
          </div>
        </div>

        {loading ? (
          <div className="ai-news-admin-managing-pages-table-wrap">
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ padding:'1rem 1.5rem', borderBottom:'1px solid var(--amp-border)' }}>
                <div className="ai-news-amp-skeleton" style={{ height:20, width:'55%', marginBottom:8 }} />
                <div className="ai-news-amp-skeleton" style={{ height:14, width:'35%' }} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="ai-news-admin-managing-pages-table-wrap">
            <div className="ai-news-amp-empty">
              <div className="ai-news-amp-empty-ico"><Link2 size={60} /></div>
              <div className="ai-news-amp-empty-title">No sources found</div>
              <p className="ai-news-amp-empty-text">Add content sources to power AI News attribution.</p>
              <button className="ai-news-amp-btn ai-news-amp-btn-primary" style={{ marginTop:'1rem' }} onClick={openAdd}><Plus size={15} />Add Source</button>
            </div>
          </div>
        ) : view === 'table' ? (
          <div className="ai-news-admin-managing-pages-table-wrap">
            <div className="ai-news-admin-managing-pages-table-scroll">
              <table className="ai-news-admin-managing-pages-table" aria-label="Sources table">
                <thead className="ai-news-admin-managing-pages-table-head">
                  <tr>{['Source','Type','Domain','Credibility','Verified','Status','Actions'].map(h => <th key={h} className="ai-news-admin-managing-pages-table-th">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {paginated.map(src => (
                    <tr key={src._id} className="ai-news-admin-managing-pages-table-row">
                      <td className="ai-news-admin-managing-pages-table-td">
                        <div className="ai-news-admin-managing-pages-table-td-name">
                          <div className="ai-news-amp-avatar" style={{ width:30, height:30, fontSize:'0.72rem' }}>{src.name?.charAt(0)}</div>
                          <div>
                            <div style={{ fontWeight:700, color:'var(--amp-text)' }}>{src.displayName||src.name}</div>
                            <div style={{ fontSize:'0.74rem', color:'var(--amp-text-3)' }}>{src.publicationFrequency}</div>
                          </div>
                        </div>
                      </td>
                      <td className="ai-news-admin-managing-pages-table-td"><span className="ai-news-amp-badge ai-news-amp-badge-purple">{src.type}</span></td>
                      <td className="ai-news-admin-managing-pages-table-td">
                        {src.website?.domain
                          ? <a href={src.website.url||`https://${src.website.domain}`} target="_blank" rel="noopener noreferrer" style={{ color:'var(--amp-primary)', fontSize:'0.84rem', display:'flex', alignItems:'center', gap:'0.25rem' }}>
                              {src.website.domain}<ExternalLink size={11} />
                            </a>
                          : '—'}
                      </td>
                      <td className="ai-news-admin-managing-pages-table-td">
                        <div className="ai-news-amp-score-bar">
                          <div className="ai-news-amp-score-track">
                            <div className="ai-news-amp-score-fill" style={{ width:`${((src.credibility?.score||0)/10)*100}%` }} />
                          </div>
                          <span className={`ai-news-amp-score-val`} style={{ color:`var(--amp-${credColor(src.credibility?.score||0)})` }}>
                            {(src.credibility?.score||0).toFixed(1)}/10
                          </span>
                        </div>
                      </td>
                      <td className="ai-news-admin-managing-pages-table-td">
                        {src.credibility?.verified
                          ? <span className="ai-news-amp-badge ai-news-amp-badge-green"><Shield size={11} /> Yes</span>
                          : <span className="ai-news-amp-badge ai-news-amp-badge-gray">No</span>}
                      </td>
                      <td className="ai-news-admin-managing-pages-table-td"><span className={`ai-news-amp-badge ai-news-amp-badge-${statusColor(src.status)}`}>{src.status}</span></td>
                      <td className="ai-news-admin-managing-pages-table-td">
                        <div className="ai-news-admin-managing-pages-table-actions">
                          <button className="ai-news-amp-btn ai-news-amp-btn-ghost ai-news-amp-btn-sm ai-news-amp-btn-icon" onClick={() => openView(src)} aria-label="View"><Eye size={14} /></button>
                          <button className="ai-news-amp-btn ai-news-amp-btn-outline ai-news-amp-btn-sm ai-news-amp-btn-icon" onClick={() => openEdit(src)} aria-label="Edit"><Edit2 size={14} /></button>
                          <button className="ai-news-amp-btn ai-news-amp-btn-warning ai-news-amp-btn-sm ai-news-amp-btn-icon" onClick={() => flagSource(src)} aria-label="Flag"><Flag size={14} /></button>
                          <button className="ai-news-amp-btn ai-news-amp-btn-danger ai-news-amp-btn-sm ai-news-amp-btn-icon" onClick={() => handleDelete(src)} aria-label="Delete"><Trash2 size={14} /></button>
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
            {paginated.map(src => (
              <article key={src._id} className="ai-news-admin-managing-pages-card">
                <div className="ai-news-admin-managing-pages-card-head">
                  <div>
                    <div className="ai-news-admin-managing-pages-card-title">
                      <div className="ai-news-amp-avatar" style={{ width:30, height:30, fontSize:'0.72rem' }}>{src.name?.charAt(0)}</div>
                      {src.displayName||src.name}
                      {src.credibility?.verified && <Shield size={14} color="var(--amp-success)" />}
                    </div>
                    <div className="ai-news-admin-managing-pages-card-meta">{src.type} · {src.publicationFrequency}</div>
                  </div>
                  <span className={`ai-news-amp-badge ai-news-amp-badge-${statusColor(src.status)}`}>{src.status}</span>
                </div>
                {src.description && <div className="ai-news-admin-managing-pages-card-body" style={{ display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{src.description}</div>}
                <div>
                  <div style={{ fontSize:'0.78rem', color:'var(--amp-text-3)', marginBottom:'0.35rem' }}>Credibility Score</div>
                  <div className="ai-news-amp-score-bar">
                    <div className="ai-news-amp-score-track"><div className="ai-news-amp-score-fill" style={{ width:`${((src.credibility?.score||0)/10)*100}%` }} /></div>
                    <span className="ai-news-amp-score-val" style={{ color:`var(--amp-${credColor(src.credibility?.score||0)})` }}>{(src.credibility?.score||0).toFixed(1)}/10</span>
                  </div>
                </div>
                <div className="ai-news-amp-metric-grid" style={{ gridTemplateColumns:'repeat(2,1fr)' }}>
                  <div className="ai-news-amp-metric-card"><div className="ai-news-amp-metric-lbl">Articles</div><div className="ai-news-amp-metric-val" style={{ fontSize:'1rem' }}>{fmt(src.metrics?.totalArticlesReferenced)}</div></div>
                  <div className="ai-news-amp-metric-card"><div className="ai-news-amp-metric-lbl">Citations</div><div className="ai-news-amp-metric-val" style={{ fontSize:'1rem' }}>{fmt(src.metrics?.totalCitations)}</div></div>
                </div>
                <div className="ai-news-admin-managing-pages-card-footer">
                  <span className="ai-news-amp-badge ai-news-amp-badge-cyan">{src.license}</span>
                  <div className="ai-news-admin-managing-pages-card-actions">
                    <button className="ai-news-amp-btn ai-news-amp-btn-ghost ai-news-amp-btn-sm ai-news-amp-btn-icon" onClick={() => openView(src)}><Eye size={14} /></button>
                    <button className="ai-news-amp-btn ai-news-amp-btn-outline ai-news-amp-btn-sm ai-news-amp-btn-icon" onClick={() => openEdit(src)}><Edit2 size={14} /></button>
                    <button className="ai-news-amp-btn ai-news-amp-btn-danger ai-news-amp-btn-sm ai-news-amp-btn-icon" onClick={() => handleDelete(src)}><Trash2 size={14} /></button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* ─── ADD/EDIT MODAL ─────────────────────────────── */}
        {(modal === 'add' || modal === 'edit') && (
          <div className="ai-news-amp-modal-overlay" role="dialog" aria-modal="true" onClick={e => e.target === e.currentTarget && closeModal()}>
            <div className="ai-news-amp-modal ai-news-amp-modal-xl">
              <div className="ai-news-amp-modal-header">
                <div className="ai-news-amp-modal-title"><Link2 size={18} />{modal === 'add' ? 'Add Source' : 'Edit Source'}</div>
                <button className="ai-news-amp-modal-close" onClick={closeModal} aria-label="Close"><X size={18} /></button>
              </div>
              <div className="ai-news-amp-modal-body">
                <div className="ai-news-amp-tabs" style={{ marginBottom:'1.5rem' }}>
                  {TABS.map(({ id, label }) => (
                    <button key={id} className={`ai-news-amp-tab ${activeTab===id?'ai-news-amp-tab-active':''}`} onClick={() => setActiveTab(id)}>{label}</button>
                  ))}
                </div>

                {activeTab === 'basic' && (
                  <div className="ai-news-amp-form-grid">
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">Name <span className="ai-news-amp-label-req">*</span></label><input className="ai-news-amp-input" placeholder="e.g. arXiv" value={form.name} onChange={e => setField('name', e.target.value)} /></div>
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">Display Name</label><input className="ai-news-amp-input" placeholder="arXiv.org" value={form.displayName} onChange={e => setField('displayName', e.target.value)} /></div>
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">Type <span className="ai-news-amp-label-req">*</span></label><select className="ai-news-amp-sel" value={form.type} onChange={e => setField('type', e.target.value)}>{SOURCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">Status</label><select className="ai-news-amp-sel" value={form.status} onChange={e => setField('status', e.target.value)}>{SOURCE_STATUS.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                    <div className="ai-news-amp-field ai-news-amp-form-full"><label className="ai-news-amp-label">Description</label><textarea className="ai-news-amp-textarea" placeholder="Source overview…" value={form.description} onChange={e => setField('description', e.target.value)} /></div>
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">Website URL</label><input className="ai-news-amp-input" placeholder="https://arxiv.org" value={form['website.url']} onChange={e => setField('website.url', e.target.value)} /></div>
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">Domain</label><input className="ai-news-amp-input" placeholder="arxiv.org" value={form['website.domain']} onChange={e => setField('website.domain', e.target.value)} /></div>
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">RSS Feed URL</label><input className="ai-news-amp-input" placeholder="https://…/feed.xml" value={form.rssFeed} onChange={e => setField('rssFeed', e.target.value)} /></div>
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">Publication Frequency</label><select className="ai-news-amp-sel" value={form.publicationFrequency} onChange={e => setField('publicationFrequency', e.target.value)}>{PUB_FREQ.map(f => <option key={f} value={f}>{f}</option>)}</select></div>
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">Avg Articles / Week</label><input type="number" min={0} className="ai-news-amp-input" value={form.averageArticlesPerWeek} onChange={e => setField('averageArticlesPerWeek', e.target.value)} /></div>
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">License</label><select className="ai-news-amp-sel" value={form.license} onChange={e => setField('license', e.target.value)}>{LICENSES.map(l => <option key={l} value={l}>{l}</option>)}</select></div>
                    <div className="ai-news-amp-form-section">Social Media</div>
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">Twitter</label><input className="ai-news-amp-input" placeholder="@handle" value={form['socialMedia.twitter']} onChange={e => setField('socialMedia.twitter', e.target.value)} /></div>
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">LinkedIn</label><input className="ai-news-amp-input" placeholder="linkedin.com/company/…" value={form['socialMedia.linkedin']} onChange={e => setField('socialMedia.linkedin', e.target.value)} /></div>
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">GitHub</label><input className="ai-news-amp-input" placeholder="github.com/…" value={form['socialMedia.github']} onChange={e => setField('socialMedia.github', e.target.value)} /></div>
                  </div>
                )}

                {activeTab === 'cred' && (
                  <div className="ai-news-amp-form-grid">
                    <div className="ai-news-amp-field ai-news-amp-form-full">
                      <label className="ai-news-amp-label">Credibility Score: <strong>{form['credibility.score']}</strong> / 10</label>
                      <input type="range" min={0} max={10} step={0.5} style={{ width:'100%', accentColor:'var(--amp-primary)', marginTop:'0.5rem' }} value={form['credibility.score']} onChange={e => setField('credibility.score', parseFloat(e.target.value))} />
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.75rem', color:'var(--amp-text-3)' }}><span>0 — Unreliable</span><span>5 — Average</span><span>10 — Excellent</span></div>
                    </div>
                    <Toggle fieldKey="credibility.verified" label="Verified Source" desc="Admin confirmed the source identity and credibility" />
                    <div className="ai-news-amp-form-section">Trust Indicators</div>
                    <Toggle fieldKey="credibility.trustIndicators.hasPeerReview" label="Peer Reviewed" desc="Content is peer-reviewed before publication" />
                    <Toggle fieldKey="credibility.trustIndicators.hasCitations" label="Has Citations" desc="Articles include citations and references" />
                    <Toggle fieldKey="credibility.trustIndicators.isInstitutional" label="Institutional" desc="Backed by a university, government, or research lab" />
                    <Toggle fieldKey="credibility.trustIndicators.hasOriginalResearch" label="Original Research" desc="Publishes original research, not just aggregation" />
                    <div className="ai-news-amp-field ai-news-amp-form-full">
                      <label className="ai-news-amp-label">Transparency Score: <strong>{form['credibility.trustIndicators.transparencyScore']}</strong> / 10</label>
                      <input type="range" min={0} max={10} step={1} style={{ width:'100%', accentColor:'var(--amp-primary)', marginTop:'0.5rem' }} value={form['credibility.trustIndicators.transparencyScore']} onChange={e => setField('credibility.trustIndicators.transparencyScore', Number(e.target.value))} />
                    </div>
                  </div>
                )}

                {activeTab === 'quality' && (
                  <div className="ai-news-amp-form-grid">
                    <Toggle fieldKey="qualityIndicators.isOpenAccess" label="Open Access" desc="Content freely accessible without paywall" />
                    <Toggle fieldKey="qualityIndicators.isReputable" label="Reputable" desc="Considered reputable by industry standards" />
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">ISSN Number</label><input className="ai-news-amp-input" placeholder="1234-5678" value={form['qualityIndicators.hasISSN']} onChange={e => setField('qualityIndicators.hasISSN', e.target.value)} /></div>
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">Impact Score (0-100)</label><input type="number" min={0} max={100} className="ai-news-amp-input" value={form['qualityIndicators.impactScore']} onChange={e => setField('qualityIndicators.impactScore', e.target.value)} /></div>
                    <div className="ai-news-amp-field ai-news-amp-form-full"><label className="ai-news-amp-label">Notes</label><textarea className="ai-news-amp-textarea" style={{ minHeight:60 }} value={form.notes} onChange={e => setField('notes', e.target.value)} /></div>
                  </div>
                )}

                {activeTab === 'contact' && (
                  <div className="ai-news-amp-form-grid">
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">General Email</label><input type="email" className="ai-news-amp-input" placeholder="contact@source.com" value={form['contactInfo.email']} onChange={e => setField('contactInfo.email', e.target.value)} /></div>
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">Editorial Email</label><input type="email" className="ai-news-amp-input" placeholder="editor@source.com" value={form['contactInfo.editorialEmail']} onChange={e => setField('contactInfo.editorialEmail', e.target.value)} /></div>
                    <div className="ai-news-amp-form-section">API Access</div>
                    <Toggle fieldKey="apiInfo.hasApi" label="Has API" desc="Source provides programmatic API access" />
                    <Toggle fieldKey="apiInfo.requiresKey" label="Requires API Key" desc="Authentication key needed to access API" />
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">API Type</label><input className="ai-news-amp-input" placeholder="REST, GraphQL, RSS…" value={form['apiInfo.apiType']} onChange={e => setField('apiInfo.apiType', e.target.value)} /></div>
                  </div>
                )}
              </div>
              <div className="ai-news-amp-modal-footer">
                <button className="ai-news-amp-btn ai-news-amp-btn-ghost" onClick={closeModal}>Cancel</button>
                <button className="ai-news-amp-btn ai-news-amp-btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? <><span className="ai-news-amp-loader" style={{ width:16, height:16 }} /> Saving…</> : modal==='add' ? <><Plus size={15} />Add Source</> : <><CheckCircle size={15} />Update</>}
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
                  <div className="ai-news-amp-avatar" style={{ width:28, height:28, fontSize:'0.75rem' }}>{selected.name?.charAt(0)}</div>
                  {selected.displayName || selected.name}
                  {selected.credibility?.verified && <Shield size={14} color="var(--amp-success)" />}
                </div>
                <button className="ai-news-amp-modal-close" onClick={closeModal} aria-label="Close"><X size={18} /></button>
              </div>
              <div className="ai-news-amp-modal-body">
                <div className="ai-news-amp-tags-wrap" style={{ marginBottom:'1rem' }}>
                  <span className="ai-news-amp-badge ai-news-amp-badge-purple">{selected.type}</span>
                  <span className={`ai-news-amp-badge ai-news-amp-badge-${statusColor(selected.status)}`}>{selected.status}</span>
                  <span className="ai-news-amp-badge ai-news-amp-badge-cyan">{selected.license}</span>
                  {selected.qualityIndicators?.isOpenAccess && <span className="ai-news-amp-badge ai-news-amp-badge-green">Open Access</span>}
                </div>
                {selected.description && <p style={{ fontSize:'0.9rem', color:'var(--amp-text-2)', marginBottom:'1rem', lineHeight:1.6 }}>{selected.description}</p>}
                <div className="ai-news-amp-glow-sep" />
                <div style={{ marginBottom:'1rem' }}>
                  <div style={{ fontSize:'0.78rem', color:'var(--amp-text-3)', marginBottom:'0.5rem', textTransform:'uppercase', fontWeight:700 }}>Credibility Score</div>
                  <div className="ai-news-amp-score-bar">
                    <div className="ai-news-amp-score-track"><div className="ai-news-amp-score-fill" style={{ width:`${((selected.credibility?.score||0)/10)*100}%` }} /></div>
                    <span className="ai-news-amp-score-val" style={{ color:`var(--amp-${credColor(selected.credibility?.score||0)})` }}>{(selected.credibility?.score||0).toFixed(1)}/10</span>
                  </div>
                </div>
                <div className="ai-news-amp-metric-grid" style={{ marginBottom:'1.25rem' }}>
                  {[
                    { lbl:'Articles',  val:fmt(selected.metrics?.totalArticlesReferenced) },
                    { lbl:'Citations',  val:fmt(selected.metrics?.totalCitations) },
                    { lbl:'Avg Relevance', val:`${selected.metrics?.averageRelevanceScore||0}%` },
                    { lbl:'Impact Score',  val:selected.qualityIndicators?.impactScore||'—' },
                  ].map(({ lbl, val }) => (
                    <div key={lbl} className="ai-news-amp-metric-card"><div className="ai-news-amp-metric-lbl">{lbl}</div><div className="ai-news-amp-metric-val">{val}</div></div>
                  ))}
                </div>
                <div className="ai-news-amp-detail-grid">
                  <div className="ai-news-amp-detail-item"><div className="ai-news-amp-detail-key">Domain</div><div className="ai-news-amp-code-val">{selected.website?.domain||'—'}</div></div>
                  <div className="ai-news-amp-detail-item"><div className="ai-news-amp-detail-key">Frequency</div><div className="ai-news-amp-detail-val">{selected.publicationFrequency}</div></div>
                  <div className="ai-news-amp-detail-item"><div className="ai-news-amp-detail-key">Peer Reviewed</div><div className="ai-news-amp-detail-val">{selected.credibility?.trustIndicators?.hasPeerReview ? 'Yes' : 'No'}</div></div>
                  <div className="ai-news-amp-detail-item"><div className="ai-news-amp-detail-key">Open Access</div><div className="ai-news-amp-detail-val">{selected.qualityIndicators?.isOpenAccess ? 'Yes' : 'No'}</div></div>
                </div>
              </div>
              <div className="ai-news-amp-modal-footer">
                <button className="ai-news-amp-btn ai-news-amp-btn-ghost" onClick={closeModal}>Close</button>
                <button className="ai-news-amp-btn ai-news-amp-btn-warning ai-news-amp-btn-sm" onClick={() => { closeModal(); flagSource(selected); }}><Flag size={14} /> Flag</button>
                <button className="ai-news-amp-btn ai-news-amp-btn-outline" onClick={() => openEdit(selected)}><Edit2 size={14} /> Edit</button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}