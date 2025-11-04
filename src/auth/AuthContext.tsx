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

  const fetchUserProfile = async (jwt: string) => {
    const res = await fetch(`${API}/users/me`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    const data = await handleResponse(res);
    const userObj: User = {
      id: data.id,
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
    localStorage.setItem('user', JSON.stringify(userObj));
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

      await fetchUserProfile(jwt);
    } finally {
      setLoading(false);
    }
  };

  const createInvestor = async (userId: string, investorProfile: any, jwt: string | null) => {
    if (!jwt) throw new Error('No JWT for creating investor');
    const body = { userId, ...investorProfile };
    const res = await fetch(`${API}/investors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
      body: JSON.stringify(body),
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

      const res = await fetch(`${API}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await handleResponse(res);

      // временно ставим user (если backend возвращает профиль)
      const userObj: User = {
        id: data.id,
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
      localStorage.setItem('user', JSON.stringify(userObj));

      // если роль инвестор — нужно создать investor документ.
      if (role === 'investor') {
        // делаем логин чтобы получить JWT (если register не возвращает токен)
        await login(email, password);
        const jwt = localStorage.getItem('token');
        if (!jwt) throw new Error('Не удалось получить токен для создания профиля инвестора');

        const profile = {
          userId: userObj.id,
          legalName: investorProfile?.legalName ?? userObj.fullName ?? '',
          type: investorProfile?.type ?? 'angel',
          minCheck: investorProfile?.minCheck ?? null,
          maxCheck: investorProfile?.maxCheck ?? null,
          preferredIndustries: investorProfile?.preferredIndustries ?? [],
          preferredStages: investorProfile?.preferredStages ?? [],
          description: investorProfile?.description ?? '',
          website: investorProfile?.website ?? '',
          isVerified: false
        };

        try {
          await createInvestor(userObj.id!, profile, jwt);
        } catch (e) {
          console.error('Investor creation failed', e);
          // не проставляем fatal: можно показывать уведомление в UI
          // throw e; // если хотите, пробросьте ошибку
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
