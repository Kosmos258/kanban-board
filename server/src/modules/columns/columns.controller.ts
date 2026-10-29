import type { Request, Response } from 'express';
import { boardParamsSchema } from '../boards/boards.schemas';
import {
  columnParamsSchema,
  createColumnSchema,
  moveColumnSchema,
  updateColumnSchema,
} from './columns.schemas';
import * as columnsService from './columns.service';

export async function createColumn(req: Request, res: Response) {
  const { boardId } = boardParamsSchema.parse(req.params);
  const input = createColumnSchema.parse(req.body);
  res.status(201).json(await columnsService.createColumn(boardId, input));
}

export async function updateColumn(req: Request, res: Response) {
  const { columnId } = columnParamsSchema.parse(req.params);
  const input = updateColumnSchema.parse(req.body);
  res.json(await columnsService.updateColumn(columnId, input));
}

export async function deleteColumn(req: Request, res: Response) {
  const { columnId } = columnParamsSchema.parse(req.params);
  await columnsService.deleteColumn(columnId);
  res.status(204).end();
}

export async function moveColumn(req: Request, res: Response) {
  const { columnId } = columnParamsSchema.parse(req.params);
  const input = moveColumnSchema.parse(req.body);
  res.json(await columnsService.moveColumn(columnId, input));
}
