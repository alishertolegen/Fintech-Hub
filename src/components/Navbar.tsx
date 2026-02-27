// src/components/Navbar.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Rocket,
  Briefcase,
  TrendingUp,
  User,
  LogOut,
  ArrowRight,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname]);

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
      <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-inner">

          {/* LEFT: Logo */}
          <Link to="/" className="navbar-logo" onClick={closeMenu}>
            <div className="logo-mark">
              <img src="/logo_fintech_transparent.png" alt="logo" />
            </div>
            <span className="logo-text">Fintech<em>Hub</em></span>
          </Link>

          {/* CENTER: Nav links */}
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
              <Rocket size={15} strokeWidth={2} className="nav-icon" />
              Стартапы
            </NavLink>

            {user?.role === 'founder' && (
              <NavLink to="/my-startups" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={closeMenu}>
                <Briefcase size={15} strokeWidth={2} className="nav-icon" />
                Мои стартапы
              </NavLink>
            )}

            {user?.role === 'investor' && (
              <NavLink to="/my-investments" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={closeMenu}>
                <TrendingUp size={15} strokeWidth={2} className="nav-icon" />
                Мои инвестиции
              </NavLink>
            )}

            <NavLink to="/profile" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={closeMenu}>
              <User size={15} strokeWidth={2} className="nav-icon" />
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
                  <span className="user-role">
                    <Sparkles size={9} strokeWidth={2.5} />
                    {user.role === 'founder' ? 'Founder' : 'Investor'}
                  </span>
                </div>
                <button onClick={handleLogout} className="btn-logout" title="Выйти">
                  <LogOut size={15} strokeWidth={1.8} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn-login" onClick={closeMenu}>
                <span>Кіру</span>
                <ArrowRight size={14} strokeWidth={2} />
              </Link>
            )}

            <button
              className={`navbar-toggle ${isMenuOpen ? 'open' : ''}`}
              onClick={() => setIsMenuOpen(v => !v)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={18} strokeWidth={2} /> : <Menu size={18} strokeWidth={2} />}
            </button>
          </div>

        </div>
      </header>

      {/* Mobile overlay */}
      <div className={`mobile-overlay ${isMenuOpen ? 'open' : ''}`} onClick={closeMenu} />
      <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
        <div className="mobile-drag-handle" />

        <div className="mobile-menu-header">
          <span className="mobile-menu-title">Меню</span>
          <button className="mobile-close" onClick={closeMenu}><X size={16} /></button>
        </div>

        <nav className="mobile-nav">
          <NavLink to="/startups" className={({ isActive }) => `mobile-link${isActive ? ' active' : ''}`} onClick={closeMenu}>
            <span className="mobile-link-icon"><Rocket size={18} strokeWidth={1.8} /></span>
            <span className="mobile-link-label">Стартаптар</span>
            <ArrowRight size={14} className="mobile-link-arrow" />
          </NavLink>

          {user?.role === 'founder' && (
            <NavLink to="/my-startups" className={({ isActive }) => `mobile-link${isActive ? ' active' : ''}`} onClick={closeMenu}>
              <span className="mobile-link-icon"><Briefcase size={18} strokeWidth={1.8} /></span>
              <span className="mobile-link-label">Мои стартапы</span>
              <ArrowRight size={14} className="mobile-link-arrow" />
            </NavLink>
          )}

          {user?.role === 'investor' && (
            <NavLink to="/my-investments" className={({ isActive }) => `mobile-link${isActive ? ' active' : ''}`} onClick={closeMenu}>
              <span className="mobile-link-icon"><TrendingUp size={18} strokeWidth={1.8} /></span>
              <span className="mobile-link-label">Мои инвестиции</span>
              <ArrowRight size={14} className="mobile-link-arrow" />
            </NavLink>
          )}

          <NavLink to="/profile" className={({ isActive }) => `mobile-link${isActive ? ' active' : ''}`} onClick={closeMenu}>
            <span className="mobile-link-icon"><User size={18} strokeWidth={1.8} /></span>
            <span className="mobile-link-label">Профиль</span>
            <ArrowRight size={14} className="mobile-link-arrow" />
          </NavLink>
        </nav>

        <div className="mobile-footer">
          {user ? (
            <>
              <div className="mobile-user">
                <div className="user-avatar large">{initials}<span className="avatar-ring" /></div>
                <div>
                  <div className="user-name">{user.fullName || user.email}</div>
                  <div className="user-role">
                    <Sparkles size={9} strokeWidth={2.5} />
                    {user.role === 'founder' ? 'Founder' : 'Investor'}
                  </div>
                </div>
              </div>
              <button onClick={handleLogout} className="mobile-logout">
                <LogOut size={15} strokeWidth={1.8} />
                Шығу
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-login full" onClick={closeMenu}>
              <span>Кіру</span>
              <ArrowRight size={14} strokeWidth={2} />
            </Link>
          )}
        </div>
      </div>
    </>
  );
}