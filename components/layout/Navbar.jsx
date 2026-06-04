'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/?search=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-gray-950 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-white shrink-0">
          VlogApp
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vlogs..."
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-full px-5 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
          />
        </form>

        {/* Right Side */}
        <div className="flex items-center gap-3 shrink-0">
          {session ? (
            <>
              {/* Create Button */}
              <Link
                href="/create"
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-full transition-colors"
              >
                + Create
              </Link>

              {/* Avatar Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-white font-semibold text-sm overflow-hidden"
                >
                  {session.user.avatar ? (
                    <img src={session.user.avatar} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    // Show first letter of name if no avatar
                    session.user.name?.[0]?.toUpperCase()
                  )}
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-xl shadow-xl py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-700">
                      <p className="text-white text-sm font-medium truncate">{session.user.name}</p>
                      <p className="text-gray-400 text-xs truncate">{session.user.email}</p>
                    </div>
                    <Link
                      href={`/profile/${session.user.id}`}
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                    >
                      My Profile
                    </Link>
                    <Link
                      href="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: '/login' })}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-gray-800 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-gray-300 hover:text-white text-sm transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-full transition-colors"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}