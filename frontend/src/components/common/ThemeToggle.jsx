import React from 'react';
import { useTheme } from '../../hooks/useTheme';

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const icon = theme === 'dark' ? '☀' : '☾';
  const label = theme === 'dark' ? 'Light theme' : 'Dark theme';

  return (
    <button type="button" className="btn eventhub-theme-toggle" onClick={toggleTheme} aria-label={label} title={label}>
      <span aria-hidden="true">{icon}</span>
    </button>
  );
}

export default ThemeToggle;
