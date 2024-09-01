import ModalProvider from '@/components/providers/modal-provider'
import { QueryProvider } from '@/components/providers/query-provider'
import { SocketProvider } from '@/components/providers/socket-provider'
import { ThemeProvider } from '@/components/providers/theme-provider'
import ToastProvider from '@/components/providers/toast-provider'
import { cn } from '@/lib/utils'
import { ClerkProvider } from '@clerk/nextjs'
import type { Metadata } from 'next'
import { Open_Sans } from 'next/font/google'
import './globals.css'

const font = Open_Sans({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Re-Discord',
  description: 'Chat and video communication app.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider afterSignOutUrl={process.env.NEXT_PUBLIC_SITE_URL}>
      <html lang="en">
        <body className={cn(font.className, 'bg-white dark:bg-[#313338] antialiased')}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem={false}
            disableTransitionOnChange
          >
            <SocketProvider>
              <QueryProvider>{children}</QueryProvider>
              <ModalProvider />
            </SocketProvider>
            <ToastProvider />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
