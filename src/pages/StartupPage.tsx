// src/pages/StartupPage.tsx
import React, { JSX, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ExternalLink, BarChart2, FileText, Globe } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import './StartupPage.css';

const API            = 'http://localhost:8080/api/startups';
const METRICS_API    = 'http://localhost:8080/api/startup-metrics';
const USERS_API      = 'http://localhost:8080/api/users';
const OFFERS_API     = 'http://localhost:8080/api/offers';
const INVESTMENTS_API = 'http://localhost:8080/api/investments';

/* ── Types ─────────────────────────────────────────────────── */
type MetricsSnapshot = {
  mrr?: number | null;
  users?: number | null;
  valuationPreMoney?: number | null;
  valuationPostMoney?: number | null;
};

type MetricRecord = {
  _id?: string;
  startupId?: string;
  date?: string | number | Date;
  mrr?: number | null;
  activeUsers?: number | null;
  burnRate?: number | null;
  valuationPreMoney?: number | null;
  valuationPostMoney?: number | null;
  other?: Record<string, any> | null;
};

type Startup = {
  id?: string; _id?: string;
  name?: string; slug?: string; founderId?: string;
  stage?: string; industry?: string;
  shortPitch?: string; description?: string;
  website?: string; logoUrl?: string;
  metricsSnapshot?: MetricsSnapshot;
  attachments?: string[] | Array<{ url?: string; name?: string }>;
  createdAt?: string | number | Date;
  updatedAt?: string | number | Date;
  visibility?: string;
  valuationMode?: 'pre' | 'post';
};

type User = {
  id?: string; _id?: string;
  name?: string; username?: string; avatarUrl?: string; role?: string;
};

type Offer = {
  id?: string; _id?: string;
  startupId?: string; investorId?: string;
  title?: string; amount?: number; equityPercent?: number;
  type?: string; visibility?: string; status?: string;
  attachments?: Array<{ url?: string; name?: string }>;
  createdAt?: string | number | Date; updatedAt?: string | number | Date;
  note?: string;
};

type Investment = {
  id?: string; _id?: string;
  startupId?: string; investorId?: string;
  amount?: number; currency?: string; equityPercent?: number;
  valuationPostMoney?: number; status?: string;
  createdAt?: string | number | Date; updatedAt?: string | number | Date;
  note?: string;
};

/* ── Helpers ────────────────────────────────────────────────── */
function Logo({ name, url }: { name?: string; url?: string }) {
  if (url) return <img src={url} alt={name} className="logo-img-detail" />;
  const initials = (name || '').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  return <div className="logo-initials-detail">{initials || 'S'}</div>;
}

function formatDate(iso?: string | number | Date): string {
  if (!iso) return '';
  try { return new Date(iso).toLocaleString('ru-RU'); } catch { return String(iso); }
}

function formatNum(n?: number | null): string {
  if (n == null) return '—';
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

/* ── Sparkline ──────────────────────────────────────────────── */
function Sparkline({ data, width = 200, height = 44 }: { data: (number | null | undefined)[]; width?: number; height?: number }) {
  const vals  = data.map((v) => (v == null ? null : Number(v)));
  const valid = vals.filter((v) => v != null) as number[];
  if (!valid.length) return <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>нет данных</span>;

  const pad = 4, w = Math.max(40, width), h = Math.max(20, height);
  const min = Math.min(...valid), max = Math.max(...valid), range = max === min ? 1 : max - min;
  const stepX = (w - pad * 2) / Math.max(1, vals.length - 1);

  const points: [number, number][] = vals.map((v, i) => [
    pad + i * stepX,
    v == null ? h - pad : pad + (1 - (v - min) / range) * (h - pad * 2),
  ]);

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' ');
  const last  = points[[...vals].reverse().findIndex((v) => v != null) === -1 ? 0 : vals.length - 1 - [...vals].reverse().findIndex((v) => v != null)];

  return (
    <svg width={w} height={h}>
      <defs>
        <linearGradient id="spk-grad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%"   stopColor="rgba(99,179,255,0.2)" />
          <stop offset="100%" stopColor="rgba(99,179,255,0)" />
        </linearGradient>
      </defs>
      <path d={`${pathD} L ${w - pad} ${h - pad} L ${pad} ${h - pad} Z`} fill="url(#spk-grad)" />
      <path d={pathD} fill="none" stroke="var(--accent)" strokeWidth={1.5} />
      {last && <circle cx={last[0]} cy={last[1]} r={3} fill="var(--accent)" />}
    </svg>
  );
}

