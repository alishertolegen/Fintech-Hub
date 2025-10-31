import React, { useMemo, useState } from 'react';
import { Search, ExternalLink, BarChart2, Briefcase, Globe, FileText } from 'lucide-react';

// Компонент StartupsList, полностью соответствующий модели коллекции "startups"
// - Просмотр (без редактирования)
// - Фильтрация по stage и industry
// - Поиск по имени, shortPitch и description
// - Показ базовой метрики из metricsSnapshot

const sampleStartups = [
  {
    _id: '653a1f4b8c1a3b001234abcd',
    name: 'PayTech KZ',
    slug: 'paytech-kz',
    founderId: '651f9a2b7c3d4e0011223344',
    stage: 'seed',
    industry: 'Payments',
    shortPitch: 'Қазақстандағы төлем шешімдері',
    description: 'Интеграциялық төлем шешімдерін ұсынатын платформа — картадан картқа, API және POS шешімдері.',
    website: 'https://paytech.kz',
    logoUrl: '',
    metricsSnapshot: { mrr: 12000, users: 4500 },
    attachments: [],
    createdAt: '2023-09-12T10:20:00.000Z',
    updatedAt: '2024-05-02T14:10:00.000Z',
    visibility: 'public',
  },
  {
    _id: '653a1f4b8c1a3b001234abce',
    name: 'CryptoStart',
    slug: 'cryptostart',
    founderId: '651f9a2b7c3d4e0011223345',
    stage: 'growth',
    industry: 'Blockchain',
    shortPitch: 'Криптовалюта саудасы платформасы',
    description: 'Үйлесімді және қауіпсіз крипто-сауда ортасы, аналитика және портфель менеджменті.',
    website: 'https://cryptostart.io',
    logoUrl: '',
    metricsSnapshot: { mrr: 45000, users: 32000 },
    attachments: [],
    createdAt: '2022-04-02T08:00:00.000Z',
    updatedAt: '2024-07-01T09:30:00.000Z',
    visibility: 'public',
  },
  {
    _id: '653a1f4b8c1a3b001234abcf',
    name: 'InsureTech Pro',
    slug: 'insuretech-pro',
    founderId: '651f9a2b7c3d4e0011223346',
    stage: 'idea',
    industry: 'InsurTech',
    shortPitch: 'Сақтандыру технологиялары',
    description: 'Бастапқы кезеңдегі идея — микросақтандыру автоматизациясы және смарт-келісімшарттар.',
    website: '',
    logoUrl: '',
    metricsSnapshot: { mrr: 0, users: 120 },
    attachments: [],
    createdAt: '2024-02-25T13:12:00.000Z',
    updatedAt: '2024-02-25T13:12:00.000Z',
    visibility: 'private',
  },
];

function Logo({ name, url }: { name: string; url?: string }) {
  if (url) return <img src={url} alt={name} className="w-14 h-14 rounded-md object-cover" />;
  const initials = (name || '')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <div className="w-14 h-14 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-semibold">
      {initials}
    </div>
  );
}

function formatDate(iso: string | number | Date): string {
  try {
    return new Date(iso).toLocaleDateString();
  } catch (e) {
    return String(iso);
  }
}

export default function StartupsList({ startups = sampleStartups }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [showPrivate, setShowPrivate] = useState(false);

  const industries = useMemo(() => {
    const set = new Set(startups.map((s) => s.industry));
    return Array.from(set);
  }, [startups]);

  const filtered = useMemo(() => {
    return startups.filter((s) => {
      if (!showPrivate && s.visibility === 'private') return false;
      if (stageFilter !== 'all' && s.stage !== stageFilter) return false;
      if (industryFilter !== 'all' && s.industry !== industryFilter) return false;

      const q = searchTerm.trim().toLowerCase();
      if (!q) return true;

      return (
        s.name.toLowerCase().includes(q) ||
        s.shortPitch.toLowerCase().includes(q) ||
        (s.description || '').toLowerCase().includes(q) ||
        (s.industry || '').toLowerCase().includes(q)
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

      <div className="grid gap-4">
        {filtered.map((s) => (
          <article key={s._id} className="bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-sm flex gap-4 items-start">
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
                  {s.website && (
                    <a href={s.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1">
                      <Globe size={14} /> {new URL(s.website).hostname}
                    </a>
                  )}

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
        ))}

        {filtered.length === 0 && (
          <div className="p-6 text-center text-gray-600 dark:text-gray-400 bg-white dark:bg-zinc-900 rounded-2xl">
            <h3 className="text-lg font-medium">Стартаптар табылмады</h3>
            <p className="mt-2">Попробуйте изменить поисковый запрос или фильтры.</p>
          </div>
        )}
      </div>
    </div>
  );
}
