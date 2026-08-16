import { CREATOR } from '@/content/creator';

/**
 * `variant="full"` — used on /about: photo, all fields, larger.
 * `variant="compact"` — used on the creator's own person page, appended
 * beneath his database-driven biography: just the extras that have no
 * equivalent in the generic Person schema.
 */
export function CreatorCard({
  locale,
  variant = 'full',
  withPhoto = false,
  showInterests = true,
}: {
  locale: string;
  variant?: 'full' | 'compact';
  withPhoto?: boolean;
  showInterests?: boolean;
}) {
  const ar = locale === 'ar';
  const c = CREATOR;

  return (
    <div
      className={
        variant === 'full'
          ? 'rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-2)] p-6 sm:p-8'
          : 'rounded-2xl border border-[var(--color-line)] p-5'
      }
    >
      <div className="flex items-start gap-4">
        {withPhoto && (
          <div className="relative h-16 w-16 flex-none overflow-hidden rounded-full ring-2 ring-[var(--color-gold-100)] sm:h-20 sm:w-20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/about/osama.jpg"
              alt={ar ? c.name.ar : c.name.en}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <div className="min-w-0">
          <h3 className="font-[family-name:var(--font-display)] text-lg font-bold sm:text-xl">
            {ar ? c.name.ar : c.name.en}
          </h3>
          <p className="text-xs text-[var(--color-muted)]">
            {ar ? c.generationLabel.ar : c.generationLabel.en}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Chip>{ar ? `📍 ${c.location.ar}` : `📍 ${c.location.en}`}</Chip>
            <Chip>{ar ? c.maritalStatus.ar : c.maritalStatus.en}</Chip>
          </div>
        </div>
      </div>

      {variant === 'full' && (
        <p className="mt-5 text-sm text-[var(--color-ink-2)]">
          {ar ? c.fields.ar : c.fields.en}
          {' · '}
          {ar ? c.fieldsSecondary.ar : c.fieldsSecondary.en}
        </p>
      )}

      {showInterests && (
      <div className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
          {ar ? 'اهتماماتي' : 'Interests'}
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {c.interests.map((it) => (
            <span
              key={it.en}
              className="rounded-full bg-[var(--color-gold-100)] px-3 py-1 text-xs font-medium text-[var(--color-gold-700)]"
            >
              {ar ? it.ar : it.en}
            </span>
          ))}
        </div>
      </div>
      )}

      <div className="mt-5 space-y-3 border-t border-[var(--color-line)] pt-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
            {ar ? 'رؤيتي' : 'My vision'}
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-ink-2)]">
            {ar ? c.vision.ar : c.vision.en}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
            {ar ? 'رسالتي إلى من يقرأ' : 'A message to the reader'}
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-ink-2)]">
            {ar ? c.message.ar : c.message.en}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2 border-t border-[var(--color-line)] pt-5">
        {c.social.map((s) => (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-[var(--color-primary)] px-5 py-2 text-xs font-semibold text-white transition hover:bg-[var(--color-primary-hover)]"
          >
            {s.label}
          </a>
        ))}
      </div>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-[var(--color-paper)] px-2.5 py-0.5 text-[11px] text-[var(--color-muted)]">
      {children}
    </span>
  );
}
