import { Router } from 'express';
import { HEALTH_OK } from '@pms/contracts';

export const router = Router();

router.get('/health', (_req, res) => {
  res.json({ data: { status: HEALTH_OK } });
});

router.get('/ready', async (_req, res) => {
  // DB ping added in Phase 1 when PrismaClient is wired into AppDeps
  res.json({ data: { status: HEALTH_OK } });
});
