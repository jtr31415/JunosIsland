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

**1. `v0/junos-words.html` is NO LONGER FROZEN — but `golden.json` is.**

Joe lifted the freeze on 27 July 2026: *"the old base can be changed. that was
only an early guard that can be lifted now we have a working game."* He is right
that the guard has done its job — the port is proven and the 3D game is real.

What that changes, and what it must not:

- **`tools/golden/golden.json` is now the regression anchor, and it is frozen.**
  It was captured from the original's own source text under a seeded
  `Math.random`, so it is a SNAPSHOT of behaviour rather than a pointer to a
  file — which is exactly why it survives the freeze being lifted. Never edit it
  to make a test pass. If a change is *meant* to alter what the learning engine
  produces, re-capture it deliberately with `npm run golden:capture` and say so
  in the commit; that is now a meaningful, auditable act rather than a formality.
- **`npm run parity` changes meaning.** It used to prove the rebuild had not
  drifted from an immovable reference. Now that both sides can move, it proves
  the two implementations stay IN STEP with each other. That is still worth
  having — it is what stops the 2D game and the island diverging — but it is no
  longer evidence on its own that behaviour has not regressed. `golden.json` is.
  A parity run that goes green because someone edited v0 to match a regression is
  a green run that means nothing.
- **The `// v0:886` citations now point at a moving file.** There are 54 of them
  across `tests/challenges/` and `tests/platform/`. Keep citing v0 when you port
  something — it is still the clearest explanation of *why* a timing or a
  class name is what it is — but treat a stale line number as a stale comment,
  not as a failure.
- **v0 still outranks the brief on how learning BEHAVES**, until Joe says
  otherwise. Lifting the freeze means the file may be edited; it does not mean
  the pedagogy in it was wrong. Changing what a child experiences is a product
  decision, and it goes to Joe (§7).

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

And a sixth, on demand rather than per commit:

```bash
npm run parity:soak                   # 50 consecutive parity runs, ~7 minutes
```

`parity` flaked once — four differing steps, then four clean runs. The cause
was the harness snapshotting both jsdom instances after a fixed sleep while
they ran real timers independently, so a scheduling hiccup on either meant one
was read mid-settle. It now waits for each DOM to go quiet on its own before
comparing, and the soak exists to prove that: a single green run has never
been evidence here. CI runs the soak nightly and on demand, deliberately not
on every push, because a gate that slows every commit is one people route
around.

Fixing it also made the harness cover MORE of the game — the self-check went
from three spoken words to four, and the score from 4 to 6, because the old
sleep was cutting the script short. If those numbers move again, something has
changed in the 2D game's timing and it is worth knowing why.

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
  plot.ts          the growing plot's lifecycle, behind ports, for the same reason
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

### A flag written on the happy path is a flag that is never written

`openingSeen` was set on the line after the opening's beat loop — and that loop
is one `main.ts` almost never runs off the end of. Beat six hands over to the
child and `return`s; she can back out of that round, which clears the resume
point and ends the story for good; and a reload lands wherever it lands. All
three left the flag false, so the profile stayed "never seen" and Fred started
again from "Oh! Hello" on **every single load**, which is what Joe reported.

The save layer was innocent, and looked guilty for an hour: a run that reaches
the last beat writes and reloads perfectly. Only the *interrupted* run is broken,
and the interrupted run is the normal one.

