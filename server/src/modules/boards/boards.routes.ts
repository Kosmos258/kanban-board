import { Router } from 'express';
import * as boardsController from './boards.controller';
import * as columnsController from '../columns/columns.controller';

export const boardsRouter = Router();

boardsRouter.get('/', boardsController.listBoards);
boardsRouter.post('/', boardsController.createBoard);
boardsRouter.get('/:boardId', boardsController.getBoard);
boardsRouter.patch('/:boardId', boardsController.updateBoard);
boardsRouter.delete('/:boardId', boardsController.deleteBoard);
boardsRouter.post('/:boardId/columns', columnsController.createColumn);
