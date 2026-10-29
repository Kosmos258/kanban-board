import type { Prisma } from '../generated/prisma/client';
import { ApiError } from './ApiError';
import { prisma } from './prisma';

export type Tx = Prisma.TransactionClient;

// Любая операция, которая меняет порядок колонок или карточек, идёт через эту функцию.
// Она блокирует строку доски (SELECT ... FOR UPDATE): пока одна транзакция переставляет
// элементы, остальные для этой же доски ждут своей очереди. Без этого параллельные
// перемещения портят нумерацию position.
export async function withBoardLock<T>(
  boardId: string,
  fn: (tx: Tx) => Promise<T>
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRaw<
      { id: string }[]
    >`SELECT "id" FROM "Board" WHERE "id" = ${boardId} FOR UPDATE`;
    if (rows.length === 0) {
      throw new ApiError(404, 'Доска не найдена');
    }
    return fn(tx);
  });
}

// Приводит желаемую позицию к допустимой: от 0 до max включительно
export function clamp(position: number, max: number): number {
  return Math.min(Math.max(position, 0), Math.max(max, 0));
}
