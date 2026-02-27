import React, { JSX, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Check, Globe, Image as ImageIcon, BarChart2 } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import './CreateStartup.css';
import Select from 'react-select';

const API = 'http://localhost:8080/api/startups';

const STAGES = [
  { value: 'idea',     emoji: '💡', label: 'Idea'     },
  { value: 'pre-seed', emoji: '🌱', label: 'Pre-seed' },
  { value: 'seed',     emoji: '🚀', label: 'Seed'     },
  { value: 'series-a', emoji: '📈', label: 'Series A' },
  { value: 'growth',   emoji: '⚡', label: 'Growth'   },
  { value: 'mature',   emoji: '🏛️', label: 'Mature'   },
];

const INDUSTRIES = [
  { value: 'fintech',       label: '💳 Fintech'       },
  { value: 'saas',          label: '☁️ SaaS'          },
  { value: 'e-commerce',    label: '🛒 E-commerce'    },
  { value: 'edtech',        label: '🎓 EdTech'        },
  { value: 'healthtech',    label: '🏥 HealthTech'    },
  { value: 'ai-ml',         label: '🤖 AI / ML'       },
  { value: 'logistics',     label: '🚚 Logistics'     },
  { value: 'agritech',      label: '🌾 AgriTech'      },
  { value: 'cleantech',     label: '♻️ CleanTech'     },
  { value: 'proptech',      label: '🏠 PropTech'      },
  { value: 'legaltech',     label: '⚖️ LegalTech'     },
  { value: 'cybersecurity', label: '🔒 Cybersecurity' },
  { value: 'gaming',        label: '🎮 Gaming'        },
  { value: 'media',         label: '📱 Media'         },
  { value: 'marketplace',   label: '🏪 Marketplace'   },
  { value: 'hr-tech',       label: '👥 HR Tech'       },
  { value: 'biotech',       label: '🧬 Biotech'       },
  { value: 'construction',  label: '🏗️ Construction'  },
];

