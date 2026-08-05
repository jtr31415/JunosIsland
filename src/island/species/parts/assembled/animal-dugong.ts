/**
 * The dugong — the first half of a deliberate pair, and the tail is what makes
 * it the dugong rather than `animal-manatee`.
 *
 * These two animals are the same creature to a six-year-old and nearly the same
 * creature to a zoologist. `collections/ice.ts` shipped the beluga and the
 * narwhal as one build twice over *"because in life that is the whole
 * difference"*, and this pair is built on that precedent — but it is a better
 * case, because the difference between a dugong and a manatee is ONE PART and it
 * is a part the bank already holds twice:
 *
 *   - **A dugong's tail is a whale's fluke** — two pointed lobes with a notch.
 *     `box-38`, the parrot's fan spun a quarter turn about z, is the shape
 *     `animal-whale.ts` found for exactly that and four cetaceans now wear it.
 *   - **A manatee's tail is a rounded paddle**, and `wedge-03` — the BEAVER'S
 *     PADDLE — is one, at the only other thick tail in the bank.
 *
 * So the separation is not invented and not a colour: it is the one anatomical
 * fact that tells the two orders apart, and the pack happens to contain both
 * shapes. Everything else here is shared with its twin on purpose.
 *
 * **What separates it from `animal-beluga` and `animal-narwhal`, which share the
 * hull, the fluke, the flippers and the eye card**, is the SNOUT and the absence
 * of everything on the crown. A dugong's rostrum is a great blunt pad angled
 * sharply DOWN, because the animal grazes the seabed and its mouth points at the
 * ground; the two white whales carry a melon and a five-knuckle dorsal ridge and
 * have no muzzle at all. This one is the other way round entirely: a muzzle and
 * a bare back.
 *
 * Measured on the built model: **height 1.2578**, feet on y = 0, **404
 * triangles**, **294 vertices**, keep-out 0.9947 against Woodland's 1.6 ceiling.
 * Three of those are under a pack FLOOR rather than over a ceiling — the height
 * against 1.43, the triangles against 422 and the vertices against 405 — and all
 * three are the same fact twice: a legless animal has no legs and no ears.
 * `collections/ocean.ts` established that a legless hull measures 1.250 before
 * anything is added, and `animal-emu.ts` records the same budget finding from
 * the other direction. All three REPORT rather than fail, since Joe's ruling of
 * 3 August.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-03`'s flat front plate — the cube's own +0.625. */
const FRONT_PLATE_Z = 0.625

/**
 * THE ROSTRUM'S DOWNWARD TILT, and it is the animal.
 *
 * `{ x, 30 }` on a `z +1` part takes its facing to (0, -0.5, 0.866): out and
 * DOWN by thirty degrees. A spun part faces a diagonal and the donor transfer
 * refuses to solve a diagonal, so the join is given explicitly — which is the
 * documented route and not a workaround (`creature.ts`, THE DONOR TRANSFER).
 */
const ROSTRUM_TILT = 30
const ROSTRUM_Y = 0.74

export const DUGONG_ASSEMBLY = defineCreature('animal-dugong', {
  palette: {
    coat: 0x8c9086,    // UNREVIEWED: olive grey, the first ever proposed for this species
    belly: 0xd6d5c6,   // UNREVIEWED: the pale underside, and the sclera
    skin: 0x767a70,    // UNREVIEWED: the rostrum, a shade under the coat
    fin: 0x6b6f66,     // UNREVIEWED: the fluke and the flippers
    mark: 0x33362f,    // UNREVIEWED: the mouth line and the nostrils
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  hull: { part: 'box-03' },
  belly: 0.4375,
  legs: false,

  /* `plate-06`, the smallest eye card in the bank at 0.330 x 0.276. A sirenian's
   * eye is a pinhole in a very large face and this is the pack's own answer to
   * that, worn by the walrus, the beluga and the narwhal for the same reason. */
  eyes: { part: 'plate-06' },

  /* THE ROSTRUM. box-24 is the hog's nose disc, the broadest flat pad in the
   * bank, widened and deepened and tilted thirty degrees DOWN. Six species wear
   * this shape as a muzzle; not one of them tilts it, because not one of them is
   * an animal whose mouth points at the ground. */
  snout: {
    part: 'box-24',
    paint: 'skin',
    stretch: [1.45, 1.15, 1.1],
    spin: [{ axis: 'x', deg: ROSTRUM_TILT }],
    at: [0, ROSTRUM_Y, FRONT_PLATE_Z],
  },

  /* THE FLUKE. `animal-whale.ts`'s find, unchanged: the parrot's fan turned a
   * quarter turn about z, so the one tail in this bank that can be wider than it
   * is tall is. A dugong's tail IS a cetacean's and saying otherwise would be
   * inventing a difference to make the animal look different. */
  tail: { part: 'box-38', paint: 'fin', spin: [{ axis: 'z', deg: 90 }], sink: 0.3 },

  extras: [
    /* The penguin's wing, which already is a flipper — the same two spins the
     * seal, the walrus, the beluga and the narwhal use, at a dugong's own low
     * shoulder. */
    {
      name: 'flipper',
      part: 'blade-06',
      paint: 'fin',
      kind: 'pair',
      spin: [{ axis: 'z', deg: -90 }, { axis: 'y', deg: -30 }],
      sink: 0.7,
      at: [0.625, 0.52, 0.19],
    },
    /* The nostrils, high on the rostrum where a grazing animal keeps them. The
     * pig's own nostril card, the smallest flat shape in the bank. */
    {
      name: 'nostril',
      part: 'plate-16',
      paint: 'mark',
      kind: 'pair',
      stretch: [1.4, 1.4, 1],
      at: [0.075, 0.90, 0.86],
    },
    /* The mouth, run wide across the underside of the rostrum. */
    { name: 'mouth', part: 'plate-13', paint: 'mark', stretch: [1.6, 1, 1], at: [0, 0.60, 0.86] },
  ],

  flag: 'THIS ANIMAL AND animal-manatee ARE ONE BUILD TWICE OVER, AND THAT IS DELIBERATE — the '
    + 'beluga and the narwhal are already shipped on the same argument. What makes it a better '
    + 'case than theirs is that the real difference between the two orders is ONE PART and the '
    + 'bank holds both shapes: a dugong\'s tail is a whale\'s FLUKE (box-38 spun flat, '
    + 'animal-whale.ts\'s find, worn by four cetaceans) and a manatee\'s is a rounded PADDLE '
    + '(wedge-03, the beaver\'s own paddle). Nothing was invented to tell them apart. AGAINST '
    + 'animal-beluga AND animal-narwhal, which share the hull, the fluke, the flippers and the '
    + 'eye card: the separation is the ROSTRUM and the BARE BACK. box-24 widened and tilted '
    + 'THIRTY DEGREES DOWN is the one thing on this animal nobody else does, and it is what a '
    + 'dugong is — a mouth pointing at the seabed. The two white whales have a melon and a '
    + 'five-knuckle ridge on the crown and no muzzle at all; this one has a muzzle and nothing '
    + 'on the crown. IT IS 1.2578 TALL ON 404 TRIANGLES AND 294 VERTICES, which is under THREE '
    + 'pack floors at once (1.43, 422 and 405) rather than over any ceiling — and all three are '
    + 'the same fact: a legless animal has no legs and no ears. animal-emu is already there and '
    + 'the band reports rather than fails, so it is your call. NEW PALETTE, UNREVIEWED.',
})
