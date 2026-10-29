import { createApp } from './app';
import { env } from './config/env';
import { pool, prisma } from './lib/prisma';

const server = createApp().listen(env.port, () => {
  console.log(`Server is running on http://localhost:${env.port}`);
});

// Корректное завершение: дожидаемся текущих запросов и закрываем соединения с базой
let shuttingDown = false;
async function shutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`${signal}: останавливаю сервер`);
  server.close(async () => {
    await prisma.$disconnect();
    await pool.end();
    process.exit(0);
  });
  // Если что-то зависло, не ждём бесконечно
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
