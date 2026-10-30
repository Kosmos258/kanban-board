import { useState, type FormEvent } from 'react';
import { Trash2 } from 'lucide-react';
import type { Card } from '@entities/card';
import { Button, Modal, Textarea, TextInput } from '@shared/ui';
import {
  useDeleteCardMutation,
  useUpdateCardMutation,
} from '../api/editCardApi';
import styles from './EditCardModal.module.scss';

interface EditCardModalProps {
  card: Card | null;
  boardId: string;
  onClose: () => void;
}

export function EditCardModal({ card, boardId, onClose }: EditCardModalProps) {
  return (
    <Modal open={card !== null} onClose={onClose} title="Карточка" wide>
      {/* key пересоздаёт форму для каждой карточки, поэтому поля всегда свежие */}
      {card && (
        <CardForm
          key={card.id}
          card={card}
          boardId={boardId}
          onClose={onClose}
        />
      )}
    </Modal>
  );
}

function CardForm({
  card,
  boardId,
  onClose,
}: {
  card: Card;
  boardId: string;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description ?? '');
  const [error, setError] = useState('');
  const [updateCard, { isLoading: saving }] = useUpdateCardMutation();
  const [deleteCard, { isLoading: deleting }] = useDeleteCardMutation();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setError('Введите название карточки');
      return;
    }
    const nextDescription = description.trim() === '' ? null : description;
    try {
      await updateCard({
        boardId,
        cardId: card.id,
        title: trimmed,
        description: nextDescription,
      }).unwrap();
      onClose();
    } catch {
      // Окно остаётся открытым, чтобы не потерять текст. Тост покажет общий обработчик
    }
  }

  async function handleDelete() {
    try {
      await deleteCard({ boardId, cardId: card.id }).unwrap();
      onClose();
    } catch {
      // см. выше
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <TextInput
        label="Название"
        value={title}
        maxLength={200}
        error={error}
        onChange={(event) => {
          setTitle(event.target.value);
          if (error) setError('');
        }}
      />
      <Textarea
        label="Описание"
        placeholder="Добавьте подробности…"
        value={description}
        maxLength={5000}
        onChange={(event) => setDescription(event.target.value)}
      />
      <div className={styles.actions}>
        <Button
          variant="ghost"
          onClick={handleDelete}
          loading={deleting}
          className={styles.delete}
        >
          <Trash2 size={16} aria-hidden="true" />
          Удалить
        </Button>
        <div className={styles.right}>
          <Button variant="ghost" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" variant="primary" loading={saving}>
            Сохранить
          </Button>
        </div>
      </div>
    </form>
  );
}
