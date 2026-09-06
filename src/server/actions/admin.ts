'use server';

import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/server/db/prisma';
import { requireAdmin, requireSuperAdmin } from '@/server/auth/config';
import { normalizeArabic } from '@/lib/arabic';
import { personSlug, transliterate } from '@/lib/transliterate';
import { computePaths } from '@/lib/tree-path';
import { parseBulkFamilyText } from '@/lib/bulk-family';

type Result = { ok: boolean; message: string };

const str = (fd: FormData, k: string) => String(fd.get(k) ?? '').trim() || null;

function childInputs(formData: FormData) {
  const ids = formData.getAll('childId').map((value) => String(value));
  const names = formData.getAll('childName').map((value) => String(value).trim());
  const genders = formData.getAll('childGender').map((value) => String(value));
  return names
    .map((name, index) => ({
      id: ids[index] || null,
      name,
      gender: genders[index] === 'FEMALE' ? 'FEMALE' as const : 'MALE' as const,
      sortOrder: index + 1,
    }))
    .filter((child) => child.name);
}

async function saveChildren(parentId: string, formData: FormData) {
  const children = childInputs(formData);
  const existingIds = children.flatMap((child) => child.id ? [child.id] : []);
  const existing = await prisma.person.findMany({
    where: { id: { in: existingIds }, fatherId: parentId },
    select: { id: true },
  });
  const existingIdSet = new Set(existing.map((child) => child.id));
  if (existingIdSet.size !== existingIds.length) {
    throw new Error('بيانات الأبناء غير صالحة.');
  }

  const parent = await prisma.person.findUnique({
    where: { id: parentId }, select: { path: true, generation: true },
  });
  if (!parent) throw new Error('لم يُعثر على الأب.');

  for (const child of children) {
    if (child.id) {
      await prisma.person.update({
        where: { id: child.id },
        data: {
          name: child.name,
          nameNormalized: normalizeArabic(child.name),
          nameLatin: transliterate(child.name) || null,
          gender: child.gender,
          sortOrder: child.sortOrder,
        },
      });
    } else {
      const childPath = `${parent.path}.${child.sortOrder}`;
      await prisma.person.create({
        data: {
          name: child.name,
          nameLatin: transliterate(child.name) || null,
          nameNormalized: normalizeArabic(child.name),
          slug: personSlug(child.name, childPath),
          gender: child.gender,
          fatherId: parentId,
          sortOrder: child.sortOrder,
          path: childPath,
          generation: parent.generation + 1,
        },
      });
    }
  }
}

/** Recompute every path after any structural change. */
async function recomputePaths() {
  const nodes = await prisma.person.findMany({
    select: { id: true, fatherId: true, sortOrder: true },
  });
  const paths = computePaths(nodes);
  const BATCH = 100;
  for (let i = 0; i < paths.length; i += BATCH) {
    await prisma.$transaction(
      paths.slice(i, i + BATCH).map((p) =>
        prisma.person.update({
          where: { id: p.id },
          data: { path: p.path, generation: p.generation },
        })
      )
    );
  }
}

async function log(session: unknown, action: string, id: string, data: object) {
  await prisma.auditLog.create({
    data: {
      userId: (session as { user?: { id?: string } })?.user?.id ?? null,
      action, entity: 'Person', entityId: id, after: data,
    },
  });
}

// ─────────────── Add ───────────────

