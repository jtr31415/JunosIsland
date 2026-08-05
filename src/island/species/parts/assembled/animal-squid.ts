/**
 * The squid — the octopus's twin, separated on the hull before anything else.
 *
 * `animal-octopus` is `box-03`, a cube, with eight arms splayed evenly around
 * its whole footprint. This is `box-21`, the FOX's shell — 1.25 x 1.5051 x 1.25,
 * the tallest hull the bank owns and the only one that is taller than it is
 * wide. A squid's mantle is a tall cone and the fox's shell is the nearest the
 * pack gets to one; that difference is 0.255 of height and it is the first thing
 * visible in silhouette.
 *
 * Then the arms BUNCH rather than splay: six `box-18` gathered at the front half
 * instead of eight spread around, plus two longer feeding tentacles reaching
 * further — which is the actual anatomical difference between the two animals
 * and happens to be sayable with the same part at two stretches.
 *
 * The fins are `wedge-19` at the top of the mantle, which the octopus has not
 * got at all.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-21`'s own bottom plane, where the arms gather. */
const ARM_Y = 0.18125

/** The arm: the elephant's trunk, hanging, as on the octopus. */
const ARM = {
  part: 'box-18',
  paint: 'arm' as const,
  axis: 'y' as const,
  dir: -1 as const,
  stretch: [0.8, 0.7, 0.8] as const,
  sink: 0.2,
}

export const SQUID_ASSEMBLY = defineCreature('animal-squid', {
  palette: {
    coat: 0xc46b7a,
    belly: 0xf6dcd6,
    arm: 0xab5464,
    fin: 0xd88b96,
    pupil: PACK_PUPIL,  // the pack's own measured pupil; see texture.ts
  },

  hull: 'box-21',
  belly: 0.4375,
  legs: false,
  eyes: { part: 'plate-08', x: 0.2625, y: 1.05 },

  extras: [
    /* Six arms, gathered forward — three mirrored pairs, all in the front half
     * where the octopus's are spread through a full turn. */
    {
      ...ARM, name: 'arm-in', kind: 'pair',
      spin: [{ axis: 'z', deg: 15 }, { axis: 'y', deg: -75 }], at: [0.15, ARM_Y, 0.4375],
    },
    {
      ...ARM, name: 'arm-mid', kind: 'pair',
      spin: [{ axis: 'z', deg: 20 }, { axis: 'y', deg: -50 }], at: [0.3125, ARM_Y, 0.3125],
    },
    {
      ...ARM, name: 'arm-out', kind: 'pair',
      spin: [{ axis: 'z', deg: 25 }, { axis: 'y', deg: -25 }], at: [0.4375, ARM_Y, 0.15],
    },
    /* The two FEEDING TENTACLES — the same shape, longer, which is the one
     * anatomical fact that separates a squid from an octopus. */
    {
      ...ARM, name: 'tentacle', kind: 'pair',
      stretch: [0.7, 0.9, 0.7],
      spin: [{ axis: 'z', deg: 10 }, { axis: 'y', deg: -60 }], at: [0.225, ARM_Y, 0.225],
    },
    /* The mantle fins, at the top rear where a squid carries them. */
    {
      name: 'fin', part: 'wedge-19', paint: 'fin', kind: 'pair',
      spin: [{ axis: 'y', deg: 90 }], sink: 0.3, at: [0.5, 1.4375, -0.3125],
    },
    { name: 'mouth', part: 'plate-03', paint: 'arm', at: [0, 0.6875, 0.635] },
  ],

  flag: 'NEW PALETTE, UNREVIEWED — the first squid ever built and the first colours ever '
    + 'proposed for it. ROSTER §4 IS THE RISK and the twin is animal-octopus, which is '
    + 'also a legless body wearing box-18 as arms. Three things separate them and all '
    + 'three are deliberate: the HULL (box-21, the tallest in the bank, against the '
    + 'octopus\'s cube), the arms BUNCHED forward rather than splayed through a full '
    + 'turn, and two longer FEEDING TENTACLES the octopus has not got. What is still '
    + 'wrong is the MANTLE: a squid\'s is a pointed cone and box-21 is a rounded box, '
    + 'and no hull in this bank comes to a point. RULE 9 STRAINED, DELIBERATELY: eight '
    + 'limbs on the tallest hull in the bank is 1032 triangles against the pack\'s '
    + 'measured 951, and the limb COUNT is the animal — a squid with six arms is not a '
    + 'squid. animal-hedgehog declares the same overrun at 1021 for the same reason, '
    + 'which is that no animal in Kenney\'s twenty-four wears this many protrusions.',
})
