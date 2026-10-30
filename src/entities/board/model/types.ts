import type { Column } from '@entities/column/@x/board';

// Доска целиком: колонки и карточки уже в нужном порядке
export interface Board {
  id: string;
  title: string;
  createdAt: string;
  columns: Column[];
}

// Строка списка досок: без содержимого, только счётчики
export interface BoardSummary {
  id: string;
  title: string;
  createdAt: string;
  columnsCount: number;
  cardsCount: number;
}
