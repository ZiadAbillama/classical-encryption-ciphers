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
      let data;
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        throw new Error(`Server returned non-JSON (${res.status})`);
      }

      if (!res.ok) throw new Error(data?.error || 'Invalid credentials');
      if (!data?.user || !data?.token) throw new Error('Malformed response');

      // Save token
      localStorage.setItem('auth_token', data.token);

      // Update auth context
      login({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        avatar: data.user.avatarUrl ?? null,
        joinDate: data.user.createdAt ?? new Date().toISOString(),
        token: data.token,
      });

      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialClick = (provider) => {
    setError(
      `${provider} login is not available yet. Please use your email and password for now.`
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl opacity-20 -top-48 -left-48" />
        <div className="absolute w-96 h-96 bg-fuchsia-500/20 rounded-full blur-3xl opacity-20 -bottom-48 -right-48" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-slate-900/70 border border-slate-700 rounded-3xl shadow-2xl p-8 backdrop-blur-xl">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-cyan-500/40">
              <Shield className="w-9 h-9 text-white" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-4xl font-black text-white mb-2">Welcome Back</h1>
            <p className="text-slate-400">Sign in to continue your crypto journey</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-400 p-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-xl py-3 pl-11 pr-10 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember / Forgot */}
            <div className="flex items-center justify-between text-xs text-slate-400">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
                />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                className="text-cyan-400 hover:text-cyan-300"
                onClick={() => setError('Password reset is not implemented yet.')}
              >
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-fuchsia-500 hover:from-cyan-400 hover:to-fuchsia-400 text-white font-semibold py-3 rounded-xl shadow-lg shadow-cyan-500/40 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                'Signing in...'
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-slate-700" />
            <span className="px-3 text-xs uppercase tracking-wide text-slate-500">OR</span>
            <div className="flex-1 h-px bg-slate-700" />
          </div>

          {/* Social buttons */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              type="button"
              onClick={() => handleSocialClick('Google')}
              className="flex items-center justify-center gap-3 py-3 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:border-slate-600 transition-all"
            >
              <span className="text-2xl">G</span>
              <span>Google</span>
            </button>

            <button
              type="button"
              onClick={() => handleSocialClick('GitHub')}
              className="flex items-center justify-center gap-3 py-3 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:border-slate-600 transition-all"
            >
              <span className="text-2xl">⚫</span>
              <span>GitHub</span>
            </button>
          </div>

          {/* Switch to signup */}
          <div className="text-center text-sm">
            <p className="text-slate-400">
              Don&apos;t have an account?{' '}
              <button
                type="button"
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
