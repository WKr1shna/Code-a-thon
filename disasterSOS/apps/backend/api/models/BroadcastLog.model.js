const mongoose = require('mongoose');

const BroadcastLogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  type: {
    type: String,
    enum: ['sms', 'whatsapp', 'push', 'emergency'],
    required: true
  },
  targetRoles: [{ type: String }],
  district: { type: String },
  recipientsCount: { type: Number, default: 0 },
  sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BroadcastLog', BroadcastLogSchema);
