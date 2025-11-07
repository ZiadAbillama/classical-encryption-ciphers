import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Key, Grid3x3, Hash, Calculator, Copy, Check, Zap, Trophy, Target, Star, Award, TrendingUp, Flame, Shield, CheckCircle2, XCircle, AlertCircle, Sparkles, Crown, MessageSquare, Sun, Moon } from 'lucide-react';

const CryptoLab = () => {
  const [selectedCipher, setSelectedCipher] = useState(null);
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [mode, setMode] = useState('encrypt');
  const [view, setView] = useState('home');
  const [copied, setCopied] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [theme, setTheme] = useState('dark');

  // Gamification State
  const [userStats, setUserStats] = useState({
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
  });
  const [activeMission, setActiveMission] = useState(null);
  const [notification, setNotification] = useState(null);
  const [recentReward, setRecentReward] = useState(null);

  // Cipher States
  const [affineA, setAffineA] = useState(5);
  const [affineB, setAffineB] = useState(8);
  const [affineCrackE, setAffineCrackE] = useState('E');
  const [affineCrackT, setAffineCrackT] = useState('T');
  const [showCrack, setShowCrack] = useState(false);
  const [monoKey, setMonoKey] = useState('QWERTYUIOPASDFGHJKLZXCVBNM');
  const [vigenereKey, setVigenereKey] = useState('KEY');
  const [playfairKey, setPlayfairKey] = useState('MONARCHY');
  const [playfairMatrix, setPlayfairMatrix] = useState([]);
  const [hillMatrix, setHillMatrix] = useState([[6, 24, 1], [13, 16, 10], [20, 17, 15]]);
  const [hillInverse, setHillInverse] = useState(null);
  const [hillSize, setHillSize] = useState(3);
  const [euclidA, setEuclidA] = useState(15);
  const [euclidM, setEuclidM] = useState(26);
  const [euclidResult, setEuclidResult] = useState('');

  // Theme configurations
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

  const missions = [
    {
      id: 'affine_first',
      cipher: 'affine',
      title: 'The Beginning',
      description: 'Encrypt "HELLO" with a=5, b=8',
      target: 'RCLLA',
      points: 100,
      difficulty: 'Novice',
      icon: Star
    },
    {
      id: 'vigenere_keyword',
      cipher: 'vigenere',
      title: 'Keyword Master',
      description: 'Encrypt "CRYPTO" with keyword "KEY"',
      target: 'MBSDZC',
      points: 150,
      difficulty: 'Apprentice',
      icon: Key
    },
    {
      id: 'affine_crack',
      cipher: 'affine',
      title: 'Code Breaker',
      description: 'Crack an affine cipher using frequency analysis',
      points: 300,
      difficulty: 'Expert',
      icon: Sparkles
    },
    {
      id: 'hill_matrix',
      cipher: 'hill',
      title: 'Matrix Warrior',
      description: 'Master the Hill cipher with matrix operations',
      points: 250,
      difficulty: 'Advanced',
      icon: Grid3x3
    }
  ];

  const achievements = [
    { id: 'first_blood', name: 'First Blood', desc: 'Complete your first encryption', icon: Star, points: 50 },
    { id: 'crypto_explorer', name: 'Crypto Explorer', desc: 'Try all 6 ciphers', icon: Target, points: 300 },
    { id: 'combo_master', name: 'Combo Master', desc: 'Get a 5x combo streak', icon: Flame, points: 200 },
    { id: 'mission_complete', name: 'Mission Ace', desc: 'Complete 3 missions', icon: Trophy, points: 250 },
    { id: 'level_5', name: 'Rising Star', desc: 'Reach level 5', icon: Crown, points: 500 }
  ];

  const ciphers = [
    {
      id: 'affine',
      name: 'Affine Cipher',
      icon: Hash,
      description: 'Mathematical magic with C = aP + b (mod 26)',
      gradient: theme === 'dark' ? 'from-cyan-600 via-blue-700 to-blue-800' : 'from-cyan-400 via-blue-500 to-blue-600',
      color: 'cyan'
    },
    {
      id: 'mono',
      name: 'Mono-Alphabetic',
      icon: Key,
      description: 'Classic substitution with your custom alphabet',
      gradient: theme === 'dark' ? 'from-purple-600 via-purple-700 to-pink-800' : 'from-purple-400 via-purple-500 to-pink-600',
      color: 'purple'
    },
    {
      id: 'vigenere',
      name: 'Vigenère Cipher',
      icon: Lock,
      description: 'Polyalphabetic powerhouse with keyword magic',
      gradient: theme === 'dark' ? 'from-green-600 via-emerald-700 to-teal-800' : 'from-green-400 via-emerald-500 to-teal-600',
      color: 'green'
    },
    {
      id: 'playfair',
      name: 'Playfair Cipher',
      icon: Grid3x3,
      description: 'Digraph encryption with 5×5 matrix wizardry',
      gradient: theme === 'dark' ? 'from-orange-600 via-red-700 to-red-800' : 'from-orange-400 via-red-500 to-red-600',
      color: 'orange'
    },
    {
      id: 'hill',
      name: 'Hill Cipher',
      icon: Grid3x3,
      description: 'Linear algebra meets cryptography',
      gradient: theme === 'dark' ? 'from-indigo-600 via-purple-700 to-purple-800' : 'from-indigo-400 via-purple-500 to-purple-600',
      color: 'indigo'
    },
    {
      id: 'euclid',
      name: 'Extended Euclid',
      icon: Calculator,
      description: 'Mathematical foundation for modular arithmetic',
      gradient: theme === 'dark' ? 'from-amber-600 via-orange-700 to-orange-800' : 'from-amber-400 via-orange-500 to-orange-600',
      color: 'amber'
    }
  ];

  // Cipher Implementations
  const affineCipher = (text, a, b, decrypt = false) => {
    const mod26 = (n) => ((n % 26) + 26) % 26;
    const modInverse = (a, m) => {
      for (let x = 1; x < m; x++) {
        if ((a * x) % m === 1) return x;
      }
      return 1;
    };

    return text.split('').map(char => {
      if (/[a-zA-Z]/.test(char)) {
        const isUpper = char === char.toUpperCase();
        const charCode = char.toUpperCase().charCodeAt(0) - 65;
        let newCode;
        
        if (decrypt) {
          const aInv = modInverse(a, 26);
          newCode = mod26(aInv * (charCode - b));
        } else {
          newCode = mod26(a * charCode + b);
        }
        
        const newChar = String.fromCharCode(newCode + 65);
        return isUpper ? newChar : newChar.toLowerCase();
      }
      return char;
    }).join('');
  };

  const crackAffineCipher = (ciphertext, char1, char2) => {
    const freq1 = char1.toUpperCase().charCodeAt(0) - 65;
    const freq2 = char2.toUpperCase().charCodeAt(0) - 65;
    const e = 4, t = 19;
    
    const mod26 = (n) => ((n % 26) + 26) % 26;
    const modInverse = (a, m) => {
      for (let x = 1; x < m; x++) {
        if ((a * x) % m === 1) return x;
      }
      return 1;
    };

    const delta = mod26(freq1 - freq2);
    const deltaET = mod26(e - t);
    const a = mod26(delta * modInverse(deltaET, 26));
    const b = mod26(freq1 - a * e);

    return { a, b, decrypted: affineCipher(ciphertext, a, b, true) };
  };

  const monoAlphabeticCipher = (text, key, decrypt = false) => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const keyMap = decrypt ? 
      Object.fromEntries(key.split('').map((k, i) => [k, alphabet[i]])) :
      Object.fromEntries(alphabet.split('').map((c, i) => [c, key[i]]));

    return text.split('').map(char => {
      if (/[a-zA-Z]/.test(char)) {
        const isUpper = char === char.toUpperCase();
        const mapped = keyMap[char.toUpperCase()] || char;
        return isUpper ? mapped : mapped.toLowerCase();
      }
      return char;
    }).join('');
  };

  const vigenereCipher = (text, key, decrypt = false) => {
    const keyUpper = key.toUpperCase().replace(/[^A-Z]/g, '');
    if (!keyUpper) return text;
    let keyIndex = 0;

    return text.split('').map(char => {
      if (/[a-zA-Z]/.test(char)) {
        const isUpper = char === char.toUpperCase();
        const charCode = char.toUpperCase().charCodeAt(0) - 65;
        const keyCode = keyUpper.charCodeAt(keyIndex % keyUpper.length) - 65;
        const shift = decrypt ? -keyCode : keyCode;
        const newCode = ((charCode + shift + 26) % 26);
        keyIndex++;
        
        const newChar = String.fromCharCode(newCode + 65);
        return isUpper ? newChar : newChar.toLowerCase();
      }
      return char;
    }).join('');
  };

  const generatePlayfairMatrix = (key) => {
    const keyClean = key.toUpperCase().replace(/[^A-Z]/g, '').replace(/J/g, 'I');
    const seen = new Set();
    let matrix = [];
    let current = '';

    for (let char of keyClean) {
      if (!seen.has(char)) {
        seen.add(char);
        current += char;
        if (current.length === 5) {
          matrix.push(current.split(''));
          current = '';
        }
      }
    }

    for (let i = 65; i <= 90; i++) {
      const char = String.fromCharCode(i);
      if (char !== 'J' && !seen.has(char)) {
        seen.add(char);
        current += char;
        if (current.length === 5) {
          matrix.push(current.split(''));
          current = '';
        }
      }
    }

    return matrix;
  };

  const calculateHillInverse = (matrix) => {
    if (matrix.length === 2) {
      const det = (matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0]) % 26;
      const detInv = modInverse(det, 26);
      if (!detInv) return null;
      
      return [
        [(matrix[1][1] * detInv) % 26, (-matrix[0][1] * detInv + 26) % 26],
        [(-matrix[1][0] * detInv + 26) % 26, (matrix[0][0] * detInv) % 26]
      ];
    }
    return null;
  };

  const modInverse = (a, m) => {
    a = ((a % m) + m) % m;
    for (let x = 1; x < m; x++) {
      if ((a * x) % m === 1) return x;
    }
    return null;
  };

  const extendedEuclid = (a, m) => {
    let [oldR, r] = [a, m];
    let [oldS, s] = [1, 0];
    let [oldT, t] = [0, 1];

    while (r !== 0) {
      const quotient = Math.floor(oldR / r);
      [oldR, r] = [r, oldR - quotient * r];
      [oldS, s] = [s, oldS - quotient * s];
      [oldT, t] = [t, oldT - quotient * t];
    }

    const gcd = oldR;
    const inverse = oldS < 0 ? oldS + m : oldS;
    
    return {
      gcd,
      inverse: gcd === 1 ? inverse : null,
      coefficients: { x: oldS, y: oldT }
    };
  };

  const copyToClipboard = async () => {
    if (outputText || euclidResult) {
      await navigator.clipboard.writeText(outputText || euclidResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const awardPoints = (points, reason) => {
    setUserStats(prev => {
      const newPoints = prev.points + points;
      const newLevel = Math.floor(newPoints / 500) + 1;
      const newCombo = prev.combo + 1;
      
      if (newLevel > prev.level) {
        showNotification(`🎉 LEVEL UP! You're now level ${newLevel}!`, 'levelup');
        setShowParticles(true);
        setTimeout(() => setShowParticles(false), 3000);
      }

      return {
        ...prev,
        points: newPoints,
        level: newLevel,
        combo: newCombo,
        bestCombo: Math.max(newCombo, prev.bestCombo)
      };
    });

    setRecentReward({ points, reason });
    setTimeout(() => setRecentReward(null), 2000);
  };

  const checkAchievements = () => {
    achievements.forEach(achievement => {
      if (!userStats.achievements.includes(achievement.id)) {
        let unlocked = false;

        if (achievement.id === 'first_blood' && (userStats.totalEncryptions + userStats.totalDecryptions) >= 1) unlocked = true;
        if (achievement.id === 'crypto_explorer' && userStats.experiencedCiphers.length >= 6) unlocked = true;
        if (achievement.id === 'combo_master' && userStats.combo >= 5) unlocked = true;
        if (achievement.id === 'mission_complete' && userStats.completedChallenges.length >= 3) unlocked = true;
        if (achievement.id === 'level_5' && userStats.level >= 5) unlocked = true;

        if (unlocked) {
          setUserStats(prev => ({
            ...prev,
            achievements: [...prev.achievements, achievement.id],
            points: prev.points + achievement.points
          }));
          showNotification(`🏆 ACHIEVEMENT UNLOCKED: ${achievement.name}! +${achievement.points} pts`, 'achievement');
          setShowParticles(true);
          setTimeout(() => setShowParticles(false), 3000);
        }
      }
    });
  };

  const handleProcess = () => {
    let result = '';

    switch (selectedCipher) {
      case 'affine':
        if (showCrack) {
          const cracked = crackAffineCipher(inputText, affineCrackE, affineCrackT);
          setOutputText(cracked.decrypted);
          showNotification(`Cracked! a=${cracked.a}, b=${cracked.b}`, 'success');
          return;
        }
        result = affineCipher(inputText, affineA, affineB, mode === 'decrypt');
        break;
      case 'mono':
        if (monoKey.length !== 26) {
          showNotification('Key must be exactly 26 unique letters!', 'error');
          return;
        }
        result = monoAlphabeticCipher(inputText, monoKey, mode === 'decrypt');
        break;
      case 'vigenere':
        if (!vigenereKey) {
          showNotification('Please enter a keyword!', 'error');
          return;
        }
        result = vigenereCipher(inputText, vigenereKey, mode === 'decrypt');
        break;
      case 'playfair':
        result = "Playfair encryption in progress...";
        break;
      case 'hill':
        result = "Hill cipher encryption in progress...";
        break;
      case 'euclid':
        const eucResult = extendedEuclid(euclidA, euclidM);
        setEuclidResult(
          `GCD(${euclidA}, ${euclidM}) = ${eucResult.gcd}\n` +
          (eucResult.inverse !== null 
            ? `✓ Modular Inverse: ${euclidA}⁻¹ ≡ ${eucResult.inverse} (mod ${euclidM})`
            : `✗ No modular inverse (GCD ≠ 1)`) +
          `\nBézout: ${euclidA}·${eucResult.coefficients.x} + ${euclidM}·${eucResult.coefficients.y} = ${eucResult.gcd}`
        );
        awardPoints(50, 'Calculation');
        setTimeout(checkAchievements, 500);
        return;
    }

    setOutputText(result);
    setUserStats(prev => ({
      ...prev,
      totalEncryptions: mode === 'encrypt' ? prev.totalEncryptions + 1 : prev.totalEncryptions,
      totalDecryptions: mode === 'decrypt' ? prev.totalDecryptions + 1 : prev.totalDecryptions,
      experiencedCiphers: prev.experiencedCiphers.includes(selectedCipher) 
        ? prev.experiencedCiphers 
        : [...prev.experiencedCiphers, selectedCipher]
    }));

    const basePoints = mode === 'encrypt' ? 25 : 35;
    const comboBonus = userStats.combo * 5;
    awardPoints(basePoints + comboBonus, mode === 'encrypt' ? 'Encrypted' : 'Decrypted');

    if (activeMission) {
      const mission = missions.find(m => m.id === activeMission);
      if (mission.target && result.toUpperCase().replace(/\s/g, '') === mission.target) {
        setUserStats(prev => ({
          ...prev,
          completedChallenges: [...prev.completedChallenges, activeMission]
        }));
        awardPoints(mission.points, `Mission: ${mission.title}`);
        showNotification(`✨ MISSION COMPLETE! +${mission.points} pts`, 'success');
        setActiveMission(null);
      }
    }

    setTimeout(checkAchievements, 500);
  };

  useEffect(() => {
    if (selectedCipher === 'playfair') {
      setPlayfairMatrix(generatePlayfairMatrix(playfairKey));
    }
    if (selectedCipher === 'hill') {
      setHillInverse(calculateHillInverse(hillMatrix));
    }
  }, [playfairKey, hillMatrix, selectedCipher]);

  const renderCipherControls = () => {
    const cipher = ciphers.find(c => c.id === selectedCipher);
    
    switch (selectedCipher) {
      case 'affine':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-bold ${currentTheme.text}`}>Configuration</h3>
              <button
                onClick={() => setShowCrack(!showCrack)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  showCrack 
                    ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg'
                    : theme === 'dark' ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                {showCrack ? '🔓 Crack Mode' : '🔐 Normal Mode'}
              </button>
            </div>

            {showCrack ? (
              <div className="space-y-4">
                <div className={`${theme === 'dark' ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'} border-2 rounded-xl p-4`}>
                  <div className="flex items-center space-x-2 mb-3">
                    <Sparkles className={`w-5 h-5 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`} />
                    <span className={`${theme === 'dark' ? 'text-red-400' : 'text-red-700'} font-bold`}>Frequency Analysis Crack</span>
                  </div>
                  <p className={`${currentTheme.textMuted} text-sm mb-4`}>
                    Enter the two most frequent letters in the ciphertext (defaults: E and T)
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block ${currentTheme.textMuted} text-sm mb-2`}>Most Frequent</label>
                      <input
                        type="text"
                        maxLength={1}
                        value={affineCrackE}
                        onChange={(e) => setAffineCrackE(e.target.value.toUpperCase())}
                        className={`w-full ${currentTheme.input} ${currentTheme.inputFocus} border-2 rounded-lg px-4 py-2 ${currentTheme.text} text-center text-2xl font-bold focus:outline-none`}
                      />
                    </div>
                    <div>
                      <label className={`block ${currentTheme.textMuted} text-sm mb-2`}>Second Most Frequent</label>
                      <input
                        type="text"
                        maxLength={1}
                        value={affineCrackT}
                        onChange={(e) => setAffineCrackT(e.target.value.toUpperCase())}
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
                    <label className={`block ${currentTheme.textMuted} text-sm mb-2 font-medium`}>Multiplier (a)</label>
                    <input
                      type="number"
                      value={affineA}
                      onChange={(e) => setAffineA(parseInt(e.target.value) || 1)}
                      className={`w-full ${currentTheme.input} ${currentTheme.inputFocus} border-2 rounded-lg px-4 py-3 ${currentTheme.text} font-bold text-lg focus:outline-none transition-all`}
                    />
                  </div>
                  <div>
                    <label className={`block ${currentTheme.textMuted} text-sm mb-2 font-medium`}>Shift (b)</label>
                    <input
                      type="number"
                      value={affineB}
                      onChange={(e) => setAffineB(parseInt(e.target.value) || 0)}
                      className={`w-full ${currentTheme.input} ${currentTheme.inputFocus} border-2 rounded-lg px-4 py-3 ${currentTheme.text} font-bold text-lg focus:outline-none transition-all`}
                    />
                  </div>
                </div>
                <div className={`${theme === 'dark' ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-cyan-50 border-cyan-200'} border-2 rounded-xl p-4`}>
                  <div className={`${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-700'} font-mono text-lg`}>
                    C = ({affineA} × P + {affineB}) mod 26
                  </div>
                </div>
              </>
            )}
          </div>
        );

      case 'mono':
        return (
          <div className="space-y-4">
            <div>
              <label className={`block ${currentTheme.textMuted} text-sm mb-2 font-medium`}>
                Substitution Alphabet (26 unique letters)
              </label>
              <input
                type="text"
                value={monoKey}
                onChange={(e) => setMonoKey(e.target.value.toUpperCase().slice(0, 26))}
                maxLength={26}
                className={`w-full ${currentTheme.input} ${currentTheme.inputFocus} border-2 rounded-lg px-4 py-3 ${currentTheme.text} font-mono text-lg tracking-wider focus:outline-none transition-all`}
              />
              <div className="flex items-center justify-between mt-2">
                <span className={`text-sm font-medium ${monoKey.length === 26 ? 'text-green-500' : 'text-amber-500'}`}>
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
            <div className={`${theme === 'dark' ? 'bg-purple-500/10 border-purple-500/30' : 'bg-purple-50 border-purple-200'} border-2 rounded-xl p-4`}>
              <div className={`${currentTheme.textMuted} text-xs mb-2`}>ALPHABET</div>
              <div className={`${currentTheme.text} font-mono text-sm tracking-wider`}>ABCDEFGHIJKLMNOPQRSTUVWXYZ</div>
              <div className={`${currentTheme.textMuted} text-xs mt-2 mb-2`}>YOUR KEY</div>
              <div className={`${theme === 'dark' ? 'text-purple-400' : 'text-purple-700'} font-mono text-sm tracking-wider`}>{monoKey || '...'}</div>
            </div>
          </div>
        );

      case 'vigenere':
        return (
          <div className="space-y-4">
            <div>
              <label className={`block ${currentTheme.textMuted} text-sm mb-2 font-medium`}>Keyword</label>
              <input
                type="text"
                value={vigenereKey}
                onChange={(e) => setVigenereKey(e.target.value)}
                className={`w-full ${currentTheme.input} ${currentTheme.inputFocus} border-2 rounded-lg px-4 py-3 ${currentTheme.text} font-bold text-lg tracking-wide focus:outline-none transition-all`}
                placeholder="Enter your keyword..."
              />
            </div>
            <div className={`${theme === 'dark' ? 'bg-green-500/10 border-green-500/30' : 'bg-green-50 border-green-200'} border-2 rounded-xl p-4`}>
              <div className="flex items-center space-x-2 mb-2">
                <Key className={`w-5 h-5 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
                <span className={`${theme === 'dark' ? 'text-green-400' : 'text-green-700'} font-bold`}>Repeating Key</span>
              </div>
              <div className={`${currentTheme.textMuted} text-sm`}>
                Your keyword repeats throughout the message for polyalphabetic substitution
              </div>
            </div>
          </div>
        );

      case 'playfair':
        return (
          <div className="space-y-4">
            <div>
              <label className={`block ${currentTheme.textMuted} text-sm mb-2 font-medium`}>Matrix Keyword</label>
              <input
                type="text"
                value={playfairKey}
                onChange={(e) => setPlayfairKey(e.target.value)}
                className={`w-full ${currentTheme.input} ${currentTheme.inputFocus} border-2 rounded-lg px-4 py-3 ${currentTheme.text} font-bold text-lg focus:outline-none transition-all`}
              />
            </div>
            {playfairMatrix.length === 5 && (
              <div className={`${theme === 'dark' ? 'bg-orange-500/10 border-orange-500/30' : 'bg-orange-50 border-orange-200'} border-2 rounded-xl p-6`}>
                <div className={`${theme === 'dark' ? 'text-orange-400' : 'text-orange-700'} font-bold mb-4 flex items-center`}>
                  <Grid3x3 className="w-5 h-5 mr-2" />
                  5×5 Playfair Matrix
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {playfairMatrix.map((row, i) => 
                    row.map((cell, j) => (
                      <div 
                        key={`${i}-${j}`} 
                        className={`${theme === 'dark' ? 'bg-orange-500/20 border-orange-500/40' : 'bg-orange-100 border-orange-300'} border-2 rounded-lg h-12 flex items-center justify-center ${currentTheme.text} font-bold text-lg hover:scale-110 transition-transform`}
                      >
                        {cell}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        );

      case 'hill':
        return (
          <div className="space-y-4">
            <div>
              <label className={`block ${currentTheme.textMuted} text-sm mb-2 font-medium`}>Matrix Size</label>
              <select
                value={hillSize}
                onChange={(e) => {
                  const size = parseInt(e.target.value);
                  setHillSize(size);
                  if (size === 2) {
                    setHillMatrix([[6, 24], [13, 16]]);
                  } else {
                    setHillMatrix([[6, 24, 1], [13, 16, 10], [20, 17, 15]]);
                  }
                }}
                className={`w-full ${currentTheme.input} ${currentTheme.inputFocus} border-2 rounded-lg px-4 py-3 ${currentTheme.text} font-bold focus:outline-none`}
              >
                <option value={2}>2×2 Matrix</option>
                <option value={3}>3×3 Matrix</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className={`${theme === 'dark' ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-indigo-50 border-indigo-200'} border-2 rounded-xl p-4`}>
                <div className={`${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-700'} font-bold mb-3 flex items-center`}>
                  <Grid3x3 className="w-4 h-4 mr-2" />
                  Key Matrix
                </div>
                <pre className={`${currentTheme.text} font-mono text-sm leading-relaxed`}>
                  {hillSize === 2 
                    ? '[ 6  24 ]\n[ 13 16 ]'
                    : '[ 6  24  1  ]\n[ 13 16  10 ]\n[ 20 17  15 ]'
                  }
                </pre>
              </div>
              {hillInverse && (
                <div className={`${theme === 'dark' ? 'bg-purple-500/10 border-purple-500/30' : 'bg-purple-50 border-purple-200'} border-2 rounded-xl p-4`}>
                  <div className={`${theme === 'dark' ? 'text-purple-400' : 'text-purple-700'} font-bold mb-3 flex items-center`}>
                    <Calculator className="w-4 h-4 mr-2" />
                    Inverse
                  </div>
                  <pre className={`${currentTheme.text} font-mono text-sm leading-relaxed`}>
                    {hillSize === 2 
                      ? `[ ${hillInverse[0][0]}  ${hillInverse[0][1]} ]\n[ ${hillInverse[1][0]}  ${hillInverse[1][1]} ]`
                      : 'Calculated'
                    }
                  </pre>
                </div>
              )}
            </div>
          </div>
        );

      case 'euclid':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block ${currentTheme.textMuted} text-sm mb-2 font-medium`}>Integer (a)</label>
                <input
                  type="number"
                  value={euclidA}
                  onChange={(e) => setEuclidA(parseInt(e.target.value) || 1)}
                  className={`w-full ${currentTheme.input} ${currentTheme.inputFocus} border-2 rounded-lg px-4 py-3 ${currentTheme.text} font-bold text-lg focus:outline-none`}
                />
              </div>
              <div>
                <label className={`block ${currentTheme.textMuted} text-sm mb-2 font-medium`}>Modulo (m)</label>
                <input
                  type="number"
                  value={euclidM}
                  onChange={(e) => setEuclidM(parseInt(e.target.value) || 1)}
                  className={`w-full ${currentTheme.input} ${currentTheme.inputFocus} border-2 rounded-lg px-4 py-3 ${currentTheme.text} font-bold text-lg focus:outline-none`}
                />
              </div>
            </div>
            {euclidResult && (
              <div className={`${theme === 'dark' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-200'} border-2 rounded-xl p-4`}>
                <div className={`${theme === 'dark' ? 'text-amber-400' : 'text-amber-700'} font-bold mb-3`}>Result</div>
                <pre className={`${currentTheme.text} font-mono text-sm whitespace-pre-wrap leading-relaxed`}>{euclidResult}</pre>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // Home View
  if (view === 'home') {
    return (
      <div className={`min-h-screen ${currentTheme.bg} relative overflow-hidden`}>
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute w-96 h-96 ${currentTheme.glowColors[0]} rounded-full ${currentTheme.glow} -top-48 -left-48 animate-pulse`}></div>
          <div className={`absolute w-96 h-96 ${currentTheme.glowColors[1]} rounded-full ${currentTheme.glow} top-1/2 right-0 animate-pulse`} style={{animationDelay: '1s'}}></div>
          <div className={`absolute w-96 h-96 ${currentTheme.glowColors[2]} rounded-full ${currentTheme.glow} bottom-0 left-1/3 animate-pulse`} style={{animationDelay: '2s'}}></div>
        </div>

        {/* Particles Effect */}
        {showParticles && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-2 h-2 ${theme === 'dark' ? 'bg-amber-400' : 'bg-amber-500'} rounded-full animate-ping`}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        )}

        {/* Header */}
        <header className={`relative backdrop-blur-xl ${currentTheme.header} border-b ${currentTheme.cardBorder}`}>
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-gradient-to-r from-cyan-600 to-purple-700' : 'bg-gradient-to-r from-cyan-500 to-purple-600'} rounded-xl blur-lg opacity-75`}></div>
                  <div className={`relative ${theme === 'dark' ? 'bg-gradient-to-r from-cyan-600 to-purple-700' : 'bg-gradient-to-r from-cyan-500 to-purple-600'} p-2 rounded-xl`}>
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className={`${currentTheme.text} font-bold`}>
                    CRYPTOLAB
                  </h1>
                  <p className={`text-xs ${currentTheme.textMuted}`}>Classical Cipher Mastery</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className={`p-2 ${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600' : 'bg-white hover:bg-slate-100'} ${currentTheme.cardBorder} border rounded-xl transition-all`}
                  title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {theme === 'dark' ? (
                    <Sun className="w-5 h-5 text-amber-400" />
                  ) : (
                    <Moon className="w-5 h-5 text-slate-700" />
                  )}
                </button>
                <div className={`flex items-center space-x-2 px-4 py-2 ${theme === 'dark' ? 'bg-orange-500/20 border-orange-500/40' : 'bg-orange-100 border-orange-300'} border rounded-full backdrop-blur-xl`}>
                  <Flame className={`w-4 h-4 ${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`} />
                  <span className={`${theme === 'dark' ? 'text-orange-400' : 'text-orange-700'} font-bold`}>{userStats.combo}x</span>
                </div>
                <div className={`flex items-center space-x-2 px-4 py-2 ${theme === 'dark' ? 'bg-purple-500/20 border-purple-500/40' : 'bg-purple-100 border-purple-300'} border rounded-full backdrop-blur-xl`}>
                  <Crown className={`w-4 h-4 ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}`} />
                  <span className={`${currentTheme.text} font-bold`}>Lv.{userStats.level}</span>
                </div>
                <div className={`flex items-center space-x-2 px-4 py-2 ${theme === 'dark' ? 'bg-green-500/20 border-green-500/40' : 'bg-green-100 border-green-300'} border rounded-full backdrop-blur-xl`}>
                  <Trophy className={`w-4 h-4 ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}`} />
                  <span className={`${currentTheme.text} font-bold`}>{userStats.points}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="relative max-w-7xl mx-auto px-4 py-16">
          {/* Hero */}
          <div className="text-center mb-16">
            <h2 className="text-6xl md:text-7xl font-black mb-6">
              <span className={currentTheme.text}>
                MASTER
              </span>
              <br/>
              <span className={currentTheme.text}>THE ART OF</span>
              <br/>
              <span className={currentTheme.text}>
                ENCRYPTION
              </span>
            </h2>
            <p className={`text-xl ${currentTheme.textMuted} max-w-2xl mx-auto`}>
              Unlock the secrets of classical cryptography through gamified learning
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <button
              onClick={() => setView('ciphers')}
              className={`group relative ${currentTheme.card} backdrop-blur-xl border ${currentTheme.cardBorder} rounded-2xl p-8 hover:scale-105 transition-all duration-300 shadow-lg ${currentTheme.cardHover}`}
            >
              <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-gradient-to-br from-cyan-600/0 to-cyan-600/10' : 'bg-gradient-to-br from-cyan-400/0 to-cyan-400/20'} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity`}></div>
              <div className="relative flex flex-col items-center text-center">
                <div className={`w-16 h-16 ${theme === 'dark' ? 'bg-gradient-to-br from-cyan-600 to-blue-700' : 'bg-gradient-to-br from-cyan-500 to-blue-600'} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <h3 className={`text-2xl font-bold ${currentTheme.text} mb-2`}>Cipher Lab</h3>
                <p className={currentTheme.textMuted}>Master 6 classical encryption techniques</p>
              </div>
            </button>

            <button
              onClick={() => setView('missions')}
              className={`group relative ${currentTheme.card} backdrop-blur-xl border ${currentTheme.cardBorder} rounded-2xl p-8 hover:scale-105 transition-all duration-300 shadow-lg ${currentTheme.cardHover}`}
            >
              <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-gradient-to-br from-purple-600/0 to-purple-600/10' : 'bg-gradient-to-br from-purple-400/0 to-purple-400/20'} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity`}></div>
             <div className="relative flex flex-col items-center text-center">
                <div className={`w-16 h-16 ${theme === 'dark' ? 'bg-gradient-to-br from-purple-600 to-pink-700' : 'bg-gradient-to-br from-purple-500 to-pink-600'} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className={`text-2xl font-bold ${currentTheme.text} mb-2`}>Missions</h3>
                <p className={currentTheme.textMuted}>Complete challenges and earn massive rewards</p>
              </div>
            </button>

            <button
              onClick={() => setView('profile')}
              className={`group relative ${currentTheme.card} backdrop-blur-xl border ${currentTheme.cardBorder} rounded-2xl p-8 hover:scale-105 transition-all duration-300 shadow-lg ${currentTheme.cardHover}`}
            >
              <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-gradient-to-br from-green-600/0 to-green-600/10' : 'bg-gradient-to-br from-green-400/0 to-green-400/20'} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity`}></div>
              <div className="relative flex flex-col items-center text-center">
                <div className={`w-16 h-16 ${theme === 'dark' ? 'bg-gradient-to-br from-green-600 to-teal-700' : 'bg-gradient-to-br from-green-500 to-teal-600'} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className={`text-2xl font-bold ${currentTheme.text} mb-2`}>Profile</h3>
                <p className={currentTheme.textMuted}>Track your legendary crypto journey</p>
              </div>
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`backdrop-blur-xl ${currentTheme.card} border ${currentTheme.cardBorder} rounded-2xl p-6 ${currentTheme.cardHover} transition-all shadow-lg`}>
              <div className={`text-4xl font-black ${theme === 'dark' ? 'bg-gradient-to-r from-cyan-400 to-blue-400' : 'bg-gradient-to-r from-cyan-600 to-blue-600'} bg-clip-text text-transparent`}>
                {userStats.totalEncryptions}
              </div>
              <div className={`${currentTheme.textMuted} text-sm mt-1`}>Encryptions</div>
            </div>
            <div className={`backdrop-blur-xl ${currentTheme.card} border ${currentTheme.cardBorder} rounded-2xl p-6 ${currentTheme.cardHover} transition-all shadow-lg`}>
              <div className={`text-4xl font-black ${theme === 'dark' ? 'bg-gradient-to-r from-purple-400 to-pink-400' : 'bg-gradient-to-r from-purple-600 to-pink-600'} bg-clip-text text-transparent`}>
                {userStats.totalDecryptions}
              </div>
              <div className={`${currentTheme.textMuted} text-sm mt-1`}>Decryptions</div>
            </div>
            <div className={`backdrop-blur-xl ${currentTheme.card} border ${currentTheme.cardBorder} rounded-2xl p-6 ${currentTheme.cardHover} transition-all shadow-lg`}>
              <div className={`text-4xl font-black ${theme === 'dark' ? 'bg-gradient-to-r from-green-400 to-teal-400' : 'bg-gradient-to-r from-green-600 to-teal-600'} bg-clip-text text-transparent`}>
                {userStats.completedChallenges.length}
              </div>
              <div className={`${currentTheme.textMuted} text-sm mt-1`}>Missions</div>
            </div>
            <div className={`backdrop-blur-xl ${currentTheme.card} border ${currentTheme.cardBorder} rounded-2xl p-6 ${currentTheme.cardHover} transition-all shadow-lg`}>
              <div className={`text-4xl font-black ${theme === 'dark' ? 'bg-gradient-to-r from-amber-400 to-orange-400' : 'bg-gradient-to-r from-amber-600 to-orange-600'} bg-clip-text text-transparent`}>
                {userStats.achievements.length}
              </div>
              <div className={`${currentTheme.textMuted} text-sm mt-1`}>Achievements</div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {notification && (
          <div className="fixed top-6 right-6 z-50 animate-bounce">
            <div className={`px-6 py-4 rounded-2xl backdrop-blur-xl border-2 shadow-2xl ${
              notification.type === 'levelup' 
                ? theme === 'dark' ? 'bg-amber-500/30 border-amber-500 shadow-amber-500/50' : 'bg-amber-100 border-amber-400'
                : notification.type === 'achievement'
                ? theme === 'dark' ? 'bg-purple-500/30 border-purple-500 shadow-purple-500/50' : 'bg-purple-100 border-purple-400'
                : notification.type === 'success'
                ? theme === 'dark' ? 'bg-green-500/30 border-green-500 shadow-green-500/50' : 'bg-green-100 border-green-400'
                : notification.type === 'error'
                ? theme === 'dark' ? 'bg-red-500/30 border-red-500 shadow-red-500/50' : 'bg-red-100 border-red-400'
                : theme === 'dark' ? 'bg-cyan-500/30 border-cyan-500 shadow-cyan-500/50' : 'bg-cyan-100 border-cyan-400'
            }`}>
              <div className={`${theme === 'dark' ? 'text-white' : 'text-slate-900'} font-bold`}>{notification.message}</div>
            </div>
          </div>
        )}

        {/* Reward Popup */}
        {recentReward && (
          <div className="fixed bottom-24 right-6 z-50">
            <div className={`${theme === 'dark' ? 'bg-gradient-to-r from-amber-500/90 to-orange-500/90 border-amber-300' : 'bg-gradient-to-r from-amber-400 to-orange-500 border-amber-500'} backdrop-blur-xl px-6 py-3 rounded-full border-2 shadow-2xl animate-bounce`}>
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-white" />
                <span className="text-white font-bold text-lg">+{recentReward.points}</span>
                <span className="text-white/90 text-sm">{recentReward.reason}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Missions View
  if (view === 'missions') {
    return (
      <div className={`min-h-screen ${currentTheme.bg} relative overflow-hidden`}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute w-96 h-96 ${currentTheme.glowColors[1]} rounded-full ${currentTheme.glow} top-0 right-0 animate-pulse`}></div>
        </div>

        <header className={`relative backdrop-blur-xl ${currentTheme.header} border-b ${currentTheme.cardBorder}`}>
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => setView('home')}
              className={`px-4 py-2 ${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-200 hover:bg-slate-300'} rounded-xl ${currentTheme.text} font-bold transition-all`}
            >
              ← Back
            </button>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={`p-2 ${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600' : 'bg-white hover:bg-slate-100'} ${currentTheme.cardBorder} border rounded-xl transition-all`}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
              </button>
              <div className={`flex items-center space-x-2 px-4 py-2 ${theme === 'dark' ? 'bg-purple-500/20 border-purple-500/40' : 'bg-purple-100 border-purple-300'} border rounded-full`}>
                <Trophy className={`w-4 h-4 ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}`} />
                <span className={`${currentTheme.text} font-bold`}>{userStats.points} pts</span>
              </div>
            </div>
          </div>
        </header>

        <div className="relative max-w-5xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className={`text-5xl font-black ${theme === 'dark' ? 'bg-gradient-to-r from-purple-400 to-pink-400' : 'bg-gradient-to-r from-purple-600 to-pink-600'} bg-clip-text text-transparent mb-3`}>
              MISSION CONTROL
            </h1>
            <p className={`${currentTheme.textMuted} text-lg`}>Complete challenges to level up your crypto skills</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {missions.map(mission => {
              const isCompleted = userStats.completedChallenges.includes(mission.id);
              const isActive = activeMission === mission.id;
              const Icon = mission.icon;

              return (
                <div
                  key={mission.id}
                  className={`relative backdrop-blur-xl border-2 rounded-2xl p-6 transition-all hover:scale-105 shadow-lg ${
                    isCompleted 
                      ? theme === 'dark' ? 'bg-green-500/10 border-green-500/50' : 'bg-green-50 border-green-400'
                      : isActive
                      ? theme === 'dark' ? 'bg-purple-500/10 border-purple-500' : 'bg-purple-50 border-purple-400'
                      : `${currentTheme.card} ${currentTheme.cardBorder}`
                  }`}
                >
                  {isCompleted && (
                    <div className="absolute -top-3 -right-3">
                      <div className={`${theme === 'dark' ? 'bg-gradient-to-r from-green-600 to-teal-600' : 'bg-gradient-to-r from-green-500 to-teal-500'} rounded-full p-2 border-4 ${theme === 'dark' ? 'border-slate-900' : 'border-white'} shadow-xl`}>
                        <CheckCircle2 className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  )}

                  <div className="flex items-start space-x-4 mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                      isCompleted 
                      ? theme === 'dark' ? 'bg-green-600' : 'bg-green-500'
                      : theme === 'dark' ? 'bg-purple-600' : 'bg-purple-500'
                    }`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className={`text-xl font-bold ${currentTheme.text}`}>{mission.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          mission.difficulty === 'Novice' ? theme === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700' :
                          mission.difficulty === 'Apprentice' ? theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700' :
                          mission.difficulty === 'Advanced' ? theme === 'dark' ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-700' :
                          theme === 'dark' ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'
                        }`}>
                          {mission.difficulty}
                        </span>
                      </div>
                      <p className={`${currentTheme.textMuted} text-sm`}>{mission.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Zap className={`w-4 h-4 ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}`} />
                      <span className={`${theme === 'dark' ? 'text-amber-400' : 'text-amber-700'} font-bold`}>{mission.points} pts</span>
                    </div>
                    {!isCompleted && (
                      <button
                        onClick={() => {
                          setActiveMission(isActive ? null : mission.id);
                          setSelectedCipher(mission.cipher);
                          setView('ciphers');
                        }}
                        className={`px-4 py-2 rounded-xl font-bold transition-all shadow-lg ${
                          isActive
                            ? theme === 'dark' ? 'bg-gradient-to-r from-purple-600 to-pink-700 text-white' : 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                            : theme === 'dark' ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                      >
                        {isActive ? '⚡ Continue' : 'Start'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {notification && (
          <div className="fixed top-6 right-6 z-50">
            <div className={`px-6 py-4 ${theme === 'dark' ? 'bg-purple-500/90 border-purple-300' : 'bg-purple-100 border-purple-400'} backdrop-blur-xl rounded-2xl border-2 shadow-2xl`}>
              <div className={`${theme === 'dark' ? 'text-white' : 'text-slate-900'} font-bold`}>{notification.message}</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Profile View  
  if (view === 'profile') {
    return (
      <div className={`min-h-screen ${currentTheme.bg} relative overflow-hidden`}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute w-96 h-96 ${currentTheme.glowColors[0]} rounded-full ${currentTheme.glow} bottom-0 left-0 animate-pulse`}></div>
        </div>

        <header className={`relative backdrop-blur-xl ${currentTheme.header} border-b ${currentTheme.cardBorder}`}>
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => setView('home')}
              className={`px-4 py-2 ${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-200 hover:bg-slate-300'} rounded-xl ${currentTheme.text} font-bold transition-all`}
            >
              ← Back
            </button>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`p-2 ${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600' : 'bg-white hover:bg-slate-100'} ${currentTheme.cardBorder} border rounded-xl transition-all`}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
            </button>
          </div>
        </header>

        <div className="relative max-w-5xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className={`text-5xl font-black ${theme === 'dark' ? 'bg-gradient-to-r from-green-400 to-teal-400' : 'bg-gradient-to-r from-green-600 to-teal-600'} bg-clip-text text-transparent mb-3`}>
              YOUR PROFILE
            </h1>
            <p className={`${currentTheme.textMuted} text-lg`}>Track your crypto mastery journey</p>
          </div>

          {/* Level Progress */}
          <div className={`backdrop-blur-xl ${currentTheme.card} border ${currentTheme.cardBorder} rounded-2xl p-8 mb-8 shadow-lg`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className={`text-5xl font-black ${theme === 'dark' ? 'bg-gradient-to-r from-purple-400 to-pink-400' : "bg-gradient-to-r from-green-600 to-teal-600"} bg-clip-text text-transparent mb-2`}>
                  Level {userStats.level}
                </div>
                <div className={currentTheme.textMuted}>Crypto Specialist</div>
              </div>
              <div className="text-right">
                <div className={`text-4xl font-black ${theme === 'dark' ? 'text-amber-400' : 'text-green-600'}`}>{userStats.points}</div>
                <div className={`${currentTheme.textMuted} text-sm`}>Total Points</div>
              </div>
            </div>
            <div className={`relative w-full h-4 ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'} rounded-full overflow-hidden`}>
              <div
                className={`absolute top-0 left-0 h-full ${theme === 'dark' ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-red-600' : 'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500'} rounded-full transition-all duration-500`}
                style={{ width: `${(userStats.points % 500) / 5}%` }}
              ></div>
            </div>
            <div className={`${currentTheme.textMuted} text-sm mt-2 text-right`}>
              {userStats.points % 500} / 500 to Level {userStats.level + 1}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Encryptions', value: userStats.totalEncryptions, icon: Lock, color: theme === 'dark' ? 'from-cyan-600 to-blue-700' : 'from-cyan-500 to-blue-600' },
              { label: 'Decryptions', value: userStats.totalDecryptions, icon: Unlock, color: theme === 'dark' ? 'from-purple-600 to-pink-700' : 'from-purple-500 to-pink-600' },
              { label: 'Missions', value: userStats.completedChallenges.length, icon: Target, color: theme === 'dark' ? 'from-green-600 to-teal-700' : 'from-green-500 to-teal-600' },
              { label: 'Best Combo', value: userStats.bestCombo + 'x', icon: Flame, color: theme === 'dark' ? 'from-orange-600 to-red-700' : 'from-orange-500 to-red-600' }
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
          <div className={`backdrop-blur-xl ${currentTheme.card} border ${currentTheme.cardBorder} rounded-2xl p-8 shadow-lg`}>
            <h2 className={`text-2xl font-bold ${currentTheme.text} mb-6 flex items-center`}>
              <Trophy className={`w-6 h-6 mr-2 ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}`} />
              Achievements
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map(achievement => {
                const isUnlocked = userStats.achievements.includes(achievement.id);
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
        </div>

        {notification && (
          <div className="fixed top-6 right-6 z-50">
            <div className={`px-6 py-4 ${theme === 'dark' ? 'bg-green-500/90 border-green-300' : 'bg-green-100 border-green-400'} backdrop-blur-xl rounded-2xl border-2 shadow-2xl`}>
              <div className={`${theme === 'dark' ? 'text-white' : 'text-slate-900'} font-bold`}>{notification.message}</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Cipher View
  const cipher = ciphers.find(c => c.id === selectedCipher);
  
  return (
    <div className={`min-h-screen ${currentTheme.bg} relative overflow-hidden`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute w-96 h-96 ${currentTheme.glowColors[0]} rounded-full ${currentTheme.glow} top-0 right-0 animate-pulse`}></div>
      </div>

      <header className={`relative backdrop-blur-xl ${currentTheme.header} border-b ${currentTheme.cardBorder}`}>
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                if (selectedCipher) {
                  setSelectedCipher(null);
                  setInputText('');
                  setOutputText('');
                  setEuclidResult('');
                  setShowCrack(false);
                } else {
                  setView('home');
                }
              }}
              className={`px-4 py-2 ${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-200 hover:bg-slate-300'} rounded-xl ${currentTheme.text} font-bold transition-all`}
            >
              ← {selectedCipher ? 'Back to Ciphers' : 'Home'}
            </button>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={`p-2 ${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600' : 'bg-white hover:bg-slate-100'} ${currentTheme.cardBorder} border rounded-xl transition-all`}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
              </button>
              {activeMission && (
                <div className={`flex items-center space-x-2 px-4 py-2 ${theme === 'dark' ? 'bg-purple-500/30 border-purple-500' : 'bg-purple-100 border-purple-400'} border rounded-full backdrop-blur-xl`}>
                  <Target className={`w-4 h-4 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-700'}`} />
                  <span className={`${currentTheme.text} font-bold text-sm`}>Mission Active</span>
                </div>
              )}
              {userStats.combo > 0 && (
                <div className={`flex items-center space-x-2 px-4 py-2 ${theme === 'dark' ? 'bg-orange-500/30 border-orange-500' : 'bg-orange-100 border-orange-300'} border rounded-full backdrop-blur-xl`}>
                  <Flame className={`w-4 h-4 ${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`} />
                  <span className={`${currentTheme.text} font-bold`}>{userStats.combo}x Combo</span>
                </div>
              )}
              <div className={`flex items-center space-x-2 px-4 py-2 ${theme === 'dark' ? 'bg-green-500/20 border-green-500/40' : 'bg-green-100 border-green-300'} border rounded-full backdrop-blur-xl`}>
                <Trophy className={`w-4 h-4 ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}`} />
                <span className={`${currentTheme.text} font-bold`}>{userStats.points}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="relative max-w-6xl mx-auto px-4 py-8">
        {!selectedCipher ? (
          <div>
            <div className="text-center mb-12">
              <h2 className={`text-5xl font-black ${theme === 'dark' ? 'bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400' : 'bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600'} bg-clip-text text-transparent mb-3`}>
                CHOOSE YOUR CIPHER
              </h2>
              <p className={`${currentTheme.textMuted} text-lg`}>Select an encryption technique to master</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ciphers.map((cipher) => {
                const Icon = cipher.icon;
                const tried = userStats.experiencedCiphers.includes(cipher.id);

                return (
                  <button
                    key={cipher.id}
                    onClick={() => setSelectedCipher(cipher.id)}
                    className={`group relative backdrop-blur-xl ${currentTheme.card} border ${currentTheme.cardBorder} rounded-2xl p-6 hover:scale-105 transition-all duration-300 shadow-lg ${currentTheme.cardHover}`}
                  >
                    {tried && (
                      <div className="absolute top-3 right-3">
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                      </div>
                    )}
                    <div className={`absolute inset-0 bg-gradient-to-r ${cipher.gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity`}></div>
                    <div className="relative flex flex-col items-center text-center">
                      <div className={`w-16 h-16 bg-gradient-to-br ${cipher.gradient} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className={`text-xl font-bold ${currentTheme.text} mb-2`}>{cipher.name}</h3>
                      <p className={`${currentTheme.textMuted} text-sm`}>{cipher.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className={`backdrop-blur-xl ${currentTheme.card} border ${currentTheme.cardBorder} rounded-2xl p-8 shadow-lg`}>
              {/* Cipher Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className={`w-16 h-16 bg-gradient-to-br ${cipher.gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
                    {React.createElement(cipher.icon, { className: "w-8 h-8 text-white" })}
                  </div>
                  <div>
                    <h2 className={`text-3xl font-black ${currentTheme.text}`}>{cipher.name}</h2>
                    <p className={currentTheme.textMuted}>{cipher.description}</p>
                  </div>
                </div>
              </div>

              {/* Mission Alert */}
              {activeMission && missions.find(m => m.id === activeMission)?.cipher === selectedCipher && (
                <div className={`mb-6 p-4 ${theme === 'dark' ? 'bg-purple-500/20 border-purple-500' : 'bg-purple-100 border-purple-300'} border-2 rounded-xl backdrop-blur-xl`}>
                  <div className="flex items-start space-x-3">
                    <AlertCircle className={`w-6 h-6 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-700'} flex-shrink-0 mt-0.5`} />
                    <div>
                      <div className={`font-bold ${theme === 'dark' ? 'text-purple-400' : 'text-purple-700'} mb-1`}>🎯 MISSION OBJECTIVE</div>
                      <div className={`${currentTheme.text} opacity-80 text-sm`}>
                        {missions.find(m => m.id === activeMission)?.description}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Mode Toggle */}
              {selectedCipher !== 'euclid' && !showCrack && (
                <div className="flex space-x-3 mb-6">
                  <button
                    onClick={() => setMode('encrypt')}
                    className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all shadow-lg ${
                      mode === 'encrypt'
                        ? `bg-gradient-to-r ${cipher.gradient} text-white`
                        : theme === 'dark' ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    <Lock className="w-5 h-5 inline mr-2" />
                    Encrypt
                  </button>
                  <button
                    onClick={() => setMode('decrypt')}
                    className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all shadow-lg ${
                      mode === 'decrypt'
                        ? `bg-gradient-to-r ${cipher.gradient} text-white`
                        : theme === 'dark' ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    <Unlock className="w-5 h-5 inline mr-2" />
                    Decrypt
                  </button>
                </div>
              )}

              {/* Cipher Controls */}
              <div className="mb-6">
                {renderCipherControls()}
              </div>

              {/* Input/Output */}
              {selectedCipher !== 'euclid' && (
                <div className="space-y-4">
                  <div>
                    <label className={`block ${currentTheme.text} font-bold mb-2`}>Input Text</label>
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className={`w-full h-32 ${currentTheme.input} border-2 ${currentTheme.cardBorder} ${currentTheme.inputFocus} rounded-xl px-4 py-3 ${currentTheme.text} placeholder-opacity-30 focus:outline-none resize-none transition-all`}
                      placeholder="Enter your message here..."
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className={`block ${currentTheme.text} font-bold`}>Output Text</label>
                      {outputText && (
                        <button
                          onClick={copyToClipboard}
                          className={`flex items-center space-x-2 px-4 py-2 ${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-200 hover:bg-slate-300'} rounded-lg ${currentTheme.text} transition-all`}
                        >
                          {copied ? (
                            <>
                              <Check className="w-4 h-4 text-green-500" />
                              <span className="text-green-500 font-bold">Copied!</span>
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
                      className={`w-full h-32 ${theme === 'dark' ? 'bg-gradient-to-br from-slate-800 to-slate-700' : 'bg-gradient-to-br from-slate-50 to-slate-100'} border-2 ${currentTheme.cardBorder} rounded-xl px-4 py-3 ${currentTheme.text} font-bold focus:outline-none resize-none`}
                      placeholder="Result will appear here..."
                    />
                  </div>
                </div>
              )}

              {/* Process Button */}
              <button
                onClick={handleProcess}
                className={`w-full mt-6 py-4 px-8 bg-gradient-to-r ${cipher.gradient} hover:shadow-2xl text-white font-black text-lg rounded-xl transition-all duration-300 transform hover:scale-105`}
              >
                {selectedCipher === 'euclid' 
                  ? ' CALCULATE' 
                  : showCrack 
                  ? '🔓 CRACK THE CODE'
                  : mode === 'encrypt' 
                  ? '🔒 ENCRYPT MESSAGE' 
                  : '🔓 DECRYPT MESSAGE'
                }
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Notifications */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 animate-bounce">
          <div className={`px-6 py-4 rounded-2xl backdrop-blur-xl border-2 shadow-2xl ${
            notification.type === 'levelup' 
              ? theme === 'dark' ? 'bg-amber-500/90 border-amber-300' : 'bg-amber-100 border-amber-400'
              : notification.type === 'achievement'
              ? theme === 'dark' ? 'bg-purple-500/90 border-purple-300' : 'bg-purple-100 border-purple-400'
              : notification.type === 'success'
              ? theme === 'dark' ? 'bg-green-500/90 border-green-300' : 'bg-green-100 border-green-400'
              : notification.type === 'error'
              ? theme === 'dark' ? 'bg-red-500/90 border-red-300' : 'bg-red-100 border-red-400'
              : theme === 'dark' ? 'bg-cyan-500/90 border-cyan-300' : 'bg-cyan-100 border-cyan-400'
          }`}>
            <div className={`${theme === 'dark' ? 'text-white' : 'text-slate-900'} font-bold text-lg`}>{notification.message}</div>
          </div>
        </div>
      )}

      {/* Reward Popup */}
      {recentReward && (
        <div className="fixed bottom-8 right-8 z-50">
          <div className={`${theme === 'dark' ? 'bg-gradient-to-r from-amber-500 to-orange-500 border-amber-300' : 'bg-gradient-to-r from-amber-400 to-orange-500 border-amber-500'} backdrop-blur-xl px-8 py-4 rounded-2xl border-4 shadow-2xl animate-bounce`}>
            <div className="flex items-center space-x-3">
              <Zap className="w-8 h-8 text-white" />
              <div>
                <div className="text-white font-black text-2xl">+{recentReward.points}</div>
                <div className="text-white/90 text-sm">{recentReward.reason}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CryptoLab;