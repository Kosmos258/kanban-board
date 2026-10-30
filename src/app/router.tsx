import { createBrowserRouter } from 'react-router';
import { BoardPage } from '@pages/board';
import { BoardsPage } from '@pages/boards';
import { NotFoundPage } from '@pages/not-found';
import { Layout } from './Layout';

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <BoardsPage /> },
      { path: '/boards/:boardId', element: <BoardPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
