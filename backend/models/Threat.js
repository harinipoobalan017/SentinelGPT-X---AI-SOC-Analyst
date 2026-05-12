const mongoose = require('mongoose');

const threatSchema = new mongoose.Schema({
  type:        { type: String, required: true },
  severity:    { type: String, enum: ['critical', 'high', 'medium', 'low', 'info'], required: true },
  sourceIP:    { type: String },
  country:     { type: String },
  target:      { type: String },
  description: { type: String },
  status:      { type: String, enum: ['new', 'investigating', 'resolved', 'false_positive'], default: 'new' },
  assignedTo:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  mitigations: [String],
  iocs:        [String],
  rawData:     { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

threatSchema.index({ severity: 1, createdAt: -1 });
threatSchema.index({ status: 1 });
threatSchema.index({ sourceIP: 1 });

module.exports = mongoose.model('Threat', threatSchema);
