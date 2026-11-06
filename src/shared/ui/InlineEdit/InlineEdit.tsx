import { useRef, useState, type KeyboardEvent } from 'react';
import { cn } from '@shared/lib';
import styles from './InlineEdit.module.scss';

interface InlineEditProps {
  value: string;
  onSave: (value: string) => void;

  label: string;
  maxLength?: number;
  className?: string;
}

export function InlineEdit({
  value,
  onSave,
  label,
  maxLength = 100,
  className,
}: InlineEditProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const cancelled = useRef(false);

  function start() {
    cancelled.current = false;
    setDraft(value);
    setEditing(true);
  }

  function finish() {
    setEditing(false);
    if (cancelled.current) return;
    const next = draft.trim();
    if (next && next !== value) onSave(next);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.currentTarget.blur();
    } else if (event.key === 'Escape') {
      cancelled.current = true;
      event.currentTarget.blur();
    }
  }

  if (editing) {
    return (
      <input
        autoFocus
        className={cn(styles.input, className)}
        aria-label={label}
        value={draft}
        maxLength={maxLength}
        onChange={(event) => setDraft(event.target.value)}
        onFocus={(event) => event.currentTarget.select()}
        onBlur={finish}
        onKeyDown={handleKeyDown}
      />
    );
  }

  return (
    <button
      type="button"
      className={cn(styles.text, className)}
      aria-label={`${label}: ${value}. Нажмите, чтобы изменить`}
      onClick={start}
    >
      {value}
    </button>
  );
}
