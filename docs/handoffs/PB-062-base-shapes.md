# PB-062 — the three base shapes

*Written 2 August 2026. Joe's ask, verbatim: "please also add some base shapes:
triangle, circle, square, all with same chamfer in the game and ability for me to
resize."*

Three prisms now live in `src/island/species/parts/authored.ts` beside
`bespoke-sphere-01`: `bespoke-triangle-01`, `bespoke-circle-01`,
`bespoke-square-01`. `AUTHORED_PARTS` is 4 long, not 1.

---

## The chamfer number, and the evidence for it

**`chamfer = 0.25 × the part's own smallest dimension`, 45°.** At the default
size of 1.250 that is **0.3125**.

**Verified against `bank.generated.ts`, not against the doc — I ran the bank and
checked, and the check is now `tests/island/authored-primitives.test.ts`.**
`box-03`'s 32 welded points are exactly the permutations of (±0.625, ±0.3125,
±0.3125) together with the eight (±0.5, ±0.5, ±0.5). No float noise, no odd
point, no missing one. So its flat faces sit at ±0.625 and its plateau edges at
±0.3125, a cut of 0.3125, which is exactly 0.25 × 1.250 — the top of the 0.20 to
0.25 range `how-the-animals-are-made.md` measured over 4,354 Kenney corners, and
on the pack's 1/16 grid.

### The bank disagrees with the doc on one thing, and the bank wins

`docs/building-animals-from-parts.md:791-797` says `box-03` *"cuts every edge AND
every corner"*. Its point list is right and its 0.46875 edge midpoint is right.
**Its topology is wrong: `box-03` has no corner facet at all.** Measured off the
bank — 30 planar faces, 60 triangles:

- 6 flat axis-aligned faces, each 0.625 square;
- 24 bevel quads, **two per cube edge**, normals the permutations of
  (±2, ±3, 0)/√13 — **56.31°** from the neighbouring flat face, not 45°;
- **0 corner facets.** The eight (±0.5, ±0.5, ±0.5) are single vertices where six
  bevel quads meet.

There is no 0.7071 anywhere in `box-03`'s normals. If any code or doc assumes a
single flat 45° edge quad or eight corner triangles for `box-03`, it is wrong.

**Why, and it is arithmetic.** Three exact 45° bevel planes meet at `h − c/2` on
every axis, which for `box-03` is 0.625 − 0.15625 = **0.46875**. That is 7.5/16.
The pack is hand-authored on a 1/16 grid and 0.46875 is not on it; **0.5 is
(8/16)**. Kenney rounded the corner outward by 0.03125 to land on the grid, and
that one snap is what splits each flat hexagonal bevel into two quads with a
shallow ridge between them.

We keep the pack's number rather than the ideal one, expressed as a ratio so it
survives resizing: **the corner sits 20% of the way from the exact 45° triple
point toward the true corner**, which at 1.250 gives exactly 0.5. That is
`CORNER_TOWARD_TRUE` in `authored.ts`.

**This is the only number in the file that is not derivable, and it is the one to
challenge first if the shapes ever look wrong.**

---

## Does the square reproduce `box-03` exactly? Yes, four ways

`tests/island/authored-primitives.test.ts`, first describe block:

| assertion | result |
|---|---|
| the 32 welded points | **identical set**, none missing, none extra |
| the face planes | **identical set**, 30 of them |
| triangle count | **60**, the same |
| normals | agree to **0.00009** — the bank's own 4dp rounding |

It costs **32 vertices against `box-03`'s 120**. The pack's exporter split every
corner and then gave the copies identical normals, so welding them changes
nothing anybody can see. `how-the-animals-are-made.md:114` predicted this build
in as many words: *"A hand-built 60-triangle chamfered box would match the pack
exactly and cost less."*

The normals are **angle-weighted, not area-weighted**, and that was measured
rather than chosen — area-weighted normals are out by up to 6.7°, angle-weighted
by 0.00009. Kenney's exporter used angle weighting.

---

## The construction, in one paragraph

For a chamfer `c` and a convex cross-section extruded along y: every face keeps a
**plateau**, its own plane inset by `c`; every real edge gets a **bevel band**
between the two plateaus it separates; every corner is a **single point**, the
meet of its three 45° bevel planes (at `c/2` in from each, and at `hy − c/2` in
y — an identity that holds for any convex cross-section, which is why the
triangle needs no separate arithmetic) moved 20% out toward the true corner. With
n sides that is 8n points, 7n+2 faces and 16n−4 triangles. **At n = 4 that is 32,
30 and 60 — `box-03` exactly.**

