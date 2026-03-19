'use client';
import * as React from 'react';
import { useTheme } from '@/components/core/ThemeProvider';
import { Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
  const { themeMode, setThemeMode } = useTheme();

  const cycleTheme = () => {
    switch (themeMode) {
      case 'system': setThemeMode('light'); break;
      case 'light': setThemeMode('dark'); break;
      case 'dark': setThemeMode('system'); break;
    }
  };

  const getIcon = () => {
    switch (themeMode) {
      case 'light': return <Sun className="h-4 w-4 text-amber-500" />;
      case 'dark': return <Moon className="h-4 w-4 text-blue-400" />;
      default: return <Monitor className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getAriaLabel = () => {
    switch (themeMode) {
      case 'light': return 'Switch to dark mode';
      case 'dark': return 'Switch to system theme';
      default: return 'Switch to light mode';
    }
  };

  return (
    <button
      onClick={cycleTheme}
      className={cn(
        'inline-flex items-center justify-center w-9 h-9 rounded-lg',
        'bg-muted/60 border border-border/60',
        'hover:bg-muted transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
      )}
      aria-label={getAriaLabel()}
    >
      {getIcon()}
    </button>
  );
}
