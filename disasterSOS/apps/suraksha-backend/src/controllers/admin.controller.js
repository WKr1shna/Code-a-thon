const prisma = require('../configs/db');
const { sendResponse } = require('../utils/response');

exports.getAnalytics = async (req, res, next) => {
  try {
    const totalIncidents = await prisma.incident.count({ where: { isDeleted: false } });
    
    // Verified today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const verifiedToday = await prisma.incident.count({
      where: {
        status: { in: ['VERIFIED', 'ACTIVE'] },
        createdAt: { gte: startOfToday },
        isDeleted: false
      }
    });

    const fakeToday = await prisma.incident.count({
      where: {
        status: 'FAKE',
        createdAt: { gte: startOfToday },
        isDeleted: false
      }
    });

    const analyticsDoc = await prisma.analytics.findFirst({
      orderBy: { date: 'desc' }
    });

    sendResponse(res, 200, 'Analytics fetched', {
      totalIncidents,
      verifiedToday,
      fakeToday,
      avgResponseTime: analyticsDoc?.avgResponseTime || 15
    });
  } catch (error) {
    next(error);
  }
};

exports.getFakeQueue = async (req, res, next) => {
  try {
    const fakeAlerts = await prisma.incident.findMany({
      where: { status: 'PENDING', aiConfidence: { lt: 0.4 }, isDeleted: false },
      include: { reporter: { select: { fullName: true, email: true } } }
    });

    sendResponse(res, 200, 'Fake queue fetched', fakeAlerts);
  } catch (error) {
    next(error);
  }
};

exports.getPersonnel = async (req, res, next) => {
  try {
    const agencies = await prisma.agency.findMany({
      include: {
        responders: {
          include: { user: { select: { fullName: true, email: true, phoneNumber: true } } }
        }
      }
    });

    const volunteers = await prisma.volunteer.findMany({
      include: { user: { select: { fullName: true, email: true, phoneNumber: true } } }
    });

    sendResponse(res, 200, 'Personnel fetched successfully', { agencies, volunteers });
  } catch (error) {
    next(error);
  }
};
