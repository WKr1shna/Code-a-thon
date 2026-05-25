const prisma = require('../configs/db');
const { sendResponse } = require('../utils/response');
const aiService = require('../services/ai.service');

exports.getSosRequests = async (req, res, next) => {
  try {
    const { status, severity } = req.query;
    const filter = { isDeleted: false };
    if (status) filter.dispatchStatus = status;
    if (severity) filter.severity = severity;

    const incidents = await prisma.incident.findMany({
      where: filter,
      orderBy: { createdAt: 'desc' },
      include: {
        reporter: { select: { fullName: true, phoneNumber: true } },
        assignments: {
          include: {
            responder: { include: { user: { select: { fullName: true } } } },
            volunteer: { include: { user: { select: { fullName: true } } } },
            vehicle: true
          }
        }
      }
    });

    sendResponse(res, 200, 'SOS Requests fetched', incidents);
  } catch (error) {
    next(error);
  }
};

exports.getAvailableResources = async (req, res, next) => {
  try {
    const [responders, volunteers, vehicles] = await Promise.all([
      prisma.responder.findMany({
        where: { status: 'AVAILABLE' },
        include: { user: { select: { fullName: true, phoneNumber: true } }, agency: true }
      }),
      prisma.volunteer.findMany({
        where: { isAvailable: true },
        include: { user: { select: { fullName: true, phoneNumber: true } } }
      }),
      prisma.rescueVehicle.findMany({
        where: { status: 'AVAILABLE' }
      })
    ]);

    sendResponse(res, 200, 'Available resources fetched', {
      responders,
      volunteers,
      vehicles
    });
  } catch (error) {
    next(error);
  }
};

exports.assignResource = async (req, res, next) => {
  try {
    const { id } = req.params; // incident ID
    const { responderId, volunteerId, vehicleId, notes, estimatedDuration } = req.body;

    const assignment = await prisma.sOSAssignment.create({
      data: {
        incidentId: id,
        responderId,
        volunteerId,
        vehicleId,
        notes,
        estimatedDuration
      }
    });

    // Update statuses of assigned assets
    if (responderId) {
      await prisma.responder.update({ where: { id: responderId }, data: { status: 'DEPLOYED' } });
    }
    if (volunteerId) {
      await prisma.volunteer.update({ where: { id: volunteerId }, data: { isAvailable: false } });
    }
    if (vehicleId) {
      await prisma.rescueVehicle.update({ where: { id: vehicleId }, data: { status: 'DEPLOYED' } });
    }

    // Update Incident dispatchStatus
    await prisma.incident.update({
      where: { id },
      data: { dispatchStatus: 'ASSIGNED' }
    });

    // Log action
    await prisma.auditLog.create({
      data: {
        action: 'ASSIGN_RESOURCE',
        details: { incidentId: id, assignmentId: assignment.id },
        performedById: req.user.id
      }
    });

    // Emit Socket.IO update event
    const io = req.app.get('io');
    if (io) {
      io.emit('sos_update', { action: 'ASSIGN_RESOURCE', incidentId: id, assignment });
    }

    sendResponse(res, 201, 'Resource assigned successfully', assignment);
  } catch (error) {
    next(error);
  }
};

exports.getAiRecommendation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const incident = await prisma.incident.findUnique({ where: { id } });
    if (!incident) return sendResponse(res, 404, 'Incident not found');

    const prompt = `You are an AI dispatch coordinator.
    Incident: ${incident.title} - ${incident.description}
    Type: ${incident.type}, Severity: ${incident.severity}.
    Suggest exactly what resources (Teams, Vehicles, Medical) are required and provide a 2 sentence reasoning.`;

    const axios = require('axios');
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }]
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    const recommendation = response.data?.choices?.[0]?.message?.content || "Deploy nearest available multi-purpose team.";
    sendResponse(res, 200, 'AI Recommendation generated', { recommendation });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, 'Failed to generate AI recommendation');
  }
};
