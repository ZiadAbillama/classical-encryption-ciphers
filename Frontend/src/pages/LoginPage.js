// Frontend/src/pages/LoginPage.js
import React, { useState } from 'react';
import { Shield, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3000';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  // ===== HANDLE LOGIN =====
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const raw = await res.text();
      let data = {};

      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        throw new Error(`Server returned invalid JSON (${res.status})`);
      }

      if (!res.ok) {
        throw new Error(data?.error || 'Invalid credentials');
      }

      if (!data.user || !data.token) {
        throw new Error('Malformed server response: missing user or token');
      }

      // Store JWT
      localStorage.setItem('auth_token', data.token);

      // Push user into context
      login({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        avatar: data.user.avatarUrl || null,
        joinDate: data.user.createdAt || new Date().toISOString(),
        token: data.token,
        stats: data.user.stats || {
          points: 0,
          level: 1,
          combo: 0,
          bestCombo: 0,
          totalEncryptions: 0,
          totalDecryptions: 0,
          experiencedCiphers: [],
        },
      });

      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // REAL Google / GitHub login (redirect to backend)
  const handleSocialLogin = (provider) => {
    window.location.href = `${API_BASE}/api/auth/${provider}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background visual blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl opacity-20 -top-48 -left-48 animate-pulse" />
        <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl opacity-20 bottom-0 right-0 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl opacity-10 top-1/4 left-1/3 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative w-full max-w-md">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-purple-700 rounded-3xl blur-xl opacity-30" />

        <div className="relative bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-purple-700 rounded-2xl blur-lg opacity-75" />
              <div className="relative bg-gradient-to-r from-cyan-600 to-purple-700 p-4 rounded-2xl">
                <Shield className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-white mb-2">Welcome Back</h1>
            <p className="text-slate-300 text-sm">Sign in to continue your crypto journey</p>
          </div>

          {/* Errors */}
          {error && (
            <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 text-red-200 text-sm px-4 py-2">
              {error}
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200">Email Address</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900/50 border-2 border-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200">Password</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900/50 border-2 border-slate-700 rounded-xl pl-11 pr-11 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember / forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-700 bg-slate-900" />
                <span className="text-slate-400">Remember me</span>
              </label>
              <button type="button" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 text-white font-bold py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl hover:shadow-cyan-500/50 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 text-xs font-medium text-slate-400 bg-slate-800/80">
                OR CONTINUE WITH
              </span>
            </div>
          </div>

          {/* OAuth */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              type="button"
              onClick={() => handleSocialLogin('google')}
              className="flex items-center justify-center gap-3 py-3 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:border-slate-600 transition-all"
            >
              <span className="text-2xl">G</span>
              <span>Google</span>
            </button>

            <button
              type="button"
              onClick={() => handleSocialLogin('github')}
              className="flex items-center justify-center gap-3 py-3 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:border-slate-600 transition-all"
            >
              <span className="text-2xl">⚫</span>
              <span>GitHub</span>
            </button>
          </div>

          {/* Signup redirect */}
          <div className="text-center text-sm">
            <p className="text-slate-400">
              Don&apos;t have an account?{' '}
              <button
                onClick={() => navigate('/signup')}
                className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
              >
                Sign up now
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
