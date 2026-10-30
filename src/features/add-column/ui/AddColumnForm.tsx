import { InlineAddForm } from '@shared/ui';
import { useAddColumnMutation } from '../api/addColumnApi';
import styles from './AddColumnForm.module.scss';

export function AddColumnForm({ boardId }: { boardId: string }) {
  const [addColumn] = useAddColumnMutation();

  return (
    <div className={styles.wrapper}>
      <InlineAddForm
        triggerLabel="Добавить колонку"
        placeholder="Название колонки"
        submitLabel="Добавить"
        maxLength={100}
        onSubmit={async (title) => {
          try {
            await addColumn({ boardId, title }).unwrap();
            return true;
          } catch {
            // Тост с ошибкой покажет общий обработчик
            return false;
          }
        }}
      />
    </div>
  );
}
