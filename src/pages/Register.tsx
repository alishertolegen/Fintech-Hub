import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import './Register.css';
import Select from 'react-select';

// Типы для react-select
interface CountryOption {
  value: string;
  label: string;
}
const STAGES = [
  { value: 'idea',     label: '💡 Idea'     },
  { value: 'pre-seed', label: '🌱 Pre-seed' },
  { value: 'seed',     label: '🚀 Seed'     },
  { value: 'series-a', label: '📈 Series A' },
  { value: 'growth',   label: '⚡ Growth'   },
  { value: 'mature',   label: '🏛️ Mature'   },
];

const INDUSTRIES = [
  { value: 'fintech',        label: '💳 Fintech'        },
  { value: 'saas',           label: '☁️ SaaS'           },
  { value: 'e-commerce',     label: '🛒 E-commerce'     },
  { value: 'edtech',         label: '🎓 EdTech'         },
  { value: 'healthtech',     label: '🏥 HealthTech'     },
  { value: 'ai-ml',          label: '🤖 AI / ML'        },
  { value: 'logistics',      label: '🚚 Logistics'      },
  { value: 'agritech',       label: '🌾 AgriTech'       },
  { value: 'cleantech',      label: '♻️ CleanTech'      },
  { value: 'proptech',       label: '🏠 PropTech'       },
  { value: 'legaltech',      label: '⚖️ LegalTech'      },
  { value: 'cybersecurity',  label: '🔒 Cybersecurity'  },
  { value: 'gaming',         label: '🎮 Gaming'         },
  { value: 'media',          label: '📱 Media'          },
  { value: 'marketplace',    label: '🏪 Marketplace'    },
  { value: 'hr-tech',        label: '👥 HR Tech'        },
  { value: 'biotech',        label: '🧬 Biotech'        },
  { value: 'construction',   label: '🏗️ Construction'   },
];
// ── Validation helpers ──────────────────────────────────────────────────────
const validateFullName = (v: string) => {
  if (!v.trim()) return 'Аты-жөні міндетті өріс.';
  if (v.trim().length < 2) return 'Аты-жөні кемінде 2 таңбадан тұруы керек.';
  if (!/^[\p{L}\s'-]+$/u.test(v.trim())) return 'Аты-жөні тек әріптерден тұруы керек.';
  return '';
};

const validateEmail = (v: string) => {
  if (!v.trim()) return 'Email міндетті өріс.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Email форматы дұрыс емес.';
  return '';
};

const validatePassword = (v: string) => {
  if (!v) return 'Құпия сөз міндетті өріс.';
  if (v.length < 8) return 'Құпия сөз кемінде 8 таңбадан тұруы керек.';
  if (!/[A-Z]/.test(v)) return 'Кемінде бір бас әріп болуы керек (A-Z).';
  if (!/[a-z]/.test(v)) return 'Кемінде бір кіші әріп болуы керек (a-z).';
  if (!/[0-9]/.test(v)) return 'Кемінде бір сан болуы керек.';
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(v))
    return 'Кемінде бір арнайы таңба болуы керек (!@#$ және т.б.).';
  return '';
};

const validatePhone = (v: string) => {
  if (!v.trim()) return 'Телефон міндетті өріс.';
  // Accepts: +7XXXXXXXXXX, 8XXXXXXXXXX, with optional spaces/dashes/parens
  if (!/^(\+7|8)[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}$/.test(v.trim()))
    return 'Телефон форматы дұрыс емес. Мысалы: +7 (777) 123-45-67';
  return '';
};

const validateLocation = (v: CountryOption | null) => {
  if (!v) return 'Орналасқан жер міндетті өріс.';
  return '';
};

const validateLegalName = (v: string) => {
  if (!v.trim()) return 'Инвестор үшін заңдық атауы міндетті өріс.';
  return '';
};

// ── Types ───────────────────────────────────────────────────────────────────
interface FormErrors {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  location: string;
  legalName: string;
}

// ── Component ───────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName]   = useState('');
  const [company, setCompany]     = useState('');
  const [phone, setPhone]         = useState('');
const [location, setLocation] = useState<CountryOption | null>(null);
const [countries, setCountries] = useState<CountryOption[]>([]);
const [countriesLoading, setCountriesLoading] = useState(false);
  const [bio, setBio]             = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [role, setRole]           = useState('founder');
  const [error, setError]         = useState<string | null>(null);
  const [loading, setLoading]     = useState(false);

  // investor-specific
  const [legalName, setLegalName]       = useState('');
  const [investorType, setInvestorType] = useState('angel');
  const [minCheck, setMinCheck]         = useState<number | ''>('');
  const [maxCheck, setMaxCheck]         = useState<number | ''>('');
const [industries, setIndustries] = useState<CountryOption[]>([]);
const [stages, setStages]         = useState<CountryOption[]>([]);
  const [website, setWebsite]           = useState('');

  // Field-level errors
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({
    fullName: '', email: '', password: '', phone: '', location: '', legalName: '',
  });
  // Track touched fields to show errors only after interaction
  const [touched, setTouched] = useState<Partial<Record<keyof FormErrors, boolean>>>({});

  useEffect(() => {
  setCountriesLoading(true);
  fetch('https://restcountries.com/v3.1/all?fields=name,cca2')
    .then(r => r.json())
    .then((data: any[]) => {
      const opts = data
        .map(c => ({ value: c.cca2, label: c.name.common }))
        .sort((a, b) => a.label.localeCompare(b.label));
      setCountries(opts);
    })
    .finally(() => setCountriesLoading(false));
}, []);

  const { register } = useAuth();
  const nav = useNavigate();

  // ── Helpers ────────────────────────────────────────────────────────────────
  const touch = (field: keyof FormErrors) =>
    setTouched(prev => ({ ...prev, [field]: true }));

  const updateError = (field: keyof FormErrors, msg: string) =>
    setFieldErrors(prev => ({ ...prev, [field]: msg }));

  const getFieldClass = (field: keyof FormErrors) =>
    `form-input${touched[field] && fieldErrors[field] ? ' input-error' : touched[field] && !fieldErrors[field] ? ' input-valid' : ''}`;

  // Phone auto-formatting
  const handlePhoneChange = (raw: string) => {
    // Strip everything except digits and leading +
    let digits = raw.replace(/[^\d+]/g, '');
    setPhone(raw); // keep raw for display; validate separately
    updateError('phone', validatePhone(raw));
  };

  // ── Validate all required fields before submit ─────────────────────────────
  const validateAll = (): boolean => {
    const errors: FormErrors = {
      fullName: validateFullName(fullName),
      email:    validateEmail(email),
      password: validatePassword(password),
      phone:    validatePhone(phone),
      location: validateLocation(location),
      legalName: role === 'investor' ? validateLegalName(legalName) : '',
    };
    setFieldErrors(errors);
    setTouched({ fullName: true, email: true, password: true, phone: true, location: true, legalName: true });
    return Object.values(errors).every(e => e === '');
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateAll()) {
      setError('Барлық міндетті өрістерді дұрыс толтырыңыз.');
      return;
    }

    setLoading(true);
    try {
      const investorProfile =
        role === 'investor'
          ? {
              legalName: legalName || fullName,
              type: investorType,
              minCheck: minCheck === '' ? undefined : Number(minCheck),
              maxCheck: maxCheck === '' ? undefined : Number(maxCheck),
              preferredIndustries: industries.map(i => i.value),
preferredStages: stages.map(s => s.value),
              website,
            }
          : undefined;

      await register(email, password, fullName, company, phone, location?.label ?? '', bio, avatarUrl, role, investorProfile);
      nav('/');
    } catch (err: any) {
      console.error('Register error:', err);
      let userMessage: string | null = null;
      const resp = err?.response;

      if (resp?.data) {
        const data = resp.data;
        if (typeof data.message === 'string' && data.message.trim()) userMessage = data.message;
        else if (typeof data.error === 'string' && data.error.trim()) userMessage = data.error;
        else if (data.code) {
          const map: Record<string, string> = {
            EMAIL_EXISTS:  'Бұл email бұрыннан тіркелген.',
            INVALID_EMAIL: 'Электрондық пошта форматы дұрыс емес.',
            WEAK_PASSWORD: 'Құпия сөз тым әлсіз (кемінде 8 таңба).',
            BAD_REQUEST:   'Қате сұраныс. Барлық міндетті өрістерді толтырыңыз.',
            SERVER_ERROR:  'Серверде қате. Кейінірек қайталап көріңіз.',
          };
          userMessage = map[data.code] ?? data.code ?? 'Тіркелу қатесі';
        } else {
          const s = resp.status;
          if (s === 400) userMessage = 'Қате сұраныс. Деректерді тексеріңіз.';
          else if (s === 401) userMessage = 'Рұқсат беру қатесі.';
          else if (s === 409) userMessage = 'Бұл email бұрыннан тіркелген.';
          else if (s >= 500) userMessage = 'Сервер ішінде қате. Кейінірек қайталап көріңіз.';
          else userMessage = 'Белгісіз қате орын алды.';
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

  // ── Render ─────────────────────────────────────────────────────────────────
  const fe = fieldErrors;

  return (
    <div className="register-container">

      {/* ==================== LEFT EDITORIAL PANEL ==================== */}
      <aside className="register-left-panel">
        <div className="left-logo navbar-logo">
  <div className="logo-mark left-logo-mark">
    <img src="/logo_fintech_transparent.png" alt="logo" />
  </div>
  <span className="logo-text left-logo-text">FINTECH <em>HUB</em></span>
</div>
        <div className="left-headline">
          <div className="left-headline-line"><span>BUILD</span></div>
          <div className="left-headline-line"><span>BOLD</span></div>
          <div className="left-headline-line"><span>SCALE</span></div>
          <div className="left-divider" />
          <p className="left-tagline">
            Қазақстандағы стартаптар<br />мен инвесторлар платформасы
          </p>
        </div>
        <div className="left-stats">
          <div className="left-stat-item"><div className="left-stat-num">340+</div><div className="left-stat-label">Стартаптар</div></div>
          <div className="left-stat-item"><div className="left-stat-num">120+</div><div className="left-stat-label">Инвесторлар</div></div>
          <div className="left-stat-item"><div className="left-stat-num">$4M+</div><div className="left-stat-label">Инвестиция</div></div>
        </div>
      </aside>

      <div className="left-geo left-geo-1" />
      <div className="left-geo left-geo-2" />
      <div className="left-geo left-geo-3" />

      {/* ==================== RIGHT FORM PANEL ==================== */}
      <div className={`register-card ${role === 'investor' ? 'investor-layout' : ''}`}>
        <div className="register-header">
          <h2 className="register-title">Тіркелу</h2>
          <p className="register-subtitle">Жаңа аккаунт жасаңыз</p>
        </div>

        <form onSubmit={submit} noValidate className={`register-form ${role === 'investor' ? 'investor-layout' : ''}`}>

          {/* ── Block 1: Core credentials ── */}
          <div className="form-row">
            {/* Full name */}
            <div className="form-group">
              <label className="form-label">
                Аты-жөні <span className="required-star">*</span>
              </label>
              <input
                className={getFieldClass('fullName')}
                value={fullName}
                onChange={e => { setFullName(e.target.value); updateError('fullName', validateFullName(e.target.value)); }}
                onBlur={() => { touch('fullName'); updateError('fullName', validateFullName(fullName)); }}
                placeholder="Іван Іванов"
              />
              {touched.fullName && fe.fullName && <span className="field-error">{fe.fullName}</span>}
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label">
                Email <span className="required-star">*</span>
              </label>
              <input
                className={getFieldClass('email')}
                value={email}
                onChange={e => { setEmail(e.target.value); updateError('email', validateEmail(e.target.value)); }}
                onBlur={() => { touch('email'); updateError('email', validateEmail(email)); }}
                type="email"
                placeholder="you@example.com"
              />
              {touched.email && fe.email && <span className="field-error">{fe.email}</span>}
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">
              Құпия сөз <span className="required-star">*</span>
            </label>
            <div className="input-wrapper">
              <input
                className={getFieldClass('password')}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); updateError('password', validatePassword(e.target.value)); }}
                onBlur={() => { touch('password'); updateError('password', validatePassword(password)); }}
                placeholder="••••••••"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(p => !p)}
                tabIndex={-1}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {touched.password && fe.password && <span className="field-error">{fe.password}</span>}
            {/* Password strength hints */}
            {password && (
              <ul className="password-hints">
                <li className={password.length >= 8 ? 'hint-ok' : 'hint-bad'}>Кемінде 8 таңба</li>
                <li className={/[A-Z]/.test(password) ? 'hint-ok' : 'hint-bad'}>Бас әріп (A-Z)</li>
                <li className={/[a-z]/.test(password) ? 'hint-ok' : 'hint-bad'}>Кіші әріп (a-z)</li>
                <li className={/[0-9]/.test(password) ? 'hint-ok' : 'hint-bad'}>Сан (0-9)</li>
                <li className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? 'hint-ok' : 'hint-bad'}>Арнайы таңба (!@#$ …)</li>
              </ul>
            )}
          </div>

          {/* ── Block 2: Role toggle ── */}
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

          {/* ── Block 3: Profile + optional investor ── */}
          <div className="form-content-split">

            <div className="common-fields">
              <h3 className="section-title">Профиль</h3>

              <div className="form-row">
                {/* Company (optional) */}
                <div className="form-group">
                  <label className="form-label optional">Компания</label>
                  <input className="form-input" value={company} onChange={e => setCompany(e.target.value)} placeholder="Компания атауы" />
                </div>

                {/* Phone (required) */}
                <div className="form-group">
                  <label className="form-label">
                    Телефон <span className="required-star">*</span>
                  </label>
                  <input
                    className={getFieldClass('phone')}
                    value={phone}
                    onChange={e => { setPhone(e.target.value); updateError('phone', validatePhone(e.target.value)); }}
                    onBlur={() => { touch('phone'); updateError('phone', validatePhone(phone)); }}
                    placeholder="+7 (777) 123-45-67"
                  />
                  {touched.phone && fe.phone && <span className="field-error">{fe.phone}</span>}
                </div>
              </div>

              {/* Location (required) */}
              <div className="form-group">
  <label className="form-label">
    Орналасқан жер <span className="required-star">*</span>
  </label>
  <Select
  options={countries}
  menuPortalTarget={document.body}
  menuPosition="fixed"
    value={location}
    onChange={(opt) => {
      setLocation(opt);
      updateError('location', validateLocation(opt));
    }}
    onBlur={() => { touch('location'); updateError('location', validateLocation(location)); }}
    isLoading={countriesLoading}
    placeholder="Елді таңдаңыз..."
    noOptionsMessage={() => 'Табылмады'}
    loadingMessage={() => 'Жүктелуде...'}
    classNamePrefix="country-select"
    className={touched.location && fe.location ? 'select-error' : ''}
  />
  {touched.location && fe.location && <span className="field-error">{fe.location}</span>}
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

            {/* ── Investor section ── */}
            {role === 'investor' && (
              <div className="investor-section">
                <h3 className="investor-section-title">Инвестор профилі</h3>

                {/* Legal name (required for investor) */}
                <div className="form-group">
                  <label className="form-label">
                    Заңдық атауы <span className="required-star">*</span>
                  </label>
                  <input
                    className={getFieldClass('legalName')}
                    value={legalName}
                    onChange={e => { setLegalName(e.target.value); updateError('legalName', validateLegalName(e.target.value)); }}
                    onBlur={() => { touch('legalName'); updateError('legalName', validateLegalName(legalName)); }}
                    placeholder="Компания заңдық атауы"
                  />
                  {touched.legalName && fe.legalName && <span className="field-error">{fe.legalName}</span>}
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
                      type="number" min={0}
                      placeholder="10 000"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label optional">Макс. чек (USD)</label>
                    <input
                      className="form-input"
                      value={maxCheck}
                      onChange={e => setMaxCheck(e.target.value === '' ? '' : Number(e.target.value))}
                      type="number" min={0}
                      placeholder="500 000"
                    />
                  </div>
                </div>

                <div className="form-group">
  <label className="form-label optional">Индустрии</label>
  <Select
    isMulti
    options={INDUSTRIES}
    value={industries}
    onChange={(opts) => setIndustries(opts as CountryOption[])}
    placeholder="Таңдаңыз..."
    noOptionsMessage={() => 'Табылмады'}
    menuPortalTarget={document.body}
    menuPosition="fixed"
    classNamePrefix="country-select"
  />
</div>

<div className="form-group">
  <label className="form-label optional">Стадии</label>
  <Select
    isMulti
    options={STAGES}
    value={stages}
    onChange={(opts) => setStages(opts as CountryOption[])}
    placeholder="Таңдаңыз..."
    noOptionsMessage={() => 'Табылмады'}
    menuPortalTarget={document.body}
    menuPosition="fixed"
    classNamePrefix="country-select"
  />
</div>

                <div className="form-group">
                  <label className="form-label optional">Website</label>
                  <input className="form-input" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://yourfund.com" />
                </div>
              </div>
            )}
          </div>

          {/* ── Global error ── */}
          {error && (
            <div role="alert" className="error-message">{error}</div>
          )}

          {/* ── Actions ── */}
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