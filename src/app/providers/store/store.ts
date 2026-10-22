import { configureStore } from '@reduxjs/toolkit';
import { cardReducer } from '@entities/card/model';
import { columnReducer } from '@entities/column/model';

export const store = configureStore({
  reducer: {
    card: cardReducer,
    column: columnReducer, // 👈 добавили колонки
  },
});

// Типизируем RootState и Dispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
