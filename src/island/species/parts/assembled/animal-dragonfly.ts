/**
 * The dragonfly — four wings, no antennae, and an abdomen built in two pieces.
 *
 * **FOUR WINGS, ALL `blade-06`, and that is the bee's own membranous wing worn
 * twice over.** A dragonfly is the one animal in this collection whose forewing
 * and hindwing are the SAME shape, so unlike the butterfly beside it this one
 * takes one record and places it at two z stations. Every wing is sunk 0.625 of
 * its own 0.200 thickness, which is the shallowest a 0.200-thick part can sit
 * and still meet §3's measured 0.125 floor.
 *
 * **THE ABDOMEN IS TWO `box-18` STUBS, THE SECOND HUNG OFF THE FIRST.** The bank
 * has no long rod: its longest rearward reach is `box-23`, the fox's plume, at
 * 0.749, and that is 0.744 across — a brush, not a rod. `box-18` is the
 * elephant's trunk under the bank's own name-for-what-it-is, 0.345 across and
 * 0.623 long, and `PartDef.on` joins a copy to a placed feature's own built
 * outer face. Two of them reach 0.85 behind the hull at 0.345 wide, which is a
 * dragonfly's abdomen and is the first two-link chain in this collection.
 *
 * **NO ANTENNAE, and the absence is the animal.** A dragonfly's antennae are
 * vestigial bristles; the head is eyes. `plate-14`/`plate-15`, the panda's and
 * the biggest cards in the pack, are set wide and high where a dragonfly's
 * compound eyes nearly meet on the crown.
 *
 * **FOUR LEGS, AND IT IS RULE 9 THAT DECIDED IT.** Six put this species at
 * **966 triangles against the pack's measured 951** — four wings at 92 apiece
 * is 368 of the budget before anything else — and rather than declare an
 * overrun on an animal that does not need one, the row went back to the pack's
 * own four. It is also the one insect here where that is honest: a dragonfly
 * cannot walk. Its legs are a basket held forward under the thorax to catch
 * with, and they are the last thing anyone reads on it. The hull is `box-31`,
 * the lion's SHALLOWER shell (1.250 x 1.250 x 1.125), which is the slenderest
 * the pack drew and 10 triangles cheaper than the cube.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-03`'s top face and rear face — its own centre plus/minus its own half. */
const TOP_Y = 1.43125
const REAR_Z = -0.625
/** The hull's own centre height, which is where a trailing abdomen leaves it. */
const HULL_MID_Y = 0.80625

/** §3's 0.125 floor over a 0.200-thick wing. See `animal-butterfly.ts`. */
const WING_SINK = 0.625

export const DRAGONFLY_ASSEMBLY = defineCreature('animal-dragonfly', {
  /* NEW AND UNREVIEWED — the first dragonfly ever built here. Brief §19 is
   * "bright, never scary": a metallic blue-green body with glassy wings. */
  palette: {
    coat: 0x2f8fa8,   // UNREVIEWED: THE ANIMAL — a bright metallic blue-green
    belly: 0xdcefe6,  // UNREVIEWED: the pale underside, and the sclera
    wing: 0xbcd8dd,   // UNREVIEWED: the wings, a pale glassy blue
    limb: 0x1f5f70,   // UNREVIEWED: legs, a shade under the body
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The lion's shallower shell — the slenderest the pack drew, and the eye card
   * still sits at the absolute 0.6350, floating 0.135 proud of a 0.500 front
   * face exactly as the lion's own does. */
  hull: 'box-31',

  belly: 0.4375,

  /* THE BIGGEST CARDS IN THE PACK, set wide and high. A dragonfly's compound
   * eyes take up almost the whole head and nearly meet on top of it, and rule 5
   * makes the size absolute, so "biggest in the pack" is a claim rather than a
   * scale. `animal-firefly.ts` spends the same pair for the same reason. */
  eyes: { part: 'plate-14', x: 0.29, y: 1.05 },

  extras: [
    /* FOREWINGS and HINDWINGS, the same shape at two stations — which is what a
     * dragonfly has and what the butterfly beside it deliberately has not. */
    { name: 'wing-fore', part: 'blade-06', paint: 'wing', kind: 'pair', sink: WING_SINK, at: [0.42, TOP_Y, 0.1875] },
    { name: 'wing-hind', part: 'blade-06', paint: 'wing', kind: 'pair', sink: WING_SINK, at: [0.42, TOP_Y, -0.1875] },
    /* THE ABDOMEN, LINK ONE. `box-18` turned back to front so its `z +1` facing
     * runs rearward, joined flush on the rear face at the hull's own centre
     * height — `animal-badger.ts`'s solved bound, the one height at which its
     * 0.623 root fits inside the 0.625 flat rear face. */
    { name: 'abdomen', part: 'box-18', paint: 'coat', spin: [{ axis: 'y', deg: 180 }], at: [0, HULL_MID_Y, REAR_Z] },
    /* LINK TWO, hung off link one's own built outer face with `on`. The anchor
     * is measured off the placed vertices, so the join is exact rather than a
     * number somebody added up. */
    { name: 'abdomen-tip', part: 'box-18', paint: 'coat', spin: [{ axis: 'y', deg: 180 }], on: 'abdomen' },
  ],

  flag: 'THE ABDOMEN IS TWO LINKS AND IT IS STILL SHORT. A real dragonfly\'s abdomen is '
    + 'three or four times its thorax; this one reaches 0.85 behind a 1.250 hull, because '
    + 'the bank\'s longest rearward reach is `box-23` at 0.749 and that shape is 0.744 '
    + 'across, which is a brush. Two `box-18` in a chain is the narrowest long thing this '
    + 'bank can make and it is honestly not long enough. What would fix it is one shape: a '
    + 'plain tapering ROD, which the pack does not contain — the same gap `animal-stick-'
    + 'insect.ts` is a placeholder for. ALSO: THE WING VENATION, which is what makes a '
    + 'dragonfly wing read as glass, cannot be drawn — `Paint.patch` paints one level '
    + 'boundary and `byBand` cuts only where Kenney cut. ALSO: FOUR LEGS AND NOT SIX, '
    + 'against the rest of this collection — six measured 966 triangles against the pack\'s '
    + '951 and four wings had already spent 368 of it, so the row went back to the pack\'s '
    + 'own four rather than declaring a RULE 9 overrun. A dragonfly cannot walk, so of the '
    + 'sixteen here it is the one where that costs least. ALSO: NEW PALETTE, UNREVIEWED.',
})
