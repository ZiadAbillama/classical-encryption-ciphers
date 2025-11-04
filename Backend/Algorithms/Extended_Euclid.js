// ================= Extended Euclid & Modular Inverse (Number) =================

const mod = (x, m) => ((x % m) + m) % m;  // always non-negative

function egcd(a, b) {
  let old_r = Math.abs(a), r = Math.abs(b);
  let old_s = 1, s = 0;
  let old_t = 0, t = 1;

  while (r !== 0) {
    const q = Math.trunc(old_r / r);
    [old_r, r] = [r, old_r - q * r];
    [old_s, s] = [s, old_s - q * s];
    [old_t, t] = [t, old_t - q * t];
  }

  const signA = a < 0 ? -1 : 1;
  const signB = b < 0 ? -1 : 1;
  return { g: old_r, x: old_s * signA, y: old_t * signB };
}

function modInv(a, m) {
  if (!Number.isInteger(m) || m === 0) throw new Error("modulus m must be nonzero");
  const { g, x } = egcd(a, m);
  if (g !== 1) return null;
  return mod(x, Math.abs(m));
}

// ================= BigInt Version (for large numbers) =================
const modBig = (x, m) => ((x % m) + m) % m;

function egcdBig(a, b) {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;
  let old_r = a, r = b;
  let old_s = 1n, s = 0n;
  let old_t = 0n, t = 1n;

  while (r !== 0n) {
    const q = old_r / r;
    [old_r, r] = [r, old_r - q * r];
    [old_s, s] = [s, old_s - q * s];
    [old_t, t] = [t, old_t - q * t];
  }
  return { g: old_r, x: old_s, y: old_t };
}

function modInvBig(a, m) {
  if (m === 0n) throw new Error("modulus m must be nonzero");
  const { g, x } = egcdBig(a, m);
  if (g !== 1n) return null;
  return modBig(x, m < 0n ? -m : m);
}


