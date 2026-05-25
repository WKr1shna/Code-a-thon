const axios = require('axios');
const env = require('../config/env');
const Alert = require('../models/Alert.model');

exports.verifyAlert = async (req, res, next) => {
  try {
    const { alertId } = req.body;
    const alert = await Alert.findById(alertId);
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    // Call FastAPI service to verify spam (using correct /ai/verify prefix)
    const response = await axios.post(`${env.AI_SERVICE_URL}/ai/verify`, {
      alertId: alert._id,
      text: alert.description,
      location: {
        lat: alert.location.coordinates[1],
        lng: alert.location.coordinates[0]
      }
    });

    const rawScore = response.data.score !== undefined ? response.data.score : (response.data.spam_score !== undefined ? (1 - response.data.spam_score) : 0.85);
    const score = parseFloat(rawScore);
    const breakdown = response.data.breakdown || { verified: response.data.verified };
    alert.aiScore = score;
    alert.aiBreakdown = breakdown || {};

    if (score > 0.7) {
      alert.status = 'verified';
    } else if (score < 0.4) {
      alert.status = 'fake';
    }

    await alert.save();

    // Fetch and populate alert so it matches socket event contract
    const populatedAlert = await Alert.findById(alert._id)
      .populate('reportedBy', 'name phone email role')
      .populate('claimedBy', 'name phone role');

    // Emit live update to synchronize the map on the landing page immediately
    const io = req.app.get('io');
    if (io) {
      io.emit('sos_update', populatedAlert || alert);
    }

    res.json({
      success: true,
      data: {
        alertId: alert._id,
        aiScore: alert.aiScore,
        aiBreakdown: alert.aiBreakdown,
        status: alert.status
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
