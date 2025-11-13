import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// simple auth middleware (inline)
function requireAuth(req,res,next){
  const token = (req.headers.authorization||'').replace('Bearer ','');
  try{ req.user = jwt.verify(token, process.env.JWT_SECRET); next(); }
  catch{ return res.status(401).json({error:'Unauthorized'}); }
}

// PATCH /api/users/me
router.patch('/me', requireAuth, async (req,res)=>{
  const { name, email } = req.body;
  const user = await User.findByIdAndUpdate(req.user.id,{ name, email },{ new:true });
  res.json({ user:{ id:user.id, name:user.name, email:user.email } });
});

// DELETE /api/users/me
router.delete('/me', requireAuth, async (req,res)=>{
  await User.findByIdAndDelete(req.user.id);
  res.json({ ok:true });
});

export default router;
