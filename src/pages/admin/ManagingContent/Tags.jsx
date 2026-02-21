import { useState, useEffect, useContext, useCallback } from 'react';
import {
  Tag, Plus, Search, Edit2, Trash2, Eye, RefreshCw, Filter,
  TrendingUp, Hash, Star, CheckCircle, XCircle, BarChart2,
  ChevronRight, Copy, LayoutGrid, List, AlertTriangle, Info,
  Layers, ArrowRight, BookOpen, Zap, Globe, X
} from 'lucide-react';
import Swal from 'sweetalert2';
import { ThemeContext } from '../../context/ThemeContext';

/* ── helpers ─────────────────────────────────────────── */
const TOKEN_KEY = 'ai_news_admin_token';
const getToken = () => localStorage.getItem(TOKEN_KEY);

const TAG_TYPES = ['topic','technology','framework','model','company','research-area','conference','difficulty-level','content-type','industry','region'];
const AI_CATEGORIES = ['machine-learning','deep-learning','nlp','computer-vision','robotics','generative-ai','llm','ai-ethics','ai-regulation','ai-business','ai-research','ai-hardware','ai-software','ai-startups','ai-investment','ai-education','ai-healthcare','ai-finance','ai-automotive','general-ai'];
const POPULARITY = ['low','medium','high','trending'];

const popularityColor = (p) => ({ low:'gray', medium:'orange', high:'green', trending:'cyan' }[p] || 'gray');
const fmt = (n) => n == null ? '—' : Number(n).toLocaleString();

const EMPTY_FORM = {
  name:'', slug:'', description:'', type:'topic', aiCategory:'general-ai',
  parentTag:'', isActive:true, isFeatured:false, isApproved:true,
  synonyms:[], acronyms:[], relatedTerms:[],
  'styling.color':'#6c63ff', 'styling.backgroundColor':'', 'styling.icon':'',
  'seo.metaTitle':'', 'seo.metaDescription':'', 'seo.canonicalUrl':'',
  'featuredImage.url':'', 'featuredImage.alt':'', notes:''
};

/* ── ChipInput ───────────────────────────────────────── */
function ChipInput({ value = [], onChange, placeholder }) {
  const [inp, setInp] = useState('');
  const add = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && inp.trim()) {
      e.preventDefault();
      if (!value.includes(inp.trim())) onChange([...value, inp.trim()]);
      setInp('');
    }
  };
  return (
    <div className="ai-news-amp-chip-wrap" onClick={() => document.getElementById('ci-'+placeholder)?.focus()}>
      {value.map(v => (
        <span key={v} className="ai-news-amp-chip">
          {v}
          <button className="ai-news-amp-chip-rm" onClick={() => onChange(value.filter(x=>x!==v))} type="button">
            <X size={11}/>
          </button>
        </span>
      ))}
      <input
        id={'ci-'+placeholder}
        className="ai-news-amp-chip-text-inp"
        value={inp}
        onChange={e => setInp(e.target.value)}
        onKeyDown={add}
        placeholder={value.length ? '' : placeholder}
      />
    </div>
  );
}

