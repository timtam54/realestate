/**
 * API Response Validation Utilities
 *
 * Use these schemas to validate responses from the backend API.
 * This provides defense in depth against malformed or malicious data.
 */

import { z } from 'zod';

// User schema for validating user data from API
export const userSchema = z.object({
  id: z.number().int().positive(),
  email: z.string().email(),
  firstname: z.string().max(100).nullable().optional(),
  lastname: z.string().max(100).nullable().optional(),
  phone: z.string().max(20).nullable().optional(),
  role: z.enum(['buyer', 'seller', 'admin']).optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type ValidatedUser = z.infer<typeof userSchema>;

// Property schema
export const propertySchema = z.object({
  id: z.number().int().positive(),
  seller_id: z.number().int().positive().optional(),
  seller_username: z.string().optional(),
  address: z.string().max(500),
  suburb: z.string().max(100).optional(),
  postcode: z.string().regex(/^\d{4}$/).optional(),
  state: z.string().max(20).optional(),
  bedrooms: z.number().int().min(0).max(50).optional(),
  bathrooms: z.number().int().min(0).max(50).optional(),
  car_spaces: z.number().int().min(0).max(50).optional(),
  land_area: z.number().min(0).optional(),
  building_area: z.number().min(0).optional(),
  property_type: z.string().max(50).optional(),
  price: z.number().min(0).optional(),
  description: z.string().max(10000).optional(),
  status: z.enum(['active', 'pending', 'sold', 'withdrawn']).optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type ValidatedProperty = z.infer<typeof propertySchema>;

// Conversation schema
export const conversationSchema = z.object({
  id: z.number().int().positive(),
  property_id: z.number().int().positive(),
  buyer_id: z.number().int().positive(),
  seller_id: z.number().int().positive(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type ValidatedConversation = z.infer<typeof conversationSchema>;

// Message schema
export const messageSchema = z.object({
  id: z.number().int().positive(),
  conversation_id: z.number().int().positive(),
  sender_id: z.number().int().positive(),
  content: z.string().max(10000),
  created_at: z.string().optional(),
  read: z.boolean().optional(),
});

export type ValidatedMessage = z.infer<typeof messageSchema>;

// Array validation helpers
export const usersArraySchema = z.array(userSchema);
export const propertiesArraySchema = z.array(propertySchema);
export const conversationsArraySchema = z.array(conversationSchema);
export const messagesArraySchema = z.array(messageSchema);

/**
 * Safely parse API response with schema validation
 * Returns null if validation fails (logs error in development)
 */
export function safeParseResponse<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context?: string
): T | null {
  const result = schema.safeParse(data);

  if (!result.success) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`Validation failed${context ? ` for ${context}` : ''}:`, result.error.flatten());
    }
    return null;
  }

  return result.data;
}

/**
 * Parse API response with schema validation
 * Throws error if validation fails
 */
export function parseResponse<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context?: string
): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    const message = `Invalid API response${context ? ` for ${context}` : ''}`;
    if (process.env.NODE_ENV === 'development') {
      console.error(message, result.error.flatten());
    }
    throw new Error(message);
  }

  return result.data;
}

/**
 * Validate and sanitize user input for display (XSS prevention)
 */
export function sanitizeForDisplay(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}
