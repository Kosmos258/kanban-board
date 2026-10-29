import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/lib/prisma';

export const app = createApp();
export const api = () => request(app);

export async function resetDb() {
  await prisma.$executeRawUnsafe('TRUNCATE "Board" CASCADE');
}

export async function createBoard(title = 'Доска') {
  const res = await api().post('/api/boards').send({ title }).expect(201);
  return res.body as {
    id: string;
    columns: { id: string; title: string; position: number }[];
  };
}

export async function createCard(columnId: string, title: string) {
  const res = await api()
    .post(`/api/columns/${columnId}/cards`)
    .send({ title })
    .expect(201);
  return res.body as { id: string; columnId: string; position: number };
}

// Состояние доски как простой массив названий: [[карточки 1-й колонки], [2-й], ...]
export async function layout(boardId: string): Promise<string[][]> {
  const res = await api().get(`/api/boards/${boardId}`).expect(200);
  return res.body.columns.map((c: { cards: { title: string }[] }) =>
    c.cards.map((card) => card.title)
  );
}

export async function columnTitles(boardId: string): Promise<string[]> {
  const res = await api().get(`/api/boards/${boardId}`).expect(200);
  return res.body.columns.map((c: { title: string }) => c.title);
}

// Проверка инварианта: позиции идут 0..n-1 без дыр и повторов
export async function expectContiguous(boardId: string) {
  const res = await api().get(`/api/boards/${boardId}`).expect(200);
  const cols = res.body.columns as {
    position: number;
    cards: { position: number }[];
  }[];
  cols.forEach((c, i) => {
    if (c.position !== i)
      throw new Error(`Колонка ${i} имеет position ${c.position}`);
    c.cards.forEach((card, j) => {
      if (card.position !== j)
        throw new Error(
          `Карточка ${j} в колонке ${i} имеет position ${card.position}`
        );
    });
  });
}
