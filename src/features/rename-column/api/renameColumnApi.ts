import { baseApi } from '@shared/api';

const renameColumnApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    renameColumn: build.mutation<
      unknown,
      { boardId: string; columnId: string; title: string }
    >({
      query: ({ columnId, title }) => ({
        url: `/columns/${columnId}`,
        method: 'PATCH',
        body: { title },
      }),
      invalidatesTags: (_r, _e, { boardId }) => [
        { type: 'Board', id: boardId },
      ],
    }),
  }),
});

export const { useRenameColumnMutation } = renameColumnApi;
