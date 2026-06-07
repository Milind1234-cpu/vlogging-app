import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import SessionProvider from '@/components/layout/SessionProvider';
import { ThemeProvider } from '@/contexts/ThemeContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const geist = Geist({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'VlogApp',
  description: 'Share your vlogs with the world',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get session on server side to pass to SessionProvider
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var initial = theme || (prefersDark ? 'dark' : 'light');
                  if (initial === 'dark') {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${geist.className} bg-gray-50 dark:bg-gray-950 min-h-screen transition-colors`}>
        <ThemeProvider>
          <SessionProvider session={session}>
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 py-6">
              {children}
            </main>
            <Footer />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}