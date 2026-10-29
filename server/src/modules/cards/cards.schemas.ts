import { z } from 'zod';
import { idSchema, positionSchema, titleSchema } from '../../lib/schemas';

export const cardParamsSchema = z.strictObject({ cardId: idSchema });

const descriptionSchema = z.string().max(5000, 'Не длиннее 5000 символов');

export const createCardSchema = z.strictObject({
  title: titleSchema(200),
  description: descriptionSchema.nullish(),
});

export const updateCardSchema = z
  .strictObject({
    title: titleSchema(200).optional(),
    description: descriptionSchema.nullable().optional(),
  })
  .refine((v) => v.title !== undefined || v.description !== undefined, {
    message: 'Нужно передать title или description',
  });

export const moveCardSchema = z.strictObject({
  columnId: idSchema,
  position: positionSchema,
});

export type CreateCardInput = z.infer<typeof createCardSchema>;
export type UpdateCardInput = z.infer<typeof updateCardSchema>;
export type MoveCardInput = z.infer<typeof moveCardSchema>;
