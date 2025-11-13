// ====================== Hill Cipher (2x2 & 3x3, punctuation preserved, reversible) ======================

// --- small math utils ---
const MOD = 26;
const mod = (x, m = MOD) => ((x % m) + m) % m;

function egcd(a, b) {
  if (b === 0) return { g: Math.abs(a), x: a < 0 ? -1 : 1, y: 0 };
  const { g, x, y } = egcd(b, a % b);
  return { g, x: y, y: x - Math.floor(a / b) * y };
}
function modInv(a, m = MOD) {
  const { g, x } = egcd(a, m);
  if (g !== 1) return null;
  return mod(x, m);
}

const isLetter = ch => /[A-Za-z]/.test(ch);
const toVal    = ch => ch.toUpperCase().charCodeAt(0) - 65; // A->0
const fromVal  = (v, isUpper) =>
  isUpper ? String.fromCharCode(65 + v) : String.fromCharCode(97 + v);

// --- matrix helpers (2x2 or 3x3 only) ---
function detMod(mat) {
  if (mat.length === 2) {
    const [[a,b],[c,d]] = mat;
    return mod(a*d - b*c);
  }
  const [[a,b,c],[d,e,f],[g,h,i]] = mat;
  return mod(a*(e*i - f*h) - b*(d*i - f*g) + c*(d*h - e*g));
}

function adjugate(mat) {
  if (mat.length === 2) {
    const [[a,b],[c,d]] = mat;
    return [[ d, -b],
            [-c,  a]];
  }
  const [[a,b,c],[d,e,f],[g,h,i]] = mat;
  const C11 =  (e*i - f*h), C12 = -(d*i - f*g), C13 =  (d*h - e*g);
  const C21 = -(b*i - c*h), C22 =  (a*i - c*g), C23 = -(a*h - b*g);
  const C31 =  (b*f - c*e), C32 = -(a*f - c*d), C33 =  (a*e - b*d);
  return [
    [C11, C21, C31],
    [C12, C22, C32],
    [C13, C23, C33],
  ];
}

function invModMatrix(mat, m = MOD) {
  const n = mat.length;
  if (n !== 2 && n !== 3) throw new Error("Key must be 2x2 or 3x3.");
  if (!mat.every(row => row.length === n)) throw new Error("Key must be square.");
  const A = mat.map(row => row.map(x => mod(x, m)));
  const det = detMod(A);
  const invDet = modInv(det, m);
  if (invDet === null) throw new Error(`Key not invertible modulo ${m}. det = ${det}, gcd(det,${m}) ≠ 1`);
  const adj = adjugate(A).map(row => row.map(x => mod(x, m)));
  return adj.map(row => row.map(x => mod(invDet * x, m)));
}

function mulMatVec(A, v) {
  const n = A.length;
  const out = new Array(n).fill(0);
  for (let r = 0; r < n; r++) {
    let s = 0;
    for (let c = 0; c < n; c++) s += A[r][c] * v[c];
    out[r] = mod(s);
  }
  return out;
}

// --------- core process (enc/dec), emits full last block on encrypt ---------
function hillProcess(text, keyMat, mode = 'enc') {
  const n = keyMat.length; // 2 or 3
  if (n !== 2 && n !== 3) throw new Error("Key must be 2x2 or 3x3.");
  const K  = keyMat.map(r => r.map(x => mod(x)));
  const Ki = (mode === 'dec') ? invModMatrix(K) : null;

  // Collect letters stream with case + positions
  const letters = [];
  const cases   = [];
  const idxs    = [];
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (isLetter(ch)) {
      letters.push(toVal(ch));
      cases.push(ch === ch.toUpperCase());
      idxs.push(i);
    }
  }

  // Transform in blocks; pad with 'X' (23) to make a full block
  const outLettersStream = [];
  const outCasesStream   = []; // true/false per output symbol (case to render)
  for (let i = 0; i < letters.length; i += n) {
    const block = [];
    let realCount = 0;
    for (let k = 0; k < n; k++) {
      if (i + k < letters.length) { block.push(letters[i + k]); realCount++; }
      else                         { block.push(toVal('X')); } // padding for math
    }
    const res = mulMatVec(mode === 'enc' ? K : Ki, block);
    // push all outputs; for padded inputs, mark lowercase
    for (let k = 0; k < n; k++) {
      outLettersStream.push(res[k]);
      outCasesStream.push(k < realCount ? cases[i + k] : false);
    }
  }

  // Merge back: replace letters in original positions with the first |letters| outputs
  const out = text.split('');
  const L = letters.length;
  for (let t = 0; t < L; t++) {
    const pos = idxs[t];
    out[pos] = fromVal(outLettersStream[t], outCasesStream[t]);
  }

  // If we produced extra outputs from the final padded block, append them at the very end (lowercase)
  for (let t = L; t < outLettersStream.length; t++) {
    out.push(fromVal(outLettersStream[t], false));
  }

  let finalText = out.join('');

  // On decrypt: trim at most (n-1) trailing lowercase 'x' letters (skip spaces/punct)
  if (mode === 'dec') {
    const arr = finalText.split('');
    let removed = 0;
    for (let i = arr.length - 1; i >= 0 && removed < (n - 1); i--) {
      const ch = arr[i];
      if (!isLetter(ch)) continue;            // skip punctuation/space
      if (ch === ch.toLowerCase() && ch === 'x') {
        arr.splice(i, 1);
        removed++;
        continue;
      }
      break; // encountered a non-padding tail letter
    }
    finalText = arr.join('');
  }

  return {
    result: finalText,
    key: K,
    inverse: mode === 'enc' ? invModMatrix(K) : Ki
  };
}

function hillEncrypt(text, keyMat) { return hillProcess(text, keyMat, 'enc'); }
function hillDecrypt(text, keyMat) { return hillProcess(text, keyMat, 'dec'); }

export { hillEncrypt, hillDecrypt };
