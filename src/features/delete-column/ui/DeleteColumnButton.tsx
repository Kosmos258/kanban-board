import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { ConfirmDialog, IconButton } from '@shared/ui';
import { useDeleteColumnMutation } from '../api/deleteColumnApi';

interface DeleteColumnButtonProps {
  column: { id: string; boardId: string; title: string; cardsCount: number };
}

export function DeleteColumnButton({ column }: DeleteColumnButtonProps) {
  const [open, setOpen] = useState(false);
  const [deleteColumn, { isLoading }] = useDeleteColumnMutation();

  async function handleConfirm() {
    try {
      await deleteColumn({
        boardId: column.boardId,
        columnId: column.id,
      }).unwrap();
    } catch {
      // Тост с ошибкой покажет общий обработчик
    }
    setOpen(false);
  }

  return (
    <>
      <IconButton
        tone="danger"
        aria-label={`Удалить колонку «${column.title}»`}
        onClick={() => setOpen(true)}
      >
        <Trash2 size={16} />
      </IconButton>
      <ConfirmDialog
        open={open}
        title="Удалить колонку?"
        description={
          column.cardsCount > 0
            ? `Колонка «${column.title}» будет удалена вместе с карточками (${column.cardsCount}). Это действие нельзя отменить.`
            : `Колонка «${column.title}» будет удалена.`
        }
        loading={isLoading}
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
