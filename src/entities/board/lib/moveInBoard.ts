import { clamp } from '@shared/lib';
import type { Board } from '../model/types';

function renumber<T extends { position: number }>(items: T[]): T[] {
  return items.map((item, index) =>
    item.position === index ? item : { ...item, position: index }
  );
}

export function moveCardInBoard(
  board: Board,
  cardId: string,
  columnId: string,
  position: number
): Board {
  const source = board.columns.find((c) =>
    c.cards.some((k) => k.id === cardId)
  );
  const target = board.columns.find((c) => c.id === columnId);
  if (!source || !target) return board;

  const card = source.cards.find((k) => k.id === cardId)!;
  const sameColumn = source.id === target.id;

  const without = source.cards.filter((k) => k.id !== cardId);
  const targetCards = sameColumn ? without : target.cards.slice();

  const index = clamp(
    position,
    sameColumn ? without.length : targetCards.length
  );
  const inserted = [
    ...targetCards.slice(0, index),
    { ...card, columnId: target.id },
    ...targetCards.slice(index),
  ];

  return {
    ...board,
    columns: board.columns.map((column) => {
      if (column.id === target.id) {
        return { ...column, cards: renumber(inserted) };
      }
      if (column.id === source.id) {
        return { ...column, cards: renumber(without) };
      }
      return column;
    }),
  };
}

export function moveColumnInBoard(
  board: Board,
  columnId: string,
  position: number
): Board {
  const from = board.columns.findIndex((c) => c.id === columnId);
  if (from === -1) return board;

  const rest = board.columns.filter((c) => c.id !== columnId);
  const to = clamp(position, rest.length);
  const moved = board.columns[from]!;
  const next = [...rest.slice(0, to), moved, ...rest.slice(to)];
  return { ...board, columns: renumber(next) };
}
