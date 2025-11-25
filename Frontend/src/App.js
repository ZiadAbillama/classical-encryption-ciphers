// Frontend/src/App.js
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";

import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import HomePage from "./pages/HomePage";
import CipherLabPage from "./pages/CipherLabPage";
import CipherInfoPage from "./pages/CipherInfoPage";
import MissionsPage from "./pages/MissionsPage";
import MissionAttemptPage from "./pages/MissionAttemptPage";
import ProfilePage from "./pages/ProfilePage";
import OAuthCallbackPage from "./pages/OAuthCallbackPage";

// Protected Route Component using useAuth
const ProtectedRoute = ({ element }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Loading your workspace…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return element;
};

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* OAuth callback (public, used after Google/GitHub redirect) */}
            <Route path="/oauth/callback" element={<OAuthCallbackPage />} />

            {/* Protected routes */}
            <Route path="/" element={<ProtectedRoute element={<HomePage />} />} />
            <Route
              path="/cipherlab"
              element={<ProtectedRoute element={<CipherLabPage />} />}
            />
            <Route
              path="/cipher-info"
              element={<ProtectedRoute element={<CipherInfoPage />} />}
            />
            <Route
              path="/missions"
              element={<ProtectedRoute element={<MissionsPage />} />}
            />
            <Route
              path="/mission-attempt"
              element={<ProtectedRoute element={<MissionAttemptPage />} />}
            />
            <Route
              path="/profile"
              element={<ProtectedRoute element={<ProfilePage />} />}
            />

            {/* Fallback: go home (will redirect to login if not authed) */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;

