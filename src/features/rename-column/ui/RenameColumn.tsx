import { InlineEdit } from '@shared/ui';
import { useRenameColumnMutation } from '../api/renameColumnApi';

interface RenameColumnProps {
  column: { id: string; boardId: string; title: string };
}

export function RenameColumn({ column }: RenameColumnProps) {
  const [renameColumn] = useRenameColumnMutation();

  return (
    <InlineEdit
      value={column.title}
      label="Название колонки"
      maxLength={100}
      onSave={(title) =>
        void renameColumn({
          boardId: column.boardId,
          columnId: column.id,
          title,
        })
      }
    />
  );
}
