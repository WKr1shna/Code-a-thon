const admin = require('../config/firebase');
const env = require('../config/env');
const twilio = require('twilio');
const User = require('../models/User.model');
const BroadcastLog = require('../models/BroadcastLog.model');

// Initialize Twilio client
const twilioClient = env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN 
  ? twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN) 
  : null;

exports.sendPushNotification = async (req, res, next) => {
  try {
    const { title, body, data, targetRoles, district } = req.body;
    if (!title || !body) {
      return res.status(400).json({ success: false, message: 'Notification title and body are required' });
    }

    const query = { fcmTokens: { $exists: true, $ne: [] } };
    if (targetRoles && Array.isArray(targetRoles) && targetRoles.length > 0) {
      query.role = { $in: targetRoles };
    }
    if (district) {
      query.district = district;
    }

    const targetUsers = await User.find(query);
    const tokens = targetUsers.flatMap(u => u.fcmTokens);

    let recipientsCount = 0;
    if (tokens.length > 0) {
      const payload = {
        notification: { title, body },
        data: data || {}
      };
      
      const messaging = admin.messaging();
      for (let i = 0; i < tokens.length; i += 500) {
        const batch = tokens.slice(i, i + 500);
        const response = await messaging.sendEachForMulticast({ tokens: batch, ...payload });
        recipientsCount += response.successCount;
      }
    }

    // Log the broadcast action
    const log = new BroadcastLog({
      title,
      body,
      type: 'push',
      targetRoles: targetRoles || [],
      district: district || null,
      recipientsCount,
      sentBy: req.user._id
    });
    await log.save();

    res.json({ success: true, data: log });
  } catch (error) {
    next(error);
  }
};

exports.sendSMS = async (req, res, next) => {
  try {
    const { message, phones } = req.body;
    if (!message || !phones || !Array.isArray(phones) || phones.length === 0) {
      return res.status(400).json({ success: false, message: 'Message and recipient phone numbers are required' });
    }

    if (!twilioClient) {
      return res.status(500).json({ success: false, message: 'Twilio provider credentials are not configured' });
    }

    let recipientsCount = 0;
    const smsPromises = phones.map(async (phone) => {
      try {
        await twilioClient.messages.create({
          body: message,
          from: env.TWILIO_PHONE,
          to: phone
        });
        recipientsCount++;
      } catch (err) {
        console.error(`Twilio SMS delivery failed to ${phone}:`, err.message);
      }
    });

    await Promise.all(smsPromises);

    const log = new BroadcastLog({
      title: 'SMS Broadcast',
      body: message,
      type: 'sms',
      recipientsCount,
      sentBy: req.user._id
    });
    await log.save();

    res.json({ success: true, data: log });
  } catch (error) {
    next(error);
  }
};

exports.sendWhatsApp = async (req, res, next) => {
  try {
    const { templateSid, phones, vars } = req.body;
    if (!templateSid || !phones || !Array.isArray(phones) || phones.length === 0) {
      return res.status(400).json({ success: false, message: 'templateSid and recipient phones are required' });
    }

    if (!twilioClient) {
      return res.status(500).json({ success: false, message: 'Twilio provider credentials are not configured' });
    }

    // Example custom variables template or message fallback
    const bodyText = `WhatsApp Alert Template ID: ${templateSid}. Vars: ${JSON.stringify(vars || {})}`;

    let recipientsCount = 0;
    const waPromises = phones.map(async (phone) => {
      try {
        const toWhatsApp = phone.startsWith('whatsapp:') ? phone : `whatsapp:${phone}`;
        await twilioClient.messages.create({
          from: env.TWILIO_WHATSAPP_FROM,
          body: bodyText, // Normally template SIDs are managed inside Twilio console
          to: toWhatsApp
        });
        recipientsCount++;
      } catch (err) {
        console.error(`Twilio WhatsApp delivery failed to ${phone}:`, err.message);
      }
    });

    await Promise.all(waPromises);

    const log = new BroadcastLog({
      title: 'WhatsApp Template Broadcast',
      body: bodyText,
      type: 'whatsapp',
      recipientsCount,
      sentBy: req.user._id
    });
    await log.save();

    res.json({ success: true, data: log });
  } catch (error) {
    next(error);
  }
};

exports.getBroadcastHistory = async (req, res, next) => {
  try {
    const logs = await BroadcastLog.find()
      .populate('sentBy', 'name phone role')
      .sort({ timestamp: -1 });
    res.json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
};

exports.sendEmergencyBroadcast = async (req, res, next) => {
  try {
    const { title, body, district } = req.body;
    if (!title || !body) {
      return res.status(400).json({ success: false, message: 'Emergency alert title and body are required' });
    }

    // 1. Gather recipients (all users in the district or matching role targets)
    const query = {};
    if (district) query.district = district;

    const targets = await User.find(query);
    const tokens = targets.flatMap(u => u.fcmTokens).filter(Boolean);
    const phones = targets.map(u => u.phone).filter(Boolean);

    let pushCount = 0;
    let smsCount = 0;

    // Trigger FCM in parallel (fire-and-forget inside thread)
    const pushPromise = (async () => {
      if (tokens.length > 0) {
        const payload = {
          notification: { title: `🚨 EMERGENCY ALERT: ${title}`, body },
          data: { type: 'emergency' }
        };
        const messaging = admin.messaging();
        for (let i = 0; i < tokens.length; i += 500) {
          const batch = tokens.slice(i, i + 500);
          const response = await messaging.sendEachForMulticast({ tokens: batch, ...payload });
          pushCount += response.successCount;
        }
      }
    })();

    // Trigger Twilio SMS in parallel
    const smsPromise = (async () => {
      if (twilioClient && phones.length > 0) {
        const smsTasks = phones.map(async (phone) => {
          try {
            await twilioClient.messages.create({
              body: `🚨 EMERGENCY ALERT: ${title}\n${body}`,
              from: env.TWILIO_PHONE,
              to: phone
            });
            smsCount++;
          } catch (err) {
            console.error(`Emergency Twilio SMS failed to ${phone}:`, err.message);
          }
        });
        await Promise.all(smsTasks);
      }
    })();

    // Run parallel triggers
    await Promise.all([pushPromise, smsPromise]);

    const log = new BroadcastLog({
      title: `🚨 EMERGENCY: ${title}`,
      body,
      type: 'emergency',
      district: district || null,
      recipientsCount: pushCount + smsCount,
      sentBy: req.user._id
    });
    await log.save();

    res.json({ success: true, data: log });
  } catch (error) {
    next(error);
  }
};
