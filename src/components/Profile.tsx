// src/components/Profile.tsx
import React, { useEffect, useState } from 'react';
import { Mail, Phone, MapPin, Briefcase, User as UserIcon } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

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
      className={`flex items-center justify-center rounded-full bg-gray-200 dark:bg-zinc-700 text-gray-800 dark:text-gray-100 font-semibold`}
      style={{ width: size, height: size }}
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
          if (e.name !== 'AbortError') setError(e.message ?? 'Не удалось загрузить профиль');
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
      const res = await fetch(`http://localhost:8080/api/investors/user/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: abort.signal,
      });
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

  if (authLoading || loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white dark:bg-zinc-900 shadow-sm rounded-2xl p-6">
          <div>Загрузка профиля…</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white dark:bg-zinc-900 shadow-sm rounded-2xl p-6">
          <div className="text-red-600">Ошибка: {error}</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white dark:bg-zinc-900 shadow-sm rounded-2xl p-6">
          <div>Профиль недоступен — пожалуйста, войдите в систему.</div>
        </div>
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
      // если вы добавили updateByUserId
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
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-zinc-900 shadow-sm rounded-2xl p-6">
        <div className="flex items-center gap-6">
          <div className="shrink-0">
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <InitialsAvatar name={user.name} size={80} />
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold">{user.name}</h1>

              <span className="inline-flex items-center text-sm py-1 px-2 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                {user.role}
              </span>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              <Briefcase className="inline-block mr-2" size={14} /> {user.company}
            </p>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">{user.bio}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <Mail className="mt-1" />
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Email</div>
              <div className="text-sm font-medium">{user.email}</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="mt-1" />
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Телефон</div>
              <div className="text-sm font-medium">{user.phone ?? '—'}</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="mt-1" />
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Орналасқан жері</div>
              <div className="text-sm font-medium">{user.location ?? '—'}</div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-sm text-gray-500 dark:text-gray-400">Компания</h2>
          <p className="mt-1 text-sm font-medium">{user.company ?? '—'}</p>
        </div>

        <div className="mt-6">
          <h2 className="text-sm text-gray-500 dark:text-gray-400">Биография</h2>
          <p className="mt-1 text-sm">{user.bio ?? '—'}</p>
        </div>

        <div className="mt-6">
          <h2 className="text-sm text-gray-500 dark:text-gray-400">Остальная информация</h2>
          <ul className="mt-2 space-y-2 text-sm text-gray-700 dark:text-gray-300">
            {user.role === 'investor' && (
  <div className="mt-6">
    <h2 className="text-sm text-gray-500 dark:text-gray-400">Профиль инвестора</h2>

    {!editingInvestor ? (
      <div className="mt-2 text-sm">
        <div>Юридическое имя: <span className="font-medium">{investor?.legalName ?? '—'}</span></div>
        <div>Тип: <span className="font-medium">{investor?.type ?? '—'}</span></div>
        <div>Чек min — max: <span className="font-medium">{investor?.minCheck ?? '—'} — {investor?.maxCheck ?? '—'}</span></div>
        <div>Отрасли: <span className="font-medium">{(investor?.preferredIndustries || []).join(', ') || '—'}</span></div>
        <div>Стадии: <span className="font-medium">{(investor?.preferredStages || []).join(', ') || '—'}</span></div>
        <div>Сайт: <span className="font-medium">{investor?.website ?? '—'}</span></div>
        <div>Описание: <div className="mt-1 text-sm">{investor?.description ?? '—'}</div></div>

        <div className="mt-3">
          <button onClick={() => setEditingInvestor(true)} className="px-3 py-1 rounded bg-indigo-600 text-white">
            Редактировать профиль инвестора
          </button>
        </div>
      </div>
    ) : (
      <div className="mt-2 space-y-2">
        <input
          className="border p-2 rounded w-full"
          placeholder="Юридическое имя"
          value={investor?.legalName ?? ''}
          onChange={(e) => setInvestor(prev => ({ ...(prev ?? {}), legalName: e.target.value }))}
        />
        <input
          className="border p-2 rounded w-full"
          placeholder="Тип (angel, vc и т.д.)"
          value={investor?.type ?? ''}
          onChange={(e) => setInvestor(prev => ({ ...(prev ?? {}), type: e.target.value }))}
        />
        <div className="flex gap-2">
          <input
            type="number"
            className="border p-2 rounded flex-1"
            placeholder="minCheck"
            value={investor?.minCheck ?? ''}
            onChange={(e) => setInvestor(prev => ({ ...(prev ?? {}), minCheck: e.target.value ? Number(e.target.value) : undefined }))}
          />
          <input
            type="number"
            className="border p-2 rounded flex-1"
            placeholder="maxCheck"
            value={investor?.maxCheck ?? ''}
            onChange={(e) => setInvestor(prev => ({ ...(prev ?? {}), maxCheck: e.target.value ? Number(e.target.value) : undefined }))}
          />
        </div>

        <input
          className="border p-2 rounded w-full"
          placeholder="Отрасли (через запятую)"
          value={(investor?.preferredIndustries ?? []).join(', ')}
          onChange={(e) => setInvestor(prev => ({ ...(prev ?? {}), preferredIndustries: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
        />

        <input
          className="border p-2 rounded w-full"
          placeholder="Стадии (через запятую)"
          value={(investor?.preferredStages ?? []).join(', ')}
          onChange={(e) => setInvestor(prev => ({ ...(prev ?? {}), preferredStages: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
        />

        <input
          className="border p-2 rounded w-full"
          placeholder="Сайт"
          value={investor?.website ?? ''}
          onChange={(e) => setInvestor(prev => ({ ...(prev ?? {}), website: e.target.value }))}
        />

        <textarea
          className="border p-2 rounded w-full"
          placeholder="Описание"
          value={investor?.description ?? ''}
          onChange={(e) => setInvestor(prev => ({ ...(prev ?? {}), description: e.target.value }))}
        />

        <div className="flex gap-2">
          <button
            className="px-3 py-1 rounded bg-green-600 text-white"
            onClick={() => saveInvestor(investor ?? { userId: user.id })}
            disabled={investorSaving}
          >
            {investorSaving ? 'Сохранение...' : 'Сохранить'}
          </button>
          <button className="px-3 py-1 rounded bg-gray-200" onClick={() => setEditingInvestor(false)} disabled={investorSaving}>
            Отмена
          </button>
        </div>
      </div>
    )}
  </div>
)}

            <li className="flex items-center gap-2">
              <UserIcon size={14} /> Роль: <span className="ml-1 font-medium">{user.role}</span>
            </li>
            <li className="flex items-center gap-2">
              <Briefcase size={14} /> Компания: <span className="ml-1 font-medium">{user.company}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
