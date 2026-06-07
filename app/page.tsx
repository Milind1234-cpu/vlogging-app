'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

// ─── Static marketing data ───────────────────────────────────────────────────

const STATS = [
  { value: '12K+', label: 'Creators onboarded', change: '↑24%', note: 'vs last month' },
  { value: '45K+', label: 'Vlogs published',    change: '↑18%', note: 'vs last month' },
  { value: '2.1M', label: 'Views generated',    change: '↑42%', note: 'vs last month' },
  { value: '96%',  label: 'Creator satisfaction', change: '↑3%', note: 'vs last month' },
];

const FEATURES = [
  {
    icon: '🎬',
    title: 'Powerful Video Upload',
    desc: 'Upload up to 500 MB. Direct to Cloudinary with real-time progress tracking.',
  },
  {
    icon: '🖼️',
    title: 'Custom Thumbnails',
    desc: 'Drag, drop, and publish. Every vlog deserves a stunning cover.',
  },
  {
    icon: '👤',
    title: 'Public Creator Profiles',
    desc: 'Your own space. Showcase your vlogs, stats, and personality.',
  },
  {
    icon: '📊',
    title: 'Real-time Analytics',
    desc: 'Track views, likes, and engagement. Know what resonates with your audience.',
  },
  {
    icon: '❤️',
    title: 'Likes & Engagement',
    desc: 'Build community. Viewers can like and explore more of your content.',
  },
  {
    icon: '🔍',
    title: 'Discovery Feed',
    desc: 'Find your next favourite creator. Filter by category, sort by trending.',
  },
];

const TESTIMONIALS = [
  {
    initials: 'AC',
    name: 'Alex Chen',
    role: 'Travel Videographer',
    quote:
      'VlogApp changed how I share my travel footage. The focus on storytelling over algorithms is exactly what creators need.',
  },
  {
    initials: 'SK',
    name: 'Sarah Kim',
    role: 'Lifestyle Creator',
    quote:
      "I've tried every platform out there. VlogApp is the first that actually makes me want to upload every day.",
  },
  {
    initials: 'MJ',
    name: 'Marcus Johnson',
    role: 'Tech Reviewer',
    quote:
      'The analytics alone are worth it. I can see exactly what my audience loves and create more of it. Pure gold.',
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ value, label, change, note }: { value: string; label: string; change: string; note: string }) {
  return (
    <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 dark:border-white/5 text-center transition-colors">
      <p className="text-3xl font-black text-gray-900 dark:text-white mb-1">{value}</p>
      <p className="text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">{label}</p>
      <p className="text-green-500 dark:text-green-400 text-xs font-semibold">
        {change} <span className="text-gray-400 dark:text-gray-500 font-normal">{note}</span>
      </p>
    </div>
  );
}

