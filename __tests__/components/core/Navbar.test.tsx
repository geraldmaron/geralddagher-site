import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

let pathname = '/';
const push = vi.fn();
const setThemeMode = vi.fn();
let isDarkMode = false;
let themeMode: 'light' | 'dark' | 'system' = 'system';

vi.mock('next/navigation', () => ({
  usePathname: () => pathname,
  useRouter: () => ({ push }),
}));

vi.mock('next/image', () => ({
  default: ({ fill: _fill, priority: _priority, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; priority?: boolean }) => (
    <img {...props} alt={props.alt ?? ''} />
  ),
}));

vi.mock('framer-motion', async () => {
  const ReactModule = await import('react');

  const motion = new Proxy({}, {
    get: (_, tag: string) => ReactModule.forwardRef<HTMLElement, any>(({ children, layoutId: _layoutId, whileTap: _whileTap, ...props }, ref) =>
      ReactModule.createElement(tag, { ...props, ref }, children)
    ),
  });

  return {
    motion,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

vi.mock('@/components/core/ThemeProvider', () => ({
  useTheme: () => ({
    isDarkMode,
    themeMode,
    setThemeMode,
  }),
}));

vi.mock('@/lib/auth/provider', () => ({
  useAuth: () => ({
    user: null,
    signOut: vi.fn(),
    loading: false,
  }),
}));

vi.mock('@/lib/auth/client-groups', () => ({
  hasAdminAccess: () => false,
}));

vi.mock('@/lib/directus/utils/avatar', () => ({
  getAvatarUrl: () => '',
}));

vi.mock('@/lib/utils/z-index', () => ({
  zIndex: { navbar: 50 },
}));

vi.mock('@/components/SubscriptionModal', () => ({
  default: () => null,
}));

import Navbar from '@/components/core/Navbar';

describe('Navbar', () => {
  beforeEach(() => {
    pathname = '/';
    isDarkMode = false;
    themeMode = 'system';
    push.mockReset();
    setThemeMode.mockReset();
    Object.defineProperty(window, 'scrollY', {
      value: 0,
      writable: true,
      configurable: true,
    });
  });

  it('uses default tone on the homepage before scroll in light mode', () => {
    render(<Navbar />);

    expect(screen.getByRole('banner')).toHaveAttribute('data-nav-tone', 'default');
  });

  it('uses inverted tone on the homepage before scroll in dark mode', () => {
    isDarkMode = true;
    themeMode = 'dark';

    render(<Navbar />);

    expect(screen.getByRole('banner')).toHaveAttribute('data-nav-tone', 'inverted');
  });

  it('switches to default tone after scrolling on the homepage', async () => {
    render(<Navbar />);

    Object.defineProperty(window, 'scrollY', {
      value: 64,
      writable: true,
      configurable: true,
    });

    fireEvent.scroll(window);

    await waitFor(() => {
      expect(screen.getByRole('banner')).toHaveAttribute('data-nav-tone', 'default');
    });
  });

  it('uses default tone on non-home public routes', () => {
    pathname = '/blog';

    render(<Navbar />);

    expect(screen.getByRole('banner')).toHaveAttribute('data-nav-tone', 'default');
  });
});
