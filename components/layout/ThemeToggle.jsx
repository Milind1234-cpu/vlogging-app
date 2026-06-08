'use client';

import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  const handleClick = () => {
    console.log('Button clicked! Current theme:', theme);
    toggleTheme();
  };

  return (
    <button
      onClick={handleClick}
      type="button"
      className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-200 dark:bg-white/5 hover:bg-gray-300 dark:hover:bg-white/10 border border-gray-300 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20 transition-all text-lg"
      aria-label="Toggle theme"
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
