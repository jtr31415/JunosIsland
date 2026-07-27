# Pet Island — where we are

*Updated 27 July 2026, against `docs/pet-island-phase3-brief.md` and its
numbering. For the pre-Phase-3 position see the git history of this file.*

The short version: **M0 and M1 are done and proven, most of slice-1 is in, and
Phase 3's whole P0 is complete** — items 0 through 4, the foundations
everything later stands on. The game is deployed at
<https://jtr31415.github.io/JunosIsland/> and **has still not been played by
the QA department**, whose verdict outranks every document here (brief §18).

Both prior rulings are closed: **#4 formula wins**, **#6 tilt-shift declined**.
One new thing wants Joe: **the first release tag** (item 4, below). Nothing is
blocked on it.

---

## Phase 3, item by item

| # | Item | State |
|---|---|---|
| **0** | Spec manifest | **Done.** All five documents committed (`5071e41`). |
| **1** | Hard save & restore | **Done.** See below. |
| **2** | Clock service | **Done.** |
| **3** | Parity gate deflake | **Done.** 50/50 green. |
| **4** | Channels & flags | **Done.** One decision for Joe, below. |
| **5** | Cube-pet material autopsy | **Done.** Finding in HANDOFF §6. |
| 6 | Sets & the variant engine | Not started. |
| 7 | Progressive album + set unlocks | Not started. |
| 8 | Habitats, nursery, wants | Not started. |
| 9 | Pet quests v1 | Not started. |
| 10 | Daily visitor | Not started. |
| 11 | Small ports | Not started — scope grew, see below. |
| 12 | Per-item records + scheduler | Not started. |
| 13 | Adaptive difficulty | Not started — one question to settle first, below. |
| 14 | Biome & tile ladder | Not started. |
| 15 | Stardust, Star Pool, first wonder | Not started. |
| 16 | Persona simulator | Not started. |
| 17 | Blossom enchantment I | Not started. |

### Item 0 — the spec manifest

The four documents plus the briefing are in. Renumbering the brief (wonders
became §17, pushing Milestones to §18 and Guardrails to §19) silently
repointed twenty `brief §18` cites in the tree — including HANDOFF's own rule
2, the line telling the next session the guardrails are non-negotiable. All
moved in `3b01ba6`.

### Item 1 — hard save & restore

All four acceptance criteria met, and one catastrophe caught on the way.

- **Dual-write** to localStorage and IndexedDB, arbitrated by a monotonic
  `rev` and never by a timestamp — clocks go backwards on a tablet whose
  battery died, and "newest by clock" picks the older save.
- **Envelope** of `{schemaVersion, rev, checksum, updatedAt, data}`, with the
  checksum taken over a canonical (sorted-key) serialisation, because a
  checksum over `JSON.stringify` is a checksum over key insertion order.
- **Snapshot ring** of eight per document, zero-padded so eviction takes the
  oldest rather than, as it first did, the newest.
- **Migrations** chain one step at a time; v1→v2 is real. A save from the
  future is refused rather than guessed at.
- **Export/import** on the grown-ups gear, behind the existing DDMM PIN.
  Import shows whose island, when, and how many friends, and snapshots the
  current save before overwriting.
- **`navigator.storage.persist()`** requested at first meaningful progress
  rather than at boot, with the answer recorded in the save.
- **The barrier is a type, not a habit.** The brief asks for a grep test;
  instead, awarding mints a `Committed` token and `ceremony()` requires one, so
  a celebration without a completed save does not compile. Retrofitting it
  found the gap it was built for: `persist()` was `void saveIsland(...)`, so
  "save first, celebrate second" was true in the source and false in time.

**The catastrophe.** Juno's existing save is the pre-envelope
`{schemaVersion, updatedAt, data}` shape. The new reader called it "not one of
ours" and resolved it to null — so deploying item 1 as first written would have
booted her a brand new island and wiped every friend and tile she owns. Fixed
in `abde7d2` by adopting legacy documents at rev 0. It passed every test in the
file beforehand, because every test wrote its fixture through the new store.

