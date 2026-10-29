import { Router } from 'express';
import * as cardsController from './cards.controller';

export const cardsRouter = Router();

cardsRouter.patch('/:cardId', cardsController.updateCard);
cardsRouter.delete('/:cardId', cardsController.deleteCard);
cardsRouter.patch('/:cardId/move', cardsController.moveCard);
