'use server';

import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { prisma } from '@/server/db/prisma';
import { requireAdmin, requireSuperAdmin } from '@/server/auth/config';
import { normalizeArabic } from '@/lib/arabic';
import { personSlug, transliterate } from '@/lib/transliterate';
import { computePaths } from '@/lib/tree-path';

type Result = { ok: boolean; message: string };

/** Recompute every path after any structural change. */
async function recomputePaths() {
  const nodes = await prisma.person.findMany({
    select: { id: true, fatherId: true, sortOrder: true },
  });
  const paths = computePaths(nodes);
  await prisma.$transaction(
    paths.map((p) =>
      prisma.person.update({
        where: { id: p.id },
        data: { path: p.path, generation: p.generation },
      })
    )
  );
}

export async function addPerson(formData: FormData): Promise<Result> {
  const session = await requireAdmin();
  if (!session) return { ok: false, message: 'غير مصرّح.' };

  const name = String(formData.get('name') ?? '').trim();
  const fatherId = String(formData.get('fatherId') ?? '').trim() || null;
  const gender = String(formData.get('gender') ?? 'MALE');
  const birthDateText = String(formData.get('birthDateText') ?? '').trim() || null;
  const deathDateText = String(formData.get('deathDateText') ?? '').trim() || null;
  const burialPlaceRaw = String(formData.get('burialPlaceRaw') ?? '').trim() || null;
  const spouseName = String(formData.get('spouseName') ?? '').trim() || null;
  const biography = String(formData.get('biography') ?? '').trim() || null;

  if (!name) return { ok: false, message: 'الاسم مطلوب.' };

  const father = fatherId
    ? await prisma.person.findUnique({
        where: { id: fatherId },
        select: { id: true, path: true, generation: true, _count: { select: { children: true } } },
      })
    : null;
  if (fatherId && !father) return { ok: false, message: 'لم يُعثر على الأب.' };

  const sortOrder = (father?._count.children ?? 0) + 1;
  const provisionalPath = father ? `${father.path}.${sortOrder}` : '1';

  const person = await prisma.person.create({
    data: {
      name,
      nameLatin: transliterate(name) || null,
      nameNormalized: normalizeArabic(name),
      slug: personSlug(name, provisionalPath),
      gender: gender === 'FEMALE' ? 'FEMALE' : 'MALE',
      fatherId,
      sortOrder,
      path: provisionalPath,
      generation: (father?.generation ?? 0) + 1,
      birthDateText,
      deathDateText,
      burialPlaceRaw,
      biography,
      isLiving: !deathDateText && !burialPlaceRaw,
    },
  });

  if (spouseName) {
    await prisma.marriage.create({
      data:
        gender === 'FEMALE'
          ? { wifeId: person.id, husbandNameText: spouseName }
          : { husbandId: person.id, wifeNameText: spouseName },
    });
  }

  await recomputePaths();
  await prisma.auditLog.create({
    data: {
      userId: (session.user as { id?: string }).id ?? null,
      action: 'create', entity: 'Person', entityId: person.id,
      after: { name, fatherId },
    },
  });

  revalidatePath('/', 'layout');
  return { ok: true, message: `أُضيف «${name}» بنجاح.` };
}

export async function updatePerson(formData: FormData): Promise<Result> {
  const session = await requireAdmin();
  if (!session) return { ok: false, message: 'غير مصرّح.' };

  const id = String(formData.get('id') ?? '');
  const name = String(formData.get('name') ?? '').trim();
  if (!id || !name) return { ok: false, message: 'بيانات ناقصة.' };

  await prisma.person.update({
    where: { id },
    data: {
      name,
      nameNormalized: normalizeArabic(name),
      nameLatin: transliterate(name) || null,
      birthDateText: String(formData.get('birthDateText') ?? '').trim() || null,
      deathDateText: String(formData.get('deathDateText') ?? '').trim() || null,
      burialPlaceRaw: String(formData.get('burialPlaceRaw') ?? '').trim() || null,
      biography: String(formData.get('biography') ?? '').trim() || null,
      gender: String(formData.get('gender') ?? 'MALE') === 'FEMALE' ? 'FEMALE' : 'MALE',
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: (session.user as { id?: string }).id ?? null,
      action: 'update', entity: 'Person', entityId: id, after: { name },
    },
  });
  revalidatePath('/', 'layout');
  return { ok: true, message: 'حُفظت التعديلات.' };
}

export async function deletePerson(id: string): Promise<Result> {
  const session = await requireSuperAdmin();
  if (!session) return { ok: false, message: 'الحذف للمشرف الرئيسي فقط.' };

  const kids = await prisma.person.count({ where: { fatherId: id } });
  if (kids > 0) return { ok: false, message: `لا يمكن الحذف — له ${kids} من الذرية. احذفهم أولاً أو انقلهم.` };

  const person = await prisma.person.findUnique({ where: { id }, select: { name: true } });
  await prisma.person.delete({ where: { id } });
  await recomputePaths();
  await prisma.auditLog.create({
    data: {
      userId: (session.user as { id?: string }).id ?? null,
      action: 'delete', entity: 'Person', entityId: id, before: { name: person?.name },
    },
  });
  revalidatePath('/', 'layout');
  return { ok: true, message: `حُذف «${person?.name}».` };
}

// ─────────────── Users ───────────────

export async function createAdminUser(formData: FormData): Promise<Result> {
  const session = await requireSuperAdmin();
  if (!session) return { ok: false, message: 'إضافة المشرفين للمشرف الرئيسي فقط.' };

  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const username = String(formData.get('username') ?? '').trim().toLowerCase();
  const name = String(formData.get('name') ?? '').trim();
  const tempPassword = String(formData.get('tempPassword') ?? '').trim();

  if (!email || !username || tempPassword.length < 8) {
    return { ok: false, message: 'البريد واسم المستخدم مطلوبان، وكلمة المرور ٨ محارف فأكثر.' };
  }
  const exists = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
  if (exists) return { ok: false, message: 'البريد أو اسم المستخدم مستعمل بالفعل.' };

  await prisma.user.create({
    data: {
      email, username, name: name || username,
      passwordHash: await bcrypt.hash(tempPassword, 12),
      role: 'ADMIN',
      isApproved: true,
      isActive: true,
      mustChangePassword: true,
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
      /* fall through */
    }
  }
  // No mail provider configured yet — surface the code so the flow still works.
  return {
    ok: true,
    message: `لم يُضبط مزوّد البريد بعد. رمز التحقق: ${code} — صالح لعشر دقائق.`,
  };
}

export async function changePassword(formData: FormData): Promise<Result> {
  const session = await requireAdmin();
  if (!session) return { ok: false, message: 'غير مصرّح.' };
  const userId = (session.user as { id?: string }).id!;

  const code = String(formData.get('code') ?? '').trim();
  const next = String(formData.get('password') ?? '');
  const confirm = String(formData.get('confirm') ?? '');

  if (next.length < 10) return { ok: false, message: 'كلمة المرور عشرة محارف فأكثر.' };
  if (next !== confirm) return { ok: false, message: 'الكلمتان غير متطابقتين.' };

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
