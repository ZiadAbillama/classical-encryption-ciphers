import React, { useState } from 'react';
import { User, Lock, Mail, Eye, EyeOff, Shield, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSignup = () => {
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    if (!agreedToTerms) {
      alert('Please agree to the terms and conditions');
      return;
    }

    setIsLoading(true);
    
    setTimeout(() => {
      login({
        name: formData.name,
        email: formData.email,
        avatar: null,
        joinDate: new Date().toLocaleDateString()
      });
      setIsLoading(false);
      navigate('/');
    }, 2000);
  };

  const passwordStrength = (password) => {
    if (password.length === 0) return { strength: 0, text: '', color: '' };
    if (password.length < 6) return { strength: 25, text: 'Weak', color: 'bg-red-500' };
    if (password.length < 10) return { strength: 50, text: 'Fair', color: 'bg-amber-500' };
    if (password.length < 14) return { strength: 75, text: 'Good', color: 'bg-green-500' };
    return { strength: 100, text: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = passwordStrength(formData.password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl opacity-20 -top-48 -right-48 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl opacity-20 top-1/2 left-0 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute w-96 h-96 bg-pink-500/20 rounded-full blur-3xl opacity-20 bottom-0 right-1/3 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="absolute inset-0 pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-purple-400 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      <div className="relative w-full max-w-md">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-700 rounded-3xl blur-xl opacity-30"></div>
        
        <div className="relative bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-700 rounded-2xl blur-lg opacity-75"></div>
              <div className="relative bg-gradient-to-r from-purple-600 to-pink-700 p-4 rounded-2xl">
                <Shield className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-black text-white mb-2">Create Account</h1>
            <p className="text-slate-400">Join CryptoLab and start learning</p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-slate-900/50 border-2 border-slate-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-slate-900/50 border-2 border-slate-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-slate-900/50 border-2 border-slate-700 rounded-xl pl-12 pr-12 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all"
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
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-400">Password strength:</span>
                    <span className={`font-semibold ${strength.text === 'Weak' ? 'text-red-400' : strength.text === 'Fair' ? 'text-amber-400' : 'text-green-400'}`}>
                      {strength.text}
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className={`h-2 rounded-full ${strength.color} transition-all duration-300`} style={{width: `${strength.strength}%`}}></div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full bg-slate-900/50 border-2 border-slate-700 rounded-xl pl-12 pr-12 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formData.confirmPassword && (
                <div className="flex items-center space-x-2 mt-2 text-xs">
                  {formData.password === formData.confirmPassword ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-green-400">Passwords match</span>
                    </>
                  ) : (
                    <>
                      <span className="w-4 h-4 text-red-500">✗</span>
                      <span className="text-red-400">Passwords don't match</span>
                    </>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="flex items-start space-x-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="w-5 h-5 mt-0.5 rounded border-slate-700 bg-slate-900 flex-shrink-0" 
                />
                <span className="text-slate-400 text-sm">
                  I agree to the{' '}
                  <button type="button" className="text-purple-400 hover:text-purple-300 transition-colors">Terms & Conditions</button>
                  {' '}and{' '}
                  <button type="button" className="text-purple-400 hover:text-purple-300 transition-colors">Privacy Policy</button>
                </span>
              </label>
            </div>

            <button
              onClick={handleSignup}
              disabled={isLoading || !agreedToTerms}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-700 hover:from-purple-500 hover:to-pink-600 text-white font-bold py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl hover:shadow-purple-500/50 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-800 text-slate-400">OR</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <button className="flex items-center justify-center space-x-2 bg-slate-900/50 border-2 border-slate-700 rounded-xl py-3 text-slate-300 hover:border-slate-600 transition-all">
              <span className="text-2xl">G</span>
              <span>Google</span>
            </button>
            <button className="flex items-center justify-center space-x-2 bg-slate-900/50 border-2 border-slate-700 rounded-xl py-3 text-slate-300 hover:border-slate-600 transition-all">
              <span className="text-2xl">⚫</span>
              <span>GitHub</span>
            </button>
          </div>

          <div className="text-center">
            <p className="text-slate-400">
              Already have an account?{' '}
              <button onClick={() => navigate('/login')} className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SignupPage;