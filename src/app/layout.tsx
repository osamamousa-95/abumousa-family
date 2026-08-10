import type { ReactNode } from 'react';
import './globals.css';

/** Root layout is intentionally thin — locale layout sets lang/dir. */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
