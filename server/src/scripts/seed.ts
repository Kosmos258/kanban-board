import { pool, prisma } from '../lib/prisma';

const DEMO_TITLE = 'Демо-доска';

// Повторный запуск безопасен: если демо-доска уже есть, ничего не создаём
async function main() {
  const existing = await prisma.board.findFirst({
    where: { title: DEMO_TITLE },
  });
  if (existing) {
    console.log('Демо-доска уже существует, пропускаю');
    return;
  }

  await prisma.board.create({
    data: {
      title: DEMO_TITLE,
      columns: {
        create: [
          {
            title: 'К выполнению',
            position: 0,
            cards: {
              create: [
                {
                  title: 'Продумать структуру проекта',
                  description: 'Слои FSD и API',
                  position: 0,
                },
                { title: 'Подготовить макеты', position: 1 },
              ],
            },
          },
          {
            title: 'В работе',
            position: 1,
            cards: { create: [{ title: 'Написать бэкенд', position: 0 }] },
          },
          {
            title: 'Готово',
            position: 2,
            cards: { create: [{ title: 'Настроить CI', position: 0 }] },
          },
        ],
      },
    },
  });
  console.log('Демо-доска создана');
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
