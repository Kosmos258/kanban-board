import { Router } from 'express';
import { ApiError } from '../../lib/ApiError';
import { prisma } from '../../lib/prisma';

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  res.json({ status: 'ok' });
});

healthRouter.get('/ready', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    throw new ApiError(503, 'База данных недоступна');
  }
  res.json({ status: 'ready' });
});
