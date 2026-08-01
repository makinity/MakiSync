import type { Metadata } from 'next';
import { Inter, Geist } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import LoadingOverlayProvider from '@/components/LoadingOverlayProvider';
import ChatWidget from '@/components/ChatWidget';
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'MakiSync',
  description: 'MakiSync Admin Panel',
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
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
        <Script
          id="metricool-tracker"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              function loadScript(a){var b=document.getElementsByTagName("head")[0],c=document.createElement("script");c.type="text/javascript",c.src="https://tracker.metricool.com/resources/be.js",c.onreadystatechange=a,c.onload=a,b.appendChild(c)}loadScript(function(){beTracker.t({hash:"903a8c6a5d4c04fb167c4cb656412da5"})});
            `,
          }}
        />
      </body>
    </html>
  );
}
