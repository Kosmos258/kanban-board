import { baseApi } from '@shared/api';

interface CardArg {
  boardId: string;
  cardId: string;
}

const editCardApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    updateCard: build.mutation<
      unknown,
      CardArg & { title?: string; description?: string | null }
    >({
      query: ({ cardId, title, description }) => ({
        url: `/cards/${cardId}`,
        method: 'PATCH',
        body: { title, description },
      }),
      invalidatesTags: (_r, _e, { boardId }) => [
        { type: 'Board', id: boardId },
      ],
    }),
    deleteCard: build.mutation<void, CardArg>({
      query: ({ cardId }) => ({ url: `/cards/${cardId}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, { boardId }) => [
        { type: 'Board', id: boardId },
        'Boards',
      ],
    }),
  }),
});

export const { useUpdateCardMutation, useDeleteCardMutation } = editCardApi;
