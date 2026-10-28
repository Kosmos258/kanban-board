import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { boardsRouter } from './modules/boards/boards.routes';

// Приложение отделено от запуска сервера, чтобы его можно было тестировать без порта
export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(cors({ origin: env.corsOrigin }));
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/boards', boardsRouter);
  // Всегда последними: сначала «не найдено», потом общий обработчик ошибок
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
