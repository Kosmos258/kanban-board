import type { Announcements, ScreenReaderInstructions } from '@dnd-kit/core';
import type { Board } from '@entities/board';

// Тексты для скринридеров: что взяли, над чем находимся и куда положили
export function createAnnouncements(board: Board): Announcements {
  const describe = (id: string | number) => {
    const column = board.columns.find((c) => c.id === id);
    if (column) return `колонка «${column.title}»`;
    for (const c of board.columns) {
      const card = c.cards.find((k) => k.id === id);
      if (card) return `карточка «${card.title}»`;
    }
    return 'элемент';
  };

  // Позиция «3 из 5» считается по текущему порядку на доске
  const place = (id: string | number) => {
    const columnIndex = board.columns.findIndex((c) => c.id === id);
    if (columnIndex !== -1) {
      return `позиция ${columnIndex + 1} из ${board.columns.length}`;
    }
    for (const c of board.columns) {
      const index = c.cards.findIndex((k) => k.id === id);
      if (index !== -1) {
        return `колонка «${c.title}», позиция ${index + 1} из ${c.cards.length}`;
      }
    }
    return '';
  };

  return {
    onDragStart: ({ active }) => `Вы взяли: ${describe(active.id)}.`,
    onDragOver: ({ active, over }) =>
      over
        ? `${describe(active.id)} находится над: ${describe(over.id)}.`
        : `${describe(active.id)} вне допустимой области.`,
    onDragEnd: ({ active, over }) =>
      over
        ? `${describe(active.id)} перемещена: ${place(active.id)}.`
        : `${describe(active.id)} возвращена на прежнее место.`,
    onDragCancel: ({ active }) =>
      `Перемещение отменено: ${describe(active.id)} на прежнем месте.`,
  };
}

export const screenReaderInstructions: ScreenReaderInstructions = {
  draggable:
    'Чтобы взять элемент, нажмите пробел. Стрелками выберите новое место, пробел — положить, Escape — отменить.',
};
