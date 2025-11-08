import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Load theme from localStorage or default to 'dark'
    return localStorage.getItem('cryptolab_theme') || 'dark';
  });

  useEffect(() => {
    // Save theme to localStorage whenever it changes
    localStorage.setItem('cryptolab_theme', theme);
  }, [theme]);

  const themes = {
    dark: {
      bg: 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900',
      text: 'text-white',
      textMuted: 'text-slate-400',
      card: 'bg-slate-800/50',
      cardBorder: 'border-slate-700/50',
      cardHover: 'hover:bg-slate-700/50',
      input: 'bg-slate-800 border-slate-600',
      inputFocus: 'focus:border-slate-500',
      header: 'bg-slate-900/80',
      glow: 'blur-3xl opacity-20',
      glowColors: ['bg-blue-500/20', 'bg-purple-500/20', 'bg-cyan-500/20']
    },
    light: {
      bg: 'bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100',
      text: 'text-slate-900',
      textMuted: 'text-slate-600',
      card: 'bg-white/80',
      cardBorder: 'border-slate-200',
      cardHover: 'hover:bg-white',
      input: 'bg-white border-slate-300',
      inputFocus: 'focus:border-blue-400',
      header: 'bg-white/80',
      glow: 'blur-3xl opacity-30',
      glowColors: ['bg-blue-400/30', 'bg-purple-400/30', 'bg-cyan-400/30']
    }
  };

  const currentTheme = themes[theme];

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, currentTheme, toggleTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};