import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [role, setRole] = useState('founder');
  const [error, setError] = useState<string | null>(null);
  const { register } = useAuth();
  const nav = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await register(email, password, fullName, company, phone, location, bio, avatarUrl, role);
      nav('/');
    } catch (err: any) {
      setError(err?.message || 'Тіркелу қатесі');
    }
  };

  return (
    <div>
      <h2>Тіркелу</h2>
      <form onSubmit={submit}>
        <div>
          <label>Аты-жөні</label>
          <input value={fullName} onChange={e => setFullName(e.target.value)} required />
        </div>

        <div>
          <label>Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" required />
        </div>

        <div>
          <label>Құпия сөз</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>

        <div>
          <label>Компания (міндетті емес)</label>
          <input value={company} onChange={e => setCompany(e.target.value)} />
        </div>

        <div>
          <label>Телефон (міндетті емес)</label>
          <input value={phone} onChange={e => setPhone(e.target.value)} />
        </div>

        <div>
          <label>Орналасқан жер (міндетті емес)</label>
          <input value={location} onChange={e => setLocation(e.target.value)} />
        </div>

        <div>
          <label>Био (міндетті емес)</label>
          <textarea value={bio} onChange={e => setBio(e.target.value)} />
        </div>

        <div>
          <label>Avatar URL (міндетті емес)</label>
          <input value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} placeholder="https://..." />
        </div>

        <div>
          <label>Рөлі</label>
          <select value={role} onChange={e => setRole(e.target.value)}>
            <option value="founder">founder</option>
            <option value="investor">investor</option>
          </select>
        </div>

        {error && <div role="alert" style={{ color: 'red' }}>{error}</div>}

        <div>
          <button type="submit">Тіркелу</button>
          <Link to="/login" style={{ marginLeft: 12 }}>Кіру</Link>
        </div>
      </form>
    </div>
  );
}
