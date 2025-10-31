// src/components/StartupsList.tsx
import React, { useMemo, useState, useEffect, JSX } from 'react';
import { Search, ExternalLink, BarChart2, Briefcase, Globe, FileText } from 'lucide-react';

const API = 'http://localhost:8080/api/startups';
// process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/startups` : 
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

  // Debounce search & filters to avoid too many requests
  const [queryTrigger, setQueryTrigger] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setQueryTrigger((x) => x + 1), 300);
    return () => clearTimeout(t);
  }, [searchTerm, stageFilter, industryFilter, showPrivate]);

  // Fetch from backend (uses query params supported by backend)
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
    // queryTrigger включён чтобы дебаунс работал
  }, [queryTrigger]);

  // industries list from loaded startups (unique)
  const industries = useMemo(() => {
    const s = new Set<string>();
    startups.forEach((st) => {
      if (st.industry) s.add(st.industry);
    });
    return Array.from(s).sort();
  }, [startups]);

  // local filtered view (in addition to server filters we might have)
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
    <div className="max-w-6xl mx-auto p-6">
      <header className="flex items-start justify-between gap-6 mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Стартаптар</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Профили стартапов — основная коллекция</p>
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">Найдено: <strong>{filtered.length}</strong></div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2 text-gray-400" />
            <input
              className="pl-10 pr-4 py-2 border rounded-md w-80 bg-white dark:bg-zinc-900"
              placeholder="Поиск стартапа, pitch, отрасль..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="py-2 px-3 border rounded-md bg-white dark:bg-zinc-900"
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
            className="py-2 px-3 border rounded-md bg-white dark:bg-zinc-900"
          >
            <option value="all">Все отрасли</option>
            {industries.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>

          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={showPrivate} onChange={(e) => setShowPrivate(e.target.checked)} />
            Показать private
          </label>
        </div>
      </header>

      {loading && (
        <div className="p-6 text-center bg-white dark:bg-zinc-900 rounded-2xl mb-4">Загрузка...</div>
      )}

      {error && (
        <div className="p-4 text-center text-red-600 bg-white dark:bg-zinc-900 rounded-2xl mb-4">
          Ошибка: {error}
        </div>
      )}

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
                    <a
                      href={`/startups/${s.slug}`}
                      className="inline-flex items-center gap-2 py-1 px-3 border rounded-md text-sm"
                    >
                      <FileText size={14} /> Подробнее
                    </a>

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
            <p className="mt-2">Попробуйте изменить поисковый запрос или фильтры.</p>
          </div>
        )}
      </div>
    </div>
  );
}
