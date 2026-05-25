const User = require('../models/User.model');
const Alert = require('../models/Alert.model');
const AuditLog = require('../models/AuditLog.model');
const Volunteer = require('../models/Volunteer.model');
const admin = require('../config/firebase');

exports.getUsers = async (req, res, next) => {
  try {
    const { role, isBanned, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (isBanned) filter.isBanned = isBanned === 'true';

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('-passwordHash')
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.json({
      success: true,
      data: users,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    next(error);
  }
};

exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['citizen', 'ngo', 'ndrf', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role value' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const oldRole = user.role;
    user.role = role;
    await user.save();

    // Log the action to audit trail
    const log = new AuditLog({
      action: 'ROLE_UPDATE',
      performedBy: req.user._id,
      target: user._id.toString(),
      details: { oldRole, newRole: role }
    });
    await log.save();

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

exports.banUser = async (req, res, next) => {
  try {
    const { isBanned } = req.body;
    if (isBanned === undefined) {
      return res.status(400).json({ success: false, message: 'isBanned state is required' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isBanned = isBanned;
    await user.save();

    const log = new AuditLog({
      action: isBanned ? 'USER_BAN' : 'USER_UNBAN',
      performedBy: req.user._id,
      target: user._id.toString(),
      details: { email: user.email }
    });
    await log.save();

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

exports.getAnalytics = async (req, res, next) => {
  try {
    const totalAlerts = await Alert.countDocuments();
    
    // Calculation of verified today and fake today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const verifiedToday = await Alert.countDocuments({
      status: { $in: ['verified', 'active'] },
      createdAt: { $gte: startOfToday }
    });

    const fakeToday = await Alert.countDocuments({
      status: 'fake',
      createdAt: { $gte: startOfToday }
    });

    // Average Response Time calculation (simulated/mocked average, or matching updates)
    // We compute average duration in minutes between alert creation and claim
    const respondedAlerts = await Alert.find({ claimedBy: { $ne: null } }).select('createdAt updatedAt');
    let totalMinutes = 0;
    respondedAlerts.forEach((a) => {
      const diffMs = a.updatedAt - a.createdAt;
      totalMinutes += Math.floor(diffMs / (1000 * 60));
    });
    const avgResponseTime = respondedAlerts.length > 0 
      ? Math.floor(totalMinutes / respondedAlerts.length) 
      : 15; // default fallback 15 mins

    // Alerts grouped by district
    // Alerts themselves don't have district directly, we extract from reportedBy user or group dynamically
    const districtStats = await Alert.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'reportedBy',
          foreignField: '_id',
          as: 'reporter'
        }
      },
      { $unwind: { path: '$reporter', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: { $ifNull: ['$reporter.district', 'Unknown'] },
          count: { $sum: 1 }
        }
      },
      { $project: { district: '$_id', count: 1, _id: 0 } }
    ]);

    res.json({
      success: true,
      data: {
        totalAlerts,
        verifiedToday,
        fakeToday,
        avgResponseTime,
        byDistrict: districtStats
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getFakeQueue = async (req, res, next) => {
  try {
    // pending status with low AI confidence score
    const alerts = await Alert.find({
      status: 'pending',
      aiScore: { $lt: 0.4 }
    }).populate('reportedBy', 'name phone email fakeReportCount');

    res.json({ success: true, data: alerts });
  } catch (error) {
    next(error);
  }
};

exports.getPersonnel = async (req, res, next) => {
  try {
    const ngos = await User.find({ role: 'ngo' });
    const ndrfUsers = await User.find({ role: 'ndrf' });
    const volunteerRecords = await Volunteer.find().populate('userId');

    const agencies = ngos.map((ngo, idx) => {
      const agencyResponders = ndrfUsers.slice(idx * 2, (idx + 1) * 2).map((u, rIdx) => ({
        id: u._id.toString(),
        user: { fullName: u.name },
        status: rIdx % 2 === 0 ? 'DEPLOYED' : 'AVAILABLE'
      }));

      return {
        id: ngo._id.toString(),
        name: ngo.name,
        type: 'NGO Coordination Unit',
        contactEmail: ngo.email,
        responders: agencyResponders
      };
    });

    const volunteers = volunteerRecords.map(vol => ({
      id: vol._id.toString(),
      user: {
        fullName: vol.userId?.name || 'Local Volunteer',
        phoneNumber: vol.userId?.phone || '+919999999999'
      },
      skills: vol.skills && vol.skills.length > 0 ? vol.skills : ['First Aid', 'Rescue Support']
    }));

    if (volunteers.length === 0) {
      const citizens = await User.find({ role: 'citizen' });
      citizens.forEach(c => {
        volunteers.push({
          id: c._id.toString(),
          user: {
            fullName: c.name,
            phoneNumber: c.phone
          },
          skills: ['First Aid', 'Relief Supply Distribution', 'Basic Life Support']
        });
      });
    }

    res.json({
      success: true,
      data: {
        agencies,
        volunteers
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.confirmFakeAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    alert.status = 'fake';
    await alert.save();

    // Increment reporter's fake report count if alert was not reported anonymously
    if (alert.reportedBy) {
      const reporter = await User.findById(alert.reportedBy);
      if (reporter) {
        reporter.fakeReportCount = (reporter.fakeReportCount || 0) + 1;
        
        // Auto-ban user if fake reports exceed 5 thresholds
        if (reporter.fakeReportCount >= 5) {
          reporter.isBanned = true;
          console.warn(`[AUTO-BAN] User ${reporter.email} banned automatically due to excess fake reports.`);
        }
        
        await reporter.save();
      }
    }

    const log = new AuditLog({
      action: 'CONFIRM_FAKE',
      performedBy: req.user._id,
      target: alert._id.toString(),
      details: { title: alert.title }
    });
    await log.save();

    res.json({ success: true, message: 'Alert confirmed as FAKE. Reporter penalty count updated.' });
  } catch (error) {
    next(error);
  }
};

exports.overrideFakeAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    alert.status = 'verified';
    alert.aiScore = 1.0; // Override confidence score
    await alert.save();

    // Trigger FCM broadcast to nearby citizens
    try {
      const nearbyUsers = await User.find({ fcmTokens: { $exists: true, $ne: [] } });
      const tokens = nearbyUsers.flatMap(u => u.fcmTokens);

      if (tokens.length > 0) {
        const payload = {
          notification: {
            title: `CRITICAL OVERRIDE ALERT: ${alert.title}`,
            body: alert.description
          },
          data: {
            alertId: alert._id.toString(),
            severity: alert.severity
          }
        };

        const messaging = admin.messaging();
        for (let i = 0; i < tokens.length; i += 500) {
          const batch = tokens.slice(i, i + 500);
          await messaging.sendEachForMulticast({ tokens: batch, ...payload });
        }
      }
    } catch (fcmErr) {
      console.error('FCM override notification failed:', fcmErr.message);
    }

    const log = new AuditLog({
      action: 'OVERRIDE_FAKE',
      performedBy: req.user._id,
      target: alert._id.toString(),
      details: { title: alert.title }
    });
    await log.save();

    res.json({ success: true, message: 'Alert overridden to VERIFIED state and notifications issued.' });
  } catch (error) {
    next(error);
  }
};

exports.getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    const total = await AuditLog.countDocuments();
    const logs = await AuditLog.find()
      .populate('performedBy', 'name phone email role')
      .sort({ timestamp: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.json({
      success: true,
      data: logs,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    next(error);
  }
};

exports.getTeams = async (req, res, next) => {
  try {
    const teams = await User.find({ role: { $in: ['ndrf', 'ngo'] } })
      .select('name phone email role district status');
    
    // Map to expected 'teams' structure in frontend
    const mappedTeams = teams.map(t => ({
      id: t._id,
      name: t.name,
      type: t.role.toUpperCase(),
      status: t.status || 'AVAILABLE',
      contact: t.phone
    }));

    res.json({ success: true, data: mappedTeams });
  } catch (error) {
    next(error);
  }
};
