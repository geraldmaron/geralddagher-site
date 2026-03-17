import { inter } from '@/app/fonts'
import { cn } from '@/lib/utils'
import './globals.css'
import ThemeProvider from '@/components/core/ThemeProvider'
import { AuthProvider } from '@/lib/auth/provider'
import { headers } from 'next/headers'
import React from 'react'
import RootLayoutClient from './RootLayoutClient'
import { name } from '@/lib/constants'
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"

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
  const htmlClass = cn(
    inter.variable,
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
      <body className="min-h-screen bg-background text-foreground font-sans">
        <AuthProvider>
          <ThemeProvider>
            <RootLayoutClient>
              {children}
            </RootLayoutClient>
          </ThemeProvider>
        </AuthProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
