import type { CSSProperties } from 'react';
import { cn } from '@shared/lib';
import styles from './Skeleton.module.scss';

interface SkeletonProps {
  width?: CSSProperties['width'];
  height?: CSSProperties['height'];
  className?: string;
}

// Серая «заглушка» на время загрузки. Скринридеру она не нужна
export function Skeleton({ width, height = 16, className }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(styles.skeleton, className)}
      style={{ width, height }}
    />
  );
}
