import { Channel } from "@/generated/prisma/client";
import { z } from "zod";

export const registerSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
});

export const productSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().min(10).max(2000),
  price: z.coerce.number().positive().max(100000),
  marginPct: z.coerce.number().min(1).max(95),
  landingUrl: z.string().trim().url().max(500),
});

export const audienceSchema = z.object({
  name: z.string().trim().min(2).max(120),
  painPoints: z.string().trim().min(5).max(1000),
  desires: z.string().trim().min(5).max(1000),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

export const generateConceptsSchema = z.object({
  productId: z.string().cuid(),
  audienceId: z.string().cuid(),
  channel: z.nativeEnum(Channel),
  objective: z.string().trim().min(4).max(200),
  count: z.coerce.number().int().min(1).max(8),
});

export const createExperimentSchema = z.object({
  name: z.string().trim().min(2).max(150),
  channel: z.nativeEnum(Channel),
  dailyBudget: z.coerce.number().positive().max(100000),
  conceptIds: z.array(z.string().cuid()).min(1).max(12),
});

export const runOptimizerSchema = z.object({
  experimentId: z.string().cuid().optional(),
});
