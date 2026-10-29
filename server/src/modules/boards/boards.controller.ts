import type { Request, Response } from 'express';
import {
  boardParamsSchema,
  createBoardSchema,
  updateBoardSchema,
} from './boards.schemas';
import * as boardsService from './boards.service';

export async function listBoards(_req: Request, res: Response) {
  res.json(await boardsService.listBoards());
}

export async function createBoard(req: Request, res: Response) {
  const input = createBoardSchema.parse(req.body);
  res.status(201).json(await boardsService.createBoard(input));
}

export async function getBoard(req: Request, res: Response) {
  const { boardId } = boardParamsSchema.parse(req.params);
  res.json(await boardsService.getBoard(boardId));
}

export async function updateBoard(req: Request, res: Response) {
  const { boardId } = boardParamsSchema.parse(req.params);
  const input = updateBoardSchema.parse(req.body);
  res.json(await boardsService.updateBoard(boardId, input));
}

export async function deleteBoard(req: Request, res: Response) {
  const { boardId } = boardParamsSchema.parse(req.params);
  await boardsService.deleteBoard(boardId);
  res.status(204).end();
}
