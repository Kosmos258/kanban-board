import { describe, expect, it } from 'vitest';
import type { Board } from '../model/types';
import { moveCardInBoard, moveColumnInBoard } from './moveInBoard';

// Доска из серверных тестов: [a, b, c] | [d] | []
function makeBoard(): Board {
  const card = (title: string, columnId: string, position: number) => ({
    id: title,
    title,
    description: null,
    columnId,
    position,
    createdAt: '2026-01-01T00:00:00.000Z',
  });
  return {
    id: 'board',
    title: 'Доска',
    createdAt: '2026-01-01T00:00:00.000Z',
    columns: [
      {
        id: 'c0',
        title: 'К выполнению',
        boardId: 'board',
        position: 0,
        cards: [card('a', 'c0', 0), card('b', 'c0', 1), card('c', 'c0', 2)],
      },
      {
        id: 'c1',
        title: 'В работе',
        boardId: 'board',
        position: 1,
        cards: [card('d', 'c1', 0)],
      },
      { id: 'c2', title: 'Готово', boardId: 'board', position: 2, cards: [] },
    ],
  };
}

const layout = (board: Board) =>
  board.columns.map((c) => c.cards.map((k) => k.id));

function expectContiguous(board: Board) {
  board.columns.forEach((column, i) => {
    expect(column.position).toBe(i);
    column.cards.forEach((card, j) => {
      expect(card.position).toBe(j);
      expect(card.columnId).toBe(column.id);
    });
  });
}

describe('moveCardInBoard', () => {
  const within: [string, number, string[]][] = [
    ['a', 0, ['a', 'b', 'c']],
    ['a', 2, ['b', 'c', 'a']],
    ['c', 0, ['c', 'a', 'b']],
    ['a', 1, ['b', 'a', 'c']],
    ['b', 0, ['b', 'a', 'c']],
    ['b', 2, ['a', 'c', 'b']],
    ['a', 999, ['b', 'c', 'a']],
    ['a', -5, ['a', 'b', 'c']],
  ];

  it.each(within)('внутри колонки: %s → позиция %i', (id, pos, expected) => {
    const result = moveCardInBoard(makeBoard(), id, 'c0', pos);
    expect(layout(result)[0]).toEqual(expected);
    expectContiguous(result);
  });

  const across: [string, number, string[][]][] = [
    ['c1', 0, [['b', 'c'], ['a', 'd'], []]],
    ['c1', 1, [['b', 'c'], ['d', 'a'], []]],
    ['c1', 999, [['b', 'c'], ['d', 'a'], []]],
    ['c2', 0, [['b', 'c'], ['d'], ['a']]],
    ['c2', 5, [['b', 'c'], ['d'], ['a']]],
  ];

  it.each(across)('в колонку %s, позиция %i', (columnId, pos, expected) => {
    const result = moveCardInBoard(makeBoard(), 'a', columnId, pos);
    expect(layout(result)).toEqual(expected);
    expectContiguous(result);
  });

  it('не меняет исходную доску', () => {
    const board = makeBoard();
    const snapshot = JSON.stringify(board);
    moveCardInBoard(board, 'a', 'c2', 0);
    expect(JSON.stringify(board)).toBe(snapshot);
  });

  it('неизвестная карточка или колонка: доска не меняется', () => {
    const board = makeBoard();
    expect(moveCardInBoard(board, 'zzz', 'c0', 0)).toBe(board);
    expect(moveCardInBoard(board, 'a', 'zzz', 0)).toBe(board);
  });
});

describe('moveColumnInBoard', () => {
  const titles = (board: Board) => board.columns.map((c) => c.id);

  const cases: [string, number, string[]][] = [
    ['c0', 0, ['c0', 'c1', 'c2']],
    ['c0', 2, ['c1', 'c2', 'c0']],
    ['c2', 0, ['c2', 'c0', 'c1']],
    ['c1', 2, ['c0', 'c2', 'c1']],
    ['c0', 999, ['c1', 'c2', 'c0']],
  ];

  it.each(cases)('колонка %s → позиция %i', (id, pos, expected) => {
    const result = moveColumnInBoard(makeBoard(), id, pos);
    expect(titles(result)).toEqual(expected);
    expectContiguous(result);
  });

  it('неизвестная колонка: доска не меняется', () => {
    const board = makeBoard();
    expect(moveColumnInBoard(board, 'zzz', 0)).toBe(board);
  });
});
