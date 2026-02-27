import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import './Login.css';

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState<string | null>(null);
  const { login, loading }      = useAuth();
  const nav                     = useNavigate();

  // ── Forgot password modal state ──
  const [showModal, setShowModal]       = useState(false);
  const [modalEmail, setModalEmail]     = useState('');
  const [modalSent, setModalSent]       = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError]     = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) { setError('Толық ақпарат енгізіңіз'); return; }
    try {
      await login(email.trim(), password);
      nav('/');
    } catch (err: any) {
      const resp = err?.response;
      let msg: string | null = null;
      if (resp?.data) {
        const d = resp.data;
        if (typeof d.message === 'string' && d.message.trim()) msg = d.message;
        else if (typeof d.error === 'string' && d.error.trim()) msg = d.error;
        else if (d.code) {
          switch (d.code) {
            case 'INVALID_CREDENTIALS': msg = 'Қате email немесе құпия сөз.'; break;
            case 'MISSING_AUTH':        msg = 'Рұқсаттама жетіспейді.'; break;
            case 'INVALID_TOKEN':       msg = 'Токен жарамсыз немесе мерзімі өткен.'; break;
            default:                    msg = `Қате: ${d.code}`;
          }
        } else {
          const s = resp.status;
          if (s === 400)     msg = 'Қате сұраныс. Деректерді тексеріңіз.';
          else if (s === 401) msg = 'Қате email немесе құпия сөз.';
          else if (s === 403) msg = 'Бұл әрекетке рұқсатыңыз жоқ.';
          else if (s === 404) msg = 'Ресурс табылмады.';
          else if (s >= 500)  msg = 'Сервер ішінде қате. Кейінірек қайталап көріңіз.';
          else                msg = 'Белгісіз қате орын алды.';
        }
      } else if (err?.message) {
        msg = err.message.toLowerCase().includes('network')
          ? 'Желіге қосылу мүмкін емес. Интернет байланысын тексеріңіз.'
          : err.message;
      } else { msg = 'Кіру қатесі'; }
      setError(msg);
      setPassword('');
    }
  };

  function openModal() {
    setModalEmail(email); // prefill с тем, что уже введено в форме
    setModalSent(false);
    setModalError(null);
    setShowModal(true);
  }

  async function sendReset(e: React.FormEvent) {
    e.preventDefault();
    if (!modalEmail.trim()) { setModalError('Email қажет'); return; }
    setModalLoading(true);
    setModalError(null);
    try {
      const res = await fetch('http://localhost:8080/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: modalEmail.trim().toLowerCase() }),
      });
      if (res.ok) { setModalSent(true); }
      else {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.message ?? `Қате ${res.status}`);
      }
    } catch (ex: any) {
      setModalError(ex.message ?? 'Бірдеңе дұрыс болмады');
    } finally {
      setModalLoading(false);
    }
  }

  return (
    <div className="login-container">

      {/* === Decorative grid lines === */}
      <div className="login-lines" aria-hidden="true">
        <div className="login-line" /><div className="login-line" />
        <div className="login-line" /><div className="login-line" />
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

      <div className="login-wrapper">
        <div className="login-logo navbar-logo">
          <div className="logo-mark login-logo-mark">
            <img src="/logo_fintech_transparent.png" alt="logo" />
          </div>
          <span className="logo-text login-logo-text">FINTECH<em>HUB</em></span>
        </div>
        <div className="login-issue" aria-hidden="true">№ 001 — Auth</div>

        <div className="login-card">
          <div className="login-header">
            <h2 className="login-title">Қош <em>кел</em>діңіз</h2>
            <p className="login-subtitle">Өз аккаунтыңызға кіріңіз</p>
          </div>

          <form onSubmit={submit} className="login-form">
            <div className="form-group">
              <label className="form-label">Email</label>
              <div className="input-wrapper">
                <input type="email" required value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" className="form-input" />
                <div className="input-line" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Құпия сөз</label>
              <div className="input-wrapper">
                <input type="password" required value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" className="form-input" />
                <div className="input-line" />
              </div>
            </div>

            {error && <div role="alert" className="error-message">{error}</div>}

            <div className="form-actions">
              <button type="submit" disabled={loading}
                className={`btn-login-submit ${loading ? 'loading' : ''}`}>
                <span>{loading ? 'Жүктелуде...' : 'Кіру'}</span>
              </button>

              <div style={{ textAlign: 'center', marginTop: 4 }}>
                <button
                  type="button"
                  onClick={openModal}
                  className="register-link"
                  style={{ fontSize: 13, opacity: 0.75, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  Құпия сөзді ұмыттыңыз ба?
                </button>
              </div>

              <div className="register-link-container">
                <span className="register-link-text">Аккаунт жоқ па?</span>
                <Link to="/register" className="register-link">Тіркелу</Link>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* ══════════ FORGOT PASSWORD MODAL ══════════ */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'fadeIn 0.15s ease',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--bg-card, #111)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 16, padding: '32px 28px 28px',
              maxWidth: 400, width: '90%',
              boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
              animation: 'slideUp 0.2s ease',
            }}
          >
            {!modalSent ? (
              <>
                {/* Header */}
                <div style={{ marginBottom: 20 }}>
                  <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 700 }}>
                    🔐 Құпия сөзді қалпына келтіру
                  </h3>
                  <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                    Email енгізіңіз — сілтеме жіберіледі
                  </p>
                </div>

                <form onSubmit={sendReset} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Email</label>
                    <div className="input-wrapper">
                      <input
                        type="email"
                        required
                        autoFocus
                        className="form-input"
                        placeholder="you@example.com"
                        value={modalEmail}
                        onChange={e => setModalEmail(e.target.value)}
                      />
                      <div className="input-line" />
                    </div>
                  </div>

                  {modalError && (
                    <div role="alert" className="error-message">{modalError}</div>
                  )}

                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      disabled={modalLoading}
                      style={{
                        flex: 1, padding: '11px 0', borderRadius: 8,
                        border: '1px solid rgba(255,255,255,0.15)',
                        background: 'transparent', color: 'rgba(255,255,255,0.6)',
                        fontSize: 14, cursor: 'pointer',
                      }}
                    >
                      Болдырмау
                    </button>
                    <button
                      type="submit"
                      disabled={modalLoading || !modalEmail.trim()}
                      className="btn-login-submit"
                      style={{ flex: 1, padding: '11px 0' }}
                    >
                      <span>{modalLoading ? 'Жіберілуде…' : 'Жіберу'}</span>
                    </button>
                  </div>
                </form>
              </>
            ) : (
              /* Success state */
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
                <h3 style={{ margin: '0 0 10px', fontSize: 18 }}>Хат жіберілді!</h3>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: 24 }}>
                  <strong style={{ color: 'rgba(255,255,255,0.85)' }}>{modalEmail}</strong> поштасын тексеріңіз.
                  <br />Сілтеме 30 минут бойы жарамды.
                </p>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    width: '100%', padding: '11px 0', borderRadius: 8,
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: 'transparent', color: 'rgba(255,255,255,0.7)',
                    fontSize: 14, cursor: 'pointer',
                  }}
                >
                  Жабу
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(16px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
      `}</style>
    </div>
  );
}