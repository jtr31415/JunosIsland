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
| **6** | Sets & the variant engine | **Done bar wiring.** Colours **accepted** by Joe; eye-whites and pupils in hand. |
| 7 | Progressive album + set unlocks | **Next.** Owns wiring variants onto live pets, and now owns a **shorter ladder** — see below. |
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
2. **The Pet-o-matic veto is DONE.** Joe's verdict on 27 July: the four
   base-coat faults are fixed and *"rest of the animal colouring slice is
   accepted"*. The remaining eye-white and pupil work is specified and in hand.
3. **Enclosed ponds are no longer constructible**, and that is a gameplay change
   he should veto if it is wrong. Confining water to the 19 drawable
   neighbourhoods is what lets the water cell carry its whole beach, which is
   what keeps her fields from being re-cut — but it means water grows as
   coastline and never as a hole in the middle of her island.
4. **Still unjudged by eye:** the rebuilt egg, one-tap tile siting, and the
   grown-ups PIN keypad and menu. Tested, never looked at.

## One question to settle before item 13

`pet-island-difficulty.md` §5 and slice-1 §4 are in the same currency and
disagree. Today one sum banks one unit against a tile costing 1–16. §5 sets
easy = 2, tricky = 3, honeymoon = 4, and Phase 3 adds mastered = 1. The day
item 13 lands, every tile halves in length for an ordinary child — the eighth
tile drops from eleven sums to six — and only the mastered case restores
today's pace. Either the cost curve re-bases or session length halves. This
wants numbers, not a decision in the abstract.

---

## 27 July: the Pet-o-matic verdict, and the coast settled

Three commits, each with all six gates green.

**The pets take their colour properly now.** Four faults Joe reported — panda,
bee, cow, penguin — had one cause between them, and it was the picker counting
vertices rather than surface area (HANDOFF §6). The penguin was a second bug:
normalising against a hue window rather than its own colours pinned it at the
bottom of the ramp. Fixing that revealed a third, contour banding on solid sets,
because the same normalisation amplifies a narrow-range coat 4.8×. Dots are gone
— provably unbuildable in this atlas — the stripe pitch was chosen against the
measured triangle span, and emerald, sky and bluebell were retuned. Verdict:
*"rest of the animal colouring slice is accepted."*

**The offer can be escaped and can be read.** A backdrop tap returns to the
island without costing a thing. And the question was invisible the whole time the
buttons were up, because the CSS hides the say card while any overlay is open.

**The coastline is settled by placement rather than patched by scoring**, which
is what let Joe's "never a full land tile against a coast tile" hold without
re-cutting land she has paid for. See the limits section for what it costs.

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

- **The coast ceiling is gone, and the price is enclosed ponds.** The old trade
  — walls against cliffs, one fault surviving on an L-bend — is retired, because
  the shapes that caused it are no longer buildable. Exactly 19 of the 64 water
  neighbourhoods can be drawn cleanly, and placement is now confined to those, in
  both directions: grass that would break a neighbouring pond is refused too, and
  a socket that admits neither kind no longer glows. A played-island test builds
  120 islands through the real tap path and asserts not one bad joint. What it
  costs is a pond in the middle of her fields, which cannot be made at all.
- **The ladder is 600 creatures, not ~1,000.** The twelve spotted sets are gone:
  every one of them rendered as stripes, and the atlas provably cannot express a
  spot (HANDOFF §6). Twenty-five sets across 24 species is 600. Item 7 has to
  face that rather than pad it with dilute palettes — that was the first pass and
  Joe rejected it.
- **Per-species textures.** Item 6 builds one texture per (set, species) on
  demand. Fine for the Pet-o-matic; **watch it on the tablet** once a child owns
  many pets across many sets. If it bites, cap the cache — do not change the
  rule.
- **Eye-whites and pupils — the "forced trade" was not forced.** The old claim
  here was that whites could only stay white by keeping white animals white. That
  is true of every rule expressed in COLOUR: protecting the shared sclera texels
  costs a polar bear 25% of its surface, and protecting achromatic pixels costs
  it 69.7%. It is false of rules expressed in GEOMETRY. The face decals are a
  separate flat sheet in front of the head, selectable by topology and normal with
  huge margins, and two of the nine unsampled atlas swatch columns can be reserved
  for them — ~1.7% of area frozen, zero extra GPU bytes, no shader. Measured 0
  drift across 114,975 checks. Being implemented; **not yet seen in a browser**,
  which is its one real risk.
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
