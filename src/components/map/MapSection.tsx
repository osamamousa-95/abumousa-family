'use client';

import dynamic from 'next/dynamic';
import type { PlaceInfo } from '@/content/history';

// Leaflet touches `window` on import, so it must never render on the server.
const MigrationMap = dynamic(
  () => import('./MigrationMap').then((m) => m.MigrationMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[380px] w-full animate-pulse rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-2)] sm:h-[460px]" />
    ),
  }
);

export function MapSection({ places, locale }: { places: PlaceInfo[]; locale: string }) {
  return <MigrationMap places={places} locale={locale} />;
}