function FeaturedVlogCard({ vlog }: { vlog: any }) {
  function formatCount(n: number) {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
  }

  return (
    <Link href={`/vlog/${vlog._id}`} className="group block">
      <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl rounded-2xl overflow-hidden border border-gray-200 dark:border-white/5 hover:border-indigo-500/30 transition-all duration-300">
        <div className="relative aspect-video bg-gray-200 dark:bg-gray-800">
          {vlog.thumbnailUrl ? (
            <Image
              src={vlog.thumbnailUrl}
              alt={vlog.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600 text-4xl">🎬</div>
          )}
          {vlog.category && (
            <span className="absolute top-2 left-2 bg-indigo-600/80 backdrop-blur-sm text-white text-xs px-2.5 py-0.5 rounded-full capitalize font-medium">
              {vlog.category}
            </span>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-gray-900 dark:text-white font-semibold text-sm line-clamp-2 mb-2 group-hover:text-indigo-500 dark:group-hover:text-indigo-300 transition-colors">
            {vlog.title}
          </h3>
          {vlog.description && (
            <p className="text-gray-500 text-xs line-clamp-2 mb-3">{vlog.description}</p>
          )}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="text-gray-600 dark:text-gray-400">{vlog.creator?.name}</span>
            <div className="flex items-center gap-3">
              <span>👁 {formatCount(vlog.viewCount || 0)}</span>
              <span>❤️ {formatCount(vlog.likeCount || 0)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const { data: session } = useSession();
  const [featuredVlogs, setFeaturedVlogs] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/vlogs?limit=3&sort=most_viewed')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setFeaturedVlogs(d.data.vlogs);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-24 pb-24">

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative -mx-4 text-center px-6 pt-20 pb-32 overflow-hidden">

        {/* ── Background layers ── */}
        <div className="absolute inset-0 bg-white dark:bg-[#030712] transition-colors" />
        {/* Primary cyan glow — top centre */}
        <div className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-cyan-500/20 dark:bg-cyan-500/10 rounded-full blur-[130px] pointer-events-none" />
        {/* Secondary blue glow — slightly left */}
        <div className="absolute top-10 left-[30%] w-[500px] h-[400px] bg-blue-600/20 dark:bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
        {/* Subtle teal accent — right */}
        <div className="absolute top-20 right-[20%] w-[300px] h-[300px] bg-teal-500/20 dark:bg-teal-500/10 rounded-full blur-[90px] pointer-events-none" />
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-gray-50 dark:to-gray-950 pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto">

          {/* ── AI badge ── */}
          <div className="inline-flex items-center gap-2 border border-cyan-500/30 bg-cyan-500/10 dark:bg-cyan-500/5 text-cyan-600 dark:text-cyan-300 text-xs font-semibold px-5 py-2 rounded-full mb-10 tracking-wide shadow-[0_0_20px_rgba(6,182,212,0.15)] backdrop-blur-sm">
            <span
              className="w-1.5 h-1.5 rounded-full bg-cyan-500 dark:bg-cyan-400 inline-block"
              style={{ boxShadow: '0 0 6px rgba(34,211,238,0.8)', animation: 'pulse 2s ease-in-out infinite' }}
            />
            AI-Powered Visual Search
          </div>

          {/* ── Headline ── */}
          <h1 className="font-black leading-[1.08] mb-8 tracking-tight" style={{ fontSize: 'clamp(2.8rem, 7.5vw, 5.2rem)' }}>
            <span className="text-gray-900 dark:text-white">Find photos from </span>
            <br />
            <span
              style={{
                background: 'linear-gradient(120deg, #38bdf8 0%, #22d3ee 40%, #67e8f9 70%, #a5f3fc 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              your life in seconds.
            </span>
          </h1>

          {/* ── Subheadline ── */}
          <p className="text-gray-600 dark:text-gray-400 text-lg md:text-xl mb-14 max-w-2xl mx-auto leading-relaxed">
            Search thousands of images using natural language. Describe a moment,
            place, object, or memory — and instantly discover the photos
            you&apos;re looking for.
          </p>

          {/* ── CTA buttons ── */}
          <div className="flex items-center justify-center gap-4 flex-wrap mb-14">
            {session ? (
              <Link
                href="/create"
                className="relative inline-flex items-center gap-2 text-white font-bold px-9 py-4 rounded-full text-base transition-all"
                style={{
                  background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
                  boxShadow: '0 0 30px rgba(6,182,212,0.5), 0 8px 32px rgba(14,165,233,0.3)',
                }}
              >
                <span>⚡</span> Start Searching
              </Link>
            ) : (
              <Link
                href="/register"
                className="relative inline-flex items-center gap-2 text-white font-bold px-9 py-4 rounded-full text-base transition-all"
                style={{
                  background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
                  boxShadow: '0 0 30px rgba(6,182,212,0.5), 0 8px 32px rgba(14,165,233,0.3)',
                }}
              >
                <span>⚡</span> Start Searching
              </Link>
            )}
            <Link
              href="/vlogs"
              className="inline-flex items-center gap-2 border border-gray-300 dark:border-white/10 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-900 dark:text-white font-bold px-9 py-4 rounded-full text-base transition-all backdrop-blur-sm"
            >
              <span>▶</span> See Demo
            </Link>
          </div>

          {/* ── Floating search bar mockup ── */}
          <div
            className="max-w-2xl mx-auto rounded-2xl p-[1px] mb-12"
            style={{
              background: 'linear-gradient(135deg, rgba(6,182,212,0.3), rgba(14,165,233,0.1), rgba(255,255,255,0.05))',
            }}
          >
            <div
              className="rounded-2xl px-5 py-4 flex items-center gap-4 bg-white/90 dark:bg-[rgba(3,7,18,0.85)] backdrop-blur-xl"
            >
              {/* Search icon */}
              <div className="shrink-0 w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-500 dark:text-cyan-400 text-sm">
                🔍
              </div>

              {/* Placeholder text that looks typed */}
              <div className="flex-1 text-left">
                <p className="text-gray-700 dark:text-gray-300 text-sm md:text-base font-medium">
                  sunset photos from my trip to Goa last December...
                  <span
                    className="inline-block w-[2px] h-[1em] bg-cyan-500 dark:bg-cyan-400 ml-1 align-middle"
                    style={{ animation: 'blink 1s step-end infinite' }}
                  />
                </p>
                <p className="text-gray-500 dark:text-gray-600 text-xs mt-0.5">Searching across 12,847 photos</p>
              </div>

              {/* Search chip results */}
              <div className="hidden sm:flex items-center gap-2 shrink-0">
                <span className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-300 text-xs px-3 py-1 rounded-full">
                  📍 Goa
                </span>
                <span className="bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-300 text-xs px-3 py-1 rounded-full">
                  🌅 Sunset
                </span>
              </div>
            </div>
          </div>

          {/* ── Trust text ── */}
          <p className="text-gray-500 dark:text-gray-600 text-sm">
            Trusted by{' '}
            <span className="text-gray-700 dark:text-gray-400 font-medium">photographers</span>,{' '}
            <span className="text-gray-700 dark:text-gray-400 font-medium">travelers</span>, and{' '}
            <span className="text-gray-700 dark:text-gray-400 font-medium">creators</span>
          </p>

        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4">
        <p className="text-center text-gray-400 dark:text-gray-500 text-sm uppercase tracking-widest mb-8 font-medium">
          Your story starts here — what will you create today?
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
      </section>

      {/* ── FEATURED VLOGS ────────────────────────────────────────────────── */}
      {featuredVlogs.length > 0 && (
        <section className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-indigo-500 dark:text-indigo-400 text-xs uppercase tracking-widest font-semibold mb-1">Featured</p>
              <h2 className="text-gray-900 dark:text-white text-2xl font-black">
                Handpicked vlogs from our community
              </h2>
            </div>
            <Link
              href="/vlogs"
              className="text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 text-sm font-medium transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredVlogs.map((v) => (
              <FeaturedVlogCard key={v._id} vlog={v} />
            ))}
          </div>
        </section>
      )}

      {/* ── FEATURES GRID ─────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-indigo-500 dark:text-indigo-400 text-xs uppercase tracking-widest font-semibold mb-2">Platform</p>
          <h2 className="text-gray-900 dark:text-white text-3xl font-black mb-3">
            Everything you need to create
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto text-sm">
            A powerful platform designed for modern video creators.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="bg-white/80 dark:bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 dark:border-white/5 hover:border-indigo-500/30 transition-all group"
            >
              <div className="text-3xl mb-4 group-hover:scale-110 transition-transform inline-block">
                {f.icon}
              </div>
              <h3 className="text-gray-900 dark:text-white font-bold mb-2 text-sm">{f.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-indigo-500 dark:text-indigo-400 text-xs uppercase tracking-widest font-semibold mb-2">Community</p>
          <h2 className="text-gray-900 dark:text-white text-3xl font-black">Loved by creators</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
            Hear from the people already building on VlogApp.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="bg-white/80 dark:bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 dark:border-white/5">
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-sm">★</span>
                ))}
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-6 italic">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {t.initials}
                </div>
                <div>
                  <p className="text-gray-900 dark:text-white text-sm font-semibold">{t.name}</p>
                  <p className="text-gray-500 text-xs">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 text-center">
        <div className="relative rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 dark:from-indigo-900/50 via-purple-50 dark:via-purple-900/30 to-gray-100 dark:to-gray-900 rounded-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-200/30 dark:from-indigo-600/10 via-transparent to-transparent" />
          <div className="relative z-10 py-16 px-8">
            <h2 className="text-gray-900 dark:text-white text-4xl font-black mb-4">
              Ready to share your story?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Join thousands of creators already using VlogApp. It's free to
              start, and always will be.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              {session ? (
                <Link
                  href="/create"
                  className="btn-gradient text-white font-semibold px-8 py-3.5 rounded-full text-sm"
                >
                  + Upload a Vlog
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="btn-gradient text-white font-semibold px-8 py-3.5 rounded-full text-sm"
                  >
                    Get started free
                  </Link>
                  <Link
                    href="/login"
                    className="bg-white dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white font-semibold px-8 py-3.5 rounded-full text-sm transition-all"
                  >
                    Sign in
                  </Link>
                </>
              )}
            </div>
            <p className="text-gray-500 dark:text-gray-600 text-xs mt-6">
              No credit card required · Free forever · Cancel anytime
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
