import {
  closestCenter,
  pointerWithin,
  rectIntersection,
  type CollisionDetection,
} from '@dnd-kit/core';

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
