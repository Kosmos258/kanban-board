import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router/dom';
import { router } from './router';
import { store } from './model';

export function App() {
  return (
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  );
}
