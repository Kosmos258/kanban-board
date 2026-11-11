import { useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import styles from './CardDescription.module.scss';

const MAX_LENGTH = 5000;

interface CardDescriptionProps {
  value: string | null;
  /**
   * Если обработчик передан, описание можно править прямо на доске.
   * Без него (например, в DragOverlay) описание только показывается
   */
  onSave?: (value: string | null) => Promise<unknown> | void;
}

export function CardDescription({ value, onSave }: CardDescriptionProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  // Пока сервер не вернул новое значение, показываем то, что только что ввели.
  // Иначе после сохранения текст на мгновение «откатывался» бы к старому
  const [override, setOverride] = useState<string | null | undefined>();
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    setOverride(undefined);
  }
  const shown = override !== undefined ? override : value;

  const [clamped, setClamped] = useState(false);
  const textRef = useRef<HTMLSpanElement>(null);
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const cancelled = useRef(false);

  // Текст длиннее трёх строк обрезается: узнаём об этом, чтобы показать плавное затухание
  useLayoutEffect(() => {
    const element = textRef.current;
    if (!element) return;

    const measure = () =>
      setClamped(element.scrollHeight - element.clientHeight > 1);
    measure();

    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [shown, editing]);

  // Поле ввода растёт вместе с текстом
  useLayoutEffect(() => {
    const area = areaRef.current;
    if (!area) return;
    area.style.height = 'auto';
    area.style.height = `${area.scrollHeight}px`;
  }, [draft, editing]);

  function start() {
    cancelled.current = false;
    setDraft(shown ?? '');
    setEditing(true);
  }

  async function finish() {
    setEditing(false);
    if (cancelled.current) return;

    const next = draft.trim() === '' ? null : draft;
    if ((next ?? '') === (shown ?? '')) return;

    setOverride(next);
    try {
      await onSave?.(next);
    } catch {
      // Тост с ошибкой покажет общий обработчик, а на доске вернём прежний текст
      setOverride(undefined);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Escape') {
      cancelled.current = true;
      event.currentTarget.blur();
    } else if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.currentTarget.blur();
    }
  }

  const hasText = Boolean(shown);

  if (editing) {
    return (
      <div className={styles.editor}>
        <textarea
          autoFocus
          ref={areaRef}
          className={styles.textarea}
          aria-label="Описание карточки"
          placeholder="Добавьте описание…"
          value={draft}
          maxLength={MAX_LENGTH}
          onChange={(event) => setDraft(event.target.value)}
          onFocus={(event) => {
            const end = event.currentTarget.value.length;
            event.currentTarget.setSelectionRange(end, end);
          }}
          onBlur={finish}
          onKeyDown={handleKeyDown}
        />
        <span className={styles.hint}>
          Ctrl+Enter — сохранить, Esc — отмена
        </span>
      </div>
    );
  }

  if (!onSave) {
    if (!hasText) return null;
    return (
      <div className={styles.static}>
        <span
          ref={textRef}
          className={styles.text}
          data-clamped={clamped || undefined}
        >
          {shown}
        </span>
      </div>
    );
  }

  return (
    <button
      type="button"
      className={styles.display}
      aria-label={
        hasText
          ? `Описание: ${shown}. Нажмите, чтобы изменить`
          : 'Добавить описание'
      }
      onClick={start}
    >
      {hasText ? (
        <span
          ref={textRef}
          className={styles.text}
          data-clamped={clamped || undefined}
        >
          {shown}
        </span>
      ) : (
        <span className={styles.placeholder}>Добавить описание…</span>
      )}
    </button>
  );
}
