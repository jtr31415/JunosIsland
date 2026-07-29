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
4. **No PLACED NODE carries a transform** — 133 nodes carry three rotations and
   one scale between them. Parts are origin-centred and moved, not resized in
   place. *(Amended 29 July — see below. It read "placement by translation only",
   which forbade something Joe then asked for.)*
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

### Rule 4, amended 29 July: rotation is baked, never placed

Joe reviewed the first assembled animal and asked for two rotations in one note:

> ...and turn them backwards 180 degrees.

> ...and one set each rotated 45 deg and placed on the chamfer between sides and
> top, creating like a rounding effect.

Rule 4 as originally written — "placement by translation only" — forbids both.
That is the rule being wrong, not the request. The rule exists to stop a
*placed node* carrying a transform, because that is what the 133 transformed
nodes in the pack cost us and what makes a lifted part unpredictable to reuse.
It was never an argument against a part being shaped before it is placed.

**So the rule now reads: no placed node carries a transform. A rotation is baked
into the part COPY's vertices, exactly as mirroring already was.**

The two are the same mechanism and the same discipline:

- **Mirroring** negates x on the copy's vertices and on its normals, and flips
  the triangle winding, because a reflection reverses handedness. It is never
  `scale.x = -1`.
- **Rotation** (`Feature.spin` in `parts/assembly.ts`) turns the copy's vertices
  AND its normals about the part's own centre. **Turn the normals too** — a
  rotation is its own inverse-transpose, and a spun part lit by unspun normals is
  lit from the wrong side, which no bounding box notices. **Do not touch the
  winding**: a rotation preserves handedness, and re-flipping it turns the part
  inside out.
- `stretch` remains the one thing that is *not* corrected on the normals, because
  the spec says the pack's own normals are copied verbatim (rule 7) and Kenney's
  own stretched shells are shaded the same way.

After every one of these, `mesh.quaternion` is still identity and `mesh.scale` is
still (1,1,1). `tests/island/assembly-hedgehog.test.ts` asserts that over every
mesh, and separately asserts that at least one feature *is* spun — otherwise the
first assertion passes for the wrong reason.

### Which way a lifted part faces, and how a builder turns it

Every future use of a lifted shape hits this, so it is written down once.

**A part's default facing is its measured `attachment.axis` and `attachment.dir`,
and it means: the direction the part's mass runs, away from the surface it joins
to.** `cone-01` is `y +1`, so an unspun copy stands UP out of whatever it is
placed on. `cone-06` is `z +1`, so a copy points FORWARD. `box-01`, the leg, is
`y -1`, so it hangs DOWN. None of that is guessed; it is measured off every donor
in the pack and it is in the bank record.

That single fact decided the hedgehog. A row of twelve `wedge-13` (the hog's
tusk, `z +1`) lies flat pointing forwards; a row of twelve `cone-01` (`y +1`)
stands up. Same taper, same size, opposite animal.

**To turn one, spin it.** A spin rotates the copy's vertices, its normals and its
facing together, so `sink` still measures along the direction the part actually
points:

| Spin | Takes a `y +1` part to | Reads as |
|---|---|---|
| none | up | standing on the top |
| `{ axis: 'z', deg: -90 }` | `x +1` | sticking out of the right side |
| `{ axis: 'z', deg: -45 }` | halfway between | the chamfer idiom, below |
| `{ axis: 'y', deg: 180 }` | up, but back to front | a spine swept over the rump |

Spins compose in list order. Mirroring negates the x of the facing along with the
geometry, so the left side of a mirrored row is handled without a second spin.

### The escape clause, which matters as much as the rules

Joe, same conversation:

> if something cannot be built sensibly under those rules, build the best
> attempt and flag it, it may need bespoke instructions.

**So never block on a hard species.** Build the best attempt, flag it
unmistakably in the viewer, and say in writing which rule it strained and why.
A flagged approximation that Joe can see and rule on is worth more than a gap in
the collection or a silent violation.

### The clause has now been used, and this is what it looks like

Joe, 29 July, having reviewed the hedgehog:

> all good but the pink tongue as the nose. **create a bespoke sphere for that**

