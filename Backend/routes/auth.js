// routes/auth.js
import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const router = express.Router();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3001";

function createToken(user) {
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}

function buildFrontendRedirect(user, token) {
  const url = new URL("/oauth/callback", FRONTEND_URL);
  url.searchParams.set("token", token);
  url.searchParams.set("id", user.id.toString());
  url.searchParams.set("name", user.name || "");
  url.searchParams.set("email", user.email || "");
  return url.toString();
}

// ----------------------
// AUTH MIDDLEWARE
// ----------------------
function requireAuth(req, res, next) {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

function randomPassword() {
  return "oauth-" + Math.random().toString(36).slice(2, 12);
}

// =====================================================
// EMAIL / PASSWORD SIGNUP
// =====================================================
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ error: "Email already in use" });
    }

    const user = await User.create({ name, email, password });

    const token = createToken(user);

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        stats: user.stats,
      },
      token,
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Signup failed" });
  }
});

// =====================================================
// LOGIN
// =====================================================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = createToken(user);

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        stats: user.stats,
      },
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

// =====================================================
// FIX: GET CURRENT USER (PROFILE REFRESH)
// =====================================================
router.get("/me", requireAuth, async (req, res) => {      // <<< ADDED
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        stats: user.stats,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error("GET /me error:", err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});                                                       // <<< ADDED END

// =====================================================
// CHANGE PASSWORD
// =====================================================
router.patch("/password", requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const ok = await user.comparePassword(currentPassword);
    if (!ok) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    res.json({ ok: true });
  } catch (err) {
    console.error("Password update error:", err);
    res.status(500).json({ error: "Failed to update password" });
  }
});

// =====================================================
// GOOGLE OAUTH
// =====================================================
router.get("/google", (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    console.error("Google OAuth env vars missing");
    return res
      .status(500)
      .send("Google OAuth is not configured on the server.");
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
  });

  const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  res.redirect(url);
});

router.get("/google/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.redirect(`${FRONTEND_URL}/login?error=google_no_code`);
  }

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }).toString(),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) {
      console.error("Google token error:", tokenData);
      throw new Error(tokenData.error || "Failed to obtain Google token");
    }

    const userRes = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      }
    );

    const profile = await userRes.json();
    if (!userRes.ok) {
      console.error("Google profile error:", profile);
      throw new Error("Failed to obtain Google profile");
    }

    const email = profile.email;
    const name =
      profile.name || profile.given_name || profile.email || "Google User";

    if (!email) {
      throw new Error("Google account has no email");
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        password: randomPassword(),
      });
    }

    const token = createToken(user);
    const redirectUrl = buildFrontendRedirect(user, token);
    return res.redirect(redirectUrl);
  } catch (err) {
    console.error("Google OAuth error:", err);
    return res.redirect(`${FRONTEND_URL}/login?error=google_oauth_failed`);
  }
});

// =====================================================
// GITHUB OAUTH
// =====================================================
router.get("/github", (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = process.env.GITHUB_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    console.error("GitHub OAuth env vars missing");
    return res
      .status(500)
      .send("GitHub OAuth is not configured on the server.");
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "read:user user:email",
  });

  const url = `https://github.com/login/oauth/authorize?${params.toString()}`;
  res.redirect(url);
});

router.get("/github/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.redirect(`${FRONTEND_URL}/login?error=github_no_code`);
  }

  try {
    const tokenRes = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: process.env.GITHUB_REDIRECT_URI,
        }),
      }
    );

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      console.error("GitHub token error:", tokenData);
      throw new Error("Failed to obtain GitHub token");
    }

    const accessToken = tokenData.access_token;

    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "cryptolab-app",
      },
    });
    const profile = await userRes.json();
    if (!userRes.ok) {
      console.error("GitHub user error:", profile);
      throw new Error("Failed to obtain GitHub user");
    }

    let email = profile.email;

    if (!email) {
      const emailsRes = await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "User-Agent": "cryptolab-app",
          Accept: "application/vnd.github+json",
        },
      });

      if (emailsRes.ok) {
        const emails = await emailsRes.json();
        const primary = emails.find((e) => e.primary && e.verified);
        const anyVerified = emails.find((e) => e.verified);
        email = (primary || anyVerified || emails[0] || {}).email;
      }
    }

    if (!email) {
      throw new Error("GitHub account has no accessible email");
    }

    const name =
      profile.name || profile.login || email || "GitHub User";

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        password: randomPassword(),
      });
    }

    const token = createToken(user);
    const redirectUrl = buildFrontendRedirect(user, token);
    return res.redirect(redirectUrl);
  } catch (err) {
    console.error("GitHub OAuth error:", err);
    return res.redirect(`${FRONTEND_URL}/login?error=github_oauth_failed`);
  }
});

export default router;
