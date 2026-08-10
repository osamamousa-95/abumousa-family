/**
 * The lineage mark — tatreez triangles arranged on the family's real structure:
 * one (Zain al-Din) → one (Mousa) → three (Abd al-Ati, Muhammad, Abd al-Nabi),
 * standing on the line of the land they settled.
 *
 * Single colour via currentColor, so it inherits light/dark automatically.
 */
export function Logo({
  size = 40,
  className,
  title = 'عائلة أبو موسى',
}: {
  size?: number;
  className?: string;
  title?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label={title}
      className={className}
    >
      <g fill="currentColor">
        <path d="M32 4 L40 18 L24 18 Z" />
        <path d="M32 22 L40 36 L24 36 Z" opacity=".78" />
        <path d="M14 40 L22 54 L6 54 Z" opacity=".55" />
        <path d="M32 40 L40 54 L24 54 Z" opacity=".55" />
        <path d="M50 40 L58 54 L42 54 Z" opacity=".55" />
        <rect x="30.6" y="17" width="2.8" height="6" />
        <rect x="30.6" y="35" width="2.8" height="5" />
        <rect x="13" y="35" width="2.8" height="5" />
        <rect x="48.2" y="35" width="2.8" height="5" />
        <rect x="13" y="35" width="38" height="2.6" />
      </g>
    </svg>
  );
}
