// src/pages/MyStartupsPage.tsx
import React, { useEffect, useMemo, useState, JSX } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, ExternalLink, BarChart2, FileText, Globe,
  Plus, TrendingUp, Users, Flame, EyeOff, X, ArrowUpDown,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import '../components/StartupsList.css';

const API = 'http://localhost:8080/api/startups';

type MetricsSnapshot = {
  mrr?: number | null;
  users?: number | null;
  activeUsers?: number | null;
  burnRate?: number | null;
  valuationPreMoney?: number | null;
  valuationPostMoney?: number | null;
  other?: number | null;
};

type Startup = {
  id?: string;
  _id?: string;
  name?: string;
  slug?: string;
  founderId?: any;
  founder?: any;
  stage?: string;
  industry?: string;
  shortPitch?: string;
  description?: string;
  website?: string;
  logoUrl?: string;
  metricsSnapshot?: MetricsSnapshot;
  attachments?: string[];
  createdAt?: string | number | Date;
  updatedAt?: string | number | Date;
  visibility?: string;
  valuationMode?: 'pre' | 'post' | null;
};

type SortKey = 'newest' | 'oldest' | 'mrr' | 'users' | 'valuation';
const INDUSTRIES = [
  { value: 'fintech',       label: '💳 Fintech'       },
  { value: 'saas',          label: '☁️ SaaS'          },
  { value: 'e-commerce',    label: '🛒 E-commerce'    },
  { value: 'edtech',        label: '🎓 EdTech'        },
  { value: 'healthtech',    label: '🏥 HealthTech'    },
  { value: 'ai-ml',         label: '🤖 AI / ML'       },
  { value: 'logistics',     label: '🚚 Logistics'     },
  { value: 'agritech',      label: '🌾 AgriTech'      },
  { value: 'cleantech',     label: '♻️ CleanTech'     },
  { value: 'proptech',      label: '🏠 PropTech'      },
  { value: 'legaltech',     label: '⚖️ LegalTech'     },
  { value: 'cybersecurity', label: '🔒 Cybersecurity' },
  { value: 'gaming',        label: '🎮 Gaming'        },
  { value: 'media',         label: '📱 Media'         },
  { value: 'marketplace',   label: '🏪 Marketplace'   },
  { value: 'hr-tech',       label: '👥 HR Tech'       },
  { value: 'biotech',       label: '🧬 Biotech'       },
  { value: 'construction',  label: '🏗️ Construction'  },
];
const STAGES = [
  { value: 'all',        label: 'Все' },
  { value: 'idea',       label: 'Idea' },
  { value: 'pre-seed', label: 'Pre-Seed' },
  { value: 'seed',       label: 'Seed' },
  { value: 'series-a',     label: 'Series-A'},
  { value: 'growth',     label: 'Growth' },
  { value: 'mature',     label: 'Mature' },
];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'newest',    label: 'Новые' },
  { value: 'oldest',    label: 'Старые' },
  { value: 'mrr',       label: 'MRR ↓' },
  { value: 'users',     label: 'Users ↓' },
  { value: 'valuation', label: 'Valuation ↓' },
];

function Logo({ name, url }: { name?: string; url?: string }) {
  if (url) return <img src={url} alt={name} className="logo-image" />;
  const initials = (name || '')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return <div className="logo-initials">{initials || 'S'}</div>;
}

function formatDate(iso?: string | number | Date): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return String(iso); }
}

