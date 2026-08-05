/**
 * The sea urchin — the hedgehog's mechanism at its limit, and the only animal in
 * this project where "a ball of spines" is the whole species rather than half of
 * it.
 *
 * It is `box-06` — the BUNNY'S EAR — on all five facings, top, both upper
 * chamfers and both flanks, which is §8's idiom. `RidgeDef` carries no
 * `stretch`, so a longer spine has to be a longer SHAPE rather than a scaled
 * one, and at 0.913 tall against `cone-01`'s 0.400 the bunny's ear is the
 * longest spike the bank owns. That is what separates this animal from
 * `animal-pufferfish`, which wears `cone-01` on the same five rows: not a dial,
 * a different part.
 *
 * The other separation is subtraction: no fins, no tail, no mouth card, no
 * belly line. An urchin has no front, and every part this animal does not wear
 * is a part the pufferfish does.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

export const SEA_URCHIN_ASSEMBLY = defineCreature('animal-sea-urchin', {
  palette: {
    coat: 0x3d2b46,
    belly: 0x5e4468,
    spine: 0x2a1c31,
    pupil: PACK_PUPIL,  // the pack's own measured pupil; see texture.ts
  },

  hull: 'box-03',
  legs: false,
  /* An urchin has no face and the builder requires an eye card, so the eyes are
   * small, dark and low — the least face this engine will let an animal have.
   * See the flag: this is a decision, not an accident. */
  eyes: { part: 'plate-06', x: 0.2, y: 0.85 },

  ridge: {
    part: 'box-06',
    paint: 'spine',
    name: 'spine',
    count: 3,
    rows: ['top', 'chamfer', 'side'],
    span: 0.4375,
  },

  flag: 'NEW PALETTE, UNREVIEWED — the first sea urchin ever built and the first colours '
    + 'ever proposed for it. TWO THINGS ARE YOURS TO RULE ON. First, IT HAS EYES AND A '
    + 'SEA URCHIN HAS NOT: assembly-engine.test.ts requires every species to carry at '
    + 'least one eye card, so `eyes: false` is not sayable, and the least face I could '
    + 'give it is the caterpillar\'s small plate-06 low on the front. If a faceless '
    + 'animal is wanted, that is an engine change and it is yours to ask for. Second, '
    + 'THE SPINES DO NOT COVER THE UNDERSIDE — the ridge idiom places on the top, the '
    + 'chamfers and the flanks, and there is no bottom row, so from below this is a '
    + 'bare cube. A real urchin is spined all round. RULE 9 STRAINED, DELIBERATELY: '
    + 'fifteen bunny ears is 1010 triangles against the pack\'s measured 951 — the same '
    + 'overrun animal-hedgehog declares at 1021, and for the same reason, which is that '
    + 'no animal in Kenney\'s twenty-four wears fifteen protrusions. The vertex budget, '
    + 'which is what rule 9 actually measures, is comfortably inside its band.',
})
