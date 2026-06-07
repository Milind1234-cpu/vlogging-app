'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) setSubmitted(true);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 relative overflow-hidden">

      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-4xl font-black gradient-text mb-2">VlogApp</h1>
          </Link>
          <p className="text-gray-400">Reset your password</p>
        </div>

        <div className="glass rounded-3xl p-8 border border-white/10">
          {submitted ? (
            <div className="text-center py-4">
              <div className="text-5xl mb-4">📬</div>
              <h2 className="text-white font-bold text-lg mb-2">Check your email</h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                If an account exists for <span className="text-white">{email}</span>, you'll
                receive a password reset link shortly.
              </p>
              <Link
                href="/login"
                className="inline-block mt-6 text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
              >
                ← Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-white font-bold text-lg mb-1">Forgot your password?</h2>
              <p className="text-gray-400 text-sm mb-6">
                Enter your email and we'll send you a reset link.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full bg-white/5 border border-white/10 text-white rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500/50 transition-all placeholder-gray-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full btn-gradient text-white font-semibold py-3 rounded-2xl"
                >
                  Send reset link
                </button>
              </form>

              <p className="text-center text-gray-500 text-sm mt-6">
                Remember your password?{' '}
                <Link href="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
