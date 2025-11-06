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

    // 1) Попробуем достать структуру, если это axios/fetch и backend вернул JSON
    const resp = err?.response;
    let userMessage: string | null = null;

    if (resp && resp.data) {
      const data = resp.data;
      // backend теперь возвращает { message, code? } — берем message
      if (typeof data.message === 'string' && data.message.trim()) {
        userMessage = data.message;
      } else if (typeof data.error === 'string' && data.error.trim()) {
        userMessage = data.error;
      } else if (data.code) {
        // дополнительные маппинги по коду (если нужно)
        switch (data.code) {
          case 'INVALID_CREDENTIALS':
            userMessage = 'Қате email немесе құпия сөз.';
            break;
          case 'MISSING_AUTH':
            userMessage = 'Рұқсаттама жетіспейді.';
            break;
          case 'INVALID_TOKEN':
            userMessage = 'Токен жарамсыз немесе мерзімі өткен.';
            break;
          default:
            userMessage = `Қате: ${data.code}`;
        }
      } else {
        // fallback по HTTP статусу
        const status = resp.status;
        if (status === 400) userMessage = 'Қате сұраныс. Деректерді тексеріңіз.';
        else if (status === 401) userMessage = 'Қате email немесе құпия сөз.';
        else if (status === 403) userMessage = 'Бұл әрекетке рұқсатыңыз жоқ.';
        else if (status === 404) userMessage = 'Ресурс табылмады.';
        else if (status >= 500) userMessage = 'Сервер ішінде қате. Кейінірек қайталап көріңіз.';
        else userMessage = 'Белгісіз қате орын алды.';
      }
    } else if (err?.message) {
      // возможные network errors или fetch exceptions
      if (err.message.toLowerCase().includes('network')) {
        userMessage = 'Желіге қосылу мүмкін емес. Интернет байланысын тексеріңіз.';
      } else {
        userMessage = err.message;
      }
    } else {
      userMessage = 'Кіру қатесі';
    }

    setError(userMessage);
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