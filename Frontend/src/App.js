import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import HomePage from './pages/HomePage';
import CipherLabPage from './pages/CipherLabPage';
import MissionsPage from './pages/MissionsPage';
import ProfilePage from './pages/ProfilePage';

// Protected Route Component using useAuth
const ProtectedRoute = ({ element }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl font-bold">Loading...</div>
      </div>
    );
  }
  
  return user ? element : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/" element={<ProtectedRoute element={<HomePage />} />} />
            <Route path="/cipherlab" element={<ProtectedRoute element={<CipherLabPage />} />} />
            <Route path="/missions" element={<ProtectedRoute element={<MissionsPage />} />} />
            <Route path="/profile" element={<ProtectedRoute element={<ProfilePage />} />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;