function formatNumber(n?: number | null): string {
  if (n == null) return '—';
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

function sortStartups(list: Startup[], key: SortKey): Startup[] {
  return [...list].sort((a, b) => {
    switch (key) {
      case 'newest':
        return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
      case 'oldest':
        return new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime();
      case 'mrr':
        return (b.metricsSnapshot?.mrr ?? 0) - (a.metricsSnapshot?.mrr ?? 0);
      case 'users':
        return (b.metricsSnapshot?.users ?? 0) - (a.metricsSnapshot?.users ?? 0);
      case 'valuation': {
        const va = a.valuationMode === 'post' ? a.metricsSnapshot?.valuationPostMoney : a.metricsSnapshot?.valuationPreMoney;
        const vb = b.valuationMode === 'post' ? b.metricsSnapshot?.valuationPostMoney : b.metricsSnapshot?.valuationPreMoney;
        return (vb ?? 0) - (va ?? 0);
      }
      default: return 0;
    }
  });
}

export default function MyStartupsPage(): JSX.Element {
  const { user, token, loading: authLoading } = useAuth();

  const [startups, setStartups]       = useState<Startup[]>([]);
  const [searchTerm, setSearchTerm]   = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [sortKey, setSortKey]         = useState<SortKey>('newest');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);

  useEffect(() => {
    let canceled = false;
    if (!user) { setStartups([]); return; }

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const founderCandidate =
          (user as any).id ?? (user as any)._id ?? (user as any).userId ?? (user as any).sub ?? '';
        const params = new URLSearchParams();
        if (founderCandidate) params.set('founderId', String(founderCandidate));
        if (searchTerm.trim()) params.set('q', searchTerm.trim());

        const url = `${API}${params.toString() ? '?' + params.toString() : ''}`;
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(url, { headers, credentials: 'include' });
        if (!res.ok) {
          const txt = await res.text();
          let msg = `Ошибка ${res.status}`;
          try { const j = JSON.parse(txt); msg = j.error ?? j.message ?? msg; } catch {}
          throw new Error(msg);
        }

        const data = (await res.json()) as Startup[];
        if (canceled) return;

        const founder = String(founderCandidate);
        const mine = Array.isArray(data)
          ? data.filter((s) => {
              const candidates = [
                s.founderId,
                s.founder?._id,
                s.founder?.['id'],
                typeof s.founderId === 'object' ? s.founderId?._id ?? s.founderId?.id : undefined,
                typeof s.founder === 'string' ? s.founder : undefined,
              ].filter(Boolean).map(String);
              return founder ? candidates.includes(founder) : false;
            })
          : [];

        setStartups(mine);
      } catch (e: any) {
        if (!canceled) setError(e.message ?? 'Не удалось загрузить стартаптар');
      } finally {
        if (!canceled) setLoading(false);
      }
    })();

    return () => { canceled = true; };
  }, [user, token, searchTerm]);

  // Stage counts
  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    startups.forEach((s) => { if (s.stage) counts[s.stage] = (counts[s.stage] ?? 0) + 1; });
    return counts;
  }, [startups]);

  const filtered = useMemo(() => {
    let list = startups;
if (stageFilter !== 'all')  list = list.filter((s) => s.stage === stageFilter);
if (industryFilter !== 'all') list = list.filter((s) => s.industry === industryFilter);

    const q = searchTerm.trim().toLowerCase();
    if (q) {
      list = list.filter((s) =>
        [(s.name ?? ''), (s.shortPitch ?? ''), (s.description ?? ''), (s.industry ?? '')]
          .join(' ').toLowerCase().includes(q)
      );
    }
    return sortStartups(list, sortKey);
  }, [startups, searchTerm, stageFilter, industryFilter, sortKey]);

  // ── Auth states ──
  if (authLoading) return <div className="loading-state">Проверка авторизации...</div>;

  if (!user)
    return (
      <div className="empty-state" style={{ margin: '80px auto', maxWidth: 480 }}>
        <h3>Войдите, чтобы увидеть ваши стартапы</h3>
        <p>Только авторизованные пользователи могут просматривать личные стартапы.</p>
        <Link to="/login" className="btn-details" style={{ marginTop: 16, display: 'inline-flex' }}>
          Войти
        </Link>
      </div>
    );

  return (
    <div className="startups-container">

      {/* ═══ PAGE TITLE ═══ */}
      <div className="startups-page-title">
        <h1>Мои стартапы</h1>
        <p className="startups-subtitle">Стартапы, созданные вами</p>
      </div>

      {/* ═══ MAIN LAYOUT ═══ */}
      <div className="startups-layout">

        {/* ── SIDEBAR ── */}
        <aside className="startups-sidebar">

          <span className="sidebar-section-label">Стадия</span>
          {STAGES.map(({ value, label }) => (
            <button
              key={value}
              className={`sidebar-btn${stageFilter === value ? ' active' : ''}`}
              onClick={() => setStageFilter(value)}
            >
              <span className="sidebar-btn-dot" />
              <span className="sidebar-btn-label">{label}</span>
              <span className="sidebar-btn-count">
                {value === 'all' ? startups.length : (stageCounts[value] ?? 0)}
              </span>
            </button>
          ))}

          <div className="sidebar-divider" />
          
          <span className="sidebar-section-label">Отрасль</span>
<select
  value={industryFilter}
  onChange={(e) => setIndustryFilter(e.target.value)}
  className={`sidebar-select${industryFilter !== 'all' ? ' active' : ''}`}
>
  <option value="all">Все отрасли</option>
  {INDUSTRIES.map(({ value, label }) => (
    <option key={value} value={value}>{label}</option>
  ))}
</select>

<div className="sidebar-divider" />

          {/* Create button in sidebar */}
          <Link to="/startups/create" className="btn-details" style={{ justifyContent: 'center', marginTop: 4 }}>
            <Plus size={14} /> Создать стартап
          </Link>

        </aside>

        {/* ── MAIN CONTENT ── */}
        <div className="startups-main">

          {/* Search + sort + count */}
          <div className="startups-search-row">
            <div className="search-wrapper">
              <Search className="search-icon" size={18} />
              <input
                className="search-input"
                placeholder="Поиск по названию, pitch, отрасли…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="search-clear" onClick={() => setSearchTerm('')} aria-label="Очистить">
                  <X size={15} />
                </button>
              )}
            </div>

            <div className="sort-wrapper">
              <ArrowUpDown size={14} className="sort-icon" />
              <select
                className="sort-select"
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
              >
                {SORT_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div className="startups-count">
              <strong>{filtered.length}</strong>&nbsp;найдено
            </div>
          </div>

          {/* States */}
          {loading && <div className="loading-state">Загрузка...</div>}
          {error   && <div className="error-state">Ошибка: {error}</div>}

          {/* Grid */}
          {!loading && !error && (
            <div className="startups-grid">
              {filtered.map((s) => {
                const key = s.id ?? s._id ?? s.slug ?? Math.random().toString(36).slice(2, 9);
                const valuationMode = s.valuationMode ?? 'pre';
                const activeValuation =
                  valuationMode === 'pre'
                    ? s.metricsSnapshot?.valuationPreMoney
                    : s.metricsSnapshot?.valuationPostMoney;

                return (
                  <article key={key} className="startup-card">

                    <div className="startup-card-top">
                      <div className="startup-logo">
                        <Logo name={s.name} url={s.logoUrl} />
                      </div>
                      <div className="startup-header">
                        <div className="startup-name-row">
                          <h2>{s.name}</h2>
                          {s.stage && <span className="stage-badge">{s.stage}</span>}
                          {s.visibility === 'private' && (
                            <span className="private-badge"><EyeOff size={10}/> private</span>
                          )}
                          {s.createdAt && (
                            <span className="created-date">{formatDate(s.createdAt)}</span>
                          )}
                        </div>
                        {s.industry && (
  <span className="industry-pill">
    {INDUSTRIES.find(i => i.value === s.industry)?.label ?? s.industry}
  </span>
)}
                        {s.shortPitch && <p className="short-pitch">{s.shortPitch}</p>}
                      </div>
                    </div>

                    <div className="startup-content">

                      <div className="startup-metrics">
                        <div className="metric-chip">
                          <TrendingUp size={11} />
                          MRR <strong>{formatNumber(s.metricsSnapshot?.mrr)}</strong>
                        </div>
                        <div className="metric-chip">
                          <Users size={11} />
                          <strong>{s.metricsSnapshot?.users?.toLocaleString() ?? '—'}</strong>
                          {s.metricsSnapshot?.activeUsers != null && (
                            <span className="metric-sub">
                              /{s.metricsSnapshot.activeUsers.toLocaleString()} active
                            </span>
                          )}
                        </div>
                        <div className="metric-chip">
                          Val&nbsp;<strong>{formatNumber(activeValuation)}</strong>
                          <span className="metric-sub">{valuationMode}</span>
                        </div>
                        {s.metricsSnapshot?.burnRate != null && (
                          <div className="metric-chip metric-chip--burn">
                            <Flame size={11} />
                            <strong>${s.metricsSnapshot.burnRate.toLocaleString()}</strong>
                          </div>
                        )}
                      </div>

                      {s.description && (
                        <p className="startup-description">{s.description}</p>
                      )}

                      <div className="startup-footer">
                        <div className="startup-meta">
                          {s.website && (() => {
                            try {
                              return (
                                <a href={s.website} target="_blank" rel="noreferrer" className="meta-link">
                                  <Globe size={13} />
                                  {new URL(s.website).hostname}
                                </a>
                              );
                            } catch { return null; }
                          })()}
                          <div className="meta-info">
                            <BarChart2 size={13} />
                            {s.attachments?.length ?? 0} files
                          </div>
                        </div>
                        <div className="startup-actions">
                          <Link to={`/startups/${s.id ?? s._id}`} className="btn-details">
                            <FileText size={14} /> Подробнее
                          </Link>
                          <a href={s.website || '#'} target="_blank" rel="noreferrer" className="btn-website">
                            <ExternalLink size={14} /> Сайт
                          </a>
                        </div>
                      </div>
                    </div>

                  </article>
                );
              })}

              {filtered.length === 0 && (
                <div className="empty-state">
                  <h3>Стартаптар табылмады</h3>
                  <p>У вас пока нет созданных стартапов — нажмите «Создать стартап».</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}