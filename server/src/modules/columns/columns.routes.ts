import { Router } from 'express';
import * as columnsController from './columns.controller';
import * as cardsController from '../cards/cards.controller';

export const columnsRouter = Router();

columnsRouter.patch('/:columnId', columnsController.updateColumn);
columnsRouter.delete('/:columnId', columnsController.deleteColumn);
columnsRouter.patch('/:columnId/move', columnsController.moveColumn);
columnsRouter.post('/:columnId/cards', cardsController.createCard);
