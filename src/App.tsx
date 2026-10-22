import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@app/providers/store/hooks';
import { addCard } from '@entities/card/model';
import { addColumn, addCardToColumn } from '@entities/column/model';
import { ColumnItem } from '@entities/column/ui/ColumnItem';

export function App() {
  const dispatch = useAppDispatch();

  const columnIds = useAppSelector((state) => state.column.ids);
  const columnEntities = useAppSelector((state) => state.column.entities);

  // 👇 Инициализация: создаем две колонки при первом рендере (если их еще нет)
  useEffect(() => {
    if (columnIds.length === 0) {
      dispatch(addColumn({ id: 'todo', title: 'To Do', cardIds: [] }));
      dispatch(
        addColumn({ id: 'in-progress', title: 'In Progress', cardIds: [] })
      );
    }
  }, [dispatch, columnIds.length]);

  const handleAddMockCard = () => {
    const newCardId = crypto.randomUUID();

    // 1. Добавляем саму карточку в хранилище карточек
    dispatch(
      addCard({
        id: newCardId,
        title: 'Новая задача',
        description: 'Описание задачи',
        createdAt: new Date().toISOString(),
      })
    );

    // 2. Говорим колонке "todo", что у неё появилась новая карточка
    dispatch(
      addCardToColumn({
        columnId: 'todo',
        cardId: newCardId,
      })
    );
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Kanban Board</h1>

      <button
        onClick={handleAddMockCard}
        style={{ padding: '8px 16px', cursor: 'pointer', marginBottom: '20px' }}
      >
        Добавить карточку в To Do
      </button>

      {/* Рендерим колонки */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
        {columnIds.map((id) => {
          const column = columnEntities[id];
          return column ? <ColumnItem key={id} column={column} /> : null;
        })}
      </div>
    </div>
  );
}
