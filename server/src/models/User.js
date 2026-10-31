const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, default: 'admin' },
  lastLoginAt: { type: String, default: null }
}, { timestamps: true, strict: false });

module.exports = mongoose.models.User || mongoose.model('User', UserSchema, 'users');

