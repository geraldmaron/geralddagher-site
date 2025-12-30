import animate from 'tailwindcss-animate';
import typography from '@tailwindcss/typography';
import nesting from '@tailwindcss/nesting';

/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.8rem', { lineHeight: '1.2rem', letterSpacing: '0.01em' }],
        'sm': ['0.925rem', { lineHeight: '1.45rem', letterSpacing: '0' }],
        'base': ['1.05rem', { lineHeight: '1.7rem', letterSpacing: '0' }],
        'lg': ['1.2rem', { lineHeight: '1.85rem', letterSpacing: '-0.01em' }],
        'xl': ['1.35rem', { lineHeight: '2rem', letterSpacing: '-0.01em' }],
        '2xl': ['1.6rem', { lineHeight: '2.15rem', letterSpacing: '-0.02em' }],
        '3xl': ['2rem', { lineHeight: '2.4rem', letterSpacing: '-0.02em' }],
        '4xl': ['2.4rem', { lineHeight: '2.7rem', letterSpacing: '-0.03em' }],
        '5xl': ['3.2rem', { lineHeight: '3.5rem', letterSpacing: '-0.03em' }],
        '6xl': ['4rem', { lineHeight: '1', letterSpacing: '-0.04em' }],
        '7xl': ['4.8rem', { lineHeight: '1', letterSpacing: '-0.04em' }],
        '8xl': ['6.4rem', { lineHeight: '1', letterSpacing: '-0.05em' }],
        '9xl': ['8.5rem', { lineHeight: '1', letterSpacing: '-0.05em' }],
      },
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      lineHeight: {
        none: '1',
        tight: '1.1',
        snug: '1.2',
        normal: '1.4',
        relaxed: '1.5',
        loose: '1.6',
      },
      letterSpacing: {
        tighter: '-0.025em',
        tight: '-0.0125em',
        normal: '0em',
        wide: '0.0125em',
        wider: '0.025em',
        widest: '0.05em',
      },
      zIndex: {
        'popover': '50',
        'modal': '60',
        'toast': '70',
        'tooltip': '80',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'breathing-glow': {
          '0%, 100%': { 
            transform: 'scale(1)',
            opacity: '0.15',
          },
          '50%': { 
            transform: 'scale(1.05)',
            opacity: '0.25',
          },
        },
        'breathing-scale': {
          '0%, 100%': { 
            transform: 'scale(1)',
          },
          '50%': { 
            transform: 'scale(1.02)',
          },
        },
        'cursor-blink': {
          '0%, 100%': { 
            opacity: '1',
            transform: 'scaleY(1)',
          },
          '50%': { 
            opacity: '0.3',
            transform: 'scaleY(0.8)',
          },
        },
        'pulse-subtle': {
          '0%, 100%': { 
            opacity: '1',
          },
          '50%': { 
            opacity: '0.85',
          },
        },
        'floating-particles': {
          '0%, 100%': { 
            transform: 'translateY(0px) rotate(0deg)',
            opacity: '0.2',
          },
          '25%': { 
            transform: 'translateY(-3px) rotate(90deg)',
            opacity: '0.4',
          },
          '50%': { 
            transform: 'translateY(-1px) rotate(180deg)',
            opacity: '0.6',
          },
          '75%': { 
            transform: 'translateY(-4px) rotate(270deg)',
            opacity: '0.3',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'breathing-glow': 'breathing-glow 4s ease-in-out infinite',
        'breathing-scale': 'breathing-scale 4s ease-in-out infinite',
        'cursor-blink': 'cursor-blink 1.2s ease-in-out infinite',
        'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite',
        'floating-particles': 'floating-particles 6s ease-in-out infinite',
      },
    },
  },
  plugins: [
    animate,
    typography,
    nesting,
    function({ addComponents }) {
      addComponents({
        '.dark-editor': {
          '& .ck-editor__editable': {
            '@apply bg-gray-800 text-white': {},
          },
          '& .ck.ck-editor__main > .ck-editor__editable': {
            '@apply bg-gray-800 border-gray-600': {},
          },
          '& .ck.ck-toolbar': {
            '@apply bg-gray-800 border-gray-600': {},
          },
          '& .ck.ck-button, & .ck.ck-button.ck-on': {
            '@apply text-white bg-gray-700': {},
          },
          '& .ck.ck-button:hover, & .ck.ck-button.ck-on:hover': {
            '@apply bg-gray-600': {},
          },
          '& .ck-dropdown__panel': {
            '@apply bg-gray-800 border-gray-600': {},
          },
          '& .ck-list__item': {
            '@apply text-white': {},
          },
          '& .ck-list__item:hover': {
            '@apply bg-gray-700': {},
          },
        },
        '.light-editor': {
          '& .ck-editor__editable': {
            '@apply bg-white text-black': {},
          },
          '& .ck.ck-editor__main > .ck-editor__editable': {
            '@apply bg-white border-gray-300': {},
          },
          '& .ck.ck-toolbar': {
            '@apply bg-white border-gray-300': {},
          },
          '& .ck.ck-button, & .ck.ck-button.ck-on': {
            '@apply text-black bg-gray-200': {},
          },
          '& .ck.ck-button:hover, & .ck.ck-button.ck-on:hover': {
            '@apply bg-gray-300': {},
          },
          '& .ck-dropdown__panel': {
            '@apply bg-white border-gray-300': {},
          },
          '& .ck-list__item': {
            '@apply text-black': {},
          },
          '& .ck-list__item:hover': {
            '@apply bg-gray-200': {},
          },
        },
      });
    },
  ],
};

export default config; 