**So:** record a one-shot the moment it STARTS, not when it happens to finish,
and claim it synchronously before the first `await` — the same rule the save's
revision counter follows, for the same reason. `island/opening.ts` is the gate
that owns it; `tests/island/opening.test.ts` asserts the ordering in `main.ts`,
because a `let` that four code paths must remember to set is a bug waiting for
its fifth path.

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
- **How the pets are coloured, and therefore how variants must work.** The
  Phase 3 item 5 autopsy; re-run it with `npm run pets:atlas` rather than
  trusting this paragraph, because it is a claim about 24 binary files and a
  PNG.

  Measured: **one** material per pet, named `colormap`, carrying a
  `baseColorTexture` and **no** `baseColorFactor`. Vertex attributes are
  `POSITION+NORMAL+TANGENT+TEXCOORD_0` — there is **no `COLOR_0`**, so no
  vertex colours anywhere. Colour is therefore *entirely* a texture lookup.
  The 24 species sample 710 distinct texels of the 512×512 atlas, 40–106 each,
  arranged in seven vertical columns (u = 48, 112, 176, 240, 304, 432, 496)
  where v picks a shade down a gradient.

  **The decision: a set is one recoloured atlas.** Because every species shares
  the single material, recolouring is per-SET rather than per-variant — one
  canvas-composited 512×512 image serves all 24 species in a set, so ~40
  images cover the whole ≈1,000-creature space. Generate lazily for unlocked
  sets and cache by `setId`.

  The other two routes are closed, and measured shut: **material colour
  params** cannot work because there is one material per pet, so parts cannot
  be coloured independently and there is no `baseColorFactor` to drive;
  **attribute or UV rewriting** would need a column per colour role per set —
  the atlas has seven columns total — and forking UVs per variant gives up the
  shared geometry buffers that make a thousand creatures affordable.

  **Recolour by saturation, not by position.** No texel at all is sampled by
  every species (each draws its dark features from column 496 at its own row),
  so "preserve the shared texels" is not available; and "preserve a column" is
  too coarse, because u=112 carries eye-whites and coat colours together. What
  separates the soul from the coat is saturation: of the 710 texels, 9% are
  achromatic and 6% near-black — the eyes and facial features — while 64% are
  chromatic. Shift the chromatic ones and leave the achromatic alone, and
  brief §5's "the face decal (the soul) stays constant per species" holds by
  construction.
- **Set textures are shared by every pet in the set** — and a three.js
  `clone()` already shares materials with the original. Two consequences, both
  the same trap the album preview already carries a test for. A cloned species
  arrives holding the BASE material, so the set's material has to be assigned
  after cloning or every variant renders in the natural palette. And disposing
  a set's texture breaks every pet of that set at once, including ones she
  already owns (brief §19) — set textures are cached and detached, never
  disposed, exactly as `stage.showTemp` handles pet models.
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
- **There are TWO places scenery is placed, and a fix to one is not a fix to
  the other.** `props.ts` dresses tiles the island grows on its own;
  `world/increments.ts` grows the tiles she builds herself, and the finished
  group is handed over by `adopt()`. Trees-inside-rocks was reported twice
  because the first fix only touched the first path.
- **Eight full-size features do not fit round one hex.** `props.ts` plants ONE
  feature per tile; the growing plot plants eight, so they get their own
  smaller `FITS.grown`. Measured: full size places 74% of the time without
  overlapping, the smaller size 94%.
- **Coast costs are a table, not a formula, and 40 is a ceiling.** Walls (land
  standing in water) and cliffs (water against her grass) trade against each
  other — raising the wall cost from 40 to 100 cuts walls 37→11 but takes
  cliffs 1→24, because plain water starts winning. Cliffs matter more.
- **A set recolours a species' BASE COAT only**, decided per species from
  `species-base.json`, which `npm run pets:atlas` generates from the models'
  own UVs. Two wrong answers were tried first and both are instructive: a hue
  rotation does nothing to an animal with no hue (the polar bear), and deciding
  base-versus-marking per atlas BAND lets the pale species lose the vote to the
  23 others sharing that band. Membership is a colour REGION — an exact-RGB
  list banded every animal like a deckchair, because the atlas is a gradient.
- **Dev buttons all share `.dev-reset`**, which is fixed to the bottom-right
  corner. Anything new needs a `right` offset or it lands on top of the gear.
- **The dev server always runs the PREVIEW channel.** Building is unchanged —
  production unless `ISLAND_CHANNEL=preview` — but `npm run dev` on production
  would have every flag off and the Pet-o-matic unreachable.
- **A dev-only feature needs `__CHANNEL__`, not just a flag.** A runtime flag
  cannot be folded by Rollup, so the code ships unreachable-but-downloaded —
  the whole Pet-o-matic was precached that way. `npm run channel` checks both
  markers in both directions.
- **Menus dismiss on a tap outside; WORK PAGES do not.** The game has two
  full-screen overlays and they behave differently on purpose. Tapping beside the
  tile offer closes it, because that is `cancelPlacing` — a menu, zero cost,
  nothing in flight. Tapping beside a CHALLENGE does nothing, because a round is
  work in progress and leaving it deserves a deliberate corner ×.
  The reason is measured, not aesthetic: `.stage-slot` is `pointer-events: none`
  and spans 45% of a staged round, so while the backdrop dismissed, nearly half
  of what she was looking at — including her own egg turning on the vignette —
  ended the page when touched. That is what Joe's "too many accidental hits"
  turned out to be. Do not "fix" the inconsistency in either direction without
  reading this.
