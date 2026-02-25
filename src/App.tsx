// src/App.tsx
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import StartupList from './components/StartupList';
import Profile from './components/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import StartupPage from './pages/StartupPage';
import EditStartup from './pages/EditStartup';
import { ProtectedRoute } from './auth/ProtectedRoute';
import MyStartupsPage from './pages/MyStartupsPage';
import CreateStartup from './pages/CreateStartup';
import MyInvestmentsPage from './pages/MyInvestmentsPage';
import Footer from './components/Footer';
import './App.css';
import UserProfile from './components/UserProfile';
function App() {
  const location = useLocation();

  const isAuthPage =
    location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="app-container">
      {!isAuthPage && <Navbar />}

      {isAuthPage ? (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* если пользователь попал на любой другой путь в режиме auth — редиректим на /login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      ) : (
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

            {/* EDIT route must come before /startups/:slug */}
            <Route
              path="/startups/edit/:id"
              element={
                <ProtectedRoute>
                  <EditStartup />
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

            <Route
              path="/startups/create"
              element={
                <ProtectedRoute>
                  <CreateStartup />
                </ProtectedRoute>
              }
            />
<Route path="/users/:id" element={<UserProfile/>} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      )}

      {/* footer показываем только на не-auth страницах */}
      {!isAuthPage && <Footer />}
    </div>
  );
}

export default App;