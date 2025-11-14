// Frontend/src/pages/CipherLabPage.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Lock, Unlock, Key, Grid3x3, Hash, Calculator, Copy, Check, Zap,
  Trophy, Sparkles, CheckCircle2, Sun, Moon, Flame
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:3000";

// POST JSON helper
async function postJSON(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

// PATCH stats → backend
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

const CipherLabPage = () => {
  const { user, updateUser } = useAuth();
  const { theme, currentTheme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Default stats + backend stats
  const stats = {
    points: 0,
    level: 1,
    combo: 0,
    bestCombo: 0,
    totalEncryptions: 0,
    totalDecryptions: 0,
    experiencedCiphers: [],
    ...(user?.stats || {}),
  };

  const [selectedCipher, setSelectedCipher] = useState(null);
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [mode, setMode] = useState("encrypt");
  const [notification, setNotification] = useState(null);
  const [recentReward, setRecentReward] = useState(null);

  // COPY state
  const [copied, setCopied] = useState(false);

  // Cipher state
  const [affineA, setAffineA] = useState(5);
  const [affineB, setAffineB] = useState(8);
  const [affineCrackE, setAffineCrackE] = useState("E");
  const [affineCrackT, setAffineCrackT] = useState("T");
  const [showCrack, setShowCrack] = useState(false);

  const [monoKey, setMonoKey] = useState("QWERTYUIOPASDFGHJKLZXCVBNM");
  const [vigenereKey, setVigenereKey] = useState("KEY");

  const [playfairKey, setPlayfairKey] = useState("MONARCHY");
  const [playfairMatrix, setPlayfairMatrix] = useState([]);

  const HILL_DEFAULT_2 = [[3, 3], [2, 5]];
  const HILL_DEFAULT_3 = [[6, 24, 1], [13, 16, 10], [20, 17, 15]];

  const [hillSize, setHillSize] = useState(3);
  const [hillMatrix, setHillMatrix] = useState(HILL_DEFAULT_3);
  const [hillInverse, setHillInverse] = useState(null);

  const [euclidA, setEuclidA] = useState(15);
  const [euclidM, setEuclidM] = useState(26);
  const [euclidResult, setEuclidResult] = useState("");

  // -------- Hill helpers (needed for UI) --------
  const onHillSizeChange = (size) => {
    setHillSize(size);
    setHillMatrix(size === 2 ? HILL_DEFAULT_2 : HILL_DEFAULT_3);
    setHillInverse(null);
    setOutputText("");
  };

  const updateHillCell = (r, c, val) => {
    const m = hillMatrix.map((row) => row.slice());
    const num = Number(val);
    m[r][c] = Number.isFinite(num) ? num : 0;
    setHillMatrix(m);
  };

  // Cipher list
  const ciphers = [
    {
      id: "affine",
      name: "Affine Cipher",
      icon: Hash,
      description: "Mathematical magic with C = aP + b (mod 26)",
      gradient:
        theme === "dark"
          ? "from-cyan-600 via-blue-700 to-blue-800"
          : "from-cyan-400 via-blue-500 to-blue-600",
    },
    {
      id: "mono",
      name: "Mono-Alphabetic",
      icon: Key,
      description: "Classic substitution with your custom alphabet",
      gradient:
        theme === "dark"
          ? "from-purple-600 via-purple-700 to-pink-800"
          : "from-purple-400 via-purple-500 to-pink-600",
    },
    {
      id: "vigenere",
      name: "Vigenère Cipher",
      icon: Lock,
      description: "Polyalphabetic powerhouse with keyword magic",
      gradient:
        theme === "dark"
          ? "from-green-600 via-emerald-700 to-teal-800"
          : "from-green-400 via-emerald-500 to-teal-600",
    },
    {
      id: "playfair",
      name: "Playfair Cipher",
      icon: Grid3x3,
      description: "Digraph encryption with 5×5 matrix wizardry",
      gradient:
        theme === "dark"
          ? "from-orange-600 via-red-700 to-red-800"
          : "from-orange-400 via-red-500 to-red-600",
    },
    {
      id: "hill",
      name: "Hill Cipher",
      icon: Grid3x3,
      description: "Linear algebra meets cryptography",
      gradient:
        theme === "dark"
          ? "from-indigo-600 via-purple-700 to-purple-800"
          : "from-indigo-400 via-purple-500 to-purple-600",
    },
    {
      id: "euclid",
      name: "Extended Euclid",
      icon: Calculator,
      description: "Foundation of modular arithmetic",
      gradient:
        theme === "dark"
          ? "from-amber-600 via-orange-700 to-orange-800"
          : "from-amber-400 via-orange-500 to-orange-600",
    },
  ];

  const showNotification = (msg, type = "info") => {
    setNotification({ message: msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // COPY
  const copyToClipboard = async () => {
    if (outputText || euclidResult) {
      await navigator.clipboard.writeText(outputText || euclidResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Always read the freshest stats (avoid stale closure on `user`)
  function getFreshStats(user, fallbackStats) {
    try {
      const raw = localStorage.getItem("cryptolab_user");
      if (raw) {
        const storedUser = JSON.parse(raw);
        return (storedUser && storedUser.stats) || user?.stats || fallbackStats;
      }
    } catch (e) {
      console.warn("Failed to read cryptolab_user from localStorage", e);
    }
    return user?.stats || fallbackStats;
  }

  // ================================
  // FIXED VERSION OF awardPoints()
  // ================================
  const awardPoints = async (amount, reason) => {
    const current = getFreshStats(user, stats);

    const newPoints = current.points + amount;
    const newLevel = Math.floor(newPoints / 500) + 1;
    const newCombo = current.combo + 1;

    const newStats = {
      ...current,
      points: newPoints,
      level: newLevel,
      combo: newCombo,
      bestCombo: Math.max(newCombo, current.bestCombo),
    };

    try {
      const saved = await saveStatsToBackend(user, newStats);
      if (saved) {
        updateUser({ ...user, stats: saved });
      }
    } catch (err) {
      console.error("Failed to save award stats", err);
    }

    setRecentReward({ points: amount, reason });
    setTimeout(() => setRecentReward(null), 1800);

    if (newLevel > current.level) {
      showNotification(`LEVEL UP! You're now level ${newLevel}!`, "levelup");
    }
  };

  // ================================
  // increment encrypt/decrypt
  // ================================
  const incrementActionStats = async (cipherId) => {
    const current = getFreshStats(user, stats);

    const newStats = {
      ...current,
      totalEncryptions:
        mode === "encrypt"
          ? current.totalEncryptions + 1
          : current.totalEncryptions,
      totalDecryptions:
        mode === "decrypt"
          ? current.totalDecryptions + 1
          : current.totalDecryptions,
      experiencedCiphers: current.experiencedCiphers.includes(cipherId)
        ? current.experiencedCiphers
        : [...current.experiencedCiphers, cipherId],
    };

    try {
      const saved = await saveStatsToBackend(user, newStats);
      if (saved) {
        updateUser({ ...user, stats: saved });
      }
    } catch (err) {
      console.error("Failed to save updated action stats", err);
    }
  };

  // ================================
  // HANDLE PROCESS
  // ================================
  const handleProcess = async () => {
    if (!selectedCipher) return;

    try {
      let result = "";

      switch (selectedCipher) {
        // AFFINE
        case "affine": {
          if (showCrack) {
            const r = await postJSON("/api/affine/crack", {
              text: inputText,
              plain1: affineCrackE,
              plain2: affineCrackT,
            });
            if (r.preview) {
              result = r.preview;
            } else if (Array.isArray(r.candidates) && r.candidates[0]) {
              result = r.candidates[0].preview;
            } else {
              result = "";
            }
            setOutputText(result);
            showNotification("Cracked successfully!", "success");
            return;
          }

          const endpoint =
            mode === "encrypt"
              ? "/api/affine/encrypt"
              : "/api/affine/decrypt";
          const r = await postJSON(endpoint, {
            text: inputText,
            a: affineA,
            b: affineB,
          });
          result = r.result;
          break;
        }

        // MONO
        case "mono": {
          if (monoKey.length !== 26) {
            showNotification("Key must be 26 characters!", "error");
            return;
          }
          const endpoint =
            mode === "encrypt" ? "/api/mono/encrypt" : "/api/mono/decrypt";
          const r = await postJSON(endpoint, { text: inputText, key: monoKey });
          result = r.result;
          break;
        }

        // VIGENERE
        case "vigenere": {
          if (!vigenereKey) {
            showNotification("Enter a key!", "error");
            return;
          }
          const endpoint =
            mode === "encrypt"
              ? "/api/vigenere/encrypt"
              : "/api/vigenere/decrypt";
          const r = await postJSON(endpoint, {
            text: inputText,
            key: vigenereKey,
          });
          result = r.result;
          break;
        }

        // PLAYFAIR
        case "playfair": {
          const endpoint =
            mode === "encrypt"
              ? "/api/playfair/encrypt"
              : "/api/playfair/decrypt";
          const r = await postJSON(endpoint, {
            text: inputText,
            key: playfairKey,
          });
          setPlayfairMatrix(r.matrix || []);
          result = r.result;
          break;
        }

        // HILL
        case "hill": {
          const endpoint =
            mode === "encrypt" ? "/api/hill/encrypt" : "/api/hill/decrypt";
          const r = await postJSON(endpoint, {
            text: inputText,
            keyMat: hillMatrix,
          });
          setHillInverse(r.inverse || null);
          result = r.result;
          break;
        }

        // EUCLID
        case "euclid": {
          if (!Number.isInteger(euclidA)) {
            showNotification("a must be an integer", "error");
            return;
          }
          if (!Number.isInteger(euclidM) || euclidM === 0) {
            showNotification("m must be nonzero integer", "error");
            return;
          }

          const r = await postJSON("/api/euclid", { a: euclidA, m: euclidM });
          const absM = Math.abs(euclidM);
          const inv =
            r.inverse === null
              ? null
              : ((r.inverse % absM) + absM) % absM;

          setEuclidResult(
            `GCD(${euclidA}, ${euclidM}) = ${r.gcd}\n` +
              (r.gcd === 1
                ? `✓ Inverse: ${inv} (mod ${euclidM})`
                : `✗ No inverse; gcd ≠ 1`) +
              `\nBezout: ${euclidA}*${r.coefficients.x} + ${euclidM}*${r.coefficients.y} = ${r.gcd}`
          );

          await incrementActionStats("euclid");
          await awardPoints(50, "Calculation");
          return;
        }

        default:
          return;
      }

      // Show result
      setOutputText(result);

      // Update counters
      await incrementActionStats(selectedCipher);

      // Give points
      const current = getFreshStats(user, stats);
      const base = mode === "encrypt" ? 25 : 35;
      const comboBonus = current.combo * 5;
      await awardPoints(
        base + comboBonus,
        mode === "encrypt" ? "Encrypted" : "Decrypted"
      );
    } catch (err) {
      console.error(err);
      showNotification(err.message || "Error", "error");
    }
  };

  // Helpers (matrix / matrix preview refresh)
  useEffect(() => {
    const fetchHelpers = async () => {
      try {
        if (selectedCipher === "playfair" && playfairKey) {
          const r = await postJSON("/api/playfair/encrypt", {
            text: "",
            key: playfairKey,
          });
          setPlayfairMatrix(r.matrix || []);
        }

        if (selectedCipher === "hill") {
          setHillInverse(null);
          const r = await postJSON("/api/hill/encrypt", {
            text: "",
            keyMat: hillMatrix,
          });
          setHillInverse(r.inverse || null);
        }
      } catch (e) {
        if (selectedCipher === "hill") {
          setHillInverse(null);
          showNotification("Key is not invertible (mod 26)", "error");
        }
      }
    };
    fetchHelpers();
  }, [playfairKey, hillMatrix, hillSize, selectedCipher, mode]);

  // -------- FULL CONTROLS (all ciphers) --------
  const renderCipherControls = () => {
    switch (selectedCipher) {
      case "affine":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-bold ${currentTheme.text}`}>
                Configuration
              </h3>
              <button
                onClick={() => {
                  setShowCrack((prev) => {
                    const next = !prev;
                    if (next) {
                      setInputText("");
                      setOutputText("");
                    }
                    return next;
                  });
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  showCrack
                    ? "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg"
                    : theme === "dark"
                    ? "bg-slate-700 text-slate-200 hover:bg-slate-600"
                    : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                }`}
              >
                {showCrack ? "🔓 Crack Mode" : "🔐 Normal Mode"}
              </button>
            </div>

            {showCrack ? (
              <div className="space-y-4">
                <div
                  className={`border-2 rounded-xl p-4 ${
                    theme === "dark"
                      ? "bg-red-500/10 border-red-500/30"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-3">
                    <Sparkles
                      className={`w-5 h-5 ${
                        theme === "dark" ? "text-red-400" : "text-red-600"
                      }`}
                    />
                    <span
                      className={`font-bold ${
                        theme === "dark" ? "text-red-400" : "text-red-700"
                      }`}
                    >
                      Frequency Analysis Crack
                    </span>
                  </div>
                  <p className={`${currentTheme.textMuted} text-sm mb-4`}>
                    Enter the two most frequent letters in the ciphertext
                    (defaults: E and T)
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        className={`${currentTheme.textMuted} text-sm mb-2`}
                      >
                        Most Frequent
                      </label>
                      <input
                        type="text"
                        maxLength={1}
                        value={affineCrackE}
                        onChange={(e) =>
                          setAffineCrackE(e.target.value.toUpperCase())
                        }
                        className={`w-full ${currentTheme.input} ${currentTheme.inputFocus} border-2 rounded-lg px-4 py-2 ${currentTheme.text} text-center text-2xl font-bold focus:outline-none`}
                      />
                    </div>
                    <div>
                      <label
                        className={`${currentTheme.textMuted} text-sm mb-2`}
                      >
                        Second Most Frequent
                      </label>
                      <input
                        type="text"
                        maxLength={1}
                        value={affineCrackT}
                        onChange={(e) =>
                          setAffineCrackT(e.target.value.toUpperCase())
                        }
                        className={`w-full ${currentTheme.input} ${currentTheme.inputFocus} border-2 rounded-lg px-4 py-2 ${currentTheme.text} text-center text-2xl font-bold focus:outline-none`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      className={`${currentTheme.textMuted} text-sm mb-2 font-medium`}
                    >
                      Multiplier (a)
                    </label>
                    <input
                      type="number"
                      value={affineA}
                      onChange={(e) =>
                        setAffineA(parseInt(e.target.value) || 1)
                      }
                      className={`w-full ${currentTheme.input} ${currentTheme.inputFocus} border-2 rounded-lg px-4 py-3 ${currentTheme.text} font-bold text-lg focus:outline-none transition-all`}
                    />
                  </div>
                  <div>
                    <label
                      className={`${currentTheme.textMuted} text-sm mb-2 font-medium`}
                    >
                      Shift (b)
                    </label>
                    <input
                      type="number"
                      value={affineB}
                      onChange={(e) =>
                        setAffineB(parseInt(e.target.value) || 0)
                      }
                      className={`w-full ${currentTheme.input} ${currentTheme.inputFocus} border-2 rounded-lg px-4 py-3 ${currentTheme.text} font-bold text-lg focus:outline-none transition-all`}
                    />
                  </div>
                </div>
                <div
                  className={`${
                    theme === "dark"
                      ? "bg-cyan-500/10 border-cyan-500/30"
                      : "bg-cyan-50 border-cyan-200"
                  } border-2 rounded-xl p-4`}
                >
                  <div
                    className={`${
                      theme === "dark" ? "text-cyan-400" : "text-cyan-700"
                    } font-mono text-lg`}
                  >
                    C = ({affineA} × P + {affineB}) mod 26
                  </div>
                </div>
              </>
            )}
          </div>
        );

      case "mono":
        return (
          <div className="space-y-4">
            <div>
              <label
                className={`block ${currentTheme.textMuted} text-sm mb-2 font-medium`}
              >
                Substitution Alphabet (26 unique letters)
              </label>
              <input
                type="text"
                value={monoKey}
                onChange={(e) =>
                  setMonoKey(e.target.value.toUpperCase().slice(0, 26))
                }
                maxLength={26}
                className={`w-full ${currentTheme.input} ${currentTheme.inputFocus} border-2 rounded-lg px-4 py-3 ${currentTheme.text} font-mono text-lg tracking-wider focus:outline-none transition-all`}
              />
              <div className="flex items-center justify-between mt-2">
                <span
                  className={`text-sm font-medium ${
                    monoKey.length === 26 ? "text-green-500" : "text-amber-500"
                  }`}
                >
                  {monoKey.length}/26 characters
                </span>
                {monoKey.length === 26 && (
                  <span className="flex items-center text-green-500 text-sm">
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Valid key!
                  </span>
                )}
              </div>
            </div>
            <div
              className={`${
                theme === "dark"
                  ? "bg-purple-500/10 border-purple-500/30"
                  : "bg-purple-50 border-purple-200"
              } border-2 rounded-xl p-4`}
            >
              <div
                className={`${currentTheme.textMuted} text-xs mb-2`}
              >
                ALPHABET
              </div>
              <div
                className={`${currentTheme.text} font-mono text-sm tracking-wider`}
              >
                ABCDEFGHIJKLMNOPQRSTUVWXYZ
              </div>
              <div
                className={`${currentTheme.textMuted} text-xs mt-2 mb-2`}
              >
                YOUR KEY
              </div>
              <div
                className={`${
                  theme === "dark" ? "text-purple-400" : "text-purple-700"
                } font-mono text-sm tracking-wider`}
              >
                {monoKey || "..."}
              </div>
            </div>
          </div>
        );

      case "vigenere":
        return (
          <div className="space-y-4">
            <div>
              <label
                className={`block ${currentTheme.textMuted} text-sm mb-2 font-medium`}
              >
                Keyword
              </label>
              <input
                type="text"
                value={vigenereKey}
                onChange={(e) => setVigenereKey(e.target.value)}
                className={`w-full ${currentTheme.input} ${currentTheme.inputFocus} border-2 rounded-lg px-4 py-3 ${currentTheme.text} font-bold text-lg tracking-wide focus:outline-none transition-all`}
                placeholder="Enter your keyword..."
              />
            </div>
            <div
              className={`${
                theme === "dark"
                  ? "bg-green-500/10 border-green-500/30"
                  : "bg-green-50 border-green-200"
              } border-2 rounded-xl p-4`}
            >
              <div className="flex items-center space-x-2 mb-2">
                <Key
                  className={`w-5 h-5 ${
                    theme === "dark" ? "text-green-400" : "text-green-600"
                  }`}
                />
                <span
                  className={`${
                    theme === "dark" ? "text-green-400" : "text-green-700"
                  } font-bold`}
                >
                  Repeating Key
                </span>
              </div>
              <div className={`${currentTheme.textMuted} text-sm`}>
                Your keyword repeats throughout the message for polyalphabetic
                substitution
              </div>
            </div>
          </div>
        );

      case "playfair":
        return (
          <div className="space-y-4">
            <div>
              <label
                className={`block ${currentTheme.textMuted} text-sm mb-2 font-medium`}
              >
                Matrix Keyword
              </label>
              <input
                type="text"
                value={playfairKey}
                onChange={(e) => setPlayfairKey(e.target.value)}
                className={`w-full ${currentTheme.input} ${currentTheme.inputFocus} border-2 rounded-lg px-4 py-3 ${currentTheme.text} font-bold text-lg focus:outline-none transition-all`}
              />
            </div>
            {playfairMatrix.length === 5 && (
              <div
                className={`${
                  theme === "dark"
                    ? "bg-orange-500/10 border-orange-500/30"
                    : "bg-orange-50 border-orange-200"
                } border-2 rounded-xl p-6`}
              >
                <div
                  className={`${
                    theme === "dark" ? "text-orange-400" : "text-orange-700"
                  } font-bold mb-4 flex items-center`}
                >
                  <Grid3x3 className="w-5 h-5 mr-2" />
                  5×5 Playfair Matrix
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {playfairMatrix.map((row, i) =>
                    row.map((cell, j) => (
                      <div
                        key={`${i}-${j}`}
                        className={`${
                          theme === "dark"
                            ? "bg-orange-500/20 border-orange-500/40"
                            : "bg-orange-100 border-orange-300"
                        } border-2 rounded-lg h-12 flex items-center justify-center ${currentTheme.text} font-bold text-lg hover:scale-110 transition-transform`}
                      >
                        {cell.toUpperCase()}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        );

      case "hill":
        return (
          <div className="space-y-4">
            <div>
              <label
                className={`block ${currentTheme.textMuted} text-sm mb-2 font-medium`}
              >
                Matrix Size
              </label>
              <select
                value={hillSize}
                onChange={(e) => onHillSizeChange(parseInt(e.target.value))}
                className={`w-full ${currentTheme.input} ${currentTheme.inputFocus} border-2 rounded-lg px-4 py-3 ${currentTheme.text} font-bold focus:outline-none`}
              >
                <option value={2}>2×2 Matrix</option>
                <option value={3}>3×3 Matrix</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Editable Key Matrix */}
              <div
                className={`${
                  theme === "dark"
                    ? "bg-indigo-500/10 border-indigo-500/30"
                    : "bg-indigo-50 border-indigo-200"
                } border-2 rounded-xl p-4`}
              >
                <div
                  className={`${
                    theme === "dark" ? "text-indigo-400" : "text-indigo-700"
                  } font-bold mb-3 flex items-center`}
                >
                  <Grid3x3 className="w-4 h-4 mr-2" />
                  Key Matrix
                </div>

                <div
                  className="grid gap-2"
                  style={{
                    gridTemplateColumns: `repeat(${hillSize}, minmax(0, 1fr))`,
                  }}
                >
                  {hillMatrix.map((row, r) =>
                    row.map((val, c) => (
                      <input
                        key={`${r}-${c}`}
                        type="number"
                        step="1"
                        value={val}
                        onChange={(e) =>
                          updateHillCell(r, c, e.target.value)
                        }
                        className={`text-center ${currentTheme.input} ${currentTheme.inputFocus} border-2 rounded-lg px-3 py-2 ${currentTheme.text} font-mono`}
                      />
                    ))
                  )}
                </div>

                <div className={`${currentTheme.textMuted} text-xs mt-3`}>
                  You can enter any integers (negatives allowed). Values are
                  taken mod 26.
                </div>
              </div>

              {/* Inverse panel */}
              <div
                className={`${
                  theme === "dark"
                    ? "bg-purple-500/10 border-purple-500/30"
                    : "bg-purple-50 border-purple-200"
                } border-2 rounded-xl p-4`}
              >
                <div
                  className={`${
                    theme === "dark" ? "text-purple-400" : "text-purple-700"
                  } font-bold mb-3 flex items-center`}
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  Inverse
                </div>
                <pre
                  className={`${currentTheme.text} font-mono text-sm leading-relaxed`}
                >
                  {Array.isArray(hillInverse)
                    ? hillInverse
                        .map((row) => `[ ${row.join("  ")} ]`)
                        .join("\n")
                    : "Not invertible for mod 26"}
                </pre>
              </div>
            </div>

            <div className={`${currentTheme.textMuted} text-xs`}>
              If the key isn’t invertible (det not coprime with 26), an error
              appears and inverse shows “Not invertible”.
            </div>
          </div>
        );

      case "euclid":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  className={`block ${currentTheme.textMuted} text-sm mb-2 font-medium`}
                >
                  Integer (a)
                </label>
                <input
                  type="number"
                  step="1"
                  value={euclidA}
                  onChange={(e) => setEuclidA(Number(e.target.value))}
                  className={`w-full ${currentTheme.input} ${currentTheme.inputFocus} border-2 rounded-lg px-4 py-3 ${currentTheme.text} font-bold text-lg focus:outline-none`}
                />
              </div>
              <div>
                <label
                  className={`block ${currentTheme.textMuted} text-sm mb-2 font-medium`}
                >
                  Modulo (m)
                </label>
                <input
                  type="number"
                  step="1"
                  value={euclidM}
                  onChange={(e) => setEuclidM(Number(e.target.value))}
                  className={`w-full ${currentTheme.input} ${currentTheme.inputFocus} border-2 rounded-lg px-4 py-3 ${currentTheme.text} font-bold text-lg focus:outline-none`}
                />
              </div>
            </div>
            {euclidResult && (
              <div
                className={`${
                  theme === "dark"
                    ? "bg-amber-500/10 border-amber-500/30"
                    : "bg-amber-50 border-amber-200"
                } border-2 rounded-xl p-4`}
              >
                <div
                  className={`${
                    theme === "dark" ? "text-amber-400" : "text-amber-700"
                  } font-bold mb-3`}
                >
                  Result
                </div>
                <pre
                  className={`${currentTheme.text} font-mono text-sm whitespace-pre-wrap leading-relaxed`}
                >
                  {euclidResult}
                </pre>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const cipher = ciphers.find((c) => c.id === selectedCipher);

  // MAIN RETURN
  return (
    <div className={`min-h-screen ${currentTheme.bg} relative overflow-hidden`}>
      {/* HEADER */}
      <header
        className={`backdrop-blur-xl ${currentTheme.header} border-b ${currentTheme.cardBorder}`}
      >
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                if (selectedCipher) {
                  setSelectedCipher(null);
                  setInputText("");
                  setOutputText("");
                  setEuclidResult("");
                  setShowCrack(false);
                } else {
                  navigate("/");
                }
              }}
              className={`px-4 py-2 rounded-xl font-bold ${
                theme === "dark"
                  ? "bg-slate-700 hover:bg-slate-600"
                  : "bg-slate-200 hover:bg-slate-300"
              } ${currentTheme.text}`}
            >
              ← {selectedCipher ? "Back to Ciphers" : "Home"}
            </button>

            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className={`p-2 border rounded-xl ${
                  theme === "dark"
                    ? "bg-slate-700 hover:bg-slate-600"
                    : "bg-white hover:bg-slate-100"
                } ${currentTheme.cardBorder}`}
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5 text-amber-400" />
                ) : (
                  <Moon className="w-5 h-5 text-slate-700" />
                )}
              </button>

              {stats.combo > 0 && (
                <div
                  className={`flex items-center px-4 py-2 border rounded-full ${
                    theme === "dark"
                      ? "bg-orange-500/30 border-orange-500"
                      : "bg-orange-100 border-orange-300"
                  }`}
                >
                  <Flame
                    className={`w-4 h-4 ${
                      theme === "dark" ? "text-orange-400" : "text-orange-600"
                    }`}
                  />
                  <span className={`${currentTheme.text} font-bold ml-2`}>
                    {stats.combo}x Combo
                  </span>
                </div>
              )}

              <div
                className={`flex items-center px-4 py-2 border rounded-full ${
                  theme === "dark"
                    ? "bg-green-500/20 border-green-500/40"
                    : "bg-green-100 border-green-300"
                }`}
              >
                <Trophy
                  className={`w-4 h-4 ${
                    theme === "dark" ? "text-amber-400" : "text-amber-600"
                  }`}
                />
                <span className={`${currentTheme.text} font-bold ml-2`}>
                  {stats.points}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {!selectedCipher ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ciphers.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCipher(c.id)}
                className={`group backdrop-blur-xl ${currentTheme.card} border ${currentTheme.cardBorder}
                            rounded-2xl p-6 shadow-lg hover:scale-105 transition`}
              >
                <div className="flex items-center justify-between">
                  {stats.experiencedCiphers.includes(c.id) && (
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  )}
                </div>

                <div className="flex flex-col items-center mt-3">
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-r ${c.gradient}`}
                  >
                    {React.createElement(c.icon, {
                      className: "w-8 h-8 text-white",
                    })}
                  </div>

                  <h3 className={`mt-3 font-bold ${currentTheme.text}`}>
                    {c.name}
                  </h3>
                  <p className={`${currentTheme.textMuted} text-sm`}>
                    {c.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            <div
              className={`backdrop-blur-xl ${currentTheme.card} border ${currentTheme.cardBorder} rounded-2xl p-8 shadow-lg`}
            >
              <div className="flex items-center space-x-4 mb-6">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-r ${cipher.gradient}`}
                >
                  {React.createElement(cipher.icon, {
                    className: "w-8 h-8 text-white",
                  })}
                </div>
                <div>
                  <h2 className={`text-3xl font-black ${currentTheme.text}`}>
                    {cipher.name}
                  </h2>
                  <p className={`${currentTheme.textMuted}`}>
                    {cipher.description}
                  </p>
                </div>
              </div>

              {selectedCipher !== "euclid" && !showCrack && (
                <div className="flex space-x-3 mb-6">
                  <button
                    onClick={() => {
                      setMode("encrypt");
                      setInputText("");
                      setOutputText("");
                    }}
                    className={`flex-1 py-3 px-6 rounded-xl font-bold ${
                      mode === "encrypt"
                        ? `bg-gradient-to-r ${cipher.gradient} text-white`
                        : theme === "dark"
                        ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                        : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                    }`}
                  >
                    <Lock className="w-5 h-5 inline mr-1" /> Encrypt
                  </button>

                  <button
                    onClick={() => {
                      setMode("decrypt");
                      setInputText("");
                      setOutputText("");
                    }}
                    className={`flex-1 py-3 px-6 rounded-xl font-bold ${
                      mode === "decrypt"
                        ? `bg-gradient-to-r ${cipher.gradient} text-white`
                        : theme === "dark"
                        ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                        : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                    }`}
                  >
                    <Unlock className="w-5 h-5 inline mr-1" /> Decrypt
                  </button>
                </div>
              )}

              <div className="mb-6">{renderCipherControls()}</div>

              {selectedCipher !== "euclid" && (
                <div className="space-y-4">
                  <div>
                    <label
                      className={`block ${currentTheme.text} font-bold mb-2`}
                    >
                      Input Text
                    </label>
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className={`w-full h-32 border-2 rounded-xl px-4 py-3 ${currentTheme.input} ${currentTheme.text}`}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label
                        className={`block ${currentTheme.text} font-bold`}
                      >
                        Output Text
                      </label>
                      {(outputText || euclidResult) && (
                        <button
                          onClick={copyToClipboard}
                          className={`flex items-center space-x-2 px-4 py-2 ${
                            theme === "dark"
                              ? "bg-slate-700 hover:bg-slate-600"
                              : "bg-slate-200 hover:bg-slate-300"
                          } rounded-lg ${currentTheme.text} transition-all`}
                        >
                          {copied ? (
                            <>
                              <Check className="w-4 h-4 text-green-500" />
                              <span className="text-green-500 font-bold">
                                Copied!
                              </span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              <span className="font-bold">Copy</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    <textarea
                      value={outputText}
                      readOnly
                      className={`w-full h-32 border-2 rounded-xl px-4 py-3 ${currentTheme.text} font-bold ${
                        theme === "dark"
                          ? "bg-slate-800"
                          : "bg-slate-100"
                      }`}
                    />
                  </div>
                </div>
              )}

              <button
                onClick={handleProcess}
                className={`w-full mt-6 py-4 rounded-xl text-white font-black bg-gradient-to-r ${cipher.gradient} hover:scale-105 transform transition`}
              >
                {selectedCipher==="euclid"
                  ? "🧮 CALCULATE"
                  : showCrack
                  ? "🔓 CRACK"
                  : mode==="encrypt"
                  ? "🔒 ENCRYPT"
                  : "🔓 DECRYPT"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* NOTIFICATIONS */}
      {notification && (
        <div className="fixed top-6 right-6 z-50">
          <div className={`px-6 py-4 rounded-xl shadow-xl border-2 ${
            notification.type==="levelup"
              ? "bg-amber-400 border-amber-600"
              : notification.type==="success"
              ? "bg-green-400 border-green-600"
              : notification.type==="error"
              ? "bg-red-400 border-red-600"
              : "bg-cyan-400 border-cyan-600"
          }`}>
            <span className="font-bold text-white text-lg">
              {notification.message}
            </span>
          </div>
        </div>
      )}

      {recentReward && (
        <div className="fixed bottom-8 right-8 z-50">
          <div className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl shadow-xl animate-bounce">
            <div className="flex items-center space-x-3">
              <Zap className="w-8 h-8"/>
              <div>
                <div className="text-2xl font-black">
                  +{recentReward.points}
                </div>
                <div className="text-sm">{recentReward.reason}</div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CipherLabPage;