import type { Request, Response } from 'express';
import { createBoardSchema } from './boards.schemas';
import * as boardsService from './boards.service';

export async function listBoards(_req: Request, res: Response) {
  const boards = await boardsService.listBoards();
  res.json(boards);
}

export async function createBoard(req: Request, res: Response) {
  const input = createBoardSchema.parse(req.body);
  const board = await boardsService.createBoard(input);
  res.status(201).json(board);
}
