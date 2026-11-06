import { isRejectedWithValue, type Middleware } from '@reduxjs/toolkit';
import { getErrorMessage } from '@shared/api';
import { showToast } from '@shared/ui';

export const errorToastMiddleware: Middleware = (api) => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    const arg = (action.meta as { arg?: { type?: string } }).arg;
    if (arg?.type === 'mutation') {
      api.dispatch(showToast('error', getErrorMessage(action.payload)));
    }
  }
  return next(action);
};
