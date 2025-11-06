import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate(); // 👈 добавили хук

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();     
    closeMenu();     
    navigate('/login'); 
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          <span className="logo-icon">₸</span>
          <span className="logo-text">Fintech Hub</span>
        </Link>

        <button 
          className={`navbar-toggle ${isMenuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav className={`navbar-nav ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/startups" className="nav-link" onClick={closeMenu}>
            Стартаптар
          </Link>

          {user?.role === 'founder' && (
            <Link to="/my-startups" className="nav-link" onClick={closeMenu}>
              Мои стартапы
            </Link>
          )}
          
          {user?.role === 'investor' && (
            <Link to="/my-investments" className="nav-link" onClick={closeMenu}>
              Мои инвестиции
            </Link>
          )}

          <Link to="/profile" className="nav-link" onClick={closeMenu}>
            Профиль
          </Link>

          <div className="navbar-actions">
            {user ? (
              <>
                <span className="user-name">{user.fullName || user.email}</span>
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
