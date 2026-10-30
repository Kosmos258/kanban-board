import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Columns3, StickyNote } from 'lucide-react';
import type { BoardSummary } from '../model/types';
import styles from './BoardCard.module.scss';

interface BoardCardProps {
  board: BoardSummary;
  // Кнопки действий (например, удалить) подставляет страница
  actions?: ReactNode;
}

const dateFormat = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

function pluralize(n: number, one: string, few: string, many: string) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

export function BoardCard({ board, actions }: BoardCardProps) {
  return (
    <article className={styles.card}>
      {/* Вся карточка кликабельна через растянутую ссылку, а кнопки действий лежат поверх */}
      <h2 className={styles.title}>
        <Link to={`/boards/${board.id}`} className={styles.link}>
          {board.title}
        </Link>
      </h2>
      <div className={styles.stats}>
        <span>
          <Columns3 size={14} aria-hidden="true" />
          {board.columnsCount}{' '}
          {pluralize(board.columnsCount, 'колонка', 'колонки', 'колонок')}
        </span>
        <span>
          <StickyNote size={14} aria-hidden="true" />
          {board.cardsCount}{' '}
          {pluralize(board.cardsCount, 'карточка', 'карточки', 'карточек')}
        </span>
      </div>
      <time className={styles.date} dateTime={board.createdAt}>
        Создана {dateFormat.format(new Date(board.createdAt))}
      </time>
      {actions && <div className={styles.actions}>{actions}</div>}
    </article>
  );
}
