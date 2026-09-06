'use client';

import { useMemo, useState } from 'react';
import { formatNumber } from '@/lib/arabic';
import { tokenizeQuery, matchesLineage, rankResults } from '@/lib/search';
import { addPerson, updatePerson, deletePerson, deletePeople, addSpouse, deleteMarriage } from '@/server/actions/admin';
import { ActionForm, ConfirmButton } from './ActionForm';
import { Field, Select, Toggle } from './Field';

export interface AdminPerson {
  id: string;
  name: string;
  nameLatin: string;
  generation: number;
  gender: string;
  sortOrder: number;
  fatherId: string | null;
  ancestors: string[];
  lineage: string;
  birthDateText: string;
  deathDateText: string;
  burialPlaceRaw: string;
  occupation: string;
  biography: string;
  notes: string;
  nameConfidence: string;
  isMartyr: boolean;
  isLiving: boolean;
  publicVisibility: string;
  children: { id: string; name: string; gender: string; sortOrder: number }[];
  marriages: { id: string; spouseName: string; isInternal: boolean; notes: string }[];
}

/** Search box that returns a person — used for picking fathers and spouses. */
export function PersonPicker({
  people, value, onPick, placeholder, locale, excludeId,
}: {
  people: AdminPerson[];
  value: AdminPerson | null;
  onPick: (p: AdminPerson | null) => void;
  placeholder: string;
  locale: string;
  excludeId?: string;
}) {
  const [q, setQ] = useState('');
  const results = useMemo(() => {
    const tokens = tokenizeQuery(q);
    if (tokens.length === 0 || tokens[0].length < 2) return [];
    const hits = people.filter(
      (p) => p.id !== excludeId && matchesLineage(p.ancestors, tokens)
    );
    return rankResults(hits, tokens).slice(0, 10);
  }, [q, people, excludeId]);

  if (value) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-[var(--color-primary)] bg-[var(--color-paper)] px-4 py-2.5">
        <span className="text-sm font-semibold">{value.lineage}</span>
        <button type="button" onClick={() => { onPick(null); setQ(''); }}
          className="text-sm text-[var(--color-muted)]">✕</button>
      </div>
    );
  }

  return (
    <div className="relative">
      <input
        value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder}
        className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-2)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
      />
      {results.length > 0 && (
        <ul className="absolute inset-x-0 top-full z-40 mt-1 max-h-60 overflow-y-auto rounded-xl border border-[var(--color-line)] bg-[var(--color-paper)] shadow-xl">
          {results.map((r) => (
            <li key={r.id}>
              <button type="button" onClick={() => { onPick(r); setQ(''); }}
                className="block w-full border-b border-[var(--color-line)] px-4 py-2 text-start text-sm last:border-0 hover:bg-[var(--color-paper-2)]">
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
  );
}

/** The complete editor — every field on the Person record. */
export function PersonEditor({
  person, people, locale, canDelete, onDone,
}: {
  person: AdminPerson | null;
  people: AdminPerson[];
  locale: string;
  canDelete: boolean;
  onDone?: () => void;
}) {
  const isNew = !person;
  const [father, setFather] = useState<AdminPerson | null>(
    person?.fatherId ? people.find((p) => p.id === person.fatherId) ?? null : null
  );
  const [spouseInFamily, setSpouseInFamily] = useState<AdminPerson | null>(null);
  const [children, setChildren] = useState(
    person?.children.map((child) => ({ ...child, id: child.id })) ?? []
  );
  const [selectedChildren, setSelectedChildren] = useState<string[]>([]);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);
  const existingChildren = children.filter((child) => !child.id.startsWith('new-'));
  const allExistingSelected = existingChildren.length > 0 && existingChildren.every((child) => selectedChildren.includes(child.id));

  const toggleChild = (id: string) => {
    setSelectedChildren((current) => current.includes(id)
      ? current.filter((selectedId) => selectedId !== id)
      : [...current, id]);
  };

  const deleteSelectedChildren = () => {
    if (selectedChildren.length === 0) return;
    if (!confirm(`سيُحذف ${selectedChildren.length} فرداً محدداً وكل ذريتهم نهائياً. هل أنت متأكد؟`)) return;
    if (!person) return;
    void deletePeople(person.id, selectedChildren).then((result) => {
      setDeleteMessage(result.message);
      if (result.ok) {
        setChildren((current) => current.filter((child) => !selectedChildren.includes(child.id)));
        setSelectedChildren([]);
      }
    });
  };

  return (
    <div className="space-y-6">
      <ActionForm
        action={isNew ? addPerson : updatePerson}
        submitLabel={isNew ? 'إضافة' : 'حفظ كل التعديلات'}
        onSuccess={onDone}
      >
        {!isNew && <input type="hidden" name="id" value={person.id} />}
        <input type="hidden" name="fatherId" value={father?.id ?? ''} />
        <input type="hidden" name="childrenSubmitted" value="1" />

        {children.map((child) => (
          <input key={`id-${child.id}`} type="hidden" name="childId" value={child.id.startsWith('new-') ? '' : child.id} />
        ))}

        <div>
          <span className="text-xs font-semibold text-[var(--color-muted)]">الأب</span>
          <div className="mt-1">
            <PersonPicker
              people={people} value={father} onPick={setFather} locale={locale}
              excludeId={person?.id}
              placeholder="ابحث: الاسم ثم اسم الأب ثم الجدّ…"
            />
          </div>
          <p className="mt-1 text-[11px] text-[var(--color-muted)]">
            تغيير الأب ينقل الشخص وذريته كلها، ويُعاد ترقيم الشجرة تلقائياً.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="الاسم" name="name" required defaultValue={person?.name ?? ''} />
          <Field label="الاسم باللاتينية" name="nameLatin" defaultValue={person?.nameLatin ?? ''}
                 hint="يُولَّد تلقائياً إن تُرك فارغاً" />
          <Select label="الجنس" name="gender" defaultValue={person?.gender ?? 'MALE'}
            options={[{ value: 'MALE', label: 'ذكر' }, { value: 'FEMALE', label: 'أنثى' }]} />
          <Field label="الترتيب بين الإخوة" name="sortOrder" type="number"
                 defaultValue={String(person?.sortOrder ?? '')}
                 hint="١ للأكبر — يحدّد موضعه ورقمه في الشجرة" />
          <Field label="تاريخ الميلاد" name="birthDateText" defaultValue={person?.birthDateText ?? ''}
                 placeholder="١٩٩٠م · نحو ١٩٥٠م · قبل ١٩٤٨" />
          <Field label="تاريخ الوفاة" name="deathDateText" defaultValue={person?.deathDateText ?? ''}
                 placeholder="اتركه فارغاً إن كان حياً" />
          <Field label="المدفن" name="burialPlaceRaw" defaultValue={person?.burialPlaceRaw ?? ''} />
          <Field label="العمل" name="occupation" defaultValue={person?.occupation ?? ''} />
          <Select label="درجة تأكيد الاسم" name="nameConfidence"
            defaultValue={person?.nameConfidence ?? 'CONFIRMED'}
            options={[
              { value: 'CONFIRMED', label: 'مؤكَّد' },
              { value: 'PROBABLE', label: 'راجح' },
              { value: 'UNCERTAIN', label: 'غير مؤكَّد ٭' },
            ]} />
          <Select label="مستوى الظهور" name="publicVisibility"
            defaultValue={person?.publicVisibility ?? 'PUBLIC'}
            options={[
              { value: 'PUBLIC', label: 'عام' },
              { value: 'MEMBERS', label: 'لأفراد العائلة المسجّلين' },
              { value: 'ADMIN', label: 'للمشرفين فقط' },
            ]} />
        </div>

        <section className="rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-2)] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-[family-name:var(--font-display)] text-sm font-bold">الأبناء</h3>
              <p className="mt-1 text-[11px] text-[var(--color-muted)]">
                أضف أبناء وبنات هذا الشخص هنا، ويمكن تعديل الأسماء والجنس لاحقاً.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setChildren((current) => [...current, { id: `new-${Date.now()}`, name: '', gender: 'MALE', sortOrder: current.length + 1 }])}
              className="rounded-full border border-[var(--color-line)] px-3 py-1.5 text-xs font-semibold hover:border-[var(--color-primary)]"
            >
              + إضافة ابن
            </button>
            {canDelete && existingChildren.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedChildren(allExistingSelected ? [] : existingChildren.map((child) => child.id))}
                className="rounded-full border border-[var(--color-ox-300)] px-3 py-1.5 text-xs font-semibold text-[var(--color-ox-700)] hover:bg-[var(--color-ox-100)]"
              >
                {allExistingSelected ? 'إلغاء تحديد الكل' : 'تحديد كل الأبناء'}
              </button>
            )}
            {canDelete && selectedChildren.length > 0 && (
              <button
                type="button"
                onClick={deleteSelectedChildren}
                className="rounded-full bg-[var(--color-ox-700)] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
              >
                حذف المحدد ({selectedChildren.length})
              </button>
            )}
          </div>

          {children.length > 0 && (
            <div className="mt-3 space-y-2">
              {children.map((child, index) => (
                <div key={child.id} className="flex flex-wrap items-end gap-2 rounded-lg border border-[var(--color-line)] bg-[var(--color-paper)] p-2">
                  {canDelete && !child.id.startsWith('new-') && (
                    <input
                      type="checkbox"
                      checked={selectedChildren.includes(child.id)}
                      onChange={() => toggleChild(child.id)}
                      className="mb-2 h-4 w-4 accent-[var(--color-primary)]"
                      aria-label={`تحديد ${child.name}`}
                    />
                  )}
                  <label className="min-w-0 flex-1">
                    <span className="text-[11px] font-semibold text-[var(--color-muted)]">اسم الابن أو الابنة</span>
                    <input
                      name="childName"
                      defaultValue={child.name}
                      className="mt-1 w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-paper-2)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
                    />
                  </label>
                  <label className="w-28">
                    <span className="text-[11px] font-semibold text-[var(--color-muted)]">الجنس</span>
                    <select
                      name="childGender"
                      defaultValue={child.gender === 'FEMALE' ? 'FEMALE' : 'MALE'}
                      className="mt-1 w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-paper-2)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
                    >
                      <option value="MALE">ذكر</option>
                      <option value="FEMALE">أنثى</option>
                    </select>
                  </label>
                  <input type="hidden" name="childSortOrder" value={index + 1} />
                  <div className="mb-1 flex gap-1">
                    <button type="button" disabled={index === 0}
                      onClick={() => setChildren((current) => {
                        const next = [...current];
                        [next[index - 1], next[index]] = [next[index], next[index - 1]];
                        return next;
                      })}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-line)] text-sm disabled:opacity-30"
                      aria-label="نقل الابن إلى الأعلى" title="إلى الأعلى">↑</button>
                    <button type="button" disabled={index === children.length - 1}
                      onClick={() => setChildren((current) => {
                        const next = [...current];
                        [next[index], next[index + 1]] = [next[index + 1], next[index]];
                        return next;
                      })}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-line)] text-sm disabled:opacity-30"
                      aria-label="نقل الابن إلى الأسفل" title="إلى الأسفل">↓</button>
                  </div>
                  {(child.id.startsWith('new-') || canDelete) && (
                    <button
                      type="button"
                      onClick={() => {
                        if (child.id.startsWith('new-')) setChildren((current) => current.filter((_, childIndex) => childIndex !== index));
                        else toggleChild(child.id);
                      }}
                      className="mb-1 inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-line)] text-lg leading-none text-[var(--color-muted)] hover:border-[var(--color-ox-300)] hover:text-[var(--color-ox-700)]"
                      aria-label={`حذف ${child.name || `صف ${index + 1}`}`}
                      title="حذف الابن"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
          {deleteMessage && <p className="mt-2 text-xs text-[var(--color-muted)]">{deleteMessage}</p>}
        </section>

        <div className="grid gap-3 sm:grid-cols-2">
          <Toggle label="على قيد الحياة" name="isLiving" defaultChecked={person?.isLiving ?? true}
                  hint="تُخفى تفاصيله عن الزائر العام" />
          <Toggle label="شهيد" name="isMartyr" defaultChecked={person?.isMartyr ?? false} />
        </div>

        <Field label="السيرة" name="biography" type="textarea" defaultValue={person?.biography ?? ''} />
        <Field label="ملاحظات" name="notes" type="textarea" defaultValue={person?.notes ?? ''} />

        {isNew && <Field label="الزوج / الزوجة (اسم حرّ)" name="spouseName" />}
      </ActionForm>

      {!isNew && (
        <section className="rounded-xl border border-[var(--color-line)] p-4">
          <h3 className="font-[family-name:var(--font-display)] text-sm font-bold">الأزواج</h3>

          {person.marriages.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {person.marriages.map((m) => (
                <li key={m.id} className="flex flex-wrap items-center gap-2 rounded-lg bg-[var(--color-paper-2)] px-3 py-2 text-sm">
                  <span>{m.spouseName}</span>
                  {m.isInternal && (
                    <span className="rounded-full bg-[var(--color-primary)] px-2 py-0.5 text-[10px] font-semibold text-white">
                      ⚭ من العائلة
                    </span>
                  )}
                  <span className="ms-auto">
                    <ConfirmButton label="حذف" danger confirmText="حذف قيد الزواج؟"
                      onConfirm={() => deleteMarriage(m.id)} />
                  </span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-4 border-t border-[var(--color-line)] pt-4">
            <ActionForm action={addSpouse} submitLabel="إضافة زواج">
              <input type="hidden" name="personId" value={person.id} />
              <input type="hidden" name="spouseId" value={spouseInFamily?.id ?? ''} />
              <div>
                <span className="text-xs font-semibold text-[var(--color-muted)]">
                  زوج من داخل العائلة (اختياري)
                </span>
                <div className="mt-1">
                  <PersonPicker
                    people={people} value={spouseInFamily} onPick={setSpouseInFamily}
                    locale={locale} excludeId={person.id}
                    placeholder="ابحث في الشجرة…"
                  />
                </div>
                <p className="mt-1 text-[11px] text-[var(--color-muted)]">
                  اختياره يوسم الزواج تلقائياً بأنه من داخل العائلة، ويظهر من الطرفين.
                </p>
              </div>
              {!spouseInFamily && <Field label="أو اكتب الاسم من خارج العائلة" name="spouseName" />}
              <Field label="ملاحظة عن الزواج" name="notes"
                     placeholder="مثال: أبناء عمّين — أبواهما فلان وفلان" />
            </ActionForm>
          </div>
        </section>
      )}

      {!isNew && canDelete && (
        <section className="rounded-xl border border-[var(--color-ox-300)] bg-[var(--color-ox-100)] p-4">
          <h3 className="text-sm font-bold text-[var(--color-ox-700)]">حذف</h3>
          <p className="mt-1 text-xs text-[var(--color-ox-700)]">
            الحذف نهائي ولا يمكن التراجع عنه.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <ConfirmButton label="حذف هذا الشخص" danger
              confirmText={`حذف «${person.name}»؟`}
              onConfirm={() => deletePerson(person.id, false)} />
            <ConfirmButton label="حذف مع كل الذرية" danger
              confirmText={`تحذير: سيُحذف «${person.name}» وكل ذريته نهائياً. متأكد؟`}
              onConfirm={() => deletePerson(person.id, true)} />
          </div>
        </section>
      )}
    </div>
  );
}
