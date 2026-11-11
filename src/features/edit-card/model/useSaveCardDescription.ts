import { useUpdateCardMutation } from '../api/editCardApi';

/** Сохраняет только описание карточки, например при правке прямо на доске */
export function useSaveCardDescription(boardId: string) {
  const [updateCard] = useUpdateCardMutation();

  return (cardId: string, description: string | null) =>
    updateCard({ boardId, cardId, description }).unwrap();
}
