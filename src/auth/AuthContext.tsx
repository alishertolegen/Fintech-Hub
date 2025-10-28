import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  email: string;
  fullName: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean; // добавили loading
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Здесь можно проверить локальное хранилище или токен
    const fetchUser = async () => {
      // Симуляция загрузки пользователя
      await new Promise(resolve => setTimeout(resolve, 500));
      setUser(null); // или восстановить пользователя из localStorage
      setLoading(false);
    };
    fetchUser();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setUser({ email, fullName: 'Қолданушы' });
    setLoading(false);
  };

  const register = async (email: string, password: string, fullName: string) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setUser({ email, fullName });
    setLoading(false);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