That is the escape clause completing its circuit for the first time: a part the
bank chose, shown to him, rejected by name, and a bespoke shape commissioned in
its place. **He is overruling rule 1, deliberately and for one part.**

Three things this establishes, all of them binding on the next commission:

1. **Authored geometry lives in `src/island/species/parts/authored.ts`, never in
   the bank.** §6's "the bank is generated, never hand-edited" holds unchanged,
   and an authored shape is **not searchable** — `findShapes` cannot return one,
   so no later builder can author its way past rule 1 without deciding to.
2. **The id is `bespoke-*` and the wearer's `flag` names it.** It shows up in
   `userData.part`, in any anatomy view and in the viewer. A `provenance` of
   length zero is exactly the set of shapes the pack did not give us, and it is
   checkable rather than claimed.
3. **Do not re-run the search that produced the rejected part.** It will produce
   it again. The rejected candidate and the reason are recorded in the species'
   own comment and pinned by a test, so the next builder does not helpfully
   "fix" it back.

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

   A name alone is not enough, and §3.2 is why.

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

## 3.2 The bank is searched by measured shape, not by name

Joe, extending the above:

> hog tusks might also double up as hedgehog spikes. might be an idea to
> classify the basic shape of a primitive so an agent can try to use it for a
> different purpose than originally drawn up for.

**The naming discipline in §3.1 is necessary and not sufficient.** A good name
still has to be *guessed*. What makes the multiplier actually work is that an
agent building a hedgehog can ask the bank *"what in here is a small tapering
spike?"* and get back the hog's tusk **and** the hog's ear without knowing either
name. Every reuse that depends on somebody having the idea by hand does not
scale to 296 species.

So each bank record carries a **`shape` block, derived from the geometry, never
assigned by opinion**, alongside — never instead of — its provenance. The axes:

| Axis | What it separates |
|---|---|
| **form** | spike/cone, wedge, plate/fin, blade, tube, box, dome — from vertex distribution and how the cross-section changes along the long axis |
| **aspect** | bounding-box proportions, normalised. A spike and a plate are one family at different ratios |
| **taper** | whether and how sharply the cross-section shrinks along the axis. This is what separates a tusk from a peg |
| **symmetry** | mirror-symmetric, radial, or handed. A left ear is not a right ear, and a search must never return one for the other |
| **attachment** | which face or region it was joined to, and whether it still reads when sunk. This is what makes repeat-and-sink safe rather than a gamble |
| **size** | absolute model units. The pack is authored at one consistent scale and absolute size is already known to matter (rule 5, the eye card) |

**The acceptance test for the classification** is a query, not a taxonomy: *small
tapering spikes, many, sunk* must return the hog tusk and the hog ear as
candidates. If it cannot answer that, it is the wrong classification.

**Do not gold-plate this.** Classify what a collection actually needs, find out
whether the axes are right, and only then apply them to the other 182 parts. An
axis that turns out constant across the pack, or that never discriminates
between two parts an agent would confuse, is **deleted and the deletion is
recorded** — which axes earned their place is itself a deliverable, because it
is how the remaining 19 collections get classified.

### A shape's IDENTITY is not one of its measurements

The hedgehog's nose is what taught this and it cost a review round.

`wedge-10` was returned by a size query and was right on **every axis the
classification has**: smallest solid nose-tip in the pack, taper 0.707, mirror-
symmetric, attaching `z +1`, and already the correct pink measured off its own
texels. Its provenance even calls it `nose-tip`, in the dog and the monkey.
Joe's verdict was *"the pink tongue as the nose"*.

**§3.1 is true and it is not the whole truth.** A part's identity does come from
its placement, and that is the multiplier — but some shapes carry a read that
survives being moved. A tongue, a beak, a horn, a claw, an eye. Repurposing
those is where §3.1 stops paying and starts costing, and **no measured axis will
ever catch it**, because the confusion is semantic and the axes are geometric.

**What to do about it, and what not to.** Not a new `shape` axis: §3.2 above is
explicit that the block is derived and never assigned by opinion, and a "reads
as" caveat is opinion by construction. The cheap version is a small hand-kept
list *beside* the generated bank naming the few shapes with a travelling
identity, surfaced as a **caveat on a result and never a filter on it** — a
filter would throw the multiplier away exactly as `form` did. It is scheduled
work, not margin work; **the note in `query.ts` is the record until it is done.**
Until then, the practical rule is the cheap one: **look at what the query
returned before placing it, and if it has a name in `provenance`, ask whether
that name is a job or a thing.**

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

