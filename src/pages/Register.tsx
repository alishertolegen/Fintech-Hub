import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import './Register.css';

export default function RegisterPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [company, setCompany]   = useState('');
  const [phone, setPhone]       = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio]           = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [role, setRole]         = useState('founder');
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  // investor-specific
  const [legalName, setLegalName]       = useState('');
  const [investorType, setInvestorType] = useState('angel');
  const [minCheck, setMinCheck]         = useState<number | ''>('');
  const [maxCheck, setMaxCheck]         = useState<number | ''>('');
  const [industries, setIndustries]     = useState('');
  const [stages, setStages]             = useState('');
  const [website, setWebsite]           = useState('');

  const { register } = useAuth();
  const nav = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

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
      console.error('Register error:', err);

      let userMessage: string | null = null;
      const resp = err?.response;

      if (resp && resp.data) {
        const data = resp.data;
        if (typeof data.message === 'string' && data.message.trim()) {
          userMessage = data.message;
        } else if (typeof data.error === 'string' && data.error.trim()) {
          userMessage = data.error;
        } else if (data.code) {
          switch (data.code) {
            case 'EMAIL_EXISTS':   userMessage = 'Бұл email бұрыннан тіркелген.'; break;
            case 'INVALID_EMAIL':  userMessage = 'Электрондық пошта форматы дұрыс емес.'; break;
            case 'WEAK_PASSWORD':  userMessage = 'Құпия сөз тым әлсіз (кемінде 8 таңба).'; break;
            case 'BAD_REQUEST':    userMessage = 'Қате сұраныс. Барлық міндетті өрістерді толтырыңыз.'; break;
            case 'SERVER_ERROR':   userMessage = 'Серверде қате. Кейінірек қайталап көріңіз.'; break;
            default:               userMessage = data.code || 'Тіркелу қатесі';
          }
        } else {
          const status = resp.status;
          if (status === 400)      userMessage = 'Қате сұраныс. Деректерді тексеріңіз.';
          else if (status === 401) userMessage = 'Рұқсат беру қатесі.';
          else if (status === 409) userMessage = 'Бұл email бұрыннан тіркелген.';
          else if (status >= 500)  userMessage = 'Сервер ішінде қате. Кейінірек қайталап көріңіз.';
          else                     userMessage = 'Белгісіз қате орын алды.';
        }
      } else if (err?.message) {
        userMessage = err.message.toLowerCase().includes('network')
          ? 'Желіге қосылу мүмкін емес. Интернет байланысын тексеріңіз.'
          : err.message;
      } else {
        userMessage = 'Тіркелу қатесі';
      }

      setError(userMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">

      {/* ==================== LEFT EDITORIAL PANEL ==================== */}
      <aside className="register-left-panel">
        <div className="left-logo">
          <div className="left-logo-mark" />
          <span className="left-logo-text">FINTECH HUB</span>
        </div>

        <div className="left-headline">
          <div className="left-headline-line"><span>BUILD</span></div>
          <div className="left-headline-line"><span>BOLD</span></div>
          <div className="left-headline-line"><span>SCALE</span></div>
          <div className="left-divider" />
          <p className="left-tagline">
            Қазақстандағы стартаптар<br />
            мен инвесторлар платформасы
          </p>
        </div>

        <div className="left-stats">
          <div className="left-stat-item">
            <div className="left-stat-num">340+</div>
            <div className="left-stat-label">Стартаптар</div>
          </div>
          <div className="left-stat-item">
            <div className="left-stat-num">120+</div>
            <div className="left-stat-label">Инвесторлар</div>
          </div>
          <div className="left-stat-item">
            <div className="left-stat-num">$4M+</div>
            <div className="left-stat-label">Инвестиция</div>
          </div>
        </div>
      </aside>

      {/* Floating geometric decorations */}
      <div className="left-geo left-geo-1" />
      <div className="left-geo left-geo-2" />
      <div className="left-geo left-geo-3" />

      {/* ==================== RIGHT FORM PANEL ==================== */}
      <div className={`register-card ${role === 'investor' ? 'investor-layout' : ''}`}>
        <div className="register-header">
          <h2 className="register-title">Тіркелу</h2>
          <p className="register-subtitle">Жаңа аккаунт жасаңыз</p>
        </div>

        <form
          onSubmit={submit}
          className={`register-form ${role === 'investor' ? 'investor-layout' : ''}`}
        >

          {/* Block 1 — Core credentials */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Аты-жөні</label>
              <input
                className="form-input"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
                placeholder="Іван Іванов"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                type="email"
                required
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Құпия сөз</label>
            <input
              className="form-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          {/* Block 2 — Role toggle */}
          <div className="form-group">
            <label className="form-label">Рөлі</label>
            <div className="role-selector">
              <label className={`role-option ${role === 'founder' ? 'active' : ''}`}>
                <input type="radio" value="founder" checked={role === 'founder'} onChange={e => setRole(e.target.value)} />
                <span className="role-label">Founder</span>
                <span className="role-description">Стартап негізін қалаушы</span>
              </label>
              <label className={`role-option ${role === 'investor' ? 'active' : ''}`}>
                <input type="radio" value="investor" checked={role === 'investor'} onChange={e => setRole(e.target.value)} />
                <span className="role-label">Investor</span>
                <span className="role-description">Инвестор</span>
              </label>
            </div>
          </div>

          {/* Block 3 — Profile + optional investor */}
          <div className="form-content-split">

            <div className="common-fields">
              <h3 className="section-title">Профиль</h3>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label optional">Компания</label>
                  <input className="form-input" value={company} onChange={e => setCompany(e.target.value)} placeholder="Компания атауы" />
                </div>
                <div className="form-group">
                  <label className="form-label optional">Телефон</label>
                  <input className="form-input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+7 (___) ___-__-__" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label optional">Орналасқан жер</label>
                <input className="form-input" value={location} onChange={e => setLocation(e.target.value)} placeholder="Алматы, Қазақстан" />
              </div>

              <div className="form-group">
                <label className="form-label optional">Био</label>
                <textarea className="form-textarea" value={bio} onChange={e => setBio(e.target.value)} placeholder="Өзіңіз туралы қысқаша..." />
              </div>

              <div className="form-group">
                <label className="form-label optional">Avatar URL</label>
                <input className="form-input" value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} placeholder="https://..." />
              </div>
            </div>

            {role === 'investor' && (
              <div className="investor-section">
                <h3 className="investor-section-title">Инвестор профилі</h3>

                <div className="form-group">
                  <label className="form-label optional">Заңдық атауы</label>
                  <input className="form-input" value={legalName} onChange={e => setLegalName(e.target.value)} placeholder="Компания заңдық атауы" />
                </div>

                <div className="form-group">
                  <label className="form-label">Тип</label>
                  <select className="form-select" value={investorType} onChange={e => setInvestorType(e.target.value)}>
                    <option value="angel">Angel investor</option>
                    <option value="vc">Venture Capital</option>
                    <option value="corporate">Corporate investor</option>
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label optional">Мин. чек (USD)</label>
                    <input
                      className="form-input"
                      value={minCheck}
                      onChange={e => setMinCheck(e.target.value === '' ? '' : Number(e.target.value))}
                      type="number"
                      placeholder="10 000"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label optional">Макс. чек (USD)</label>
                    <input
                      className="form-input"
                      value={maxCheck}
                      onChange={e => setMaxCheck(e.target.value === '' ? '' : Number(e.target.value))}
                      type="number"
                      placeholder="500 000"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label optional">Индустрии</label>
                  <input className="form-input" value={industries} onChange={e => setIndustries(e.target.value)} placeholder="fintech, saas, e-commerce" />
                </div>

                <div className="form-group">
                  <label className="form-label optional">Стадии</label>
                  <input className="form-input" value={stages} onChange={e => setStages(e.target.value)} placeholder="pre-seed, seed, series-a" />
                </div>

                <div className="form-group">
                  <label className="form-label optional">Website</label>
                  <input className="form-input" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://yourfund.com" />
                </div>
              </div>
            )}

          </div>

          {/* Error */}
          {error && (
            <div role="alert" className="error-message">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="form-actions">
            <button
              type="submit"
              disabled={loading}
              className={`btn-register-submit ${loading ? 'loading' : ''}`}
            >
              {loading ? 'Жүктелуде...' : 'Тіркелу'}
            </button>

            <div className="login-link-container">
              <span className="login-link-text">Аккаунт бар ма?</span>
              <Link to="/login" className="login-link">Кіру</Link>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}