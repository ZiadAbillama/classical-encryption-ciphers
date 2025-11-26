// Frontend/src/pages/HomePage.js
import React, { useState, useEffect } from 'react';
import {
  Shield,
  Lock,
  Target,
  Award,
  Flame,
  Crown,
  Trophy,
  Sun,
  Moon,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Helper for Authorization header
function authHeaders() {
  const t = localStorage.getItem('auth_token');
  return t ? { Authorization: `Bearer ${t}` } : {};
}

const HomePage = () => {
  const { user, updateUser, logout, loading } = useAuth();
  const { theme, currentTheme, toggleTheme } = useTheme(); 
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // FETCH FRESH USER DATA ON PAGE LOAD (same as ProfilePage)
  useEffect(() => {
    const fetchFresh = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/users/me`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders(),
          },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to refresh profile");

        updateUser({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          avatar: data.user.avatarUrl ?? null,
          joinDate: data.user.createdAt,
          token: localStorage.getItem("auth_token"),
          stats: data.user.stats || {}
        });

      } catch (err) {
        console.error("HomePage refresh failed:", err);
      }
    };

    if (user) {
      fetchFresh();
    }
  }, []); 

  // Loading
  if (loading) return null;

  // Not logged in
  if (!user) {
    navigate('/login');
    return null;
  }

  // Safe stats fallback
  const stats = {
    points: 0,
    level: 1,
    combo: 0,
    bestCombo: 0,
    totalEncryptions: 0,
    totalDecryptions: 0,
    experiencedCiphers: [],
    completedChallenges: [],
    ...(user.stats || {}),
  };

  // Achievement scoring (same logic as ProfilePage)
  const achievementList = [
    {
      id: 'first_steps',
      unlocked: (stats.totalEncryptions + stats.totalDecryptions) > 0,
    },
    {
      id: 'combo_master',
      unlocked: stats.bestCombo >= 5,
    },
    {
      id: 'balanced_operator',
      unlocked: stats.totalEncryptions >= 5 && stats.totalDecryptions >= 5,
    },
    {
      id: 'rising_star',
      unlocked: stats.level >= 5,
    },
  ];

  const achievementsUnlocked = achievementList.filter(a => a.unlocked).length;

  // Missions completed
  const missionsCompleted = stats.completedChallenges?.length || 0;

  // Profile dropdown UI
  const ProfileMenu = () => (
    <div className="absolute top-16 right-4 z-50 w-80">
      <div
        className={`${currentTheme.card} backdrop-blur-xl border ${currentTheme.cardBorder} rounded-2xl shadow-2xl overflow-hidden`}
      >
        <div
          className={`bg-gradient-to-r ${
            theme === 'dark'
              ? 'from-cyan-600 to-purple-700'
              : 'from-cyan-500 to-purple-600'
          } p-6`}
        >
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl font-bold text-purple-600">
              {(user.avatar || user.avatarUrl) ?? user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-white font-bold text-lg">{user.name}</div>
              <div className="text-white/80 text-sm">{user.email}</div>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-2">
          <button
            onClick={() => {
              navigate('/profile');
              setShowProfileMenu(false);
            }}
            className={`w-full flex items-center space-x-3 px-4 py-3 ${currentTheme.cardHover} rounded-xl transition-all ${currentTheme.text}`}
          >
            <Award className="w-5 h-5" />
            <span className="font-medium">Your Profile</span>
          </button>

          <div className={`border-t ${currentTheme.cardBorder} my-2`} />

          <button
            onClick={() => {
              logout();
              navigate('/login');
              setShowProfileMenu(false);
            }}
            className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-red-500/10 rounded-xl transition-all text-red-500"
          >
            <span className="text-xl">→</span>
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${currentTheme.bg} relative overflow-hidden`}>

      {/* GLOW BACKGROUND */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute w-96 h-96 ${currentTheme.glowColors?.[0] || 'bg-blue-500/20'} rounded-full ${currentTheme.glow} -top-48 -left-48 animate-pulse`}
        />
        <div
          className={`absolute w-96 h-96 ${currentTheme.glowColors?.[1] || 'bg-purple-500/20'} rounded-full ${currentTheme.glow} top-1/2 right-0 animate-pulse`}
          style={{ animationDelay: '1s' }}
        />
        <div
          className={`absolute w-96 h-96 ${currentTheme.glowColors?.[2] || 'bg-cyan-500/20'} rounded-full ${currentTheme.glow} bottom-0 left-1/3 animate-pulse`}
          style={{ animationDelay: '2s' }}
        />
      </div>

      {/* HEADER */}
      <header
        className={`relative backdrop-blur-xl ${currentTheme.header} border-b ${currentTheme.cardBorder}`}
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">

            {/* LOGO */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div
                  className={`absolute inset-0 ${
                    theme === 'dark'
                      ? 'bg-gradient-to-r from-cyan-600 to-purple-700'
                      : 'bg-gradient-to-r from-cyan-500 to-purple-600'
                  } rounded-xl blur-lg opacity-75`}
                />
                <div
                  className={`relative ${
                    theme === 'dark'
                      ? 'bg-gradient-to-r from-cyan-600 to-purple-700'
                      : 'bg-gradient-to-r from-cyan-500 to-purple-600'
                  } p-2 rounded-xl`}
                >
                  <Shield className="w-8 h-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className={`${currentTheme.text} font-bold text-xl`}>
                  CRYPTOLAB
                </h1>
                <p className={`text-xs ${currentTheme.textMuted}`}>
                  Classical Cipher Mastery
                </p>
              </div>
            </div>

            {/* RIGHT SIDE ICONS */}
            <div className="flex items-center space-x-3">

              {/* THEME SWITCH */}
              <button
                onClick={toggleTheme}
                className={`p-2 ${
                  theme === 'dark'
                    ? 'bg-slate-700 hover:bg-slate-600'
                    : 'bg-white hover:bg-slate-100'
                } ${currentTheme.cardBorder} border rounded-xl transition-all`}
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-amber-400" />
                ) : (
                  <Moon className="w-5 h-5 text-slate-700" />
                )}
              </button>

              {/* COMBO */}
              {stats.combo > 0 && (
                <div
                  className={`flex items-center px-4 py-2 border rounded-full ${
                    theme === 'dark'
                      ? 'bg-orange-500/20 border-orange-500/40'
                      : 'bg-orange-100 border-orange-300'
                  }`}
                >
                  <Flame
                    className={`w-4 h-4 ${
                      theme === 'dark' ? 'text-orange-400' : 'text-orange-600'
                    }`}
                  />
                  <span className={`${currentTheme.text} font-bold ml-2`}>
                    {stats.combo}x
                  </span>
                </div>
              )}

              {/* LEVEL */}
              <div
                className={`flex items-center px-4 py-2 border rounded-full ${
                  theme === 'dark'
                    ? 'bg-purple-500/20 border-purple-500/40'
                    : 'bg-purple-100 border-purple-300'
                }`}
              >
                <Crown
                  className={`w-4 h-4 ${
                    theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
                  }`}
                />
                <span className={`${currentTheme.text} font-bold ml-2`}>
                  Lv.{stats.level}
                </span>
              </div>

              {/* POINTS */}
              <div
                className={`flex items-center px-4 py-2 border rounded-full ${
                  theme === 'dark'
                    ? 'bg-green-500/20 border-green-500/40'
                    : 'bg-green-100 border-green-300'
                }`}
              >
                <Trophy
                  className={`w-4 h-4 ${
                    theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
                  }`}
                />
                <span className={`${currentTheme.text} font-bold ml-2`}>
                  {stats.points}
                </span>
              </div>

              {/* PROFILE BUTTON */}
              <button
                onClick={() => setShowProfileMenu(v => !v)}
                className={`relative flex items-center space-x-2 px-3 py-2 ${
                  theme === 'dark'
                    ? 'bg-slate-700 hover:bg-slate-600'
                    : 'bg-white hover:bg-slate-100'
                } ${currentTheme.cardBorder} border rounded-xl transition-all`}
              >
                <div className="w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {(user.avatar || user.avatarUrl) ??
                    user.name.charAt(0).toUpperCase()}
                </div>
                <span className={`${currentTheme.text} font-medium hidden md:block`}>
                  {user.name}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-6xl md:text-7xl font-black mb-6">
            <span className={currentTheme.text}>MASTER</span>
            <br />
            <span className={currentTheme.text}>THE ART OF</span>
            <br />
            <span className={currentTheme.text}>ENCRYPTION</span>
          </h2>
          <p
            className={`text-xl ${currentTheme.textMuted} max-w-2xl mx-auto`}
          >
            Unlock the secrets of classical cryptography through gamified learning
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <button
            onClick={() => navigate('/cipherlab')}
            className={`group relative ${currentTheme.card} backdrop-blur-xl border ${currentTheme.cardBorder} rounded-2xl p-8 hover:scale-105 transition-all duration-300 shadow-lg ${currentTheme.cardHover || ''}`}
          >
            <div className="relative flex flex-col items-center text-center">
              <div
                className={`w-16 h-16 ${
                  theme === 'dark'
                    ? 'bg-gradient-to-br from-cyan-600 to-blue-700'
                    : 'bg-gradient-to-br from-cyan-500 to-blue-600'
                } rounded-2xl flex items-center justify-center mb-4`}
              >
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h3 className={`text-2xl font-bold ${currentTheme.text} mb-2`}>
                Cipher Lab
              </h3>
              <p className={currentTheme.textMuted}>
                Master 6 classical encryption techniques
              </p>
            </div>
          </button>

          <button
            onClick={() => navigate('/missions')}
            className={`group relative ${currentTheme.card} backdrop-blur-xl border ${currentTheme.cardBorder} rounded-2xl p-8 hover:scale-105 transition-all duration-300 shadow-lg ${currentTheme.cardHover || ''}`}
          >
            <div className="relative flex flex-col items-center text-center">
              <div
                className={`w-16 h-16 ${
                  theme === 'dark'
                    ? 'bg-gradient-to-br from-purple-600 to-pink-700'
                    : 'bg-gradient-to-br from-purple-500 to-pink-600'
                } rounded-2xl flex items-center justify-center mb-4`}
              >
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className={`text-2xl font-bold ${currentTheme.text} mb-2`}>
                Missions
              </h3>
              <p className={currentTheme.textMuted}>
                Complete challenges and earn rewards
              </p>
            </div>
          </button>

          <button
            onClick={() => navigate('/profile')}
            className={`group relative ${currentTheme.card} backdrop-blur-xl border ${currentTheme.cardBorder} rounded-2xl p-8 hover:scale-105 transition-all duration-300 shadow-lg ${currentTheme.cardHover || ''}`}
          >
            <div className="relative flex flex-col items-center text-center">
              <div
                className={`w-16 h-16 ${
                  theme === 'dark'
                    ? 'bg-gradient-to-br from-green-600 to-teal-700'
                    : 'bg-gradient-to-br from-green-500 to-teal-600'
                } rounded-2xl flex items-center justify-center mb-4`}
              >
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className={`text-2xl font-bold ${currentTheme.text} mb-2`}>
                Profile
              </h3>
              <p className={currentTheme.textMuted}>
                Track your crypto journey
              </p>
            </div>
          </button>
        </div>

        {/* Learn Ciphers Banner */}
        <div 
          onClick={() => navigate('/cipher-info')}
          className={`group relative ${currentTheme.card} backdrop-blur-xl border ${currentTheme.cardBorder} rounded-2xl p-6 mb-16 hover:scale-[1.02] transition-all duration-300 shadow-lg cursor-pointer ${currentTheme.cardHover || ''}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div
                className={`w-14 h-14 ${
                  theme === 'dark'
                    ? 'bg-gradient-to-br from-amber-600 to-orange-700'
                    : 'bg-gradient-to-br from-amber-500 to-orange-600'
                } rounded-xl flex items-center justify-center`}
              >
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className={`text-xl font-bold ${currentTheme.text}`}>
                  📚 Cipher Encyclopedia
                </h3>
                <p className={`${currentTheme.textMuted} text-sm`}>
                  Learn the theory behind each cipher with step-by-step explanations, examples, and mathematical foundations
                </p>
              </div>
            </div>
            <div className={`hidden md:block px-4 py-2 ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-amber-600 to-orange-700'
                : 'bg-gradient-to-r from-amber-500 to-orange-600'
            } text-white font-bold rounded-lg group-hover:shadow-lg transition-all`}>
              Learn More →
            </div>
          </div>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            theme={theme}
            currentTheme={currentTheme}
            label="Encryptions"
            value={stats.totalEncryptions}
            colorFrom="from-cyan-400"
            colorTo="to-blue-400"
          />

          <StatCard
            theme={theme}
            currentTheme={currentTheme}
            label="Decryptions"
            value={stats.totalDecryptions}
            colorFrom="from-purple-400"
            colorTo="to-pink-400"
          />

          <StatCard
            theme={theme}
            currentTheme={currentTheme}
            label="Missions"
            value={missionsCompleted}
            colorFrom="from-green-400"
            colorTo="to-teal-400"
          />

          <StatCard
            theme={theme}
            currentTheme={currentTheme}
            label="Achievements"
            value={achievementsUnlocked}
            colorFrom="from-amber-400"
            colorTo="to-orange-400"
          />
        </div>
      </div>

      {/* Profile Menu */}
      {showProfileMenu && <ProfileMenu />}
      {showProfileMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowProfileMenu(false)}
        />
      )}
    </div>
  );
};

const StatCard = ({ theme, currentTheme, label, value, colorFrom, colorTo }) => {
  return (
    <div
      className={`backdrop-blur-xl ${currentTheme.card} border ${currentTheme.cardBorder} rounded-2xl p-6 shadow-lg ${currentTheme.cardHover || ''}`}
    >
      <div
        className={`text-4xl font-black bg-gradient-to-r ${colorFrom} ${colorTo} bg-clip-text text-transparent`}
      >
        {value}
      </div>
      <div className={`${currentTheme.textMuted} text-sm mt-1`}>
        {label}
      </div>
    </div>
  );
};

export default HomePage;