const axios = require('axios');
const env = require('../config/env');
const Alert = require('../models/Alert.model');
const User = require('../models/User.model');
const Volunteer = require('../models/Volunteer.model');
const admin = require('../config/firebase');

exports.reportAlert = async (req, res, next) => {
  try {
    const { title, description, type, location, mediaUrls } = req.body;
    if (!title || !description || !type || !location || !location.lat || !location.lng) {
      return res.status(400).json({ success: false, message: 'Missing required report fields' });
    }

    const alert = new Alert({
      title,
      description,
      type,
      location: {
        type: 'Point',
        coordinates: [parseFloat(location.lng), parseFloat(location.lat)]
      },
      mediaUrls: mediaUrls || [],
      reportedBy: req.user ? req.user._id : null
    });

    await alert.save();

    // Fire and forget verification call to the FastAPI AI service (using correct /ai/verify prefix)
    axios.post(`${env.AI_SERVICE_URL}/ai/verify`, {
      alertId: alert._id,
      text: alert.description,
      location: {
        lat: parseFloat(location.lat),
        lng: parseFloat(location.lng)
      }
    }).catch(err => console.error('AI Service verify triggering failed:', err.message));

    // Fetch and populate alert so it matches socket event contract
    const populatedAlert = await Alert.findById(alert._id)
      .populate('reportedBy', 'name phone email role')
      .populate('claimedBy', 'name phone role');

    // Emit live update to synchronize the map on the landing page immediately
    const io = req.app.get('io');
    if (io) {
      io.emit('sos_update', populatedAlert || alert);
    }

    res.status(201).json({
      success: true,
      data: populatedAlert || alert
    });
  } catch (error) {
    next(error);
  }
};

exports.getAlerts = async (req, res, next) => {
  try {
    const { status, severity, type, district, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (severity) filter.severity = severity;
    if (type) filter.type = type;

    // Filter by district if users match the district criteria
    if (district) {
      // Find users in this district and query reports submitted by them, or match by metadata
      // For simplicity, we can query matching user references
      const usersInDistrict = await User.find({ district }).select('_id');
      const userIds = usersInDistrict.map(u => u._id);
      filter.reportedBy = { $in: userIds };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const total = await Alert.countDocuments(filter);
    const alerts = await Alert.find(filter)
      .populate('reportedBy', 'name phone email role')
      .populate('claimedBy', 'name phone role')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.json({
      success: true,
      data: alerts,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    next(error);
  }
};

exports.getNearbyAlerts = async (req, res, next) => {
  try {
    const { lat, lng, radius = 5 } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'Latitude and Longitude are required' });
    }

    const radiusInMeters = parseFloat(radius) * 1000;

    // Find pending, verified or active alerts near spatial index to synchronize newly reported citizen alerts
    const alerts = await Alert.find({
      status: { $in: ['pending', 'verified', 'active'] },
      location: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: radiusInMeters
        }
      }
    }).populate('reportedBy', 'name phone').populate('claimedBy', 'name phone');

    res.json({ success: true, data: alerts });
  } catch (error) {
    next(error);
  }
};

exports.getAlertHeatmap = async (req, res, next) => {
  try {
    const alerts = await Alert.find({ status: { $in: ['verified', 'active'] } });
    const heatmap = alerts.map(alert => ({
      lat: alert.location.coordinates[1],
      lng: alert.location.coordinates[0],
      weight: alert.aiScore || 0.1
    }));

    res.json({ success: true, data: heatmap });
  } catch (error) {
    next(error);
  }
};

exports.getAlertStats = async (req, res, next) => {
  try {
    // Aggregation counts grouped by status, severity, type
    const statusStats = await Alert.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
    const severityStats = await Alert.aggregate([{ $group: { _id: '$severity', count: { $sum: 1 } } }]);
    const typeStats = await Alert.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]);

    res.json({
      success: true,
      data: {
        status: statusStats.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {}),
        severity: severityStats.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {}),
        type: typeStats.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {})
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getAlertById = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.id)
      .populate('reportedBy', 'name phone email role district')
      .populate('claimedBy', 'name phone role')
      .populate('responderUpdates.postedBy', 'name phone role');

    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    res.json({ success: true, data: alert });
  } catch (error) {
    next(error);
  }
};

