# Building animals from the pack's own parts

*Written 29 July 2026. This is the method for every animal built from here on.
It replaces the kit approach described in `docs/how-the-animals-are-made.md`
§1–§5. Read that document for the measurements; read this one for what we do
about them.*

*It exists because the method was agreed in a conversation and a conversation
does not survive a session. Everything Joe settled is written down here, his
words kept as his words.*

---

## 0. The ruling that starts this

**The 72 built species are scrap.** Joe, 29 July 2026:

> everything built already in terms of animals is scrap. names and facts ok,
> the 3D part is junk i'm afraid.

**The names and the facts survive and are never regenerated.** They live outside
the geometry entirely — `SPECIES_NAMES` in `src/island/species/roster.ts:367`,
the given-name table in `src/island/species/name-pins.json`, and the fact rows in
`joe/species-facts.json`. None of those files is touched by a rebuild. Only the
`build` object inside `src/island/species/collections/*.ts` is geometry.

**The cause is measured, not felt.** All three kits emit the head and the body as
two boxes and never merge them (`quadruped.ts:229`/`:269`, `raptor.ts:289`/`:372`,
`songbird.ts:205`/`:268`). A Kenney pet is ONE mass — the head does not separate
from the torso in 24 of 24, because there is no seam at the neck. That is a
structural difference. No tuning closes it, so the 72 are rebuilt rather than
adjusted.

**Do not delete the old kits yet.** JT-034 is Joe's ruling to make. Do not build
on them either.

---

## 1. The method

**Build animals from the pack's own parts.**

This is not a new idea and it is not our idea. It is how Kenney built the pack:
one leg drawn once and used 86 times, one 1.250 cube hull shared by 13 of the 24
animals, only ~10 distinct body shells in the whole set. What makes a giraffe a
giraffe here is not its body — the giraffe's body is the same cube as the
elephant's — it is the ossicones on top and where the features sit.

Joe, on being shown that:

> the original animals decomposed into their constituent parts. we then use
> those parts to build new animals as far as we can, either by new assembly or
> by adjusting a copy of a primitive. we should not create our own primitives.
> they won't look right.

So we **lift** real geometry out of the real `.glb` files, bank it, and assemble
new species out of the bank. Nothing in the bank is authored. Every vertex in it
came out of a file Kenney shipped.

---

## 2. The build rules — agreed with Joe, verbatim

These are the rules. They are not guidance and they are not a starting point for
a better set. Every species built from here on is built under all ten.

1. **Adapt before authoring** — stretch, rotate or otherwise manipulate an
   existing shape before starting anything from scratch.
2. **Every edge has at least one chamfer cut.**
3. **One mass** — head and body are a single form; features attach to it. Never a
   second big shape. This is the fault that scrapped the 72.
4. **Placement by translation only** — 133 nodes carry three rotations and one
   scale between them. Parts are origin-centred and moved, not resized in place.
5. **Absolute sizes for face features, not proportional** — the eye is the same
   size regardless of head size. Proportional eyes gave a 2.95× spread.
6. **Paired parts are one mesh, mirrored** — legs, ears, wings, eyes: author
   once, place twice or four times.
7. **Smooth-shaded, with split corners where a hard edge is wanted** — the leg is
   24 unique positions with duplicated corners. (`shared.ts` has told every kit
   "flat-shaded" since the first; that is wrong.)
8. **One hue per part** — colour is a lookup down a single gradient column;
   two-tone comes from splitting the part, not blending.
9. **Low vertex budget** — bodies 236–1114 verts, a leg is 24. A bespoke part
   needing hundreds is the wrong shape.
10. **Readable in silhouette** at tablet distance.

### The escape clause, which matters as much as the rules

Joe, same conversation:

> if something cannot be built sensibly under those rules, build the best
> attempt and flag it, it may need bespoke instructions.

