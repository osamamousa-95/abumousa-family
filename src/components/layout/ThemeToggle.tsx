'use client';

import { useEffect, useState } from 'react';

export function ThemeToggle({ label }: { label: string }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const prefers = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = stored ? stored === 'dark' : prefers;
    setDark(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggle}
      aria-label={label}
      className="rounded-full p-2 text-[var(--color-muted)] transition hover:bg-[var(--color-paper-2)] hover:text-[var(--color-primary)]"
    >
      {dark ? '☀' : '☾'}
    </button>
  );
}
