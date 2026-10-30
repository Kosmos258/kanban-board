import { useState, type FormEvent } from 'react';
import { useDispatch } from 'react-redux';
import { Plus } from 'lucide-react';
import { Button, TextInput, showToast } from '@shared/ui';
import { useCreateBoardMutation } from '../api/createBoardApi';
import styles from './CreateBoardForm.module.scss';

interface CreateBoardFormProps {
  onCreated?: (boardId: string) => void;
}

export function CreateBoardForm({ onCreated }: CreateBoardFormProps) {
  const dispatch = useDispatch();
  const [createBoard, { isLoading }] = useCreateBoardMutation();
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setError('Введите название доски');
      return;
    }
    try {
      const board = await createBoard({ title: trimmed }).unwrap();
      setTitle('');
      setError('');
      dispatch(showToast('success', `Доска «${board.title}» создана`));
      onCreated?.(board.id);
    } catch {
      // Сообщение об ошибке покажет общий обработчик в сторе
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <TextInput
        className={styles.input}
        aria-label="Название новой доски"
        placeholder="Название новой доски"
        value={title}
        maxLength={100}
        error={error}
        onChange={(event) => {
          setTitle(event.target.value);
          if (error) setError('');
        }}
      />
      <Button type="submit" variant="primary" loading={isLoading}>
        <Plus size={16} aria-hidden="true" />
        Создать
      </Button>
    </form>
  );
}
