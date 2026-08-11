'use client';

import { useEffect, useRef, useState } from 'react';
import type { PlaceInfo } from '@/content/history';

const ERA_COLOR: Record<string, string> = {
  hejaz: '#B8892B',
  egypt: '#5E6B47',
  palestine: '#7B2D26',
  diaspora: '#1F6FA8',
};

/**
 * Migration map. Leaflet is loaded dynamically on the client only — it touches
 * `window` at import time and would break server rendering.
 */
export function MigrationMap({
  places,
  locale,
}: {
  places: PlaceInfo[];
  locale: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<PlaceInfo | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let map: import('leaflet').Map | null = null;
    let cancelled = false;

    (async () => {
      const L = (await import('leaflet')).default;
      if (cancelled || !containerRef.current) return;

      // Stylesheet, injected once
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      const ordered = [...places].sort((a, b) => a.order - b.order);

      map = L.map(containerRef.current, {
        scrollWheelZoom: false,
        attributionControl: true,
      });

      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        {
          attribution: '&copy; OpenStreetMap, &copy; CARTO',
          maxZoom: 18,
        }
      ).addTo(map);

      // Route line following the migration order
      const latlngs = ordered.map((p) => [p.lat, p.lng] as [number, number]);
      L.polyline(latlngs, {
        color: '#7B2D26',
        weight: 2.5,
        opacity: 0.5,
        dashArray: '7 9',
      }).addTo(map);

      ordered.forEach((p, i) => {
        const color = ERA_COLOR[p.era] ?? '#7B2D26';
        const icon = L.divIcon({
          className: '',
          html: `<div style="
            width:26px;height:26px;border-radius:50%;
            background:${color};color:#fff;
            display:flex;align-items:center;justify-content:center;
            font-size:12px;font-weight:700;font-family:system-ui;
            box-shadow:0 2px 8px rgba(0,0,0,.3);border:2px solid #fff;
          ">${i + 1}</div>`,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });

        const marker = L.marker([p.lat, p.lng], { icon }).addTo(map!);
        const label = locale === 'ar' ? p.name.ar : p.name.en;
        const region = locale === 'ar' ? p.region.ar : p.region.en;
        marker.bindTooltip(label, { direction: 'top', offset: [0, -14] });
        marker.on('click', () => setActive(p));
        void region;
      });

      map.fitBounds(L.latLngBounds(latlngs).pad(0.25));
      setReady(true);
    })();

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [places, locale]);

  return (
    <div>
      <div className="relative overflow-hidden rounded-2xl border border-[var(--color-line)]">
        <div ref={containerRef} className="h-[380px] w-full sm:h-[460px]" />
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-paper-2)] text-sm text-[var(--color-muted)]">
            …
          </div>
        )}
      </div>

      <div
        className="mt-4 min-h-[92px] rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-2)] p-4"
        aria-live="polite"
      >
        {active ? (
          <>
            <h3 className="font-[family-name:var(--font-display)] text-base font-bold">
              {locale === 'ar' ? active.name.ar : active.name.en}
            </h3>
            <p className="text-xs text-[var(--color-muted)]">
              {locale === 'ar' ? active.region.ar : active.region.en}
            </p>
            <p className="mt-2 text-sm leading-relaxed">
              {locale === 'ar' ? active.body.ar : active.body.en}
            </p>
          </>
        ) : (
          <p className="text-sm text-[var(--color-muted)]">
            {locale === 'ar'
              ? 'اضغط على أي محطة في الخريطة لتقرأ عنها.'
              : 'Tap any stop on the map to read about it.'}
          </p>
        )}
      </div>
    </div>
  );
}
