import { Link } from 'react-router';
import { ToggleThemeButton } from '@features/toggle-theme';
import styles from './AppHeader.module.scss';

export function AppHeader() {
  return (
    <header className={styles.header}>
      <Link to="/" className={styles.logo} aria-label="Kanban: на главную">
        <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">
          <rect width="32" height="32" rx="8" fill="var(--accent)" />
          <rect
            x="6"
            y="7"
            width="5.5"
            height="14"
            rx="1.5"
            fill="var(--accent-contrast)"
          />
          <rect
            x="13.25"
            y="7"
            width="5.5"
            height="18"
            rx="1.5"
            fill="var(--accent-contrast)"
            opacity=".85"
          />
          <rect
            x="20.5"
            y="7"
            width="5.5"
            height="10"
            rx="1.5"
            fill="var(--accent-contrast)"
            opacity=".7"
          />
        </svg>
        <span>Kanban</span>
      </Link>
      <ToggleThemeButton />
    </header>
  );
}
