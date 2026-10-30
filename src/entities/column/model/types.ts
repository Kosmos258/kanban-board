import type { Card } from '@entities/card/@x/column';

export interface Column {
  id: string;
  title: string;
  boardId: string;
  position: number;
  cards: Card[];
}
