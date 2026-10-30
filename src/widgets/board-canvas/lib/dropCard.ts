import { moveCardInBoard, type Board } from '@entities/board';

interface DropTarget {
  id: string;
  type: 'card' | 'column';
  // Курсор в нижней половине карточки, над которой находимся
  isBelow: boolean;
}

export function findColumnOfCard(board: Board, cardId: string) {
  return board.columns.find((c) => c.cards.some((k) => k.id === cardId));
}

// Куда попадёт карточка, если её отпустить над target. Чистая функция: удобно проверять тестами.
// Между колонками карточка встаёт до или после карточки под курсором, внутри колонки
// занимает её место (как arrayMove)
export function dropCardOnTarget(
  board: Board,
  cardId: string,
  target: DropTarget
): Board {
  const from = findColumnOfCard(board, cardId);
  if (!from) return board;

  if (target.type === 'column') {
    const to = board.columns.find((c) => c.id === target.id);
    if (!to || to.id === from.id) return board;
    return moveCardInBoard(board, cardId, to.id, to.cards.length);
  }

  const to = findColumnOfCard(board, target.id);
  if (!to) return board;
  const overIndex = to.cards.findIndex((c) => c.id === target.id);

  if (to.id === from.id) {
    const activeIndex = from.cards.findIndex((c) => c.id === cardId);
    return overIndex === activeIndex
      ? board
      : moveCardInBoard(board, cardId, to.id, overIndex);
  }
  return moveCardInBoard(
    board,
    cardId,
    to.id,
    overIndex + (target.isBelow ? 1 : 0)
  );
}