**The Fable review found four more, one of them another way to lose a pet.**
All fixed in `7173b23`:

- Two concurrent saves could claim the same revision, and the older island
  could then win — defeating the barrier from underneath. Revisions are
  claimed synchronously now and writes queued per document. My first two tests
  for it both passed against the bug; they are rewritten and now fail without
  the fix.
- **"Start again" had silently stopped wiping anything** — it cleared the
  localStorage key and the IndexedDB copy came straight back on reload.
- Backup could export the stale copy on a storage-squeezed device, which is
  the one device where a backup matters.
- Import re-sealed a damaged file into a valid save, the only path where the
  checksum was not consulted.
- A full disk broke the hatch ceremony: an unguarded ring write rejected after
  the save had already landed.

**Two deviations from the brief, recorded rather than hidden.** Acceptance (c)
asks for a byte-identical export→import round trip, which is unmeetable as
written — `rev` and `updatedAt` legitimately change on restore — so the test
asserts the payload round-trips instead. And the migration numbering treats
the existing saves as v1 rather than retroactively v0, because
`schemaVersion: 1` is literally what is on her tablet; the synthetic ladder
test proves the framework as the brief intended.

### Item 2 — clock service

One clock, built in boot, asked by everything that cares what day it is: the
store's timestamps, the grown-ups PIN, the backup filename. Adjustable only
under `?debug`, which gains `+1d` and `+7d` buttons and a `__world.clock`
handle. Days are **local**, not UTC — a child's day starts when she wakes up,
not at 1am BST — and `daysBetween` parses at noon so a 23- or 25-hour day when
the clocks change cannot round to zero or two and break difficulty's two-day
gate. The UK's 2026 transitions are test fixtures.

The challenges' `Date.now()` calls deliberately stay on real time. They are
elapsed-time input gates, not calendar reads; on an adjustable clock, pressing
`+7d` throws every deadline into the past, releasing every input lock at once
and silently disabling the mash-rescue. That reasoning lives in
`platform/clock.ts` so the next sweep is not tempted.

### Item 3 — parity gate deflake

**50 / 50 green in 399s, no restless steps.** Acceptance met.

The flake was the harness, not the port. Each step settled on a fixed sleep
and then snapshotted both jsdom instances, which run real timers
independently — so a scheduling hiccup left one finished and the other
mid-way, reporting several diffs at once and then passing cleanly. Each DOM is
now polled until its own snapshot holds still; waiting for the two to *agree*
would mask the differences the gate exists to find. The seeded RNG was
investigated and cleared: each DOM gets its own injected stream.

Fixing it revealed the gate had been covering less than it claimed — the
self-check now drives four spoken words and a score of 6, against three and 4
before, because the sleep was cutting the script short.

`npm run parity:soak` is the proof, and CI runs it nightly and on demand in
its own job rather than on every push, so a slow proof never blocks a deploy.

### Item 4 — channels and flags

Root is production and is built from the newest `v*` tag; `/preview/` is built
from main. Juno's PWA is installed against the root, so that is where
production has to stay. The dev stamp names the channel.

Nine flags, one per unbuilt feature. In production every one is off and the
query string is not consulted at all — no URL a child could arrive at can turn
an unfinished feature on. `balance.dev.json` is *absent* from a production
bundle rather than guarded: `__CHANNEL__` is a build-time define, so Rollup
deletes the branch and the chunk is never emitted. `npm run channel` proves it
by grepping the built output, and CI runs it against both builds.

**Waiting on Joe: the first release tag.** Until a `v*` tag exists, production
falls back to main — so today the root is still whatever main last built, and
the channel split is real in the machinery but not yet in what she plays.
Cutting the first tag is a release decision and yours. Everything is in place
for it: tag, push, and the root becomes that tag while main keeps flowing to
`/preview/`.

### Item 5 — cube-pet material autopsy

Measured, not guessed, and re-runnable with `npm run pets:atlas`. One material
per pet, one shared texture, **no vertex colours and no `baseColorFactor`** —
colour is entirely a texture lookup, across 710 texels of a 512×512 atlas
arranged in seven columns.

