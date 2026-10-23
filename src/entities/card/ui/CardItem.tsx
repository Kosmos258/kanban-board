import type { Card } from '../model/types';
import { useDraggable } from '@dnd-kit/core';

interface CardItemProps {
  card: Card;
  isOverlay?: boolean;
}

export function CardItem({ card, isOverlay = false }: CardItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: card.id,
      disabled: isOverlay,
    });

  const style = {
    border: '1px solid #ccc',
    padding: '10px',
    margin: '10px 0',
    borderRadius: '4px',
    backgroundColor: '#fff',
    cursor: isOverlay ? 'grabbing' : 'grab',
    opacity: isDragging && !isOverlay ? 0.4 : 1,
    transform:
      transform && !isOverlay
        ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
        : undefined,
    zIndex: isOverlay ? 999 : 1,
    boxShadow: isOverlay ? '0 5px 15px rgba(0,0,0,0.15)' : 'none',
    position: 'relative' as const,
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <h3 style={{ margin: '0 0 8px 0' }}>{card.title}</h3>
      <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
        {card.description}
      </p>
    </div>
  );
}
