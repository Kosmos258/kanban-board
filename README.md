# Kanban Board

Канбан-доска: колонки с карточками, перетаскивание карточек между колонками. Учебный проект, цель которого отработать архитектуру fullstack-приложения: структуру фронтенда по Feature-Sliced Design, REST API на Node.js и PostgreSQL, деплой в облако.

**Демо: [kanban-desk-567.netlify.app](https://kanban-desk-567.netlify.app/)**

> Бэкенд работает на бесплатном тарифе Render и засыпает без трафика. Первый запрос после простоя может идти около минуты, дальше всё работает быстро.

## Стек

| Слой        | Технологии                                                    |
| ----------- | ------------------------------------------------------------- |
| Frontend    | React 19, TypeScript, Vite, Redux Toolkit, dnd-kit, SCSS      |
| Backend     | Node.js, Express 5, TypeScript, Prisma 7 (adapter-pg), Zod    |
| База данных | PostgreSQL 16 (локально в Docker, в проде Neon)               |
| Тесты       | Vitest, Supertest                                             |
| Качество    | ESLint, Prettier, Husky + lint-staged, Steiger (проверка FSD) |
| CI/CD       | GitHub Actions, Dependabot                                    |
| Хостинг     | Netlify (фронтенд), Render (бэкенд), Neon (PostgreSQL)        |

## Как устроен деплой

```
Браузер
   │
   ▼
Netlify ── статика фронтенда (dist/)
   │
   │  запросы /api/*  (прокси через netlify.toml, CORS не нужен)
   ▼
Render ── Node.js + Express + Prisma (папка server/)
   │
   ▼
Neon ── PostgreSQL
```

- **Фронтенд** собирается на Netlify командой `npm run build` и отдаётся как статика.
- **Запросы к `/api/*`** Netlify проксирует на бэкенд (правило в `netlify.toml`). Для фронтенда это тот же относительный путь, что и в разработке, где его заменяет прокси Vite.
- **Бэкенд** на Render собирается из папки `server/`: генерируется клиент Prisma, компилируется TypeScript, применяются миграции (`prisma migrate deploy`), затем запускается `node dist/index.js`.
- **База данных** в Neon, подключение по `DATABASE_URL` (прямая строка без пулера, `sslmode=require`).

Автодеплой: каждый пуш в `main` пересобирает и Netlify, и Render.

## Запуск для разработки

Нужны Node.js (версия из `.nvmrc`) и Docker Desktop.

**1. Переменные окружения**

```
cp .env.example .env                # задай POSTGRES_PASSWORD
cp server/.env.example server/.env  # пароль в DATABASE_URL должен совпадать
```

**2. База данных**

```
docker compose up -d
```

**3. Сервер** (в новом терминале)

```
cd server
npm install
npm run generate     # генерирует Prisma-клиент
npm run migrate:dev  # применяет миграции
npm run dev          # http://localhost:5000/api/health
```

**4. Фронтенд** (в корне проекта)

```
npm install
npm run dev          # http://localhost:5173
```

В разработке запросы `/api` уходят на `http://localhost:5000` через прокси Vite (см. `vite.config.ts`).

## Скрипты

Корень (фронтенд): `dev`, `build`, `lint`, `format`, `format:check`.

`server/`:

| Скрипт           | Что делает                             |
| ---------------- | -------------------------------------- |
| `dev`            | запуск с автоперезагрузкой (tsx watch) |
| `build`          | сборка TypeScript в `dist/`            |
| `start`          | запуск собранного сервера              |
| `typecheck`      | проверка типов                         |
| `generate`       | генерация Prisma-клиента               |
| `migrate:dev`    | миграции в разработке                  |
| `migrate:deploy` | применение миграций в проде            |
| `seed`           | начальные данные (разработка)          |
| `seed:prod`      | начальные данные (из собранного кода)  |
| `test`           | тесты (Vitest)                         |

## Деплой своей копии

1. **Neon.** Создайте проект, возьмите строку подключения **без** пулера (в хосте не должно быть `-pooler`) и уберите `channel_binding=require`.
2. **Render.** New → Web Service, репозиторий, Root Directory `server`:
   - Build: `npm ci --include=dev && npm run generate && npm run build && npm run migrate:deploy`
   - Start: `npm start`
   - Переменные окружения: `DATABASE_URL` и остальные из `server/.env.example`.
3. **Netlify.** Подключите репозиторий, в `netlify.toml` укажите адрес сервиса Render в правиле `/api/*`.

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
    config/     # чтение и валидация переменных окружения
    lib/        # клиент Prisma
    app.ts      # сборка Express-приложения
    index.ts    # запуск сервера
```

`server/src/generated` (клиент Prisma) в git не хранится, он создаётся командой `npm run generate`.

## Модель данных

Схема БД: `Board` → `Column` → `Card` (Prisma, миграции в `server/prisma/migrations`).
