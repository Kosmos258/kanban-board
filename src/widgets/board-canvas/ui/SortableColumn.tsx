import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { ColumnView, type Column } from '@entities/column';
import { AddCardForm } from '@features/add-card';
import { DeleteColumnButton } from '@features/delete-column';
import { RenameColumn } from '@features/rename-column';
import { IconButton } from '@shared/ui';
import { SortableCard } from './SortableCard';
import styles from './BoardCanvas.module.scss';

interface SortableColumnProps {
  column: Column;
  onOpenCard: (cardId: string) => void;
}

export function SortableColumn({ column, onOpenCard }: SortableColumnProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id, data: { type: 'column' } });

  return (
    <div
      ref={setNodeRef}
      className={styles.columnSlot}
      data-dragging={isDragging || undefined}
      style={{ transform: CSS.Translate.toString(transform), transition }}
    >
      <ColumnView
        header={
          <>
            <IconButton
              ref={setActivatorNodeRef}
              {...attributes}
              {...listeners}
              aria-label={`Переместить колонку «${column.title}»`}
              className={styles.grip}
            >
              <GripVertical size={16} />
            </IconButton>
            <div className={styles.columnTitle}>
              <RenameColumn column={column} />
            </div>
            <span
              className={styles.count}
              aria-label={`Карточек: ${column.cards.length}`}
            >
              {column.cards.length}
            </span>
            <DeleteColumnButton
              column={{ ...column, cardsCount: column.cards.length }}
            />
          </>
        }
        footer={<AddCardForm boardId={column.boardId} columnId={column.id} />}
      >
        <SortableContext
          items={column.cards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {column.cards.map((card) => (
            <SortableCard key={card.id} card={card} onOpen={onOpenCard} />
          ))}
        </SortableContext>
      </ColumnView>
    </div>
  );
}