### Way 2, now that the squirrel has actually used it

Both ways are on the squirrel on purpose, so the difference is visible on one
animal: its ear is split at Kenney's own edges (way 1, the cat's inner ear) and
its belly is painted (way 2).

**The correction that matters: a painted part must read ACROSS its cell.** It
was written here and in `texture.ts` that painting inside a cell needed no UV
change. That is wrong. If every corner of every triangle reads the same point,
nothing painted around that point can be seen. So a patched part maps **one v
per vertex** from that vertex's own height, and the boundary lives in the image
at whichever row the two colours meet. `Paint.patch` in `parts/assembly.ts`.

Three things follow, and they are the argument for way 2 over way 1:

- **The line is exact.** `v` is affine in position and barycentric interpolation
  of an affine function is exact, so the boundary is a **plane**, dead level
  across every face and chamfer whatever the tessellation. Kenney's boundary has
  to follow triangle edges, and the tiger's own belly line wanders 0.067 of its
  hull height as a result (§7).
- **It costs no geometry.** The squirrel's hull is the *same* 32 vertices and 60
  triangles as the hedgehog's; one of them has a two-tone coat. A vertex splits
  only if it lands exactly on the seam.
- **`SLOT_PX` is 16 because the pack is authored on a 1/16 grid.** Sixteen rows
  per cell puts every boundary a builder can ask for on one of Kenney's own grid
  lines. `assemblyTexture` **throws** on an `at` that falls between two — a
  boundary you cannot name in the pack's units is one nobody can check.

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

*Every number below comes off the 24 real `.glb` files. Instances are not
shapes.* **315 instances → 129 distinct shapes.**

| Role | Instances | Distinct | Baked | Size range (x / y / z) | Donors |
|---|---|---|---|---|---|
| hull | 24 | **10** | yes | 1.250–1.539 / 0.451–1.505 / 1.125–1.350 | all 24 |
| leg | 86 | **1** | yes | 0.375 / 0.306 / 0.375 | 23 |
| ear | 42 | 23 | yes | 0.160–0.743 / 0.232–0.913 / 0.191–0.464 | 17 |
| tail | 8 | 7 | yes | 0.200–0.744 / 0.623–1.082 / 0.425–0.910 | 8 |
| wing | 10 | 6 | no | 0.362–0.693 / 0.200–0.450 / 0.362–0.600 | 5 |
| eye | 48 | 10 | yes | 0.330–0.435 / 0.276–0.443 / **0.000** | all 24 |
| nose | 36 | 28 | yes | 0.080–1.000 / 0.080–1.000 / 0.000–0.287 | 19 |
| horn | 19 | 15 | no | 0.237–1.350 / 0.189–0.701 / 0.153–0.713 | 9 |
| tooth | 8 | 8 | yes | 0.174–0.309 / 0.167–0.341 / 0.050–0.445 | 4 |
| claw | 10 | 10 | no | 0.249–0.732 / 0.137–0.743 / 0.113–0.551 | 4 |
| band | 5 | 5 | yes | 1.335–1.650 / 0.877–1.650 / 0.446–0.520 | 5 |
| card | 14 | 4 | yes | 0.000–0.237 / 0.100–0.400 / 0.000–0.433 | 10 |
| oddment | 5 | 5 | no | 0.246–1.250 / 0.089–1.250 / 0.000–1.250 | 5 |

**The eye card sits at z = 0.6350 with standard deviation 0.0000, n = 48.**
Confirmed: one distinct value across all 24 species.

### The torso question — Joe's reading holds, 8 of 9

| Hull | Verdict |
|---|---|
| cow + deer | **(a)** all 32 cube corners plus 62 more |
| fish | **(a)** cube + 8 |
| fox | **(a)** cube + 70 |
| monkey | **(a)** cube + 34 |
| panda | **(a)** cube + 6 |
| penguin | **(a)** cube + 10 |
| tiger | **(a)** cube + 98 |
| lion | **(a−)** the cube **minus** four corners — all 28 of its corners are cube corners |
| crab | **(c)** genuinely different — 1 of 32 corners, a flat 0.45-high shell |

