const Threat = require('../models/Threat');
const AnalysisReport = require('../models/AnalysisReport');

// GET /api/dashboard/stats
exports.getStats = async (req, res, next) => {
  try {
    const [
      totalThreats,
      activeIncidents,
      resolvedToday,
      totalAnalyses,
      criticalCount,
      highCount,
    ] = await Promise.all([
      Threat.countDocuments(),
      Threat.countDocuments({ status: { $in: ['new', 'investigating'] } }),
      Threat.countDocuments({
        status: 'resolved',
        updatedAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      }),
      AnalysisReport.countDocuments(),
      Threat.countDocuments({ severity: 'critical' }),
      Threat.countDocuments({ severity: 'high' }),
    ]);

    res.json({
      totalThreats,
      activeIncidents,
      resolvedToday,
      totalAnalyses,
      criticalCount,
      highCount,
      timestamp: new Date().toISOString(),
    });
  } catch (err) { next(err); }
};

// GET /api/dashboard/feed
exports.getFeed = async (req, res, next) => {
  try {
    const threats = await Threat.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .select('type severity sourceIP country target status createdAt description');
    res.json({ threats });
  } catch (err) { next(err); }
};

// GET /api/dashboard/siem
exports.getSIEM = async (req, res, next) => {
  try {
    const hours = parseInt(req.query.hours) || 24;
    const since = new Date(Date.now() - hours * 3600 * 1000);

    const pipeline = [
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: {
            hour: { $hour: '$createdAt' },
            severity: '$severity',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.hour': 1 } },
    ];

    const data = await Threat.aggregate(pipeline);
    res.json({ data, hours, since: since.toISOString() });
  } catch (err) { next(err); }
};
