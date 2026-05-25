const prisma = require('../configs/db');
const { sendResponse } = require('../utils/response');

const aiService = require('../services/ai.service');

exports.createIncident = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    
    // Evaluate spam probability
    const spamProb = await aiService.analyzeSpam(title, description);
    const aiConfidence = 1 - spamProb; // Convert to genuine confidence
    
    // If confidence is < 0.4 (i.e. > 60% chance of spam), send to Fake Queue (PENDING). Otherwise ACTIVE.
    const status = aiConfidence < 0.4 ? 'PENDING' : 'ACTIVE';

    const incident = await prisma.incident.create({
      data: {
        ...req.body,
        createdById: req.user.id,
        aiConfidence,
        status
      }
    });

    // Emit Socket.IO update event
    const io = req.app.get('io');
    if (io) {
      io.emit('sos_update', { action: 'CREATE_INCIDENT', incident });
    }

    sendResponse(res, 201, 'Incident reported successfully', incident);
  } catch (error) {
    next(error);
  }
};

exports.getIncidents = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, severity } = req.query;
    
    const filter = { isDeleted: false };
    if (status) filter.status = status;
    if (severity) filter.severity = severity;

    const total = await prisma.incident.count({ where: filter });
    const incidents = await prisma.incident.findMany({
      where: filter,
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: { reporter: { select: { fullName: true, phoneNumber: true } } }
    });

    sendResponse(res, 200, 'Incidents fetched', {
      incidents,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateIncidentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const incident = await prisma.incident.update({
      where: { id },
      data: { status }
    });

    // Log action
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_INCIDENT_STATUS',
        details: { incidentId: id, status },
        performedById: req.user.id
      }
    });

    // Emit Socket.IO update event
    const io = req.app.get('io');
    if (io) {
      io.emit('sos_update', { action: 'UPDATE_INCIDENT_STATUS', incidentId: id, status });
    }

    sendResponse(res, 200, 'Incident status updated', incident);
  } catch (error) {
    if (error.code === 'P2025') return sendResponse(res, 404, 'Incident not found');
    next(error);
  }
};