**Colour-only variation is confirmed and already collapsed.** The **14** species
sharing the identical 1.250 cube point at six different palette column sets —
{5} {15} {13} {1} {1,13} {3}. Same geometry, different colour. Once we author
the texture (§4) that difference stops existing. *(Note: 14 of 24, not the 13
quoted in earlier documents.)*

So: **one torso primitive, one add-on bank, and exactly one genuine exception —
the crab.**

### Three things that only turned up by measuring

1. **Near-misses are rounding, not shape.** The left and right ears of the
   beaver, lion and panda differ by 2.98e-8 — one float32 ulp — while genuinely
   different pairs differ by 0.045, the 1/16 authoring grid. That six-order gap
   is why the dedup tolerance is a measurement rather than a taste. A hard-edged
   hash reported 91 shapes where there are 88, and three separate bugs each
   inflated the count while looking like a real finding.
2. **Three of the 86 legs have 46 triangles, not 44**, over the *identical* 24
   welded points — the deer's and fox's back legs. "All 86 legs are one shape"
   is true only if triangulation is not shape. Recorded as `triVariants`.
3. **Cross-role dedup is a real multiplier.** The shared cube hull is also the
   crab's `Group` oddment, and the chick/monkey/penguin ear is bit-identical to
   the bunny's tooth. An ear that is already a tusk — §3.1 paying for itself
   before anyone tried to use it.

### Which classification axes earned their place

Measured, not guessed, and this decides how the other 19 collections get
classified:

- **taper, attachment/sink, and absolute size — keep.** These do the work.
- **symmetry — keep, narrowly.** It is what stops a left ear answering a
  right-ear query. Its only job is a correctness guard, and that job is real.
- **aspect — drop.** It never discriminated anything taper and size had not
  already separated.
- **`form` — keep as a LABEL, never as a query filter.** This is the important
  one. The hog's tusk classifies as a `wedge` (taper 0.59) and the hog's ear as
  a `cone` (taper 0.25) — the same job, on opposite sides of a bucket boundary.
  **Joe's own example only works with the form filter removed**, querying taper
  directly. Any search that filters on form throws away the multiplier §3.1
  exists to create.

### Where the pack puts a belly line, measured

Three of the ten hulls carry a pale underside, and the boundary is a **zone**
rather than a line every time, because a split-triangle boundary can only follow
edges the model already has:

| Hull | Donor | Pale reaches | Dark starts | Zone |
|---|---|---|---|---|
| `box-21` | fox | 0.208 | — | a low chest patch, 6 triangles |
| `box-41` | tiger | **0.548** | **0.481** | **0.067** |
| `box-39` | penguin | 0.841 | — | the white front, up to the chin |

