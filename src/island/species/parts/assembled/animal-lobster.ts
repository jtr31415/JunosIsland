/**
 * PLACEHOLDER — NOT A FINISHED ANIMAL. Joe, 5 August: *"put something in for the
 * unbuildable ones anyway so i can do it manually."* This is that entry, and of
 * the four placeholders in Ocean this is the one with a HARD, MEASURED gap
 * rather than a soft one.
 *
 * ## The claw is not in the bank, and that is a fact about the BAKE
 *
 * `docs/building-animals-from-parts.md` §7 censuses **claw — 10 instances, 10
 * distinct shapes, donors: crab, lion, tiger, polar — BAKED: no.** The pack
 * HAS claws, including the crab's own pincer; the generator has never baked the
 * `claw` role, so `PARTS_BANK` contains none of them. I checked the 100 baked
 * records rather than the table: the roles present are band, card, ear, eye,
 * hull, leg, nose, oddment, tail, tooth and wing. No claw.
 *
 * **THIS IS A COMMISSION AND NOT A CHANGE ANYONE SHOULD MAKE IN PASSING.**
 * Baking a role RENUMBERS THE WHOLE BANK — adding `wing` on 2 August moved
 * `box-31` from the lion's hull to its mane band and turned the newt's crest
 * into bee wings, and nothing failed to compile. `NUMBERING_FROZEN_BY` pins the
 * order and new roles may only APPEND. So baking `claw` is plausibly safe as an
 * append and is still Joe's call, not a builder's.
 *
 * ## What is standing in
 *
 * The pincer is two `wedge-11` — the elephant's tusk, the bank's bluntest
 * tapering tooth — set opposed with a gap between them on the end of a `box-18`
 * arm. Two opposed tapers reading as a pincer is §3.1's principle (a part's
 * identity is its placement) pushed about as far as it goes, and §3.2's warning
 * about shapes whose read travels is exactly the risk.
 *
 * Everything else here is honest: four real `box-01` legs, `box-38` (the
 * parrot's fan) as the tail fan, `cone-01` — an antenna in its own donor — as
 * the antennae, and a segmented
 * abdomen from the ridge idiom.
 *
 * **If you are doing this by hand:** the claws are the animal. If the opposed
 * tusks do not read, no rearrangement of this bank will fix it and the answer
 * is to bake the `claw` role — the crab's own pincer is sitting in the GLB.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** The pincer half: the elephant's tusk, turned to reach forward. */
const PINCER = {
  part: 'wedge-11',
  paint: 'claw' as const,
  kind: 'pair' as const,
  stretch: [1, 1, 1.2] as const,
  sink: 0.3,
}

export const LOBSTER_ASSEMBLY = defineCreature('animal-lobster', {
  palette: {
    coat: 0xb8342a,
    belly: 0xe8b49a,
    claw: 0xa02a22,
    limb: 0x8c241d,
    pupil: PACK_PUPIL,  // the pack's own measured pupil; see texture.ts
  },

  hull: 'box-03',
  belly: 0.4375,
  legs: { paint: 'limb' },
  eyes: { part: 'plate-06', x: 0.2625, y: 1.05 },

  /* The parrot's fan as the tail fan — a lobster's is broad and vertical, and
   * unlike the whale's this one is worn the way its donor wore it. */
  tail: { part: 'box-38', paint: 'coat', sink: 0.3 },

  /* The segmented abdomen — the ridge idiom along the back. */
  ridge: {
    part: 'wedge-04',
    paint: 'limb',
    name: 'segment',
    count: 4,
    rows: ['top'],
    span: 0.4375,
  },

  extras: [
    /* THE ARMS: box-18 reaching forward and OUT, one a side. */
    {
      name: 'arm', part: 'box-18', paint: 'coat', kind: 'pair',
      stretch: [0.7, 0.7, 1.4], spin: [{ axis: 'y', deg: 20 }], sink: 0.25,
      at: [0.4375, 0.5625, 0.625],
    },
    /* THE PINCER: two opposed tusks at the arm's tip, the gap between them the
     * whole read.
     *
     * Placed by SOLVED ABSOLUTE COORDINATES and not by `on: 'arm'`, and that is
     * worth knowing before anyone "tidies" it: `creature.ts:691` takes `at` in
     * preference to `on`, so a feature carrying BOTH silently ignores the
     * anchor and uses the raw coordinates. Written as `on: 'arm'` with an
     * offset-looking `at: [0, 0.07, 0]` the two pincers landed at y = 0.07 —
     * on the floor, under the animal's own feet, which is what
     * `assembly-engine.test.ts`'s feet-on-zero caught.
     *
     * So the tip is solved instead: the arm joins at z = 0.625 facing
     * `{ y: 20 }` of z+, which is (0.342, 0, 0.940); it is 0.595 long stretched
     * and buried 0.149, so it reaches 0.446 and its tip is
     * [0.590, 0.5625, 1.044]. The two halves sit either side of that. */
    { ...PINCER, name: 'pincer-upper', spin: [{ axis: 'y', deg: 20 }], at: [0.59, 0.6375, 1.0] },
    { ...PINCER, name: 'pincer-lower', spin: [{ axis: 'y', deg: 20 }], at: [0.59, 0.4875, 1.0] },

    /* Antennae: `cone-01`, the bee's antenna, drawn out long and thin. It IS an
     * antenna in its donor, which is the one part on this animal needing no
     * reinterpretation at all — and at 34 triangles against `wedge-18`'s 212 it
     * is what keeps the species inside rule 9's ceiling. */
    {
      name: 'antenna', part: 'cone-01', paint: 'limb', kind: 'pair',
      stretch: [0.5, 2.4, 0.5],
      spin: [{ axis: 'x', deg: -70 }, { axis: 'y', deg: -20 }], sink: 0.25,
      at: [0.25, 1.25, 0.5625],
    },
  ],

  flag: 'PLACEHOLDER, NOT A FINISHED ANIMAL — put in so you can do it by hand, and this '
    + 'is the one with a HARD gap. THE CLAW ROLE IS NOT BAKED INTO THE BANK. The pack '
    + 'HAS claws — §7 censuses ten distinct ones, the crab\'s pincer among them — and '
    + 'the generator has simply never baked that role, so PARTS_BANK contains none of '
    + 'them: the eleven roles in it are band, card, ear, eye, hull, leg, nose, oddment, '
    + 'tail, tooth and wing. The pincer here is two opposed wedge-11 elephant tusks with '
    + 'a gap between them, which is §3.1 pushed as far as it goes. THIS IS A COMMISSION '
    + 'FOR YOU: baking a role RENUMBERS THE BANK — adding `wing` turned the newt\'s crest '
    + 'into bee wings and nothing failed to compile — so it may only APPEND and it is '
    + 'your call, not a builder\'s. If the opposed tusks do not read, nothing in this '
    + 'bank will, and the crab\'s own pincer is sitting in the GLB waiting to be baked.',
})
