# عائلة أبو موسى الحربي — abumousa.family

A documented genealogy and family-history platform for the Abu Mousa Al-Harbi family.

**Primary source:** the handwritten notebook *«تاريخ وأصل عائلة أبو موسى»* by its author,
**سلامة سالم أبو موسى** — around 70 pages recording the family from Zain al-Din
al-Harbi's migration out of the Hejaz to the present day.

**Compiled and edited by:** أسامة وحيد سلمان أبو موسى

---

## Status — Phase 0 complete

| | |
|---|---|
| Records seeded | **271 people, 10 generations** |
| Locales | Arabic (default) · English |
| Themes | Light · Dark |
| Stack | Next.js 15 · TypeScript · Tailwind v4 · Prisma · Neon Postgres |
| Hosting | Vercel |

---

## Setup from zero

### 1. Prerequisites

- Node.js 22 or newer
- A [Neon](https://neon.tech) account (free tier)
- A [Vercel](https://vercel.com) account (free tier)
- A [Cloudinary](https://cloudinary.com) account (free tier) — not needed until Phase 5

### 2. Install

```bash
git clone https://github.com/<you>/abumousa-family.git
cd abumousa-family
npm install
```

### 3. Create the database

1. In Neon, create a project called `abumousa`.
2. Copy **both** connection strings — the pooled one and the direct one.
3. Create your local env file:

```bash
cp .env.example .env
```

4. Fill in `DATABASE_URL` (pooled) and `DIRECT_URL` (direct).
5. Generate an auth secret and paste it into `AUTH_SECRET`:

```bash
openssl rand -base64 32
```

### 4. Create the tables and load the family

```bash
npm run db:migrate     # creates the schema
npm run db:seed        # imports all 271 people from data/tree.json
```

Expected output:

```
  places       8
  sources      5
  people     271
  parent links 270
  citations  231
  marriages    8  (internal: 2)
  content      2
  albums       1 (notebook scans — ADMIN only)
✓ Seed complete.
```

### 5. Run it

```bash
npm run dev
```

Open <http://localhost:3000> — you will be redirected to `/ar`.
English is at `/en`.

Inspect the data directly with `npm run db:studio`.

---

## How the data model works

Three decisions are worth understanding before you edit anything.

**Codes are derived, never typed.** Every person has a `path` like `1.1.2.3`.
It is computed from `sortOrder` — the order in which children are listed,
eldest first. Contributors supply that order; nobody ever writes a code by hand.
`src/lib/tree-path.ts` recomputes the whole tree in one pass.

**Dates are fuzzy on purpose.** The notebook says *«نحو ١٨١٢م»*, not a
timestamp. Each date is stored as display text plus an earliest/latest bound
plus a precision flag, so the original wording survives while sorting still
works. See `src/lib/fuzzy-date.ts`.

**Privacy is enforced in the data layer, not the UI.** Living family members
are public as a name and a tree position only; everything else requires a
signed-in family member. Several branches live in Gaza, Khan Younis and Abasan,
and publishing their birth dates, residences and photographs is a real safety
exposure. `src/server/services/privacy.ts` strips those fields before data ever
reaches a component, so a forgotten check in the UI cannot leak anything.

Notebook scans are **admin-only** and served through signed, short-lived URLs.

---

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript, no emit |
| `npm run db:migrate` | Create/apply a migration locally |
| `npm run db:deploy` | Apply migrations in CI/production |
| `npm run db:seed` | Import the notebook records |
| `npm run db:studio` | Browse the database |
| `npm test` | Unit tests |

---

## Deploying

1. Push to GitHub.
2. Import the repository in Vercel.
3. Add every variable from `.env.example` to Vercel's environment settings.
4. Set the build command to `npm run build` (it runs `prisma generate` first).
5. Add `abumousa.family` under Vercel → Domains and follow the DNS instructions.

Migrations run against production with `npm run db:deploy`. Neon's branching
lets each pull-request preview get its own isolated copy of the data, so a
destructive migration is tested on real-shaped data before it touches
production.

---

## Backups

Three layers, by design:

1. **Neon point-in-time recovery** — 7 days, automatic. Operational recovery.
2. **Nightly Git escrow** — a GitHub Action dumps the database to a *private*
   repository as JSON and **GEDCOM 5.5.1**, and commits it. Long-term survival.
3. **Cloudinary manifest** — exported alongside the data.

GEDCOM matters more than it looks: it is the universal genealogy interchange
format. If this platform ceases to exist in 2045, a descendant with that repo
can import the entire family into any genealogy software then in use, and lose
nothing.

Restore procedure lives in `docs/runbook.md` and is drilled once per phase.

---

## Repository layout

```
prisma/          schema, migrations, seed
data/            tree.json — the transcribed notebook
src/
  app/[locale]/  pages, locale-aware
  components/    ui primitives, tree, history, map, admin
  server/        db client, services (privacy, tree paths, gedcom)
  lib/           fuzzy dates, Arabic normalisation, localisation
  messages/      ar.json, en.json
  i18n/          routing and request config
.github/         CI and nightly backup
```

Business logic lives in `src/server/services` and is unit-testable without HTTP.
Components never call Prisma directly.

---

## Roadmap

- [x] **Phase 0** — foundations, schema, seed, bilingual routing, design tokens
- [ ] **Phase 1** — interactive tree, person pages, search *(next)*
- [ ] **Phase 2** — history, timeline, migration map
- [ ] **Phase 3** — authentication, admin dashboard
- [ ] **Phase 4** — public contributions and moderation
- [ ] **Phase 5** — galleries, notable members
- [ ] **Phase 6** — CMS, GEDCOM export, accessibility and performance pass

---

## License and use

Private family archive. The genealogical content belongs to the family; the
notebook is the intellectual and historical work of سلامة سالم أبو موسى, and
every credit line must name him.
