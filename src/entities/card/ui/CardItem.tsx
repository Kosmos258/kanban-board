import type { Card } from '../model/types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import styles from './CardItem.module.scss';

interface CardItemProps {
  card: Card;
  isOverlay?: boolean;
}

export function CardItem({ card, isOverlay = false }: CardItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    disabled: isOverlay,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Собираем классы: базовый + модификаторы
  const classNames = [
    styles.card,
    isDragging && !isOverlay ? styles.isDragging : '',
    isOverlay ? styles.isOverlay : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={classNames}
      {...listeners}
      {...attributes}
    >
      <h3 className={styles.title}>{card.title}</h3>
      <p className={styles.description}>{card.description}</p>
    </div>
  );
}
