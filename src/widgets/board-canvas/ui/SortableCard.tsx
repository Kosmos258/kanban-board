import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CardItem, type Card } from '@entities/card';
import { useSaveCardDescription } from '@features/edit-card';

interface SortableCardProps {
  card: Card;
  boardId: string;
  onOpen: (cardId: string) => void;
}

export function SortableCard({ card, boardId, onOpen }: SortableCardProps) {
  const saveDescription = useSaveCardDescription(boardId);
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
        onSaveDescription={(description) =>
          saveDescription(card.id, description)
        }

        openButtonRef={setActivatorNodeRef}
        openButtonProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}
