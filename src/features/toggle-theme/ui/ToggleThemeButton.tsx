import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@shared/lib';
import { IconButton } from '@shared/ui';

export function ToggleThemeButton() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <IconButton
      aria-label={isDark ? 'Включить светлую тему' : 'Включить тёмную тему'}
      onClick={toggleTheme}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </IconButton>
  );
}