- **The service worker uses `skipWaiting` + `clientsClaim`.** `autoUpdate`
  alone waits for every tab to close, which produces phantom regressions —
  fixes demonstrably in the deployed JavaScript but not in what the browser
  runs.
- **The pack's "black" is `#4d515f`, and it is not black.** A dark blue-grey:
  max channel 95, so it clears `SOUL_VALUE` (78); saturation 0.19, so it clears
  `MARKING_SATURATION` (0.12). It therefore qualifies as a BASE COAT, and it is
  also the colour of nearly every leg mesh, every hoof and every outline. Raising
  either threshold to exclude it would stop the penguin, cat, koala and elephant
  changing colour at all, because it is genuinely their coat.
- **Weight a species' colours by SURFACE AREA, never by vertex count.** Fiddly
  detail carries far more vertices per unit of visible animal than a broad coat
  does: a panda's white torso is a handful of large quads while its black ears
  and eye patches are many small faces, so counting vertices gave black 798 to
  white 128 on an animal that is mostly white. Four legs and a nose likewise
  outvoted the cow. `tools/pets/atlas.mjs` measures triangle area now and skips
  the extremity meshes (`leg-*`, `wing-*`, `tail`). The bee is decided 53% to 46%
  and the tool prints the margin, so a re-export that flips it is visible.
- **The pet atlas carries no positional information, at all.** Measured over all
  15,333 triangles in the pack: u-span is **0.00 pixels** — every triangle sits
  inside a single column — and atlas v correlates with local vertex position at
  r = 0.015 (x), −0.081 (y), −0.011 (z). So v is the shade the artist assigned a
  face, not where that face is on the animal. Consequences: **spots are not
  expressible** (the old dotty rule's x term was constant per triangle and
  collapsed to stripes, which is why every "Spotty" set was striped), and any
  atlas pattern is a function of SHADE, which is why stripes follow the form like
  corrugation. Real spots need object-space in a shader, or per-part meshes.
- **Normalising a species onto its own colour range AMPLIFIES.** It is the right
  fix for "the penguin stays dark" — its coat occupies value 0.31–0.39 and a hue
  window swept up the elephant's 0.90, pinning it at the bottom of the ramp. But
  a polar bear's coat spans 0.137, so stretching it over a 0.66-wide ramp is a
  gain of 4.8, and the atlas's own gradient steps come up with it as horizontal
  contour banding — visible on SOLID sets, and reading as exactly the corrugation
  the stripes were criticised for. `CONTRAST_REFERENCE` caps the gain and centres
  the coat on the ramp instead. Centred is what makes a colour visible; stretched
  is what makes it stripy.
- **Stripe pitch has to be chosen against the geometry, not by taste.** Triangle
  v-span is 16.8 atlas rows at the median and 81.5 at p90, so a pitch of 6 puts
  1.4 cycles across a median face and reads as knitwear, while 40 puts most faces
  inside one band and vanishes into the solid set. 14 gives a body three to five
  broad bands. Checked by eye at all three.
- **Eye-whites cannot be protected in texel space, and the number proves it.**
  22–23 of 24 species share `#f8f8fb`, `#f2f2f7` and `#e6e6ef` at u=112 — plainly
  the sclera — but freezing them costs the polar bear 25% of its surface area, the
  cow 19% and the penguin 28% on the dark equivalents. Eyes are a few percent of
  an animal; a quarter means the torso samples the identical texels. A colour rule
  is worse still: achromatic area NOT on a decal is 69.7% of a polar bear. **The
  answer is geometric, not chromatic** — the face decals are a separate flat
  sheet 0.01 units in front of the head, selectable by "planar connected component
  with area-weighted normal nz ≥ 0.9998", which picks exactly the 63 decals with
  enormous margins. Nine 32-wide atlas swatch columns are sampled by nothing, so
  two can be reserved and the decal UVs repointed at them. Costs ~1.7% of area
  frozen and zero extra GPU bytes, because decal UVs are a fact about the SPECIES
  and the shared geometry is patched once.
- **Only 19 of the 64 possible water neighbourhoods can be drawn cleanly.**
  Nought to three green edges, and the green ones forming a SINGLE contiguous arc.
  Four or more is arithmetic — no model has four land edges — and a split arc
  fails because every model's water is one unbroken run, so its land must be too.
  This is why the coastline is now constrained at PLACEMENT rather than patched in
  the scorer, and why "the coast belongs to the water" survives: confine water to
  those 19 and the water cell always carries its whole beach, so no land tile ever
  needs one and no field is re-cut behind her.
