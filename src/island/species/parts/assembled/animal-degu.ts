/**
 * The degu's assembly, as a definition. Home Pets' sixth rodent, and the one its
 * own collection record calls the hardest separation of the six.
 *
 * ONE SPECIES, ONE FILE. Adding a species is this file and one appended line in
 * `index.ts`; `register.ts` says why that one line is enough.
 *
 * ## What this animal has to do
 *
 * A degu is a Chilean caviomorph — nearer a chinchilla than a rat, and it looks
 * it. What a child names it by is a stocky chunky body, rounded ears, a blunt
 * face, a pale ring round each eye, a cool grey-brown coat over a cream belly,
 * and a tail that ends in a black brush. It is the least famous animal on the
 * page, so it has to read as ITSELF and not as "another rodent".
 *
 * `home-pets.ts` sets the problem in its own header: six small brown-ish rodents
 * on one album page, and *"making them different colours to tell them apart
 * would be a lie a child can check against a picture book"*, so the separation is
 * carried by SHAPE. Five siblings hold five axes — the hamster's stub tail, the
 * guinea pig's absence of one, the rat's long bare one, the chinchilla's enormous
 * ears, the gerbil's slim tail with a dark tip — and this animal gets what is
 * left, which is proportion.
 *
 * ## THE MEASURED AXIS THAT SEPARATES THIS ANIMAL FROM THE GERBIL
 *
 * Written out because the gerbil is being built in parallel and is also a
 * tufted-tailed sandy rodent. Two numbers, both off the bank:
 *
 *   1. **HULL WIDTH: 1.539484 against the cube's 1.250.** `box-12` is the widest
 *      shell the pack drew — the other nine measure 1.250 (six of them), 1.3330
 *      (the crab's flat shell) and 1.3500 (`box-41`, which no species with eyes
 *      can wear, below). So this is 23.2% wider than anything a sibling on the
 *      cube can be, and it is the pack's own authored proportion rather than a
 *      stretch, which `HullDef` has no field for anyway. Built, that is
 *      **width/height 0.989 against 0.873** for any rodent here on the cube.
 *   2. **TAIL THICKNESS: 0.6259 on the thinnest axis.** §7 splits the seven tails
 *      on thickness, not length, and `box-38` is one of the three THICK ones
 *      (0.5885-0.7440) where a slim gerbil tail is in the thin group
 *      (0.2000-0.3450). The gap between the two groups is **1.71x and nothing is
 *      in it**, so this is a separation a bounding box can state rather than an
 *      adjective. The gerbil's read is a dark TIP on a slim shaft; this one's is
 *      brush the whole way, which is the split the manager assigned and this file
 *      holds its side of.
 *
 * ## Every number, and where it came from
 *
 *   - **The hull is `box-12`, the cow's and the deer's, and its 1.539 is not a
 *     wider BODY.** `animal-badger.ts` measured that and it holds here: the torso
 *     is the 1.250 cube to the millimetre and all 0.289 of the extra width is two
 *     fused EAR LUGS, 15 points a side at |x| 0.6619-0.7697, y 0.3708-0.5475,
 *     z 0.3500-0.5000. So this hull is a cube-bodied shell that arrives WEARING a
 *     pair of small round high-set ears: each lug stands **0.1447 proud** of the
 *     torso, **0.1767 tall and 0.1500 deep**, high on the head and forward of
 *     centre. That is a degu's ear, and the animal is stocky because the shell is
 *     — one shape doing both jobs, at 180 triangles.
 *
 *   - **There is therefore NO ear feature, and that is the chinchilla's doing.**
 *     `home-pets.ts` proposes big round ears as the degu's separator from the
 *     gerbil, and in life it is right. It is refused here: the chinchilla in this
 *     same collection is built on `box-25`, the koala's dish, 0.742676 across —
 *     0.594 of a hull's whole width — and two big-eared rodents on one album page
 *     is exactly the silhouette twin roster §4 exists to stop. The lugs are a
 *     FIFTH of that ear, which is the honest version of "rounded, not enormous".
 *     **`box-25` is recorded here as considered and refused** so the next builder
 *     does not helpfully add it back, and so is any second ear pair: four ears is
 *     what `box-12` gives anybody who forgets what its width is made of.
 *
 *   - **Band 5 is Kenney's own inner-ear cut on those lugs, painted `limb`.**
 *     Twelve triangles, all at z = 0.5000 exactly, y 0.3255-0.5093 — the flat
 *     forward face of each lug. §4's first way to two-tone: a dark inner ear for
 *     one `byBand` entry and no geometry at all. Note it cannot argue with the
 *     painted belly line below, and that is measured rather than hoped: band 5's
 *     LOWEST point is y = +0.3255 of the hull's own centre and the belly boundary
 *     is the equator, y = 0, so no triangle is claimed by both.
 *
 *   - **The tail is `box-38`, the parrot's, and it is a pure donor transfer.**
 *     Its own `z -1` facing, its own measured 0.269738 burial, no spin, no
 *     stretch, and the parrot's own recorded y = 1.099846. That height transfers
 *     with CERTAINTY rather than by argument: the parrot wears this shape on
 *     `box-03`, whose recorded centre is [0, 0.80625, 0], and `box-12`'s recorded
 *     centre is the same 0.80625 — same height, same 1.250 of hull under it. So
 *     the join lands on this hull's rear face z = -0.625 and nothing here is
 *     chosen.
 *
 *     It is a brush by measurement: thinnest axis 0.6259, taper 0.8391 — it holds
 *     its bulk almost to the tip — and 0.3666 of bounding volume, three times the
 *     cat's whip at 0.1162. At 48 triangles it is also the cheapest tail in the
 *     bank, which is what pays for a 180-triangle hull.
 *
 *   - **`wedge-15`, the LION's tail, was considered and refused, and it hurt.**
 *     It is measurably the perfect degu tail: a 0.280 shaft with Kenney's OWN
 *     40-triangle band 5 gathered at one end (y 0.2905-0.5412 of a 1.0824 length)
 *     — a slim tail with a tuft cut into it, for free. It is refused twice over.
 *     The gerbil's assigned axis in this collection is *"a distinct dark TIP on an
 *     otherwise slim tail"*, and that is this shape; and at **212 triangles it is
 *     the most expensive common part in the bank**, four times `box-38`, on an
 *     animal whose hull already costs 180. Recorded so nobody swaps it in later
 *     and quietly takes the gerbil's separation away.
 *
 *   - **The brush is the WHOLE tail, and that is a simplification.** A degu's
 *     brush is the last third of its tail. `box-38` carries **one band across all
 *     48 of its triangles**, so there is no cut at the tip to paint and §4's first
 *     way has nothing to work with; the second way, `Paint.patch`, takes a HEIGHT
 *     and paints a level plane, which on a tail carried out behind is a line along
 *     it and not across it. A separate tip part hung on `on: 'tail'` would draw it
 *     — and would be the gerbil's distinct tip, on the animal that was told not to
 *     have one. So the tail is painted `brush` entire. It is in the flag.
 *
 *   - **The eyes are `plate-08`, the pack's one perfectly round card**, 0.400 x
 *     0.400, the only one whose two axes are equal, at its own recorded
 *     (0.2625, 0.89375) on the absolute z = 0.6350. Its band 3 is 20 of its 30
 *     triangles and reaches the full 0.200 radius in y and on the outer side,
 *     while the pupil's band 15 is inset — so the pale field WRAPS the pupil on
 *     three sides of four. Painted from its own near-white `ring` slot rather than
 *     from the belly's cream, that is as close to a pale eye-ring as the mechanism
 *     gets, and it costs no geometry. What it is not is a ring of pale fur on the
 *     coat AROUND the eye, which is what the animal has; see the flag.
 *
 *   - **A backing card for the ring was considered and REFUSED on the bank.**
 *     Measured over every `card` and `eye` shape in it: nothing is bigger than
 *     this card on both of its axes except `plate-14`/`plate-15`, the panda's
 *     0.4355 x 0.4426. Those are EYE cards, and `assembly-assert.ts` holds every
 *     eye-role card to the absolute z = 0.6350 — so a backing one would be exactly
 *     COPLANAR with the card it is meant to ring and would z-fight into
 *     invisibility, which is the failure `CARD_STANDOFF` documents. And its outer
 *     region is band 15, 40 of its 57 triangles, which the pupil rule paints
 *     `PACK_PUPIL`: the panda's card can only ever draw a DARK ring, which is the
 *     opposite of this animal's mark. The two flank cards, `plate-10` and
 *     `plate-11`, are 0.244 and 0.400 across — neither exceeds 0.400 on both axes,
 *     so neither could show a rim all the way round. Nothing was authored to fake
 *     it.
 *
 *   - **`box-41`, the tiger's "bigger" shell, was considered and REFUSED — and
 *     the reason is general.** It is the only other hull wider than the cube
 *     (1.350) and it is the obvious pick for a stocky animal. But its front face
 *     is at z = 0.725 (offset 0.05 plus half of 1.35) while `EYE_CARD_Z` is 0.6350
 *     and is **not a field** — rule 5, made unsayable — so the eye cards would
 *     land **0.090 INSIDE the head**. No species with eyes can wear `box-41`, none
 *     does, and this is the file that says why.
 *
 *   - **The face is the pack's one RODENT's, worn as it wears it.** `tube-01` is
 *     the beaver's muzzle, taper 1.000 — a barrel that does not narrow, which is a
 *     blunt face and not a shrew's point — joined at this hull's front face
 *     z = 0.625 with the beaver's own sink of 0.000, which recovers the beaver's
 *     own recorded (0.815078, 0.710803). It is painted `belly`, because a degu's
 *     muzzle is pale where its coat is not. The nose is `box-09`, the bunny's dark
 *     button, anchored `on: 'snout'` so it lands on the muzzle's own placed front
 *     plane z = 0.7966 rather than on an arithmetic this file would carry a stale
 *     copy of. It is deliberately not `wedge-10`, which is measurably the better
 *     nose tip and reads as a TONGUE — Joe rejected that by name on the hedgehog.
 *
 *   - **The incisors are `wedge-01`, the beaver's, and they are the one place a
 *     colour is spent on a fact.** A pair at the beaver's own x = +/-0.072621,
 *     y = 0.561036, joined at the front face and sunk its own 0.218566, which
 *     recovers the recorded z = 0.661290 exactly. A degu's incisors are
 *     ORANGE-YELLOW — the one caviomorph field mark every picture of one shows —
 *     so they carry their own `tooth` slot rather than the cream every other
 *     rodent's teeth take. `pets:creature` marks them **THIN**: 0.218566 x 0.128945
 *     is 0.0282, under the 0.125 §3 asks of an EAR. That is the beaver's own
 *     measured burial of its own teeth on its own hull, which is this hull, so it
 *     is the pack's number and not a shortcut — the vole's file says the same and
 *     for the same reason. Not flagged, and said out loud so nobody re-derives it.
 *
 *     They are also what clears rule 9's FLOOR. Without them this animal came out
 *     at **400 vertices — five under the pack's own 405** — which is the budget
 *     biting from the direction nobody expects, exactly as it did on the dormouse
 *     and the vole. The fix is a feature a rodent has, not a shape chosen for its
 *     count: with them it is 448, with 43 to spare.
 *
 *   - **The belly is PAINTED at 8/16**, §4's second way: the tiger's own mammal
 *     line made exact — the only point on the pack's 1/16 grid inside the
 *     0.4808-0.5481 zone Kenney's split-triangle boundary wanders across — and
 *     also this hull's own equator. Cool grey-brown above, cream below, no
 *     geometry.
 *
 * ## The palette, and the two slots that had to be their own
 *
 * `home-pets.ts` never gave this species colours — the record for it is one line
 * — so these are PROPOSED and Joe has not seen them. The coat is deliberately a
 * COOL grey-brown: the gerbil is the warm sandy-agouti of the pair and four of
 * the six rodents here are some shade of sandy, so the hue is the one thing that
 * must not be spent twice. Two slots earn their own cell rather than sharing:
 * `ring`, because the eye's pale field has to read paler than the belly for the
 * ring to be a ring at all, and `tooth`, because orange incisors are a checkable
 * fact about this animal and nothing else in the palette can stand in for them.
 *
 * **FLAGGED**, and only for the eye-ring and the tail. Nothing else strained:
 * 448 vertices and 566 triangles against the pack's 405-1626 and 422-951, height
 * 1.5559 inside 1.43-2.02, keep-out 0.985 against the fox's 1.15 and this
 * collection's ratchet of 1.28, hull at its own standard size, every part joined
 * at a face its donor joined its own to, every sink the pack's own measured
 * value, one mass, and nothing authored.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

export const DEGU_ASSEMBLY = defineCreature('animal-degu', {
  palette: {
    coat: 0x857f70,    // proposed coat: COOL grey-brown — the gerbil owns the warm sandy
    belly: 0xe3d8bf,   // proposed belly: the cream underside and the pale muzzle
    ring: 0xf7f2e6,    // proposed detail: the eye's pale field — paler than the belly, on purpose
    limb: 0x564f44,    // proposed accent: the legs and the lugs' own inner-ear cut
    brush: 0x27231f,   // proposed accent: the tail brush and the nose button
    tooth: 0xd6a94e,   // proposed detail: a degu's incisors are orange-yellow, and only its
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The cow's and the deer's shell — the WIDEST the pack drew, 1.539484, and the
   * whole of this animal's stockiness. Its extra width is two fused EAR LUGS on a
   * 1.250 cube torso (the badger measured it), so those lugs ARE the rounded ears
   * and there is no ear feature. Band 5 is Kenney's own inner-ear cut on them. */
  hull: { part: 'box-12', paint: { base: 'coat', byBand: { 5: 'limb' } } },

  /* The tiger's mammal belly line, made exact: grey-brown above, cream below. */
  belly: 0.5,

  /* THE ANIMAL, half one. The parrot's tail worn as a BRUSH — one of the bank's
   * three thick tails (0.6259 thinnest, taper 0.8391) against the gerbil's slim
   * shaft, and a pure donor transfer: the parrot's own y on a hull whose centre
   * is the same 0.80625, its own 0.269738 burial, no spin. NOT `wedge-15`, the
   * lion's tufted whip — that is the gerbil's assigned tail and 212 triangles. */
  tail: { part: 'box-38', paint: 'brush' },

  /* THE ANIMAL, half two. The pack's one perfectly round card, 0.400 x 0.400,
   * with its pale field on its OWN near-white slot so it reads as a ring round
   * the pupil rather than as sclera. The panda's bigger card cannot do this: its
   * outer 40 triangles are band 15, which the pupil rule paints grey. */
  eyes: { part: 'plate-08', paint: 'ring' },

  /* The beaver's muzzle — the pack's one rodent's — a barrel that does not narrow,
   * on the beaver's own numbers, painted pale. */
  snout: { part: 'tube-01', paint: 'belly' },

  /* The bunny's dark button on the muzzle's own placed front plane. A BUTTON, and
   * deliberately not `wedge-10`, which reads as a tongue. */
  nose: { part: 'box-09', paint: 'brush' },

  extras: [
    /* The beaver's incisors at the beaver's own placement, in the one colour this
     * animal owns outright: a degu's teeth are orange. */
    { part: 'wedge-01', name: 'incisor', kind: 'pair', paint: 'tooth' },
  ],

  flag: 'THE PALE EYE-RING IS ONLY HALF-SAYABLE, and on a degu it is the field mark — a '
    + 'band of pale fur on the COAT around each eye. Colour is a texture lookup with no '
    + 'positional information: `Paint.patch` takes one number and that number is a HEIGHT, '
    + 'so it paints a level plane and cannot say "a ring here"; `byBand` can only cut where '
    + 'Kenney already cut, and measured over the bank NO eye card carries a third band — '
    + 'every one of the ten is sclera and pupil, and on the cat\'s it is pupil alone. A '
    + 'backing card was measured and refused too: nothing in the bank is bigger than the '
    + 'round eye card on both axes except the PANDA\'s card, which is an eye card held to '
    + 'the same absolute z = 0.6350 (it would be coplanar and z-fight into invisibility) and '
    + 'whose outer 40 of 57 triangles are band 15, which the pupil rule paints grey — it can '
    + 'only ever draw a DARK ring. So what is here instead is the pack\'s one perfectly '
    + 'round card, 0.400 x 0.400, its pale field on its own near-white slot, wrapping the '
    + 'pupil on three sides: an eye with a pale surround rather than pale fur around the '
    + 'eye. SECOND, THE TAIL IS DARK ALL THROUGH where a degu\'s brush is only its last '
    + 'third — `box-38` carries ONE band over all 48 of its triangles, so there is no tip to '
    + 'cut, and a separate tip part would take the gerbil\'s assigned separation in this same '
    + 'collection. Worth your eye either way: this animal\'s ears are the HULL\'s own fused '
    + 'lugs (0.1447 proud, 0.1767 tall), small on purpose, because the chinchilla beside it '
    + 'wears the bank\'s biggest ear at 0.742676 and two big-eared rodents on one page is a '
    + 'silhouette twin. Nothing was authored, nothing is stretched, and nothing is over budget.',
})
