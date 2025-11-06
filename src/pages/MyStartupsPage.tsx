// src/pages/MyStartupsPage.tsx
import React, { useEffect, useMemo, useState, JSX } from 'react';
import { Link } from 'react-router-dom';
import { Search, ExternalLink, BarChart2, FileText, Globe, Plus } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import './StartupsList.css'; 

const API = 'http://localhost:8080/api/startups';

type MetricsSnapshot = {
  mrr?: number | null;
  users?: number | null;
  valuationPreMoney?: number | null;
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
};

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
    return new Date(iso).toLocaleDateString();
  } catch {
    return String(iso);
  }
}

export default function MyStartupsPage(): JSX.Element {
  const { user, token, loading: authLoading } = useAuth();
  const [startups, setStartups] = useState<Startup[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let canceled = false;
    if (!user) {
      setStartups([]);
      return;
    }

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
          try {
            const json = JSON.parse(txt);
            msg = json.error ?? json.message ?? msg;
          } catch {}
          throw new Error(msg);
        }

        const data = (await res.json()) as Startup[];
        if (canceled) return;

        const founder = String(founderCandidate);
        const filtered = Array.isArray(data)
          ? data.filter((s) => {
              const candidates = [
                s.founderId,
                s.founder?._id,
                s.founder?.['id'],
                typeof s.founderId === 'object' ? s.founderId?._id ?? s.founderId?.id : undefined,
                typeof s.founder === 'string' ? s.founder : undefined,
              ]
                .filter(Boolean)
                .map(String);
              return founder ? candidates.includes(founder) : false;
            })
          : [];

        setStartups(filtered);
      } catch (e: any) {
        if (!canceled) setError(e.message ?? 'Не удалось загрузить стартаптар');
      } finally {
        if (!canceled) setLoading(false);
      }
    })();

    return () => {
      canceled = true;
    };
  }, [user, token, searchTerm]);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return startups;
    return startups.filter((s) =>
      [(s.name ?? ''), (s.shortPitch ?? ''), (s.description ?? ''), (s.industry ?? '')]
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [startups, searchTerm]);

  if (authLoading) return <div className="loading-state">Проверка авторизации...</div>;

  if (!user)
    return (
      <div className="empty-state">
        <h3>Войдите, чтобы увидеть ваши стартапы</h3>
        <p>Только авторизованные пользователи могут просматривать личные стартапы.</p>
        <Link to="/login" className="btn-details">
          Войти
        </Link>
      </div>
    );

  return (
    <div className="startups-container">
      <header className="startups-header">
        <div className="startups-title-section">
          <h1>Менің стартаптарым / Мои стартапы</h1>
          <p className="startups-subtitle">Список стартапов, созданных вами</p>
          <div className="startups-count">
            Найдено: <strong>{filtered.length}</strong>
          </div>
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

          <Link to="/startups/create" className="btn-details">
            <Plus size={16} /> Создать стартап
          </Link>
        </div>
      </header>

      {loading && <div className="loading-state">Загрузка...</div>}
      {error && <div className="error-state">Ошибка: {error}</div>}

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
                    <Link to={`/startups/${s.id ?? s._id}`} className="btn-details">
                      <FileText size={16} /> Подробнее
                    </Link>
                    <a href={s.website || '#'} target="_blank" rel="noreferrer" className="btn-website">
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
            <p>У вас пока нет созданных стартапов — начните с кнопки «Создать стартап».</p>
          </div>
        )}
      </div>
    </div>
  );
}