*(Fractions of the hull's own height.)*

**The tiger's is the mammal case** — a pale belly running the length of the body
— and it is the one to carry over to any species that wants one. **The only
point on the pack's 1/16 grid inside its zone is 8/16**, which is also the
hull's own equator. So a painted belly line at `at: 0.5` is the tiger's own
boundary made exact, and that is where the squirrel's is.

### The seven tails split on THICKNESS, not on length

Measured, because a query for a big tail returns a whip otherwise:

- **Thin — 0.200 to 0.345**: cat/monkey `wedge-07`, tiger `wedge-18`, lion
  `wedge-15`, elephant `box-18`.
- **Thick — 0.589 to 0.744**: beaver `wedge-03`, parrot `box-38`, fox `box-23`.

A 1.7x gap with nothing in it. On `longest` the fox's brush (0.910) and the
tiger's whip (1.047) are neighbours, and on `taper` the brush (0.961) and the
parrot's fan (0.839) are 0.12 apart — so **neither existing axis separates a
plume from a whip and `minThinnest` was added to `ShapeQuery` for it.** It is
the SIZE axis §3.2 kept (absolute model units), not the `aspect` axis it
deleted (normalised proportion). `BRUSH_QUERY` in `query.ts` is the query.

Among the three thick ones the fox's `box-23` is the plume: it barely narrows
(taper 0.961), its section is **round** — y and z both 0.910248 — and it is
1.67x the volume of either other.

### Two-tone is exact, not a vote

**Zero of 15,333 triangles have corners in two different swatch columns.** Every
triangle points at exactly one colour. (8,636 do span two or three swatch
*rows*, so the **column is the honest unit**, not the cell.) This is why the
per-triangle `bands` field can be trusted to split a lifted part cleanly into
texture regions rather than approximating one.

### Known debt

The baked bank is **496.8 KB**, over the 400 KB budget, of which 360 KB is
positions and normals. It covers the Garden roles plus `tooth`; baking all roles
was 763.8 KB. Further reduction needs a codec — and since the pack is authored
on a 1/16 grid, quantising to integers is the obvious one and was deliberately
not invented on the fly. **Nothing built here is wired to a child yet**, so this
is not shipping weight today, but it must be paid before it is.

Fins and true insect wings **are censused as distinct shapes** (fish, bee) and
are simply not baked, because `wing` is outside the Garden set. One line adds
them. See §3.1(3).

---

## 8. Placement rules

*Derived from §7, written down so an ear is never placed by eye twice. All
figures are a fraction of the hull's bounding box, mean ± sd.*

**The pack is perfectly bilateral: every kind sits at x = 0.500.**

**Derivable — place these by rule, with confidence:**

- **nose** — x sd 0.033, z = 1.080 ± 0.074
- **eye** — z = 1.008 ± 0.028, and the absolute z = 0.6350 with sd 0.0000
- **band** — x sd 0.000

**Not derivable — these are placed by hand, per species:**

- **ear** — x sd 0.283. Note *why*: left and right average out, so the spread is
  an artefact of the summary, not of the pack. Place ears per side.
- **wing** — x sd 0.571
- **claw** — x sd 0.528

### Sink depth, as a fraction of the part's own extent

This is a **dial, not a floor** (§3.1). Measured range across the pack:

| Part | Sunk |
|---|---|
| eye | **exactly 0.000** — eye cards sit *on* the face, never in it |
| leg | 0.00 – 0.41 (y) |
| tooth | 0.00 – 0.87 |
| horn | 0.00 – 0.93 |
| **ear** | **0.00 – 1.00, mean 0.548** |
| band | 0.91 – 1.00 |

The ear range going to a full 1.00 is what makes Joe's six-a-side spikes a
placement rather than a hack: the pack already buries a part completely.

**The one placement that is never adjusted is the eye.** Absolute z, absolute
size, zero sink. Rule 5 and the measurement agree, from opposite directions.

### THE DONOR TRANSFER — how to place a part without choosing a number

This is the idiom that placed almost everything on the squirrel, and it turns
"not derivable" (the ear, the muzzle) into "derivable, per part":

> **If a shape's donor wears it on `box-03`, join the copy at the face the donor
> joined it to and sink it by the donor's own `sunkFraction`. The part's centre
> then lands on the bank's recorded `offset` for that shape — and if it does,
> that agreement is the EVIDENCE the transfer is legitimate.**

It is a recovery, not a copy, and that is the whole value: you solve for the
join point and check the answer against a number you did not use.

- **Ear, `wedge-06`** (cat, the only donor): joined at the cube's top face
  y = 1.43125, sunk its own 0.573575 → centre at **1.431251 − shift = 1.404572**
  against the recorded 1.404599. One part in a million.
- **Muzzle, `tube-01`** (beaver, the only donor): joined at the front face
  z = 0.625, sunk its own 0.000 → centre at the beaver's own z = 0.710803.
- **Eye card, `plate-01`**: no solve needed. Sixteen species donate it and the
  bank records one point — x 0.2625, **y 0.933646**, z 0.6350. Use it.

**`box-03`'s recorded `offset` is the BEAVER's hull centre**, because the beaver
is that shape's first donor and the bank records the first donor's placement. It
is `[0, 0.80625, 0]`, which is exactly where the solve puts our hull — so any
beaver part transfers with certainty rather than by argument. For a donor that is
not the beaver the transfer is an inference, and the recovered-offset agreement
above is how you check it rather than assume it.

### The chamfer idiom is per EDGE, not just the top ones

§8's idiom was written for the +x/+y edges (the hedgehog's spikes). It is the
same cube and it works on any of the twelve. The squirrel's tail uses the
**+y/−z** edge: chamfer running (y 0.625, z −0.3125) to (y 0.3125, z −0.625),
midpoint **(0.46875, −0.46875)** off the hull centre — the same 0.46875 — and
outward normal (0, 0.7071, −0.7071). A `z −1` part reaches that normal with
`{ axis: 'x', deg: 45 }`.

