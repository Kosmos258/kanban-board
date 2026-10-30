import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import type { Board } from '@entities/board';
import { CardItem } from '@entities/card';
import { ColumnView } from '@entities/column';
import { AddColumnForm } from '@features/add-column';
import { EditCardModal } from '@features/edit-card';
import { collisionDetection } from '../lib/collision';
import {
  createAnnouncements,
  screenReaderInstructions,
} from '../lib/announcements';
import { useBoardDnd } from '../model/useBoardDnd';
import { SortableColumn } from './SortableColumn';
import styles from './BoardCanvas.module.scss';

interface BoardCanvasProps {
  board: Board;
}

export function BoardCanvas({ board }: BoardCanvasProps) {
  const { view, active, handlers } = useBoardDnd(board);
  const [openCardId, setOpenCardId] = useState<string | null>(null);

  const sensors = useSensors(
    // Мышь начинает перетаскивание после сдвига на 5 пикселей, поэтому обычный клик работает
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    // Палец: нужно задержать касание, иначе страница не прокручивалась бы
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 8 },
    }),
    // Пробел берёт элемент. Enter не трогаем: он открывает карточку
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
      keyboardCodes: { start: ['Space'], cancel: ['Escape'], end: ['Space'] },
    })
  );

  // Подсказки строятся по актуальной (черновой) доске, поэтому названия и позиции всегда свежие
  const announcements = createAnnouncements(view);

  const openCard =
    openCardId === null
      ? null
      : (view.columns
          .flatMap((c) => c.cards)
          .find((c) => c.id === openCardId) ?? null);

  const activeCard =
    active?.type === 'card'
      ? view.columns.flatMap((c) => c.cards).find((c) => c.id === active.id)
      : undefined;
  const activeColumn =
    active?.type === 'column'
      ? view.columns.find((c) => c.id === active.id)
      : undefined;

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        accessibility={{ announcements, screenReaderInstructions }}
        {...handlers}
      >
        <div className={styles.canvas}>
          <SortableContext
            items={view.columns.map((c) => c.id)}
            strategy={horizontalListSortingStrategy}
          >
            {view.columns.map((column) => (
              <SortableColumn
                key={column.id}
                column={column}
                onOpenCard={setOpenCardId}
              />
            ))}
          </SortableContext>
          <AddColumnForm boardId={board.id} />
        </div>

        <DragOverlay>
          {activeCard && <CardItem card={activeCard} isOverlay />}
          {activeColumn && (
            <ColumnView
              isOverlay
              header={
                <h2 className={styles.overlayTitle}>{activeColumn.title}</h2>
              }
            >
              {activeColumn.cards.map((card) => (
                <CardItem key={card.id} card={card} />
              ))}
            </ColumnView>
          )}
        </DragOverlay>
      </DndContext>

      <EditCardModal
        card={openCard}
        boardId={board.id}
        onClose={() => setOpenCardId(null)}
      />
    </>
  );
}
