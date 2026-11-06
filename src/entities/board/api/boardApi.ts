import { baseApi } from '@shared/api';
import type { Board, BoardSummary } from '../model/types';

export const boardApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getBoards: build.query<BoardSummary[], void>({
      query: () => '/boards',
      providesTags: ['Boards'],
    }),
    getBoard: build.query<Board, string>({
      query: (boardId) => `/boards/${boardId}`,
      providesTags: (_result, _error, boardId) => [
        { type: 'Board', id: boardId },
      ],
    }),
  }),
});

export const { useGetBoardsQuery, useGetBoardQuery } = boardApi;
