/**
 * The sugar glider — and the patagium is NOT a bird's wing, which is the one
 * thing worth saying first.
 *
 * `collections/night-time.ts` held this species out because the gliding membrane
 * runs wrist to ankle and every wing in the bank hangs off a shoulder. That is
 * still true and it is why no wing shape is worn here. What is worn instead is
 * **`blade-05`, the lion's flat muzzle plate** — 1.000 x 1.000 x 0.125, 18
 * triangles, 16 welded points, the only large flat SLAB the pack drew, and
 * invisible to three censuses because it is filed under the `nose` role.
 * `collections/prehistoric.ts` and Dinosaurs found it as a frill, a plate row and
 * a sail; a patagium is the fourth job and the one it needs least reinterpreting
 * for, because a patagium IS a flat sheet.
 *
 * **The measurement.** Spun `{ x, -90 }` the sheet lies in the horizontal plane —
 * its own 1.000 becomes the fore-and-aft length and its 0.125 becomes the
 * thickness — and declared `axis: 'x', dir: 1` it joins the flank rather than the
 * face. Narrowed to `SPAN` 0.55 on outreach only and sunk 0.25, it buries 0.1375
 * (clear of §3's 0.125 floor) and stands **0.4125 clear of a 0.625 flank**: the
 * animal is 2.075 across, keep-out **1.0375**, inside the fox's own 1.15.
 *
 * **WHERE THE COMPROMISE REALLY IS, since it is not the shape.** The sheet is
 * RIGID and RECTANGULAR where the real membrane is slack and scalloped, and it
 * joins the body along its whole flank because there is no wrist and no ankle to
 * join it to — the bank has no jointed limb at all (`collections/critters.ts`
 * priced that, and it is the same commission three species there are waiting on).
 * **TRY FIRST:** `SPAN` is the dial and it is outreach only, so widening it never
 * lengthens the animal. `PATAGIUM_Y` is the second: dropped toward the belly the
 * membrane reads as a skirt, raised it reads as a wing.
 *
 * The other job this file has is not being `animal-opossum`, which is in this
 * same collection and is the reason the species was blocked twice over. Separated
 * on all five: the fish's shell rather than the cube, the dog's ear rather than
 * the koala's dish, the giraffe's muzzle rather than the deer's, the lion's
 * tufted rope rather than the cat's bare one — and the membrane, which the
 * opossum has none of.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-20`'s own flank. The fish's cube sits where every other cube sits. */
const HULL_SIDE_X = 0.625

/**
 * How far the membrane reaches out from the flank, as a fraction of `blade-05`'s
 * own 1.000.
 *
 * 0.55 gives 0.55 of extent along the join axis; sunk 0.25 that buries 0.1375 —
 * §3's floor is 0.125 — and leaves 0.4125 standing clear each side, so the animal
 * is 2.075 across against a 1.250 body. A gliding possum's membrane roughly
 * doubles its width and this does, without taking the keep-out past the fox's.
 */
const SPAN = 0.55

/**
 * The membrane's height on the flank: the shell's own centre.
 *
 * Spun flat the sheet is only 0.125 thick, so it runs 0.74375 to 0.86875 — the
 * body's equator, which is where a patagium leaves the flank. Lower and it reads
 * as a skirt; higher and it reads as a wing, and neither is what this animal is.
 */
const PATAGIUM_Y = 0.80625

