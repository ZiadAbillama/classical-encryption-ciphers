// ====================== Playfair Cipher (punctuation preserved) ======================

// Helpers
const isLetter = ch => /[A-Za-z]/.test(ch);
const norm = ch => (ch.toLowerCase() === 'j' ? 'i' : ch.toLowerCase());

// --- Key table ---
function generateKeyTable(key) {
  key = key.toLowerCase().replace(/[^a-z]/g, '');
  const seen = new Set();
  for (const ch of key) {
    const c = ch === 'j' ? 'i' : ch;
    if (!seen.has(c)) seen.add(c);
  }
  for (const c of 'abcdefghiklmnopqrstuvwxyz') if (!seen.has(c)) seen.add(c);

  const seq = Array.from(seen).slice(0, 25);
  const matrix = Array.from({ length: 5 }, (_, r) => seq.slice(r * 5, r * 5 + 5));
  const pos = new Map();
  for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) pos.set(matrix[r][c], { r, c });
  return { matrix, pos };
}

function matrixToString(m) {
  return m.map(row => row.map(c => c.toUpperCase()).join(' ')).join('\n');
}

// --- Pair transform ---
function transformPair(a, b, mode, pos, matrix) {
  const { r: r1, c: c1 } = pos.get(a);
  const { r: r2, c: c2 } = pos.get(b);

  if (r1 === r2) {
    const s = mode === 'enc' ? 1 : -1;
    return [matrix[r1][(c1 + s + 5) % 5], matrix[r2][(c2 + s + 5) % 5]];
  }
  if (c1 === c2) {
    const s = mode === 'enc' ? 1 : -1;
    return [matrix[(r1 + s + 5) % 5][c1], matrix[(r2 + s + 5) % 5][c2]];
  }
  return [matrix[r1][c2], matrix[r2][c1]];
}

// --- STREAMING ENCRYPT: preserves non-letters exactly ---
function encrypt(text, key) {
  const { matrix, pos } = generateKeyTable(key);
  const out = [];
  const n = text.length;

  for (let i = 0; i < n; ) {
    const ch1 = text[i];

    if (!isLetter(ch1)) { out.push(ch1); i++; continue; }

    const upper1 = ch1 === ch1.toUpperCase();
    const A = norm(ch1);

    // find next letter j (skip punctuation/spaces)
    let j = i + 1;
    while (j < n && !isLetter(text[j])) j++;

    let B, upper2 = false, secondExists = j < n;
    if (secondExists) {
      const ch2 = text[j];
      upper2 = ch2 === ch2.toUpperCase();
      const Braw = norm(ch2);
      if (A === Braw) {
        B = 'x';                   // insert 'x' between doubled letters
        secondExists = false;      // do not consume ch2 yet
      } else {
        B = Braw;
      }
    } else {
      B = 'x';                     // trailing pad if lone last letter
    }

    const [ra, rb] = transformPair(A, B, 'enc', pos, matrix);

    // output first with original case
    out.push(upper1 ? ra.toUpperCase() : ra);

    // copy any non-letters BETWEEN i and j ONLY if we will consume j (i.e., secondExists true)
    if (secondExists) {
      for (let k = i + 1; k < Math.min(j, n); k++) out.push(text[k]);
    }

    // Determine inserted-pad type:
    // - insertedBetweenDuplicate: we inserted 'x' because A === next letter (j < n and secondExists === false)
    // - insertedTrailingPad: we padded at the end (j >= n and secondExists === false)
    const insertedBetweenDuplicate = (!secondExists && j < n);
    const insertedTrailingPad = (!secondExists && j >= n);

    // Output second:
    // - If this was a trailing pad, preserve the case of the first letter (so uppercase -> uppercase 'X')
    // - If this was an inserted between-duplicate pad, keep lowercase (lowercase 'x')
    // - Otherwise (a real consumed second letter), preserve second letter case (upper2)
    if (insertedTrailingPad) {
      out.push(upper1 ? rb.toUpperCase() : rb);
    } else if (insertedBetweenDuplicate) {
      out.push(rb); // keep lowercase for inserted x between duplicate letters
    } else {
      out.push((secondExists && upper2) ? rb.toUpperCase() : rb);
    }

    // advance
    if (j < n && A !== norm(text[j])) {
      i = j + 1; // consumed both
    } else {
      i = i + 1; // consumed first only (duplicate case) OR padded end
      if (!secondExists && j >= n) break; // padded at end; done
    }
  }

  return { result: out.join(''), matrix };
}

// --- STREAMING DECRYPT: preserves non-letters exactly ---
function decrypt(text, key) {
  const { matrix, pos } = generateKeyTable(key);
  const out = [];
  const n = text.length;

  for (let i = 0; i < n; ) {
    const ch1 = text[i];

    if (!isLetter(ch1)) { out.push(ch1); i++; continue; }

    const upper1 = ch1 === ch1.toUpperCase();
    const A = norm(ch1);

    // find next letter j
    let j = i + 1;
    while (j < n && !isLetter(text[j])) j++;

    let B = 'x', upper2 = false, secondExists = j < n;
    if (secondExists) {
      const ch2 = text[j];
      upper2 = ch2 === ch2.toUpperCase();
      B = norm(ch2);
    }

    const [ra, rb] = transformPair(A, B, 'dec', pos, matrix);

    out.push(upper1 ? ra.toUpperCase() : ra);
    for (let k = i + 1; k < Math.min(j, n); k++) out.push(text[k]);
    if (secondExists) out.push(upper2 ? rb.toUpperCase() : rb);

    i = secondExists ? j + 1 : n;
  }

  return { result: out.join(''), matrix };
}

// Optional: remove padding 'x' (between doubled letters or a lone trailing pad), KEEPING punctuation
function cleanDecryptedKeepPunct(text) {
  const chars = text.split('');
  const out = [];

  const findPrevLetterIdx = (idx) => {
    for (let k = idx - 1; k >= 0; k--) if (isLetter(out[k])) return k;
    return -1;
  };
  const findNextLetterIdx = (idx) => {
    for (let k = idx + 1; k < chars.length; k++) if (isLetter(chars[k])) return k;
    return -1;
  };

  for (let i = 0; i < chars.length; i++) {
    const curr = chars[i];

    if (!isLetter(curr)) { out.push(curr); continue; }

    const currNorm = norm(curr);
    const prevL = findPrevLetterIdx(out.length);
    const nextL = findNextLetterIdx(i);

    // drop 'x' between identical letters (ignoring non-letters)
    if (
      currNorm === 'x' &&
      prevL !== -1 && nextL !== -1 &&
      norm(out[prevL]) === norm(chars[nextL])
    ) {
      continue;
    }

    out.push(curr);
  }

  // drop trailing padding 'x' if it's the last letter
  // scan from end to find last letter
  let lastLetterIdx = -1;
  for (let k = out.length - 1; k >= 0; k--) if (isLetter(out[k])) { lastLetterIdx = k; break; }
  if (lastLetterIdx !== -1 && norm(out[lastLetterIdx]) === 'x') out.splice(lastLetterIdx, 1);

  return out.join('');
}

export { encrypt, decrypt, cleanDecryptedKeepPunct, generateKeyTable, matrixToString };
