// models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const StatsSchema = new mongoose.Schema({
  points: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  combo: { type: Number, default: 0 },
  bestCombo: { type: Number, default: 0 },
  totalEncryptions: { type: Number, default: 0 },
  totalDecryptions: { type: Number, default: 0 },
  experiencedCiphers: { type: [String], default: [] },
  completedChallenges: { type: [String], default: [] }, 
}, { _id: false });

const UserSchema = new mongoose.Schema({
  name:        { type: String, trim: true, minlength: 1, maxlength: 80 },
  email:       { type: String, required: true, lowercase: true, trim: true, maxlength: 160, unique: true },
  passwordHash:{ type: String },
  provider:    { type: String, enum: ["local", "google", "github"], default: "local" },
  roles:       { type: [String], default: ["user"] },
  avatarUrl:   { type: String, default: null },
  stats:       { type: StatsSchema, default: () => ({}) },
  lastLoginAt: { type: Date },
}, { timestamps: true });

/* Automatically hash password when setting user.password */
UserSchema.virtual("password").set(function(password) {
  this._password = password;
  this.passwordHash = bcrypt.hashSync(password, 10);
});

/** Compare entered password with hashed password */
UserSchema.methods.comparePassword = function (plain) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(plain, this.passwordHash);
};

export default mongoose.models.User || mongoose.model("User", UserSchema);