export default function EditStartup(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const { user, token } = useAuth() as any;
  const currentUserId = user?.id ?? user?._id ?? user?.sub ?? undefined;

  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [step, setStep] = useState(0);

  /* ── Step 0: Identity ── */
  const [name,        setName]        = useState('');
  const [stage,       setStage]       = useState('idea');
  const [industry,    setIndustry]    = useState<{ value: string; label: string } | null>(null);
  const [shortPitch,  setShortPitch]  = useState('');
  const [description, setDescription] = useState('');

  /* ── Step 1: Details ── */
  const [website,         setWebsite]         = useState('');
  const [logoUrl,         setLogoUrl]         = useState('');
  const [attachmentsText, setAttachmentsText] = useState('');
  const [visibility,      setVisibility]      = useState('public');
  const [valuationMode,   setValuationMode]   = useState<'pre' | 'post'>('pre');

  /* ── Logo upload ── */
  const logoInputRef   = useRef<HTMLInputElement>(null);
  const [logoUploading, setLogoUploading] = useState(false);

  /* ── Images upload ── */
  const imagesInputRef    = useRef<HTMLInputElement>(null);
  const [uploadedImages,  setUploadedImages]  = useState<string[]>([]);
  const [imageUploading,  setImageUploading]  = useState(false);

  /* ── Step 2: Metrics ── */
  const [withMetric,          setWithMetric]          = useState(false);
  const [metricDate,          setMetricDate]          = useState(() => {
    const d = new Date();
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
  });
  const [metricMrr,           setMetricMrr]           = useState<number | ''>('');
  const [metricActiveUsers,   setMetricActiveUsers]   = useState<number | ''>('');
  const [metricBurnRate,      setMetricBurnRate]       = useState<number | ''>('');
  const [metricValuationPre,  setMetricValuationPre]  = useState<number | ''>('');
  const [metricValuationPost, setMetricValuationPost] = useState<number | ''>('');
  const [metricOther,         setMetricOther]         = useState('');

  /* ── Load existing startup ── */
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`${API}/${encodeURIComponent(id)}`, { credentials: 'include' })
      .then(async res => {
        if (!res.ok) throw new Error(`Ошибка ${res.status}`);
        return res.json();
      })
      .then((data: any) => {
        setName(data.name || '');
        setStage(data.stage || 'idea');
        setIndustry(INDUSTRIES.find(i => i.value === data.industry) ?? (data.industry ? { value: data.industry, label: data.industry } : null));
        setShortPitch(data.shortPitch || '');
        setDescription(data.description || '');
        setWebsite(data.website || '');
        setLogoUrl(data.logoUrl || '');
        setAttachmentsText(Array.isArray(data.attachments) ? data.attachments.join('\n') : '');
        setVisibility(data.visibility || 'public');
        setValuationMode(data.valuationMode === 'post' ? 'post' : 'pre');
        // load existing images
        if (Array.isArray(data.images) && data.images.length > 0) {
          setUploadedImages(data.images);
        }
        const ms = data.metricsSnapshot || null;
        if (ms) {
          setWithMetric(true);
          setMetricMrr(ms.mrr ?? '');
          setMetricActiveUsers(ms.activeUsers ?? ms.users ?? '');
          setMetricBurnRate(ms.burnRate ?? '');
          setMetricValuationPre(ms.valuationPreMoney ?? '');
          setMetricValuationPost(ms.valuationPostMoney ?? '');
          setMetricOther(ms.other ? JSON.stringify(ms.other) : '');
        } else {
          setWithMetric(false);
        }
      })
      .catch(e => setError(String(e?.message ?? e)))
      .finally(() => setLoading(false));
  }, [id]);

  /* ── Logo upload handler ── */
  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('http://localhost:8080/api/users/me/avatar', {
        method: 'POST',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: formData,
      });
      if (!res.ok) throw new Error(`Ошибка ${res.status}`);
      const data = await res.json();
      setLogoUrl(data.avatarUrl ?? '');
    } catch (ex: any) {
      setError('Не удалось загрузить логотип: ' + ex.message);
    } finally {
      setLogoUploading(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  }

  /* ── Images upload handler ── */
  async function handleImagesUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setImageUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('http://localhost:8080/api/users/me/avatar', {
          method: 'POST',
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: formData,
        });
        if (!res.ok) throw new Error(`Ошибка ${res.status}`);
        const data = await res.json();
        if (data.avatarUrl) uploaded.push(data.avatarUrl);
      }
      setUploadedImages(prev => [...prev, ...uploaded]);
    } catch (ex: any) {
      setError('Не удалось загрузить изображение: ' + ex.message);
    } finally {
      setImageUploading(false);
      if (imagesInputRef.current) imagesInputRef.current.value = '';
    }
  }

  /* ── Helpers ── */
  function parseAttachments(t: string): string[] {
    return t ? t.split(/[,\n]+/).map(s => s.trim()).filter(Boolean) : [];
  }

  function validateStep(s: number): string | null {
    if (s === 0 && !name.trim()) return 'Введите название стартапа.';
    if (s === 0 && !shortPitch.trim()) return 'Добавьте краткий питч.';
    if (s === 2 && withMetric) {
      if (metricMrr === '') return 'Введите MRR.';
      if (metricActiveUsers === '') return 'Введите Active Users.';
      if (valuationMode === 'pre'  && (metricValuationPre  === '' || Number(metricValuationPre)  <= 0)) return 'Введите Pre-money valuation.';
      if (valuationMode === 'post' && (metricValuationPost === '' || Number(metricValuationPost) <= 0)) return 'Введите Post-money valuation.';
    }
    return null;
  }

  function next() {
    const err = validateStep(step);
    if (err) { setError(err); return; }
    setError(null);
    setStep(s => Math.min(s + 1, 3));
  }
  function prev() { setError(null); setStep(s => Math.max(s - 1, 0)); }

  /* ── Save ── */
  async function handleSave() {
    setError(null);
    const err = validateStep(step);
    if (err) { setError(err); return; }
    if (!id) { setError('Missing startup id'); return; }

    setSaving(true);
    try {
      const payload: any = {
        ...(name ? { name: name.trim() } : {}),
        ...(currentUserId ? { founderId: String(currentUserId) } : {}),
        stage,
        industry:    industry?.value   || undefined,
        shortPitch:  shortPitch.trim() || undefined,
        description: description.trim() || undefined,
        website:     website.trim()    || undefined,
        logoUrl:     logoUrl.trim()    || undefined,
        attachments: parseAttachments(attachmentsText),
        visibility,
        valuationMode,
        images: uploadedImages.length > 0 ? uploadedImages : [],
      };

      if (withMetric) {
        const ms: any = {};
        if (metricMrr          !== '') ms.mrr          = Number(metricMrr);
        if (metricActiveUsers  !== '') ms.activeUsers  = Number(metricActiveUsers);
        if (metricBurnRate     !== '') ms.burnRate      = Number(metricBurnRate);
        if (valuationMode === 'pre'  && metricValuationPre  !== '') ms.valuationPreMoney  = Number(metricValuationPre);
        if (valuationMode === 'post' && metricValuationPost !== '') ms.valuationPostMoney = Number(metricValuationPost);
        if (metricOther.trim()) {
          try { ms.other = JSON.parse(metricOther); }
          catch { throw new Error('Поле "Other" должно быть валидным JSON.'); }
        }
        if (Object.keys(ms).length > 0) payload.metricsSnapshot = ms;
      }

      const res = await fetch(`${API}/${encodeURIComponent(id)}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? j.message ?? `Ошибка ${res.status}`);
      }

      const updated = await res.json();
      setSuccessMsg('Стартап успешно сохранён');
      setTimeout(() => nav(`/startups/${encodeURIComponent(String(updated.id ?? updated._id ?? updated.slug))}`), 700);
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setSaving(false);
    }
  }

  const numField = (val: number | '', set: (v: number | '') => void, ph: string) => (
    <input type="number" className="cs-input" placeholder={ph} value={val}
      onChange={e => set(e.target.value === '' ? '' : Number(e.target.value))} />
  );

  const fmt = (n?: number | null) => {
    if (n == null) return '—';
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`;
    return `$${n}`;
  };

  if (loading) return (
    <div className="cs-root">
      <main className="cs-right">
        <div className="cs-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
          Загрузка…
        </div>
      </main>
    </div>
  );

  return (
    <div className="cs-root">

      {/* ════ LEFT PANEL ════ */}
      <aside className="cs-left">
        <div className="cs-brand">
          <div className="cs-logo navbar-logo">
            <div className="logo-mark">
              <img src="/logo_fintech_transparent.png" alt="logo" />
            </div>
            <span className="logo-text">Fintech<em>Hub</em></span>
          </div>
          <div className="cs-headline">
            <div className="cs-headline-eyebrow">// редактирование стартапа</div>
            <h2 className="cs-headline-title">Измените профиль <em>стартапа</em></h2>
            <p className="cs-headline-sub">Внесите правки и сохраните изменения</p>
          </div>
        </div>

        {/* Step tracker */}
        <div className="cs-steps">
          {[
            { name: 'Идентификация', desc: 'Название и суть проекта' },
            { name: 'Детали',        desc: 'Контакты и параметры'    },
            { name: 'Метрики',       desc: 'Первоначальные данные'   },
            { name: 'Проверка',      desc: 'Подтвердите и сохраните' },
          ].map((ws, i) => (
            <div
              key={i}
              className={`cs-step ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}
              onClick={() => i < step && setStep(i)}
            >
              <div className="cs-step-dot">
                {i < step ? <Check size={13} /> : String(i + 1).padStart(2, '0')}
              </div>
              <div className="cs-step-label">
                <div className="cs-step-name">{ws.name}</div>
                <div className="cs-step-desc">{ws.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <p className="cs-footer-quote">
          «Хорошая идея без исполнения — просто мечта. Хорошая идея с командой — история успеха.»
        </p>
      </aside>

      {/* ════ RIGHT PANEL ════ */}
      <main className="cs-right">

        {/* ── STEP 0: Identity ── */}
        {step === 0 && (
          <div className="cs-panel" key="step0">
            <div className="cs-panel-header">
              <div className="cs-panel-step-tag">// шаг 01 из 04</div>
              <h1 className="cs-panel-title">Расскажи о своём проекте</h1>
              <p className="cs-panel-subtitle">Название, суть и позиционирование на рынке</p>
            </div>

            {error && <div className="cs-alert cs-alert-error">{error}</div>}

            <div className="cs-fields">
              <div className="cs-field">
                <label className="cs-label">Название стартапа <span className="cs-label-req">*</span></label>
                <input className="cs-input" placeholder="QazTech" value={name}
                  onChange={e => setName(e.target.value)} />
              </div>

              <div className="cs-field">
                <label className="cs-label">Стадия развития</label>
                <div className="cs-stage-grid">
                  {STAGES.map(s => (
                    <button key={s.value} type="button"
                      className={`cs-stage-btn ${stage === s.value ? 'selected' : ''}`}
                      onClick={() => setStage(s.value)}>
                      <span className="cs-stage-emoji">{s.emoji}</span>
                      <span className="cs-stage-name">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="cs-field">
                <label className="cs-label">Отрасль</label>
                <Select
                  options={INDUSTRIES}
                  value={industry}
                  onChange={opt => setIndustry(opt)}
                  placeholder="Выберите отрасль…"
                  noOptionsMessage={() => 'Не найдено'}
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  classNamePrefix="country-select"
                  isClearable
                />
              </div>

              <div className="cs-field">
                <label className="cs-label">Краткий питч <span className="cs-label-req">*</span></label>
                <input className="cs-input" placeholder="Платформа для умных инвестиций в Казахстане" value={shortPitch}
                  onChange={e => setShortPitch(e.target.value)} />
              </div>

              <div className="cs-field">
                <label className="cs-label">Полное описание</label>
                <textarea className="cs-textarea" placeholder="Расскажите подробнее о проблеме, решении и рынке…" value={description}
                  onChange={e => setDescription(e.target.value)} />
              </div>
            </div>

            <div className="cs-nav">
              <div className="cs-nav-left"><span className="cs-progress">01 / 04</span></div>
              <div className="cs-nav-right">
                <button type="button" className="cs-btn cs-btn-ghost" onClick={() => nav('/startups')}>Отмена</button>
                <button type="button" className="cs-btn cs-btn-next" onClick={next}>
                  Далее <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 1: Details ── */}
        {step === 1 && (
          <div className="cs-panel" key="step1">
            <div className="cs-panel-header">
              <div className="cs-panel-step-tag">// шаг 02 из 04</div>
              <h1 className="cs-panel-title">Контакты и параметры</h1>
              <p className="cs-panel-subtitle">Сайт, логотип, фотографии и параметры</p>
            </div>

            {error && <div className="cs-alert cs-alert-error">{error}</div>}

            <div className="cs-fields">
              <div className="cs-field">
                <label className="cs-label"><Globe size={12} style={{ display: 'inline' }} /> Веб-сайт</label>
                <input className="cs-input" placeholder="https://qaztech.kz" value={website}
                  onChange={e => setWebsite(e.target.value)} />
              </div>

              {/* Logo */}
              <div className="cs-field">
                <label className="cs-label"><ImageIcon size={12} style={{ display: 'inline' }} /> Logo URL</label>
                <div className="cs-logo-row">
                  <input className="cs-input" placeholder="https://cdn.example.com/logo.png" value={logoUrl}
                    onChange={e => setLogoUrl(e.target.value)} />
                  <div
                    className="cs-logo-thumb"
                    style={{ position: 'relative', cursor: 'pointer' }}
                    onClick={() => logoInputRef.current?.click()}
                    title="Загрузить логотип"
                  >
                    {logoUploading
                      ? <div style={{ width: 18, height: 18, border: '2px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                      : logoUrl
                        ? <img src={logoUrl} alt="preview" />
                        : <ImageIcon size={18} />
                    }
                    <div style={{
                      position: 'absolute', bottom: 0, right: 0,
                      background: 'var(--accent)', borderRadius: '50%',
                      width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <ImageIcon size={9} color="#fff" />
                    </div>
                  </div>
                  <input ref={logoInputRef} type="file" accept="image/*"
                    style={{ display: 'none' }} onChange={handleLogoUpload} />
                </div>
              </div>

              {/* Images gallery upload */}
              <div className="cs-field">
                <label className="cs-label"><ImageIcon size={12} style={{ display: 'inline' }} /> Фотографии стартапа</label>

                <div
                  onClick={() => imagesInputRef.current?.click()}
                  style={{
                    width: '100%', height: 72, borderRadius: 10, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    border: '1.5px dashed var(--border)', color: 'var(--text-muted)',
                    fontSize: 13, transition: 'border-color 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                >
                  {imageUploading
                    ? <div style={{ width: 18, height: 18, border: '2px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    : <><ImageIcon size={16} /> Нажмите чтобы добавить фото (можно несколько)</>
                  }
                </div>

                <input
                  ref={imagesInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: 'none' }}
                  onChange={handleImagesUpload}
                />

                {uploadedImages.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                    {uploadedImages.map((url, i) => (
                      <div key={i} style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
                        <img
                          src={url}
                          alt=""
                          style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)', display: 'block' }}
                        />
                        <button
                          type="button"
                          onClick={() => setUploadedImages(prev => prev.filter((_, idx) => idx !== i))}
                          style={{
                            position: 'absolute', top: -6, right: -6,
                            width: 20, height: 20, borderRadius: '50%',
                            background: '#ff5555', border: 'none', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontSize: 14, fontWeight: 700, lineHeight: 1,
                            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                          }}
                        >×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Attachments */}
              <div className="cs-field">
                <label className="cs-label">Вложения (URL через новую строку)</label>
                <textarea className="cs-textarea" style={{ minHeight: 80 }}
                  placeholder={'https://deck.pdf\nhttps://financials.xlsx'}
                  value={attachmentsText} onChange={e => setAttachmentsText(e.target.value)} />
              </div>

              {/* Visibility */}
              <div className="cs-field">
                <label className="cs-label">Видимость</label>
                <div className="cs-visibility-row">
                  <button type="button" className={`cs-vis-btn ${visibility === 'public' ? 'selected' : ''}`}
                    onClick={() => setVisibility('public')}>
                    <div className="cs-vis-title">🌍 Публичный</div>
                    <div className="cs-vis-desc">Виден всем инвесторам в каталоге</div>
                  </button>
                  <button type="button" className={`cs-vis-btn ${visibility === 'private' ? 'selected' : ''}`}
                    onClick={() => setVisibility('private')}>
                    <div className="cs-vis-title">🔒 Приватный</div>
                    <div className="cs-vis-desc">Только по прямой ссылке</div>
                  </button>
                </div>
              </div>

              {/* Valuation mode */}
              <div className="cs-field">
                <label className="cs-label">Модель оценки</label>
                <div className="cs-val-mode">
                  <button type="button" className={`cs-val-pill ${valuationMode === 'pre' ? 'active' : ''}`}
                    onClick={() => setValuationMode('pre')}>Pre-money</button>
                  <button type="button" className={`cs-val-pill ${valuationMode === 'post' ? 'active' : ''}`}
                    onClick={() => setValuationMode('post')}>Post-money</button>
                </div>
              </div>
            </div>

            <div className="cs-nav">
              <div className="cs-nav-left">
                <button type="button" className="cs-btn cs-btn-ghost" onClick={prev}>
                  <ArrowLeft size={16} /> Назад
                </button>
                <span className="cs-progress">02 / 04</span>
              </div>
              <div className="cs-nav-right">
                <button type="button" className="cs-btn cs-btn-next" onClick={next}>
                  Далее <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: Metrics ── */}
        {step === 2 && (
          <div className="cs-panel" key="step2">
            <div className="cs-panel-header">
              <div className="cs-panel-step-tag">// шаг 03 из 04</div>
              <h1 className="cs-panel-title">Первоначальные метрики</h1>
              <p className="cs-panel-subtitle">Данные сделают ваш профиль убедительнее для инвесторов</p>
            </div>

            {error && <div className="cs-alert cs-alert-error">{error}</div>}

            <div className="cs-fields">
              <div className={`cs-metric-toggle ${withMetric ? 'on' : ''}`} onClick={() => setWithMetric(v => !v)}>
                <div className="cs-toggle-switch" />
                <div className="cs-toggle-label">
                  <div className="cs-toggle-title">
                    <BarChart2 size={14} style={{ display: 'inline', marginRight: 6 }} />
                    Добавить метрики
                  </div>
                  <div className="cs-toggle-sub">MRR, пользователи, оценка компании</div>
                </div>
              </div>

              {withMetric && (
                <div className="cs-metric-fields">
                  <div className="cs-metric-row">
                    <div className="cs-field">
                      <label className="cs-label">Дата</label>
                      <input type="date" className="cs-input" value={metricDate}
                        onChange={e => setMetricDate(e.target.value)} />
                    </div>
                    <div className="cs-field">
                      <label className="cs-label">MRR <span className="cs-label-req">*</span></label>
                      {numField(metricMrr, setMetricMrr, '50 000')}
                    </div>
                    <div className="cs-field">
                      <label className="cs-label">Active Users <span className="cs-label-req">*</span></label>
                      {numField(metricActiveUsers, setMetricActiveUsers, '1 200')}
                    </div>
                  </div>

                  <div className="cs-metric-row-2">
                    <div className="cs-field">
                      <label className="cs-label">Burn Rate</label>
                      {numField(metricBurnRate, setMetricBurnRate, '30 000')}
                    </div>
                    <div className="cs-field">
                      <label className="cs-label">
                        {valuationMode === 'pre' ? 'Valuation Pre-money' : 'Valuation Post-money'}
                        <span className="cs-label-req"> *</span>
                      </label>
                      {valuationMode === 'pre'
                        ? numField(metricValuationPre,  setMetricValuationPre,  '1 500 000')
                        : numField(metricValuationPost, setMetricValuationPost, '2 000 000')
                      }
                    </div>
                  </div>

                  <div className="cs-field">
                    <label className="cs-label">Other (JSON)</label>
                    <input className="cs-input" placeholder='{"churn":2.3,"arpu":4.5}' value={metricOther}
                      onChange={e => setMetricOther(e.target.value)} />
                  </div>
                </div>
              )}
            </div>

            <div className="cs-nav">
              <div className="cs-nav-left">
                <button type="button" className="cs-btn cs-btn-ghost" onClick={prev}>
                  <ArrowLeft size={16} /> Назад
                </button>
                <span className="cs-progress">03 / 04</span>
              </div>
              <div className="cs-nav-right">
                <button type="button" className="cs-btn cs-btn-next" onClick={next}>
                  Далее <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3: Review ── */}
        {step === 3 && (
          <div className="cs-panel" key="step3">
            <div className="cs-panel-header">
              <div className="cs-panel-step-tag">// шаг 04 из 04</div>
              <h1 className="cs-panel-title">Проверьте и сохраните</h1>
              <p className="cs-panel-subtitle">Всё выглядит правильно? Нажмите «Сохранить».</p>
            </div>

            {error      && <div className="cs-alert cs-alert-error">{error}</div>}
            {successMsg && <div className="cs-alert cs-alert-success">{successMsg}</div>}

            <div className="cs-summary">
              {/* Block 1 */}
              <div className="cs-summary-block">
                <div className="cs-summary-block-title">
                  Идентификация
                  <button className="cs-edit-link" onClick={() => setStep(0)}>изменить</button>
                </div>
                <div className="cs-summary-row">
                  <span className="cs-summary-key">Название</span>
                  <span className="cs-summary-val accent">{name || '—'}</span>
                </div>
                <div className="cs-summary-row">
                  <span className="cs-summary-key">Стадия</span>
                  <span className="cs-summary-val">
                    {STAGES.find(s => s.value === stage)?.emoji} {STAGES.find(s => s.value === stage)?.label}
                  </span>
                </div>
                <div className="cs-summary-row">
                  <span className="cs-summary-key">Отрасль</span>
                  <span className="cs-summary-val">{industry?.label || '—'}</span>
                </div>
                <div className="cs-summary-row">
                  <span className="cs-summary-key">Питч</span>
                  <span className="cs-summary-val">{shortPitch || '—'}</span>
                </div>
              </div>

              {/* Block 2 */}
              <div className="cs-summary-block">
                <div className="cs-summary-block-title">
                  Детали
                  <button className="cs-edit-link" onClick={() => setStep(1)}>изменить</button>
                </div>
                <div className="cs-summary-row">
                  <span className="cs-summary-key">Сайт</span>
                  <span className="cs-summary-val accent">{website || '—'}</span>
                </div>
                <div className="cs-summary-row">
                  <span className="cs-summary-key">Видимость</span>
                  <span className="cs-summary-val">{visibility === 'public' ? '🌍 Публичный' : '🔒 Приватный'}</span>
                </div>
                <div className="cs-summary-row">
                  <span className="cs-summary-key">Модель оценки</span>
                  <span className="cs-summary-val purple">{valuationMode.toUpperCase()}-money</span>
                </div>
                <div className="cs-summary-row">
                  <span className="cs-summary-key">Вложений</span>
                  <span className="cs-summary-val">{parseAttachments(attachmentsText).length} файл(ов)</span>
                </div>
                <div className="cs-summary-row">
                  <span className="cs-summary-key">Фотографий</span>
                  <span className="cs-summary-val">{uploadedImages.length} фото</span>
                </div>
                {/* Thumbnails preview in summary */}
                {uploadedImages.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                    {uploadedImages.map((url, i) => (
                      <img key={i} src={url} alt=""
                        style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)' }} />
                    ))}
                  </div>
                )}
              </div>

              {/* Block 3 */}
              <div className="cs-summary-block">
                <div className="cs-summary-block-title">
                  Метрики
                  <button className="cs-edit-link" onClick={() => setStep(2)}>изменить</button>
                </div>
                {!withMetric ? (
                  <div className="cs-summary-row">
                    <span className="cs-summary-key">Статус</span>
                    <span className="cs-summary-val">Метрики не добавлены</span>
                  </div>
                ) : (
                  <>
                    <div className="cs-summary-row">
                      <span className="cs-summary-key">MRR</span>
                      <span className="cs-summary-val green">{fmt(metricMrr === '' ? null : Number(metricMrr))}</span>
                    </div>
                    <div className="cs-summary-row">
                      <span className="cs-summary-key">Active Users</span>
                      <span className="cs-summary-val">{metricActiveUsers !== '' ? Number(metricActiveUsers).toLocaleString() : '—'}</span>
                    </div>
                    {metricBurnRate !== '' && (
                      <div className="cs-summary-row">
                        <span className="cs-summary-key">Burn Rate</span>
                        <span className="cs-summary-val">{fmt(Number(metricBurnRate))}</span>
                      </div>
                    )}
                    <div className="cs-summary-row">
                      <span className="cs-summary-key">Valuation ({valuationMode})</span>
                      <span className="cs-summary-val purple">
                        {fmt(valuationMode === 'pre'
                          ? (metricValuationPre  !== '' ? Number(metricValuationPre)  : null)
                          : (metricValuationPost !== '' ? Number(metricValuationPost) : null)
                        )}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="cs-nav">
              <div className="cs-nav-left">
                <button type="button" className="cs-btn cs-btn-ghost" onClick={prev}>
                  <ArrowLeft size={16} /> Назад
                </button>
                <span className="cs-progress">04 / 04</span>
              </div>
              <div className="cs-nav-right">
                <button type="button" className="cs-btn cs-btn-submit" onClick={handleSave} disabled={saving}>
                  {saving ? 'Сохранение…' : <><Check size={16} /> Сохранить</>}
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}