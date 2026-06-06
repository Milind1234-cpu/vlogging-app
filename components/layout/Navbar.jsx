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
    <nav className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-white/5">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="shrink-0">
          <span className="text-xl font-black gradient-text tracking-tight">
            VlogApp
          </span>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search vlogs..."
              className="w-full bg-white/5 border border-white/10 text-white rounded-full pl-10 pr-5 py-2.5 text-sm focus:outline-none focus:border-indigo-500/50 focus:bg-white/8 transition-all placeholder-gray-500"
            />
          </div>
        </form>

        {/* Right Side */}
        <div className="flex items-center gap-3 shrink-0">
          {session ? (
            <>
              {/* Create Button */}
              <Link
                href="/create"
                className="btn-gradient text-white text-sm font-semibold px-5 py-2 rounded-full"
              >
                + Create
              </Link>

              {/* Avatar Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-indigo-500/30 hover:ring-indigo-500/60 transition-all"
                >
                  {session.user.avatar ? (
                    <img src={session.user.avatar} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                      {session.user.name?.[0]?.toUpperCase()}
                    </div>
                  )}
                </button>

                {dropdownOpen && (
                  <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                    {/* Menu */}
                    <div className="absolute right-0 mt-2 w-52 glass rounded-2xl shadow-2xl py-1 z-50 border border-white/10">
                      <div className="px-4 py-3 border-b border-white/5">
                        <p className="text-white text-sm font-semibold truncate">{session.user.name}</p>
                        <p className="text-gray-400 text-xs truncate mt-0.5">{session.user.email}</p>
                      </div>
                      <Link
                        href={`/profile/${session.user.id}`}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        👤 My Profile
                      </Link>
                      <Link
                        href="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        📊 Dashboard
                      </Link>
                      <div className="border-t border-white/5 mt-1 pt-1">
                        <button
                          onClick={() => signOut({ callbackUrl: '/login' })}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors"
                        >
                          🚪 Sign Out
                        </button>
                      </div>
                    </div>
                  </>
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
                className="btn-gradient text-white text-sm font-semibold px-5 py-2 rounded-full"
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