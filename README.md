# Kanban Board

Канбан-доска: колонки с карточками, перетаскивание карточек между колонками.
Учебный проект, цель которого отработать архитектуру fullstack-приложения:
структуру фронтенда по Feature-Sliced Design, REST API на Node.js и
PostgreSQL в Docker.

## Статус

Проект в разработке.

- Фронтенд: колонки и карточки, добавление карточек, drag and drop между колонками.
  Состояние пока хранится в памяти (Redux Toolkit).
- Бэкенд: каркас Express + Prisma, схема БД (Board, Column, Card) и первая миграция.
  Работает проверка `GET /api/health`, CRUD-эндпоинтов пока нет.
- Дальше: API для досок, колонок и карточек, подключение фронтенда к API
  (RTK Query), тесты, запуск всего проекта одной командой через Docker.

## Стек

| Слой     | Технологии                                                        |
| -------- | ----------------------------------------------------------------- |
| Frontend | React 19, TypeScript, Vite, Redux Toolkit, dnd-kit, SCSS          |
| Backend  | Node.js, Express 5, TypeScript, Prisma 7 (adapter-pg)             |
| База     | PostgreSQL 16 в Docker                                            |
| Качество | ESLint, Prettier, Husky + lint-staged, GitHub Actions, Dependabot |

## Запуск для разработки

Нужны Node.js (версия из `.nvmrc`) и Docker Desktop.

**1. Переменные окружения**

```bash
cp .env.example .env                # задай POSTGRES_PASSWORD
cp server/.env.example server/.env  # пароль в DATABASE_URL должен совпадать
```

**2. База данных**

```bash
docker compose up -d
```

**3. Сервер** (в новом терминале)

```bash
cd server
npm install
npm run generate     # генерирует Prisma-клиент
npm run migrate:dev  # применяет миграции
npm run dev          # http://localhost:5000/api/health
```

**4. Фронтенд** (в корне проекта)

```bash
npm install
npm run dev          # http://localhost:5173
```

## Скрипты

В корне (фронтенд): `dev`, `build`, `lint`, `format`, `format:check`.
В `server/`: `dev`, `typecheck`, `generate`, `migrate:dev`, `migrate:deploy`.

## Структура фронтенда

Проект организован по [Feature-Sliced Design](https://feature-sliced.design/):

```
src/
  app/        # провайдеры, стор
  entities/   # card, column, board: модели и UI-представление
  features/   # пользовательские сценарии (например, add-card)
```

## Структура бэкенда

```
server/
  prisma/       # schema.prisma и миграции
  src/
    config/     # чтение переменных окружения
    lib/        # клиент Prisma
    app.ts      # сборка Express-приложения
    index.ts    # запуск сервера
```

`server/src/generated` (клиент Prisma) в git не хранится, он создаётся командой
`npm run generate`.
