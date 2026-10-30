import { useId, type ComponentProps } from 'react';
import { cn } from '@shared/lib';
import styles from './Textarea.module.scss';

interface TextareaProps extends ComponentProps<'textarea'> {
  label?: string;
}

export function Textarea({ label, className, id, ...rest }: TextareaProps) {
  const autoId = useId();
  const textareaId = id ?? autoId;

  return (
    <div className={cn(styles.field, className)}>
      {label && (
        <label htmlFor={textareaId} className={styles.label}>
          {label}
        </label>
      )}
      <textarea id={textareaId} className={styles.textarea} {...rest} />
    </div>
  );
}
