// ====================== Playfair Cipher (punctuation preserved) ======================

// Helpers
const isLetter = ch => /[A-Za-z]/.test(ch);
const norm = ch => (ch.toLowerCase() === "j" ? "i" : ch.toLowerCase());

// --- Key table ---
function generateKeyTable(key) {
  key = key.toLowerCase().replace(/[^a-z]/g, "");
  const seen = new Set();

  for (const ch of key) {
    const c = ch === "j" ? "i" : ch;
    if (!seen.has(c)) seen.add(c);
  }

  for (const c of "abcdefghiklmnopqrstuvwxyz") {
    if (!seen.has(c)) seen.add(c);
  }

  const seq = Array.from(seen).slice(0, 25);
  const matrix = Array.from({ length: 5 }, (_, r) => seq.slice(r * 5, r * 5 + 5));

  const pos = new Map();
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      pos.set(matrix[r][c], { r, c });
    }
  }

  return { matrix, pos };
}

function matrixToString(m) {
  return m
    .map(row => row.map(c => c.toUpperCase()).join(" "))
    .join("\n");
}

// --- Pair transform ---
function transformPair(a, b, mode, pos, matrix) {
  const { r: r1, c: c1 } = pos.get(a);
  const { r: r2, c: c2 } = pos.get(b);

  if (r1 === r2) {
    const s = mode === "enc" ? 1 : -1;
    return [matrix[r1][(c1 + s + 5) % 5], matrix[r2][(c2 + s + 5) % 5]];
  }
  if (c1 === c2) {
    const s = mode === "enc" ? 1 : -1;
    return [matrix[(r1 + s + 5) % 5][c1], matrix[(r2 + s + 5) % 5][c2]];
  }

  return [matrix[r1][c2], matrix[r2][c1]];
}

// ========================= ENCRYPT ================================
function encrypt(text, key) {
  const { matrix, pos } = generateKeyTable(key);
  const out = [];
  const n = text.length;

  let i = 0;  // 🔥 FIX: Declare i outside the loop

  for (; i < n; ) {
    const ch1 = text[i];

    if (!isLetter(ch1)) {
      out.push(ch1);
      i++;
      continue;
    }

    const upper1 = ch1 === ch1.toUpperCase();
    const A = norm(ch1);

    let j = i + 1;
    while (j < n && !isLetter(text[j])) j++;

    let B, upper2 = false, secondExists = j < n;

    if (secondExists) {
      const ch2 = text[j];
      upper2 = ch2 === ch2.toUpperCase();
      const Braw = norm(ch2);

      if (A === Braw) {
        B = "x";         
        secondExists = false; 
      } else {
        B = Braw;
      }
    } else {
      B = "x"; 
    }

    const [ra, rb] = transformPair(A, B, "enc", pos, matrix);

    out.push(upper1 ? ra.toUpperCase() : ra);

    if (secondExists) {
      for (let k = i + 1; k < Math.min(j, n); k++) out.push(text[k]);
    }

    const insertedBetweenDuplicate = !secondExists && j < n;
    const insertedTrailingPad = !secondExists && j >= n;

    if (insertedTrailingPad) {
      out.push(upper1 ? rb.toUpperCase() : rb);
    } else if (insertedBetweenDuplicate) {
      out.push(rb); 
    } else {
      out.push(upper2 ? rb.toUpperCase() : rb);
    }

    if (j < n && A !== norm(text[j])) {
      i = j + 1;
    } else {
      i = i + 1;
    }
  }

  // 🔥 FIX: Append any remaining punctuation after the last letter
  for (let k = i; k < n; k++) {
    if (!isLetter(text[k])) {
      out.push(text[k]);
    }
  }

  return { result: out.join(""), matrix };
}

// ========================= DECRYPT ================================
function decrypt(text, key) {
  const { matrix, pos } = generateKeyTable(key);
  const out = [];
  const n = text.length;

  for (let i = 0; i < n; ) {
    const ch1 = text[i];

    if (!isLetter(ch1)) {
      out.push(ch1);
      i++;
      continue;
    }

    const upper1 = ch1 === ch1.toUpperCase();
    const A = norm(ch1);

    let j = i + 1;
    while (j < n && !isLetter(text[j])) j++;

    let B = "x",
      upper2 = false,
      secondExists = j < n;

    if (secondExists) {
      const ch2 = text[j];
      upper2 = ch2 === ch2.toUpperCase();
      B = norm(ch2);
    }

    const [ra, rb] = transformPair(A, B, "dec", pos, matrix);

    out.push(upper1 ? ra.toUpperCase() : ra);

    for (let k = i + 1; k < Math.min(j, n); k++) {
      if (!isLetter(text[k])) out.push(text[k]);
    }

    if (secondExists) {
      out.push(upper2 ? rb.toUpperCase() : rb);
      i = j + 1;
    } else {
      // Only first letter consumed - don't output the synthetic padding 'x'
      i = i + 1;
    }
  }

  return { result: out.join(""), matrix };
}
// ========================= CLEANING ================================
function cleanDecryptedKeepPunct(text) {
  const chars = text.split("");
  const out = [];

  const findPrevLetterIdx = idx => {
    for (let k = idx - 1; k >= 0; k--) if (isLetter(out[k])) return k;
    return -1;
  };

  const findNextLetterIdx = idx => {
    for (let k = idx + 1; k < chars.length; k++) if (isLetter(chars[k])) return k;
    return -1;
  };

  for (let i = 0; i < chars.length; i++) {
    const curr = chars[i];
    if (!isLetter(curr)) {
      out.push(curr);
      continue;
    }

    const currNorm = norm(curr);
    const prevL = findPrevLetterIdx(out.length);
    const nextL = findNextLetterIdx(i);

    if (
      currNorm === "x" &&
      prevL !== -1 &&
      nextL !== -1 &&
      norm(out[prevL]) === norm(chars[nextL])
    ) {
      continue;
    }

    out.push(curr);
  }

  let lastLetterIdx = -1;
  for (let k = out.length - 1; k >= 0; k--) {
    if (isLetter(out[k])) {
      lastLetterIdx = k;
      break;
    }
  }

  if (lastLetterIdx !== -1 && norm(out[lastLetterIdx]) === "x") {
    out.splice(lastLetterIdx, 1);
  }

  return out.join("");
}

export { encrypt, decrypt, cleanDecryptedKeepPunct, generateKeyTable, matrixToString };

