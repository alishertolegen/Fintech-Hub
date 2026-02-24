// src/components/Profile.tsx
import React, { useEffect, useState } from 'react';
import { Mail, Phone, MapPin, Briefcase, Pencil, Check, X, Globe, TrendingUp, Layers, Shield } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

/* ─── CSS ─────────────────────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

  :root {
    --bg: #26282f;
    --surface: rgba(255, 245, 240, 0.07);
    --surface-hover: rgba(255, 245, 240, 0.12);
    --border: rgba(255, 235, 230, 0.12);
    --border-glow: rgba(255, 170, 145, 0.3);
    --accent: #ff927a;
    --accent-2: #ffb390;
    --accent-3: #ffd3b0;
    --text-primary: #fff8f2;
    --text-secondary: rgba(255, 245, 240, 0.75);
    --text-muted: rgba(255, 245, 240, 0.55);
    --font-display: 'Syne', sans-serif;
    --font-body: 'DM Sans', sans-serif;
    --radius: 20px;
    --radius-sm: 12px;
  }

  .pf-page {
    min-height: 100vh;
    background: var(--bg);
    font-family: var(--font-body);
    color: var(--text-primary);
    padding: 40px 20px 80px;
    display: flex;
    justify-content: center;
    position: relative;
    overflow-x: hidden;
  }

  /* ambient glows */
  .pf-page::before {
    content: '';
    position: fixed;
    top: -200px; left: 50%;
    transform: translateX(-50%);
    width: 900px; height: 600px;
    background: radial-gradient(ellipse at center, rgba(255,146,122,0.12) 0%, transparent 65%);
    pointer-events: none;
    z-index: 0;
  }

  .pf-page::after {
    content: '';
    position: fixed;
    bottom: -100px; right: -150px;
    width: 600px; height: 600px;
    background: radial-gradient(ellipse at center, rgba(255,179,144,0.08) 0%, transparent 65%);
    pointer-events: none;
    z-index: 0;
  }

  .pf-wrap {
    width: 100%;
    max-width: 860px;
    position: relative;
    z-index: 1;
    animation: fadeUp 0.6s cubic-bezier(.22,.68,0,1.2) both;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ─── Hero Banner ─────────────────────────── */
  .pf-hero {
    position: relative;
    border-radius: 28px;
    overflow: hidden;
    margin-bottom: 20px;
    border: 1px solid var(--border);
    background: var(--surface);
    backdrop-filter: blur(20px);
  }

  .pf-hero-bg {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse at 70% 50%, rgba(255,146,122,0.18) 0%, transparent 60%),
      radial-gradient(ellipse at 10% 80%, rgba(255,179,144,0.10) 0%, transparent 50%);
    z-index: 0;
  }

  .pf-hero-noise {
    position: absolute;
    inset: 0;
    z-index: 0;
    opacity: 0.03;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    background-size: 200px;
  }

  .pf-hero-inner {
    position: relative;
    z-index: 1;
    padding: 40px 44px 36px;
    display: flex;
    align-items: flex-end;
    gap: 32px;
  }

  /* decorative stripe */
  .pf-hero::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, transparent 0%, var(--accent) 40%, var(--accent-2) 70%, transparent 100%);
    z-index: 2;
  }

  /* ─── Avatar ─────────────────────────────── */
  .pf-avatar-ring {
    position: relative;
    flex-shrink: 0;
  }

  .pf-avatar-ring::before {
    content: '';
    position: absolute;
    inset: -3px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--accent), var(--accent-3), transparent 60%);
    z-index: 0;
    animation: spinSlow 8s linear infinite;
  }

  @keyframes spinSlow {
    to { transform: rotate(360deg); }
  }

  .pf-avatar-ring img,
  .pf-avatar-ring .pf-initials {
    position: relative;
    z-index: 1;
    width: 100px; height: 100px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--bg);
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, rgba(255,146,122,0.3) 0%, rgba(255,179,144,0.15) 100%);
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 34px;
    color: var(--accent-2);
    letter-spacing: -1px;
    user-select: none;
  }

  .pf-verified {
    position: absolute;
    bottom: 4px; right: 4px;
    z-index: 2;
    width: 24px; height: 24px;
    border-radius: 50%;
    background: var(--accent);
    border: 2px solid var(--bg);
    display: flex; align-items: center; justify-content: center;
  }

  /* ─── Hero Info ───────────────────────────── */
  .pf-hero-info {
    flex: 1;
    min-width: 0;
  }

  .pf-hero-top {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 6px;
  }

  .pf-name {
    font-family: var(--font-display);
    font-size: 32px;
    font-weight: 800;
    color: var(--text-primary);
    letter-spacing: -1px;
    line-height: 1;
    margin: 0;
  }

  .pf-role-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 12px;
    border-radius: 100px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    font-family: var(--font-display);
    background: rgba(255,146,122,0.15);
    color: var(--accent-2);
    border: 1px solid rgba(255,146,122,0.25);
  }

  .pf-company {
    display: flex;
    align-items: center;
    gap: 7px;
    color: var(--accent-2);
    font-size: 14px;
    font-weight: 500;
    margin: 0 0 10px;
    opacity: 0.9;
  }

  .pf-bio {
    color: var(--text-secondary);
    font-size: 14px;
    line-height: 1.6;
    margin: 0;
    max-width: 520px;
    font-style: italic;
  }

  /* ─── Contact Row ─────────────────────────── */
  .pf-contacts {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 20px;
  }

  @media (max-width: 640px) {
    .pf-contacts { grid-template-columns: 1fr; }
    .pf-hero-inner { flex-direction: column; align-items: flex-start; padding: 28px 24px; }
    .pf-name { font-size: 24px; }
  }

  .pf-contact-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 16px 18px;
    display: flex;
    align-items: center;
    gap: 14px;
    transition: background 0.2s, border-color 0.2s, transform 0.2s;
    animation: fadeUp 0.6s cubic-bezier(.22,.68,0,1.2) both;
  }

  .pf-contact-card:nth-child(1) { animation-delay: 0.07s; }
  .pf-contact-card:nth-child(2) { animation-delay: 0.13s; }
  .pf-contact-card:nth-child(3) { animation-delay: 0.19s; }

  .pf-contact-card:hover {
    background: var(--surface-hover);
    border-color: var(--border-glow);
    transform: translateY(-2px);
  }

  .pf-contact-icon {
    width: 38px; height: 38px;
    border-radius: 10px;
    background: rgba(255,146,122,0.12);
    border: 1px solid rgba(255,146,122,0.2);
    display: flex; align-items: center; justify-content: center;
    color: var(--accent);
    flex-shrink: 0;
  }

  .pf-contact-label {
    font-size: 11px;
    color: var(--text-muted);
    font-weight: 500;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    margin-bottom: 3px;
    font-family: var(--font-display);
  }

  .pf-contact-value {
    font-size: 14px;
    color: var(--text-primary);
    font-weight: 400;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* ─── Investor Section ────────────────────── */
  .pf-investor {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 24px;
    overflow: hidden;
    animation: fadeUp 0.6s 0.25s cubic-bezier(.22,.68,0,1.2) both;
    position: relative;
  }

  .pf-investor::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--accent-2), transparent);
  }

  .pf-investor-header {
    padding: 24px 28px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--border);
  }

  .pf-section-title {
    font-family: var(--font-display);
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 0.03em;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0;
  }

  .pf-section-title .title-icon {
    width: 30px; height: 30px;
    border-radius: 8px;
    background: rgba(255,146,122,0.15);
    display: flex; align-items: center; justify-content: center;
    color: var(--accent);
  }

  /* Investor data grid */
  .pf-investor-body {
    padding: 24px 28px 28px;
  }

  .pf-data-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    margin-bottom: 20px;
  }

  @media (max-width: 520px) {
    .pf-data-grid { grid-template-columns: 1fr; }
  }

  .pf-data-item {
    background: rgba(255,245,240,0.04);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 14px 16px;
    transition: background 0.2s;
  }

  .pf-data-item:hover { background: rgba(255,245,240,0.07); }

  .pf-data-item.full { grid-column: 1 / -1; }

  .pf-data-key {
    font-size: 11px;
    color: var(--accent);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-weight: 600;
    font-family: var(--font-display);
    margin-bottom: 6px;
    display: flex; align-items: center; gap: 5px;
  }

  .pf-data-val {
    font-size: 14px;
    color: var(--text-primary);
    line-height: 1.55;
  }

  .pf-data-val a {
    color: var(--accent-2);
    text-decoration: none;
    border-bottom: 1px solid rgba(255,179,144,0.3);
    transition: border-color 0.2s;
  }

  .pf-data-val a:hover { border-color: var(--accent-2); }

  .pf-tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 2px;
  }

  .pf-tag {
    font-size: 12px;
    padding: 3px 10px;
    border-radius: 100px;
    background: rgba(255,146,122,0.1);
    border: 1px solid rgba(255,146,122,0.2);
    color: var(--accent-3);
    font-weight: 500;
  }

  .pf-check-range {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .pf-check-range .sep {
    color: var(--text-muted);
    font-size: 12px;
  }

  .pf-amount {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 18px;
    color: var(--accent-2);
  }

  /* ─── Buttons ─────────────────────────────── */
  .pf-btn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 10px 20px;
    border-radius: var(--radius-sm);
    font-family: var(--font-display);
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.03em;
    cursor: pointer;
    border: none;
    transition: all 0.2s;
    white-space: nowrap;
  }

  .pf-btn-primary {
    background: linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%);
    color: #1a1008;
    box-shadow: 0 4px 16px rgba(255,146,122,0.3);
  }

  .pf-btn-primary:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 24px rgba(255,146,122,0.45);
  }

  .pf-btn-secondary {
    background: var(--surface);
    color: var(--text-secondary);
    border: 1px solid var(--border);
  }

  .pf-btn-secondary:hover:not(:disabled) {
    background: var(--surface-hover);
    border-color: var(--border-glow);
    color: var(--text-primary);
  }

  .pf-btn-success {
    background: linear-gradient(135deg, #6ee79e, #42c97b);
    color: #0a1a10;
  }

  .pf-btn-success:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(66,201,123,0.35);
  }

  .pf-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .pf-edit-row {
    display: flex;
    justify-content: flex-end;
    padding-top: 16px;
    border-top: 1px solid var(--border);
  }

  /* ─── Form ────────────────────────────────── */
  .pf-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .pf-form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  @media (max-width: 480px) {
    .pf-form-row { grid-template-columns: 1fr; }
  }

  .pf-input,
  .pf-textarea {
    background: rgba(255,245,240,0.05);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    color: var(--text-primary);
    font-family: var(--font-body);
    font-size: 14px;
    padding: 12px 16px;
    outline: none;
    transition: border-color 0.2s, background 0.2s;
    width: 100%;
    box-sizing: border-box;
  }

  .pf-input::placeholder,
  .pf-textarea::placeholder {
    color: var(--text-muted);
  }

  .pf-input:focus,
  .pf-textarea:focus {
    border-color: var(--border-glow);
    background: rgba(255,245,240,0.08);
  }

  .pf-textarea {
    min-height: 100px;
    resize: vertical;
    line-height: 1.6;
  }

  .pf-form-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    padding-top: 8px;
  }

  /* ─── States ──────────────────────────────── */
  .pf-state {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    font-family: var(--font-display);
    color: var(--text-muted);
    font-size: 15px;
    letter-spacing: 0.02em;
  }

  .pf-spinner {
    width: 32px; height: 32px;
    border: 2px solid var(--border);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin-right: 14px;
  }

  @keyframes spin { to { transform: rotate(360deg); } }
