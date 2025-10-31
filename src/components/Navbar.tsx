import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header>
      <div>
        <Link to="/">Fintech Hub</Link>
        <nav>
          <Link to="/startups">Стартаптар</Link>
          {user && <Link to="/my-startups">Мои стартапы</Link>}
          <Link to="/profile">Профиль</Link>
          {user ? (
            <>
              <span>{user.fullName || user.email}</span>
              <button onClick={logout}>Шығу</button>
            </>
          ) : (
            <Link to="/login">Кіру</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
