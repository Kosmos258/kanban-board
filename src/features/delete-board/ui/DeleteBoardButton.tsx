import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Trash2 } from 'lucide-react';
import { ConfirmDialog, IconButton, showToast } from '@shared/ui';
import { useDeleteBoardMutation } from '../api/deleteBoardApi';

interface DeleteBoardButtonProps {
  board: { id: string; title: string };
}

export function DeleteBoardButton({ board }: DeleteBoardButtonProps) {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [deleteBoard, { isLoading }] = useDeleteBoardMutation();

  async function handleConfirm() {
    try {
      await deleteBoard(board.id).unwrap();
      setOpen(false);
      dispatch(showToast('success', `Доска «${board.title}» удалена`));
    } catch {
      setOpen(false);
    }
  }

  return (
    <>
      <IconButton
        tone="danger"
        aria-label={`Удалить доску «${board.title}»`}
        onClick={() => setOpen(true)}
      >
        <Trash2 size={16} />
      </IconButton>
      <ConfirmDialog
        open={open}
        title="Удалить доску?"
        description={`Доска «${board.title}» будет удалена вместе со всеми колонками и карточками. Это действие нельзя отменить.`}
        loading={isLoading}
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
