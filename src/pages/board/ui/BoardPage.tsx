import { Link, useParams } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { useGetBoardQuery } from '@entities/board';
import { RenameBoard } from '@features/rename-board';
import { BoardCanvas } from '@widgets/board-canvas';
import { getErrorMessage } from '@shared/api';
import { Button, EmptyState, Skeleton } from '@shared/ui';
import styles from './BoardPage.module.scss';

export function BoardPage() {
  const { boardId = '' } = useParams();
  const { data: board, isLoading, error, refetch } = useGetBoardQuery(boardId);

  if (isLoading) {
    return (
      <div className={styles.page} aria-busy="true" aria-label="Загрузка доски">
        <Skeleton width={240} height={32} />
        <div className={styles.skeletons}>
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} width={300} height={220} />
          ))}
        </div>
      </div>
    );
  }

  if (error || !board) {
    const notFound =
      typeof error === 'object' &&
      error !== null &&
      'status' in error &&
      error.status === 404;
    return (
      <EmptyState
        title={notFound ? 'Доска не найдена' : 'Не удалось загрузить доску'}
        description={
          notFound ? 'Возможно, её уже удалили.' : getErrorMessage(error)
        }
        action={
          notFound ? (
            <Link to="/">
              <Button>К списку досок</Button>
            </Link>
          ) : (
            <Button onClick={() => refetch()}>Повторить</Button>
          )
        }
      />
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.top}>
        <Link to="/" className={styles.back} aria-label="Ко всем доскам">
          <ArrowLeft size={18} />
        </Link>
        <RenameBoard board={board} />
      </div>
      <div className={styles.canvas}>
        <BoardCanvas board={board} />
      </div>
    </div>
  );
}
