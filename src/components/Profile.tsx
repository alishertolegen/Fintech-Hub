// src/components/Profile.tsx
import React, { useEffect, useState } from 'react';
import { Mail, Phone, MapPin, Briefcase, Pencil, Check, X } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import './Profile.css';

type ApiUser = {
  id?: string;
  email?: string;
  name?: string;
  fullName?: string;
  company?: string;
  bio?: string;
  avatarUrl?: string;
  meta?: { phone?: string; location?: string };
  phone?: string;
  location?: string;
  role?: string;
};

type InvestorApi = {
  id?: string;
  userId?: string;
  legalName?: string;
  type?: string;
  minCheck?: number;
  maxCheck?: number;
  preferredIndustries?: string[];
  preferredStages?: string[];
  description?: string;
  website?: string;
  isVerified?: boolean;
};

type InitialsAvatarProps = { name?: string; size?: number };

function InitialsAvatar({ name = '', size = 88 }: InitialsAvatarProps) {
  const initials = (name || '')
    .trim()
    .split(/\s+/)
    .map((p) => p[0] ?? '')
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div
      aria-hidden
      className="initials-avatar"
      style={{ width: size, height: size, fontSize: size / 2.8 }}
    >
      {initials || 'U'}
    </div>
  );
}

export default function Profile() {
  const { user: authUser, token, loading: authLoading } = useAuth();
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [investor, setInvestor] = useState<InvestorApi | null>(null);
  const [editingInvestor, setEditingInvestor] = useState<boolean>(false);
  const [investorSaving, setInvestorSaving] = useState<boolean>(false);

  useEffect(() => {
    if (authUser) {
      setUser({
        id: authUser.id,
        email: authUser.email,
        name: authUser.fullName ?? authUser.email,
        company: authUser.company,
        bio: authUser.bio,
        avatarUrl: authUser.avatarUrl,
        phone: authUser.phone,
        location: authUser.location,
        role: authUser.role,
      });
      setError(null);
      return;
    }

    if (!authLoading && token) {
      const abort = new AbortController();
      (async () => {
        setLoading(true);
        setError(null);
        try {
          const res = await fetch(`http://localhost:8080/api/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
            signal: abort.signal,
          });
          if (!res.ok) {
            let msg = `Ошибка ${res.status}`;
            try { const j = await res.json(); msg = j.error ?? j.message ?? msg; } catch {}
            throw new Error(msg);
          }
          const data: ApiUser = await res.json();
          setUser({
            id: data.id,
            email: data.email,
            name: data.name ?? data.fullName ?? data.email,
            company: data.company,
            bio: data.bio,
            avatarUrl: data.avatarUrl,
            phone: data.meta?.phone ?? data.phone,
            location: data.meta?.location ?? data.location,
            role: data.role,
          });
        } catch (e: any) {
          if (e.name !== 'AbortError')
            setError(e.message ?? 'Не удалось загрузить профиль');
        } finally {
          setLoading(false);
        }
      })();
      return () => abort.abort();
    }

    if (!authLoading && !token && !authUser) setUser(null);
  }, [authUser, token, authLoading]);

  useEffect(() => {
    if (!user || user.role !== 'investor') return;
    const abort = new AbortController();
    (async () => {
      try {
        const res = await fetch(
          `http://localhost:8080/api/investors/user/${user.id}`,
          { headers: { Authorization: `Bearer ${token}` }, signal: abort.signal }
        );
        if (res.ok) setInvestor(await res.json());
        else if (res.status !== 404) console.warn('Investor load failed', res.status);
      } catch (e: any) {
        if (e.name !== 'AbortError') console.error(e);
      }
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
        body: JSON.stringify(updated),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.message ?? `Ошибка ${res.status}`);
      }
      setInvestor(await res.json());
      setEditingInvestor(false);
    } catch (e: any) {
      alert('Ошибка при сохранении: ' + (e.message ?? e));
    } finally {
      setInvestorSaving(false);
    }
  }

  /* ── States ── */
  if (authLoading || loading) {
    return (
      <div className="profile-page">
        <div className="profile-card loading-state">Загрузка профиля…</div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="profile-page">
        <div className="profile-card error-state">Ошибка: {error}</div>
      </div>
    );
  }
  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-card unauth-state">
          Профиль недоступен — пожалуйста, войдите в систему.
        </div>
      </div>
    );
  }

  /* ── Main Render ── */
  return (
    <div className="profile-page">
      <div className="profile-card">

        {/* ═══ HEADER ═══ */}
        <div className="profile-header">
          <div className="profile-avatar-wrap">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="profile-avatar" />
            ) : (
              <InitialsAvatar name={user.name} size={88} />
            )}
          </div>

          <div className="profile-header-info">
            <div className="profile-header-top">
              <h1 className="profile-name">{user.name}</h1>
              {user.role && (
                <span className="profile-role-badge" data-role={user.role}>
                  {user.role}
                </span>
              )}
            </div>

            {user.company && (
              <p className="profile-company">
                <Briefcase size={14} />
                {user.company}
              </p>
            )}

            {user.bio && <p className="profile-bio">{user.bio}</p>}
          </div>
        </div>

        {/* ═══ BODY ═══ */}
        <div className="profile-body">

          {/* Contact grid */}
          <div className="contact-grid">
            <div className="contact-item">
              <Mail size={17} className="contact-item-icon" />
              <div>
                <div className="contact-label">Email</div>
                <div className="contact-value">{user.email}</div>
              </div>
            </div>

            <div className="contact-item">
              <Phone size={17} className="contact-item-icon" />
              <div>
                <div className="contact-label">Телефон</div>
                <div className="contact-value">{user.phone ?? '—'}</div>
              </div>
            </div>

            <div className="contact-item">
              <MapPin size={17} className="contact-item-icon" />
              <div>
                <div className="contact-label">Местоположение</div>
                <div className="contact-value">{user.location ?? '—'}</div>
              </div>
            </div>
          </div>

          {/* ═══ INVESTOR SECTION ═══ */}
          {user.role === 'investor' && (
            <div className="profile-section">
              <h2 className="section-title">Профиль инвестора</h2>

              {!editingInvestor ? (
                /* View mode */
                <div className="investor-view">
                  <div>
                    <strong>Юридическое имя</strong>
                    {investor?.legalName ?? '—'}
                  </div>
                  <div>
                    <strong>Тип</strong>
                    {investor?.type ?? '—'}
                  </div>
                  <div>
                    <strong>Чек min — max</strong>
                    {investor?.minCheck ?? '—'} — {investor?.maxCheck ?? '—'}
                  </div>
                  <div>
                    <strong>Отрасли</strong>
                    {(investor?.preferredIndustries || []).join(', ') || '—'}
                  </div>
                  <div>
                    <strong>Стадии</strong>
                    {(investor?.preferredStages || []).join(', ') || '—'}
                  </div>
                  <div>
                    <strong>Сайт</strong>
                    {investor?.website ? (
                      <a href={investor.website} target="_blank" rel="noreferrer"
                        style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                        {investor.website}
                      </a>
                    ) : '—'}
                  </div>
                  <div className="description-full">
                    <strong className="description-label">Описание (в роли инвестора)</strong>
                    <div className="description-text">{investor?.description ?? '—'}</div>
                  </div>
                  <div className="edit-action">
                    <button onClick={() => setEditingInvestor(true)} className="button button-primary">
                      <Pencil size={14} /> Редактировать профиль
                    </button>
                  </div>
                </div>
              ) : (
                /* Edit mode */
                <div className="investor-form">
                  <input
                    className="form-input"
                    placeholder="Юридическое имя"
                    value={investor?.legalName ?? ''}
                    onChange={(e) => setInvestor((p) => ({ ...(p ?? {}), legalName: e.target.value }))}
                  />
                  <input
                    className="form-input"
                    placeholder="Тип (angel, vc и т.д.)"
                    value={investor?.type ?? ''}
                    onChange={(e) => setInvestor((p) => ({ ...(p ?? {}), type: e.target.value }))}
                  />
                  <div className="form-row">
                    <input
                      type="number"
                      className="form-input"
                      placeholder="Min чек"
                      value={investor?.minCheck ?? ''}
                      onChange={(e) =>
                        setInvestor((p) => ({ ...(p ?? {}), minCheck: e.target.value ? Number(e.target.value) : undefined }))
                      }
                    />
                    <input
                      type="number"
                      className="form-input"
                      placeholder="Max чек"
                      value={investor?.maxCheck ?? ''}
                      onChange={(e) =>
                        setInvestor((p) => ({ ...(p ?? {}), maxCheck: e.target.value ? Number(e.target.value) : undefined }))
                      }
                    />
                  </div>
                  <input
                    className="form-input"
                    placeholder="Отрасли (через запятую)"
                    value={(investor?.preferredIndustries ?? []).join(', ')}
                    onChange={(e) =>
                      setInvestor((p) => ({
                        ...(p ?? {}),
                        preferredIndustries: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      }))
                    }
                  />
                  <input
                    className="form-input"
                    placeholder="Стадии (через запятую)"
                    value={(investor?.preferredStages ?? []).join(', ')}
                    onChange={(e) =>
                      setInvestor((p) => ({
                        ...(p ?? {}),
                        preferredStages: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      }))
                    }
                  />
                  <input
                    className="form-input"
                    placeholder="Сайт"
                    value={investor?.website ?? ''}
                    onChange={(e) => setInvestor((p) => ({ ...(p ?? {}), website: e.target.value }))}
                  />
                  <textarea
                    className="form-textarea"
                    placeholder="Описание (в роли инвестора)"
                    value={investor?.description ?? ''}
                    onChange={(e) => setInvestor((p) => ({ ...(p ?? {}), description: e.target.value }))}
                  />
                  <div className="form-row">
                    <button
                      className="button button-success"
                      onClick={() => saveInvestor(investor ?? { userId: user.id })}
                      disabled={investorSaving}
                    >
                      <Check size={14} />
                      {investorSaving ? 'Сохранение...' : 'Сохранить'}
                    </button>
                    <button
                      className="button button-secondary"
                      onClick={() => setEditingInvestor(false)}
                      disabled={investorSaving}
                    >
                      <X size={14} /> Отмена
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}