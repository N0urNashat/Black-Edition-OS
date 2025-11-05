import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../../.env' });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('4000'),
  API_URL: z.string().url().optional(),
  DATABASE_URL: z.string(),
  REDIS_URL: z.string(),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  RATE_LIMIT_WINDOW_MS: z.string().default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100'),
  JWT_SECRET: z.string().optional(),
  LOG_LEVEL: z.string().default('info'),
});

const env = envSchema.parse(process.env);

export const config = {
  nodeEnv: env.NODE_ENV,
  port: parseInt(env.PORT, 10),
  apiUrl: env.API_URL,
  databaseUrl: env.DATABASE_URL,
  redisUrl: env.REDIS_URL,
  corsOrigin: env.CORS_ORIGIN,
  rateLimitWindow: parseInt(env.RATE_LIMIT_WINDOW_MS, 10),
  rateLimitMax: parseInt(env.RATE_LIMIT_MAX_REQUESTS, 10),
  jwtSecret: env.JWT_SECRET || 'dev-secret-change-in-production',
  logLevel: env.LOG_LEVEL,
} as const;
