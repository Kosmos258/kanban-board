import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../lib/ApiError';

// Ошибки самого Express и body-parser (например, битый JSON): это вина клиента, а не сервера
function isClientHttpError(
  err: unknown
): err is { status: number; message: string } {
  return (
    typeof err === 'object' &&
    err !== null &&
    'status' in err &&
    typeof err.status === 'number' &&
    err.status >= 400 &&
    err.status < 500 &&
    'expose' in err &&
    err.expose === true &&
    'message' in err &&
    typeof err.message === 'string'
  );
}

// Срабатывает, если ни один маршрут не подошёл
export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({ error: 'Not found' });
};

// Express узнаёт обработчик ошибок только по четырём параметрам, поэтому _next нужен, хоть мы им и не пользуемся
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({ error: 'Validation failed', issues: err.issues });
    return;
  }

  if (isClientHttpError(err)) {
    res.status(err.status).json({ error: err.message });
    return;
  }

  if (err instanceof ApiError) {
    res.status(err.status).json({ error: err.message });
    return;
  }

  // Неожиданная ошибка: подробности только в логе сервера, клиенту общий ответ
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
};
