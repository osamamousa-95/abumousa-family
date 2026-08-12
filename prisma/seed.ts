/**
 * Seed — imports the family tree transcribed from the handwritten notebook of
 * سلامة سالم أبو موسى into the database.
 *
 * Idempotent: safe to re-run. Uses deterministic slugs as the natural key.
 *
 *   npm run db:seed
 */

import { PrismaClient, Gender, Confidence, Visibility, MediaKind } from '@prisma/client';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { normalizeArabic } from '../src/lib/arabic';
import { personSlug, transliterate } from '../src/lib/transliterate';
import { parseFuzzyDate, computeIsLiving } from '../src/lib/fuzzy-date';

const prisma = new PrismaClient();

// ─────────────────────────── Source shape ───────────────────────────

interface RawNode {
  n: string;      // name
  f?: 1;          // female
  u?: 1;          // uncertain reading (٭)
  a?: 1;          // added after the notebook closed
  x?: 1;          // branch awaiting completion from the notebook
  p?: string;     // notebook page(s)
  b?: string;     // burial place as written
  s?: string;     // spouse, free text
  d?: string;     // note
  bd?: string;    // birth date, as written (e.g. "٩ ديسمبر ١٩٩٥م")
  bio?: string;   // full biography — self-supplied by a living member
  c?: RawNode[];  // children, eldest first
}

interface FlatPerson {
  raw: RawNode;
  code: string;
  generation: number;
  fatherCode: string | null;
  sortOrder: number;
  slug: string;
}

// ─────────────────────────── Reference data ───────────────────────────

const PLACES = [
  { slug: 'hejaz', name: { ar: 'ديار بني سالم — الحجاز', en: 'Bani Salim lands, Hejaz' }, country: 'SA', migrationOrder: 1, latitude: 24.47, longitude: 39.61,
    note: { ar: 'الموطن الأول بين مكة والمدينة وينبع', en: 'The first homeland, between Mecca, Medina and Yanbu' } },
  { slug: 'kafr-shubin', name: { ar: 'كفر شبين، القليوبية', en: 'Kafr Shubin, Qalyubia' }, country: 'EG', migrationOrder: 2, latitude: 30.30, longitude: 31.32,
    note: { ar: 'قرية النزول الأول في مصر؛ فيها قبر زين الدين وزوجته', en: 'First settlement in Egypt; burial place of Zain al-Din and his wife' } },
  { slug: 'wadi-al-shallala', name: { ar: 'وادي الشلالة، بئر السبع', en: 'Wadi al-Shallala, Beersheba' }, country: 'PS', migrationOrder: 3, latitude: 31.32, longitude: 34.55,
    note: { ar: 'مستقر الأسرة في فلسطين على أرض زراعية خصبة', en: 'The family seat in Palestine, on fertile farmland' } },
  { slug: 'qawz-al-izz', name: { ar: 'قوز العز — مقام الشيخ نوران', en: 'Qawz al-Izz, shrine of Sheikh Nuran' }, country: 'PS', migrationOrder: 3, latitude: 31.29, longitude: 34.42,
    note: { ar: 'مدفن شهداء حرب العزازمة وكثير من أبناء الأجيال التالية', en: 'Burial place of those killed in the Azazma war and many later generations' } },
  { slug: 'al-khalasa', name: { ar: 'الخلصة، جنوب بئر السبع', en: 'Al-Khalasa, south of Beersheba' }, country: 'PS', migrationOrder: 3, latitude: 31.10, longitude: 34.75,
    note: { ar: 'فيها قبر موسى بن زين الدين الذي تحمل العائلة اسمه', en: 'Burial place of Mousa, whose name the family carries' } },
  { slug: 'khan-younis', name: { ar: 'خان يونس', en: 'Khan Younis' }, country: 'PS', migrationOrder: 4, latitude: 31.34, longitude: 34.30,
    note: { ar: 'إليها لجأت فروع العائلة بعد نكبة ١٩٤٨', en: 'Refuge of the family branches after the 1948 Nakba' } },
  { slug: 'abasan', name: { ar: 'عبسان الصغيرة', en: 'Abasan al-Saghira' }, country: 'PS', migrationOrder: 4, latitude: 31.32, longitude: 34.34, note: null },
  { slug: 'shibin-al-kawm', name: { ar: 'شبين الكوم، المنوفية', en: 'Shibin al-Kawm, Monufia' }, country: 'EG', migrationOrder: 4, latitude: 30.55, longitude: 31.01,
    note: { ar: 'مدفن فرع عبد النبي الباقي في مصر', en: 'Burial place of the Abd al-Nabi branch that remained in Egypt' } },
];

