const { z } = require('zod');

exports.registerSchema = z.object({
  body: z.object({
    fullName: z.string().min(3, "Full name must be at least 3 characters").max(50),
    email: z.string().email("Invalid email format"),
    phoneNumber: z.string().min(10, "Phone number must be at least 10 digits").max(15),
    password: z.string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    organization: z.string().optional(),
    role: z.enum(["SUPER_ADMIN", "ADMIN", "COORDINATOR", "RESPONDER", "VOLUNTEER"]).optional()
  })
});

exports.loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required")
  })
});
