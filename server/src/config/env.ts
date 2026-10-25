import 'dotenv/config';

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Не задана переменная окружения ${name} (см. server/.env.example)`
    );
  }
  return value;
}

const port = Number(process.env.PORT ?? 5000);
if (!Number.isInteger(port) || port <= 0) {
  throw new Error(
    `PORT должен быть положительным целым числом, получено: ${process.env.PORT}`
  );
}

export const env = {
  port,
  databaseUrl: required('DATABASE_URL'),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
};
