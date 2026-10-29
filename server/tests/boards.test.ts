import { beforeEach, afterAll, describe, expect, it } from 'vitest';
import { pool, prisma } from '../src/lib/prisma';
import { api, columnTitles, createBoard, createCard, resetDb } from './helpers';

beforeEach(resetDb);
afterAll(async () => {
  await prisma.$disconnect();
  await pool.end();
});

describe('health', () => {
  it('GET /api/health', async () => {
    const res = await api().get('/api/health').expect(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('GET /api/health/ready проверяет базу', async () => {
    const res = await api().get('/api/health/ready').expect(200);
    expect(res.body).toEqual({ status: 'ready' });
  });
});

describe('boards', () => {
  it('создаёт доску сразу с тремя колонками', async () => {
    const board = await createBoard('Проект');
    expect(await columnTitles(board.id)).toEqual([
      'К выполнению',
      'В работе',
      'Готово',
    ]);
  });

  it('обрезает пробелы в названии', async () => {
    const res = await api()
      .post('/api/boards')
      .send({ title: '  Проект  ' })
      .expect(201);
    expect(res.body.title).toBe('Проект');
  });

  it('список содержит счётчики, новые доски первыми', async () => {
    const a = await createBoard('Первая');
    const b = await createBoard('Вторая');
    await createCard(a.columns[0]!.id, 'x');
    await createCard(a.columns[1]!.id, 'y');

    const res = await api().get('/api/boards').expect(200);
    expect(res.body.map((x: { title: string }) => x.title)).toEqual([
      'Вторая',
      'Первая',
    ]);
    const first = res.body.find((x: { id: string }) => x.id === a.id);
    expect(first).toMatchObject({ columnsCount: 3, cardsCount: 2 });
    expect(res.body.find((x: { id: string }) => x.id === b.id)).toMatchObject({
      cardsCount: 0,
    });
  });

  it('переименовывает доску', async () => {
    const board = await createBoard('Старое');
    const res = await api()
      .patch(`/api/boards/${board.id}`)
      .send({ title: 'Новое' })
      .expect(200);
    expect(res.body.title).toBe('Новое');
  });

  it('удаляет доску вместе с колонками и карточками', async () => {
    const board = await createBoard();
    await createCard(board.columns[0]!.id, 'x');
    await api().delete(`/api/boards/${board.id}`).expect(204);
    await api().get(`/api/boards/${board.id}`).expect(404);
    expect(await prisma.column.count()).toBe(0);
    expect(await prisma.card.count()).toBe(0);
  });

  it('404 для несуществующей доски', async () => {
    const id = '00000000-0000-4000-8000-000000000000';
    await api().get(`/api/boards/${id}`).expect(404);
    await api().patch(`/api/boards/${id}`).send({ title: 'x' }).expect(404);
    await api().delete(`/api/boards/${id}`).expect(404);
    await api()
      .post(`/api/boards/${id}/columns`)
      .send({ title: 'x' })
      .expect(404);
  });
});

describe('валидация и ошибки', () => {
  it('400 на пустое и слишком длинное название', async () => {
    await api().post('/api/boards').send({ title: '   ' }).expect(400);
    await api()
      .post('/api/boards')
      .send({ title: 'x'.repeat(101) })
      .expect(400);
    await api().post('/api/boards').send({}).expect(400);
  });

  it('400 на лишние поля (strictObject)', async () => {
    await api().post('/api/boards').send({ title: 'x', hack: 1 }).expect(400);
  });

  it('400 на некорректный id', async () => {
    await api().get('/api/boards/not-a-uuid').expect(400);
  });

  it('400 на битый JSON', async () => {
    const res = await api()
      .post('/api/boards')
      .set('Content-Type', 'application/json')
      .send('{"title": ')
      .expect(400);
    expect(res.body.error).toBeTruthy();
  });

  it('413 на слишком большое тело', async () => {
    await api()
      .post('/api/boards')
      .send({ title: 'x', pad: 'a'.repeat(200_000) })
      .expect(413);
  });

  it('404 на неизвестный маршрут', async () => {
    const res = await api().get('/api/nope').expect(404);
    expect(res.body).toEqual({ error: 'Not found' });
  });

  it('заголовки безопасности helmet', async () => {
    const res = await api().get('/api/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });
});
