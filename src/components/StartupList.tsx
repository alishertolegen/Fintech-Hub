// src/components/StartupsList.tsx
import React, { useMemo, useState, useEffect, JSX } from 'react';
import { Search, ExternalLink, BarChart2, Globe, FileText, TrendingUp, Users, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import './StartupsList.css';

const API = 'http://localhost:8080/api/startups';

type MetricsSnapshot = {
  mrr?: number | null;
  users?: number | null;
  valuationPreMoney?: number | null;
  valuationPostMoney?: number | null;
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

const STAGES = [
  { value: 'all', label: 'Все стадии' },
  { value: 'idea', label: 'Idea' },
  { value: 'incubation', label: 'Incubation' },
  { value: 'seed', label: 'Seed' },
  { value: 'growth', label: 'Growth' },
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
  } catch {
    return String(iso);
  }
}

function formatNumber(n?: number | null): string {
  if (n == null) return '—';
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

export default function StartupsList(): JSX.Element {
  const [startups, setStartups] = useState<Startup[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [showPrivate, setShowPrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [queryTrigger, setQueryTrigger] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setQueryTrigger((x) => x + 1), 300);
    return () => clearTimeout(t);
  }, [searchTerm, stageFilter, industryFilter, showPrivate]);

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

  const filtered = useMemo(() => {
    return startups.filter((s) => {
      if (!showPrivate && s.visibility === 'private') return false;
      if (stageFilter !== 'all' && s.stage !== stageFilter) return false;
      if (industryFilter !== 'all' && s.industry !== industryFilter) return false;
      const q = searchTerm.trim().toLowerCase();
      if (!q) return true;
      return (
        (s.name ?? '').toLowerCase().includes(q) ||
        (s.shortPitch ?? '').toLowerCase().includes(q) ||
        (s.description ?? '').toLowerCase().includes(q) ||
        (s.industry ?? '').toLowerCase().includes(q)
      );
    });
  }, [startups, searchTerm, stageFilter, industryFilter, showPrivate]);

  return (
    <div className="startups-container">

      {/* ═══ PAGE TITLE ═══ */}
      <div className="startups-page-title">
        <h1>Стартаптар</h1>
        <p className="startups-subtitle">Профили стартапов — основная коллекция</p>
      </div>

      {/* ═══ MAIN LAYOUT ═══ */}
      <div className="startups-layout">

        {/* ── SIDEBAR (filters) ── */}
        <aside className="startups-sidebar">

          <span className="sidebar-section-label">Стадия</span>
          {STAGES.map(({ value, label }) => (
            <button
              key={value}
              className={`sidebar-btn${stageFilter === value ? ' active' : ''}`}
              onClick={() => setStageFilter(value)}
            >
              <span className="sidebar-btn-dot" />
              {label}
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
            {industries.map((ind) => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>

          <div className="sidebar-divider" />

          <label className="sidebar-checkbox-label">
            <input
              type="checkbox"
              checked={showPrivate}
              onChange={(e) => setShowPrivate(e.target.checked)}
            />
            Показать private
          </label>

        </aside>

        {/* ── MAIN CONTENT ── */}
        <div className="startups-main">

          {/* Search + count row */}
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
                <button
                  className="search-clear"
                  onClick={() => setSearchTerm('')}
                  aria-label="Очистить"
                >
                  <X size={15} />
                </button>
              )}
            </div>
            <div className="startups-count">
              <strong>{filtered.length}</strong>&nbsp;найдено
            </div>
          </div>

          {/* States */}
          {loading && <div className="loading-state">Загрузка стартапов…</div>}
          {error && <div className="error-state">Ошибка: {error}</div>}

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

                    {/* Top: logo + name */}
                    <div className="startup-card-top">
                      <div className="startup-logo">
                        <Logo name={s.name} url={s.logoUrl} />
                      </div>
                      <div className="startup-header">
                        <div className="startup-name-row">
                          <h2>{s.name}</h2>
                          {s.stage && <span className="stage-badge">{s.stage}</span>}
                          {s.industry && <span className="industry-text">{s.industry}</span>}
                          {s.createdAt && (
                            <span className="created-date">{formatDate(s.createdAt)}</span>
                          )}
                        </div>
                        {s.shortPitch && <p className="short-pitch">{s.shortPitch}</p>}
                      </div>
                    </div>

                    {/* Body */}
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
                        </div>
                        <div className="metric-chip">
                          Val <strong>{formatNumber(activeValuation)}</strong>
                        </div>
                      </div>

                      {/* Description */}
                      {s.description && (
                        <p className="startup-description">{s.description}</p>
                      )}

                      {/* Footer */}
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