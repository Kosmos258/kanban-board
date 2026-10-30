import { current } from '@reduxjs/toolkit';
import { baseApi } from '@shared/api';
import { boardApi, moveCardInBoard } from '@entities/board';

interface MoveCardArg {
  boardId: string;
  cardId: string;
  columnId: string;
  position: number;
}

export const moveCardApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    moveCard: build.mutation<unknown, MoveCardArg>({
      query: ({ cardId, columnId, position }) => ({
        url: `/cards/${cardId}/move`,
        method: 'PATCH',
        body: { columnId, position },
      }),
      // Оптимистичное обновление: интерфейс меняется сразу, не дожидаясь сервера.
      // Если сервер отказал, возвращаем кэш как было и перезапрашиваем доску
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          boardApi.util.updateQueryData('getBoard', arg.boardId, (draft) => {
            const next = moveCardInBoard(
              current(draft),
              arg.cardId,
              arg.columnId,
              arg.position
            );
            // Immer ждёт либо изменения draft, либо новый объект: заменяем содержимое
            draft.columns = next.columns;
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
          dispatch(
            baseApi.util.invalidateTags([{ type: 'Board', id: arg.boardId }])
          );
        }
      },
    }),
  }),
});

export const { useMoveCardMutation } = moveCardApi;
