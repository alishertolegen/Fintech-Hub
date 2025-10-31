import React, { JSX, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Image, PlusSquare, BarChart2 } from 'lucide-react';
import { useAuth } from '../auth/AuthContext'; // <- используем контекст аутентификации

const API = 'http://localhost:8080/api/startups';
const METRICS_API = 'http://localhost:8080/api/startup-metrics';

type CreatePayload = {
  name: string;
  founderId?: string; // опционально — будет установлено автоматически из auth
  stage?: string;
  industry?: string;
  shortPitch?: string;
  description?: string;
  website?: string;
  logoUrl?: string;
  metricsSnapshot?: { mrr?: number; users?: number };
  attachments?: string[];
  visibility?: string;
};

export default function CreateStartup(): JSX.Element {
  const nav = useNavigate();
  const { user } = useAuth() as any; // подстрой под вашу реализацию useAuth()
  // получаем id пользователя из объекта user (поддерживаем несколько возможных полей)
  const currentUserId = user?.id ?? user?._id ?? user?.sub ?? undefined;

  const [name, setName] = useState('');
  const [stage, setStage] = useState('idea');
  const [industry, setIndustry] = useState('');
  const [shortPitch, setShortPitch] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [attachmentsText, setAttachmentsText] = useState('');
  const [visibility, setVisibility] = useState('public');

  // initial metrics (optional)
  const [withMetric, setWithMetric] = useState(false);
  const [metricDate, setMetricDate] = useState<string>(() => {
    const d = new Date();
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(d.getUTCDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  const [metricMrr, setMetricMrr] = useState<number | ''>('');
  const [metricActiveUsers, setMetricActiveUsers] = useState<number | ''>('');
  const [metricBurnRate, setMetricBurnRate] = useState<number | ''>('');
  const [metricOther, setMetricOther] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  function parseAttachments(text: string): string[] {
    if (!text) return [];
    return text
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setError(null);
  setSuccessMsg(null);

  if (!name.trim()) {
    setError('Название стартапа обязательно.');
    return;
  }

  if (withMetric) {
    if (metricMrr === '' || metricActiveUsers === '') {
      setError('Поля MRR и Active Users обязательны для заполнения.');
      return;
    }
  }

  const attachments = parseAttachments(attachmentsText);

  const payload: CreatePayload = {
    name: name.trim(),
    ...(currentUserId ? { founderId: String(currentUserId) } : {}),
    stage: stage || undefined,
    industry: industry.trim() || undefined,
    shortPitch: shortPitch.trim() || undefined,
    description: description.trim() || undefined,
    website: website.trim() || undefined,
    logoUrl: logoUrl.trim() || undefined,
    metricsSnapshot: withMetric
      ? { mrr: Number(metricMrr), users: Number(metricActiveUsers) }
      : { mrr: 0, users: 0 },
    attachments,
    visibility: visibility || 'public',
  };


    setLoading(true);
    try {
      const res = await fetch(API, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text();
        let msg = `Ошибка ${res.status}`;
        try {
          const j = JSON.parse(txt);
          msg = j.error ?? j.message ?? msg;
        } catch {
          msg = txt || msg;
        }
        throw new Error(msg);
      }

      const created = await res.json();
      const createdId = (created && (created.id ?? created._id ?? created.slug)) || null;

      // создание метрики (если включено)
      if (withMetric && createdId) {
        let parsedOther: Record<string, any> | undefined = undefined;
        if (metricOther && metricOther.trim()) {
          try {
            parsedOther = JSON.parse(metricOther);
          } catch {
            throw new Error('Поле "Other" метрики должно быть валидным JSON.');
          }
        }

        const isoDate = metricDate ? new Date(metricDate + 'T00:00:00Z').toISOString() : new Date().toISOString();

        const metricPayload: any = {
          startupId: String(createdId),
          date: isoDate,
          mrr: metricMrr === '' ? undefined : Number(metricMrr),
          activeUsers: metricActiveUsers === '' ? undefined : Number(metricActiveUsers),
          burnRate: metricBurnRate === '' ? undefined : Number(metricBurnRate),
          other: parsedOther ?? undefined,
        };

        Object.keys(metricPayload).forEach((k) => metricPayload[k] === undefined && delete metricPayload[k]);

        const mres = await fetch(METRICS_API, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(metricPayload),
        });

        if (!mres.ok) {
          const txt = await mres.text();
          let msg = `Ошибка при создании метрики ${mres.status}`;
          try {
            const j = JSON.parse(txt);
            msg = j.error ?? j.message ?? msg;
          } catch {
            msg = txt || msg;
          }
          setError(`Стартап создан, но не удалось создать метрику: ${msg}`);
          setSuccessMsg('Стартап создан (метрика не создана).');
          setTimeout(() => {
            if (createdId) nav(`/startups/${encodeURIComponent(String(createdId))}`);
          }, 800);
          return;
        }
      }

      setSuccessMsg('Стартап успешно создан.');
      if (createdId) {
        nav(`/startups/${encodeURIComponent(String(createdId))}`);
      }
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold flex items-center gap-2">
        <PlusSquare size={20} /> Создать стартап
      </h1>

      <form onSubmit={handleSubmit} className="mt-6 bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm space-y-4">
        {error && <div className="text-sm text-red-600 p-2 rounded bg-red-50 dark:bg-red-900/20">{error}</div>}
        {successMsg && <div className="text-sm text-green-700 p-2 rounded bg-green-50 dark:bg-green-900/20">{successMsg}</div>}

        <div>
          <label className="text-sm font-medium">Название</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full p-2 border rounded" placeholder="QazTech" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Стадия</label>
            <select value={stage} onChange={(e) => setStage(e.target.value)} className="mt-1 w-full p-2 border rounded">
              <option value="idea">idea</option>
              <option value="pre-seed">pre-seed</option>
              <option value="seed">seed</option>
              <option value="series-a">series-a</option>
              <option value="growth">growth</option>
              <option value="mature">mature</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Отрасль</label>
            <input value={industry} onChange={(e) => setIndustry(e.target.value)} className="mt-1 w-full p-2 border rounded" placeholder="Fintech" />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Краткий питч</label>
          <input value={shortPitch} onChange={(e) => setShortPitch(e.target.value)} className="mt-1 w-full p-2 border rounded" placeholder="Платформа для умных инвестиций" />
        </div>

        <div>
          <label className="text-sm font-medium">Описание</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 w-full p-2 border rounded" rows={5} placeholder="Инновационное решение..." />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Сайт</label>
            <input value={website} onChange={(e) => setWebsite(e.target.value)} className="mt-1 w-full p-2 border rounded" placeholder="https://qaztech.kz" />
          </div>

          <div>
            <label className="text-sm font-medium">Logo URL</label>
            <div className="mt-1 flex gap-2">
              <input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} className="flex-1 p-2 border rounded" placeholder="https://..." />
              <button type="button" className="inline-flex items-center gap-2 px-3 rounded border" onClick={() => setLogoUrl('')}>
                <Image size={16} /> Очистить
              </button>
            </div>
            {logoUrl && (
              <div className="mt-2">
                <img src={logoUrl} alt="logo preview" className="w-24 h-24 rounded-md object-cover border" />
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Attachments (URL, через новую строку или запятую)</label>
          <textarea value={attachmentsText} onChange={(e) => setAttachmentsText(e.target.value)} className="mt-1 w-full p-2 border rounded" rows={2} placeholder="https://...{enter}https://..." />
        </div>

        <div>
          <label className="text-sm font-medium">Видимость</label>
          <select value={visibility} onChange={(e) => setVisibility(e.target.value)} className="mt-1 w-40 p-2 border rounded">
            <option value="public">public</option>
            <option value="private">private</option>
          </select>
        </div>

        <hr className="my-2" />

        <div className="flex items-center gap-3">
          <input id="withMetric" type="checkbox" checked={withMetric} onChange={(e) => setWithMetric(e.target.checked)} />
          <label htmlFor="withMetric" className="text-sm">Добавить начальную метрику</label>
          <div className="text-xs text-gray-500 flex items-center gap-2"><BarChart2 size={14} /> опционально</div>
        </div>

        {withMetric && (
          <div className="bg-zinc-50 dark:bg-zinc-800 p-3 rounded space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-sm">Дата</label>
                <input type="date" value={metricDate} onChange={(e) => setMetricDate(e.target.value)} className="mt-1 p-2 w-full border rounded" />
              </div>
              <div>
                <label className="text-sm">MRR</label>
                <input type="number" value={metricMrr} onChange={(e) => setMetricMrr(e.target.value === '' ? '' : Number(e.target.value))} className="mt-1 p-2 w-full border rounded" />
              </div>
              <div>
                <label className="text-sm">Active Users</label>
                <input type="number" value={metricActiveUsers} onChange={(e) => setMetricActiveUsers(e.target.value === '' ? '' : Number(e.target.value))} className="mt-1 p-2 w-full border rounded" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm">Burn Rate</label>
                <input type="number" value={metricBurnRate} onChange={(e) => setMetricBurnRate(e.target.value === '' ? '' : Number(e.target.value))} className="mt-1 p-2 w-full border rounded" />
              </div>
              <div>
                <label className="text-sm">Other (JSON)</label>
                <input value={metricOther} onChange={(e) => setMetricOther(e.target.value)} className="mt-1 p-2 w-full border rounded" placeholder='{"churn":2.3,"arpu":4.5}' />
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2 justify-end">
          <button type="button" onClick={() => nav('/startups')} className="py-2 px-4 border rounded">Отмена</button>
          <button type="submit" disabled={loading} className="py-2 px-4 rounded bg-indigo-600 text-white">
            {loading ? 'Создание...' : 'Создать стартап'}
          </button>
        </div>
      </form>
    </div>
  );
}
