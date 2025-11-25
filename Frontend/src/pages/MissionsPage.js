// Frontend/src/pages/MissionsPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trophy,
  Star,
  Key,
  Sparkles,
  Grid3x3,
  Zap,
  CheckCircle2,
  Sun,
  Moon,
  Lock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const MissionsPage = () => {
  const { user } = useAuth();
  const { theme, currentTheme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Mission metadata - MUST MATCH MissionAttemptPage.js exactly
  const missions = [
    {
      id: "affine_encrypt",
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
    {
      id: "vigenere_encrypt",
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
    {
      id: "affine_decrypt",
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
    {
      id: "affine_crack",
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
    {
      id: "vigenere_decrypt",
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
    {
      id: "playfair_encrypt",
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
  ];

  const handleMissionClick = (missionId) => {
    // Navigate to MissionAttemptPage with mission ID in state
    navigate('/mission-attempt', {
      state: { missionId: missionId }
    });
  };

  return (
    <div className={`min-h-screen ${currentTheme.bg} relative overflow-hidden`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute w-96 h-96 ${currentTheme.glowColors[1]} rounded-full ${currentTheme.glow} top-0 right-0 animate-pulse`}
        ></div>
      </div>

      <header
        className={`relative backdrop-blur-xl ${currentTheme.header} border-b ${currentTheme.cardBorder}`}
      >
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className={`px-4 py-2 ${
              theme === 'dark'
                ? 'bg-slate-700 hover:bg-slate-600'
                : 'bg-slate-200 hover:bg-slate-300'
            } rounded-xl ${currentTheme.text} font-bold transition-all`}
          >
            ← Back to Home
          </button>
          <div className="flex items-center space-x-3">
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
            <div
              className={`flex items-center space-x-2 px-4 py-2 ${
                theme === 'dark'
                  ? 'bg-purple-500/20 border-purple-500/40'
                  : 'bg-slate-100 border-slate-300'
              } border rounded-full`}
            >
              <Trophy
                className={`w-4 h-4 ${
                  theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
                }`}
              />
              <span className={`${currentTheme.text} font-bold`}>
                {user.stats.points} pts
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="relative max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1
            className={`text-5xl font-black mb-3 ${
              theme === 'dark' ? 'text-purple-400' : 'text-slate-800'
            }`}
          >
            MISSION CONTROL
          </h1>
          <p
            className={`text-lg ${
              theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            Complete challenges to level up your crypto skills
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div
            className={`backdrop-blur-xl ${currentTheme.card} border ${currentTheme.cardBorder} rounded-2xl p-6 text-center shadow-lg`}
          >
            <div
              className={`text-4xl font-black mb-2 ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent'
                  : 'text-slate-700'
              }`}
            >
              {user.stats.completedChallenges?.length || 0}
            </div>
            <div className={`${currentTheme.textMuted} text-sm`}>
              Completed
            </div>
          </div>
          <div
            className={`backdrop-blur-xl ${currentTheme.card} border ${currentTheme.cardBorder} rounded-2xl p-6 text-center shadow-lg`}
          >
            <div
              className={`text-4xl font-black mb-2 ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent'
                  : 'text-slate-700'
              }`}
            >
              {missions.length - (user.stats.completedChallenges?.length || 0)}
            </div>
            <div className={`${currentTheme.textMuted} text-sm`}>
              Remaining
            </div>
          </div>
          <div
            className={`backdrop-blur-xl ${currentTheme.card} border ${currentTheme.cardBorder} rounded-2xl p-6 text-center shadow-lg`}
          >
            <div
              className={`text-4xl font-black mb-2 ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent'
                  : 'text-slate-700'
              }`}
            >
              {missions.reduce(
                (sum, m) =>
                  user.stats.completedChallenges?.includes(m.id)
                    ? sum + m.points
                    : sum,
                0
              )}
            </div>
            <div className={`${currentTheme.textMuted} text-sm`}>
              Points Earned
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {missions.map((mission) => {
            const isCompleted = user.stats.completedChallenges?.includes(
              mission.id
            );
            const Icon = mission.icon;

            return (
              <div
                key={mission.id}
                className={`relative backdrop-blur-xl border-2 rounded-2xl p-6 transition-all hover:scale-105 shadow-lg cursor-pointer ${
                  isCompleted
                    ? theme === 'dark'
                      ? 'bg-green-500/10 border-green-500/50'
                      : 'bg-green-50 border-green-300'
                    : `${currentTheme.card} ${currentTheme.cardBorder}`
                }`}
              >
                {isCompleted && (
                  <div className="absolute -top-3 -right-3">
                    <div
                      className={`${
                        theme === 'dark'
                          ? 'bg-gradient-to-r from-green-600 to-teal-600'
                          : 'bg-gradient-to-r from-green-500 to-emerald-500'
                      } rounded-full p-2 border-4 ${
                        theme === 'dark'
                          ? 'border-slate-900'
                          : 'border-white'
                      } shadow-xl`}
                    >
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                  </div>
                )}

                <div className="flex items-start space-x-4 mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                      isCompleted
                        ? theme === 'dark'
                          ? 'bg-green-600'
                          : 'bg-green-500'
                        : theme === 'dark'
                        ? 'bg-purple-600'
                        : 'bg-slate-600'
                    }`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className={`text-xl font-bold ${currentTheme.text}`}>
                        {mission.title}
                      </h3>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          mission.difficulty === 'Novice'
                            ? theme === 'dark'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-green-100 text-green-700'
                            : mission.difficulty === 'Apprentice'
                            ? theme === 'dark'
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-blue-100 text-blue-700'
                            : mission.difficulty === 'Advanced'
                            ? theme === 'dark'
                              ? 'bg-purple-500/20 text-purple-400'
                              : 'bg-purple-100 text-purple-700'
                            : theme === 'dark'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {mission.difficulty}
                      </span>
                    </div>
                    <p className={`${currentTheme.textMuted} text-sm`}>
                      {mission.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Zap
                      className={`w-4 h-4 ${
                        theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
                      }`}
                    />
                    <span
                      className={`${
                        theme === 'dark'
                          ? 'text-amber-400'
                          : 'text-amber-600'
                      } font-bold`}
                    >
                      {mission.points} pts
                    </span>
                  </div>
                  {!isCompleted && (
                    <button
                      onClick={() => handleMissionClick(mission.id)}
                      className={`px-4 py-2 rounded-xl font-bold transition-all shadow-lg ${
                        theme === 'dark'
                          ? 'bg-purple-700 text-white hover:bg-purple-800 hover:shadow-purple-500/50'
                          : 'bg-slate-700 text-white hover:bg-slate-800 hover:shadow-slate-500/50'
                      }`}
                    >
                      Attempt Mission
                    </button>
                  )}
                  {isCompleted && (
                    <button
                      onClick={() => handleMissionClick(mission.id)}
                      className={`px-4 py-2 rounded-xl font-bold transition-all ${
                        theme === 'dark'
                          ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      ✓ Review
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div
          className={`mt-12 backdrop-blur-xl ${currentTheme.card} border ${currentTheme.cardBorder} rounded-2xl p-8 shadow-lg`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-xl font-bold ${currentTheme.text}`}>
              Overall Progress
            </h3>
            <span className={`${currentTheme.text} font-bold text-lg`}>
              {user.stats.completedChallenges?.length || 0} / {missions.length}
            </span>
          </div>
          <div
            className={`relative w-full h-6 ${
              theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'
            } rounded-full overflow-hidden`}
          >
            <div
              className={`absolute top-0 left-0 h-full ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-red-600'
                  : 'bg-gradient-to-r from-slate-600 via-slate-700 to-slate-800'
              } rounded-full transition-all duration-500`}
              style={{
                width: `${
                  ((user.stats.completedChallenges?.length || 0) / missions.length) *
                  100
                }%`
              }}
            ></div>
          </div>
          <p
            className={`${currentTheme.textMuted} text-sm mt-2 text-center`}
          >
            {(user.stats.completedChallenges?.length || 0) === missions.length
              ? '🎉 All missions completed! You are a Crypto Master!'
              : `Complete ${
                  missions.length - (user.stats.completedChallenges?.length || 0)
                } more missions to become a Crypto Master!`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MissionsPage;