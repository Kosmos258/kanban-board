import { baseApi } from '@shared/api';

const deleteColumnApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    deleteColumn: build.mutation<void, { boardId: string; columnId: string }>({
      query: ({ columnId }) => ({
        url: `/columns/${columnId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, { boardId }) => [
        { type: 'Board', id: boardId },
        'Boards',
      ],
    }),
  }),
});

export const { useDeleteColumnMutation } = deleteColumnApi;
