import type { Column } from '../model/types';
import { useAppSelector } from '@app/providers/store/hooks';
import { CardItem } from '@entities/card/ui/CardItem';
import { useDroppable } from '@dnd-kit/core';

interface ColumnItemProps {
  column: Column;
}

export function ColumnItem({ column }: ColumnItemProps) {
  const cardEntities = useAppSelector((state) => state.card.entities);

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        backgroundColor: isOver ? '#484d51' : '#4e5156',
        borderRadius: '8px',
        padding: '16px',
        width: '300px',
        flexShrink: 0,
        border: '2px dashed transparent',
        borderColor: isOver ? '#2196f3' : 'transparent',
        transition: 'all 0.2s ease',
        minHeight: '200px',
      }}
    >
      <h2 style={{ fontSize: '18px', margin: '0 0 16px 0' }}>{column.title}</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {column.cardIds.map((cardId) => {
          const card = cardEntities[cardId];
          return card ? <CardItem key={cardId} card={card} /> : null;
        })}
      </div>
    </div>
  );
}
