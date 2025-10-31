import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

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
    <div>
      <h2>Кіру</h2>
      <form onSubmit={submit}>
        <div>
          <label>Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label>Құпия сөз</label>
          <input
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>

        {error && <div role="alert" style={{ color: 'red' }}>{error}</div>}

        <div>
          <button type="submit" disabled={loading}>
            {loading ? 'Жүктелуде...' : 'Кіру'}
          </button>
          <Link to="/register" style={{ marginLeft: 10 }}>Тіркелу</Link>
        </div>
      </form>
    </div>
  );
}
