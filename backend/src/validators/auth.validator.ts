import { z } from "zod"; // npm install zod

export const registerSchema = z.object({
    name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be at most 50 characters')
    .trim(),

    email: z
    .string()
    .email('Invalid email address')
    .trim()
    .toLowerCase(),

    password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be at most 100 characters')
});

export const loginSchema = z.object({
    email: z
    .string()
    .email('Invalid email address')
    .trim()
    .toLowerCase(),

    password: z
    .string()
    .min(1, 'Password is required')
});