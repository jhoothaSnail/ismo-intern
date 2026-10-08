import express from 'express';
import { env } from './config/env.js';
import { requestId } from './middleware/request-id.js';
import { router } from './routes.js';

export interface AppDeps {
  // Populated in Phase 1+: prisma, services, etc.
}

export function createApp(_deps: AppDeps = {}): express.Express {
  const app = express();

  app.set('trust proxy', env.TRUST_PROXY_HOPS);
  app.use(express.json({ limit: '1mb' }));
  app.use(requestId);
  app.use('/api', router);

  app.use((_req: express.Request, res: express.Response) => {
    res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Route not found', requestId: _req.id },
    });
  });

  return app;
}
