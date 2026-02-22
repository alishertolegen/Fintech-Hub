// src/components/Navbar.tsx
import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Close drawer on outside click / Escape
  useEffect(() => {
    if (!isMenuOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isMenuOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-container">

        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          <span className="logo-icon">₸</span>
          <span className="logo-text">Fintech Hub</span>
        </Link>

        {/* Hamburger (mobile only) */}
        <button
          className={`navbar-toggle ${isMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMenuOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          <span />
          <span />
          <span />
        </button>

        {/* Nav */}
        <nav className={`navbar-nav ${isMenuOpen ? 'active' : ''}`} role="navigation">

          <NavLink
            to="/startups"
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            onClick={closeMenu}
          >
            Стартаптар
          </NavLink>

          {user?.role === 'founder' && (
            <NavLink
              to="/my-startups"
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              onClick={closeMenu}
            >
              Мои стартапы
            </NavLink>
          )}

          {user?.role === 'investor' && (
            <NavLink
              to="/my-investments"
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              onClick={closeMenu}
            >
              Мои инвестиции
            </NavLink>
          )}

          <NavLink
            to="/profile"
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            onClick={closeMenu}
          >
            Профиль
          </NavLink>

          {/* Auth actions */}
          <div className="navbar-actions">
            {user ? (
              <>
                <span className="user-name" title={user.fullName || user.email}>
                  {user.fullName || user.email}
                </span>
                <button onClick={handleLogout} className="btn-logout">
                  Шығу
                </button>
              </>
            ) : (
              <Link to="/login" className="btn-login" onClick={closeMenu}>
                Кіру
              </Link>
            )}
          </div>
        </nav>

      </div>
    </header>
  );
}