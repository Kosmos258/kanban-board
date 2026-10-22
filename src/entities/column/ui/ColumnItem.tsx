import type { Column } from '../model/types';
import { useAppSelector } from '@app/providers/store/hooks';
import { CardItem } from '@entities/card/ui/CardItem';
// import type { Card } from '@entities/card/model';

interface ColumnItemProps {
  column: Column;
}

export function ColumnItem({ column }: ColumnItemProps) {
  // Достаем все карточки из стора, чтобы отфильтровать нужные
  const cardEntities = useAppSelector((state) => state.card.entities);

  return (
    <div
      style={{
        backgroundColor: '#f4f5f7',
        borderRadius: '8px',
        padding: '16px',
        width: '300px',
        flexShrink: 0,
      }}
    >
      <h2 style={{ fontSize: '18px', margin: '0 0 16px 0' }}>{column.title}</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* Проходимся по ID карточек в колонке и достаем их из entities */}
        {column.cardIds.map((cardId) => {
          const card = cardEntities[cardId];
          return card ? <CardItem key={cardId} card={card} /> : null;
        })}
      </div>
    </div>
  );
}
