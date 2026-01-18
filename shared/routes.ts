import { z } from 'zod';
import { insertLedStateSchema, insertPhotoSchema, ledStates, photos, insertFocusSessionSchema, focusSessions } from './schema';

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
      method: 'POST' as const,
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
    delete: {
      method: 'DELETE' as const,
      path: '/api/photos/:id',
      responses: {
        200: z.object({ success: z.boolean() }),
        404: errorSchemas.notFound,
      },
    },
  },
  focus: {
    start: {
      method: 'POST' as const,
      path: '/api/focus/start',
      input: insertFocusSessionSchema,
      responses: {
        201: z.custom<typeof focusSessions.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    current: {
      method: 'GET' as const,
      path: '/api/focus/current',
      responses: {
        200: z.custom<typeof focusSessions.$inferSelect>().nullable(),
      },
    },
    stop: {
      method: 'POST' as const,
      path: '/api/focus/stop',
      responses: {
        200: z.object({ success: z.boolean() }),
      },
    },
  },
  weather: {
    get: {
      method: 'GET' as const,
      path: '/api/weather',
      responses: {
        200: z.object({
          temp: z.number(),
          condition: z.string(),
          location: z.string(),
          high: z.number(),
          low: z.number(),
        }),
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
