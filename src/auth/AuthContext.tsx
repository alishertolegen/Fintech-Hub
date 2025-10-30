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
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    fullName: string,
    company?: string,
    phone?: string,
    location?: string,
    bio?: string,
    avatarUrl?: string,
    role?: string
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const API = 'http://localhost:8080/api'; // при необходимости заменить на process.env.REACT_APP_API_URL

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch { localStorage.removeItem('user'); }
    }
    setLoading(false);
  }, []);

  const handleResponse = async (res: Response) => {
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      if (!res.ok) throw new Error(json.message || JSON.stringify(json));
      return json;
    } catch (e: any) {
      if (!res.ok) throw new Error(text || 'Сервер вернул ошибку');
      return text;
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
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
        role: data.role
      };
      setUser(userObj);
      localStorage.setItem('user', JSON.stringify(userObj));
    } finally {
      setLoading(false);
    }
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
    role?: string
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
        body: JSON.stringify(payload)
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
        role: data.role
      };
      setUser(userObj);
      localStorage.setItem('user', JSON.stringify(userObj));
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
