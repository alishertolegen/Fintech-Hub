// src/components/StartupsList.tsx
import React, { useMemo, useState, useEffect, JSX } from 'react';
import { Search, ExternalLink, BarChart2, Globe, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import './StartupsList.css';

const API = 'http://localhost:8080/api/startups';

type MetricsSnapshot = { mrr?: number | null; users?: number | null; valuationPreMoney?: number | null };

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
};

function Logo({ name, url }: { name?: string; url?: string }) {
  if (url) return <img src={url} alt={name} className="logo-image" />;
  const initials = (name || '')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <div className="logo-initials">
      {initials || 'S'}
    </div>
  );
}

function formatDate(iso?: string | number | Date): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString();
  } catch (e) {
    return String(iso);
  }
}

export default function StartupsList(): JSX.Element {
  const [startups, setStartups] = useState<Startup[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [showPrivate, setShowPrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce search & filters
  const [queryTrigger, setQueryTrigger] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setQueryTrigger((x) => x + 1), 300);
    return () => clearTimeout(t);
  }, [searchTerm, stageFilter, industryFilter, showPrivate]);

  // Fetch from backend
  useEffect(() => {
    let canceled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (stageFilter && stageFilter !== 'all') params.set('stage', stageFilter);
        if (industryFilter && industryFilter !== 'all') params.set('industry', industryFilter);
        if (searchTerm && searchTerm.trim().length > 0) params.set('q', searchTerm.trim());

        const url = params.toString() ? `${API}?${params.toString()}` : API;
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
        const data = (await res.json()) as Startup[];
        if (!canceled) {
          setStartups(Array.isArray(data) ? data : []);
        }
      } catch (e: any) {
        if (!canceled) setError(e.message ?? 'Не удалось загрузить стартапы');
      } finally {
        if (!canceled) setLoading(false);
      }
    })();
    return () => {
      canceled = true;
    };
  }, [queryTrigger]);

  // Industries list
  const industries = useMemo(() => {
    const s = new Set<string>();
    startups.forEach((st) => {
      if (st.industry) s.add(st.industry);
    });
    return Array.from(s).sort();
  }, [startups]);

  // Local filtered view
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
      <header className="startups-header">
        <div className="startups-title-section">
          <h1>Стартаптар</h1>
          <p className="startups-subtitle">Профили стартапов — основная коллекция</p>
          <div className="startups-count">Найдено: <strong>{filtered.length}</strong></div>
        </div>

        <div className="startups-filters">
          <div className="search-wrapper">
            <Search className="search-icon" size={20} />
            <input
              className="search-input"
              placeholder="Поиск стартапа, pitch, отрасль..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">Все стадии</option>
            <option value="idea">Idea</option>
            <option value="incubation">Incubation</option>
            <option value="seed">Seed</option>
            <option value="growth">Growth</option>
          </select>

          <select
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">Все отрасли</option>
            {industries.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>

          <label className="checkbox-label">
            <input type="checkbox" checked={showPrivate} onChange={(e) => setShowPrivate(e.target.checked)} />
            Показать private
          </label>
        </div>
      </header>

      {loading && (
        <div className="loading-state">Загрузка...</div>
      )}

      {error && (
        <div className="error-state">
          Ошибка: {error}
        </div>
      )}

      <div className="startups-grid">
        {filtered.map((s) => {
          const key = s.id ?? s._id ?? s.slug ?? Math.random().toString(36).slice(2, 9);
          return (
            <article key={key} className="startup-card">
              <div className="startup-logo">
                <Logo name={s.name} url={s.logoUrl} />
              </div>

              <div className="startup-content">
                <div className="startup-header">
                  <div className="startup-title-wrapper">
                    <h2>
                      {s.name}
                      <span className="stage-badge">{s.stage}</span>
                      <span className="industry-text">{s.industry}</span>
                    </h2>
                    <p className="short-pitch">{s.shortPitch}</p>
                  </div>

                  <div className="startup-metrics">
                    <div>MRR: <strong>{s.metricsSnapshot?.mrr ?? 0}</strong></div>
                    <div>Users: <strong>{s.metricsSnapshot?.users ?? 0}</strong></div>
                    <div>Valuation: <strong>{s.metricsSnapshot?.valuationPreMoney ?? 0}</strong></div>
                    <div className="created-date">{formatDate(s.createdAt)}</div>
                  </div>
                </div>

                <p className="startup-description">{s.description}</p>

                <div className="startup-footer">
                  <div className="startup-meta">
                    {s.website && (() => {
                      try {
                        return (
                          <a href={s.website} target="_blank" rel="noreferrer" className="meta-link">
                            <Globe size={14} /> {new URL(s.website).hostname}
                          </a>
                        );
                      } catch {
                        return null;
                      }
                    })()}

                    <div className="meta-info">
                      <BarChart2 size={14} /> {s.attachments?.length ?? 0} files
                    </div>
                  </div>

                  <div className="startup-actions">
                    <Link
                      to={`/startups/${s.id ?? s._id}`}
                      className="btn-details"
                    >
                      <FileText size={16} /> Подробнее
                    </Link>

                    <a
                      href={s.website || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-website"
                    >
                      <ExternalLink size={16} /> Сайт
                    </a>
                  </div>
                </div>
              </div>
            </article>
          );
        })}

        {filtered.length === 0 && !loading && (
          <div className="empty-state">
            <h3>Стартаптар табылмады</h3>
            <p>Попробуйте изменить поисковый запрос или фильтры.</p>
          </div>
        )}
      </div>
    </div>
  );
}