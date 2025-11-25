// Vigenere_cipher.js
// ----------------------------------------------
// VIGENÈRE CIPHER
// Encrypts or decrypts letters using a repeating keyword
// Keeps punctuation, spaces, and newlines unchanged
// Preserves uppercase and lowercase
// ----------------------------------------------

// There are 26 letters in the English alphabet
const A = 26;

// ✅ Helper function: check if a character is a letter
const isLetter = (c) => /[A-Za-z]/.test(c);

// ✅ Helper function: returns base ASCII code (65 for 'A', 97 for 'a')
const baseOf = (c) => (c === c.toUpperCase() ? 65 : 97);

// ✅ Modulo helper that always returns positive result
const mod = (x, m = A) => ((x % m) + m) % m;

// ✅ Function to prepare key (remove non-letters, make uppercase)
function cleanKey(key) {
  const cleaned = key.replace(/[^A-Za-z]/g, "").toUpperCase();
  if (!cleaned.length) throw new Error("Key must contain at least one letter.");
  return cleaned;
}

// 🔐 ENCRYPTION
// Formula: C = (P + K) mod 26
export function vigenereEncrypt(text, key) {
  const K = cleanKey(key);
  let result = "";
  let ki = 0; // index in key

  for (const ch of text) {
    if (!isLetter(ch)) {
      result += ch; // keep punctuation/spaces
      continue;
    }

    const base = baseOf(ch);
    const p = ch.charCodeAt(0) - base;
    const k = K.charCodeAt(ki % K.length) - 65; // A=0 … Z=25
    const c = mod(p + k);

    result += String.fromCharCode(c + base);
    ki++; // move to next key letter only for letters
  }

  return result;
}

// 🔓 DECRYPTION
// Formula: P = (C - K) mod 26
export function vigenereDecrypt(text, key) {
  const K = cleanKey(key);
  let result = "";
  let ki = 0;

  for (const ch of text) {
    if (!isLetter(ch)) {
      result += ch;
      continue;
    }

    const base = baseOf(ch);
    const c = ch.charCodeAt(0) - base;
    const k = K.charCodeAt(ki % K.length) - 65;
    const p = mod(c - k);

    result += String.fromCharCode(p + base);
    ki++;
  }

  return result;
}



