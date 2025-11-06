// src/pages/MyInvestmentsPage.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { TrendingUp, DollarSign, Briefcase } from 'lucide-react';
import './MyInvestmentsPage.css';

const API = 'http://localhost:8080/api/investments';
const STARTUPS_API = 'http://localhost:8080/api/startups';

type Investment = {
  id: string;
  _id?: string;
  startupId: string;
  investorId: string;
  amount: number;
  currency?: string;
  equityPercent: number;
  valuationPostMoney: number;
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

function Logo({ name, url }: { name?: string; url?: string }) {
  if (url) return <img src={url} alt={name} className="logo-image" />;
  const initials = (name || '')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <div className="logo-initials">
      {initials || 'S'}
    </div>
  );
}

export default function MyInvestmentsPage() {
  const { user } = useAuth();
  const [investments, setInvestments] = useState<InvestmentWithStartup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.id) {
      fetch(`${API}/investor/${user.id}`, { credentials: 'include' })
        .then(res => res.json())
        .then((data: Investment[]) => {
          // Инициализируем массив с флагом загрузки для каждого стартапа
          const investmentsWithLoading = data.map(inv => ({
            ...inv,
            startup: null,
            startupLoading: true
          }));
          setInvestments(investmentsWithLoading);
          setLoading(false);

          // Загружаем данные каждого стартапа
          data.forEach((inv, index) => {
            fetch(`${STARTUPS_API}/${inv.startupId}`, { credentials: 'include' })
              .then(res => {
                if (!res.ok) throw new Error('Not found');
                return res.json();
              })
              .then((startup: Startup) => {
                setInvestments(prev => {
                  const updated = [...prev];
                  updated[index] = {
                    ...updated[index],
                    startup,
                    startupLoading: false
                  };
                  return updated;
                });
              })
              .catch(() => {
                setInvestments(prev => {
                  const updated = [...prev];
                  updated[index] = {
                    ...updated[index],
                    startup: null,
                    startupLoading: false
                  };
                  return updated;
                });
              });
          });
        })
        .catch(() => setLoading(false));
    }
  }, [user]);

  // Вычисляем статистику
  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalEquity = investments.reduce((sum, inv) => sum + inv.equityPercent, 0);
  const activeInvestments = investments.filter(inv => inv.status === 'active' || inv.status === 'completed').length;

  if (loading) {
    return (
      <div className="investments-page-container">
        <div className="investments-loading">Загрузка инвестиций...</div>
      </div>
    );
  }

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
            <TrendingUp size={20} />
            Найти стартапы
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="investments-page-container">
      <div className="investments-header">
        <h1 className="investments-title">Мои инвестиции</h1>
        <p className="investments-subtitle">
          Управление портфелем и отслеживание инвестиций
        </p>
      </div>

      {/* Статистика */}
      <div className="investments-stats">
        <div className="stat-card">
          <div className="stat-label">Всего инвестировано</div>
          <div className="stat-value">
            ${totalInvested.toLocaleString()}
          </div>
          <div className="stat-change">+12.5% за месяц</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Активных инвестиций</div>
          <div className="stat-value">{activeInvestments}</div>
          <div className="stat-change">из {investments.length} всего</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Общая доля</div>
          <div className="stat-value">{totalEquity.toFixed(2)}%</div>
          <div className="stat-change">в портфеле</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Средний чек</div>
          <div className="stat-value">
            ${Math.round(totalInvested / investments.length).toLocaleString()}
          </div>
          <div className="stat-change">на инвестицию</div>
        </div>
      </div>

      {/* Список инвестиций */}
      <div className="investments-grid">
        {investments.map((inv) => {
          const invId = inv.id || inv._id || Math.random().toString(36).slice(2);
          const startup = inv.startup;
          const startupLoading = inv.startupLoading;

          return (
            <div key={invId} className="investment-card">
              {/* Логотип стартапа */}
              <div className="investment-logo">
                {startupLoading ? (
                  <div className="logo-skeleton" />
                ) : startup ? (
                  <Logo name={startup.name} url={startup.logoUrl} />
                ) : (
                  <div className="logo-initials">?</div>
                )}
              </div>

              {/* Информация о стартапе */}
              <div className="investment-info">
                <h3 className="startup-name">
                  {startupLoading ? (
                    'Загрузка...'
                  ) : startup ? (
                    <>
                      <Link
                        to={`/startups/${startup.id || startup._id}`}
                        className="startup-link"
                      >
                        {startup.name}
                      </Link>
                      {startup.stage && (
                        <span className="stage-badge">{startup.stage}</span>
                      )}
                    </>
                  ) : (
                    <span>Стартап #{inv.startupId}</span>
                  )}
                </h3>

                {startup?.industry && (
                  <div className="startup-industry">
                    <Briefcase size={14} style={{ display: 'inline', marginRight: '0.5rem' }} />
                    {startup.industry}
                  </div>
                )}

                {startup?.shortPitch && (
                  <p className="startup-industry">{startup.shortPitch}</p>
                )}

                {/* Детали инвестиции */}
                <div className="investment-details">
                  <div className="detail-item">
                    <span className="detail-label">Сумма</span>
                    <span className="detail-value amount">
                      ${inv.amount.toLocaleString()}
                    </span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">Доля</span>
                    <span className="detail-value">{inv.equityPercent}%</span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">Оценка Post-Money</span>
                    <span className="detail-value">
                      ${inv.valuationPostMoney.toLocaleString()}
                    </span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">Валюта</span>
                    <span className="detail-value">{inv.currency || 'USD'}</span>
                  </div>
                </div>

                {inv.note && (
                  <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#6b7280', fontStyle: 'italic' }}>
                    {inv.note}
                  </div>
                )}
              </div>

              {/* Мета информация */}
              <div className="investment-meta">
                <div className="investment-date">
                  {new Date(inv.createdAt).toLocaleDateString('ru-RU', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>

                <span className={`status-badge ${inv.status.toLowerCase()}`}>
                  {inv.status}
                </span>

                <div className="investment-id">
                  ID: {invId.slice(0, 8)}...
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}