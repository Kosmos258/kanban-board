import type { Card } from '../model/types';

interface CardItemProps {
  card: Card;
}

export function CardItem({ card }: CardItemProps) {
  return (
    <div
      style={{
        border: '1px solid #ccc',
        padding: '10px',
        margin: '10px 0',
        borderRadius: '4px',
        backgroundColor: '#fff',
      }}
    >
      <h3 style={{ margin: '0 0 8px 0' }}>{card.title}</h3>
      <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
        {card.description}
      </p>
    </div>
  );
}
