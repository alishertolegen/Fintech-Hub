// src/pages/StartupPage.tsx
import React, { JSX, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ExternalLink, BarChart2, FileText, Globe } from 'lucide-react';

const API = 'http://localhost:8080/api/startups';
const METRICS_API = 'http://localhost:8080/api/startup-metrics';

type MetricsSnapshot = { mrr?: number | null; users?: number | null };

type MetricRecord = {
  _id?: string;
  startupId?: string;
  date?: string | number | Date; // ваша "date" (в примере — точка времени, например месяц)
  mrr?: number | null;
  activeUsers?: number | null;
  burnRate?: number | null;
  other?: Record<string, any> | null;
  // возможны дополнительные поля
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

/** Простой sparkline на SVG для массива чисел */
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

  // last valid point
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

      {/* fill */}
      <path d={`${pathD} L ${w - pad} ${h - pad} L ${pad} ${h - pad} Z`} fill="url(#grad)" stroke="none" />

      {/* line */}
      <path d={pathD} fill="none" stroke="currentColor" strokeWidth={1.5} style={{ color: '#4f46e5' }} />

      {/* last dot */}
      {lastPoint && <circle cx={lastPoint[0]} cy={lastPoint[1]} r={2.5} fill="#4f46e5" />}
    </svg>
  );
}

