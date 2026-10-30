import { current } from '@reduxjs/toolkit';
import { baseApi } from '@shared/api';
import { boardApi, moveColumnInBoard } from '@entities/board';

interface MoveColumnArg {
  boardId: string;
  columnId: string;
  position: number;
}

export const moveColumnApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    moveColumn: build.mutation<unknown, MoveColumnArg>({
      query: ({ columnId, position }) => ({
        url: `/columns/${columnId}/move`,
        method: 'PATCH',
        body: { position },
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          boardApi.util.updateQueryData('getBoard', arg.boardId, (draft) => {
            draft.columns = moveColumnInBoard(
              current(draft),
              arg.columnId,
              arg.position
            ).columns;
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

export const { useMoveColumnMutation } = moveColumnApi;
