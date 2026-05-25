const { z } = require('zod');

exports.createIncidentSchema = z.object({
  body: z.object({
    title: z.string().min(5),
    description: z.string().min(2),
    type: z.string(),
    severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180)
  })
});

exports.updateStatusSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    status: z.enum(["PENDING", "VERIFIED", "ACTIVE", "RESOLVED", "FAKE"])
  })
});
