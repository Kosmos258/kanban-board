import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { Plus, X } from 'lucide-react';
import { cn } from '@shared/lib';
import { Button } from '../Button';
import { IconButton } from '../IconButton';
import styles from './InlineAddForm.module.scss';

interface InlineAddFormProps {
  triggerLabel: string;
  placeholder: string;
  submitLabel: string;
  maxLength: number;
  // Должна вернуть true, если элемент создан: тогда поле очищается и остаётся открытым
  onSubmit: (title: string) => Promise<boolean> | boolean;
  className?: string;
}

// Кнопка «+ Добавить…», которая раскрывается в строку ввода.
// Enter добавляет и оставляет поле открытым, чтобы можно было вводить подряд, Escape закрывает
export function InlineAddForm({
  triggerLabel,
  placeholder,
  submitLabel,
  maxLength,
  onSubmit,
  className,
}: InlineAddFormProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    try {
      if (await onSubmit(trimmed)) setTitle('');
    } finally {
      setBusy(false);
    }
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      setOpen(false);
      setTitle('');
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        className={cn(styles.trigger, className)}
        onClick={() => setOpen(true)}
      >
        <Plus size={16} aria-hidden="true" />
        {triggerLabel}
      </button>
    );
  }

  return (
    <form
      className={cn(styles.form, className)}
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
    >
      <input
        autoFocus
        className={styles.input}
        aria-label={placeholder}
        placeholder={placeholder}
        value={title}
        maxLength={maxLength}
        onChange={(event) => setTitle(event.target.value)}
      />
      <div className={styles.actions}>
        <Button type="submit" variant="primary" size="sm" loading={busy}>
          {submitLabel}
        </Button>
        <IconButton
          aria-label="Отмена"
          onClick={() => {
            setOpen(false);
            setTitle('');
          }}
        >
          <X size={16} />
        </IconButton>
      </div>
    </form>
  );
}