export async function addPerson(formData: FormData): Promise<Result> {
  const session = await requireAdmin();
  if (!session) return { ok: false, message: 'غير مصرّح.' };

  const name = str(formData, 'name');
  if (!name) return { ok: false, message: 'الاسم مطلوب.' };

  const fatherId = str(formData, 'fatherId');
  const father = fatherId
    ? await prisma.person.findUnique({
        where: { id: fatherId },
        select: { id: true, path: true, generation: true, _count: { select: { children: true } } },
      })
    : null;
  if (fatherId && !father) return { ok: false, message: 'لم يُعثر على الأب.' };

  const sortOrder = Number(formData.get('sortOrder')) || (father?._count.children ?? 0) + 1;
  const provisionalPath = father ? `${father.path}.${sortOrder}` : '1';
  const deathDateText = str(formData, 'deathDateText');
  const burialPlaceRaw = str(formData, 'burialPlaceRaw');

  const person = await prisma.person.create({
    data: {
      name,
      nameLatin: transliterate(name) || null,
      nameNormalized: normalizeArabic(name),
      slug: personSlug(name, provisionalPath),
      gender: formData.get('gender') === 'FEMALE' ? 'FEMALE' : 'MALE',
      fatherId,
      sortOrder,
      path: provisionalPath,
      generation: (father?.generation ?? 0) + 1,
      birthDateText: str(formData, 'birthDateText'),
      deathDateText,
      burialPlaceRaw,
      occupation: str(formData, 'occupation'),
      biography: str(formData, 'biography'),
      notes: str(formData, 'notes'),
      nameConfidence: (formData.get('nameConfidence') as 'CONFIRMED' | 'PROBABLE' | 'UNCERTAIN') ?? 'CONFIRMED',
      isMartyr: formData.get('isMartyr') === 'on',
      publicVisibility: (formData.get('publicVisibility') as 'PUBLIC' | 'MEMBERS' | 'ADMIN') ?? 'PUBLIC',
      isLiving: formData.get('isLiving') === 'on' || (!deathDateText && !burialPlaceRaw),
    },
  });

  try {
    await saveChildren(person.id, formData);
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'تعذر حفظ الأبناء.' };
  }

  const spouseName = str(formData, 'spouseName');
  if (spouseName) {
    await prisma.marriage.create({
      data:
        formData.get('gender') === 'FEMALE'
          ? { wifeId: person.id, husbandNameText: spouseName }
          : { husbandId: person.id, wifeNameText: spouseName },
    });
  }

  await recomputePaths();
  await log(session, 'create', person.id, { name });
  revalidatePath('/', 'layout');
  return { ok: true, message: `أُضيف «${name}» بنجاح.` };
}

export async function importPeopleFromText(formData: FormData): Promise<Result> {
  const session = await requireAdmin();
  if (!session) return { ok: false, message: 'غير مصرّح.' };

  const text = String(formData.get('text') ?? '').trim();
  const rootFatherId = str(formData, 'rootFatherId');
  const parsed = parseBulkFamilyText(text);
  if (!text || parsed.people.length === 0) return { ok: false, message: 'لم يتم العثور على أفراد للاستيراد.' };
  if (parsed.people.length > 500) return { ok: false, message: 'الحد الأقصى ٥٠٠ فرد في العملية الواحدة.' };

  const created = await prisma.$transaction(async (tx) => {
    const rootFather = rootFatherId
      ? await tx.person.findUnique({
          where: { id: rootFatherId },
          select: { id: true, path: true, generation: true, _count: { select: { children: true } } },
        })
      : null;
    if (rootFatherId && !rootFather) throw new Error('لم يُعثر على الأب الأساسي.');

    const createdByKey = new Map<string, { id: string; path: string; generation: number }>();
    const rootOffset = rootFather?._count.children ?? 0;
    const siblingCounts = new Map<string, number>();
    const result: { id: string; name: string }[] = [];

    for (const draft of parsed.people) {
      const parent = draft.parentKey
        ? createdByKey.get(draft.parentKey)
        : rootFather
          ? { id: rootFather.id, path: rootFather.path, generation: rootFather.generation }
          : null;
      if (draft.parentKey && !parent) throw new Error(`تعذر تحديد أب السطر ${draft.line}.`);

      const parentKey = draft.parentKey ?? '__root__';
      const sortOrder = (siblingCounts.get(parentKey) ?? (draft.parentKey ? 0 : rootOffset)) + 1;
      siblingCounts.set(parentKey, sortOrder);
      const path = parent ? `${parent.path}.${sortOrder}` : String(sortOrder);
      const person = await tx.person.create({
        data: {
          name: draft.name,
          nameLatin: transliterate(draft.name) || null,
          nameNormalized: normalizeArabic(draft.name),
          slug: personSlug(draft.name, `${path}-${draft.key}`),
          gender: draft.gender,
          fatherId: parent?.id ?? null,
          sortOrder,
          path,
          generation: (parent?.generation ?? 0) + 1,
        },
        select: { id: true, name: true, path: true, generation: true },
      });
      createdByKey.set(draft.key, person);
      result.push(person);
    }
    return result;
  });

  await recomputePaths();
  for (const person of created) await log(session, 'create', person.id, { name: person.name, bulk: true });
  revalidatePath('/', 'layout');
  return { ok: true, message: `أُضيف ${created.length} فرداً. راجع الأسماء والروابط من شاشة التعديل.` };
}

