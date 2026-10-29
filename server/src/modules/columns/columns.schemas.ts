import { z } from 'zod';
import { idSchema, positionSchema, titleSchema } from '../../lib/schemas';

export const columnParamsSchema = z.strictObject({ columnId: idSchema });

export const createColumnSchema = z.strictObject({ title: titleSchema(100) });
export const updateColumnSchema = z.strictObject({ title: titleSchema(100) });
export const moveColumnSchema = z.strictObject({ position: positionSchema });

export type CreateColumnInput = z.infer<typeof createColumnSchema>;
export type UpdateColumnInput = z.infer<typeof updateColumnSchema>;
export type MoveColumnInput = z.infer<typeof moveColumnSchema>;
