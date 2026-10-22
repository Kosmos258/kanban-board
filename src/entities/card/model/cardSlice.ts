import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Card } from './types';

interface CardState {
  ids: string[];
  entities: Record<string, Card>;
}

const initialState: CardState = {
  ids: [],
  entities: {},
};

export const cardSlice = createSlice({
  name: 'card',
  initialState,
  reducers: {
    addCard: (state, action: PayloadAction<Card>) => {
      const card = action.payload;
      // Добавляем ID в массив, если его там еще нет
      if (!state.ids.includes(card.id)) {
        state.ids.push(card.id);
      }
      // Записываем саму карточку в словарь
      state.entities[card.id] = card;
    },
    removeCard: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      // Удаляем из массива ID
      state.ids = state.ids.filter((cardId) => cardId !== id);
      // Удаляем из словаря
      delete state.entities[id];
    },
    updateCard: (state, action: PayloadAction<Card>) => {
      const card = action.payload;
      // Обновляем, только если карточка существует
      if (state.entities[card.id]) {
        state.entities[card.id] = card;
      }
    },
  },
});

export const { addCard, removeCard, updateCard } = cardSlice.actions;
export const cardReducer = cardSlice.reducer;
