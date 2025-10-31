// src/pages/StartupPage.tsx
import React, { JSX, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ExternalLink, BarChart2, FileText, Globe } from 'lucide-react';

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

export default function StartupPage(): JSX.Element {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [startup, setStartup] = useState<Startup | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let canceled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        // Попытка получить стартап по path param (slug или id — бэкенд должен уметь)
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
        // Успех
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
                  <BarChart2 size={16} /> MRR: <strong>{startup.metricsSnapshot?.mrr ?? 0}</strong>
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

          <section className="mt-6">
            <h3 className="text-lg font-medium">Дополнительные файлы</h3>
            {startup.attachments && startup.attachments.length > 0 ? (
              <ul className="mt-2 space-y-2">
                {startup.attachments.map((a, i) => {
                  // предполагается, что attachment — это URL или относительный путь
                  const href = String(a);
                  const name = href.split('/').pop() ?? `file-${i + 1}`;
                  return (
                    <li key={i} className="flex items-center justify-between gap-4">
                      <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm">
                        <FileText size={16} /> {name}
                      </a>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{/* можно добавить размер/тип */}</div>
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
