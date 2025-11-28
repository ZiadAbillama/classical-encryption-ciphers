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

// Helper function to calculate achievements
function calculateAchievements(stats) {
  if (!stats) return 0;
  
  const totalEncryptions = stats.totalEncryptions || 0;
  const totalDecryptions = stats.totalDecryptions || 0;
  const bestCombo = stats.bestCombo || 0;
  const level = stats.level || 1;
  
  let count = 0;
  if (totalEncryptions + totalDecryptions > 0) count++;
  if (bestCombo >= 5) count++;
  if (totalEncryptions >= 5 && totalDecryptions >= 5) count++;
  if (level >= 5) count++;
  
  return count;
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

/* -------------------------------------------
   GET /api/users/leaderboard
   Returns all users ranked by points
--------------------------------------------*/
router.get('/leaderboard', async (req, res) => {
  try {
    const users = await User.find({})
      .select('name email avatarUrl stats createdAt')
      .sort({ 'stats.points': -1 })
      .limit(100);

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatarUrl || null,
      points: user.stats?.points || 0,
      level: user.stats?.level || 1,
      missionsCompleted: user.stats?.completedChallenges?.length || 0,
      bestCombo: user.stats?.bestCombo || 0,
      achievementsUnlocked: calculateAchievements(user.stats),
      joinDate: user.createdAt
    }));

    res.json({ leaderboard });
  } catch (err) {
    console.error("GET /leaderboard error:", err);
    res.status(500).json({ error: "Failed to load leaderboard" });
  }
});

/* -------------------------------------------
   GET /api/users/leaderboard/rank/:userId
   Returns a specific user's rank and nearby players
--------------------------------------------*/
router.get('/leaderboard/rank/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get all users sorted by points
    const users = await User.find({})
      .select('name email avatarUrl stats createdAt')
      .sort({ 'stats.points': -1 });

    // Find user's position
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userRank = userIndex + 1;
    const totalUsers = users.length;

    // Get users around this player (5 above, 5 below)
    const start = Math.max(0, userIndex - 5);
    const end = Math.min(users.length, userIndex + 6);
    const nearbyUsers = users.slice(start, end);

    const nearby = nearbyUsers.map((user, idx) => ({
      rank: start + idx + 1,
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatarUrl || null,
      points: user.stats?.points || 0,
      level: user.stats?.level || 1,
      missionsCompleted: user.stats?.completedChallenges?.length || 0,
      bestCombo: user.stats?.bestCombo || 0,
      achievementsUnlocked: calculateAchievements(user.stats),
      isCurrentUser: user.id === userId
    }));

    res.json({
      userRank,
      totalUsers,
      nearby
    });
  } catch (err) {
    console.error("GET /leaderboard/rank error:", err);
    res.status(500).json({ error: "Failed to load rank" });
  }
});

export default router;