export default function StartupPage(): JSX.Element {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [startup, setStartup] = useState<Startup | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Метрики
  const [metrics, setMetrics] = useState<MetricRecord[] | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [metricsError, setMetricsError] = useState<string | null>(null);

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

  // Когда стартап загружен — запрашиваем метрики
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
        // Нормализация: поле date, потом fallback на timestamp/createdAt
        const normalized = arr
          .map((m: { date: any; }) => ({
            ...m,
            date: m.date ?? (m as any).timestamp ?? (m as any).createdAt ?? null,
          }))
          .filter((m: { date: null; }) => m.date != null)
          .sort((a: { date: any; }, b: { date: any; }) => new Date(String(a.date)).getTime() - new Date(String(b.date)).getTime());
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

  // серии для sparkline (используем mrr и activeUsers)
  const mrrSeries = metrics?.map((m) => (m.mrr == null ? null : Number(m.mrr))) ?? [];
  const usersSeries = metrics?.map((m) => (m.activeUsers == null ? null : Number(m.activeUsers))) ?? [];
  const burnSeries = metrics?.map((m) => (m.burnRate == null ? null : Number(m.burnRate))) ?? [];

  const lastMetric = metrics && metrics.length > 0 ? metrics[metrics.length - 1] : null;
  const displayedMrr = lastMetric?.mrr ?? startup?.metricsSnapshot?.mrr ?? 0;
  const displayedUsers = lastMetric?.activeUsers ?? startup?.metricsSnapshot?.users ?? 0;
  const displayedBurn = lastMetric?.burnRate ?? null;
  const lastTimestamp = lastMetric?.date ?? startup?.updatedAt ?? startup?.createdAt ?? null;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {loading && <div className="p-6 text-center bg-white dark:bg-zinc-900 rounded-2xl">Загрузка...</div>}
      {error && <div className="p-4 text-center text-red-600 bg-white dark:bg-zinc-900 rounded-2xl">Ошибка: {error}</div>}
      {!loading && !error && !startup && (
        <div className="p-6 text-center bg-white dark:bg-zinc-900 rounded-2xl">Стартап не найден</div>
      )}

      {startup && (
        <article className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm">
          <header className="flex gap-6 items-start">
            <Logo name={startup.name} url={startup.logoUrl} />
            <div className="flex-1">
              <h1 className="text-2xl font-semibold flex items-center gap-3">
                {startup.name}
                <span className="text-xs py-1 px-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200">
                  {startup.stage ?? '—'}
                </span>
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">{startup.industry}</span>
              </h1>
              {startup.shortPitch && <p className="mt-2 text-gray-600 dark:text-gray-400">{startup.shortPitch}</p>}

              <div className="mt-3 flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                {startup.website && (() => {
                  try {
                    return (
                      <a href={startup.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2">
                        <Globe size={16} /> {new URL(String(startup.website)).hostname}
                      </a>
                    );
                  } catch {
                    return null;
                  }
                })()}

                <div className="inline-flex items-center gap-2">
                  <BarChart2 size={16} /> MRR: <strong>{displayedMrr}</strong>
                </div>

                <div className="inline-flex items-center gap-2">
                  <FileText size={16} /> Files: <strong>{startup.attachments?.length ?? 0}</strong>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400">Создано</div>
              <div className="text-sm font-medium">{formatDate(startup.createdAt)}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">Обновлено</div>
              <div className="text-sm font-medium">{formatDate(startup.updatedAt)}</div>
            </div>
          </header>

          <section className="mt-6">
            <h3 className="text-lg font-medium">Описание</h3>
            <p className="mt-2 text-gray-700 dark:text-gray-300 whitespace-pre-line">{startup.description ?? '—'}</p>
          </section>

          {/* Метрики */}
          <section className="mt-6">
            <h3 className="text-lg font-medium">Метрики</h3>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">MRR (последнее)</div>
                    <div className="text-2xl font-semibold">{displayedMrr}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{lastTimestamp ? formatDate(lastTimestamp) : ''}</div>
                  </div>
                  <div className="w-40">
                    {metricsLoading ? (
                      <div className="text-xs text-gray-500">Загрузка...</div>
                    ) : metricsError ? (
                      <div className="text-xs text-red-500">{metricsError}</div>
                    ) : (
                      <Sparkline data={mrrSeries} />
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Active Users (последнее)</div>
                    <div className="text-2xl font-semibold">{displayedUsers}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{lastTimestamp ? formatDate(lastTimestamp) : ''}</div>
                  </div>
                  <div className="w-40">
                    {metricsLoading ? (
                      <div className="text-xs text-gray-500">Загрузка...</div>
                    ) : metricsError ? (
                      <div className="text-xs text-red-500">{metricsError}</div>
                    ) : (
                      <Sparkline data={usersSeries} />
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Burn Rate (последнее)</div>
                    <div className="text-2xl font-semibold">{displayedBurn != null ? displayedBurn : '—'}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{lastTimestamp ? formatDate(lastTimestamp) : ''}</div>
                  </div>
                  <div className="w-40">
                    {metricsLoading ? (
                      <div className="text-xs text-gray-500">Загрузка...</div>
                    ) : metricsError ? (
                      <div className="text-xs text-red-500">{metricsError}</div>
                    ) : (
                      <Sparkline data={burnSeries} />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* История */}
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">История</h4>
              {metricsLoading && <div className="text-sm text-gray-500">Загрузка метрик...</div>}
              {metricsError && <div className="text-sm text-red-500">{metricsError}</div>}
              {!metricsLoading && (!metrics || metrics.length === 0) && <div className="text-sm text-gray-500">История метрик отсутствует.</div>}
              {!metricsLoading && metrics && metrics.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-gray-500 dark:text-gray-400">
                        <th className="py-2 pr-4">Дата</th>
                        <th className="py-2 pr-4">MRR</th>
                        <th className="py-2 pr-4">Active Users</th>
                        <th className="py-2 pr-4">Burn Rate</th>
                        <th className="py-2 pr-4">Other</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.slice().reverse().map((m, i) => (
                        <tr key={m._id ?? i} className="border-t border-gray-100 dark:border-zinc-800">
                          <td className="py-2 pr-4">{formatDate(m.date)}</td>
                          <td className="py-2 pr-4">{m.mrr ?? '—'}</td>
                          <td className="py-2 pr-4">{m.activeUsers ?? '—'}</td>
                          <td className="py-2 pr-4">{m.burnRate ?? '—'}</td>
                          <td className="py-2 pr-4">{m.other ? JSON.stringify(m.other) : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>

          <section className="mt-6">
            <h3 className="text-lg font-medium">Дополнительные файлы</h3>
            {startup.attachments && startup.attachments.length > 0 ? (
              <ul className="mt-2 space-y-2">
                {startup.attachments.map((a, i) => {
                  const href = String(a);
                  const name = href.split('/').pop() ?? `file-${i + 1}`;
                  return (
                    <li key={i} className="flex items-center justify-between gap-4">
                      <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm">
                        <FileText size={16} /> {name}
                      </a>
                      <div className="text-xs text-gray-500 dark:text-gray-400" />
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">Файлы не добавлены</div>
            )}
          </section>

          <section className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <a
                href={startup.website || '#'}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 py-1 px-3 rounded-md text-sm bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
              >
                <ExternalLink size={14} /> Официальный сайт
              </a>

              <button
                onClick={() => navigate(`/startups/edit/${encodeURIComponent(String(idForApi()))}`)}
                className="py-1 px-3 border rounded-md text-sm"
                title="Редактировать"
              >
                Редактировать
              </button>
            </div>

            <div>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="py-1 px-3 rounded-md text-sm bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
              >
                {deleting ? 'Удаление...' : 'Удалить'}
              </button>
            </div>
          </section>
        </article>
      )}
    </div>
  );
}
