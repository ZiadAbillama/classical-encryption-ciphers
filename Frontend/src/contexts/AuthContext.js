// Frontend/src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

// (Only used when backend sends no stats for a new user)
const DEFAULT_STATS = {
  points: 0,
  level: 1,
  combo: 0,
  bestCombo: 0,
  totalEncryptions: 0,
  totalDecryptions: 0,
  experiencedCiphers: [],
};

// Normalize user object WITHOUT resetting stats
function normalizeUser(raw) {
  if (!raw) return null;

  return {
    ...raw,
    stats: raw.stats
      ? { ...DEFAULT_STATS, ...raw.stats } // backend stats ALWAYS win
      : { ...DEFAULT_STATS },             // on new account only
  };
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on refresh
  useEffect(() => {
    try {
      const stored = localStorage.getItem("cryptolab_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(normalizeUser(parsed));
      }
    } catch {
      localStorage.removeItem("cryptolab_user");
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (userData) => {
    const normalized = normalizeUser(userData);
    setUser(normalized);
    localStorage.setItem("cryptolab_user", JSON.stringify(normalized));
  };

  const updateUser = (userData) => {
    const normalized = normalizeUser(userData);
    setUser(normalized);
    localStorage.setItem("cryptolab_user", JSON.stringify(normalized));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("cryptolab_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
