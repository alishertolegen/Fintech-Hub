// src/pages/UserProfile.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin, Briefcase, Shield, Rocket, DollarSign, FileText, Tag, Eye } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import './Profile.css'; // переиспользуем стили из существующей страницы

type ApiUser = { id?: string; email?: string; name?: string; fullName?: string; company?: string; bio?: string; avatarUrl?: string; meta?: { phone?: string; location?: string }; phone?: string; location?: string; role?: string };
type InvestorApi = { id?: string; userId?: string; legalName?: string; type?: string; minCheck?: number; maxCheck?: number; preferredIndustries?: string[]; preferredStages?: string[]; description?: string; website?: string; isVerified?: boolean };
type Startup = { id?: string; name?: string; founderId?: string; stage?: string; industry?: string; shortPitch?: string; metricsSnapshot?: { mrr?: number; activeUsers?: number; valuationPostMoney?: number; burnRate?: number } };
type Investment = { id?: string; startupId?: string; investorId?: string; amount?: number; equityPercent?: number; status?: string; createdAt?: string; valuationPostMoney?: number };

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

export default function UserProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [user, setUser] = useState<ApiUser | null>(null);
  const [investor, setInvestor] = useState<InvestorApi | null>(null);
  const [startups, setStartups] = useState<Startup[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const abort = new AbortController();
    (async () => {
      setLoading(true); setErr(null);
      try {
        const headers: Record<string,string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        // 1) load user by id
        const res = await fetch(`http://localhost:8080/api/users/${encodeURIComponent(id)}`, { headers, signal: abort.signal });
        if (!res.ok) throw new Error(`Ошибка ${res.status}`);
        const u: ApiUser = await res.json();
        setUser({
          id: u.id, email: u.email,
          name: u.name ?? u.fullName ?? u.email,
          company: u.company, bio: u.bio, avatarUrl: u.avatarUrl,
          phone: u.meta?.phone ?? u.phone, location: u.meta?.location ?? u.location, role: u.role
        });

        // 2) try load investor profile (if any)
        const invRes = await fetch(`http://localhost:8080/api/investors/user/${encodeURIComponent(id)}`, { headers, signal: abort.signal });
        if (invRes.ok) setInvestor(await invRes.json());

        // 3) if founder — load startups and their metrics (simple endpoint assumed)
        const startRes = await fetch(`http://localhost:8080/api/startups`, { headers, signal: abort.signal });
        if (startRes.ok) {
          const all: Startup[] = await startRes.json();
          setStartups(all.filter(s => String(s.founderId) === String(id)));
        }

        // 4) if investor — load investments
        const invsRes = await fetch(`http://localhost:8080/api/investments/investor/${encodeURIComponent(id)}`, { headers, signal: abort.signal });
        if (invsRes.ok) setInvestments(await invsRes.json());
      } catch (e: any) {
        if (e.name !== 'AbortError') setErr(e.message ?? 'Не удалось загрузить профиль');
      } finally { setLoading(false); }
    })();
    return () => abort.abort();
  }, [id, token]);

  if (loading) return <div className="pf-page"><div className="pf-state"><div className="pf-spinner" /> Загрузка профиля…</div></div>;
  if (err) return <div className="pf-page"><div className="pf-state" style={{ color: 'var(--accent)' }}>⚠ {err}</div></div>;
  if (!user) return <div className="pf-page"><div className="pf-state">Профиль не найден.</div></div>;

  const isInvestor = user.role === 'investor';
  const isFounder = user.role === 'founder';

  return (
    <div className="pf-page">
      <div className="pf-wrap">
        {/* HERO */}
        <div className="pf-card pf-hero">
          <div className="pf-hero-bg" />
          <div className="pf-hero-inner">
            <div className="pf-avatar-ring">
              {user.avatarUrl ? <img src={user.avatarUrl} alt={user.name} /> : <InitialsAvatar name={user.name} />}
              {investor?.isVerified && <div className="pf-verified" title="Верифицирован"><Shield size={11} color="#051a0a" /></div>}
            </div>
            <div className="pf-hero-info">
              <div className="pf-hero-top">
                <h1 className="pf-name">{user.name}</h1>
                {user.role && <span className="pf-role-badge">{user.role}</span>}
              </div>
              {user.company && <p className="pf-company"><Briefcase size={12} /> {user.company}</p>}
              {user.bio && <p className="pf-bio">"{user.bio}"</p>}
            </div>
          </div>
        </div>

        {/* CONTACTS */}
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

        {/* FOR FOUNDER: list startups */}
        {isFounder && (
          <div className="pf-card" style={{ animationDelay: '0.18s' }}>
            <div className="pf-section-header">
              <h2 className="pf-section-title"><span className="pf-section-icon orange"><Rocket size={13} /></span> Стартапы</h2>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{startups.length} проект(ов)</span>
            </div>
            <div style={{ padding: '16px 24px' }}>
              {startups.length === 0 ? (
                <div className="pf-empty"><div className="pf-empty-icon"><Rocket size={18} /></div>Нет проектов</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {startups.map(s => (
                    <div key={s.id} className="pf-startup-card" style={{ cursor: 'default' }}>
                      <div className="pf-startup-header">
                        <div className="pf-startup-logo">{(s.name ?? 'S')[0]}</div>
                        <div className="pf-startup-meta">
                          <div className="pf-startup-name-row">
                            <span className="pf-startup-name">{s.name}</span>
                            <span className={`pf-startup-stage`}>{s.stage ?? '—'}</span>
                            {s.industry && <span style={{fontSize:11,color:'var(--text-muted)'}}><Tag size={9}/> {s.industry}</span>}
                          </div>
                          {s.shortPitch && <div className="pf-startup-pitch">{s.shortPitch}</div>}
                        </div>
                      </div>
                      <div className="pf-metrics-strip" style={{ padding: '8px 16px' }}>
                        <div className="pf-metric-cell"><div className="pf-metric-label">MRR</div><div className="pf-metric-val">{s.metricsSnapshot?.mrr ? fmt(s.metricsSnapshot.mrr) : '—'}</div></div>
                        <div className="pf-metric-cell"><div className="pf-metric-label">Пользователи</div><div className="pf-metric-val">{s.metricsSnapshot?.activeUsers ?? '—'}</div></div>
                        <div className="pf-metric-cell"><div className="pf-metric-label">Оценка</div><div className="pf-metric-val">{fmt(s.metricsSnapshot?.valuationPostMoney)}</div></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* FOR INVESTOR: investments */}
        {isInvestor && (
          <div className="pf-card" style={{ animationDelay: '0.18s' }}>
            <div className="pf-section-header">
              <h2 className="pf-section-title"><span className="pf-section-icon green"><DollarSign size={13} /></span> Инвестиции</h2>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{investments.length} сделок</span>
            </div>
            <div style={{ padding: '0 24px 20px' }}>
              {investments.length === 0 ? (
                <div className="pf-empty"><div className="pf-empty-icon"><DollarSign size={18} /></div>Нет инвестиций</div>
              ) : (
                investments.map(inv => (
                  <div key={inv.id} className="pf-inv-row" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700 }}>{fmt(inv.amount)} {inv.equityPercent != null && <span style={{ fontWeight: 500, marginLeft: 8 }}>{(inv.equityPercent*100).toFixed(2)}%</span>}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>#{(inv.startupId ?? '—').slice(-8)} • {inv.status ?? '—'}</div>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{fmtDate(inv.createdAt)}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* back button */}
        <div style={{ padding: '16px 0' }}>
          <button className="pf-btn pf-btn-secondary" onClick={() => navigate(-1)}>Назад</button>
        </div>
      </div>
    </div>
  );
}