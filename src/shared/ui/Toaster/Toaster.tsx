import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CircleAlert, CircleCheck, X } from 'lucide-react';
import { IconButton } from '../IconButton';
import { dismissToast, type Toast } from './toastSlice';
import styles from './Toaster.module.scss';

const LIFETIME_MS = 4500;

function ToastItem({ toast }: { toast: Toast }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const timer = setTimeout(
      () => dispatch(dismissToast(toast.id)),
      LIFETIME_MS
    );
    return () => clearTimeout(timer);
  }, [dispatch, toast.id]);

  return (
    <div className={styles.toast} data-kind={toast.kind}>
      {toast.kind === 'error' ? (
        <CircleAlert size={18} aria-hidden="true" />
      ) : (
        <CircleCheck size={18} aria-hidden="true" />
      )}
      <p className={styles.message}>{toast.message}</p>
      <IconButton
        aria-label="Закрыть уведомление"
        onClick={() => dispatch(dismissToast(toast.id))}
      >
        <X size={16} />
      </IconButton>
    </div>
  );
}

export function Toaster() {
  // Тип стора здесь неизвестен (shared не знает про app), поэтому читаем только свой кусок
  const toasts = useSelector((state: { toast: Toast[] }) => state.toast);

  return (
    <div className={styles.region} role="status" aria-live="polite">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
