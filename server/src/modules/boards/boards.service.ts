import { prisma } from '../../lib/prisma';
import type { CreateBoardInput } from './boards.schemas';

export function listBoards() {
  return prisma.board.findMany({ orderBy: { createdAt: 'desc' } });
}

export function createBoard(input: CreateBoardInput) {
  return prisma.board.create({ data: { title: input.title } });
}
