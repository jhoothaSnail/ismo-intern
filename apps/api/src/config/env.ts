import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  CORS_ORIGINS: z.string().default('http://localhost:5173'),
  TRUST_PROXY_HOPS: z.coerce.number().int().nonnegative().default(0),
  LOG_LEVEL: z
    .enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal'])
    .default('info'),
});

const result = schema.safeParse(process.env);

if (!result.success) {
  console.error('Invalid environment configuration:');
  console.error(JSON.stringify(result.error.flatten().fieldErrors, null, 2));
  process.exit(1);
}

export const env = result.data;
