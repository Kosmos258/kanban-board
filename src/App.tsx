import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@app/providers/store/hooks';
import { addCard } from '@entities/card/model';
import { addColumn, addCardToColumn, moveCard } from '@entities/column/model';
import { ColumnItem } from '@entities/column/ui/ColumnItem';
import { CardItem } from '@entities/card/ui/CardItem';
import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';

export function App() {
  const dispatch = useAppDispatch();
  const [activeId, setActiveId] = useState<string | null>(null);

  const columnIds = useAppSelector((state) => state.column.ids);
  const columnEntities = useAppSelector((state) => state.column.entities);
  const cardEntities = useAppSelector((state) => state.card.entities);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

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
    dispatch(
      addCard({
        id: newCardId,
        title: 'Новая задача',
        description: 'Описание',
        createdAt: new Date().toISOString(),
      })
    );
    dispatch(addCardToColumn({ columnId: 'todo', cardId: newCardId }));
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;

    if (!over) return;

    const cardId = active.id as string;
    const toColumnId = over.id as string;

    let fromColumnId: string | null = null;
    for (const colId of columnIds) {
      if (columnEntities[colId].cardIds.includes(cardId)) {
        fromColumnId = colId;
        break;
      }
    }

    if (fromColumnId && fromColumnId !== toColumnId) {
      dispatch(moveCard({ fromColumnId, toColumnId, cardId }));
    }
  };

  const activeCard = activeId ? cardEntities[activeId] : null;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Kanban Board</h1>

      <button
        onClick={handleAddMockCard}
        style={{ padding: '8px 16px', cursor: 'pointer', marginBottom: '20px' }}
      >
        Добавить карточку в To Do
      </button>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
          {columnIds.map((id) => {
            const column = columnEntities[id];
            return column ? <ColumnItem key={id} column={column} /> : null;
          })}
        </div>

        <DragOverlay>
          {activeCard ? <CardItem card={activeCard} isOverlay /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
