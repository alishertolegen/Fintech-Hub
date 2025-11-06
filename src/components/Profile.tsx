// src/components/Profile.tsx
import React, { useEffect, useState } from 'react';
import { Mail, Phone, MapPin, Briefcase } from 'lucide-react'; // UserIcon не используется
import { useAuth } from '../auth/AuthContext';
import './Profile.css'; // <<< ИМПОРТИРУЕМ СТИЛИ

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
      className="initials-avatar" // <<< Заменен класс
      style={{ width: size, height: size, fontSize: size / 2.5 }}
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

  // ... (весь ваш код с useEffect и fetch остается без изменений) ...
  // [ОПУЩЕН ДЛЯ КРАТКОСТИ]

  // если есть user в контексте — используем его
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

    // если в контексте нет user, но есть token — подтянем профиль с сервера
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
            // попытаемся распарсить json ошибки
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
          if (e.name !== 'AbortError')
            setError(e.message ?? 'Не удалось загрузить профиль');
        } finally {
          setLoading(false);
        }
      })();
      return () => abort.abort();
    }

    // иначе — нет токена и нет пользователя
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
        const res = await fetch(
          `http://localhost:8080/api/investors/user/${user.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            signal: abort.signal,
          },
        );
        if (res.ok) {
          const data: InvestorApi = await res.json();
          setInvestor(data);
        } else if (res.status === 404) {
          setInvestor(null); // нет профиля инвестора
        } else {
          // можно логировать ошибку, но не ломать UI
          console.warn('Не удалось загрузить investor', res.status);
        }
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
        // если вы добавили updateByUserId
        res = await fetch(
          `http://localhost:8080/api/investors/user/${user.id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updated),
          },
        );
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

  // ... [Конец логики] ...

  if (authLoading || loading) {
    return (
      <div className="profile-page">
        <div className="profile-card loading-state">
          <div>Загрузка профиля…</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page">
        <div className="profile-card error-state">
          <div>Ошибка: {error}</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-card unauth-state">
          <div>Профиль недоступен — пожалуйста, войдите в систему.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-card">
        {/* === ГРАДИЕНТНАЯ ШАПКА === */}
        <div className="profile-header">
          <div>
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="profile-avatar"
              />
            ) : (
              <InitialsAvatar name={user.name} size={80} />
            )}
          </div>

          <div className="profile-header-info">
            <div className="profile-header-top">
              <h1 className="profile-name">{user.name}</h1>
              {user.role && (
                <span className="profile-role-badge">{user.role}</span>
              )}
            </div>

            {user.company && (
              <p className="profile-company">
                <Briefcase size={16} /> {user.company}
              </p>
            )}

            {user.bio && <p className="profile-bio">{user.bio}</p>}
          </div>
        </div>

        {/* === ТЕЛО КАРТОЧКИ (БЕЛОЕ) === */}
        <div className="profile-body">
          {/* === СЕТКА КОНТАКТОВ === */}
          <div className="contact-grid">
            <div className="contact-item">
              <Mail size={18} className="contact-item-icon" />
              <div>
                <div className="contact-label">Email</div>
                <div className="contact-value">{user.email}</div>
              </div>
            </div>

            <div className="contact-item">
              <Phone size={18} className="contact-item-icon" />
              <div>
                <div className="contact-label">Телефон</div>
                <div className="contact-value">{user.phone ?? '—'}</div>
              </div>
            </div>

            <div className="contact-item">
              <MapPin size={18} className="contact-item-icon" />
              <div>
                <div className="contact-label">Орналасқан жері</div>
                <div className="contact-value">{user.location ?? '—'}</div>
              </div>
            </div>
          </div>

          {/* === ПРОФИЛЬ ИНВЕСТОРА (ЕСЛИ ЕСТЬ) === */}
          {user.role === 'investor' && (
            <div className="profile-section">
              <h2 className="section-title">Профиль инвестора</h2>

              {!editingInvestor ? (
                /* === РЕЖИМ ПРОСМОТРА === */
                <div className="investor-view">
                  <div>
                    <strong>Юридическое имя:</strong>
                    {investor?.legalName ?? '—'}
                  </div>
                  <div>
                    <strong>Тип:</strong>
                    {investor?.type ?? '—'}
                  </div>
                  <div>
                    <strong>Чек min — max:</strong>
                    {investor?.minCheck ?? '—'} — {investor?.maxCheck ?? '—'}
                  </div>
                  <div>
                    <strong>Отрасли:</strong>
                    {(investor?.preferredIndustries || []).join(', ') || '—'}
                  </div>
                  <div>
                    <strong>Стадии:</strong>
                    {(investor?.preferredStages || []).join(', ') || '—'}
                  </div>
                  <div>
                    <strong>Сайт:</strong>
                    {investor?.website ?? '—'}
                  </div>
                  <div>
                    <strong className="description-label">Описание:</strong>
                    <div className="description-text">
                      {investor?.description ?? '—'}
                    </div>
                  </div>

                  <div style={{ marginTop: '20px' }}>
                    <button
                      onClick={() => setEditingInvestor(true)}
                      className="button button-primary"
                    >
                      Редактировать профиль инвестора
                    </button>
                  </div>
                </div>
              ) : (
                /* === РЕЖИМ РЕДАКТИРОВАНИЯ === */
                <div className="investor-form">
                  <input
                    className="form-input"
                    placeholder="Юридическое имя"
                    value={investor?.legalName ?? ''}
                    onChange={(e) =>
                      setInvestor((prev) => ({
                        ...(prev ?? {}),
                        legalName: e.target.value,
                      }))
                    }
                  />
                  <input
                    className="form-input"
                    placeholder="Тип (angel, vc и т.д.)"
                    value={investor?.type ?? ''}
                    onChange={(e) =>
                      setInvestor((prev) => ({
                        ...(prev ?? {}),
                        type: e.target.value,
                      }))
                    }
                  />
                  <div className="form-row">
                    <input
                      type="number"
                      className="form-input"
                      placeholder="minCheck"
                      value={investor?.minCheck ?? ''}
                      onChange={(e) =>
                        setInvestor((prev) => ({
                          ...(prev ?? {}),
                          minCheck: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        }))
                      }
                    />
                    <input
                      type="number"
                      className="form-input"
                      placeholder="maxCheck"
                      value={investor?.maxCheck ?? ''}
                      onChange={(e) =>
                        setInvestor((prev) => ({
                          ...(prev ?? {}),
                          maxCheck: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        }))
                      }
                    />
                  </div>

                  <input
                    className="form-input"
                    placeholder="Отрасли (через запятую)"
                    value={(investor?.preferredIndustries ?? []).join(', ')}
                    onChange={(e) =>
                      setInvestor((prev) => ({
                        ...(prev ?? {}),
                        preferredIndustries: e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean),
                      }))
                    }
                  />

                  <input
                    className="form-input"
                    placeholder="Стадии (через запятую)"
                    value={(investor?.preferredStages ?? []).join(', ')}
                    onChange={(e) =>
                      setInvestor((prev) => ({
                        ...(prev ?? {}),
                        preferredStages: e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean),
                      }))
                    }
                  />

                  <input
                    className="form-input"
                    placeholder="Сайт"
                    value={investor?.website ?? ''}
                    onChange={(e) =>
                      setInvestor((prev) => ({
                        ...(prev ?? {}),
                        website: e.target.value,
                      }))
                    }
                  />

                  <textarea
                    className="form-textarea"
                    placeholder="Описание"
                    value={investor?.description ?? ''}
                    onChange={(e) =>
                      setInvestor((prev) => ({
                        ...(prev ?? {}),
                        description: e.target.value,
                      }))
                    }
                  />

                  <div className="form-row">
                    <button
                      className="button button-success"
                      onClick={() => saveInvestor(investor ?? { userId: user.id })}
                      disabled={investorSaving}
                    >
                      {investorSaving ? 'Сохранение...' : 'Сохранить'}
                    </button>
                    <button
                      className="button button-secondary"
                      onClick={() => setEditingInvestor(false)}
                      disabled={investorSaving}
                    >
                      Отмена
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