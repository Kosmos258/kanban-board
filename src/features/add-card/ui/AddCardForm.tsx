import { InlineAddForm } from '@shared/ui';
import { useAddCardMutation } from '../api/addCardApi';

interface AddCardFormProps {
  boardId: string;
  columnId: string;
}

export function AddCardForm({ boardId, columnId }: AddCardFormProps) {
  const [addCard] = useAddCardMutation();

  return (
    <InlineAddForm
      triggerLabel="Добавить карточку"
      placeholder="Название карточки"
      submitLabel="Добавить"
      maxLength={200}
      onSubmit={async (title) => {
        try {
          await addCard({ boardId, columnId, title }).unwrap();
          return true;
        } catch {
          // Тост с ошибкой покажет общий обработчик
          return false;
        }
      }}
    />
  );
}
