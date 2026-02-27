// src/pages/ResetPassword.tsx
import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import '../pages/Login.css';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token          = searchParams.get('token') ?? '';
  const navigate       = useNavigate();

  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [showConf, setShowConf]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [success, setSuccess]     = useState(false);
  const [touched, setTouched]     = useState({ password: false, confirm: false });

  // ── Validation (same rules as Register) ──
  const validatePassword = (v: string) => {
    if (!v)              return 'Құпия сөз міндетті өріс.';
    if (v.length < 8)    return 'Кемінде 8 таңбадан тұруы керек.';
    if (!/[A-Z]/.test(v)) return 'Кемінде бір бас әріп болуы керек (A-Z).';
    if (!/[a-z]/.test(v)) return 'Кемінде бір кіші әріп болуы керек (a-z).';
    if (!/[0-9]/.test(v)) return 'Кемінде бір сан болуы керек.';
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(v))
      return 'Кемінде бір арнайы таңба болуы керек (!@#$ …).';
    return '';
  };
  const validateConfirm = (v: string) =>
    v !== password ? 'Құпия сөздер сәйкес келмейді.' : '';

  const passError = validatePassword(password);
  const confError = validateConfirm(confirm);

  const getPassClass = () =>
    `form-input${touched.password && passError ? ' input-error' : touched.password && !passError ? ' input-valid' : ''}`;
  const getConfClass = () =>
    `form-input${touched.confirm && confError ? ' input-error' : touched.confirm && !confError ? ' input-valid' : ''}`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ password: true, confirm: true });
    if (passError || confError) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:8080/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.message ?? `Қате ${res.status}`);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (ex: any) {
      setError(ex.message ?? 'Бірдеңе дұрыс болмады');
    } finally {
      setLoading(false);
    }
  }

  // ── Invalid token screen ──
  if (!token) return (
    <div className="login-container">
      <div className="login-lines" aria-hidden="true">
        {[0,1,2,3].map(i => <div key={i} className="login-line" />)}
      </div>
      <div className="login-bracket login-bracket--tl" /><div className="login-bracket login-bracket--tr" />
      <div className="login-bracket login-bracket--bl" /><div className="login-bracket login-bracket--br" />
      <div className="login-wrapper">
        <div className="login-logo navbar-logo">
          <div className="logo-mark login-logo-mark"><img src="/logo_fintech_transparent.png" alt="logo" /></div>
          <span className="logo-text login-logo-text">FINTECH<em>HUB</em></span>
        </div>
        <div className="login-card" style={{ textAlign: 'center', padding: '40px 32px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h2 className="login-title" style={{ marginBottom: 8 }}>Сілтеме жарамсыз</h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>
            Токен жоқ немесе мерзімі өткен.<br />Жаңа сілтеме сұраңыз.
          </p>
          <button className="btn-login-submit" onClick={() => navigate('/login')}>
            <span>← Кіру бетіне оралу</span>
          </button>
        </div>
      </div>
    </div>
  );

  // ── Success screen ──
  if (success) return (
    <div className="login-container">
      <div className="login-lines" aria-hidden="true">
        {[0,1,2,3].map(i => <div key={i} className="login-line" />)}
      </div>
      <div className="login-bracket login-bracket--tl" /><div className="login-bracket login-bracket--tr" />
      <div className="login-bracket login-bracket--bl" /><div className="login-bracket login-bracket--br" />
      <div className="login-wrapper">
        <div className="login-logo navbar-logo">
          <div className="logo-mark login-logo-mark"><img src="/logo_fintech_transparent.png" alt="logo" /></div>
          <span className="logo-text login-logo-text">FINTECH<em>HUB</em></span>
        </div>
        <div className="login-card" style={{ textAlign: 'center', padding: '40px 32px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <h2 className="login-title" style={{ marginBottom: 8 }}>Құпия сөз өзгертілді!</h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, lineHeight: 1.6 }}>
            Кіру бетіне бағытталуда…
          </p>
          <div style={{
            width: '100%', height: 3, background: 'rgba(255,255,255,0.1)',
            borderRadius: 2, marginTop: 28, overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', background: 'var(--accent, #ff8c6b)',
              borderRadius: 2, animation: 'progressBar 2.5s linear forwards',
            }} />
          </div>
        </div>
      </div>
      <style>{`@keyframes progressBar { from { width: 0% } to { width: 100% } }`}</style>
    </div>
  );

  // ── Main form ──
  return (
    <div className="login-container">
      <div className="login-lines" aria-hidden="true">
        {[0,1,2,3].map(i => <div key={i} className="login-line" />)}
      </div>
      <div className="login-bracket login-bracket--tl" /><div className="login-bracket login-bracket--tr" />
      <div className="login-bracket login-bracket--bl" /><div className="login-bracket login-bracket--br" />
      {[0,1,2,3].map(i => <div key={i} className="login-dot" aria-hidden="true" />)}

      <div className="login-wrapper">
        <div className="login-logo navbar-logo">
          <div className="logo-mark login-logo-mark"><img src="/logo_fintech_transparent.png" alt="logo" /></div>
          <span className="logo-text login-logo-text">FINTECH<em>HUB</em></span>
        </div>
        <div className="login-issue" aria-hidden="true">№ 003 — Reset</div>

        <div className="login-card">
          <div className="login-header">
            <h2 className="login-title">Жаңа құпия <em>сөз</em></h2>
            <p className="login-subtitle">Сенімді құпия сөз ойлап табыңыз</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form" noValidate>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">
                Жаңа құпия сөз <span className="required-star" style={{ color: 'var(--accent, #ff8c6b)' }}>*</span>
              </label>
              <div className="input-wrapper" style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  className={getPassClass()}
                  placeholder="••••••••"
                  value={password}
                  autoFocus
                  onChange={e => setPassword(e.target.value)}
                  onBlur={() => setTouched(t => ({ ...t, password: true }))}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPass(p => !p)}
                  tabIndex={-1}
                  style={{
                    position: 'absolute', right: 12, top: '50%',
                    transform: 'translateY(-50%)', background: 'none',
                    border: 'none', cursor: 'pointer', fontSize: 16,
                  }}
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
                <div className="input-line" />
              </div>
              {touched.password && passError && (
                <span className="field-error" style={{ fontSize: 11, color: '#ff6b6b', marginTop: 4, display: 'block' }}>
                  {passError}
                </span>
              )}

              {/* Strength hints */}
              {password && (
                <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0 0', display: 'flex', flexWrap: 'wrap', gap: '4px 12px' }}>
                  {[
                    { ok: password.length >= 8,                                      label: '8+ таңба'         },
                    { ok: /[A-Z]/.test(password),                                    label: 'Бас әріп'         },
                    { ok: /[a-z]/.test(password),                                    label: 'Кіші әріп'        },
                    { ok: /[0-9]/.test(password),                                    label: 'Сан'              },
                    { ok: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),  label: 'Арнайы таңба'    },
                  ].map(h => (
                    <li key={h.label} style={{ fontSize: 11, color: h.ok ? '#4ade80' : 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span>{h.ok ? '✓' : '○'}</span> {h.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Confirm */}
            <div className="form-group">
              <label className="form-label">
                Растау <span className="required-star" style={{ color: 'var(--accent, #ff8c6b)' }}>*</span>
              </label>
              <div className="input-wrapper" style={{ position: 'relative' }}>
                <input
                  type={showConf ? 'text' : 'password'}
                  className={getConfClass()}
                  placeholder="••••••••"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  onBlur={() => setTouched(t => ({ ...t, confirm: true }))}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowConf(p => !p)}
                  tabIndex={-1}
                  style={{
                    position: 'absolute', right: 12, top: '50%',
                    transform: 'translateY(-50%)', background: 'none',
                    border: 'none', cursor: 'pointer', fontSize: 16,
                  }}
                >
                  {showConf ? '🙈' : '👁️'}
                </button>
                <div className="input-line" />
              </div>
              {touched.confirm && confError && (
                <span className="field-error" style={{ fontSize: 11, color: '#ff6b6b', marginTop: 4, display: 'block' }}>
                  {confError}
                </span>
              )}
            </div>

            {error && <div role="alert" className="error-message">⚠ {error}</div>}

            <div className="form-actions">
              <button
                type="submit"
                disabled={loading || (touched.password && !!passError) || (touched.confirm && !!confError)}
                className={`btn-login-submit ${loading ? 'loading' : ''}`}
              >
                <span>{loading ? 'Сақталуда…' : 'Сақтау'}</span>
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}