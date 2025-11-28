// ===============================
// AFFINE CIPHER (FULL FIXED VERSION)
// ===============================

// constants
const A = 26;
const isLetter = (c) => /[A-Za-z]/.test(c);
const baseOf = (c) => (c === c.toUpperCase() ? 65 : 97);
const mod = (x, m = A) => ((x % m) + m) % m;

// gcd + extended gcd (standard)
function gcd(a, b) {
  a = Math.abs(a); 
  b = Math.abs(b);
  while (b !== 0) {
    const t = a % b;
    a = b;
    b = t;
  }
  return a;
}

function egcd(a, b) {
  if (b === 0) return { g: a, x: 1, y: 0 };
  const { g, x: x1, y: y1 } = egcd(b, a % b);
  return { g, x: y1, y: x1 - Math.floor(a / b) * y1 };
}

function modInv(a, m = A) {
  a = mod(a, m);
  const { g, x } = egcd(a, m);
  if (g !== 1) throw new Error(`No modular inverse for a=${a} (gcd=${g})`);
  return mod(x, m);
}

// ===============================
// ENCRYPT
// ===============================

export function affineEncrypt(text, a, b) {
  if (gcd(a, A) !== 1) 
    throw new Error(`Invalid 'a' (${a}) — gcd(a,26) !== 1`);

  return [...text].map((ch) => {
    if (!isLetter(ch)) return ch;
    const base = baseOf(ch);
    const p = ch.charCodeAt(0) - base;
    const c = mod(a * p + b);
    return String.fromCharCode(c + base);
  }).join("");
}

// ===============================
// DECRYPT
// ===============================

export function affineDecrypt(text, a, b) {
  const aInv = modInv(a, A); 
  return [...text].map((ch) => {
    if (!isLetter(ch)) return ch;
    const base = baseOf(ch);
    const c = ch.charCodeAt(0) - base;
    const p = mod(aInv * (c - b));
    return String.fromCharCode(p + base);
  }).join("");
}

// ===============================
// UNIVERSAL PERFECT AFFINE CRACKER
// brute-force + english scoring
// ===============================

export function affineCrack(ciphertext) {
  const candidates = [];
  const validA = [];

  // valid 'a' values (coprime with 26)
  for (let x = 1; x < 26; x++)
    if (gcd(x, 26) === 1) validA.push(x);

  // english scoring reference
  const commonWords = [
    "THE","AND","ING","ION","ENT","FOR","ARE","YOU",
    "HAVE","THAT","HER","WAS","ONE","ALL","NOT","BUT",
    "THIS","FROM","WITH","THEY","YOUR","BE","AS","AT"
  ];

  const scoreEnglish = (txt) => {
    const up = txt.toUpperCase();
    let score = 0;

    for (const w of commonWords)
      if (up.includes(w)) score += w.length * 2;

    score += (txt.match(/ /g) || []).length;

    return score;
  };

  // brute-force all combinations
  for (const a of validA) {
    for (let b = 0; b < 26; b++) {
      try {
        const preview = affineDecrypt(ciphertext, a, b);
        const score = scoreEnglish(preview);

        candidates.push({ a, b, preview, score });
      } catch (_) {}
    }
  }

  // best-first
  candidates.sort((x, y) => y.score - x.score);

  return { candidates: candidates.slice(0, 10) };
}
