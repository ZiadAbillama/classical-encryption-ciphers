import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Unlock, Star, Target, Award, Flame, Crown, Trophy, Sun, Moon, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const ProfilePage = () => {
  const { user, updateUser, logout } = useAuth();
  const { theme, currentTheme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editEmail, setEditEmail] = useState(user.email);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const handleSave = () => {
    updateUser({
      ...user,
      name: editName,
      email: editEmail
    });
    setEditMode(false);
    alert('Profile updated successfully!');
  };

  const handlePasswordChange = () => {
    if (passwords.new !== passwords.confirm) {
      alert('New passwords do not match!');
      return;
    }
    if (!passwords.current) {
      alert('Please enter your current password');
      return;
    }
    alert('Password updated successfully!');
    setPasswords({ current: '', new: '', confirm: '' });
  };

  const achievements = [
    { id: 'first_blood', name: 'First Blood', desc: 'Complete your first encryption', icon: Star, points: 50 },
    { id: 'crypto_explorer', name: 'Crypto Explorer', desc: 'Try all 6 ciphers', icon: Target, points: 300 },
    { id: 'combo_master', name: 'Combo Master', desc: 'Get a 5x combo streak', icon: Flame, points: 200 },
    { id: 'mission_complete', name: 'Mission Ace', desc: 'Complete 3 missions', icon: Trophy, points: 250 },
    { id: 'level_5', name: 'Rising Star', desc: 'Reach level 5', icon: Crown, points: 500 }
  ];

  return (
    <div className={`min-h-screen ${currentTheme.bg} relative overflow-hidden`}>
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute w-96 h-96 ${currentTheme.glowColors[2]} rounded-full ${currentTheme.glow} bottom-0 left-0 animate-pulse`}></div>
      </div>

      {/* Header */}
      <header className={`relative backdrop-blur-xl ${currentTheme.header} border-b ${currentTheme.cardBorder}`}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className={`px-4 py-2 ${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-200 hover:bg-slate-300'} rounded-xl ${currentTheme.text} font-bold transition-all`}
          >
            ← Back
          </button>
          <button
            onClick={toggleTheme}
            className={`p-2 ${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600' : 'bg-white hover:bg-slate-100'} ${currentTheme.cardBorder} border rounded-xl transition-all`}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
          </button>
        </div>
      </header>

      <div className="relative max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className={`text-5xl font-black ${theme === 'dark' ? 'bg-gradient-to-r from-green-400 to-teal-400' : 'bg-cyan-800 hover:bg-cyan-600'} bg-clip-text text-transparent mb-3`}>
            YOUR PROFILE
          </h1>
          <p className={`${currentTheme.textMuted} text-lg`}>Track your crypto mastery journey</p>
        </div>

        {/* Profile Info Card */}
        <div className={`backdrop-blur-xl ${currentTheme.card} border ${currentTheme.cardBorder} rounded-2xl p-8 mb-8 shadow-lg`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className={`w-20 h-20 ${theme === 'dark' ? 'bg-cyan-600 hover:bg-cyan-300' : 'bg-cyan-900 hover:bg-cyan-700'} } rounded-full flex items-center justify-center text-white font-bold text-3xl`}>
                {user.avatar || user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className={`text-3xl font-bold ${currentTheme.text}`}>{user.name}</h2>
                <p className={currentTheme.textMuted}>{user.email}</p>
                <p className={`${currentTheme.textMuted} text-sm`}>Joined {user.joinDate || 'Recently'}</p>
              </div>
            </div>
            <button
              onClick={() => setEditMode(!editMode)}
              className={`px-6 py-3 ${theme === 'dark' ? 'bg-cyan-600 hover:bg-cyan-500' : 'bg-cyan-800 hover:bg-cyan-600'} text-white font-bold rounded-xl transition-all`}
            >
              {editMode ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {editMode && (
            <div className={`space-y-4 border-t ${currentTheme.cardBorder} pt-6`}>
              <div>
                <label className={`block ${currentTheme.textMuted} text-sm mb-2`}>Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className={`w-full ${currentTheme.input} border-2 ${currentTheme.cardBorder} rounded-lg px-4 py-3 ${currentTheme.text} ${currentTheme.inputFocus} focus:outline-none`}
                />
              </div>
              <div>
                <label className={`block ${currentTheme.textMuted} text-sm mb-2`}>Email</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className={`w-full ${currentTheme.input} border-2 ${currentTheme.cardBorder} rounded-lg px-4 py-3 ${currentTheme.text} ${currentTheme.inputFocus} focus:outline-none`}
                />
              </div>
              <button
                onClick={handleSave}
                className={`w-full ${theme === 'dark' ? 'bg-gradient-to-r from-cyan-600 to-purple-700' : 'bg-cyan-800 hover:bg-cyan-600'} text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all`}
              >
                Save Changes
              </button>
            </div>
          )}
        </div>

        {/* Level Progress */}
        <div className={`backdrop-blur-xl ${currentTheme.card} border ${currentTheme.cardBorder} rounded-2xl p-8 mb-8 shadow-lg`}>
          <div className="flex items-center justify-between mb-6">
            <div>
                <div className={`text-5xl font-black ${theme === 'dark' ? 'bg-gradient-to-r from-purple-400 to-pink-400' : "bg-cyan-800 hover:bg-cyan-200"} bg-clip-text text-transparent mb-2`}>
                Level {user.stats.level}
              </div>
              <div className={currentTheme.textMuted}>Crypto Specialist</div>
            </div>
            <div className="text-right">
              <div className={`text-4xl font-black ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}`}>{user.stats.points}</div>
              <div className={`${currentTheme.textMuted} text-sm`}>Total Points</div>
            </div>
          </div>
          <div className={`relative w-full h-4 ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'} rounded-full overflow-hidden`}>
            <div
              className={`absolute top-0 left-0 h-full ${theme === 'dark' ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-red-600' : 'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500'} rounded-full transition-all duration-500`}
              style={{ width: `${(user.stats.points % 500) / 5}%` }}
            ></div>
          </div>
          <div className={`${currentTheme.textMuted} text-sm mt-2 text-right`}>
            {user.stats.points % 500} / 500 to Level {user.stats.level + 1}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Encryptions', value: user.stats.totalEncryptions, icon: Lock, color: theme === 'dark' ? 'from-cyan-600 to-blue-700' : 'from-cyan-500 to-blue-600' },
            { label: 'Decryptions', value: user.stats.totalDecryptions, icon: Unlock, color: theme === 'dark' ? 'from-purple-600 to-pink-700' : 'from-purple-500 to-pink-600' },
            { label: 'Missions', value: user.stats.completedChallenges.length, icon: Target, color: theme === 'dark' ? 'from-green-600 to-teal-700' : 'from-green-500 to-teal-600' },
            { label: 'Best Combo', value: user.stats.bestCombo + 'x', icon: Flame, color: theme === 'dark' ? 'from-orange-600 to-red-700' : 'from-orange-500 to-red-600' }
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className={`backdrop-blur-xl ${currentTheme.card} border ${currentTheme.cardBorder} rounded-2xl p-6 hover:scale-105 transition-all shadow-lg`}>
                <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-3 shadow-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className={`text-3xl font-black ${currentTheme.text} mb-1`}>{stat.value}</div>
                <div className={`${currentTheme.textMuted} text-sm`}>{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Achievements */}
        <div className={`backdrop-blur-xl ${currentTheme.card} border ${currentTheme.cardBorder} rounded-2xl p-8 mb-8 shadow-lg`}>
          <h2 className={`text-2xl font-bold ${currentTheme.text} mb-6 flex items-center`}>
            <Trophy className={`w-6 h-6 mr-2 ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}`} />
            Achievements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map(achievement => {
              const isUnlocked = user.stats.achievements.includes(achievement.id);
              const Icon = achievement.icon;

              return (
                <div
                  key={achievement.id}
                  className={`relative p-4 rounded-xl border-2 transition-all ${
                    isUnlocked
                      ? theme === 'dark' ? 'bg-amber-500/10 border-amber-500/50 shadow-xl' : 'bg-amber-50 border-amber-300'
                      : theme === 'dark' ? 'bg-slate-800/50 border-slate-700 opacity-50' : 'bg-slate-100 border-slate-200 opacity-60'
                  }`}
                >
                  {isUnlocked && (
                    <div className="absolute -top-2 -right-2">
                      <div className={`${theme === 'dark' ? 'bg-gradient-to-r from-green-600 to-teal-600 border-slate-900' : 'bg-gradient-to-r from-green-500 to-teal-500 border-white'} rounded-full p-1 border-2`}>
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                  <div className="flex items-start space-x-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                      isUnlocked ? theme === 'dark' ? 'bg-gradient-to-br from-amber-600 to-orange-700' : 'bg-gradient-to-br from-amber-500 to-orange-600' : theme === 'dark' ? 'bg-slate-700' : 'bg-slate-300'
                    }`}>
                      <Icon className={`w-6 h-6 ${isUnlocked ? 'text-white' : theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-bold mb-1 ${isUnlocked ? theme === 'dark' ? 'text-amber-400' : 'text-amber-700' : currentTheme.textMuted}`}>
                        {achievement.name}
                      </h3>
                      <p className={`text-xs ${isUnlocked ? currentTheme.textMuted : theme === 'dark' ? 'text-slate-600' : 'text-slate-400'}`}>
                        {achievement.desc}
                      </p>
                      {isUnlocked && (
                        <div className={`${theme === 'dark' ? 'text-amber-400' : 'text-amber-700'} text-xs mt-1`}>+{achievement.points} pts</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Password Change Section */}
        <div className={`backdrop-blur-xl ${currentTheme.card} border ${currentTheme.cardBorder} rounded-2xl p-8 mb-8 shadow-lg`}>
          <h2 className={`text-2xl font-bold ${currentTheme.text} mb-6`}>Change Password</h2>
          <div className="space-y-4">
            <input
              type="password"
              placeholder="Current Password"
              value={passwords.current}
              onChange={(e) => setPasswords({...passwords, current: e.target.value})}
              className={`w-full ${currentTheme.input} border-2 ${currentTheme.cardBorder} rounded-lg px-4 py-3 ${currentTheme.text} ${currentTheme.inputFocus} focus:outline-none`}
            />
            <input
              type="password"
              placeholder="New Password"
              value={passwords.new}
              onChange={(e) => setPasswords({...passwords, new: e.target.value})}
              className={`w-full ${currentTheme.input} border-2 ${currentTheme.cardBorder} rounded-lg px-4 py-3 ${currentTheme.text} ${currentTheme.inputFocus} focus:outline-none`}
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={passwords.confirm}
              onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
              className={`w-full ${currentTheme.input} border-2 ${currentTheme.cardBorder} rounded-lg px-4 py-3 ${currentTheme.text} ${currentTheme.inputFocus} focus:outline-none`}
            />
            <button
              onClick={handlePasswordChange}
              className={`w-full ${theme === 'dark' ? 'bg-gradient-to-r from-cyan-600 to-purple-700' : 'bg-cyan-800 hover:bg-cyan-600'} text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all`}
            >
              Update Password
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className={`backdrop-blur-xl ${theme === 'dark' ? 'bg-red-500/10 border-red-500/50' : 'bg-red-50 border-red-200'} border-2 rounded-2xl p-8 shadow-lg`}>
          <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-red-400' : 'text-red-700'} mb-4`}>Danger Zone</h2>
          <p className={`${currentTheme.textMuted} mb-4`}>Once you delete your account, there is no going back. Please be certain.</p>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                logout();
                navigate('/login');
              }
            }}
            className={`px-6 py-3 ${theme === 'dark' ? 'bg-red-600 hover:bg-red-500' : 'bg-red-500 hover:bg-red-600'} text-white font-bold rounded-xl transition-all`}
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;