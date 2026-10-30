import { describe, expect, it } from 'vitest';
import type { Board } from '@entities/board';
import { dropCardOnTarget } from './dropCard';

// [a, b, c] | [d, e] | []
function makeBoard(): Board {
  const card = (title: string, columnId: string, position: number) => ({
    id: title,
    title,
    description: null,
    columnId,
    position,
    createdAt: '2026-01-01T00:00:00.000Z',
  });
  const column = (id: string, position: number, cards: string[]) => ({
    id,
    title: id,
    boardId: 'b',
    position,
    cards: cards.map((t, i) => card(t, id, i)),
  });
  return {
    id: 'b',
    title: 'Доска',
    createdAt: '2026-01-01T00:00:00.000Z',
    columns: [
      column('c0', 0, ['a', 'b', 'c']),
      column('c1', 1, ['d', 'e']),
      column('c2', 2, []),
    ],
  };
}

const layout = (board: Board) =>
  board.columns.map((c) => c.cards.map((k) => k.id));

describe('dropCardOnTarget', () => {
  it('внутри колонки карточка занимает место той, над которой её отпустили', () => {
    expect(
      layout(
        dropCardOnTarget(makeBoard(), 'a', {
          id: 'c',
          type: 'card',
          isBelow: false,
        })
      )[0]
    ).toEqual(['b', 'c', 'a']);
    expect(
      layout(
        dropCardOnTarget(makeBoard(), 'c', {
          id: 'a',
          type: 'card',
          isBelow: true,
        })
      )[0]
    ).toEqual(['c', 'a', 'b']);
  });

  it('над самой собой ничего не меняется', () => {
    const board = makeBoard();
    expect(
      dropCardOnTarget(board, 'b', { id: 'b', type: 'card', isBelow: false })
    ).toBe(board);
  });

  it('в другую колонку: над верхней половиной карточки вставляет перед ней', () => {
    const result = dropCardOnTarget(makeBoard(), 'a', {
      id: 'e',
      type: 'card',
      isBelow: false,
    });
    expect(layout(result)).toEqual([['b', 'c'], ['d', 'a', 'e'], []]);
  });

  it('в другую колонку: над нижней половиной вставляет после', () => {
    const result = dropCardOnTarget(makeBoard(), 'a', {
      id: 'e',
      type: 'card',
      isBelow: true,
    });
    expect(layout(result)).toEqual([['b', 'c'], ['d', 'e', 'a'], []]);
  });

  it('на колонку: в конец, в том числе в пустую', () => {
    expect(
      layout(
        dropCardOnTarget(makeBoard(), 'a', {
          id: 'c2',
          type: 'column',
          isBelow: false,
        })
      )
    ).toEqual([['b', 'c'], ['d', 'e'], ['a']]);
    expect(
      layout(
        dropCardOnTarget(makeBoard(), 'a', {
          id: 'c1',
          type: 'column',
          isBelow: false,
        })
      )[1]
    ).toEqual(['d', 'e', 'a']);
  });

  it('на свою же колонку ничего не меняется', () => {
    const board = makeBoard();
    expect(
      dropCardOnTarget(board, 'a', { id: 'c0', type: 'column', isBelow: false })
    ).toBe(board);
  });

  it('неизвестные id не ломают доску', () => {
    const board = makeBoard();
    expect(
      dropCardOnTarget(board, 'zzz', { id: 'a', type: 'card', isBelow: false })
    ).toBe(board);
    expect(
      dropCardOnTarget(board, 'a', { id: 'zzz', type: 'card', isBelow: false })
    ).toBe(board);
  });
});
