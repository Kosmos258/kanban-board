import { baseApi } from '@shared/api';

const addColumnApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    addColumn: build.mutation<unknown, { boardId: string; title: string }>({
      query: ({ boardId, title }) => ({
        url: `/boards/${boardId}/columns`,
        method: 'POST',
        body: { title },
      }),
      invalidatesTags: (_r, _e, { boardId }) => [
        { type: 'Board', id: boardId },
        'Boards',
      ],
    }),
  }),
});

export const { useAddColumnMutation } = addColumnApi;
