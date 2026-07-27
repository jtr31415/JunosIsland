# Pet Island — handoff

*For whoever picks this up next, including me with no memory of it.*
*Written 27 July 2026. Read `docs/STATUS.md` first for where the project is
against its specs; this document is how to work on it without breaking things.*

---

## 1. What this is

A 3D browser game for Joe's daughter Juno (6). Reading hatches eggs into named
pets; maths earns hex tiles she places herself. It is the successor to
`v0/junos-words.html`, a single-file 2D phonics and maths game she has actually
been playing.

Deployed: <https://jtr31415.github.io/JunosIsland/> (GitHub Pages, on push to
`main`). Repo: `jtr31415/JunosIsland`. Board:
<https://github.com/users/jtr31415/projects/3>.

Target device is a **mid-range Android tablet**, landscape.

---

## 2. The three rules that outrank everything

**1. `v0/junos-words.html` is FROZEN.** Never edit it. It is the reference
implementation and it outranks the brief on anything about how learning
behaves. When porting from it, only *dependency injection* is permitted — you
may inject a value the original hardcoded, but you may not restructure. Every
DOM, timing, class-name or audio assertion in a test under `tests/challenges/`
or `tests/platform/` must cite the v0 line it encodes, e.g. `// v0:886`.

**2. Brief §19 guardrails are non-negotiable.** Nothing a child owns can be
lost. No timers, no expiry. Wrong answers cost nothing. Three stumbles summon
help and never shame. UK English. Bright, never scary.

**3. `docs/pet-island-lighting.md` is followed as written.** If a change needs
the brief amended, *stop and ask Joe*. This has already bitten once: I reworded
§7 to permit a tilt-shift pass while §1's "No post-processing stack on tablet"
sat unedited three sections up. That is rationalising, not engineering. The
project's own precedent for amending (§3's shadow-map amendment) requires
measured fps on the target tablet plus a settings toggle.

---

## 3. Getting going

```bash
npm install
npm run dev          # the island, on localhost
npm run dev:words    # the frozen 2D game's rebuild
```

**The gates. Run all five before every commit:**

```bash
npm test                              # 421 tests
npx tsc --noEmit -p tsconfig.json
npm run build                         # both bundles
npm run smoke                         # boots the 2D shell headlessly
npm run parity                        # 2D shell vs frozen v0, 14 steps
```

`parity` flaked once (reported four differing steps, then passed four times
running). Treat a single failure as suspicious rather than conclusive, and fix
the flakiness before trusting it on a real port question.

### Verifying in the browser

`agent-browser` against the deployed URL. **Always clear the service worker and
caches first, then check the build stamp in the bottom-left corner matches your
deploy** — the PWA will happily serve you an old bundle and you will spend an
hour debugging a fix that is already live.

```bash
agent-browser eval "navigator.serviceWorker.getRegistrations()
  .then(rs=>Promise.all(rs.map(r=>r.unregister())))
  .then(()=>caches.keys()).then(k=>Promise.all(k.map(n=>caches.delete(n))))"
agent-browser open "https://jtr31415.github.io/JunosIsland/?x=$(date +%s)"
agent-browser eval "document.querySelector('.dev-stamp')?.textContent"
```

`?debug` exposes `window.__world.dump()` — every sizeable object in the scene
with its name, parent, position and size. This named a mystery object in one
look after three rounds of changing tables and redeploying had each blamed the
wrong model. Use it early.

`?flat` is reserved for disabling post-processing, should any ever land.

---

## 4. How the code is laid out

```
src/core/          pure, golden-verified, no DOM, no Three.js
src/platform/      speech, audio, storage
src/challenges/    the ported learning renderers (wordFind, build, sum)
src/words2d/       the 2D shell, which ships from core/ + challenges/
src/island/        the 3D game
  flow.ts          the state machine — pure, immutable, testable
  interactions.ts  tap handling; the wiring seam, extracted so it can be tested
  main.ts          composition root; where the async ceremonies live
  scene.ts         renderer, camera, per-frame loop
  stage.ts         the challenge vignette (transparent container)
  world/           hex maths, grid, tiles, coast, props, the growing plot
  balance/         balance.json — all pacing and economy constants
```

**The layering that matters:** `flow.ts` knows nothing about Three.js or the
DOM, so the rules that count — a wrong answer costs nothing, a tile is never
lost — are tested without a GPU. `interactions.ts` is the only thing that talks
to both.

