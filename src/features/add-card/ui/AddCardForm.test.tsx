import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { configureStore } from '@reduxjs/toolkit';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { Provider } from 'react-redux';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { baseApi } from '@shared/api';
import { AddCardForm } from './AddCardForm';

const server = setupServer();
beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function setup() {
  const store = configureStore({
    reducer: { [baseApi.reducerPath]: baseApi.reducer },
    middleware: (d) => d().concat(baseApi.middleware),
  });
  render(
    <Provider store={store}>
      <AddCardForm boardId="b1" columnId="c1" />
    </Provider>
  );
  return userEvent.setup();
}

describe('AddCardForm', () => {
  it('раскрывается, отправляет название и остаётся открытой для следующей карточки', async () => {
    const bodies: unknown[] = [];
    server.use(
      http.post('*/api/columns/c1/cards', async ({ request }) => {
        bodies.push(await request.json());
        return HttpResponse.json({}, { status: 201 });
      })
    );
    const user = setup();

    await user.click(screen.getByRole('button', { name: /Добавить карточку/ }));
    const input = screen.getByRole('textbox', { name: 'Название карточки' });
    await user.type(input, 'Первая{Enter}');
    await screen.findByDisplayValue('');
    await user.type(input, 'Вторая{Enter}');
    await screen.findByDisplayValue('');

    expect(bodies).toEqual([{ title: 'Первая' }, { title: 'Вторая' }]);
  });

  it('не отправляет пустое название, Escape закрывает форму', async () => {
    const user = setup();
    await user.click(screen.getByRole('button', { name: /Добавить карточку/ }));
    await user.type(screen.getByRole('textbox'), '   {Enter}');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Добавить карточку/ })
    ).toBeInTheDocument();
  });

  it('при ошибке сервера оставляет введённый текст', async () => {
    server.use(
      http.post('*/api/columns/c1/cards', () =>
        HttpResponse.json({ error: 'x' }, { status: 500 })
      )
    );
    const user = setup();
    await user.click(screen.getByRole('button', { name: /Добавить карточку/ }));
    await user.type(screen.getByRole('textbox'), 'Важное{Enter}');
    await new Promise((r) => setTimeout(r, 100));
    expect(screen.getByRole('textbox')).toHaveValue('Важное');
  });
});
