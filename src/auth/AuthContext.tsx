// src/auth/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id?: string;
  email: string;
  fullName?: string;
  company?: string;
  bio?: string;
  avatarUrl?: string;
  phone?: string;
  location?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  // Обновлено: добавлен последний необязательный параметр investorProfile
  register: (
    email: string,
    password: string,
    fullName: string,
    company?: string,
    phone?: string,
    location?: string,
    bio?: string,
    avatarUrl?: string,
    role?: string,
    investorProfile?: any
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const API = 'http://localhost:8080/api';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken) setToken(storedToken);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const handleResponse = async (res: Response) => {
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      if (!res.ok) throw new Error(json.error || json.message || JSON.stringify(json));
      return json;
    } catch (e: any) {
      if (!res.ok) throw new Error(text || 'Сервер вернул ошибку');
      return text;
    }
  };

  const extractUserFromResponse = (data: any): User | null => {
    if (!data) return null;
    const src = data.user ?? data;
    if (!src) return null;
    const id = src._id ?? src.id ?? src._Id;
    const userObj: User = {
      id,
      email: src.email,
      fullName: src.name ?? src.fullName ?? src.displayName,
      company: src.company,
      bio: src.bio,
      avatarUrl: src.avatarUrl,
      phone: src.meta?.phone ?? src.phone,
      location: src.meta?.location ?? src.location,
      role: src.role,
    };
    return userObj;
  };

  const fetchUserProfile = async (jwt: string) => {
    const res = await fetch(`${API}/users/me`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    const data = await handleResponse(res);
    const userObj: User = {
      id: data._id ?? data.id,
      email: data.email,
      fullName: data.name ?? data.fullName,
      company: data.company,
      bio: data.bio,
      avatarUrl: data.avatarUrl,
      phone: data.meta?.phone ?? data.phone,
      location: data.meta?.location ?? data.location,
      role: data.role,
    };
    setUser(userObj);
    try { localStorage.setItem('user', JSON.stringify(userObj)); } catch {}
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await handleResponse(res);
      const jwt = data.token;
      if (!jwt) throw new Error('Token missing from response');

      localStorage.setItem('token', jwt);
      setToken(jwt);

      // Получаем профиль на /users/me
      await fetchUserProfile(jwt);
    } finally {
      setLoading(false);
    }
  };

  const createOrUpdateInvestorByUserId = async (userId: string, investorProfile: any, jwt: string) => {
    // PUT /api/investors/user/{userId} — контроллер создаст или обновит профиль
    const payload = {
      legalName: investorProfile.legalName,
      type: investorProfile.type,
      minCheck: investorProfile.minCheck,
      maxCheck: investorProfile.maxCheck,
      preferredIndustries: investorProfile.preferredIndustries,
      preferredStages: investorProfile.preferredStages,
      description: investorProfile.description ?? investorProfile.desc ?? '',
      website: investorProfile.website ?? '',
      isVerified: investorProfile.isVerified ?? false
    };
    const res = await fetch(`${API}/investors/user/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
      body: JSON.stringify(payload),
    });
    return await handleResponse(res);
  };

  const register = async (
    email: string,
    password: string,
    fullName: string,
    company?: string,
    phone?: string,
    location?: string,
    bio?: string,
    avatarUrl?: string,
    role?: string,
    investorProfile?: any
  ) => {
    setLoading(true);
    try {
      const payload: any = { email, password, name: fullName };
      if (company) payload.company = company;
      if (phone) payload.phone = phone;
      if (location) payload.location = location;
      if (bio) payload.bio = bio;
      if (avatarUrl) payload.avatarUrl = avatarUrl;
      if (role) payload.role = role;

      // ВАЖНО: если есть investorProfile — вложим его в payload, чтобы бэкенд создал Investor атомарно
      if (investorProfile) {
        // Приводим к ожидаемой форме: legalName, type, minCheck, maxCheck, preferredIndustries[], preferredStages[], website
        payload.investorProfile = {
          legalName: investorProfile.legalName ?? undefined,
          type: investorProfile.type ?? undefined,
          minCheck: investorProfile.minCheck ?? undefined,
          maxCheck: investorProfile.maxCheck ?? undefined,
          preferredIndustries: investorProfile.preferredIndustries ?? undefined,
          preferredStages: investorProfile.preferredStages ?? undefined,
          website: investorProfile.website ?? undefined,
        };
      }

      const res = await fetch(`${API}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await handleResponse(res);

      // Если сервер вернул объект user (data.user) — используем его, иначе пытаемся извлечь из корня
      const userObj = extractUserFromResponse(data);
      if (userObj) {
        setUser(userObj);
        try { localStorage.setItem('user', JSON.stringify(userObj)); } catch {}
      }

      // Если сервер вернул токен — сохраним и получим свежий профиль
      if (data?.token) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        // получим профиль с новым токеном
        await fetchUserProfile(data.token);
      }

      // Если роль инвестор и бэкенд не вернул investor — создаём/обновляем профиль вручную через PUT /investors/user/{userId}
      const serverHasInvestor = !!(data?.investor);
      if (role === 'investor' && investorProfile && !serverHasInvestor) {
        // Нужен JWT — если у нас нет токена, пробуем залогиниться (чтобы получить токен)
        let jwt = token ?? localStorage.getItem('token');
        if (!jwt) {
          // логинимся, это установит token и user
          await login(email, password);
          jwt = localStorage.getItem('token') ?? token;
        }
        if (!jwt) {
          console.warn('Не удалось получить JWT для создания/обновления профиля инвестора');
        } else {
          const uid = (userObj && userObj.id) ?? null;
          if (!uid) {
            // попробуем взять пользовательский id из localStorage (который мог проставить login)
            const stored = localStorage.getItem('user');
            const parsed = stored ? JSON.parse(stored) : null;
            if (parsed && (parsed._id || parsed.id)) {
              // nothing — fallthrough
            }
          }
          const userId = (userObj && (userObj.id)) ?? (JSON.parse(localStorage.getItem('user') || '{}')?.id);
          if (userId) {
            try {
              await createOrUpdateInvestorByUserId(userId, investorProfile, jwt);
            } catch (e) {
              console.error('Failed to create/update investor via /investors/user/{id}', e);
              // Не бросаем — это не критично для регистрации; можно показать сообщение в UI
            }
          } else {
            console.warn('Не удалось определить userId для создания инвестора');
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};