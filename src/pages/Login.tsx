import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import './Login.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login, loading } = useAuth();
  const nav = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Толық ақпарат енгізіңіз');
      return;
    }

    try {
      await login(email.trim(), password);
      nav('/');
    } catch (err: any) {
      setError(err?.message || 'Кіру қатесі');
      setPassword('');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2 className="login-title">Кіру</h2>
          <p className="login-subtitle">Өз аккаунтыңызға кіріңіз</p>
        </div>

        <form onSubmit={submit} className="login-form">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Құпия сөз</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="form-input"
            />
          </div>

          {error && (
            <div role="alert" className="error-message">
              {error}
            </div>
          )}

          <div className="form-actions">
            <button 
              type="submit" 
              disabled={loading}
              className={`btn-login-submit ${loading ? 'loading' : ''}`}
            >
              {loading ? 'Жүктелуде...' : 'Кіру'}
            </button>

            <div className="register-link-container">
              <span className="register-link-text">Аккаунт жоқ па?</span>
              <Link to="/register" className="register-link">
                Тіркелу
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}