export const SUGAR_GLIDER_ASSEMBLY = defineCreature('animal-sugar-glider', {
  /* NEW AND UNREVIEWED — the first sugar glider ever built here and the first
   * colours ever proposed for it. Pale silver-grey above, cream below, with the
   * face and ear markings in one darker slot. */
  palette: {
    coat: 0xa9b0b8,    // UNREVIEWED: the pale silver-grey back
    belly: 0xf2ece0,   // UNREVIEWED: the cream underside, and the sclera
    membrane: 0x8f979f, // UNREVIEWED: THE PATAGIUM — a shade under the coat, never a wing colour
    mark: 0x3d3a38,    // UNREVIEWED: the dark tail tip, the nose and the ear edges
    limb: 0xc8c2b6,    // UNREVIEWED: the four feet and the muzzle
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* THE FISH'S CUBE. 1.250 on every axis like the pack's default, 78 triangles,
   * and the one plain shell no other Night Time member wears — the opossum, the
   * civet and the kinkajou take `box-03`, `box-03` and `box-36`, and a fourth
   * cube-bodied climber sharing one of those is exactly roster §4's failure. */
  hull: 'box-20',

  /* 8/16, the tiger's own mammal line made exact and this shell's own equator.
   * The split is at the cell's centre, so nothing that shares `coat` is repainted
   * by it — and nothing here does share it. */
  belly: 0.5,

  /* The dog's and pig's ear, at its own `y +1` mount, sunk 0.45 rather than the
   * donor's 0.594288 so it stands 0.2077 proud instead of 0.153. Nothing in this
   * collection wears it: the opossum and the aye-aye take the koala's dish, the
   * bushbaby the elephant's flap, the tarsier and the kinkajou the small radial
   * pair, the civet the cat's. */
  ears: { part: 'cone-02', sink: 0.45 },

  /* The panda's card, the biggest pair in the bank at 0.435 x 0.443, raised to
   * y = 1.0. This is the fifth species in the collection to spend it and it is
   * spent for the usual reason: a glider's eyes are enormous and forward-facing,
   * and rule 5 makes the size absolute so "biggest in the pack" is a real claim. */
  eyes: { part: 'plate-14', x: 0.24, y: 1.0 },

  /* THE FACE. The giraffe's muzzle — 0.532 x 0.300 x 0.266 at its own recorded
   * 0.375940 burial, so 0.166 of it stands clear of the front face. Short and
   * broad, which is a glider's, and NOT the deer's `tube-03` that the opossum
   * wears eight lines away in the same collection. */
  snout: { part: 'tube-07', paint: 'limb' },

  /* The koala's nose-tip on the muzzle's own placed front plane, dark. */
  nose: { part: 'box-26', paint: 'mark' },

  /* THE TAIL. The lion's rope, 1.0824 long and the longest in the bank, with
   * Kenney's own tuft cut painted dark — band 5 is the tip, which is
   * `animal-cheetah.ts`'s measurement reused rather than re-derived. A sugar
   * glider's tail is as long as its body and ends in a black tip, and this is the
   * one marking on the animal that the bank can actually say. */
  tail: { part: 'wedge-15', paint: { base: 'coat', byBand: { 5: 'mark' } }, at: [0, 1.15, -0.625] },

  extras: [
    /* THE PATAGIUM. The lion's flat slab laid horizontal and joined to the flank
     * — see the header for the whole derivation. It carries the `nose` role, not
     * `wing`, so `withDefaultFlap` leaves it alone, which is correct: a gliding
     * membrane is held out, never beaten. */
    {
      name: 'patagium',
      part: 'blade-05',
      paint: 'membrane',
      kind: 'pair',
      axis: 'x',
      dir: 1,
      spin: [{ axis: 'x', deg: -90 }],
      stretch: [SPAN, 1, 1],
      sink: 0.25,
      at: [HULL_SIDE_X, PATAGIUM_Y, 0],
    },
  ],

  flag: 'THE MEMBRANE IS blade-05, THE LION\'S MUZZLE PLATE, AND IT IS NOT A WING. This '
    + 'species was held out of the collection because a patagium runs wrist to ankle and '
    + 'every wing in the bank hangs off a shoulder — still true, so no wing shape is worn '
    + 'here. blade-05 is the only large flat SLAB the pack drew, 1.000 x 1.000 x 0.125 for 18 '
    + 'triangles, filed under the nose role, which is why three censuses missed it; Dinosaurs '
    + 'found it as a frill, a plate row and a sail and this is the fourth job. Spun { x, -90 } '
    + 'it lies horizontal — its 1.000 becomes the fore-and-aft length and its 0.125 the '
    + 'thickness — and declared axis x dir 1 it joins the FLANK. At SPAN 0.55 sunk 0.25 it '
    + 'buries 0.1375 against §3\'s 0.125 floor and stands 0.4125 clear, so the animal is 2.075 '
    + 'across and its keep-out is 1.0375, inside the fox\'s 1.15. WHERE THE COMPROMISE ACTUALLY '
    + 'IS: the sheet is RIGID and RECTANGULAR where the real membrane is slack and scalloped, '
    + 'and it joins along the whole flank because the bank has no jointed limb to hang it '
    + 'between — the same commission three Critters are waiting on. TRY FIRST: SPAN is '
    + 'outreach only, so widening it never lengthens the animal; PATAGIUM_Y dropped reads as a '
    + 'skirt and raised reads as a wing. ALSO: THE DORSAL STRIPE CANNOT BE SAID. A sugar '
    + 'glider is a grey animal with one black line from nose to rump, and colour here is a '
    + 'lookup with no positional term: Paint.patch takes a HEIGHT and paints one level '
    + 'boundary, byBand can only cut where Kenney already cut, and box-20 carries ONE band '
    + 'across all 78 of its triangles. It is unsayable rather than awkward, and nothing was '
    + 'invented to fake it. ALSO: NEW PALETTE, UNREVIEWED.',
})
