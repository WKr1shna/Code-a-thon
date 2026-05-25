const broadcastService = require('../services/broadcast.service');
const { sendResponse } = require('../utils/response');

exports.sendBroadcast = async (req, res, next) => {
  try {
    const { title, message, type = 'PUSH', targets } = req.body;
    
    // Map frontend 'message' to backend 'body'
    const broadcast = await broadcastService.sendBroadcast({
      title,
      body: message,
      type: type.toUpperCase(),
      senderId: req.user.id
    });

    sendResponse(res, 200, 'Broadcast sent successfully', broadcast);
  } catch (error) {
    next(error);
  }
};

exports.getBroadcasts = async (req, res, next) => {
  try {
    const broadcasts = await require('../configs/db').broadcast.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    sendResponse(res, 200, 'Broadcast history fetched', broadcasts);
  } catch (error) {
    next(error);
  }
};
