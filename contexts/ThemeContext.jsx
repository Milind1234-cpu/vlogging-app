'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({ theme: 'light', toggleTheme: () => {} });

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = stored || (prefersDark ? 'dark' : 'light');
    setTheme(initial);
    
    // Apply initial theme
    if (initial === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    setMounted(true);
  }, []);

  // Apply theme changes
  useEffect(() => {
    console.log('Theme effect running. Mounted:', mounted, 'Theme:', theme);
    if (mounted) {
      const htmlElement = document.documentElement;
      if (theme === 'dark') {
        console.log('Adding dark class to html');
        htmlElement.classList.add('dark');
        htmlElement.style.colorScheme = 'dark';
      } else {
        console.log('Removing dark class from html');
        htmlElement.classList.remove('dark');
        htmlElement.style.colorScheme = 'light';
      }
      console.log('HTML classes after update:', htmlElement.className);
      console.log('Color scheme:', htmlElement.style.colorScheme);
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    console.log('Toggle theme called! Current theme:', theme);
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    console.log('New theme will be:', newTheme);
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    console.log('Theme updated in localStorage');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  return context;
}
