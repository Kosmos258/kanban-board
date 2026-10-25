import express from 'express';
import cors from 'cors';
import { env } from './config/env';

// Приложение отделено от запуска сервера, чтобы его можно было тестировать без порта
export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(cors({ origin: env.corsOrigin }));
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  return app;
}
