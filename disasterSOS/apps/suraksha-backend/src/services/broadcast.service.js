const prisma = require('../configs/db');

exports.sendBroadcast = async ({ title, body, type, senderId }) => {
  try {
    // Determine audience count (mocked for now, normally query users based on district/role)
    const recipientsCount = Math.floor(Math.random() * 500) + 50;

    // TODO: Actually call Twilio API or Firebase Admin SDK based on `type`
    console.log(`[BROADCAST] Sent ${type}: ${title} to ${recipientsCount} recipients`);

    const broadcast = await prisma.broadcast.create({
      data: {
        title,
        body,
        type, // SMS, WHATSAPP, PUSH, AIR_TEXT
        recipientsCount,
        sentById: senderId
      }
    });

    return broadcast;
  } catch (error) {
    console.error('[BROADCAST SERVICE ERROR]', error.message);
    throw new Error('Failed to send broadcast');
  }
};