exports.updateAlertStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const statusLower = status ? status.toLowerCase() : '';
    if (!['pending', 'verified', 'active', 'resolved', 'fake'].includes(statusLower)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    alert.status = statusLower;
    await alert.save();

    // Fetch and populate updated alert for socket notification
    const populatedAlert = await Alert.findById(alert._id)
      .populate('reportedBy', 'name phone email role')
      .populate('claimedBy', 'name phone role');

    // Emit live update to sync landing page maps
    const io = req.app.get('io');
    if (io) {
      io.emit('sos_update', populatedAlert || alert);
    }

    // If verified, trigger FCM broadcast to nearby citizens
    if (status === 'verified') {
      try {
        const radiusInMeters = 10000; // 10km radius
        const nearbyUsers = await User.find({
          fcmTokens: { $exists: true, $ne: [] }
        }); // Find tokens

        const tokens = nearbyUsers.flatMap(u => u.fcmTokens);
        
        if (tokens.length > 0) {
          // Firebase FCM notification dispatch
          const payload = {
            data: {
              title: `CRITICAL ALERT: ${alert.title}`,
              body: alert.description,
              alertId: alert._id.toString(),
              type: alert.type,
              severity: alert.severity
            }
          };
          
          // FCM Multicast
          const messaging = admin.messaging();
          // Group tokens into batches of 500
          for (let i = 0; i < tokens.length; i += 500) {
            const batch = tokens.slice(i, i + 500);
            await messaging.sendEachForMulticast({ tokens: batch, ...payload });
          }
        }
      } catch (fcmErr) {
        console.error('FCM broadcast for alert verification failed:', fcmErr.message);
      }
    }

    if (alert.reportedBy) {
      await alert.populate('reportedBy', 'name phone email role');
    }
    if (alert.claimedBy) {
      await alert.populate('claimedBy', 'name phone role');
    }

    res.json({ success: true, data: alert });
  } catch (error) {
    next(error);
  }
};

