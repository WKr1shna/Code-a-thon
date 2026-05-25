const mongoose = require('mongoose');

const VolunteerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  skills: [{ type: String }],
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
  status: {
    type: String,
    enum: ['available', 'deployed', 'resting', 'unavailable'],
    default: 'available'
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

// Configure 2dsphere index for location field
VolunteerSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Volunteer', VolunteerSchema);
