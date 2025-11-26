import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Middleware: require auth
function requireAuth(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

/* -------------------------------------------
   GET /api/users/me  ← MISSING ROUTE (THE FIX)
--------------------------------------------*/
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        stats: user.stats,
        avatar: user.avatarUrl || null,
        createdAt: user.createdAt
      },
    });
  } catch (err) {
    console.error("GET /me error:", err);
    res.status(500).json({ error: "Failed to load profile" });
  }
});

/* -------------------------------------------
   PATCH /api/users/me
--------------------------------------------*/
router.patch('/me', requireAuth, async (req, res) => {
  try {
    const { name, email } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, email },
      { new: true }
    );

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        stats: user.stats,
      },
    });
  } catch (err) {
    console.error("PATCH /me error:", err);
    return res.status(500).json({ error: "Failed to update profile" });
  }
});

/* -------------------------------------------
   PATCH /api/users/me/stats
--------------------------------------------*/
router.patch('/me/stats', requireAuth, async (req, res) => {
  try {
    const { stats } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.stats = { ...user.stats.toObject(), ...stats };
    await user.save();

    res.json({ stats: user.stats });
  } catch (err) {
    console.error("PATCH /me/stats error:", err);
    res.status(500).json({ error: 'Failed to update stats' });
  }
});

/* -------------------------------------------
   DELETE /api/users/me
--------------------------------------------*/
router.delete('/me', requireAuth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.json({ ok: true });
  } catch (err) {
    console.error("DELETE /me error:", err);
    res.status(500).json({ error: "Failed to delete account" });
  }
});

export default router;
