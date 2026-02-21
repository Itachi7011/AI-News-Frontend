import { useState, useEffect, useContext, useCallback } from 'react';
import {
  FolderOpen, Plus, Search, Edit2, Trash2, Eye, RefreshCw,
  CheckCircle, XCircle, Star, BarChart2, Users, Layout,
  ChevronRight, X, Filter, List, LayoutGrid, Info,
  TrendingUp, BookOpen, Globe, Layers, Settings, Bell
} from 'lucide-react';
import Swal from 'sweetalert2';
import { ThemeContext } from '../../context/ThemeContext';

const TOKEN_KEY = 'ai_news_admin_token';
const getToken = () => localStorage.getItem(TOKEN_KEY);
const fmt = n => n == null ? '—' : Number(n).toLocaleString();

const AI_CATEGORY_TYPES = ['machine-learning','deep-learning','nlp','computer-vision','generative-ai','llm','robotics','ai-ethics','ai-business','ai-research','ai-hardware','ai-software','ai-tools','ai-news','ai-tutorials','ai-opinion','ai-case-studies','ai-interviews','general'];
const STATUSES = ['active','inactive','hidden','archived'];
const LAYOUTS = ['grid','list','featured','compact','magazine'];
const NOTIF_FREQ = ['instant','daily','weekly','never'];

const statusColor = s => ({ active:'green', inactive:'red', hidden:'orange', archived:'gray' }[s]||'gray');

const EMPTY = {
  name:'', slug:'', description:'', aiCategoryType:'general', icon:'', status:'active',
  isActive:true, isFeatured:false, isPopular:false, displayOrder:0,
  'color.primary':'#6366f1', 'color.secondary':'#8b5cf6', 'color.accent':'#ec4899',
  'displaySettings.layout':'grid', 'displaySettings.articlesPerPage':20,
  'displaySettings.showSubcategories':true, 'displaySettings.showFeaturedFirst':true,
  'displaySettings.allowSorting':true,
  'subscription.isSubscribable':true, 'subscription.notificationFrequency':'daily',
  'moderation.requiresApproval':false,
  'visibility.public':true, 'visibility.requireAuth':false,
  'seo.metaTitle':'', 'seo.metaDescription':'', 'seo.canonicalUrl':'',
  parentCategory:'',
};

