import { beforeEach, afterAll, describe, expect, it } from 'vitest';
import { pool, prisma } from '../src/lib/prisma';
import {
  api,
  createBoard,
  createCard,
  expectContiguous,
  layout,
  resetDb,
} from './helpers';

beforeEach(resetDb);
afterAll(async () => {
  await prisma.$disconnect();
  await pool.end();
});

// Доска: [a, b, c] | [d] | []
async function seeded() {
  const board = await createBoard();
  const [c0, c1, c2] = board.columns.map((c) => c.id) as [
    string,
    string,
    string,
  ];
  const cards: Record<string, string> = {};
  for (const t of ['a', 'b', 'c']) cards[t] = (await createCard(c0, t)).id;
  cards.d = (await createCard(c1, 'd')).id;
  return { board, cols: [c0, c1, c2], cards };
}

describe('cards', () => {
  it('создаёт карточки в конец колонки', async () => {
    const { board } = await seeded();
    expect(await layout(board.id)).toEqual([['a', 'b', 'c'], ['d'], []]);
    await expectContiguous(board.id);
  });

  it('создаёт карточку с описанием и обновляет её', async () => {
    const board = await createBoard();
    const res = await api()
      .post(`/api/columns/${board.columns[0]!.id}/cards`)
      .send({ title: 'T', description: 'D' })
      .expect(201);
    expect(res.body.description).toBe('D');

    const patched = await api()
      .patch(`/api/cards/${res.body.id}`)
      .send({ description: null })
      .expect(200);
    expect(patched.body).toMatchObject({ title: 'T', description: null });

    const renamed = await api()
      .patch(`/api/cards/${res.body.id}`)
      .send({ title: 'T2' })
      .expect(200);
    expect(renamed.body.title).toBe('T2');
  });

  it('400: пустой PATCH, длинное название, лишние поля', async () => {
    const { cards, cols } = await seeded();
    await api().patch(`/api/cards/${cards.a}`).send({}).expect(400);
    await api()
      .patch(`/api/cards/${cards.a}`)
      .send({ title: 'x'.repeat(201) })
      .expect(400);
    await api()
      .patch(`/api/cards/${cards.a}`)
      .send({ position: 3 })
      .expect(400);
    await api()
      .post(`/api/columns/${cols[0]}/cards`)
      .send({ title: ' ' })
      .expect(400);
  });

  it('удаление карточки закрывает дыру', async () => {
    const { board, cards } = await seeded();
    await api().delete(`/api/cards/${cards.b}`).expect(204);
    expect(await layout(board.id)).toEqual([['a', 'c'], ['d'], []]);
    await expectContiguous(board.id);
  });

  // Внутри колонки [a, b, c]: откуда, куда, результат
  const within: [number, number, string[]][] = [
    [0, 0, ['a', 'b', 'c']],
    [0, 2, ['b', 'c', 'a']],
    [2, 0, ['c', 'a', 'b']],
    [0, 1, ['b', 'a', 'c']],
    [1, 0, ['b', 'a', 'c']],
    [1, 2, ['a', 'c', 'b']],
    [0, 999, ['b', 'c', 'a']],
  ];

  it.each(within)(
    'внутри колонки: позиция %i → %i',
    async (from, to, expected) => {
      const { board, cols } = await seeded();
      const res = await api().get(`/api/boards/${board.id}`);
      const id = res.body.columns[0].cards[from].id;
      await api()
        .patch(`/api/cards/${id}/move`)
        .send({ columnId: cols[0], position: to })
        .expect(200);
      expect((await layout(board.id))[0]).toEqual(expected);
      await expectContiguous(board.id);
    }
  );

  // В другую колонку: карточка 'a' уходит в колонку 1 ([d]) или 2 ([])
  const across: [number, number, string[][]][] = [
    [1, 0, [['b', 'c'], ['a', 'd'], []]],
    [1, 1, [['b', 'c'], ['d', 'a'], []]],
    [1, 999, [['b', 'c'], ['d', 'a'], []]],
    [2, 0, [['b', 'c'], ['d'], ['a']]],
    [2, 5, [['b', 'c'], ['d'], ['a']]],
  ];

  it.each(across)(
    'в другую колонку %i, позиция %i',
    async (col, pos, expected) => {
      const { board, cols, cards } = await seeded();
      await api()
        .patch(`/api/cards/${cards.a}/move`)
        .send({ columnId: cols[col], position: pos })
        .expect(200);
      expect(await layout(board.id)).toEqual(expected);
      await expectContiguous(board.id);
    }
  );

  it('карточку нельзя переместить на другую доску', async () => {
    const { cards } = await seeded();
    const other = await createBoard('Другая');
    const res = await api()
      .patch(`/api/cards/${cards.a}/move`)
      .send({ columnId: other.columns[0]!.id, position: 0 })
      .expect(400);
    expect(res.body.error).toMatch(/другую доску/);
  });

  it('404 на несуществующую карточку или целевую колонку', async () => {
    const { cards } = await seeded();
    const id = '00000000-0000-4000-8000-000000000000';
    await api().patch(`/api/cards/${id}`).send({ title: 'x' }).expect(404);
    await api().delete(`/api/cards/${id}`).expect(404);
    await api()
      .patch(`/api/cards/${id}/move`)
      .send({ columnId: id, position: 0 })
      .expect(404);
    await api()
      .patch(`/api/cards/${cards.a}/move`)
      .send({ columnId: id, position: 0 })
      .expect(404);
  });
});
