'use client';

import { useRef, useState, useTransition, type ReactNode } from 'react';

type Result = { ok: boolean; message: string };

export function ActionForm({
  action, children, submitLabel, onSuccess, resetOnSuccess = false,
}: {
  action: (fd: FormData) => Promise<Result>;
  children: ReactNode;
  submitLabel: string;
  onSuccess?: () => void;
  resetOnSuccess?: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [pending, start] = useTransition();

  return (
    <form
      ref={formRef}
      action={(fd) => start(async () => {
        const r = await action(fd);
        setResult(r);
        if (r.ok) {
          if (resetOnSuccess) formRef.current?.reset();
          onSuccess?.();
        }
      })}
      className="space-y-3"
    >
      {children}
      <button
        disabled={pending}
        className="rounded-xl bg-[var(--color-primary)] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
      >
        {pending ? '…' : submitLabel}
      </button>
      {result && (
        <p className={`rounded-lg p-3 text-sm ${result.ok
          ? 'bg-[#EDF7F1] text-[#1B4D2E]'
          : 'bg-[var(--color-ox-100)] text-[var(--color-ox-700)]'}`}>
          {result.message}
        </p>
      )}
    </form>
  );
}

export function ConfirmButton({
  onConfirm, label, confirmText, danger = false,
}: {
  onConfirm: () => Promise<Result>;
  label: string; confirmText: string; danger?: boolean;
}) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <>
      <button
        disabled={pending}
        onClick={() => {
          if (!confirm(confirmText)) return;
          start(async () => setMsg((await onConfirm()).message));
        }}
        className={`rounded-full border px-3 py-1 text-xs transition disabled:opacity-50 ${
          danger
            ? 'border-[var(--color-ox-300)] text-[var(--color-ox-600)] hover:bg-[var(--color-ox-100)]'
            : 'border-[var(--color-line)] hover:border-[var(--color-primary)]'}`}
      >
        {pending ? '…' : label}
      </button>
      {msg && <span className="ms-2 text-xs text-[var(--color-muted)]">{msg}</span>}
    </>
  );
}
