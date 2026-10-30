import {
  closestCenter,
  pointerWithin,
  rectIntersection,
  type CollisionDetection,
} from '@dnd-kit/core';

// Колонки сравниваем только с колонками, а карточки сначала привязываем к колонке под курсором.
// Так карточку можно бросить и в пустую колонку, и между другими карточками
export const collisionDetection: CollisionDetection = (args) => {
  const activeType = args.active.data.current?.type;

  if (activeType === 'column') {
    return closestCenter({
      ...args,
      droppableContainers: args.droppableContainers.filter(
        (c) => c.data.current?.type === 'column'
      ),
    });
  }

  // Мышь и палец дают координаты курсора. У клавиатуры их нет, тогда смотрим на пересечение
  const pointerHits = pointerWithin(args);
  const hits = pointerHits.length > 0 ? pointerHits : rectIntersection(args);
  const columnHit = hits.find(
    (hit) =>
      args.droppableContainers.find((c) => c.id === hit.id)?.data.current
        ?.type === 'column'
  );
  if (!columnHit) return [];

  const cardsInColumn = args.droppableContainers.filter(
    (c) =>
      c.data.current?.type === 'card' &&
      c.data.current.columnId === columnHit.id
  );
  if (cardsInColumn.length === 0) return [columnHit];

  return closestCenter({ ...args, droppableContainers: cardsInColumn });
};