`;

/* ─── Types ───────────────────────────────────────────────────────── */
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

/* ─── Initials Avatar ─────────────────────────────────────────────── */
function InitialsAvatar({ name = '' }: { name?: string }) {
  const initials = name.trim().split(/\s+/).map(p => p[0] ?? '').slice(0, 2).join('').toUpperCase();
  return <div className="pf-initials">{initials || 'U'}</div>;
}

/* ─── Format money ────────────────────────────────────────────────── */
function fmt(n?: number) {
  if (n == null) return '—';
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

/* ─── Main Component ──────────────────────────────────────────────── */
export default function Profile() {
  const { user: authUser, token, loading: authLoading } = useAuth();
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [investor, setInvestor] = useState<InvestorApi | null>(null);
  const [editingInvestor, setEditingInvestor] = useState(false);
  const [investorSaving, setInvestorSaving] = useState(false);

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

  /* fetch investor */
  useEffect(() => {
    if (!user || user.role !== 'investor') return;
    const abort = new AbortController();
    (async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/investors/user/${user.id}`, { headers: { Authorization: `Bearer ${token}` }, signal: abort.signal });
        if (res.ok) setInvestor(await res.json());
        else if (res.status !== 404) console.warn('Investor load failed', res.status);
      } catch (e: any) { if (e.name !== 'AbortError') console.error(e); }
    })();
    return () => abort.abort();
  }, [user, token]);

  async function saveInvestor(updated: InvestorApi) {
    if (!user) return;
    setInvestorSaving(true);
    try {
      const url = updated.id ? `http://localhost:8080/api/investors/${updated.id}` : `http://localhost:8080/api/investors/user/${user.id}`;
      const res = await fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(updated) });
      if (!res.ok) { const j = await res.json().catch(() => ({})); throw new Error(j.message ?? `Ошибка ${res.status}`); }
      setInvestor(await res.json()); setEditingInvestor(false);
    } catch (e: any) { alert('Ошибка при сохранении: ' + (e.message ?? e)); }
    finally { setInvestorSaving(false); }
  }

  /* ─── States ── */
  if (authLoading || loading) return (
    <div className="pf-page">
      <style>{styles}</style>
      <div className="pf-state"><div className="pf-spinner" /> Загрузка профиля…</div>
    </div>
  );

  if (error) return (
    <div className="pf-page">
      <style>{styles}</style>
      <div className="pf-state" style={{ color: 'var(--accent)' }}>⚠ {error}</div>
    </div>
  );

  if (!user) return (
    <div className="pf-page">
      <style>{styles}</style>
      <div className="pf-state">Профиль недоступен — пожалуйста, войдите в систему.</div>
    </div>
  );

  /* ─── Main Render ── */
  return (
    <div className="pf-page">
      <style>{styles}</style>
      <div className="pf-wrap">

        {/* HERO */}
        <div className="pf-hero">
          <div className="pf-hero-bg" />
          <div className="pf-hero-noise" />
          <div className="pf-hero-inner">

            <div className="pf-avatar-ring">
              {user.avatarUrl
                ? <img src={user.avatarUrl} alt={user.name} />
                : <InitialsAvatar name={user.name} />}
              {investor?.isVerified && (
                <div className="pf-verified" title="Верифицирован">
                  <Shield size={12} color="#1a1008" />
                </div>
              )}
            </div>

            <div className="pf-hero-info">
              <div className="pf-hero-top">
                <h1 className="pf-name">{user.name}</h1>
                {user.role && (
                  <span className="pf-role-badge">
                    {user.role === 'investor' && <TrendingUp size={10} />}
                    {user.role}
                  </span>
                )}
              </div>
              {user.company && (
                <p className="pf-company">
                  <Briefcase size={13} />
                  {user.company}
                </p>
              )}
              {user.bio && <p className="pf-bio">"{user.bio}"</p>}
            </div>
          </div>
        </div>

        {/* CONTACTS */}
        <div className="pf-contacts">
          {[
            { icon: <Mail size={16} />, label: 'Email', value: user.email },
            { icon: <Phone size={16} />, label: 'Телефон', value: user.phone ?? '—' },
            { icon: <MapPin size={16} />, label: 'Местоположение', value: user.location ?? '—' },
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

        {/* INVESTOR SECTION */}
        {user.role === 'investor' && (
          <div className="pf-investor">
            <div className="pf-investor-header">
              <h2 className="pf-section-title">
                <span className="title-icon"><TrendingUp size={15} /></span>
                Профиль инвестора
              </h2>
              {!editingInvestor && (
                <button className="pf-btn pf-btn-primary" onClick={() => setEditingInvestor(true)}>
                  <Pencil size={13} /> Редактировать
                </button>
              )}
            </div>

            <div className="pf-investor-body">
              {!editingInvestor ? (
                <>
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
                      <div className="pf-data-key"><Layers size={10} /> Размер чека</div>
                      <div className="pf-data-val">
                        <div className="pf-check-range">
                          <span className="pf-amount">{fmt(investor?.minCheck)}</span>
                          <span className="sep">→</span>
                          <span className="pf-amount">{fmt(investor?.maxCheck)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pf-data-item">
                      <div className="pf-data-key"><Globe size={10} /> Сайт</div>
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
                          ? <div className="pf-tag-list">{(investor!.preferredIndustries!).map(t => <span key={t} className="pf-tag">{t}</span>)}</div>
                          : '—'}
                      </div>
                    </div>

                    <div className="pf-data-item">
                      <div className="pf-data-key">Стадии</div>
                      <div className="pf-data-val">
                        {(investor?.preferredStages?.length ?? 0) > 0
                          ? <div className="pf-tag-list">{(investor!.preferredStages!).map(t => <span key={t} className="pf-tag">{t}</span>)}</div>
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
                </>
              ) : (
                <div className="pf-form">
                  <div className="pf-form-row">
                    <input className="pf-input" placeholder="Юридическое имя"
                      value={investor?.legalName ?? ''}
                      onChange={e => setInvestor(p => ({ ...(p ?? {}), legalName: e.target.value }))} />
                    <input className="pf-input" placeholder="Тип (angel, vc и т.д.)"
                      value={investor?.type ?? ''}
                      onChange={e => setInvestor(p => ({ ...(p ?? {}), type: e.target.value }))} />
                  </div>
                  <div className="pf-form-row">
                    <input type="number" className="pf-input" placeholder="Min чек ($)"
                      value={investor?.minCheck ?? ''}
                      onChange={e => setInvestor(p => ({ ...(p ?? {}), minCheck: e.target.value ? Number(e.target.value) : undefined }))} />
                    <input type="number" className="pf-input" placeholder="Max чек ($)"
                      value={investor?.maxCheck ?? ''}
                      onChange={e => setInvestor(p => ({ ...(p ?? {}), maxCheck: e.target.value ? Number(e.target.value) : undefined }))} />
                  </div>
                  <input className="pf-input" placeholder="Отрасли (через запятую)"
                    value={(investor?.preferredIndustries ?? []).join(', ')}
                    onChange={e => setInvestor(p => ({ ...(p ?? {}), preferredIndustries: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))} />
                  <input className="pf-input" placeholder="Стадии (через запятую)"
                    value={(investor?.preferredStages ?? []).join(', ')}
                    onChange={e => setInvestor(p => ({ ...(p ?? {}), preferredStages: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))} />
                  <input className="pf-input" placeholder="Сайт"
                    value={investor?.website ?? ''}
                    onChange={e => setInvestor(p => ({ ...(p ?? {}), website: e.target.value }))} />
                  <textarea className="pf-textarea" placeholder="Описание (в роли инвестора)"
                    value={investor?.description ?? ''}
                    onChange={e => setInvestor(p => ({ ...(p ?? {}), description: e.target.value }))} />
                  <div className="pf-form-actions">
                    <button className="pf-btn pf-btn-secondary" onClick={() => setEditingInvestor(false)} disabled={investorSaving}>
                      <X size={13} /> Отмена
                    </button>
                    <button className="pf-btn pf-btn-success" onClick={() => saveInvestor(investor ?? { userId: user.id })} disabled={investorSaving}>
                      <Check size={13} /> {investorSaving ? 'Сохранение…' : 'Сохранить'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}