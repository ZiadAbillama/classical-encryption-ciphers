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
// UNIVERSAL AFFINE CRACKER
// brute-force + english scoring
// ===============================
export function affineCrack(ciphertext, cipher1, cipher2, plain1 = "E", plain2 = "T") {
  const A = 26;
  const candidates = [];

  const mod = (x, m = 26) => ((x % m) + m) % m;
  const toIndex = (c) => c.toUpperCase().charCodeAt(0) - 65;

  // GCD + modular inverse helpers
  function gcd(a, b) {
    while (b !== 0) [a, b] = [b, a % b];
    return a;
  }
  function egcd(a, b) {
    if (b === 0) return { g: a, x: 1, y: 0 };
    const r = egcd(b, a % b);
    return { g: r.g, x: r.y, y: r.x - Math.floor(a / b) * r.y };
  }
  function modInv(a, m = 26) {
    const { g, x } = egcd(a, m);
    if (g !== 1) throw "No inverse";
    return mod(x, m);
  }

  // Convert user-chosen ciphertext + plaintext letters to indices
  const C1 = toIndex(cipher1);
  const C2 = toIndex(cipher2);
  const P1 = toIndex(plain1);
  const P2 = toIndex(plain2);

  // Try solving using supplied ciphertext pair
  try {
    const deltaC = mod(C1 - C2);
    const deltaP = mod(P1 - P2);

    if (gcd(deltaP, A) === 1) {
      const a = mod(deltaC * modInv(deltaP));
      const b = mod(C1 - a * P1);

      const preview = affineDecrypt(ciphertext, a, b);
      candidates.push({ a, b, preview, score: 9999 });
    }
  } catch (_) {}

  // Fallback: brute-force all (a, b)
  const validA = [1,3,5,7,9,11,15,17,19,21,23,25];
  for (const a of validA) {
    for (let b = 0; b < 26; b++) {
      try {
        const preview = affineDecrypt(ciphertext, a, b);
        const score = englishScore(preview);
        candidates.push({ a, b, preview, score });
      } catch (_) {}
    }
  }

  candidates.sort((x, y) => y.score - x.score);
  return { candidates: candidates.slice(0, 10) };
}

// Simple English scoring
function englishScore(text) {
  const COMMON = ["THE","AND","ING","ION","ENT","FOR","ARE","YOU","HER","WAS"];
  const upper = text.toUpperCase();
  let score = 0;

  for (const w of COMMON)
    if (upper.includes(w)) score += w.length * 2;

  return score + (text.match(/ /g) || []).length;
}
