/**
 * The hedgehog's assembly, as a DEFINITION. Garden's first animal built the new
 * way, and the first converted to the declarative builder.
 *
 * ONE SPECIES, ONE FILE. No three.js is reachable from a collection through this
 * file beyond the palette constant, and — the reason for the split — every
 * measured number in the record below carries the reasoning that produced it. A
 * comment lost in a merge is a reason lost with no trace that it was ever there,
 * so no two species share a file. Adding a species is a new file beside this one
 * and one line in `index.ts`; `register.ts` says why that one line is enough.
 *
 * ## Converted to `defineCreature`, 29 July — and it is the same animal
 *
 * This was 130 lines of hand-typed `AssemblyBuild` and it is now the definition
 * below. **The built geometry is byte-identical**: same meshes, same vertices,
 * same normals, same UVs, same indices, same node translations, same fingerprint
 * — pinned in `tests/island/assembly-fingerprint.test.ts`. Nothing was tuned to
 * make that true; the builder derives the numbers the hand-written record had
 * written out.
 *
 * **What the builder now supplies, that used to be typed here:**
 *
 *   - the hull (`box-03` at its own recorded offset `[0, 0.80625, 0]`),
 *   - the four legs (`box-01`, sunk 0.408163, on the row at y = 0.18125 that
 *     never moves whatever hull a species picks),
 *   - the eye pair's x and z, and the pupil,
 *   - the snout's join point, by the donor transfer,
 *   - and **all five spike rows, from `ridge` and `count: 4`** — the positions,
 *     the two extra spins, the mirroring and the span.
 *
 * Everything below is therefore what makes a hedgehog a hedgehog, and the
 * derivations are kept because they are the evidence the numbers are the pack's.
 *
 * ## Revised 29 July against Joe's review of the first build
 *
 * Three notes, applied in one pass. His words:
 *
 *   1. 16:53 — *"nose higher, body cubic, its currently too wide. spikes 3 rows
 *      of 4 on each the top and the sides and turn them backwards 180 degrees."*
 *   2. 16:56, superseding the spike LAYOUT only — *"spikes not 3 rows of 4 on
 *      each side, but one row of 4, on each the top and the both sides (middle)
 *      and one set each rotated 45 deg and placed on the chamfer between sides
 *      and top, creating like a rounding effect. all else from previous comment
 *      sustained."*
 *   3. 16:57 — *"add a pink pointy element to the nose. small sphere will do"*
 *
 * ## Every number, and where it came from
 *
 * The pack is the source of all of them. Nothing is eyeballed.
 *
 *   - **The hull is `box-03`, and it is now the authored cube.** No `stretch`,
 *     and the definition does not even mention it, because the cube is the
 *     builder's default. It shipped stretched to 1.350 x 1.150 x 1.250 and Joe's
 *     note is the whole argument against it: the shape 14 of the 24 share,
 *     changed. The stretch was defended at length in a comment, which is not
 *     where he reviews. The general fault behind it is fixed at source rather
 *     than here — `Hull.stretch` requires a `stretchWhy` beside it, so the next
 *     species cannot depart from an authored proportion quietly.
 *
 *   - **The hull centre is y = 0.80625**, and it is now DERIVED rather than
 *     typed: the builder puts a hull at the bank's own recorded offset for its
 *     shape. The solve behind that number is still worth keeping. The pack's leg
 *     (`box-01`) is 0.30625 tall and its measured `sunkFractionMax` is 0.408163,
 *     so a leg joined at a hull bottom `B` has its foot at
 *     `B - 0.30625 x (1 - 0.408163)` = `B - 0.18125`. Feet on zero therefore
 *     wants `B = 0.18125`, and a 1.250 cube sitting on that has its centre at
 *     0.80625 — **exactly where the pack itself puts `box-03`**. The legs then
 *     arrive at y = 0.153125, to six decimal places the pack's own leg offset,
 *     without that having been aimed at.
 *
 *   - **Twenty spikes, five rows of four, and now two lines.** Joe's second note.
 *     `cone-01`, sunk 0.312222 — the part's own measured burial, the only value
 *     the pack ever gave it, and now the builder's default for the shape — which
 *     buries exactly 0.125 of it on every row and leaves 0.275 standing. 0.125 is
 *     also §3's floor: "every eared species embeds its ear into the hull by at
 *     least 0.125".
 *
 *     The five rows are the three face middles and the two chamfers between them,
 *     so their facings are **0, +/-45 and +/-90 degrees around the body** — five
 *     equal 45-degree steps through a half turn. That is not arithmetic dressed
 *     up; it is why the chamfer rows do what Joe says they should. His stated
 *     intent is that the back read as CURVED rather than as three flat faces, and
 *     evenly stepping the facing is the thing that delivers it. `ridge` in
 *     `creature.ts` is that idiom, and the three rows it emits sit at:
 *
 *       * top     x = 0,          y = 1.43125 (the cube's top face)
 *       * chamfer x = +/-0.46875, y = 1.27500 (the edge chamfer's midpoint)
 *       * side    x = +/-0.625,   y = 0.80625 (the side face, at its middle)
 *
 *     **`box-03`'s chamfer is measured, and it is not where it looks.** Its 32
 *     welded points are the 24 permutations of (+/-0.625, +/-0.3125, +/-0.3125)
 *     plus the 8 of (+/-0.5, +/-0.5, +/-0.5). So every edge AND every corner is
 *     cut (rule 2), each flat face is only 0.625 square, and the edge chamfer
 *     between the +x and +y faces is the quad from (0.625, 0.3125) to
 *     (0.3125, 0.625). Its midpoint is **(0.46875, 0.46875)** — not the
 *     (0.5625, 0.5625) you get by assuming a 1.000-wide face — and its outward
 *     normal is (0.7071, 0.7071, 0), which is precisely the facing a 45-degree
 *     spin produces. The builder measures this off the hull's own vertices, so a
 *     species on a different hull gets that hull's chamfer without transcribing
 *     it.
 *
 *   - **Four to a row, and z = +/-0.375, +/-0.125 is the widest they can go —
 *     now solved rather than stated.** Each flat face runs z in [-0.3125,
 *     +0.3125] and then falls away 1:1 along the edge chamfer. A spike joined at
 *     the nominal plane and buried 0.125 has its base 0.125 below that plane, so
 *     it stays embedded while its station satisfies |z| <= 0.3125 + 0.125 =
 *     0.4375, and §3's "nothing floats" is what sets that bound. Inside it the
 *     builder snaps the SPACING down to the pack's own 1/16 grid — 4/16 — which
 *     puts the four stations at +/-0.375 and +/-0.125, exactly the hand-built
 *     animal's. Spacing 0.250 against the spike's own 0.329 depth means
 *     neighbours overlap by a quarter and a row reads as one serrated ridge. The
 *     same four z stations on all five rows is what makes the twenty read as one
 *     shell rather than five separate rows. A `span` that left the hull is now a
 *     throw naming the bound, not a thing to notice in a screenshot.
 *
 *   - **Turned 180 degrees backwards** (`spin: [{ axis: 'y', deg: 180 }]`, first
 *     in every row's list, which is what `ridge.spin` means). `cone-01` leans
 *     FORWARD: measured, its tip sits at z = +0.0628 and its base at z = -0.0086,
 *     and its mass runs from z = +0.164 high to z = -0.164 low. A half turn about
 *     y sends that lean back over the rump, which is which way a hedgehog's
 *     spines go and what Joe asked for. The rotation is baked into the copy's
 *     vertices and normals — **no placed node carries it** — exactly as mirroring
 *     already was. Rule 4 has been amended to say so, because as written it
 *     forbade what he asked for.
 *
 *   - **The top row lands on the pack's own number.** Join at the cube's top
 *     y = 1.43125, plus 0.200178 - 0.125, puts the spike's centre at y = 1.506428
 *     — which is `cone-01`'s recorded offset in the bee, to six decimal places.
 *     The bee wears this shape on this cube at this depth. Nothing was aimed at
 *     that either; it is what "derive it, don't choose it" buys.
 *
 *   - **WHY `cone-01` AND NOT THE HOG'S EAR.** Unchanged, and still the §3.2
 *     acceptance test passing: `SPIKE_QUERY` returns the hog's ear and the hog's
 *     tusk without naming a species, and the measurements chose against both.
 *     `wedge-13` (tusk) has its LONGEST axis in z, so a row of them lies flat.
 *     `cone-04` (hog ear) is 62 triangles to `cone-01`'s 34 — at twenty copies
 *     that is 1,240 triangles against 680. `cone-01` tapers to a true point
 *     (taper 0.000 against the ear's 0.249), stands 0.400 tall, and is thin in x
 *     (0.160) and deep in z (0.329) so it reads as a quill from the side and
 *     disappears from the front. It is also the BEE's antenna and the
 *     caterpillar's: filed as an ear, used as a spine.
 *
 *   - **Eyes are `plate-01`, placed as a `pair`,** and the definition gives only
 *     the height and the sclera slot, because everything else about an eye is
 *     rule 5 and the builder will not let a species say it: z is `EYE_CARD_Z`
 *     always, sink is 0, and there is no `stretch` field to reach for. The
 *     mirror IS `plate-02`, so the bank's two eye records collapse to one
 *     authored shape (rule 6). **y = 0.95 is this animal's own** — the card's own
 *     recorded 0.933646 is the builder's default and the hedgehog sits its eyes
 *     0.016 higher, above a snout that comes to a point.
 *
 *   - **The nose is higher, and the height is the parrot's own — and now it is
 *     not typed at all.** The snout is `cone-06`, the parrot's beak, and **the
 *     parrot's hull is `box-03` at the same centre**, so the part arrives with a
 *     placement that transfers exactly. §8's donor transfer is the builder's
 *     default: join at THIS hull's front face, z = 0.625, and take the height the
 *     join does not move from the bank's recorded offset — y = 0.718036, which is
 *     measured off the file as where the parrot joins its own beak. §8 gives the
 *     nose's z as 1.080 +/- 0.074 of the hull bbox and this sits at 1.032, inside
 *     it. §8 gives no derivable y, which is exactly why it comes from the one
 *     donor that wears this exact part on this exact hull.
 *
 *   - **THE NOSE TIP — READ THIS FIRST, THE REST OF THIS BULLET IS HISTORY.** On
 *     **2 August** Joe changed this nose himself, in the editor, and pushed it
 *     into the game (`382e9a9`, the first animal ever to make that trip). The tip
 *     is now **`box-09`, the bunny's own nose** from the pack, at `[0, 0.775,
 *     0.7625]`, painted from a slot of its own that is byte-identical to `coat`.
 *     Both halves of that were confirmed by him in his own words — *"yes, i
 *     changed the nose to something more fitting"* and, on the colour, *"yes i
 *     have used the same colour."* **So there is no authored geometry on this
 *     animal at all, and rule 1 needs no exception here.**
 *
 *     Everything below in this bullet describes the animal from 29 July to 2
 *     August. It is kept because it is the reason the hedgehog looked as it did
 *     and because a ruling of Joe's is not deleted quietly — but it is
 *     SUPERSEDED, by him, and it is not a description of the code beneath it.
 *     `box-09` costs 23 triangles and 16 welded vertices against the sphere's 48
 *     and 26, which is where 25 triangles of the creature's count went.
 *
 *   - **The nose tip WAS AUTHORED, and it was the first thing this method ever
 *     authored.** *(Superseded 2 August — see above.)* Joe first asked for "a pink pointy element to the nose. small
 *     sphere will do", and the bank answered: `findShapes({ maxLongest: 0.22 })`
 *     — a size window, no name, no role, no form — returned ten shapes, of which
 *     `wedge-10` is the dog's and monkey's **nose-tip**, 0.120 x 0.108 x 0.164,
 *     taper 0.707, mirror-symmetric, attaching z +1 as a nose tip must, and the
 *     smallest solid nose-tip in the pack. It was even already the right pink:
 *     `#e792bd`, its own texels sampled off `colormap.png` and averaged by
 *     triangle area.
 *
 *     **Every measurement said yes and the thing reads as a tongue.** Joe, 18:08:
 *     *"all good but the pink tongue as the nose. create a bespoke sphere for
 *     that."* That is him overruling rule 1 for one part having seen the
 *     alternative, and it is the first deliberate use of §2's escape clause in
 *     the direction the clause exists for — a flagged shape becoming a
 *     commission. Searching the bank again would return `wedge-10` again, so it
 *     was not searched again.
 *
 *     So the tip is `bespoke-sphere-01`: a 0.125 sphere, 48 triangles over 26
 *     vertices, GENERATED in `authored.ts` rather than typed, and deliberately
 *     NOT in `PARTS_BANK` — nothing can find it by search and no other species
 *     can reach it by accident. **`defineCreature` now refuses a `bespoke-*` part
 *     outright unless the species' own `flag` names RULE 1**, so the escape
 *     clause cannot be used quietly. The diameter is 2/16 on the pack's own
 *     authoring grid and sits just under the pack's own small nose-tip family
 *     (the bunny's and cat's 0.1368, the dog's and fox's 0.1505). The pink is
 *     unchanged and still measured, still a texture slot and never a material
 *     tint (rule 8).
 *
 *     It sits with its **centre on the snout's own apex** — `cone-06`'s
 *     front-most point, local (0, +0.1122, +0.1434), world (0, 0.830236,
 *     0.808311) — at `sink: 0.5`, which for a sphere is the one placement that
 *     needs no number: exactly half of it stands proud. The `at` is written out
 *     because it is the snout's true APEX, a single vertex; `on: 'snout'` would
 *     anchor on the snout's front PLANE, which is 0.00002 nearer and not the same
 *     point.
 *
 *     **The lesson is bigger than the hedgehog.** The search matched on SHAPE and
 *     returned a part whose IDENTITY was wrong, with size, taper, symmetry,
 *     attachment and even colour all correct at once. No measured axis separates
 *     a nose from a tongue, and adding one is not a measurement problem — see
 *     the note in `query.ts`.
 *
 *   - **The pupil is `PACK_PUPIL`, and it is the fault Joe caught.** It was
 *     `0x000000`, a number nobody measured. It is now `#4c4f5e`, the area-
 *     weighted mean of 544 real eye-card texels across all 24 species. The full
 *     working is in `texture.ts` beside the constant — because it corrects every
 *     animal built by this method, not this one. **`defineCreature` now supplies
 *     it when a definition does not, and throws when a definition contradicts
 *     it**, which is the shape that fix should have had the first time.
 *
 *   - **The rest of the palette is the four colours already on the hedgehog's
 *     record** in `collections/garden.ts` — "Buff face, dark spines" — plus the
 *     measured pupil and the measured nose pink. Nothing here is a new colour.
 *
 *     **`nose: 0xe792bd` IS NOW ORPHANED and is retained on purpose.** Nothing
 *     paints it since 2 August; the slot it served went with the sphere. It costs
 *     one atlas row. It is left in place because REMOVING A SLOT IS NOT A FREE
 *     EDIT — insertion order IS the atlas layout (`assembly.ts:504` takes
 *     `Object.keys(spec.palette)`, `texture.ts:167` puts slot `i` of `n` at
 *     `(i + 0.5) / n`), so dropping `nose` moves every UV on the animal. Measured
 *     for THIS species: no rendered colour would change, because the name-to-row
 *     map is rebuilt from this same object in the same call that bakes the
 *     texture (`assembly.ts:361`), so it is safe here — but it is Joe's slot and
 *     his call whether it goes.
 *
 * Result: 1.707 tall, feet on zero, inside the pack's measured 1.43-2.02.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

export const HEDGEHOG_ASSEMBLY = defineCreature('animal-hedgehog', {
  palette: {
    coat: 0xb2946c,
    spine: 0x53412c,
    limb: 0x6b533a,
    eye: 0xf4e6cc,
    pupil: PACK_PUPIL,  // the pack's own measured pupil; see texture.ts
    nose: 0xe792bd,  // ORPHANED since 2 Aug and kept on purpose; see the prose above
    'box-09': 0xb2946c,
  },

  eyes: { y: 0.95, paint: 'eye' },
  snout: { part: 'cone-06', paint: { base: 'limb', byBand: { 15: 'spine' } } },
  ridge: { part: 'cone-01', paint: 'spine', count: 4, spin: [{ axis: 'y', deg: 180 }] },
  extras: [{ part: 'box-09', name: 'box-09', at: [0, 0.775, 0.7625], paint: 'box-09' }],
  flag: 'THE NOSE TIP IS box-09, THE BUNNY\'S OWN NOSE, and JOE PUT IT THERE — on 2 '
    + 'August, in the editor, and pushed it into the game. Asked whether the sphere '
    + 'that used to be here had gone by accident: "yes, i changed the nose to something '
    + 'more fitting." Asked whether the new colour was meant to be byte-identical to '
    + 'the coat: "yes i have used the same colour." So the nose is DELIBERATELY the '
    + 'same tan as the face. Do not repaint it pink and do not restore the sphere. '
    + 'Nothing on this animal is authored any more, and rule 1 needs no exception here. '
    + 'HISTORY, SUPERSEDED BY THE ABOVE — from 29 July to 2 August this tip WAS '
    + 'authored geometry, a bespoke 0.125 sphere, the only shape this method ever put '
    + 'on a shipped animal that the pack did not give us, because Joe overruled rule 1 '
    + 'for it having seen the bank\'s own answer. His words, 29 '
    + 'July: "all good but the pink tongue as the nose. create a bespoke sphere for '
    + 'that." The bank had returned wedge-10, the dog and monkey nose-tip, the right '
    + 'size and measurably the right pink — and it reads as a TONGUE, which no '
    + 'measurement catches. That ruling is why the animal looked as it did, and it was '
    + 'overturned by its own author, not by us. The sphere still exists in authored.ts '
    + 'and no species wears it. Spines are cone-01 — the bee and '
    + 'caterpillar antenna — not the hog ear. The query returns the hog ear and the hog '
    + 'tusk too; the measurements chose against both. cone-01 tapers to a true point, '
    + 'stands 0.400 tall and costs 34 triangles against the hog ear\'s 62. Joe\'s call to '
    + 'overturn. RULE 9 STRAINED: twenty spikes is 680 triangles, and the whole animal '
    + 'comes to 1,021 against the pack\'s measured 422-951. Rule 9\'s own budget is '
    + 'vertices and this is well inside it; no pack animal wears twenty protrusions, so '
    + 'the triangle envelope is the one Joe\'s count leaves.',
})
