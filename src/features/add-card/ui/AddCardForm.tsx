import { useState, type FormEvent } from 'react';
import { useAppDispatch } from '@app/providers/store/hooks';
import { addCard } from '@entities/card/model';
import { addCardToColumn } from '@entities/column/model';
import styles from './AddCardForm.module.scss';

interface AddCardFormProps {
  columnId: string;
}

export function AddCardForm({ columnId }: AddCardFormProps) {
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newCardId = crypto.randomUUID();

    dispatch(
      addCard({
        id: newCardId,
        title: title.trim(),
        description: 'Описание появится позже',
        createdAt: new Date().toISOString(),
      })
    );

    dispatch(addCardToColumn({ columnId, cardId: newCardId }));

    setTitle('');
    setIsOpen(false); // Закрываем форму после добавления
  };

  if (!isOpen) {
    return (
      <button className={styles.addBtn} onClick={() => setIsOpen(true)}>
        + Добавить карточку
      </button>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <textarea
        className={styles.textarea}
        placeholder="Введите название карточки..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        autoFocus
      />
      <div className={styles.actions}>
        <button type="submit" className={styles.submitBtn}>
          Добавить
        </button>
        <button
          type="button"
          className={styles.cancelBtn}
          onClick={() => setIsOpen(false)}
        >
          Отмена
        </button>
      </div>
    </form>
  );
}
