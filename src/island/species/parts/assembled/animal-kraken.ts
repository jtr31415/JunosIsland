/**
 * The kraken — eight arms, and the third species in this project to wear the
 * elephant's trunk as one. It exists to be TOLD APART from the other two.
 *
 * `animal-octopus` and `animal-squid` are both built, both legless, both wearing
 * `box-18` re-axised to `y -1`. Ocean's own file separates those two on the hull
 * and on the arm arrangement; this one has to be separated from BOTH, and it is
 * done on the four things a child can see at once:
 *
 *   1. **THE HULL IS THE COW'S**, `box-12` — 1.5395 x 1.250 x 1.250, the WIDEST
 *      shell in the bank, against the octopus's 1.250 cube and the squid's
 *      `box-21`. A kraken is the big one and there is exactly one way to say big
 *      here, since `HullDef.stretch` is `never`.
 *      Its extra 0.289 of width is two fused LUGS, which `animal-horse.ts:285`
 *      calls a reason an equid cannot wear it — and on a mantle they read as the
 *      lateral fins a big cephalopod actually has. The one shell whose defect is
 *      this animal's feature.
 *   2. **THE ARMS ARE LONGER AND SPLAY WIDER.** 1.45x against the octopus's 1.2x
 *      and the squid's 0.7x, at 35 degrees off vertical against 25 and 15-25.
 *      That is 0.903 of reach a side and it is what puts the animal's own height
 *      up: a legless species is grounded on its arm tips, so a longer arm lifts
 *      the mantle rather than dropping the tips.
 *   3. **IT HAS A BEAK.** `cone-06`, the parrot's, painted horn-dark on the
 *      front face. Neither of the other two has one; a big cephalopod does, and
 *      it is the one hard part on an animal that is otherwise all muscle.
 *   4. **EIGHT SINGLES, NOT PAIRS**, on the odd multiples of 22.5 degrees — the
 *      octopus's own `BEARINGS`, and its finding rather than a copy: a mirrored
 *      copy of a TWICE-SPUN part does not invert, so the harness refuses four
 *      pairs and accepts eight singles. `animal-octopus.ts:31-59` has the
 *      measurement, including why every stretch axis here is off 1.0.
 *
 * The squid keeps its two longer feeding tentacles as its own separation; this
 * has eight of one length, which is what makes it the octopus's big cousin
 * rather than the squid's.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-12`'s own bottom plane, where the arms gather. Every hull shares it. */
const ARM_Y = 0.18125

/** How far out from the midline each arm's root sits, on that plane. */
const ARM_R = 0.5

/**
 * The odd multiples of 22.5 degrees — `animal-octopus.ts`'s ring, and eight
 * SINGLES rather than four pairs for the measured reason in its header.
 */
const BEARINGS: readonly number[] = [22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5]

/** The tilt off vertical. 35 against the octopus's 25: this one reaches. */
const SPLAY = 35

const ARMS = BEARINGS.map((a, i) => {
  const rad = (a * Math.PI) / 180
  return {
    name: `arm-${i}`,
    deg: a - 90,
    at: [ARM_R * Math.sin(rad), ARM_Y, ARM_R * Math.cos(rad)] as [number, number, number],
  }
})

/**
 * Every arm is this. The stretch is 1.45x along the trunk's own facing — the
 * octopus is 1.2x and the squid 0.7x — and NO AXIS IS EXACTLY 1.0, which is
 * `animal-octopus.ts`'s measured requirement for a spun part rather than a
 * preference about thickness.
 */
const ARM = {
  part: 'box-18',
  paint: 'arm' as const,
  axis: 'y' as const,
  dir: -1 as const,
  stretch: [0.85, 1.45, 0.85] as [number, number, number],
  sink: 0.2,
}

export const KRAKEN_ASSEMBLY = defineCreature('animal-kraken', {
  palette: {
    coat: 0x3d4f6b,    // UNREVIEWED: deep sea blue-grey — the mantle
    belly: 0x8fa3b8,   // UNREVIEWED: the pale underside light never reaches
    arm: 0x30405a,     // UNREVIEWED: the arms, a shade under the mantle
    beak: 0x1b1a18,    // UNREVIEWED: horn-black, the one hard part on the animal
    eye: 0xd8c66a,     // UNREVIEWED: a pale gold eye, huge on a deep-sea animal
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* THE WIDEST SHELL IN THE BANK. Its two fused lugs are a reason an equid
   * cannot wear it and are this animal's lateral fins — see the header. */
  hull: 'box-12',
  belly: 0.4375,
  legs: false,

  /* Set high and at the card's own x: a cephalopod's eye is on the side of the
   * mantle, near the top, and it is enormous. */
  eyes: { part: 'plate-08', paint: 'eye', x: 0.2625, y: 1.05 },

  /* THE BEAK, which neither the octopus nor the squid has. Sunk past
   * `cone-06`'s own 0.36 — which buries only 0.103 of its 0.287 — to clear §3's
   * absolute 0.125 floor. */
  snout: { part: 'cone-06', paint: 'beak', sink: 0.45 },

  extras: [
    /* Eight singles on eight bearings. See `BEARINGS` and the octopus's header
     * for why this is not four mirrored pairs. */
    ...ARMS.map(a => ({
      ...ARM,
      name: a.name,
      spin: [{ axis: 'z' as const, deg: SPLAY }, { axis: 'y' as const, deg: a.deg }],
      at: a.at,
    })),
  ],

  flag: 'THIS IS THE THIRD ANIMAL IN THE PROJECT TO WEAR box-18, THE ELEPHANT\'S TRUNK, AS '
    + 'AN ARM, and the whole job was telling it apart from the other two. Against '
    + 'animal-octopus and animal-squid: the HULL is box-12, the COW\'S, 1.5395 wide and '
    + 'the widest shell in the bank, against their 1.250 cube and box-21 — a kraken is the '
    + 'big one and a hull is the only way to say big, since HullDef.stretch is never. Its '
    + 'extra width is two fused LUGS, which animal-horse.ts calls a reason an equid cannot '
    + 'wear this shell, and on a mantle they read as the lateral fins a big cephalopod '
    + 'has. The ARMS are 1.45x against the octopus\'s 1.2x and splay 35 degrees against '
    + 'its 25. AND IT HAS A BEAK — cone-06 painted horn-black — which neither of the other '
    + 'two carries and which is the one hard part on the animal. EIGHT SINGLES, NOT FOUR '
    + 'PAIRS, and that is the octopus\'s measurement rather than a style: a mirrored copy '
    + 'of a twice-spun part does not invert and the harness refuses it. There is no CURL: '
    + 'all 100 shapes in the bank are straight or tapered along one axis, so a curled arm '
    + 'is not available at any price and this is the same gap animal-seahorse and '
    + 'animal-snail are held up by — a CURVE, now wanted by four species in three '
    + 'collections. NEW PALETTE, UNREVIEWED.',
})
