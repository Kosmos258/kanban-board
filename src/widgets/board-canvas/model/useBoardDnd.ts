import { useRef, useState } from 'react';
import type {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import { moveColumnInBoard, type Board } from '@entities/board';
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

export function useBoardDnd(board: Board) {
  const [draft, setDraft] = useState<Board | null>(null);
  const [active, setActive] = useState<ActiveItem | null>(null);
  const [moveCard] = useMoveCardMutation();
  const [moveColumn] = useMoveColumnMutation();

  const [settlingFrom, setSettlingFrom] = useState<Board | null>(null);
  const dragSeq = useRef(0);

  if (settlingFrom && board !== settlingFrom) {
    setSettlingFrom(null);
    setDraft(null);
  }

  const view = draft ?? board;

  function reset() {
    setActive(null);
    setDraft(null);
    setSettlingFrom(null);
  }

  function settle(final: Board, request: PromiseLike<unknown>) {
    const seq = ++dragSeq.current;
    setActive(null);
    setDraft(final);
    setSettlingFrom(board);
    void request.then(() => {
      if (dragSeq.current !== seq) return;
      setSettlingFrom(null);
      setDraft(null);
    });
  }

  function handleDragStart({ active }: DragStartEvent) {
    dragSeq.current += 1;
    setSettlingFrom(null);
    setActive({
      id: String(active.id),
      type: active.data.current?.type === 'column' ? 'column' : 'card',
    });
    setDraft(board);
  }

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

      return from && to && from.id !== to.id ? next : prev;
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    const current = draft ?? board;

    if (active.data.current?.type === 'column') {
      const position = over
        ? board.columns.findIndex((c) => c.id === over.id)
        : -1;
      const from = board.columns.findIndex((c) => c.id === active.id);
      if (
        !over ||
        over.id === active.id ||
        position === -1 ||
        position === from
      ) {
        reset();
        return;
      }
      const columnId = String(active.id);
      settle(
        moveColumnInBoard(board, columnId, position),
        moveColumn({ boardId: board.id, columnId, position })
      );
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
    if (!column || !original) {
      reset();
      return;
    }
    const position = column.cards.findIndex((c) => c.id === cardId);

    if (original.columnId === column.id && original.position === position) {
      reset();
      return;
    }

    settle(
      final,
      moveCard({ boardId: board.id, cardId, columnId: column.id, position })
    );
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
