# PB-036 handoff — themed animal collections

*Run 9 (PB-036 manager), written 29 July 2026. Read `docs/MANAGER-ORDERS.md` for
the job. This file is PB-036's baton only — `docs/MANAGER-HANDOFF.md` belongs to
the queue manager and was not touched.*

## Queue position

- **PB-036 phase 1 (the spine): DONE.** Species-as-data shape, the roster as
  data, the first kit, the deterministic name table with pinnable entries, and
  Joe's audit bench. All five gates green, three commits.
- **PB-036 phase 1b (the other five kits): NOT STARTED.** songbird, raptor,
  swim, minibeast, bespoke. Declared in `types.ts`, `buildSpecies` throws by name
  for each.
- **PB-036 phase 2 (fan out, one agent per collection): NOT STARTED, and it is
  now unblocked for quadruped-only collections.**
- Nothing ships to a child yet, on purpose. See "why nothing is wired".

## What this run did

Built the architecture the brief names in three words — **kits before species** —
and stopped exactly where a child would first see it.

1. `src/island/species/types.ts` — what a species IS. `Species.id` is the only
   thing that may never change: it is written into every save as `Pet.species`.
2. `src/island/species/roster.ts` (779 lines) — Joe's 20-collection table
   transcribed exactly: 296 new species + the live 24 = 320. Nothing invented.
3. `src/island/species/registry.ts` — what has actually SHIPPED. Today: the 24,
   all `kit: 'kenney'` (= a GLB exists, no kit may touch it). Deliberately
   incomplete; a test asserts the 296-species gap so nobody "finishes" it.
4. `src/island/species/kits/quadruped.ts` (605 lines) — the first real kit,
   covering ~150 of the 296. Boxes and scaled spheres, Fred's idiom.
5. `src/island/species/naming.ts` — the given name, seeded deterministically
   from `species + set`, with an EMPTY pin table for Juno's save.
6. `joe/names-audit.json` + a workbench panel — Joe's manual review, resumable
   with no manager running.

## Gate results

```
$ npm test
 Test Files  79 passed (79)
      Tests  1620 passed (1620)
   Duration  29.52s

$ npx tsc --noEmit -p tsconfig.json
(no output, exit 0)

$ npm run build
dist/island/assets/index-CjYWX8pb.js   736.95 kB │ gzip: 200.70 kB
✓ built in 611ms
PWA v1.3.0  precache 8 entries (773.57 KiB)

$ npm run smoke
ok    no runtime errors on boot
ok    renders a growing reading round
ok    marks the tricky bit of a red word by round 3
ok    every wiring path runs without throwing
ok    builds the ambience layer
ok    battery is retired
ok    reading mode is active
ok    score bar initialised
all boot checks passed

$ npm run parity
self-check  spoken utterances : 4 / 4
self-check  first spoken      : ["run","got","am","a"]
self-check  score bar         : "🐚 6" / "🐚 6"
every step renders identically
```

Tree hashed before and after the gate run
(`git ls-files -co --exclude-standard | xargs sha256sum | sha256sum`):
`16269965…2a0d20df` both times — **unmoved**, no subagent had a mutation on disk.

**Revert-check I personally watched go red:** broke the invention guard in
`defineSpecies` (`if (!name || !collection)` → `if (false)`), ran
`tests/island/species-registry.test.ts`, watched *"refuses a species the roster
has never heard of"* fail (`1 failed | 7 passed`), restored, 8 passed.
Agents' own revert-checks, reported to me separately: the naming agent broke the
FNV prime and watched 6 tests fail; the workbench agent deleted its `MERGEABLE`
entry and watched 5 fail. I did not watch those two.

## Where the next manager starts

**Phase 2 is a fan-out, one agent per collection, and Garden is safe to start
on** — it is roster §6's own proposed first collection, so no ruling is needed.
Each agent adds `Species` records to `src/island/species/registry.ts` via
`defineSpecies(id, 'quadruped', { build })`, and `BASE_SPECIES` is the worked
pattern. **Read `src/island/species/types.ts` first — `QuadrupedBuild` is the
whole contract**, and `QuadrupedExtra` is a CLOSED list on purpose (roster §4:
differentiation must live in proportion and palette, not in new sculpted parts).

Before any collection can actually reach a child, three wiring jobs remain, none
of them large, all deliberately left undone this run:

1. **`src/island/pets.ts:554`, inside `prototype()`** — one early return that
   registers built species instead of loading a GLB. The exact line is written
   out in a comment at the foot of `src/island/species/kit.ts`. It goes in
   `prototype`, not `model`, because `prototype`'s promise cache is what makes
   `warm()` and `preview()` join a single build.
