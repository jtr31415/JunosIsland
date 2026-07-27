# Phase 3 — what exists, and how it is wired

*Written 27 July 2026, at the close of Phase 3, so Phase 4 can be specified
precisely rather than discovered.*

Read in this order:

1. **This document** — what exists and how it connects.
2. `docs/HANDOFF.md` — how to work on it without breaking it. It is a list of
   mistakes already paid for, and it is longer than you expect for a reason.
3. `docs/STATUS.md` — the item-by-item ledger and what is still open.

Everything below is true of `main` at the close of Phase 3. Where something is
NOT wired up, it says so explicitly — that is usually the most useful sentence
on the page.

---

## 1. The shape of the thing

A 3D browser game for one six-year-old. Two verbs, and only two: **reading
hatches eggs into named pets**, and **maths earns hex tiles she places herself**.
Target device is a mid-range Android tablet in landscape.

It is the successor to `v0/junos-words.html`, a single-file 2D phonics and maths
game she has actually been playing. It still ships, rebuilt from modules.

**The freeze on that file was lifted on 27 July 2026** — it had done its job. The
regression anchor is now `tools/golden/golden.json`, a captured snapshot of the
original's output under a seeded RNG, and THAT is frozen. `npm run parity`
consequently means "the two implementations stay in step", not "the rebuild has
not regressed". See HANDOFF §2 rule 1.

```
src/core/          pure learning engine. No DOM, no Three.js. Golden-verified.
src/challenges/    the ported learning renderers (wordFind, build, sum)
src/words2d/       the 2D shell — ships from core/ + challenges/
src/platform/      speech, audio, storage, clock, flags, persistence, backup
src/island/        the 3D game
  flow.ts          the state machine. Pure, immutable, testable.
  interactions.ts  tap handling — the wiring seam, extracted to be testable
  picking.ts       what a tap HIT, and which answer wins. Also extracted.
  main.ts          composition root. Where the async ceremonies live.
  scene.ts         renderer, camera, per-frame loop
  stage.ts         the challenge vignette
  opening.ts       the one-shot gate for Fred's story
  world/           hex maths, grid, tiles, coast, props, the growing plot
  variants/        the set/recolour engine and the face-decal reserve
  lighting/        the three-light rig and the sun's shadow direction
  balance/         balance.json — all pacing and economy constants
```

**The layering that matters, and why:** `flow.ts` knows nothing about Three.js
or the DOM, so the rules that count — a wrong answer costs nothing, a tile is
never lost — are tested without a GPU. `interactions.ts` and `picking.ts` are
the only things that talk to both sides. Anything that decides *what the game
does* belongs in one of those three; anything in `main.ts` is glue and is
correspondingly hard to test (see §9).

---

## 2. The boot sequence, in order

`main.ts` `boot()`. The order is load-bearing in several places.

1. **Flags** are read from the query string — but only outside production. In a
   production build `readFlags` does not consult the query string at all.
2. **Pet-o-matic short-circuit.** If `__CHANNEL__ !== 'production'` AND the
   `petOMatic` flag is on, the whole page becomes the variant viewer and returns.
   The build-time constant is checked FIRST so Rollup can fold the branch — see
   §7.
3. **`createWorld`** loads the tile models and atlas, builds the renderer,
   camera, lighting, sea, sky, tile field, socket field.
4. **Stores**: `createLocalStore` (localStorage) and `createDurableStore`
   (IndexedDB), both behind a checksummed envelope. `loadIsland` picks the higher
   revision of the two.
5. **The opening gate** is constructed from the loaded `openingSeen`.
6. **Name prompt**, then Fred's story, then free play.

**Anything async in `main.ts` races live input.** The hatch and land ceremonies
are sequences of `await`s while the world is interactive. Any new animated
sequence needs `overlay.setBusy(true)` plus the `inCeremony` guard, released in a
`finally`. A ceremony is an animation, not a moment of choice.

---

## 3. State: the flow machine

`flow.ts`. Immutable — every transition returns a new object.

```ts
type Phase = 'opening' | 'free' | 'challenge' | 'placing'

interface Flow {
  phase, challenge          // 'read' | 'sum' | null
  island                    // ReadonlyMap<string, 'grass' | 'water'>
  pets                      // { id, name, species, at }[]
  bankedTiles               // earned, unplaced. Never decays.
  chosen                    // the kind she picked, awaiting a socket
  pending                   // the socket she tapped, awaiting a kind. Transient.
  plot                      // { at, type } — under construction, IN VIEW
  eggPresent
  readProgress, sumProgress // never decay
  tilesEarned               // drives the cost curve
}
```

