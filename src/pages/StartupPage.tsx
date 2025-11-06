// src/pages/StartupPage.tsx
import React, { JSX, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ExternalLink, BarChart2, FileText, Globe } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import './StartupPage.css';
const API = 'http://localhost:8080/api/startups';
const METRICS_API = 'http://localhost:8080/api/startup-metrics';
const USERS_API = 'http://localhost:8080/api/users';
const OFFERS_API = 'http://localhost:8080/api/offers';
const INVESTMENTS_API = 'http://localhost:8080/api/investments';

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
  id?: string;
  _id?: string;
  name?: string;
  slug?: string;
  founderId?: string;
  stage?: string;
  industry?: string;
  shortPitch?: string;
  description?: string;
  website?: string;
  logoUrl?: string;
  metricsSnapshot?: MetricsSnapshot;
  attachments?: string[] | Array<{ url?: string; name?: string }>;
  createdAt?: string | number | Date;
  updatedAt?: string | number | Date;
  visibility?: string;
};

type User = {
  id?: string;
  _id?: string;
  name?: string;
  username?: string;
  avatarUrl?: string;
  role?: string;
};

type Offer = {
  id?: string;
  _id?: string;
  startupId?: string;
  investorId?: string;
  title?: string;
  amount?: number;
  equityPercent?: number;
  type?: string;
  visibility?: string;
  status?: string;
  attachments?: Array<{ url?: string; name?: string }>;
  createdAt?: string | number | Date;
  updatedAt?: string | number | Date;
  note?: string;
};

type Investment = {
  id?: string;
  _id?: string;
  startupId?: string;
  investorId?: string;
  amount?: number;
  currency?: string;
  equityPercent?: number;
  valuationPostMoney?: number;
  status?: string;
  createdAt?: string | number | Date;
  updatedAt?: string | number | Date;
  note?: string;
};

function Logo({ name, url }: { name?: string; url?: string }) {
  if (url) return <img src={url} alt={name} className="w-24 h-24 rounded-md object-cover" />;
  const initials = (name || '')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <div className="w-24 h-24 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-semibold text-xl">
      {initials || 'S'}
    </div>
  );
}

function formatDate(iso?: string | number | Date): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString();
  } catch (e) {
    return String(iso);
  }
}

