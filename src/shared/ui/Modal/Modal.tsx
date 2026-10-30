import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { IconButton } from '../IconButton';
import styles from './Modal.module.scss';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  // Широкое окно, например для карточки с описанием
  wide?: boolean;
}

// Нативный <dialog>: браузер сам ловит фокус внутри окна, закрывает по Escape
// и делает остальную страницу неактивной
export function Modal({ open, onClose, title, children, wide }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      data-wide={wide || undefined}
      aria-label={title}
      onClose={onClose}
      onClick={(event) => {
        // Клик по затемнению попадает в сам <dialog>, а не в содержимое
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {open && (
        <div className={styles.content}>
          <header className={styles.header}>
            <h2 className={styles.title}>{title}</h2>
            <IconButton aria-label="Закрыть" onClick={onClose}>
              <X size={18} />
            </IconButton>
          </header>
          {children}
        </div>
      )}
    </dialog>
  );
}
