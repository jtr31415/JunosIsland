# Pet Island — Phase 3 Briefing (delta only)

For the autonomous builder. Assumes the state in `docs/STATUS.md` — nothing
already built is restated here. Canonical companions: `pet-island-brief.md`
(§5 sets/album, §17 wonders as amended 27 Jul), `docs/pet-island-slice1.md`
(costs table now matches the formula; formula canonical), 
`docs/pet-island-difficulty.md`, `docs/pet-island-voice.md`,
`docs/pet-island-lighting.md`. HANDOFF §2's three rules stand. Two prior
rulings are now closed: **#4 formula wins**, **#6 tilt-shift declined, ban
stands**.

## Item 0 — Commit the spec manifest (before anything else)

The "missing" specs exist; they were authored upstream and never committed.
Joe drops these four files into `docs/` as the first commit of the phase;
gaps 1–5 of the 27 Jul review dissolve on contact:

- `docs/pet-island-difficulty.md` — unblocks item 13 (mix vector §2, Fred's
  offer script §4, constants §9 all inside).
- `docs/pet-island-voice.md` — closes the dangling reference; no item
  depends on it this phase.
- `pet-island-brief.md` (amended) — §5 is the sets system (~40 × 24 ≈
  1,000; the 768 formulation is dead everywhere, including §16), §17 is the
  wonders catalogue, Milestones/Guardrails are §18/§19.
- `docs/pet-island-slice1.md` (corrected) — the tile cost row now matches
  the formula (…5→8, 6→9, 8→11…); formula remains canonical either way.

Draft-and-veto remains the pattern ONLY for what is delegated by design:
set palettes and names, wonder colours, quest cadence proposals. Specs are
not reconstructed from fragments while the originals exist.

Work is priority-ordered; finish a numbered item (including its acceptance
tests) before starting the next; stop clean at item boundaries if the day
ends. Every new ceremony obeys **award-then-persist-then-ceremony** (defined
in item 1) and the serene-right rule; wonder UI obeys the no-nag law.

---

## P0 — Foundations (in order; everything later stands on these)

### 1. Hard save & restore
Children will be devastated by lost progress; the 2s-unsaved-hatch bug class
must become unexpressible.

- `navigator.storage.persist()` requested at first meaningful progress
  (first hatch or first tile), result logged to the save.
- **Dual-write**: every save writes localStorage AND IndexedDB with a
  monotonic `rev`; load takes the higher rev; divergence logged.
- **Snapshot ring**: every successful save also appends to a ring of 8
  timestamped snapshots in IndexedDB (per profile).
- Save envelope: `{schemaVersion, rev, checksum, payload}`. Checksum
  verified on load; failure → newest valid ring snapshot, with a gentle
  "restored your island" toast (never an error message a child reads).
