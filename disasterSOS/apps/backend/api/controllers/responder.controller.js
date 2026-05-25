const Alert = require('../models/Alert.model');
const User = require('../models/User.model');
const Volunteer = require('../models/Volunteer.model');
const admin = require('../config/firebase');

exports.claimAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.alertId);
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    alert.claimedBy = req.user._id;
    if (alert.status === 'pending') {
      alert.status = 'active';
    }

    await alert.save();

    res.json({ success: true, data: alert });
  } catch (error) {
    next(error);
  }
};

exports.getMyAlerts = async (req, res, next) => {
  try {
    const alerts = await Alert.find({ claimedBy: req.user._id })
      .populate('reportedBy', 'name phone')
      .populate('claimedBy', 'name phone role');
    res.json({ success: true, data: alerts });
  } catch (error) {
    next(error);
  }
};

exports.addResponderUpdate = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: 'Update description text is required' });
    }

    const alert = await Alert.findById(req.params.alertId);
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    alert.responderUpdates.push({
      text,
      postedBy: req.user._id,
      timestamp: Date.now()
    });

    await alert.save();

    res.json({ success: true, data: alert.responderUpdates });
  } catch (error) {
    next(error);
  }
};

exports.getResponderUpdates = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.alertId)
      .populate('responderUpdates.postedBy', 'name phone role');
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    res.json({ success: true, data: alert.responderUpdates });
  } catch (error) {
    next(error);
  }
};

exports.getTeams = async (req, res, next) => {
  try {
    // Find all NDRF team users
    const ndrfUsers = await User.find({ role: 'ndrf' }).select('name phone email role district');
    
    const teamDetails = await Promise.all(ndrfUsers.map(async (user) => {
      // Find claimed alerts
      const claimedAlerts = await Alert.find({ claimedBy: user._id }).select('title status severity type');
      
      // Find last known location from Volunteer profile if available
      const volunteerProfile = await Volunteer.findOne({ userId: user._id }).select('location status');
      
      return {
        teamMember: user,
        claimedAlerts,
        location: volunteerProfile ? volunteerProfile.location : null,
        status: volunteerProfile ? volunteerProfile.status : 'offline'
      };
    }));

    res.json({ success: true, data: teamDetails });
  } catch (error) {
    next(error);
  }
};

exports.deployTeam = async (req, res, next) => {
  try {
    const { alertId, eta } = req.body;
    const { teamId } = req.params;

    if (!alertId || !eta) {
      return res.status(400).json({ success: false, message: 'alertId and estimated time of arrival (eta) are required' });
    }

    const teamUser = await User.findById(teamId);
    if (!teamUser) {
      return res.status(404).json({ success: false, message: 'Target team member not found' });
    }

    const alert = await Alert.findById(alertId);
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Target alert not found' });
    }

    // Deploy team member, claim the alert
    alert.claimedBy = teamUser._id;
    alert.status = 'active';
    await alert.save();

    // Trigger FCM message alert to target team member
    if (teamUser.fcmTokens && teamUser.fcmTokens.length > 0) {
      try {
        const payload = {
          notification: {
            title: 'ALERT DEPLOYMENT DISPATCH',
            body: `You are deployed to: "${alert.title}". Expected ETA: ${eta}`
          },
          data: {
            alertId: alert._id.toString(),
            eta: eta.toString()
          }
        };

        const messaging = admin.messaging();
        for (const token of teamUser.fcmTokens) {
          await messaging.send({ token, ...payload }).catch(err => console.error('FCM dispatch delivery failed:', err.message));
        }
      } catch (fcmErr) {
        console.error('FCM Team deploy notification failed:', fcmErr.message);
      }
    }

    res.json({ success: true, message: `Team successfully deployed with an ETA of ${eta}` });
  } catch (error) {
    next(error);
  }
};
