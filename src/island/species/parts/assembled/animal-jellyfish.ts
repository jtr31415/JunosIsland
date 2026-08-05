/**
 * PLACEHOLDER — NOT A FINISHED ANIMAL. Joe, 5 August: *"put something in for the
 * unbuildable ones anyway so i can do it manually."* This is that entry. It
 * opens in the workbench, it has a palette and a proportion you can judge, and
 * the geometry below is a STAND-IN that names itself.
 *
 * ## What is missing, measured
 *
 * **A DOME.** Every one of the bank's ten hulls is a chamfered box and the
 * flattest, `box-13`, is still a plate with square corners. Nothing in the 100
 * baked shapes is a hemisphere, and a jellyfish is a hemisphere before it is
 * anything else. `animal-tortoise`'s flag already names this same gap from the
 * other direction — *"a domed carapace is the one bespoke part this collection
 * would pay to author"* — so a dome is now wanted by three animals and is the
 * strongest commission this collection produces.
 *
 * **TRANSLUCENCY.** A jellyfish reads by being see-through. `assemblyTexture`
 * paints opaque swatches into one shared material and there is no alpha channel
 * anywhere in the route. This is not a shape problem and no part fixes it.
 *
 * ## What is standing in, and what I would try first
 *
 * The bell is the shared cube with `box-19` — the fish's shell-ring — laid FLAT
 * at the cube's lower edge as a bell MARGIN, which is `animal-tortoise`'s rim
 * placement moved down the body. It buys a rounded lower edge and nothing above
 * it. The tentacles are eight `box-18` hung thin and long, the octopus's arm at
 * a third of its width.
 *
 * **If you are doing this by hand:** the bell is the whole animal, so start
 * there. The two dials that cost nothing are the ring's HEIGHT on the body and
 * its `stretch` — sliding it up toward the crown and widening it makes the cube
 * read progressively more like a skirt and less like a box with a hoop on it.
 * If that does not get there, this species is a dome commission and no
 * arrangement of the current bank will finish it.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** Where a tentacle joins, on the hull's own bottom plane. */
const T_Y = 0.18125

/** The tentacle: the octopus's arm, thinned and lengthened. */
const TENTACLE = {
  part: 'box-18',
  paint: 'tentacle' as const,
  axis: 'y' as const,
  dir: -1 as const,
  stretch: [0.4, 1.35, 0.4] as const,
  sink: 0.2,
}

export const JELLYFISH_ASSEMBLY = defineCreature('animal-jellyfish', {
  palette: {
    coat: 0xc9a2d8,
    belly: 0xf0e2f5,
    bell: 0xb587c9,
    tentacle: 0xdcbde6,
    pupil: PACK_PUPIL,  // the pack's own measured pupil; see texture.ts
  },

  hull: 'box-03',
  belly: 0.5,
  legs: false,
  eyes: { part: 'plate-06', x: 0.2, y: 0.95 },

  extras: [
    /* THE STAND-IN. The tortoise's rim placement, slid down the body to sit at
     * the bell's lower edge. It is not a dome and does not pretend to be. */
    {
      name: 'bell',
      part: 'box-19',
      paint: 'bell',
      spin: [{ axis: 'x', deg: 90 }],
      axis: 'z',
      dir: -1,
      stretch: [1, 1, 0.4],
      sink: 0.5,
      at: [0, 0.5, 0],
    },
    { ...TENTACLE, name: 'tentacle-side', kind: 'pair', at: [0.4375, T_Y, 0] },
    { ...TENTACLE, name: 'tentacle-fore', kind: 'pair', at: [0.3125, T_Y, 0.3125] },
    { ...TENTACLE, name: 'tentacle-aft', kind: 'pair', at: [0.3125, T_Y, -0.3125] },
    { ...TENTACLE, name: 'tentacle-bow', at: [0, T_Y, 0.4375] },
    { ...TENTACLE, name: 'tentacle-stern', at: [0, T_Y, -0.4375] },
  ],

  flag: 'PLACEHOLDER, NOT A FINISHED ANIMAL — put in so you can do it by hand. THE BANK '
    + 'HAS NO DOME: all ten hulls are chamfered boxes and none of the 100 baked shapes '
    + 'is a hemisphere, so the bell here is the shared cube wearing box-19 flat at its '
    + 'lower edge as a margin — the tortoise\'s rim placement, slid down. It is a '
    + 'stand-in and it says so. THE SECOND PROBLEM IS NOT A SHAPE AT ALL: a jellyfish '
    + 'reads by being TRANSLUCENT, and the assembly texture route is opaque end to end '
    + 'with no alpha anywhere in it. No part fixes that. A DOME is now wanted by this '
    + 'animal, the tortoise and the sea turtle, which makes it the clearest commission '
    + 'in the collection.',
})