That single placement is what makes a squirrel out of the fox's own tail: the
same shape, joined to the back of the same cube, **carried up instead of
trailing**. It is also cheaper front-to-back — the squirrel's keep-out is 0.92
against the fox's own 1.15, which matters because `pets.ts:652` charges keep-out
from `max(width, depth) / 2`.

### THE CHAMFER IDIOM — a named placement, and Joe's idea

> spikes not 3 rows of 4 on each side, but one row of 4, on each the top and the
> both sides (middle) and one set each rotated 45 deg and placed on the chamfer
> between sides and top, creating like a rounding effect.
>
> — Joe, 29 July, on the hedgehog

**The idiom: to make a cubic body read as ROUND, put a row of parts on each flat
face and another row on the chamfer between them, turned to face along the
chamfer's own normal.** The rows' facings then step evenly around the body, and
the silhouette follows an arc instead of three flat planes.

This is how you get a curved read out of a cubic pack **without authoring a
curved shape**, which is rule 1 and the §0 ruling both. It costs nothing but
placement.

It generalises to anything spiny, ridged or frilled: hedgehog quills, dragon and
crocodile back ridges, scutes, a fish's dorsal run, a lizard's crest. Any species
whose whole silhouette question is "does the back read as a curve".

**How to apply it, in four steps:**

1. **Measure the hull's real chamfer. It is not where it looks.** `box-03` cuts
   every edge AND every corner: its 32 welded points are the permutations of
   (±0.625, ±0.3125, ±0.3125) and (±0.5, ±0.5, ±0.5). Each flat face is
   therefore only **0.625 square**, and the edge chamfer between the +x and +y
   faces runs from (0.625, 0.3125) to (0.3125, 0.625) — midpoint
   **(0.46875, 0.46875)**, not the (0.5625, 0.5625) you get by assuming a
   1.000-wide face. Assuming it once put a whole row 0.09 out.
2. **Join on the chamfer plane's midpoint**, and spin the part so its facing is
   that plane's outward normal — 45° for an edge chamfer, which is
   `{ axis: 'z', deg: -45 }` for a `y +1` part on a +x/+y edge.
3. **Use the same stations along the row on every row.** Same shape, same depth,
   same positions — only the facing differs. That is what makes N rows read as
   one shell rather than as N rows.
4. **Check the outer stations are still embedded.** The flat face ends and the
   chamfer falls away 1:1, so a part buried `d` below the nominal plane leaves
   the hull once its station passes `halfFace + d`. On `box-03` with d = 0.125
   that is |z| ≤ 0.4375, which is what caps the hedgehog's row at ±0.375. §3's
   "nothing floats" is the binding constraint, not taste.

**The acceptance test is Joe's stated intent, not the arithmetic:** the back must
read as curved rather than as three flat faces. Expressed as a measurement, the
distinct facings of the rows must step evenly through a half turn — the
hedgehog's five are −90°, −45°, 0°, +45°, +90°, and `assembly-hedgehog.test.ts`
asserts exactly that set.

**Note, do not chase:** this is very close to the "frill" §3.1(3) says we were
missing. A row of parts stepped around a chamfer at 45° is most of what a frill
is, so the frill is probably a placement rather than a shape — one more of the
four headline gaps closing. It is recorded here and left alone; §3.1 is explicit
that the impossible list gets re-derived deliberately, not during a build.

---

## 9. How another surface enumerates new-method species

*Written 29 July for the manager consolidating the workbench's four review
surfaces into one. It is a contract for another team, not prose. Everything here
describes what EXISTS today; nothing is a plan.*

### 9.1 The enumeration API

`src/island/species/parts/index.ts`. Two functions, and nothing else is needed.