- **Constraining water alone is not enough — the guard must be symmetric.**
  Dropping GRASS beside a pond adds a green edge to a tile already drawn, and a
  pond that was fine at three fields has no orientation at four. Two further holes
  found the same way: `mustBeWater` short-circuiting ahead of the feasibility
  check forced water into undrawable shapes, and sockets that admit NEITHER kind
  fell back to grass, which was itself the violation. Those sockets no longer glow.
- **"She cannot wall herself in" is a TOPOLOGICAL property, and counting anything
  will not deliver it.** The dry-connection floor counts sockets and is a large
  empirical margin; it was claimed to be the guarantee and it is not — a Fable
  review walled her in in sixty-four taps through the real tap path. Nor is the
  one-ply rule that replaced the claim ("refuse any placement leaving zero growable
  witnesses") enough: it can be walked down to a single witness that is a dead end,
  and at that socket every kind ends the island, so there is nothing left to refuse.
  Adding plies only moves the cliff. What works is `coast.hasOutwardCorridor` — a
  dry chain from her fields to open sea — because grass can never break it and
  water that would is refused, which makes it inductive from Fred's rock rather
  than measured. **If you are tempted to fix a sealing bug by moving a constant,
  the constant is not the problem.**
- **A wall in `buildableSockets` is acceptable ONLY with a proof that something
  else still glows.** The first one was removed because at the sharp end the socket
  it refused was her last way out; the narrow one there now refuses only where
  grass is infeasible AND water would cut the last corridor, and the corridor's own
  mouth is provably a socket that takes grass. That difference is the whole
  argument — a guard that keeps `canStillGrow` true by forbidding her to use the
  last way out is a false guarantee, not a fix.
- **The offer is DERIVED from the choke point, not kept in step with it.**
  `flow.tileOffer` used to restate `tileTypeFor`'s conditions and carried a comment
  promising the two matched — a promise a comment cannot keep. It now asks
  `landedType` what each button would do and shows the ones that do it. Any new
  placement rule therefore lands in one place.
- **Judge cleanliness on neighbours' TYPES and rank on how they are DRAWN.**
  Asking whether a tile can be clean of the drawing is circular — it would depend
  on looks chosen by asking the same question next door, which is what produced
  "shows sand at edge 3 against land" on a played island. Types are the hard rule;
  the old cost table survives as a tie-break over drawn edges, and that is what
  keeps the whole-island sweep earning its place for shapes a child cannot build
  but an edited save could still contain.
- **Test the coastline by BUILDING islands, not by constructing them.** Three of
  the four faults above passed every unit test that assembled a `Map` of tiles
  directly, and only appeared when the test played 120 islands through the real
  tap path — `askForLand`, `tileOffer`, `chooseTile`, `placeTile`, sums to
  completion. Constructing an island tests the scorer; building one tests the
  promise.
- **`body:has(.overlay:not(.hide)) .say` hides the say card whenever ANY overlay
  is open** — and the tile offer is an overlay. So copy set with `overlay.say()`
  while the offer is up is invisible: the question "Which tile would you like?"
  could not be read for exactly as long as the buttons asking it were on screen.
  Measured in the browser before believing it. Anything that must be readable
  alongside a panel belongs INSIDE the panel. The mirror also bites — dismissing
  an overlay REVEALS whatever copy was set behind it, so a dismissal has to clear
  it.
- **Do not rewrite source files with Python text mode on Windows.** `open(p)` then
  `open(p,'w')` translates LF to CRLF on write, which silently reflows the whole
  file and broke `tests/island/barrier.test.ts`, whose assertion contains `'\n'`.
  Write bytes (`'rb'`/`'wb'`) or pass `newline='\n'`.

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

---

## Landmines added 28 July

**A closed panel can steal her half-built tile.** `stageFor('sum')` re-parents the
growing plot onto the overlay's turntable, and the turntable goes away with the
panel. One `overlay.close()` of five closed without handing it back, so the plot
stayed alive — still in `flow.plot`, still holding her sums — parented to
something no longer on screen. Her island showed an empty socket; tapping any
socket called `askForLand`, which resumes a standing plot and re-staged it, so it
looked like the tile "came back when you pick a socket". **Every `overlay.close()`
in main.ts must be preceded by `stageFor(null)`**, and a source assertion in
`tests/island/retype.test.ts` now enforces it. Every unit involved behaved
correctly; the fault was entirely in the sequence.

**Widening a value union is invisible to the compiler.** Adding `'rock'` to
`TileType` silently broke eight places that asked `=== 'grass'` and meant "dry
land" — including `waterMask`, which builds the coastline itself. They compare
values rather than switching exhaustively, so `tsc` found none of them and rock
would have presented open sea to its neighbours, cutting beaches through the
middle of her island. The land/water question now goes through `isLand()` in
`grid.ts`. **Read the note there before adding a fourth type**; rock escaped
needing new coast-table entries only because it can never touch water.

**`isLand` is deliberately not the habitability question.** Rock counts as land
for the coastline (dry, buildable from) and NOT as lodging for the governors,
because a mountain hex is planted at native size and covers its own tile — there
is nowhere on it for a pet to stand. If those two ever agree again, one has been
changed without the other being considered.

**The two regression gates constrain difficulty work in opposite directions.**
`golden.json` pins per-level generator BEHAVIOUR — every level, including the
ones the island never selects — so changing level *selection* is free while
redefining what a level *is* invalidates the anchor. And `parity.mjs` drives v0's
own level switch, so adaptive selection must live in the island layer, never in
`src/core/`, or the 2D shell diverges from the frozen original. See
`docs/PHASE4.1-EDUCATIONAL-HARNESS.md` §5.

**A plot that is only ever BUILT ONCE will show her last week's answer.** main.ts
created the growing plot when none was standing and never again, so `chooseTile`
retyping a standing plot — the change-your-mind feature — changed the flow and
nothing else. She picked mountains and watched a grass tile grow; `props.adopt`
then handed the finished hex exactly what the scaffolding had grown AND marked it
dressed, so `props.sync` never planted the peak, and only a reload (which re-dresses
from the save, where the type was 'rock' all along) corrected it. Both halves of
Joe's report, one fault. The lifecycle now lives in `src/island/plot.ts` behind
ports and compares what is on screen against what the flow says by SITE AND KIND;
a difference rebuilds it. **Three faults in two days have been in this seam** —
the dead-on-arrival plot, the plot stranded on a closed panel, and this — and none
of them was visible to the unit tests either side, because the plot builds whatever
it is told and the flow records whatever is chosen. Only a test that drives both
together catches this class: `tests/island/plot.test.ts`.

**`git add -A` will swallow `.claude/worktrees/` as embedded repos.** It did once
this session and had to be amended out. `.claude/` is now in
`.git/info/exclude`, but stage deliberately (`git add src tests docs`) rather
than relying on it.

**`agent-browser` hung on every command for the last stretch of 28 July** —
three sessions, all wedged on `open`, each needing `TaskStop`. Screenshots
earlier the same session worked, so it is environmental. Budget for it failing
and keep a non-browser way to verify: `createGrowingPlot` and friends take
injected deps and can be driven with stubs (`tests/island/increments.test.ts`).

**`joe/tasks.json` is a whole-file save, and appending to it races Joe.** The
workbench UI (`npm run dev:workbench`) loads the entire file and writes the
entire file back, so a `JT-0xx` appended while he has the page open is destroyed
by his next save — his copy was loaded before your record existed, and the append
always loses. It has cost work twice in two days, both confirmed, and in both
directions: JT-020 (raised at commit `3588e27`) vanished, and an earlier answer
of his to JT-016 vanished too, which he had to re-enter — *"16 now rewritten, got
killed somehow"*. Agents lose their raises and Joe loses his notes. **Re-read
`joe/tasks.json` from disk immediately before you write it** — never from a copy
read earlier in the run — append, write, then re-parse and verify that BOTH your
new record and every pre-existing `note` survived. If a raise and a save of his
have collided, **his notes win**: keep his file and re-append your record from
the commit blob. Recovery only exists because every write is committed, so commit
`joe/tasks.json` on its own and the lost record is always one
`git show <commit>:joe/tasks.json` away.

## Landmines added 29 July

**The whole-file save race is `joe/backlog.json` too, and it is WORSE there.**
The note above documents it for `joe/tasks.json`. On 29 July it hit
`joe/backlog.json` three times in a single manager run. Joe's page had been
loaded before the drumbeat committed a new card, so his stale `nextId` dealt
each new card of his an id that was **already taken**, and the whole-file save
then overwrote the existing card of that id outright — twice on the same id,
plus one edit of a manager's made ninety seconds earlier. Nothing warns you; the
file still parses and the card count still goes up.

So: **re-read from disk immediately before writing, and verify AFTER writing**
that every card present in `HEAD` is still present, that there are no duplicate
ids, and that the file is still LF. **Do not fight him for an id.** His cards
keep the ids he gave them and your record moves to a free one, with a line in
the card saying which id the orders and the commit messages call it — otherwise
the next reader finds `MANAGER-ORDERS.md` citing `PB-048` and a completely
different card sitting at `PB-048`. And **commit his uncommitted cards when you
find them**: they are real product intent living only in a file that the next
save may clobber.

**A standing `flow.plot` in free play IS the abandoned state — it is not "mid
build".** This is the fact the PB-048 fix turned on, and it is not visible from
either side of the seam. The sum overlay stays **open across every sum of a
tile** (`main.ts:1577-1588` deals the next sum into the same panel), so the only
way she is ever back on the island with a plot standing is by having **left**
one. `askForLand` used to resume it, which meant every later tap — including a
near-miss at an animal, because `picking.ts` answers with whatever is under the
ray and that is the tile her friend stands on — dropped her back into a build she
had walked away from. That was Joe's report, and it is the **fourth** fault in
this seam.

**Do not "fix" abandonment by nulling `flow.plot`.** It is the obvious move and
it is wrong: `plot.ts:111-133` treats `state.plot === null` with a plot standing
as COMPLETION — it pins the scaffolding to full progress and plays the farewell —
so an abandoned tile would bow and fly away exactly like a finished one. The
shipped fix instead leaves the scaffolding standing and moves `flow.plot`
straight from the old plot to the new one in a single transition, so the host
takes its ordinary `!same(built, state.plot)` rebuild path and null never
happens. **Nothing is lost visually either**: `sumsForTile` depends only on
`tilesEarned`, never on type or site, and the host puts a freshly built plot
straight to `flow.sumProgress`, so the new scaffolding appears already grown to
the stage the old one had reached. She sees her build move, not shrink.

**Two comments in the tests still narrate the old resumption as current.**
`tests/island/pettap.test.ts:13` and `tests/island/retype.test.ts:193` describe
"a half-built plot resuming into a sum" as a live outcome. It is now impossible.
They are historical narration of an older bug, left alone deliberately, but do
not read them as documentation of what the code does today.

**Two managers, one worktree: a concurrent `git add -A` swallows your staged
work into someone else's commit — and it may be pushed before you notice.** The
PB-052 run staged seven files deliberately, ran all five gates, and in the
window before `git commit` the parallel PB-036 manager committed with a broad
add and pushed. All seven files are in `0369387`, whose message is about taking
an animal apart. Nothing was lost and history was **not** rewritten, because it
was already on `origin/main` and the other manager was still running. Two
consequences. **Look for PB-052's code by symbol, not by commit message** —
`src/island/world/walk.ts`, `src/island/world/mountains.ts`, `sealsAPet` in
`flow.ts`. And when you know another manager is live in the same tree, commit
the moment your gates go green rather than staging and then doing anything else;
staging is not a lock.

**`hasOutwardCorridor` answers a question about BUILDING and is silent about
WALKING, and the two are not the same invariant.** It walks `dryEmpty` cells of
the tile map (`coast.ts:1056`), so it never sees what stands on a tile;
`tileTypeFor` exempts rock from it outright (`flow.ts:524`) because rock cannot
cut a corridor. Both true. But a rock hex grows a mountain whose keep-out circle
is 1.027-1.062 against a hex spacing of exactly 2.0000, so two mountains on
adjacent hexes **overlap**, and six of them ring a hex a pet can never leave.
The second topology now exists as `src/island/world/walk.ts` — the free space
*between* the keep-out circles, as the hex lattice's corner graph. If you add a
prop whose keep-out radius exceeds ~1.73, the corner model's premise breaks and
it silently under-reports; `tests/island/walk.test.ts` asserts the premise so
that day is a red test, not a trapped animal.

**A pet's `at` is its HATCH hex and is never written back** (`pets.ts:424-427`),
so `firstFreeSpot` (`flow.ts`) is choosing from hatch *history*, not from where
the animals actually are — and it checks no tile type, nothing standing on the
hex, and no reachability. A reload re-sites every pet at that same hex
(`pets.ts:661-662`). Once a tile is committed it can never be retyped
(`askToRetype` only ever touches the half-built plot) and `grid.place` has no
inverse, so **an island that is already sealed cannot be repaired by the child**.
Any brief §19 argument about pets recovering on their own is false.