---

## 5. Lessons this project has already paid for

These are not general advice. Each one cost real debugging here.

### Mocked ports hide dead features — four times

`flow.plot` was declared, read by the renderer, and **assigned by nothing** —
the growing plot had never once rendered. Siting a plot called `openSum` with a
state the real port rejects, so it opened nothing. The stage raised its layout
flag and the next line's `teardown()` dropped it. The welcome hop was requested
before the model loaded and silently discarded, every time.

All four passed the whole suite, because the tests mock the port and assert
that a function was called.

**So:** assert the *contract the real port enforces*, not that a mock ran. Then
revert your fix and watch the new test fail — if it does not, it is not testing
your fix. Better still, make the wrong sequence **unexpressible**: staging is
now an argument to `open*()`, so it cannot be sequenced wrongly at all.

### Never scale a model by a fixed factor, or by one dimension

The asset packs vary **ninefold within a single family** (Forest Nature's
`Rock_1` runs 0.54–4.58 units tall). One multiplier that suits a grass tuft
turns a rock into a monument. Fitting by *height* turned a low wide hill into a
mesa five hexes across; fitting by *width* would squash a tree into a shrub.

**Use `fitInto(object, maxWidth, maxHeight)`** from `world/props.ts`. It fits
both, and refreshes world matrices first — several KayKit models carry a
transform on the node above the mesh, so measuring them cold reports the wrong
size and the correction goes wild.

### Anything async in main.ts races live input

The hatch and land ceremonies are sequences of `await`s while the world is
interactive. Before they were locked, a tap could rip the egg off the turntable
mid-hatch, or dismiss and re-open a round such that the ceremony's deferred
close tore down a *live* round — leaving the flow in `challenge` with no
overlay, recoverable only by reloading.

**So:** any new animated sequence needs `overlay.setBusy(true)` plus the
`inCeremony` guard, released in a `finally`. A ceremony is an animation, not a
moment of choice.

### Speech cancels speech

`speak()` cancels the previous utterance (v0:749) and challenge teardown calls
`cancel()` (v0:847). Both are faithful ports and both will cut a line mid-word
if you are careless. The opening now waits for the voice to *end* rather than
guessing a duration; the hatch line is spoken *after* the round closes.

### Verify with a cold cache

A pet-model fetch budget of 1200ms passed every time locally and failed every
time with the cache cleared — the model was simply always cached. Clearing the
service worker before verifying is doing real work, not ceremony.

---

## 6. Where the bodies are buried

- **Hexes are pointy-top.** The KayKit asset dictates it (z-extent 2.309 vs x
  2.0). The circumradius is the half-*depth* in z, not the half-width in x.
  Measuring the wrong axis is worth 15% overlap and the tests pin it against
  the real asset.
- **The tile atlas has no mipmaps, deliberately.** Each tile samples a tiny
  swatch of a 1024 atlas; mips average across neighbouring swatches and bleed
  one tile's colour into the next at distance.
- **Summer is the green palette.** The base atlas grass is olive. I chased a
  colour-space bug for an hour before measuring the swatch.
- **Pet GLBs are not self-contained** — each references an external
  `Textures/colormap.png`. Without it every pet renders pure white, which looks
  like a material bug rather than a missing file.
- **Three.js `setViewport`/`setScissor` take CSS pixels** and apply the pixel
  ratio internally. Doing it yourself squares it: correct on a DPR-1 desktop,
  off-canvas on the DPR-2 tablet.
- **A three.js `clone()` shares geometry and materials** with the original.
  Disposing a cloned pet preview would break every other pet of that species,
  including ones she already owns. `stage.showTemp` detaches, never disposes,
  and there is a test asserting exactly that.
- **A coast model's sand ramp is WIDER than its water arc.** `COAST_CANONICAL`
  records only the water edges, and lining that arc up with the sea puts the
  ramp's shoulders on the edges facing her fields — green meeting sand a tenth
  of a unit lower. `COAST_EDGES` now records all three heights per edge and is
  re-derived from the `.gltf` files by the test. `hex_coast_E` sounds like the
  missing beach-all-round hex and is not: measured, it has no water edge at
  all.
- **A coast tile's neighbours include other coast tiles.** Scoring one tile
  against the assumption that every wet neighbour is open water cliffs about a
  tenth of water-to-water edges — most visibly in a pond three hexes in a row.
  `looksFor` solves the whole island to a fixed point; `lookFor` is a
  convenience that calls it. Do not reintroduce a per-tile version: two
  functions means a test can check something the renderer does not do.
