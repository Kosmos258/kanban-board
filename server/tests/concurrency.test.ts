import { beforeEach, afterAll, describe, expect, it } from 'vitest';
import { pool, prisma } from '../src/lib/prisma';
import {
  api,
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

describe('параллельные операции (withBoardLock)', () => {
  it('60 параллельных перемещений карточек не ломают нумерацию', async () => {
    const board = await createBoard();
    const cols = board.columns.map((c) => c.id);
    const ids: string[] = [];
    for (let i = 0; i < 12; i++) {
      ids.push((await createCard(cols[i % 3]!, `c${i}`)).id);
    }

    const jobs = Array.from({ length: 60 }, (_, i) =>
      api()
        .patch(`/api/cards/${ids[i % ids.length]}/move`)
        .send({ columnId: cols[(i * 7) % 3], position: i % 5 })
        .then((res) => res.status)
    );
    const statuses = await Promise.all(jobs);
    expect(statuses.every((s) => s === 200)).toBe(true);

    await expectContiguous(board.id);
    expect(await prisma.card.count()).toBe(12);
  });

  it('параллельное создание карточек даёт уникальные позиции', async () => {
    const board = await createBoard();
    const col = board.columns[0]!.id;
    await Promise.all(
      Array.from({ length: 20 }, (_, i) =>
        api()
          .post(`/api/columns/${col}/cards`)
          .send({ title: `c${i}` })
          .expect(201)
      )
    );
    await expectContiguous(board.id);
    expect(await prisma.card.count()).toBe(20);
  });

  it('параллельные перемещения колонок и удаления остаются согласованными', async () => {
    const board = await createBoard();
    for (let i = 0; i < 5; i++) {
      await api()
        .post(`/api/boards/${board.id}/columns`)
        .send({ title: `k${i}` })
        .expect(201);
    }
    const res = await api().get(`/api/boards/${board.id}`);
    const ids: string[] = res.body.columns.map((c: { id: string }) => c.id);

    await Promise.all([
      ...ids.slice(0, 6).map((id, i) =>
        api()
          .patch(`/api/columns/${id}/move`)
          .send({ position: (i * 3) % 8 })
      ),
      api().delete(`/api/columns/${ids[7]}`),
      api().delete(`/api/columns/${ids[6]}`),
    ]);
    await expectContiguous(board.id);
  });
});
