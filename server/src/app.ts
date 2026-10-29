import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { boardsRouter } from './modules/boards/boards.routes';
import { columnsRouter } from './modules/columns/columns.routes';
import { cardsRouter } from './modules/cards/cards.routes';
import { healthRouter } from './modules/health/health.routes';

// Приложение отделено от запуска сервера, чтобы его можно было тестировать без порта
export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: env.corsOrigin }));
  // Лимит защищает от огромных тел запроса
  app.use(express.json({ limit: '100kb' }));

  app.use('/api/health', healthRouter);
  app.use('/api/boards', boardsRouter);
  app.use('/api/columns', columnsRouter);
  app.use('/api/cards', cardsRouter);
  // Всегда последними: сначала «не найдено», потом общий обработчик ошибок
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
