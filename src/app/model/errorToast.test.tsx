import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { CreateBoardForm } from '@features/create-board';
import { Toaster } from '@shared/ui';
import { setupStore } from './store';

const server = setupServer();
beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderForm() {
  render(
    <Provider store={setupStore()}>
      <MemoryRouter>
        <CreateBoardForm />
        <Toaster />
      </MemoryRouter>
    </Provider>
  );
  return userEvent.setup();
}

describe('errorToastMiddleware', () => {
  it('показывает тост с текстом ошибки сервера, если мутация упала', async () => {
    server.use(
      http.post('*/api/boards', () =>
        HttpResponse.json({ error: 'Validation failed' }, { status: 400 })
      )
    );
    const user = renderForm();

    await user.type(screen.getByLabelText('Название новой доски'), 'Х');
    await user.click(screen.getByRole('button', { name: /Создать/ }));

    expect(await screen.findByText('Validation failed')).toBeInTheDocument();
  });

  it('понятно сообщает, если сервер недоступен', async () => {
    server.use(http.post('*/api/boards', () => HttpResponse.error()));
    const user = renderForm();

    await user.type(screen.getByLabelText('Название новой доски'), 'Х');
    await user.click(screen.getByRole('button', { name: /Создать/ }));

    expect(await screen.findByText(/Нет связи с сервером/)).toBeInTheDocument();
  });

  it('при успехе тост об ошибке не появляется', async () => {
    server.use(
      http.post('*/api/boards', () =>
        HttpResponse.json(
          { id: 'x', title: 'Х', createdAt: '2026-10-01', columns: [] },
          { status: 201 }
        )
      )
    );
    const user = renderForm();

    await user.type(screen.getByLabelText('Название новой доски'), 'Х');
    await user.click(screen.getByRole('button', { name: /Создать/ }));

    expect(await screen.findByText('Доска «Х» создана')).toBeInTheDocument();
    expect(screen.queryByText(/Нет связи/)).not.toBeInTheDocument();
  });
});
