import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Hash,
  Key,
  Lock,
  Grid3x3,
  Calculator,
  ChevronDown,
  ChevronUp,
  Sun,
  Moon,
  ArrowLeft,
  Lightbulb,
  Code,
  Shield
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const CipherInfoPage = () => {
  const { theme, currentTheme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [expandedCipher, setExpandedCipher] = useState('affine');

  const ciphersInfo = [
    {
      id: 'affine',
      name: 'Affine Cipher',
      icon: Hash,
      gradient: theme === 'dark'
        ? 'from-cyan-600 via-blue-700 to-blue-800'
        : 'from-cyan-400 via-blue-500 to-blue-600',
      tagline: 'Mathematical encryption using modular arithmetic',
      
      overview: 'The Affine Cipher is a type of monoalphabetic substitution cipher that uses mathematical operations (multiplication and addition) combined with modular arithmetic to encrypt text. It provides a more secure alternative to simple Caesar ciphers.',
      
      formula: 'Encryption: C = (aP + b) mod 26\nDecryption: P = a⁻¹(C - b) mod 26',
      
      howItWorks: [
        {
          step: '1. Key Selection',
          description: 'Choose two numbers: multiplier (a) and shift (b)',
          details: 'The multiplier "a" must be coprime with 26 (gcd(a, 26) = 1). Valid values: 1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25. The shift "b" can be any number from 0 to 25.'
        },
        {
          step: '2. Encryption Process',
          description: 'For each letter in plaintext',
          details: 'Convert the letter to a number (A=0, B=1, ..., Z=25). Apply the formula: C = (a × P + b) mod 26. Convert the result back to a letter. Non-alphabetic characters remain unchanged.'
        },
        {
          step: '3. Decryption Process',
          description: 'Reverse the encryption using modular inverse',
          details: 'Find the modular inverse of "a" (denoted a⁻¹). For each ciphertext letter: P = a⁻¹ × (C - b) mod 26. The modular inverse ensures we can reverse the multiplication.'
        },
        {
          step: '4. Frequency Analysis Cracking',
          description: 'Break the cipher using statistical analysis',
          details: 'Identify the two most frequent letters in the ciphertext (typically corresponding to E and T in English). Use these two letter pairs to solve for "a" and "b" by solving a system of linear equations modulo 26.'
        }
      ],
      
      example: {
        title: 'Example: Encrypting "HELLO" with a=5, b=8',
        steps: [
          'H (7): (5×7 + 8) mod 26 = 43 mod 26 = 17 → R',
          'E (4): (5×4 + 8) mod 26 = 28 mod 26 = 2 → C',
          'L (11): (5×11 + 8) mod 26 = 63 mod 26 = 11 → L',
          'L (11): (5×11 + 8) mod 26 = 63 mod 26 = 11 → L',
          'O (14): (5×14 + 8) mod 26 = 78 mod 26 = 0 → A'
        ],
        result: 'HELLO → RCLLA'
      },
      
      strengths: [
        'More secure than simple shift ciphers',
        'Easy to implement mathematically',
        'Adds complexity with two parameters'
      ],
      
      weaknesses: [
        'Still vulnerable to frequency analysis',
        'Limited keyspace (only 312 possible keys)',
        'Pattern preservation can leak information'
      ]
    },
    
    {
      id: 'mono',
      name: 'Monoalphabetic Cipher',
      icon: Key,
      gradient: theme === 'dark'
        ? 'from-purple-600 via-purple-700 to-pink-800'
        : 'from-purple-400 via-purple-500 to-pink-600',
      tagline: 'Classic substitution with custom 26-letter alphabet',
      
      overview: 'A Monoalphabetic Substitution Cipher replaces each letter of the alphabet with another letter according to a fixed substitution key. Each plaintext letter always maps to the same ciphertext letter, creating a one-to-one correspondence.',
      
      formula: 'Each letter A-Z maps to a unique letter in the substitution key',
      
      howItWorks: [
        {
          step: '1. Key Creation',
          description: 'Create a 26-letter substitution alphabet',
          details: 'The key must contain exactly 26 unique letters (A-Z). Each letter appears exactly once. Example: "QWERTYUIOPASDFGHJKLZXCVBNM". This creates a mapping where A→Q, B→W, C→E, etc.'
        },
        {
          step: '2. Build Mapping Tables',
          description: 'Create encryption and decryption maps',
          details: 'For encryption: map each standard alphabet letter to its corresponding key letter. For decryption: create the reverse mapping from key letters back to standard letters. Handle both uppercase and lowercase separately.'
        },
        {
          step: '3. Encryption',
          description: 'Substitute each letter using the key',
          details: 'For each character in the plaintext: if it\'s a letter, replace it with the corresponding letter from the substitution key. Preserve the original case (uppercase/lowercase). Keep all non-letter characters (spaces, punctuation) unchanged.'
        },
        {
          step: '4. Decryption',
          description: 'Reverse the substitution',
          details: 'Use the reverse mapping table. For each ciphertext letter, look up which standard alphabet letter it represents. Preserve case and leave non-letters unchanged.'
        }
      ],
      
      example: {
        title: 'Example with key "QWERTYUIOPASDFGHJKLZXCVBNM"',
        steps: [
          'Standard: A B C D E F G H I J K L M N O P Q R S T U V W X Y Z',
          'Key:      Q W E R T Y U I O P A S D F G H J K L M N V X Z B C',
          '',
          'Encrypting "HELLO":',
          'H → I, E → T, L → S, L → S, O → G',
          'Result: HELLO → ITSSG'
        ],
        result: 'Each letter consistently maps to the same substitute'
      },
      
      strengths: [
        'Large keyspace (26! ≈ 4×10²⁶ possible keys)',
        'Simple to implement and understand',
        'Fast encryption/decryption'
      ],
      
      weaknesses: [
        'Extremely vulnerable to frequency analysis',
        'Preserves letter frequency patterns',
        'Can be broken with sufficient ciphertext'
      ]
    },
    
    {
      id: 'vigenere',
      name: 'Vigenère Cipher',
      icon: Lock,
      gradient: theme === 'dark'
        ? 'from-green-600 via-emerald-700 to-teal-800'
        : 'from-green-400 via-emerald-500 to-teal-600',
      tagline: 'Polyalphabetic encryption with repeating keyword',
      
      overview: 'The Vigenère Cipher is a polyalphabetic substitution cipher that uses a repeating keyword to shift letters by different amounts. Unlike monoalphabetic ciphers, the same plaintext letter can encrypt to different ciphertext letters, making frequency analysis much harder.',
      
      formula: 'Encryption: C = (P + K) mod 26\nDecryption: P = (C - K) mod 26',
      
      howItWorks: [
        {
          step: '1. Keyword Preparation',
          description: 'Clean and prepare the keyword',
          details: 'Remove all non-letter characters from the keyword and convert to uppercase. The keyword must contain at least one letter. Example: "SECRET KEY" becomes "SECRETKEY".'
        },
        {
          step: '2. Keyword Repetition',
          description: 'Repeat the keyword to match message length',
          details: 'The keyword repeats cyclically throughout the message. Only advance through the keyword for actual letters (skip spaces and punctuation). Example: if keyword is "KEY" and message is "HELLO WORLD", the key pattern is "KEYKE YKEYK".'
        },
        {
          step: '3. Encryption Process',
          description: 'Shift each letter by the corresponding keyword letter',
          details: 'For each letter in the plaintext: Convert both plaintext letter and keyword letter to numbers (A=0...Z=25). Add them together: (P + K) mod 26. Convert back to a letter. The same plaintext letter encrypts differently based on its position.'
        },
        {
          step: '4. Decryption Process',
          description: 'Reverse the shift using subtraction',
          details: 'For each ciphertext letter: Convert both ciphertext and keyword letter to numbers. Subtract the keyword value: (C - K) mod 26. The modulo operation handles negative results properly.'
        }
      ],
      
      example: {
        title: 'Example: Encrypting "HELLO" with keyword "KEY"',
        steps: [
          'Plaintext:  H   E   L   L   O',
          'Keyword:    K   E   Y   K   E',
          'Values:     7+10 4+4 11+24 11+10 14+4',
          'Results:    17  8   9   21  18',
          'Ciphertext: R   I   J   V   S'
        ],
        result: 'HELLO → RIJVS (same letters encrypt differently!)'
      },
      
      strengths: [
        'Resistant to simple frequency analysis',
        'Same plaintext letters encrypt to different letters',
        'Longer keywords provide better security'
      ],
      
      weaknesses: [
        'Vulnerable to Kasiski examination',
        'Can be broken if keyword length is discovered',
        'Short keywords create repeating patterns'
      ]
    },
    
    {
      id: 'playfair',
      name: 'Playfair Cipher',
      icon: Grid3x3,
      gradient: theme === 'dark'
        ? 'from-orange-600 via-red-700 to-red-800'
        : 'from-orange-400 via-red-500 to-red-600',
      tagline: 'Digraph encryption using a 5×5 matrix',
      
      overview: 'The Playfair Cipher encrypts pairs of letters (digraphs) instead of single letters using a 5×5 matrix generated from a keyword. This digraph approach makes frequency analysis much more difficult since it operates on 676 possible letter pairs instead of 26 individual letters.',
      
      formula: 'Encrypts pairs of letters using position rules in a 5×5 matrix',
      
      howItWorks: [
        {
          step: '1. Matrix Generation',
          description: 'Create a 5×5 grid from the keyword',
          details: 'Start with the keyword (removing duplicates, J→I). Add remaining alphabet letters. Example with "MONARCHY": Fill the matrix row by row with M-O-N-A-R-C-H-Y, then add unused letters B-D-E-F-G-I-K-L-P-Q-S-T-U-V-W-X-Z.'
        },
        {
          step: '2. Text Preparation',
          description: 'Prepare the message for digraph encryption',
          details: 'Split text into pairs of letters. If two consecutive letters are the same, insert an "X" between them. If the message has odd length, append an "X" at the end. Preserve non-letter characters in their original positions.'
        },
        {
          step: '3. Rectangle Rule',
          description: 'Same row: shift right; Same column: shift down',
          details: 'If the two letters are in the same row, replace each with the letter to its right (wrapping around). If in the same column, replace each with the letter below it (wrapping around).'
        },
        {
          step: '4. Rectangle Rule',
          description: 'Different row and column: swap corners',
          details: 'If letters form a rectangle in the matrix, replace each letter with the letter in the same row but in the other letter\'s column. This "corner swap" is the most common case.'
        },
        {
          step: '5. Decryption',
          description: 'Apply rules in reverse direction',
          details: 'Use the same matrix. For same row: shift left. For same column: shift up. For rectangles: swap corners (same as encryption). Remove padding X\'s carefully.'
        }
      ],
      
      example: {
        title: 'Example with keyword "MONARCHY"',
        steps: [
          'Matrix:',
          'M O N A R',
          'C H Y B D',
          'E F G I/J K',
          'L P Q S T',
          'U V W X Z',
          '',
          'Encrypting "HELLO":',
          'Pairs: HE LL OX (inserted X between LL, added X at end)',
          'HE: Different rows/cols → HY (swap corners)',
          'LL: Same letter → LX (insert X) → LW',
          'OX: Different rows/cols → MZ (swap corners)'
        ],
        result: 'HELLO → HYLWMZ (note the digraph transformations)'
      },
      
      strengths: [
        'Operates on pairs, making frequency analysis harder',
        '676 possible digraphs vs 26 single letters',
        'Obscures common letter patterns'
      ],
      
      weaknesses: [
        'J and I are treated as the same letter',
        'Digraph frequency analysis is still possible',
        'Padding X\'s can sometimes be detected'
      ]
    },
    
    {
      id: 'hill',
      name: 'Hill Cipher',
      icon: Grid3x3,
      gradient: theme === 'dark'
        ? 'from-indigo-600 via-purple-700 to-purple-800'
        : 'from-indigo-400 via-purple-500 to-purple-600',
      tagline: 'Linear algebra meets cryptography with matrix multiplication',
      
      overview: 'The Hill Cipher uses linear algebra and matrix multiplication to encrypt blocks of letters simultaneously. Invented by Lester S. Hill in 1929, it was the first polygraphic cipher that was practical to operate on more than three symbols at once.',
      
      formula: 'Encryption: C = K × P (mod 26)\nDecryption: P = K⁻¹ × C (mod 26)',
      
      howItWorks: [
        {
          step: '1. Key Matrix Selection',
          description: 'Choose an invertible n×n matrix',
          details: 'Select a 2×2 or 3×3 matrix of integers. The matrix must be invertible modulo 26 (determinant must be coprime with 26). Example 2×2: [[3,3],[2,5]]. The determinant is 3×5 - 3×2 = 9, and gcd(9,26)=1, so it\'s valid.'
        },
        {
          step: '2. Matrix Inversion',
          description: 'Calculate the modular inverse matrix',
          details: 'Find the determinant det(K) of the key matrix. Calculate d⁻¹ = det(K)⁻¹ (mod 26). Compute the adjugate matrix adj(K). The inverse is K⁻¹ = d⁻¹ × adj(K) (mod 26). All operations are performed modulo 26.'
        },
        {
          step: '3. Text Preparation',
          description: 'Convert letters to vectors',
          details: 'Extract only letters from the text, preserving their positions. Convert each letter to a number (A=0...Z=25). Group into vectors of size n (matching matrix size). Pad the last block with X\'s (23) if needed.'
        },
        {
          step: '4. Encryption',
          description: 'Multiply each vector by the key matrix',
          details: 'For each n-letter block (vector P): Multiply K × P. Take each result modulo 26. Convert numbers back to letters. Replace letters in original positions, append any padding at the end.'
        },
        {
          step: '5. Decryption',
          description: 'Multiply by the inverse matrix',
          details: 'Use the inverse matrix K⁻¹ instead of K. Follow the same multiplication process. Remove up to (n-1) trailing lowercase x padding letters after reconstruction.'
        }
      ],
      
      example: {
        title: 'Example with 2×2 matrix [[3,3],[2,5]] encrypting "HI"',
        steps: [
          'Key Matrix K = [[3,3],[2,5]]',
          'Plaintext: H=7, I=8 → vector [7,8]',
          '',
          'Encryption: K × [7,8]',
          'Row 1: 3×7 + 3×8 = 21 + 24 = 45 mod 26 = 19 → T',
          'Row 2: 2×7 + 5×8 = 14 + 40 = 54 mod 26 = 2 → C',
          '',
          'Result: HI → TC'
        ],
        result: 'Multiple letters encrypted simultaneously as a block'
      },
      
      strengths: [
        'Encrypts multiple letters simultaneously',
        'Resistant to single-letter frequency analysis',
        'Based on strong mathematical foundation'
      ],
      
      weaknesses: [
        'Vulnerable to known-plaintext attacks',
        'Key matrix must be carefully chosen',
        'Complex to implement compared to other classical ciphers'
      ]
    },
    
    {
      id: 'euclid',
      name: 'Extended Euclidean Algorithm',
      icon: Calculator,
      gradient: theme === 'dark'
        ? 'from-amber-600 via-orange-700 to-orange-800'
        : 'from-amber-400 via-orange-500 to-orange-600',
      tagline: 'Mathematical foundation for modular arithmetic',
      
      overview: 'The Extended Euclidean Algorithm is a mathematical tool that finds the greatest common divisor (GCD) of two numbers and also computes their Bézout coefficients. It\'s essential for finding modular inverses, which are crucial for decrypting affine and Hill ciphers.',
      
      formula: 'Finds: gcd(a,m) and coefficients x,y such that ax + my = gcd(a,m)',
      
      howItWorks: [
        {
          step: '1. Standard Euclidean Algorithm',
          description: 'Find GCD using repeated division',
          details: 'Start with two numbers a and m. Repeatedly divide and take remainders: r = a mod m, then a = m, m = r. Continue until remainder is 0. The last non-zero remainder is the GCD. Example: gcd(15,26) computes 26=1×15+11, 15=1×11+4, 11=2×4+3, 4=1×3+1, 3=3×1+0. GCD = 1.'
        },
        {
          step: '2. Extended Algorithm',
          description: 'Track coefficients during division',
          details: 'While computing GCD, maintain three sequences: remainders (r), and two coefficient sequences (s and t). At each step, update: s_new = s_old - quotient × s_current, t_new = t_old - quotient × t_current. Initialize: s starts at [1,0], t starts at [0,1].'
        },
        {
          step: '3. Bézout Coefficients',
          description: 'Express GCD as a linear combination',
          details: 'The final coefficients x and y satisfy: a×x + m×y = gcd(a,m). These are called Bézout coefficients. Example: 15×7 + 26×(-4) = 105 - 104 = 1 = gcd(15,26).'
        },
        {
          step: '4. Modular Inverse',
          description: 'Find multiplicative inverse modulo m',
          details: 'If gcd(a,m) = 1, then a has an inverse mod m. The inverse is a⁻¹ ≡ x (mod m), where x is the Bézout coefficient. Normalize to positive: inverse = (x mod m + m) mod m. Example: 15⁻¹ ≡ 7 (mod 26).'
        },
        {
          step: '5. Applications in Cryptography',
          description: 'Essential for cipher operations',
          details: 'Affine Cipher: Need a⁻¹ to decrypt. Hill Cipher: Need matrix inverse (uses multiple modular inverses). RSA: Uses extended GCD for key generation. Any cipher using modular arithmetic requires this algorithm.'
        }
      ],
      
      example: {
        title: 'Finding modular inverse of 15 mod 26',
        steps: [
          'Step 1: Apply Extended Euclidean Algorithm',
          '26 = 1×15 + 11  →  11 = 26 - 1×15',
          '15 = 1×11 + 4   →  4 = 15 - 1×11 = 15 - 1×(26-1×15) = 2×15 - 1×26',
          '11 = 2×4 + 3    →  3 = 11 - 2×4 = (26-1×15) - 2×(2×15-1×26) = 3×26 - 5×15',
          '4 = 1×3 + 1     →  1 = 4 - 1×3 = (2×15-1×26) - 1×(3×26-5×15) = 7×15 - 4×26',
          '',
          'Result: gcd(15,26) = 1',
          'Bézout: 15×7 + 26×(-4) = 1',
          'Therefore: 15⁻¹ ≡ 7 (mod 26)'
        ],
        result: 'The modular inverse of 15 mod 26 is 7'
      },
      
      strengths: [
        'Fundamental algorithm in number theory',
        'Efficiently computes GCD and inverses',
        'Essential for cryptographic operations'
      ],
      
      weaknesses: [
        'Not a cipher itself, but a mathematical tool',
        'Only finds inverses when gcd = 1',
        'Requires understanding of modular arithmetic'
      ]
    }
  ];

  const toggleCipher = (cipherId) => {
    setExpandedCipher(expandedCipher === cipherId ? null : cipherId);
  };

  return (
    <div className={`min-h-screen ${currentTheme.bg} relative overflow-hidden`}>
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute w-96 h-96 ${currentTheme.glowColors?.[0] || 'bg-cyan-500/20'} rounded-full ${currentTheme.glow || 'blur-3xl'} -top-48 -left-48 animate-pulse`}></div>
        <div className={`absolute w-96 h-96 ${currentTheme.glowColors?.[1] || 'bg-purple-500/20'} rounded-full ${currentTheme.glow || 'blur-3xl'} top-1/2 right-0 animate-pulse`} style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Header */}
      <header className={`relative backdrop-blur-xl ${currentTheme.header} border-b ${currentTheme.cardBorder} sticky top-0 z-50`}>
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className={`flex items-center space-x-2 px-4 py-2 ${
                theme === 'dark'
                  ? 'bg-slate-700 hover:bg-slate-600'
                  : 'bg-slate-200 hover:bg-slate-300'
              } rounded-xl ${currentTheme.text} font-bold transition-all`}
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </button>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <BookOpen className={`w-5 h-5 ${theme === 'dark' ? 'text-cyan-400' : 'text-blue-600'}`} />
                <span className={`${currentTheme.text} font-bold hidden md:block`}>Cipher Encyclopedia</span>
              </div>
              
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative max-w-6xl mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Shield className={`w-12 h-12 ${theme === 'dark' ? 'text-cyan-400' : 'text-blue-600'}`} />
          </div>
          <h1 className={`text-5xl font-black mb-4 ${theme === 'dark' ? 'text-cyan-400' : 'text-blue-900'}`}>
            CIPHER ENCYCLOPEDIA
          </h1>
          <p className={`text-xl ${currentTheme.textMuted} max-w-3xl mx-auto`}>
            Master the art of classical cryptography. Explore the mathematical foundations, step-by-step processes, and historical significance of each encryption technique.
          </p>
        </div>

        {/* Cipher Cards */}
        <div className="space-y-6">
          {ciphersInfo.map((cipher) => {
            const Icon = cipher.icon;
            const isExpanded = expandedCipher === cipher.id;

            return (
              <div
                key={cipher.id}
                className={`backdrop-blur-xl ${currentTheme.card} border-2 ${currentTheme.cardBorder} rounded-2xl overflow-hidden shadow-lg transition-all duration-300 ${
                  isExpanded ? 'ring-2 ring-cyan-500/50' : ''
                }`}
              >
                {/* Cipher Header */}
                <button
                  onClick={() => toggleCipher(cipher.id)}
                  className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-16 h-16 bg-gradient-to-br ${cipher.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-left">
                      <h2 className={`text-2xl font-bold ${currentTheme.text}`}>
                        {cipher.name}
                      </h2>
                      <p className={`${currentTheme.textMuted} text-sm mt-1`}>
                        {cipher.tagline}
                      </p>
                    </div>
                  </div>
                  
                  {isExpanded ? (
                    <ChevronUp className={`w-6 h-6 ${currentTheme.text}`} />
                  ) : (
                    <ChevronDown className={`w-6 h-6 ${currentTheme.text}`} />
                  )}
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-slate-700/50 p-6 space-y-6">
                    {/* Overview */}
                    <div>
                      <h3 className={`text-lg font-bold ${currentTheme.text} mb-2 flex items-center`}>
                        <Lightbulb className="w-5 h-5 mr-2 text-amber-400" />
                        Overview
                      </h3>
                      <p className={`${currentTheme.textMuted} leading-relaxed`}>
                        {cipher.overview}
                      </p>
                    </div>

                    {/* Formula */}
                    <div className={`${theme === 'dark' ? 'bg-slate-900/50' : 'bg-slate-100'} border ${currentTheme.cardBorder} rounded-xl p-4`}>
                      <h3 className={`text-sm font-bold ${currentTheme.text} mb-2 flex items-center`}>
                        <Code className="w-4 h-4 mr-2" />
                        Mathematical Formula
                      </h3>
                      <pre className={`${currentTheme.text} font-mono text-sm whitespace-pre-wrap`}>
                        {cipher.formula}
                      </pre>
                    </div>

                    {/* How It Works */}
                    <div>
                      <h3 className={`text-lg font-bold ${currentTheme.text} mb-4`}>
                        How It Works
                      </h3>
                      <div className="space-y-4">
                        {cipher.howItWorks.map((step, idx) => (
                          <div
                            key={idx}
                            className={`${theme === 'dark' ? 'bg-slate-800/50' : 'bg-white'} border ${currentTheme.cardBorder} rounded-xl p-4`}
                          >
                            <div className="flex items-start space-x-3">
                              <div className={`w-8 h-8 bg-gradient-to-br ${cipher.gradient} rounded-lg flex items-center justify-center flex-shrink-0 text-white font-bold text-sm`}>
                                {idx + 1}
                              </div>
                              <div className="flex-1">
                                <h4 className={`font-bold ${currentTheme.text} mb-1`}>
                                  {step.step}
                                </h4>
                                <p className={`${currentTheme.textMuted} text-sm mb-2`}>
                                  {step.description}
                                </p>
                                <p className={`${currentTheme.textMuted} text-xs leading-relaxed`}>
                                  {step.details}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Example */}
                    <div className={`${theme === 'dark' ? 'bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30' : 'bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-300'} border-2 rounded-xl p-6`}>
                      <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-700'} mb-3`}>
                        📝 {cipher.example.title}
                      </h3>
                      <div className="space-y-1">
                        {cipher.example.steps.map((step, idx) => (
                          <div key={idx} className={`${currentTheme.text} font-mono text-sm`}>
                            {step}
                          </div>
                        ))}
                      </div>
                      <div className={`mt-4 pt-4 border-t ${theme === 'dark' ? 'border-cyan-500/30' : 'border-cyan-300'}`}>
                        <span className={`${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-700'} font-bold`}>
                          ✓ {cipher.example.result}
                        </span>
                      </div>
                    </div>

                    {/* Strengths & Weaknesses */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className={`${theme === 'dark' ? 'bg-green-500/10 border-green-500/30' : 'bg-green-50 border-green-300'} border-2 rounded-xl p-4`}>
                        <h3 className={`font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-700'} mb-3`}>
                          ✓ Strengths
                        </h3>
                        <ul className="space-y-2">
                          {cipher.strengths.map((strength, idx) => (
                            <li key={idx} className={`${currentTheme.textMuted} text-sm flex items-start`}>
                              <span className="text-green-500 mr-2">•</span>
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className={`${theme === 'dark' ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-300'} border-2 rounded-xl p-4`}>
                        <h3 className={`font-bold ${theme === 'dark' ? 'text-red-400' : 'text-red-700'} mb-3`}>
                          ✗ Weaknesses
                        </h3>
                        <ul className="space-y-2">
                          {cipher.weaknesses.map((weakness, idx) => (
                            <li key={idx} className={`${currentTheme.textMuted} text-sm flex items-start`}>
                              <span className="text-red-500 mr-2">•</span>
                              {weakness}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Try It Now Button */}
                    <div className="flex justify-center pt-4">
                      <button
                        onClick={() => navigate('/cipherlab', { state: { cipher: cipher.id } })}
                        className={`px-8 py-3 bg-gradient-to-r ${cipher.gradient} text-white font-bold rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105`}
                      >
                        Try {cipher.name} Now →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer CTA */}
        <div className={`mt-12 backdrop-blur-xl ${currentTheme.card} border ${currentTheme.cardBorder} rounded-2xl p-8 text-center shadow-lg`}>
          <h2 className={`text-3xl font-bold ${currentTheme.text} mb-4`}>
            Ready to Master Classical Cryptography?
          </h2>
          <p className={`${currentTheme.textMuted} mb-6`}>
            Head to the Cipher Lab to practice these techniques hands-on, or complete missions to test your skills!
          </p>
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => navigate('/cipherlab')}
              className={`px-6 py-3 ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-700'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600'
              } text-white font-bold rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105`}
            >
              Open Cipher Lab
            </button>
            <button
              onClick={() => navigate('/missions')}
              className={`px-6 py-3 ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-700'
                  : 'bg-gradient-to-r from-purple-500 to-pink-600'
              } text-white font-bold rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105`}
            >
              View Missions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CipherInfoPage;