Transitions: `tapEgg`, `tapSum`, `askForLand`, `cancelPlacing`, `chooseTile`,
`placeTile`, `challengePassed`, `challengeFailed`.

**The guardrails are structural, not conventions.** `bankedTiles`,
`sumProgress`, `readProgress` and `plot` are never cleared by any dismissal path
— `cancelPlacing` clears only `chosen` and `pending`. `commitPlot` is the single
place a tile is ever added to the island, so "earned" and "on the map" cannot
drift apart.

**The cost curve** lives in `balance/balance.json`, never inline:
`cost(curve, n) = round(cap − (cap − base)·e^((1−n)/tau))`. Asymptotic, so the
twentieth tile is real work and the fiftieth is not punishment.

---

## 4. The world: tiles, and the coast rules that constrain them

`world/grid.ts` is the whole world model: which hexes she owns and what is on
them. `TileType` is `'grass' | 'water'` — **adding a third is a save-format
change**, see `docs/rock-hexes-proposal.md`.

**Hexes are pointy-top.** The circumradius is the half-*depth* in z, not the
half-width in x. Measuring the wrong axis is worth 15% overlap.

### The coastline is now a placement constraint, not a scoring preference

This changed late in Phase 3 and it is the single most important thing to
understand before touching `world/`.

The coast belongs to the WATER cell, never the land — so a field she has paid
for is never re-cut behind her, and there is no gap where a cut-away land tile
meets a flat water slab.

Making that hold everywhere required constraining where water may go.
Enumerated over all 64 possible neighbourhoods, **exactly 19 are drawable with
no bad joint**: nought to three green edges, and the green ones forming a single
contiguous arc. Four or more is arithmetic — no model in the pack has four land
edges — and a split arc fails because every model's water is one unbroken run.

```
coast.ts
  drawableAsWater(around)      the 19, derived from COAST_EDGES, not hardcoded
  allows(island, a, t)         would placing t at a leave every affected
                               coastline drawable? SYMMETRIC — grass can break
                               a pond just as water can
  canBeWater / canBeGrass      allows(), named
  mustBeWater(island, a)       2+ of her own water, none of her fields
  buildableSockets(island, s)  sockets where SOMETHING can go. A socket that
                               admits neither kind no longer glows.
  plannedLook(island, a, t)    how a tile WOULD be drawn — used by the plot
  looksFor(island)             solve every tile together
```

`flow.tileOffer` filters the buttons by these; `flow.tileTypeFor` is the single
choke point that decides what actually lands, because the opening script picks a
kind before it knows the socket.

**Cleanliness is judged on neighbours' TYPES; ranking is on how they are DRAWN.**
Asking whether a tile can be clean of the *drawing* is circular. Types are the
hard rule; the old cost table survives as a tie-break and keeps shapes a child
cannot build — but an edited save might contain — degrading gently.

**The price, and it is a gameplay decision Joe accepted:** an enclosed pond is
not constructible. Water grows as coastline, never as a hole in her fields.

**Test the coastline by BUILDING islands, not constructing them.** Three of four
faults here passed every test that assembled a tile map directly, and only
appeared when the test played islands through the real tap path.

### Scenery: TWO placement paths

- `world/props.ts` dresses tiles the island grows on its own.
- `world/increments.ts` grows the tiles she builds herself; `adopt()` hands the
  finished group over.

**Fixing one is not fixing the other.** Trees-inside-rocks was reported twice for
exactly this reason. Any scenery change must land in both.

`props.ts` picks a CHARACTER per region — meadow, wood, rocky, highland — so the
island grows in patches rather than an even sprinkle. Features are the one big
thing per hex; COVER is the five-to-nine small things scattered round it, and
that two-layer split is what stops the island reading as an arrangement of
objects. Live trees are drawn from COVER, which is what makes a wood look like a
wood.

**Never scale a model by a fixed factor or by one dimension.** The packs vary
ninefold within one family. Use `fitInto(object, maxWidth, maxHeight)`.

---

## 5. The variant engine — and exactly what is NOT wired

This is Phase 3 item 6, and it is the piece Phase 4/5 most needs to understand,
because **it is complete and it is not in the game**.

### How a set becomes pixels

Item 5's autopsy established the constraint: every pet has ONE material, ONE
texture, no vertex colours, no `baseColorFactor`. Colour is entirely a texture
lookup. Therefore **a set is exactly one recoloured 512×512 image**.

```
variants/sets.ts        the 25 sets: natural + 12 colours × { solid, stripy }
variants/recolour.ts    pure arithmetic on pixel bytes. No canvas, no DOM.
variants/atlas.ts       builds and caches one texture per (set, species)
variants/facedecals.ts  points the eye/nose/mouth UVs at the reserve
variants/petomatic.ts   the judging surface — all 24 species, per set
tools/pets/atlas.mjs    build-time analysis; emits species-base.json and
                        species-face.json; fails loudly on 10 invariants
tools/pets/reserve.mjs  bakes the reserved swatch columns into colormap.png
```

