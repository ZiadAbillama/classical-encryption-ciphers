// mono_cipher.js
// ----------------------------------------------
// Mono-Alphabetic Substitution Cipher
// Encrypts or decrypts only alphabetic characters
// Keeps spaces, punctuation, and newlines unchanged
// Preserves uppercase and lowercase
// ----------------------------------------------

// Function to validate the key
function validateKey(key) {
  // Key must be a string
  if (typeof key !== "string") throw new Error("Key must be a string.");

  // Keep only letters and make uppercase
  const k = key.toUpperCase().replace(/[^A-Z]/g, "");

  // Key must have exactly 26 letters (A–Z)
  if (k.length !== 26)
    throw new Error("Key must have exactly 26 letters A–Z.");

  // Each letter must appear once
  const set = new Set(k.split(""));
  if (set.size !== 26)
    throw new Error("Key letters must be unique (A–Z).");

  return k; // Return clean uppercase key
}

// Build the substitution maps for encryption and decryption
function buildMapsFromKey(key) {
  const K = validateKey(key);
  const A = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  // Maps for uppercase letters
  const encU = new Map(); // plaintext → ciphertext
  const decU = new Map(); // ciphertext → plaintext

  for (let i = 0; i < 26; i++) {
    const p = A[i]; // plaintext letter
    const c = K[i]; // cipher letter
    encU.set(p, c);
    decU.set(c, p);
  }

  // Maps for lowercase letters (mirror the uppercase)
  const encL = new Map();
  const decL = new Map();
  for (let i = 0; i < 26; i++) {
    encL.set(A[i].toLowerCase(), K[i].toLowerCase());
    decL.set(K[i].toLowerCase(), A[i].toLowerCase());
  }

  return { encU, encL, decU, decL };
}

// Encryption function
export function monoEncrypt(text, key) {
  const { encU, encL } = buildMapsFromKey(key);
  let result = "";

  for (const ch of text) {
    // Encrypt uppercase
    if (encU.has(ch)) result += encU.get(ch);
    // Encrypt lowercase
    else if (encL.has(ch)) result += encL.get(ch);
    // Keep everything else unchanged
    else result += ch;
  }

  return result;
}

// Decryption function
export function monoDecrypt(text, key) {
  const { decU, decL } = buildMapsFromKey(key);
  let result = "";

  for (const ch of text) {
    if (decU.has(ch)) result += decU.get(ch);
    else if (decL.has(ch)) result += decL.get(ch);
    else result += ch; // leave punctuation/spaces
  }

  return result;
}


