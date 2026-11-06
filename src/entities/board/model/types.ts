import type { Column } from '@entities/column/@x/board';

export interface Board {
  id: string;
  title: string;
  createdAt: string;
  columns: Column[];
}

export interface BoardSummary {
  id: string;
  title: string;
  createdAt: string;
  columnsCount: number;
  cardsCount: number;
}
