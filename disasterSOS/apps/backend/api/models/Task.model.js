const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH'],
    default: 'LOW'
  },
  status: {
    type: String,
    enum: ['open', 'accepted', 'in-progress', 'completed', 'cancelled'],
    default: 'open'
  },
  alertId: { type: mongoose.Schema.Types.ObjectId, ref: 'Alert', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Volunteer', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Task', TaskSchema);