2. **`src/island/variants/atlas.ts:146 dress()`** must return early for built
   species. It assigns a texture `map`, and a built pet has no atlas UVs — it
   would paste atlas texels through garbage coordinates. `paletteFor()` in
   `kit.ts` is the replacement route.
3. **`src/island/main.ts:1174`** — swap `petName(defaultRng)` for
   `givenName(species, setId)`. **Do this LAST, after Joe has audited names**,
   and take the set id from wherever the variant engine picks it, never a
   hardcoded `'natural'`.

## Why nothing is wired

Roster §3's own order is **generate → audit → freeze**. Shipping unaudited names
to Juno inverts it, and names are frozen forever once she has read one. So this
run generated fourteen names, built the bench Joe audits them on, and stopped.
It also kept every change clear of `flow.ts` / `interactions.ts` / `plot.ts` /
`main.ts`, which manager 8 held for PB-048.

## What I learned that is not in the code

- **The pack's real dimensions are not what the code says.** `pets.ts:657` and
  the old comment quote 1.55–2.13 units. Parsing all 24 GLBs gives **1.43
  (elephant) to 2.02 (bee), mean 1.65**, and mean W/H **0.97**. The first
  quadruped built to anatomical proportions came out at W/H 0.37 — correct, and
  a total stranger beside `animal-fox`. The kit's reference silhouette was
  retuned to 0.69 and there is now a test on that ratio. **Kenney pets are far
  chunkier than real animals; build stocky.**
- **`joe/noun-candidates.json` and `joe/pairs-audit.json` DO NOT EXIST.**
  `MANAGER-ORDERS.md:198-199` and `joe/backlog.json:253` both say to follow "the
  way they already work". They are unbuilt artefacts pre-registered as JT-004 and
  JT-005. The real pattern is the seven-place workbench registration, now
  documented in the PB-036 commit and worked twice.
- **A whole-file save through `/api/save` can never rewrite a generated field.**
  `mergeWhole` takes only the `owns` fields off the payload. So a name
  regenerator that POSTs its new list gets a 200 and its new names are silently
  ignored on existing rows. **The regenerator must read `joe/names-audit.json`
  first and carry `verdict`/`replacement`/`note` forward itself.** The merge
  protects Joe from the page; it cannot protect him from a naive `Write`.
- **The `short` name band is the cheapest, not the dearest.** The generator's
  first-draw length histogram over 350 names is `{5:70, 6:147, 7:100, 8:31, 9:2}`.
  `short` (5–6) needs 1.57 draws on average; `long` (7–9) needs 2.78. Nine-letter
  names are genuinely rare. No band starves.
- **`save.ts:203 fromSave` passes `save.pets` through unexamined** — no
  validation, no normalisation, no name touched. That is exactly why brief §19
  holds for free today. Anyone adding a pet-shaped migration there breaks it.
- **`Pet.id` uniqueness comes from the hatch index, not the name**
  (`flow.ts:327`, `` `pet${n}-${name}` ``). Nothing anywhere parses an id — they
  are opaque runtime Map keys. Two pets with the same seeded name are still
  distinct. Worth knowing before anything keys off id.

## Decisions

**RAISED this run:**
- **JT-029** — *NEEDS JOE: is a pet's given name per SPECIES, or per species AND
  set? (PB-036)*. Roster §3's literal reading gives 8,000 names at the full
  roster, every one needing his manual audit and a clip in Olivia's voice; per
  species alone it is 320. It changes what she sees when a second hedgehog
  hatches, so Fable was deliberately **not** asked. Built the literal way
  (commit `48a6dcf`); reversing it is one line in `naming.ts` plus the pinned
  expected names in `tests/island/naming.test.ts`.

**PICKED UP this run:** none. JT-027 (*what is in the 25th egg*) is still open
and blocks PB-036 — note its own option (d), "ship the next collection before she
gets there", is exactly what phase 2 does, so shipping Garden may let him close
it without choosing.

**Deferred, not raised — they did not block me:**
- Roster §6 ship order. His own proposal (Garden → Home Pets → Birds → Ocean →
  Farm → Critters) is encoded in `roster.ts` marked `>>> PROVISIONAL`, nothing
  unlocks off it, and Garden is safe to build against without a ruling.
- Roster §6 on Prehistoric and on IUCN wording. Transcribed as the table says;
  folding Prehistoric into Dinosaurs later is a data edit, not a restructure.

**Not blocked on Joe, but must happen before any threat badge ships:** the seven
badged base-24 species are named in `registry.ts`, but **no IUCN category is
recorded for any of them.** They were deliberately not filled in from memory —
`Threat.checkedDate` exists so a status is a dated reading of the Red List, and a
remembered one only *looks* checked. Ten minutes for whoever has a browser.
