import type { ComponentProps, Ref } from 'react';
import { AlignLeft } from 'lucide-react';
import { cn } from '@shared/lib';
import type { Card } from '../model/types';
import styles from './CardItem.module.scss';

interface CardItemProps {
  card: Card;
  // Для карточки в DragOverlay и для подсветки «призрака» на месте перетаскивания
  isOverlay?: boolean;
  isGhost?: boolean;
  onOpen?: () => void;
  // Кнопка карточки одновременно служит «ручкой» перетаскивания.
  // Нужные атрибуты и обработчики приходят снаружи (из features и widgets)
  openButtonRef?: Ref<HTMLButtonElement>;
  openButtonProps?: ComponentProps<'button'>;
  className?: string;
}

// Только внешний вид. Само перетаскивание навешивают снаружи
export function CardItem({
  card,
  isOverlay,
  isGhost,
  onOpen,
  openButtonRef,
  openButtonProps,
  className,
}: CardItemProps) {
  return (
    <div
      className={cn(
        styles.card,
        isOverlay && styles.overlay,
        isGhost && styles.ghost,
        className
      )}
    >
      <button
        type="button"
        className={styles.open}
        onClick={onOpen}
        aria-haspopup="dialog"
        {...openButtonProps}
        ref={openButtonRef}
      >
        <span className={styles.title}>{card.title}</span>
        {card.description && (
          <AlignLeft
            size={14}
            className={styles.icon}
            aria-label="Есть описание"
          />
        )}
      </button>
    </div>
  );
}
