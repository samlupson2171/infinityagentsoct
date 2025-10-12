import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import SessionProvider from '@/components/auth/SessionProvider';
import Navigation from '@/components/Navigation';
import { ToastProvider } from '@/components/shared/Toast';
import { QueryProvider } from '@/lib/providers/QueryProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Infinity Weekends Agent Portal',
  description:
    'Agent portal for travel agencies - access exclusive offers, training, and resources',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <SessionProvider>
            <ToastProvider>
              <Navigation />
              {children}
            </ToastProvider>
          </SessionProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
