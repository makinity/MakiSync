import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import LoadingOverlayProvider from '@/components/LoadingOverlayProvider';
import ChatWidget from '@/components/ChatWidget';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'MakiSync',
  description: 'MakiSync Admin Panel',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            var t = localStorage.getItem('theme') || 'dark';
            document.documentElement.setAttribute('data-theme', t);
          })();
        `}} />
      </head>
      <body className={inter.variable}>
        <LoadingOverlayProvider>
          {children}
          <ChatWidget />
        </LoadingOverlayProvider>
      </body>
    </html>
  );
}