export default function AdminCategories() {
  const { isDarkMode } = useContext(ThemeContext);
  const validToken = getToken();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [view, setView]             = useState('table');
  const [page, setPage]             = useState(1);
  const [modal, setModal]           = useState(null);
  const [selected, setSelected]     = useState(null);
  const [form, setForm]             = useState(EMPTY);
  const [saving, setSaving]         = useState(false);
  const [activeTab, setActiveTab]   = useState('basic');

  const PER_PAGE = 10;

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/categories?limit=200', {
        headers: { 'Authorization': `Bearer ${validToken}`, 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCategories(data.categories || data.data || data || []);
    } catch {
      Swal.fire({ title:'Error!', text:'Failed to load categories', icon:'error',
        background:isDarkMode?'#10102a':'#fff', color:isDarkMode?'#eeeeff':'#0d0d2b' });
    } finally { setLoading(false); }
  }, [validToken, isDarkMode]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const filtered = categories.filter(c => {
    const s = search.toLowerCase();
    return (!s || c.name?.toLowerCase().includes(s) || c.slug?.toLowerCase().includes(s))
      && (!filterStatus || c.status === filterStatus)
      && (!filterType   || c.aiCategoryType === filterType);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated  = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);

  const stats = {
    total: categories.length,
    active: categories.filter(c=>c.isActive).length,
    featured: categories.filter(c=>c.isFeatured).length,
    totalArticles: categories.reduce((a,c)=>a+(c.stats?.totalArticles||0),0),
    totalViews: categories.reduce((a,c)=>a+(c.stats?.totalViews||0),0),
  };

  const openAdd  = () => { setForm(EMPTY); setSelected(null); setActiveTab('basic'); setModal('add'); };
  const openEdit = (cat) => {
    setSelected(cat);
    setForm({
      name: cat.name||'', slug: cat.slug||'', description: cat.description||'',
      aiCategoryType: cat.aiCategoryType||'general', icon: cat.icon||'',
      status: cat.status||'active', isActive: cat.isActive??true,
      isFeatured: cat.isFeatured??false, isPopular: cat.isPopular??false,
      displayOrder: cat.displayOrder||0, parentCategory: cat.parentCategory||'',
      'color.primary': cat.color?.primary||'#6366f1',
      'color.secondary': cat.color?.secondary||'#8b5cf6',
      'color.accent': cat.color?.accent||'#ec4899',
      'displaySettings.layout': cat.displaySettings?.layout||'grid',
      'displaySettings.articlesPerPage': cat.displaySettings?.articlesPerPage||20,
      'displaySettings.showSubcategories': cat.displaySettings?.showSubcategories??true,
      'displaySettings.showFeaturedFirst': cat.displaySettings?.showFeaturedFirst??true,
      'displaySettings.allowSorting': cat.displaySettings?.allowSorting??true,
      'subscription.isSubscribable': cat.subscription?.isSubscribable??true,
      'subscription.notificationFrequency': cat.subscription?.notificationFrequency||'daily',
      'moderation.requiresApproval': cat.moderation?.requiresApproval??false,
      'visibility.public': cat.visibility?.public??true,
      'visibility.requireAuth': cat.visibility?.requireAuth??false,
      'seo.metaTitle': cat.seo?.metaTitle||'',
      'seo.metaDescription': cat.seo?.metaDescription||'',
      'seo.canonicalUrl': cat.seo?.canonicalUrl||'',
    });
    setActiveTab('basic');
    setModal('edit');
  };
  const openView = (cat) => { setSelected(cat); setModal('view'); };
  const closeModal = () => { setModal(null); setSelected(null); };
  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name.trim()) {
      return Swal.fire({ title:'Validation', text:'Name is required', icon:'warning',
        background:isDarkMode?'#10102a':'#fff', color:isDarkMode?'#eeeeff':'#0d0d2b' });
    }
    setSaving(true);
    const body = {
      name: form.name, slug: form.slug||undefined, description: form.description,
      aiCategoryType: form.aiCategoryType, icon: form.icon, status: form.status,
      isActive: form.isActive, isFeatured: form.isFeatured, isPopular: form.isPopular,
      displayOrder: Number(form.displayOrder),
      parentCategory: form.parentCategory||undefined,
      color: { primary: form['color.primary'], secondary: form['color.secondary'], accent: form['color.accent'] },
      displaySettings: {
        layout: form['displaySettings.layout'],
        articlesPerPage: Number(form['displaySettings.articlesPerPage']),
        showSubcategories: form['displaySettings.showSubcategories'],
        showFeaturedFirst: form['displaySettings.showFeaturedFirst'],
        allowSorting: form['displaySettings.allowSorting'],
      },
      subscription: { isSubscribable: form['subscription.isSubscribable'], notificationFrequency: form['subscription.notificationFrequency'] },
      moderation: { requiresApproval: form['moderation.requiresApproval'] },
      visibility: { public: form['visibility.public'], requireAuth: form['visibility.requireAuth'] },
      seo: { metaTitle: form['seo.metaTitle'], metaDescription: form['seo.metaDescription'], canonicalUrl: form['seo.canonicalUrl'] },
    };
    try {
      const isEdit = modal === 'edit';
      const res = await fetch(isEdit ? `/api/admin/categories/${selected._id}` : '/api/admin/categories', {
        method: isEdit?'PUT':'POST',
        headers: { 'Authorization': `Bearer ${validToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message||'Failed'); }
      Swal.fire({ title:'Saved!', text:`Category ${isEdit?'updated':'created'} successfully`, icon:'success',
        timer:1800, showConfirmButton:false, background:isDarkMode?'#10102a':'#fff', color:isDarkMode?'#eeeeff':'#0d0d2b' });
      closeModal(); fetchCategories();
    } catch (err) {
      Swal.fire({ title:'Error!', text:err.message, icon:'error',
        background:isDarkMode?'#10102a':'#fff', color:isDarkMode?'#eeeeff':'#0d0d2b' });
    } finally { setSaving(false); }
  };

  const handleDelete = async (cat) => {
    const res = await Swal.fire({
      title:`Delete "${cat.name}"?`, text:'This will soft-delete the category.', icon:'warning',
      showCancelButton:true, confirmButtonText:'Delete', cancelButtonText:'Cancel',
      confirmButtonColor:'#ff4d6d',
      background:isDarkMode?'#10102a':'#fff', color:isDarkMode?'#eeeeff':'#0d0d2b'
    });
    if (!res.isConfirmed) return;
    try {
      const r = await fetch(`/api/admin/categories/${cat._id}`, {
        method:'DELETE',
        headers: { 'Authorization': `Bearer ${validToken}`, 'Content-Type': 'application/json' }
      });
      if (!r.ok) throw new Error('Failed');
      Swal.fire({ title:'Deleted', icon:'success', timer:1500, showConfirmButton:false,
        background:isDarkMode?'#10102a':'#fff', color:isDarkMode?'#eeeeff':'#0d0d2b' });
      fetchCategories();
    } catch (err) {
      Swal.fire({ title:'Error!', text:err.message, icon:'error',
        background:isDarkMode?'#10102a':'#fff', color:isDarkMode?'#eeeeff':'#0d0d2b' });
    }
  };

  const FORM_TABS = [
    { id:'basic',   label:'Basic',    icon: FolderOpen },
    { id:'display', label:'Display',  icon: Layout },
    { id:'sub',     label:'Subscription', icon: Bell },
    { id:'seo',     label:'SEO',      icon: Globe },
    { id:'mod',     label:'Moderation', icon: Settings },
  ];

  return (
    <div className={`ai-news-admin-managing-pages-root ${isDarkMode?'dark':'light'}`}>
      <main className="ai-news-admin-managing-pages-page">

        <nav className="ai-news-amp-breadcrumb">
          <span>Admin</span><ChevronRight size={13}/><span>Content</span><ChevronRight size={13}/><span>Categories</span>
        </nav>

        <header className="ai-news-admin-managing-pages-header">
          <div className="ai-news-admin-managing-pages-header-left">
            <div className="ai-news-admin-managing-pages-icon-wrap"><FolderOpen size={24}/></div>
            <div>
              <h1 className="ai-news-admin-managing-pages-title">Categories</h1>
              <p className="ai-news-admin-managing-pages-subtitle">
                Hierarchical AI news content taxonomy
                <span className="ai-news-amp-badge ai-news-amp-badge-purple">{stats.total} Total</span>
              </p>
            </div>
          </div>
          <div className="ai-news-admin-managing-pages-header-actions">
            <button className="ai-news-amp-btn ai-news-amp-btn-ghost" onClick={fetchCategories}><RefreshCw size={15} className={loading?'ai-news-amp-spinning':''}/> Refresh</button>
            <button className="ai-news-amp-btn ai-news-amp-btn-primary" onClick={openAdd}><Plus size={16}/>Add Category</button>
          </div>
        </header>

        <div className="ai-news-amp-info-box">
          <div className="ai-news-amp-info-box-title"><Info size={14}/> Category Taxonomy</div>
          <p className="ai-news-amp-info-box-text">
            Categories form the backbone of AI News content organisation. They support multi-level hierarchy (up to 5 levels),
            subscriber notifications, SEO metadata, layout customization per category page, and moderation controls.
            Each category maps to a specific AI domain (LLM, Computer Vision, etc.) enabling intelligent content routing and
            personalised reader experiences. Trending categories are promoted to the homepage automatically.
          </p>
        </div>

        <div className="ai-news-admin-managing-pages-stats">
          {[
            { label:'Total',         val:fmt(stats.total),        ico:FolderOpen, cls:'ai-news-amp-ico-purple' },
            { label:'Active',        val:fmt(stats.active),       ico:CheckCircle, cls:'ai-news-amp-ico-green' },
            { label:'Featured',      val:fmt(stats.featured),     ico:Star,        cls:'ai-news-amp-ico-gold' },
            { label:'Total Articles',val:fmt(stats.totalArticles),ico:BookOpen,    cls:'ai-news-amp-ico-cyan' },
            { label:'Total Views',   val:fmt(stats.totalViews),   ico:BarChart2,   cls:'ai-news-amp-ico-orange' },
          ].map(({label,val,ico:Icon,cls})=>(
            <div key={label} className="ai-news-admin-managing-pages-stat">
              <div className={`ai-news-admin-managing-pages-stat-ico ${cls}`}><Icon size={20}/></div>
              <div>
                <div className="ai-news-admin-managing-pages-stat-val">{loading?<span className="ai-news-amp-skeleton" style={{display:'inline-block',width:40,height:22}}/>:val}</div>
                <div className="ai-news-admin-managing-pages-stat-lbl">{label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="ai-news-admin-managing-pages-toolbar">
          <div className="ai-news-admin-managing-pages-search-box">
            <Search size={15}/>
            <input className="ai-news-admin-managing-pages-search-input" placeholder="Search categories…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}} aria-label="Search categories"/>
            {search && <button style={{background:'none',border:'none',cursor:'pointer',color:'var(--amp-text-3)',display:'flex'}} onClick={()=>setSearch('')}><X size={14}/></button>}
          </div>
          <select className="ai-news-admin-managing-pages-select" value={filterStatus} onChange={e=>{setFilterStatus(e.target.value);setPage(1)}} aria-label="Filter by status">
            <option value="">All Status</option>
            {STATUSES.map(s=><option key={s} value={s}>{s}</option>)}
          </select>
          <select className="ai-news-admin-managing-pages-select" value={filterType} onChange={e=>{setFilterType(e.target.value);setPage(1)}} aria-label="Filter by AI type">
            <option value="">All AI Types</option>
            {AI_CATEGORY_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
          </select>
          <div className="ai-news-admin-managing-pages-toolbar-spacer"/>
          <div className="ai-news-amp-view-toggle">
            <button className={`ai-news-amp-view-btn ${view==='table'?'ai-news-amp-view-btn-active':''}`} onClick={()=>setView('table')}><List size={16}/></button>
            <button className={`ai-news-amp-view-btn ${view==='grid'?'ai-news-amp-view-btn-active':''}`} onClick={()=>setView('grid')}><LayoutGrid size={16}/></button>
          </div>
        </div>

        {loading ? (
          <div className="ai-news-admin-managing-pages-table-wrap">{[...Array(5)].map((_,i)=>(
            <div key={i} style={{padding:'1rem 1.5rem',borderBottom:'1px solid var(--amp-border)'}}>
              <div className="ai-news-amp-skeleton" style={{height:20,width:'55%',marginBottom:8}}/>
              <div className="ai-news-amp-skeleton" style={{height:14,width:'35%'}}/>
            </div>
          ))}</div>
        ) : filtered.length === 0 ? (
          <div className="ai-news-admin-managing-pages-table-wrap">
            <div className="ai-news-amp-empty">
              <div className="ai-news-amp-empty-ico"><FolderOpen size={60}/></div>
              <div className="ai-news-amp-empty-title">No categories found</div>
              <p className="ai-news-amp-empty-text">Create your first category to organise AI content.</p>
              <button className="ai-news-amp-btn ai-news-amp-btn-primary" style={{marginTop:'1rem'}} onClick={openAdd}><Plus size={15}/>Add Category</button>
            </div>
          </div>
        ) : view === 'table' ? (
          <div className="ai-news-admin-managing-pages-table-wrap">
            <div className="ai-news-admin-managing-pages-table-scroll">
              <table className="ai-news-admin-managing-pages-table" aria-label="Categories table">
                <thead className="ai-news-admin-managing-pages-table-head">
                  <tr>
                    {['Category','AI Type','Articles','Views','Subscribers','Status','Actions'].map(h=>(
                      <th key={h} className="ai-news-admin-managing-pages-table-th">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(cat => (
                    <tr key={cat._id} className="ai-news-admin-managing-pages-table-row">
                      <td className="ai-news-admin-managing-pages-table-td">
                        <div className="ai-news-admin-managing-pages-table-td-name">
                          <div className="ai-news-amp-avatar" style={{background:cat.color?.primary||undefined,width:30,height:30,fontSize:'0.72rem'}}>
                            {cat.name?.charAt(0)}
                          </div>
                          <div>
                            <div style={{fontWeight:700,color:'var(--amp-text)'}}>{cat.name}</div>
                            <div style={{fontSize:'0.74rem',color:'var(--amp-text-3)'}}>/{cat.slug}</div>
                          </div>
                          {cat.isFeatured && <Star size={13} color="var(--amp-gold)"/>}
                          {cat.level > 0 && <span className="ai-news-amp-badge ai-news-amp-badge-gray" style={{fontSize:'0.68rem'}}>L{cat.level}</span>}
                        </div>
                      </td>
                      <td className="ai-news-admin-managing-pages-table-td">
                        <span className="ai-news-amp-badge ai-news-amp-badge-cyan">{cat.aiCategoryType||'general'}</span>
                      </td>
                      <td className="ai-news-admin-managing-pages-table-td" style={{fontFamily:'JetBrains Mono,monospace',fontSize:'0.85rem',fontWeight:600}}>{fmt(cat.stats?.totalArticles)}</td>
                      <td className="ai-news-admin-managing-pages-table-td" style={{fontFamily:'JetBrains Mono,monospace',fontSize:'0.85rem'}}>{fmt(cat.stats?.totalViews)}</td>
                      <td className="ai-news-admin-managing-pages-table-td" style={{fontFamily:'JetBrains Mono,monospace',fontSize:'0.85rem'}}>{fmt(cat.stats?.subscriberCount)}</td>
                      <td className="ai-news-admin-managing-pages-table-td">
                        <span className={`ai-news-amp-badge ai-news-amp-badge-${statusColor(cat.status)}`}>{cat.status||'active'}</span>
                      </td>
                      <td className="ai-news-admin-managing-pages-table-td">
                        <div className="ai-news-admin-managing-pages-table-actions">
                          <button className="ai-news-amp-btn ai-news-amp-btn-ghost ai-news-amp-btn-sm ai-news-amp-btn-icon" onClick={()=>openView(cat)} aria-label="View"><Eye size={14}/></button>
                          <button className="ai-news-amp-btn ai-news-amp-btn-outline ai-news-amp-btn-sm ai-news-amp-btn-icon" onClick={()=>openEdit(cat)} aria-label="Edit"><Edit2 size={14}/></button>
                          <button className="ai-news-amp-btn ai-news-amp-btn-danger ai-news-amp-btn-sm ai-news-amp-btn-icon" onClick={()=>handleDelete(cat)} aria-label="Delete"><Trash2 size={14}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="ai-news-amp-pagination">
                <button className="ai-news-amp-page-btn" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}>‹</button>
                {[...Array(totalPages)].map((_,i)=>(
                  <button key={i} className={`ai-news-amp-page-btn ${page===i+1?'ai-news-amp-page-btn-active':''}`} onClick={()=>setPage(i+1)}>{i+1}</button>
                ))}
                <button className="ai-news-amp-page-btn" onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}>›</button>
              </div>
            )}
          </div>
        ) : (
          <div className="ai-news-admin-managing-pages-cards-grid">
            {paginated.map(cat => (
              <article key={cat._id} className="ai-news-admin-managing-pages-card" style={{'--card-color':cat.color?.primary}}>
                <div className="ai-news-admin-managing-pages-card-head">
                  <div>
                    <div className="ai-news-admin-managing-pages-card-title">
                      <div className="ai-news-amp-avatar" style={{background:cat.color?.primary,width:30,height:30,fontSize:'0.72rem'}}>{cat.name?.charAt(0)}</div>
                      {cat.name} {cat.isFeatured && <Star size={13} color="var(--amp-gold)"/>}
                    </div>
                    <div className="ai-news-admin-managing-pages-card-meta">Level {cat.level||0} · {cat.aiCategoryType}</div>
                  </div>
                  <span className={`ai-news-amp-badge ai-news-amp-badge-${statusColor(cat.status)}`}>{cat.status}</span>
                </div>
                <div className="ai-news-admin-managing-pages-card-body">{cat.description||<em style={{color:'var(--amp-text-3)'}}>No description</em>}</div>
                <div className="ai-news-amp-metric-grid" style={{gridTemplateColumns:'repeat(3,1fr)'}}>
                  <div className="ai-news-amp-metric-card"><div className="ai-news-amp-metric-lbl">Articles</div><div className="ai-news-amp-metric-val" style={{fontSize:'1.1rem'}}>{fmt(cat.stats?.totalArticles)}</div></div>
                  <div className="ai-news-amp-metric-card"><div className="ai-news-amp-metric-lbl">Views</div><div className="ai-news-amp-metric-val" style={{fontSize:'1.1rem'}}>{fmt(cat.stats?.totalViews)}</div></div>
                  <div className="ai-news-amp-metric-card"><div className="ai-news-amp-metric-lbl">Subs</div><div className="ai-news-amp-metric-val" style={{fontSize:'1.1rem'}}>{fmt(cat.stats?.subscriberCount)}</div></div>
                </div>
                <div className="ai-news-admin-managing-pages-card-footer">
                  <div className="ai-news-amp-color-row">
                    {[cat.color?.primary,cat.color?.secondary,cat.color?.accent].map((c,i)=>c&&<div key={i} className="ai-news-amp-color-dot" style={{background:c}} title={c}/>)}
                  </div>
                  <div className="ai-news-admin-managing-pages-card-actions">
                    <button className="ai-news-amp-btn ai-news-amp-btn-ghost ai-news-amp-btn-sm ai-news-amp-btn-icon" onClick={()=>openView(cat)}><Eye size={14}/></button>
                    <button className="ai-news-amp-btn ai-news-amp-btn-outline ai-news-amp-btn-sm ai-news-amp-btn-icon" onClick={()=>openEdit(cat)}><Edit2 size={14}/></button>
                    <button className="ai-news-amp-btn ai-news-amp-btn-danger ai-news-amp-btn-sm ai-news-amp-btn-icon" onClick={()=>handleDelete(cat)}><Trash2 size={14}/></button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* ADD/EDIT MODAL */}
        {(modal === 'add' || modal === 'edit') && (
          <div className="ai-news-amp-modal-overlay" role="dialog" aria-modal="true" onClick={e=>e.target===e.currentTarget&&closeModal()}>
            <div className="ai-news-amp-modal ai-news-amp-modal-xl">
              <div className="ai-news-amp-modal-header">
                <div className="ai-news-amp-modal-title"><FolderOpen size={18}/>{modal==='add'?'Create Category':'Edit Category'}</div>
                <button className="ai-news-amp-modal-close" onClick={closeModal}><X size={18}/></button>
              </div>

              <div className="ai-news-amp-modal-body">
                {/* Sub-tabs */}
                <div className="ai-news-amp-tabs" style={{marginBottom:'1.5rem'}}>
                  {FORM_TABS.map(({id,label,icon:Icon})=>(
                    <button key={id} className={`ai-news-amp-tab ${activeTab===id?'ai-news-amp-tab-active':''}`} onClick={()=>setActiveTab(id)}>
                      <Icon size={14}/>{label}
                    </button>
                  ))}
                </div>

                {activeTab === 'basic' && (
                  <div className="ai-news-amp-form-grid">
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label" htmlFor="cat-name">Name <span className="ai-news-amp-label-req">*</span></label><input id="cat-name" className="ai-news-amp-input" placeholder="e.g. Large Language Models" value={form.name} onChange={e=>setField('name',e.target.value)}/></div>
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label" htmlFor="cat-slug">Slug</label><input id="cat-slug" className="ai-news-amp-input" placeholder="auto-generated" value={form.slug} onChange={e=>setField('slug',e.target.value)}/></div>
                    <div className="ai-news-amp-field ai-news-amp-form-full"><label className="ai-news-amp-label" htmlFor="cat-desc">Description</label><textarea id="cat-desc" className="ai-news-amp-textarea" placeholder="What content belongs in this category?" value={form.description} onChange={e=>setField('description',e.target.value)}/></div>
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label" htmlFor="cat-ai-type">AI Category Type <span className="ai-news-amp-label-req">*</span></label><select id="cat-ai-type" className="ai-news-amp-sel" value={form.aiCategoryType} onChange={e=>setField('aiCategoryType',e.target.value)}>{AI_CATEGORY_TYPES.map(t=><option key={t} value={t}>{t}</option>)}</select></div>
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label" htmlFor="cat-status">Status</label><select id="cat-status" className="ai-news-amp-sel" value={form.status} onChange={e=>setField('status',e.target.value)}>{STATUSES.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label" htmlFor="cat-order">Display Order</label><input id="cat-order" type="number" className="ai-news-amp-input" value={form.displayOrder} onChange={e=>setField('displayOrder',e.target.value)}/></div>
                    <div className="ai-news-amp-form-section"><Layers size={13}/> Colors</div>
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">Primary Color</label><div style={{display:'flex',gap:'0.5rem',alignItems:'center'}}><input type="color" style={{width:38,height:38,border:'none',background:'none',cursor:'pointer',borderRadius:8}} value={form['color.primary']} onChange={e=>setField('color.primary',e.target.value)}/><input className="ai-news-amp-input" style={{flex:1}} value={form['color.primary']} onChange={e=>setField('color.primary',e.target.value)}/></div></div>
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">Secondary Color</label><div style={{display:'flex',gap:'0.5rem',alignItems:'center'}}><input type="color" style={{width:38,height:38,border:'none',background:'none',cursor:'pointer',borderRadius:8}} value={form['color.secondary']} onChange={e=>setField('color.secondary',e.target.value)}/><input className="ai-news-amp-input" style={{flex:1}} value={form['color.secondary']} onChange={e=>setField('color.secondary',e.target.value)}/></div></div>
                    <div className="ai-news-amp-form-section"><CheckCircle size={13}/> Flags</div>
                    {[{k:'isActive',l:'Active',d:'Category visible in nav'},{k:'isFeatured',l:'Featured',d:'Show on homepage'},{k:'isPopular',l:'Popular',d:'Mark as popular'}].map(({k,l,d})=>(
                      <div key={k} className="ai-news-amp-toggle-row ai-news-amp-form-full">
                        <div className="ai-news-amp-toggle-info"><div className="ai-news-amp-toggle-name">{l}</div><div className="ai-news-amp-toggle-desc">{d}</div></div>
                        <label className="ai-news-amp-switch"><input type="checkbox" className="ai-news-amp-switch-inp" checked={!!form[k]} onChange={e=>setField(k,e.target.checked)}/><span className="ai-news-amp-switch-track"/></label>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'display' && (
                  <div className="ai-news-amp-form-grid">
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">Page Layout</label><select className="ai-news-amp-sel" value={form['displaySettings.layout']} onChange={e=>setField('displaySettings.layout',e.target.value)}>{LAYOUTS.map(l=><option key={l} value={l}>{l}</option>)}</select></div>
                    <div className="ai-news-amp-field"><label className="ai-news-amp-label">Articles Per Page</label><input type="number" className="ai-news-amp-input" value={form['displaySettings.articlesPerPage']} onChange={e=>setField('displaySettings.articlesPerPage',e.target.value)}/></div>
                    {[{k:'displaySettings.showSubcategories',l:'Show Subcategories',d:''},{k:'displaySettings.showFeaturedFirst',l:'Featured Articles First',d:''},{k:'displaySettings.allowSorting',l:'Allow Sorting',d:''}].map(({k,l,d})=>(
                      <div key={k} className="ai-news-amp-toggle-row ai-news-amp-form-full">
                        <div className="ai-news-amp-toggle-info"><div className="ai-news-amp-toggle-name">{l}</div></div>
                        <label className="ai-news-amp-switch"><input type="checkbox" className="ai-news-amp-switch-inp" checked={!!form[k]} onChange={e=>setField(k,e.target.checked)}/><span className="ai-news-amp-switch-track"/></label>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'sub' && (
                  <div className="ai-news-amp-form-grid">
                    <div className="ai-news-amp-toggle-row ai-news-amp-form-full">
                      <div className="ai-news-amp-toggle-info"><div className="ai-news-amp-toggle-name">Subscribable</div><div className="ai-news-amp-toggle-desc">Allow readers to subscribe to this category</div></div>
                      <label className="ai-news-amp-switch"><input type="checkbox" className="ai-news-amp-switch-inp" checked={!!form['subscription.isSubscribable']} onChange={e=>setField('subscription.isSubscribable',e.target.checked)}/><span className="ai-news-amp-switch-track"/></label>
                    </div>
                    <div className="ai-news-amp-field ai-news-amp-form-full"><label className="ai-news-amp-label">Notification Frequency</label><select className="ai-news-amp-sel" value={form['subscription.notificationFrequency']} onChange={e=>setField('subscription.notificationFrequency',e.target.value)}>{NOTIF_FREQ.map(f=><option key={f} value={f}>{f}</option>)}</select></div>
                  </div>
                )}

                {activeTab === 'seo' && (
                  <div className="ai-news-amp-form-grid">
                    <div className="ai-news-amp-field ai-news-amp-form-full"><label className="ai-news-amp-label">Meta Title</label><input className="ai-news-amp-input" placeholder="SEO title" value={form['seo.metaTitle']} onChange={e=>setField('seo.metaTitle',e.target.value)}/></div>
                    <div className="ai-news-amp-field ai-news-amp-form-full"><label className="ai-news-amp-label">Meta Description</label><textarea className="ai-news-amp-textarea" placeholder="SEO description…" value={form['seo.metaDescription']} onChange={e=>setField('seo.metaDescription',e.target.value)}/></div>
                    <div className="ai-news-amp-field ai-news-amp-form-full"><label className="ai-news-amp-label">Canonical URL</label><input className="ai-news-amp-input" placeholder="https://…" value={form['seo.canonicalUrl']} onChange={e=>setField('seo.canonicalUrl',e.target.value)}/></div>
                  </div>
                )}

                {activeTab === 'mod' && (
                  <div className="ai-news-amp-form-grid">
                    <div className="ai-news-amp-toggle-row ai-news-amp-form-full">
                      <div className="ai-news-amp-toggle-info"><div className="ai-news-amp-toggle-name">Requires Approval</div><div className="ai-news-amp-toggle-desc">Articles need manual approval before publishing</div></div>
                      <label className="ai-news-amp-switch"><input type="checkbox" className="ai-news-amp-switch-inp" checked={!!form['moderation.requiresApproval']} onChange={e=>setField('moderation.requiresApproval',e.target.checked)}/><span className="ai-news-amp-switch-track"/></label>
                    </div>
                    <div className="ai-news-amp-toggle-row ai-news-amp-form-full">
                      <div className="ai-news-amp-toggle-info"><div className="ai-news-amp-toggle-name">Public</div><div className="ai-news-amp-toggle-desc">Visible to all visitors</div></div>
                      <label className="ai-news-amp-switch"><input type="checkbox" className="ai-news-amp-switch-inp" checked={!!form['visibility.public']} onChange={e=>setField('visibility.public',e.target.checked)}/><span className="ai-news-amp-switch-track"/></label>
                    </div>
                    <div className="ai-news-amp-toggle-row ai-news-amp-form-full">
                      <div className="ai-news-amp-toggle-info"><div className="ai-news-amp-toggle-name">Require Auth</div><div className="ai-news-amp-toggle-desc">Only logged-in users can view</div></div>
                      <label className="ai-news-amp-switch"><input type="checkbox" className="ai-news-amp-switch-inp" checked={!!form['visibility.requireAuth']} onChange={e=>setField('visibility.requireAuth',e.target.checked)}/><span className="ai-news-amp-switch-track"/></label>
                    </div>
                  </div>
                )}
              </div>

              <div className="ai-news-amp-modal-footer">
                <button className="ai-news-amp-btn ai-news-amp-btn-ghost" onClick={closeModal}>Cancel</button>
                <button className="ai-news-amp-btn ai-news-amp-btn-primary" onClick={handleSave} disabled={saving}>
                  {saving?<><span className="ai-news-amp-loader" style={{width:16,height:16}}/>Saving…</>:modal==='add'?<><Plus size={15}/>Create</>:<><CheckCircle size={15}/>Update</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW MODAL */}
        {modal==='view' && selected && (
          <div className="ai-news-amp-modal-overlay" role="dialog" aria-modal="true" onClick={e=>e.target===e.currentTarget&&closeModal()}>
            <div className="ai-news-amp-modal ai-news-amp-modal-lg">
              <div className="ai-news-amp-modal-header">
                <div className="ai-news-amp-modal-title">
                  <div className="ai-news-amp-avatar" style={{background:selected.color?.primary,width:28,height:28,fontSize:'0.72rem'}}>{selected.name?.charAt(0)}</div>
                  {selected.name}
                </div>
                <button className="ai-news-amp-modal-close" onClick={closeModal}><X size={18}/></button>
              </div>
              <div className="ai-news-amp-modal-body">
                <div className="ai-news-amp-tags-wrap" style={{marginBottom:'1rem'}}>
                  <span className={`ai-news-amp-badge ai-news-amp-badge-${statusColor(selected.status)}`}>{selected.status}</span>
                  <span className="ai-news-amp-badge ai-news-amp-badge-cyan">{selected.aiCategoryType}</span>
                  {selected.isFeatured && <span className="ai-news-amp-badge ai-news-amp-badge-gold"><Star size={11}/> Featured</span>}
                  {selected.isPopular && <span className="ai-news-amp-badge ai-news-amp-badge-orange"><TrendingUp size={11}/> Popular</span>}
                </div>
                {selected.description && <p style={{marginBottom:'1rem',color:'var(--amp-text-2)',fontSize:'0.9rem',lineHeight:1.6}}>{selected.description}</p>}
                <div className="ai-news-amp-glow-sep"/>
                <div className="ai-news-amp-metric-grid" style={{marginBottom:'1.25rem'}}>
                  {[{lbl:'Total Articles',val:fmt(selected.stats?.totalArticles)},{lbl:'Published',val:fmt(selected.stats?.publishedArticles)},{lbl:'Total Views',val:fmt(selected.stats?.totalViews)},{lbl:'Subscribers',val:fmt(selected.stats?.subscriberCount)}].map(({lbl,val})=>(
                    <div key={lbl} className="ai-news-amp-metric-card"><div className="ai-news-amp-metric-lbl">{lbl}</div><div className="ai-news-amp-metric-val">{val}</div></div>
                  ))}
                </div>
                <div className="ai-news-amp-detail-grid">
                  <div className="ai-news-amp-detail-item"><div className="ai-news-amp-detail-key">Slug</div><div className="ai-news-amp-code-val">/{selected.slug}</div></div>
                  <div className="ai-news-amp-detail-item"><div className="ai-news-amp-detail-key">Level</div><div className="ai-news-amp-detail-val">{selected.level||0}</div></div>
                  <div className="ai-news-amp-detail-item"><div className="ai-news-amp-detail-key">Layout</div><div className="ai-news-amp-detail-val">{selected.displaySettings?.layout}</div></div>
                  <div className="ai-news-amp-detail-item"><div className="ai-news-amp-detail-key">Display Order</div><div className="ai-news-amp-detail-val">{selected.displayOrder}</div></div>
                  <div className="ai-news-amp-detail-item"><div className="ai-news-amp-detail-key">Created</div><div className="ai-news-amp-detail-val">{selected.createdAt?new Date(selected.createdAt).toLocaleDateString():'—'}</div></div>
                </div>
              </div>
              <div className="ai-news-amp-modal-footer">
                <button className="ai-news-amp-btn ai-news-amp-btn-ghost" onClick={closeModal}>Close</button>
                <button className="ai-news-amp-btn ai-news-amp-btn-outline" onClick={()=>openEdit(selected)}><Edit2 size={14}/> Edit</button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}