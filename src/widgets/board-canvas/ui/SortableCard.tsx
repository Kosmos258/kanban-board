import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CardItem, type Card } from '@entities/card';

interface SortableCardProps {
  card: Card;
  onOpen: (cardId: string) => void;
}

export function SortableCard({ card, onOpen }: SortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: { type: 'card', columnId: card.columnId },
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
    >
      <CardItem
        card={card}
        isGhost={isDragging}
        onOpen={() => onOpen(card.id)}
        // Ручкой служит сама кнопка карточки: тогда с клавиатуры Пробел берёт карточку,
        // а Enter по-прежнему открывает её
        openButtonRef={setActivatorNodeRef}
        openButtonProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}
