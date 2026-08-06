/**
 * The glyptodon — `animal-tortoise`'s two ideas on an animal with legs, a head
 * and a club on the end of it.
 *
 * The pack has no shell and no carapace; §5 names both and `animal-tortoise.ts`
 * records it. What that file found instead is the answer here too, so it is
 * taken rather than re-derived: **`box-19`, the fish's whole-body shell ring,
 * turned FLAT and halved in thickness, is a carapace rim.** At its own 0.520 it
 * is a second mass — `assembly-assert.ts` wants the hull's bounding volume more
 * than 3x the next mesh — and at 0.5 on its own depth it is 0.5125 against
 * `box-31`'s 1.7578, a ratio of 3.43.
 *
 * **The DOME is §8's chamfer idiom rather than a shape.** Nine `wedge-04` — the
 * bunny's and the penguin's broad blunt plate, `animal-pangolin.ts`'s scale, and
 * emphatically not `cone-01`'s point — run over the top row and the two chamfer
 * rows, so their facings step 0, ±45 through a quarter turn and the back reads
 * as an arc rather than as three flat planes. That is exactly what Joe asked the
 * idiom for on the hedgehog, used for the first time on an animal whose whole
 * silhouette question is "is the back a dome". Four collections have priced a
 * real DOME primitive (Ocean's jellyfish and sea turtle, Ice's beluga, Outback's
 * frilled lizard wanting a disc); this animal is evidence about how close the
 * placement gets without one.
 *
 * The hull is `box-31`, the lion's shallow shell — 1.125 deep, the lowest thing
 * in the bank that still has legs, which is `animal-echidna.ts`'s finding and
 * `animal-pangolin.ts`'s. A glyptodon is a low broad animal carrying a roof.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** Halved on its own depth, and that number is the one-mass ratio. See header. */
const RIM_STRETCH: [number, number, number] = [1, 1, 0.5]

export const GLYPTODON_ASSEMBLY = defineCreature('animal-glyptodon', {
  palette: {
    coat: 0x6b6153,    // UNREVIEWED: the grey hide between the plates
    shell: 0x8a7a5e,   // UNREVIEWED: the carapace — the rim and all nine scutes
    belly: 0xcbbda2,   // UNREVIEWED: the pale underside, and the sclera
    mark: 0x3b342b,    // UNREVIEWED: the nose
    limb: 0x5a5145,    // UNREVIEWED: the short pillar legs
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The lion's shallow shell — 1.125 deep, the lowest thing in the bank that
   * still has legs. animal-echidna.ts's finding and animal-pangolin.ts's. */
  hull: { part: 'box-31', paint: 'coat' },
  belly: 0.375,

  /* Wide and short: a glyptodon's legs are pillars under a roof. */
  legs: { x: 0.4, z: 0.3 },

  /* The bank's smallest card — this animal's eyes are tiny under the shell. */
  eyes: { part: 'plate-06' },

  /* The beaver's own muzzle, small and blunt, by pure donor transfer. */
  snout: 'tube-01',
  nose: { part: 'box-09', paint: 'mark' },

  /* THE DOME. Nine broad blunt plates over the top and the two chamfers, so the
   * facings step 0, +45 and -45 and the back reads as an arc. `wedge-04` and not
   * `cone-01`: taper 0.605 against taper 0, armour against spikes — which is
   * animal-pangolin.ts's own separation from the hedgehog. */
  ridge: {
    part: 'wedge-04',
    paint: 'shell',
    name: 'scute',
    count: 3,
    rows: ['top', 'chamfer'],
    span: 0.25,
  },

  extras: [
    /* THE RIM. animal-tortoise.ts's part and its cut: the fish's whole-body ring
     * laid flat and halved, standing 0.077 proud of this hull all the way round. */
    {
      name: 'rim',
      part: 'box-19',
      paint: 'shell',
      spin: [{ axis: 'x', deg: 90 }],
      axis: 'z',
      dir: -1,
      stretch: RIM_STRETCH,
      sink: 0.5,
      at: [0, 1.02, -0.18],
    },

    /* THE CLUB. The beaver's paddle — the thickest tail in the bank at 0.726
     * across and taper 0.577 — by pure donor transfer, trailing. */
    { name: 'tail', part: 'wedge-03', paint: 'shell' },
  ],

  flag: 'THE CARAPACE IS A RIM PLUS A CHAMFER ROW AND THERE IS NO DOME IN THE BANK. Both '
    + 'halves are borrowed and both are named: box-19 turned flat and halved is '
    + 'animal-tortoise.ts\'s answer to "the pack has no shell", and the halving is not taste — '
    + 'at its own 0.520 the ring is a second mass and assembly-assert.ts demands the hull be '
    + 'over 3x the next mesh, which at 0.5 it is (3.43). The nine wedge-04 over the top and '
    + 'both chamfers are §8\'s idiom, whose stated acceptance test is YOUR OWN — the back must '
    + 'read as curved rather than as three flat planes. THIS IS THE FIRST ANIMAL BUILT WHERE '
    + 'THAT IS THE ENTIRE SILHOUETTE QUESTION, so it is the honest test of the idiom and a '
    + 'DOME primitive is what would replace it (Ocean priced one for the jellyfish and the sea '
    + 'turtle, Ice for the beluga\'s melon, Outback for a frill — this is the fifth). '
    + 'THE TAIL CLUB HAS NO SPIKES: a glyptodont\'s club is a ring of bony knobs, and there is '
    + 'no way to hang a ring of anything off a tail — a species has ONE `ridge` and it solves '
    + 'against the hull. WHAT TO TRY BY HAND is animal-pangolin.ts\'s own suggestion: three or '
    + 'four wedge-04 as individual extras chained along the tail with `on`. NEW PALETTE, '
    + 'UNREVIEWED.',
})
