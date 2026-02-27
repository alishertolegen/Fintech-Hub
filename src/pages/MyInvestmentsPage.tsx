// src/pages/MyInvestmentsPage.tsx
import React, { useEffect, useMemo, useState, JSX } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import {
  Search, X, ArrowUpDown, TrendingUp, Briefcase,
  DollarSign, BarChart2, ExternalLink, EyeOff,
  PieChart, AlertCircle,
} from 'lucide-react';
import './MyInvestmentsPage.css';

const API          = 'http://localhost:8080/api/investments';
const STARTUPS_API = 'http://localhost:8080/api/startups';
const EXIT_API     = 'http://localhost:8080/api/exit-requests';

/* ── Types ── */
type Investment = {
  id: string;
  _id?: string;
  startupId: string;
  investorId: string;
  amount: number;
  currency?: string | null;
  equityPercent: number;
  valuationPostMoney?: number | null;
  status: string;
  createdAt: string;
  updatedAt?: string;
  note?: string | null;
};

type Startup = {
  id: string;
  _id?: string;
  name: string;
  slug?: string;
  stage?: string;
  industry?: string;
  shortPitch?: string;
  logoUrl?: string;
  website?: string;
  visibility?: string;
};

type Row = Investment & { startup?: Startup | null; startupLoading?: boolean };

type SortKey      = 'newest' | 'oldest' | 'amount_desc' | 'amount_asc' | 'equity_desc';
type StatusFilter = 'all' | 'active' | 'completed' | 'pending' | 'exited';
type AmountRange  = 'all' | '1k' | '10k' | '100k' | '500k';

/* ── Constants ── */
const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'newest',      label: 'Новые' },
  { value: 'oldest',      label: 'Старые' },
  { value: 'amount_desc', label: 'Сумма ↓' },
  { value: 'amount_asc',  label: 'Сумма ↑' },
  { value: 'equity_desc', label: 'Доля ↓' },
];

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all',       label: 'Все' },
  { value: 'active',    label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'pending',   label: 'Pending' },
  { value: 'exited',    label: 'Exited' },
];

const AMOUNT_RANGES: { value: AmountRange; label: string }[] = [
  { value: 'all',   label: 'Любая' },
  { value: '1k',    label: '$1K+' },
  { value: '10k',   label: '$10K+' },
  { value: '100k',  label: '$100K+' },
  { value: '500k',  label: '$500K+' },
];

/* ── Helpers ── */
function Logo({ name, url }: { name?: string; url?: string }) {
  if (url) return <img src={url} alt={name} className="inv-logo-image" />;
  const initials = (name || '').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  return <div className="inv-logo-initials">{initials || '?'}</div>;
}

