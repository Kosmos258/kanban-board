import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@app/providers/store/hooks';
import { addColumn, moveCard } from '@entities/column/model';
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

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const cardId = active.id as string;
    const overId = over.id as string;

    const fromColumnId = columnIds.find((colId) =>
      columnEntities[colId].cardIds.includes(cardId)
    );
    if (!fromColumnId) return;

    const isOverColumn = columnIds.includes(overId);
    const toColumnId = isOverColumn
      ? overId
      : columnIds.find((colId) =>
          columnEntities[colId].cardIds.includes(overId)
        );
    if (!toColumnId) return;

    const fromIndex = columnEntities[fromColumnId].cardIds.indexOf(cardId);
    let toIndex = columnEntities[toColumnId].cardIds.length;
    if (!isOverColumn) {
      toIndex = columnEntities[toColumnId].cardIds.indexOf(overId);
    }

    if (fromColumnId !== toColumnId || fromIndex !== toIndex) {
      dispatch(
        moveCard({ fromColumnId, toColumnId, fromIndex, toIndex, cardId })
      );
    }
  };

  const activeCard = activeId ? cardEntities[activeId] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <header
        style={{
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Kanban Board</h1>
      </header>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div
          style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'flex-start',
            overflowX: 'auto',
            paddingBottom: '20px',
          }}
        >
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
