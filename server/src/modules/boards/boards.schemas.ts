import { z } from 'zod';
import { idSchema, titleSchema } from '../../lib/schemas';

export const boardParamsSchema = z.strictObject({ boardId: idSchema });

export const createBoardSchema = z.strictObject({ title: titleSchema(100) });

export const updateBoardSchema = z.strictObject({ title: titleSchema(100) });

// Тип выводится из схемы, поэтому они не могут разойтись
export type CreateBoardInput = z.infer<typeof createBoardSchema>;
export type UpdateBoardInput = z.infer<typeof updateBoardSchema>;
