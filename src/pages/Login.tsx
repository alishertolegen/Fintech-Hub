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
      console.error('Login error:', err);

      const resp = err?.response;
      let userMessage: string | null = null;

      if (resp && resp.data) {
        const data = resp.data;
        if (typeof data.message === 'string' && data.message.trim()) {
          userMessage = data.message;
        } else if (typeof data.error === 'string' && data.error.trim()) {
          userMessage = data.error;
        } else if (data.code) {
          switch (data.code) {
            case 'INVALID_CREDENTIALS': userMessage = 'Қате email немесе құпия сөз.'; break;
            case 'MISSING_AUTH':        userMessage = 'Рұқсаттама жетіспейді.'; break;
            case 'INVALID_TOKEN':       userMessage = 'Токен жарамсыз немесе мерзімі өткен.'; break;
            default:                    userMessage = `Қате: ${data.code}`;
          }
        } else {
          const status = resp.status;
          if (status === 400)      userMessage = 'Қате сұраныс. Деректерді тексеріңіз.';
          else if (status === 401) userMessage = 'Қате email немесе құпия сөз.';
          else if (status === 403) userMessage = 'Бұл әрекетке рұқсатыңыз жоқ.';
          else if (status === 404) userMessage = 'Ресурс табылмады.';
          else if (status >= 500)  userMessage = 'Сервер ішінде қате. Кейінірек қайталап көріңіз.';
          else                     userMessage = 'Белгісіз қате орын алды.';
        }
      } else if (err?.message) {
        userMessage = err.message.toLowerCase().includes('network')
          ? 'Желіге қосылу мүмкін емес. Интернет байланысын тексеріңіз.'
          : err.message;
      } else {
        userMessage = 'Кіру қатесі';
      }

      setError(userMessage);
      setPassword('');
    }
  };

  return (
    <div className="login-container">

      {/* === Decorative grid lines === */}
      <div className="login-lines" aria-hidden="true">
        <div className="login-line" />
        <div className="login-line" />
        <div className="login-line" />
        <div className="login-line" />
      </div>

      {/* === Corner brackets === */}
      <div className="login-bracket login-bracket--tl" aria-hidden="true" />
      <div className="login-bracket login-bracket--tr" aria-hidden="true" />
      <div className="login-bracket login-bracket--bl" aria-hidden="true" />
      <div className="login-bracket login-bracket--br" aria-hidden="true" />

      {/* === Intersection dots === */}
      <div className="login-dot" aria-hidden="true" />
      <div className="login-dot" aria-hidden="true" />
      <div className="login-dot" aria-hidden="true" />
      <div className="login-dot" aria-hidden="true" />

      {/* === Logo top-center === */}
      <div className="login-logo">
        <div className="login-logo-mark" />
        <span className="login-logo-text">FINTECH HUB</span>
      </div>

      {/* === Issue number — editorial detail === */}
      <div className="login-issue" aria-hidden="true">№ 001 — Auth</div>

      {/* === Main card === */}
      <div className="login-card">
        <div className="login-header">
          <h2 className="login-title">
            Қош <em>кел</em>діңіз
          </h2>
          <p className="login-subtitle">Өз аккаунтыңызға кіріңіз</p>
        </div>

        <form onSubmit={submit} className="login-form">

          <div className="form-group">
            <label className="form-label">Email</label>
            <div className="input-wrapper">
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="form-input"
              />
              <div className="input-line" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Құпия сөз</label>
            <div className="input-wrapper">
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input"
              />
              <div className="input-line" />
            </div>
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
              <span>{loading ? 'Жүктелуде...' : 'Кіру'}</span>
            </button>

            <div className="register-link-container">
              <span className="register-link-text">Аккаунт жоқ па?</span>
              <Link to="/register" className="register-link">Тіркелу</Link>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}