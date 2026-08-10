import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { TreeExplorer } from '@/components/tree/TreeExplorer';
import { getFullTree, flattenTree } from '@/server/services/tree';
import { formatNumber } from '@/lib/arabic';

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'nav' });
  return { title: t('tree') };
}

export default async function TreePage({
  params,
}: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('nav');
  const tc = await getTranslations('credits');

  const root = await getFullTree({ kind: 'public' });
  const all = flattenTree(root);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-5 py-10">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-extrabold">
          {t('tree')}
        </h1>

        {!root ? (
          <div className="mt-6 rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-2)] p-6">
            <p className="font-semibold">قاعدة البيانات فارغة بعد.</p>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              شغّل البذرة من GitHub: تبويب Actions ← Seed database ← Run workflow،
              واكتب SEED للتأكيد. ثم أعد تحميل هذه الصفحة.
            </p>
          </div>
        ) : (
          <>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              {formatNumber(all.length, locale)} — اضغط على أي اسم لعرض نسبه كاملاً
            </p>
            <div className="mt-7">
              <TreeExplorer root={root} total={all.length} />
            </div>
          </>
        )}

        <footer className="mt-14 border-t border-[var(--color-line)] pt-6 text-center text-xs text-[var(--color-muted)]">
          {tc('sourceLine')}
        </footer>
      </main>
    </>
  );
}
