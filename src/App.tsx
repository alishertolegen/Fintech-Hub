import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import StartupList from './components/StartupList';
import Profile from './components/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import StartupPage from './pages/StartupPage';
import { ProtectedRoute } from './auth/ProtectedRoute';
import MyStartupsPage from './pages/MyStartupsPage';
import CreateStartup from './pages/CreateStartup';
import MyInvestmentsPage from './pages/MyInvestmentsPage';
import './App.css';

function App() {
  const location = useLocation();

  // Скрываем Navbar и main-content на страницах логина и регистрации
  const isAuthPage =
    location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="app-container">
      {!isAuthPage && <Navbar />}

      {isAuthPage ? (
        // Для страниц авторизации - без обёртки main-content
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      ) : (
        // Для остальных страниц - с обёрткой main-content
        <main className="main-content">
          <Routes>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/startups"
              element={
                <ProtectedRoute>
                  <StartupList />
                </ProtectedRoute>
              }
            />
            <Route path="/startups/:slug" element={<StartupPage />} />
            <Route path="/my-startups" element={<MyStartupsPage />} />
            
            <Route
              path="/my-investments"
              element={
                <ProtectedRoute>
                  <MyInvestmentsPage />
                </ProtectedRoute>
              }
            />

            <Route path="/startups/create" element={<CreateStartup />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      )}
    </div>
  );
}

export default App;