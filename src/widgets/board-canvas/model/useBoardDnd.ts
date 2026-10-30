import { useState } from 'react';
import type {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import type { Board } from '@entities/board';
import { useMoveCardMutation } from '@features/move-card';
import { useMoveColumnMutation } from '@features/move-column';
import { dropCardOnTarget, findColumnOfCard } from '../lib/dropCard';

type ActiveItem = { id: string; type: 'card' | 'column' };

function isBelow(event: DragOverEvent | DragEndEvent): boolean {
  const translated = event.active.rect.current.translated;
  const over = event.over;
  if (!translated || !over) return false;
  return translated.top > over.rect.top + over.rect.height / 2;
}

// Во время перетаскивания карточки показываем «черновик» доски (draft) и не трогаем кэш:
// сервер получает один запрос в конце, а не по запросу на каждый сантиметр движения
export function useBoardDnd(board: Board) {
  const [draft, setDraft] = useState<Board | null>(null);
  const [active, setActive] = useState<ActiveItem | null>(null);
  const [moveCard] = useMoveCardMutation();
  const [moveColumn] = useMoveColumnMutation();

  const view = draft ?? board;

  function reset() {
    setActive(null);
    setDraft(null);
  }

  function handleDragStart({ active }: DragStartEvent) {
    setActive({
      id: String(active.id),
      type: active.data.current?.type === 'column' ? 'column' : 'card',
    });
    setDraft(board);
  }

  // Переход карточки в другую колонку происходит сразу, на лету. Порядок внутри колонки
  // dnd-kit анимирует сам, а фиксируем его в конце
  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over || active.data.current?.type !== 'card') return;
    const target = {
      id: String(over.id),
      type:
        over.data.current?.type === 'column'
          ? ('column' as const)
          : ('card' as const),
      isBelow: isBelow(event),
    };
    setDraft((prev) => {
      if (!prev) return prev;
      const from = findColumnOfCard(prev, String(active.id));
      const next = dropCardOnTarget(prev, String(active.id), target);
      const to = findColumnOfCard(next, String(active.id));
      // Внутри одной колонки ничего не меняем до отпускания
      return from && to && from.id !== to.id ? next : prev;
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    const current = draft ?? board;
    reset();

    if (active.data.current?.type === 'column') {
      if (!over || over.id === active.id) return;
      const position = board.columns.findIndex((c) => c.id === over.id);
      const from = board.columns.findIndex((c) => c.id === active.id);
      if (position === -1 || position === from) return;
      void moveColumn({
        boardId: board.id,
        columnId: String(active.id),
        position,
      });
      return;
    }

    const cardId = String(active.id);
    const final = over
      ? dropCardOnTarget(current, cardId, {
          id: String(over.id),
          type: over.data.current?.type === 'column' ? 'column' : 'card',
          isBelow: isBelow(event),
        })
      : current;

    const column = findColumnOfCard(final, cardId);
    const original = findColumnOfCard(board, cardId)?.cards.find(
      (c) => c.id === cardId
    );
    if (!column || !original) return;
    const position = column.cards.findIndex((c) => c.id === cardId);

    // Вернули на то же место: запрос не нужен
    if (original.columnId === column.id && original.position === position)
      return;

    void moveCard({ boardId: board.id, cardId, columnId: column.id, position });
  }

  return {
    view,
    active,
    handlers: {
      onDragStart: handleDragStart,
      onDragOver: handleDragOver,
      onDragEnd: handleDragEnd,
      onDragCancel: reset,
    },
  };
}
