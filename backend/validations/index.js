import { z } from "zod";

export const identifyUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
});

export const sendMessageSchema = z.object({
  sessionId: z.string().min(1, "sessionId is required"),
  text: z.string().min(1, "text is required")
});

export const startSessionSchema = z.object({
  userId: z.string().min(1, "userId is required"),
  scenarioId: z.string().optional()
});

export const endSessionSchema = z.object({
  sessionId: z.string().min(1, "sessionId is required")
});

export const getSessionHistorySchema = z.object({
  userId: z.string().min(1, "userId is required").refine(val => val !== 'undefined', { message: "userId is required" })
});

export const getSessionDetailsSchema = z.object({
  sessionId: z.string().min(1, "sessionId is required")
});
