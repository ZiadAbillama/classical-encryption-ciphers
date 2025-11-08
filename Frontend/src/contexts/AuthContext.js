import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('cryptolab_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    const userWithStats = {
      ...userData,
      stats: {
        points: 0,
        level: 1,
        streak: 0,
        completedChallenges: [],
        achievements: [],
        totalEncryptions: 0,
        totalDecryptions: 0,
        experiencedCiphers: [],
        combo: 0,
        bestCombo: 0
      }
    };
    setUser(userWithStats);
    localStorage.setItem('cryptolab_user', JSON.stringify(userWithStats));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cryptolab_user');
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('cryptolab_user', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};