import { useNavigate } from 'react-router';
import { LayoutDashboard, RefreshCw } from 'lucide-react';
import { BoardCard, useGetBoardsQuery } from '@entities/board';
import { CreateBoardForm } from '@features/create-board';
import { DeleteBoardButton } from '@features/delete-board';
import { getErrorMessage } from '@shared/api';
import { Button, EmptyState, Skeleton } from '@shared/ui';
import styles from './BoardsPage.module.scss';

export function BoardsPage() {
  const navigate = useNavigate();
  const {
    data: boards,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useGetBoardsQuery();

  return (
    <div className={styles.page}>
      <div className={styles.top}>
        <div>
          <h1 className={styles.title}>Мои доски</h1>
          <p className={styles.subtitle}>
            Создайте доску и разложите задачи по колонкам
          </p>
        </div>
        <CreateBoardForm onCreated={(id) => navigate(`/boards/${id}`)} />
      </div>

      {isLoading && (
        <div
          className={styles.grid}
          aria-busy="true"
          aria-label="Загрузка досок"
        >
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} height={140} className={styles.skeletonCard} />
          ))}
        </div>
      )}

      {error && !boards && (
        <EmptyState
          title="Не удалось загрузить доски"
          description={getErrorMessage(error)}
          action={
            <Button onClick={() => refetch()} loading={isFetching}>
              <RefreshCw size={16} aria-hidden="true" />
              Повторить
            </Button>
          }
        />
      )}

      {boards && boards.length === 0 && (
        <EmptyState
          icon={<LayoutDashboard size={28} />}
          title="Пока нет ни одной доски"
          description="Введите название в поле выше и нажмите «Создать»: колонки появятся автоматически."
        />
      )}

      {boards && boards.length > 0 && (
        <ul className={styles.grid}>
          {boards.map((board) => (
            <li key={board.id}>
              <BoardCard
                board={board}
                actions={<DeleteBoardButton board={board} />}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
