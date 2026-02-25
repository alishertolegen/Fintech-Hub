// src/components/Navbar.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeRect, setActiveRect] = useState<{ left: number; width: number } | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsMenuOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isMenuOpen]);

  useEffect(() => {
  document.body.style.overflow = isMenuOpen ? 'hidden' : '';
  return () => { document.body.style.overflow = ''; };
}, [isMenuOpen]);

// Scroll to top on route change
useEffect(() => {
  window.scrollTo({ top: 0, behavior: 'auto' });
}, [location.pathname]);

  // Track active link position for pill indicator
  useEffect(() => {
    const update = () => {
      if (!navRef.current) return;
      const activeEl = navRef.current.querySelector('.nav-link.active') as HTMLElement;
      if (activeEl) {
        const navRect = navRef.current.getBoundingClientRect();
        const elRect = activeEl.getBoundingClientRect();
        setActiveRect({ left: elRect.left - navRect.left, width: elRect.width });
      } else {
        setActiveRect(null);
      }
    };

    update();
    const t = setTimeout(() => { update(); setIsReady(true); }, 100);
    return () => clearTimeout(t);
  }, [location.pathname]);

  const closeMenu = () => setIsMenuOpen(false);
  const handleLogout = () => { logout(); closeMenu(); navigate('/login'); };

  const initials = user?.fullName
    ? user.fullName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? '?';

  return (
    <>
      {/* Floating pill navbar */}
      <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-inner">

          {/* LEFT: Logo */}
          <Link to="/" className="navbar-logo" onClick={closeMenu}>
            <div className="logo-mark">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2L18 6.5V13.5L10 18L2 13.5V6.5L10 2Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <path d="M7 10h2.5m0 0V8m0 2V12m0-2H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="logo-text">Fintech<em>Hub</em></span>
          </Link>

          {/* CENTER: Nav links with gliding pill */}
          <div className="nav-links-wrap" ref={navRef}>
            {activeRect && (
              <span
                className="nav-pill-indicator"
                style={{
                  left: activeRect.left,
                  width: activeRect.width,
                  transition: isReady ? undefined : 'none',
                }}
              />
            )}
            <NavLink to="/startups" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={closeMenu}>
              <span className="nav-link-icon">◈</span>
              Стартапы
            </NavLink>

            {user?.role === 'founder' && (
              <NavLink to="/my-startups" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={closeMenu}>
                <span className="nav-link-icon">⬡</span>
                Мои стартапы
              </NavLink>
            )}

            {user?.role === 'investor' && (
              <NavLink to="/my-investments" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={closeMenu}>
                <span className="nav-link-icon">◇</span>
                Мои инвестиции
              </NavLink>
            )}

            <NavLink to="/profile" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={closeMenu}>
              <span className="nav-link-icon">○</span>
              Профиль
            </NavLink>
          </div>

          {/* RIGHT: Auth */}
          <div className="navbar-right">
            {user ? (
              <div className="user-cluster">
                <div className="user-avatar" title={user.fullName || user.email}>
                  {initials}
                  <span className="avatar-ring" />
                </div>
                <div className="user-info">
                  <span className="user-name">{user.fullName || user.email}</span>
                  <span className="user-role">{user.role === 'founder' ? 'Founder' : 'Investor'}</span>
                </div>
                <button onClick={handleLogout} className="btn-logout" title="Выйти">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M11 11l3-3-3-3M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn-login" onClick={closeMenu}>
                <span>Кіру</span>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            )}

            {/* Mobile toggle */}
            <button
              className={`navbar-toggle ${isMenuOpen ? 'open' : ''}`}
              onClick={() => setIsMenuOpen(v => !v)}
              aria-label="Toggle menu"
            >
              <div className="toggle-lines">
                <span /><span /><span />
              </div>
            </button>
          </div>

        </div>
      </header>

      {/* Mobile fullscreen overlay */}
      <div className={`mobile-overlay ${isMenuOpen ? 'open' : ''}`} onClick={closeMenu} />
      <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-header">
          <span className="mobile-menu-title">Меню</span>
          <button className="mobile-close" onClick={closeMenu}>✕</button>
        </div>

        <nav className="mobile-nav">
          <NavLink to="/startups" className={({ isActive }) => `mobile-link${isActive ? ' active' : ''}`} onClick={closeMenu}>
            <span className="mobile-link-num">01</span>
            <span>Стартаптар</span>
            <span className="mobile-link-arrow">→</span>
          </NavLink>
          {user?.role === 'founder' && (
            <NavLink to="/my-startups" className={({ isActive }) => `mobile-link${isActive ? ' active' : ''}`} onClick={closeMenu}>
              <span className="mobile-link-num">02</span>
              <span>Мои стартапы</span>
              <span className="mobile-link-arrow">→</span>
            </NavLink>
          )}
          {user?.role === 'investor' && (
            <NavLink to="/my-investments" className={({ isActive }) => `mobile-link${isActive ? ' active' : ''}`} onClick={closeMenu}>
              <span className="mobile-link-num">02</span>
              <span>Мои инвестиции</span>
              <span className="mobile-link-arrow">→</span>
            </NavLink>
          )}
          <NavLink to="/profile" className={({ isActive }) => `mobile-link${isActive ? ' active' : ''}`} onClick={closeMenu}>
            <span className="mobile-link-num">03</span>
            <span>Профиль</span>
            <span className="mobile-link-arrow">→</span>
          </NavLink>
        </nav>

        <div className="mobile-footer">
          {user ? (
            <>
              <div className="mobile-user">
                <div className="user-avatar large">{initials}<span className="avatar-ring" /></div>
                <div>
                  <div className="user-name">{user.fullName || user.email}</div>
                  <div className="user-role">{user.role === 'founder' ? 'Founder' : 'Investor'}</div>
                </div>
              </div>
              <button onClick={handleLogout} className="mobile-logout">Шығу</button>
            </>
          ) : (
            <Link to="/login" className="btn-login full" onClick={closeMenu}>
              <span>Кіру</span>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          )}
        </div>
      </div>
    </>
  );
}