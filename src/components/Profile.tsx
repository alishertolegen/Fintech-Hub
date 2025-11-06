/* ================= Profile.tsx ================= */
import React, { useEffect, useState } from 'react';
import { Mail, Phone, MapPin, Briefcase, User as UserIcon } from 'lucide-react';
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

type InitialsAvatarProps = {
  name?: string;
  size?: number;
};

function InitialsAvatar({ name = '', size = 64 }: InitialsAvatarProps) {
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
      style={{ width: size, height: size, fontSize: Math.round(size / 2.8) }}
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

  type InvestorApi = {
    id?: string;
    userId?: string;
    legalName?: string;
    type?: string; // e.g. "angel"
    minCheck?: number;
    maxCheck?: number;
    preferredIndustries?: string[];
    preferredStages?: string[];
    description?: string;
    website?: string;
    isVerified?: boolean;
  };

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
            try {
              const j = await res.json();
              msg = j.error ?? j.message ?? msg;
            } catch {}
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
          if (e.name !== 'AbortError') setError(e.message ?? 'Не удалось загрузить профиль');
        } finally {
          setLoading(false);
        }
      })();
      return () => abort.abort();
    }

    if (!authLoading && !token && !authUser) {
      setUser(null);
    }
  }, [authUser, token, authLoading]);

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'investor') return;

    const abort = new AbortController();
    (async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/investors/user/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: abort.signal,
        });
        if (res.ok) {
          const data: InvestorApi = await res.json();
          setInvestor(data);
        } else if (res.status === 404) {
          setInvestor(null);
        } else {
          console.warn('Не удалось загрузить investor', res.status);
        }
      } catch (e: any) {
        if (e.name !== 'AbortError') console.error(e);
      }
    })();
    return () => abort.abort();
  }, [user, token]);

  if (authLoading || loading) {
    return (
      <div className="profile-root">
        <div className="profile-container">Загрузка профиля…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-root">
        <div className="profile-container error">Ошибка: {error}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-root">
        <div className="profile-container">Профиль недоступен — пожалуйста, войдите в систему.</div>
      </div>
    );
  }

  async function saveInvestor(updated: InvestorApi) {
    if (!user) return;
    setInvestorSaving(true);
    try {
      let res;
      if (updated.id) {
        res = await fetch(`http://localhost:8080/api/investors/${updated.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updated),
        });
      } else {
        res = await fetch(`http://localhost:8080/api/investors/user/${user.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updated),
        });
      }

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.message ?? `Ошибка ${res.status}`);
      }
      const saved: InvestorApi = await res.json();
      setInvestor(saved);
      setEditingInvestor(false);
    } catch (e: any) {
      alert('Ошибка при сохранении: ' + (e.message ?? e));
    } finally {
      setInvestorSaving(false);
    }
  }

  return (
    <div className="profile-root">
      <div className="profile-container">
        <header className="profile-header">
          <div className="profile-avatar">
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatarUrl} alt={user.name} className="avatar-img" />
            ) : (
              <InitialsAvatar name={user.name} size={96} />
            )}
          </div>

          <div className="profile-main">
            <div className="name-row">
              <h1 className="profile-name">{user.name}</h1>
              <span className="role-badge">{user.role}</span>
            </div>

            <p className="profile-company"><Briefcase size={16} className="icon"/> {user.company ?? '—'}</p>
            <p className="profile-bio">{user.bio ?? '—'}</p>
          </div>
        </header>

        <section className="info-grid">
          <div className="info-item">
            <Mail className="info-icon" />
            <div>
              <div className="info-label">Email</div>
              <div className="info-value">{user.email}</div>
            </div>
          </div>

          <div className="info-item">
            <Phone className="info-icon" />
            <div>
              <div className="info-label">Телефон</div>
              <div className="info-value">{user.phone ?? '—'}</div>
            </div>
          </div>

          <div className="info-item">
            <MapPin className="info-icon" />
            <div>
              <div className="info-label">Орналасқан жері</div>
              <div className="info-value">{user.location ?? '—'}</div>
            </div>
          </div>
        </section>

        <section className="section">
          <h3 className="section-title">Компания</h3>
          <p className="section-body">{user.company ?? '—'}</p>
        </section>

        <section className="section">
          <h3 className="section-title">Биография</h3>
          <p className="section-body">{user.bio ?? '—'}</p>
        </section>

        <section className="section">
          <h3 className="section-title">Остальная информация</h3>

          {user.role === 'investor' && (
            <div className="investor-block">
              <h4 className="investor-title">Профиль инвестора</h4>

              {!editingInvestor ? (
                <div className="investor-view">
                  <div>Юридическое имя: <span className="muted">{investor?.legalName ?? '—'}</span></div>
                  <div>Тип: <span className="muted">{investor?.type ?? '—'}</span></div>
                  <div>Чек min — max: <span className="muted">{investor?.minCheck ?? '—'} — {investor?.maxCheck ?? '—'}</span></div>
                  <div>Отрасли: <span className="muted">{(investor?.preferredIndustries || []).join(', ') || '—'}</span></div>
                  <div>Стадии: <span className="muted">{(investor?.preferredStages || []).join(', ') || '—'}</span></div>
                  <div>Сайт: <span className="muted">{investor?.website ?? '—'}</span></div>
                  <div>Описание: <div className="muted small">{investor?.description ?? '—'}</div></div>

                  <div className="controls">
                    <button className="btn btn-primary" onClick={() => setEditingInvestor(true)}>Редактировать профиль инвестора</button>
                  </div>
                </div>
              ) : (
                <div className="investor-form">
                  <input className="input" placeholder="Юридическое имя" value={investor?.legalName ?? ''} onChange={(e) => setInvestor(prev => ({ ...(prev ?? {}), legalName: e.target.value }))} />

                  <input className="input" placeholder="Тип (angel, vc и т.д.)" value={investor?.type ?? ''} onChange={(e) => setInvestor(prev => ({ ...(prev ?? {}), type: e.target.value }))} />

                  <div className="row">
                    <input type="number" className="input" placeholder="minCheck" value={investor?.minCheck ?? '' as any} onChange={(e) => setInvestor(prev => ({ ...(prev ?? {}), minCheck: e.target.value ? Number(e.target.value) : undefined }))} />
                    <input type="number" className="input" placeholder="maxCheck" value={investor?.maxCheck ?? '' as any} onChange={(e) => setInvestor(prev => ({ ...(prev ?? {}), maxCheck: e.target.value ? Number(e.target.value) : undefined }))} />
                  </div>

                  <input className="input" placeholder="Отрасли (через запятую)" value={(investor?.preferredIndustries ?? []).join(', ')} onChange={(e) => setInvestor(prev => ({ ...(prev ?? {}), preferredIndustries: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))} />

                  <input className="input" placeholder="Стадии (через запятую)" value={(investor?.preferredStages ?? []).join(', ')} onChange={(e) => setInvestor(prev => ({ ...(prev ?? {}), preferredStages: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))} />

                  <input className="input" placeholder="Сайт" value={investor?.website ?? ''} onChange={(e) => setInvestor(prev => ({ ...(prev ?? {}), website: e.target.value }))} />

                  <textarea className="textarea" placeholder="Описание" value={investor?.description ?? ''} onChange={(e) => setInvestor(prev => ({ ...(prev ?? {}), description: e.target.value }))} />

                  <div className="controls">
                    <button className="btn btn-primary" onClick={() => saveInvestor(investor ?? { userId: user.id } as any)} disabled={investorSaving}>{investorSaving ? 'Сохранение...' : 'Сохранить'}</button>
                    <button className="btn btn-muted" onClick={() => setEditingInvestor(false)} disabled={investorSaving}>Отмена</button>
                  </div>
                </div>
              )}

            </div>
          )}

          <ul className="extra-list">
            <li className="extra-item"><UserIcon size={14} /> <strong>Роль:</strong> <span className="muted">{user.role}</span></li>
            <li className="extra-item"><Briefcase size={14} /> <strong>Компания:</strong> <span className="muted">{user.company}</span></li>
          </ul>
        </section>
      </div>
    </div>
  );
}