/** Sparkline */
function Sparkline({ data, width = 220, height = 48 }: { data: (number | null | undefined)[]; width?: number; height?: number }) {
  const vals = data.map((v) => (v == null ? null : Number(v)));
  const valid = vals.filter((v) => v != null) as number[];
  if (valid.length === 0) {
    return <div className="text-xs text-gray-500 dark:text-gray-400">нет данных</div>;
  }

  const pad = 4;
  const w = Math.max(40, width);
  const h = Math.max(20, height);
  const min = Math.min(...valid);
  const max = Math.max(...valid);
  const range = max === min ? 1 : max - min;
  const stepX = (w - pad * 2) / Math.max(1, vals.length - 1);

  const points: [number, number][] = vals.map((v, i) => {
    const x = pad + i * stepX;
    const y = v == null ? h - pad : pad + (1 - (Number(v) - min) / range) * (h - pad * 2);
    return [x, y];
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' ');
  const lastValidIndex = [...vals].reverse().findIndex((v) => v != null);
  const lastIndex = lastValidIndex === -1 ? 0 : vals.length - 1 - lastValidIndex;
  const lastPoint = points[lastIndex];

  return (
    <svg width={w} height={h} className="block">
      <defs>
        <linearGradient id="grad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgba(79,70,229,0.12)" />
          <stop offset="100%" stopColor="rgba(79,70,229,0.00)" />
        </linearGradient>
      </defs>
      <path d={`${pathD} L ${w - pad} ${h - pad} L ${pad} ${h - pad} Z`} fill="url(#grad)" stroke="none" />
      <path d={pathD} fill="none" stroke="currentColor" strokeWidth={1.5} style={{ color: '#4f46e5' }} />
      {lastPoint && <circle cx={lastPoint[0]} cy={lastPoint[1]} r={2.5} fill="#4f46e5" />}
    </svg>
  );
}

export default function StartupPage(): JSX.Element {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [startup, setStartup] = useState<Startup | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Metrics
  const [metrics, setMetrics] = useState<MetricRecord[] | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [metricsError, setMetricsError] = useState<string | null>(null);

  // Founder
  const [founder, setFounder] = useState<User | null>(null);
  const [founderLoading, setFounderLoading] = useState(false);
  const [founderError, setFounderError] = useState<string | null>(null);

  // Offers & investments
  const [offers, setOffers] = useState<Offer[] | null>(null);
  const [offersLoading, setOffersLoading] = useState(false);
  const [offersError, setOffersError] = useState<string | null>(null);

  const [investments, setInvestments] = useState<Investment[] | null>(null);
  const [investmentsLoading, setInvestmentsLoading] = useState(false);
  const [investmentsError, setInvestmentsError] = useState<string | null>(null);

  // Make offer form
  const [makingOffer, setMakingOffer] = useState(false);
  const [offerTitle, setOfferTitle] = useState('');
  const [offerAmount, setOfferAmount] = useState<number | ''>('');
  const [offerEquity, setOfferEquity] = useState<number | ''>('');
  const [offerVisibility, setOfferVisibility] = useState<'private' | 'public'>('private');
  const [offerSubmitting, setOfferSubmitting] = useState(false);

  // Make investment (simple)
  const [investAmount, setInvestAmount] = useState<number | ''>('');
  const [investEquity, setInvestEquity] = useState<number | ''>('');
  const [investSubmitting, setInvestSubmitting] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let canceled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API}/${encodeURIComponent(slug)}`, { credentials: 'include' });
        if (res.status === 404) {
          throw new Error('Стартап не найден');
        }
        if (!res.ok) {
          const txt = await res.text();
          let msg = `Ошибка ${res.status}`;
          try {
            const json = JSON.parse(txt);
            msg = json.error ?? json.message ?? msg;
          } catch {}
          throw new Error(msg);
        }
        const data = (await res.json()) as Startup;
        if (!canceled) setStartup(data);
      } catch (e: any) {
        if (!canceled) setError(e.message ?? 'Не удалось загрузить стартап');
      } finally {
        if (!canceled) setLoading(false);
      }
    })();
    return () => {
      canceled = true;
    };
  }, [slug]);

  // metrics
  useEffect(() => {
    if (!startup) return;
    const id = startup.id ?? startup._id ?? startup.slug;
    if (!id) return;
    let canceled = false;
    (async () => {
      setMetricsLoading(true);
      setMetricsError(null);
      try {
        const url = `${METRICS_API}?startupId=${encodeURIComponent(String(id))}`;
        const res = await fetch(url, { credentials: 'include' });
        if (!res.ok) {
          const txt = await res.text();
          let msg = `Ошибка ${res.status}`;
          try {
            const json = JSON.parse(txt);
            msg = json.error ?? json.message ?? msg;
          } catch {}
          throw new Error(msg);
        }
        const data = (await res.json()) as MetricRecord[] | { data?: MetricRecord[] };
        const arr = Array.isArray(data) ? data : (Array.isArray((data as any).data) ? (data as any).data : []);
        const normalized = arr
          .map((m: { date: any }) => ({
            ...m,
            date: m.date ?? (m as any).timestamp ?? (m as any).createdAt ?? null,
          }))
          .filter((m: { date: null }) => m.date != null)
          .sort((a: { date: any }, b: { date: any }) => new Date(String(a.date)).getTime() - new Date(String(b.date)).getTime());
        if (!canceled) setMetrics(normalized);
      } catch (e: any) {
        if (!canceled) setMetricsError(e.message ?? 'Не удалось загрузить метрики');
      } finally {
        if (!canceled) setMetricsLoading(false);
      }
    })();
    return () => {
      canceled = true;
    };
  }, [startup]);

  // founder
  useEffect(() => {
    const founderId = startup?.founderId;
    if (!founderId) {
      setFounder(null);
      return;
    }
    let canceled = false;
    (async () => {
      setFounderLoading(true);
      setFounderError(null);
      try {
        const res = await fetch(`${USERS_API}/${encodeURIComponent(String(founderId))}`, { credentials: 'include' });
        if (res.status === 404) throw new Error('Автор не найден');
        if (!res.ok) {
          const txt = await res.text();
          let msg = `Ошибка ${res.status}`;
          try {
            const json = JSON.parse(txt);
            msg = json.error ?? json.message ?? msg;
          } catch {}
          throw new Error(msg);
        }
        const data = (await res.json()) as User;
        if (!canceled) setFounder(data);
      } catch (e: any) {
        if (!canceled) setFounderError(e.message ?? 'Не удалось загрузить автора');
      } finally {
        if (!canceled) setFounderLoading(false);
      }
    })();
    return () => {
      canceled = true;
    };
  }, [startup?.founderId]);

  // offers
  const loadOffers = async () => {
    if (!startup) return;
    const id = startup.id ?? startup._id ?? startup.slug;
    if (!id) return;
    setOffersLoading(true);
    setOffersError(null);
    try {
      const res = await fetch(`${OFFERS_API}?startupId=${encodeURIComponent(String(id))}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) {
        const txt = await res.text();
        let msg = `Ошибка ${res.status}`;
        try {
          const json = JSON.parse(txt);
          msg = json.error ?? json.message ?? msg;
        } catch {}
        throw new Error(msg);
      }
      const data = (await res.json()) as Offer[];
      setOffers(Array.isArray(data) ? data : (data as any).data ?? []);
    } catch (e: any) {
      setOffersError(e.message ?? 'Не удалось загрузить офферы');
    } finally {
      setOffersLoading(false);
    }
  };

  // investments
  const loadInvestments = async () => {
    if (!startup) return;
    const id = startup.id ?? startup._id ?? startup.slug;
    if (!id) return;
    setInvestmentsLoading(true);
    setInvestmentsError(null);
    try {
      // controller had: GET /api/investments/startup/{startupId}
      const res = await fetch(`${INVESTMENTS_API}/startup/${encodeURIComponent(String(id))}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) {
        const txt = await res.text();
        let msg = `Ошибка ${res.status}`;
        try {
          const json = JSON.parse(txt);
          msg = json.error ?? json.message ?? msg;
        } catch {}
        throw new Error(msg);
      }
      const data = (await res.json()) as Investment[];
      setInvestments(Array.isArray(data) ? data : (data as any).data ?? []);
    } catch (e: any) {
      setInvestmentsError(e.message ?? 'Не удалось загрузить инвестиции');
    } finally {
      setInvestmentsLoading(false);
    }
  };

  // load offers & investments when startup loaded
  useEffect(() => {
    if (!startup) return;
    loadOffers();
    loadInvestments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startup]);

  const idForApi = () => startup?.id ?? startup?._id ?? startup?.slug;

  async function handleDelete() {
    if (!startup) return;
    if (!window.confirm('Вы уверены, что хотите удалить этот стартап? Это действие нельзя отменить.')) return;
    const id = idForApi();
    if (!id) {
      alert('Не найден идентификатор для удаления');
      return;
    }
    try {
      setDeleting(true);
      const res = await fetch(`${API}/${encodeURIComponent(String(id))}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.status === 204 || res.ok) {
        navigate('/startups');
      } else {
        const txt = await res.text();
        let msg = `Ошибка ${res.status}`;
        try {
          const json = JSON.parse(txt);
          msg = json.error ?? json.message ?? msg;
        } catch {}
        throw new Error(msg);
      }
    } catch (e: any) {
      alert('Не удалось удалить: ' + (e.message ?? e));
    } finally {
      setDeleting(false);
    }
  }

  // create offer (investor)
  const submitOffer = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!startup || !user) {
      alert('Нужна авторизация и стартап');
      return;
    }
    if (!offerTitle || !offerAmount || !offerEquity) {
      alert('Заполните заголовок, сумму и долю');
      return;
    }
    setOfferSubmitting(true);
    try {
      const payload = {
        startupId: idForApi(),
        investorId: user.id,
        title: offerTitle,
        amount: Number(offerAmount),
        equityPercent: Number(offerEquity),
        type: 'term-sheet',
        visibility: offerVisibility,
        status: 'sent',
        attachments: [],
      };
      const res = await fetch(OFFERS_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const txt = await res.text();
        let msg = `Ошибка ${res.status}`;
        try {
          const json = JSON.parse(txt);
          msg = json.error ?? json.message ?? msg;
        } catch {}
        throw new Error(msg);
      }
      await loadOffers();
      setMakingOffer(false);
      setOfferTitle('');
      setOfferAmount('');
      setOfferEquity('');
    } catch (e: any) {
      alert('Не удалось создать offer: ' + (e.message ?? e));
    } finally {
      setOfferSubmitting(false);
    }
  };

  // update offer status (founder)
  const updateOfferStatus = async (offerId: string, status: string, note?: string) => {
    if (!offerId) return;
    try {
      const res = await fetch(`${OFFERS_API}/${encodeURIComponent(offerId)}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status, note }),
      });
      if (!res.ok) {
        const txt = await res.text();
        let msg = `Ошибка ${res.status}`;
        try {
          const json = JSON.parse(txt);
          msg = json.error ?? json.message ?? msg;
        } catch {}
        throw new Error(msg);
      }
      await loadOffers();
      // optionally reload investments if accepted -> might create investment on backend
      await loadInvestments();
    } catch (e: any) {
      alert('Не удалось обновить статус: ' + (e.message ?? e));
    }
  };
  
  // series for sparkline
  const mrrSeries = metrics?.map((m) => (m.mrr == null ? null : Number(m.mrr))) ?? [];
  const usersSeries = metrics?.map((m) => (m.activeUsers == null ? null : Number(m.activeUsers))) ?? [];
  const burnSeries = metrics?.map((m) => (m.burnRate == null ? null : Number(m.burnRate))) ?? [];
  
  const lastMetric = metrics && metrics.length > 0 ? metrics[metrics.length - 1] : null;
  const displayedMrr = lastMetric?.mrr ?? startup?.metricsSnapshot?.mrr ?? 0;
  const displayedUsers = lastMetric?.activeUsers ?? startup?.metricsSnapshot?.users ?? 0;
  const displayedBurn = lastMetric?.burnRate ?? null;
  const lastTimestamp = lastMetric?.date ?? startup?.updatedAt ?? startup?.createdAt ?? null;

  const isFounder = user && startup && (user.id === startup.founderId || user.id === startup.id || user.id === startup._id);
  
  const isInvestor = user && user.role === 'investor';

return (
  <div className="startup-page-container">
    {loading && <div className="page-loading">Загрузка...</div>}
    {error && <div className="page-error">Ошибка: {error}</div>}
    {!loading && !error && !startup && (
      <div className="page-not-found">Стартап не найден</div>
    )}

    {startup && (
      <article className="startup-detail-card">
        {/* HEADER */}
        <header className="startup-detail-header">
          <div className="detail-logo">
            <Logo name={startup.name} url={startup.logoUrl} />
          </div>
          
          <div className="detail-info">
            <h1 className="detail-title">
              {startup.name}
              <span className="detail-stage-badge">{startup.stage ?? '—'}</span>
              <span className="detail-industry">{startup.industry}</span>
            </h1>
            
            {startup.shortPitch && (
              <p className="detail-pitch">{startup.shortPitch}</p>
            )}

            {/* FOUNDER */}
            {startup.founderId && (
              <div className="founder-section">
                {founderLoading ? (
                  <div className="empty-message">Загрузка автора...</div>
                ) : founderError ? (
                  <div className="chart-error">{founderError}</div>
                ) : founder ? (
                  <button
                    onClick={() => navigate(`/users/${encodeURIComponent(String(founder.id ?? founder._id ?? startup.founderId))}`)}
                    className="founder-button"
                  >
                    {founder.avatarUrl ? (
                      <img src={founder.avatarUrl} alt={founder.name} className="founder-avatar" />
                    ) : (
                      <div className="founder-avatar-initials">
                        {(founder.name || founder.username || '').split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase() || 'U'}
                      </div>
                    )}
                    <span>{founder.name ?? founder.username ?? 'Профиль автора'}</span>
                  </button>
                ) : (
                  <div className="empty-message">Автор: {startup.founderId}</div>
                )}
              </div>
            )}

            {/* META INFO */}
            <div className="detail-meta">
              {startup.website && (() => {
                try {
                  return (
                    <a href={startup.website} target="_blank" rel="noreferrer" className="meta-link">
                      <Globe size={16} /> {new URL(String(startup.website)).hostname}
                    </a>
                  );
                } catch { return null; }
              })()}
              
              <div className="meta-item">
                <BarChart2 size={16} /> MRR: <strong>{displayedMrr}</strong>
              </div>
              
              <div className="meta-item">
                <FileText size={16} /> Files: <strong>{Array.isArray(startup.attachments) ? startup.attachments.length : 0}</strong>
              </div>
            </div>
          </div>

          {/* DATES */}
          <div className="detail-dates">
            <div className="date-label">Создано</div>
            <div className="date-value">{formatDate(startup.createdAt)}</div>
            <div className="date-label">Обновлено</div>
            <div className="date-value">{formatDate(startup.updatedAt)}</div>
          </div>
        </header>

        {/* DESCRIPTION */}
        <section className="content-section">
          <h3 className="section-title">Описание</h3>
          <p className="section-description">{startup.description ?? '—'}</p>
        </section>

        {/* METRICS */}
        <section className="content-section">
          <h3 className="section-title">Метрики</h3>
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-header">
                <div className="metric-info">
                  <div className="metric-label">MRR (последнее)</div>
                  <div className="metric-value">{displayedMrr}</div>
                  <div className="metric-timestamp">{lastTimestamp ? formatDate(lastTimestamp) : ''}</div>
                </div>
                <div className="metric-chart">
                  {metricsLoading ? (
                    <div className="chart-loading">Загрузка...</div>
                  ) : metricsError ? (
                    <div className="chart-error">{metricsError}</div>
                  ) : (
                    <Sparkline data={mrrSeries} />
                  )}
                </div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <div className="metric-info">
                  <div className="metric-label">Active Users</div>
                  <div className="metric-value">{displayedUsers}</div>
                  <div className="metric-timestamp">{lastTimestamp ? formatDate(lastTimestamp) : ''}</div>
                </div>
                <div className="metric-chart">
                  {metricsLoading ? (
                    <div className="chart-loading">Загрузка...</div>
                  ) : metricsError ? (
                    <div className="chart-error">{metricsError}</div>
                  ) : (
                    <Sparkline data={usersSeries} />
                  )}
                </div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <div className="metric-info">
                  <div className="metric-label">Burn Rate</div>
                  <div className="metric-value">{displayedBurn != null ? displayedBurn : '—'}</div>
                  <div className="metric-timestamp">{lastTimestamp ? formatDate(lastTimestamp) : ''}</div>
                </div>
                <div className="metric-chart">
                  {metricsLoading ? (
                    <div className="chart-loading">Загрузка...</div>
                  ) : metricsError ? (
                    <div className="chart-error">{metricsError}</div>
                  ) : (
                    <Sparkline data={burnSeries} />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* METRICS HISTORY */}
          <div className="metrics-history">
            <h4 className="history-title">История</h4>
            {metricsLoading && <div className="empty-message">Загрузка метрик...</div>}
            {metricsError && <div className="chart-error">{metricsError}</div>}
            {!metricsLoading && (!metrics || metrics.length === 0) && (
              <div className="empty-message">История метрик отсутствует.</div>
            )}
            {!metricsLoading && metrics && metrics.length > 0 && (
              <div className="history-table-wrapper">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Дата</th>
                      <th>MRR</th>
                      <th>Active Users</th>
                      <th>Burn Rate</th>
                      <th>Other</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.slice().reverse().map((m, i) => (
                      <tr key={m._id ?? i}>
                        <td>{formatDate(m.date)}</td>
                        <td>{m.mrr ?? '—'}</td>
                        <td>{m.activeUsers ?? '—'}</td>
                        <td>{m.burnRate ?? '—'}</td>
                        <td>{m.other ? JSON.stringify(m.other) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* VALUATION */}
        <section className="content-section">
          <h3 className="section-title">Оценка компании</h3>
          <div className="valuation-grid">
            <div className="valuation-card">
              <div className="valuation-label">Valuation Pre-Money</div>
              <div className="valuation-value">
                {lastMetric?.valuationPreMoney ?? startup?.metricsSnapshot?.valuationPreMoney ?? '—'}
              </div>
            </div>
            <div className="valuation-card">
              <div className="valuation-label">Valuation Post-Money</div>
              <div className="valuation-value">
                {lastMetric?.valuationPostMoney ?? startup?.metricsSnapshot?.valuationPostMoney ?? '—'}
              </div>
            </div>
          </div>
        </section>

        {/* FILES */}
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
                      <FileText size={16} /> {name}
                    </a>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-message">Файлы не добавлены</div>
          )}
        </section>

        {/* OFFERS */}
        <section className="content-section">
          <div className="dual-section">
            <div className="offers-card">
              <div className="card-header">
                <h3 className="card-title">Офферы</h3>
                {isInvestor && (
                  <button onClick={() => setMakingOffer(v => !v)} className="btn-make-offer">
                    {makingOffer ? 'Отмена' : 'Сделать offer'}
                  </button>
                )}
              </div>

              {makingOffer && isInvestor && (
                <form onSubmit={submitOffer} className="offer-form">
                  <input
                    placeholder="Заголовок оффера"
                    value={offerTitle}
                    onChange={(e) => setOfferTitle(e.target.value)}
                    className="form-input"
                    required
                  />
                  <div className="form-row">
                    <input
                      placeholder="Сумма (USD)"
                      type="number"
                      value={offerAmount}
                      onChange={(e) => setOfferAmount(e.target.value === '' ? '' : Number(e.target.value))}
                      className="form-input"
                      required
                    />
                    <input
                      placeholder="% доли"
                      type="number"
                      value={offerEquity}
                      onChange={(e) => setOfferEquity(e.target.value === '' ? '' : Number(e.target.value))}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-footer">
                    <label className="form-label">Видимость:</label>
                    <select value={offerVisibility} onChange={(e) => setOfferVisibility(e.target.value as any)} className="form-select">
                      <option value="private">private</option>
                      <option value="public">public</option>
                    </select>
                    <button type="submit" disabled={offerSubmitting} className="btn-submit">
                      {offerSubmitting ? 'Отправка...' : 'Отправить'}
                    </button>
                  </div>
                </form>
              )}

              <div>
                {offersLoading ? (
                  <div className="empty-message">Загрузка офферов...</div>
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
                            <div className="item-type">{o.type} • {o.visibility}</div>
                            <div className="item-title">{o.title}</div>
                            <div className="item-details">
                              {o.amount ? `$${o.amount}` : '—'} • {o.equityPercent ?? '—'}%
                            </div>
                            {o.note && <div className="item-note">{o.note}</div>}
                          </div>
                          <div className="item-meta">
                            <div className="item-date">{formatDate(o.createdAt)}</div>
                            <span className={`status-badge ${o.status}`}>{o.status}</span>
                          </div>
                        </div>
                        {isFounder && (
                          <div className="offer-actions">
                            <button onClick={() => updateOfferStatus(String(o._id ?? o.id), 'accepted')} className="btn-accept">
                              Принять
                            </button>
                            <button onClick={() => updateOfferStatus(String(o._id ?? o.id), 'rejected')} className="btn-reject">
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
          </div>
        </section>

        {/* ACTION BUTTONS */}
        <section className="action-buttons">
          <div className="primary-actions">
            <a href={startup.website || '#'} target="_blank" rel="noreferrer" className="btn-website">
              <ExternalLink size={16} /> Официальный сайт
            </a>
            <button onClick={() => navigate(`/startups/edit/${encodeURIComponent(String(idForApi()))}`)} className="btn-edit">
              Редактировать
            </button>
          </div>
          <button onClick={handleDelete} disabled={deleting} className="btn-delete">
            {deleting ? 'Удаление...' : 'Удалить'}
          </button>
        </section>
      </article>
    )}
  </div>
);
}
