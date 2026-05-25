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

    // Call FastAPI service to verify spam
    const response = await axios.post(`${env.AI_SERVICE_URL}/verify`, {
      alertId: alert._id,
      text: alert.description,
      location: {
        lat: alert.location.coordinates[1],
        lng: alert.location.coordinates[0]
      }
    });

    const { score, breakdown } = response.data;
    alert.aiScore = score;
    alert.aiBreakdown = breakdown || {};

    if (score > 0.7) {
      alert.status = 'verified';
    } else if (score < 0.4) {
      // tagged in fake queue, keep status pending but flagged by low score
    }

    await alert.save();

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
      // Call FastAPI translation endpoint
      const response = await axios.post(`${env.AI_SERVICE_URL}/translate`, {
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

    const response = await axios.post(`${env.AI_SERVICE_URL}/predict-risk`, { bbox });
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
