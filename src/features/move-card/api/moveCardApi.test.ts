import { configureStore } from '@reduxjs/toolkit';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { baseApi } from '@shared/api';
import { boardApi, type Board } from '@entities/board';
import { moveCardApi } from './moveCardApi';

const card = (id: string, columnId: string, position: number) => ({
  id,
  title: id,
  description: null,
  columnId,
  position,
  createdAt: '2026-01-01T00:00:00.000Z',
});

const board: Board = {
  id: 'b1',
  title: 'Доска',
  createdAt: '2026-01-01T00:00:00.000Z',
  columns: [
    {
      id: 'c0',
      title: 'A',
      boardId: 'b1',
      position: 0,
      cards: [card('x', 'c0', 0), card('y', 'c0', 1)],
    },
    { id: 'c1', title: 'B', boardId: 'b1', position: 1, cards: [] },
  ],
};

const server = setupServer(
  http.get('*/api/boards/b1', () => HttpResponse.json(board))
);
beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
afterEach(() =>
  server.resetHandlers(
    http.get('*/api/boards/b1', () => HttpResponse.json(board))
  )
);
afterAll(() => server.close());

function setup() {
  return configureStore({
    reducer: { [baseApi.reducerPath]: baseApi.reducer },
    middleware: (d) => d().concat(baseApi.middleware),
  });
}

const layout = (store: ReturnType<typeof setup>) =>
  boardApi.endpoints.getBoard
    .select('b1')(store.getState())
    .data?.columns.map((c) => c.cards.map((k) => k.id));

describe('moveCard (оптимистичное обновление)', () => {
  it('меняет кэш сразу, не дожидаясь ответа сервера', async () => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => (release = resolve));
    server.use(
      http.patch('*/api/cards/x/move', async () => {
        await gate;
        return HttpResponse.json({});
      })
    );
    const store = setup();
    await store.dispatch(boardApi.endpoints.getBoard.initiate('b1'));

    const request = store.dispatch(
      moveCardApi.endpoints.moveCard.initiate({
        boardId: 'b1',
        cardId: 'x',
        columnId: 'c1',
        position: 0,
      })
    );
    // Сервер ещё не ответил, а карточка уже в новой колонке
    expect(layout(store)).toEqual([['y'], ['x']]);

    release();
    await request;
    expect(layout(store)).toEqual([['y'], ['x']]);
  });

  it('при ошибке сервера возвращает прежний порядок', async () => {
    server.use(
      http.patch('*/api/cards/x/move', () =>
        HttpResponse.json({ error: 'Boom' }, { status: 500 })
      )
    );
    const store = setup();
    await store.dispatch(boardApi.endpoints.getBoard.initiate('b1'));

    const result = await store.dispatch(
      moveCardApi.endpoints.moveCard.initiate({
        boardId: 'b1',
        cardId: 'x',
        columnId: 'c1',
        position: 0,
      })
    );

    expect(result.error).toBeDefined();
    await new Promise((r) => setTimeout(r, 50));
    expect(layout(store)).toEqual([['x', 'y'], []]);
  });
});
