import type { Request, Response } from 'express';
import { columnParamsSchema } from '../columns/columns.schemas';
import {
  cardParamsSchema,
  createCardSchema,
  moveCardSchema,
  updateCardSchema,
} from './cards.schemas';
import * as cardsService from './cards.service';

export async function createCard(req: Request, res: Response) {
  const { columnId } = columnParamsSchema.parse(req.params);
  const input = createCardSchema.parse(req.body);
  res.status(201).json(await cardsService.createCard(columnId, input));
}

export async function updateCard(req: Request, res: Response) {
  const { cardId } = cardParamsSchema.parse(req.params);
  const input = updateCardSchema.parse(req.body);
  res.json(await cardsService.updateCard(cardId, input));
}

export async function deleteCard(req: Request, res: Response) {
  const { cardId } = cardParamsSchema.parse(req.params);
  await cardsService.deleteCard(cardId);
  res.status(204).end();
}

export async function moveCard(req: Request, res: Response) {
  const { cardId } = cardParamsSchema.parse(req.params);
  const input = moveCardSchema.parse(req.body);
  res.json(await cardsService.moveCard(cardId, input));
}
