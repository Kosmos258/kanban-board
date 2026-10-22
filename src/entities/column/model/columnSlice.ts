import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Column } from './types';

interface ColumnState {
  ids: string[];
  entities: Record<string, Column>;
}

const initialState: ColumnState = {
  ids: [],
  entities: {},
};

export const columnSlice = createSlice({
  name: 'column',
  initialState,
  reducers: {
    addColumn: (state, action: PayloadAction<Column>) => {
      const column = action.payload;
      if (!state.ids.includes(column.id)) {
        state.ids.push(column.id);
      }
      state.entities[column.id] = column;
    },
    removeColumn: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      state.ids = state.ids.filter((colId) => colId !== id);
      delete state.entities[id];
    },
    // 👇 Новый экшен: добавляем ID карточки в массив cardIds конкретной колонки
    addCardToColumn: (
      state,
      action: PayloadAction<{ columnId: string; cardId: string }>
    ) => {
      const { columnId, cardId } = action.payload;
      const column = state.entities[columnId];
      if (column && !column.cardIds.includes(cardId)) {
        column.cardIds.push(cardId); // Immer позволяет нам мутировать массив напрямую
      }
    },
  },
});

export const { addColumn, removeColumn, addCardToColumn } = columnSlice.actions;
export const columnReducer = columnSlice.reducer;
