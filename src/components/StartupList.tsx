// src/components/StartupsList.tsx
import React, { useMemo, useState, useEffect, JSX } from 'react';
import {
  Search, ExternalLink, BarChart2, Globe, FileText,
  TrendingUp, Users, X, ArrowUpDown, Flame, Eye, EyeOff,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import './StartupsList.css';

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
  founderId?: string;
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
type VisibilityFilter = 'all' | 'public' | 'private';
type MrrRange = 'all' | '0' | '1k' | '10k' | '100k';

const STAGES = [
  { value: 'all',        label: 'Все' },
  { value: 'idea',       label: 'Idea' },
  { value: 'incubation', label: 'Incubation' },
  { value: 'seed',       label: 'Seed' },
  { value: 'growth',     label: 'Growth' },
];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'newest',    label: 'Новые' },
  { value: 'oldest',    label: 'Старые' },
  { value: 'mrr',       label: 'MRR ↓' },
  { value: 'users',     label: 'Users ↓' },
  { value: 'valuation', label: 'Valuation ↓' },
];

const MRR_RANGES: { value: MrrRange; label: string }[] = [
  { value: 'all',   label: 'Любой' },
  { value: '0',     label: '$0' },
  { value: '1k',    label: '$1K+' },
  { value: '10k',   label: '$10K+' },
  { value: '100k',  label: '$100K+' },
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

function matchMrrRange(mrr: number | null | undefined, range: MrrRange): boolean {
  if (range === 'all') return true;
  const v = mrr ?? 0;
  if (range === '0')    return v === 0;
  if (range === '1k')   return v >= 1_000;
  if (range === '10k')  return v >= 10_000;
  if (range === '100k') return v >= 100_000;
  return true;
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

export default function StartupsList(): JSX.Element {
  const [startups, setStartups]         = useState<Startup[]>([]);
  const [searchTerm, setSearchTerm]     = useState('');
  const [stageFilter, setStageFilter]   = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [visibility, setVisibility]     = useState<VisibilityFilter>('all');
  const [mrrRange, setMrrRange]         = useState<MrrRange>('all');
  const [hasBurnRate, setHasBurnRate]   = useState(false);
  const [sortKey, setSortKey]           = useState<SortKey>('newest');
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState<string | null>(null);

  const [queryTrigger, setQueryTrigger] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setQueryTrigger((x) => x + 1), 300);
    return () => clearTimeout(t);
  }, [searchTerm, stageFilter, industryFilter, visibility]);

  useEffect(() => {
    let canceled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (stageFilter !== 'all') params.set('stage', stageFilter);
        if (industryFilter !== 'all') params.set('industry', industryFilter);
        if (searchTerm.trim()) params.set('q', searchTerm.trim());
        if (visibility !== 'all') params.set('visibility', visibility);

        const url = params.toString() ? `${API}?${params}` : API;
        const res = await fetch(url, { credentials: 'include' });
        if (!res.ok) {
          const txt = await res.text();
          let msg = `Ошибка ${res.status}`;
          try { const j = JSON.parse(txt); msg = j.error ?? j.message ?? msg; } catch {}
          throw new Error(msg);
        }
        const data = (await res.json()) as Startup[];
        if (!canceled) setStartups(Array.isArray(data) ? data : []);
      } catch (e: any) {
        if (!canceled) setError(e.message ?? 'Не удалось загрузить стартапы');
      } finally {
        if (!canceled) setLoading(false);
      }
    })();
    return () => { canceled = true; };
  }, [queryTrigger]);

  const industries = useMemo(() => {
    const s = new Set<string>();
    startups.forEach((st) => { if (st.industry) s.add(st.industry); });
    return Array.from(s).sort();
  }, [startups]);

  // Count startups per stage (for badges)
  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    startups.forEach((s) => {
      if (s.stage) counts[s.stage] = (counts[s.stage] ?? 0) + 1;
    });
    return counts;
  }, [startups]);

  const filtered = useMemo(() => {
    const list = startups.filter((s) => {
      if (visibility === 'public'  && s.visibility !== 'public')  return false;
      if (visibility === 'private' && s.visibility !== 'private') return false;
      if (stageFilter !== 'all'    && s.stage !== stageFilter)    return false;
      if (industryFilter !== 'all' && s.industry !== industryFilter) return false;
      if (!matchMrrRange(s.metricsSnapshot?.mrr, mrrRange)) return false;
      if (hasBurnRate && !s.metricsSnapshot?.burnRate) return false;

      const q = searchTerm.trim().toLowerCase();
      if (!q) return true;
      return (
        (s.name ?? '').toLowerCase().includes(q) ||
        (s.shortPitch ?? '').toLowerCase().includes(q) ||
        (s.description ?? '').toLowerCase().includes(q) ||
        (s.industry ?? '').toLowerCase().includes(q)
      );
    });
    return sortStartups(list, sortKey);
  }, [startups, searchTerm, stageFilter, industryFilter, visibility, mrrRange, hasBurnRate, sortKey]);

  const hasActiveFilters =
    stageFilter !== 'all' || industryFilter !== 'all' ||
    visibility !== 'all' || mrrRange !== 'all' || hasBurnRate;

  function resetFilters() {
    setStageFilter('all');
    setIndustryFilter('all');
    setVisibility('all');
    setMrrRange('all');
    setHasBurnRate(false);
  }

  return (
    <div className="startups-container">

      {/* ═══ PAGE TITLE ═══ */}
      <div className="startups-page-title">
        <h1>Стартаптар</h1>
        <p className="startups-subtitle">Профили стартапов — основная коллекция</p>
      </div>

      {/* ═══ MAIN LAYOUT ═══ */}
      <div className="startups-layout">

        {/* ── SIDEBAR ── */}
        <aside className="startups-sidebar">

          {/* Stage */}
          <span className="sidebar-section-label">Стадия</span>
          {STAGES.map(({ value, label }) => (
            <button
              key={value}
              className={`sidebar-btn${stageFilter === value ? ' active' : ''}`}
              onClick={() => setStageFilter(value)}
            >
              <span className="sidebar-btn-dot" />
              <span className="sidebar-btn-label">{label}</span>
              {value !== 'all' && stageCounts[value] != null && (
                <span className="sidebar-btn-count">{stageCounts[value]}</span>
              )}
              {value === 'all' && (
                <span className="sidebar-btn-count">{startups.length}</span>
              )}
            </button>
          ))}

          <div className="sidebar-divider" />

          {/* Industry */}
          <span className="sidebar-section-label">Отрасль</span>
          <select
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            className={`sidebar-select${industryFilter !== 'all' ? ' active' : ''}`}
          >
            <option value="all">Все отрасли</option>
            {industries.map((ind) => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>

          <div className="sidebar-divider" />

          {/* Visibility */}
          <span className="sidebar-section-label">Видимость</span>
          <div className="sidebar-btn-group">
            {(['all', 'public', 'private'] as VisibilityFilter[]).map((v) => (
              <button
                key={v}
                className={`sidebar-pill${visibility === v ? ' active' : ''}`}
                onClick={() => setVisibility(v)}
              >
                {v === 'all' ? 'Все' : v === 'public' ? <><Eye size={12}/> Public</> : <><EyeOff size={12}/> Private</>}
              </button>
            ))}
          </div>

          <div className="sidebar-divider" />

          {/* MRR Range */}
          <span className="sidebar-section-label">MRR</span>
          <div className="sidebar-range-grid">
            {MRR_RANGES.map(({ value, label }) => (
              <button
                key={value}
                className={`sidebar-pill${mrrRange === value ? ' active' : ''}`}
                onClick={() => setMrrRange(value)}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="sidebar-divider" />

          {/* Burn Rate */}
          <label className="sidebar-checkbox-label">
            <input
              type="checkbox"
              checked={hasBurnRate}
              onChange={(e) => setHasBurnRate(e.target.checked)}
            />
            <Flame size={13} style={{ opacity: 0.6 }} />
            Есть Burn Rate
          </label>

          {/* Reset */}
          {hasActiveFilters && (
            <button className="sidebar-reset" onClick={resetFilters}>
              <X size={12} /> Сбросить фильтры
            </button>
          )}

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
          {loading && <div className="loading-state">Загрузка стартапов…</div>}
          {error   && <div className="error-state">Ошибка: {error}</div>}

          {/* Grid */}
          {!loading && !error && (
            <div className="startups-grid">
              {filtered.map((s) => {
                const key = s.id ?? s._id ?? s.slug ?? Math.random().toString(36).slice(2, 9);
                const valuationMode  = s.valuationMode ?? 'pre';
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
                        {s.industry  && <span className="industry-pill">{s.industry}</span>}
                        {s.shortPitch && <p className="short-pitch">{s.shortPitch}</p>}
                      </div>
                    </div>

                    <div className="startup-content">

                      {/* Metrics */}
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
                  <p>Попробуйте изменить поисковый запрос или фильтры.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}