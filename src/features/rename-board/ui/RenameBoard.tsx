import { InlineEdit } from '@shared/ui';
import { useRenameBoardMutation } from '../api/renameBoardApi';
import styles from './RenameBoard.module.scss';

interface RenameBoardProps {
  board: { id: string; title: string };
}

export function RenameBoard({ board }: RenameBoardProps) {
  const [renameBoard] = useRenameBoardMutation();

  return (
    <h1 className={styles.title}>
      <InlineEdit
        value={board.title}
        label="Название доски"
        maxLength={100}
        onSave={(title) => void renameBoard({ boardId: board.id, title })}
      />
    </h1>
  );
}
