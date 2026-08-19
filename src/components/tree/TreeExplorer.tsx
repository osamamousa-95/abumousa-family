'use client';

import { useMemo, useState, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { formatNumber } from '@/lib/arabic';
import { tokenizeQuery, matchesLineage, rankResults } from '@/lib/search';
import type { TreeNodeDTO } from '@/server/services/tree';

interface Props {
  root: TreeNodeDTO;
  total: number;
}

export function TreeExplorer({ root, total }: Props) {
  const t = useTranslations('tree');
  const tp = useTranslations('person');
  const locale = useLocale();

  // Root and its immediate children start open.
  const [open, setOpen] = useState<Set<string>>(() => {
    const s = new Set<string>([root.id]);
    root.children.forEach((c) => s.add(c.id));
    return s;
  });
  const [query, setQuery] = useState('');

  const flat = useMemo(() => {
    const out: TreeNodeDTO[] = [];
    const walk = (n: TreeNodeDTO) => {
      out.push(n);
      n.children.forEach(walk);
    };
    walk(root);
    return out;
  }, [root]);

  const results = useMemo(() => {
    const tokens = tokenizeQuery(query);
    if (tokens.length === 0 || tokens[0].length < 2) return [];
    const hits = flat.filter((p) => matchesLineage(p.ancestors, tokens));
    return rankResults(hits, tokens).slice(0, 15);
  }, [query, flat]);

  const parentOf = useMemo(() => {
    const m = new Map<string, TreeNodeDTO>();
    const walk = (n: TreeNodeDTO) => {
      n.children.forEach((c) => {
        m.set(c.id, n);
        walk(c);
      });
    };
    walk(root);
    return m;
  }, [root]);

  const toggle = useCallback((id: string) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  /** Open every ancestor so the match becomes visible, then scroll to it. */
  const reveal = useCallback(
    (node: TreeNodeDTO) => {
      setOpen((prev) => {
        const next = new Set(prev);
        let cur = parentOf.get(node.id);
        while (cur) {
          next.add(cur.id);
          cur = parentOf.get(cur.id);
        }
        next.add(node.id);
        return next;
      });
      setQuery('');
      requestAnimationFrame(() => {
        document
          .getElementById(`node-${node.id}`)
          ?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      });
    },
    [parentOf]
  );

  const expandAll = () => setOpen(new Set(flat.map((n) => n.id)));
  const collapseAll = () => setOpen(new Set([root.id]));

  return (
    <div>
      <div className="relative mb-4">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={locale === 'ar'
            ? 'اكتب الاسم، ثم اسم الأب، ثم الجدّ لتضييق النتائج…'
            : 'Type a name, then the father, then the grandfather…'}
          className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-2)] px-4 py-3 text-base outline-none focus:border-[var(--color-primary)]"
          aria-label={t('search')}
        />
        {query.trim().length >= 2 && (
          <div className="absolute inset-x-0 top-full z-30 mt-2 max-h-80 overflow-y-auto rounded-xl border border-[var(--color-line)] bg-[var(--color-paper)] shadow-xl">
            {results.length === 0 ? (
              <p className="px-4 py-3 text-sm text-[var(--color-muted)]">
                {t('noResults')}
              </p>
            ) : (
              results.map((r) => (
                <button
                  key={r.id}
                  onClick={() => reveal(r)}
                  className="block w-full border-b border-[var(--color-line)] px-4 py-2.5 text-start last:border-0 hover:bg-[var(--color-paper-2)]"
                >
                  <span className="block text-sm font-semibold">{r.lineage}</span>
                  <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-[var(--color-muted)]">
                    <span>{t('generation')} {formatNumber(r.generation, locale)}</span>
                    {r.spouseName && <span>· {r.spouseName}</span>}
                    {r.burialPlace && <span>· {r.burialPlace}</span>}
                    {r.children.length > 0 && (
                      <span>· {formatNumber(r.children.length, locale)} {locale === 'ar' ? 'من الذرية' : 'children'}</span>
                    )}
                  </span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2 text-sm">
        <button
          onClick={expandAll}
          className="rounded-full border border-[var(--color-line)] px-4 py-1.5 hover:border-[var(--color-primary)]"
        >
          {t('expandAll')}
        </button>
        <button
          onClick={collapseAll}
          className="rounded-full border border-[var(--color-line)] px-4 py-1.5 hover:border-[var(--color-primary)]"
        >
          {t('collapseAll')}
        </button>
        <span className="text-xs text-[var(--color-muted)]">
          {formatNumber(total, locale)}
        </span>
      </div>

      <ul className="list-none" role="tree">
        <TreeBranch
          node={root}
          open={open}
          toggle={toggle}
          locale={locale}
          redactedLabel={tp('redacted')}
          uncertainLabel={tp('uncertain')}
        />
      </ul>
    </div>
  );
}

function TreeBranch({
  node,
  open,
  toggle,
  locale,
  redactedLabel,
  uncertainLabel,
}: {
  node: TreeNodeDTO;
  open: Set<string>;
  toggle: (id: string) => void;
  locale: string;
  redactedLabel: string;
  uncertainLabel: string;
}) {
  const isOpen = open.has(node.id);
  const hasKids = node.children.length > 0;

  return (
    <li id={`node-${node.id}`} role="treeitem" aria-expanded={hasKids ? isOpen : undefined}>
      <div className="flex items-center gap-1 py-0.5">
        <button
          onClick={() => hasKids && toggle(node.id)}
          aria-label={node.name}
          className={`h-7 w-7 flex-none rounded-lg text-xs text-[var(--color-muted)] transition ${
            hasKids ? 'hover:bg-[var(--color-paper-2)]' : 'invisible'
          }`}
        >
          <span className={`inline-block transition-transform ${isOpen ? 'rotate-90' : ''}`}>
            ◀
          </span>
        </button>

        <Link
          href={`/person/${node.slug}`}
          className="rounded-lg px-2 py-1 font-medium hover:bg-[var(--color-paper-2)] hover:text-[var(--color-primary)]"
        >
          {node.name}
          {node.isUncertain && (
            <span title={uncertainLabel} className="ms-1 text-[var(--color-gold-500)]">
              ٭
            </span>
          )}
        </Link>

        <span className="flex flex-wrap items-center gap-1">
          {node.notebookPage && (
            <Badge tone="page">ص {node.notebookPage}</Badge>
          )}
          {node.burialPlace && <Badge tone="burial">مدفن</Badge>}
          {node.spouseName && !node.isInternalMarriage && <Badge tone="spouse">متزوج/ة</Badge>}
          {node.isInternalMarriage && <Badge tone="internal">⚭ زواج من العائلة</Badge>}
          {node.isRedacted && <Badge tone="redacted" title={redactedLabel}>—</Badge>}
        </span>
      </div>

      {hasKids && isOpen && (
        <ul
          role="group"
          className="ms-3 border-s-2 border-[var(--color-line)] ps-3"
        >
          {node.children.map((c) => (
            <TreeBranch
              key={c.id}
              node={c}
              open={open}
              toggle={toggle}
              locale={locale}
              redactedLabel={redactedLabel}
              uncertainLabel={uncertainLabel}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function Badge({
  children,
  tone,
  title,
}: {
  children: React.ReactNode;
  tone: 'page' | 'burial' | 'spouse' | 'redacted' | 'internal';
  title?: string;
}) {
  const tones: Record<string, string> = {
    page: 'bg-[var(--color-paper-2)] text-[var(--color-muted)]',
    burial: 'bg-[var(--color-ox-100)] text-[var(--color-ox-700)]',
    spouse: 'bg-[var(--color-gold-100)] text-[var(--color-gold-700)]',
    redacted: 'bg-[var(--color-paper-2)] text-[var(--color-muted)]',
    internal: 'bg-[var(--color-primary)] text-white',
  };
  return (
    <span
      title={title}
      className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
