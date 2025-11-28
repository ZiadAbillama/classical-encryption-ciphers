import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trophy,
  Crown,
  Medal,
  Star,
  TrendingUp,
  Award,
  Target,
  Flame,
  Sun,
  Moon,
  Search,
  Filter,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3000';

const LeaderboardPage = () => {
  const { user } = useAuth();
  const { theme, currentTheme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [leaderboard, setLeaderboard] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('points');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/users/leaderboard`);
      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || 'Failed to fetch leaderboard');

      setLeaderboard(data.leaderboard);
    } catch (err) {
      console.error('Leaderboard fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Sort and filter leaderboard
  const filteredLeaderboard = leaderboard
    .filter(player => 
      player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'points':
          return b.points - a.points;
        case 'level':
          return b.level - a.level;
        case 'missions':
          return b.missionsCompleted - a.missionsCompleted;
        case 'combo':
          return b.bestCombo - a.bestCombo;
        default:
          return 0;
      }
    });

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-white" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-white" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-white" />;
    return <span className={`font-bold ${currentTheme.textMuted}`}>#{rank}</span>;
  };

  const getRankBadgeColor = (rank) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600';
    if (rank === 2) return 'bg-gradient-to-r from-slate-400 via-slate-500 to-slate-600';
    if (rank === 3) return 'bg-gradient-to-r from-orange-500 via-amber-600 to-orange-700';
    return theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200';
  };

  const currentUserRank = leaderboard.findIndex(p => p.id === user?.id) + 1;

  if (loading) {
    return (
      <div className={`min-h-screen ${currentTheme.bg} flex items-center justify-center`}>
        <div className="text-center">
          <Trophy className={`w-16 h-16 ${currentTheme.text} mx-auto mb-4 animate-pulse`} />
          <p className={`${currentTheme.text} text-xl font-bold`}>Loading Leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${currentTheme.bg} flex items-center justify-center`}>
        <div className="text-center">
          <p className="text-red-400 text-xl font-bold mb-4">Failed to load leaderboard</p>
          <button
            onClick={fetchLeaderboard}
            className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${currentTheme.bg} relative overflow-hidden`}>
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute w-96 h-96 ${currentTheme.glowColors[0]} rounded-full ${currentTheme.glow} -top-24 -left-16 animate-pulse`}
        />
        <div
          className={`absolute w-96 h-96 ${currentTheme.glowColors[1]} rounded-full ${currentTheme.glow} top-1/2 right-0 animate-pulse`}
          style={{ animationDelay: '1s' }}
        />
      </div>

      {/* Header */}
      <header
        className={`relative backdrop-blur-xl ${currentTheme.header} border-b ${currentTheme.cardBorder}`}
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className={`px-4 py-2 ${
              theme === 'dark'
                ? 'bg-slate-700 hover:bg-slate-600'
                : 'bg-white hover:bg-slate-100'
            } rounded-xl ${currentTheme.text} font-bold transition-all`}
          >
            ← Back
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
                  : 'bg-purple-100 border-purple-300'
              } border rounded-full`}
            >
              <Trophy
                className={`w-4 h-4 ${
                  theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
                }`}
              />
              <span className={`${currentTheme.text} font-bold`}>
                Rank #{currentUserRank || '—'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="relative max-w-7xl mx-auto px-4 py-12">
        {/* Title */}
        <div className="text-center mb-12">
          <h1
            className={`text-6xl font-black mb-4 ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-amber-400 via-orange-400 to-red-400'
                : 'bg-gradient-to-r from-amber-600 via-orange-600 to-red-600'
            } bg-clip-text text-transparent`}
          >
            LEADERBOARD
          </h1>
          <p className={`text-lg ${currentTheme.textMuted}`}>
            Compete with crypto enthusiasts worldwide
          </p>
        </div>

        {/* Your Rank Card */}
        {currentUserRank > 0 && (
          <div
            className={`mb-8 ${currentTheme.card} backdrop-blur-xl border-2 ${
              currentUserRank <= 3 ? 'border-amber-500/60' : currentTheme.cardBorder
            } rounded-2xl p-6 shadow-xl`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center ${getRankBadgeColor(currentUserRank)}`}
                >
                  {getRankIcon(currentUserRank)}
                </div>
                <div>
                  <p className={`${currentTheme.textMuted} text-sm uppercase tracking-wide`}>
                    Your Rank
                  </p>
                  <p className={`text-3xl font-black ${currentTheme.text}`}>
                    #{currentUserRank} <span className="text-lg font-normal">/ {leaderboard.length}</span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`${currentTheme.textMuted} text-sm`}>Total Points</p>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}`}>
                  {user?.stats?.points || 0}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${currentTheme.textMuted}`} />
            <input
              type="text"
              placeholder="Search players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-12 pr-4 py-3 rounded-xl border ${currentTheme.input} ${currentTheme.inputFocus} ${
                theme === 'dark'
                  ? 'text-slate-100 placeholder-slate-500'
                  : 'text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>

          {/* Sort */}
          <div className="relative">
            <Filter className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${currentTheme.textMuted}`} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`pl-12 pr-8 py-3 rounded-xl border ${currentTheme.input} ${currentTheme.inputFocus} ${
                theme === 'dark'
                  ? 'text-slate-100'
                  : 'text-slate-900'
              } appearance-none cursor-pointer`}
            >
              <option value="points">Sort by Points</option>
              <option value="level">Sort by Level</option>
              <option value="missions">Sort by Missions</option>
              <option value="combo">Sort by Best Combo</option>
            </select>
          </div>
        </div>

        {/* Top 3 Podium */}
        {filteredLeaderboard.length >= 3 && searchQuery === '' && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {/* 2nd Place */}
            <div className="pt-12">
              <PlayerCard 
                player={filteredLeaderboard[1]} 
                theme={theme} 
                currentTheme={currentTheme} 
                isCurrentUser={filteredLeaderboard[1].id === user?.id}
                isPodium={true}
              />
            </div>
            {/* 1st Place */}
            <div>
              <PlayerCard 
                player={filteredLeaderboard[0]} 
                theme={theme} 
                currentTheme={currentTheme} 
                isCurrentUser={filteredLeaderboard[0].id === user?.id}
                isPodium={true}
              />
            </div>
            {/* 3rd Place */}
            <div className="pt-12">
              <PlayerCard 
                player={filteredLeaderboard[2]} 
                theme={theme} 
                currentTheme={currentTheme} 
                isCurrentUser={filteredLeaderboard[2].id === user?.id}
                isPodium={true}
              />
            </div>
          </div>
        )}

        {/* Rest of Leaderboard */}
        <div className="space-y-3">
          {filteredLeaderboard.slice(searchQuery === '' ? 3 : 0).map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              theme={theme}
              currentTheme={currentTheme}
              isCurrentUser={player.id === user?.id}
            />
          ))}
        </div>

        {filteredLeaderboard.length === 0 && (
          <div className="text-center py-12">
            <p className={`${currentTheme.textMuted} text-lg`}>No players found</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Player Card Component
const PlayerCard = ({ player, theme, currentTheme, isCurrentUser, isPodium = false }) => {
  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-8 h-8 text-white" />;
    if (rank === 2) return <Medal className="w-7 h-7 text-white" />;
    if (rank === 3) return <Medal className="w-7 h-7 text-white" />;
    return <span className={`text-2xl font-bold ${currentTheme.textMuted}`}>#{rank}</span>;
  };

  const getRankBadgeColor = (rank) => {
    if (rank === 1) return 'from-yellow-500 via-amber-500 to-yellow-600';
    if (rank === 2) return 'from-slate-400 via-slate-500 to-slate-600';
    if (rank === 3) return 'from-orange-500 via-amber-600 to-orange-700';
    return theme === 'dark' ? 'from-slate-600 to-slate-700' : 'from-slate-300 to-slate-400';
  };

  if (isPodium) {
    return (
      <div
        className={`${currentTheme.card} backdrop-blur-xl border-2 ${
          player.rank <= 3 ? 'border-amber-500/60 shadow-2xl' : currentTheme.cardBorder
        } rounded-2xl p-6 ${isCurrentUser ? 'ring-4 ring-cyan-500/50' : ''}`}
      >
        <div className="text-center">
          <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br ${getRankBadgeColor(player.rank)} flex items-center justify-center shadow-xl`}>
            {getRankIcon(player.rank)}
          </div>
          <div className={`w-16 h-16 mx-auto mb-3 rounded-full ${
            theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100'
          } border-4 ${currentTheme.cardBorder} flex items-center justify-center font-bold text-2xl ${currentTheme.text}`}>
            {player.avatar || player.name.charAt(0).toUpperCase()}
          </div>
          <h3 className={`text-lg font-bold ${currentTheme.text} mb-1`}>
            {player.name}
            {isCurrentUser && <span className="ml-2 text-cyan-400">(You)</span>}
          </h3>
          <div className="grid grid-cols-2 gap-2 mt-4">
            <StatBadge icon={Trophy} value={player.points} label="Points" theme={theme} />
            <StatBadge icon={Crown} value={player.level} label="Level" theme={theme} />
            <StatBadge icon={Target} value={player.missionsCompleted} label="Missions" theme={theme} />
            <StatBadge icon={Flame} value={player.bestCombo} label="Combo" theme={theme} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${currentTheme.card} backdrop-blur-xl border ${currentTheme.cardBorder} rounded-xl p-4 hover:scale-[1.02] transition-all ${
        isCurrentUser ? 'ring-2 ring-cyan-500/50 shadow-xl' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          {/* Rank */}
          <div className="w-12 text-center">
            {getRankIcon(player.rank)}
          </div>

          {/* Avatar */}
          <div
            className={`w-12 h-12 rounded-full ${
              theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'
            } flex items-center justify-center font-bold ${currentTheme.text}`}
          >
            {player.avatar || player.name.charAt(0).toUpperCase()}
          </div>

          {/* Name and Stats */}
          <div className="flex-1">
            <h3 className={`font-bold ${currentTheme.text}`}>
              {player.name}
              {isCurrentUser && <span className="ml-2 text-cyan-400 text-sm">(You)</span>}
            </h3>
            <p className={`text-xs ${currentTheme.textMuted}`}>
              Level {player.level} • {player.missionsCompleted} missions
            </p>
          </div>

          {/* Points */}
          <div className="text-right">
            <div className="flex items-center space-x-2">
              <Trophy className={`w-4 h-4 ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}`} />
              <span className={`text-xl font-bold ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}`}>
                {player.points}
              </span>
            </div>
            <p className={`text-xs ${currentTheme.textMuted}`}>points</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Small stat badge for podium
const StatBadge = ({ icon: Icon, value, label, theme }) => (
  <div className={`${theme === 'dark' ? 'bg-slate-800/60' : 'bg-slate-100'} rounded-lg p-2`}>
    <div className="flex items-center justify-center space-x-1 mb-1">
      <Icon className={`w-3 h-3 ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`} />
      <span className={`font-bold text-sm ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
        {value}
      </span>
    </div>
    <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
      {label}
    </p>
  </div>
);

export default LeaderboardPage;
