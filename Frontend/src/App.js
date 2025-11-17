import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import HomePage from "./pages/HomePage";
import CipherLabPage from "./pages/CipherLabPage";
import MissionsPage from "./pages/MissionsPage";
import ProfilePage from "./pages/ProfilePage";
import OAuthCallbackPage from "./pages/OAuthCallbackPage";
import MissionAttemptPage from './pages/MissionAttemptPage';

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