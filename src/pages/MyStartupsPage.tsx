// src/pages/MyStartupsPage.tsx
import React, { useEffect, useMemo, useState, JSX } from 'react';
import { Link } from 'react-router-dom';
import { Search, ExternalLink, BarChart2, FileText, Globe, Plus } from 'lucide-react';
import { useAuth } from '../auth/AuthContext'; // поправь путь, если нужно

const API = 'http://localhost:8080/api/startups';

type MetricsSnapshot = { mrr?: number | null; users?: number | null };

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
  if (url) return <img src={url} alt={name} className="w-14 h-14 rounded-md object-cover" />;
  const initials = (name || '')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <div className="w-14 h-14 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-semibold">
      {initials || 'S'}
    </div>
  );
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

  // Fetch only user's startups
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
        const params = new URLSearchParams();
        // backend должен поддерживать фильтр founderId — если нет, замените на подходящий (например /api/users/me/startups)
        params.set('founderId', user.id ?? '');
        if (searchTerm.trim()) params.set('q', searchTerm.trim());

        const url = `${API}?${params.toString()}`;

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
        if (!canceled) setStartups(Array.isArray(data) ? data : []);
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

  if (authLoading) {
    return <div className="p-6 text-center">Проверка авторизации...</div>;
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h2 className="text-xl font-semibold">Войдите, чтобы увидеть ваши стартапы</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Только авторизованные пользователи могут просматривать личные стартапы.</p>
        <div className="mt-4">
          <Link to="/login" className="py-2 px-4 rounded-md border inline-block">
            Войти
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="flex items-start justify-between gap-6 mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Менің стартаптарым / Мои стартапы</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Список стартапов, созданных вами</p>
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">Найдено: <strong>{filtered.length}</strong></div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2 text-gray-400" />
            <input
              className="pl-10 pr-4 py-2 border rounded-md w-72 bg-white dark:bg-zinc-900"
              placeholder="Поиск по названию или описанию..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Link
            to="/startups/new"
            className="inline-flex items-center gap-2 py-2 px-3 rounded-md bg-indigo-600 text-white"
          >
            <Plus size={16} /> Создать стартап
          </Link>
        </div>
      </header>

      {loading && <div className="p-6 text-center bg-white dark:bg-zinc-900 rounded-2xl mb-4">Загрузка...</div>}
      {error && <div className="p-4 text-center text-red-600 bg-white dark:bg-zinc-900 rounded-2xl mb-4">Ошибка: {error}</div>}

      <div className="grid gap-4">
        {filtered.map((s) => {
          const key = s.id ?? s._id ?? s.slug ?? Math.random().toString(36).slice(2, 9);
          return (
            <article key={key} className="bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-sm flex gap-4 items-start">
              <div className="flex-shrink-0">
                <Logo name={s.name} url={s.logoUrl} />
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold flex items-center gap-3">
                      {s.name}
                      <span className="text-xs py-1 px-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200">{s.stage}</span>
                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">{s.industry}</span>
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{s.shortPitch}</p>
                  </div>

                  <div className="text-right text-sm text-gray-600 dark:text-gray-400">
                    <div>MRR: <strong>{s.metricsSnapshot?.mrr ?? 0}</strong></div>
                    <div>Users: <strong>{s.metricsSnapshot?.users ?? 0}</strong></div>
                    <div className="mt-2 text-xs">{formatDate(s.createdAt)}</div>
                  </div>
                </div>

                <p className="mt-3 text-sm text-gray-700 dark:text-gray-300 line-clamp-3">{s.description}</p>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    {s.website && (() => {
                      try {
                        return (
                          <a href={s.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1">
                            <Globe size={14} /> {new URL(s.website).hostname}
                          </a>
                        );
                      } catch {
                        return null;
                      }
                    })()}

                    <div className="inline-flex items-center gap-1"><BarChart2 size={14} /> {s.attachments?.length ?? 0} files</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      to={`/startups/${s.id ?? s._id}`}
                      className="inline-flex items-center gap-2 py-1 px-3 border rounded-md text-sm"
                    >
                      <FileText size={14} /> Подробнее
                    </Link>

                    <a
                      href={s.website || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 py-1 px-3 rounded-md text-sm bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                    >
                      <ExternalLink size={14} /> Сайт
                    </a>
                  </div>
                </div>
              </div>
            </article>
          );
        })}

        {filtered.length === 0 && !loading && (
          <div className="p-6 text-center text-gray-600 dark:text-gray-400 bg-white dark:bg-zinc-900 rounded-2xl">
            <h3 className="text-lg font-medium">Стартаптар табылмады</h3>
            <p className="mt-2">У вас пока нет созданных стартапов — начните с кнопки «Создать стартап».</p>
          </div>
        )}
      </div>
    </div>
  );
}
