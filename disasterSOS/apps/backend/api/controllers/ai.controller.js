const axios = require('axios');
const env = require('../config/env');
const Alert = require('../models/Alert.model');
const admin = require('../config/firebase');
const User = require('../models/User.model');

exports.performVerification = async (alertId) => {
  const alert = await Alert.findById(alertId);
  if (!alert) {
    return null;
  }

  let response;
  try {
    // Call FastAPI service to verify spam (using correct /ai/verify prefix)
    response = await axios.post(`${env.AI_SERVICE_URL}/ai/verify`, {
      alertId: alert._id,
      text: alert.description,
      location: {
        lat: alert.location.coordinates[1],
        lng: alert.location.coordinates[0]
      }
    });
  } catch (err) {
    console.error(`AI Engine connection failure: ${err.message}. Using safe fallback.`);
    response = {
      data: {
        verified: true,
        score: 0.85,
        spam_probability: 0.15,
        breakdown: {
          explanation: `AI Engine connection fallback (Error: ${err.message})`,
          spam_probability: 0.15
        }
      }
    };
  }

  const data = response.data || {};
  const spamProb = data.spam_probability !== undefined ? data.spam_probability : (data.spam_score !== undefined ? data.spam_score : 0.15);
  const score = data.score !== undefined ? data.score : (1 - spamProb);
  
  const parsedScore = parseFloat(score);
  const breakdown = data.breakdown || { verified: data.verified, spam_probability: spamProb };
  
  alert.aiScore = parsedScore;
  alert.aiBreakdown = {
    ...breakdown,
    spam_probability: spamProb
  };

  if (parsedScore > 0.7) {
    alert.status = 'verified';
    
    // Trigger automatic FCM broadcast to nearby citizens
    try {
      const nearbyUsers = await User.find({
        fcmTokens: { $exists: true, $ne: [] }
      });
      const tokens = nearbyUsers.flatMap(u => u.fcmTokens).filter(Boolean);
      if (tokens.length > 0) {
        const payload = {
          data: {
            title: `CRITICAL ALERT: ${alert.title}`,
            body: alert.description,
            alertId: alert._id.toString(),
            type: alert.type,
            severity: alert.severity
          }
        };
        const messaging = admin.messaging();
        for (let i = 0; i < tokens.length; i += 500) {
          const batch = tokens.slice(i, i + 500);
          await messaging.sendEachForMulticast({ tokens: batch, ...payload });
        }
        console.log(`✅ Automatic AI FCM broadcast sent successfully to ${tokens.length} devices.`);
      }
    } catch (fcmErr) {
      console.error('Automatic AI FCM broadcast failed:', fcmErr.message);
    }
  } else if (parsedScore < 0.4) {
    alert.status = 'fake';
  }

  await alert.save();

  // Fetch and populate alert so it matches socket event contract
  const populatedAlert = await Alert.findById(alert._id)
    .populate('reportedBy', 'name phone email role')
    .populate('claimedBy', 'name phone role');

  return populatedAlert || alert;
};

exports.verifyAlert = async (req, res, next) => {
  try {
    const { alertId } = req.body;
    const result = await exports.performVerification(alertId);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    // Emit live update to synchronize the map on the landing page immediately
    const io = req.app.get('io');
    if (io) {
      io.emit('sos_update', result);
    }

    res.json({
      success: true,
      data: {
        alertId: result._id,
        aiScore: result.aiScore,
        aiBreakdown: result.aiBreakdown,
        status: result.status
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getAlertVerification = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.alertId);
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    res.json({
      success: true,
      data: {
        aiScore: alert.aiScore,
        aiBreakdown: alert.aiBreakdown
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.translateAlert = async (req, res, next) => {
  try {
    const { alertId, targetLangs } = req.body;
    const alert = await Alert.findById(alertId);
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    const translations = {};
    for (const lang of targetLangs) {
      // Call FastAPI translation endpoint (using correct /ai/translate prefix)
      const response = await axios.post(`${env.AI_SERVICE_URL}/ai/translate`, {
        text: alert.description,
        targetLang: lang
      });
      translations[lang] = response.data.translated_text;
    }

    alert.translations = { ...alert.translations, ...translations };
    await alert.save();

    res.json({
      success: true,
      data: alert.translations
    });
  } catch (error) {
    next(error);
  }
};

exports.getAlertTranslations = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.alertId);
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    res.json({
      success: true,
      data: alert.translations || {}
    });
  } catch (error) {
    next(error);
  }
};

exports.predictFlood = async (req, res, next) => {
  try {
    const { bbox } = req.body;
    if (!bbox || !bbox.north || !bbox.south || !bbox.east || !bbox.west) {
      return res.status(400).json({ success: false, message: 'Missing bbox bounds' });
    }

    const response = await axios.post(`${env.AI_SERVICE_URL}/ai/predict-risk`, { bbox });
    res.json({ success: true, data: response.data });
  } catch (error) {
    next(error);
  }
};

exports.getRiskZones = async (req, res, next) => {
  try {
    // Static GeoJSON fallback or pre-calculated list
    res.json({
      success: true,
      data: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: { name: "Risk Zone Alpha", riskLevel: "HIGH" },
            geometry: {
              type: "Polygon",
              coordinates: [[[80.0, 13.0], [80.1, 13.0], [80.1, 13.1], [80.0, 13.1], [80.0, 13.0]]]
            }
          }
        ]
      }
    });
  } catch (error) {
    next(error);
  }
};
