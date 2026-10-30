import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from '@shared/api';
import { toastReducer } from '@shared/ui';
import { errorToastMiddleware } from './errorToastMiddleware';

// Фабрика, а не готовый стор: в каждом тесте нужен свой чистый кэш
export function setupStore() {
  return configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
      toast: toastReducer,
    },
    middleware: (getDefault) =>
      getDefault().concat(baseApi.middleware, errorToastMiddleware),
  });
}

export const store = setupStore();

export type AppStore = ReturnType<typeof setupStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
