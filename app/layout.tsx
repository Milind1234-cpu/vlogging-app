import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import SessionProvider from '@/components/layout/SessionProvider';
import Navbar from '@/components/layout/Navbar';

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
      <body className={`${geist.className} bg-gray-950 min-h-screen`}>
        <SessionProvider session={session}>
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 py-6">
            {children}
          </main>
        </SessionProvider>
      </body>
    </html>
  );
}