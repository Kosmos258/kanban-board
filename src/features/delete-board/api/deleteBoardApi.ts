import { baseApi } from '@shared/api';

const deleteBoardApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    deleteBoard: build.mutation<void, string>({
      query: (boardId) => ({ url: `/boards/${boardId}`, method: 'DELETE' }),
      invalidatesTags: ['Boards'],
    }),
  }),
});

export const { useDeleteBoardMutation } = deleteBoardApi;
