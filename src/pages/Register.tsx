// src/pages/RegisterPage.tsx
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

  // investor-specific
  const [legalName, setLegalName] = useState('');
  const [investorType, setInvestorType] = useState('angel'); // angel | vc | corporate
  const [minCheck, setMinCheck] = useState<number | ''>('');
  const [maxCheck, setMaxCheck] = useState<number | ''>('');
  const [industries, setIndustries] = useState(''); // comma separated
  const [stages, setStages] = useState(''); // comma separated
  const [website, setWebsite] = useState('');

  const { register } = useAuth();
  const nav = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const investorProfile =
        role === 'investor'
          ? {
              legalName: legalName || fullName,
              type: investorType,
              minCheck: minCheck === '' ? undefined : Number(minCheck),
              maxCheck: maxCheck === '' ? undefined : Number(maxCheck),
              preferredIndustries: industries ? industries.split(',').map(s => s.trim()) : [],
              preferredStages: stages ? stages.split(',').map(s => s.trim()) : [],
              website,
            }
          : undefined;

      await register(email, password, fullName, company, phone, location, bio, avatarUrl, role, investorProfile);
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

        {/* investor-specific block */}
        {role === 'investor' && (
          <fieldset style={{ marginTop: 12 }}>
            <legend>Инвестор профилі (міндетті емес, кейін профилде өзгертуге болады)</legend>

            <div>
              <label>Заңдық атауы (legal name)</label>
              <input value={legalName} onChange={e => setLegalName(e.target.value)} />
            </div>

            <div>
              <label>Тип</label>
              <select value={investorType} onChange={e => setInvestorType(e.target.value)}>
                <option value="angel">angel</option>
                <option value="vc">vc</option>
                <option value="corporate">corporate</option>
              </select>
            </div>

            <div>
              <label>Минимальный чек (USD)</label>
              <input value={minCheck} onChange={e => setMinCheck(e.target.value === '' ? '' : Number(e.target.value))} type="number" />
            </div>

            <div>
              <label>Макс чек (USD)</label>
              <input value={maxCheck} onChange={e => setMaxCheck(e.target.value === '' ? '' : Number(e.target.value))} type="number" />
            </div>

            <div>
              <label>Индустрии (через запятую)</label>
              <input value={industries} onChange={e => setIndustries(e.target.value)} placeholder="fintech, saas" />
            </div>

            <div>
              <label>Стадии (через запятую)</label>
              <input value={stages} onChange={e => setStages(e.target.value)} placeholder="pre-seed, seed" />
            </div>

            <div>
              <label>Website</label>
              <input value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://..." />
            </div>
          </fieldset>
        )}

        {error && <div role="alert" style={{ color: 'red' }}>{error}</div>}

        <div style={{ marginTop: 12 }}>
          <button type="submit">Тіркелу</button>
          <Link to="/login" style={{ marginLeft: 12 }}>Кіру</Link>
        </div>
      </form>
    </div>
  );
}