function fmt(n?: number | null, currency = 'USD'): string {
  if (n == null) return '—';
  const sym = currency === 'EUR' ? '€' : '$';
  if (n >= 1_000_000) return `${sym}${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `${sym}${(n / 1_000).toFixed(0)}K`;
  return `${sym}${n.toLocaleString()}`;
}

function fmtPct(v: number): string {
  return `${(v * 100).toFixed(2)}%`;
}

function fmtDate(iso?: string): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return iso; }
}

function matchAmount(amount: number, range: AmountRange): boolean {
  if (range === 'all')   return true;
  if (range === '1k')    return amount >= 1_000;
  if (range === '10k')   return amount >= 10_000;
  if (range === '100k')  return amount >= 100_000;
  if (range === '500k')  return amount >= 500_000;
  return true;
}

function sortRows(list: Row[], key: SortKey): Row[] {
  return [...list].sort((a, b) => {
    switch (key) {
      case 'newest':      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'amount_desc': return b.amount - a.amount;
      case 'amount_asc':  return a.amount - b.amount;
      case 'equity_desc': return b.equityPercent - a.equityPercent;
      default: return 0;
    }
  });
}

/* ══════════════════════════════════════════════════════ */
export default function MyInvestmentsPage(): JSX.Element {
  const { user } = useAuth();

  const [rows, setRows]           = useState<Row[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [loadingExitId, setLoadingExitId] = useState<string | null>(null);

  const [searchTerm, setSearchTerm]         = useState('');
  const [statusFilter, setStatusFilter]     = useState<StatusFilter>('all');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [amountRange, setAmountRange]       = useState<AmountRange>('all');
  const [sortKey, setSortKey]               = useState<SortKey>('newest');

  /* ── Fetch investments ── */
  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }

    fetch(`${API}/investor/${user.id}`, { credentials: 'include' })
      .then((r) => { if (!r.ok) throw new Error(`${r.status}`); return r.json(); })
      .then((data: Investment[]) => {
        const base: Row[] = data.map((inv) => ({ ...inv, startup: null, startupLoading: true }));
        setRows(base);
        setLoading(false);

        data.forEach((inv, idx) => {
          fetch(`${STARTUPS_API}/${inv.startupId}`, { credentials: 'include' })
            .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
            .then((startup: Startup) =>
              setRows((prev) => {
                const next = [...prev];
                next[idx] = { ...next[idx], startup, startupLoading: false };
                return next;
              })
            )
            .catch(() =>
              setRows((prev) => {
                const next = [...prev];
                next[idx] = { ...next[idx], startup: null, startupLoading: false };
                return next;
              })
            );
        });
      })
      .catch((e) => { setError(e.message ?? 'Ошибка загрузки'); setLoading(false); });
  }, [user]);

  /* ── Exit handler ── */
  const handleExit = async (invId: string) => {
    const price = prompt('Введите цену выхода (например 5000):');
    if (!price) return;
    try {
      setLoadingExitId(invId);
      await fetch(EXIT_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ investmentId: invId, price: Number(price) }),
      });
      alert('Запрос на выход отправлен 🚀');
    } catch { alert('Ошибка при создании запроса'); }
    finally { setLoadingExitId(null); }
  };

  /* ── Derived ── */
  const industries = useMemo(() => {
    const s = new Set<string>();
    rows.forEach((r) => { if (r.startup?.industry) s.add(r.startup.industry); });
    return Array.from(s).sort();
  }, [rows]);

  const statusCounts = useMemo(() => {
    const c: Record<string, number> = {};
    rows.forEach((r) => { c[r.status] = (c[r.status] ?? 0) + 1; });
    return c;
  }, [rows]);

  const filtered = useMemo(() => {
    const list = rows.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (industryFilter !== 'all' && r.startup?.industry !== industryFilter) return false;
      if (!matchAmount(r.amount, amountRange)) return false;
      const q = searchTerm.trim().toLowerCase();
      if (!q) return true;
      return (
        (r.startup?.name ?? '').toLowerCase().includes(q) ||
        (r.startup?.industry ?? '').toLowerCase().includes(q) ||
        (r.startup?.shortPitch ?? '').toLowerCase().includes(q) ||
        r.startupId.toLowerCase().includes(q)
      );
    });
    return sortRows(list, sortKey);
  }, [rows, searchTerm, statusFilter, industryFilter, amountRange, sortKey]);

  /* Stats */
  const totalInvested  = rows.reduce((s, r) => s + (r.amount || 0), 0);
  const totalEquityPct = rows.reduce((s, r) => s + (r.equityPercent || 0), 0);
  const activeCount    = rows.filter((r) => r.status === 'active').length;
  const avgTicket      = rows.length > 0 ? Math.round(totalInvested / rows.length) : 0;

  const hasActiveFilters = statusFilter !== 'all' || industryFilter !== 'all' || amountRange !== 'all';

  /* ── Render ── */
  return (
    <div className="inv-container">

      {/* ═══ PAGE TITLE ═══ */}
      <div className="inv-page-title">
        <h1>Мои инвестиции</h1>
        <p className="inv-subtitle">Портфель и отслеживание сделок</p>
      </div>

      {/* ═══ STATS ═══ */}
      <div className="inv-stats-row">
        <div className="inv-stat-card">
          <DollarSign size={16} className="inv-stat-icon" />
          <div>
            <div className="inv-stat-label">Всего инвестировано</div>
            <div className="inv-stat-value">{fmt(totalInvested)}</div>
          </div>
        </div>
        <div className="inv-stat-card">
          <BarChart2 size={16} className="inv-stat-icon" />
          <div>
            <div className="inv-stat-label">Активных позиций</div>
            <div className="inv-stat-value">
              {activeCount} <span className="inv-stat-sub">/ {rows.length}</span>
            </div>
          </div>
        </div>
        <div className="inv-stat-card">
          <PieChart size={16} className="inv-stat-icon" />
          <div>
            <div className="inv-stat-label">Общая доля</div>
            <div className="inv-stat-value">{fmtPct(totalEquityPct)}</div>
          </div>
        </div>
        <div className="inv-stat-card">
          <TrendingUp size={16} className="inv-stat-icon" />
          <div>
            <div className="inv-stat-label">Средний чек</div>
            <div className="inv-stat-value">{fmt(avgTicket)}</div>
          </div>
        </div>
      </div>

      {/* ═══ MAIN LAYOUT ═══ */}
      <div className="inv-layout">

        {/* ── SIDEBAR ── */}
        <aside className="inv-sidebar">

          <span className="inv-sidebar-label">Статус</span>
          {STATUS_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              className={`inv-sidebar-btn${statusFilter === value ? ' active' : ''}`}
              onClick={() => setStatusFilter(value)}
            >
              <span className="inv-sidebar-dot" />
              <span className="inv-sidebar-btn-label">{label}</span>
              <span className="inv-sidebar-count">
                {value === 'all' ? rows.length : (statusCounts[value] ?? 0)}
              </span>
            </button>
          ))}

          <div className="inv-sidebar-divider" />

          <span className="inv-sidebar-label">Отрасль</span>
          <select
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            className={`inv-sidebar-select${industryFilter !== 'all' ? ' active' : ''}`}
          >
            <option value="all">Все отрасли</option>
            {industries.map((ind) => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>

          <div className="inv-sidebar-divider" />

          <span className="inv-sidebar-label">Сумма</span>
          <div className="inv-range-grid">
            {AMOUNT_RANGES.map(({ value, label }) => (
              <button
                key={value}
                className={`inv-pill${amountRange === value ? ' active' : ''}`}
                onClick={() => setAmountRange(value)}
              >
                {label}
              </button>
            ))}
          </div>

          {hasActiveFilters && (
            <button className="inv-sidebar-reset" onClick={() => { setStatusFilter('all'); setIndustryFilter('all'); setAmountRange('all'); }}>
              <X size={12} /> Сбросить фильтры
            </button>
          )}

        </aside>

        {/* ── MAIN CONTENT ── */}
        <div className="inv-main">

          {/* Search + sort */}
          <div className="inv-search-row">
            <div className="inv-search-wrapper">
              <Search className="inv-search-icon" size={18} />
              <input
                className="inv-search-input"
                placeholder="Поиск по стартапу, отрасли, pitch…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="inv-search-clear" onClick={() => setSearchTerm('')} aria-label="Очистить">
                  <X size={15} />
                </button>
              )}
            </div>

            <div className="inv-sort-wrapper">
              <ArrowUpDown size={14} className="inv-sort-icon" />
              <select
                className="inv-sort-select"
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
              >
                {SORT_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div className="inv-count">
              <strong>{filtered.length}</strong>&nbsp;найдено
            </div>
          </div>

          {/* States */}
          {loading && <div className="inv-loading-state">Загрузка инвестиций…</div>}
          {error   && <div className="inv-error-state"><AlertCircle size={16} /> Ошибка: {error}</div>}

          {!loading && !error && rows.length === 0 && (
            <div className="inv-zero-state">
              <div className="inv-zero-icon">💼</div>
              <h2>У вас пока нет инвестиций</h2>
              <p>Начните инвестировать в перспективные стартапы и следите за их ростом</p>
              <Link to="/startups" className="inv-zero-btn">
                <TrendingUp size={16} /> Найти стартапы
              </Link>
            </div>
          )}

          {/* Grid */}
          {!loading && !error && rows.length > 0 && (
            <div className="inv-grid">
              {filtered.map((row) => {
                const invId = row.id || row._id || '';
                const s     = row.startup;
                const cur   = row.currency || 'USD';

                return (
                  <article key={invId} className="inv-card">

                    <div className="inv-card-top">
                      <div className="inv-card-logo">
                        {row.startupLoading
                          ? <div className="inv-logo-skeleton" />
                          : s
                            ? <Logo name={s.name} url={s.logoUrl} />
                            : <div className="inv-logo-initials">?</div>
                        }
                      </div>
                      <div className="inv-card-header">
                        <div className="inv-name-row">
                          <h2>
                            {row.startupLoading
                              ? <span className="inv-loading-text">Загрузка…</span>
                              : s
                                ? <Link to={`/startups/${s.id || s._id}`} className="inv-startup-link">{s.name}</Link>
                                : <span className="inv-loading-text">#{row.startupId.slice(0, 8)}</span>
                            }
                          </h2>
                          {s?.stage && <span className="inv-stage-badge">{s.stage}</span>}
                          {s?.visibility === 'private' && (
                            <span className="inv-private-badge"><EyeOff size={10}/> private</span>
                          )}
                          <span className="inv-created-date">{fmtDate(row.createdAt)}</span>
                        </div>
                        {s?.industry && (
                          <span className="inv-industry-pill"><Briefcase size={11}/> {s.industry}</span>
                        )}
                        {s?.shortPitch && (
                          <p className="inv-short-pitch">{s.shortPitch}</p>
                        )}
                      </div>
                    </div>

                    <div className="inv-card-body">
                      <div className="inv-metrics">
                        <div className="inv-chip">
                          <DollarSign size={11}/>
                          Сумма <strong>{fmt(row.amount, cur)}</strong>
                        </div>
                        <div className="inv-chip">
                          <PieChart size={11}/>
                          Доля <strong>{fmtPct(row.equityPercent)}</strong>
                        </div>
                        <div className="inv-chip">
                          <BarChart2 size={11}/>
                          Post-val <strong>{fmt(row.valuationPostMoney, cur)}</strong>
                        </div>
                      </div>

                      {row.note && <div className="inv-note">{row.note}</div>}
                    </div>

                    <div className="inv-card-footer">
                      <div className="inv-footer-left">
                        <span className={`inv-status-badge inv-status-${row.status.toLowerCase()}`}>
                          {row.status}
                        </span>
                        <span className="inv-id">ID: {invId.slice(0, 8)}…</span>
                      </div>
                      <div className="inv-footer-actions">
                        {s?.website && (
                          <a href={s.website} target="_blank" rel="noreferrer" className="inv-btn-site">
                            <ExternalLink size={13}/> Сайт
                          </a>
                        )}
                        <Link
                          to={`/startups/${s?.id || s?._id || row.startupId}`}
                          className="inv-btn-details"
                        >
                          Подробнее
                        </Link>
                        {row.status === 'active' && (
                          <button
                            className="inv-btn-exit"
                            onClick={() => handleExit(invId)}
                            disabled={loadingExitId === invId}
                          >
                            {loadingExitId === invId ? '…' : 'Выйти'}
                          </button>
                        )}
                      </div>
                    </div>

                  </article>
                );
              })}

              {filtered.length === 0 && (
                <div className="inv-empty-state">
                  <h3>Инвестиции не найдены</h3>
                  <p>Попробуйте изменить поисковый запрос или фильтры.</p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}