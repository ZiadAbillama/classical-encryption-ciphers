import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lock,
  Unlock,
  Star,
  Target,
  Award,
  Flame,
  Crown,
  Trophy,
  Sun,
  Moon,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3000';

// Helper for Authorization header
function authHeaders() {
  const t = localStorage.getItem('auth_token');
  return t ? { Authorization: `Bearer ${t}` } : {};
}

const ProfilePage = () => {
  const { user, updateUser, logout } = useAuth();
  const { theme, currentTheme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState(user?.name || "");
  const [editEmail, setEditEmail] = useState(user?.email || "");
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [busy, setBusy] = useState(false);

  // App-level notifications and delete-account modal
  const [notification, setNotification] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // control visibility of password fields
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const showSuccess = (message) => setNotification({ type: 'success', message });
  const showError = (message) => setNotification({ type: 'error', message });

  // Auto-dismiss notifications after 4 seconds
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(null), 4000);
    return () => clearTimeout(timer);
  }, [notification]);

  // FETCH FRESH USER DATA ON PAGE LOAD
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

        // update edit fields
        setEditName(data.user.name || "");
        setEditEmail(data.user.email || "");

      } catch (err) {
        console.error("Profile refresh failed:", err);
        showError("Could not refresh profile");
      }
    };

    fetchFresh();
  }, []);

  const stats = user.stats || {};
  const totalEncryptions = stats.totalEncryptions || 0;
  const totalDecryptions = stats.totalDecryptions || 0;
  const level = stats.level || 1;
  const points = stats.points || 0;
  const combo = stats.combo || 0;
  const bestCombo = stats.bestCombo || 0;
  const experiencedCiphers = stats.experiencedCiphers || [];

  // Achievements
  const achievements = [
    {
      id: 'first_steps',
      name: 'First Encryption',
      desc: 'Complete your first encryption or decryption',
      icon: Star,
      points: 50,
      unlocked: totalEncryptions + totalDecryptions > 0,
    },
    {
      id: 'combo_master',
      name: 'Combo Master',
      desc: 'Reach a 5× combo streak',
      icon: Flame,
      points: 200,
      unlocked: bestCombo >= 5,
    },
    {
      id: 'balanced_operator',
      name: 'Balanced Operative',
      desc: 'Perform 5 encryptions and 5 decryptions',
      icon: Target,
      points: 150,
      unlocked: totalEncryptions >= 5 && totalDecryptions >= 5,
    },
    {
      id: 'rising_star',
      name: 'Rising Star',
      desc: 'Reach level 5',
      icon: Crown,
      points: 500,
      unlocked: level >= 5,
    },
  ];

  const unlockedAchievementIds = new Set(
    achievements.filter((a) => a.unlocked).map((a) => a.id),
  );

  // ---- API actions ----

  const handleSave = async () => {
    try {
      setBusy(true);
      const res = await fetch(`${API_BASE}/api/users/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify({ name: editName, email: editEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `Update failed (${res.status})`);

      updateUser({
        ...user,
        name: data.user.name,
        email: data.user.email,
        stats: data.user.stats || user.stats
      });

      setEditMode(false);
      showSuccess('Profile updated successfully!');
    } catch (e) {
      showError(e.message || 'Update failed');
    } finally {
      setBusy(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwords.new !== passwords.confirm) {
      showError('New passwords do not match!');
      return;
    }
    if (!passwords.current) {
      showError('Please enter your current password');
      return;
    }

    try {
      setBusy(true);
      const res = await fetch(`${API_BASE}/api/auth/password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.new,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `Password update failed (${res.status})`);

      showSuccess('Password updated successfully!');
      setPasswords({ current: '', new: '', confirm: '' });
      setShowPassword({ current: false, new: false, confirm: false });
    } catch (e) {
      showError(e.message || 'Password update failed');
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setBusy(true);
      const res = await fetch(`${API_BASE}/api/users/me`, {
        method: 'DELETE',
        headers: {
          ...authHeaders(),
        },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `Delete failed (${res.status})`);

      localStorage.removeItem('auth_token');
      logout();
      navigate('/signup');
    } catch (e) {
      showError(e.message || 'Delete failed');
    } finally {
      setBusy(false);
    }
  };

  // ---- Render ----

  const progressWithinLevel = points % 500;

  const passwordTextClasses =
    theme === 'dark'
      ? 'text-slate-100 placeholder-slate-500'
      : 'text-slate-900 placeholder-slate-500';

  return (
    <div className={`min-h-screen ${currentTheme.bg} relative overflow-hidden`}>
      {/* Toast notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${
              notification.type === 'success'
                ? 'bg-emerald-500/90 border-emerald-400 text-white'
                : 'bg-red-500/90 border-red-400 text-white'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="ml-2 text-xs opacity-80 hover:opacity-100 underline"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute w-96 h-96 ${currentTheme.glowColors[0]} ${currentTheme.glow} -top-24 -left-16 rounded-full`}
        />
        <div
          className={`absolute w-96 h-96 ${currentTheme.glowColors[1]} ${currentTheme.glow} bottom-0 right-0 rounded-full`}
        />
      </div>

      {/* Header */}
      <header
        className={`relative backdrop-blur-xl ${currentTheme.header} border-b ${currentTheme.cardBorder}`}
      >
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className={`px-4 py-2 ${
              theme === 'dark'
                ? 'bg-slate-800 hover:bg-slate-700'
                : 'bg-white hover:bg-slate-100'
            } rounded-xl ${currentTheme.text} font-bold transition-all`}
          >
            ← Back
          </button>
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
        </div>
      </header>

      <div className="relative max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1
            className={`text-5xl font-black ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-cyan-300 via-indigo-300 to-pink-300'
                : 'bg-gradient-to-r from-cyan-700 via-indigo-700 to-pink-700'
            } bg-clip-text text-transparent mb-3`}
          >
            YOUR PROFILE
          </h1>
          <p className={`${currentTheme.textMuted} text-lg`}>
            Track your crypto mastery journey
          </p>
        </div>

        {/* Profile Info Card */}
        <div
          className={`mb-10 rounded-3xl border ${currentTheme.cardBorder} ${currentTheme.card} backdrop-blur-xl p-6 grid gap-8 md:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)]`}
        >
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                  theme === 'dark' ? 'bg-slate-900/80' : 'bg-slate-100'
                } border ${currentTheme.cardBorder}`}
              >
                <Trophy className="w-8 h-8 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  {editMode ? (
                    <input
                      className={`text-2xl font-bold bg-transparent outline-none border-b ${currentTheme.cardBorder} ${currentTheme.text}`}
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                  ) : (
                    <h2 className={`text-2xl font-bold ${currentTheme.text}`}>{user.name}</h2>
                  )}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      theme === 'dark'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                    }`}
                  >
                    Level {level}
                  </span>
                </div>
                <p className={`${currentTheme.textMuted} text-sm`}>
                  Cipher explorer • Crypto puzzle solver
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`${currentTheme.textMuted} text-xs uppercase tracking-wide`}>
                  Email
                </label>
                {editMode ? (
                  <input
                    type="email"
                    className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none ${currentTheme.input} ${currentTheme.inputFocus} ${passwordTextClasses}`}
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                  />
                ) : (
                  <div className={`mt-1 text-sm ${currentTheme.text}`}>{user.email}</div>
                )}
              </div>

              <div className="flex gap-3 mt-4">
                {editMode ? (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={busy}
                      className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-cyan-500 to-indigo-500 text-white hover:from-cyan-400 hover:to-indigo-400 disabled:opacity-60"
                    >
                      Save changes
                    </button>
                    <button
                      onClick={() => {
                        setEditMode(false);
                        setEditName(user.name);
                        setEditEmail(user.email);
                      }}
                      disabled={busy}
                      className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-500 hover:bg-slate-700/40"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditMode(true)}
                    disabled={busy}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors ${
                      theme === 'dark'
                        ? 'bg-slate-800/80 text-slate-100 border border-slate-400 hover:bg-slate-700'
                        : 'bg-white text-slate-900 border border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <Unlock className="w-4 h-4" />
                    Edit profile
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Level / points box */}
          <div
            className={`rounded-2xl border ${currentTheme.cardBorder} ${
              theme === 'dark' ? 'bg-slate-900/70' : 'bg-slate-50/80'
            } p-5 flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className={`${currentTheme.textMuted} text-xs uppercase tracking-wide`}>
                  Current Level
                </div>
                <div className={`text-3xl font-black ${currentTheme.text}`}>Level {level}</div>
              </div>
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                  theme === 'dark' ? 'bg-amber-500/10' : 'bg-amber-100'
                }`}
              >
                <Award className="w-8 h-8 text-amber-400" />
              </div>
            </div>

            <div className="mb-2 flex items-baseline justify-between">
              <div className={`${currentTheme.textMuted} text-xs uppercase`}>Total Points</div>
              <div
                className={`text-2xl font-black ${
                  theme === 'dark' ? 'text-amber-300' : 'text-amber-600'
                }`}
              >
                {points}
              </div>
            </div>

            <div
              className={`relative w-full h-3 rounded-full overflow-hidden ${
                theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'
              }`}
            >
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-pink-500 transition-all duration-500"
                style={{ width: `${(progressWithinLevel / 500) * 100}%` }}
              />
            </div>
            <div className={`${currentTheme.textMuted} text-xs mt-1 text-right`}>
              {progressWithinLevel} / 500 to Level {level + 1}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-3 mb-10">
          <StatCard
            theme={theme}
            currentTheme={currentTheme}
            icon={Lock}
            label="Encryptions"
            value={totalEncryptions}
          />
          <StatCard
            theme={theme}
            currentTheme={currentTheme}
            icon={Unlock}
            label="Decryptions"
            value={totalDecryptions}
          />
          <StatCard
            theme={theme}
            currentTheme={currentTheme}
            icon={Flame}
            label="Best Combo"
            value={bestCombo}
          />
          <StatCard
            theme={theme}
            currentTheme={currentTheme}
            icon={Star}
            label="Current Combo"
            value={combo}
          />
          <StatCard
            theme={theme}
            currentTheme={currentTheme}
            icon={Target}
            label="Ciphers Tried"
            value={experiencedCiphers.length}
          />
          <StatCard
            theme={theme}
            currentTheme={currentTheme}
            icon={Trophy}
            label="Achievements"
            value={unlockedAchievementIds.size}
            suffix={`/ ${achievements.length}`}
          />
        </div>

        {/* Achievements */}
        <div className="mb-12">
          <h3 className={`text-xl font-bold mb-4 ${currentTheme.text}`}>Achievements</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {achievements.map((ach) => {
              const Icon = ach.icon;
              const unlocked = ach.unlocked;

              return (
                <div
                  key={ach.id}
                  className={`relative p-4 rounded-xl border-2 transition-all ${
                    unlocked
                      ? theme === 'dark'
                        ? 'bg-amber-500/10 border-amber-500/60 shadow-xl'
                        : 'bg-amber-50 border-amber-300'
                      : theme === 'dark'
                        ? 'bg-slate-800/60 border-slate-700 opacity-60'
                        : 'bg-slate-100 border-slate-200 opacity-70'
                  }`}
                >
                  {unlocked && (
                    <div className="absolute -top-2 -right-2">
                      <div className="rounded-full p-1 border-2 border-white bg-gradient-to-tr from-emerald-400 to-teal-500">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        unlocked
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-slate-700/60 text-slate-300'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className={`font-semibold ${currentTheme.text}`}>{ach.name}</div>
                      <div className={`${currentTheme.textMuted} text-xs`}>{ach.desc}</div>
                    </div>
                  </div>
                  <div
                    className={`mt-1 text-xs font-semibold ${
                      unlocked ? 'text-amber-300' : currentTheme.textMuted
                    }`}
                  >
                    +{ach.points} pts
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Change Password */}
        <div
          className={`mb-10 rounded-3xl border ${currentTheme.cardBorder} ${currentTheme.card} backdrop-blur-xl p-6`}
        >
          <h3 className={`text-xl font-bold mb-4 ${currentTheme.text}`}>Change Password</h3>
          <div className="grid gap-4 md:grid-cols-3">
            {/* Current password */}
            <div className="flex flex-col gap-1">
              <label className={`${currentTheme.textMuted} text-xs uppercase tracking-wide`}>
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPassword.current ? 'text' : 'password'}
                  className={`w-full rounded-xl border px-3 py-2 pr-10 text-sm outline-none ${currentTheme.input} ${currentTheme.inputFocus} ${passwordTextClasses}`}
                  value={passwords.current}
                  onChange={(e) =>
                    setPasswords({
                      ...passwords,
                      current: e.target.value,
                    })
                  }
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-2 flex items-center text-xs text-slate-400 hover:text-slate-200"
                  onClick={() =>
                    setShowPassword((prev) => ({ ...prev, current: !prev.current }))
                  }
                >
                  {showPassword.current ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* New password */}
            <div className="flex flex-col gap-1">
              <label className={`${currentTheme.textMuted} text-xs uppercase tracking-wide`}>
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword.new ? 'text' : 'password'}
                  className={`w-full rounded-xl border px-3 py-2 pr-10 text-sm outline-none ${currentTheme.input} ${currentTheme.inputFocus} ${passwordTextClasses}`}
                  value={passwords.new}
                  onChange={(e) =>
                    setPasswords({
                      ...passwords,
                      new: e.target.value,
                    })
                  }
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-2 flex items-center text-xs text-slate-400 hover:text-slate-200"
                  onClick={() =>
                    setShowPassword((prev) => ({ ...prev, new: !prev.new }))
                  }
                >
                  {showPassword.new ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm new password */}
            <div className="flex flex-col gap-1">
              <label className={`${currentTheme.textMuted} text-xs uppercase tracking-wide`}>
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword.confirm ? 'text' : 'password'}
                  className={`w-full rounded-xl border px-3 py-2 pr-10 text-sm outline-none ${currentTheme.input} ${currentTheme.inputFocus} ${passwordTextClasses}`}
                  value={passwords.confirm}
                  onChange={(e) =>
                    setPasswords({
                      ...passwords,
                      confirm: e.target.value,
                    })
                  }
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-2 flex items-center text-xs text-slate-400 hover:text-slate-200"
                  onClick={() =>
                    setShowPassword((prev) => ({ ...prev, confirm: !prev.confirm }))
                  }
                >
                  {showPassword.confirm ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={handlePasswordChange}
              disabled={busy}
              className="px-6 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-cyan-500 to-indigo-500 text-white hover:from-cyan-400 hover:to-indigo-400 disabled:opacity-60 flex items-center gap-2"
            >
              <Lock className="w-4 h-4" />
              Update Password
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div
          className={`mb-4 rounded-3xl border-2 border-red-500/40 ${
            theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'
          } backdrop-blur-xl p-6`}
        >
          <h3 className="text-lg font-bold text-red-400 mb-2">Danger Zone</h3>
          <p className={`${currentTheme.textMuted} text-sm mb-4`}>
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all"
            disabled={busy}
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Delete account confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div
            className={`w-full max-w-md rounded-2xl p-6 shadow-2xl border ${currentTheme.card} ${currentTheme.cardBorder}`}
          >
            <h3 className="text-lg font-bold mb-2 text-red-400">Delete account?</h3>
            <p className={`${currentTheme.textMuted} text-sm mb-4`}>
              This action cannot be undone. All your progress will be permanently removed.
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-400 bg-slate-800/80 text-slate-100 hover:bg-slate-700/80"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={busy}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg text-sm font-bold bg-red-600 hover:bg-red-700 text-white"
                onClick={async () => {
                  await handleDeleteAccount();
                  setShowDeleteConfirm(false);
                }}
                disabled={busy}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Small stat card component
const StatCard = ({ theme, currentTheme, icon: Icon, label, value, suffix }) => {
  return (
    <div
      className={`rounded-2xl border ${currentTheme.cardBorder} ${currentTheme.card} backdrop-blur-xl p-4 flex items-center gap-4`}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          theme === 'dark' ? 'bg-slate-900/80' : 'bg-slate-100'
        }`}
      >
        <Icon className="w-5 h-5 text-cyan-400" />
      </div>
      <div>
        <div className={`${currentTheme.textMuted} text-xs uppercase tracking-wide`}>{label}</div>
        <div className={`text-xl font-bold ${currentTheme.text}`}>
          {value}
          {suffix && <span className="text-sm opacity-70 ml-1">{suffix}</span>}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
