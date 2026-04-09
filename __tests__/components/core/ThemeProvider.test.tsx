import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ThemeProvider, { useTheme } from '@/components/core/ThemeProvider';

function ThemeConsumer() {
  const { themeMode, isDarkMode, setThemeMode } = useTheme();

  return (
    <div>
      <span data-testid="theme-state">{`${themeMode}:${isDarkMode ? 'dark' : 'light'}`}</span>
      <button type="button" onClick={() => setThemeMode('light')}>
        Set light
      </button>
    </div>
  );
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    document.documentElement.removeAttribute('data-theme');
  });

  it('initializes dark mode from localStorage', async () => {
    localStorage.setItem('theme', 'dark');

    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('theme-state')).toHaveTextContent('dark:dark');
    });

    expect(document.documentElement).toHaveClass('dark');
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  });

  it('resolves system mode without forcing dark class when system prefers light', async () => {
    localStorage.setItem('theme', 'system');

    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('theme-state')).toHaveTextContent('system:light');
    });

    expect(document.documentElement).not.toHaveClass('dark');
    expect(document.documentElement).toHaveAttribute('data-theme', 'system');
  });

  it('persists explicit theme changes', async () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('theme-state')).toHaveTextContent('system:light');
    });

    fireEvent.click(screen.getByRole('button', { name: 'Set light' }));

    await waitFor(() => {
      expect(screen.getByTestId('theme-state')).toHaveTextContent('light:light');
    });

    expect(localStorage.getItem('theme')).toBe('light');
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
  });
});
