import type { ComponentProps } from 'react';
import { cn } from '@shared/lib';
import styles from './IconButton.module.scss';

interface IconButtonProps extends Omit<ComponentProps<'button'>, 'aria-label'> {
  // У кнопки без текста должно быть имя для скринридера, поэтому поле обязательное
  'aria-label': string;
  tone?: 'default' | 'danger';
}

export function IconButton({
  tone = 'default',
  className,
  type = 'button',
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      className={cn(styles.iconButton, styles[tone], className)}
      title={rest['aria-label']}
      {...rest}
    />
  );
}