- **Migration framework**: pure functions `migrate_vN_vN+1`, unit-tested;
  CI asserts the current build loads fixture saves of the previous two
  schema versions **or all prior versions where fewer than two exist**.
  Bootstrap: today's unversioned `save.ts` format is retroactively v0;
  ship v1 with a real `v0→v1` migration, and prove the framework itself
  with a synthetic `v1→v2` fixture test (the review's reading, adopted).
- **Export/import**: gear menu → "Backup to file" downloads
  `pet-island-save-<name>-<date>.json`; import via file picker with a
  confirm that shows the save's name/date/pet-count before overwriting
  (and snapshots the current save first).
- **The persistence law**: state mutations that award anything commit to
  storage BEFORE any celebratory animation begins. Implement as a
  `persistBarrier()` awaited at the top of every ceremony entry point;
  ceremonies present already-saved facts.
- Acceptance: (a) simulated tab-kill between hatch-award and ceremony-end
  loses nothing on reload; (b) corrupted primary save restores from ring;
  (c) export→wipe→import round-trips byte-identically; (d) a test greps
  ceremony entry points for the barrier.

### 2. Clock service
All `Date`/`Date.now` reads in island code go behind `clock` (injectable).
`?debug` gains advance-day / advance-week buttons. Needed by the visitor,
difficulty's two-distinct-days gate, seasons, and the simulator.
Acceptance: visitor rollover and the consolidation gate are unit-testable
without real midnight.

### 3. Parity gate deflake
Find the nondeterminism behind the one-time 4-step flake (suspects: awaited
speech timing, animation-frame ordering, unseeded randomness in the shell).
Make it deterministic; if a genuinely async step remains, isolate it with an
explicit wait-for-condition, not a sleep. Acceptance: 50 consecutive green
runs in CI, scripted.

### 4. Channels & flags
- Production = tagged releases only (what Juno's PWA pins to); preview =
  main. Separate paths or query-switch on Pages — builder's choice, but the
  dev stamp must name the channel.
- A tiny feature-flag module; all Phase-3 user-facing features land behind
  flags, default-off in production.
- `balance.dev.json` overlay (compressed-time tuning, wonder thresholds ÷10)
  loads only when flagged and is structurally unloadable in production.
Acceptance: same commit produces prod bundle without dev overlay code paths
reachable (test via build output grep + runtime flag probe).

## P1 — The living island (M2 under the amended specs)

### 5. Cube-pet material autopsy (unblocks 6)
Inspect the pet GLBs and `Textures/colormap.png` usage: image-texture UVs,
flat material colours, or vertex colours? Choose the variant compositing
route accordingly (canvas-composited per-variant texture vs material colour
params vs attribute rewrite), document the finding and decision in HANDOFF
§6, and add a landmine note if cloning/disposal rules change. This replaces
the report Joe owed.

### 6. Sets & the variant engine (brief §5 as amended)
- ~40 named sets × 24 species ≈ 1,000 creatures. Set 1 = the natural
  Kenney palette. **Set palettes and set names are yours to design** —
  funky, saturated, distinct; face decal never changes; goldens/sparkle
  rarity deferred.
- Variant identity `{setId, speciesId}`; rendering via the route chosen in
  item 5; **clone-shares-materials rule applies** — no disposal of shared
  resources (HANDOFF §6).
- **Pet-o-matic** dev page: every species × every designed set on
  turntables, keyboard-pageable, for Joe's veto pass.
- Acceptance: 1,000 distinct renders enumerable in Pet-o-matic; a golden
  test pins that natural-set pets she already owns render identically to
  before the engine landed.

### 7. Progressive album + set unlocks
- Album shows only unlocked sets; one page per set; per-set counts
  ("17 / 24"), never a global figure.
- Hatch pool draws from unlocked, incomplete sets, weighted toward the
  current set. `balance.sets = {size: 24, unlockAt: 0.85}`.
- At 85% of the current set: **set-reveal ceremony** — new page flutters
  into the book, its first egg arrives on the shore. Award-then-persist
  applies (unlock is saved before the flutter).
- Set completion (24/24): golden ceremony + stardust payout (see 15).
- Acceptance: unlock fires exactly once per set (latched in save);
  sim-driven test walks three unlocks; a straggler-gifting hook exists for
  the visitor/quests (wired in 8–9).

### 8. Habitats, nursery, wants — and the #11 move-in resolution
- `species.homeBiome` table (data): water species → water/river; the rest →
  grass until the ladder (14) adds families.
- **Nursery**: a basket by the home tile; hatched pets without a suitable
  tile wait there, cheerful, with a want-bubble ("Sharky needs water!").
  Cap 3 feeds the existing egg governor.
- **Move-in, resolved**: when a tile lands, any nursery pet whose homeBiome
  matches relocates with a heart-burst move-in ceremony (persist first).
  Before biome families exist beyond grass/water this is simply: water
  creatures wait for water. No-op when nothing matches — the check is now
  defined; close #11's design question.
- Wander constraint: pets roam only tiles of their homeBiome group (plus
  the home tile).
- Acceptance: hatch a water pet with no water → nursery + bubble; place
  water → move-in fires once, persisted before animation.

### 9. Pet quests v1
- Resident pets periodically raise a bubble requesting a word (find), a
  built word, or a sum — served by the existing challenge stage with the
  pet on the vignette turntable (serene-right applies).
- Cadence and cooldowns in balance (`quests: {minGapMin, perSessionCap}` —
  propose values, keep them data). Rewards: affection hearts (cosmetic
  counter on the pet card), occasional gifts: a straggler pet from the
  current set, or stardust (15).
- Never interrupts: bubbles appear only in watch-mode, per the attention
  economy law.
- Acceptance: a quest completes end-to-end through the stage; declining or
  wandering off costs nothing and the bubble politely returns later.

### 10. Daily visitor
- Date-seeded via `clock` (port the day-latch + first-unowned scan pattern
  from the 2D collection module — it is already battle-tested, including
  the once-per-day gift latch).
- The visitor brings an egg for the current set; befriend goal from
  balance; renders only in its home-biome area, waiting happily.
- Acceptance: rollover via advance-day; the latch prevents cascades (pin
  with a regression test named after the unicorn parade).

### 11. Small ports
- The "1s breath" on the non-opening path (issue #11 remainder).
- **Find-my-pet**: album tap → name spoken → "Find [name] on the island?"
  → book closes, camera glides ~1.2s, damped follow until any tap;
  nursery pets found at the basket. Respect `inCeremony`.

## P2 — The progression engine

### 12. Per-item records + scheduler core
`{id, seen, correct, streak, avgMs, lastSeen}` per word/grapheme/fact,
persisted per profile. Selection weighting: due-for-review (Leitner boxes,
intervals ~1/3/7/21 sessions) mixed ~70/30 with new items. Scoped to power
13 and 15 — the Owl's Book, families UI, dashboard and school import are
explicitly NOT this phase.

### 13. Adaptive difficulty (`pet-island-difficulty.md` §§1–7, 9 + decay)
- Implement signals (EWMA α .15, window 20, personal-baseline fluency),
  maths strata S0–S4 with the mix vector, probes (1-in-8–12 above 80%),
  the Fred offer at completion highs (script lines from the spec), the
  honeymoon (pay 4, 2 sessions, cost-curve freeze), silent mercy, and the
  agreed **mastered pay-decay**: `{deepStreak: 8, pay: 1}` — continuous,
  mastery-triggered, never refusal-triggered.
- Reading strata v1 = word-length only (stub the vector; full reading
  strata next phase).
- All constants under `balance.difficulty` exactly as the spec's §9.
- Acceptance: unit tests per gate/trigger; a sim persona ("Reluctant
  Decliner") demonstrates decay pressure with zero refusal-contingent
  effects — assert no code path keys off decline events except offer
  cooldown and the dashboard flag.

### 14. Biome & tile ladder (against the real atlas)
- Start set grass + water. Unlocks: **spring** (light-green palette) →
  **desert** (autumn palette) → **ice** (winter palette), slice-1 §7
  placeholder thresholds, constants in balance.
- Rivers = water-adjacent habitat (water species may roam them); coast
  shapes auto-select as today; roads exist in the atlas — flag-gate as a
  future decoration economy, do not surface yet.
- Unlock ceremony: Fred announcement + the new type glowing in the next
  pick-of-three; new pet families (per the homeBiome table) become
  hatchable with each biome.
- **Author the three missing lighting presets** — spring, desert, ice —
  per `pet-island-lighting.md` §5 (sky pair, sun, hemi, fog-from-horizon,
  exposure, particles); only `meadow-day.json` exists today. Your colour
  judgement, Joe's veto from the preview page.
- Acceptance: ladder walk via sim/dev-grant; each biome's tiles
  screenshot-fixtured under its own preset AND under meadow-day (tiles
  outlive the season they were placed in).

## P3 — Wonders v0 + the test apparatus

### 15. Stardust, the Star Pool, the first wonder
- Stardust sources v0: `streak5: 2`, `questChain: 4`, `setComplete: 8`
  (reviewClear and familyComplete wire in when families exist — leave the
  hooks). Never from time; never from deep-mastered items.
- **Star Pool**: a small pond wonder placed with the first threshold; it IS
  the meter — star-motes accumulate in the water proportional to stardust;
  no HUD anywhere. Shooting-star reveal lands here.
- Threshold curve `balance.wonder` as specced, plus an explicit order:
  `balance.wonder.order = ["starPool", "stoneRing", "blossomI"]` for this
  phase. **The first fill forms the Star Pool itself** — the inaugural
  shooting star lands and the pond appears where it struck (the meter's
  own origin story); the second fill reveals the **Ancient Stone Ring**
  (nap spots; faint glowing carvings; Fred's "who built these?" bark).
  Later catalogue entries extend the array next phase.
- **Wonder Gallery** dev page: plays any reveal/enchantment ceremony on
  demand, no economy attached.
- Acceptance: award-then-persist on reveals; the pool renders mote counts
  from the save; gallery enumerates ceremonies.

### 16. Persona simulator
- `npm run sim`: drives the REAL core (flow, scheduler, difficulty,
  stardust, sets) — no mocks, per HANDOFF's own lesson — with persona
  answer-generators: Steady, Keen Daily, Reluctant Decliner, Wobbly,
  Speedrunner. Seeded; a failing property prints its seed.
- Emits per-run timelines; asserts distributions: first wonder p90 ≤ 8
  virtual days (Steady); no stardust drought > 5 active days for any
  persona; set-2 unlock inside days 4–10 (Steady); honeymoon never
  overlaps a cost-curve step.
- Fast variant (50 runs × 30 days) joins the CI gates.

### 17. Blossom enchantment I (if the day allows)
Retint + particle pass on an established blossom cluster per brief §17;
Gallery entry; tiers II–III and the rest of the catalogue are next phase.

---

## Explicitly deferred (do not start)
Owl's Book, fact families UI, parent dashboard, school-list import, Legends
creatures, harbour/castle/remaining wonders, reading strata beyond length,
voice bake pipeline execution, seasons-by-calendar, archipelago.

## Blocked on Joe (park; never stall on these)
GCP key (draft voice adapter can land keyless behind a flag), voice
auditions, the 43 phoneme recordings, premium TTS account, on-tablet
measurements for the Juno Gate. The pet-anatomy report is NOT blocked — it
is item 5, yours now.

## End of day
Run all five gates plus the new sim gate; update STATUS.md against this
briefing's numbering; request the Fable 5 review with the full diff and ask
it to attack: the persistence barrier coverage, refusal-contingency in 13,
set-unlock latching, and anything that touches her existing save.
