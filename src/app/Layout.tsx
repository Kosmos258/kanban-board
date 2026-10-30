import { Outlet } from 'react-router';
import { AppHeader } from '@widgets/app-header';
import { Toaster } from '@shared/ui';
import styles from './Layout.module.scss';

export function Layout() {
  return (
    <div className={styles.layout}>
      <AppHeader />
      <main className={styles.main}>
        <Outlet />
      </main>
      <Toaster />
    </div>
  );
}
