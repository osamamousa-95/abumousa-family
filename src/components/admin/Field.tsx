export function Field({
  label, name, type = 'text', required = false, defaultValue = '', placeholder, hint,
}: {
  label: string; name: string; type?: string; required?: boolean;
  defaultValue?: string; placeholder?: string; hint?: string;
}) {
  const cls = 'mt-1 w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-2)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]';
  return (
    <label className="block">
      <span className="text-xs font-semibold text-[var(--color-muted)]">{label}{required && ' *'}</span>
      {type === 'textarea' ? (
        <textarea name={name} required={required} defaultValue={defaultValue} placeholder={placeholder} rows={4} className={cls} />
      ) : (
        <input name={name} type={type} required={required} defaultValue={defaultValue} placeholder={placeholder} className={cls} />
      )}
      {hint && <span className="mt-1 block text-[11px] text-[var(--color-muted)]">{hint}</span>}
    </label>
  );
}

export function Select({
  label, name, defaultValue, options,
}: {
  label: string; name: string; defaultValue?: string;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-[var(--color-muted)]">{label}</span>
      <select
        name={name} defaultValue={defaultValue}
        className="mt-1 w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-2)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}

export function Toggle({
  label, name, defaultChecked = false, hint,
}: { label: string; name: string; defaultChecked?: boolean; hint?: string }) {
  return (
    <label className="flex items-start gap-2.5 rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-2)] px-3 py-2.5">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-1 h-4 w-4 accent-[var(--color-primary)]" />
      <span>
        <span className="block text-sm">{label}</span>
        {hint && <span className="block text-[11px] text-[var(--color-muted)]">{hint}</span>}
      </span>
    </label>
  );
}
