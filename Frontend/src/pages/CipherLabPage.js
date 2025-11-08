import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Unlock, Key, Grid3x3, Hash, Calculator, Copy, Check, Zap, Trophy, Target, Sparkles, CheckCircle2, Sun, Moon, Flame, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const CipherLabPage = () => {
  const { user, updateUser } = useAuth();
  const { theme, currentTheme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  const [selectedCipher, setSelectedCipher] = useState(null);
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [mode, setMode] = useState('encrypt');
  const [copied, setCopied] = useState(false);
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

  const ciphers = [
    {
      id: 'affine',
      name: 'Affine Cipher',
      icon: Hash,
      description: 'Mathematical magic with C = aP + b (mod 26)',
      gradient: theme === 'dark' ? 'from-cyan-600 via-blue-700 to-blue-800' : 'from-cyan-400 via-blue-500 to-blue-600',
    },
    {
      id: 'mono',
      name: 'Mono-Alphabetic',
      icon: Key,
      description: 'Classic substitution with your custom alphabet',
      gradient: theme === 'dark' ? 'from-purple-600 via-purple-700 to-pink-800' : 'from-purple-400 via-purple-500 to-pink-600',
    },
    {
      id: 'vigenere',
      name: 'Vigenère Cipher',
      icon: Lock,
      description: 'Polyalphabetic powerhouse with keyword magic',
      gradient: theme === 'dark' ? 'from-green-600 via-emerald-700 to-teal-800' : 'from-green-400 via-emerald-500 to-teal-600',
    },
    {
      id: 'playfair',
      name: 'Playfair Cipher',
      icon: Grid3x3,
      description: 'Digraph encryption with 5×5 matrix wizardry',
      gradient: theme === 'dark' ? 'from-orange-600 via-red-700 to-red-800' : 'from-orange-400 via-red-500 to-red-600',
    },
    {
      id: 'hill',
      name: 'Hill Cipher',
      icon: Grid3x3,
      description: 'Linear algebra meets cryptography',
      gradient: theme === 'dark' ? 'from-indigo-600 via-purple-700 to-purple-800' : 'from-indigo-400 via-purple-500 to-purple-600',
    },
    {
      id: 'euclid',
      name: 'Extended Euclid',
      icon: Calculator,
      description: 'Mathematical foundation for modular arithmetic',
      gradient: theme === 'dark' ? 'from-amber-600 via-orange-700 to-orange-800' : 'from-amber-400 via-orange-500 to-orange-600',
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
    const newPoints = user.stats.points + points;
    const newLevel = Math.floor(newPoints / 500) + 1;
    const newCombo = user.stats.combo + 1;
    
    if (newLevel > user.stats.level) {
      showNotification(`🎉 LEVEL UP! You're now level ${newLevel}!`, 'levelup');
    }

    updateUser({
      ...user,
      stats: {
        ...user.stats,
        points: newPoints,
        level: newLevel,
        combo: newCombo,
        bestCombo: Math.max(newCombo, user.stats.bestCombo)
      }
    });

    setRecentReward({ points, reason });
    setTimeout(() => setRecentReward(null), 2000);
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
        return;
    }

    setOutputText(result);
    
    const newStats = {
      ...user.stats,
      totalEncryptions: mode === 'encrypt' ? user.stats.totalEncryptions + 1 : user.stats.totalEncryptions,
      totalDecryptions: mode === 'decrypt' ? user.stats.totalDecryptions + 1 : user.stats.totalDecryptions,
      experiencedCiphers: user.stats.experiencedCiphers.includes(selectedCipher) 
        ? user.stats.experiencedCiphers 
        : [...user.stats.experiencedCiphers, selectedCipher]
    };

    updateUser({ ...user, stats: newStats });

    const basePoints = mode === 'encrypt' ? 25 : 35;
    const comboBonus = user.stats.combo * 5;
    awardPoints(basePoints + comboBonus, mode === 'encrypt' ? 'Encrypted' : 'Decrypted');
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

  const cipher = ciphers.find(c => c.id === selectedCipher);

  return (
    <div className={`min-h-screen ${currentTheme.bg} relative overflow-hidden`}>
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute w-96 h-96 ${currentTheme.glowColors[0]} rounded-full ${currentTheme.glow} top-0 right-0 animate-pulse`}></div>
      </div>

      {/* Header */}
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
                  navigate('/');
                }
              }}
              className={`px-4 py-2 ${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-200 hover:bg-slate-300'} rounded-xl ${currentTheme.text} font-bold transition-all`}
            >
              ← {selectedCipher ? 'Back to Ciphers' : 'Home'}
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

      <div className="relative max-w-6xl mx-auto px-4 py-8">
        {!selectedCipher ? (
          <div>
            <div className="text-center mb-12">
<h2 className={`text-5xl font-black mb-3 ${
  theme === 'dark' 
    ? 'text-cyan-400'   // solid cyan for dark mode
    : 'text-blue-900' // solid cyan for light mode
}`}>

                CHOOSE YOUR CIPHER
              </h2>
              <p className={`${currentTheme.textMuted} text-lg`}>Select an encryption technique to master</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ciphers.map((cipher) => {
                const Icon = cipher.icon;
                const tried = user.stats.experiencedCiphers.includes(cipher.id);

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
                  ? '🧮 CALCULATE' 
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

export default CipherLabPage;