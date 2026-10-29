import { ApiError } from '../../lib/ApiError';
import { clamp, withBoardLock } from '../../lib/db';
import { prisma } from '../../lib/prisma';
import type {
  CreateColumnInput,
  MoveColumnInput,
  UpdateColumnInput,
} from './columns.schemas';

// Находим доску колонки. Сам результат может устареть к моменту блокировки,
// поэтому внутри транзакции колонка читается заново
async function findBoardId(columnId: string): Promise<string> {
  const column = await prisma.column.findUnique({
    where: { id: columnId },
    select: { boardId: true },
  });
  if (!column) throw new ApiError(404, 'Колонка не найдена');
  return column.boardId;
}

export function createColumn(boardId: string, input: CreateColumnInput) {
  return withBoardLock(boardId, async (tx) => {
    const count = await tx.column.count({ where: { boardId } });
    return tx.column.create({
      data: { boardId, title: input.title, position: count },
      include: { cards: true },
    });
  });
}

export async function updateColumn(columnId: string, input: UpdateColumnInput) {
  const result = await prisma.column.updateMany({
    where: { id: columnId },
    data: { title: input.title },
  });
  if (result.count === 0) throw new ApiError(404, 'Колонка не найдена');
  return prisma.column.findUniqueOrThrow({
    where: { id: columnId },
    include: { cards: { orderBy: { position: 'asc' } } },
  });
}

export async function deleteColumn(columnId: string) {
  const boardId = await findBoardId(columnId);
  await withBoardLock(boardId, async (tx) => {
    const column = await tx.column.findUnique({ where: { id: columnId } });
    if (!column) throw new ApiError(404, 'Колонка не найдена');
    await tx.column.delete({ where: { id: columnId } });
    await tx.column.updateMany({
      where: { boardId, position: { gt: column.position } },
      data: { position: { decrement: 1 } },
    });
  });
}

export async function moveColumn(columnId: string, input: MoveColumnInput) {
  const boardId = await findBoardId(columnId);
  return withBoardLock(boardId, async (tx) => {
    const column = await tx.column.findUnique({ where: { id: columnId } });
    if (!column) throw new ApiError(404, 'Колонка не найдена');

    const count = await tx.column.count({ where: { boardId } });
    const from = column.position;
    const to = clamp(input.position, count - 1);

    if (to > from) {
      await tx.column.updateMany({
        where: { boardId, position: { gt: from, lte: to } },
        data: { position: { decrement: 1 } },
      });
    } else if (to < from) {
      await tx.column.updateMany({
        where: { boardId, position: { gte: to, lt: from } },
        data: { position: { increment: 1 } },
      });
    }
    return tx.column.update({
      where: { id: columnId },
      data: { position: to },
    });
  });
}
