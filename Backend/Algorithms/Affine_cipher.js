// AFFINE CIPHER
// This file defines three functions:
// 1. affineEncrypt  → Encrypts plaintext using Affine formula: C = (aP + b) mod 26
// 2. affineDecrypt  → Decrypts ciphertext using: P = a⁻¹(C - b) mod 26
// 3. affineCrack    → Attempts to guess keys 'a' and 'b' using frequency analysis

// CONSTANTS AND HELPER FUNCTIONS

// There are 26 letters in the English alphabet.
const A = 26;

// Function to check if a character is a letter (ignores spaces, punctuation, etc.)
const isLetter = (c) => /[A-Za-z]/.test(c);

// Returns 65 for uppercase ('A') or 97 for lowercase ('a')
// Used to handle both uppercase and lowercase letters correctly
const baseOf = (c) => (c === c.toUpperCase() ? 65 : 97);

// Modulo helper function that always returns a positive result
// Example: mod(-3, 26) = 23 instead of -3
const mod = (x, m = A) => ((x % m) + m) % m;

// EXTENDED EUCLIDEAN ALGORITHM
// Used to find the modular inverse of 'a' mod 26
// The modular inverse exists only if gcd(a, 26) = 1

// Recursive function that returns the gcd of (a, b)
// and coefficients x, y satisfying ax + by = gcd(a, b)
function egcd(a, b) {
  if (b === 0) return { g: Math.abs(a), x: a < 0 ? -1 : 1, y: 0 };
  const { g, x, y } = egcd(b, a % b);
  return { g, x: y, y: x - Math.floor(a / b) * y };
}

// Function to compute the modular inverse of 'a' mod 'm'
// If gcd(a, m) ≠ 1, inverse doesn't exist
function modInv(a, m = A) {
  a = mod(a, m);
  const { g, x } = egcd(a, m);
  if (g !== 1)
    throw new Error(`No modular inverse for a=${a} (gcd(a,${m})=${g})`);
  return mod(x, m);
}

// AFFINE ENCRYPTION
// Formula: C = (aP + b) mod 26
// P : plaintext letter (0–25)
// a, b : keys
// a must be coprime with 26
export function affineEncrypt(text, a, b) {
  // Ensure 'a' is valid (coprime with 26)
  if ([0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24].includes(mod(a))) {
    throw new Error("Invalid 'a': gcd(a,26) must be 1");
  }

  // Go through each character in the text
  return [...text]
    .map((ch) => {
      // Keep spaces, punctuation, newlines unchanged
      if (!isLetter(ch)) return ch;

      // Get ASCII code base (65 or 97)
      const base = baseOf(ch);

      // Convert character to 0–25 range
      const p = ch.charCodeAt(0) - base;

      // Apply Affine formula
      const c = mod(a * p + b);

      // Convert back to letter and return
      return String.fromCharCode(c + base);
    })
    .join("");
}


// AFFINE DECRYPTION
// Formula: P = a⁻¹(C - b) mod 26
// a⁻¹ = modular inverse of 'a'
export function affineDecrypt(text, a, b) {
  // Find modular inverse of 'a'
  const aInv = modInv(a, A);

  // Decrypt each letter
  return [...text]
    .map((ch) => {
      if (!isLetter(ch)) return ch;

      const base = baseOf(ch);
      const c = ch.charCodeAt(0) - base;

      // Apply decryption formula
      const p = mod(aInv * (c - b));

      return String.fromCharCode(p + base);
    })
    .join("");
}

// CRACKING FUNCTION
// Attempts to guess 'a' and 'b' using frequency analysis
// It assumes the two most frequent letters in ciphertext
// correspond to the two most common plaintext letters (E, T by default)
export function affineCrack(ciphertext, plain1 = "E", plain2 = "T") {
  // Step 1: Count how often each letter appears in the ciphertext
  const counts = new Map();
  for (const ch of ciphertext.toUpperCase()) {
    if (ch >= "A" && ch <= "Z") counts.set(ch, (counts.get(ch) || 0) + 1);
  }

  // Step 2: Sort letters by frequency
  const top = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([ch]) => ch);

  if (top.length < 2) throw new Error("Not enough letters to crack.");

  // Step 3: Convert letters to numeric positions (0–25)
  const y1 = top[0].charCodeAt(0) - 65; // most frequent ciphertext letter
  const y2 = top[1].charCodeAt(0) - 65; // 2nd most frequent ciphertext letter

  const x1 = plain1.toUpperCase().charCodeAt(0) - 65; // expected most frequent plaintext letter
  const x2 = plain2.toUpperCase().charCodeAt(0) - 65; // expected 2nd most frequent plaintext letter

  // Step 4: Solve for a and b in y = a*x + b (mod 26)
  const a = mod((y1 - y2) * modInv(x1 - x2, A));
  const b = mod(y1 - a * x1, A);

  // Step 5: Try decrypting with guessed keys
  const preview = affineDecrypt(ciphertext, a, b);

  // Return guessed keys and preview text
  return { guessedA: a, guessedB: b, preview };
}  