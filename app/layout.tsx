import { inter, oswald } from '@/app/fonts'
import { cn } from '@/lib/utils'
import './globals.css'
import Navbar from '@/components/core/Navbar'
import Footer from '@/components/core/Footer'
import ThemeProvider from '@/components/core/ThemeProvider'
import { AuthProvider } from '@/lib/auth/provider'
import { Theme } from '@radix-ui/themes'
import '@radix-ui/themes/styles.css'
import { headers } from 'next/headers'
import React from 'react'
import RootLayoutClient from './RootLayoutClient'
import { name } from '@/lib/constants'
import { Analytics } from "@vercel/analytics/react"
export const metadata = {
  title: name,
  description: 'Product and platform leader translating reliability, risk, and delivery discipline into durable business outcomes.',
  icons: {
    icon: '/Dagher_Logo_2024_Mark.png',
  },
}
export const viewport = {
  width: 'device-width',
  initialScale: 1,
}
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const hdrs = await headers();
  const theme = hdrs.get('x-theme');
  let htmlClass = cn(
    inter.variable,
    oswald.variable,
    'antialiased',
    'font-sans',
    theme === 'dark' ? 'dark' : ''
  )
  return (
    <html
      lang="en"
      className={htmlClass}
      suppressHydrationWarning
    >
      <body className={cn(
        'min-h-screen',
        'bg-white dark:bg-black',
        'text-black dark:text-white',
        'transition-colors duration-300',
        'font-sans'
      )}>
        <AuthProvider>
          <ThemeProvider>
            <Theme>
              <RootLayoutClient>
                {children}
                <Analytics />
              </RootLayoutClient>
            </Theme>
          </ThemeProvider>
        </AuthProvider>
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
                if (!document.documentElement.classList.contains('dark') && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                  document.documentElement.classList.add('dark');
                }
                if (window.localStorage.getItem('theme') === 'dark') {
                  document.documentElement.classList.add('dark');
                } else if (window.localStorage.getItem('theme') === 'light') {
                  document.documentElement.classList.remove('dark');
                }
              } catch(e) {}
            })();
          `
        }} />
      </body>
    </html>
  )
}