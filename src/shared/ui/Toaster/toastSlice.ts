import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit';

export interface Toast {
  id: string;
  kind: 'success' | 'error';
  message: string;
}

export const toastSlice = createSlice({
  name: 'toast',
  initialState: [] as Toast[],
  reducers: {
    showToast: {
      reducer: (state, action: PayloadAction<Toast>) => {
        // Не больше трёх сообщений сразу, старые вытесняются
        state.push(action.payload);
        if (state.length > 3) state.shift();
      },
      prepare: (kind: Toast['kind'], message: string) => ({
        payload: { id: nanoid(), kind, message },
      }),
    },
    dismissToast: (state, action: PayloadAction<string>) =>
      state.filter((toast) => toast.id !== action.payload),
  },
});

export const { showToast, dismissToast } = toastSlice.actions;
export const toastReducer = toastSlice.reducer;