const aiPersonSchema = z.object({
  name: z.string().trim().min(2).max(160),
  gender: z.enum(['MALE', 'FEMALE']).default('MALE'),
  parentIndex: z.number().int().min(-1),
});

const aiPeopleSchema = z.array(aiPersonSchema).min(1).max(500);

/** Optional local AI helper. It returns an editable draft, never database rows. */
export async function analyzeBulkTextWithAi(text: string): Promise<{ ok: boolean; message: string; text?: string }> {
  const session = await requireAdmin();
  if (!session) return { ok: false, message: 'غير مصرّح.' };
  if (!text.trim()) return { ok: false, message: 'ألصق النص أولاً.' };

  const baseUrl = process.env.OLLAMA_BASE_URL ?? 'http://127.0.0.1:11434';
  const model = process.env.OLLAMA_MODEL ?? 'llama3.2';
  let response: Response;
  try {
    response = await fetch(`${baseUrl.replace(/\/$/u, '')}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        stream: false,
        format: 'json',
        messages: [{
          role: 'user',
          content: `Extract only people and father-child relationships from this family document.
Return ONLY JSON: {"people":[{"name":"...","gender":"MALE|FEMALE","parentIndex":-1}]}.
parentIndex is the zero-based index of a previously listed father, or -1 for a root.
Do not invent names. Ignore dates, places, spouses, headings, and uncertain prose.
Document:\n${text.slice(0, 120000)}`,
        }],
      }),
      signal: AbortSignal.timeout(45000),
    });
  } catch {
    return { ok: false, message: 'تعذر الاتصال بـ Ollama. شغّله محلياً ثم أعد المحاولة.' };
  }
  if (!response.ok) return { ok: false, message: `تعذر تشغيل النموذج المحلي (${response.status}).` };

  const payload = await response.json() as { message?: { content?: string } };
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(payload.message?.content ?? '');
  } catch {
    return { ok: false, message: 'أعاد النموذج نتيجة غير مفهومة. راجع النص أو استخدم التحليل العادي.' };
  }
  const checked = aiPeopleSchema.safeParse((parsedJson as { people?: unknown })?.people);
  if (!checked.success) return { ok: false, message: 'نتيجة النموذج لم تجتز التحقق، ولم تُحفظ أي بيانات.' };

  const lines: string[] = [];
  const depths: number[] = [];
  for (const [index, person] of checked.data.entries()) {
    if (person.parentIndex >= index) return { ok: false, message: 'نتيجة النموذج تحتوي علاقة غير صالحة.' };
    const parentDepth = person.parentIndex >= 0 ? depths[person.parentIndex] : -1;
    const depth = parentDepth + 1;
    depths.push(depth);
    lines.push(`${'  '.repeat(depth)}${person.name}${person.gender === 'FEMALE' ? ' [أنثى]' : ''}`);
  }
  return { ok: true, message: `حلّل النموذج ${lines.length} فرداً. راجع المعاينة قبل الاستيراد.`, text: lines.join('\n') };
}

// ─────────────── Update — every field ───────────────

export async function updatePerson(formData: FormData): Promise<Result> {
  const session = await requireAdmin();
  if (!session) return { ok: false, message: 'غير مصرّح.' };

  const id = String(formData.get('id') ?? '');
  const name = str(formData, 'name');
  if (!id || !name) return { ok: false, message: 'بيانات ناقصة.' };

  const current = await prisma.person.findUnique({
    where: { id },
    select: { fatherId: true, sortOrder: true, path: true },
  });
  if (!current) return { ok: false, message: 'لم يُعثر على الشخص.' };

  const newFatherId = str(formData, 'fatherId');
  const newSortOrder = Number(formData.get('sortOrder')) || current.sortOrder;

  // Guard against making someone their own ancestor.
  if (newFatherId && newFatherId !== current.fatherId) {
    const target = await prisma.person.findUnique({
      where: { id: newFatherId }, select: { path: true },
    });
    if (target?.path.startsWith(`${current.path}.`) || target?.path === current.path) {
      return { ok: false, message: 'لا يمكن جعل أحد ذريته أباً له.' };
    }
  }

  const structural = newFatherId !== current.fatherId || newSortOrder !== current.sortOrder;

  await prisma.person.update({
    where: { id },
    data: {
      name,
      nameNormalized: normalizeArabic(name),
      nameLatin: str(formData, 'nameLatin') ?? transliterate(name) ?? null,
      gender: formData.get('gender') === 'FEMALE' ? 'FEMALE' : 'MALE',
      fatherId: newFatherId,
      sortOrder: newSortOrder,
      birthDateText: str(formData, 'birthDateText'),
      deathDateText: str(formData, 'deathDateText'),
      burialPlaceRaw: str(formData, 'burialPlaceRaw'),
      occupation: str(formData, 'occupation'),
      biography: str(formData, 'biography'),
      notes: str(formData, 'notes'),
      nameConfidence: (formData.get('nameConfidence') as 'CONFIRMED' | 'PROBABLE' | 'UNCERTAIN') ?? 'CONFIRMED',
      isMartyr: formData.get('isMartyr') === 'on',
      isLiving: formData.get('isLiving') === 'on',
      publicVisibility: (formData.get('publicVisibility') as 'PUBLIC' | 'MEMBERS' | 'ADMIN') ?? 'PUBLIC',
    },
  });

  try {
    await saveChildren(id, formData);
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'تعذر حفظ الأبناء.' };
  }

  if (structural || childInputs(formData).length > 0) await recomputePaths();
  await log(session, 'update', id, { name });
  revalidatePath('/', 'layout');
  return { ok: true, message: structural ? 'حُفظت التعديلات وأُعيد ترقيم الشجرة.' : 'حُفظت التعديلات.' };
}

// ─────────────── Spouses ───────────────

export async function addSpouse(formData: FormData): Promise<Result> {
  const session = await requireAdmin();
  if (!session) return { ok: false, message: 'غير مصرّح.' };

  const personId = String(formData.get('personId') ?? '');
  const spouseId = str(formData, 'spouseId');
  const spouseName = str(formData, 'spouseName');
  const notes = str(formData, 'notes');
  if (!personId || (!spouseId && !spouseName)) {
    return { ok: false, message: 'اختر زوجاً من العائلة أو اكتب اسماً.' };
  }

  const person = await prisma.person.findUnique({
    where: { id: personId }, select: { gender: true, name: true },
  });
  if (!person) return { ok: false, message: 'لم يُعثر على الشخص.' };

  const isFemale = person.gender === 'FEMALE';
  await prisma.marriage.create({
    data: {
      husbandId: isFemale ? spouseId : personId,
      wifeId: isFemale ? personId : spouseId,
      husbandNameText: isFemale && !spouseId ? spouseName : null,
      wifeNameText: !isFemale && !spouseId ? spouseName : null,
      isInternal: Boolean(spouseId),
      notes,
    },
  });

  revalidatePath('/', 'layout');
  return {
    ok: true,
    message: spouseId ? 'أُضيف الزواج ووُسم أنه من داخل العائلة.' : 'أُضيف الزواج.',
  };
}

export async function deleteMarriage(id: string): Promise<Result> {
  const session = await requireAdmin();
  if (!session) return { ok: false, message: 'غير مصرّح.' };
  await prisma.marriage.delete({ where: { id } });
  revalidatePath('/', 'layout');
  return { ok: true, message: 'حُذف قيد الزواج.' };
}

// ─────────────── Delete ───────────────

export async function deletePerson(id: string, cascade = false): Promise<Result> {
  const session = await requireSuperAdmin();
  if (!session) return { ok: false, message: 'الحذف للمشرف الرئيسي فقط.' };

  const person = await prisma.person.findUnique({
    where: { id }, select: { name: true, path: true },
  });
  if (!person) return { ok: false, message: 'لم يُعثر على الشخص.' };

  const descendants = await prisma.person.count({
    where: { path: { startsWith: `${person.path}.` } },
  });

  if (descendants > 0 && !cascade) {
    return {
      ok: false,
      message: `له ${descendants} من الذرية. اختر «حذف مع الذرية» إن كنت متأكداً، أو انقلهم إلى أبٍ آخر أولاً.`,
    };
  }

  if (descendants > 0) {
    await prisma.person.deleteMany({ where: { path: { startsWith: `${person.path}.` } } });
  }
  await prisma.person.delete({ where: { id } });
  await recomputePaths();
  await log(session, 'delete', id, { name: person.name, descendants });
  revalidatePath('/', 'layout');
  return {
    ok: true,
    message: `حُذف «${person.name}»${descendants ? ` ومعه ${descendants} من ذريته` : ''}.`,
  };
}

/** Move a whole subtree under a different father without deleting anything. */
export async function reassignFather(personId: string, newFatherId: string): Promise<Result> {
  const session = await requireAdmin();
  if (!session) return { ok: false, message: 'غير مصرّح.' };

  const [person, target] = await Promise.all([
    prisma.person.findUnique({ where: { id: personId }, select: { path: true, name: true } }),
    prisma.person.findUnique({ where: { id: newFatherId }, select: { path: true, _count: { select: { children: true } } } }),
  ]);
  if (!person || !target) return { ok: false, message: 'لم يُعثر على أحد الطرفين.' };
  if (target.path.startsWith(`${person.path}.`) || target.path === person.path) {
    return { ok: false, message: 'لا يمكن نقل شخص تحت أحد ذريته.' };
  }

  await prisma.person.update({
    where: { id: personId },
    data: { fatherId: newFatherId, sortOrder: target._count.children + 1 },
  });
  await recomputePaths();
  await log(session, 'update', personId, { moved: person.name });
  revalidatePath('/', 'layout');
  return { ok: true, message: `نُقل «${person.name}» وذريته إلى الأب الجديد.` };
}

// ─────────────── Users ───────────────

export async function createAdminUser(formData: FormData): Promise<Result> {
  const session = await requireSuperAdmin();
  if (!session) return { ok: false, message: 'إضافة المشرفين للمشرف الرئيسي فقط.' };

  const email = (str(formData, 'email') ?? '').toLowerCase();
  const username = (str(formData, 'username') ?? '').toLowerCase();
  const tempPassword = String(formData.get('tempPassword') ?? '');
  if (!email || !username || tempPassword.length < 8) {
    return { ok: false, message: 'البريد واسم المستخدم مطلوبان، وكلمة المرور ٨ محارف فأكثر.' };
  }
  if (await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } })) {
    return { ok: false, message: 'البريد أو اسم المستخدم مستعمل بالفعل.' };
  }

  await prisma.user.create({
    data: {
      email, username,
      name: str(formData, 'name') ?? username,
      passwordHash: await bcrypt.hash(tempPassword, 12),
      role: 'ADMIN', isApproved: true, isActive: true, mustChangePassword: true,
    },
  });
  revalidatePath('/ar/admin/users');
  return { ok: true, message: `أُضيف المشرف «${username}». سيُطلب منه تغيير كلمة المرور عند أول دخول.` };
}

export async function setUserActive(userId: string, active: boolean): Promise<Result> {
  const session = await requireSuperAdmin();
  if (!session) return { ok: false, message: 'غير مصرّح.' };
  if ((session.user as { id?: string }).id === userId) {
    return { ok: false, message: 'لا يمكنك تعطيل حسابك أنت.' };
  }
  await prisma.user.update({ where: { id: userId }, data: { isActive: active } });
  revalidatePath('/ar/admin/users');
  return { ok: true, message: active ? 'فُعّل الحساب.' : 'عُطّل الحساب.' };
}

export async function deleteUser(userId: string): Promise<Result> {
  const session = await requireSuperAdmin();
  if (!session) return { ok: false, message: 'غير مصرّح.' };
  if ((session.user as { id?: string }).id === userId) {
    return { ok: false, message: 'لا يمكنك حذف حسابك أنت.' };
  }
  await prisma.user.delete({ where: { id: userId } });
  revalidatePath('/ar/admin/users');
  return { ok: true, message: 'حُذف الحساب.' };
}

// ─────────────── Password ───────────────

export async function requestOtp(): Promise<Result> {
  const session = await requireAdmin();
  if (!session) return { ok: false, message: 'غير مصرّح.' };
  const userId = (session.user as { id?: string }).id!;

  const code = String(Math.floor(100000 + Math.random() * 900000));
  await prisma.otpToken.deleteMany({ where: { userId, purpose: 'PASSWORD_CHANGE', usedAt: null } });
  await prisma.otpToken.create({
    data: {
      userId,
      codeHash: await bcrypt.hash(code, 10),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  const key = process.env.RESEND_API_KEY;
  const email = session.user?.email;
  if (key && email) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'no-reply@abumousa.family',
          to: email,
          subject: 'رمز تغيير كلمة المرور',
          text: `رمز التحقق: ${code}\nصالح لعشر دقائق.`,
        }),
      });
      return { ok: true, message: `أُرسل رمز التحقق إلى ${email}.` };
    } catch {
      /* fall through to on-screen code */
    }
  }
  return { ok: true, message: `لم يُضبط مزوّد البريد بعد. رمز التحقق: ${code} — صالح لعشر دقائق.` };
}

export async function changePassword(formData: FormData): Promise<Result> {
  const session = await requireAdmin();
  if (!session) return { ok: false, message: 'غير مصرّح.' };
  const userId = (session.user as { id?: string }).id!;

  const code = String(formData.get('code') ?? '').trim();
  const next = String(formData.get('password') ?? '');
  if (next.length < 10) return { ok: false, message: 'كلمة المرور عشرة محارف فأكثر.' };
  if (next !== String(formData.get('confirm') ?? '')) {
    return { ok: false, message: 'الكلمتان غير متطابقتين.' };
  }

  const token = await prisma.otpToken.findFirst({
    where: { userId, purpose: 'PASSWORD_CHANGE', usedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  });
  if (!token) return { ok: false, message: 'لا يوجد رمز صالح. اطلب رمزاً جديداً.' };
  if (!(await bcrypt.compare(code, token.codeHash))) {
    return { ok: false, message: 'الرمز غير صحيح.' };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { passwordHash: await bcrypt.hash(next, 12), mustChangePassword: false },
    }),
    prisma.otpToken.update({ where: { id: token.id }, data: { usedAt: new Date() } }),
  ]);
  return { ok: true, message: 'غُيّرت كلمة المرور. سجّل الخروج ثم ادخل بها.' };
}