- **A consequence of the green-edges-first rule, unresolved:** on a jagged
  coastline the scorer will sometimes present LAND toward open water, since
  land-at-sea is cheaper than sand-at-grass. That is a green wall rising out
  of the sea, and in an alternating grass/water zigzag the water tile she
  placed draws as mostly lawn. It follows from the rule as given. If it looks
  wrong on the tablet, the fix is the weight in `mismatch`, not the algorithm.
- **Keep-out radii must be measured, and measured at the right height.** Every
  one of them used to be `hexSize × a guess`, always low: a mountain measuring
  0.9 across declared 0.58, so pets walked into it. Scenery-versus-scenery uses
  the full footprint; pet-versus-scenery uses `footprintBelow(o,
  WALKING_HEIGHT)`, because a pet under a tree's canopy has not clipped
  anything. And the clamp must add the pet's OWN radius — clamping a centre to
  a surface buries half a pet in the rock.
- **Rolling the build back shows her an empty island.** A rolled-back build's
  `createLocalStore.get` sees `schemaVersion: 2 > 1` and returns null, then its
  boot-time `refresh()` immediately overwrites localStorage with a fresh
  legacy save. IndexedDB survives untouched, so re-upgrading brings her island
  back — but anything she played during the rollback was adopted at rev 0 and
  loses to the pre-rollback revision. No down-migration fixes this properly;
  it is the argument for item 4's pinned production releases landing early. If
  a rollback is ever needed, take a backup from the gear FIRST.
- **A save's revision must be claimed before anything is awaited.** Two
  concurrent `put`s that both read the counter and write it back afterwards
  claim the same revision, equal revisions tie on load, and the tie goes to
  localStorage — so the older island can win and a just-hatched pet vanishes.
  Writes are queued per document for the same reason. This defeated the
  persistence barrier from underneath while every test still passed.
- **`browserText.write` swallows quota errors on purpose**, so localStorage can
  silently fall behind IndexedDB on a full device. Anything that reads a save
  for a PURPOSE — export, import, diagnostics — has to pick the higher
  revision the way `get` does, not just read localStorage.
- **The service worker uses `skipWaiting` + `clientsClaim`.** `autoUpdate`
  alone waits for every tab to close, which produces phantom regressions —
  fixes demonstrably in the deployed JavaScript but not in what the browser
  runs.

---

## 7. Working with Joe

He reviews by **playing and by screenshot**, and his notes are short and
accurate. When he says something "looks wrong", it is wrong — but the stated
symptom is often not the cause. "The props disappear" was a render-order bug
where the surface probe ran before the tile field knew about the hex; "it jumps
to the home tile" was an animation writing absolute positions instead of
offsets.

He has asked for a **Fable 5 review at each phase boundary**, and it has earned
its place: it caught the dead-on-arrival stage, the squared viewport maths, an
unbounded fetch inside a locked ceremony, and the lighting-brief rationalising.
Give it the actual diff and ask it to attack specific things.

When something needs his ruling — a spec contradiction, a guardrail amendment,
a measurement only the real device can settle — **stop and write it up** rather
than guessing. Two such items are open now (`docs/STATUS.md`).

---

## 8. Suggested next moves

Nothing here is blocked except where noted.

1. **Get it in front of Juno.** Brief §18: "Ship M1 to the QA department
   immediately; her verdict outranks this document." That has not happened yet
   and it is the highest-value thing available.
2. **Resolve #4 and #6** (Joe's calls — see `docs/STATUS.md`).
3. **Slice-1 §7, the biome ladder.** The only whole section untouched. Atlas
   palettes exist; the unlock ladder, ceremony and pet-family coupling do not.
4. **Issue #11's remainder:** the "1s breath", and the move-in check (needs a
   design call on what moving in means before habitats exist).
5. **Fix the flaky parity gate** before it is needed in anger.
6. **Brief §2 (M2) proper:** pet variants, habitats, nursery, wants.

---

## 9. One honest caveat

Every visual judgement in this build was made from screenshots on a DPR-1
desktop, by me, at night. The pacing of ceremonies seen forty times in a
sitting, whether the golden outline reads as a promise or as clutter, whether
the sparkles look right in motion — none of that has been seen by the person it
is for. Treat the look as provisional until she has played it.
