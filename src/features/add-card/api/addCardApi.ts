import { baseApi } from '@shared/api';

const addCardApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    addCard: build.mutation<
      unknown,
      { boardId: string; columnId: string; title: string }
    >({
      query: ({ columnId, title }) => ({
        url: `/columns/${columnId}/cards`,
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

export const { useAddCardMutation } = addCardApi;
