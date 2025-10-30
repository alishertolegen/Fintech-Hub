import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { register } = useAuth();
  const nav = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await register(email, password, fullName);
      nav('/');
    } catch (err: any) {
      setError(err.message || 'Тіркелу қатесі');
    }
  };

  return (
    <div>
      <h2>Тіркелу</h2>
      <form onSubmit={submit}>
        <div>
          <label>Аты-жөні</label>
          <input value={fullName} onChange={e => setFullName(e.target.value)} />
        </div>
        <div>
          <label>Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div>
          <label>Құпия сөз</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        {error && <div role="alert">{error}</div>}
        <div>
          <button type="submit">Тіркелу</button>
          <Link to="/login">Кіру</Link>
        </div>
      </form>
    </div>
  );
}
