import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import StartupList from './components/StartupList';
import Profile from './components/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import StartupPage from './pages/StartupPage.tsx';
import { ProtectedRoute } from './auth/ProtectedRoute.tsx';

function App() {
  const location = useLocation();

  // Скрываем Navbar на страницах логина и регистрации
  const hideNavbar =
    location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {!hideNavbar && <Navbar />}

      <main className="flex-1 p-6 md:p-10">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
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
          <Route path="/startups/:slug" element={<StartupPage/>} />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