**A set is one recoloured atlas.** Because all 24 species share the single
material, recolouring is per-SET rather than per-variant: one composited image
serves a whole set, so ~40 images cover the ≈1,000-creature space. That is a
much cheaper item 6 than it looked.

The recolour rule is **saturation, not position**: no texel is shared by all 24
species, and columns mix eye-whites with coat colours, but 9% of sampled texels
are achromatic and 6% near-black — the eyes and face — against 64% chromatic.
Shift the chromatic and leave the rest, and brief §5's "the face decal stays
constant" holds by construction rather than by care.

Both alternative routes are measured shut, and the cloning landmine is written
up: a clone arrives with the BASE material, and a set's texture is shared by
every pet in it, so it is cached and detached, never disposed.

---

## Scope discovered during Phase 3

Not in the briefing, and needing a home:

- **The splice law changes shipped behaviour.** Amended brief §3 rewrites
  opening beats 6 and 7, and `src/island/script.ts` still speaks `[NAME]`
  aloud. Agreed with Joe: the text half — name to "friend", print-only
  everywhere else, beat 7 restructured into three chained lines — folds into
  **item 11**. The voice half needs the bake pipeline and is blocked.
- **Names are fixed per variant** (Joe's ruling, 27 Jul). Recorded in brief §5
  and voice.md §2. Consequences for **items 6 and 7**: the name generator moves
  to build time, there is no hatch-time draw and no recycling rule, and set
  order becomes a reading ladder that cannot later be reshuffled freely.
- **`voice/scripts.json`** now exists and is a running file: no spoken line may
  reach the island without an entry.

## One question to settle before item 13

`pet-island-difficulty.md` §5 and slice-1 §4 are in the same currency and
disagree. Today one sum banks one unit against a tile costing 1–16. §5 sets
easy = 2, tricky = 3, honeymoon = 4, and Phase 3 adds mastered = 1. The day
item 13 lands, every tile halves in length for an ordinary child — the eighth
tile drops from eleven sums to six — and only the mastered case restores
today's pace. Either the cost curve re-bases or session length halves. Not
blocking; it wants numbers, and it gets them when item 13 starts.

## Smaller things noticed, not yet done

- slice-1 §8's `balance.wonder.sources` lacks `setComplete: 8`, which item 15
  names as a v0 source.
- `voice.md` §2 reasoned from "1,000 names vs 768 pets"; with ~1,000 creatures
  the pool is no longer comfortably larger than the space. Superseded by the
  fixed-name ruling, which removes exhaustion entirely.
*(The parity note that stood here is resolved — see item 3 below.)*

---

## Fixes from play, this session

Joe's notes from playing, all fixed and pinned:

- **The sign posts** ran a third of the way into the board and stood proud of
  the lettered face, so they were drawn on top of her own name.
- **The coastline.** The sand ramp is wider than the water arc, so aiming the
  water at the sea puts the ramp's shoulders against her fields. Scoring every
  orientation against what neighbours present took it from 112 sand-against-
  grass edges and 12 cliffs to 57 and 1. A Fable review then found that scoring
  each tile as though every wet neighbour were open water cliffs a tenth of
  water-to-water edges; the island now solves to a fixed point.
- **Clipping.** Every keep-out radius was a guess and always low — a mountain
  measuring 0.9 across declared 0.58, so pets walked a third of a unit into it.
  All measured now, at walking height for pets (a pet under a canopy has not
  clipped anything) and at full footprint for scenery.

**One consequence of the coast rule wants Joe's eyes:** green edges being
sacrosanct means that on a jagged coast the scorer will sometimes present land
toward open water — a green wall out of the sea, and in a grass/water zigzag a
tile placed as water draws as mostly lawn. If it reads wrong on the tablet the
fix is a weight in `mismatch`, not the algorithm.

---

## The thing I still cannot test

Juno has not played this. Everything above is verified by tests, by the five
gates and by driving the deployed build — but whether a ceremony seen forty
times in a sitting still lands, whether the beach band reads as a beach, and
whether the opening is quick enough are hers to answer. Brief §18 already says
her verdict outranks this document.
