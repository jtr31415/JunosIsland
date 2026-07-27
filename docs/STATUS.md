# Pet Island — where we are

*Updated 27 July 2026, against `docs/pet-island-phase3-brief.md` and its
numbering. For the pre-Phase-3 position see the git history of this file.*

The short version: **M0 and M1 are done and proven, most of slice-1 is in, and
Phase 3 has started.** Item 0 and item 1 are complete. The game is deployed at
<https://jtr31415.github.io/JunosIsland/> and **has still not been played by
the QA department**, whose verdict outranks every document here (brief §18).

Nothing is waiting on Joe. Both prior rulings are closed: **#4 formula wins**,
**#6 tilt-shift declined**.

---

## Phase 3, item by item

| # | Item | State |
|---|---|---|
| **0** | Spec manifest | **Done.** All five documents committed (`5071e41`). |
| **1** | Hard save & restore | **Done.** See below. |
| 2 | Clock service | Not started. |
| 3 | Parity gate deflake | Not started — but see the note below. |
| 4 | Channels & flags | Not started. |
| 5 | Cube-pet material autopsy | Not started. |
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

**A Fable review of the whole item is outstanding at time of writing.**

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
- **Item 3 has not been done, and the parity gate has not flaked again.** It
  passed first time on every run today. That is not evidence it is fixed.

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
