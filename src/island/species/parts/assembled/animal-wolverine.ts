/**
 * The wolverine — the heaviest mustelid there is, and its blond flank stripe is
 * a hull band nobody had spent.
 *
 * A wolverine reads as a small bear until you see the marking: a pale band that
 * sweeps from each shoulder along the flank to the rump on a near-black body.
 * That is a lengthwise stripe, which `Paint.patch` cannot say — and `box-41`
 * happens to have it already.
 *
 * **Band 7 of `box-41` is 57 triangles, x +/-0.625, local y -0.650 to 0.600,
 * z -0.675 to 0.575** — the flanks and lower body, under band 15's back and
 * shoulders. Painting 15 near-black and 7 a warm tan is exactly the animal, for
 * zero geometry. `animal-turkey.ts` spends the same shell's three bands on a
 * bronze back and a red face; this is the third reading of it and the first that
 * uses band 7 as a MARKING rather than as shadow.
 *
 * Against `animal-bear`, which wears the same shell in this collection: that one
 * is uniform brown with a silvered BACK (band 15 lighter) and the panda's round
 * ear high on a flat crown. This is the inverse — dark back, pale flank — with a
 * carried bushy tail and a big predator's nose pad.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

export const WOLVERINE_ASSEMBLY = defineCreature('animal-wolverine', {
  palette: {
    coat: 0x2e2620,
    belly: 0xc79a5f,
    mark: 0x191410,
    limb: 0x241d18,
    pupil: PACK_PUPIL,
  },

  /* THE STRIPE. Band 7 is the flanks and lower body and band 15 the back and
   * shoulders, so the base takes the pale and 15 takes the dark — which puts the
   * blond band exactly where a wolverine wears it and costs nothing. */
  hull: { part: 'box-41', paint: { base: 'belly', byBand: { 15: 'coat', 3: 'coat' } } },

  /* The beaver's and the polar bear's round button ear — the only truly round
   * ear the pack ever stood on a top face — with Kenney's own band 7 inner disc
   * left dark against a pale rim. */
  ears: { part: 'box-02', paint: { base: 'coat', byBand: { 7: 'belly' } } },

  /* The fox's muzzle, for Kenney's own horizontal cut: band 3 is its lower 20
   * triangles and band 7 its upper 14, so a dark face with a pale brow band is
   * one entry. That brow is the front end of the same marking. */
  snout: { part: 'tube-06', paint: { base: 'coat', byBand: { 7: 'belly' } } },

  /* The lion's and the tiger's nose pad — the biggest in the bank — on the
   * muzzle's own placed front plane. A wolverine's face is mostly jaw. */
  nose: { part: 'box-32', paint: 'mark' },

  /* The parrot's fan, entirely by donor transfer: joined at this shell's rear
   * plate at z = -0.625 and sunk the parrot's own 0.269738, recovering the
   * bank's recorded -0.772857. Carried and bushy, which is a wolverine's. */
  tail: { part: 'box-38', paint: 'coat' },

  flag: 'THE BLOND FLANK STRIPE IS A HULL BAND AND IT COSTS NOTHING, which is the thing worth '
    + 'looking at. A wolverine reads as a small bear until you see the marking — a pale band '
    + 'sweeping from each shoulder along the flank to the rump on a near-black body — and that '
    + 'is a LENGTHWISE stripe, the exact marking animal-badger.ts, animal-ferret.ts, '
    + 'animal-civet.ts and animal-skunk.ts all had to flag as unsayable. box-41 already has it: '
    + 'its band 7 is 57 triangles covering the flanks and lower body (x +/-0.625, local y -0.650 '
    + 'to 0.600) under band 15\'s 168 triangles of back and shoulders, so painting the BASE pale '
    + 'and band 15 dark puts the blond exactly where the animal wears it. animal-turkey.ts and '
    + 'animal-sheep.ts read the same three bands as a bronze back and a painted face; this is '
    + 'the first to read band 7 as a marking rather than as shadow. WHETHER THE BAND SITS TOO '
    + 'LOW IS YOURS — it is Kenney\'s boundary and there is no dial on it. AGAINST animal-bear, '
    + 'WHICH WEARS THE SAME SHELL IN THIS COLLECTION: that one is uniform brown with a SILVERED '
    + 'BACK (band 15 lighter, not darker) and a round ear on a flat crown; this is the inverse '
    + 'and carries a bushy fan tail where the bear has the bank\'s only stub. NEW PALETTE, '
    + 'UNREVIEWED. Nothing is stretched.',
})
