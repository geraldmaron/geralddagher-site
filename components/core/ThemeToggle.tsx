'use client';
import * as React from 'react';
import { useTheme } from '@/components/core/ThemeProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon, faDesktop } from '@fortawesome/free-solid-svg-icons';
export function ThemeToggle() {
  const { themeMode, setThemeMode } = useTheme();
  const cycleTheme = () => {
    switch (themeMode) {
      case 'system':
        setThemeMode('light');
        break;
      case 'light':
        setThemeMode('dark');
        break;
      case 'dark':
        setThemeMode('system');
        break;
    }
  };
  const getIcon = () => {
    switch (themeMode) {
      case 'light':
        return faSun;
      case 'dark':
        return faMoon;
      default:
        return faDesktop;
    }
  };
  const getAriaLabel = () => {
    switch (themeMode) {
      case 'light':
        return 'Switch to dark mode';
      case 'dark':
        return 'Switch to system theme';
      default:
        return 'Switch to light mode';
    }
  };
  return (
    <button
      onClick={cycleTheme}
      className="inline-flex items-center justify-center rounded-md p-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
      aria-label={getAriaLabel()}
    >
      <FontAwesomeIcon icon={getIcon()} className="h-5 w-5" />
    </button>
  );
}