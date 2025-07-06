import { useState, useEffect, useRef, lazy, Suspense, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import React from "react";
import { TripsProvider } from "./context/TripsContext";
import AllTrips from "./components/AllTrips";
import LeaderboardPage from './components/LeaderboardPage';
import AdminRoutes from "./routes/AdminRoutes";
import ErrorBoundary from './components/ErrorBoundary';

// Lazy loaded components
const Landing = lazy(() => import('./components/Landing'));
const Login = lazy(() => import('./components/login'));
const SignUp = lazy(() => import('./components/SignUp'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const Profile = lazy(() => import('./components/Profile'));
const Loading = lazy(() => import('./components/Loading'));
const OAuthSuccess = lazy(() => import('./components/OAuthSuccess'));
const OAuthError = lazy(() => import('./components/OAuthError'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const TermsAndConditions = lazy(() => import('./components/TermsAndConditions'));
const AboutUs = lazy(() => import('./components/AboutUs'));


const STORAGE_KEYS = {
  DARK_MODE: 'darkMode',
  AUTH_TOKEN: 'authToken',
  USER: 'user',
};

const useLocalStorage = (key, defaultValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  return token ? children : <Navigate to="/login" replace />;
};

// Public Route Component
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  return !token ? children : <Navigate to="/dashboard" replace />;
};

// 🔐 ADMIN ROUTE COMPONENT - Protects admin routes
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Wrapper for Login Page
const LoginWrapper = ({ handleAuthSuccess }) => {
  const navigate = useNavigate();

  return (
      <Login
        onLoginSuccess={handleAuthSuccess}
        onSignUpClick={() => navigate('/signup')}
        onBackToLanding={() => navigate('/')}
      />
  );
};

// Wrapper for SignUp Page
const SignUpWrapper = ({ handleAuthSuccess }) => {
  const navigate = useNavigate();

  return (
      <SignUp
        onSignUpSuccess={handleAuthSuccess}
        onLoginClick={() => navigate('/login')}
        onBackToLanding={() => navigate('/')}
      />
  );
};

const App = () => {
  const hasTransitioned = useRef(false);
  const [darkMode, setDarkMode] = useLocalStorage(STORAGE_KEYS.DARK_MODE, true);
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const handleAuthSuccess = useCallback(() => {
    setIsLoggedIn(true);
    navigate('/dashboard', { replace: true });
  }, [navigate]);

  const handleLogout = useCallback(() => {
    setIsLoggedIn(false);
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem('isAdmin'); // 🔐 Clear admin status on logout
    navigate('/login', { replace: true });
  }, [navigate]);

  const currentUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER));

  return (
    <Suspense fallback={<Loading onLoadingComplete={() => {}} />}>
      <ErrorBoundary fallback={<div className="error-page">Something went wrong. Please refresh the page.</div>}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<LoginWrapper handleAuthSuccess={handleAuthSuccess} />} />
          <Route path="/signup" element={<SignUpWrapper handleAuthSuccess={handleAuthSuccess} />} />
          <Route path="/oauth-success" element={<OAuthSuccess />} />
          <Route path="/oauth-error" element={<OAuthError />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard
                  onLogout={handleLogout}
                  currentUser={currentUser}
                  darkMode={darkMode}
                  setDarkMode={setDarkMode}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={<Profile currentUser={currentUser} />}
          />
          <Route path="/all-trips" element={<AllTrips currentUser={currentUser} />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          {/* 🔐 ADMIN DASHBOARD ROUTE */}
          <Route
            path="/admin/*"
            element={
              <AdminRoute>
                <AdminRoutes />
              </AdminRoute>
            }
          />
          {/* Redirect unknown routes to landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ErrorBoundary>
    </Suspense>
  );
};

export default function AppWrapper() {
  return (
    <BrowserRouter>
      <TripsProvider>
        <App />
      </TripsProvider>
    </BrowserRouter>
  );
}
