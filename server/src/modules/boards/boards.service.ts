import { ApiError } from '../../lib/ApiError';
import { prisma } from '../../lib/prisma';
import type { CreateBoardInput, UpdateBoardInput } from './boards.schemas';

const DEFAULT_COLUMNS = ['К выполнению', 'В работе', 'Готово'];

export async function listBoards() {
  const boards = await prisma.board.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      columns: { select: { _count: { select: { cards: true } } } },
    },
  });
  return boards.map((board) => ({
    id: board.id,
    title: board.title,
    createdAt: board.createdAt,
    columnsCount: board.columns.length,
    cardsCount: board.columns.reduce((sum, c) => sum + c._count.cards, 0),
  }));
}

export function createBoard(input: CreateBoardInput) {
  return prisma.board.create({
    data: {
      title: input.title,
      columns: {
        create: DEFAULT_COLUMNS.map((title, position) => ({ title, position })),
      },
    },
    include: { columns: { orderBy: { position: 'asc' } } },
  });
}

export async function getBoard(boardId: string) {
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    include: {
      columns: {
        orderBy: { position: 'asc' },
        include: { cards: { orderBy: { position: 'asc' } } },
      },
    },
  });
  if (!board) throw new ApiError(404, 'Доска не найдена');
  return board;
}

export async function updateBoard(boardId: string, input: UpdateBoardInput) {
  const result = await prisma.board.updateMany({
    where: { id: boardId },
    data: { title: input.title },
  });
  if (result.count === 0) throw new ApiError(404, 'Доска не найдена');
  return getBoard(boardId);
}

export async function deleteBoard(boardId: string) {
  const result = await prisma.board.deleteMany({ where: { id: boardId } });
  if (result.count === 0) throw new ApiError(404, 'Доска не найдена');
}