```ts
interface AssembledSpecies {
  id: string            // 'animal-hedgehog'
  name: string          // from the roster. Never minted here.
  collection: string    // from the roster. Never minted here.
  flag?: string         // §2's escape clause, in Joe's direction, one sentence
  hullStretchWhy?: string // present ONLY when this species' hull is stretched
}

function assembledSpecies(): AssembledSpecies[]
function buildAssembled(id: string): THREE.Group
```

`name` and `collection` are **read off the existing roster** (`SPECIES_NAMES` and
`SPECIES_COLLECTION` in `src/island/species/roster.ts`) and are never regenerated
— §0 of this document. A review surface **displays** them; it does not mint them.
The same goes for the fact rows in `joe/species-facts.json`.

`buildAssembled` returns a grounded `THREE.Group` — feet on y = 0, model units,
no fit-to-height. Its `userData` carries:

```ts
{ kit: 'assembly', slots: string[], flag?: string, texture: string,
  hullStretch: [number, number, number], hullStretchWhy?: string }
```

Every mesh inside carries `userData.part` (the bank id it came from),
`role`, `sink`, `facing`, `spin`, `mirror` and `joinedAt` — enough to label a
part in an anatomy view without re-deriving anything.

### 9.2 The marker, and the trap in it

> **`assembly !== undefined` means new method. `build !== undefined` means a
> scrapped kit build. A record may carry BOTH, and the hedgehog does right now,
> deliberately.**

`Species.build` was kept alongside `Species.assembly` on purpose (§6, and
`src/island/species/types.ts:395-409`) so the old build stayed visible for
comparison until Joe rules on JT-034.

**So: a surface that filters "remove everything with a `build` field" will remove
the hedgehog too.** It must key off the PRESENCE of `assembly`, never off the
ABSENCE of `build`. This is the single mistake most likely to be made, and it
unsurfaces exactly the animals the new method just produced.

```ts
const newMethod = SPECIES.filter(s => s.assembly !== undefined)   // correct
const newMethod = SPECIES.filter(s => s.build === undefined)      // WRONG — empty
```

**Would an explicit `method` discriminant be cleaner now that the old builds are
being unsurfaced anyway? Yes.** A single `method: 'assembly' | 'kit'` field would
make the question unmissable and would survive `build` eventually being deleted.
It is **not** being changed here, because another manager is building against
what exists today and a field-shape change under a live consumer is how a review
surface goes dark. Raise it as a card; do not do it in flight.

### 9.3 What a fresh surface would otherwise reverse-engineer

- **`assembledSpecies()` throws on a malformed record rather than skipping it** —
  a species id that is not in the roster is a hard error, by design, the same
  guard `define.ts` puts on an invented species. **A caller at boot should wrap
  it**, or one bad animal takes the whole page down.
- **`buildAssembled` throws by name** for an id with no build, rather than
  returning `null`.
- **Textures are cached and DETACHED, never disposed** (§4, brief §19). Do not
  call `dispose()` on an assembled pet's material or map. `detachAssemblyTextures()`
  drops the cache's references and is the only supported teardown. A three.js
  `clone()` shares the material, so a preview that disposes breaks every other
  copy on screen.
- **One material and one texture per palette**, shared by every mesh in the
  group. Two species with the same palette in the same order get the *same*
  texture object — that is the cache key, deliberately.
- **`flag` is meant to be shown, not logged.** It is §2's escape clause made
  visible: it says which rule the build strained and why, in one sentence aimed
  at Joe. An animal with a flag is one he is being asked to rule on. The
  hedgehog's currently says its spines are `cone-01` rather than the hog's ear,
  and that twenty spikes puts it over the pack's triangle envelope.
- **`hullStretchWhy` is the same channel for one specific thing** — a hull that
  has left its authored proportions. Show it beside the flag. It exists because
  the hedgehog shipped with the shared 1.250 cube quietly stretched and Joe's
  first note back was *"body cubic, its currently too wide"*.
- **New-method animals must be labelled distinctly and unmistakably** from the
  scrapped kit builds, in the list and on the model (§6). He has been burned by a
  stale page once and by a gallery listing props once.
- **Nothing here is async.** No `GLTFLoader`, no fetch, no await — the bank is a
  module and the build is synchronous. That is the whole reason the bank exists.
