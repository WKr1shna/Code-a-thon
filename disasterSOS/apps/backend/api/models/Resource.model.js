const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ['shelter', 'food', 'medical', 'water', 'rescue'],
    required: true
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
  address: { type: String, required: true },
  contactPhone: { type: String, required: true },
  totalCapacity: { type: Number, required: true },
  availableCapacity: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  managedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true
});

// Configure 2dsphere index for location field
ResourceSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Resource', ResourceSchema);
