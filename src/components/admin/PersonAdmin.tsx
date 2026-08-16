'use client';

import { useMemo, useState } from 'react';
import { normalizeArabic, formatNumber } from '@/lib/arabic';
import { addPerson, updatePerson, deletePerson } from '@/server/actions/admin';
import { ActionForm, ConfirmButton } from './ActionForm';
import { Field } from './Field';

interface P {
  id: string; name: string; generation: number; gender: string; lineage: string;
  birthDateText: string; deathDateText: string; burialPlaceRaw: string; biography: string;
}

export function PersonAdmin({
  people, locale, canDelete,
}: { people: P[]; locale: string; canDelete: boolean }) {
  const [q, setQ] = useState('');
  const [father, setFather] = useState<P | null>(null);
  const [editing, setEditing] = useState<P | null>(null);

  const results = useMemo(() => {
    const n = normalizeArabic(q.trim());
    if (n.length < 2) return [];
    return people
      .filter((p) => normalizeArabic(p.lineage).includes(n))
      .sort((a, b) => (normalizeArabic(a.name).startsWith(n) ? 0 : 1) - (normalizeArabic(b.name).startsWith(n) ? 0 : 1))
      .slice(0, 10);
  }, [q, people]);

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-2)] p-5">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">إضافة فرد</h2>

        <div className="mt-4">
          <span className="text-xs font-semibold text-[var(--color-muted)]">الأب</span>
          {father ? (
            <div className="mt-1 flex items-center justify-between rounded-xl border border-[var(--color-primary)] bg-[var(--color-paper)] px-4 py-2.5">
              <span className="text-sm font-semibold">{father.lineage}</span>
              <button onClick={() => setFather(null)} className="text-sm text-[var(--color-muted)]">✕</button>
            </div>
          ) : (
            <div className="relative mt-1">
              <input
                value={q} onChange={(e) => setQ(e.target.value)}
                placeholder="ابحث عن الأب بالاسم أو اسم جدّه…"
                className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-paper)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
              />
              {results.length > 0 && (
                <ul className="absolute inset-x-0 top-full z-30 mt-1 max-h-56 overflow-y-auto rounded-xl border border-[var(--color-line)] bg-[var(--color-paper)] shadow-xl">
                  {results.map((r) => (
                    <li key={r.id}>
                      <button
                        onClick={() => { setFather(r); setQ(''); }}
                        className="block w-full border-b border-[var(--color-line)] px-4 py-2 text-start text-sm last:border-0 hover:bg-[var(--color-paper-2)]"
                      >
                        {r.lineage}
                        <span className="ms-2 text-xs text-[var(--color-muted)]">
                          ج{formatNumber(r.generation, locale)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          <p className="mt-1 text-[11px] text-[var(--color-muted)]">
            اتركه فارغاً فقط إن كنت تضيف جدّاً أعلى من زين الدين.
          </p>
        </div>

        <div className="mt-4">
          <ActionForm action={addPerson} submitLabel="إضافة" resetOnSuccess>
            <input type="hidden" name="fatherId" value={father?.id ?? ''} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="الاسم" name="name" required placeholder="مثال: خالد" />
              <label className="block">
                <span className="text-xs font-semibold text-[var(--color-muted)]">الجنس</span>
                <select name="gender" className="mt-1 w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-2)] px-3 py-2 text-sm">
                  <option value="MALE">ذكر</option>
                  <option value="FEMALE">أنثى</option>
                </select>
              </label>
              <Field label="تاريخ الميلاد" name="birthDateText" placeholder="مثال: ١٩٩٠م أو نحو ١٩٥٠م" />
              <Field label="تاريخ الوفاة" name="deathDateText" placeholder="اتركه فارغاً إن كان حياً" />
              <Field label="المدفن" name="burialPlaceRaw" placeholder="مثال: خان يونس" />
              <Field label="الزوج / الزوجة" name="spouseName" />
            </div>
            <Field label="السيرة" name="biography" type="textarea" />
          </ActionForm>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--color-line)] p-5">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">تعديل فرد</h2>
        {!editing ? (
          <>
            <input
              value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="ابحث عن الفرد المراد تعديله…"
              className="mt-3 w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-2)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
            />
            <ul className="mt-2 space-y-1">
              {results.map((r) => (
                <li key={r.id} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-[var(--color-paper-2)]">
                  <span className="flex-1">{r.lineage}</span>
                  <button onClick={() => { setEditing(r); setQ(''); }}
                    className="rounded-full border border-[var(--color-line)] px-3 py-1 text-xs hover:border-[var(--color-primary)]">
                    تعديل
                  </button>
                  {canDelete && (
                    <ConfirmButton
                      label="حذف" danger
                      confirmText={`حذف «${r.name}» نهائياً؟`}
                      onConfirm={() => deletePerson(r.id)}
                    />
                  )}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="mt-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold">{editing.lineage}</span>
              <button onClick={() => setEditing(null)} className="text-sm text-[var(--color-muted)]">✕ إلغاء</button>
            </div>
            <ActionForm action={updatePerson} submitLabel="حفظ التعديلات">
              <input type="hidden" name="id" value={editing.id} />
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="الاسم" name="name" required defaultValue={editing.name} />
                <label className="block">
                  <span className="text-xs font-semibold text-[var(--color-muted)]">الجنس</span>
                  <select name="gender" defaultValue={editing.gender}
                    className="mt-1 w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-2)] px-3 py-2 text-sm">
                    <option value="MALE">ذكر</option>
                    <option value="FEMALE">أنثى</option>
                  </select>
                </label>
                <Field label="تاريخ الميلاد" name="birthDateText" defaultValue={editing.birthDateText} />
                <Field label="تاريخ الوفاة" name="deathDateText" defaultValue={editing.deathDateText} />
                <Field label="المدفن" name="burialPlaceRaw" defaultValue={editing.burialPlaceRaw} />
              </div>
              <Field label="السيرة" name="biography" type="textarea" defaultValue={editing.biography} />
            </ActionForm>
          </div>
        )}
      </section>
    </div>
  );
}
