import { ApiError } from '../../lib/ApiError';
import { clamp, withBoardLock } from '../../lib/db';
import { prisma } from '../../lib/prisma';
import type {
  CreateCardInput,
  MoveCardInput,
  UpdateCardInput,
} from './cards.schemas';

async function boardIdOfColumn(columnId: string): Promise<string> {
  const column = await prisma.column.findUnique({
    where: { id: columnId },
    select: { boardId: true },
  });
  if (!column) throw new ApiError(404, 'Колонка не найдена');
  return column.boardId;
}

async function boardIdOfCard(cardId: string): Promise<string> {
  const card = await prisma.card.findUnique({
    where: { id: cardId },
    select: { column: { select: { boardId: true } } },
  });
  if (!card) throw new ApiError(404, 'Карточка не найдена');
  return card.column.boardId;
}

export async function createCard(columnId: string, input: CreateCardInput) {
  const boardId = await boardIdOfColumn(columnId);
  return withBoardLock(boardId, async (tx) => {
    const column = await tx.column.findUnique({ where: { id: columnId } });
    if (!column) throw new ApiError(404, 'Колонка не найдена');
    const count = await tx.card.count({ where: { columnId } });
    return tx.card.create({
      data: {
        columnId,
        title: input.title,
        description: input.description ?? null,
        position: count,
      },
    });
  });
}

export async function updateCard(cardId: string, input: UpdateCardInput) {
  const result = await prisma.card.updateMany({
    where: { id: cardId },
    data: {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.description !== undefined && {
        description: input.description,
      }),
    },
  });
  if (result.count === 0) throw new ApiError(404, 'Карточка не найдена');
  return prisma.card.findUniqueOrThrow({ where: { id: cardId } });
}

export async function deleteCard(cardId: string) {
  const boardId = await boardIdOfCard(cardId);
  await withBoardLock(boardId, async (tx) => {
    const card = await tx.card.findUnique({ where: { id: cardId } });
    if (!card) throw new ApiError(404, 'Карточка не найдена');
    await tx.card.delete({ where: { id: cardId } });
    await tx.card.updateMany({
      where: { columnId: card.columnId, position: { gt: card.position } },
      data: { position: { decrement: 1 } },
    });
  });
}

export async function moveCard(cardId: string, input: MoveCardInput) {
  const boardId = await boardIdOfCard(cardId);
  return withBoardLock(boardId, async (tx) => {
    const card = await tx.card.findUnique({ where: { id: cardId } });
    if (!card) throw new ApiError(404, 'Карточка не найдена');

    const target = await tx.column.findUnique({
      where: { id: input.columnId },
    });
    if (!target) throw new ApiError(404, 'Колонка не найдена');
    if (target.boardId !== boardId) {
      throw new ApiError(400, 'Нельзя переместить карточку на другую доску');
    }

    // Внутри одной колонки карточка уже занимает место, поэтому последний индекс на единицу меньше
    if (card.columnId === target.id) {
      const count = await tx.card.count({ where: { columnId: target.id } });
      const from = card.position;
      const to = clamp(input.position, count - 1);
      if (to > from) {
        await tx.card.updateMany({
          where: { columnId: target.id, position: { gt: from, lte: to } },
          data: { position: { decrement: 1 } },
        });
      } else if (to < from) {
        await tx.card.updateMany({
          where: { columnId: target.id, position: { gte: to, lt: from } },
          data: { position: { increment: 1 } },
        });
      }
      return tx.card.update({ where: { id: cardId }, data: { position: to } });
    }

    const targetCount = await tx.card.count({ where: { columnId: target.id } });
    const to = clamp(input.position, targetCount);
    // Закрываем дыру в старой колонке и освобождаем место в новой
    await tx.card.updateMany({
      where: { columnId: card.columnId, position: { gt: card.position } },
      data: { position: { decrement: 1 } },
    });
    await tx.card.updateMany({
      where: { columnId: target.id, position: { gte: to } },
      data: { position: { increment: 1 } },
    });
    return tx.card.update({
      where: { id: cardId },
      data: { columnId: target.id, position: to },
    });
  });
}