const SOURCES = [
  { slug: 'notebook', title: { ar: 'دفتر «تاريخ وأصل عائلة أبو موسى»', en: 'Notebook: History and Origin of the Abu Mousa Family' },
    author: 'سلامة سالم أبو موسى', type: 'manuscript', year: null,
    note: { ar: 'نحو ٧٠ صفحة بخط اليد؛ المصدر الأساسي لكل أسماء هذا السجل', en: 'About 70 handwritten pages; the primary source for every name in this record' } },
  { slug: 'aref-al-aref', title: { ar: 'تاريخ بئر السبع وقبائلها', en: 'History of Beersheba and its Tribes' }, author: 'عارف العارف', type: 'book', year: '1934', note: null },
  { slug: 'al-hamdani-iklil', title: { ar: 'الإكليل، الجزء الأول', en: 'Al-Iklil, Volume I' }, author: 'الهمداني', type: 'book', year: '~945', note: null },
  { slug: 'al-badrani', title: { ar: 'فصول من تاريخ قبيلة حرب', en: 'Chapters from the History of the Harb Tribe' }, author: 'فايز البدراني', type: 'book', year: null, note: null },
  { slug: 'al-jabarti', title: { ar: 'عجائب الآثار في التراجم والأخبار', en: "Aja'ib al-Athar" }, author: 'الجبرتي', type: 'book', year: '~1820', note: null },
];

const BURIAL_TO_PLACE: Record<string, string> = {
  'كفر شبين، القليوبية': 'kafr-shubin',
  'كفر شبين': 'kafr-shubin',
  'الخلصة، جنوب بئر السبع': 'al-khalasa',
  'قوز العز — مقام الشيخ نوران': 'qawz-al-izz',
  'الشيخ نوران': 'qawz-al-izz',
  'الشيخ نوران — قوز العز': 'qawz-al-izz',
  'خان يونس': 'khan-younis',
  'عبسان الصغيرة': 'abasan',
  'شبين الكوم، المنوفية': 'shibin-al-kawm',
  'مقبرة مخيم غزة': 'khan-younis',
};

/** The two documented marriages between branches of the family. */
const INTERNAL_MARRIAGES: { husbandCode: string; wifeCode: string }[] = [
  { husbandCode: '1.1.1.1.1.2.1.4.1', wifeCode: '1.1.1.1.1.2.2.1' }, // ثائر ↔ نورهان
  { husbandCode: '1.1.1.1.1.2.1.4',   wifeCode: '1.1.1.3.3.1.4'   }, // محمد ↔ راوية
];

// ─────────────────────────── Flatten ───────────────────────────

function flatten(root: RawNode): FlatPerson[] {
  const out: FlatPerson[] = [];
  const seenSlugs = new Map<string, number>();

  const walk = (node: RawNode, code: string, generation: number, fatherCode: string | null, sortOrder: number) => {
    // ASCII slug keyed by tree position — readable when shared, and unique
    // even when a dozen cousins share the same name.
    const slug = personSlug(node.n, code);
    seenSlugs.set(slug, (seenSlugs.get(slug) ?? 0) + 1);

    out.push({ raw: node, code, generation, fatherCode, sortOrder, slug });
    (node.c ?? []).forEach((kid, i) =>
      walk(kid, `${code}.${i + 1}`, generation + 1, code, i + 1)
    );
  };

  walk(root, '1', 1, null, 1);
  return out;
}

// ─────────────────────────── Main ───────────────────────────

