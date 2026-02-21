import { useState, useEffect, useContext, useCallback } from 'react';
import {
  Shield, Search, Eye, RefreshCw, CheckCircle, XCircle,
  AlertTriangle, Download, Trash2, Clock, User, FileText,
  ChevronRight, Info, X, Database, Lock, BarChart2,
  Bell, ArrowRight, Filter
} from 'lucide-react';
import Swal from 'sweetalert2';
import { ThemeContext } from '../../context/ThemeContext';

const TOKEN_KEY = 'ai_news_admin_token';
const getToken  = () => localStorage.getItem(TOKEN_KEY);
const fmt       = n => (n == null ? '—' : Number(n).toLocaleString());
const fmtDate   = d => d ? new Date(d).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }) : '—';
const fmtTime   = d => d ? new Date(d).toLocaleString('en-GB', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '—';

const CONSENT_TABS = [
  { id:'consent',    label:'Consent Records',   icon: Lock      },
  { id:'requests',   label:'Data Requests',     icon: FileText  },
  { id:'breaches',   label:'Breach Log',        icon: AlertTriangle },
  { id:'retention',  label:'Retention Policies', icon: Database  },
  { id:'overview',   label:'Overview & Stats',  icon: BarChart2 },
];

const REQUEST_TYPES   = ['access','rectification','erasure','restriction','portability','objection'];
const REQUEST_STATUS  = ['pending','processing','completed','rejected'];
const BREACH_SEVERITY = ['low','medium','high','critical'];
const DATA_CATEGORIES = ['personal','sensitive','behavioral','technical','financial','health'];

const reqStatusColor = s => ({ pending:'orange', processing:'cyan', completed:'green', rejected:'red' }[s] || 'gray');
const sevColor       = s => ({ low:'green', medium:'orange', high:'red', critical:'red' }[s] || 'gray');

export default function AdminGDPRAndPrivacy() {
  const { isDarkMode } = useContext(ThemeContext);
  const validToken = getToken();

  const [activeTab, setActiveTab]     = useState('overview');
  const [consents, setConsents]       = useState([]);
  const [requests, setRequests]       = useState([]);
  const [breaches, setBreaches]       = useState([]);
  const [policies, setPolicies]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType]   = useState('');
  const [page, setPage]               = useState(1);
  const [modal, setModal]             = useState(null);
  const [selected, setSelected]       = useState(null);
  const [addBreachForm, setAddBreachForm] = useState({ title:'', description:'', severity:'medium', affectedCount:'', dataTypes:[], containedAt:'', reportedAt:'' });
  const [savingBreach, setSavingBreach] = useState(false);

  const PER_PAGE = 15;

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${validToken}`, 'Content-Type': 'application/json' };
      const [cRes, rRes, bRes, pRes] = await Promise.allSettled([
        fetch('/api/admin/gdpr/consents?limit=100', { headers }),
        fetch('/api/admin/gdpr/requests?limit=100', { headers }),
        fetch('/api/admin/gdpr/breaches?limit=50',  { headers }),
        fetch('/api/admin/gdpr/policies',            { headers }),
      ]);
      if (cRes.status === 'fulfilled' && cRes.value.ok) setConsents(await cRes.value.json().then(d => d.consents || d.data || (Array.isArray(d) ? d : [])));
      if (rRes.status === 'fulfilled' && rRes.value.ok) setRequests(await rRes.value.json().then(d => d.requests || d.data || (Array.isArray(d) ? d : [])));
      if (bRes.status === 'fulfilled' && bRes.value.ok) setBreaches(await bRes.value.json().then(d => d.breaches || d.data || (Array.isArray(d) ? d : [])));
      if (pRes.status === 'fulfilled' && pRes.value.ok) setPolicies(await pRes.value.json().then(d => d.policies || d.data || (Array.isArray(d) ? d : [])));
    } catch { /**/ } finally { setLoading(false); }
  }, [validToken]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const stats = {
    totalConsents:   consents.length,
    activeConsents:  consents.filter(c => c.isActive !== false).length,
    pendingRequests: requests.filter(r => r.status === 'pending').length,
    openBreaches:    breaches.filter(b => !b.resolved).length,
    critBreaches:    breaches.filter(b => b.severity === 'critical' && !b.resolved).length,
    completedReqs:   requests.filter(r => r.status === 'completed').length,
  };

  const filteredRequests = requests.filter(r => {
    const q = search.toLowerCase();
    return (!q || r.userId?.toLowerCase().includes(q) || r.email?.toLowerCase().includes(q))
      && (!filterStatus || r.status === filterStatus)
      && (!filterType   || r.type === filterType);
  });

  const filteredConsents = consents.filter(c => {
    const q = search.toLowerCase();
    return !q || c.userId?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q);
  });

  const paginatedRequests = filteredRequests.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalReqPages     = Math.max(1, Math.ceil(filteredRequests.length / PER_PAGE));

  const updateRequestStatus = async (req, status) => {
    const conf = await Swal.fire({ title:`Mark as "${status}"?`, icon:'question', showCancelButton:true,
      confirmButtonText:'Yes', background:isDarkMode?'#10102a':'#fff', color:isDarkMode?'#eeeeff':'#0d0d2b' });
    if (!conf.isConfirmed) return;
    try {
      const r = await fetch(`/api/admin/gdpr/requests/${req._id}`, {
        method: 'PUT', headers: { 'Authorization': `Bearer ${validToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!r.ok) throw new Error('Failed');
      Swal.fire({ title:'Updated!', icon:'success', timer:1500, showConfirmButton:false,
        background:isDarkMode?'#10102a':'#fff', color:isDarkMode?'#eeeeff':'#0d0d2b' });
      fetchAll();
    } catch (err) {
      Swal.fire({ title:'Error', text:err.message, icon:'error',
        background:isDarkMode?'#10102a':'#fff', color:isDarkMode?'#eeeeff':'#0d0d2b' });
    }
  };

  const resolveBreachConfirm = async (breach) => {
    const conf = await Swal.fire({ title:`Resolve breach "${breach.title}"?`, icon:'warning', showCancelButton:true,
      confirmButtonText:'Resolve', confirmButtonColor:'#22c55e',
      background:isDarkMode?'#10102a':'#fff', color:isDarkMode?'#eeeeff':'#0d0d2b' });
    if (!conf.isConfirmed) return;
    try {
      const r = await fetch(`/api/admin/gdpr/breaches/${breach._id}/resolve`, {
        method: 'POST', headers: { 'Authorization': `Bearer ${validToken}` }
      });
      if (!r.ok) throw new Error('Failed');
      Swal.fire({ title:'Resolved!', icon:'success', timer:1500, showConfirmButton:false,
        background:isDarkMode?'#10102a':'#fff', color:isDarkMode?'#eeeeff':'#0d0d2b' });
      fetchAll();
    } catch (err) {
      Swal.fire({ title:'Error', text:err.message, icon:'error',
        background:isDarkMode?'#10102a':'#fff', color:isDarkMode?'#eeeeff':'#0d0d2b' });
    }
  };

  const handleAddBreach = async () => {
    if (!addBreachForm.title.trim()) return Swal.fire({ title:'Validation', text:'Title is required', icon:'warning',
      background:isDarkMode?'#10102a':'#fff', color:isDarkMode?'#eeeeff':'#0d0d2b' });
    setSavingBreach(true);
    try {
      const r = await fetch('/api/admin/gdpr/breaches', {
        method: 'POST', headers: { 'Authorization': `Bearer ${validToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...addBreachForm, affectedCount: Number(addBreachForm.affectedCount)||0 })
      });
      if (!r.ok) throw new Error('Failed');
      Swal.fire({ title:'Breach Logged!', icon:'success', timer:1800, showConfirmButton:false,
        background:isDarkMode?'#10102a':'#fff', color:isDarkMode?'#eeeeff':'#0d0d2b' });
      setModal(null); fetchAll();
    } catch (err) {
      Swal.fire({ title:'Error', text:err.message, icon:'error',
        background:isDarkMode?'#10102a':'#fff', color:isDarkMode?'#eeeeff':'#0d0d2b' });
    } finally { setSavingBreach(false); }
  };

  const exportData = async (userId) => {
    try {
      const r = await fetch(`/api/admin/gdpr/export/${userId}`, { headers: { 'Authorization': `Bearer ${validToken}` } });
      if (!r.ok) throw new Error('Failed');
      const blob = await r.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a'); a.href = url; a.download = `user-data-${userId}.json`; a.click();
      URL.revokeObjectURL(url);
    } catch {
      Swal.fire({ title:'Error', text:'Export failed', icon:'error',
        background:isDarkMode?'#10102a':'#fff', color:isDarkMode?'#eeeeff':'#0d0d2b' });
    }
  };

  const eraseUser = async (userId) => {
    const conf = await Swal.fire({
      title: 'Erase User Data?', text: 'This permanently deletes all personal data. This action cannot be undone.',
      icon: 'warning', showCancelButton: true, confirmButtonText: 'Erase All Data', confirmButtonColor: '#ff4d6d',
      background:isDarkMode?'#10102a':'#fff', color:isDarkMode?'#eeeeff':'#0d0d2b'
    });
    if (!conf.isConfirmed) return;
    try {
      const r = await fetch(`/api/admin/gdpr/erase/${userId}`, { method:'DELETE', headers: { 'Authorization': `Bearer ${validToken}` } });
      if (!r.ok) throw new Error('Failed');
      Swal.fire({ title:'Erased!', text:'User data deleted', icon:'success', timer:2000, showConfirmButton:false,
        background:isDarkMode?'#10102a':'#fff', color:isDarkMode?'#eeeeff':'#0d0d2b' });
      fetchAll();
    } catch {
      Swal.fire({ title:'Error', text:'Erasure failed', icon:'error',
        background:isDarkMode?'#10102a':'#fff', color:isDarkMode?'#eeeeff':'#0d0d2b' });
    }
  };

  return (
    <div className={`ai-news-admin-managing-pages-root ${isDarkMode ? 'dark' : 'light'}`}>
      <main className="ai-news-admin-managing-pages-page">

        <nav className="ai-news-amp-breadcrumb" aria-label="Breadcrumb">
          <span>Admin</span><ChevronRight size={13} /><span>Compliance</span><ChevronRight size={13} /><span>GDPR & Privacy</span>
        </nav>

        <header className="ai-news-admin-managing-pages-header">
          <div className="ai-news-admin-managing-pages-header-left">
            <div className="ai-news-admin-managing-pages-icon-wrap"><Shield size={24} /></div>
            <div>
              <h1 className="ai-news-admin-managing-pages-title">GDPR & Privacy</h1>
              <p className="ai-news-admin-managing-pages-subtitle">
                Consent management, data requests, breach logging, and retention policies
                {stats.openBreaches > 0 && <span className="ai-news-amp-badge ai-news-amp-badge-red"><AlertTriangle size={11} /> {stats.openBreaches} Open {stats.openBreaches === 1 ? 'Breach' : 'Breaches'}</span>}
              </p>
            </div>
          </div>
          <div className="ai-news-admin-managing-pages-header-actions">
            <button className="ai-news-amp-btn ai-news-amp-btn-ghost" onClick={fetchAll}>
              <RefreshCw size={15} className={loading ? 'ai-news-amp-spinning' : ''} /> Refresh
            </button>
            <button className="ai-news-amp-btn ai-news-amp-btn-danger" onClick={() => { setAddBreachForm({ title:'',description:'',severity:'medium',affectedCount:'',dataTypes:[],containedAt:'',reportedAt:'' }); setModal('breach'); }}>
              <AlertTriangle size={15} /> Log Breach
            </button>
          </div>
        </header>

        <div className="ai-news-amp-info-box" role="note">
          <div className="ai-news-amp-info-box-title"><Info size={14} /> GDPR Compliance Dashboard</div>
          <p className="ai-news-amp-info-box-text">
            AI News must comply with GDPR (EU), CCPA (California), and emerging AI-specific regulations including the EU AI Act.
            This dashboard tracks user consent records, handles data subject rights requests (access, erasure, portability, rectification),
            logs data breaches within the 72-hour supervisory authority notification window, and manages data retention policies across all
            user data categories. The EU AI Act (2024) adds additional obligations for AI-generated content providers around transparency,
            accuracy labelling, and automated decision-making disclosures.
          </p>
        </div>

        {/* Stats */}
        <div className="ai-news-admin-managing-pages-stats">
          {[
            { label:'Consent Records',    val:fmt(stats.totalConsents),   ico:Lock,          cls:'ai-news-amp-ico-purple' },
            { label:'Active Consents',    val:fmt(stats.activeConsents),  ico:CheckCircle,   cls:'ai-news-amp-ico-green'  },
            { label:'Pending Requests',   val:fmt(stats.pendingRequests), ico:Clock,         cls:'ai-news-amp-ico-orange' },
            { label:'Completed Requests', val:fmt(stats.completedReqs),   ico:FileText,      cls:'ai-news-amp-ico-cyan'   },
            { label:'Open Breaches',      val:fmt(stats.openBreaches),    ico:AlertTriangle, cls:'ai-news-amp-ico-red'    },
          ].map(({ label, val, ico: Icon, cls }) => (
            <div key={label} className="ai-news-admin-managing-pages-stat" style={{ cursor:'pointer' }}>
              <div className={`ai-news-admin-managing-pages-stat-ico ${cls}`}><Icon size={20} /></div>
              <div>
                <div className="ai-news-admin-managing-pages-stat-val">{loading ? <span className="ai-news-amp-skeleton" style={{ display:'inline-block', width:40, height:22 }} /> : val}</div>
                <div className="ai-news-admin-managing-pages-stat-lbl">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div className="ai-news-amp-tabs" style={{ marginBottom:'1.5rem', borderBottom:'1px solid var(--amp-border)', paddingBottom:'1rem' }}>
          {CONSENT_TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} className={`ai-news-amp-tab ${activeTab===id?'ai-news-amp-tab-active':''}`} onClick={() => { setActiveTab(id); setPage(1); setSearch(''); setFilterStatus(''); setFilterType(''); }}>
              <Icon size={14} />{label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ──────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))', gap:'1.25rem' }}>

            <div className="ai-news-admin-managing-pages-card">
              <div className="ai-news-admin-managing-pages-card-title" style={{ marginBottom:'1rem' }}><Lock size={16} /> Consent Summary</div>
              {[
                { label:'Marketing',     val:consents.filter(c => c.purposes?.marketing).length },
                { label:'Analytics',     val:consents.filter(c => c.purposes?.analytics).length },
                { label:'Personalisation',val:consents.filter(c => c.purposes?.personalization).length },
                { label:'Third-Party',   val:consents.filter(c => c.purposes?.thirdParty).length },
              ].map(({ label, val }) => (
                <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.5rem 0', borderBottom:'1px solid var(--amp-border)', fontSize:'0.9rem' }}>
                  <span style={{ color:'var(--amp-text-2)' }}>{label}</span>
                  <span style={{ fontWeight:700, color:'var(--amp-text)' }}>{fmt(val)}</span>
                </div>
              ))}
            </div>

            <div className="ai-news-admin-managing-pages-card">
              <div className="ai-news-admin-managing-pages-card-title" style={{ marginBottom:'1rem' }}><FileText size={16} /> Request Breakdown</div>
              {REQUEST_TYPES.map(type => {
                const count = requests.filter(r => r.type === type).length;
                return (
                  <div key={type} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.5rem 0', borderBottom:'1px solid var(--amp-border)', fontSize:'0.9rem' }}>
                    <span style={{ color:'var(--amp-text-2)', textTransform:'capitalize' }}>{type}</span>
                    <span className={`ai-news-amp-badge ai-news-amp-badge-${count > 0 ? 'cyan' : 'gray'}`}>{count}</span>
                  </div>
                );
              })}
            </div>

            <div className="ai-news-admin-managing-pages-card">
              <div className="ai-news-admin-managing-pages-card-title" style={{ marginBottom:'1rem' }}><AlertTriangle size={16} /> Recent Breach Log</div>
              {breaches.length === 0 && <div style={{ color:'var(--amp-text-3)', fontSize:'0.88rem', textAlign:'center', padding:'1.5rem 0' }}>No breaches recorded ✓</div>}
              {breaches.slice(0, 5).map(b => (
                <div key={b._id} style={{ padding:'0.6rem 0', borderBottom:'1px solid var(--amp-border)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.2rem' }}>
                    <span className={`ai-news-amp-badge ai-news-amp-badge-${sevColor(b.severity)}`}>{b.severity}</span>
                    <span style={{ fontWeight:600, fontSize:'0.85rem', color:'var(--amp-text)' }}>{b.title}</span>
                  </div>
                  <div style={{ fontSize:'0.75rem', color:'var(--amp-text-3)' }}>{fmtDate(b.discoveredAt)} · {b.resolved ? '✓ Resolved' : '⚠ Open'}</div>
                </div>
              ))}
            </div>

            <div className="ai-news-admin-managing-pages-card">
              <div className="ai-news-admin-managing-pages-card-title" style={{ marginBottom:'1rem' }}><Database size={16} /> Retention Policies</div>
              {DATA_CATEGORIES.map(cat => {
                const pol = policies.find(p => p.category === cat);
                return (
                  <div key={cat} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.5rem 0', borderBottom:'1px solid var(--amp-border)', fontSize:'0.9rem' }}>
                    <span style={{ color:'var(--amp-text-2)', textTransform:'capitalize' }}>{cat}</span>
                    <span style={{ color:'var(--amp-text)', fontFamily:'JetBrains Mono,monospace', fontSize:'0.82rem' }}>
                      {pol ? `${pol.retentionDays}d` : '—'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── CONSENT RECORDS ───────────────────────────── */}
        {activeTab === 'consent' && (
          <>
            <div className="ai-news-admin-managing-pages-toolbar">
              <div className="ai-news-admin-managing-pages-search-box">
                <Search size={15} />
                <input className="ai-news-admin-managing-pages-search-input" placeholder="Search by user ID or email…" value={search} onChange={e => setSearch(e.target.value)} />
                {search && <button style={{ background:'none',border:'none',cursor:'pointer',color:'var(--amp-text-3)',display:'flex' }} onClick={() => setSearch('')}><X size={14} /></button>}
              </div>
            </div>
            <div className="ai-news-admin-managing-pages-table-wrap">
              {loading ? <div style={{ padding:'2rem', textAlign:'center', color:'var(--amp-text-3)' }}>Loading…</div> :
              filteredConsents.length === 0 ? (
                <div className="ai-news-amp-empty"><div className="ai-news-amp-empty-ico"><Lock size={60} /></div><div className="ai-news-amp-empty-title">No consent records</div></div>
              ) : (
                <div className="ai-news-admin-managing-pages-table-scroll">
                  <table className="ai-news-admin-managing-pages-table" aria-label="Consent records">
                    <thead className="ai-news-admin-managing-pages-table-head">
                      <tr>{['User','Purposes','Consent Date','IP','Version','Status','Actions'].map(h => <th key={h} className="ai-news-admin-managing-pages-table-th">{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {filteredConsents.slice(0, 50).map(c => (
                        <tr key={c._id} className="ai-news-admin-managing-pages-table-row">
                          <td className="ai-news-admin-managing-pages-table-td">
                            <div style={{ fontWeight:600, fontSize:'0.85rem' }}>{c.email || c.userId}</div>
                            {c.email && c.userId && <div style={{ fontSize:'0.73rem', color:'var(--amp-text-3)', fontFamily:'JetBrains Mono,monospace' }}>{c.userId}</div>}
                          </td>
                          <td className="ai-news-admin-managing-pages-table-td">
                            <div style={{ display:'flex', gap:'0.3rem', flexWrap:'wrap' }}>
                              {Object.entries(c.purposes||{}).filter(([,v]) => v).map(([k]) => <span key={k} className="ai-news-amp-badge ai-news-amp-badge-cyan" style={{ fontSize:'0.68rem' }}>{k}</span>)}
                            </div>
                          </td>
                          <td className="ai-news-admin-managing-pages-table-td" style={{ fontSize:'0.83rem' }}>{fmtDate(c.consentedAt||c.createdAt)}</td>
                          <td className="ai-news-admin-managing-pages-table-td"><code style={{ fontSize:'0.78rem', color:'var(--amp-text-3)' }}>{c.ipAddress||'—'}</code></td>
                          <td className="ai-news-admin-managing-pages-table-td"><span className="ai-news-amp-badge ai-news-amp-badge-purple">{c.consentVersion||'—'}</span></td>
                          <td className="ai-news-admin-managing-pages-table-td">
                            {c.isActive !== false
                              ? <span className="ai-news-amp-badge ai-news-amp-badge-green">Active</span>
                              : <span className="ai-news-amp-badge ai-news-amp-badge-red">Revoked</span>}
                          </td>
                          <td className="ai-news-admin-managing-pages-table-td">
                            <div className="ai-news-admin-managing-pages-table-actions">
                              <button className="ai-news-amp-btn ai-news-amp-btn-ghost ai-news-amp-btn-sm ai-news-amp-btn-icon" onClick={() => { setSelected(c); setModal('consent'); }} aria-label="View"><Eye size={14} /></button>
                              <button className="ai-news-amp-btn ai-news-amp-btn-outline ai-news-amp-btn-sm" onClick={() => exportData(c.userId)} aria-label="Export"><Download size={13} /> Export</button>
                              <button className="ai-news-amp-btn ai-news-amp-btn-danger ai-news-amp-btn-sm ai-news-amp-btn-icon" onClick={() => eraseUser(c.userId)} aria-label="Erase"><Trash2 size={13} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── DATA REQUESTS ─────────────────────────────── */}
        {activeTab === 'requests' && (
          <>
            <div className="ai-news-admin-managing-pages-toolbar">
              <div className="ai-news-admin-managing-pages-search-box">
                <Search size={15} />
                <input className="ai-news-admin-managing-pages-search-input" placeholder="Search by user…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
                {search && <button style={{ background:'none',border:'none',cursor:'pointer',color:'var(--amp-text-3)',display:'flex' }} onClick={() => setSearch('')}><X size={14} /></button>}
              </div>
              <select className="ai-news-admin-managing-pages-select" value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1); }}>
                <option value="">All Types</option>
                {REQUEST_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select className="ai-news-admin-managing-pages-select" value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}>
                <option value="">All Status</option>
                {REQUEST_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="ai-news-admin-managing-pages-table-wrap">
              {loading ? <div style={{ padding:'2rem', textAlign:'center', color:'var(--amp-text-3)' }}>Loading…</div> :
              paginatedRequests.length === 0 ? (
                <div className="ai-news-amp-empty"><div className="ai-news-amp-empty-ico"><FileText size={60} /></div><div className="ai-news-amp-empty-title">No data requests</div></div>
              ) : (
                <>
                  <div className="ai-news-admin-managing-pages-table-scroll">
                    <table className="ai-news-admin-managing-pages-table" aria-label="Data requests">
                      <thead className="ai-news-admin-managing-pages-table-head">
                        <tr>{['User','Type','Submitted','Due Date','Status','Notes','Actions'].map(h => <th key={h} className="ai-news-admin-managing-pages-table-th">{h}</th>)}</tr>
                      </thead>
                      <tbody>
                        {paginatedRequests.map(req => {
                          const due = req.dueDate || (req.createdAt ? new Date(new Date(req.createdAt).getTime() + 30*24*60*60*1000) : null);
                          const overdue = due && new Date(due) < new Date() && req.status !== 'completed';
                          return (
                            <tr key={req._id} className="ai-news-admin-managing-pages-table-row" style={{ background: overdue ? 'rgba(255,77,109,0.05)' : undefined }}>
                              <td className="ai-news-admin-managing-pages-table-td" style={{ fontWeight:600, fontSize:'0.85rem' }}>{req.email || req.userId}</td>
                              <td className="ai-news-admin-managing-pages-table-td"><span className="ai-news-amp-badge ai-news-amp-badge-purple">{req.type}</span></td>
                              <td className="ai-news-admin-managing-pages-table-td" style={{ fontSize:'0.83rem' }}>{fmtDate(req.createdAt)}</td>
                              <td className="ai-news-admin-managing-pages-table-td">
                                <span style={{ fontSize:'0.83rem', color: overdue ? 'var(--amp-red)' : 'var(--amp-text-2)' }}>
                                  {overdue && <AlertTriangle size={12} style={{ marginRight:'0.25rem' }} />}
                                  {fmtDate(due)}
                                </span>
                              </td>
                              <td className="ai-news-admin-managing-pages-table-td"><span className={`ai-news-amp-badge ai-news-amp-badge-${reqStatusColor(req.status)}`}>{req.status}</span></td>
                              <td className="ai-news-admin-managing-pages-table-td" style={{ fontSize:'0.8rem', color:'var(--amp-text-3)', maxWidth:200 }}>{req.notes || '—'}</td>
                              <td className="ai-news-admin-managing-pages-table-td">
                                <div className="ai-news-admin-managing-pages-table-actions">
                                  {req.status === 'pending' && (
                                    <button className="ai-news-amp-btn ai-news-amp-btn-outline ai-news-amp-btn-sm" onClick={() => updateRequestStatus(req, 'processing')}>Process</button>
                                  )}
                                  {req.status === 'processing' && (
                                    <>
                                      <button className="ai-news-amp-btn ai-news-amp-btn-outline ai-news-amp-btn-sm" style={{ background:'rgba(34,197,94,0.1)', color:'var(--amp-success)', borderColor:'var(--amp-success)' }} onClick={() => updateRequestStatus(req, 'completed')}>Complete</button>
                                      <button className="ai-news-amp-btn ai-news-amp-btn-danger ai-news-amp-btn-sm" onClick={() => updateRequestStatus(req, 'rejected')}>Reject</button>
                                    </>
                                  )}
                                  {(req.type === 'portability' || req.type === 'access') && (
                                    <button className="ai-news-amp-btn ai-news-amp-btn-ghost ai-news-amp-btn-sm ai-news-amp-btn-icon" onClick={() => exportData(req.userId)}><Download size={13} /></button>
                                  )}
                                  {req.type === 'erasure' && req.status === 'processing' && (
                                    <button className="ai-news-amp-btn ai-news-amp-btn-danger ai-news-amp-btn-sm ai-news-amp-btn-icon" onClick={() => eraseUser(req.userId)}><Trash2 size={13} /></button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {totalReqPages > 1 && (
                    <div className="ai-news-amp-pagination">
                      <button className="ai-news-amp-page-btn" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}>‹</button>
                      {[...Array(totalReqPages)].map((_, i) => <button key={i} className={`ai-news-amp-page-btn ${page===i+1?'ai-news-amp-page-btn-active':''}`} onClick={() => setPage(i+1)}>{i+1}</button>)}
                      <button className="ai-news-amp-page-btn" onClick={() => setPage(p => Math.min(totalReqPages, p+1))} disabled={page===totalReqPages}>›</button>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}

        {/* ── BREACH LOG ────────────────────────────────── */}
        {activeTab === 'breaches' && (
          <div className="ai-news-admin-managing-pages-table-wrap">
            {loading ? <div style={{ padding:'2rem', textAlign:'center', color:'var(--amp-text-3)' }}>Loading…</div> :
            breaches.length === 0 ? (
              <div className="ai-news-amp-empty">
                <div className="ai-news-amp-empty-ico"><Shield size={60} color="var(--amp-success)" /></div>
                <div className="ai-news-amp-empty-title" style={{ color:'var(--amp-success)' }}>No breaches recorded</div>
                <p className="ai-news-amp-empty-text">Your platform has a clean breach record. Use "Log Breach" if an incident occurs.</p>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'1rem', padding:'1rem' }}>
                {breaches.map(b => (
                  <div key={b._id} className="ai-news-admin-managing-pages-card" style={{ borderLeft:`4px solid var(--amp-${sevColor(b.severity)})` }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'0.75rem' }}>
                      <div>
                        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.35rem' }}>
                          <span className={`ai-news-amp-badge ai-news-amp-badge-${sevColor(b.severity)}`}>{b.severity}</span>
                          {b.resolved ? <span className="ai-news-amp-badge ai-news-amp-badge-green">Resolved</span> : <span className="ai-news-amp-badge ai-news-amp-badge-red">Open</span>}
                          <h3 style={{ margin:0, fontWeight:700, color:'var(--amp-text)', fontSize:'0.95rem' }}>{b.title}</h3>
                        </div>
                        <p style={{ margin:0, fontSize:'0.87rem', color:'var(--amp-text-2)', lineHeight:1.5, maxWidth:500 }}>{b.description}</p>
                      </div>
                      <div style={{ display:'flex', flexDirection:'column', gap:'0.35rem', alignItems:'flex-end', fontSize:'0.8rem', color:'var(--amp-text-3)', flexShrink:0 }}>
                        <div><strong>Discovered:</strong> {fmtDate(b.discoveredAt)}</div>
                        <div><strong>Affected:</strong> {fmt(b.affectedCount)} users</div>
                        {b.reportedToAuthority && <div><strong>Reported to DPA:</strong> {fmtDate(b.reportedToAuthority)}</div>}
                      </div>
                    </div>
                    {(b.dataTypes||[]).length > 0 && (
                      <div className="ai-news-amp-tags-wrap" style={{ marginTop:'0.75rem' }}>
                        {b.dataTypes.map(dt => <span key={dt} className="ai-news-amp-tag-pill">{dt}</span>)}
                      </div>
                    )}
                    {!b.resolved && (
                      <div style={{ marginTop:'0.75rem', display:'flex', justifyContent:'flex-end' }}>
                        <button className="ai-news-amp-btn ai-news-amp-btn-outline" onClick={() => resolveBreachConfirm(b)}>
                          <CheckCircle size={14} /> Mark Resolved
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── RETENTION POLICIES ────────────────────────── */}
        {activeTab === 'retention' && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:'1.25rem' }}>
            {DATA_CATEGORIES.map(cat => {
              const pol = policies.find(p => p.category === cat) || {};
              return (
                <div key={cat} className="ai-news-admin-managing-pages-card">
                  <div className="ai-news-admin-managing-pages-card-title" style={{ textTransform:'capitalize' }}><Database size={15} /> {cat} Data</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem', marginTop:'0.75rem' }}>
                    {[
                      { label:'Retention Period', val: pol.retentionDays ? `${pol.retentionDays} days` : '—' },
                      { label:'Legal Basis',       val: pol.legalBasis || '—' },
                      { label:'Auto-Delete',       val: pol.autoDelete ? '✓ Yes' : '✗ No' },
                      { label:'Anonymise After',   val: pol.anonymizeAfterDays ? `${pol.anonymizeAfterDays} days` : '—' },
                    ].map(({ label, val }) => (
                      <div key={label} style={{ display:'flex', justifyContent:'space-between', fontSize:'0.87rem', borderBottom:'1px solid var(--amp-border)', paddingBottom:'0.5rem' }}>
                        <span style={{ color:'var(--amp-text-3)' }}>{label}</span>
                        <span style={{ color:'var(--amp-text)', fontWeight:600 }}>{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            <div className="ai-news-admin-managing-pages-card" style={{ gridColumn:'1/-1', background:'rgba(108,99,255,0.05)', border:'1px dashed var(--amp-primary)' }}>
              <div style={{ fontSize:'0.9rem', color:'var(--amp-text-2)', lineHeight:1.7 }}>
                <strong style={{ color:'var(--amp-text)' }}>📋 Retention Policy Guide:</strong> Under GDPR Article 5(1)(e), personal data must not be kept longer than necessary.
                Adjust retention periods via <strong>Main Settings → Compliance → Data Retention Days</strong> or configure per-category policies via the API.
                The EU AI Act adds requirements to retain training data provenance records for a minimum of 10 years for high-risk AI systems.
              </div>
            </div>
          </div>
        )}

        {/* ── LOG BREACH MODAL ──────────────────────────── */}
        {modal === 'breach' && (
          <div className="ai-news-amp-modal-overlay" role="dialog" aria-modal="true" onClick={e => e.target === e.currentTarget && setModal(null)}>
            <div className="ai-news-amp-modal ai-news-amp-modal-lg">
              <div className="ai-news-amp-modal-header">
                <div className="ai-news-amp-modal-title" style={{ color:'var(--amp-red)' }}><AlertTriangle size={18} /> Log Data Breach</div>
                <button className="ai-news-amp-modal-close" onClick={() => setModal(null)} aria-label="Close"><X size={18} /></button>
              </div>
              <div className="ai-news-amp-modal-body">
                <div style={{ background:'rgba(255,77,109,0.08)', border:'1px solid var(--amp-red)', borderRadius:10, padding:'0.85rem', marginBottom:'1.5rem', fontSize:'0.87rem', color:'var(--amp-red)', lineHeight:1.6 }}>
                  <AlertTriangle size={14} style={{ marginRight:'0.5rem', verticalAlign:'middle' }} />
                  <strong>GDPR Article 33:</strong> Breaches must be reported to the supervisory authority within <strong>72 hours</strong> of discovery. Affected individuals must be notified without undue delay.
                </div>
                <div className="ai-news-amp-form-grid">
                  <div className="ai-news-amp-field ai-news-amp-form-full"><label className="ai-news-amp-label">Breach Title <span className="ai-news-amp-label-req">*</span></label><input className="ai-news-amp-input" placeholder="e.g. Unauthorised database access" value={addBreachForm.title} onChange={e => setAddBreachForm(f => ({ ...f, title: e.target.value }))} /></div>
                  <div className="ai-news-amp-field ai-news-amp-form-full"><label className="ai-news-amp-label">Description</label><textarea className="ai-news-amp-textarea" placeholder="Detailed breach description including cause and scope…" value={addBreachForm.description} onChange={e => setAddBreachForm(f => ({ ...f, description: e.target.value }))} /></div>
                  <div className="ai-news-amp-field"><label className="ai-news-amp-label">Severity</label><select className="ai-news-amp-sel" value={addBreachForm.severity} onChange={e => setAddBreachForm(f => ({ ...f, severity: e.target.value }))}>{BREACH_SEVERITY.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                  <div className="ai-news-amp-field"><label className="ai-news-amp-label">Affected Users (count)</label><input type="number" min={0} className="ai-news-amp-input" value={addBreachForm.affectedCount} onChange={e => setAddBreachForm(f => ({ ...f, affectedCount: e.target.value }))} /></div>
                  <div className="ai-news-amp-field"><label className="ai-news-amp-label">Discovered At</label><input type="datetime-local" className="ai-news-amp-input" value={addBreachForm.reportedAt} onChange={e => setAddBreachForm(f => ({ ...f, reportedAt: e.target.value }))} /></div>
                  <div className="ai-news-amp-field"><label className="ai-news-amp-label">Contained At</label><input type="datetime-local" className="ai-news-amp-input" value={addBreachForm.containedAt} onChange={e => setAddBreachForm(f => ({ ...f, containedAt: e.target.value }))} /></div>
                  <div className="ai-news-amp-form-full">
                    <label className="ai-news-amp-label" style={{ marginBottom:'0.5rem', display:'block' }}>Data Types Affected</label>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:'0.5rem' }}>
                      {DATA_CATEGORIES.map(cat => (
                        <button key={cat} type="button"
                          className={`ai-news-amp-btn ai-news-amp-btn-sm ${addBreachForm.dataTypes.includes(cat) ? 'ai-news-amp-btn-danger' : 'ai-news-amp-btn-ghost'}`}
                          style={{ borderRadius:999 }}
                          onClick={() => setAddBreachForm(f => ({
                            ...f, dataTypes: f.dataTypes.includes(cat) ? f.dataTypes.filter(x => x !== cat) : [...f.dataTypes, cat]
                          }))}>
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="ai-news-amp-modal-footer">
                <button className="ai-news-amp-btn ai-news-amp-btn-ghost" onClick={() => setModal(null)}>Cancel</button>
                <button className="ai-news-amp-btn ai-news-amp-btn-danger" onClick={handleAddBreach} disabled={savingBreach}>
                  {savingBreach ? <><span className="ai-news-amp-loader" style={{ width:15, height:15 }} /> Saving…</> : <><AlertTriangle size={15} />Log Breach</>}
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}