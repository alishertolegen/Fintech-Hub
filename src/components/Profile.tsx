// src/components/Profile.tsx
import React, { useEffect, useState } from 'react';
import {
  Mail, Phone, MapPin, Briefcase, Pencil, Check, X,
  Globe, TrendingUp, Layers, Shield, DollarSign,
  Activity, PieChart, ArrowUpRight, Clock, Zap, Target, BarChart2,
  Rocket, FileText, Users, ChevronDown, ChevronUp, ExternalLink,
  Flame, Eye, Tag
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import './Profile.css';

/* ─── Types ─────────────────────────────────────────────────────── */
type ApiUser = {
  id?: string; email?: string; name?: string; fullName?: string;
  company?: string; bio?: string; avatarUrl?: string;
  meta?: { phone?: string; location?: string };
  phone?: string; location?: string; role?: string;
};

type InvestorApi = {
  id?: string; userId?: string; legalName?: string; type?: string;
  minCheck?: number; maxCheck?: number; preferredIndustries?: string[];
  preferredStages?: string[]; description?: string; website?: string; isVerified?: boolean;
};

type Investment = {
  id?: string; startupId?: string; investorId?: string;
  amount?: number; currency?: string; equityPercent?: number;
  valuationPostMoney?: number; status?: string; note?: string;
  createdAt?: string; updatedAt?: string;
};

type MetricsSnapshot = {
  mrr?: number; activeUsers?: number; burnRate?: number;
  valuationPreMoney?: number; valuationPostMoney?: number;
};

type Startup = {
  id?: string; name?: string; slug?: string; founderId?: string;
  stage?: string; industry?: string; shortPitch?: string; description?: string;
  website?: string; logoUrl?: string; visibility?: string; valuationMode?: string;
  metricsSnapshot?: MetricsSnapshot; createdAt?: string; updatedAt?: string;
};

type Offer = {
  id?: string; title?: string; startupId?: string; investorId?: string;
  amount?: number; equityPercent?: number; type?: string; visibility?: string;
  status?: string; note?: string; createdAt?: string;
};

/* ─── Helpers ────────────────────────────────────────────────────── */
function InitialsAvatar({ name = '' }: { name?: string }) {
  const initials = name.trim().split(/\s+/).map(p => p[0] ?? '').slice(0, 2).join('').toUpperCase();
  return <div className="pf-initials">{initials || 'U'}</div>;
}

function fmt(n?: number | null) {
  if (n == null) return '—';
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

function fmtDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
}

function fmtPct(n?: number | null) {
  if (n == null) return '—';
  return `${(n * 100).toFixed(2)}%`;
}

const PALETTE = ['#ff8c6b', '#60a5fa', '#c084fc', '#4ade80', '#fbbf24', '#f472b6'];

/* ─── Startup Card (single) ──────────────────────────────────────── */
function StartupCard({ startup, offers, investments }: {
  startup: Startup;
  offers: Offer[];
  investments: Investment[];
}) {
  const [expanded, setExpanded] = useState(false);
  const ms = startup.metricsSnapshot ?? {};

  const myOffers = offers.filter(o => o.startupId === startup.id);
  const myInvestments = investments.filter(i => i.startupId === startup.id);
  const totalRaised = myInvestments.reduce((s, i) => s + (i.amount ?? 0), 0);

  const stageCls = (startup.stage ?? 'idea').toLowerCase().replace(/\s+/g, '-');

  const logoInitial = (startup.name ?? 'S')[0].toUpperCase();

  return (
    <div className="pf-startup-card">
      {/* Header — always visible */}
      <div className="pf-startup-header" onClick={() => setExpanded(e => !e)}>
        <div className="pf-startup-logo">
          {startup.logoUrl
            ? <img src={startup.logoUrl} alt={startup.name} />
            : logoInitial}
        </div>
        <div className="pf-startup-meta">
          <div className="pf-startup-name-row">
            <span className="pf-startup-name">{startup.name}</span>
            <span className={`pf-startup-stage ${stageCls}`}>{startup.stage ?? 'idea'}</span>
            {startup.industry && (
              <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                <Tag size={9} /> {startup.industry}
              </span>
            )}
            {startup.visibility && (
              <span className={`pf-visibility-badge ${startup.visibility}`}>
                <Eye size={8} /> {startup.visibility}
              </span>
            )}
          </div>
          {startup.shortPitch && (
            <div className="pf-startup-pitch">{startup.shortPitch}</div>
          )}
        </div>
        <div className="pf-startup-toggle">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* Metrics strip */}
      <div className="pf-metrics-strip">
        <div className="pf-metric-cell">
          <div className="pf-metric-label orange"><Flame size={9} style={{display:'inline',marginRight:2}}/>MRR</div>
          <div className="pf-metric-val">{ms.mrr != null ? fmt(ms.mrr) : '—'}</div>
        </div>
        <div className="pf-metric-cell">
          <div className="pf-metric-label blue"><Users size={9} style={{display:'inline',marginRight:2}}/>Пользователи</div>
          <div className="pf-metric-val">{ms.activeUsers != null ? ms.activeUsers.toLocaleString() : '—'}</div>
        </div>
        <div className="pf-metric-cell">
          <div className="pf-metric-label purple"><TrendingUp size={9} style={{display:'inline',marginRight:2}}/>Оценка</div>
          <div className="pf-metric-val">{fmt(ms.valuationPostMoney ?? ms.valuationPreMoney)}</div>
        </div>
        <div className="pf-metric-cell">
          <div className="pf-metric-label green"><DollarSign size={9} style={{display:'inline',marginRight:2}}/>Привлечено</div>
          <div className="pf-metric-val">{totalRaised > 0 ? fmt(totalRaised) : '—'}</div>
        </div>
        {ms.burnRate != null && (
          <div className="pf-metric-cell">
            <div className="pf-metric-label yellow">Burn/мес</div>
            <div className="pf-metric-val">{fmt(ms.burnRate)}</div>
          </div>
        )}
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="pf-startup-detail">
          {/* Description */}
          {startup.description && (
            <div style={{ marginBottom: 16 }}>
              <div className="pf-sub-label"><FileText size={10} />Описание</div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0 }}>
                {startup.description}
              </p>
            </div>
          )}

          {/* Website */}
          {startup.website && (
            <div style={{ marginBottom: 16 }}>
              <a href={startup.website} target="_blank" rel="noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--accent-2)', textDecoration: 'none', borderBottom: '1px solid rgba(255,170,128,0.3)' }}>
                <Globe size={12} /> {startup.website} <ExternalLink size={10} />
              </a>
            </div>
          )}

          {/* Valuation detail */}
          <div style={{ marginBottom: 16, display: 'flex', gap: 10 }}>
            <div style={{ flex: 1, background: 'rgba(255,248,242,0.03)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px' }}>
              <div className="pf-metric-label purple" style={{ marginBottom: 4 }}>Pre-money</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, color: 'var(--text-primary)' }}>{fmt(ms.valuationPreMoney)}</div>
            </div>
            <div style={{ flex: 1, background: 'rgba(255,248,242,0.03)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px' }}>
              <div className="pf-metric-label green" style={{ marginBottom: 4 }}>Post-money</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, color: 'var(--text-primary)' }}>{fmt(ms.valuationPostMoney)}</div>
            </div>
            <div style={{ flex: 1, background: 'rgba(255,248,242,0.03)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px' }}>
              <div className="pf-metric-label orange" style={{ marginBottom: 4 }}>Режим</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, color: 'var(--text-primary)', textTransform: 'uppercase' }}>{startup.valuationMode ?? '—'}</div>
            </div>
          </div>

          {/* Investments received */}
          {myInvestments.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div className="pf-sub-label"><DollarSign size={10} />Полученные инвестиции ({myInvestments.length})</div>
              {myInvestments.map((inv, i) => (
                <div key={inv.id ?? i} className="pf-offer-row">
                  <div className={`pf-inv-dot ${inv.status ?? 'active'}`} />
                  <span className="pf-offer-title" style={{ fontFamily: 'Courier New, monospace', fontSize: 11 }}>
                    investor #{(inv.investorId ?? '').slice(-8)}
                  </span>
                  <span className="pf-offer-amount">{fmt(inv.amount)}</span>
                  {inv.equityPercent != null && (
                    <span className="pf-offer-equity"><ArrowUpRight size={10} />{fmtPct(inv.equityPercent)}</span>
                  )}
                  <span className={`pf-offer-status ${inv.status ?? 'active'}`}>{inv.status ?? 'active'}</span>
                </div>
              ))}
            </div>
          )}

          {/* Offers received */}
          {myOffers.length > 0 && (
            <div>
              <div className="pf-sub-label"><FileText size={10} />Офферы ({myOffers.length})</div>
              {myOffers.map((offer, i) => (
                <div key={offer.id ?? i} className="pf-offer-row">
                  <span className="pf-offer-title">{offer.title ?? `Оффер от инвестора #${(offer.investorId ?? '').slice(-6)}`}</span>
                  <span className="pf-offer-amount">{fmt(offer.amount)}</span>
                  {offer.equityPercent != null && (
                    <span className="pf-offer-equity">{fmtPct(offer.equityPercent)}</span>
                  )}
                  <span className={`pf-offer-status ${offer.status ?? 'sent'}`}>{offer.status ?? 'sent'}</span>
                </div>
              ))}
            </div>
          )}

          {myOffers.length === 0 && myInvestments.length === 0 && (
            <div className="pf-empty" style={{ padding: '12px 0' }}>
              <div className="pf-empty-icon"><FileText size={16} /></div>
              Офферов и инвестиций пока нет
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Founder Panel ──────────────────────────────────────────────── */
function FounderPanel({ startups, offers, investments, loadingStartups }: {
  startups: Startup[];
  offers: Offer[];
  investments: Investment[];
  loadingStartups: boolean;
}) {
  const totalRaised    = investments.reduce((s, i) => s + (i.amount ?? 0), 0);
  const totalOffers    = offers.length;
  const pendingOffers  = offers.filter(o => o.status === 'sent' || o.status === 'pending').length;
  const acceptedOffers = offers.filter(o => o.status === 'accepted').length;

  return (
    <div className="pf-card" style={{ animationDelay: '0.18s' }}>
      <div className="pf-section-header">
        <h2 className="pf-section-title">
          <span className="pf-section-icon orange"><Rocket size={13} /></span>
          Мои стартапы
        </h2>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
          {startups.length} проектов
        </span>
      </div>

      {/* Summary stats */}
      <div className="pf-stats-grid">
        <div className="pf-stat-card">
          <div className="pf-stat-label green"><DollarSign size={11} />Привлечено</div>
          <div className="pf-stat-val">{totalRaised > 0 ? fmt(totalRaised) : '—'}</div>
          <div className="pf-stat-sub">суммарно по всем стартапам</div>
        </div>
        <div className="pf-stat-card">
          <div className="pf-stat-label orange"><Rocket size={11} />Стартапов</div>
          <div className="pf-stat-val">{startups.length}</div>
          <div className="pf-stat-sub">активных проектов</div>
        </div>
        <div className="pf-stat-card">
          <div className="pf-stat-label blue"><FileText size={11} />Офферов</div>
          <div className="pf-stat-val">{totalOffers}</div>
          <div className="pf-stat-sub">{pendingOffers} ожидают ответа</div>
        </div>
        <div className="pf-stat-card">
          <div className="pf-stat-label purple"><Check size={11} />Принято</div>
          <div className="pf-stat-val">{acceptedOffers}</div>
          <div className="pf-stat-sub">успешных офферов</div>
        </div>
      </div>

      {/* Startup cards */}
      <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {loadingStartups ? (
          [0,1].map(i => (
            <div key={i} className="pf-startup-card">
              <div className="pf-startup-header">
                <div className="pf-skeleton" style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div className="pf-skeleton" style={{ width: '35%', height: 16 }} />
                  <div className="pf-skeleton" style={{ width: '70%', height: 12 }} />
                </div>
              </div>
            </div>
          ))
        ) : startups.length === 0 ? (
          <div className="pf-empty">
            <div className="pf-empty-icon"><Rocket size={18} /></div>
            Стартапов пока нет
          </div>
        ) : (
          startups.map((s, idx) => (
            <StartupCard
              key={s.id ?? idx}
              startup={s}
              offers={offers}
              investments={investments}
            />
          ))
        )}
      </div>
    </div>
  );
}

/* ─── Investments Panel ─────────────────────────────────────────── */
function InvestmentsPanel({ investments, loadingInv }: { investments: Investment[]; loadingInv: boolean }) {
  const totalDeployed = investments.reduce((s, i) => s + (i.amount ?? 0), 0);
  const activeCount   = investments.filter(i => i.status === 'active').length;
  const avgEquity     = investments.length
    ? investments.reduce((s, i) => s + (i.equityPercent ?? 0), 0) / investments.length
    : null;
  const totalPortfolioVal = investments.reduce((s, i) => s + (i.valuationPostMoney ?? 0), 0);

  /* portfolio bar segments by startup (top 5 + rest) */
  const segmented = investments.slice(0, 5).map((inv, idx) => ({
    id: inv.startupId ?? idx.toString(),
    amount: inv.amount ?? 0,
    color: PALETTE[idx % PALETTE.length],
  }));

  const segTotal = segmented.reduce((s, x) => s + x.amount, 0);

  return (
    <div className="pf-card" style={{ animationDelay: '0.18s' }}>
      <div className="pf-section-header">
        <h2 className="pf-section-title">
          <span className="pf-section-icon green"><BarChart2 size={13} /></span>
          Инвестиционный портфель
        </h2>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
          {investments.length} сделок
        </span>
      </div>

      {/* Stats grid */}
      <div className="pf-stats-grid">
        <div className="pf-stat-card">
          <div className="pf-stat-label orange"><DollarSign size={11} /> Вложено</div>
          <div className="pf-stat-val">{fmt(totalDeployed)}</div>
          <div className="pf-stat-sub">общий объём</div>
        </div>
        <div className="pf-stat-card">
          <div className="pf-stat-label green"><Activity size={11} /> Активных</div>
          <div className="pf-stat-val">{activeCount}</div>
          <div className="pf-stat-sub">из {investments.length} сделок</div>
        </div>
        <div className="pf-stat-card">
          <div className="pf-stat-label blue"><PieChart size={11} /> Ср. доля</div>
          <div className="pf-stat-val">{avgEquity != null ? fmtPct(avgEquity) : '—'}</div>
          <div className="pf-stat-sub">средняя equity</div>
        </div>
        <div className="pf-stat-card">
          <div className="pf-stat-label purple"><TrendingUp size={11} /> Портфель</div>
          <div className="pf-stat-val">{fmt(totalPortfolioVal || null)}</div>
          <div className="pf-stat-sub">оценка post-money</div>
        </div>
      </div>

      {/* Portfolio bar */}
      {segTotal > 0 && (
        <div style={{ padding: '0 24px 20px' }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>
            Распределение по стартапам
          </div>
          <div className="pf-portfolio-bar">
            {segmented.map(seg => (
              <div
                key={seg.id}
                className="pf-portfolio-bar-seg"
                style={{ width: `${(seg.amount / segTotal) * 100}%`, background: seg.color }}
                title={`${seg.id}: ${fmt(seg.amount)}`}
              />
            ))}
          </div>
          <div className="pf-portfolio-legend">
            {segmented.map((seg, i) => (
              <div key={seg.id} className="pf-legend-item">
                <div className="pf-legend-dot" style={{ background: seg.color }} />
                <span style={{ fontFamily: 'Courier New, monospace', fontSize: 10 }}>{seg.id.slice(-8)}</span>
                <span style={{ color: 'var(--text-muted)' }}>{fmt(seg.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* List */}
      <div style={{ padding: '0 24px 24px' }}>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 10 }}>
          Последние сделки
        </div>
        {loadingInv ? (
          <div className="pf-inv-list">
            {[0,1,2].map(i => (
              <div key={i} className="pf-inv-row">
                <div className="pf-skeleton" style={{ width: 8, height: 8, borderRadius: '50%' }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div className="pf-skeleton" style={{ width: '40%' }} />
                  <div className="pf-skeleton" style={{ width: '70%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : investments.length === 0 ? (
          <div className="pf-empty">
            <div className="pf-empty-icon"><DollarSign size={18} /></div>
            Инвестиций пока нет
          </div>
        ) : (
          <div className="pf-inv-list">
            {[...investments].sort((a, b) => (b.createdAt ?? '') > (a.createdAt ?? '') ? 1 : -1).map((inv, idx) => (
              <div key={inv.id ?? idx} className="pf-inv-row" style={{ animationDelay: `${0.04 * idx}s` }}>
                <div className={`pf-inv-dot ${inv.status ?? 'active'}`} />
                <div className="pf-inv-info">
                  <div className="pf-inv-id">#{(inv.startupId ?? 'unknown').slice(-12)}</div>
                  <div className="pf-inv-meta">
                    <span className="pf-inv-amount">{fmt(inv.amount)}</span>
                    {inv.equityPercent != null && (
                      <span className="pf-inv-equity"><ArrowUpRight size={10} /> {fmtPct(inv.equityPercent)}</span>
                    )}
                    {inv.valuationPostMoney != null && (
                      <span className="pf-inv-valuation">post: {fmt(inv.valuationPostMoney)}</span>
                    )}
                  </div>
                </div>
                <div className="pf-inv-date"><Clock size={10} />{fmtDate(inv.createdAt)}</div>
                <span className={`pf-inv-status ${inv.status ?? 'active'}`}>{inv.status ?? 'active'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Investor Profile Panel ─────────────────────────────────────── */
function InvestorPanel({
  investor, editingInvestor, investorSaving,
  onEdit, onCancel, onSave, onChange
}: {
  investor: InvestorApi | null;
  editingInvestor: boolean;
  investorSaving: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (v: InvestorApi) => void;
  onChange: (updater: (prev: InvestorApi | null) => InvestorApi) => void;
}) {
  return (
    <div className="pf-card" style={{ animationDelay: '0.22s' }}>
      <div className="pf-section-header">
        <h2 className="pf-section-title">
          <span className="pf-section-icon orange"><Target size={13} /></span>
          Профиль инвестора
        </h2>
        {!editingInvestor && (
          <button className="pf-btn pf-btn-primary" onClick={onEdit}>
            <Pencil size={12} /> Редактировать
          </button>
        )}
      </div>
      <div className="pf-body">
        {!editingInvestor ? (
          <div className="pf-data-grid">
            <div className="pf-data-item">
              <div className="pf-data-key">Юридическое имя</div>
              <div className="pf-data-val">{investor?.legalName ?? '—'}</div>
            </div>
            <div className="pf-data-item">
              <div className="pf-data-key">Тип инвестора</div>
              <div className="pf-data-val">{investor?.type ?? '—'}</div>
            </div>
            <div className="pf-data-item">
              <div className="pf-data-key"><Layers size={9} /> Размер чека</div>
              <div className="pf-data-val">
                <div className="pf-check-range">
                  <span className="pf-amount">{fmt(investor?.minCheck)}</span>
                  <span className="sep">→</span>
                  <span className="pf-amount">{fmt(investor?.maxCheck)}</span>
                </div>
              </div>
            </div>
            <div className="pf-data-item">
              <div className="pf-data-key"><Globe size={9} /> Сайт</div>
              <div className="pf-data-val">
                {investor?.website
                  ? <a href={investor.website} target="_blank" rel="noreferrer">{investor.website}</a>
                  : '—'}
              </div>
            </div>
            <div className="pf-data-item">
              <div className="pf-data-key">Отрасли</div>
              <div className="pf-data-val">
                {(investor?.preferredIndustries?.length ?? 0) > 0
                  ? <div className="pf-tag-list">{investor!.preferredIndustries!.map(t => <span key={t} className="pf-tag">{t}</span>)}</div>
                  : '—'}
              </div>
            </div>
            <div className="pf-data-item">
              <div className="pf-data-key">Стадии</div>
              <div className="pf-data-val">
                {(investor?.preferredStages?.length ?? 0) > 0
                  ? <div className="pf-tag-list">{investor!.preferredStages!.map(t => <span key={t} className="pf-tag">{t}</span>)}</div>
                  : '—'}
              </div>
            </div>
            {investor?.description && (
              <div className="pf-data-item full">
                <div className="pf-data-key">Описание</div>
                <div className="pf-data-val">{investor.description}</div>
              </div>
            )}
          </div>
        ) : (
          <div className="pf-form">
            <div className="pf-form-row">
              <input className="pf-input" placeholder="Юридическое имя"
                value={investor?.legalName ?? ''}
                onChange={e => onChange(p => ({ ...(p ?? {}), legalName: e.target.value }))} />
              <input className="pf-input" placeholder="Тип (angel, vc и т.д.)"
                value={investor?.type ?? ''}
                onChange={e => onChange(p => ({ ...(p ?? {}), type: e.target.value }))} />
            </div>
            <div className="pf-form-row">
              <input type="number" className="pf-input" placeholder="Min чек ($)"
                value={investor?.minCheck ?? ''}
                onChange={e => onChange(p => ({ ...(p ?? {}), minCheck: e.target.value ? Number(e.target.value) : undefined }))} />
              <input type="number" className="pf-input" placeholder="Max чек ($)"
                value={investor?.maxCheck ?? ''}
                onChange={e => onChange(p => ({ ...(p ?? {}), maxCheck: e.target.value ? Number(e.target.value) : undefined }))} />
            </div>
            <input className="pf-input" placeholder="Отрасли (через запятую)"
              value={(investor?.preferredIndustries ?? []).join(', ')}
              onChange={e => onChange(p => ({ ...(p ?? {}), preferredIndustries: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))} />
            <input className="pf-input" placeholder="Стадии (через запятую)"
              value={(investor?.preferredStages ?? []).join(', ')}
              onChange={e => onChange(p => ({ ...(p ?? {}), preferredStages: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))} />
            <input className="pf-input" placeholder="Сайт"
              value={investor?.website ?? ''}
              onChange={e => onChange(p => ({ ...(p ?? {}), website: e.target.value }))} />
            <textarea className="pf-textarea" placeholder="Описание"
              value={investor?.description ?? ''}
              onChange={e => onChange(p => ({ ...(p ?? {}), description: e.target.value }))} />
            <div className="pf-form-actions">
              <button className="pf-btn pf-btn-secondary" onClick={onCancel} disabled={investorSaving}>
                <X size={12} /> Отмена
              </button>
              <button className="pf-btn pf-btn-success" onClick={() => onSave(investor ?? {})} disabled={investorSaving}>
                <Check size={12} /> {investorSaving ? 'Сохранение…' : 'Сохранить'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────── */
export default function Profile() {
  const { user: authUser, token, loading: authLoading } = useAuth();
  const [user, setUser]         = useState<ApiUser | null>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [investor, setInvestor] = useState<InvestorApi | null>(null);
  const [editingInvestor, setEditingInvestor] = useState(false);
  const [investorSaving, setInvestorSaving]   = useState(false);
  const [investments, setInvestments]         = useState<Investment[]>([]);
  const [loadingInv, setLoadingInv]           = useState(false);
  const [startups, setStartups]               = useState<Startup[]>([]);
  const [loadingStartups, setLoadingStartups] = useState(false);
  const [founderOffers, setFounderOffers]     = useState<Offer[]>([]);
  const [founderInvestments, setFounderInvestments] = useState<Investment[]>([]);

  /* fetch user */
  useEffect(() => {
    if (authUser) {
      setUser({ id: authUser.id, email: authUser.email, name: authUser.fullName ?? authUser.email, company: authUser.company, bio: authUser.bio, avatarUrl: authUser.avatarUrl, phone: authUser.phone, location: authUser.location, role: authUser.role });
      setError(null); return;
    }
    if (!authLoading && token) {
      const abort = new AbortController();
      (async () => {
        setLoading(true); setError(null);
        try {
          const res = await fetch(`http://localhost:8080/api/users/me`, { headers: { Authorization: `Bearer ${token}` }, signal: abort.signal });
          if (!res.ok) { let msg = `Ошибка ${res.status}`; try { const j = await res.json(); msg = j.error ?? j.message ?? msg; } catch {} throw new Error(msg); }
          const data: ApiUser = await res.json();
          setUser({ id: data.id, email: data.email, name: data.name ?? data.fullName ?? data.email, company: data.company, bio: data.bio, avatarUrl: data.avatarUrl, phone: data.meta?.phone ?? data.phone, location: data.meta?.location ?? data.location, role: data.role });
        } catch (e: any) { if (e.name !== 'AbortError') setError(e.message ?? 'Не удалось загрузить профиль'); }
        finally { setLoading(false); }
      })();
      return () => abort.abort();
    }
    if (!authLoading && !token && !authUser) setUser(null);
  }, [authUser, token, authLoading]);

  /* fetch investor profile */
  useEffect(() => {
    if (!user || user.role !== 'investor') return;
    const abort = new AbortController();
    (async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/investors/user/${user.id}`, { headers: { Authorization: `Bearer ${token}` }, signal: abort.signal });
        if (res.ok) setInvestor(await res.json());
      } catch (e: any) { if (e.name !== 'AbortError') console.error(e); }
    })();
    return () => abort.abort();
  }, [user, token]);

  /* fetch investments for investor */
  useEffect(() => {
    if (!user || user.role !== 'investor') return;
    const abort = new AbortController();
    setLoadingInv(true);
    (async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/investments/investor/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: abort.signal
        });
        if (res.ok) setInvestments(await res.json());
      } catch (e: any) { if (e.name !== 'AbortError') console.error(e); }
      finally { setLoadingInv(false); }
    })();
    return () => abort.abort();
  }, [user, token]);

  /* fetch startups + offers + investments for founder */
  useEffect(() => {
    if (!user || user.role !== 'founder') return;
    const abort = new AbortController();
    setLoadingStartups(true);
    (async () => {
      try {
        // Load all startups and filter by founderId on frontend (no founderId filter endpoint)
        const res = await fetch(`http://localhost:8080/api/startups`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: abort.signal
        });
        if (res.ok) {
          const all: Startup[] = await res.json();
          const mine = all.filter(s => s.founderId === user.id);
          setStartups(mine);

          // For each startup, fetch offers and investments in parallel
          const offersAll: Offer[] = [];
          const invAll: Investment[] = [];
          await Promise.all(mine.map(async (s) => {
            try {
              const [offerRes, invRes] = await Promise.all([
                fetch(`http://localhost:8080/api/offers?startupId=${s.id}`, { headers: { Authorization: `Bearer ${token}` }, signal: abort.signal }),
                fetch(`http://localhost:8080/api/investments/startup/${s.id}`, { headers: { Authorization: `Bearer ${token}` }, signal: abort.signal }),
              ]);
              if (offerRes.ok) { const d = await offerRes.json(); offersAll.push(...d); }
              if (invRes.ok)   { const d = await invRes.json(); invAll.push(...d); }
            } catch {}
          }));
          setFounderOffers(offersAll);
          setFounderInvestments(invAll);
        }
      } catch (e: any) { if (e.name !== 'AbortError') console.error(e); }
      finally { setLoadingStartups(false); }
    })();
    return () => abort.abort();
  }, [user, token]);

  async function saveInvestor(updated: InvestorApi) {
    if (!user) return;
    setInvestorSaving(true);
    try {
      const url = updated.id
        ? `http://localhost:8080/api/investors/${updated.id}`
        : `http://localhost:8080/api/investors/user/${user.id}`;
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(updated)
      });
      if (!res.ok) { const j = await res.json().catch(() => ({})); throw new Error(j.message ?? `Ошибка ${res.status}`); }
      setInvestor(await res.json());
      setEditingInvestor(false);
    } catch (e: any) { alert('Ошибка при сохранении: ' + (e.message ?? e)); }
    finally { setInvestorSaving(false); }
  }

  /* hero summary stats for investor */
  const totalDeployed = investments.reduce((s, i) => s + (i.amount ?? 0), 0);
  const activeDeals   = investments.filter(i => i.status === 'active').length;

  /* hero summary stats for founder */
  const founderTotalRaised = founderInvestments.reduce((s, i) => s + (i.amount ?? 0), 0);
  const founderPendingOffers = founderOffers.filter(o => o.status === 'sent' || o.status === 'pending').length;

  /* ── States ── */
  if (authLoading || loading) return (
    <div className="pf-page">
      <div className="pf-state"><div className="pf-spinner" /> Загрузка профиля…</div>
    </div>
  );

  if (error) return (
    <div className="pf-page">
      <div className="pf-state" style={{ color: 'var(--accent)' }}>⚠ {error}</div>
    </div>
  );

  if (!user) return (
    <div className="pf-page">
      <div className="pf-state">Профиль недоступен — пожалуйста, войдите в систему.</div>
    </div>
  );

  const isInvestor = user.role === 'investor';
  const isFounder  = user.role === 'founder';

  return (
    <div className="pf-page">
      <div className="pf-wrap">

        {/* ── HERO ── */}
        <div className="pf-card pf-hero">
          <div className="pf-hero-bg" />
          <div className="pf-hero-inner">
            <div className="pf-avatar-ring">
              {user.avatarUrl
                ? <img src={user.avatarUrl} alt={user.name} />
                : <InitialsAvatar name={user.name} />}
              {investor?.isVerified && (
                <div className="pf-verified" title="Верифицирован">
                  <Shield size={11} color="#051a0a" />
                </div>
              )}
            </div>

            <div className="pf-hero-info">
              <div className="pf-hero-top">
                <h1 className="pf-name">{user.name}</h1>
                {user.role && (
                  <span className="pf-role-badge">
                    {user.role === 'investor' && <TrendingUp size={9} />}
                    {user.role}
                  </span>
                )}
              </div>
              {user.company && (
                <p className="pf-company">
                  <Briefcase size={12} /> {user.company}
                </p>
              )}
              {user.bio && <p className="pf-bio">"{user.bio}"</p>}

              {/* Quick stats for investors */}
              {isInvestor && !loadingInv && investments.length > 0 && (
                <div className="pf-hero-stats">
                  <div className="pf-hero-stat">
                    <span className="pf-hero-stat-val">{fmt(totalDeployed)}</span>
                    <span className="pf-hero-stat-label">Вложено</span>
                  </div>
                  <div className="pf-hero-stat-divider" />
                  <div className="pf-hero-stat">
                    <span className="pf-hero-stat-val">{investments.length}</span>
                    <span className="pf-hero-stat-label">Сделок</span>
                  </div>
                  <div className="pf-hero-stat-divider" />
                  <div className="pf-hero-stat">
                    <span className="pf-hero-stat-val">{activeDeals}</span>
                    <span className="pf-hero-stat-label">Активных</span>
                  </div>
                  {investor?.preferredIndustries?.length ? (
                    <>
                      <div className="pf-hero-stat-divider" />
                      <div className="pf-hero-stat">
                        <span className="pf-hero-stat-val">{investor.preferredIndustries.length}</span>
                        <span className="pf-hero-stat-label">Отраслей</span>
                      </div>
                    </>
                  ) : null}
                </div>
              )}

              {/* Quick stats for founders */}
              {isFounder && !loadingStartups && (
                <div className="pf-hero-stats">
                  <div className="pf-hero-stat">
                    <span className="pf-hero-stat-val">{startups.length}</span>
                    <span className="pf-hero-stat-label">Стартапов</span>
                  </div>
                  {founderTotalRaised > 0 && (
                    <>
                      <div className="pf-hero-stat-divider" />
                      <div className="pf-hero-stat">
                        <span className="pf-hero-stat-val">{fmt(founderTotalRaised)}</span>
                        <span className="pf-hero-stat-label">Привлечено</span>
                      </div>
                    </>
                  )}
                  {founderOffers.length > 0 && (
                    <>
                      <div className="pf-hero-stat-divider" />
                      <div className="pf-hero-stat">
                        <span className="pf-hero-stat-val">{founderOffers.length}</span>
                        <span className="pf-hero-stat-label">Офферов</span>
                      </div>
                    </>
                  )}
                  {founderPendingOffers > 0 && (
                    <>
                      <div className="pf-hero-stat-divider" />
                      <div className="pf-hero-stat">
                        <span className="pf-hero-stat-val" style={{ color: 'var(--accent-2)' }}>{founderPendingOffers}</span>
                        <span className="pf-hero-stat-label">Ожидают</span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── CONTACTS ── */}
        <div className="pf-contacts">
          {[
            { icon: <Mail size={15} />, label: 'Email', value: user.email },
            { icon: <Phone size={15} />, label: 'Телефон', value: user.phone ?? '—' },
            { icon: <MapPin size={15} />, label: 'Местоположение', value: user.location ?? '—' },
          ].map(({ icon, label, value }) => (
            <div className="pf-contact-card" key={label}>
              <div className="pf-contact-icon">{icon}</div>
              <div>
                <div className="pf-contact-label">{label}</div>
                <div className="pf-contact-value" title={value}>{value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── INVESTOR SECTIONS ── */}
        {isInvestor && (
          <>
            {/* Two-column: stats + profile */}
            <div className="pf-grid-2">
              {/* Investor profile */}
              <InvestorPanel
                investor={investor}
                editingInvestor={editingInvestor}
                investorSaving={investorSaving}
                onEdit={() => setEditingInvestor(true)}
                onCancel={() => setEditingInvestor(false)}
                onSave={saveInvestor}
                onChange={setInvestor as any}
              />

              {/* Check range visual card */}
              <div className="pf-card" style={{ animationDelay: '0.26s' }}>
                <div className="pf-section-header">
                  <h2 className="pf-section-title">
                    <span className="pf-section-icon blue"><Zap size={13} /></span>
                    Параметры инвестирования
                  </h2>
                </div>
                <div className="pf-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                  {/* Min/Max check visual */}
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 10 }}>
                      Диапазон чека
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--accent-2)' }}>{fmt(investor?.minCheck)}</span>
                      <div style={{ flex: 1, height: 3, background: 'var(--border)', borderRadius: 2, position: 'relative' }}>
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, var(--accent), var(--accent-2))', borderRadius: 2, animation: 'barGrow 1s ease both' }} />
                      </div>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--accent-2)' }}>{fmt(investor?.maxCheck)}</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>min → max</div>
                  </div>

                  {/* Preferred stages */}
                  {(investor?.preferredStages?.length ?? 0) > 0 && (
                    <div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>
                        Стадии
                      </div>
                      <div className="pf-tag-list">
                        {investor!.preferredStages!.map((s, i) => (
                          <span key={s} className="pf-tag" style={{ background: `${PALETTE[i % PALETTE.length]}18`, borderColor: `${PALETTE[i % PALETTE.length]}30`, color: PALETTE[i % PALETTE.length] }}>{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Preferred industries */}
                  {(investor?.preferredIndustries?.length ?? 0) > 0 && (
                    <div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>
                        Отрасли
                      </div>
                      <div className="pf-tag-list">
                        {investor!.preferredIndustries!.map(ind => (
                          <span key={ind} className="pf-tag">{ind}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {investor?.website && (
                    <a href={investor.website} target="_blank" rel="noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--accent-2)', textDecoration: 'none', borderBottom: '1px solid rgba(255,170,128,0.3)' }}>
                      <Globe size={12} /> {investor.website}
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Full-width investments panel */}
            <InvestmentsPanel investments={investments} loadingInv={loadingInv} />
          </>
        )}

        {/* ── FOUNDER SECTIONS ── */}
        {isFounder && (
          <FounderPanel
            startups={startups}
            offers={founderOffers}
            investments={founderInvestments}
            loadingStartups={loadingStartups}
          />
        )}

      </div>
    </div>
  );
}