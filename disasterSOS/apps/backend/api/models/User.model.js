const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['citizen', 'ngo', 'ndrf', 'admin'], 
    default: 'citizen' 
  },
  district: { type: String, required: true },
  language: { type: String, default: 'en' },
  fcmTokens: [{ type: String }],
  isBanned: { type: Boolean, default: false },
  refreshToken: { type: String },
  fakeReportCount: { type: Number, default: 0 }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema);
