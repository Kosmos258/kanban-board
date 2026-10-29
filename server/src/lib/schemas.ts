import { z } from 'zod';

export const idSchema = z.uuid('Некорректный идентификатор');

export const positionSchema = z.number().int().min(0).max(1_000_000);

export function titleSchema(max: number) {
  return z
    .string()
    .trim()
    .min(1, 'Название не может быть пустым')
    .max(max, `Не длиннее ${max} символов`);
}