- **square** — 32 verts, 60 tris, 1.250 cube.
- **triangle** — 24 verts, 44 tris.
- **circle** — 48 verts, 92 tris, a 12-sided cylinder (the pack's own precedent:
  the pig's snout).

**The circle is chamfered on its two rims only, deliberately.** A cylinder's
barrel is one smooth surface and the joins between its facets are tessellation,
not edges; rule 2 is about edges. It is also geometrically forced — at 12
segments a 0.25 cut is longer than a facet, and chamfering them self-intersects.

**Each cross-section FILLS its bounding box.** That is what makes `size` mean
something under resize: the same dial moves all three the same way. The square's
cut faces reach the box exactly, which is why its measured size is `box-03`'s
1.250 on the nose. The triangle's apex is a vertex, not a face, so the chamfer
cuts it back and its measured size is honestly smaller than the box it came out
of — `shape` and `size` are computed from the positions, so they say so.

---

## What resize does now, versus before

**Before:** `setStretch` wrote a `stretch` vector and `bakeGeometry` **multiplied
the baked positions**. So a chamfer baked at one size was scaled with everything
else. Stretch a cube 4× in x and its x-facing cut becomes 4 × 0.3125 = 1.25 —
no longer a quarter of anything, and no longer at 45°. Joe would have got that
today. There was also a second, louder problem: the editor warned that *"the
authored proportions of the shape itself are changed — which is the thing Joe
rejected by name on the hedgehog's hull"*, which is a fair thing to say about a
lifted part and a nonsense thing to say about a square.

**Now:** a primitive is **RE-CUT** at its new size. `primitiveStretched(id,
stretch)` regenerates the solid from a box of `PRIMITIVE_SIZE × stretch`, so at
any size the cut is still 0.25 of the smallest dimension and still at 45°.

**I chose regeneration, and the reason is that "same chamfer" is a property of
the family, not of one part.** Joe asked for three shapes that share a chamfer.
If the chamfer scales with the part, two shapes at different sizes no longer
share one, and a non-uniformly stretched shape does not even share one with
itself. A chamfer is a distance; the doc's own measurement is a distance
("0.20 to 0.25 of the part's own smallest dimension"), not a proportion baked in
at unit size.

**Where the swap lives — two places, and it has to be both:**

- `src/island/species/parts/assembly.ts`, inside the `geom(...)` closure. The
  cache key already carried the stretch string, so a re-cut solid keys uniquely.
  `spanAlong` reads the baked geometry, so the regenerated extent reaches the
  join solver with nothing else to change.
- `src/island/species/parts/creature.ts`, `builtPoints`. It solves the join a
  second time at definition time and feeds the `anchors` map, and its own doc
  promises *"exactly as `bakeGeometry` will"*. **The square would have hidden
  this** — it fills its box at every size, so the two agree. The triangle and the
  circle are where they diverge, and a feature written `on: '<a stretched
  primitive>'` is the case that would have shown it.

**Verified over the whole dial range.** The editor's SIZE sliders run 0.25× to 4×
per axis, independently. All 375 reachable solids (5³ × 3 shapes) are checked for
self-intersection, inverted faces and unwelded points: zero failures. The seam is
asserted **off the built `BufferGeometry`**, not off `primitiveStretched` — a
test that only calls the generator proves nothing about whether `assembly.ts`
ever calls it. Reverting the swap turns it red at **0.9375**, which is 3 ×
0.3125: the multiplied chamfer, exactly.

**What Joe can and cannot resize.** `setStretch` refuses a stretch in the `hull`,
`legs`, `eyes` and `ridge` slots — the guard is on the SLOT, not the shape. So he
can resize a base shape placed as `ears`, `tail`, `snout`, `nose` or any `extra`,
and cannot as the hull, the leg row, the eye cards or a ridge. That is right for
three of them (rule 5's absolute eye size, the leg row, a ridge that changes by
taking a different shape). **The hull case is a question for him**, below.

---

## The three rules `authored.ts` lives under

1. **Not in `PARTS_BANK`, and `findShapes` cannot return one.** Asserted.
2. **Every id is `bespoke-*`.** Asserted, for all four.
3. **A species wearing one carries a `flag`.** Kept — with a named exception.

### The exception, which is a decision worth reading

`creature.ts` throws when a species wears a `bespoke-*` part and its `flag` does
not say `RULE 1`. **That gate now skips the three primitives**, and still fires
for `bespoke-sphere-01` and for everything Joe commissions next.

The reason: the flag exists to surface an **unsanctioned** authored part to Joe.
He sanctioned these three by name, for everybody, permanently (JT-041). A flag
would be telling him something he already ruled. And leaving the gate would have
made the thing he asked for unusable — every square dropped into the editor would
have come back "refused: ... and nothing says so".

**The same rule lives a second time in `tests/island/assembly-assert.ts`**, which
every shipped species runs. It carries the exception too, and it had to: left
alone, the first species to wear a square would pass the builder and then fail
its own harness, and the obvious "fix" would be a bogus `RULE 1` flag naming no
strained rule — which is precisely the signal that assertion exists to keep
meaningful.

### `roles: []`, and the `primitive` header

`PartRole` is declared in `bank.generated.ts`, which is generated and never
hand-edited, so there is no `'primitive'` to write. It would not belong there
anyway: `PartRole` is documented as *"what a part was in the animal it came out
of"*, and these came out of no animal. **An empty `roles` is the same kind of
checkable statement as the empty `provenance` beside it.**

`groupShapes` in `tools/workbench/public/editor/library.ts` already had an
`unsorted` bucket, written as a guard for exactly this day and never reached
(nothing in the bank is roleless). `Unsorteds (3)` reads as an accident, so a
roleless row that is **authored** now heads **`Primitives (3)`**; a roleless row
that is not still heads `Unsorted`, so the guard keeps its job. **The word is a
UI label, not a `PartRole`** — nothing in the data claims it.

---

## Gate results

Run on `ebe7c37`, after all three commits.

```
npx tsc --noEmit -p tsconfig.json      TSC_EXIT=0

npm test
 Test Files  150 passed (150)
      Tests  3325 passed (3325)
   Duration  56.24s
   (baseline on main was 148 files / 3287 tests)

npm run build
 PWA v1.3.0 / mode generateSW / precache 50 entries (1856.73 KiB)
 files generated  ../../dist/island/sw.js, workbox-9c191d2f.js

npm run smoke
 ok  no runtime errors on boot ... ok  score bar initialised
 all boot checks passed

npm run parity
 self-check  spoken utterances : 4 / 4
 self-check  score bar         : "🐚 6" / "🐚 6"
 every step renders identically
```

`tests/tools/editor-library.test.ts`'s `PARTS_BANK.length +
AUTHORED_PARTS.length === ALL_SHAPES.length` moved as expected and still passes,
because it is derived. One group-count assertion needed fixing and was fixed **by
derivation, not by bumping 10 to 11** — the file's own header is that counts are
never typed as literals, so a fourth base shape changes neither number.

---

## What I learned that is not in the code

- **This worktree was 16 commits behind `main` when I started, and the brief
  described `main`.** The role-grouping the brief referred to (`2f29ef7`) was not
  in the checked-out files at all — `library.ts` still grouped by `form`. Check
  `git rev-list --left-right --count main...HEAD` before believing a brief's
  description of the code. It fast-forwarded cleanly.
- **`tests/copy/pronouns.test.ts` scans string literals in `src/`.** It rejected
  a new error message containing "he sanctioned". The existing `'where he reads
  it'` survives, so the checker is pattern-based rather than a blanket ban.
  Anything added to a user-facing string in `src/` has to dodge it.
- **The whole-suite run is flaky under parallel load** — `coast`, `facedecals`
  and `sealing` failed for two subagents alongside a "Failed to start forks
  worker" error, and passed in isolation and in my own clean full run. Do not
  chase it as a regression before re-running.
- **`box-03`'s bevel is two facets per edge at 56.31°, not one at 45°.** Promote
  this into `docs/HANDOFF.md` §6 if anyone builds against the pack's cube again;
  §8 of `building-animals-from-parts.md` will mislead you.

---

## Where the next manager starts

Nothing here is blocked. Three things are left deliberately undone, all reported
rather than decided:

1. **A filter for `role: 'primitive'` returns nothing.**
   `tools/workbench/public/editor/library.ts:218`. `LibraryFilter.role` is
   documented as a lookup into provenance; making that one value mean something
   else would put a word in the filter no `PartRole` backs. The honest surfaces
   if Joe wants it are the existing `text: 'bespoke'` or a new explicit
   `authored?: boolean`. **Ask him rather than guessing.**
2. **A primitive cannot be resized in the `hull` slot.** `def.ts:529` and
   `HullDef.stretch` typed `never` in `assembly.ts:245`. That type exists because
   of Joe's own "the body/cube should always be the standard size" ruling about a
   shared LIFTED hull losing its cube — a reason that does not obviously carry
   over to a square he cut himself at the size he wanted. **Lifting it is a
   ruling and a type change; it is his.**
3. **`isTheClaimedShape` in `assembly-assert.ts` compares a mesh's point set to
   its bank record's, undoing the stretch.** No shipped species wears a primitive
   yet, so it is untested against a re-cut solid. The first species that wears
   one should check it before assuming it passes.

**PB-062 is code-complete and unpushed.** Three commits: `76ef822` (the
geometry), `bda6b3e` (the resize seam and the flag exception), `ebe7c37` (the
editor). Joe handles deploys.
