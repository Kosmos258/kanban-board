import { baseApi } from '@shared/api';

const renameBoardApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    renameBoard: build.mutation<unknown, { boardId: string; title: string }>({
      query: ({ boardId, title }) => ({
        url: `/boards/${boardId}`,
        method: 'PATCH',
        body: { title },
      }),
      invalidatesTags: (_r, _e, { boardId }) => [
        { type: 'Board', id: boardId },
        'Boards',
      ],
    }),
  }),
});

export const { useRenameBoardMutation } = renameBoardApi;
