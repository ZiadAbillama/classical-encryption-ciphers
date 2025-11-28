// AFFINE CIPHER

// constants
const A = 26;
const isLetter = (c) => /[A-Za-z]/.test(c);
const baseOf = (c) => (c === c.toUpperCase() ? 65 : 97);
const mod = (x, m = A) => ((x % m) + m) % m;

// gcd + extended gcd (standard)
function gcd(a, b) {
  a = Math.abs(a); b = Math.abs(b);
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

// encrypt / decrypt
export function affineEncrypt(text, a, b) {
  if (gcd(a, A) !== 1) throw new Error(`Invalid 'a' (${a}) — gcd(a,26) !== 1`);
  return [...text].map((ch) => {
    if (!isLetter(ch)) return ch;
    const base = baseOf(ch);
    const p = ch.charCodeAt(0) - base;
    const c = mod(a * p + b);
    return String.fromCharCode(c + base);
  }).join("");
}

export function affineDecrypt(text, a, b) {
  const aInv = modInv(a, A); // will throw if invalid
  return [...text].map((ch) => {
    if (!isLetter(ch)) return ch;
    const base = baseOf(ch);
    const c = ch.charCodeAt(0) - base;
    const p = mod(aInv * (c - b));
    return String.fromCharCode(p + base);
  }).join("");
}

// robust cracking: try top pairs and fallback to brute-force candidates
export function affineCrack(ciphertext, plain1 = "E", plain2 = "T", topK = 4) {
  const counts = new Map();
  for (const ch of ciphertext.toUpperCase()) {
    if (ch >= "A" && ch <= "Z") counts.set(ch, (counts.get(ch) || 0) + 1);
  }
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([ch]) => ch);
  if (top.length < 1) throw new Error("No letters to analyze.");
  
  // helper to get 0..25 index
  const toIndex = (ch) => ch.toUpperCase().charCodeAt(0) - 65;
  
  const p1 = toIndex(plain1);  // E = 4
  const p2 = toIndex(plain2);  // T = 19
  
  const candidates = [];
  const limit = Math.min(topK, top.length);
  
  // try pairings among topK most frequent ciphertext letters
  for (let i = 0; i < limit; i++) {
    for (let j = 0; j < limit; j++) {
      if (i === j) continue;
      try {
        const c1 = toIndex(top[i]);
        const c2 = toIndex(top[j]);
        
        // Solve the system:
        // c1 = a*p1 + b (mod 26)
        // c2 = a*p2 + b (mod 26)
        // Subtract: c1 - c2 = a*(p1 - p2) (mod 26)
        
        const deltaC = mod(c1 - c2);
        const deltaP = mod(p1 - p2);
        
        // Check if deltaP is invertible
        if (gcd(deltaP, A) !== 1) continue;
        
        const a = mod(deltaC * modInv(deltaP, A));
        
        // Verify 'a' is valid
        if (gcd(a, A) !== 1) continue;
        
        // Solve for b: b = c1 - a*p1 (mod 26)
        const b = mod(c1 - a * p1);
        
        const preview = affineDecrypt(ciphertext, a, b);
        candidates.push({ a, b, preview, score: 0 });
      } catch (e) {
        // skip pair if inversion failed
      }
    }
  }
  
  // fallback brute-force (all valid a values) if no good candidate found
  if (candidates.length === 0) {
    const validA = [];
    for (let aa = 1; aa < A; aa++) if (gcd(aa, A) === 1) validA.push(aa);
    for (const aa of validA) {
      for (let bb = 0; bb < A; bb++) {
        try {
          const preview = affineDecrypt(ciphertext, aa, bb);
          candidates.push({ a: aa, b: bb, preview, score: 0 });
        } catch (e) { /* skip */ }
      }
    }
  }
  
  // Score candidates by counting common English words/patterns
  const commonWords = ['THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HER', 'WAS', 'ONE'];
  for (const cand of candidates) {
    const upper = cand.preview.toUpperCase();
    cand.score = commonWords.reduce((sum, word) => sum + (upper.includes(word) ? word.length : 0), 0);
  }
  
  // Sort by score (higher = better)
  candidates.sort((a, b) => b.score - a.score);
  
  // return top N candidates for inspection
  return { candidates: candidates.slice(0, 10) };
}