**So never block on a hard species.** Build the best attempt, flag it
unmistakably in the viewer, and say in writing which rule it strained and why.
A flagged approximation that Joe can see and rule on is worth more than a gap in
the collection or a silent violation.

---

## 3. The primitive banks

All of these are liftable **today**, off the real files, with no new capability:

| Bank | How it comes out |
|---|---|
| Torso hull | the one large welded component inside `body` |
| Eyes (L/R) | welded component; flat card, zero thickness, 48 of 48 |
| Legs | a separate NODE, with its own transform |
| Tails | a separate NODE, with its own transform |
| Wings | separate NODES (`wing-left` / `wing-right`) |
| Ears | welded components inside `body` |
| Horns / antlers / ossicones / crests | welded components inside `body` |
| Muzzles / noses / snouts | welded components inside `body` |
| Torso bands and flat marking cards | welded components inside `body` |

The splitting is not speculative — the Anatomy tab in the workbench already does
it live in the browser, and `tools/workbench/public/anatomy.ts` holds the weld
and connected-components implementation (`weldedComponents` at :141).

**Two rules of thumb that cost four measurement passes to learn:**

- **Weld by position before finding components.** The raw index graph reports
  3,217 components where there are 206, because the exporter splits vertices at
  UV seams.
- **Rank components by bounding-box volume, never by triangle count.** In 6 of
  the 24 the largest-by-triangles part is an *ear*. A panda ear is 116 triangles
  against a body shell of 72.

### What is known about each bank

- **Legs** — one shape, 86 instances, 23 species, bbox 0.375 × 0.306 × 0.375.
  Lift once. Legs contribute variety of precisely zero, so they are a solved
  problem, not a design space. Note they are deliberately **sunk into the belly**
  (0.225 on the lion), so "under the body" means under its middle.
- **Eyes** — flat card at z = 0.6350, standard deviation 0.0000 across all 24.
  Canonical placement, free. Eye cards vary only 1.44× across the whole pack and
  face plates 1.07×, so **an eye is never stretched** (rule 5 is the same finding
  from a different direction).
- **Tails** — 8 shapes, and they carry their own node transform, so their
  placement comes with them.
- **Ears, horns and muzzles** — **no canonical transform.** These need a
  placement rule, derived from measurement and written down here (§7). Ears
  scatter about a third of their own size either way; snouts carry over exactly
  in x and y but need z re-fitted to the depth of the body they go on. Ears vary
  2.97× and snouts 2.90× naturally, so **stretching a copy is safe** for these
  two kinds and only these two.
- **Nothing floats.** Every eared species embeds its ear *into* the hull, by at
  least 0.125. Parts overlap on purpose. Keep doing that.

### The torso is ONE primitive

This is Joe's reading and it is to be verified rather than assumed:

> the alternative shells are the same body plus something — a rump (panda), a
> form running through it (lion, caterpillar) — or merely a different chest
> COLOUR (deer, penguin), which stops being a shape question entirely once we
> author our own texture.

So each alternative hull is classified as one of:

- **(a) cube plus an add-on** — the extra geometry becomes a **torso add-on
  bank** entry, and the hull collapses into the shared cube.
- **(b) colour only** — no shape difference at all. Collapses into the shared
  cube outright, because we author the texture (§4).
- **(c) a genuinely different shape** — stays as its own hull.

Only (c) hulls are separate primitives. The measured verdict per hull belongs in
§7.

### Count every bank

How many distinct ears, tails, horns, muzzles and wings actually exist has never
been counted. It is counted in §7. Instances are not shapes: 86 legs are one
shape.

---

## 3.1 A part's identity is its placement, not Kenney's label

This is Joe's, 29 July, and it is the single largest multiplier on the banks:

