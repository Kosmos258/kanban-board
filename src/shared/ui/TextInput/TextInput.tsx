import { useId, type ComponentProps } from 'react';
import { cn } from '@shared/lib';
import styles from './TextInput.module.scss';

interface TextInputProps extends ComponentProps<'input'> {
  label?: string;
  error?: string;
}

export function TextInput({
  label,
  error,
  className,
  id,
  ...rest
}: TextInputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const errorId = `${inputId}-error`;

  return (
    <div className={cn(styles.field, className)}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(styles.input, error && styles.invalid)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...rest}
      />
      {error && (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
