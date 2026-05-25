const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: {
    type: String,
    enum: ['flood', 'earthquake', 'fire', 'landslide', 'urban', 'other'],
    required: true
  },
  severity: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'LOW'
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'active', 'resolved', 'fake'],
    default: 'pending'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  mediaUrls: [{ type: String }],
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  aiScore: { type: Number, default: 0 },
  aiBreakdown: { type: Object, default: {} },
  translations: { type: Object, default: {} },
  responderUpdates: [{
    text: { type: String, required: true },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    timestamp: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Configure 2dsphere index for location field
AlertSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Alert', AlertSchema);
