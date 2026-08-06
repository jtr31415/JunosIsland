/**
 * The Iguanodon — the THUMB SPIKE, and the first time `cone-01` has been placed
 * anywhere but a back or a face.
 *
 * The one fact a child is told about this animal is that the thing on the end of
 * its hand was mistaken for a nose horn for fifty years. So the build is arranged
 * to make that legible: a pair of `cone-01` — the bank's only zero-taper point
 * standing on `y +1`, and the shape the hedgehog, the porcupine, the echidna, the
 * triceratops and the pterodactyl all wear elsewhere — spun up and forward at 45
 * degrees and joined high on the chest where a hand would be.
 *
 * **THAT PLACEMENT IS BOUNDED FROM BELOW, AND THE BOUND IS THE FLOOR.**
 * `buildAssembly` grounds the animal on its LOWEST point, so anything hung under
 * the feet lifts the legs off the ground and the harness fails it by name. A
 * spike at y = 0.62 with a 0.329 cross-section bottoms out at 0.44, which is
 * clear; at 0.30 it would not be, and the animal would arrive floating.
 *
 * **IT IS A QUADRUPED AND THE THREE-TOED HADROSAUR BESIDE IT IS TOO**, so the
 * separation from `animal-parasaurolophus` is made twice over: that animal is its
 * CREST and this one is its HANDS, and the bills differ — the hadrosaur takes
 * `tube-07` stretched broad (1.7733 wide-over-tall, `animal-goose.ts`'s
 * measurement) where this takes the bunny's narrow rounded muzzle at its own
 * 0.75 burial.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-12`'s own centre. Its side is 0.76975 and its crown 1.43125. */
const HULL_MID_Y = 0.80625

/**
 * As low as a thumb spike can hang.
 *
 * `cone-01` is 0.160 x 0.400 x 0.329 and spun up-and-forward at 45 degrees its
 * lowest point sits about 0.18 under its join. `buildAssembly` re-grounds on the
 * lowest mesh, so a spike below the leg row would lift the feet — the harness
 * asserts every `leg*` mesh has its foot on zero and that is never waived. 0.62
 * bottoms out at 0.44, which is 0.44 of daylight over the fault.
 */
const THUMB_Y = 0.62

export const IGUANODON_ASSEMBLY = defineCreature('animal-iguanodon', {
  palette: {
    coat: 0x7c8a72,    // UNREVIEWED: a cool grey-green
    belly: 0xd8d2b2,   // UNREVIEWED: the pale underside, and the sclera
    spike: 0xefe6cd,   // UNREVIEWED: pale bone, for the two thumb spikes
    limb: 0x67735e,    // UNREVIEWED: the four legs
    hide: 0x707d66,    // UNREVIEWED: the coat one step down — bill and tail
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* THE WIDEST SHELL, the cow's and the deer's. An iguanodon is a heavy
   * broad-bodied animal and the hadrosaur beside it is on the cube, which is the
   * cheapest half of the separation. */
  hull: { part: 'box-12', paint: 'coat' },

  /* 7/16, below the pack's mammal zone. It splits the `coat` CELL, so the bill,
   * the tail and the spikes all take slots of their own — animal-stoat.ts. */
  belly: 0.4375,

  legs: { x: 0.5, z: 0.375, paint: 'limb' },

  /* The bunny's muzzle at its own 0.75 burial: narrow, rounded and barely
   * standing out, against the hadrosaur's broad flattened giraffe-nose bill. */
  snout: { part: 'box-08', paint: 'hide', stretch: [1.4, 1, 1] },

  /* The lion's tail laid straight back on animal-frilled-lizard.ts's idiom. */
  tail: {
    part: 'wedge-15',
    paint: 'hide',
    spin: [{ axis: 'x', deg: -90 }],
    axis: 'y',
    dir: 1,
    sink: 0.25,
    at: [0, HULL_MID_Y, -0.625],
  },

  extras: [
    /* THE THUMB SPIKES. cone-01 spun up and forward 45 degrees — a POSITIVE turn
     * about x carries a `y +1` facing to (0, 0.7071, 0.7071) — and hung at the
     * bound the floor imposes. See THUMB_Y. */
    {
      name: 'thumb',
      part: 'cone-01',
      paint: 'spike',
      kind: 'pair',
      spin: [{ axis: 'x', deg: 45 }],
      sink: 0.25,
      at: [0.42, THUMB_Y, 0.44],
    },
  ],

  flag: 'THE THUMB SPIKE, and the first time cone-01 has been placed anywhere but a back or a '
    + 'face. That shape is the bank\'s only zero-taper point standing on y +1 — one of two true '
    + 'points in all 100 records — and the hedgehog, the porcupine, the echidna, the '
    + 'triceratops and the pterodactyl all wear it elsewhere. It is here because the one fact a '
    + 'child is told about this animal is that its hand spike was mistaken for a nose horn for '
    + 'fifty years. THE PLACEMENT IS BOUNDED FROM BELOW BY THE FLOOR: buildAssembly grounds the '
    + 'animal on its LOWEST point, so anything under the feet lifts the legs and the harness '
    + 'fails it by name. At y = 0.62 the spike bottoms out at 0.44; at 0.30 it would not, and '
    + 'the animal would arrive floating. That is the trap a sibling caught a markhor in. THE '
    + 'SEPARATION FROM animal-parasaurolophus IS MADE TWICE: that animal is its CREST and this '
    + 'one is its HANDS, and the bills differ too — the hadrosaur takes tube-07 stretched broad '
    + 'at animal-goose.ts\'s measured 1.7733 wide-over-tall, this takes the bunny\'s narrow '
    + 'rounded muzzle at its own 0.75 burial. It also takes the WIDEST shell, box-12, where the '
    + 'hadrosaur is on the cube. NEW PALETTE, UNREVIEWED.',
})
