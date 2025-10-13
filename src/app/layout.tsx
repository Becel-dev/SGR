import type { Metadata } from 'next';
import { PT_Sans } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { UserProvider } from '@/components/auth/user-provider';
import { SessionProvider } from '@/components/auth/session-provider';

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-pt-sans',
});

export const metadata: Metadata = {
  title: 'SGR: Sistema de Gestão de Riscos',
  description: 'Portal de Gestão de Riscos',
  icons: {
    // 1x1 transparent PNG data URI to effectively show no favicon in browser tabs
    icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${ptSans.variable} font-body antialiased`}>
        <SessionProvider>
          <UserProvider>
            {children}
            <Toaster />
          </UserProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
