import React, { JSX, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Image, PlusSquare, BarChart2, Sparkles } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import './CreateStartup.css';

const API = 'http://localhost:8080/api/startups';
const METRICS_API = 'http://localhost:8080/api/startup-metrics';

type CreatePayload = {
  name: string;
  founderId?: string;
  stage?: string;
  industry?: string;
  shortPitch?: string;
  description?: string;
  website?: string;
  logoUrl?: string;
  metricsSnapshot?: { mrr?: number; users?: number; valuationPreMoney?: number; valuationPostMoney?: number };
  attachments?: string[];
  visibility?: string;
};

export default function CreateStartup(): JSX.Element {
  const nav = useNavigate();
  const { user } = useAuth() as any;
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
  const [metricValuationPre, setMetricValuationPre] = useState<number | ''>('');
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
      if (metricMrr === '' || metricActiveUsers === '' || metricValuationPre === '') {
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
        ? {
            mrr: Number(metricMrr),
            users: Number(metricActiveUsers),
            ...(metricValuationPre === '' ? {} : { valuationPreMoney: Number(metricValuationPre) }),
          }
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
          valuationPreMoney: metricValuationPre === '' ? undefined : Number(metricValuationPre),
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
    <div className="create-startup-container">
      <div className="create-startup-wrapper">
        <div className="create-startup-header">
          <h1 className="create-startup-title">
            <PlusSquare size={28} />
            Создать стартап
            <Sparkles size={24} />
          </h1>
          <p className="create-startup-subtitle">Расскажите о своём проекте</p>
        </div>

        <form onSubmit={handleSubmit} className="create-startup-form">
          {error && <div className="alert-message alert-error">{error}</div>}
          {successMsg && <div className="alert-message alert-success">{successMsg}</div>}

          <div className="form-group">
            <label className="form-label">Название</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              placeholder="QazTech"
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Стадия</label>
              <select value={stage} onChange={(e) => setStage(e.target.value)} className="form-select">
                <option value="idea">Идея</option>
                <option value="pre-seed">Pre-seed</option>
                <option value="seed">Seed</option>
                <option value="series-a">Series A</option>
                <option value="growth">Growth</option>
                <option value="mature">Mature</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Отрасль</label>
              <input
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="form-input"
                placeholder="Fintech"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Краткий питч</label>
            <input
              value={shortPitch}
              onChange={(e) => setShortPitch(e.target.value)}
              className="form-input"
              placeholder="Платформа для умных инвестиций"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Описание</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-textarea"
              placeholder="Инновационное решение..."
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Веб-сайт</label>
              <input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="form-input"
                placeholder="https://qaztech.kz"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Logo URL</label>
              <div className="logo-preview-wrapper">
                <input
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="form-input logo-preview-input"
                  placeholder="https://..."
                />
                <button type="button" className="btn-clear-logo" onClick={() => setLogoUrl('')}>
                  <Image size={16} /> Очистить
                </button>
              </div>
              {logoUrl && (
                <div className="logo-preview">
                  <img src={logoUrl} alt="logo preview" />
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Вложения (URL, через новую строку или запятую)</label>
            <textarea
              value={attachmentsText}
              onChange={(e) => setAttachmentsText(e.target.value)}
              className="form-textarea"
              style={{ minHeight: '80px' }}
              placeholder="https://...&#10;https://..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Видимость</label>
            <select value={visibility} onChange={(e) => setVisibility(e.target.value)} className="form-select" style={{ width: '200px' }}>
              <option value="public">Публичный</option>
              <option value="private">Приватный</option>
            </select>
          </div>

          <hr className="form-divider" />

          <div className="checkbox-group">
            <input
              id="withMetric"
              type="checkbox"
              checked={withMetric}
              onChange={(e) => setWithMetric(e.target.checked)}
              className="checkbox-input"
            />
            <label htmlFor="withMetric" className="checkbox-label">
              Добавить начальную метрику
            </label>
            <div className="checkbox-hint">
              <BarChart2 size={16} /> опционально
            </div>
          </div>

          {withMetric && (
            <div className="metrics-section">
              <div className="metrics-grid">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Дата</label>
                  <input
                    type="date"
                    value={metricDate}
                    onChange={(e) => setMetricDate(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">MRR</label>
                  <input
                    type="number"
                    value={metricMrr}
                    onChange={(e) => setMetricMrr(e.target.value === '' ? '' : Number(e.target.value))}
                    className="form-input"
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Active Users</label>
                  <input
                    type="number"
                    value={metricActiveUsers}
                    onChange={(e) => setMetricActiveUsers(e.target.value === '' ? '' : Number(e.target.value))}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="metrics-grid">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Burn Rate</label>
                  <input
                    type="number"
                    value={metricBurnRate}
                    onChange={(e) => setMetricBurnRate(e.target.value === '' ? '' : Number(e.target.value))}
                    className="form-input"
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Valuation Pre</label>
                  <input
                    type="number"
                    value={metricValuationPre}
                    onChange={(e) => setMetricValuationPre(e.target.value === '' ? '' : Number(e.target.value))}
                    className="form-input"
                    placeholder="например 1500000"
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0, marginTop: '16px' }}>
                <label className="form-label">Other (JSON)</label>
                <input
                  value={metricOther}
                  onChange={(e) => setMetricOther(e.target.value)}
                  className="form-input"
                  placeholder='{"churn":2.3,"arpu":4.5}'
                />
              </div>
            </div>
          )}

          <div className="form-actions">
            <button type="button" onClick={() => nav('/startups')} className="btn btn-cancel">
              Отмена
            </button>
            <button type="submit" disabled={loading} className="btn btn-submit">
              {loading ? 'Создание...' : 'Создать стартап'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}