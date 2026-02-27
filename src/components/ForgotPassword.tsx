import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail]     = useState('');
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('http://localhost:8080/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      // Бэкенд всегда возвращает 200 — просто показываем успех
      if (res.ok) {
        setSent(true);
      } else {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.message ?? `Ошибка ${res.status}`);
      }
    } catch (ex: any) {
      setError(ex.message ?? 'Что-то пошло не так');
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📬</div>
            <h2 style={{ marginBottom: 8 }}>Письмо отправлено</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
              Если этот email зарегистрирован, вы получите письмо со ссылкой для сброса пароля.
              Ссылка действительна 30 минут.
            </p>
            <Link to="/login" style={{ display: 'inline-block', marginTop: 20, color: 'var(--accent)' }}>
              ← Вернуться ко входу
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 style={{ marginBottom: 6 }}>Забыли пароль?</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 24 }}>
          Введите email — мы отправим ссылку для сброса.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Email</label>
            <input
              type="email"
              className="pf-input"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          {error && (
            <div style={{ color: '#ff6b6b', fontSize: 13 }}>⚠ {error}</div>
          )}

          <button
            type="submit"
            className="pf-btn pf-btn-primary"
            disabled={loading || !email.trim()}
          >
            {loading ? 'Отправка…' : 'Отправить ссылку'}
          </button>

          <Link to="/login" style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
            ← Назад ко входу
          </Link>
        </form>
      </div>
    </div>
  );
}