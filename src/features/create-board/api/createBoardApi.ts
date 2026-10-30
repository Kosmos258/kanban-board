import { baseApi } from '@shared/api';
import type { Board } from '@entities/board';

const createBoardApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createBoard: build.mutation<Board, { title: string }>({
      query: (body) => ({ url: '/boards', method: 'POST', body }),
      invalidatesTags: ['Boards'],
    }),
  }),
});

export const { useCreateBoardMutation } = createBoardApi;