exports.updateAlertSeverity = async (req, res, next) => {
  try {
    const { severity } = req.body;
    if (!['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(severity)) {
      return res.status(400).json({ success: false, message: 'Invalid severity scale' });
    }

    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    alert.severity = severity;
    await alert.save();

    // Fetch and populate updated alert for socket notification
    const populatedAlert = await Alert.findById(alert._id)
      .populate('reportedBy', 'name phone email role')
      .populate('claimedBy', 'name phone role');

    // Emit live update to sync landing page maps
    const io = req.app.get('io');
    if (io) {
      io.emit('sos_update', populatedAlert || alert);
    }

    res.json({ success: true, data: populatedAlert || alert });
  } catch (error) {
    next(error);
  }
};

exports.addAlertMedia = async (req, res, next) => {
  try {
    const { mediaUrls } = req.body;
    if (!mediaUrls || !Array.isArray(mediaUrls)) {
      return res.status(400).json({ success: false, message: 'mediaUrls must be an array' });
    }

    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    alert.mediaUrls.push(...mediaUrls);
    await alert.save();

    if (alert.reportedBy) {
      await alert.populate('reportedBy', 'name phone email role');
    }
    if (alert.claimedBy) {
      await alert.populate('claimedBy', 'name phone role');
    }

    res.json({ success: true, data: alert });
  } catch (error) {
    next(error);
  }
};

exports.deleteAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findByIdAndDelete(req.params.id);
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }
    res.json({ success: true, message: 'Alert hard deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.assignAlert = async (req, res, next) => {
  try {
    const { teamId, priority, assignmentNotes } = req.body;
    
    if (!teamId) {
      return res.status(400).json({ success: false, message: 'Team ID is required for assignment' });
    }

    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    alert.claimedBy = teamId;
    if (priority) {
      alert.severity = priority;
    }
    alert.status = 'active';

    if (assignmentNotes) {
      alert.responderUpdates.push({
        text: `Assigned: ${assignmentNotes}`,
        postedBy: req.user._id
      });
    }

    await alert.save();

    const populatedAlert = await Alert.findById(alert._id)
      .populate('reportedBy', 'name phone email role')
      .populate('claimedBy', 'name phone role');

    // Emit live update
    const io = req.app.get('io');
    if (io) {
      io.emit('sos_update', populatedAlert);
    }

    res.json({ success: true, data: populatedAlert });
  } catch (error) {
    next(error);
  }
};

exports.getAvailableResources = async (req, res, next) => {
  try {
    // 1. Fetch available NDRF users (Responders)
    const ndrfUsers = await User.find({ role: 'ndrf' });
    const responders = ndrfUsers.map(u => ({
      id: u._id.toString(),
      name: u.name,
      phone: u.phone,
      status: 'AVAILABLE',
      district: u.district || 'Chennai'
    }));

    // 2. Fetch available Volunteers
    const volunteerRecords = await Volunteer.find({ status: 'available' }).populate('userId');
    let volunteers = volunteerRecords.map(v => ({
      id: v.userId?._id?.toString() || v._id.toString(),
      name: v.userId?.name || 'Volunteer',
      phone: v.userId?.phone || '+919999999999',
      skills: v.skills && v.skills.length > 0 ? v.skills : ['Rescue Ops', 'First Aid'],
      status: 'AVAILABLE'
    }));

    // Fallback if no volunteers in DB
    if (volunteers.length === 0) {
      const citizenUsers = await User.find({ role: 'citizen' }).limit(5);
      volunteers = citizenUsers.map(u => ({
        id: u._id.toString(),
        name: u.name,
        phone: u.phone,
        skills: ['First Aid', 'Relief Supply', 'Basic Life Support'],
        status: 'AVAILABLE'
      }));
    }

    // 3. Dynamic Mock Vehicles scattered around Chennai/Bengaluru for Leaflet Map
    const vehicles = [
      { id: 'v1', type: 'Rescue Ambulance', status: 'AVAILABLE', lat: 12.972, lng: 77.595, fuel: 85, capacity: '4 Personnel' },
      { id: 'v2', type: 'NDRF Inflatable Boat', status: 'AVAILABLE', lat: 12.985, lng: 77.605, fuel: 90, capacity: '8 Personnel' },
      { id: 'v3', type: 'Emergency Fire Engine', status: 'AVAILABLE', lat: 12.961, lng: 77.582, fuel: 70, capacity: '6 Personnel' },
      { id: 'v4', type: 'Rapid Rescue Truck', status: 'AVAILABLE', lat: 12.992, lng: 77.618, fuel: 95, capacity: '5 Personnel' }
    ];

    res.json({
      success: true,
      data: {
        responders,
        volunteers,
        vehicles
      }
    });
  } catch (error) {
    next(error);
  }
};

// AI dispatch recommendations mapping based on disaster vector characteristics
exports.getAiRecommendation = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    let recommendation = "";
    switch (alert.type) {
      case 'flood':
        recommendation = `🌊 AI DISPATCH RECOMMENDATION: Critical flooding reported. Deploy NDRF marine rescue unit with inflatable motorized rescue boats. NGO volunteers should immediately establish a food and clean water relief depot within 3km for immediate community support.`;
        break;
      case 'earthquake':
        recommendation = `🧱 AI DISPATCH RECOMMENDATION: Severe structural collapse risk. Deploy NDRF urban search & rescue (USAR) team equipped with concrete cutters and acoustic detection cameras. Establish NGO medical triages nearby.`;
        break;
      case 'fire':
        recommendation = `🔥 AI DISPATCH RECOMMENDATION: Extreme thermal outbreak. Dispatch 3 primary fire engines. Coordinate with NGO volunteers to establish a safe boundary perimeter and provide rapid smoke inhalation first aid.`;
        break;
      case 'landslide':
        recommendation = `⛰️ AI DISPATCH RECOMMENDATION: Heavy landslide blockage. Deploy NDRF debris clearance machinery. NGO units should inspect adjacent lower settlements for structural damage.`;
        break;
      case 'urban':
        recommendation = `🏢 AI DISPATCH RECOMMENDATION: Extreme urban crisis or flash flooding. Coordinate with local municipal water pump assets. Deploy NGO rescue responders to assist stranded motorists and check localized power line hazards.`;
        break;
      default:
        recommendation = `🚨 AI DISPATCH RECOMMENDATION: General emergency alert. Dispatch nearest NGO response unit to verify on-site conditions and request custom logistics and emergency resources.`;
    }

    res.json({
      success: true,
      data: {
        recommendation
      }
    });
  } catch (error) {
    next(error);
  }
};
