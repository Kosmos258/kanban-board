import { beforeEach, afterAll, describe, expect, it } from 'vitest';
import { pool, prisma } from '../src/lib/prisma';
import {
  api,
  columnTitles,
  createBoard,
  createCard,
  expectContiguous,
  resetDb,
} from './helpers';

beforeEach(resetDb);
afterAll(async () => {
  await prisma.$disconnect();
  await pool.end();
});

async function boardWithColumns() {
  const board = await createBoard();
  // Колонки: К выполнению, В работе, Готово, + A, B
  for (const title of ['A', 'B']) {
    await api()
      .post(`/api/boards/${board.id}/columns`)
      .send({ title })
      .expect(201);
  }
  return board;
}

describe('columns', () => {
  it('новая колонка добавляется в конец', async () => {
    const board = await createBoard();
    const res = await api()
      .post(`/api/boards/${board.id}/columns`)
      .send({ title: 'Ревью' })
      .expect(201);
    expect(res.body.position).toBe(3);
    expect((await columnTitles(board.id)).at(-1)).toBe('Ревью');
  });

  it('переименовывает колонку', async () => {
    const board = await createBoard();
    const id = board.columns[0]!.id;
    const res = await api()
      .patch(`/api/columns/${id}`)
      .send({ title: 'Идеи' })
      .expect(200);
    expect(res.body.title).toBe('Идеи');
  });

  it('удаление колонки закрывает дыру в позициях и удаляет карточки', async () => {
    const board = await createBoard();
    await createCard(board.columns[1]!.id, 'x');
    await api().delete(`/api/columns/${board.columns[1]!.id}`).expect(204);
    expect(await columnTitles(board.id)).toEqual(['К выполнению', 'Готово']);
    await expectContiguous(board.id);
    expect(await prisma.card.count()).toBe(0);
  });

  // [откуда, куда, ожидаемый порядок]. Названия: 0=К выполнению 1=В работе 2=Готово 3=A 4=B
  const cases: [number, number, string[]][] = [
    [0, 0, ['К выполнению', 'В работе', 'Готово', 'A', 'B']],
    [0, 2, ['В работе', 'Готово', 'К выполнению', 'A', 'B']],
    [0, 4, ['В работе', 'Готово', 'A', 'B', 'К выполнению']],
    [4, 0, ['B', 'К выполнению', 'В работе', 'Готово', 'A']],
    [3, 1, ['К выполнению', 'A', 'В работе', 'Готово', 'B']],
    [1, 3, ['К выполнению', 'Готово', 'A', 'В работе', 'B']],
    // Позиция вне диапазона приводится к допустимой
    [0, 999, ['В работе', 'Готово', 'A', 'B', 'К выполнению']],
  ];

  it.each(cases)('перемещение колонки %i → %i', async (from, to, expected) => {
    const board = await boardWithColumns();
    const res = await api().get(`/api/boards/${board.id}`);
    const id = res.body.columns[from].id;
    await api()
      .patch(`/api/columns/${id}/move`)
      .send({ position: to })
      .expect(200);
    expect(await columnTitles(board.id)).toEqual(expected);
    await expectContiguous(board.id);
  });

  it('400 на отрицательную и дробную позицию', async () => {
    const board = await createBoard();
    const id = board.columns[0]!.id;
    await api()
      .patch(`/api/columns/${id}/move`)
      .send({ position: -1 })
      .expect(400);
    await api()
      .patch(`/api/columns/${id}/move`)
      .send({ position: 1.5 })
      .expect(400);
  });

  it('404 для несуществующей колонки', async () => {
    const id = '00000000-0000-4000-8000-000000000000';
    await api().patch(`/api/columns/${id}`).send({ title: 'x' }).expect(404);
    await api().delete(`/api/columns/${id}`).expect(404);
    await api()
      .patch(`/api/columns/${id}/move`)
      .send({ position: 0 })
      .expect(404);
    await api()
      .post(`/api/columns/${id}/cards`)
      .send({ title: 'x' })
      .expect(404);
  });
});
