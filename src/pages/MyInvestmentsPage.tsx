// src/pages/MyInvestmentsPage.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { TrendingUp, Briefcase } from 'lucide-react';
import './MyInvestmentsPage.css';

const API          = 'http://localhost:8080/api/investments';
const STARTUPS_API = 'http://localhost:8080/api/startups';
const EXIT_API = 'http://localhost:8080/api/exit-requests';

type Investment = {
  id: string;
  _id?: string;
  startupId: string;
  investorId: string;
  amount: number;
  currency?: string;
  equityPercent: number;
  valuationPostMoney?: number | null;
  status: string;
  createdAt: string;
  updatedAt?: string;
  note?: string;
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
};

type InvestmentWithStartup = Investment & {
  startup?: Startup | null;
  startupLoading?: boolean;
};

/* ── Helpers ── */
function Logo({ name, url }: { name?: string; url?: string }) {
  if (url) return <img src={url} alt={name} className="logo-image" />;
  const initials = (name || '').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  return <div className="logo-initials">{initials || 'S'}</div>;
}

function formatNum(n?: number | null): string {
  if (n == null) return '—';
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

/* ── Component ── */
export default function MyInvestmentsPage() {
  const { user } = useAuth();
  const [investments, setInvestments] = useState<InvestmentWithStartup[]>([]);
  const [loading, setLoading]         = useState(true);
  const [loadingExitId, setLoadingExitId] = useState<string | null>(null);
  const handleExit = async (investmentId: string) => {
  const price = prompt('Введите цену выхода (например 5000):');
  if (!price) return;

  try {
    setLoadingExitId(investmentId);

    await fetch(EXIT_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        investmentId,
        price: Number(price),
      }),
    });

    alert('Запрос на выход отправлен 🚀');
  } catch (e) {
    alert('Ошибка при создании запроса');
  } finally {
    setLoadingExitId(null);
  }
};
  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }

    fetch(`${API}/investor/${user.id}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((data: Investment[]) => {
        const base = data.map((inv) => ({ ...inv, startup: null, startupLoading: true }));
        setInvestments(base);
        setLoading(false);

        data.forEach((inv, idx) => {
          fetch(`${STARTUPS_API}/${inv.startupId}`, { credentials: 'include' })
            .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
            .then((startup: Startup) =>
              setInvestments((prev) => {
                const next = [...prev];
                next[idx] = { ...next[idx], startup, startupLoading: false };
                return next;
              })
            )
            .catch(() =>
              setInvestments((prev) => {
                const next = [...prev];
                next[idx] = { ...next[idx], startup: null, startupLoading: false };
                return next;
              })
            );
        });
      })
      .catch(() => setLoading(false));
  }, [user]);

  /* ── Stats ── */
  const totalInvested  = investments.reduce((s, i) => s + (i.amount || 0), 0);
  const totalEquityPct = investments.reduce((s, i) => s + (i.equityPercent || 0) * 100, 0);
  const activeCount    = investments.filter((i) => i.status === 'active' || i.status === 'completed').length;
  const avgTicket      = investments.length > 0 ? Math.round(totalInvested / investments.length) : 0;

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="investments-page-container">
        <div className="investments-loading">Загрузка инвестиций…</div>
      </div>
    );
  }

  /* ── Empty ── */
  if (!investments.length) {
    return (
      <div className="investments-page-container">
        <div className="investments-empty">
          <div className="empty-icon">💼</div>
          <h2 className="empty-title">У вас пока нет инвестиций</h2>
          <p className="empty-text">
            Начните инвестировать в перспективные стартапы и следите за их ростом
          </p>
          <Link to="/startups" className="empty-button">
            <TrendingUp size={18} /> Найти стартапы
          </Link>
        </div>
      </div>
    );
  }

  /* ── Main ── */
  return (
    <div className="investments-page-container">

      {/* ═══ HEADER ═══ */}
      <div className="investments-header">
        <h1 className="investments-title">Мои инвестиции</h1>
        <p className="investments-subtitle">Управление портфелем и отслеживание инвестиций</p>
      </div>

      {/* ═══ STATS ═══ */}
      <div className="investments-stats">
        <div className="stat-card">
          <div className="stat-label">Всего инвестировано</div>
          <div className="stat-value">{formatNum(totalInvested)}</div>
          <div className="stat-change">за всё время</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Активных позиций</div>
          <div className="stat-value">{activeCount}</div>
          <div className="stat-change">из {investments.length} всего</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Общая доля</div>
          <div className="stat-value">{totalEquityPct.toFixed(2)}%</div>
          <div className="stat-change">в портфеле</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Средний чек</div>
          <div className="stat-value">{formatNum(avgTicket)}</div>
          <div className="stat-change">на инвестицию</div>
        </div>
      </div>

      {/* ═══ LIST ═══ */}
      <div className="investments-grid">
        {investments.map((inv) => {
          const invId   = inv.id || inv._id || '';
          const startup = inv.startup;

          return (
            <div key={invId} className="investment-card">

              {/* Logo */}
              <div className="investment-logo">
                {inv.startupLoading ? (
                  <div className="logo-skeleton" />
                ) : startup ? (
                  <Logo name={startup.name} url={startup.logoUrl} />
                ) : (
                  <div className="logo-initials">?</div>
                )}
              </div>

              {/* Info */}
              <div className="investment-info">
                <h3 className="startup-name">
                  {inv.startupLoading ? (
                    <span style={{ color: 'var(--text-muted)' }}>Загрузка…</span>
                  ) : startup ? (
                    <>
                      <Link to={`/startups/${startup.id || startup._id}`} className="startup-link">
                        {startup.name}
                      </Link>
                      {startup.stage && <span className="stage-badge">{startup.stage}</span>}
                    </>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>Стартап #{inv.startupId}</span>
                  )}
                </h3>

                {startup?.industry && (
                  <div className="startup-industry">
                    <Briefcase size={13} />
                    {startup.industry}
                  </div>
                )}

                {startup?.shortPitch && (
                  <p className="startup-industry" style={{ fontStyle: 'italic' }}>
                    {startup.shortPitch}
                  </p>
                )}

                {/* Detail chips */}
                <div className="investment-details">
                  <div className="detail-item">
                    <span className="detail-label">Сумма</span>
                    <span className="detail-value amount">{formatNum(inv.amount)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Доля</span>
                    <span className="detail-value">{(inv.equityPercent * 100).toFixed(2)}%</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Post-Money</span>
                    <span className="detail-value">{formatNum(inv.valuationPostMoney)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Валюта</span>
                    <span className="detail-value">{inv.currency || 'USD'}</span>
                  </div>
                </div>

                {inv.note && <div className="inv-note">{inv.note}</div>}
              </div>

              {/* Meta */}
              <div className="investment-meta">
                <div className="investment-date">
                  {new Date(inv.createdAt).toLocaleDateString('ru-RU', {
                    year: 'numeric', month: 'short', day: 'numeric',
                  })}
                </div>
                <span className={`status-badge ${inv.status.toLowerCase()}`}>
                  {inv.status}
                </span>
                <div className="investment-id">ID: {invId.slice(0, 8)}…</div>
                {inv.status === 'active' && (
  <button
    className="exit-button"
    onClick={() => handleExit(invId)}
    disabled={loadingExitId === invId}
  >
    {loadingExitId === invId ? '...' : 'Выйти'}
  </button>
)}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}