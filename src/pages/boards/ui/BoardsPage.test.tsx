import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from '@shared/api';
import { toastReducer } from '@shared/ui';
import { BoardsPage } from './BoardsPage';

const summary = (id: string, title: string, cards = 0) => ({
  id,
  title,
  createdAt: '2026-10-01T10:00:00.000Z',
  columnsCount: 3,
  cardsCount: cards,
});

const server = setupServer();
beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderPage() {
  // Страница не знает про слой app, поэтому собираем минимальный стор сами
  const store = configureStore({
    reducer: { [baseApi.reducerPath]: baseApi.reducer, toast: toastReducer },
    middleware: (getDefault) => getDefault().concat(baseApi.middleware),
  });
  render(
    <Provider store={store}>
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<BoardsPage />} />
          <Route path="/boards/:id" element={<p>Открыта доска</p>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
  return userEvent.setup();
}

describe('BoardsPage', () => {
  it('показывает доски со счётчиками и склонением', async () => {
    server.use(
      http.get('*/api/boards', () =>
        HttpResponse.json([summary('1', 'Работа', 1), summary('2', 'Дом', 5)])
      )
    );
    renderPage();

    expect(await screen.findByRole('link', { name: 'Работа' })).toHaveAttribute(
      'href',
      '/boards/1'
    );
    expect(screen.getByText('1 карточка')).toBeInTheDocument();
    expect(screen.getByText('5 карточек')).toBeInTheDocument();
    expect(screen.getAllByText('3 колонки')).toHaveLength(2);
  });

  it('показывает пустое состояние', async () => {
    server.use(http.get('*/api/boards', () => HttpResponse.json([])));
    renderPage();
    expect(
      await screen.findByText('Пока нет ни одной доски')
    ).toBeInTheDocument();
  });

  it('при ошибке показывает сообщение и даёт повторить', async () => {
    let calls = 0;
    server.use(
      http.get('*/api/boards', () => {
        calls += 1;
        return calls === 1
          ? HttpResponse.json({ error: 'x' }, { status: 503 })
          : HttpResponse.json([summary('1', 'Работа')]);
      })
    );
    const user = renderPage();

    expect(
      await screen.findByText('Не удалось загрузить доски')
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Повторить/ }));
    expect(await screen.findByRole('link', { name: 'Работа' })).toBeVisible();
  });

  it('создаёт доску и переходит на неё', async () => {
    let body: unknown;
    server.use(
      http.get('*/api/boards', () => HttpResponse.json([])),
      http.post('*/api/boards', async ({ request }) => {
        body = await request.json();
        return HttpResponse.json(
          { id: 'new', title: 'Идеи', createdAt: '2026-10-01', columns: [] },
          { status: 201 }
        );
      })
    );
    const user = renderPage();

    await user.type(
      await screen.findByLabelText('Название новой доски'),
      '  Идеи  '
    );
    await user.click(screen.getByRole('button', { name: /Создать/ }));

    expect(await screen.findByText('Открыта доска')).toBeInTheDocument();
    expect(body).toEqual({ title: 'Идеи' });
  });

  it('не отправляет пустое название', async () => {
    server.use(http.get('*/api/boards', () => HttpResponse.json([])));
    const user = renderPage();

    await user.click(await screen.findByRole('button', { name: /Создать/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Введите название доски'
    );
  });

  it('удаляет доску после подтверждения', async () => {
    let deleted = '';
    let boards = [summary('1', 'Работа'), summary('2', 'Дом')];
    server.use(
      http.get('*/api/boards', () => HttpResponse.json(boards)),
      http.delete('*/api/boards/:id', ({ params }) => {
        deleted = String(params.id);
        boards = boards.filter((b) => b.id !== deleted);
        return new HttpResponse(null, { status: 204 });
      })
    );
    const user = renderPage();

    await user.click(
      await screen.findByRole('button', { name: 'Удалить доску «Работа»' })
    );
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Удалить' }));

    await waitFor(() => expect(deleted).toBe('1'));
    await waitFor(() =>
      expect(
        screen.queryByRole('link', { name: 'Работа' })
      ).not.toBeInTheDocument()
    );
    expect(screen.getByRole('link', { name: 'Дом' })).toBeInTheDocument();
  });

  it('отмена в диалоге ничего не удаляет', async () => {
    let called = false;
    server.use(
      http.get('*/api/boards', () =>
        HttpResponse.json([summary('1', 'Работа')])
      ),
      http.delete('*/api/boards/:id', () => {
        called = true;
        return new HttpResponse(null, { status: 204 });
      })
    );
    const user = renderPage();

    await user.click(
      await screen.findByRole('button', { name: 'Удалить доску «Работа»' })
    );
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Отмена' }));

    expect(called).toBe(false);
    expect(screen.getByRole('link', { name: 'Работа' })).toBeInTheDocument();
  });
});