Three rules you must not undo:

1. **The base coat is decided per SPECIES**, from `species-base.json`, weighted
   by SURFACE AREA and ignoring extremity meshes. Vertex counts overvalue fiddly
   detail — black beat white on the panda 798 to 128.
2. **A species is normalised onto its own colour range, with the gain CAPPED**
   (`CONTRAST_REFERENCE`). Uncapped, a polar bear's narrow range is amplified
   4.8× and the atlas's gradient steps show as contour banding.
3. **The eyes are geometry, not colour.** Two spare atlas swatch columns hold
   verbatim copies of the eye swatches; `facedecals.ts` points the decal UVs at
   the copies; `recolourInto` skips `x ∈ [320,383]`. This cannot be done in
   colour space — 40% of a penguin's surface samples the very pixels its pupils
   are made of.

### What is NOT wired — this is item 7's job

**No pet in the game is ever dressed.** `atlas.dress()` is called only by the
Pet-o-matic. The island's pets are all natural. To wire it you need:

- A `{setId, speciesId}` on each pet in `flow.pets` — a save change.
- `dress()` called wherever a pet model is produced (`pets.ts` `model()`).
- An unlock ladder deciding which sets she has.
- `album.ts` loads its own GLBs with its own loader and renders natural only. If
  album portraits ever show a variant, they need `wearFaceUVs` too.

**And the ladder is shorter than the brief assumes.** The twelve spotted sets
were dropped — the atlas provably cannot express a spot, since every triangle
sits in a single column and `v` carries no positional information. 25 sets × 24
species = **600 creatures, not ~1,000**. Item 7 must either re-base the pacing on
600 or add a third wearing with a positional signal behind it (object-space in a
shader, or per-part meshes).

---

## 6. Persistence

```
platform/envelope.ts   checksum + schemaVersion (currently 2) + migrations
platform/storage.ts    localStorage
platform/durable.ts    IndexedDB, revision-claimed, per-document write queue
island/save.ts         Flow <-> IslandSave
```

Two copies are kept and **the higher revision wins**. Both are wrapped in the
same envelope.

**Non-negotiable, learned the hard way:**

- A save's revision must be **claimed before anything is awaited**. Two
  concurrent puts that read-then-write claim the same revision, and the tie goes
  to localStorage — so the older island wins and a just-hatched pet vanishes.
- `browserText.write` swallows quota errors on purpose, so localStorage can
  silently fall behind. Anything reading a save for a PURPOSE — export, import,
  diagnostics — must pick the higher revision the way `get` does.
- **Rolling the build back shows her an empty island.** A rolled-back build sees
  `schemaVersion 2 > 1`, returns null, and overwrites localStorage with a fresh
  legacy save. IndexedDB survives, so re-upgrading brings it back — but anything
  played during the rollback is lost. This is the argument for pinned production
  releases, and it is why a new `TileType` should wait for the first tag.
- **Awarding mints a `Committed` token and `ceremony()` demands one**, so a
  celebration without a completed save does not compile.

**The `openingSeen` lesson generalises:** record a one-shot when it STARTS, not
when it finishes, and claim it synchronously before the first `await`. It was set
after the beat loop — a line most sessions never reach.

---

## 7. Channels, flags, and what ships

`__CHANNEL__` is a **build-time constant**. Production is the newest `v*` tag;
`/preview/` is `main`. **Until Joe cuts the first tag, production falls back to
main** — the split is real in the machinery and not yet in what Juno plays.

**A dev-only feature needs `__CHANNEL__`, not just a flag.** A runtime flag
cannot be folded by Rollup, so the code ships unreachable-but-downloaded — the
whole Pet-o-matic was precached that way, on a tablet with a 5 MB budget.
`npm run channel` checks both markers in both directions.

Flags: `devBalance`, `devClock`, `petOMatic`, `wonderGallery`, `sets`,
`habitats`, `quests`, `visitor`, `wonders`. In production every flag is off and
the query string is not consulted.

`npm run dev` always runs the PREVIEW channel, or every flag would be off.

---

## 8. Rendering, lighting and shadows

Three lights, one directional "sun", per `docs/pet-island-lighting.md`, which is
**followed as written**. §1 says "No post-processing stack on tablet". Amending
it requires measured fps on the target tablet plus a settings toggle — the
precedent set by §3's shadow-map amendment. `?flat` is reserved for disabling
post-processing should any ever land. **Tilt-shift is currently forbidden by §1**
and Joe has parked it for early Phase 5, packaged with a lighting rework.