async function main() {
  console.log('→ Seeding عائلة أبو موسى الحربي\n');

  // 1. Places
  const placeIds = new Map<string, string>();
  for (const p of PLACES) {
    const rec = await prisma.place.upsert({
      where: { slug: p.slug },
      update: { name: p.name, country: p.country, migrationOrder: p.migrationOrder,
                latitude: p.latitude, longitude: p.longitude, historicalNote: p.note ?? undefined },
      create: { slug: p.slug, name: p.name, country: p.country, migrationOrder: p.migrationOrder,
                latitude: p.latitude, longitude: p.longitude, historicalNote: p.note ?? undefined },
    });
    placeIds.set(p.slug, rec.id);
  }
  console.log(`  places      ${placeIds.size}`);

  // 2. Sources
  const sourceIds = new Map<string, string>();
  for (const s of SOURCES) {
    const rec = await prisma.source.upsert({
      where: { slug: s.slug },
      update: { title: s.title, author: s.author, type: s.type, year: s.year ?? undefined, note: s.note ?? undefined },
      create: { slug: s.slug, title: s.title, author: s.author, type: s.type, year: s.year ?? undefined, note: s.note ?? undefined },
    });
    sourceIds.set(s.slug, rec.id);
  }
  console.log(`  sources     ${sourceIds.size}`);

  // 3. People
  const raw = JSON.parse(
    readFileSync(join(process.cwd(), 'data', 'tree.json'), 'utf8')
  ) as RawNode;
  const flat = flatten(raw);

  const idByCode = new Map<string, string>();

  // Pass 1 — create without parent links so ordering never matters
  for (const p of flat) {
    const birth = parseFuzzyDate(null);
    const death = parseFuzzyDate(p.raw.b || p.raw.d?.match(/توفي|قُتل|استشهد/) ? 'unknown-marker' : null);

    // Only genuinely dated people get dates; the notebook rarely gives them.
    const hasDeathEvidence = Boolean(p.raw.b) ||
      /تُوفي|توفي|توفيت|قُتل|استشهد|دُفن|دفنت/.test(p.raw.d ?? '');
    const deathParsed = hasDeathEvidence
      ? { text: null, earliest: null, latest: null, precision: 'UNKNOWN' as const }
      : parseFuzzyDate(null);

    const burialSlug = p.raw.b ? BURIAL_TO_PLACE[p.raw.b] : undefined;
    const birthDate = p.raw.bd
      ? { birthDateText: p.raw.bd, birthDatePrecision: 'EXACT' as const }
      : {};

    const person = await prisma.person.upsert({
      where: { slug: p.slug },
      update: {
        name: p.raw.n,
        nameLatin: transliterate(p.raw.n) || null,
        nameNormalized: normalizeArabic(p.raw.n),
        gender: p.raw.f ? Gender.FEMALE : Gender.MALE,
        nameConfidence: p.raw.u ? Confidence.UNCERTAIN : Confidence.CONFIRMED,
        sortOrder: p.sortOrder,
        path: p.code,
        generation: p.generation,
        burialPlaceRaw: p.raw.b ?? null,
        burialPlaceId: burialSlug ? placeIds.get(burialSlug) : null,
        notes: p.raw.d ?? null,
        biography: p.raw.bio ?? null,
        isLiving: !hasDeathEvidence && p.generation >= 8,
        ...birthDate,
      },
      create: {
        slug: p.slug,
        name: p.raw.n,
        nameLatin: transliterate(p.raw.n) || null,
        nameNormalized: normalizeArabic(p.raw.n),
        gender: p.raw.f ? Gender.FEMALE : Gender.MALE,
        nameConfidence: p.raw.u ? Confidence.UNCERTAIN : Confidence.CONFIRMED,
        sortOrder: p.sortOrder,
        path: p.code,
        generation: p.generation,
        burialPlaceRaw: p.raw.b ?? null,
        burialPlaceId: burialSlug ? placeIds.get(burialSlug) : null,
        notes: p.raw.d ?? null,
        biography: p.raw.bio ?? null,
        // Generations 1–7 are the notebook's historical record; 8+ are living kin.
        isLiving: !hasDeathEvidence && p.generation >= 8,
        publicVisibility: Visibility.PUBLIC,
        ...birthDate,
      },
    });
    idByCode.set(p.code, person.id);
    void birth; void death; void deathParsed;
  }
  console.log(`  people      ${idByCode.size}`);

  // Pass 2 — parent links
  let linked = 0;
  for (const p of flat) {
    if (!p.fatherCode) continue;
    const id = idByCode.get(p.code);
    const fatherId = idByCode.get(p.fatherCode);
    if (!id || !fatherId) continue;
    await prisma.person.update({ where: { id }, data: { fatherId } });
    linked++;
  }
  console.log(`  parent links ${linked}`);

  // Pass 3 — source citations (notebook page per person)
  const notebookId = sourceIds.get('notebook')!;
  let cited = 0;
  for (const p of flat) {
    if (!p.raw.p) continue;
    const personId = idByCode.get(p.code)!;
    await prisma.personSource.upsert({
      where: { personId_sourceId_page: { personId, sourceId: notebookId, page: p.raw.p } },
      update: {},
      create: { personId, sourceId: notebookId, page: p.raw.p },
    });
    cited++;
  }
  console.log(`  citations   ${cited}`);

  // Pass 4 — marriages
  const internalPairs = new Set(
    INTERNAL_MARRIAGES.map((m) => `${m.husbandCode}|${m.wifeCode}`)
  );
  let marriages = 0;
  for (const p of flat) {
    if (!p.raw.s) continue;
    const husbandId = idByCode.get(p.code)!;
    const internal = INTERNAL_MARRIAGES.find((m) => m.husbandCode === p.code);
    const wifeId = internal ? idByCode.get(internal.wifeCode) ?? null : null;

    const exists = await prisma.marriage.findFirst({
      where: { husbandId, wifeNameText: wifeId ? undefined : p.raw.s, wifeId: wifeId ?? undefined },
    });
    if (exists) continue;

    await prisma.marriage.create({
      data: {
        husbandId,
        wifeId,
        wifeNameText: wifeId ? null : p.raw.s,
        isInternal: Boolean(wifeId),
      },
    });
    marriages++;
  }
  console.log(`  marriages   ${marriages}  (internal: ${internalPairs.size})`);

  // 5. Prune — remove any Person row whose slug is no longer produced by
  // the current source data. Every prior pass only ever creates or updates;
  // without this, a name deleted from data/tree.json (or a slug scheme
  // change, as happened when slugs moved from Arabic to Latin) leaves a
  // stale orphaned row in the database forever.
  const currentSlugs = new Set(flat.map((p) => p.slug));
  const existing = await prisma.person.findMany({ select: { id: true, slug: true, name: true } });
  const stale = existing.filter((row) => !currentSlugs.has(row.slug));
  for (const row of stale) {
    await prisma.person.delete({ where: { id: row.id } });
  }
  console.log(`  pruned      ${stale.length}${stale.length ? '  (' + stale.map((s) => s.name).slice(0, 5).join('، ') + (stale.length > 5 ? '…' : '') + ')' : ''}`);

  // 6. Site content the admins can edit without touching code
  const content: { key: string; value: unknown; note: string }[] = [
    { key: 'home.mission', note: 'Homepage mission statement',
      value: { ar: 'نحفظ نسب العائلة وتاريخ رحلتها لتبقى وصلاً بين الأجيال.',
               en: "We preserve the family's lineage and the story of its journey, as a bond between generations." } },
    { key: 'home.verse', note: 'Quranic verse on the homepage',
      value: { ar: 'وَجَعَلْنَاكُمْ شُعُوبًا وَقَبَائِلَ لِتَعَارَفُوا',
               en: 'And We made you peoples and tribes that you may know one another' } },
  ];
  for (const c of content) {
    await prisma.siteContent.upsert({
      where: { key: c.key },
      update: { value: c.value as object, note: c.note },
      create: { key: c.key, value: c.value as object, note: c.note },
    });
  }
  console.log(`  content     ${content.length}`);

  // 7. Notebook scans placeholder album — ADMIN-only per decision §1.6
  await prisma.album.upsert({
    where: { slug: 'notebook-scans' },
    update: {},
    create: {
      slug: 'notebook-scans',
      title: { ar: 'صور الدفتر المخطوط', en: 'Manuscript scans' },
      note: { ar: 'متاحة للمشرفين فقط', en: 'Visible to administrators only' },
    },
  });
  console.log(`  albums      1 (notebook scans — ADMIN only)`);

  console.log('\n✓ Seed complete.');
  void MediaKind;
}

main()
  .catch((e) => {
    console.error('✗ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
