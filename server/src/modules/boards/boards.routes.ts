import { Router } from 'express';
import * as boardsController from './boards.controller';

export const boardsRouter = Router();

boardsRouter.get('/', boardsController.listBoards);
boardsRouter.post('/', boardsController.createBoard);