/* ── Component ──────────────────────────────────────────────── */
export default function StartupPage(): JSX.Element {
  const { slug }    = useParams<{ slug: string }>();
  const navigate    = useNavigate();
  const { user, token } = useAuth();

  const [startup,  setStartup]  = useState<Startup | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [metrics,        setMetrics]        = useState<MetricRecord[] | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [metricsError,   setMetricsError]   = useState<string | null>(null);

  const [founder,        setFounder]        = useState<User | null>(null);
  const [founderLoading, setFounderLoading] = useState(false);
  const [founderError,   setFounderError]   = useState<string | null>(null);

  const [offers,        setOffers]        = useState<Offer[] | null>(null);
  const [offersLoading, setOffersLoading] = useState(false);
  const [offersError,   setOffersError]   = useState<string | null>(null);

  const [investments,        setInvestments]        = useState<Investment[] | null>(null);
  const [investmentsLoading, setInvestmentsLoading] = useState(false);
  const [investmentsError,   setInvestmentsError]   = useState<string | null>(null);

  const [makingOffer,      setMakingOffer]      = useState(false);
  const [offerTitle,       setOfferTitle]       = useState('');
  const [offerAmount,      setOfferAmount]      = useState<number | ''>('');
  const [offerVisibility,  setOfferVisibility]  = useState<'private' | 'public'>('private');
  const [offerSubmitting,  setOfferSubmitting]  = useState(false);

  /* ── Fetch startup ── */
  useEffect(() => {
    if (!slug) return;
    let canceled = false;
    (async () => {
      setLoading(true); setError(null);
      try {
        const res = await fetch(`${API}/${encodeURIComponent(slug)}`, { credentials: 'include' });
        if (res.status === 404) throw new Error('Стартап не найден');
        if (!res.ok) { const j = await res.json().catch(() => ({})); throw new Error(j.error ?? j.message ?? `Ошибка ${res.status}`); }
        if (!canceled) setStartup(await res.json());
      } catch (e: any) { if (!canceled) setError(e.message); }
      finally          { if (!canceled) setLoading(false); }
    })();
    return () => { canceled = true; };
  }, [slug]);

  /* ── Fetch metrics ── */
  useEffect(() => {
    if (!startup) return;
    const id = startup.id ?? startup._id ?? startup.slug; if (!id) return;
    let canceled = false;
    (async () => {
      setMetricsLoading(true); setMetricsError(null);
      try {
        const res = await fetch(`${METRICS_API}?startupId=${encodeURIComponent(String(id))}`, { credentials: 'include' });
        if (!res.ok) throw new Error(`Ошибка ${res.status}`);
        const raw = await res.json();
        const arr = Array.isArray(raw) ? raw : (raw?.data ?? []);
        const normalized = arr
          .map((m: any) => ({ ...m, date: m.date ?? m.timestamp ?? m.createdAt ?? null }))
          .filter((m: any) => m.date != null)
          .sort((a: any, b: any) => new Date(String(a.date)).getTime() - new Date(String(b.date)).getTime());
        if (!canceled) setMetrics(normalized);
      } catch (e: any) { if (!canceled) setMetricsError(e.message); }
      finally          { if (!canceled) setMetricsLoading(false); }
    })();
    return () => { canceled = true; };
  }, [startup]);

  /* ── Fetch founder ── */
  useEffect(() => {
    if (!startup?.founderId) { setFounder(null); return; }
    let canceled = false;
    (async () => {
      setFounderLoading(true); setFounderError(null);
      try {
        const res = await fetch(`${USERS_API}/${encodeURIComponent(String(startup.founderId))}`, { credentials: 'include' });
        if (!res.ok) throw new Error('Автор не найден');
        if (!canceled) setFounder(await res.json());
      } catch (e: any) { if (!canceled) setFounderError(e.message); }
      finally          { if (!canceled) setFounderLoading(false); }
    })();
    return () => { canceled = true; };
  }, [startup?.founderId]);

  const idForApi = () => startup?.id ?? startup?._id ?? startup?.slug;

  /* ── Offers & investments loaders ── */
  const loadOffers = async () => {
    if (!startup) return;
    const id = idForApi(); if (!id) return;
    setOffersLoading(true); setOffersError(null);
    try {
      const res = await fetch(`${OFFERS_API}?startupId=${encodeURIComponent(String(id))}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error(`Ошибка ${res.status}`);
      const data = await res.json();
      setOffers(Array.isArray(data) ? data : (data?.data ?? []));
    } catch (e: any) { setOffersError(e.message); }
    finally          { setOffersLoading(false); }
  };

  const loadInvestments = async () => {
    if (!startup) return;
    const id = idForApi(); if (!id) return;
    setInvestmentsLoading(true); setInvestmentsError(null);
    try {
      const res = await fetch(`${INVESTMENTS_API}/startup/${encodeURIComponent(String(id))}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error(`Ошибка ${res.status}`);
      const data = await res.json();
      setInvestments(Array.isArray(data) ? data : (data?.data ?? []));
    } catch (e: any) { setInvestmentsError(e.message); }
    finally          { setInvestmentsLoading(false); }
  };

  useEffect(() => {
    if (!startup) return;
    loadOffers();
    loadInvestments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startup]);

  /* ── Derived ── */
  const mrrSeries   = metrics?.map((m) => m.mrr        == null ? null : Number(m.mrr))        ?? [];
  const usersSeries = metrics?.map((m) => m.activeUsers == null ? null : Number(m.activeUsers)) ?? [];
  const burnSeries  = metrics?.map((m) => m.burnRate    == null ? null : Number(m.burnRate))   ?? [];

  const lastMetric     = metrics && metrics.length > 0 ? metrics[metrics.length - 1] : null;
  const displayedMrr   = lastMetric?.mrr        ?? startup?.metricsSnapshot?.mrr   ?? 0;
  const displayedUsers = lastMetric?.activeUsers ?? startup?.metricsSnapshot?.users ?? 0;
  const displayedBurn  = lastMetric?.burnRate    ?? null;
  const lastTimestamp  = lastMetric?.date        ?? startup?.updatedAt ?? startup?.createdAt ?? null;

  const isFounder  = user && startup && user.id === startup.founderId;
  const isInvestor = user?.role === 'investor';

  const valuationMode = startup?.valuationMode ?? 'pre';
  const currentPre    = lastMetric?.valuationPreMoney  ?? startup?.metricsSnapshot?.valuationPreMoney  ?? 0;
  const currentPost   = lastMetric?.valuationPostMoney ?? startup?.metricsSnapshot?.valuationPostMoney ?? 0;

  const calculatedEquity =
    offerAmount && Number(offerAmount) > 0
      ? valuationMode === 'pre'
        ? (Number(offerAmount) / (currentPre + Number(offerAmount))) * 100
        : currentPost > 0 ? (Number(offerAmount) / currentPost) * 100 : 0
      : 0;

  /* ── Actions ── */
  async function handleDelete() {
    if (!startup || !window.confirm('Удалить стартап? Это нельзя отменить.')) return;
    const id = idForApi(); if (!id) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API}/${encodeURIComponent(String(id))}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok || res.status === 204) { navigate('/startups'); return; }
      throw new Error(`Ошибка ${res.status}`);
    } catch (e: any) { alert('Не удалось удалить: ' + e.message); }
    finally           { setDeleting(false); }
  }

  const submitOffer = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!startup || !user) { alert('Нужна авторизация'); return; }
    setOfferSubmitting(true);
    try {
      const res = await fetch(OFFERS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          startupId: idForApi(), investorId: user.id,
          title: offerTitle, amount: Number(offerAmount),
          equityPercent: Number(calculatedEquity.toFixed(4)),
          type: 'term-sheet', visibility: offerVisibility, status: 'sent', attachments: [],
        }),
      });
      if (!res.ok) { const j = await res.json().catch(() => ({})); throw new Error(j.message ?? `Ошибка ${res.status}`); }
      await loadOffers();
      setMakingOffer(false); setOfferTitle(''); setOfferAmount('');
    } catch (e: any) { alert('Не удалось создать оффер: ' + e.message); }
    finally           { setOfferSubmitting(false); }
  };

  const updateOfferStatus = async (offerId: string, status: string, note?: string) => {
    try {
      const res = await fetch(`${OFFERS_API}/${encodeURIComponent(offerId)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ status, note }),
      });
      if (!res.ok) throw new Error(`Ошибка ${res.status}`);
      await loadOffers();
      await loadInvestments();
    } catch (e: any) { alert('Не удалось обновить статус: ' + e.message); }
  };

  /* ── Render ── */
  return (
    <div className="startup-page-container">
      {loading  && <div className="page-loading">Загрузка стартапа…</div>}
      {error    && <div className="page-error">Ошибка: {error}</div>}
      {!loading && !error && !startup && <div className="page-not-found">Стартап не найден</div>}

      {startup && (
        <article className="startup-detail-card">

          {/* ═══ HEADER ═══ */}
          <header className="startup-detail-header">
            <div className="detail-logo">
              <Logo name={startup.name} url={startup.logoUrl} />
            </div>

            <div className="detail-info">
              <h1 className="detail-title">
                {startup.name}
                {startup.stage    && <span className="detail-stage-badge">{startup.stage}</span>}
                {startup.industry && <span className="detail-industry">{startup.industry}</span>}
              </h1>

              {startup.shortPitch && <p className="detail-pitch">{startup.shortPitch}</p>}

              {startup.founderId && (
                <div className="founder-section">
                  {founderLoading ? (
                    <span className="empty-message">Загрузка автора…</span>
                  ) : founderError ? (
                    <span className="chart-error">{founderError}</span>
                  ) : founder ? (
                    <button
                      className="founder-button"
                      onClick={() => navigate(`/users/${encodeURIComponent(String(founder.id ?? founder._id ?? startup.founderId))}`)}
                    >
                      {founder.avatarUrl
                        ? <img src={founder.avatarUrl} alt={founder.name} className="founder-avatar" />
                        : <div className="founder-avatar-initials">
                            {(founder.name || founder.username || '').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase() || 'U'}
                          </div>
                      }
                      <span>{founder.name ?? founder.username ?? 'Профиль автора'}</span>
                    </button>
                  ) : (
                    <span className="empty-message">Автор: {startup.founderId}</span>
                  )}
                </div>
              )}

              <div className="detail-meta">
                {startup.website && (() => {
                  try {
                    return (
                      <a href={startup.website} target="_blank" rel="noreferrer" className="meta-link">
                        <Globe size={15} /> {new URL(String(startup.website)).hostname}
                      </a>
                    );
                  } catch { return null; }
                })()}
                <div className="meta-item"><BarChart2 size={15} /> MRR: <strong>{formatNum(displayedMrr as any)}</strong></div>
                <div className="meta-item"><FileText size={15} /> Files: <strong>{Array.isArray(startup.attachments) ? startup.attachments.length : 0}</strong></div>
              </div>
            </div>

            <div className="detail-dates">
              <div className="date-label">Создано</div>
              <div className="date-value">{formatDate(startup.createdAt)}</div>
              <div className="date-label">Обновлено</div>
              <div className="date-value">{formatDate(startup.updatedAt)}</div>
            </div>
          </header>

          {/* ═══ DESCRIPTION ═══ */}
          <section className="content-section">
            <h3 className="section-title">Описание</h3>
            <p className="section-description">{startup.description ?? '—'}</p>
          </section>

          {/* ═══ METRICS ═══ */}
          <section className="content-section">
            <h3 className="section-title">Метрики</h3>

            <div className="metrics-grid">
              {[
                { label: 'MRR',          value: formatNum(displayedMrr as any),         series: mrrSeries },
                { label: 'Active Users', value: String(displayedUsers ?? '—'),           series: usersSeries },
                { label: 'Burn Rate',    value: displayedBurn != null ? formatNum(displayedBurn) : '—', series: burnSeries },
              ].map(({ label, value, series }) => (
                <div key={label} className="metric-card">
                  <div className="metric-header">
                    <div className="metric-info">
                      <div className="metric-label">{label}</div>
                      <div className="metric-value">{value}</div>
                      {lastTimestamp && <div className="metric-timestamp">{formatDate(lastTimestamp)}</div>}
                    </div>
                    <div className="metric-chart">
                      {metricsLoading ? (
                        <span className="chart-loading">Загрузка…</span>
                      ) : metricsError ? (
                        <span className="chart-error">{metricsError}</span>
                      ) : (
                        <Sparkline data={series} />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* History table */}
            <div className="metrics-history">
              <h4 className="history-title">История</h4>
              {metricsLoading && <div className="empty-message">Загрузка метрик…</div>}
              {metricsError   && <div className="chart-error">{metricsError}</div>}
              {!metricsLoading && (!metrics || metrics.length === 0) && (
                <div className="empty-message">История метрик отсутствует.</div>
              )}
              {!metricsLoading && metrics && metrics.length > 0 && (
                <div className="history-table-wrapper">
                  <table className="history-table">
                    <thead>
                      <tr>
                        <th>Дата</th><th>MRR</th><th>Active Users</th><th>Burn Rate</th><th>Other</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.slice().reverse().map((m, i) => (
                        <tr key={m._id ?? i}>
                          <td>{formatDate(m.date)}</td>
                          <td>{m.mrr        ?? '—'}</td>
                          <td>{m.activeUsers ?? '—'}</td>
                          <td>{m.burnRate    ?? '—'}</td>
                          <td>{m.other ? JSON.stringify(m.other) : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>

          {/* ═══ VALUATION ═══ */}
          <section className="content-section">
            <h3 className="section-title">Оценка компании</h3>
            <div className="valuation-mode-badge">Mode: {(startup.valuationMode ?? 'pre').toUpperCase()}</div>
            <div className="valuation-grid">
              <div className="valuation-card">
                <div className="valuation-label">Pre-Money Valuation</div>
                <div className="valuation-value">{formatNum(lastMetric?.valuationPreMoney ?? startup?.metricsSnapshot?.valuationPreMoney)}</div>
              </div>
              <div className="valuation-card">
                <div className="valuation-label">Post-Money Valuation</div>
                <div className="valuation-value">{formatNum(lastMetric?.valuationPostMoney ?? startup?.metricsSnapshot?.valuationPostMoney)}</div>
              </div>
            </div>
          </section>

          {/* ═══ FILES ═══ */}
          <section className="content-section">
            <h3 className="section-title">Дополнительные файлы</h3>
            {Array.isArray(startup.attachments) && startup.attachments.length > 0 ? (
              <div className="files-list">
                {startup.attachments.map((a: any, i: number) => {
                  const href = String(a?.url ?? a);
                  const name = (a?.name as string) ?? href.split('/').pop() ?? `file-${i + 1}`;
                  return (
                    <div key={i} className="file-item">
                      <a href={href} target="_blank" rel="noreferrer" className="file-link">
                        <FileText size={15} /> {name}
                      </a>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-message">Файлы не добавлены</div>
            )}
          </section>

          {/* ═══ OFFERS ═══ */}
          <section className="content-section">
            <div className="dual-section">
              <div className="offers-card">
                <div className="card-header">
                  <h3 className="card-title section-title" style={{ flex: 1 }}>Офферы</h3>
                  {isInvestor && (
                    <button onClick={() => setMakingOffer((v) => !v)} className="btn-make-offer">
                      {makingOffer ? 'Отмена' : '+ Сделать оффер'}
                    </button>
                  )}
                </div>

                {makingOffer && isInvestor && (
                  <form onSubmit={submitOffer} className="offer-form">
                    <input
                      className="form-input"
                      placeholder="Заголовок оффера"
                      value={offerTitle}
                      onChange={(e) => setOfferTitle(e.target.value)}
                      required
                    />
                    <div className="form-row">
                      <input
                        className="form-input"
                        type="number"
                        placeholder="Сумма (USD)"
                        value={offerAmount}
                        onChange={(e) => setOfferAmount(e.target.value === '' ? '' : Number(e.target.value))}
                        required
                      />
                      <div className="equity-preview">
                        {offerAmount ? `≈ ${calculatedEquity.toFixed(2)}%` : '—'}
                      </div>
                    </div>
                    <div className="form-footer">
                      <span className="form-label">Видимость:</span>
                      <select
                        className="form-select"
                        value={offerVisibility}
                        onChange={(e) => setOfferVisibility(e.target.value as any)}
                      >
                        <option value="private">private</option>
                        <option value="public">public</option>
                      </select>
                      <button type="submit" className="btn-submit" disabled={offerSubmitting}>
                        {offerSubmitting ? 'Отправка…' : 'Отправить'}
                      </button>
                    </div>
                  </form>
                )}

                {offersLoading ? (
                  <div className="empty-message">Загрузка офферов…</div>
                ) : offersError ? (
                  <div className="chart-error">{offersError}</div>
                ) : !offers || offers.length === 0 ? (
                  <div className="empty-message">Офферов нет</div>
                ) : (
                  <div className="offers-list">
                    {offers.map((o) => (
                      <div key={o._id ?? o.id} className="offer-item">
                        <div className="item-content">
                          <div className="item-main">
                            <div className="item-type">{o.type} · {o.visibility}</div>
                            <div className="item-title">{o.title}</div>
                            <div className="item-details">
                              {o.amount ? `$${o.amount.toLocaleString()}` : '—'} · {o.equityPercent ?? '—'}%
                            </div>
                            {o.note && <div className="item-note">{o.note}</div>}
                          </div>
                          <div className="item-meta">
                            <div className="item-date">{formatDate(o.createdAt)}</div>
                            <span className={`status-badge ${o.status ?? ''}`}>{o.status}</span>
                          </div>
                        </div>
                        {isFounder && o.status !== 'accepted' && o.status !== 'rejected' && (
                          <div className="offer-actions">
                            <button className="btn-accept" onClick={() => updateOfferStatus(String(o._id ?? o.id), 'accepted')}>
                              Принять
                            </button>
                            <button className="btn-reject" onClick={() => updateOfferStatus(String(o._id ?? o.id), 'rejected')}>
                              Отклонить
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ═══ ACTION BAR ═══ */}
          <div className="action-buttons">
            <div className="primary-actions">
              <a href={startup.website || '#'} target="_blank" rel="noreferrer" className="btn-website">
                <ExternalLink size={15} /> Официальный сайт
              </a>
              <button
                className="btn-edit"
                onClick={() => navigate(`/startups/edit/${encodeURIComponent(String(idForApi()))}`)}
              >
                Редактировать
              </button>
            </div>
            <button className="btn-delete" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Удаление…' : 'Удалить стартап'}
            </button>
          </div>

        </article>
      )}
    </div>
  );
}

/* ── Inline logo styles (no Tailwind dependency) ── */
const style = document.createElement('style');
style.textContent = `
  .logo-img-detail {
    width: 80px; height: 80px; border-radius: 18px;
    object-fit: cover; border: 1px solid var(--border);
    box-shadow: 0 0 0 4px rgba(99,179,255,0.08), 0 20px 40px rgba(0,0,0,0.4);
    display: block;
  }
  .logo-initials-detail {
    width: 80px; height: 80px; border-radius: 18px;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, #1e3a5f 0%, #2d1f6b 100%);
    border: 1px solid rgba(99,179,255,0.2);
    box-shadow: 0 0 0 4px rgba(99,179,255,0.08), 0 20px 40px rgba(0,0,0,0.4);
    font-family: var(--font-display); font-weight: 700;
    font-size: 1.4rem; color: var(--accent);
  }
`;
if (typeof document !== 'undefined' && !document.getElementById('sp-logo-style')) {
  style.id = 'sp-logo-style';
  document.head.appendChild(style);
}