/* ── AdminTags main ──────────────────────────────────── */
export default function AdminTags() {
  const { isDarkMode } = useContext(ThemeContext);
  const validToken = getToken();

  const [tags, setTags]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [view, setView]             = useState('table'); // 'table'|'grid'
  const [search, setSearch]         = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterPop, setFilterPop]   = useState('');
  const [filterActive, setFilterActive] = useState('');
  const [page, setPage]             = useState(1);
  const [modal, setModal]           = useState(null); // null|'add'|'edit'|'view'
  const [selectedTag, setSelectedTag] = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [saving, setSaving]         = useState(false);
  const [stats, setStats]           = useState({ total:0, active:0, featured:0, trending:0 });

  const PER_PAGE = 12;

  /* ── fetch ─────────────────────────────────────────── */
  const fetchTags = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/tags?includeDeleted=false&limit=200', {
        headers: { 'Authorization': `Bearer ${validToken}`, 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      const list = data.tags || data.data || data || [];
      setTags(list);
      setStats({
        total: list.length,
        active: list.filter(t=>t.isActive).length,
        featured: list.filter(t=>t.isFeatured).length,
        trending: list.filter(t=>t.usage?.popularity==='trending').length,
      });
    } catch (err) {
      Swal.fire({ title:'Error!', text:'Failed to load tags', icon:'error',
        background: isDarkMode?'#10102a':'#fff', color: isDarkMode?'#eeeeff':'#0d0d2b' });
    } finally { setLoading(false); }
  }, [validToken, isDarkMode]);

  useEffect(() => { fetchTags(); }, [fetchTags]);

  /* ── filter+page ────────────────────────────────────── */
  const filtered = tags.filter(t => {
    const s = search.toLowerCase();
    const matchSearch = !s || t.name?.toLowerCase().includes(s) || t.slug?.toLowerCase().includes(s) || t.description?.toLowerCase().includes(s);
    const matchType   = !filterType   || t.type === filterType;
    const matchPop    = !filterPop    || t.usage?.popularity === filterPop;
    const matchActive = filterActive === '' || t.isActive === (filterActive === 'true');
    return matchSearch && matchType && matchPop && matchActive;
  });

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated   = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);

  /* ── openModal ──────────────────────────────────────── */
  const openAdd  = () => { setForm(EMPTY_FORM); setSelectedTag(null); setModal('add'); };
  const openEdit = (tag) => {
    setSelectedTag(tag);
    setForm({
      name: tag.name||'', slug: tag.slug||'', description: tag.description||'',
      type: tag.type||'topic', aiCategory: tag.aiCategory||'general-ai',
      parentTag: tag.parentTag||'',
      isActive: tag.isActive??true, isFeatured: tag.isFeatured??false, isApproved: tag.isApproved??true,
      synonyms: tag.synonyms||[], acronyms: tag.acronyms||[], relatedTerms: tag.relatedTerms||[],
      'styling.color': tag.styling?.color||'#6c63ff',
      'styling.backgroundColor': tag.styling?.backgroundColor||'',
      'styling.icon': tag.styling?.icon||'',
      'seo.metaTitle': tag.seo?.metaTitle||'',
      'seo.metaDescription': tag.seo?.metaDescription||'',
      'seo.canonicalUrl': tag.seo?.canonicalUrl||'',
      'featuredImage.url': tag.featuredImage?.url||'',
      'featuredImage.alt': tag.featuredImage?.alt||'',
      notes: tag.notes||''
    });
    setModal('edit');
  };
  const openView = (tag) => { setSelectedTag(tag); setModal('view'); };
  const closeModal = () => { setModal(null); setSelectedTag(null); };

  /* ── save ────────────────────────────────────────────── */
  const handleSave = async () => {
    if (!form.name.trim() || !form.type) {
      return Swal.fire({ title:'Validation', text:'Name and Type are required', icon:'warning',
        background:isDarkMode?'#10102a':'#fff', color:isDarkMode?'#eeeeff':'#0d0d2b' });
    }
    setSaving(true);
    const body = {
      name: form.name, slug: form.slug||undefined, description: form.description,
      type: form.type, aiCategory: form.aiCategory,
      parentTag: form.parentTag||undefined,
      isActive: form.isActive, isFeatured: form.isFeatured, isApproved: form.isApproved,
      synonyms: form.synonyms, acronyms: form.acronyms, relatedTerms: form.relatedTerms,
      styling: { color: form['styling.color'], backgroundColor: form['styling.backgroundColor'], icon: form['styling.icon'] },
      seo: { metaTitle: form['seo.metaTitle'], metaDescription: form['seo.metaDescription'], canonicalUrl: form['seo.canonicalUrl'] },
      featuredImage: { url: form['featuredImage.url'], alt: form['featuredImage.alt'] },
      notes: form.notes
    };

    try {
      const isEdit = modal === 'edit';
      const res = await fetch(isEdit ? `/api/admin/tags/${selectedTag._id}` : '/api/admin/tags', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Authorization': `Bearer ${validToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message||'Failed'); }
      Swal.fire({ title:'Saved!', text:`Tag ${isEdit?'updated':'created'} successfully`, icon:'success',
        timer:1800, showConfirmButton:false, background:isDarkMode?'#10102a':'#fff', color:isDarkMode?'#eeeeff':'#0d0d2b' });
      closeModal();
      fetchTags();
    } catch (err) {
      Swal.fire({ title:'Error!', text:err.message, icon:'error',
        background:isDarkMode?'#10102a':'#fff', color:isDarkMode?'#eeeeff':'#0d0d2b' });
    } finally { setSaving(false); }
  };

  /* ── delete ──────────────────────────────────────────── */
  const handleDelete = async (tag) => {
    const res = await Swal.fire({
      title: `Delete "${tag.name}"?`,
      text: 'This action will soft-delete the tag.',
      icon: 'warning', showCancelButton: true,
      confirmButtonText: 'Yes, delete', cancelButtonText: 'Cancel',
      confirmButtonColor: '#ff4d6d',
      background:isDarkMode?'#10102a':'#fff', color:isDarkMode?'#eeeeff':'#0d0d2b'
    });
    if (!res.isConfirmed) return;
    try {
      const r = await fetch(`/api/admin/tags/${tag._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${validToken}`, 'Content-Type': 'application/json' }
      });
      if (!r.ok) throw new Error('Failed to delete');
      Swal.fire({ title:'Deleted', icon:'success', timer:1500, showConfirmButton:false,
        background:isDarkMode?'#10102a':'#fff', color:isDarkMode?'#eeeeff':'#0d0d2b' });
      fetchTags();
    } catch (err) {
      Swal.fire({ title:'Error!', text:err.message, icon:'error',
        background:isDarkMode?'#10102a':'#fff', color:isDarkMode?'#eeeeff':'#0d0d2b' });
    }
  };

  /* ── toggle status ───────────────────────────────────── */
  const toggleStatus = async (tag) => {
    try {
      await fetch(`/api/admin/tags/${tag._id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${validToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !tag.isActive })
      });
      fetchTags();
    } catch { /**/ }
  };

  /* ── setField ────────────────────────────────────────── */
  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  /* ── render ─────────────────────────────────────────── */
  return (
    <div className={`ai-news-admin-managing-pages-root ${isDarkMode?'dark':'light'}`}>
      <main className="ai-news-admin-managing-pages-page">

        {/* ── Breadcrumb ─────────────────────────────── */}
        <nav className="ai-news-amp-breadcrumb" aria-label="Breadcrumb">
          <span>Admin</span>
          <ChevronRight size={13}/>
          <span className="ai-news-amp-bc-link">Content</span>
          <ChevronRight size={13}/>
          <span>Tags</span>
        </nav>

        {/* ── Header ─────────────────────────────────── */}
        <header className="ai-news-admin-managing-pages-header">
          <div className="ai-news-admin-managing-pages-header-left">
            <div className="ai-news-admin-managing-pages-icon-wrap" aria-hidden="true">
              <Tag size={24}/>
            </div>
            <div>
              <h1 className="ai-news-admin-managing-pages-title">Tags Management</h1>
              <p className="ai-news-admin-managing-pages-subtitle">
                <span>Organize AI news with structured taxonomy</span>
                <span className="ai-news-amp-badge ai-news-amp-badge-purple">{stats.total} Total</span>
              </p>
            </div>
          </div>
          <div className="ai-news-admin-managing-pages-header-actions">
            <button className="ai-news-amp-btn ai-news-amp-btn-ghost" onClick={fetchTags} aria-label="Refresh tags">
              <RefreshCw size={15} className={loading?'ai-news-amp-spinning':''}/>
              Refresh
            </button>
            <button className="ai-news-amp-btn ai-news-amp-btn-primary" onClick={openAdd}>
              <Plus size={16}/>
              Add Tag
            </button>
          </div>
        </header>

        {/* ── Info box ───────────────────────────────── */}
        <div className="ai-news-amp-info-box" role="note">
          <div className="ai-news-amp-info-box-title"><Info size={14}/> What are Tags?</div>
          <p className="ai-news-amp-info-box-text">
            Tags are structured metadata labels that classify AI news articles by topic, technology, company, or research area.
            A well-maintained tag taxonomy improves SEO discoverability, enables reader personalization, and powers trending
            content algorithms. Tags support parent–child hierarchies, synonyms, and AI-category mapping for intelligent
            content routing.
          </p>
        </div>

        {/* ── Stats ──────────────────────────────────── */}
        <div className="ai-news-admin-managing-pages-stats" role="region" aria-label="Tag statistics">
          {[
            { label:'Total Tags',    val: fmt(stats.total),    ico: Hash,       cls:'ai-news-amp-ico-purple' },
            { label:'Active',        val: fmt(stats.active),   ico: CheckCircle, cls:'ai-news-amp-ico-green'  },
            { label:'Featured',      val: fmt(stats.featured), ico: Star,        cls:'ai-news-amp-ico-gold'   },
            { label:'Trending',      val: fmt(stats.trending), ico: TrendingUp,  cls:'ai-news-amp-ico-cyan'   },
          ].map(({ label, val, ico: Icon, cls }) => (
            <div key={label} className="ai-news-admin-managing-pages-stat">
              <div className={`ai-news-admin-managing-pages-stat-ico ${cls}`}><Icon size={20}/></div>
              <div>
                <div className="ai-news-admin-managing-pages-stat-val">{loading ? <span className="ai-news-amp-skeleton" style={{display:'inline-block',width:40,height:22}}/> : val}</div>
                <div className="ai-news-admin-managing-pages-stat-lbl">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Toolbar ────────────────────────────────── */}
        <div className="ai-news-admin-managing-pages-toolbar" role="search">
          <div className="ai-news-admin-managing-pages-search-box">
            <Search size={15}/>
            <input
              className="ai-news-admin-managing-pages-search-input"
              placeholder="Search tags by name, slug…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              aria-label="Search tags"
            />
            {search && <button style={{background:'none',border:'none',cursor:'pointer',color:'var(--amp-text-3)',display:'flex'}} onClick={()=>setSearch('')}><X size={14}/></button>}
          </div>

          <select className="ai-news-admin-managing-pages-select" value={filterType} onChange={e=>{setFilterType(e.target.value);setPage(1)}} aria-label="Filter by type">
            <option value="">All Types</option>
            {TAG_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
          </select>

          <select className="ai-news-admin-managing-pages-select" value={filterPop} onChange={e=>{setFilterPop(e.target.value);setPage(1)}} aria-label="Filter by popularity">
            <option value="">All Popularity</option>
            {POPULARITY.map(p=><option key={p} value={p}>{p}</option>)}
          </select>

          <select className="ai-news-admin-managing-pages-select" value={filterActive} onChange={e=>{setFilterActive(e.target.value);setPage(1)}} aria-label="Filter by status">
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>

          <div className="ai-news-admin-managing-pages-toolbar-spacer"/>

          <div className="ai-news-amp-view-toggle" role="group" aria-label="View mode">
            <button className={`ai-news-amp-view-btn ${view==='table'?'ai-news-amp-view-btn-active':''}`} onClick={()=>setView('table')} aria-label="Table view"><List size={16}/></button>
            <button className={`ai-news-amp-view-btn ${view==='grid'?'ai-news-amp-view-btn-active':''}`} onClick={()=>setView('grid')} aria-label="Grid view"><LayoutGrid size={16}/></button>
          </div>
        </div>

        {/* ── Content ────────────────────────────────── */}
        {loading ? (
          <div className="ai-news-admin-managing-pages-table-wrap">
            {[...Array(6)].map((_,i)=>(
              <div key={i} style={{padding:'1rem 1.5rem',borderBottom:'1px solid var(--amp-border)'}}>
                <div className="ai-news-amp-skeleton" style={{height:20,width:'60%',marginBottom:8}}/>
                <div className="ai-news-amp-skeleton" style={{height:14,width:'30%'}}/>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="ai-news-admin-managing-pages-table-wrap">
            <div className="ai-news-amp-empty">
              <div className="ai-news-amp-empty-ico"><Tag size={60}/></div>
              <div className="ai-news-amp-empty-title">No tags found</div>
              <p className="ai-news-amp-empty-text">Try adjusting filters or create your first tag.</p>
              <button className="ai-news-amp-btn ai-news-amp-btn-primary" style={{marginTop:'1rem'}} onClick={openAdd}><Plus size={15}/>Add First Tag</button>
            </div>
          </div>
        ) : view === 'table' ? (
          <div className="ai-news-admin-managing-pages-table-wrap" role="region" aria-label="Tags list">
            <div className="ai-news-admin-managing-pages-table-scroll">
              <table className="ai-news-admin-managing-pages-table" aria-label="Tags table">
                <thead className="ai-news-admin-managing-pages-table-head">
                  <tr>
                    {['Tag Name','Type','AI Category','Articles','Popularity','Status','Actions'].map(h=>(
                      <th key={h} className="ai-news-admin-managing-pages-table-th">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(tag => (
                    <tr key={tag._id} className="ai-news-admin-managing-pages-table-row">
                      <td className="ai-news-admin-managing-pages-table-td">
                        <div className="ai-news-admin-managing-pages-table-td-name">
                          <div className="ai-news-amp-avatar" style={{background:tag.styling?.color||undefined,width:30,height:30,fontSize:'0.72rem'}}>
                            {tag.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{fontWeight:700,color:'var(--amp-text)',fontSize:'0.9rem'}}>{tag.name}</div>
                            <div style={{fontSize:'0.75rem',color:'var(--amp-text-3)',fontFamily:'JetBrains Mono,monospace'}}>#{tag.slug}</div>
                          </div>
                          {tag.isFeatured && <Star size={13} color="var(--amp-gold)" style={{flexShrink:0}}/>}
                        </div>
                      </td>
                      <td className="ai-news-admin-managing-pages-table-td">
                        <span className="ai-news-amp-badge ai-news-amp-badge-purple">{tag.type}</span>
                      </td>
                      <td className="ai-news-admin-managing-pages-table-td">
                        <span className="ai-news-amp-badge ai-news-amp-badge-cyan" style={{fontSize:'0.7rem'}}>{tag.aiCategory||'—'}</span>
                      </td>
                      <td className="ai-news-admin-managing-pages-table-td">
                        <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:'0.85rem',fontWeight:600}}>{fmt(tag.usage?.articleCount)}</span>
                      </td>
                      <td className="ai-news-admin-managing-pages-table-td">
                        <span className={`ai-news-amp-badge ai-news-amp-badge-${popularityColor(tag.usage?.popularity)}`}>{tag.usage?.popularity||'low'}</span>
                      </td>
                      <td className="ai-news-admin-managing-pages-table-td">
                        <button
                          className={`ai-news-amp-badge ${tag.isActive?'ai-news-amp-badge-green':'ai-news-amp-badge-red'}`}
                          style={{cursor:'pointer',border:'none',fontFamily:'inherit'}}
                          onClick={() => toggleStatus(tag)}
                          aria-label={`Toggle status for ${tag.name}`}
                        >
                          {tag.isActive ? <><CheckCircle size={11}/> Active</> : <><XCircle size={11}/> Inactive</>}
                        </button>
                      </td>
                      <td className="ai-news-admin-managing-pages-table-td">
                        <div className="ai-news-admin-managing-pages-table-actions">
                          <button className="ai-news-amp-btn ai-news-amp-btn-ghost ai-news-amp-btn-sm ai-news-amp-btn-icon" onClick={()=>openView(tag)} aria-label={`View ${tag.name}`}><Eye size={14}/></button>
                          <button className="ai-news-amp-btn ai-news-amp-btn-outline ai-news-amp-btn-sm ai-news-amp-btn-icon" onClick={()=>openEdit(tag)} aria-label={`Edit ${tag.name}`}><Edit2 size={14}/></button>
                          <button className="ai-news-amp-btn ai-news-amp-btn-danger ai-news-amp-btn-sm ai-news-amp-btn-icon" onClick={()=>handleDelete(tag)} aria-label={`Delete ${tag.name}`}><Trash2 size={14}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="ai-news-amp-pagination" role="navigation" aria-label="Pagination">
                <button className="ai-news-amp-page-btn" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} aria-label="Previous page">‹</button>
                {[...Array(totalPages)].map((_,i)=>(
                  <button key={i} className={`ai-news-amp-page-btn ${page===i+1?'ai-news-amp-page-btn-active':''}`} onClick={()=>setPage(i+1)} aria-label={`Page ${i+1}`} aria-current={page===i+1?'page':undefined}>{i+1}</button>
                ))}
                <button className="ai-news-amp-page-btn" onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} aria-label="Next page">›</button>
              </div>
            )}
          </div>
        ) : (
          /* Grid view */
          <div className="ai-news-admin-managing-pages-cards-grid" role="region" aria-label="Tags grid">
            {paginated.map(tag => (
              <article key={tag._id} className="ai-news-admin-managing-pages-card" aria-label={`Tag: ${tag.name}`}>
                <div className="ai-news-admin-managing-pages-card-head">
                  <div>
                    <div className="ai-news-admin-managing-pages-card-title">
                      <div className="ai-news-amp-avatar" style={{background:tag.styling?.color||undefined,width:30,height:30,fontSize:'0.72rem'}}>
                        {tag.name?.charAt(0).toUpperCase()}
                      </div>
                      {tag.name}
                      {tag.isFeatured && <Star size={13} color="var(--amp-gold)"/>}
                    </div>
                    <div className="ai-news-admin-managing-pages-card-meta">#{tag.slug} · {tag.type}</div>
                  </div>
                  <span className={`ai-news-amp-badge ai-news-amp-badge-${popularityColor(tag.usage?.popularity)}`}>{tag.usage?.popularity||'low'}</span>
                </div>
                <div className="ai-news-admin-managing-pages-card-body">{tag.description||<em style={{color:'var(--amp-text-3)'}}>No description</em>}</div>
                {tag.aiCategory && <span className="ai-news-amp-badge ai-news-amp-badge-cyan" style={{alignSelf:'flex-start'}}>{tag.aiCategory}</span>}
                <div className="ai-news-amp-metric-grid" style={{gridTemplateColumns:'repeat(3,1fr)'}}>
                  <div className="ai-news-amp-metric-card"><div className="ai-news-amp-metric-lbl">Articles</div><div className="ai-news-amp-metric-val">{fmt(tag.usage?.articleCount)}</div></div>
                  <div className="ai-news-amp-metric-card"><div className="ai-news-amp-metric-lbl">Searches</div><div className="ai-news-amp-metric-val">{fmt(tag.usage?.searchCount)}</div></div>
                  <div className="ai-news-amp-metric-card"><div className="ai-news-amp-metric-lbl">Follows</div><div className="ai-news-amp-metric-val">{fmt(tag.usage?.followCount)}</div></div>
                </div>
                <div className="ai-news-admin-managing-pages-card-footer">
                  <span className={`ai-news-amp-badge ${tag.isActive?'ai-news-amp-badge-green':'ai-news-amp-badge-red'}`}>{tag.isActive?'Active':'Inactive'}</span>
                  <div className="ai-news-admin-managing-pages-card-actions">
                    <button className="ai-news-amp-btn ai-news-amp-btn-ghost ai-news-amp-btn-sm ai-news-amp-btn-icon" onClick={()=>openView(tag)} aria-label="View tag"><Eye size={14}/></button>
                    <button className="ai-news-amp-btn ai-news-amp-btn-outline ai-news-amp-btn-sm ai-news-amp-btn-icon" onClick={()=>openEdit(tag)} aria-label="Edit tag"><Edit2 size={14}/></button>
                    <button className="ai-news-amp-btn ai-news-amp-btn-danger ai-news-amp-btn-sm ai-news-amp-btn-icon" onClick={()=>handleDelete(tag)} aria-label="Delete tag"><Trash2 size={14}/></button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* ─── MODALS ─────────────────────────────────────── */}
        {(modal === 'add' || modal === 'edit') && (
          <div className="ai-news-amp-modal-overlay" role="dialog" aria-modal="true" aria-label={modal==='add'?'Add Tag':'Edit Tag'} onClick={e=>e.target===e.currentTarget&&closeModal()}>
            <div className="ai-news-amp-modal ai-news-amp-modal-lg">
              <div className="ai-news-amp-modal-header">
                <div className="ai-news-amp-modal-title">
                  <Tag size={18}/>{modal==='add'?'Create New Tag':'Edit Tag'}
                </div>
                <button className="ai-news-amp-modal-close" onClick={closeModal} aria-label="Close modal"><X size={18}/></button>
              </div>

              <div className="ai-news-amp-modal-body">
                <div className="ai-news-amp-form-grid">
                  {/* Core */}
                  <div className="ai-news-amp-form-section"><Hash size={13}/> Core Information</div>

                  <div className="ai-news-amp-field">
                    <label className="ai-news-amp-label" htmlFor="amp-tag-name">Name <span className="ai-news-amp-label-req">*</span></label>
                    <input id="amp-tag-name" className="ai-news-amp-input" placeholder="e.g. Large Language Models" value={form.name} onChange={e=>setField('name',e.target.value)}/>
                  </div>

                  <div className="ai-news-amp-field">
                    <label className="ai-news-amp-label" htmlFor="amp-tag-slug">Slug</label>
                    <input id="amp-tag-slug" className="ai-news-amp-input" placeholder="auto-generated" value={form.slug} onChange={e=>setField('slug',e.target.value)}/>
                  </div>

                  <div className="ai-news-amp-field ai-news-amp-form-full">
                    <label className="ai-news-amp-label" htmlFor="amp-tag-desc">Description</label>
                    <textarea id="amp-tag-desc" className="ai-news-amp-textarea" placeholder="Brief description of this tag…" value={form.description} onChange={e=>setField('description',e.target.value)}/>
                  </div>

                  <div className="ai-news-amp-field">
                    <label className="ai-news-amp-label" htmlFor="amp-tag-type">Type <span className="ai-news-amp-label-req">*</span></label>
                    <select id="amp-tag-type" className="ai-news-amp-sel" value={form.type} onChange={e=>setField('type',e.target.value)}>
                      {TAG_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  <div className="ai-news-amp-field">
                    <label className="ai-news-amp-label" htmlFor="amp-tag-ai-cat">AI Category</label>
                    <select id="amp-tag-ai-cat" className="ai-news-amp-sel" value={form.aiCategory} onChange={e=>setField('aiCategory',e.target.value)}>
                      {AI_CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  {/* Taxonomy */}
                  <div className="ai-news-amp-form-section"><Layers size={13}/> Taxonomy & Variants</div>

                  <div className="ai-news-amp-field ai-news-amp-form-full">
                    <label className="ai-news-amp-label">Synonyms <span style={{color:'var(--amp-text-3)',fontSize:'0.77rem'}}>(press Enter)</span></label>
                    <ChipInput value={form.synonyms} onChange={v=>setField('synonyms',v)} placeholder="Type synonym + Enter"/>
                  </div>

                  <div className="ai-news-amp-field ai-news-amp-form-full">
                    <label className="ai-news-amp-label">Acronyms</label>
                    <ChipInput value={form.acronyms} onChange={v=>setField('acronyms',v)} placeholder="Type acronym + Enter"/>
                  </div>

                  <div className="ai-news-amp-field ai-news-amp-form-full">
                    <label className="ai-news-amp-label">Related Terms</label>
                    <ChipInput value={form.relatedTerms} onChange={v=>setField('relatedTerms',v)} placeholder="Type related term + Enter"/>
                  </div>

                  {/* Styling */}
                  <div className="ai-news-amp-form-section"><Zap size={13}/> Styling & Appearance</div>

                  <div className="ai-news-amp-field">
                    <label className="ai-news-amp-label" htmlFor="amp-tag-color">Tag Color</label>
                    <div style={{display:'flex',gap:'0.5rem',alignItems:'center'}}>
                      <input type="color" id="amp-tag-color" style={{width:38,height:38,border:'none',background:'none',cursor:'pointer',borderRadius:8}} value={form['styling.color']||'#6c63ff'} onChange={e=>setField('styling.color',e.target.value)}/>
                      <input className="ai-news-amp-input" style={{flex:1}} value={form['styling.color']} onChange={e=>setField('styling.color',e.target.value)} placeholder="#6c63ff"/>
                    </div>
                  </div>

                  <div className="ai-news-amp-field">
                    <label className="ai-news-amp-label" htmlFor="amp-tag-bg">Background Color</label>
                    <input id="amp-tag-bg" className="ai-news-amp-input" placeholder="#ffffff" value={form['styling.backgroundColor']} onChange={e=>setField('styling.backgroundColor',e.target.value)}/>
                  </div>

                  {/* SEO */}
                  <div className="ai-news-amp-form-section"><Globe size={13}/> SEO</div>

                  <div className="ai-news-amp-field ai-news-amp-form-full">
                    <label className="ai-news-amp-label" htmlFor="amp-tag-meta-title">Meta Title</label>
                    <input id="amp-tag-meta-title" className="ai-news-amp-input" placeholder="SEO page title for tag" value={form['seo.metaTitle']} onChange={e=>setField('seo.metaTitle',e.target.value)}/>
                  </div>

                  <div className="ai-news-amp-field ai-news-amp-form-full">
                    <label className="ai-news-amp-label" htmlFor="amp-tag-meta-desc">Meta Description</label>
                    <textarea id="amp-tag-meta-desc" className="ai-news-amp-textarea" style={{minHeight:60}} placeholder="SEO description…" value={form['seo.metaDescription']} onChange={e=>setField('seo.metaDescription',e.target.value)}/>
                  </div>

                  <div className="ai-news-amp-field ai-news-amp-form-full">
                    <label className="ai-news-amp-label" htmlFor="amp-tag-canonical">Canonical URL</label>
                    <input id="amp-tag-canonical" className="ai-news-amp-input" placeholder="https://…" value={form['seo.canonicalUrl']} onChange={e=>setField('seo.canonicalUrl',e.target.value)}/>
                  </div>

                  {/* Settings */}
                  <div className="ai-news-amp-form-section"><CheckCircle size={13}/> Settings</div>

                  {[
                    { k:'isActive',   label:'Active',   desc:'Tag appears in listings and filters' },
                    { k:'isFeatured', label:'Featured', desc:'Highlighted on homepage & tag pages' },
                    { k:'isApproved', label:'Approved', desc:'Tag is approved by editorial team' },
                  ].map(({k,label,desc})=>(
                    <div key={k} className="ai-news-amp-toggle-row ai-news-amp-form-full">
                      <div className="ai-news-amp-toggle-info">
                        <div className="ai-news-amp-toggle-name">{label}</div>
                        <div className="ai-news-amp-toggle-desc">{desc}</div>
                      </div>
                      <label className="ai-news-amp-switch">
                        <input type="checkbox" className="ai-news-amp-switch-inp" checked={!!form[k]} onChange={e=>setField(k,e.target.checked)}/>
                        <span className="ai-news-amp-switch-track"/>
                      </label>
                    </div>
                  ))}

                  <div className="ai-news-amp-field ai-news-amp-form-full">
                    <label className="ai-news-amp-label" htmlFor="amp-tag-notes">Internal Notes</label>
                    <textarea id="amp-tag-notes" className="ai-news-amp-textarea" style={{minHeight:60}} placeholder="Admin notes…" value={form.notes} onChange={e=>setField('notes',e.target.value)}/>
                  </div>
                </div>
              </div>

              <div className="ai-news-amp-modal-footer">
                <button className="ai-news-amp-btn ai-news-amp-btn-ghost" onClick={closeModal}>Cancel</button>
                <button className="ai-news-amp-btn ai-news-amp-btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? <><span className="ai-news-amp-loader" style={{width:16,height:16}}/> Saving…</> : modal==='add'?<><Plus size={15}/>Create Tag</>:<><CheckCircle size={15}/>Update Tag</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── VIEW MODAL ─────────────────────────────── */}
        {modal === 'view' && selectedTag && (
          <div className="ai-news-amp-modal-overlay" role="dialog" aria-modal="true" aria-label="View Tag" onClick={e=>e.target===e.currentTarget&&closeModal()}>
            <div className="ai-news-amp-modal ai-news-amp-modal-lg">
              <div className="ai-news-amp-modal-header">
                <div className="ai-news-amp-modal-title">
                  <div className="ai-news-amp-avatar" style={{background:selectedTag.styling?.color||undefined,width:28,height:28,fontSize:'0.75rem'}}>
                    {selectedTag.name?.charAt(0).toUpperCase()}
                  </div>
                  {selectedTag.name}
                </div>
                <button className="ai-news-amp-modal-close" onClick={closeModal} aria-label="Close"><X size={18}/></button>
              </div>

              <div className="ai-news-amp-modal-body">
                <div className="ai-news-amp-tags-wrap" style={{marginBottom:'1rem'}}>
                  <span className="ai-news-amp-badge ai-news-amp-badge-purple">{selectedTag.type}</span>
                  <span className="ai-news-amp-badge ai-news-amp-badge-cyan">{selectedTag.aiCategory}</span>
                  <span className={`ai-news-amp-badge ai-news-amp-badge-${popularityColor(selectedTag.usage?.popularity)}`}>{selectedTag.usage?.popularity||'low'}</span>
                  {selectedTag.isActive && <span className="ai-news-amp-badge ai-news-amp-badge-green">Active</span>}
                  {selectedTag.isFeatured && <span className="ai-news-amp-badge ai-news-amp-badge-gold"><Star size={11}/> Featured</span>}
                </div>

                {selectedTag.description && <p style={{marginBottom:'1rem',color:'var(--amp-text-2)',fontSize:'0.9rem',lineHeight:1.6}}>{selectedTag.description}</p>}

                <div className="ai-news-amp-glow-sep"/>

                <div className="ai-news-amp-metric-grid" style={{marginBottom:'1.25rem'}}>
                  {[
                    { lbl:'Articles',        val: fmt(selectedTag.usage?.articleCount) },
                    { lbl:'Searches',        val: fmt(selectedTag.usage?.searchCount) },
                    { lbl:'Follows',         val: fmt(selectedTag.usage?.followCount) },
                    { lbl:'Trending Score',  val: selectedTag.usage?.trendingScore?.toFixed(2)||'0' },
                  ].map(({lbl,val})=>(
                    <div key={lbl} className="ai-news-amp-metric-card">
                      <div className="ai-news-amp-metric-lbl">{lbl}</div>
                      <div className="ai-news-amp-metric-val">{val}</div>
                    </div>
                  ))}
                </div>

                <div className="ai-news-amp-detail-grid">
                  <div className="ai-news-amp-detail-item"><div className="ai-news-amp-detail-key">Slug</div><div className="ai-news-amp-code-val">#{selectedTag.slug}</div></div>
                  <div className="ai-news-amp-detail-item"><div className="ai-news-amp-detail-key">Level</div><div className="ai-news-amp-detail-val">{selectedTag.level||0}</div></div>
                  <div className="ai-news-amp-detail-item"><div className="ai-news-amp-detail-key">Path</div><div className="ai-news-amp-detail-val">{selectedTag.path||'—'}</div></div>
                  <div className="ai-news-amp-detail-item"><div className="ai-news-amp-detail-key">Created</div><div className="ai-news-amp-detail-val">{selectedTag.createdAt?new Date(selectedTag.createdAt).toLocaleDateString():'—'}</div></div>
                </div>

                {(selectedTag.synonyms?.length > 0 || selectedTag.acronyms?.length > 0) && (
                  <>
                    <div className="ai-news-amp-glow-sep"/>
                    {selectedTag.synonyms?.length > 0 && (
                      <div style={{marginBottom:'0.75rem'}}>
                        <div className="ai-news-amp-detail-key" style={{marginBottom:'0.4rem'}}>Synonyms</div>
                        <div className="ai-news-amp-tags-wrap">{selectedTag.synonyms.map(s=><span key={s} className="ai-news-amp-tag-pill">{s}</span>)}</div>
                      </div>
                    )}
                    {selectedTag.acronyms?.length > 0 && (
                      <div>
                        <div className="ai-news-amp-detail-key" style={{marginBottom:'0.4rem'}}>Acronyms</div>
                        <div className="ai-news-amp-tags-wrap">{selectedTag.acronyms.map(a=><span key={a} className="ai-news-amp-tag-pill">{a}</span>)}</div>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="ai-news-amp-modal-footer">
                <button className="ai-news-amp-btn ai-news-amp-btn-ghost" onClick={closeModal}>Close</button>
                <button className="ai-news-amp-btn ai-news-amp-btn-outline" onClick={()=>openEdit(selectedTag)}><Edit2 size={14}/> Edit Tag</button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

