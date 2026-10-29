import { z } from 'zod';

export const createBoardSchema = z.object({
  title: z.string().trim().min(1, 'Название не может быть пустым').max(100),
});

// Тип выводится из схемы, поэтому они не могут разойтись
export type CreateBoardInput = z.infer<typeof createBoardSchema>;
