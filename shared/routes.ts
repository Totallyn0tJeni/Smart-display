import { z } from 'zod';
import { insertLedStateSchema, insertPhotoSchema, ledStates, photos } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  led: {
    get: {
      method: 'GET' as const,
      path: '/api/led',
      responses: {
        200: z.custom<typeof ledStates.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'POST' as const, // Using POST for simple updates as per original requirements
      path: '/api/led',
      input: insertLedStateSchema.partial(),
      responses: {
        200: z.custom<typeof ledStates.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  photos: {
    list: {
      method: 'GET' as const,
      path: '/api/photos',
      responses: {
        200: z.array(z.custom<typeof photos.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/photos',
      input: insertPhotoSchema,
      responses: {
        201: z.custom<typeof photos.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
