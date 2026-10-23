import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useAppSelector } from '@app/providers/store/hooks';
import { CardItem } from '@entities/card/ui/CardItem';
import { AddCardForm } from '@features/add-card/ui/AddCardForm';
import type { Column } from '../model/types';
import styles from './ColumnItem.module.scss';

interface ColumnItemProps {
  column: Column;
}

export function ColumnItem({ column }: ColumnItemProps) {
  const cardEntities = useAppSelector((state) => state.card.entities);

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const columnClass = `${styles.column} ${isOver ? styles.isOver : ''}`;

  return (
    <div ref={setNodeRef} className={columnClass}>
      <h2 className={styles.header}>{column.title}</h2>

      <SortableContext
        items={column.cardIds}
        strategy={verticalListSortingStrategy}
      >
        <div className={styles.cardsList}>
          {column.cardIds.map((cardId) => {
            const card = cardEntities[cardId];
            return card ? <CardItem key={cardId} card={card} /> : null;
          })}
        </div>
      </SortableContext>
      <AddCardForm columnId={column.id} />
    </div>
  );
}