> the hog ears could potentially double up as dragon or croc back ridges as well
> as hedgehog spikes (if added sunk into the torso, say 6 on each side.

**The principle: a part's identity comes from where it is placed, how many there
are, and how deep it is sunk — not from what Kenney called it.** One shape is a
hog's ear, a hedgehog's spike, a dragon's back ridge and a crocodile's scute. The
bank is therefore much larger than its raw count of shapes suggests, and this is
"adapt before authoring" (rule 1) taken seriously rather than politely.

Three things follow, and all three are binding:

1. **Bank entries are named by SHAPE. Kenney's name is provenance, not the
   label.** A bank record's `id` and `kind` describe the geometry —
   `cone-flat-tapered`, `wedge-broad`, `blade-curved` — and the donor species and
   Kenney's own part name live in a `provenance` field beside it. **If a shape is
   filed as "hog ear" it will never be reached for as a spike**, and the
   multiplier is lost to a naming decision. This is the same discipline the
   anatomy view already uses: Kenney's names plain, ours marked as ours.
   Where two shapes filed under different roles turn out to be identical after
   translation, that is a dedup win and it is recorded.

2. **Sinking into the torso is a legitimate placement, not a mistake to clamp
   away.** The placement rule must express **N copies along a line** — six a
   side, evenly spaced — and must take **depth as a first-class parameter** with
   a measured range, not as a minimum to be enforced. A rule that assumes
   one-per-side at the surface quietly makes this idea unbuildable. Depth was
   already known to be real (every eared species buries its ear by at least
   0.125); it is now a dial rather than a floor.

3. **The "impossible" list is smaller than we told him.** §5 named four missing
   shapes: fin, insect wing, frill, hooked beak. Joe has since confirmed **the
   fish's "wings" are fins and the bee's are true insect wings** — so those two
   were never missing, they were mislabelled. And **a row of sunk ear-shapes is
   plausibly a frill**. That leaves the hooked beak as the only clearly absent
   shape of the four. The 64-impossible figure in §5 is therefore an
   overstatement and is to be re-derived before it is quoted to Joe again. Do
   not chase this during a collection pilot; do not repeat the old number
   either.

---

## 4. Texture: we author it per animal

We assemble the animal, so **we own its UVs**. That changes the colour problem
from a constraint into a choice.

**Give the assembled animal a canonical UV layout and generate a small
per-species texture, lazily, cached.** Two ways to get two-tone are available and
both are legitimate:

1. **Send different triangles to different texture regions** — Kenney's own way.
   This is why every baked part carries a per-triangle band index: the original
   UVs tell us which palette band each triangle pointed at, so a lifted part
   arrives already split into its own colour regions.
2. **Paint the boundary into the image** — finer, and unavailable to Kenney.
   Belly patches, blazes, socks and eye rings without touching geometry.

This **dissolves the two-tone problem**, which was the real blocker: 39% of
liftable components span more than one palette band, minority colour at a median
37%, so under the old "shift the part to a different palette column" scheme both
halves of a lifted head moved to unrelated colours and the detail that made it
read as a face turned to mud. Owning the texture removes the whole failure mode
and lifts the six-usable-colours ceiling with it.

**The eye stays a flat decal.** It is the face, and brief §5 keeps the soul
constant per species. It is lifted geometry with the pupil painted or banded into
it, never a protruding ball with a second ball in front — which is what the kits
did, and what made the eyes read wrong.

**Caching rule, inherited and non-negotiable:** set textures are cached and
**detached, never disposed**. Disposing one breaks every pet of that set,
including ones a child already owns (brief §19).

---

## 5. What this does not reach

Measured, and honest. From lifted parts alone, of the roster's ~296:

- **186 buildable.**
- **46 partial** — Birds, Outback, Legendary.
- **64 impossible** — Ocean, Critters, Dinosaurs, Raptors, for want of a fin, a
  flipper, a fluke, a membranous insect wing, a segmented leg, a frill, a plate,
  a spine, a hooked beak, a talon, a spread wing. Also named as missing: hoof,
  trunk, shell or carapace, long neck, tentacle, quill.

  **This number is now known to be an overstatement and must not be re-quoted
  until it is re-derived.** §3.1 already retires three of the four headline
  gaps: the fish's "wings" are fins, the bee's are true insect wings, and a
  frill is plausibly a row of sunk ear-shapes. Only the hooked beak of that four
  is clearly absent. The 64 was counted under the assumption that a part's role
  is fixed by its label, and that assumption is wrong.

**We do not invent the missing parts.** Joe asked for that explicitly. A species
that needs one goes through the escape clause: best attempt, flagged, with the
rule it strained named — and the flag is what tells Joe a bespoke part is worth
commissioning.

---

## 6. How the code is arranged

- **The bank is generated, never hand-edited.** `tools/pets/parts-bank.*`
  generates `src/island/species/parts/bank.generated.ts` off the real `.glb`
  files. If the bank looks wrong, fix the generator and re-run it. The precedent
  is `tools/workbench/anatomy-names.mjs` → `anatomy-names.ts`.
- **The bank is verified against the GLBs, not against itself.**
  `tests/island/parts-bank.test.ts` reads the real files. A test that only reads
  the generated module proves nothing.
- **Assembled species carry an `assembly` build spec**, kept alongside the old
  `build` field rather than replacing it, so the scrapped 72 stay visible for
  comparison until Joe rules on JT-034 and nothing he can see today disappears.
- **The workbench is where he judges it.** New species are shown beside the live
  24 originals — the standing question is whether a new animal *sits next to the
  fox without looking like a guest*. `loadComparison()` in
  `tools/workbench/public/viewer.ts:334` is the existing pattern.

### Pilot discipline

Joe:

> lets get started with one collection. we see how its going, maybe sharpen the
> instructions and then we continue.

**One collection, then stop and report.** The first is **Garden** (14 species:
hedgehog, squirrel, mouse, mole, badger, frog, toad, tortoise, newt, shrew,
dormouse, vole, slow-worm, salamander). Do not run on to a second collection
without a fresh instruction. The point of a pilot is that the instructions get
sharpened between collections.

### One species at a time — Joe's delivery rule

> make the available one at a time, so we can step in if its going wrong early
> on.

**Do not build a collection and then show it.** Each species becomes viewable as
soon as it exists: built, gated, committed, pushed, visible in the viewer, and
reported. Then the next one. Batching thirteen animals behind one review means
that if the method is wrong, twelve of them are waste — and it makes stepping in
expensive for Joe, which is the thing this rule exists to prevent.

**The first species of a collection is chosen to be informative, not easy.** It
must exercise as many banks as possible — hull, four legs, ears, a tail, the eye
cards, a snout — so that the first look actually answers whether the method
holds. Picking the simplest member to get something on screen quickly tells him
nothing and wastes the one review that matters most.

For Garden the first is the **hedgehog**, because it is the only member that
exercises **repeat-and-sink** (§3.1) — twelve copies of one shape, six a side,
buried in the torso. That is the newest and least-proven mechanism in the whole
method, and it is Joe's own idea, so it goes in front of him first. It also uses
the hull, four legs, the eye cards and a snout on the way.

The **squirrel is second**, and it carries the other half of the risk: a lifted
brush tail that arrives with its own node transform, and a belly boundary that
has to be painted into the texture rather than cut into geometry. It is also
*fox-adjacent* — a squirrel beside `animal-fox` is the hardest version of "does
it look like a guest", not the easiest.

Between them those two prove the method. The remaining eleven are variations.

### The viewer must never let him compare the wrong thing

Animals built under this method are labelled **distinctly and unmistakably** from
the scrapped kit builds, in the list and on the model. He has already been burned
by a stale page once and by a gallery listing props once. An unlabelled
side-by-side is worse than no side-by-side.

---

## 7. Measured bank inventory

*Filled in by the census pass. Numbers only; every one comes off the 24 real
files.*

> Pending — see the run that follows this document's creation.

---

## 8. Placement rules

*Derived from §7. Written down so an ear does not get placed by eye twice.*

> Pending.