**There are no shadow maps.** Every shadow is a blob decal in `juice.ts`. They
now consult `lighting.sunShadow()` — ground direction, `cot(elevation)`,
`1/sin(elevation)` — so a blob is offset away from the sun and stretched along
that axis, with the sun converted into the blob's parent frame. Elevation is
floored at 10° so a low sun cannot throw a blob to the horizon.

Props still have **no** blob shadows, which brief §3 asks for. Open.

Other measured facts: the tile atlas has **no mipmaps** deliberately; Summer is
the green palette (the base atlas grass is olive); `setViewport`/`setScissor`
take CSS pixels and apply the pixel ratio internally.

---

## 9. How to verify anything

```bash
npm test          # 739 tests
npx tsc --noEmit -p tsconfig.json
npm run build     # both bundles
npm run smoke     # boots the 2D shell headlessly
npm run parity    # 2D shell vs frozen v0, 14 steps
npm run channel   # production/preview markers, both directions
npm run parity:soak   # 50 consecutive parity runs, ~7 min. On demand.
npm run pets:atlas    # re-measures the pet models; fails on 10 invariants
```

All six pass on `main` at the close of Phase 3.

**The discipline that matters most:** write the test, revert your fix, and watch
it fail. If it does not fail, it is not testing your fix. This project has been
bitten four times by a field that was declared, read, and assigned by nothing —
every one passed the whole suite, because the tests mocked the port and asserted
that a function was called. Assert the contract the REAL port enforces.

**Verify in the browser too.** `agent-browser` against `npm run dev`; add
`?devBalance` to compress pacing so tiles cost 1–3 sums. `?debug` exposes
`window.__world.dump()` — every sizeable object with name, parent, position and
size. Use it early. Clear the service worker before verifying a deploy, or the
PWA will serve an old bundle.

Two traps in browser verification specifically: repeated mouse-downs rotate the
camera, so re-screenshot to re-locate things rather than reusing coordinates; and
`speechSynthesis` returns `not-allowed` until the page has had a real user
gesture — that is Chrome policy, not a bug.

---

## 10. What Phase 4 needs to decide

Phase 4 is **the release**: item 13, adaptive difficulty, plus the playtest
fixes Joe ruled into it on 27 July —

- **A challenge needs an X**, and it must resume the SAME card. The escape is
  easy; the resume is the load-bearing half, because a way out that re-rolls the
  question is a way to skip a word she does not fancy. The generators hold their
  own history, so the drawn item has to live in `Flow` rather than be
  regenerated.
- **Preload the pet model.** The hatch is the emotional peak and the model
  arrives late. This will be worse on the tablet than in any test we run — a
  1200ms fetch budget passed every time locally and failed every time cold.
- **A floor of two dry connections**, so she cannot ring her island in water and
  leave it unable to grow. The exact mirror of `mustBeWater`, and `tileTypeFor`
  is already the choke point for both directions.
- **The album pop-out**: bigger, rotating, find-it-on-the-map, and a button that
  speaks its name.

**The blocking question, unchanged since it was found:**
`pet-island-difficulty.md` §5 and slice-1 §4 are in the same currency and
disagree. Today one sum banks one unit against a tile costing 1–16. §5 sets easy
= 2, tricky = 3, honeymoon = 4, and Phase 3 adds mastered = 1. The day item 13
lands, **every tile halves in length for an ordinary child** — the eighth tile
drops from eleven sums to six — and only the mastered case restores today's pace.
Either the cost curve re-bases or session length halves. This wants numbers.

**Three things about the release itself:**

1. **It ships with every pet in its natural colours**, because item 7 is Phase 5.
   The variant engine is dev-only until then.
2. **It needs the first `v*` tag** or the channel split does nothing.
3. **The QA department HAS now played it** — an hour, on 27 July, and the notes
   marked "playtest" in the task list are what came back: the pet tap target is
   too small, reading wants a 3:1 build-to-find ratio, a challenge needs a way
   out, the hatch needs the model preloaded, and the island must not be
   snookerable with water. What she did AFTER the hour is the other finding:
   she went looking round the island for her animals, unprompted. Brief §18: "Ship M1 to the QA
   department immediately; her verdict outranks this document." Every visual
   judgement in this build was made from screenshots on a DPR-1 desktop. That is
   still the highest-value action available and it has been true for two phases.

**Carried into Phase 5, already carded:** pets walk through Juno's signpost (same
class as Fred and the egg); larger props cast no shadows; tilt-shift with the lighting rework;
and `docs/nextphase.zip` is still in the repo, uncommitted and redundant.
