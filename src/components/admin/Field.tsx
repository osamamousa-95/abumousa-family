export function Field({
  label, name, type = 'text', required = false, defaultValue = '', placeholder, hint,
}: {
  label: string; name: string; type?: string; required?: boolean;
  defaultValue?: string; placeholder?: string; hint?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-[var(--color-muted)]">
        {label}{required && ' *'}
      </span>
      {type === 'textarea' ? (
        <textarea
          name={name} required={required} defaultValue={defaultValue} placeholder={placeholder} rows={4}
          className="mt-1 w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-2)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
        />
      ) : (
        <input
          name={name} type={type} required={required} defaultValue={defaultValue} placeholder={placeholder}
          className="mt-1 w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-2)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
        />
      )}
      {hint && <span className="mt-1 block text-[11px] text-[var(--color-muted)]">{hint}</span>}
    </label>
  );
}
