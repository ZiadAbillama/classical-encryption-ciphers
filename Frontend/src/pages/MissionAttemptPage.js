// Frontend/src/pages/MissionAttemptPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Lock, Send, AlertCircle, Trophy, Flame, Sun, Moon, Zap, CheckCircle2, XCircle, Star, Key, Sparkles, Grid3x3
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3000';

// Helper for auth headers
function authHeaders() {
  const t = localStorage.getItem('auth_token');
  return t ? { Authorization: `Bearer ${t}` } : {};
}

// Save stats to backend
async function saveStatsToBackend(user, newStats) {
  const token = localStorage.getItem("auth_token");
  if (!token) {
    console.warn("No auth token found, cannot save stats");
    return;
  }

  const res = await fetch(`${API_BASE}/api/users/me/stats`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ stats: newStats }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to save stats");
  return data.stats;
}

const MissionAttemptPage = () => {
  const { user, updateUser } = useAuth();
  const { theme, currentTheme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get mission ID from navigation state
  const missionId = location.state?.missionId || null;

  // Mission metadata - MUST MATCH MissionsPage.js exactly
  const missionMeta = {
    "affine_encrypt": {
      cipher: "affine",
      title: "The Beginning",
      description: "Encrypt 'HELLO' with a=5, b=8",
      plaintext: "HELLO",
      key: { a: 5, b: 8 },
      target: "RCLLA",
      points: 20,
      difficulty: "Novice",
      type: "encrypt",
      icon: Star
    },
    "vigenere_encrypt": {
      cipher: "vigenere",
      title: "Keyword Master",
      description: "Encrypt 'CRYPTO' with keyword 'KEY'",
      plaintext: "CRYPTO",
      key: "KEY",
      target: "MVWZXS",
      points: 30,
      difficulty: "Apprentice",
      type: "encrypt",
      icon: Key
    },
    "affine_decrypt": {
      cipher: "affine",
      title: "Reverse Engineer",
      description: "Decrypt 'IHHW' with a=5, b=8",
      ciphertext: "IHHW",
      key: { a: 5, b: 8 },
      target: "MEET",
      points: 25,
      difficulty: "Apprentice",
      type: "decrypt",
      icon: Lock
    },
    "affine_crack": {
      cipher: "affine",
      title: "Code Breaker",
      description: "Crack this affine cipher (hint: 'E' encrypts to 'I', 'T' encrypts to 'X'). Decrypt: 'IDRR'",
      ciphertext: "IDRR",
      hint: "Most common letters: E→I, T→X. This means a=5, b=4",
      target: "MEET",
      points: 50,
      difficulty: "Expert",
      type: "crack",
      icon: Sparkles
    },
    "vigenere_decrypt": {
      cipher: "vigenere",
      title: "Key Finder",
      description: "Decrypt 'JSXWI' with keyword 'CODE'",
      ciphertext: "JSXWI",
      key: "CODE",
      target: "HELLO",
      points: 35,
      difficulty: "Apprentice",
      type: "decrypt",
      icon: Key
    },
    "playfair_encrypt": {
      cipher: "playfair",
      title: "Digraph Master",
      description: "Encrypt 'HELLO' using Playfair cipher with keyword 'MONARCHY'",
      plaintext: "HELLO",
      key: "MONARCHY",
      target: "GATLMZ",
      points: 40,
      difficulty: "Advanced",
      type: "encrypt",
      icon: Grid3x3
    }
  };

  const activeMission = missionId ? missionMeta[missionId] : null;

  const [userAnswer, setUserAnswer] = useState('');
  const [attemptResult, setAttemptResult] = useState(null);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSubmitAnswer = async () => {
    if (!activeMission) return;

    if (!userAnswer.trim()) {
      setAttemptResult({
        type: 'error',
        message: '❌ Please enter an answer before submitting!'
      });
      setTimeout(() => setAttemptResult(null), 3000);
      return;
    }

    const normalizeAnswer = (str) => str.replace(/\s+/g, '').toUpperCase();
    const userNormalized = normalizeAnswer(userAnswer);
    const targetNormalized = normalizeAnswer(activeMission.target);

    if (userNormalized === targetNormalized) {
      const alreadyCompleted = user.stats.completedChallenges?.includes(missionId);
      
      if (!alreadyCompleted) {
        const newPoints = user.stats.points + activeMission.points;
        const newLevel = Math.floor(newPoints / 500) + 1;
        
        const updatedStats = {
          ...user.stats,
          points: newPoints,
          level: newLevel,
          completedChallenges: [...(user.stats.completedChallenges || []), missionId]
        };

        try {
          const savedStats = await saveStatsToBackend(user, updatedStats);
          updateUser({
            ...user,
            stats: savedStats
          });

          setAttemptResult({
            type: 'success',
            message: `🎉 Perfect! You earned ${activeMission.points} points!`
          });
          
          showNotification(`+${activeMission.points} Points!`, 'success');
          
          setTimeout(() => {
            navigate('/missions');
          }, 2500);
        } catch (err) {
          console.error('Failed to save mission completion:', err);
          setAttemptResult({
            type: 'error',
            message: '❌ Failed to save your progress. Please try again.'
          });
        }
      } else {
        setAttemptResult({
          type: 'success',
          message: '✅ Correct! (Already completed)'
        });
      }
    } else {
      setAttemptResult({
        type: 'error',
        message: '❌ Not quite right! Check your cipher work and try again.'
      });
      
      setTimeout(() => {
        setAttemptResult(null);
      }, 3000);
    }
  };

  // Redirect if no mission is selected
  useEffect(() => {
    if (!activeMission) {
      navigate('/missions');
    }
  }, [missionId, activeMission, navigate]);

  if (!activeMission) return null;

  const getCipherGradient = () => {
    switch (activeMission.cipher) {
      case 'affine':
        return theme === 'dark'
          ? 'from-cyan-600 via-blue-700 to-blue-800'
          : 'from-cyan-400 via-blue-500 to-blue-600';
      case 'vigenere':
        return theme === 'dark'
          ? 'from-green-600 via-emerald-700 to-teal-800'
          : 'from-green-400 via-emerald-500 to-teal-600';
      case 'playfair':
        return theme === 'dark'
          ? 'from-orange-600 via-red-700 to-red-800'
          : 'from-orange-400 via-red-500 to-red-600';
      default:
        return theme === 'dark'
          ? 'from-purple-600 via-purple-700 to-pink-800'
          : 'from-purple-400 via-purple-500 to-pink-600';
    }
  };

  const gradient = getCipherGradient();

  return (
    <div className={`min-h-screen ${currentTheme.bg} relative overflow-hidden`}>
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute w-96 h-96 ${currentTheme.glowColors[0]} rounded-full ${currentTheme.glow} top-0 right-0 animate-pulse`}></div>
        <div className={`absolute w-96 h-96 ${currentTheme.glowColors[1]} rounded-full ${currentTheme.glow} bottom-0 left-0 animate-pulse delay-1000`}></div>
      </div>

      {/* Header */}
      <header className={`relative backdrop-blur-xl ${currentTheme.header} border-b ${currentTheme.cardBorder}`}>
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/missions')}
              className={`px-4 py-2 ${
                theme === 'dark'
                  ? 'bg-slate-700 hover:bg-slate-600'
                  : 'bg-slate-200 hover:bg-slate-300'
              } rounded-xl ${currentTheme.text} font-bold transition-all`}
            >
              ← Back to Missions
            </button>

            <div className="flex items-center space-x-3">
              <button
                onClick={toggleTheme}
                className={`p-2 ${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600' : 'bg-white hover:bg-slate-100'} ${currentTheme.cardBorder} border rounded-xl transition-all`}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
              </button>
              {user.stats.combo > 0 && (
                <div className={`flex items-center space-x-2 px-4 py-2 ${theme === 'dark' ? 'bg-orange-500/30 border-orange-500' : 'bg-orange-100 border-orange-300'} border rounded-full backdrop-blur-xl`}>
                  <Flame className={`w-4 h-4 ${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`} />
                  <span className={`${currentTheme.text} font-bold`}>{user.stats.combo}x Combo</span>
                </div>
              )}
              <div className={`flex items-center space-x-2 px-4 py-2 ${theme === 'dark' ? 'bg-green-500/20 border-green-500/40' : 'bg-green-100 border-green-300'} border rounded-full backdrop-blur-xl`}>
                <Trophy className={`w-4 h-4 ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}`} />
                <span className={`${currentTheme.text} font-bold`}>{user.stats.points}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="relative max-w-4xl mx-auto px-4 py-8">
        {/* Mission Banner */}
        <div className={`backdrop-blur-xl ${currentTheme.card} border-2 ${currentTheme.cardBorder} rounded-3xl p-6 shadow-2xl mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className={`w-16 h-16 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
                {activeMission.icon && React.createElement(activeMission.icon, { className: "w-8 h-8 text-white" })}
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <h1 className={`text-2xl font-black ${currentTheme.text}`}>{activeMission.title}</h1>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-bold ${
                      activeMission.difficulty === 'Novice'
                        ? theme === 'dark'
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-green-100 text-green-700 border border-green-300'
                        : activeMission.difficulty === 'Apprentice'
                        ? theme === 'dark'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-blue-100 text-blue-700 border border-blue-300'
                        : activeMission.difficulty === 'Advanced'
                        ? theme === 'dark'
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          : 'bg-purple-100 text-purple-700 border border-purple-300'
                        : theme === 'dark'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-red-100 text-red-700 border border-red-300'
                    }`}
                  >
                    {activeMission.difficulty}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className={`${currentTheme.textMuted} text-xs mb-1`}>Reward</div>
              <div className="flex items-center space-x-1">
                <Zap className={`w-5 h-5 ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}`} />
                <span className={`${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'} font-black text-2xl`}>
                  {activeMission.points}
                </span>
              </div>
            </div>
          </div>

          {/* Mission Challenge */}
          <div className={`${theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-100'} rounded-xl p-4 border-2 ${currentTheme.cardBorder}`}>
            <div className="flex items-start space-x-3 mb-3">
              <div className={`w-8 h-8 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <Lock className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <h3 className={`${currentTheme.text} font-bold text-base mb-1`}>Your Challenge:</h3>
                <p className={`${currentTheme.textMuted} text-sm leading-relaxed`}>
                  {activeMission.description}
                </p>
              </div>
            </div>

            {/* Mission Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              {activeMission.plaintext && (
                <div className={`${theme === 'dark' ? 'bg-blue-500/10 border-blue-500/30' : 'bg-blue-50 border-blue-200'} border-2 rounded-lg p-3`}>
                  <div className={`${theme === 'dark' ? 'text-blue-400' : 'text-blue-700'} text-xs font-bold mb-1`}>
                    📝 Plaintext:
                  </div>
                  <div className={`${currentTheme.text} font-mono text-lg font-black tracking-wider`}>
                    {activeMission.plaintext}
                  </div>
                </div>
              )}

              {activeMission.ciphertext && (
                <div className={`${theme === 'dark' ? 'bg-purple-500/10 border-purple-500/30' : 'bg-purple-50 border-purple-200'} border-2 rounded-lg p-3`}>
                  <div className={`${theme === 'dark' ? 'text-purple-400' : 'text-purple-700'} text-xs font-bold mb-1`}>
                    🔒 Ciphertext:
                  </div>
                  <div className={`${currentTheme.text} font-mono text-lg font-black tracking-wider`}>
                    {activeMission.ciphertext}
                  </div>
                </div>
              )}

              {activeMission.key && (
                <div className={`${theme === 'dark' ? 'bg-green-500/10 border-green-500/30' : 'bg-green-50 border-green-200'} border-2 rounded-lg p-3`}>
                  <div className={`${theme === 'dark' ? 'text-green-400' : 'text-green-700'} text-xs font-bold mb-1`}>
                    🔑 Key:
                  </div>
                  <div className={`${currentTheme.text} font-mono text-base font-black`}>
                    {typeof activeMission.key === 'object' 
                      ? `a=${activeMission.key.a}, b=${activeMission.key.b}`
                      : activeMission.key
                    }
                  </div>
                </div>
              )}

              {activeMission.hint && (
                <div className={`${theme === 'dark' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-200'} border-2 rounded-lg p-3`}>
                  <div className={`${theme === 'dark' ? 'text-amber-400' : 'text-amber-700'} text-xs font-bold mb-1`}>
                    💡 Hint:
                  </div>
                  <div className={`${currentTheme.textMuted} text-xs`}>
                    {activeMission.hint}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Answer Submission Section */}
        <div className={`backdrop-blur-xl ${currentTheme.card} border-2 ${currentTheme.cardBorder} rounded-3xl p-6 shadow-2xl`}>
          <div className="flex items-center space-x-3 mb-4">
            <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-lg`}>
              <Send className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className={`text-xl font-black ${currentTheme.text}`}>Submit Your Answer</h3>
              <p className={`${currentTheme.textMuted} text-sm`}>Solve the cipher and enter your result below</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className={`block ${currentTheme.text} font-bold mb-2 text-sm`}>Your Answer:</label>
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value.toUpperCase())}
                placeholder="Enter your cipher result..."
                className={`w-full ${currentTheme.input} ${currentTheme.inputFocus} border-2 rounded-xl px-4 py-3 ${currentTheme.text} text-lg font-mono font-black tracking-widest focus:outline-none text-center transition-all`}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSubmitAnswer();
                  }
                }}
              />
            </div>

            {attemptResult && (
              <div className={`p-4 rounded-xl border-2 flex items-center space-x-3 transition-all transform animate-bounce ${
                attemptResult.type === 'success'
                  ? theme === 'dark' ? 'bg-green-500/20 border-green-500/50' : 'bg-green-100 border-green-400'
                  : theme === 'dark' ? 'bg-red-500/20 border-red-500/50' : 'bg-red-100 border-red-400'
              }`}>
                {attemptResult.type === 'success' ? (
                  <CheckCircle2 className={`w-6 h-6 flex-shrink-0 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
                ) : (
                  <XCircle className={`w-6 h-6 flex-shrink-0 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`} />
                )}
                <p className={`font-bold text-base ${
                  attemptResult.type === 'success'
                    ? theme === 'dark' ? 'text-green-400' : 'text-green-700'
                    : theme === 'dark' ? 'text-red-400' : 'text-red-700'
                }`}>
                  {attemptResult.message}
                </p>
              </div>
            )}

            <button
              onClick={handleSubmitAnswer}
              className={`w-full py-3 px-6 bg-gradient-to-r ${gradient} hover:shadow-2xl text-white font-black text-base rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2`}
            >
              <Send className="w-5 h-5" />
              <span>SUBMIT ANSWER</span>
            </button>

            <div className={`${theme === 'dark' ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-cyan-50 border-cyan-200'} border-2 rounded-xl p-4`}>
              <div className="flex items-start space-x-2">
                <AlertCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`} />
                <div>
                  <p className={`${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-700'} font-bold text-sm mb-1`}>💡 Tips:</p>
                  <ul className={`${currentTheme.textMuted} text-xs space-y-0.5`}>
                    <li>• Work through the cipher step by step</li>
                    <li>• Double-check your calculations</li>
                    <li>• Remove spaces and convert to uppercase</li>
                    <li>• You have unlimited attempts!</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 animate-bounce">
          <div className={`px-6 py-4 rounded-2xl backdrop-blur-xl border-2 shadow-2xl ${
            notification.type === 'success'
              ? theme === 'dark' ? 'bg-green-500/90 border-green-300' : 'bg-green-100 border-green-400'
              : notification.type === 'error'
                ? theme === 'dark' ? 'bg-red-500/90 border-red-300' : 'bg-red-100 border-red-400'
                : theme === 'dark' ? 'bg-cyan-500/90 border-cyan-300' : 'bg-cyan-100 border-cyan-400'
          }`}>
            <div className={`${theme === 'dark' ? 'text-white' : 'text-slate-900'} font-bold text-base`}>{notification.message}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MissionAttemptPage;