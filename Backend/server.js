// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./db.js";

import authRouter from "./routes/auth.js";
import usersRouter from "./routes/users.js";

// ==== Algorithms ====
import { affineEncrypt, affineDecrypt, affineCrack } from "./Algorithms/Affine_cipher.js";
import { monoEncrypt, monoDecrypt } from "./Algorithms/Monoalphabetic_cipher.js";
import { vigenereEncrypt, vigenereDecrypt } from "./Algorithms/Vigenere_cipher.js";
import { hillEncrypt, hillDecrypt } from "./Algorithms/Hill_cipher.js";
import { egcd as egcdNum, modInv as modInvNum } from "./Algorithms/Extended_Euclid.js";
import {
  encrypt as playfairEncrypt,
  decrypt as playfairDecrypt,
  cleanDecryptedKeepPunct as playfairClean
} from "./Algorithms/Playfair_cipher.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);   
app.use("/api/users", usersRouter); 

// Health
app.get("/", (_, res) => res.send("Backend is running successfully!"));

// Helpers
const isString = (v) => typeof v === "string";
const isInt = (v) => Number.isInteger(v);

// ========== Affine ==========
app.post("/api/affine/encrypt", (req, res) => {
  try {
    const { text, a, b } = req.body;
    if (!isString(text) || !isInt(a) || !isInt(b))
      throw new Error("Expected { text:string, a:int, b:int }");
    res.json({ result: affineEncrypt(text, a, b) });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.post("/api/affine/decrypt", (req, res) => {
  try {
    const { text, a, b } = req.body;
    if (!isString(text) || !isInt(a) || !isInt(b))
      throw new Error("Expected { text:string, a:int, b:int }");
    res.json({ result: affineDecrypt(text, a, b) });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.post("/api/affine/crack", (req, res) => {
  try {
    const { text, plain1 = "E", plain2 = "T" } = req.body;
    if (!isString(text)) throw new Error("Expected { text:string }");
    res.json(affineCrack(text, plain1, plain2));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// ========== Monoalphabetic ==========
app.post("/api/mono/encrypt", (req, res) => {
  try {
    const { text, key } = req.body;
    if (!isString(text) || !isString(key))
      throw new Error("Expected { text:string, key:string }");
    res.json({ result: monoEncrypt(text, key) });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.post("/api/mono/decrypt", (req, res) => {
  try {
    const { text, key } = req.body;
    if (!isString(text) || !isString(key))
      throw new Error("Expected { text:string, key:string }");
    res.json({ result: monoDecrypt(text, key) });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// ========== Vigenere ==========
app.post("/api/vigenere/encrypt", (req, res) => {
  try {
    const { text, key } = req.body;
    if (!isString(text) || !isString(key))
      throw new Error("Expected { text:string, key:string }");
    res.json({ result: vigenereEncrypt(text, key) });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.post("/api/vigenere/decrypt", (req, res) => {
  try {
    const { text, key } = req.body;
    if (!isString(text) || !isString(key))
      throw new Error("Expected { text:string, key:string }");
    res.json({ result: vigenereDecrypt(text, key) });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// ========== Playfair ==========
app.post("/api/playfair/encrypt", (req, res) => {
  try {
    const { text, key } = req.body;
    res.json(playfairEncrypt(text, key));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.post("/api/playfair/decrypt", (req, res) => {
  try {
    const { text, key } = req.body;
    const r = playfairDecrypt(text, key);
    res.json({ result: playfairClean(r.result), raw: r.result });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// ========== Hill ==========
function validateHillKeyMat(keyMat) {
  if (!Array.isArray(keyMat) || (keyMat.length !== 2 && keyMat.length !== 3))
    return false;
  const n = keyMat.length;
  return keyMat.every(
    (row) => Array.isArray(row) && row.length === n && row.every(Number.isFinite)
  );
}

app.post("/api/hill/encrypt", (req, res) => {
  try {
    const { text, keyMat } = req.body;
    if (!isString(text) || !validateHillKeyMat(keyMat))
      throw new Error("Invalid matrix");
    res.json(hillEncrypt(text, keyMat));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.post("/api/hill/decrypt", (req, res) => {
  try {
    const { text, keyMat } = req.body;
    if (!isString(text) || !validateHillKeyMat(keyMat))
      throw new Error("Invalid matrix");
    res.json(hillDecrypt(text, keyMat));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// ========== Extended Euclid ==========
app.post("/api/euclid", (req, res) => {
  try {
    const { a, m } = req.body;
    if (!isInt(a) || !isInt(m))
      throw new Error("Expected { a:int, m:int }");
    const { g, x, y } = egcdNum(a, m);
    const inv = g === 1 ? modInvNum(a, m) : null;
    res.json({ gcd: g, inverse: inv, coefficients: { x, y } });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// 404 fallback
app.use((req, res) => res.status(404).json({ error: "Not Found" }));

// Start Server
const PORT = process.env.PORT || 3000;
(async () => {
  try {
    await connectDB();
    app.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
})();
