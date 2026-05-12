const Threat = require('../models/Threat');

// GET /api/threats
exports.getThreats = async (req, res, next) => {
  try {
    const page     = parseInt(req.query.page) || 1;
    const limit    = parseInt(req.query.limit) || 20;
    const severity = req.query.severity;
    const status   = req.query.status;

    const filter = {};
    if (severity) filter.severity = severity;
    if (status)   filter.status   = status;

    const [threats, total] = await Promise.all([
      Threat.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Threat.countDocuments(filter),
    ]);
    res.json({ threats, total, page, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

// GET /api/threats/:id
exports.getThreat = async (req, res, next) => {
  try {
    const threat = await Threat.findById(req.params.id);
    if (!threat) return res.status(404).json({ error: 'Threat not found' });
    res.json({ threat });
  } catch (err) { next(err); }
};

// POST /api/threats
exports.createThreat = async (req, res, next) => {
  try {
    const threat = await Threat.create(req.body);
    res.status(201).json({ threat });
  } catch (err) { next(err); }
};

// PATCH /api/threats/:id/status
exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ['new', 'investigating', 'resolved', 'false_positive'];
    if (!allowed.includes(status))
      return res.status(400).json({ error: `status must be one of: ${allowed.join(', ')}` });
    const threat = await Threat.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
    if (!threat) return res.status(404).json({ error: 'Threat not found' });
    res.json({ threat });
  } catch (err) { next(err); }
};
