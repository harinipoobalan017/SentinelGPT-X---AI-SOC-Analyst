const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  inputType: { type: String, enum: ['log', 'url', 'hash', 'email'], required: true },
  inputData: { type: String, required: true },
  aiResponse: {
    attackType:      String,
    severity:        String,
    explanation:     String,
    mitigations:     [String],
    recommendations: [String],
    iocs:            [String],
    confidence:      Number,
  },
  model:    { type: String, default: 'demo' },
  latencyMs: Number,
}, { timestamps: true });

module.exports = mongoose.model('AnalysisReport', reportSchema);
