// src/pages/StartupPage.tsx
import React, { JSX, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ExternalLink, BarChart2, FileText, Globe, TrendingUp,
  Users, Flame, Pencil, Trash2, Plus, X, ArrowDownRight,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import './StartupPage.css';

const API             = 'http://localhost:8080/api/startups';
const METRICS_API     = 'http://localhost:8080/api/startup-metrics';
const USERS_API       = 'http://localhost:8080/api/users';
const OFFERS_API      = 'http://localhost:8080/api/offers';
const INVESTMENTS_API = 'http://localhost:8080/api/investments';

/* ── Types ── */
type MetricsSnapshot = { mrr?: number|null; users?: number|null; valuationPreMoney?: number|null; valuationPostMoney?: number|null; };
type MetricRecord    = { _id?: string; startupId?: string; date?: string|number|Date; mrr?: number|null; activeUsers?: number|null; burnRate?: number|null; valuationPreMoney?: number|null; valuationPostMoney?: number|null; other?: Record<string,any>|null; };
type Startup         = { id?: string; _id?: string; name?: string; slug?: string; founderId?: string; stage?: string; industry?: string; shortPitch?: string; description?: string; website?: string; logoUrl?: string; metricsSnapshot?: MetricsSnapshot; attachments?: string[]|Array<{url?:string;name?:string}>; createdAt?: string|number|Date; updatedAt?: string|number|Date; visibility?: string; valuationMode?: 'pre'|'post'; };
type User            = { id?: string; _id?: string; name?: string; username?: string; avatarUrl?: string; role?: string; };
type Offer           = { id?: string; _id?: string; startupId?: string; investorId?: string; title?: string; amount?: number; equityPercent?: number; type?: string; visibility?: string; status?: string; createdAt?: string|number|Date; note?: string; };
type Investment      = { id?: string; _id?: string; startupId?: string; investorId?: string; amount?: number; currency?: string; equityPercent?: number; valuationPostMoney?: number; status?: string; createdAt?: string|number|Date; note?: string; };
type ExitRequest     = { id?: string; _id?: string; investmentId?: string; investorId?: string; price?: number; status?: 'PENDING'|'ACCEPTED'|'REJECTED'; paymentStatus?: 'PENDING'|'PAID'; createdAt?: string|number|Date; };

/* ── Helpers ── */
const fmt = (n?: number|null) => {
  if (n == null) return '—';
  if (n >= 1_000_000) return `$${(n/1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${(n/1_000).toFixed(0)}K`;
  return `$${n}`;
};
const fmtDate      = (iso?: string|number|Date) => { if (!iso) return '—'; try { return new Date(iso).toLocaleString('ru-RU'); } catch { return String(iso); } };
const fmtDateShort = (iso?: string|number|Date|null) => { if (!iso) return '—'; try { return new Date(iso).toLocaleDateString('ru-RU', {day:'2-digit',month:'short',year:'numeric'}); } catch { return String(iso); } };

/* ── Sparkline ── */
function Sparkline({ data, width=150, height=38, color='var(--accent)' }: { data:(number|null|undefined)[]; width?:number; height?:number; color?:string }) {
  const vals  = data.map(v => v == null ? null : Number(v));
  const valid = vals.filter(v => v != null) as number[];
  if (!valid.length) return <span style={{fontSize:'0.62rem',color:'var(--text-muted)'}}>нет данных</span>;
  const pad=3, w=Math.max(40,width), h=Math.max(20,height);
  const min=Math.min(...valid), max=Math.max(...valid), range=max===min?1:max-min;
  const stepX=(w-pad*2)/Math.max(1,vals.length-1);
  const pts:[number,number][]=vals.map((v,i)=>[pad+i*stepX, v==null?h-pad:pad+(1-(v-min)/range)*(h-pad*2)]);
  const pathD=pts.map((p,i)=>`${i===0?'M':'L'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const lastIdx=[...vals].reverse().findIndex(v=>v!=null);
  const last=pts[lastIdx===-1?0:vals.length-1-lastIdx];
  const gradId=`g${color.replace(/[^a-z]/gi,'')}`;
  return (
    <svg width={w} height={h} style={{overflow:'visible'}}>
      <defs>
        <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${pathD} L ${w-pad} ${h-pad} L ${pad} ${h-pad} Z`} fill={`url(#${gradId})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
      {last && <circle cx={last[0]} cy={last[1]} r={2.8} fill={color} />}
    </svg>
  );
}

/* ── Logo ── */
function Logo({ name, url }: { name?:string; url?:string }) {
  if (url) return <div className="sp-logo"><img src={url} alt={name} /></div>;
  const ini=(name||'').split(' ').map(p=>p[0]).slice(0,2).join('').toUpperCase();
  return <div className="sp-logo">{ini||'S'}</div>;
}

/* ── Founder chip ── */
function FounderChip({ user, onClick }: { user: User; onClick: () => void }) {
  return (
    <button className="sp-founder-btn" onClick={onClick}>
      {user.avatarUrl
        ? <img src={user.avatarUrl} alt={user.name} className="sp-founder-avatar" />
        : <div className="sp-founder-initials">{(user.name||user.username||'').split(' ').map(p=>p[0]).slice(0,2).join('').toUpperCase()||'U'}</div>}
      {user.name ?? user.username}
    </button>
  );
}

/* ════════════════════════════════════════════════════════════
   COMPONENT
   ════════════════════════════════════════════════════════════ */
export default function StartupPage(): JSX.Element {
  const { slug }        = useParams<{slug:string}>();
  const navigate        = useNavigate();
  const { user, token } = useAuth();

  const [investors, setInvestors] = useState<Record<string,User>>({});
  const [startup,   setStartup]   = useState<Startup|null>(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string|null>(null);
  const [deleting,  setDeleting]  = useState(false);

  const [metrics,        setMetrics]        = useState<MetricRecord[]|null>(null);
  const [metricsLoading, setMetricsLoading] = useState(false);

  const [founder,        setFounder]        = useState<User|null>(null);
  const [founderLoading, setFounderLoading] = useState(false);
  const [founderError,   setFounderError]   = useState<string|null>(null);

  const [offers,        setOffers]        = useState<Offer[]|null>(null);
  const [offersLoading, setOffersLoading] = useState(false);
  const [offersError,   setOffersError]   = useState<string|null>(null);

  const [investments,  setInvestments] = useState<Investment[]|null>(null);
  const [exitRequests, setExitRequests] = useState<ExitRequest[]|null>(null);
  const [exitLoading,  setExitLoading]  = useState(false);
  const [exitError,    setExitError]    = useState<string|null>(null);

  const [makingOffer,     setMakingOffer]     = useState(false);
  const [offerTitle,      setOfferTitle]      = useState('');
  const [offerAmount,     setOfferAmount]     = useState<number|''>('');
  const [offerVisibility, setOfferVisibility] = useState<'private'|'public'>('private');
  const [offerSubmitting, setOfferSubmitting] = useState(false);

  const [founderPhone, setFounderPhone] = useState<string|null>(null);
const [showPhone, setShowPhone] = useState(false);
const [phoneLoading, setPhoneLoading] = useState(false);

const maskPhone = (p?: string|null) => {
  if (!p) return '—';
  // заменяем все символы кроме последних 4 на звёздочки
  return p.replace(/.(?=.{4})/g, '*');
};
  const loadFounderPhone = async (force = false) => {
  const id = founder?.id ?? startup?.founderId;
  if (!id) return;
  // если уже есть телефон и не принудительно — просто показать
  if (founderPhone && !force) { setShowPhone(true); return; }

  if (!token) {
    // нет токена — можно перенаправить на логин или показать уведомление
    // тут просто alert + возврат
    alert('Войдите в аккаунт, чтобы увидеть номер телефона');
    return;
  }

  setPhoneLoading(true);
  try {
    const res = await fetch(`${USERS_API}/${encodeURIComponent(String(id))}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      // попытка прочитать тело ошибки, но не критично
      const t = await res.text().catch(()=>null);
      throw new Error(t || `Ошибка ${res.status}`);
    }
    const data = await res.json();
    const phone = data?.meta?.phone ?? null;
    setFounderPhone(phone);
    setShowPhone(true);
  } catch (e:any) {
    alert('Не удалось получить телефон: ' + (e.message ?? e));
  } finally {
    setPhoneLoading(false);
  }
};
  const loadInvestor = async (id: string) => {
    if (investors[id]) return;
    try {
      const res = await fetch(`${USERS_API}/${encodeURIComponent(id)}`, { headers: token?{Authorization:`Bearer ${token}`}:undefined });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setInvestors(prev => ({ ...prev, [id]: data }));
    } catch {}
  };

  const loadExitRequests = async () => {
    if (!startup) return;
    const id = idForApi(); if (!id) return;
    setExitLoading(true); setExitError(null);
    try {
      const res = await fetch(`http://localhost:8080/api/exit-requests?startupId=${encodeURIComponent(String(id))}`, {
        headers: token?{Authorization:`Bearer ${token}`}:undefined,
      });
      if (!res.ok) { const t=await res.text(); throw new Error(`Ошибка ${res.status}: ${t}`); }
      const data = await res.json();
      setExitRequests(Array.isArray(data)?data:(data?.data??[]));
    } catch(e:any) { setExitError(e.message); }
    finally { setExitLoading(false); }
  };

  /* Fetch startup */
  useEffect(() => {
    if (!slug) return; let ok=true;
    (async () => {
      setLoading(true); setError(null);
      try {
        const res = await fetch(`${API}/${encodeURIComponent(slug)}`, {credentials:'include'});
        if (res.status===404) throw new Error('Стартап не найден');
        if (!res.ok) { const j=await res.json().catch(()=>({})); throw new Error(j.error??j.message??`Ошибка ${res.status}`); }
        if (ok) setStartup(await res.json());
      } catch(e:any) { if(ok) setError(e.message); }
      finally { if(ok) setLoading(false); }
    })();
    return ()=>{ok=false;};
  }, [slug]);

  /* Fetch metrics */
  useEffect(() => {
    if (!startup) return;
    const id=startup.id??startup._id??startup.slug; if(!id) return;
    let ok=true;
    (async () => {
      setMetricsLoading(true);
      try {
        const res=await fetch(`${METRICS_API}?startupId=${encodeURIComponent(String(id))}`,{credentials:'include'});
        if(!res.ok) throw new Error();
        const raw=await res.json();
        const arr=Array.isArray(raw)?raw:(raw?.data??[]);
        const norm=arr
          .map((m:any)=>({...m,date:m.date??m.timestamp??m.createdAt??null}))
          .filter((m:any)=>m.date!=null)
          .sort((a:any,b:any)=>new Date(String(a.date)).getTime()-new Date(String(b.date)).getTime());
        if(ok) setMetrics(norm);
      } catch {}
      finally { if(ok) setMetricsLoading(false); }
    })();
    return ()=>{ok=false;};
  }, [startup]);

  /* Fetch founder */
  useEffect(() => {
    if (!startup?.founderId) { setFounder(null); return; }
    let ok=true;
    (async () => {
      setFounderLoading(true); setFounderError(null);
      try {
        const res=await fetch(`${USERS_API}/${encodeURIComponent(String(startup.founderId))}`,{credentials:'include'});
        if(!res.ok) throw new Error('Автор не найден');
        if(ok) setFounder(await res.json());
      } catch(e:any) { if(ok) setFounderError(e.message); }
      finally { if(ok) setFounderLoading(false); }
    })();
    return ()=>{ok=false;};
  }, [startup?.founderId]);

  const idForApi = () => startup?.id??startup?._id??startup?.slug;

  const loadOffers = async () => {
    if(!startup) return; const id=idForApi(); if(!id) return;
    setOffersLoading(true); setOffersError(null);
    try {
      const res=await fetch(`${OFFERS_API}?startupId=${encodeURIComponent(String(id))}`,{headers:token?{Authorization:`Bearer ${token}`}:undefined});
      if(!res.ok) throw new Error(`Ошибка ${res.status}`);
      const d=await res.json(); setOffers(Array.isArray(d)?d:(d?.data??[]));
    } catch(e:any) { setOffersError(e.message); }
    finally { setOffersLoading(false); }
  };

  const loadInvestments = async () => {
    if(!startup) return; const id=idForApi(); if(!id) return;
    try {
      const res=await fetch(`${INVESTMENTS_API}/startup/${encodeURIComponent(String(id))}`,{headers:token?{Authorization:`Bearer ${token}`}:undefined});
      if(!res.ok) return;
      const d=await res.json(); setInvestments(Array.isArray(d)?d:(d?.data??[]));
    } catch {}
  };

  const acceptExit = async (id:string) => {
    try {
      const res=await fetch(`/api/exit-requests/${encodeURIComponent(id)}/accept`,{
        method:'PATCH', headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},
      });
      if(!res.ok) throw new Error(`Ошибка ${res.status}`);
      await loadExitRequests(); await loadInvestments();
    } catch(e:any) { alert('Не удалось принять: '+e.message); }
  };

  const rejectExit = async (id:string) => {
    try {
      const res=await fetch(`/api/exit-requests/${encodeURIComponent(id)}/reject`,{
        method:'PATCH', headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},
      });
      if(!res.ok) throw new Error(`Ошибка ${res.status}`);
      await loadExitRequests();
    } catch(e:any) { alert('Не удалось отклонить: '+e.message); }
  };

  useEffect(() => {
    if(!startup) return;
    loadOffers(); loadInvestments(); loadExitRequests();
  }, [startup]);

  useEffect(() => {
    if(!offers) return;
    offers.forEach(o => { if(o.investorId) loadInvestor(o.investorId); });
  }, [offers]);

  /* Derived */
  const lastMetric     = metrics&&metrics.length>0 ? metrics[metrics.length-1] : null;
  const displayedMrr   = lastMetric?.mrr        ?? startup?.metricsSnapshot?.mrr   ?? 0;
  const displayedUsers = lastMetric?.activeUsers ?? startup?.metricsSnapshot?.users ?? 0;
  const displayedBurn  = lastMetric?.burnRate    ?? null;
  const lastTs         = lastMetric?.date        ?? startup?.updatedAt ?? startup?.createdAt ?? null;

  const mrrSeries   = metrics?.map(m=>m.mrr==null?null:Number(m.mrr))??[];
  const usersSeries = metrics?.map(m=>m.activeUsers==null?null:Number(m.activeUsers))??[];
  const burnSeries  = metrics?.map(m=>m.burnRate==null?null:Number(m.burnRate))??[];

  const isFounder  = !!(user?.id && startup?.founderId && user.id===startup.founderId);
  const isInvestor = user?.role==='investor';

  const valuationMode = startup?.valuationMode ?? 'pre';
  const currentPre    = lastMetric ? (lastMetric.valuationPreMoney??0) : (startup?.metricsSnapshot?.valuationPreMoney??0);
  const currentPost   = lastMetric?.valuationPostMoney ?? startup?.metricsSnapshot?.valuationPostMoney ?? 0;

  const calcEquity = offerAmount && Number(offerAmount)>0
    ? valuationMode==='pre'
      ? (Number(offerAmount)/(currentPre+Number(offerAmount)))*100
      : currentPost>0 ? (Number(offerAmount)/currentPost)*100 : 0
    : 0;

  const handleDelete = async () => {
    if(!startup||!window.confirm('Удалить стартап? Это нельзя отменить.')) return;
    const id=idForApi(); if(!id) return;
    setDeleting(true);
    try {
      const res=await fetch(`${API}/${encodeURIComponent(String(id))}`,{method:'DELETE',credentials:'include'});
      if(res.ok||res.status===204){navigate('/startups');return;}
      throw new Error(`Ошибка ${res.status}`);
    } catch(e:any) { alert('Не удалось удалить: '+e.message); }
    finally { setDeleting(false); }
  };

  const submitOffer = async (e?:React.FormEvent) => {
    e?.preventDefault();
    if(!startup||!user){alert('Нужна авторизация');return;}
    setOfferSubmitting(true);
    try {
      const res=await fetch(OFFERS_API,{
        method:'POST',
        headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},
        body:JSON.stringify({startupId:idForApi(),investorId:user.id,title:offerTitle,amount:Number(offerAmount),equityPercent:Number(calcEquity.toFixed(4)),type:'term-sheet',visibility:offerVisibility,status:'sent',attachments:[]}),
      });
      if(!res.ok){const j=await res.json().catch(()=>({}));throw new Error(j.message??`Ошибка ${res.status}`);}
      await loadOffers(); setMakingOffer(false); setOfferTitle(''); setOfferAmount('');
    } catch(e:any) { alert('Не удалось создать оффер: '+e.message); }
    finally { setOfferSubmitting(false); }
  };

  const updateOfferStatus = async (offerId:string, status:string) => {
    try {
      const res=await fetch(`${OFFERS_API}/${encodeURIComponent(offerId)}/status`,{
        method:'PATCH',
        headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},
        body:JSON.stringify({status}),
      });
      if(!res.ok) throw new Error(`Ошибка ${res.status}`);
      await loadOffers(); await loadInvestments();
    } catch(e:any) { alert('Не удалось обновить статус: '+e.message); }
  };

  /* ── Render ── */
  if (loading)  return <div className="sp-root"><div className="sp-state">Загрузка стартапа…</div></div>;
  if (error)    return <div className="sp-root"><div className="sp-state error">{error}</div></div>;
  if (!startup) return <div className="sp-root"><div className="sp-state notfound">Стартап не найден</div></div>;

  const attachments = Array.isArray(startup.attachments) ? startup.attachments : [];

  return (
    <div className="sp-root">
      <div className="sp-page">

        {/* ════ HERO — left sticky column ════ */}
        <div className="sp-hero">
          <div className="sp-hero-bg" />
          <div className="sp-hero-inner">

            {/* Logo + name + pitch + tags */}
            <div className="sp-hero-logo-block">
              <Logo name={startup.name} url={startup.logoUrl} />
              <div>
                <h1 className="sp-hero-name">{startup.name}</h1>
                {startup.shortPitch && <p className="sp-hero-pitch" style={{marginTop:8}}>{startup.shortPitch}</p>}
              </div>
              <div className="sp-hero-tags">
                {startup.stage      && <span className="sp-tag sp-tag-stage">{startup.stage}</span>}
                {startup.industry   && <span className="sp-tag sp-tag-industry">{startup.industry}</span>}
                {startup.visibility && <span className="sp-tag sp-tag-visibility">{startup.visibility}</span>}
              </div>
            </div>

            {/* Key numbers */}
            <div className="sp-hero-stats">
              <div className="sp-stat-row">
                <div className="sp-stat-label"><TrendingUp size={10}/>MRR</div>
                <div className="sp-stat-value accent">{fmt(displayedMrr as any)}</div>
              </div>
              <div className="sp-stat-row">
                <div className="sp-stat-label"><Users size={10}/>Пользователи</div>
                <div className="sp-stat-value accent-2">{displayedUsers!=null?Number(displayedUsers).toLocaleString():'—'}</div>
              </div>
              <div className="sp-stat-row">
                <div className="sp-stat-label"><Flame size={10}/>Burn Rate</div>
                <div className="sp-stat-value warn">{displayedBurn!=null?fmt(displayedBurn):'—'}</div>
              </div>
              <div className="sp-stat-row">
                <div className="sp-stat-label">Pre-Money</div>
                <div className="sp-stat-value accent-3">{fmt(lastMetric?lastMetric.valuationPreMoney:startup?.metricsSnapshot?.valuationPreMoney)}</div>
              </div>
              <div className="sp-stat-row">
                <div className="sp-stat-label">Post-Money</div>
                <div className="sp-stat-value accent-3">{fmt(lastMetric?.valuationPostMoney??startup?.metricsSnapshot?.valuationPostMoney)}</div>
              </div>
              <div className="sp-stat-row">
                <div className="sp-stat-label"><FileText size={10}/>Файлы</div>
                <div className="sp-stat-value">{attachments.length}</div>
              </div>
            </div>

            {/* Founder */ }
{startup.founderId && !founderLoading && !founderError && founder && (
  <div className="sp-hero-people">
    <div className="sp-people-label">Основатель</div>
    <FounderChip user={founder} onClick={()=>navigate(`/users/${encodeURIComponent(String(founder.id??founder._id??startup.founderId))}`)} />

    {/* phone row */}
    <div className="sp-founder-phone" style={{marginTop:8, display:'flex', gap:8, alignItems:'center'}}>
      <div style={{fontSize:12, color:'var(--text-muted)'}}>Телефон</div>

      <div style={{fontWeight:600, fontSize:15}}>
        { showPhone
            ? (phoneLoading ? 'Загрузка…' : (founderPhone ?? 'Не указан'))
            : ( (founder as any)?.meta?.phone ? maskPhone((founder as any).meta.phone) : '—' )
        }
      </div>

      <div style={{marginLeft:'auto'}}>
        <button
          className="sp-btn sp-btn-ghost" style={{fontSize:13}}
          onClick={() => {
            if (showPhone) { setShowPhone(false); return; }
            // если уже в объекте founder есть телефон — просто показываем без запроса
            if ((founder as any)?.meta?.phone) {
              setFounderPhone((founder as any).meta.phone);
              setShowPhone(true);
              return;
            }
            // иначе запросим телефон с авторизацией
            loadFounderPhone();
          }}
        >
          {showPhone ? 'Скрыть' : 'Показать'}
        </button>
      </div>
    </div>
  </div>
)}

            {/* Website */}
            {startup.website && (() => { try { return (
              <div className="sp-hero-meta">
                <a href={startup.website} target="_blank" rel="noreferrer" className="sp-meta-link">
                  <Globe size={13}/>{new URL(String(startup.website)).hostname}
                </a>
              </div>
            ); } catch { return null; } })()}

            {/* Dates */}
            <div className="sp-hero-dates">
              <div className="sp-date-block">
                <div className="sp-date-label">Создано</div>
                <div className="sp-date-value">{fmtDateShort(startup.createdAt)}</div>
              </div>
              <div className="sp-date-block">
                <div className="sp-date-label">Обновлено</div>
                <div className="sp-date-value">{fmtDateShort(startup.updatedAt)}</div>
              </div>
            </div>

            {/* Founder actions */}
            {isFounder && (
              <div className="sp-hero-actions">
                {startup.website && (
                  <a href={startup.website} target="_blank" rel="noreferrer" className="sp-btn sp-btn-primary sp-btn-full">
                    <ExternalLink size={13}/> Официальный сайт
                  </a>
                )}
                <button className="sp-btn sp-btn-ghost sp-btn-full" onClick={()=>{ const id=idForApi(); if(!id){alert('ID не найден');return;} navigate(`/startups/edit/${id}`); }}>
                  <Pencil size={13}/> Редактировать
                </button>
                <button className="sp-btn sp-btn-danger sp-btn-full" onClick={handleDelete} disabled={deleting}>
                  <Trash2 size={13}/> {deleting?'Удаление…':'Удалить'}
                </button>
              </div>
            )}

          </div>
        </div>{/* end hero */}

        {/* ════ RIGHT PANEL — single card ════ */}
        <div className="sp-panel">

          {/* Description */}
          <div className="sp-section">
            <div className="sp-section-head">
              <div className="sp-section-label"><FileText size={10}/>Описание</div>
            </div>
            <p className="sp-desc-text">{startup.description||'Описание не добавлено.'}</p>
          </div>

          {/* KPI charts */}
          <div className="sp-section">
            <div className="sp-section-head">
              <div className="sp-section-label"><BarChart2 size={10}/>Метрики</div>
              <span className="sp-section-count">{fmtDateShort(lastTs)}</span>
            </div>
            <div className="sp-kpi-row">
              <div className="sp-kpi-card sp-kpi-mrr">
                <div className="sp-kpi-inner">
                  <div>
                    <div className="sp-kpi-label"><TrendingUp size={9}/>MRR</div>
                    <div className="sp-kpi-value">{fmt(displayedMrr as any)}</div>
                  </div>
                  <div className="sp-kpi-chart">
                    {metricsLoading ? <span className="sp-empty">…</span> : <Sparkline data={mrrSeries} color="var(--accent)" />}
                  </div>
                </div>
              </div>
              <div className="sp-kpi-card sp-kpi-users">
                <div className="sp-kpi-inner">
                  <div>
                    <div className="sp-kpi-label"><Users size={9}/>Users</div>
                    <div className="sp-kpi-value">{displayedUsers!=null?Number(displayedUsers).toLocaleString():'—'}</div>
                  </div>
                  <div className="sp-kpi-chart">
                    {metricsLoading ? <span className="sp-empty">…</span> : <Sparkline data={usersSeries} color="var(--accent-2)" />}
                  </div>
                </div>
              </div>
              <div className="sp-kpi-card sp-kpi-burn">
                <div className="sp-kpi-inner">
                  <div>
                    <div className="sp-kpi-label"><Flame size={9}/>Burn Rate</div>
                    <div className="sp-kpi-value">{displayedBurn!=null?fmt(displayedBurn):'—'}</div>
                  </div>
                  <div className="sp-kpi-chart">
                    {metricsLoading ? <span className="sp-empty">…</span> : <Sparkline data={burnSeries} color="var(--accent-warn)" />}
                  </div>
                </div>
              </div>
            </div>

            {/* Valuation below KPI */}
            <div className="sp-val-row" style={{marginTop:10}}>
              <div className="sp-val-half">
                <div className="sp-val-mode-chip">PRE</div>
                <div className="sp-val-label">Pre-Money Valuation</div>
                <div className="sp-val-number">{fmt(lastMetric?lastMetric.valuationPreMoney:startup?.metricsSnapshot?.valuationPreMoney)}</div>
              </div>
              <div className="sp-val-half">
                <div className="sp-val-mode-chip" style={{background:'rgba(52,211,153,0.08)',borderColor:'rgba(52,211,153,0.2)',color:'var(--accent-3)'}}>POST</div>
                <div className="sp-val-label">Post-Money Valuation</div>
                <div className="sp-val-number" style={{color:'var(--accent-3)'}}>{fmt(lastMetric?.valuationPostMoney??startup?.metricsSnapshot?.valuationPostMoney)}</div>
              </div>
            </div>
          </div>

          {/* Metrics history table */}
          {metrics && metrics.length > 0 && (
            <div className="sp-section">
              <div className="sp-section-head">
                <div className="sp-section-label"><BarChart2 size={10}/>История метрик</div>
                <span className="sp-section-count">{metrics.length} записей</span>
              </div>
              <div className="sp-table-wrapper">
                <div className="sp-table-scroll">
                  <table className="sp-table">
                    <thead>
                      <tr><th>Дата</th><th>MRR</th><th>Active Users</th><th>Burn Rate</th><th>Pre-Money</th><th>Post-Money</th><th>Other</th></tr>
                    </thead>
                    <tbody>
                      {metrics.slice().reverse().map((m,i)=>(
                        <tr key={m._id??i}>
                          <td>{fmtDate(m.date)}</td>
                          <td>{fmt(m.mrr)}</td>
                          <td>{m.activeUsers?.toLocaleString()??'—'}</td>
                          <td>{fmt(m.burnRate)}</td>
                          <td>{fmt(m.valuationPreMoney)}</td>
                          <td>{fmt(m.valuationPostMoney)}</td>
                          <td>{m.other?JSON.stringify(m.other):'—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Files */}
          {attachments.length > 0 && (
            <div className="sp-section">
              <div className="sp-section-head">
                <div className="sp-section-label"><FileText size={10}/>Файлы</div>
                <span className="sp-section-count">{attachments.length}</span>
              </div>
              <div className="sp-files-grid">
                {attachments.map((a:any,i:number)=>{
                  const href=String(a?.url??a);
                  const name=(a?.name as string)??href.split('/').pop()??`file-${i+1}`;
                  return (
                    <div key={i} className="sp-file-item">
                      <a href={href} target="_blank" rel="noreferrer" className="sp-file-link">
                        <FileText size={12}/><span className="sp-file-name">{name}</span>
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Offers */}
          <div className="sp-section">
            <div className="sp-section-head">
              <div className="sp-section-label">Офферы</div>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span className="sp-section-count">{offers?.length ?? 0}</span>
                {isInvestor && (
                  <button className={`sp-btn ${makingOffer?'sp-btn-ghost':'sp-btn-offer'}`} onClick={()=>setMakingOffer(v=>!v)}>
                    {makingOffer ? <><X size={12}/>Отмена</> : <><Plus size={12}/>Сделать оффер</>}
                  </button>
                )}
              </div>
            </div>

            {makingOffer && isInvestor && (
              <form onSubmit={submitOffer} className="sp-offer-form">
                <input className="sp-input" placeholder="Заголовок оффера" value={offerTitle} onChange={e=>setOfferTitle(e.target.value)} required />
                <div className="sp-form-row">
                  <input className="sp-input" type="number" placeholder="Сумма (USD)" value={offerAmount} onChange={e=>setOfferAmount(e.target.value===''?'':Number(e.target.value))} required />
                  <div className="sp-equity-chip">{offerAmount?`≈ ${calcEquity.toFixed(2)}%`:'—'}</div>
                </div>
                <div className="sp-form-footer">
                  <span className="sp-form-label">Видимость:</span>
                  <select className="sp-select" value={offerVisibility} onChange={e=>setOfferVisibility(e.target.value as any)}>
                    <option value="private">private</option>
                    <option value="public">public</option>
                  </select>
                  <button type="submit" className="sp-btn sp-btn-primary sp-btn-submit" disabled={offerSubmitting}>
                    {offerSubmitting?'Отправка…':'Отправить'}
                  </button>
                </div>
              </form>
            )}

            {offersLoading ? <p className="sp-empty">Загрузка…</p>
            : offersError  ? <p className="sp-err">{offersError}</p>
            : !offers||offers.length===0 ? <p className="sp-empty">Офферов пока нет</p>
            : (
              <div className="sp-offers-list">
                {offers.map(o => {
                  const investor=o.investorId?investors[o.investorId]:null;
                  return (
                    <div key={o._id??o.id} className="sp-offer-item">
                      <div className="sp-offer-body">
                        <div className="sp-offer-main">
                          <div className="sp-offer-type">{o.type} · {o.visibility}</div>
                          <div className="sp-offer-title">{o.title}</div>
                          <div className="sp-offer-details">{o.amount?`$${o.amount.toLocaleString()}`:'—'} · {o.equityPercent??'—'}%</div>
                          {o.note && <div className="sp-offer-note">{o.note}</div>}
                          {investor && <FounderChip user={investor} onClick={()=>navigate(`/users/${encodeURIComponent(String(investor.id??investor._id))}`)} />}
                        </div>
                        <div className="sp-offer-meta">
                          <div className="sp-offer-date">{fmtDateShort(o.createdAt)}</div>
                          <span className={`sp-badge ${o.status??''}`}>{o.status}</span>
                        </div>
                      </div>
                      {isFounder && o.status!=='accepted' && o.status!=='rejected' && (
                        <div className="sp-offer-actions">
                          <button className="sp-btn sp-btn-accept" onClick={()=>updateOfferStatus(String(o._id??o.id),'accepted')}>Принять</button>
                          <button className="sp-btn sp-btn-reject" onClick={()=>updateOfferStatus(String(o._id??o.id),'rejected')}>Отклонить</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Investments */}
          {investments && investments.length > 0 && (
            <div className="sp-section">
              <div className="sp-section-head">
                <div className="sp-section-label"><TrendingUp size={10}/>Инвестиции</div>
                <span className="sp-section-count">{investments.length}</span>
              </div>
              <div className="sp-invest-list">
                {investments.map((inv,i)=>(
                  <div key={inv._id??inv.id??i} className="sp-invest-row">
                    <div className="sp-invest-amount">{fmt(inv.amount)}</div>
                    <div className="sp-invest-equity">{inv.equityPercent!=null?`${(inv.equityPercent*100).toFixed(2)}`:'—'}% equity</div>
                    <span className={`sp-badge ${(inv.status??'').toLowerCase()}`}>{inv.status}</span>
                    <div className="sp-invest-date">{fmtDateShort(inv.createdAt)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Exit requests (founder only) */}
          {isFounder && (
            <div className="sp-section">
              <div className="sp-section-head">
                <div className="sp-section-label"><ArrowDownRight size={10}/>Запросы на выход</div>
                {exitRequests && <span className="sp-section-count">{exitRequests.length}</span>}
              </div>
              {exitLoading ? <p className="sp-empty">Загрузка…</p>
              : exitError   ? <p className="sp-err">{exitError}</p>
              : !exitRequests||exitRequests.length===0 ? <p className="sp-empty">Нет запросов на выход</p>
              : (
                <div className="sp-exit-list">
                  {exitRequests.map(r=>(
                    <div key={r._id??r.id} className="sp-exit-row">
                      <div className="sp-exit-info">
                        <div className="sp-exit-id">Инвестиция: {r.investmentId}</div>
                        <div className="sp-exit-amount">{r.price?`$${r.price.toLocaleString()}`:'—'}</div>
                      </div>
                      <span className={`sp-badge ${r.status??''}`}>{r.status}</span>
                      {r.status==='PENDING' && (
                        <div className="sp-exit-actions">
                          <button className="sp-btn sp-btn-accept" onClick={()=>acceptExit(String(r._id??r.id))}>Принять</button>
                          <button className="sp-btn sp-btn-reject" onClick={()=>rejectExit(String(r._id??r.id))}>Отклонить</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>{/* end panel */}
      </div>{/* end sp-page */}
    </div>
  );
}