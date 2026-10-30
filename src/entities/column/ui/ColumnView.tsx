import type { ReactNode } from 'react';
import { cn } from '@shared/lib';
import styles from './ColumnView.module.scss';

interface ColumnViewProps {
  // Заголовок и действия приходят снаружи: переименование и удаление живут в features
  header: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  isOver?: boolean;
  isOverlay?: boolean;
  className?: string;
}

export function ColumnView({
  header,
  children,
  footer,
  isOver,
  isOverlay,
  className,
}: ColumnViewProps) {
  return (
    <section
      className={cn(
        styles.column,
        isOver && styles.over,
        isOverlay && styles.overlay,
        className
      )}
    >
      <header className={styles.header}>{header}</header>
      <div className={styles.cards}>{children}</div>
      {footer && <footer className={styles.footer}>{footer}</footer>}
    </section>
  );
}
