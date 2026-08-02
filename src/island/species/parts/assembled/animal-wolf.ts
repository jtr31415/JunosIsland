/**
 * The wolf — Night Time's big grey canid, and the animal that has to stand next
 * to `animal-fox` without being it.
 *
 * ONE SPECIES, ONE FILE. `register.ts` says why the one appended line in
 * `index.ts` is the whole of the wiring.
 *
 * ## The problem this animal is, stated exactly
 *
 * A wolf is the tallest, heaviest thing in this collection, and the bank has
 * exactly one tall shell: `box-21`, 1.250 x 1.505 x 1.250. **`box-21` is the
 * FOX's hull**, and `box-23` — the brush — is the FOX's tail, and `animal-fox` is
 * one of the frozen live 24 a child sees beside this one. Taking both would build
 * a grey fox and call it a wolf. So one of them is taken and the other is
 * refused, and this file is mostly the argument for which.
 *
 * ## `box-21` IS NOT A TALL BODY. It is the standard cube with TWO EARS ON IT
 *
 * Measured off the shell's own 102 welded points, and it is the badger's finding
 * on a second hull:
 *
 *   - **The body is the 1.250 cube, at the standard place, to the millimetre.**
 *     Its rows go bottom face (+/-0.3125) at local y -0.7525, the 0.5-ring at
 *     -0.6275, the 0.625-ring at -0.4400, then the 0.625-ring again at +0.1850,
 *     the 0.5-ring at +0.3725 and **a full top face of (+/-0.3125, +/-0.3125) at
 *     local y +0.4975** — which is 1.250 exactly above the bottom, and in world
 *     terms is `HULL_BOTTOM_Y` 0.18125 up to **1.43125, the pack's height floor**.
 *     Every chamfer is `box-03`'s own.
 *   - **All 0.2551 above that is two fused EAR LUGS**, forward on the head at
 *     z 0.191 to 0.470, each running x 0.185 to 0.487 at its widest (local
 *     y 0.4855) and tapering to a 0.051-wide crown at local y 0.7525 — world
 *     **1.6863**, which is this animal's whole height. Two lobes, a gap of 0.371
 *     between them across the midline, and nothing on the midline at all.
 *   - **Band 5 is Kenney's own INNER-EAR cut on those lugs**: 10 triangles,
 *     x +/-0.2793 to +/-0.3927, local y 0.4116 to 0.5325, z 0.4390 to 0.4714 —
 *     the forward face of each lug, in two lobes, no triangle crossing x = 0.
 *     One `byBand` entry paints a pale inner ear and costs no geometry.
 *
 * Three consequences, and they are this animal:
 *
 *   1. **There is no ear feature and there must not be one.** A pair on top would
 *      be FOUR ears, which is the exact thing `animal-badger.ts` refused on
 *      `box-12` and recorded so nobody helpfully added it back. Recorded again
 *      here, for `box-21`, with the measurement above.
 *   2. **`box-21` is not "the fox's body", it is the pack's CANID HEAD** — a
 *      standard cube wearing two erect forward ears. Erect ears on a long-muzzled
 *      cube is what a wolf and a fox SHARE; it is the shape of the family, not
 *      the mark of the species. That is why this is the fox part it is honest to
 *      take.
 *   3. **Every 1.250-cube placement transfers to it unchanged**, because the body
 *      is the standard cube at the standard offset. That is what makes the tail
 *      below a pure recovery rather than an inference — see there.
 *
 * ## And `box-23` IS the fox, so it is refused
 *
 * The brush is the one shape in the bank with a travelling identity of the kind
 * `docs/building-animals-from-parts.md` §3.2 warns about — a read that survives
 * being moved, like a tongue or a beak. Measured, three ways:
 *
 *   - **It barely narrows: taper 0.961469.** A plume holds its bulk to the tip.
 *     The parrot's fan is 0.839147 and the beaver's paddle 0.577290.
 *   - **Its section is ROUND** — y and z both 0.910248, identical to six decimals.
 *   - **It is 1.67x the volume of any other tail in the bank.**
 *
 * A tail that thick, that round and that untapering IS a fox's brush at tablet
 * distance whatever colour it is painted, which is why the squirrel had to carry
 * it UP the rear chamfer to stop reading as one. A wolf's tail trails. So the
 * shape is left where it is, and **the taper is the discriminator that decides
 * it**: a wolf's tail narrows to a tip and a fox's does not.
 *
 * ## Every other number, and where it came from
 *
 *   - **The eyes are the pack's own card at the pack's own point**, unmentioned
 *     below beyond their colour: `plate-01` at (0.2625, 0.933646, `EYE_CARD_Z`),
 *     `sink: 0`, no stretch. Only the sclera is said, and it is said because a
 *     wolf's eye is amber to its rim rather than white — the same one-word move
 *     `animal-salamander.ts` makes for its black bead.
 *
 *   - **THE TAIL IS `box-38`, THE PARROT'S FAN, AND IT IS A PURE DONOR TRANSFER.**
 *     Not one number in it was chosen. Its measured facing is `z -1`, so the
 *     builder joins it at this hull's rear face z = -0.625 and sinks it by the
 *     parrot's own 0.269738 — and its centre lands on **z = -0.772857, the bank's
 *     recorded offset for the shape**, which is the parrot's own placement
 *     recovered rather than copied (§8). The height 1.099846 is the parrot's too,
 *     untouched by the join.
 *
 *     **That transfer is legitimate BECAUSE of the measurement above.** The
 *     parrot wears this tail on `box-39`, a 1.250 cube at [0, 0.80625, 0]; the
 *     flat rear face of that cube is the 0.625 square running world y 0.4938 to
 *     1.1188. `box-21`'s flat rear face is **the same square at the same place**
 *     (its own rear row is x +/-0.3125, local y -0.4400 to +0.1850), because its
 *     body IS the standard cube. So the parrot's height is not being re-used
 *     hopefully: the buried root — the only part inboard of the join plane,
 *     local z >= 0.147857, at local y -0.4561 and -0.3561 — lands at world
 *     **y 0.6437 to 0.7437**, well inside 0.4938 to 1.1188. The join plane is on
 *     real flat geometry at both ends.
 *
 *     It is the second-thickest tail in the bank (0.625879 on its thin axis,
 *     inside §7's thick group of 0.589 to 0.744), it is **UNSPENT**, and at 48
 *     triangles it is barely half the brush's 92.
 *
 *   - **The muzzle is `tube-06`, the fox's, and it is here for its CUT.** It and
 *     the deer's `tube-03` are the same bounding box to six decimals — 0.532 x
 *     0.300 x 0.231 — and are different meshes. `tube-06` is the only one of the
 *     two Kenney split: band 3 is 20 triangles over local y -0.150 to +0.059 and
 *     band 7 is 14 over -0.009 to +0.150, so it arrives already divided into a
 *     lower half and an upper half. A grey wolf's muzzle is pale to the lip with
 *     a dark bridge over it, and that is one `byBand` entry and no geometry —
 *     `animal-badger.ts` uses the same cut for the same reason. Joined at the
 *     front face z = 0.625 and sunk its own 0.000, its centre lands on
 *     **z = 0.740710, the fox's own recorded offset to six decimals.**
 *
 *   - **The nose is `box-32`, the lion's and the tiger's — NOT `box-22`, the
 *     fox's.** Recorded here as considered and refused: it is the third fox part
 *     this animal could have taken and the one it least needed, because `box-32`
 *     is BIGGER on all three axes (0.241998 x 0.164190 x 0.170703 against
 *     0.228845 x 0.150508 x 0.155703 — 5.8%, 9.1% and 9.6%) and a wolf's nose is
 *     the largest thing on its face. It is the pad the pack gives its two big
 *     predators. `on: 'snout'` anchors it to the muzzle's own placed front plane,
 *     so a nose that floats or buries is a thing that cannot happen quietly.
 *
 *     `pets:creature` marks it **`sunk 0.050 THIN`** and it is right to print it
 *     and wrong to read it as a fault, exactly as on `animal-salamander.ts`'s
 *     tail: 0.1249 is §3's floor for an EAR, and 0.050 is the burial the pack
 *     itself gave this shape — `sunkFractionMean` 0.292906 over its two donors,
 *     of an extent of 0.170703. Deepening it would mean discarding a measurement
 *     to satisfy a warning, and the anchor guarantees the join is inside the
 *     muzzle rather than near it.
 *
 *   - **The legs stand at 6/16 and the crocodile's 0.4375 is refused.**
 *     `box-01` is 0.375 across, so a station at x = 0.375 puts each leg's outer
 *     face at 0.5625 — **one sixteenth inside the hull's own side at 0.625**. The
 *     pack's axiom over 23 of 23 is that every leg stays within the body's
 *     footprint, and `animal-crocodile.ts` spends that axiom to its exact limit
 *     at 0.4375, where the outer face lands flush on 0.625. A crocodile sprawls
 *     and a wolf does not: it is a cursorial animal that carries its legs under
 *     it. So the stance is widened from the builder's default 0.27 to the widest
 *     number on the pack's own 1/16 grid that still leaves daylight, and the
 *     wheelbase is left alone, because one dial moved for one reason is a claim
 *     and two is a taste.
 *
 *   - **THE BELLY LINE IS 7/16, AND 8/16 WOULD BE WRONG ON THIS HULL.** This is
 *     the one number worth reading twice. `Paint.patch` takes its fraction of the
 *     part's OWN built height, and `box-21`'s own height is 1.505075 — which
 *     includes the ears. §7 measured the pack's mammal boundary as a ZONE running
 *     0.4808 to 0.5481 of the hull, off the tiger's `box-41`, where the whole
 *     shell is body. Carried to this hull the zone has to be read against the
 *     BODY, and:
 *
 *       8/16 -> world y 0.933788 -> **0.6020** of the body cube — outside the zone
 *       7/16 -> world y 0.839788 -> **0.5268** of the body cube — inside it
 *       6/16 -> world y 0.745788 -> **0.4514** of the body cube — outside it
 *
 *     **7/16 is the only point on the pack's 1/16 grid inside the tiger's own
 *     zone once the ears are taken out of the arithmetic**, and 8/16 — the
 *     squirrel's, the mouse's, the badger's, and every other cube-bodied animal's
 *     — puts the pale a tenth of a body up the flank here. The hull that is not a
 *     plain cube is the hull where the shared number stops being right.
 *
 *   - **Kenney's own chest patch needs no override.** Band 3 of `box-21` is six
 *     triangles running local y -0.7525 to -0.4400, world **0.18125 to 0.4938** —
 *     §7's *"pale reaches 0.208"* of this hull, recovered: 0.3126 / 1.505075 =
 *     0.2077. Every one of them is below the painted line at 0.8398, so they take
 *     the pale colour from the patch already and a `byBand` entry for them would
 *     be a redundant statement of the same fact. Left out deliberately.
 *
 * ## THE PALETTE IS NEW AND NOBODY HAS SIGNED IT OFF
 *
 * This species has never been in a collection file, so it has never been given
 * colours. Every one below is the first ever proposed for it and every one is
 * marked UNREVIEWED. **Joe should look at them**, particularly the amber eye,
 * which is a look decision and not a measurement.
 *
 * **Flagged**, and only for that: no rule was strained, nothing is stretched at
 * all, and there is no non-uniform stretch anywhere on this animal. Measured on
 * the built model — height **1.6863** inside 1.43-2.02, feet on y = 0; keep-out
 * **1.036** against the fox's own 1.15; 525 triangles inside 422-951, 433
 * vertices inside 405-1626 and 305 in the body inside 236-1114.
 *
 * One correction to the commission, because it was written before this hull was
 * measured: **the wolf is the biggest BODY here but it is not the tallest thing
 * in the collection.** It stands 1.6863 and `animal-fennec-fox` stands 2.0100,
 * because the fennec's height is almost entirely ear. This animal is the tallest
 * SHELL — the only one of the pack's ten hulls that is not 1.250 or less through
 * the body — and that is the claim worth making for it.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

export const WOLF_ASSEMBLY = defineCreature('animal-wolf', {
  palette: {
    coat: 0x8a8f96,    // UNREVIEWED: timber grey, the first proposed for this species
    belly: 0xe8e4dc,   // UNREVIEWED: the pale underside, chest, muzzle and inner ear
    mark: 0x33353b,    // UNREVIEWED: the nose and the dark bridge of the muzzle
    limb: 0x6a6f76,    // UNREVIEWED: the legs, a shade under the coat
    eye: 0xc9922f,     // UNREVIEWED: amber to the rim — a look, not a measurement
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The fox's shell, taken for its EARS and not for its height: a 1.250 cube from
   * y 0.18125 to 1.43125 with two forward ear lugs fused on top of it, reaching
   * 1.6863. So this species has no ear feature, and band 5 is Kenney's own
   * inner-ear cut on those lugs, painted pale for one line and no geometry. */
  hull: { part: 'box-21', paint: { base: 'coat', byBand: { 5: 'belly' } } },

  /* 7/16, NOT the usual 8/16 — `patch` takes its fraction of the hull's own
   * height and this hull's height includes the ears. 7/16 lands at world 0.8398,
   * which is 0.5268 of the BODY cube and the only grid point inside §7's measured
   * 0.4808-0.5481 mammal zone once the ears are taken out. */
  belly: 0.4375,

  /* Wide, but not sprawled. 6/16 puts each leg's outer face at 0.5625, one
   * sixteenth inside the hull's own side; the crocodile's 0.4375 lands it flush
   * on 0.625 and that is a sprawl a cursorial animal should not have. */
  legs: { x: 0.375 },

  /* THE TAIL, and not the brush. The parrot's fan: second-thickest in the bank,
   * unspent, and it TAPERS (0.839 against the brush's 0.961), which is the whole
   * difference between a wolf's tail and a fox's. Not one number is given — the
   * donor transfer joins it at this hull's rear face and its centre recovers the
   * parrot's own recorded z = -0.772857, and the parrot's height works here
   * unchanged because this hull's body is the same 1.250 cube the parrot's is. */
  tail: 'box-38',

  /* The fox's muzzle, for Kenney's own horizontal cut: pale to the lip (band 3,
   * the lower 20 triangles) with a dark bridge over it (band 7, the upper 14).
   * Its twin `tube-03` is the same bounding box to six decimals and has no cut. */
  snout: { part: 'tube-06', paint: { base: 'belly', byBand: { 7: 'mark' } } },

  /* The lion's and the tiger's nose pad, on the muzzle's own front plane. Bigger
   * than the fox's `box-22` on all three axes, which is both why it is here and
   * why the fox's was refused — three fox parts would have been a grey fox. */
  nose: { part: 'box-32', paint: 'mark' },

  /* Amber to the rim. The sclera is the only thing the eye pair says, because
   * everything else about it is the pack's and is unsayable otherwise (rule 5). */
  eyes: { paint: 'eye' },

  flag: 'NEW PALETTE, UNREVIEWED — the first wolf ever built and the first colours ever '
    + 'proposed for it; the AMBER EYE especially is a look and it is yours. Worth your eye '
    + 'too: `box-21` is the FOX\'s shell and this animal wears it, but it is not a tall body '
    + '— measured, it is the standard 1.250 cube from 0.18125 to 1.43125 with TWO FUSED EAR '
    + 'LUGS on top reaching 1.6863, exactly as `box-12` is a cube with two lugs on its sides. '
    + 'So this wolf has no ear part and must not be given one (four ears), and the fox part '
    + 'it takes is the shape of the CANID HEAD, which a wolf and a fox share. The fox part it '
    + 'REFUSES is `box-23`, the brush: taper 0.961, round section, 1.67x the volume of any '
    + 'other tail, and it reads as a fox whatever colour it is painted. It wears the parrot\'s '
    + 'fan instead, which tapers to 0.839. Nothing here is stretched.',
})
