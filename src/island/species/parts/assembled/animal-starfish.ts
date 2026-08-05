/**
 * PLACEHOLDER — NOT A FINISHED ANIMAL. Joe, 5 August: *"put something in for the
 * unbuildable ones anyway so i can do it manually."* This is that entry.
 *
 * It is closer to finished than the jellyfish and further than the shark, and
 * the reason is worth reading before you move anything.
 *
 * ## What is actually wrong, measured
 *
 * **THE SYMMETRY IS FIVE-FOLD AND EVERY MECHANISM HERE IS TWO-FOLD.** Rule 6
 * makes a paired part ONE mesh mirrored, `kind: 'pair'` mirrors in x, and the
 * ridge idiom lays rows along z. None of the three can express five arms at 72
 * degrees. So the arms below are five INDIVIDUAL extras, each with its own
 * bearing spin — which works, and which is the only thing in this project that
 * places a part by naked trigonometry rather than by a donor transfer. Every
 * other animal recovers its numbers from the pack; this one cannot, because the
 * pack contains no radial animal.
 *
 * **IT HAS A FACE AND A STARFISH HAS NOT.** `assembly-engine.test.ts` requires
 * at least one eye card on every species, so `eyes: false` is unsayable. They
 * are on the front arm, small and dark.
 *
 * **IT IS 0.4506 TALL — the hull's own depth and not a millimetre more**, because
 * the five arms lie in the plate's own centre plane and nothing on the animal
 * rises above it. `box-13`, the crab's plate, is the only flat hull in the bank
 * and a starfish is the flattest animal in the collection, so this is correct
 * rather than a miss — but it is under a THIRD of the pack's 1.43 floor and by
 * some way the smallest thing this project has built. Look at it beside the fox
 * before accepting it.
 *
 * ## If you are doing this by hand
 *
 * The arms are the animal and `ARM_R`, the bearing list and the `stretch` are
 * the three dials. A real starfish's arms are TAPERED and joined to a broad
 * central disc; `box-18` barely tapers (0.99), so if the arms read as five pegs
 * the part to try instead is `cone-02` or `cone-04`, which taper to a quarter —
 * they are shorter, so they will want a bigger stretch and a smaller radius.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-13`'s own centre plane — the arms lie in it. */
const ARM_Y = 0.54625
/** How far out from the centre an arm joins. */
const ARM_R = 0.5

/** The arm: the elephant's trunk laid flat and lengthened. */
const ARM = {
  part: 'box-18',
  paint: 'coat' as const,
  stretch: [0.8, 0.7, 2.2] as const,
  sink: 0.25,
}

/**
 * The five bearings, and the join each one implies.
 *
 * A spin of `d` about y takes the part's own `z +1` facing to
 * `(sin d, 0, cos d)`, so the join is that direction at `ARM_R`. Written out
 * rather than computed so every number in the file is readable on the page.
 */
const ARMS: readonly { name: string; deg: number; at: readonly [number, number, number] }[] = [
  { name: 'arm-n', deg: 0, at: [0, ARM_Y, ARM_R] },
  { name: 'arm-e', deg: 72, at: [0.4755, ARM_Y, 0.1545] },
  { name: 'arm-se', deg: 144, at: [0.2939, ARM_Y, -0.4045] },
  { name: 'arm-sw', deg: 216, at: [-0.2939, ARM_Y, -0.4045] },
  { name: 'arm-w', deg: 288, at: [-0.4755, ARM_Y, 0.1545] },
]

export const STARFISH_ASSEMBLY = defineCreature('animal-starfish', {
  palette: {
    coat: 0xe0713f,
    belly: 0xf7d9a8,
    spot: 0xb84f22,
    pupil: PACK_PUPIL,  // the pack's own measured pupil; see texture.ts
  },

  hull: 'box-13',
  belly: 0.5,
  legs: false,
  eyes: { part: 'plate-06', x: 0.2, y: 0.62 },

  extras: [
    ...ARMS.map(a => ({ ...ARM, name: a.name, spin: [{ axis: 'y' as const, deg: a.deg }], at: a.at })),
  ],

  flag: 'PLACEHOLDER, NOT A FINISHED ANIMAL — put in so you can do it by hand, though '
    + 'this one is nearly there. THREE THINGS TO KNOW. The SYMMETRY is five-fold and '
    + 'every mechanism in this engine is two-fold — rule 6 mirrors, `kind: pair` '
    + 'mirrors, the ridge lays rows along z — so the five arms are five individual '
    + 'extras placed by naked trigonometry, the only parts in this project not recovered '
    + 'from a donor transfer. It HAS EYES because assembly-engine.test.ts requires an '
    + 'eye card and `eyes: false` is unsayable; a starfish has no face. And it is 0.4506 '
    + 'TALL, on box-13, the crab\'s flat plate — correct for the animal, under a THIRD '
    + 'of the pack\'s 1.43 floor and the smallest thing this project has built. If the '
    + 'arms read as pegs, box-18 barely tapers (0.99) '
    + 'and cone-02 tapers to a quarter.',
})
