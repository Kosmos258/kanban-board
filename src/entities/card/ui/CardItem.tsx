import type { ComponentProps, Ref } from 'react';
import { cn } from '@shared/lib';
import type { Card } from '../model/types';
import { CardDescription } from './CardDescription';
import styles from './CardItem.module.scss';

interface CardItemProps {
  card: Card;

  isOverlay?: boolean;
  isGhost?: boolean;
  onOpen?: () => void;
  /** Сохранение описания прямо на карточке. Без него описание только читается */
  onSaveDescription?: (value: string | null) => Promise<unknown> | void;

  openButtonRef?: Ref<HTMLButtonElement>;
  openButtonProps?: ComponentProps<'button'>;
  className?: string;
}

export function CardItem({
  card,
  isOverlay,
  isGhost,
  onOpen,
  onSaveDescription,
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
      data-with-description={
        onSaveDescription || card.description ? '' : undefined
      }
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
      </button>
      <CardDescription value={card.description} onSave={onSaveDescription} />
    </div>
  );
}
