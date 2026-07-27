# Pet Island — where we are

*Updated 27 July 2026, against `docs/pet-island-phase3-brief.md` and its
numbering. Read `docs/HANDOFF.md` first for how to work on this without
breaking it; this is what has been done and what is left.*

**Phase 3's P0 is complete (items 0–4) and P1 has started (items 5–6).** The
game is deployed at <https://jtr31415.github.io/JunosIsland/> and **has still
not been played by the QA department**, whose verdict outranks every document
here (brief §18).

36 commits sit on `main`, unpushed, at the time of writing.

---

## Phase 3, item by item

| # | Item | State |
|---|---|---|
| **0** | Spec manifest | **Done** (`5071e41`). |
| **1** | Hard save & restore | **Done**, incl. a Fable review and its five fixes. |
| **2** | Clock service | **Done.** |
| **3** | Parity gate deflake | **Done.** 50/50 green in 399s. |
| **4** | Channels & flags | **Done.** Needs Joe's first release tag to mean anything. |
| **5** | Cube-pet material autopsy | **Done.** `npm run pets:atlas`; finding in HANDOFF §6. |
| **6** | Sets & the variant engine | **Done bar wiring**, and **wants Joe's veto**. |
| 7 | Progressive album + set unlocks | **Next.** Owns wiring variants onto live pets. |
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

---

## Waiting on Joe

1. **The first release tag.** Item 4 built the channel split — root is
   production from the newest `v*` tag, `/preview/` is main — but until a tag
   exists production falls back to main, so the split is real in the machinery
   and not yet in what Juno plays. He has said this is 2–3 days out and to keep
   building meanwhile.
2. **The Pet-o-matic veto.** `npm run dev` → `/?petomatic&only=petOMatic`.
   Twelve bold colours × solid/stripy/spotty. Unjudged: whether the stripe
   pitch reads as stripes or as noise at pet scale, and whether these are the
   right twelve colours.
3. **Everything visual from the last stretch is unjudged by eye** — the rebuilt
   egg, the coast fix, one-tap tile siting, and the new grown-ups PIN keypad
   and menu. All are tested; none has been looked at.

## One question to settle before item 13

`pet-island-difficulty.md` §5 and slice-1 §4 are in the same currency and
disagree. Today one sum banks one unit against a tile costing 1–16. §5 sets
easy = 2, tricky = 3, honeymoon = 4, and Phase 3 adds mastered = 1. The day
item 13 lands, every tile halves in length for an ordinary child — the eighth
tile drops from eleven sums to six — and only the mastered case restores
today's pace. Either the cost curve re-bases or session length halves. This
wants numbers, not a decision in the abstract.

---

## What the last stretch changed

Almost all of it came from Joe playing and reporting. Each change is committed
with its reasoning; `git log` is the long version.

**Save (item 1).** Two copies, checksum, eight snapshots, migrations,
export/import on the gear, `navigator.storage.persist()`. The barrier is a
TYPE: awarding mints a `Committed` token and `ceremony()` demands one, so a
celebration without a completed save does not compile.

Two near-catastrophes were caught here. Juno's existing save is the
pre-envelope shape and the new reader called it "not one of ours" — deploying
as first written would have **wiped everything she owns**. And two concurrent
saves could claim the same revision, letting the older island win and losing a
just-hatched pet *despite* the awaited receipt. Both fixed, both pinned.

**Collision and clipping.** The egg was in nothing's obstacle list, so pets
walked through the one object she is meant to walk up to and tap. It also
"appeared" rather than arriving, because `arrive()` fired at boot while
`placeEgg` waited on prop loading — so it flew in at the origin and teleported.
Every keep-out radius was a guess and always low; all measured now, at walking
height for pets and full footprint for scenery.

Trees inside rocks took two goes: the first fix went into `props.ts`, but the
tiles she BUILDS come through the growing plot, a second placement path with no
overlap check at all. Eight hex-wide pieces cannot fit round one hex — that is
arithmetic, not taste — so grown pieces have their own smaller size.

**The variant engine (items 5–6).** Colour is entirely a texture lookup, so a
set is one recoloured atlas. Getting "which colour is the coat" right took
three attempts and Joe caught each one: a hue rotation does nothing to a white
animal; per-band base detection lets the pale species lose the vote to the 23
others sharing that band; exact-RGB membership banded every animal like a
deckchair. It is per-species now — from `species-base.json`, generated from the
models' own UVs — over a colour REGION rather than a list.

**Feel.** Tapping Fred restarted the intro mid-game; he greets like any pet now
and the story replay moved behind the PIN. Tapping any grass started a maths
round, which made looking round the island a minefield; land is asked for at a
glowing socket, and the socket she taps is where the tile goes — one question
and one tap fewer. The offer no longer shows grass twice.

**The egg** is ten shell pieces that ease apart with every page and fall away at
the hatch, rather than crack decals on a solid ovoid that could never break.

**The grown-ups dialogs** are in the game's own UI — keypad PIN, a menu of
buttons with their consequences, red buttons for the two irreversible things.

---

## Known limits, honestly

- **The coast has a measured ceiling, not a clean win.** Walls (land in the
  water) and cliffs (water against her grass) trade against each other: raising
  the wall cost from 40 to 100 cuts walls 37→11 but takes cliffs 1→24. Ordinary
  ponds are clean; an L-bend or three-hex channel keeps one fault, because no
  model in the pack has four land edges. The measurement is in the test so the
  next person to reach for that number sees the price first.
- **Per-species textures.** Item 6 builds one texture per (set, species) on
  demand. Fine for the Pet-o-matic; **watch it on the tablet** once a child owns
  many pets across many sets. If it bites, cap the cache — do not change the
  rule.
- **Eye-whites get faintly tinted** by a set. Forced: the models have no
  separate face mesh and no texel belongs only to faces, so the only way to keep
  whites white is to keep white animals white.
- **Item 3 fixed the flake but the soak runs nightly**, not per push. A single
  green parity run has never been evidence here.
- **`docs/nextphase.zip`** is still in the repo, uncommitted and now redundant.

## Scope discovered, not in the brief

- **The splice law changes shipped behaviour.** Amended brief §3 rewrites
  opening beats 6 and 7, and `script.ts` still speaks `[NAME]`. Agreed: the text
  half folds into **item 11**; the voice half needs the bake pipeline and is
  blocked on Joe.
- **Names are fixed per variant** (Joe's ruling). Recorded in brief §5 and
  voice.md §2. Consequences for items 6–7: the generator moves to build time,
  there is no hatch-time draw, and set order is a reading ladder that cannot be
  reshuffled freely.
- **The legendary ten sets** are deliberately absent — creatures wearing props,
  around 750 challenges in, belonging with the wonders work.
- `voice/scripts.json` is a running ledger: no spoken line reaches the island
  without an entry.
