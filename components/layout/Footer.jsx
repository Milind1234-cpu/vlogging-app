import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-gray-200 dark:border-white/5 bg-gray-50/80 dark:bg-gray-950/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">

        {/* Brand */}
        <Link href="/">
          <span className="text-lg font-black gradient-text tracking-tight">VlogApp</span>
        </Link>

        {/* Copyright */}
        <p className="text-gray-500 dark:text-gray-600 text-xs order-last sm:order-none">
          © {new Date().getFullYear()} VlogApp. All rights reserved.
        </p>

        {/* Nav links */}
        <nav className="flex items-center gap-5 text-sm text-gray-600 dark:text-gray-400">
          <Link href="/vlogs" className="hover:text-gray-900 dark:hover:text-white transition-colors">
            Browse
          </Link>
          <Link href="/register" className="hover:text-gray-900 dark:hover:text-white transition-colors">
            Sign up
          </Link>
          <Link href="/login" className="hover:text-gray-900 dark:hover:text-white transition-colors">
            Sign in
          </Link>
        </nav>

      </div>
    </footer>
  );
}
