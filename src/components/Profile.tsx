// src/components/Profile.tsx
import React, { useEffect, useState } from 'react';
import {
  Mail, Phone, MapPin, Briefcase, Pencil, Check, X,
  Globe, TrendingUp, Layers, Shield, DollarSign,
  Activity, PieChart, ArrowUpRight, Clock, Zap, Target, BarChart2,
  Rocket, FileText, Users, ChevronDown, ChevronUp, ExternalLink,
  Flame, Eye, Tag
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import './Profile.css';

/* ─── Types ─────────────────────────────────────────────────────── */
type ApiUser = {
  id?: string; email?: string; name?: string; fullName?: string;
  company?: string; bio?: string; avatarUrl?: string;
  meta?: { phone?: string; location?: string };
  phone?: string; location?: string; role?: string;
};
type InvestorApi = {
  id?: string; userId?: string; legalName?: string; type?: string;
  minCheck?: number; maxCheck?: number; preferredIndustries?: string[];
  preferredStages?: string[]; description?: string; website?: string; isVerified?: boolean;
};
type Investment = {
  id?: string; startupId?: string; investorId?: string;
  amount?: number; currency?: string; equityPercent?: number;
  valuationPostMoney?: number; status?: string; note?: string;
  createdAt?: string; updatedAt?: string;
};
type MetricsSnapshot = {
  mrr?: number; activeUsers?: number; burnRate?: number;
  valuationPreMoney?: number; valuationPostMoney?: number;
};
type Startup = {
  id?: string; name?: string; slug?: string; founderId?: string;
  stage?: string; industry?: string; shortPitch?: string; description?: string;
  website?: string; logoUrl?: string; visibility?: string; valuationMode?: string;
  metricsSnapshot?: MetricsSnapshot; createdAt?: string; updatedAt?: string;
};
type Offer = {
  id?: string; title?: string; startupId?: string; investorId?: string;
  amount?: number; equityPercent?: number; type?: string; visibility?: string;
  status?: string; note?: string; createdAt?: string;
};

/* ─── Helpers ────────────────────────────────────────────────────── */
function InitialsAvatar({ name = '' }: { name?: string }) {
  const initials = name.trim().split(/\s+/).map(p => p[0] ?? '').slice(0, 2).join('').toUpperCase();
  return <div className="pf-initials">{initials || 'U'}</div>;
}

function fmt(n?: number | null) {
  if (n == null) return '—';
  if (n >= 1_000_000_000) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n}`;
}

function fmtDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
}

function fmtPct(n?: number | null) {
  if (n == null) return '—';
  return `${(n * 100).toFixed(2)}%`;
}

const PALETTE = ['#ff8c6b', '#60a5fa', '#c084fc', '#4ade80', '#fbbf24', '#f472b6'];

/* ─── Startup Card ──────────────────────────────────────────────── */
function StartupCard({ startup, offers, investments }: {
  startup: Startup; offers: Offer[]; investments: Investment[];
}) {
  const [expanded, setExpanded] = useState(false);
  const ms = startup.metricsSnapshot ?? {};
  const myOffers = offers.filter(o => o.startupId === startup.id);
  const myInvestments = investments.filter(i => i.startupId === startup.id);
  const totalRaised = myInvestments.reduce((s, i) => s + (i.amount ?? 0), 0);
  const stageCls = (startup.stage ?? 'idea').toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="pf-startup-card">
      <div className="pf-startup-header" onClick={() => setExpanded(e => !e)}>
        <div className="pf-startup-logo">
          {startup.logoUrl ? <img src={startup.logoUrl} alt={startup.name} /> : (startup.name ?? 'S')[0].toUpperCase()}
        </div>
        <div className="pf-startup-meta">
          <div className="pf-startup-name-row">
            <span className="pf-startup-name">{startup.name}</span>
            <span className={`pf-startup-stage ${stageCls}`}>{startup.stage ?? 'idea'}</span>
            {startup.industry && (
              <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                <Tag size={9} /> {startup.industry}
              </span>
            )}
            {startup.visibility && (
              <span className={`pf-visibility-badge ${startup.visibility}`}>
                <Eye size={8} /> {startup.visibility}
              </span>
            )}
          </div>
          {startup.shortPitch && <div className="pf-startup-pitch">{startup.shortPitch}</div>}
        </div>
        <div className="pf-startup-toggle">{expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}</div>
      </div>

      {/* Metrics strip */}
      <div className="pf-metrics-strip">
        <div className="pf-metric-cell">
          <div className="pf-metric-label orange"><Flame size={8} style={{display:'inline',marginRight:2}}/>MRR</div>
          <div className="pf-metric-val">{ms.mrr != null ? fmt(ms.mrr) : '—'}</div>
        </div>
        <div className="pf-metric-cell">
          <div className="pf-metric-label blue"><Users size={8} style={{display:'inline',marginRight:2}}/>Users</div>
          <div className="pf-metric-val">{ms.activeUsers != null ? ms.activeUsers.toLocaleString() : '—'}</div>
        </div>
        <div className="pf-metric-cell">
          <div className="pf-metric-label purple"><TrendingUp size={8} style={{display:'inline',marginRight:2}}/>Оценка</div>
          <div className="pf-metric-val">{fmt(ms.valuationPostMoney ?? ms.valuationPreMoney)}</div>
        </div>
        <div className="pf-metric-cell">
          <div className="pf-metric-label green"><DollarSign size={8} style={{display:'inline',marginRight:2}}/>Привлечено</div>
          <div className="pf-metric-val">{totalRaised > 0 ? fmt(totalRaised) : '—'}</div>
        </div>
        {ms.burnRate != null && (
          <div className="pf-metric-cell">
            <div className="pf-metric-label yellow">Burn/мес</div>
            <div className="pf-metric-val">{fmt(ms.burnRate)}</div>
          </div>
        )}
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="pf-startup-detail">
          {startup.description && (
            <div style={{ marginBottom: 14 }}>
              <div className="pf-sub-label"><FileText size={10} />Описание</div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65 }}>{startup.description}</p>
            </div>
          )}
          {startup.website && (
            <div style={{ marginBottom: 14 }}>
              <a href={startup.website} target="_blank" rel="noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--accent-2)', textDecoration: 'none' }}>
                <Globe size={12} /> {startup.website} <ExternalLink size={10} />
              </a>
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            {[
              { label: 'Pre-money',  val: fmt(ms.valuationPreMoney),  cls: 'purple' },
              { label: 'Post-money', val: fmt(ms.valuationPostMoney), cls: 'green' },
              { label: 'Режим',      val: (startup.valuationMode ?? '—').toUpperCase(), cls: 'orange' },
            ].map(c => (
              <div key={c.label} style={{ flex: 1, background: 'rgba(255,248,242,0.03)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px' }}>
                <div className={`pf-metric-label ${c.cls}`} style={{ marginBottom: 4 }}>{c.label}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 14, color: 'var(--text-primary)' }}>{c.val}</div>
              </div>
            ))}
          </div>
          {myInvestments.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div className="pf-sub-label"><DollarSign size={10} />Инвестиции ({myInvestments.length})</div>
              {myInvestments.map((inv, i) => (
                <div key={inv.id ?? i} className="pf-offer-row">
                  <div className={`pf-inv-dot ${inv.status ?? 'active'}`} />
                  <span className="pf-offer-title" style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                    #{(inv.investorId ?? '').slice(-8)}
                  </span>
                  <span className="pf-offer-amount">{fmt(inv.amount)}</span>
                  {inv.equityPercent != null && <span className="pf-offer-equity"><ArrowUpRight size={10} />{fmtPct(inv.equityPercent)}</span>}
                  <span className={`pf-offer-status ${inv.status ?? 'active'}`}>{inv.status ?? 'active'}</span>
                </div>
              ))}
            </div>
          )}
          {myOffers.length > 0 && (
            <div>
              <div className="pf-sub-label"><FileText size={10} />Офферы ({myOffers.length})</div>
              {myOffers.map((offer, i) => (
                <div key={offer.id ?? i} className="pf-offer-row">
                  <span className="pf-offer-title">{offer.title ?? `Оффер #${(offer.investorId ?? '').slice(-6)}`}</span>
                  <span className="pf-offer-amount">{fmt(offer.amount)}</span>
                  {offer.equityPercent != null && <span className="pf-offer-equity">{fmtPct(offer.equityPercent)}</span>}
                  <span className={`pf-offer-status ${offer.status ?? 'sent'}`}>{offer.status ?? 'sent'}</span>
                </div>
              ))}
            </div>
          )}
          {myOffers.length === 0 && myInvestments.length === 0 && (
            <div className="pf-empty" style={{ padding: '10px 0' }}>
              <div className="pf-empty-icon"><FileText size={14} /></div>
              Офферов и инвестиций пока нет
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────── */
export default function Profile() {
  const { user: authUser, token, loading: authLoading } = useAuth();
  const [user, setUser]         = useState<ApiUser | null>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [investor, setInvestor] = useState<InvestorApi | null>(null);
  const [editingInvestor, setEditingInvestor] = useState(false);
  const [investorSaving, setInvestorSaving]   = useState(false);
  const [investments, setInvestments]         = useState<Investment[]>([]);
  const [loadingInv, setLoadingInv]           = useState(false);
  const [startups, setStartups]               = useState<Startup[]>([]);
  const [loadingStartups, setLoadingStartups] = useState(false);
  const [founderOffers, setFounderOffers]     = useState<Offer[]>([]);
  const [founderInvestments, setFounderInvestments] = useState<Investment[]>([]);

  /* fetch user */
  useEffect(() => {
    if (authUser) {
      setUser({ id: authUser.id, email: authUser.email, name: authUser.fullName ?? authUser.email, company: authUser.company, bio: authUser.bio, avatarUrl: authUser.avatarUrl, phone: authUser.phone, location: authUser.location, role: authUser.role });
      return;
    }
    if (!authLoading && token) {
      const abort = new AbortController();
      (async () => {
        setLoading(true); setError(null);
        try {
          const res = await fetch('http://localhost:8080/api/users/me', { headers: { Authorization: `Bearer ${token}` }, signal: abort.signal });
          if (!res.ok) { const j = await res.json().catch(() => ({})); throw new Error(j.error ?? j.message ?? `Ошибка ${res.status}`); }
          const data: ApiUser = await res.json();
          setUser({ id: data.id, email: data.email, name: data.name ?? data.fullName ?? data.email, company: data.company, bio: data.bio, avatarUrl: data.avatarUrl, phone: data.meta?.phone ?? data.phone, location: data.meta?.location ?? data.location, role: data.role });
        } catch(e:any) { if (e.name !== 'AbortError') setError(e.message ?? 'Не удалось загрузить профиль'); }
        finally { setLoading(false); }
      })();
      return () => abort.abort();
    }
  }, [authUser, token, authLoading]);

  /* fetch investor profile */
  useEffect(() => {
    if (!user || user.role !== 'investor') return;
    const abort = new AbortController();
    (async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/investors/user/${user.id}`, { headers: { Authorization: `Bearer ${token}` }, signal: abort.signal });
        if (res.ok) setInvestor(await res.json());
      } catch(e:any) { if (e.name !== 'AbortError') console.error(e); }
    })();
    return () => abort.abort();
  }, [user, token]);

  /* fetch investments for investor */
  useEffect(() => {
    if (!user || user.role !== 'investor') return;
    const abort = new AbortController();
    setLoadingInv(true);
    (async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/investments/investor/${user.id}`, { headers: { Authorization: `Bearer ${token}` }, signal: abort.signal });
        if (res.ok) setInvestments(await res.json());
      } catch(e:any) { if (e.name !== 'AbortError') console.error(e); }
      finally { setLoadingInv(false); }
    })();
    return () => abort.abort();
  }, [user, token]);

  /* fetch startups + offers + investments for founder */
  useEffect(() => {
    if (!user || user.role !== 'founder') return;
    const abort = new AbortController();
    setLoadingStartups(true);
    (async () => {
      try {
        const res = await fetch('http://localhost:8080/api/startups', { headers: { Authorization: `Bearer ${token}` }, signal: abort.signal });
        if (res.ok) {
          const all: Startup[] = await res.json();
          const mine = all.filter(s => s.founderId === user.id);
          setStartups(mine);
          const offersAll: Offer[] = [], invAll: Investment[] = [];
          await Promise.all(mine.map(async s => {
            try {
              const [oR, iR] = await Promise.all([
                fetch(`http://localhost:8080/api/offers?startupId=${s.id}`, { headers: { Authorization: `Bearer ${token}` }, signal: abort.signal }),
                fetch(`http://localhost:8080/api/investments/startup/${s.id}`, { headers: { Authorization: `Bearer ${token}` }, signal: abort.signal }),
              ]);
              if (oR.ok) { const d = await oR.json(); offersAll.push(...d); }
              if (iR.ok) { const d = await iR.json(); invAll.push(...d); }
            } catch {}
          }));
          setFounderOffers(offersAll);
          setFounderInvestments(invAll);
        }
      } catch(e:any) { if (e.name !== 'AbortError') console.error(e); }
      finally { setLoadingStartups(false); }
    })();
    return () => abort.abort();
  }, [user, token]);

  async function saveInvestor(updated: InvestorApi) {
    if (!user) return;
    setInvestorSaving(true);
    try {
      const url = updated.id
        ? `http://localhost:8080/api/investors/${updated.id}`
        : `http://localhost:8080/api/investors/user/${user.id}`;
      const res = await fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(updated) });
      if (!res.ok) { const j = await res.json().catch(() => ({})); throw new Error(j.message ?? `Ошибка ${res.status}`); }
      setInvestor(await res.json()); setEditingInvestor(false);
    } catch(e:any) { alert('Ошибка: ' + e.message); }
    finally { setInvestorSaving(false); }
  }

  /* Derived */
  const isInvestor = user?.role === 'investor';
  const isFounder  = user?.role === 'founder';

  const totalDeployed = investments.reduce((s, i) => s + (i.amount ?? 0), 0);
  const activeDeals   = investments.filter(i => i.status === 'active').length;
  const avgEquity     = investments.length ? investments.reduce((s, i) => s + (i.equityPercent ?? 0), 0) / investments.length : null;
  const totalPortVal  = investments.reduce((s, i) => s + (i.valuationPostMoney ?? 0), 0);

  const founderTotalRaised   = founderInvestments.reduce((s, i) => s + (i.amount ?? 0), 0);
  const founderPendingOffers = founderOffers.filter(o => o.status === 'sent' || o.status === 'pending').length;
  const founderAcceptedOffers = founderOffers.filter(o => o.status === 'accepted').length;

  /* Portfolio bar */
  const segmented = investments.slice(0, 5).map((inv, idx) => ({
    id: inv.startupId ?? idx.toString(), amount: inv.amount ?? 0, color: PALETTE[idx % PALETTE.length],
  }));
  const segTotal = segmented.reduce((s, x) => s + x.amount, 0);

  /* ── States ── */
  if (authLoading || loading) return (
    <div className="pf-page"><div className="pf-state"><div className="pf-spinner" />Загрузка профиля…</div></div>
  );
  if (error) return (
    <div className="pf-page"><div className="pf-state" style={{ color: 'var(--accent)' }}>⚠ {error}</div></div>
  );
  if (!user) return (
    <div className="pf-page"><div className="pf-state">Профиль недоступен — пожалуйста, войдите.</div></div>
  );

  return (
    <div className="pf-page">
      <div className="pf-wrap">
        <div className="pf-layout">

          {/* ════ HERO — left sticky ════ */}
          <div className="pf-hero">
            <div className="pf-hero-bg" />
            <div className="pf-hero-inner">

              {/* Avatar + name block */}
              <div className="pf-hero-avatar-block">
                <div className="pf-avatar-ring">
                  {user.avatarUrl ? <img src={user.avatarUrl} alt={user.name} /> : <InitialsAvatar name={user.name} />}
                  {investor?.isVerified && (
                    <div className="pf-verified" title="Верифицирован"><Shield size={11} color="#051a0a" /></div>
                  )}
                </div>
                <div className="pf-hero-name-block">
                  <h1 className="pf-name">{user.name}</h1>
                  {user.role && (
                    <span className="pf-role-badge">
                      {user.role === 'investor' && <TrendingUp size={9} />}
                      {user.role === 'founder'  && <Rocket size={9} />}
                      {user.role}
                    </span>
                  )}
                  {user.company && <p className="pf-company"><Briefcase size={11} />{user.company}</p>}
                  {user.bio && <p className="pf-bio">"{user.bio}"</p>}
                </div>
              </div>

              {/* Key numbers */}
              <div className="pf-hero-stats-block">
                {isInvestor && (
                  <>
                    <div className="pf-hero-stat-row">
                      <div className="pf-hero-stat-label"><DollarSign size={10} />Вложено</div>
                      <div className="pf-hero-stat-val green">{fmt(totalDeployed)}</div>
                    </div>
                    <div className="pf-hero-stat-row">
                      <div className="pf-hero-stat-label"><Activity size={10} />Сделок</div>
                      <div className="pf-hero-stat-val">{investments.length}</div>
                    </div>
                    <div className="pf-hero-stat-row">
                      <div className="pf-hero-stat-label"><Zap size={10} />Активных</div>
                      <div className="pf-hero-stat-val orange">{activeDeals}</div>
                    </div>
                    {avgEquity != null && (
                      <div className="pf-hero-stat-row">
                        <div className="pf-hero-stat-label"><PieChart size={10} />Ср. доля</div>
                        <div className="pf-hero-stat-val blue">{fmtPct(avgEquity)}</div>
                      </div>
                    )}
                    {investor?.preferredIndustries?.length ? (
                      <div className="pf-hero-stat-row">
                        <div className="pf-hero-stat-label"><Layers size={10} />Отраслей</div>
                        <div className="pf-hero-stat-val">{investor.preferredIndustries.length}</div>
                      </div>
                    ) : null}
                  </>
                )}
                {isFounder && (
                  <>
                    <div className="pf-hero-stat-row">
                      <div className="pf-hero-stat-label"><Rocket size={10} />Стартапов</div>
                      <div className="pf-hero-stat-val">{startups.length}</div>
                    </div>
                    {founderTotalRaised > 0 && (
                      <div className="pf-hero-stat-row">
                        <div className="pf-hero-stat-label"><DollarSign size={10} />Привлечено</div>
                        <div className="pf-hero-stat-val green">{fmt(founderTotalRaised)}</div>
                      </div>
                    )}
                    <div className="pf-hero-stat-row">
                      <div className="pf-hero-stat-label"><FileText size={10} />Офферов</div>
                      <div className="pf-hero-stat-val">{founderOffers.length}</div>
                    </div>
                    {founderPendingOffers > 0 && (
                      <div className="pf-hero-stat-row">
                        <div className="pf-hero-stat-label"><Clock size={10} />Ожидают</div>
                        <div className="pf-hero-stat-val orange">{founderPendingOffers}</div>
                      </div>
                    )}
                    <div className="pf-hero-stat-row">
                      <div className="pf-hero-stat-label"><Check size={10} />Принято</div>
                      <div className="pf-hero-stat-val green">{founderAcceptedOffers}</div>
                    </div>
                  </>
                )}
              </div>

              {/* Contacts */}
              <div className="pf-hero-contacts">
                {[
                  { icon: <Mail size={13} />, label: 'Email', value: user.email ?? '—' },
                  { icon: <Phone size={13} />, label: 'Телефон', value: user.phone ?? '—' },
                  { icon: <MapPin size={13} />, label: 'Местоположение', value: user.location ?? '—' },
                ].map(({ icon, label, value }) => (
                  <div className="pf-contact-row" key={label}>
                    <div className="pf-contact-icon">{icon}</div>
                    <div>
                      <div className="pf-contact-label">{label}</div>
                      <div className="pf-contact-value" title={value}>{value}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Investor: check range */}
              {isInvestor && (investor?.minCheck != null || investor?.maxCheck != null) && (
                <div className="pf-hero-check">
                  <div className="pf-check-label">Диапазон чека</div>
                  <div className="pf-check-range">
                    <span className="pf-check-amount">{fmt(investor?.minCheck)}</span>
                    <div className="pf-check-track"><div className="pf-check-fill" /></div>
                    <span className="pf-check-amount">{fmt(investor?.maxCheck)}</span>
                  </div>
                </div>
              )}

              {/* Investor: preferred stages + industries */}
              {isInvestor && ((investor?.preferredStages?.length ?? 0) > 0 || (investor?.preferredIndustries?.length ?? 0) > 0) && (
                <div className="pf-hero-tags">
                  {(investor?.preferredStages?.length ?? 0) > 0 && (
                    <>
                      <div className="pf-tags-label">Стадии</div>
                      <div className="pf-tag-list">
                        {investor!.preferredStages!.map((s, i) => (
                          <span key={s} className="pf-tag" style={{
                            background: `${PALETTE[i % PALETTE.length]}18`,
                            borderColor: `${PALETTE[i % PALETTE.length]}30`,
                            color: PALETTE[i % PALETTE.length],
                          }}>{s}</span>
                        ))}
                      </div>
                    </>
                  )}
                  {(investor?.preferredIndustries?.length ?? 0) > 0 && (
                    <>
                      <div className="pf-tags-label" style={{ marginTop: 8 }}>Отрасли</div>
                      <div className="pf-tag-list">
                        {investor!.preferredIndustries!.map(ind => (
                          <span key={ind} className="pf-tag">{ind}</span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Website */}
              {investor?.website && (
                <div className="pf-hero-website">
                  <a href={investor.website} target="_blank" rel="noreferrer" className="pf-website-link">
                    <Globe size={12} /> {investor.website} <ExternalLink size={10} />
                  </a>
                </div>
              )}

              {/* Edit investor profile button */}
              {isInvestor && !editingInvestor && (
                <div className="pf-hero-actions">
                  <button className="pf-btn pf-btn-primary pf-btn-full" onClick={() => setEditingInvestor(true)}>
                    <Pencil size={12} /> Редактировать профиль
                  </button>
                </div>
              )}

            </div>
          </div>{/* end hero */}

          {/* ════ RIGHT PANEL ════ */}
          <div className="pf-panel">

            {/* ── INVESTOR SECTIONS ── */}
            {isInvestor && (
              <>
                {/* Investor profile edit / view */}
                <div className="pf-section">
                  <div className="pf-section-head">
                    <div className="pf-section-label">
                      <Target size={10} className="icon-orange" />
                      Профиль инвестора
                    </div>
                    {editingInvestor && (
                      <div style={{ display: 'flex', gap: 7 }}>
                        <button className="pf-btn pf-btn-secondary" onClick={() => setEditingInvestor(false)} disabled={investorSaving}>
                          <X size={11} /> Отмена
                        </button>
                        <button className="pf-btn pf-btn-success" onClick={() => saveInvestor(investor ?? {})} disabled={investorSaving}>
                          <Check size={11} /> {investorSaving ? 'Сохранение…' : 'Сохранить'}
                        </button>
                      </div>
                    )}
                  </div>

                  {!editingInvestor ? (
                    <div className="pf-data-grid">
                      {[
                        { key: 'Юридическое имя', val: investor?.legalName ?? '—' },
                        { key: 'Тип инвестора',   val: investor?.type ?? '—' },
                      ].map(({ key, val }) => (
                        <div className="pf-data-item" key={key}>
                          <div className="pf-data-key">{key}</div>
                          <div className="pf-data-val">{val}</div>
                        </div>
                      ))}
                      {investor?.description && (
                        <div className="pf-data-item full">
                          <div className="pf-data-key">Описание</div>
                          <div className="pf-data-val">{investor.description}</div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="pf-form">
                      <div className="pf-form-row">
                        <input className="pf-input" placeholder="Юридическое имя"
                          value={investor?.legalName ?? ''}
                          onChange={e => setInvestor(p => ({ ...(p ?? {}), legalName: e.target.value }))} />
                        <input className="pf-input" placeholder="Тип (angel, vc…)"
                          value={investor?.type ?? ''}
                          onChange={e => setInvestor(p => ({ ...(p ?? {}), type: e.target.value }))} />
                      </div>
                      <div className="pf-form-row">
                        <input type="number" className="pf-input" placeholder="Min чек ($)"
                          value={investor?.minCheck ?? ''}
                          onChange={e => setInvestor(p => ({ ...(p ?? {}), minCheck: e.target.value ? Number(e.target.value) : undefined }))} />
                        <input type="number" className="pf-input" placeholder="Max чек ($)"
                          value={investor?.maxCheck ?? ''}
                          onChange={e => setInvestor(p => ({ ...(p ?? {}), maxCheck: e.target.value ? Number(e.target.value) : undefined }))} />
                      </div>
                      <input className="pf-input" placeholder="Отрасли (через запятую)"
                        value={(investor?.preferredIndustries ?? []).join(', ')}
                        onChange={e => setInvestor(p => ({ ...(p ?? {}), preferredIndustries: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))} />
                      <input className="pf-input" placeholder="Стадии (через запятую)"
                        value={(investor?.preferredStages ?? []).join(', ')}
                        onChange={e => setInvestor(p => ({ ...(p ?? {}), preferredStages: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))} />
                      <input className="pf-input" placeholder="Сайт"
                        value={investor?.website ?? ''}
                        onChange={e => setInvestor(p => ({ ...(p ?? {}), website: e.target.value }))} />
                      <textarea className="pf-textarea" placeholder="Описание"
                        value={investor?.description ?? ''}
                        onChange={e => setInvestor(p => ({ ...(p ?? {}), description: e.target.value }))} />
                    </div>
                  )}
                </div>

                {/* Summary stats */}
                <div className="pf-section">
                  <div className="pf-section-head">
                    <div className="pf-section-label"><BarChart2 size={10} className="icon-green" />Портфель</div>
                    <span className="pf-section-count">{investments.length} сделок</span>
                  </div>
                  <div className="pf-stats-grid">
                    <div className="pf-stat-card">
                      <div className="pf-stat-label orange"><DollarSign size={10} />Вложено</div>
                      <div className="pf-stat-val">{fmt(totalDeployed)}</div>
                      <div className="pf-stat-sub">общий объём</div>
                    </div>
                    <div className="pf-stat-card">
                      <div className="pf-stat-label green"><Activity size={10} />Активных</div>
                      <div className="pf-stat-val">{activeDeals}</div>
                      <div className="pf-stat-sub">из {investments.length} сделок</div>
                    </div>
                    <div className="pf-stat-card">
                      <div className="pf-stat-label blue"><PieChart size={10} />Ср. доля</div>
                      <div className="pf-stat-val">{avgEquity != null ? fmtPct(avgEquity) : '—'}</div>
                      <div className="pf-stat-sub">средняя equity</div>
                    </div>
                    <div className="pf-stat-card">
                      <div className="pf-stat-label purple"><TrendingUp size={10} />Оценка</div>
                      <div className="pf-stat-val">{fmt(totalPortVal || null)}</div>
                      <div className="pf-stat-sub">post-money</div>
                    </div>
                  </div>
                </div>

                {/* Portfolio distribution bar */}
                {segTotal > 0 && (
                  <div className="pf-section">
                    <div className="pf-section-head">
                      <div className="pf-section-label">Распределение</div>
                    </div>
                    <div className="pf-portfolio-bar">
                      {segmented.map(seg => (
                        <div key={seg.id} className="pf-portfolio-bar-seg"
                          style={{ width: `${(seg.amount / segTotal) * 100}%`, background: seg.color }}
                          title={`${seg.id}: ${fmt(seg.amount)}`} />
                      ))}
                    </div>
                    <div className="pf-portfolio-legend" style={{ marginTop: 10 }}>
                      {segmented.map(seg => (
                        <div key={seg.id} className="pf-legend-item">
                          <div className="pf-legend-dot" style={{ background: seg.color }} />
                          <span>{seg.id.slice(-8)}</span>
                          <span style={{ color: 'var(--text-muted)' }}>{fmt(seg.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Investment list */}
                <div className="pf-section">
                  <div className="pf-section-head">
                    <div className="pf-section-label"><Clock size={10} className="icon-blue" />Последние сделки</div>
                  </div>
                  {loadingInv ? (
                    <div className="pf-inv-list">
                      {[0,1,2].map(i => (
                        <div key={i} className="pf-inv-row">
                          <div className="pf-skeleton" style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0 }} />
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
                            <div className="pf-skeleton" style={{ width: '40%', height: 12 }} />
                            <div className="pf-skeleton" style={{ width: '65%', height: 10 }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : investments.length === 0 ? (
                    <div className="pf-empty">
                      <div className="pf-empty-icon"><DollarSign size={16} /></div>
                      Инвестиций пока нет
                    </div>
                  ) : (
                    <div className="pf-inv-list">
                      {[...investments].sort((a, b) => (b.createdAt ?? '') > (a.createdAt ?? '') ? 1 : -1).map((inv, idx) => (
                        <div key={inv.id ?? idx} className="pf-inv-row" style={{ animationDelay: `${0.04 * idx}s` }}>
                          <div className={`pf-inv-dot ${inv.status ?? 'active'}`} />
                          <div className="pf-inv-info">
                            <div className="pf-inv-id">#{(inv.startupId ?? 'unknown').slice(-12)}</div>
                            <div className="pf-inv-meta">
                              <span className="pf-inv-amount">{fmt(inv.amount)}</span>
                              {inv.equityPercent != null && <span className="pf-inv-equity"><ArrowUpRight size={10} />{fmtPct(inv.equityPercent)}</span>}
                              {inv.valuationPostMoney != null && <span className="pf-inv-valuation">post: {fmt(inv.valuationPostMoney)}</span>}
                            </div>
                          </div>
                          <div className="pf-inv-date"><Clock size={9} />{fmtDate(inv.createdAt)}</div>
                          <span className={`pf-inv-status ${inv.status ?? 'active'}`}>{inv.status ?? 'active'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ── FOUNDER SECTIONS ── */}
            {isFounder && (
              <>
                {/* Summary stats */}
                <div className="pf-section">
                  <div className="pf-section-head">
                    <div className="pf-section-label"><Rocket size={10} className="icon-orange" />Обзор</div>
                  </div>
                  <div className="pf-stats-grid">
                    <div className="pf-stat-card">
                      <div className="pf-stat-label green"><DollarSign size={10} />Привлечено</div>
                      <div className="pf-stat-val">{founderTotalRaised > 0 ? fmt(founderTotalRaised) : '—'}</div>
                      <div className="pf-stat-sub">суммарно</div>
                    </div>
                    <div className="pf-stat-card">
                      <div className="pf-stat-label orange"><Rocket size={10} />Стартапов</div>
                      <div className="pf-stat-val">{startups.length}</div>
                      <div className="pf-stat-sub">активных проектов</div>
                    </div>
                    <div className="pf-stat-card">
                      <div className="pf-stat-label blue"><FileText size={10} />Офферов</div>
                      <div className="pf-stat-val">{founderOffers.length}</div>
                      <div className="pf-stat-sub">{founderPendingOffers} ожидают</div>
                    </div>
                    <div className="pf-stat-card">
                      <div className="pf-stat-label purple"><Check size={10} />Принято</div>
                      <div className="pf-stat-val">{founderAcceptedOffers}</div>
                      <div className="pf-stat-sub">успешных офферов</div>
                    </div>
                  </div>
                </div>

                {/* Startup cards */}
                <div className="pf-section">
                  <div className="pf-section-head">
                    <div className="pf-section-label"><Rocket size={10} className="icon-orange" />Мои стартапы</div>
                    <span className="pf-section-count">{startups.length}</span>
                  </div>
                  {loadingStartups ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {[0,1].map(i => (
                        <div key={i} className="pf-startup-card">
                          <div className="pf-startup-header">
                            <div className="pf-skeleton" style={{ width: 42, height: 42, borderRadius: 10, flexShrink: 0 }} />
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
                              <div className="pf-skeleton" style={{ width: '35%', height: 15 }} />
                              <div className="pf-skeleton" style={{ width: '65%', height: 11 }} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : startups.length === 0 ? (
                    <div className="pf-empty">
                      <div className="pf-empty-icon"><Rocket size={16} /></div>
                      Стартапов пока нет
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {startups.map((s, idx) => (
                        <StartupCard key={s.id ?? idx} startup={s} offers={founderOffers} investments={founderInvestments} />
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

          </div>{/* end panel */}
        </div>{/* end layout */}
      </div>
    </div>
  );
}