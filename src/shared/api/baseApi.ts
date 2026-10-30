import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from '@shared/config';

// Один baseApi на всё приложение. Эндпоинты добавляются там, где они нужны (injectEndpoints)
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: API_URL }),
  tagTypes: ['Boards', 'Board'],
  endpoints: () => ({}),
});
