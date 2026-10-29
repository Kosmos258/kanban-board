import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { env } from '../config/env';

// Пул соединений с таймаутами: если база недоступна, запрос не висит вечно
export const pool = new pg.Pool({
  connectionString: env.databaseUrl,
  max: 10,
  connectionTimeoutMillis: 5_000,
  idleTimeoutMillis: 30_000,
});
const adapter = new PrismaPg(pool);

// Единый клиент на всё приложение
export const prisma = new PrismaClient({ adapter });
